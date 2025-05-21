# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""history.py - This module contains a class that contains functions to work with conversation history"""
import os
from logging import Logger
from typing import List
from common.logging_helper import get_logger

class ConversationHistory:
    """
    This class contains functions related to conversation history.
    Client provided history is passed into the constructor.  When
    scrub_history method is invoked, it returns a cleaned copy of
    user's conversation history.

    Class also checks LM_CONVERSATION_HISTORY and LM_CONVERSATION_HISTORY_WINDOW.
    - scrub_history method returns empty history if LM_CONVERSATION_HISTORY is false
    = scrub_history method returns history with only the last LM_CONVERSATION_HISTORY_WINDOW

    """
    conversation_history: bool = True     # conversation history is disabled by default
    conversation_history_window: int = 1  # default conversation history window

    logger: Logger = None

    def __init__(self, conversation_history: bool = None, conversation_history_window: int = None):
        # configure logger
        self.logger = get_logger(f"{__name__}.{type(self).__name__}")

        # override conversation_history flag from from environment variable LM_CONVERSATION_HISTORY if set
        # constructor provided value takes precedence over environment variable
        if conversation_history:
            self.conversation_history = conversation_history
        else:
            history = os.environ.get('LM_CONVERSATION_HISTORY', False)
            if history and len(history) > 0:
                self.conversation_history = history.lower() == "true" or history.lower() == "enable"
            else:
                self.logger.warning(f'LM_CONVERSATION_HISTORY environment variable is not set.  {self.conversation_history} is used')

        # override the conversation_history_window from environment variable LM_CONVERSATION_HISTORY_WINDOW if set
        # constructor provided value takes precedence over environment variable
        if conversation_history_window:
            self.conversation_history_window = conversation_history_window
        else:
            history_window = os.environ.get('LM_CONVERSATION_HISTORY_WINDOW', None)
            if history_window and len(history_window) > 0:
                self.conversation_history_window = int(history_window)
            else:
                self.logger.warning(f'LM_CONVERSATION_HISTORY_WINDOW environment variable is not set.  {self.conversation_history_window} is used')


    def scrub_history(self, history: List) -> str:
        """Massages the history sent from client filtering out any empty or invalid entries"""

        # if conversation_history flag is False, i.e. conversation history is disabled, return None
        if not self.conversation_history:
            return None

        if history is None:
            return None

        try:
            if len(history) <= 0:
                return None

            # remove all empty key elements from array
            new_history = []
            for item in history:
                # iterate over item keys and remove items that have empty keys
                for key in item:
                    if key and key != "" and item[key] != "":
                        new_history.append(item)

            if len(new_history) <= 0:
                return None

            # iterate over history in reverse order and only keep self.conversation_history_window * 2 elements
            new_history = new_history[::-1]
            new_history = new_history[0:self.conversation_history_window * 2]
            new_history = new_history[::-1]

            self.logger.debug('Filtered conversation history: %s', new_history)

            return new_history
        except Exception as e:
            self.logger.warning('Unable to scrub history: %s', e)
            return None
