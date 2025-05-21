# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""appsync.py:

    This module handles all AppSync operations.
"""
import os
import re
from typing import Dict
from logging import Logger
from common.logging_helper import get_logger
from common.sns_helper import invoke_sns
from history import ConversationHistory

class AppSync:
    """
    AppSync class handles Query operation from AppSync service.
    It invokes SNS service to send a payload to topic.  This starts
    the RAG with response streaming option.
    """
    # class constants
    DEFAULT_ALLOWED_GRAPHQL_OPERATION_TYPE = "Query"
    DEFAULT_ALLOWED_GRAPHQL_OPERATION_NAMES = "getLlmResponse" # can be list of names separated by comma or white space

    # class variables
    sns_topic_arn: str = None
    graphql_operation_input: Dict = None
    conversation_history: ConversationHistory = None
    logger: Logger = None

    def __init__(self,
        graphql_operation_type: str = None,
        graphql_operation_name: str = None,
        graphql_operation_input: Dict = None) -> None:
        """
        Args:
            graphql_operation_type (str): GraphQL operation type
            graphql_operation_name (str): GraphQL operation name
            graphql_operation_input (Dict): GraphQL operation input
        """
        # configure logger
        self.logger = get_logger(f"{__name__}.{type(self).__name__}")

        self.graphql_operation_input = graphql_operation_input

        # instantiate conversation history
        self.conversation_history = ConversationHistory()

        # execute some pre-flight checks
        self.sns_topic_arn = os.environ.get("APPSYNC_TOPIC_ARN", None)
        if not self.sns_topic_arn:
            error_message = "APPSYNC_TOPIC_ARN environment variable must be set"
            self.logger.error(error_message)
            raise Exception(error_message)

        # check if graphql_operation_type is supported, only Query operations are supported
        if graphql_operation_type != self.DEFAULT_ALLOWED_GRAPHQL_OPERATION_TYPE:
            error_message = f"Unsupported GraphQL operation type: {graphql_operation_type}"
            self.logger.error(error_message)
            raise Exception(error_message)

        # check if graphql_operation_name is supported
        allowed_graphql_operation_names = os.environ.get("ALLOWED_GRAPHQL_OPERATION_NAMES", self.DEFAULT_ALLOWED_GRAPHQL_OPERATION_NAMES)

        is_operation_allowed = re.search(graphql_operation_name, allowed_graphql_operation_names)
        if is_operation_allowed is None:
            error_message = f"Unsupported GraphQL operation name: {graphql_operation_name}"
            self.logger.error(error_message)
            raise Exception(error_message)

    def process(self) -> Dict:
        """
        This method processes the AppSync GraphQL operation set in the constructor.
        In invokes SNS service by sending a payload to topic.  Payload is as follows:
        {
            "locale": "en_US",
            "sessionId": "123",
            "message": "Hello",
            "history": [
                {
                    "input": "Message from Human",
                    "output: "Response from Assistant"
                }
            ]
        }

        After successfully invoking SNS service, method returns a object containing
        success message as follows:
        {
            "sessionId": "123",
            "locale" "en_US",
            "messages": [
                {
                    "content": "success",
                    "contentType": "PlainText" # "PlainText" or "SSML"
                }
            ]
        }

        If there was an error calling SNS service, the method raises an error.

        Returns:
            result (dict): LLM response
        """
        # extract required properties from graphql_operation_input
        session_id = self.graphql_operation_input.get('sessionId', None)
        locale = self.graphql_operation_input.get('locale', None)
        message = self.graphql_operation_input.get('message', None)
        history = self.graphql_operation_input.get('history', None)

        # if any of the properties are not set, raise Exception
        if not session_id or not locale or not message:
            raise Exception("sessionId, locale and message must be set")

        try:
            # TODO - **IMPORTANT** The size of SNS payload cannot exceed 256KB
            # TODO - **IMPORTANT** Analyze history to make sure it does not breach 256KB limit
            # conversation_history contains a log of conversation between user and ai.
            # front-end passes this when api is invoked (refer to lambda function for details)
            # scrub_history method cleans the history to remove empty keys.
            scrubbed_history = self.conversation_history.scrub_history(history)

            # prepare payload
            payload = {
                "locale": locale,
                "session_id": session_id,
                "message": message,
                "history": scrubbed_history if scrubbed_history else []
            }

            # grab the topic arn
            sns_topic_arn = os.environ.get("APPSYNC_TOPIC_ARN")

            # call SNS service to send payload to topic
            # the invocation returns immediately to trigger back-end flow
            invoke_sns(topic_arn=sns_topic_arn, payload=payload)

            # return success message indicating sns invocation succeeded
            result = {
                "sessionId": session_id,
                "locale": locale,
                "messages": [
                    {
                        "content": "success",
                        "contentType": "PlainText"
                    }
                ]
            }
            return result
        except Exception as e:
            self.logger.error("process() error: %s", e)
            raise Exception(e) from e
