// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { getChatHistory } from './chatUtils';
import { actions } from '../reducers/actions';
import { en_US, fr_CA } from '../translations/common';
import config from "../config";

const appConfig = config;

let chatbotErrorMessage = en_US['chatbot.error.message'];
let apiErrorResponse = en_US['api.error.response'];
if (appConfig.LOCALE === "fr_CA") {
  chatbotErrorMessage = fr_CA['chatbot.error.message'];
  apiErrorResponse = fr_CA['api.error.response'];
}

export function doPost(endpoint, data) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (config.API_KEY && config.API_KEY.length > 0) {
    headers['x-api-key'] = config.API_KEY;
  }

  const params = {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    headers: headers,
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data),
  };

  return new Promise((resolve, reject) => {
    fetch(endpoint, params)
    .then((response) => {
      if (response.ok) {
        return response;
      }
      // return response.json().then(res => reject(res)); // read the json error and then reject
      response.json().then(res => {
        console.log(`restApiUtils.doPost() response.json() error: ${JSON.stringify(res)}`);
        // throw new Error(res); // read the json error and then reject
        reject(res);
      });
    })
    .then((response) => {
      if (response) {
        console.log(`restApiUtils.doPost() response: ${JSON.stringify(response)}`);
        response.json().then(res => resolve(res)); // read the json body and then resolve
      }
    })
    .catch((err) => {
      console.log(`restApiUtils.doPost() error: ${JSON.stringify(err)}`);
      reject(err);
    });
  });
}

export function doGet(endpoint) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (config.API_KEY && config.API_KEY.length > 0) {
    headers['x-api-key'] = config.API_KEY;
  }

  const params = {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    headers: headers,
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  };

  return new Promise((resolve, reject) => {
    fetch(endpoint, params)
    .then((response) => {
      if (response.ok) {
        return response;
      }
      // return response.json().then(res => reject(res)); // read the json error and then reject
      response.json().then(res => {
        console.log(`restApiUtils.doGet() response.json() error: ${JSON.stringify(res)}`);
        // throw new Error(res); // read the json error and then reject
        reject(res);
      });
    })
    .then((response) => {
      console.log(`restApiUtils.doGet() response: ${JSON.stringify(response)}`);
      response.json().then(res => resolve(res)); // read the json body and then resolve
    })
    .catch((err) => {
      console.log(`restApiUtils.doGet() error: ${JSON.stringify(err)}`);
      reject(err);
    });
  });
}


export function getApiResponse(locale, sessionId, userMessage, messages) {
  // call api , POST /chat with following JSON body
  // {
  //   "session_id": "abcd-efgh-1234",
  //   "message": "user's text or query",
  //   "locale" "en_US", # "en_US" or "fr_CA" are only supported
  //   "history": [
  //     {
  //       "input": "user's text or query"
  //     },
  //     {
  //       "output": "chat bot response"
  //     }
  //   ]
  // }
  const url = appConfig.API_ENDPOINT + '/chat_lex';
  const payload = {
    "session_id": sessionId,
    "message": userMessage.value,
    "locale": locale,
    // only send chat history when appConfig.CONVERSATION_HISTORY_ENABLED is true
    "history": appConfig.CONVERSATION_HISTORY_ENABLED ? getChatHistory(messages) : []
  };

  return new Promise((resolve, reject) => {
    doPost(url, payload)
      .then(response => resolve(response))
      .catch(error => reject(error));
  });
}

export function doRestApiCall(locale, sessionId, userMessage, messages, dispatch) {
  return new Promise((resolve, _) => {
    getApiResponse(locale, sessionId, userMessage, messages)
      .then(result => {
        // check if result contains messages array
        if (result && Array.isArray(result['messages']) && result['messages'].length > 0) {
          result['messages'].map(message => {
            // if message match apiErrorResponse, dispatch error action
            if (String(message['content']).toLowerCase().includes(apiErrorResponse.toLowerCase())) {
              dispatch({
                type: actions.MESSAGE_RECEIVED_ERROR,
                payload: message['content']
              });
            }
            // otherwise, dispatch message received action
            else {
              dispatch({
                type: actions.MESSAGE_RECEIVED,
                payload: message['content']
              });
            }
          });
          // dispatch api fetch success action
          dispatch({
            type: actions.API_FETCH_SUCCESS,
            message: result.response,
            statusCode: 200
          });
        }
        // otherwise dispatch error action
        else {
          const errorMessage = 'API responded successfully but did not return any messages';
          dispatch({
            type: actions.API_FETCH_FAILURE,
            message: JSON.stringify(errorMessage),
            statusCode: 400
          });

          // show an error message to user
          dispatch({
            type: actions.MESSAGE_RECEIVED_ERROR,
            payload: chatbotErrorMessage
          });
        }
      })
      .catch(error => {
        console.log(`error response received: ${JSON.stringify(error)}`);
        // dispatch error action
        dispatch({
          type: actions.API_FETCH_FAILURE,
          message: JSON.stringify(error),
          statusCode: 400
        });

        // show an error message to user
        dispatch({
          type: actions.MESSAGE_RECEIVED_ERROR,
          payload: chatbotErrorMessage
        });
        resolve(error);
      });
    });
}
