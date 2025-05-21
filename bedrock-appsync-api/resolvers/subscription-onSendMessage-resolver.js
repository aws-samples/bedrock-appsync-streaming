// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { util, extensions } from "@aws-appsync/utils";

/**
 * Sends an empty payload as the subscription is established
 * @param {*} ctx the context
 * @returns {import('@aws-appsync/utils').NONERequest} the request
 */
export function request(ctx) {
  //noop
  return { payload: {} };
}

/**
 * Creates an enhanced subscription
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the result
 */
export function response(ctx) {
  const inputSessionId = ctx.args.sessionId;
  const filter = util.transform.toSubscriptionFilter({sessionId : {eq: inputSessionId}})
  // console.log(filter);
  extensions.setSubscriptionFilter(filter);
  return null;
}
