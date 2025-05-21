# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

locals {
  resolvers = { for k, v in var.resolvers : k => merge(v, {
    type  = split(".", k)[0]
    field = join(".", slice(split(".", k), 1, length(split(".", k))))
  }) }
}

# ----------------------------------------------------------
#                     GraphQL API
# ----------------------------------------------------------
# checkov:skip=CKV2_AWS_33:WAF protection not required for this demo/sample implementation becausae it is not for production use-cases.
resource "aws_appsync_graphql_api" "this" {
  name                = var.api_name
  visibility          = var.api_is_private ? "PRIVATE" : "GLOBAL"
  xray_enabled        = var.xray_is_enabled ? true : false
  tags                = var.api_tags
  schema              = length(var.schema_file) > 0 ? file(var.schema_file) : null
  authentication_type = "API_KEY"

  # dynamically enable logging
  dynamic "log_config" {
    for_each = var.logging_is_enabled ? [true] : []

    content {
      cloudwatch_logs_role_arn = var.logging_role_arn
      field_log_level          = var.log_field_log_level
      exclude_verbose_content  = var.log_exclude_verbose_content
    }
  }

  # dynamically adds authentication providers
  dynamic "additional_authentication_provider" {
    for_each = var.additional_authentication_provider

    content {
      authentication_type = additional_authentication_provider.value.authentication_type

      dynamic "user_pool_config" {
        for_each = length(keys(lookup(additional_authentication_provider.value, "user_pool_config", {}))) == 0 ? [] : [additional_authentication_provider.value.user_pool_config]

        content {
          user_pool_id = user_pool_config.value.user_pool_id
        }
      }
    }
  }
}

# ----------------------------------------------------------
#                   GraphQL API key
# ----------------------------------------------------------
resource "aws_appsync_api_key" "appsync_api_key" {
  api_id  = aws_appsync_graphql_api.this.id
  expires = length(var.api_key_expiry_date) > 0 ? var.api_key_expiry_date : null
}

# ----------------------------------------------------------
#                      Datasources
# ----------------------------------------------------------
resource "aws_appsync_datasource" "this" {
  for_each = var.create_graphql_api ? var.datasources : {}

  api_id           = aws_appsync_graphql_api.this.id
  name             = each.key
  type             = each.value.type
  description      = lookup(each.value, "description", null)
  service_role_arn = lookup(each.value, "service_role_arn", null)

  dynamic "lambda_config" {
    for_each = each.value.type == "AWS_LAMBDA" ? [true] : []

    content {
      function_arn = each.value.function_arn
    }
  }
}

resource "aws_appsync_resolver" "this" {
  for_each = local.resolvers
  api_id   = aws_appsync_graphql_api.this.id
  type     = each.value.type
  field    = each.value.field
  kind     = lookup(each.value, "kind", null)

  dynamic "runtime" {
    for_each = length(lookup(each.value, "runtime", "")) > 0 ? [true] : []

    content {
      name            = try(runtime.value.runtime, "APPSYNC_JS")
      runtime_version = try(runtime.value.runtime_version, "1.0.0")
    }
  }

  # code is required when runtime is APPSYNC_JS
  code = try(each.value.runtime == "APPSYNC_JS", false) ? file(each.value.code) : null

  request_template  = lookup(each.value, "request_template", tobool(lookup(each.value, "direct_lambda", false)) ? var.direct_lambda_request_template : try(each.value.runtime == "APPSYNC_JS", false) ? null : "{}")
  response_template = lookup(each.value, "response_template", tobool(lookup(each.value, "direct_lambda", false)) ? var.direct_lambda_response_template : try(each.value.runtime == "APPSYNC_JS", false) ? null : "{}")

  data_source = lookup(each.value, "data_source", null) != null ? aws_appsync_datasource.this[each.value.data_source].name : lookup(each.value, "data_source_arn", null)
}
