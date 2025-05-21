# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

locals {
  lambda_function_arn = length(var.lambda_function_name) > 0 ? "arn:aws:lambda:${var.region}:${var.account_id}:function:${var.lambda_function_name}" : null
}

# ----------------------------------------------------------
#                   Subsctiption - Lambda
# ----------------------------------------------------------
resource "aws_sns_topic_subscription" "this" {
  topic_arn = var.sns_topic_arn
  protocol  = "lambda"
  endpoint  = local.lambda_function_arn
}

# ----------------------------------------------------------
#        Add Lambda function(s) persmission/trigger
# ----------------------------------------------------------
resource "aws_lambda_permission" "this" {
  statement_id  = "Statement0"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = var.sns_role_principal_name
  source_arn    = var.sns_topic_arn
  depends_on    = [aws_sns_topic_subscription.this]
}
