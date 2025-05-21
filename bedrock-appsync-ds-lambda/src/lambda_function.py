# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""lambda_handler.py:

    This module contains the lambda entry point function, `lambda_handler`.
    Lambda function is used as an AppSync Data Source.  It handles Query
    operations from AppSync service.  AppSync Mutation operations are ignored.
"""

import json
from typing import Dict, Tuple
from time import time
from common.logging_helper import get_logger
from common.lambda_helper import show_lambda_stats
from api.appsync import AppSync

# Configure logger
logger = get_logger(f"{__name__}")

# Lambda in-memory cache
cached_data = {
    "execution_time": time(),
    "invocation_count": 0
}

def lambda_handler(event, context):
    """lambda handler that processes messages from AppSync service.
    Function is configured as Lambda Data Source in AppSync service.
    It only processes Query GraphQL operations and ignores Mutations.

    The function invokes SNS service and sends a payload to the topic.
    If SNS invocation is successful, the function returns following
    response:

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

    When there is an error during processing, lambda throws an error

    Args:
        event (dict): AppSync event
        context (dict): Lambda context object

    Returns:
        response (dict): Returns AppSync event to indicate processing was successful
    """


    # Lambda stats
    show_lambda_stats(event=event, context=context, cached_data=cached_data)

    # process AppSync event
    field_name = None
    operation_type = None
    operation_input = None
    try:
        field_name, operation_type, operation_input = __process_appsync_event(event)
    except Exception as e:
        error_message = f"Missing or invalid input: {e}"
        return __get_appsync_error(error_message, error_type='Bad GQL request')

    try:
        # process the AppSync event
        appsync = AppSync(
            graphql_operation_type=operation_type,
            graphql_operation_name=field_name,
            graphql_operation_input=operation_input)
        response = appsync.process()
        logger.debug("Response from AppSync: %s", json.dumps(response, indent=2))
        return response
    except Exception as e:
        error_message = f"Error processing AppSync event: {e}"
        logger.error(error_message)
        error_appsync_response = __get_appsync_error(error_message, error_type='Internal Server Error')
        return error_appsync_response

def __process_appsync_event(event: Dict) -> Dict | Tuple:
    field_name = event.get('fieldName', None)
    if field_name is None:
        error_message = 'fieldName is missing in event'
        logger.error(error_message)
        raise Exception(error_message)

    operation_type = event.get('parentTypeName', None)
    if operation_type is None:
        error_message = 'parentTypeName is missing'
        logger.error(error_message)
        raise Exception(error_message)

    # optional
    arguments = event.get('arguments', None)
    if arguments is None:
        error_message = 'arguments is missing in event'
        logger.warning(error_message)

    operation_input = None
    if arguments:
        operation_input = arguments.get('input', None)
        if operation_input is None:
            error_message = 'input is missing in event.arguments'
            logger.error(error_message)
            raise Exception(error_message)

    return field_name, operation_type, operation_input

def __get_appsync_error(error_message: str, error_type: str) -> Dict:
    error_response = {
        'error': error_message,
        'type': error_type
    }
    return error_response
