# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# ----------------------------------------------------------
#                   SNS Topic - standard
# ----------------------------------------------------------
resource "aws_sns_topic" "this" {
  name            = var.topic_name
  delivery_policy = <<EOD
{
  "http": {
    "defaultHealthyRetryPolicy": {
      "minDelayTarget": ${var.minimum_delay_target},
      "maxDelayTarget": ${var.maximum_delay_target},
      "numRetries": ${var.number_of_retries},
      "numNoDelayRetries": ${var.retries_without_delay},
      "numMinDelayRetries": ${var.minimum_delay_retries},
      "numMaxDelayRetries": ${var.maximum_delay_retries},
      "backoffFunction": "${var.back_off_function}"
    },
    "disableSubscriptionOverrides": ${var.override_subscription_policy},
    "defaultRequestPolicy": {
      "headerContentType": "text/plain; charset=UTF-8"
    },
    "defaultThrottlePolicy": {
      "maxReceivesPerSecond": ${var.throttle_policy_maximum_receive_per_second}
    }
  }
}
EOD
  tags            = var.topic_tags
  kms_master_key_id = "alias/aws/sns"
}
