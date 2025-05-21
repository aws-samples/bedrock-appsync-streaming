# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

output "graphql_api_uris" {
  description = "AWS AppSync GraphQL API URL"
  value       = aws_appsync_graphql_api.this.uris
}

output "grapql_api_id" {
  description = "AWS AppSync GraphQL API Id"
  value       = aws_appsync_graphql_api.this.id
}

output "grapql_api_arn" {
  description = "AWS AppSync GraphQL API arn"
  value       = aws_appsync_graphql_api.this.arn
}

output "graphql_api_key" {
  description = "AWS AppSync GraphQL API Key"
  value       = aws_appsync_api_key.appsync_api_key.key
}
