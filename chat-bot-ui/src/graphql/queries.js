// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export const getLlmResponseQuery =
`
query getLlmResponse($locale: String!, $message: String!, $sessionId: String!) {
  getLlmResponse(input: {locale: $locale, message: $message, sessionId: $sessionId}) {
    messages {
      content
      contentType
    }
    locale
    sessionId
  }
}
`;
