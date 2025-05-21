# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

output "topic_arn" {
  description = "SNS Topic ARN"
  value       = aws_sns_topic.this.arn
}
