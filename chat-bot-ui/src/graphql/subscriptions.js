// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export const sendMessageSubscription =
`
subscription onSendMessage ($sessionId:String!){
  onSendMessage(sessionId: $sessionId) {
    locale
    message
    sessionId
    timeStamp
  }
}
`;
