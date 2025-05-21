# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""utils.session_helper.py - helper functions for managing boto3 session"""
import os
import random
import string
import boto3
from botocore.auth import SigV4Auth
from botocore.config import Config
from common.logging_helper import get_logger
from common.lambda_helper import is_lambda_runtime

# Configure logger
logger = get_logger(f"{__name__}")

def get_boto3_session() -> boto3.session:
    """create a boto3 session"""

    # default session
    boto3_session: boto3.session = boto3.Session()

    # only use profile from AWS credentials file when running on local machine(macOS)
    # and show a warning if AWS_PROFILE is not set
    if not is_lambda_runtime():
        profile_name = "default"
        env_profile_name = os.environ.get("AWS_PROFILE", None)
        if env_profile_name is not None and len(env_profile_name) > 0:
            profile_name = env_profile_name
        else:
            logger.debug("AWS_PROFILE environment variable is not set.  %s is used", profile_name)

        boto3_session = boto3.Session(
            profile_name=profile_name,
            region_name=get_aws_region_name())

    return boto3_session

def get_aws_region_name() -> str:
    """get aws region

    Returns:
        str: aws region name, e.g. us-east-1
    """
    # define some defaults
    region_name: str = 'us-east-1'
    env_region_name = os.environ.get("AWS_REGION", None)
    if env_region_name is not None and len(env_region_name) > 0:
        region_name = env_region_name
    else:
        logger.warning("AWS_REGION environment variable is not set.  %s is used", region_name)

    return region_name

def get_sig_v4_signature(service_name: str = None) -> SigV4Auth:
    """get sigv4 signature

    Returns:
        str: sigv4 signature
    """
    # raise exception if service_name is not set
    if not service_name:
        logger.error('service_name must be set')

    boto3_session = get_boto3_session()

    credentials = boto3_session.get_credentials()
    # credentials = boto3_session.get_credentials().get_frozen_credentials()
    sigv4 = SigV4Auth(
        credentials=credentials,
        service_name=service_name,
        region_name=get_aws_region_name()
    )
    return sigv4
