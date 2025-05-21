# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# Terraform module deployment

This folder contains all the terraform module needed to deploy the resources of the solutions. These modules are created to be reuse in the `/solution` sub folders. Every modules are implemented in their folder, and each modules got 3 files. A `variables.tf`, a `main.tf` and an `output.tf`. Here are implemented modules:

## AppSync module

The [appsync module](./appsync/) creates `GraphQL` and `AppSync` related resources for the streaming solution. You can find more detail about the module inputs in the [variable file](./appsync/variables.tf).

## IAM module

The [IAM module](./iam/) create a template for `IAM roles`. You can find more detail about the module inputs in the [variable file](./iam/variables.tf).

## Lambda module

The [lambda module](./lambda/) creates a `lambda function` and deployment bucket to automate the deployment of larger lambda functions, along side a `kms key` for the deployment bucket. You can find more detail about the module inputs in the [variable file](./lambda/variables.tf).

## Layer module

The [layer module](./layer/) creates a `lambda layer` You can find more detail about the module inputs in the [variable file](./layer/variables.tf).

## SNS module

The [SNS module](./sns) creates `SNS topic` and `subscriptions` and `lambda permissions` to the related topic. You can find more detail about the module inputs in the [variable file](./sns/variables.tf).
