// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { getChatHistory } from './chatUtils';
import { actions } from '../reducers/actions';
import { en_US, fr_CA } from '../translations/common';
import config from "../config";

const appConfig = config;

export function buildMessagePayload(locale, sessionId, message, conversation_history) {
  // construct payload without conversation history
  let payload =
    "{"+
      "\"locale\": \"" + locale + "\"," +
      "\"session_id\": \"" + sessionId + "\","+
      "\"message\": \"" + message + "\""+
    "}";
    // if conversation history exists, add it to the payload
    if (conversation_history) {
      payload =
        "{"+
          "\"locale\": \"" + locale + "\"," +
          "\"session_id\": \"" + sessionId + "\","+
          "\"message\": \"" + message + "\","+
          "\"history\": "+ appConfig.CONVERSATION_HISTORY_ENABLED ? JSON.stringify(getChatHistory(conversation_history)) : "[]" +
        "}";
    }
  console.log("payload: " + payload);
  return payload;
}

export function webSocketResponse(locale, sessionId, message, conversation_history, dispatch) {
  const ws_sub = new WebSocket(config.WEBSOCKET_ENDPOINT);

  let chatbotErrorMessage = en_US['chatbot.error.message'];
  if (appConfig.LOCALE === "fr_CA") {
    chatbotErrorMessage = fr_CA['chatbot.error.message'];
  }

  ws_sub.onopen = function () {
    console.log("Opening a connection...");
    ws_sub.send(buildMessagePayload(locale, sessionId, message, conversation_history));

    dispatch({
      type: actions.WEBSOCKET_SEND_IN_PROGRESS
    });
  };

  const result = ws_sub.onmessage = (event) => {
    const parsed_event = JSON.parse(event.data);
    const tokens = parsed_event.onSendMessage.message;
    if (tokens === "#START_STREAM#") {
      // dispatch success to stop the three-dot animation first
      // we explicity dispatch WEBSOCKET_SEND_SUCCESS because we
      // receive #START_STREAM# only after a successful graphql query
      dispatch({
        type: actions.WEBSOCKET_SEND_SUCCESS
      });
      // dispatch 'subscription start' action to insert a blinking cursor
      // and disable user input
      dispatch({
        type: actions.WEBSOCKET_RECEIVE_START
      });
    } else if (tokens === "#END_STREAM#") {
      ws_sub.close();
      // dispatch 'subscription end' action to disable blinking cursor
      // and enable user input
      dispatch({
        type: actions.WEBSOCKET_RECEIVE_END
      });
      return null;
    } else if (tokens == "#STREAM_ERROR#") {
      // dispatch error to stop the three-dot animation first
      dispatch({
        type: actions.WEBSOCKET_SEND_FAILURE
      });
      // dispatch 'subscription failure' action to disable blinking cursor
      // and enable user input
      dispatch({
        type: actions.WEBSOCKET_RECEIVE_FAILURE
      });
      // show an error message to user
      dispatch({
        type: actions.MESSAGE_RECEIVED_ERROR,
        payload: chatbotErrorMessage
      });
      ws_sub.close();
      return null;
    }
    else {
      // dispatch WEBSOCKET_RECEIVE_MESSAGE to render chunks in ui
      dispatch({
        type: actions.WEBSOCKET_RECEIVE_MESSAGE,
        payload: tokens
      });
    }

    return event.data;
  };

  ws_sub.onerror = function (error) {
    console.log("Subscription error on the following URL: " + error.currentTarget.url);

    // dispatch 'subscription failure' action to disable blinking cursor
    dispatch({
      type: actions.WEBSOCKET_RECEIVE_FAILURE
    });
    // show an error message to user
    dispatch({
      type: actions.MESSAGE_RECEIVED_ERROR,
      payload: chatbotErrorMessage
    });
    return null;
  };

  ws_sub.onclose = function () {
    console.log("Closing the connection...");
  };

  dispatch({
    type: actions.WEBSOCKET_SEND_SUCCESS
  });

  return result;
}
