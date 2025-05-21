# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# ----------------------------------------------------------
#                Common variables
# ----------------------------------------------------------
variable "region" {
  type        = string
  description = "SNS Topic region"
}

variable "account_id" {
  type        = string
  description = "AWS Account Id"
}

# ----------------------------------------------------------
#                   Lambda Variables
# ----------------------------------------------------------
variable "lambda_function_name" {
  type        = string
  description = "Lambda function name to invoke when SNS message is published"
}

# ----------------------------------------------------------
#                   Subsctiption - SNS
# ----------------------------------------------------------
variable "sns_role_principal_name" {
  type        = string
  description = "SNS service principal name"
  default     = "sns.amazonaws.com"
}

variable "sns_topic_arn" {
  type        = string
  description = "SNS Topic ARN to subsbribe SQS to"
  default     = ""
}
