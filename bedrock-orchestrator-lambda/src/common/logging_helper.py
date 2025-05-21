# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""utils.logging_helper.py - centralized configuration of logger"""
import logging
import os

# Configure logger to write to stdout (console)
default_log_args = {
    "format": "[%(levelname)s] [%(name)s] %(message)s",
    "datefmt": "%d-%b-%y %H:%M",
    "force": True,
}
logging.basicConfig(**default_log_args)

def get_logger(module_name: str):
    """
    Get a logger with the specified module name.
    """
    logger = logging.getLogger(module_name)

    # check if LOG_LEVEL env var is set and call logger.setLevel()
    # to set the logging level
    try:
        env_log_level = os.environ.get("LOG_LEVEL", None)
        if env_log_level is not None and len(env_log_level) > 0:
            env_log_level = env_log_level.upper()
            logger.setLevel(env_log_level)
            logger.debug("Setting log level to %s", env_log_level)
    except:
        logger.warning("LOG_LEVEL is not defined.  Defaulting log level to INFO")
        logger.setLevel(logging.INFO)

    return logger
