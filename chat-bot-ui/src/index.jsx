// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// eslint-disable-next-line no-unused-vars
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { App } from './components/App';
import { AppProvider } from './contexts/AppContext';
import config from './config';

if (process.env.NODE_ENV !== "development") {
  console.log = () => {};
}
console.log('NODE_ENV ? ', process.env.NODE_ENV);
console.log('configuration: ');
console.log('  LOCALE: ', config.LOCALE);
console.log('  AWS_REGION: ', config.AWS_REGION);
console.log('  API_ENDPOINT: ', config.API_ENDPOINT);
console.log('  APPSYNC_ENABLED: ', config.APPSYNC_ENABLED);
console.log('  WEBSOCKET_ENABLED: ', config.WEBSOCKET_ENABLED);
console.log('  WEBSOCKET_ENDPOINT: ', config.WEBSOCKET_ENDPOINT);
console.log('  AGENT_ENABLED:', config.AGENT_ENABLED);
console.log('  mock: ', config.mock);

// throw an error if both config.APPSYNC_ENABLE and config.WEBSOCKET_ENABLED are set to True
if (config.APPSYNC_ENABLED && config.WEBSOCKET_ENABLED) {
  throw new Error('APPSYNC_ENABLED and WEBSOCKET_ENABLED are mutually exclusive.  Please enable one and not both.');
}

// if streaming is on then configure Amplify
if (config.APPSYNC_ENABLED) {
  // Reference: https://github.com/aws-amplify/amplify-js#amplify-5xx-has-breaking-changes-please-see-the-breaking-changes-below
  const Amplify = await import('@aws-amplify/core').then(m => m.Amplify);

  // Reference: https://docs.amplify.aws/lib/client-configuration/configuring-amplify-categories/q/platform/js/#graphql-api-aws-appsync
  // Authentication type options are API_KEY, AWS_IAM, AMAZON_COGNITO_USER_POOLS and OPENID_CONNECT
  Amplify.configure({
    aws_appsync_region: config.AWS_REGION, // (optional) - AWS AppSync region
    aws_appsync_graphqlEndpoint: config.GRAPHQL_ENDPOINT, // (optional) - AWS AppSync endpoint
    aws_appsync_authenticationType: 'API_KEY', // (optional) - Primary AWS AppSync authentication type
    aws_appsync_apiKey: config.GRAPHQL_API_KEY, // (optional) - AWS AppSync API Key
    // graphql_endpoint_iam_region: 'us-east-1' // (optional) - Custom IAM region
  });
}

const root = ReactDOM.createRoot(document.querySelector('.gen-ai-bot') || document.createElement('div'));
root.render(
  <AppProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AppProvider>
);
