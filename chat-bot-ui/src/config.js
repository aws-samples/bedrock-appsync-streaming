// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/* eslint-disable no-undef */
const config = {
  LOCALE: __LOCALE__,
  AWS_REGION: __AWS_REGION__,
  API_ENDPOINT: __API_ENDPOINT__,
  API_KEY: __API_KEY__,
  GRAPHQL_ENDPOINT: __GRAPHQL_ENDPOINT__,
  GRAPHQL_API_KEY: __GRAPHQL_API_KEY__,
  CHAT_BOT_NAME: __CHAT_BOT_NAME__,
  CONVERSATION_HISTORY_ENABLED: String(__CONVERSATION_HISTORY_ENABLED__).toLowerCase() === 'true' ? true : false,
  CONVERSATION_HISTORY_WINDOW: !isNaN(Number(__CONVERSATION_HISTORY_WINDOW__)) ? Number(__CONVERSATION_HISTORY_WINDOW__) : 5,
  DEMO_MODE: String(__DEMO_MODE__).toLowerCase() === 'true' ? true : false,
  APPSYNC_ENABLED: String(__APPSYNC_ENABLED__).toLowerCase() === 'true' ? true : false,
  WEBSOCKET_ENABLED: String(__WEBSOCKET_ENABLED__).toLowerCase() === 'true' ? true : false,
  WEBSOCKET_ENDPOINT: __WEBSOCKET_ENDPOINT__,
  AGENT_ENABLED: String(__AGENT_ENABLED__).toLowerCase() === 'true' ? true : false,
  mock: String(__MOCK_ENABLED__).toLowerCase() === 'true' ? true : false,
  // any additional config goes here
  USER_INPUT_MAX_LENGTH: 256
};

export default config;
