# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""sns.py - SNS event handler"""
import os
import boto3
import json
from typing import Dict
from logging import Logger
from common.logging_helper import get_logger
from translations.common import ERR_MSG
from api.appsync import AppSync

# nosec B105 - These are stream token identifiers, not passwords
DEFAULT_STREAM_START_TOKEN = "#START_STREAM#"
DEFAULT_STREAM_END_TOKEN = "#END_STREAM#"
DEFAULT_STREAM_ERROR_TOKEN = "#STREAM_ERROR#"
class SNS:
    """
    SNS event handler class.

    SNS event can contain multiple records each containing the following
    payload in the `Message` attribute:

    {
        "session_id": "123",
        "locale": "en_US",
        "model_id": "model id",
        "prompt": "prompt",
        "context": "context" # optional: "
    }

    """
    # class variables
    event: Dict = None
    locale: str = 'en_US'
    appsync: AppSync = None

    # source url properties
    source_s3_bucket_name: str = None
    source_s3_key: str = None
    source_replacement_url: str = None

    logger: Logger = None

    def __init__(self, event: Dict = None) -> None:
        # configure logger
        self.logger = get_logger(f"{__name__}.{type(self).__name__}")

        # assign class variables
        self.event = event

        # throw error if any of the required fields are missing
        if self.event is None:
            raise Exception("Required fields are missing")

    def process(self) -> str:
        """
        process sns event

        outer SNS event.
        - each record contains 'EventSource' attribute with value "aws:sns",
        - each record contains 'Sns' attribute which is a dictionary containing,
          - 'Type' with a value of 'Notification'
          - 'MessageId' with a unique identifier for the message
          - 'TopicArn' with the ARN of the topic the message was published to
          - 'Subject' with the subject of the message
          - 'Message' attribute which is a JSON string containing the SNS message
          - 'Timestamp' with the time the message was published
          - 'SignatureVersion' with the signature version of the message
          - 'Signature' with the signature of the message
          - 'SigningCertURL' with the URL of the signing certificate
          - 'UnsubscribeURL' with the URL to unsubscribe from the topic
          - 'MessageAttributes' with the message attributes of the message

        This method deserialize the 'Message' attribute and calls streaming endpoint
        to start analyzer user's query.

        When streaming endpoint returns partial response, the method invokes
        AWS AppSync mutation.

        Upon successful completion, method returns a success message.  It
        throws an error if failure occurs at any time during processing.

        Returns:
            str: successful response
        """

        # default error
        rag_response = ERR_MSG['en_US']['default_error']
        error_flag = False

        try:
            for i, record in enumerate(self.event.get('Records', [])):
                parsed_event = json.loads(record.get('Sns', {}).get('Message', '{}'))
                self.logger.debug("SNS Record %d, Parsed event: %s", i+1, json.dumps(parsed_event, indent=2))

                # extract the event from the parsed SNS message
                if parsed_event:
                    session_id = parsed_event.get('session_id', None)
                    locale = parsed_event.get('locale', None)
                    model_id = os.environ.get('LM_MODEL_ID', None)

                    prompt = """\n\nHuman:
                        Answer the question with all your knowledge

                        Assistant:"""


                    # reset class level locale
                    self.locale = locale
                    self.logger.debug("prompt:%s",prompt)
                    # if any of the properties are not set, raise Exception
                    if not session_id or not locale or not model_id or not prompt:
                        error_message = f"Required fields are missing. session_id: {session_id}, locale: {locale}, model_id: {model_id}, prompt: {prompt}"
                        self.logger.error(error_message)
                        raise ValueError(error_message)

                    # reset the error message
                    rag_response = ERR_MSG[locale]['error_response']

                    self.logger.debug("Before llmstream")

                    brt = boto3.client(service_name='bedrock-runtime', region_name="us-west-2")

                    messages = []
                    message = {
                        "role": "user",
                        "content": [{"text": parsed_event["message"]}]
                    }
                    messages.append(message)

                    response = brt.converse_stream(
                        modelId=model_id,
                        messages=messages
                    )

                    stream = response.get('stream')
                    if stream:
                        self.appsync = AppSync(locale=locale, session_id=session_id)
                        self.appsync.invoke_mutation(DEFAULT_STREAM_START_TOKEN)
                        event_count = 0
                        buffer = ""
                        for event in stream:
                            if event:
                                if list(event)[0] == "contentBlockDelta":
                                    event_count += 1
                                    buffer += event["contentBlockDelta"]["delta"]["text"]

                            if event_count > 5:
                                self.appsync.invoke_mutation(buffer)
                                event_count = 0
                                buffer = ""

                        if len(buffer) != 0:
                            self.appsync.invoke_mutation(buffer)

                        self.appsync.invoke_mutation(DEFAULT_STREAM_END_TOKEN)

        except Exception as e:
            self.logger.warning("Exception occurred in agent or rag: %s", e)
            error_flag = True

        if error_flag:
            # when error occurs, instantiate AppSync class and send 'start stream token', error message, and 'end stream token'
            self.appsync = AppSync(locale=locale, session_id=session_id)
            self.appsync.invoke_mutation(DEFAULT_STREAM_START_TOKEN)
            self.appsync.invoke_mutation(rag_response)
            self.appsync.invoke_mutation(DEFAULT_STREAM_ERROR_TOKEN)
            return "Error occurred in agent or rag.  Check logs."

        return "successfully processed SNS event"

