// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
// react-bootstrap v2.8+
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

// react-bootstrap 0.33.1
// import { Form } from "react-bootstrap/lib/Form";
// import { InputGroup } from "react-bootstrap/lib/InputGroup";
// import { Button } from "react-bootstrap/lib/InputGroup";

import { Search, Send } from 'react-bootstrap-icons';

import { useAppDispatch, useAppState } from '../contexts/AppContext';
import { actions } from '../reducers/actions';
import { generateSessionId } from '../utils/chatUtils';
import { doRestApiCall } from '../utils/restApiUtils';
import config  from '../config';
import { en_US, fr_CA } from '../translations/common';

// CSS imports
import "./UserInput.css";

const appConfig = config;

let placeHolderText = en_US['user.input.placeholder.text'];
let searchIconLabel = en_US['user.input.search.icon.label'];
if (appConfig.LOCALE === "fr_CA") {
  placeHolderText = fr_CA['user.input.placeholder.text'];
  searchIconLabel = fr_CA['user.input.search.icon.label'];
}

let graphqlUtils = undefined;
if (appConfig.APPSYNC_ENABLED) {
  graphqlUtils = await import('../utils/graphqlUtils');
}

let websocketUtils = undefined;
if (appConfig.WEBSOCKET_ENABLED) {
  websocketUtils = await import('../utils/websocketUtils');
}

// Define component level constants
// - local state for Prompt component
// - remap application configuration object to appConfig
const initialUserMessage = {
  value: '',
  isInvalid: undefined
};


export const UserInput = () => {
  const dispatch = useAppDispatch();
  const { api, messages, sessionId } = useAppState();
  const [ userMessage, setUserMessage ] = useState(initialUserMessage);

  // generate a sessionId when UserInput loads.  this sessionId should not
  // change for the duration of chat session
  useEffect(() => {
    dispatch({
      type: actions.SET_SESSION_ID,
      payload: generateSessionId()
    });
  }, [dispatch]);

  const handleButtonClick = async () => {
    // validations - check empty messages
    if (messages.length <= 0 || (userMessage && typeof userMessage.value !== "undefined" && userMessage.value.length <= 0)) {
      console.log(`handleSubmit(): message is empty`);
      const newUserMessage = {
        value: '',
        isInvalid: true
      };
      setUserMessage(newUserMessage);
      return;
    }

    console.log(`handleSubmit(): message: ${userMessage.value}`);

    // add userMessage.value to app context under 'messages'
    dispatch({
      type: actions.MESSAGE_SENT,
      payload: userMessage.value
    });

    // dispatch api fetch in progress action (done to disable user controls)
    if (appConfig.APPSYNC_ENABLED) {
      dispatch({
        type: actions.GRAPHQL_QUERY_IN_PROGRESS
      });
    } else if (appConfig.WEBSOCKET_ENABLED) {
      dispatch({
        type: actions.WEBSOCKET_SEND_IN_PROGRESS
      });
    } else {

      dispatch({
        type: actions.API_FETCH_IN_PROGRESS
      });
    }

    // make the service call
    if (appConfig.APPSYNC_ENABLED) {
      // subscribe to mutations first
      graphqlUtils.subscribeToSendMessage(sessionId, dispatch);

      // now invoke query to trigger back-end workflow that calls mutations
      const result = await graphqlUtils.queryGetLlmResponse(appConfig.LOCALE, sessionId, userMessage.value, messages, dispatch);
      if (typeof result['errors'] !== "undefined" && result['errors'].length > 0) {
        console.log('queryGetLlmResponse() return errors');
      } else {
        console.log(`queryGetLlmResponse() result: ${JSON.stringify(result)}`);
      }

    } else if(appConfig.WEBSOCKET_ENABLED){
      // now invoke query to trigger back-end workflow that calls mutations
      const response = await websocketUtils.webSocketResponse(appConfig.LOCALE, sessionId, userMessage.value, messages, dispatch);
      if (typeof response['errors'] !== "undefined" && response['errors'].length > 0) {
        console.log('webSocketResponse() return errors');
      } else {
        console.log(`webSocketResponse() result: ${JSON.stringify(response)}`);
      }
    }
    else {
      const result = await doRestApiCall(appConfig.LOCALE, sessionId, userMessage, messages, dispatch);
      console.log(`doRestApiCall() result: ${JSON.stringify(result)}`);
    }

    // empty the input box
    setUserMessage({
      value: '',
      isInvalid: undefined
    });
  };

  const handleValueChange = (e) => {
    const userMessage = {
      value: e.target.value,
      isInvalid: undefined
    };
    setUserMessage(userMessage);
  };

  const handleInvalid = () => {
    if (typeof userMessage.isInvalid !== "undefined" && !userMessage.isInvalid) {
      console.log(`handleInvalid(): userMessage is invalid`);
      const newUserMessage = {
        value: userMessage.value,
        isInvalid: true
      };
      setUserMessage(newUserMessage);
      return true;
    }

    console.log(`handleInvalid(): userMessage is valid`);
    return false;
  };

  const handleKeyDown = (e) => {
    if(e.keyCode === 13) {
      handleButtonClick();
    }
  };

  return (
    <div className="user-input-container">
      <InputGroup className="user-input-group">
        <Button variant="outline-secondary" aria-label={searchIconLabel} disabled>
          <Search fill="currentColor"/>
        </Button>

        <Form.Control
          aria-label={placeHolderText}
          as="textarea"
          value={userMessage.value}
          placeholder={placeHolderText}
          onChange={handleValueChange}
          onKeyDown={handleKeyDown}
          disabled={api.inProgress}
          isInvalid={handleInvalid}/>

        <Button
          variant="outline-secondary"
          disabled={api.inProgress}
          onClick={handleButtonClick}>
          <Send fill="currentColor"/>
        </Button>
      </InputGroup>
    </div>
  );
};
