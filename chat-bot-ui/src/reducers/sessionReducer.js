// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { actions } from './actions';
// messagesReducer function takes in sessionId (original state) and action (changed state)
// and returns the new state
export function sessionReducer(sessionId, action) {
  switch (action.type) {
    case actions.SET_SESSION_ID:
      return action.payload;

    default:
      return sessionId;
  }
}
