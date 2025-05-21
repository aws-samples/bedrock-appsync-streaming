// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// eslint-disable-next-line no-unused-vars
import React, { createContext, useContext, useReducer } from 'react';
import { PropTypes } from 'prop-types';
import { rootReducer  } from '../reducers/rootReducer';

import { en_US, fr_CA } from '../translations/common';
import { getMessageTime } from '../utils/timeUtils';
import config  from '../config';

let welcomeMessages = config.DEMO_MODE ? en_US['welcome.messages.demo'] : en_US['welcome.messages'];
if (config.LOCALE === "fr_CA") {
  welcomeMessages = config.DEMO_MODE ? fr_CA['welcome.messages.demo'] : fr_CA['welcome.messages'] ;
}

const initialState =  {
  api: {
    statusCode: 0,
    message: '',
    inProgress: false
  },
  isLoggedIn: false,
  sessionId: '',
  messages: [],
};

welcomeMessages.forEach(message => {
  initialState.messages.push({messageReceived: message, messageTimestamp: getMessageTime()});
});


const AppContext = createContext({state: initialState, dispatch: () => {}});

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  return (
    <AppContext.Provider value={{state, dispatch}}>
      {children}
    </AppContext.Provider>
  );
};
// add props validation for AppContext children
AppProvider.propTypes = {
  children: PropTypes.node,
};

// create useApp hook to use AppContext
const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useConfig must be used within a AppProvider');
  }

  return context;
};

// create useAppDispatch hook to use AppContext
const useAppDispatch = () => {
  const { dispatch } = useApp();
  return dispatch;
};

// create useAppState hook to use AppContext
const useAppState = () => {
  const { state } = useApp();
  return state;
};

export { AppContext, AppProvider, useApp, useAppState, useAppDispatch };
