# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# ----------------------------------------------------------
#                     GraphQL API
# ----------------------------------------------------------
variable "api_name" {
  type        = string
  description = "AWS AppSync GraphQL API name"
}

variable "schema_file" {
  type        = string
  description = "AWS AppSync GraphQL API schema file location"
  default     = ""
}

variable "api_is_private" {
  type        = bool
  description = "AWS AppSync GraphQL API is PRIVATE"
  default     = false
}

variable "xray_is_enabled" {
  type        = bool
  description = "X-RAY traces for AWS AppSync GraphQL API"
  default     = false
}

variable "additional_authentication_provider" {
  description = "One or more additional authentication providers."
  type        = any
  default     = {}
}

variable "logging_is_enabled" {
  description = "Whether to enable Cloudwatch logging on GraphQL API"
  type        = bool
  default     = false
}

variable "log_field_log_level" {
  description = "Field logging level. Valid values: ALL, ERROR, NONE."
  type        = string
  default     = null
}

variable "log_exclude_verbose_content" {
  description = "Set to TRUE to exclude sections that contain information such as headers, context, and evaluated mapping templates, regardless of logging level."
  type        = bool
  default     = false
}

variable "logging_role_arn" {
  type        = string
  description = "Service role arn that AWS AppSync will assume to publish to Amazon CloudWatch logs in your account"
}

variable "api_tags" {
  type        = map(string)
  description = "A map containing tags. Both the key and value must be strings."
  default     = {}
}

# ----------------------------------------------------------
#                   GraphQL API key
# ----------------------------------------------------------
variable "api_key_expiry_date" {
  type        = string
  description = "RFC3339 string representation of the expiry date. Rounded down to nearest hour. By default, it is 7 days from the date of creation."
}

# ----------------------------------------------------------
#                Datasources and Resolvers
# ----------------------------------------------------------
variable "create_graphql_api" {
  description = "Whether to create GraphQL API"
  type        = bool
  default     = true
}

# Datasources
variable "datasources" {
  description = "Map of datasources to create"
  type        = any
  default     = {}
}

# Resolvers
variable "resolvers" {
  description = "Map of resolvers to create"
  type        = any
  default     = {}
}

# VTL request/response templates
variable "direct_lambda_request_template" {
  description = "VTL request template for the direct lambda integrations"
  type        = string
  default     = <<-EOF
  {
    "version" : "2017-02-28",
    "operation": "Invoke",
    "payload": {
      "arguments": $util.toJson($ctx.arguments),
      "identity": $util.toJson($ctx.identity),
      "source": $util.toJson($ctx.source),
      "request": $util.toJson($ctx.request),
      "prev": $util.toJson($ctx.prev),
      "info": {
          "selectionSetList": $util.toJson($ctx.info.selectionSetList),
          "selectionSetGraphQL": $util.toJson($ctx.info.selectionSetGraphQL),
          "parentTypeName": $util.toJson($ctx.info.parentTypeName),
          "fieldName": $util.toJson($ctx.info.fieldName),
          "variables": $util.toJson($ctx.info.variables)
      },
      "stash": $util.toJson($ctx.stash)
    }
  }
  EOF
}

variable "direct_lambda_response_template" {
  description = "VTL response template for the direct lambda integrations"
  type        = string
  default     = <<-EOF
  $util.toJson($ctx.result)
  EOF
}
