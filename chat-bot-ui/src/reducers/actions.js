// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export const actions = {

  // actions associated with REST API
  API_FETCH_IN_PROGRESS: 'fetch_in_progress',
  API_FETCH_SUCCESS: 'fetch_success',
  API_FETCH_FAILURE: 'fetch_failure',

  // actions associated with GraphQL API
  GRAPHQL_QUERY_IN_PROGRESS: 'graphql_query_in_progress',
  GRAPHQL_QUERY_SUCCESS: 'graphql_query_success',
  GRAPHQL_QUERY_FAILURE: 'graphql_query_failure',
  GRAPHQL_SUBSCRIPTION_START: 'graphql_subscription_start',
  GRAPHQL_SUBSCRIPTION_RECEIVED: 'graphql_subscription_received',
  GRAPHQL_SUBSCRIPTION_END: 'graphql_subscription_end',
  GRAPHQL_SUBSCRIPTION_FAILURE: 'graphql_subscription_failure',

  // actions associated with Websocket Streaming
  WEBSOCKET_SEND_IN_PROGRESS: 'websocket_send_in_progress',
  WEBSOCKET_SEND_SUCCESS: 'websocket_send_success',
  WEBSOCKET_SEND_FAILURE: 'websocket_send_failure',
  WEBSOCKET_RECEIVE_START: 'websocket_RECEIVE_start',
  WEBSOCKET_RECEIVE_MESSAGE: 'websocket_receive_message',
  WEBSOCKET_RECEIVE_END: 'websocket_RECEIVE_end',
  WEBSOCKET_RECEIVE_FAILURE: 'websocket_RECEIVE_failure',

  // actions associated with messages
  MESSAGE_SENT: 'message_sent',
  MESSAGE_RECEIVED: 'message_received',
  MESSAGE_RECEIVED_ERROR: 'message_received_error',

  // actions associated with session
  SET_SESSION_ID: 'set_session_id'
};
