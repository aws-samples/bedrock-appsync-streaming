// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import config from "../config";
import { en_US, fr_CA } from '../translations/common';

const appConfig = config;

// generate a uniqe session id
export function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getChatHistory(messages) {
  // remove welcome elements from messages array
  let newMessages =
  appConfig.DEMO_MODE
      ? messages.slice(en_US["welcome.messages.demo"].length)
      : messages.slice(en_US["welcome.messages"].length);
  if (appConfig.locale === "fr_CA") {
    newMessages =
    appConfig.DEMO_MODE
      ? messages.slice(fr_CA["welcome.messages.demo"].length)
      : messages.slice(fr_CA["welcome.messages"].length);
  }

  // loop through newMessages, convert newMessages.messageReceived attribute and value to 'output': value, and newMessages.messageSent attribute and value to 'input': value
  let newMessagesWithOutput = [];
  newMessages.forEach(message => {
    if (message.messageReceived && !message.error) {
      const messageToAdd = {
        output: message.messageReceived
      };
      newMessagesWithOutput.push(messageToAdd);
    }
    if (message.messageSent && !message.error) {
      const messageToAdd = {
        input: message.messageSent
      };
      newMessagesWithOutput.push(messageToAdd);
    }
  });

  // loop through newMessagesWithOutput backwards, and only keep entries < appConfig.CONVERSATION_HISTORY_WINDOW
  let newMessagesWithOutputBackwards = newMessagesWithOutput.slice(); // make a copy
  newMessagesWithOutputBackwards.reverse();
  let newMessagesWithOutputBackwardsFiltered = newMessagesWithOutputBackwards.filter((message, index) => {
    return index < appConfig.CONVERSATION_HISTORY_WINDOW * 2;
  });

  // reverse the newMessagesWithOutputBackwards again to bring it back to original order
  const newMessagesWithOutputTrimmed = newMessagesWithOutputBackwardsFiltered.reverse();

  return newMessagesWithOutputTrimmed;
}
