# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# ----------------------------------------------------------
#                      Variables
# ----------------------------------------------------------
variable "region" {
  type = string
}

variable "environment" {
  type        = string
  description = "Deployment environment. This prefix is added to all resources created. Changing this value will redeploy all resources with a different names. Value must not contain spaces. Example values are 'test', 'dev', 'stage', 'preprod', 'prod'"
}

# Principal names
variable "lambda_role_principal_name" {
  type        = string
  description = "Lambda service principal name"
  default     = "lambda.amazonaws.com"
}

# Common Lambda Config
variable "lambda_vpc_subnet_id_list" {
  type        = list(string)
  description = "Sets the subnets in which the lambda will be launched."
  default     = []
}

variable "lambda_vpc_sg_id_list" {
  type        = list(string)
  description = "Security group for the lambda function."
  default     = []
}

variable "lambda_s3_source_bucket_name" {
  type = string
}

variable "lambda_s3_source_bucket_key" {
  type = string
}

# Principals
variable "appsync_role_principal_name" {
  type        = string
  description = "AWS AppSync service principal name"
  default     = "appsync.amazonaws.com"
}

# Roles
variable "appsync_api_logging_service_role_arn" {
  type        = string
  description = "AppSync Service role arn that AWS AppSync will assume to publish to Amazon CloudWatch logs in your account. Principal is AppSync."
  default     = ""
}

variable "appsync_lambda_datasource_service_role_arn" {
  type        = string
  description = "AppSync Service role arn that AWS AppSyc will assume to invoke AppSync Lambda data source Lambda. Principal is AppSync."
  default     = ""
}

variable "appsync_lambda_datasource_role_arn" {
  type        = string
  description = "Lambda Service role arn used by AppSync Data Source Lambda."
  default     = ""
}

variable "appsync_lambda_rag_role_arn" {
  type        = string
  description = "Lambda Service role arn used by AppSync RAG Lambda."
  default     = ""
}

# SNS Topic & Subscription
variable "sns_topic_name" {
  type        = string
  description = "SNS Topic name"
}

# AppSync Data Source Lambda: blueprint-appsync-ds-lambda
variable "lambda_appsync_ds_function_name" {
  type        = string
  description = "Name of the rag lambda function that will apear in the AWS function."
}

variable "lambda_appsync_ds_function_version" {
  type        = string
  description = "Version is used in zip archive name stored in S3 bucket for deployment."
}

variable "lambda_appsync_ds_function_description" {
  type        = string
  description = "Description of the lambda function that apears in the console."
}

variable "lambda_appsync_ds_source_code_path" {
  type        = string
  description = "Path to the lambda source code base directory."
}

variable "lambda_appsync_ds_handler" {
  type    = string
  default = "lambda_function.py"
}

variable "lambda_appsync_ds_runtime" {
  type = string
}

variable "lambda_appsync_ds_architecture" {
  type = string
}

variable "lambda_appsync_ds_mem_size" {
  type = number
}

variable "lambda_appsync_ds_timeout" {
  type = string
}

variable "lambda_appsync_ds_environment_variable_key_alias" {
  type        = string
  description = "Encrypt environment variable at rest with KMS. The value should be the alias of the key. Example: alias/aws/lambda"
  default     = ""
}

variable "lambda_appsync_ds_env_variables" {
  type        = map(string)
  description = "A map containing environment variables. Both the key and value must be strings."
  default     = {}
}

# AppSync RAG Lambda: blueprint-appsync-kendra-rag-lambda
variable "lambda_appsync_rag_function_name" {
  type        = string
  description = "Name of the rag lambda function that will apear in the AWS function."
}

variable "lambda_appsync_rag_function_version" {
  type        = string
  description = "Version is used in zip archive name stored in S3 bucket for deployment."
}

variable "lambda_appsync_rag_function_description" {
  type        = string
  description = "Description of the lambda function that apears in the console."
}

variable "lambda_appsync_rag_source_code_path" {
  type        = string
  description = "Path to the lambda source code base directory."
}

variable "lambda_appsync_rag_handler" {
  type    = string
  default = "lambda_function.py"
}

variable "lambda_appsync_rag_runtime" {
  type = string
}

variable "lambda_appsync_rag_architecture" {
  type = string
}

variable "lambda_appsync_rag_mem_size" {
  type = number
}

variable "lambda_appsync_rag_timeout" {
  type = string
}

variable "lambda_appsync_rag_environment_variable_key_alias" {
  type        = string
  description = "Encrypt environment variable at rest with KMS. The value should be the alias of the key. Example: alias/aws/lambda"
  default     = ""
}

variable "lambda_appsync_rag_env_variables" {
  type        = map(string)
  description = "A map containing environment variables. Both the key and value must be strings."
  default     = {}
}

# AppSync GraphQL API
variable "create_appsync_api" {
  type        = bool
  description = "Create or skip AppSync GraphQL API creation"
}

variable "appsync_api_name" {
  type = string
}

variable "appsync_schema_file" {
  type        = string
  description = "AWS AppSync GraphQL API schema file location"
}

variable "appsync_api_is_private" {
  type        = bool
  description = "REST API is PRIVATE"
  default     = false
}

variable "appsync_xray_is_enabled" {
  type        = bool
  description = "X-RAY traces for AWS AppSync GraphQL API"
  default     = false
}

variable "appsync_additional_authentication_provider" {
  description = "One or more additional authentication providers."
  type        = any
  default     = {}
}

variable "appsync_logging_is_enabled" {
  description = "Whether to enable Cloudwatch logging on GraphQL API"
  type        = bool
  default     = false
}

variable "appsync_log_field_log_level" {
  description = "Field logging level. Valid values: ALL, ERROR, NONE."
  type        = string
  default     = null
}

variable "appsync_log_exclude_verbose_content" {
  description = "Set to TRUE to exclude sections that contain information such as headers, context, and evaluated mapping templates, regardless of logging level."
  type        = bool
  default     = false
}

# AppSync GraphQL API key
variable "appsync_api_key_expiry_date" {
  type        = string
  description = "RFC3339 string representation of the expiry date. Rounded down to nearest hour. By default, it is 7 days from the date of creation."
}

# AppSync Datasources
variable "appsync_lambda_datasource_description" {
  type        = string
  description = "Description of the data source"
  default     = "Data source invokes Lambda function"
}

variable "appsync_none_datasource_description" {
  type        = string
  description = "NONE data source description"
  default     = "NONE data source used as pass-through mechanism in Mutations and Subscriptions"
}

# AppSync GrapQL API Resolvers
variable "appsync_resolvers" {
  type        = any
  description = "Resolvers for the Appsync API"
}

# Tags
variable "sns_topic_tags" {
  type        = map(string)
  description = "A map containing tags. Both the key and value must be strings."
  default     = {}
}

variable "appsync_api_logging_service_role_tags" {
  type        = map(string)
  description = "A map containing tags. Both the key and value must be strings."
  default     = {}
}

variable "appsync_lambda_datasource_service_role_tags" {
  type        = map(string)
  description = "A map containing tags. Both the key and value must be strings."
  default     = {}
}

variable "appsync_lambda_datasource_role_tags" {
  type        = map(string)
  description = "A map containing tags. Both the key and value must be strings."
  default     = {}
}

variable "appsync_lambda_rag_role_tags" {
  type        = map(string)
  description = "A map containing tags. Both the key and value must be strings."
  default     = {}
}

variable "appsync_lambda_datasource_tags" {
  type        = map(string)
  description = "A map containing tags. Both the key and value must be strings."
  default     = {}
}

variable "appsync_lambda_rag_tags" {
  type        = map(string)
  description = "A map containing tags. Both the key and value must be strings."
  default     = {}
}

variable "appsync_api_tags" {
  type        = map(string)
  description = "A map containing tags. Both the key and value must be strings."
  default     = {}
}

# ----------------------------------------------------------
#                       Roles
# ----------------------------------------------------------

locals {
  lambda_appsync_rag_role_inline_policy_list = [
    {
      name = "LambdaBasicExecutionPolicy"
      policy = {
        Version = "2012-10-17"
        Statement = [
          {
            Sid    = "StatementId0"
            Effect = "Allow"
            Action = [
              "logs:CreateLogGroup"
            ]
            Resource = [
              "arn:aws:logs:${var.region}:${local.account_id}:log-group:/aws/lambda/${var.lambda_appsync_rag_function_name}-${var.environment}"
            ]
          },
          {
            Sid    = "StatementId1"
            Effect = "Allow"
            Action = [
              "logs:CreateLogStream",
              "logs:PutLogEvents"
            ]
            Resource = [
              "arn:aws:logs:${var.region}:${local.account_id}:log-group:/aws/lambda/${var.lambda_appsync_rag_function_name}-${var.environment}:*"
            ]
          }
        ]
      }
    },
    {
      name = "BedrockPolicy"
      policy = {
        Version = "2012-10-17"
        Statement = [
          {
            Sid    = "StatementId0"
            Effect = "Allow"
            Action = [
              "bedrock:InvokeModel",
              "bedrock:InvokeModelWithResponseStream"
            ]
            Resource = [
              "arn:aws:bedrock:${var.region}::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
            ]
          }
        ]
      }
    },
    {
      name = "AppSyncApiPolicy"
      policy = {
        Version = "2012-10-17"
        Statement = [
          {
            Sid    = "StatementId0"
            Effect = "Allow"
            Action = [
              "appsync:GraphQL",
              "appsync:GetGraphqlApi",
              "appsync:ListGraphqlApis"
            ]
            Resource = [
              "arn:aws:appsync:${var.region}:${local.account_id}:apis/*"
            ]
          }
        ]
      }
    }
  ]
}

module "lambda_appsync_rag_role" {
  source = "./module/iam"
  # only create this role when create_appsync_api = true and var.appsync_lambda_rag_role_arn is not set
  count = (var.create_appsync_api && length(var.appsync_lambda_rag_role_arn) <= 0) ? 1 : 0

  role_name       = "${var.lambda_appsync_rag_function_name}-role-${var.environment}"
  principal_name  = var.lambda_role_principal_name
  inline_policies = local.lambda_appsync_rag_role_inline_policy_list

  role_tags = merge({
    # If you want to assign a variable as a tag value assign it here. Else add it in the corresponding tag map variable in the tfvar file.
  }, var.appsync_lambda_rag_role_tags)
}

data "aws_kms_alias" "lambda_appsync_ds_key" {
  count = length(var.lambda_appsync_ds_environment_variable_key_alias) > 0 ? 1 : 0
  name  = var.lambda_appsync_ds_environment_variable_key_alias
}

module "lambda_appsync_ds_role" {
  source = "./module/iam"
  # only create this role when create_appsync_api = true and var.appsync_lambda_datasource_role_arn is not set
  count = (var.create_appsync_api && length(var.appsync_lambda_datasource_role_arn) <= 0) ? 1 : 0

  role_name      = "${var.lambda_appsync_ds_function_name}-role-${var.environment}"
  principal_name = var.lambda_role_principal_name
  inline_policies = [
    {
      name = "LambdaBasicExecutionPolicy"
      policy = {
        Version = "2012-10-17"
        Statement = [
          {
            Sid    = "StatementId0"
            Effect = "Allow"
            Action = [
              "logs:CreateLogGroup"
            ]
            Resource = [
              "arn:aws:logs:${var.region}:${local.account_id}:/aws/lambda/${var.lambda_appsync_ds_function_name}-${var.environment}" # test this
            ]
          },
          {
            Sid    = "StatementId1"
            Effect = "Allow"
            Action = [
              "logs:CreateLogStream",
              "logs:PutLogEvents"
            ]
            Resource = [
              "arn:aws:logs:${var.region}:${local.account_id}:log-group:/aws/lambda/${var.lambda_appsync_ds_function_name}-${var.environment}:*"
            ]
          }
        ]
      }
    },
    {
      name = "SNSPolicy"
      policy = {
        Version = "2012-10-17"
        Statement = [
          {
            Sid    = "StatementId0"
            Effect = "Allow"
            Action = [
              "sns:Publish"
            ]
            Resource = [
              "${var.create_appsync_api ? module.appsync_sns_topic[0].topic_arn : null}"
            ]
          }
        ]
      }
    }
  ]

  role_tags = merge({
    # If you want to assign a variable as a tag value assign it here. Else add it in the corresponding tag map variable in the tfvar file.
  }, var.appsync_lambda_datasource_role_tags)
  depends_on = [module.appsync_sns_topic]
}

module "appsync_logging_service_role" {
  source = "./module/iam"
  # only create this role when create_appsync_api = true and var.appsync_api_logging_service_role_arn is not set
  count          = (var.create_appsync_api && length(var.appsync_api_logging_service_role_arn) <= 0) ? 1 : 0
  role_name      = "${var.appsync_api_name}-logging-role-${var.environment}"
  principal_name = var.appsync_role_principal_name
  inline_policies = [
    {
      name = "CloudwatchPolicy"
      policy = {
        Version = "2012-10-17"
        Statement = [
          {
            Sid    = "StatementId0"
            Effect = "Allow"
            Action = [
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:PutLogEvents"
            ]
            Resource = [
              "arn:aws:logs:${var.region}:${local.account_id}:log-group:/aws/appsync/apis/*"
            ]
          },
        ]
      }
    }
  ]

  role_tags = merge({
    # If you want to assign a variable as a tag value assign it here. Else add it in the corresponding tag map variable in the tfvar file.
  }, var.appsync_api_logging_service_role_tags)
}

module "appsync_lambda_datasource_service_role" {
  source = "./module/iam"
  # only create this role when create_appsync_api = true and var.appsync_lambda_datasource_service_role_arn is not set
  count = (var.create_appsync_api && length(var.appsync_lambda_datasource_service_role_arn) <= 0) ? 1 : 0

  role_name      = "${var.appsync_api_name}-lambda-ds-role-${var.environment}"
  principal_name = var.appsync_role_principal_name
  inline_policies = [
    {
      name = "AWSLambdaBasicExecutionRole"
      policy = {
        Version = "2012-10-17"
        Statement = [
          {
            Sid    = "StatementId0"
            Effect = "Allow"
            Action = [
              "lambda:InvokeFunction"
            ]
            Resource = [
              "${module.lambda_appsync_ds[0].arn}"
            ]
          }
        ]
      }
    }
  ]

  role_tags = merge({
    # If you want to assign a variable as a tag value assign it here. Else add it in the corresponding tag map variable in the tfvar file.
  }, var.appsync_lambda_datasource_service_role_tags)
  depends_on = [module.lambda_appsync_ds]
}

# ----------------------------------------------------------
#                     Resources
# ----------------------------------------------------------
locals {
  lambda_appsync_ds_function_name  = "${var.lambda_appsync_ds_function_name}-${var.environment}"
  lambda_appsync_rag_function_name = "${var.lambda_appsync_rag_function_name}-${var.environment}"
}

module "lambda_appsync_rag" {
  source = "./module/lambda"
  count  = var.create_appsync_api ? 1 : 0

  s3_lambda_source_code_bucket_name = var.lambda_s3_source_bucket_name
  s3_lambda_source_code_bucket_key  = var.lambda_s3_source_bucket_key
  function_version                  = var.lambda_appsync_rag_function_version
  function_name                     = local.lambda_appsync_rag_function_name
  function_description              = var.lambda_appsync_rag_function_description
  lambda_source_code_path           = var.lambda_appsync_rag_source_code_path
  role_arn                          = length(var.appsync_lambda_rag_role_arn) > 0 ? var.appsync_lambda_rag_role_arn : module.lambda_appsync_rag_role[0].role_arn
  handler                           = var.lambda_appsync_rag_handler
  runtime                           = var.lambda_appsync_rag_runtime
  architecture                      = var.lambda_appsync_rag_architecture
  mem_size                          = var.lambda_appsync_rag_mem_size
  timeout                           = var.lambda_appsync_rag_timeout
  layers_arn                        = ["arn:aws:lambda:${var.region}:336392948345:layer:AWSSDKPandas-Python312:16"] # The dwefault Panda layer contains the requests package needed.
  subnet_id_list_for_lambda         = var.lambda_vpc_subnet_id_list
  sg_id_list_for_lambda             = var.lambda_vpc_sg_id_list
  environment_variables = merge({
    # If you want to assign a variable as a environment variable's value, assign it here. Else add it in the corresponding env_variable map in the tfvar file.
  }, var.lambda_appsync_rag_env_variables)

  tags = merge({
    # If you want to assign a variable as a tag value assign it here. Else add it in the corresponding tag map variable in the tfvar file.
  }, var.appsync_lambda_rag_tags)
  depends_on = [module.lambda_appsync_rag_role]
}

# Manually updating the environment variable once the graphQL API is created. (This is a workaround to get rid of circular dependencies)
resource "null_resource" "update_lambda_env" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = <<EOF
      aws lambda update-function-configuration \
        --function-name ${module.lambda_appsync_rag[0].function_name} \
        --environment "Variables={APPSYNC_GRAPHQL_ENDPOINT=${module.graphql_api[0].graphql_api_uris["GRAPHQL"]},
            LM_METRICS_ENABLED       = false,
            LM_METRICS_TOPIC_ARN     = null,
            LOG_LEVEL                = "debug",
            LM_TYPE                  = "bedrock",
            LM_VENDOR_NAME           = "anthropic",
            LM_MODEL_ID              = "anthropic.claude-3-sonnet-20240229-v1:0"}"
    EOF
  }

  depends_on = [module.lambda_appsync_rag, module.graphql_api]
}

module "lambda_appsync_ds" {
  source = "./module/lambda"
  count  = var.create_appsync_api ? 1 : 0

  s3_lambda_source_code_bucket_name = var.lambda_s3_source_bucket_name
  s3_lambda_source_code_bucket_key  = var.lambda_s3_source_bucket_key
  function_version                  = var.lambda_appsync_ds_function_version
  function_name                     = local.lambda_appsync_ds_function_name
  function_description              = var.lambda_appsync_ds_function_description
  lambda_source_code_path           = var.lambda_appsync_ds_source_code_path
  role_arn                          = length(var.appsync_lambda_datasource_role_arn) > 0 ? var.appsync_lambda_datasource_role_arn : module.lambda_appsync_ds_role[0].role_arn
  handler                           = var.lambda_appsync_ds_handler
  runtime                           = var.lambda_appsync_ds_runtime
  architecture                      = var.lambda_appsync_ds_architecture
  mem_size                          = var.lambda_appsync_ds_mem_size
  timeout                           = var.lambda_appsync_ds_timeout
  layers_arn                        = [""]
  subnet_id_list_for_lambda         = var.lambda_vpc_subnet_id_list
  sg_id_list_for_lambda             = var.lambda_vpc_sg_id_list
  environment_variables = merge({
    # If you want to assign a variable as a env variable's value, assign it here. Else add it in the corresponding env_variable map in the tfvar file.
    APPSYNC_TOPIC_ARN = "${module.appsync_sns_topic[0].topic_arn}"
  }, var.lambda_appsync_ds_env_variables)

  tags = merge({
    # If you want to assign a variable as a tag value assign it here. Else add it in the corresponding tag map variable in the tfvar file.
  }, var.appsync_lambda_datasource_tags)
  depends_on = [module.lambda_appsync_ds_role, module.appsync_sns_topic]
}

module "appsync_sns_topic" {
  source     = "./module/sns"
  count      = var.create_appsync_api ? 1 : 0
  topic_name = "${var.sns_topic_name}_${var.environment}"
  topic_tags = merge({
    # If you want to assign a variable as a tag value assign it here. Else add it in the corresponding tag map variable in the tfvar file.
  }, var.sns_topic_tags)
  depends_on = [module.lambda_appsync_rag]
}

module "appsync_sns_lambda_subscription" {
  source               = "./module/sns-subscription-lambda"
  count                = length(module.appsync_sns_topic) > 0 ? 1 : 0
  region               = var.region
  account_id           = local.account_id
  lambda_function_name = local.lambda_appsync_rag_function_name
  sns_topic_arn        = module.appsync_sns_topic[0].topic_arn
  depends_on           = [module.appsync_sns_topic, module.lambda_appsync_ds]
}

# ----------------------------------------------------------
#                     AppSync API
# ----------------------------------------------------------
locals {
  datasources = {
    LambdaDS = {
      type             = "AWS_LAMBDA"
      description      = var.appsync_lambda_datasource_description
      service_role_arn = length(var.appsync_lambda_datasource_service_role_arn) > 0 ? var.appsync_lambda_datasource_service_role_arn : module.appsync_lambda_datasource_service_role[0].role_arn
      function_arn     = module.lambda_appsync_ds[0].arn
    }

    NoneDS = {
      type        = "NONE"
      description = var.appsync_none_datasource_description
    }
  }

}

module "graphql_api" {
  source = "./module/appsync"
  count  = var.create_appsync_api ? 1 : 0

  api_name                           = "${var.appsync_api_name}-${var.environment}"
  schema_file                        = var.appsync_schema_file
  api_is_private                     = var.appsync_api_is_private
  xray_is_enabled                    = var.appsync_xray_is_enabled
  additional_authentication_provider = var.appsync_additional_authentication_provider
  logging_is_enabled                 = var.appsync_logging_is_enabled
  log_field_log_level                = var.appsync_log_field_log_level
  log_exclude_verbose_content        = var.appsync_log_exclude_verbose_content
  logging_role_arn                   = length(var.appsync_api_logging_service_role_arn) > 0 ? var.appsync_api_logging_service_role_arn : module.appsync_logging_service_role[0].role_arn
  api_key_expiry_date                = var.appsync_api_key_expiry_date
  datasources                        = local.datasources
  resolvers                          = var.appsync_resolvers

  api_tags = merge({
    # If you want to assign a variable as a tag value assign it here. Else add it in the corresponding tag map variable in the tfvar file.
  }, var.appsync_api_tags)

  depends_on = [module.lambda_appsync_ds, module.appsync_logging_service_role, module.appsync_lambda_datasource_service_role]
}
