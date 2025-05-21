// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { apiReducer } from "./apiReducer";
import { messagesReducer } from "./messagesReducer";
import { sessionReducer } from "./sessionReducer";

export const rootReducer = ({ api, messages, sessionId, isLoggedIn }, action) => ({
  api: apiReducer(api, action),
  messages: messagesReducer(messages, action),
  sessionId: sessionReducer(sessionId, action),
  isLoggedIn: isLoggedIn,
});
