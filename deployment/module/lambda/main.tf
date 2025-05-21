# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# ----------------------------------------------------------
#               Compress source code
# ----------------------------------------------------------
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "${var.lambda_source_code_path}/src"
  output_path = "${var.lambda_source_code_path}/build/compressed/${var.function_name}-${var.function_version}.zip"
}

# ----------------------------------------------------------
#                Deployment Bucket
# ----------------------------------------------------------
resource "aws_s3_object" "code" {
  depends_on  = [data.archive_file.lambda]
  bucket      = var.s3_lambda_source_code_bucket_name
  key         = length(var.s3_lambda_source_code_bucket_key) > 0 ? "${var.s3_lambda_source_code_bucket_key}/${var.function_name}-${var.function_version}.zip" : "${var.function_name}-${var.function_version}.zip"
  source      = "${var.lambda_source_code_path}/build/compressed/${var.function_name}-${var.function_version}.zip"
  source_hash = data.archive_file.lambda.output_base64sha256
}

resource "aws_s3_bucket_server_side_encryption_configuration" "lambda_bucket_encryption" {
  bucket = var.s3_lambda_source_code_bucket_name

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms" # Uses the default AWS managed KMS key
    }
    bucket_key_enabled = true # Enables S3 Bucket Keys to reduce KMS costs
  }
}

# ----------------------------------------------------------
#                  Lambda Function
# ----------------------------------------------------------
#checkov:skip=CKV_AWS_116:DLQ not required for this demo/sample implementation as failed executions can be retried by the client
#checkov:skip=CKV_AWS_272: Codwe signing is not not required for this demo/sample implementation.
resource "aws_lambda_function" "function" {
  function_name    = var.function_name
  description      = var.function_description
  depends_on       = [aws_s3_object.code]
  s3_bucket        = var.s3_lambda_source_code_bucket_name
  s3_key           = length(var.s3_lambda_source_code_bucket_key) > 0 ? "${var.s3_lambda_source_code_bucket_key}/${var.function_name}-${var.function_version}.zip" : "${var.function_name}-${var.function_version}.zip"
  role             = var.role_arn
  handler          = var.handler
  source_code_hash = data.archive_file.lambda.output_base64sha256
  publish          = var.publish_version

  layers = var.layers_arn

  tracing_config {
    mode = "Active"
  }

  kms_key_arn = length(var.environment_variable_key_arn) > 0 ? var.environment_variable_key_arn : null

  runtime       = var.runtime
  architectures = [var.architecture]
  memory_size   = var.mem_size
  timeout       = var.timeout

  dynamic "vpc_config" {
    for_each = var.subnet_id_list_for_lambda != null && var.sg_id_list_for_lambda != null ? [true] : []
    content {
      security_group_ids = var.sg_id_list_for_lambda
      subnet_ids         = var.subnet_id_list_for_lambda
    }
  }

  tags = var.tags

  environment {
    variables = var.environment_variables
  }
}

resource "aws_lambda_alias" "lambda_alias" {
  for_each = {
    for index, alias in var.aliases :
    alias.name => alias
  }

  name             = each.value.name
  description      = each.value.description
  function_name    = aws_lambda_function.function.arn
  function_version = each.value.version

  depends_on = [aws_lambda_function.function]
}

resource "aws_lambda_provisioned_concurrency_config" "alias_provisioned_concurrency" {
  for_each = {
    for index, pc in var.provisionned_concurrency_settings :
    pc.aliase_name => pc
  }

  function_name                     = aws_lambda_function.function.function_name
  provisioned_concurrent_executions = each.value.provisioned_concurrent_executions
  qualifier                         = each.value.aliase_name
}
