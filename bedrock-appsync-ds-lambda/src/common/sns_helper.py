# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""utils.sns_helper.py - helper functions for sns"""

import json
from typing import Any
from collections.abc import Mapping
from common.logging_helper import get_logger
from common.session_helper import get_boto3_session

# Configure logger
logger = get_logger(f"{__name__}")

def invoke_sns(topic_arn: str = None, payload: Any = None) -> None:
    """
    This method invokes the SNS service to send a payload to topic.
    Payload is a dictionary containing keys of type string and values
    can be any valid dictionary type

    Args:
        payload (dict): dictionary containing key/value pairs to send to sns topic
        topic_arn (str): sns topic arn to send payload to
    """

    # throw error if payload is empty or if topic_arn is empty
    if not payload or not topic_arn:
        raise ValueError("Payload or topic_arn cannot be empty")

    try:
        # configure boto3 session
        boto3_session = get_boto3_session()

        # if payload is a dictionary or array, then serialize the json
        if isinstance(payload, Mapping) or isinstance(payload, list):
            payload = json.dumps(payload)

        # check if payload is a byte array
        if isinstance(payload, bytes):
            payload = payload.decode("utf-8")

        # send the payload to SNS topic
        sns_client = boto3_session.client('sns')
        sns_client.publish(
            TopicArn=topic_arn,
            Message=payload
        )
        logger.debug("SNS publish successful. Topic: %s  Payload Size: %d", topic_arn, len(payload))
        return
    except Exception as e:
        error_message = f"Failed to send payload to SNS Topic: {topic_arn} error: {e}"
        logger.error(error_message)
        raise Exception(error_message) from e
