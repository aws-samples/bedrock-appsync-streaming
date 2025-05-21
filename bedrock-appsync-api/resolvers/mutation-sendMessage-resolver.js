// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { util } from "@aws-appsync/utils";

/**
 * Publishes an event localy
 * @param {*} ctx the context
 * @returns {import('@aws-appsync/utils').NONERequest} the request
 */
export function request(ctx) {
  return {
    payload: {
      sessionId: ctx.arguments.input.sessionId,
      locale: ctx.arguments.input.locale,
      message: ctx.arguments.input.message
    },
  };
}

/**
 * Forward the payload in the `result` object
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the result
 */
export function response(ctx) {
  // get current timestamp
  const timeStamp = util.time.nowISO8601();
  // add timeStamp to outgoing response
  const result = ctx.result;
  result['timeStamp'] = timeStamp;
  return ctx.result;
}
