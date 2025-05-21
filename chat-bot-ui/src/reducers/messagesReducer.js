// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { getMessageTime } from '../utils/timeUtils';
import { actions } from './actions';

// constants
const DEFAULT_HTML_WHITE_SPACE = "&nbsp;";

// messagesReducer function takes in messages (original state) and action (changed state)
// and returns the new state
export function messagesReducer(messages, action) {
  switch (action.type) {

    case actions.MESSAGE_SENT: {
      const message = {
        messageSent: action.payload,
        messageTimestamp: getMessageTime()
      };
      return [...messages, message];
    }

    case actions.MESSAGE_RECEIVED: {
      const message = {
        messageReceived: action.payload,
        messageTimestamp: getMessageTime()
      };
      return [...messages, message];
    }

    case actions.MESSAGE_RECEIVED_ERROR: {
      const message = {
        messageReceived: action.payload,
        messageTimestamp: getMessageTime(),
        error: true
      };

      // get the last element with messageSent from messages array
      if (messages.length>0) {

        // iterate over messages array in reverse oder and set error attribute to true for first message found with messageSent set
        const filteredMessages = structuredClone(messages);
        for (let i = filteredMessages.length - 1; i >= 0; i--) {
          if (filteredMessages[i].messageSent) {
            filteredMessages[i].error = true;
            break;
          }
        }

        // const lastMessage = messages[messages.length - 1];
        // lastMessage.error = true;
        // // remove last message from messages array
        // const filteredMessages = messages.slice(0, messages.length - 1);

        const newMessages = [ ...filteredMessages, message];
        return newMessages;
      }

      return [...messages, message];

    }

    //
    // REST API fetch actions
    //
    case actions.API_FETCH_IN_PROGRESS: {
      // add messagePending: true to messages array
      // this adds chatbot's three dots animation
      const message = {
        messagePending: true
      };
      return [...messages, message];
    }

    case actions.API_FETCH_SUCCESS: {
      // remove all messages from messages array that contain messagePending: true
      // this removes chatbot's three dots animation
      const filteredMessages = messages.filter(message => message.messagePending !== true);
      return [...filteredMessages];
    }

    case actions.API_FETCH_FAILURE: {
      // remove all messages from messages array that contain messagePending: true
      // this removes chatbot's three dots animation
      const filteredMessages = messages.filter(message => message.messagePending !== true);
      return [...filteredMessages];
    }

    //
    // GraphQL API actions
    //
    case actions.GRAPHQL_QUERY_IN_PROGRESS: {
      // add messagePending: true to messages array
      // this adds chatbot's three dots animation
      const message = {
        messagePending: true
      };
      return [...messages, message];
    }

    case actions.GRAPHQL_QUERY_SUCCESS: {
      // remove all messages from messages array that contain messagePending: true
      // this removes chatbot's three dots animation
      const filteredMessages = messages.filter(message => message.messagePending !== true);
      return [...filteredMessages];
    }

    case actions.GRAPHQL_QUERY_FAILURE: {
      // remove all messages from messages array that contain messagePending: true
      // this removes chatbot's three dots animation
      const filteredMessages = messages.filter(message => message.messagePending !== true);
      return [...filteredMessages];
    }

    case actions.GRAPHQL_SUBSCRIPTION_START: {
      // insert an empty message to indicate subscription has started
      // empty message must be the "white space HTML code".  browser needs
      // to render an empty bubble with blinking cursor
      const message = {
        messageReceived: DEFAULT_HTML_WHITE_SPACE,
        messageTimestamp: getMessageTime()
      };
      return [...messages, message];
    }

    case actions.GRAPHQL_SUBSCRIPTION_RECEIVED: {
      // iterate over messages array, determine if the last entry has a 'messageReceived' attribute
      // if it does not, add new message with following properties:
      //    {
      //      messageReceived: action.payload,
      //      messageTimestamp: getMessageTime()
      //    }
      // otherwise, get the last entry with 'messageReceived' attribute and set the 'messageReceived'
      // attribute.  Append the action.payload to the 'messageReceived' attribute.

      // deep copy the message
      const lastMessage = Object.assign({},messages[messages.length - 1]);
      // if lastMessage does not contain messageReceived attribute, add new message
      // with messageReceived attribute
      if (lastMessage && !lastMessage.messageReceived) {
        const message = {
          messageReceived: action.payload,
          messageTimestamp: getMessageTime()
        };
        return [...messages, message];
      }
      // if lastMessage.messageReceived matches DEFAULT_HTML_WHITE_SPACE
      // then remove it.
      if (lastMessage.messageReceived === DEFAULT_HTML_WHITE_SPACE) {
        lastMessage.messageReceived = "";
      }
      // otherwise, append action.payload to lastMessage.messageReceived and
      // we don't want to update the timestamp because it makes the received
      // message bubble time flicker and look weird
      lastMessage.messageReceived += action.payload;
      // lastMessage.messageTimestamp = getMessageTime();
      // remove lastMessage from messages array
      messages = messages.slice(0, messages.length - 1);

      // return array with modified last message
      return [...messages, lastMessage];
    }

    //
    // WEBSOCKET actions
    //
    case actions.WEBSOCKET_SEND_IN_PROGRESS: {
      // add messagePending: true to messages array
      // this adds chatbot's three dots animation
      const message = {
        messagePending: true
      };
      return [...messages, message];
    }

    case actions.WEBSOCKET_SEND_SUCCESS: {
      // remove all messages from messages array that contain messagePending: true
      // this removes chatbot's three dots animation
      const filteredMessages = messages.filter(message => message.messagePending !== true);
      return [...filteredMessages];
    }

    case actions.WEBSOCKET_SEND_FAILURE: {
      // remove all messages from messages array that contain messagePending: true
      // this removes chatbot's three dots animation
      const filteredMessages = messages.filter(message => message.messagePending !== true);
      return [...filteredMessages];
    }

    case actions.WEBSOCKET_RECEIVE_START: {
      // insert an empty message to indicate subscription has started
      // empty message must be the "white space HTML code".  browser needs
      // to render an empty bubble with blinking cursor
      const message = {
        messageReceived: DEFAULT_HTML_WHITE_SPACE,
        messageTimestamp: getMessageTime()
      };
      return [...messages, message];
    }

    case actions.WEBSOCKET_RECEIVE_MESSAGE: {
      // iterate over messages array, determine if the last entry has a 'messageReceived' attribute
      // if it does not, add new message with following properties:
      //    {
      //      messageReceived: action.payload,
      //      messageTimestamp: getMessageTime()
      //    }
      // otherwise, get the last entry with 'messageReceived' attribute and set the 'messageReceived'
      // attribute.  Append the action.payload to the 'messageReceived' attribute.

      // deep copy the message
      const lastMessage = Object.assign({},messages[messages.length - 1]);
      // if lastMessage does not contain messageReceived attribute, add new message
      // with messageReceived attribute
      if (lastMessage && !lastMessage.messageReceived) {
        const message = {
          messageReceived: action.payload,
          messageTimestamp: getMessageTime()
        };
        return [...messages, message];
      }
      // if lastMessage.messageReceived matches DEFAULT_HTML_WHITE_SPACE
      // then remove it.
      if (lastMessage.messageReceived === DEFAULT_HTML_WHITE_SPACE) {
        lastMessage.messageReceived = "";
      }
      // otherwise, append action.payload to lastMessage.messageReceived and
      // we don't want to update the timestamp because it makes the received
      // message bubble time flicker and look weird
      lastMessage.messageReceived += action.payload;
      // lastMessage.messageTimestamp = getMessageTime();
      // remove lastMessage from messages array
      messages = messages.slice(0, messages.length - 1);

      // return array with modified last message
      return [...messages, lastMessage];
    }

    default:
      return [...messages];
  }
}
