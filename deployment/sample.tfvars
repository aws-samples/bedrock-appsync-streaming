# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# ----------------------------------------------------------
#                Common variables
# ----------------------------------------------------------
# Region where you want to deploy this solution.  Make sure that you have access to
# Bedrock service in this region if you plan to use Bedrock based LLMs
region      = "us-west-2"
environment = "bedrock-streaming" # Possible values can be "prod", "preprod", "stage", "dev". It could also be your copy of the entire stack. You can name it "user1"

# ----------------------------------------------------------
#               Common Lambda Config
# ----------------------------------------------------------
lambda_vpc_subnet_id_list    = []
lambda_vpc_sg_id_list        = []
lambda_s3_source_bucket_name = "YOUR_DEPLOYMENT_BUCKET"
lambda_s3_source_bucket_key  = "PREFIX_WITHIN_THE_BUCKET"

# ----------------------------------------------------------
#          NO NEED TO MODIFY THE CONFIG BELLOW
# ----------------------------------------------------------

# ----------------------------------------------------------
#                       Roles
# ----------------------------------------------------------

# Specify ARN if you dont want to create new one.
# appsync_api_logging_service_role_arn = "YOUR_APPSYNC_API_LOGGING_SERVICE_ROLE_ARN"

# Specify ARN if you dont want to create new one.
# appsync_lambda_datasource_service_role_arn = "YOUR_APPSYNC_API_DATASOURCE_SERVICE_ROLE_ARN"

# Specify ARN if you dont want to create new one.
# appsync_lambda_datasource_role_arn = "YOUR_APPSYNC_LAMBDA_DATASOURCE_ROLE_ARN"

# Specify ARN if you dont want to create new one.
# appsync_lambda_rag_role_arn = "YOUR_APPSYNC_LAMBDA_RAG_ROLE_ARN"

# ----------------------------------------------------------
#                  SNS Topic - standard
# ----------------------------------------------------------
sns_topic_name = "bedrock_streaming_sns_topic"

# ----------------------------------------------------------
#   AppSync Lambda Data Source: bedrock-appsync-ds-lambda
# ----------------------------------------------------------
lambda_appsync_ds_function_name        = "bedrock-appsync-ds-lambda"
lambda_appsync_ds_function_description = "Bedrock Lambda function that is configured as a Data Source in AppSync Service. It is called from AppSync Query operation and it it publishes a message to SNS topic."
lambda_appsync_ds_function_version     = "0.0.5" # check ../bedrock-appsync-ds-lambda/pyproject.toml
lambda_appsync_ds_source_code_path     = "../bedrock-appsync-ds-lambda"
lambda_appsync_ds_handler              = "lambda_function.lambda_handler"
lambda_appsync_ds_runtime              = "python3.12"
lambda_appsync_ds_architecture         = "x86_64"
lambda_appsync_ds_mem_size             = 256
lambda_appsync_ds_timeout              = 300
lambda_appsync_ds_env_variables = {
  "LOG_LEVEL"                       = "debug"
  "ALLOWED_GRAPHQL_OPERATION_NAMES" = "getLlmResponse"
}

# ----------------------------------------------------------
#  AppSync RAG Lambda: bedrock-orchestrator-lambda
# ----------------------------------------------------------
lambda_appsync_rag_function_name        = "bedrock-orchestrator-lambda"
lambda_appsync_rag_function_description = "Bedrock Lambda function processes messages from SNS and interacts with FMs in SageMaker or Bedrock services using common SDK. It invokes AppSync Subscription to send data back to caller asynchronously."
lambda_appsync_rag_function_version     = "0.1.2" # check ../bedrock-orchestrator-lambda/pyproject.toml
lambda_appsync_rag_source_code_path     = "../bedrock-orchestrator-lambda"
lambda_appsync_rag_handler              = "lambda_function.lambda_handler"
lambda_appsync_rag_runtime              = "python3.12"
lambda_appsync_rag_architecture         = "x86_64"
lambda_appsync_rag_mem_size             = 256
lambda_appsync_rag_timeout              = 300


# ----------------------------------------------------------
#                   AppSync GraphQL API
# ----------------------------------------------------------
create_appsync_api                  = true
appsync_api_name                    = "bedrock-gql-api"
appsync_schema_file                 = "../bedrock-appsync-api/schema.graphql"
appsync_api_is_private              = false
appsync_xray_is_enabled             = true
appsync_logging_is_enabled          = true
appsync_log_field_log_level         = "ERROR"
appsync_log_exclude_verbose_content = false
appsync_api_key_expiry_date         = "2025-12-07T00:00:00Z" # RFC3339 string representation of the expiry date. Set this value to current date + 364 days.  Max value is ~1 year.

appsync_lambda_datasource_description = "Data source invokes test-appsync-ds-lambda"
appsync_none_datasource_description   = "NONE data source used as pass-through mechanism in Mutations and Subscriptions"

appsync_additional_authentication_provider = {
  iam = {
    authentication_type = "AWS_IAM"
  }
}

appsync_resolvers = {
  "Query.getLlmResponse" = {
    data_source     = "LambdaDS"
    type            = "Query"
    field           = "Query.getLlmResponse"
    kind            = "UNIT"
    code            = "../bedrock-appsync-api/resolvers/query-getLlmResponse-resolver.js"
    runtime         = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  "Mutation.sendMessage" = {
    data_source     = "NoneDS"
    kind            = "UNIT"
    code            = "../bedrock-appsync-api/resolvers/mutation-sendMessage-resolver.js"
    runtime         = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  "Subscription.onSendMessage" = {
    data_source     = "NoneDS"
    kind            = "UNIT"
    code            = "../bedrock-appsync-api/resolvers/subscription-onSendMessage-resolver.js"
    runtime         = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

}
