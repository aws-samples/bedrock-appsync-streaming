# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# ----------------------------------------------------------
#                  Deployment Bucket
# ----------------------------------------------------------
variable "s3_lambda_source_code_bucket_name" {
  type        = string
  description = "Deployment Bucket where Terraform will store the built Lambda code"
}

variable "s3_lambda_source_code_bucket_key" {
  type        = string
  description = "Deployment Bucket key (or folder) to store the built Lambda code"
  default     = ""
}

variable "s3_use_bucket_kms_key" {
  type        = bool
  description = "Enable or disable use of default KMS key for S3 resources"
  default     = false
}

# ----------------------------------------------------------
#                    VPC Configuration
# ----------------------------------------------------------

variable "subnet_id_list_for_lambda" {
  type        = list(string)
  description = "Sets the subnets in which the lambda will be launched."
  default     = []
}

variable "sg_id_list_for_lambda" {
  type        = list(string)
  description = "Security group for the lambda function."
  default     = []
}

variable "xray_mode" {
  type        = string
  description = "Can be either PassThrough or Active"
  default     = "Active"

  validation {
    condition     = (var.xray_mode == "Active") || (var.xray_mode == "PassThrough")
    error_message = "xray_mode variable can be either PassThrough or Active."
  }
}
# ----------------------------------------------------------
#                  Lambda Variables
# ----------------------------------------------------------
variable "function_version" {
  type        = string
  description = "Version is used in zip archive name stored in S3 bucket for deployment."
}
variable "function_name" {
  type        = string
  description = "Name of the lambda function that will appear in the console."
}
variable "function_description" {
  type        = string
  description = "Description of the lambda function that apears in the console."
}
variable "lambda_source_code_path" {
  type        = string
  description = "Path to the lambda source code base directory."
}
variable "role_arn" {
  type        = string
  description = "ARN of the IAM role created by the module."
}

variable "handler" {
  type        = string
  description = "Name of the lambda handler file."
}

variable "runtime" {
  type        = string
  description = "Python runtime version."
}

variable "architecture" {
  type        = string
  description = "Lambda function architecture."
}

variable "mem_size" {
  type        = number
  description = "Memory size of the lambda function."
}

variable "timeout" {
  type        = number
  description = "Lambda function timeout."
}
variable "layers_arn" {
  type        = list(string)
  description = "List of the lambda layer ARN"
  default     = []

  validation {
    condition     = length(var.layers_arn) <= 5
    error_message = "The lambda_layers_arn cannot have more than 5 elements. (AWS restriction)"
  }
}

variable "publish_version" {
  type        = bool
  description = "Boolean that indicates if a version should be publish (true) or the lambda should be overwrite (false) when updating the lambda code."
  default     = false
}

variable "aliases" {
  type = list(object({
    name        = string
    description = string
    version     = string
  }))
  default  = []
  nullable = false
}

variable "provisionned_concurrency_settings" {
  type = list(object({
    aliase_name                       = string
    provisioned_concurrent_executions = number
  }))
  default  = []
  nullable = false
}

variable "environment_variable_key_arn" {
  type        = string
  description = "Encrypt environment variable at rest with KMS. The value should be the alias of the key. Example: alias/aws/lambda"
  default     = ""
}

# ----------------------------------------------------------
#                         Tags
# ----------------------------------------------------------
variable "tags" {
  type        = map(string)
  description = "A map containing tags. Both the key and value must be strings."
  default     = {}
}

# ----------------------------------------------------------
#                Environment Variables
# ----------------------------------------------------------

variable "environment_variables" {
  type        = map(string)
  description = "A map containing environment variables.  Both the key and value must be strings."
  default     = {}
}
