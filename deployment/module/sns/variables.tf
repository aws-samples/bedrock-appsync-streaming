# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# ----------------------------------------------------------
#                   SNS Topic - standard
# ----------------------------------------------------------
variable "topic_name" {
  type        = string
  description = "SNS Topic name"
}

variable "minimum_delay_target" {
  type        = number
  description = "Minimum delay"
  default     = 20
}

variable "maximum_delay_target" {
  type        = number
  description = "Maximum delay"
  default     = 20
}

variable "number_of_retries" {
  type        = number
  description = "Number of retries"
  default     = 3
}

variable "retries_without_delay" {
  type        = number
  description = "Retries without delay"
  default     = 0
}
variable "minimum_delay_retries" {
  type        = number
  description = "Minimum delay retries"
  default     = 0
}

variable "maximum_delay_retries" {
  type        = number
  description = "Maximum delay retries"
  default     = 0
}

variable "back_off_function" {
  type        = string
  description = "Retry-backoff function"
  default     = "linear"
}
variable "throttle_policy_maximum_receive_per_second" {
  type        = number
  description = "Throttle policy - Maximum number of messages to receive per second"
  default     = 1
}

variable "override_subscription_policy" {
  type        = bool
  description = "Override subscription policy"
  default     = false
}

variable "topic_tags" {
  type        = map(string)
  description = "A map containing tags. Both the key and value must be strings."
  default     = {}
}
