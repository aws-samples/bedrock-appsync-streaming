// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import config from '../config';

// IMPORTANT - api.error.response comes from the orchestrator lambda.  Ensure that it partially matches the orchestrator lambda error message.
let en_US = {
  'user.input.search.icon.label': 'search',
  'user.input.placeholder.text': 'Ask Your Question',
  'chatbot.error.message': 'Something went wrong. Please try again later.',
  'api.error.response': 'Sorry, I was not able to answer your question.',
  'welcome.messages': [
    'Welcome to the chat!',
    'Please type your question below.'
  ],
  'welcome.messages.demo': [
    'Welcome to the chat! I\'m a conversational AI assistant to stream data from Amazon Bedrock to the front end.  You can ask me questions about anything to begin the streaming.',``
  ]
};

// IMPORTANT - api.error.response comes from the orchestrator lambda.  Ensure that it partially matches the orchestrator lambda error message.
let fr_CA = {
  'user.input.search.icon.label': 'recherche',
  'user.input.placeholder.text': 'Posez votre question',
  'chatbot.error.message': 'Un probl\u00e8me s\u2019est produit. Veuillez r\u00e9essayer plus tard.',
  'api.error.response': 'D\u00e9sol\u00e9, je n\u2019ai pas pu r\u00e9pondre \u00e0 votre question.',
  'welcome.messages': [
    'Bienvenue dans la s\u00e9ance de clavardage!!!',
    'Tapez votre question ci-dessous.'
  ],
  'welcome.messages.demo': [
    'Bienvenue sur le chat the chat! Je suis un assistant AI pour streamer des données de Amazon Bedrock à votre application web.',``
  ]
};

// export
export { en_US, fr_CA };
