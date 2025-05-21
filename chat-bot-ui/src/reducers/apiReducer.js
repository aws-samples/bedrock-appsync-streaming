// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { actions } from './actions';
// apiReducer function takes in api (original state) and action (changed state)
// and returns the new state
export function apiReducer(api, action) {
  switch (action.type) {

    case actions.API_FETCH_IN_PROGRESS:
      return {
        statusCode: api.statusCode,
        message: api.message,
        inProgress: true
      };

    case actions.API_FETCH_SUCCESS:
      return {
        statusCode: action.statusCode,
        message: action.message,
        inProgress: false
      };

    case actions.API_FETCH_FAILURE:
      return {
        statusCode: action.statusCode,
        message: action.message,
        inProgress: false
      };

    case actions.GRAPHQL_QUERY_IN_PROGRESS:
      return {
        statusCode: 101,
        message: "query in progress",
        inProgress: true
      };

    case actions.GRAPHQL_QUERY_SUCCESS:
      return {
        statusCode: 200,
        message: "query success",
        inProgress: false
      };

    case actions.GRAPHQL_QUERY_FAILURE:
      return {
        statusCode: 500,
        message: "query failed",
        inProgress: false
      };

    case actions.GRAPHQL_SUBSCRIPTION_START:
      return {
        statusCode: 101,
        message: "subscription started",
        inProgress: true
      };

    case actions.GRAPHQL_SUBSCRIPTION_END:
      return {
        statusCode: 200,
        message: "subscription ended",
        inProgress: false
      };

    case actions.GRAPHQL_SUBSCRIPTION_FAILURE:
      return {
        statusCode: 500,
        message: "subscription failed",
        inProgress: false
      };

    case actions.WEBSOCKET_SEND_IN_PROGRESS:
      return {
        statusCode: 101,
        message: "query in progress",
        inProgress: true
      };

    case actions.WEBSOCKET_SEND_SUCCESS:
      return {
        statusCode: 200,
        message: "query success",
        inProgress: false
      };

    case actions.WEBSOCKET_SEND_FAILURE:
      return {
        statusCode: 500,
        message: "query failed",
        inProgress: false
      };

    case actions.WEBSOCKET_RECEIVE_START:
      return {
        statusCode: 101,
        message: "subscription started",
        inProgress: true
      };

    case actions.WEBSOCKET_RECEIVE_END:
      return {
        statusCode: 200,
        message: "subscription ended",
        inProgress: false
      };

    case actions.WEBSOCKET_RECEIVE_FAILURE:
      return {
        statusCode: 500,
        message: "subscription failed",
        inProgress: false
      };

    default:
      return api;
  }
}
