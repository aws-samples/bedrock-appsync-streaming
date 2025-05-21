# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

output "sns_lambda_subsription_arn" {
  description = "SNS Lambda subscription ARN"
  value       = aws_sns_topic_subscription.this.arn
}
