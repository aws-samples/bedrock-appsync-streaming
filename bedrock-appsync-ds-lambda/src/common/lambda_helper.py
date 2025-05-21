# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""utils.lambda helper.py - helper functions for lambda functions"""
import os
import json
import uuid
from sys import platform
from time import time
from typing import Any, Dict
from logging import Logger
from collections.abc import Mapping
from common.logging_helper import get_logger

# Configure logger
logger = get_logger(f"{__name__}")

def get_lambda_context(context: Any) -> Dict:
    """
    Refer to https://docs.aws.amazon.com/lambda/latest/dg/python-context.html
    """
    context_dict = {
        'invoked_function_arn': context.invoked_function_arn,
        'log_stream_name': context.log_stream_name,
        'log_group_name': context.log_group_name,
        'aws_request_id': context.aws_request_id,
        'memory_limit_in_mb': context.memory_limit_in_mb,
        'remaining_time_in_millis': context.get_remaining_time_in_millis()
    }
    return context_dict

def get_uuid() -> str:
    """get a unique id"""
    return str(uuid.uuid4())

def is_lambda_runtime() -> bool:
    """check if lambda is running in lambda runtime"""
    return 'AWS_EXECUTION_ENV' in os.environ

def show_lambda_stats(event: Any, context: Any, cached_data: Dict[str, Any], lambda_logger: Logger = None) -> None:
    """show stats for lambda function"""

    # set logger
    this_logger = logger
    if lambda_logger:
        this_logger = lambda_logger

    # check if event is a dictionary or array
    if isinstance(event, Mapping) or isinstance(event, list):
        this_logger.debug("Received event: %s", json.dumps(event, indent=2))
    else:
        this_logger.debug("Received event: %s", event)

    # dump Lambda runtime OS
    this_logger.debug("Lambda runtime operating system: %s", platform)

    # if we are running inside Lambda service, then show the context
    if is_lambda_runtime():
        this_logger.debug("Received context: %s", json.dumps(get_lambda_context(context), indent=2))

    # if cached_data is not empty and contains invocation_count attribute,
    # then increment  the count and show the count
    if cached_data and "invocation_count" in cached_data:
        # in python, parameters are passed by reference, so we can mutate the value
        # with side effect
        cached_data["invocation_count"] = cached_data["invocation_count"] + 1
        this_logger.debug("Lambda invocation count: %d", cached_data["invocation_count"])

    # if cached_data is not empty and contains execution_time attribute,
    # then show the execution time
    if cached_data and "execution_time" in cached_data:
        invocation_time = time()
        this_logger.debug("Seconds elapsed since Lambda cold-start: %d", round(invocation_time - cached_data["execution_time"], 1))
