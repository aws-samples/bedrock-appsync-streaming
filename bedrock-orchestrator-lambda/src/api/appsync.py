# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""appsync.py:

    This module handles AppSync mutations.  It invokes a mutation with user's
    session_id, locale and a response from streaming endpoint.  A langchain
    callback function calls this module, which is used in KendraRagStream class
    to trigger the streaming response.

"""
import json
import os
import copy
from typing import Dict
from logging import Logger
import requests
from botocore.awsrequest import AWSRequest
from common.logging_helper import get_logger
from common.session_helper import get_sig_v4_signature
from api.mutations import send_message_mutation


class AppSync:
    """
    AppSync class calls mutation
    """
    # class constants
    DEFAULT_APPSYNC_API_TIMEOUT: int = 60 # seconds

    # class variables
    appsync_graphql_endpoint: str = None
    logger: Logger = None

    def __init__(self,
        locale: str = None,
        session_id: str = None) -> None:
        """
        Args:
            locale (str): user's locale
            session_id (str): user session id
            message (str): response from FM to send to user via mutation
        """
        # configure logger
        self.logger = get_logger(f"{__name__}.{type(self).__name__}")

        # assign class variables
        self.locale = locale
        self.session_id = session_id

        # execute some pre-flight checks
        self.appsync_graphql_endpoint = os.environ.get("APPSYNC_GRAPHQL_ENDPOINT", None)
        if not self.appsync_graphql_endpoint:
            error_message = "APPSYNC_GRAPHQL_ENDPOINT environment variable must be set"
            self.logger.error(error_message)
            raise Exception(error_message)

    def invoke_mutation(self, message: str = None) -> Dict:
        """
        This method invokes AppSync GraphQL mutation with the values passed
        constructor.

        Returns:
            str: LLM response
        """
        # if any of the properties are not set, raise Exception
        if not self.session_id or not self.locale or not message:
            raise Exception("sessionId, locale and message must be set")

        try:
            # prepare graphql operation input and invoke the operation
            mutation_input = {
                'input': {
                    'locale': self.locale,
                    'sessionId': self.session_id,
                    'message': message
                }
            }

            # `send_message_mutation` is a GraphQL mutation.
            response = self.__invoke_appsync(query=send_message_mutation, variables=mutation_input)

            # the response from AppSync for `send_message_mutation` query will be contained inside data.sendMessage.{}
            filtered_response = response.get('data', {}).get('sendMessage', {})
            return filtered_response

        except Exception as e:
            self.logger.error("handle_fallback_intent() error: %s", e)


    def __invoke_appsync(self, query: Dict = None, variables: Dict = None, appsync_api_key: str = None) -> Dict:
         """
        This method invokes the AppSync GraphQL operation set in the constructor.

        Args:
            query (Dict): GraphQL query
            variables (Dict): GraphQL variables
            appsync_api_key (str): AppSync API key

        Returns:
            Dict: GraphQL response
        """

        # check query and input must be set, raise Exception otherwise
        if not query:
            raise Exception("query must be set")
        if not input:
            raise Exception("input must be set")

        # build the GraphQL request
        graphql_headers= {
            'Content-Type': 'application/x-amz-json-1.1'
        }
        graphql_request = {
            "query": query,
            "variables": variables
        }
        graphql_request_body = json.dumps(graphql_request)

        # check if appsync_api_key is set, invoke appsync api with x-api-key header with api key
        if appsync_api_key:
            return self.__invoke_appsync_with_api_key(headers=graphql_headers, body=graphql_request_body, appsync_api_key=appsync_api_key)

        # otherwise, use IAM authentication to invoke the appsync api
        return self.__invoke_appsync_with_iam(headers=graphql_headers, body=graphql_request_body)

    def __invoke_appsync_with_iam(self, headers: Dict = None, body: str = None) -> Dict:
        try:
            # prepare sigv4 for IAM authentication
            sigv4 = get_sig_v4_signature(service_name="appsync")

            ## AWSRequest + SigV4 doesn't work
            # build the request
            request = AWSRequest(
                url=self.appsync_graphql_endpoint,
                method="POST",
                headers=headers,
                data=body
            )

            # IMPORTANT - Don't turn this on!  REST calls with Sigv4 will fail.
            # request.context["payload_signing_enabled"] = False # payload signing is not supported

            # sign the request
            sigv4.add_auth(request)

            # prepare the request
            prepped = request.prepare()

            # # send the request
            response = requests.post(
                prepped.url,
                headers=prepped.headers,
                data=body,
                timeout=self.DEFAULT_APPSYNC_API_TIMEOUT
            ).json()

            # check for errors in response
            if 'errors' in response:

                # log the IAM authentication headers
                self.logger.debug("AppSync GraphQL endpoint IAM authentication data:")
                self.logger.debug("  url: %s", prepped.url)
                self.logger.debug("  headers: %s", prepped.headers)
                self.logger.debug("  body: %s", prepped.body)
                self.logger.debug("  method: %s", prepped.method)
                self.logger.debug("  context: %s", prepped.stream_output)

                # log the error
                error_message = "Failed to invoke AppSync GraphQL endpoint: " + str(response['errors'])
                self.logger.error(error_message)
                raise Exception(error_message)

            # return the response
            return response

        except Exception as e:
            error_message = "Failed to invoke AppSync GraphQL endpoint: " + str(e)
            self.logger.error(error_message)
            raise Exception(error_message) from e

    def __invoke_appsync_with_api_key(self, headers: Dict = None, body: str = None, appsync_api_key: str = None):
        try:
            # deep copy the headers object to avoid modifying the headers passed in parameters
            appsync_headers = copy.deepcopy(headers)

            # api key request
            appsync_headers['x-api-key'] = appsync_api_key
            response = requests.request(
                url=self.appsync_graphql_endpoint,
                method="POST",
                headers=appsync_headers,
                data=body,
                timeout=self.DEFAULT_APPSYNC_API_TIMEOUT
            ).json()

            # check for errors in response
            if 'errors' in response:
                error_message = "Failed to invoke AppSync GraphQL endpoint: " + str(response['errors'])
                self.logger.error(error_message)
                raise Exception(error_message)

            # return the response
            return response

        except Exception as e:
            error_message = "Failed to invoke AppSync GraphQL endpoint: " + str(e)
            self.logger.error(error_message)
            raise Exception(error_message) from e
