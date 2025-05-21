// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { API, graphqlOperation } from 'aws-amplify';
import { getChatHistory } from './chatUtils';
import { sendMessageSubscription } from '../graphql/subscriptions';
import { getLlmResponseQuery } from '../graphql/queries';
import { actions } from '../reducers/actions';
import { en_US, fr_CA } from '../translations/common';
import config from "../config";

const appConfig = config;

let chatbotErrorMessage = en_US['chatbot.error.message'];
if (appConfig.LOCALE === "fr_CA") {
  chatbotErrorMessage = fr_CA['chatbot.error.message'];
}

function unsubscribeFromSendMessage(sub) {
  sub.unsubscribe();
  console.log("unsubscribed from sendMessageSubscription");
}
export function subscribeToSendMessage(sessionId, dispatch) {
  // Subscribe to creation of Todo
  const sub = API.graphql(
    graphqlOperation(sendMessageSubscription, {sessionId: sessionId})
  ).subscribe({
    start: () => {
      console.log("subscribed to sendMessageSubscription");
    },
    next: ({ _, value }) => {
      const tokens = value.data.onSendMessage.message;
      if (tokens === "#START_STREAM#") {
        // dispatch success to stop the three-dot animation first
        // we explicity dispatch GRAPHQL_QUERY_SUCCESS because we
        // receive #START_STREAM# only after a successful graphql query
        dispatch({
          type: actions.GRAPHQL_QUERY_SUCCESS
        });
        // dispatch 'subscription start' action to insert a blinking cursor
        // and disable user input
        dispatch({
          type: actions.GRAPHQL_SUBSCRIPTION_START
        });
      } else if (tokens === "#END_STREAM#") {
        unsubscribeFromSendMessage(sub);
        // dispatch 'subscription end' action to disable blinking cursor
        // and enable user input
        dispatch({
          type: actions.GRAPHQL_SUBSCRIPTION_END
        });
        return null;
      } else if (tokens == "#STREAM_ERROR#") {
        // dispatch 'subscription failure' action to disable blinking cursor
        // and enable user input
        dispatch({
          type: actions.GRAPHQL_SUBSCRIPTION_FAILURE
        });
        // show an error message to user
        dispatch({
          type: actions.MESSAGE_RECEIVED_ERROR,
          payload: chatbotErrorMessage
        });
        unsubscribeFromSendMessage(sub);
        return null;
      }
      else {
        // dispatch GRAPHQL_SUBSCRIPTION_RECEIVED to render chunks in ui
        dispatch({
          type: actions.GRAPHQL_SUBSCRIPTION_RECEIVED,
          payload: tokens
        });
      }
    },
    error: (error) => {
      console.error('error occurred while subscribing to sendMessageSubscription:', error);
      // dispatch error to stop the three-dot animation first
      dispatch({
        type: actions.GRAPHQL_QUERY_FAILURE
      });
      // dispatch 'subscription failure' action to disable blinking cursor
      // and enable user input
      dispatch({
        type: actions.GRAPHQL_SUBSCRIPTION_FAILURE
      });
      // show an error message to user
      dispatch({
        type: actions.MESSAGE_RECEIVED_ERROR,
        payload: chatbotErrorMessage
      });
      unsubscribeFromSendMessage(sub);
      return null;
    },
    complete: (e) => {
      console.log("completed subscribing to sendMessageSubscription", e);
    },
  });

  return sub;
}

export function queryGetLlmResponse(locale, sessionId, message, conversation_history, dispatch) {
  return new Promise((resolve, _) => {
    API.graphql(
      graphqlOperation(getLlmResponseQuery, {
        locale: locale,
        sessionId: sessionId,
        message: message,
        history: appConfig.CONVERSATION_HISTORY_ENABLED ? getChatHistory(conversation_history) : []
      })
    )
    .then(result => resolve(result))
    .catch(error => {
      let errorPath = null;
      let errorType = null;
      let errorMessage = null;
      // error must contain errors[0] and 'path', 'errorType' and 'message' attributes
      if (error.errors && error.errors.length > 0 && error.errors[0].path && error.errors[0].errorType && error.errors[0].message) {
        errorPath = error.errors[0].path;
        errorType = error.errors[0].errorType;
        errorMessage = error.errors[0].message;
      }
      if (errorPath && errorType && errorMessage) {
        console.error(`error occurred during query queryGetLlmResponse: path: '${errorPath}' type: '${errorType}' error message:\n${errorMessage}`,);
      } else {
        console.error('error occurred during query queryGetLlmResponse:', error);
      }
      // dispatch error to stop the three-dot animation first
      dispatch({
        type: actions.GRAPHQL_QUERY_FAILURE
      });
      // show an error message to user
      dispatch({
        type: actions.MESSAGE_RECEIVED_ERROR,
        payload: chatbotErrorMessage
      });
      resolve(error);
    });
  });
}


