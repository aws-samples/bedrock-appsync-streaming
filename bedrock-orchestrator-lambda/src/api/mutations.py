# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

send_message_mutation = """
mutation SendMessageMutation($input: SendMessageInput!) {
  sendMessage(input: $input) {
    locale
    message
    sessionId
    timeStamp
  }
}
"""
