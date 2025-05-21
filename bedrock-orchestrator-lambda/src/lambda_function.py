# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""lambda_handler.py:

    This module contains the lambda entry point function, `lambda_handler`.
    Lambda function is configured as a subscription to SNS topic.  It processes
    SNS records and uses Boto3 SDK to interact with Amazon Bedrock services.

    Refer to playground-appsync-ds-lambda that calls SNS service and publishes
    payload with user's queries.  playground-appsync-ds-lambda function executes
    as a result of AWS AppSync Query operation triggered by the front-end.

"""

from time import time
from common.logging_helper import get_logger
from common.lambda_helper import show_lambda_stats
from sns.sns_helper import SNS

# Configure logger
logger = get_logger(f"{__name__}")

# Lambda in-memory cache
cached_data = {
    "execution_time": time(),
    "invocation_count": 0,
}

def lambda_handler(event, context):
    """lambda handler that processes messages from SNS service.  SNS
    event can contain multiple records each containing the following
    payload in the `Message` attribute:

    {
        "session_id": "123", // unique session id sent by client
        "locale": "en_US", "en_US", // or fr_CA
        "model_type": "model type",
        "model_name": "model name",
        "vendor_name": "vendor name",
        "prompt": "prompt",
        "context": "context" # optional value
    }

    It uses Boto3 SDK streaming endpoint to interact with the FM.

    Upon successful invocation, it calls AWS AppSync mutation to send
    data back to the client.  The client must use AWS AppSync subscription
    with the "sessionId" to receive data when a mutation occurs.

    When there is an error during processing, lambda throws an error

    Args:
        event (dict): SNS event
        context (dict): Lambda context object

    Returns:
        response (dict): Returns a success message

    Throws:
        Throws an exception if there is an error during processing.
        The exception message is logged in the CloudWatch logs.
    """


    # Lambda stats
    show_lambda_stats(event=event, context=context, cached_data=cached_data)

    try:
        sns = SNS(event)
        response = sns.process()
        return response
    except Exception as e:
        error_message = "Failed to process SNS message: " + str(e)
        logger.error(error_message)
        raise Exception(error_message) from e
