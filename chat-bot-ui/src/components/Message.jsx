// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// eslint-disable-next-line no-unused-vars
import React from "react";
import { PropTypes } from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppState } from '../contexts/AppContext';

// icon svgs are available from: https://icon-sets.iconify.design/ic/
import GenAIRobot from "../image/sharp-psychology.svg";
import Person from "../image/round-person.svg";

import { getMessageTime } from '../utils/timeUtils';
import config  from '../config';

import "./Message.css";



export const MessageReceive = (props) => {
  const { api } = useAppState();
  const message = props.message ? props.message : "no message";
  const timestamp = props.timestamp ? props.timestamp : getMessageTime();
  const displayName = props.displayName ? props.displayName : "GenAI";
  // console.log(`message received: ${message} timestamp: ${timestamp} displayName: ${displayName} `);
  return (
    <div className="message-receive-row">
      {/* <Avatar sx={{ bgcolor: deepOrange[500] }}  alt={displayName} className="avatar"></Avatar> */}
      <div className="image-container">
        <GenAIRobot/>
      </div>

      <div className="receive-content">
        <div className="receive-content-header">
          <div className="display-name">{displayName}</div>
          <div className="timestamp">{timestamp}</div>
        </div>
        <span className="receive-message">
          <ReactMarkdown className={api.inProgress ? "cursor" : undefined}
            remarkPlugins={[remarkGfm]}>{message}
          </ReactMarkdown>
        </span>
      </div>
    </div>
  );
};
MessageReceive.propTypes = {
  message: PropTypes.string,
  timestamp: PropTypes.string,
  displayName: PropTypes.string,
};

export const MessagePending = () => {
  // console.log(`message pending: ${message} timestamp: ${timestamp} displayName: ${displayName} `);
  return (
    <div className="message-pending-row">
      <div className="image-container">
        <GenAIRobot/>
      </div>

      <div className="pending-content">
        {config.DEMO_MODE
          ? <div className="dot-flashing-demo"></div>
          : <div className="dot-flashing"></div>
        }
      </div>
    </div>
  );
};


export const MessageSent = (props) => {
  const message = props.message ? props.message : "no message";
  const timestamp = props.timestamp ? props.timestamp : getMessageTime();
  const displayName = props.displayName ? props.displayName : "";
  // console.log(`message sent: ${message} timestamp: ${timestamp} displayName: ${displayName} `);
  return (
    <div className="message-send-row">
      <div className="send-content">
        <div className="send-content-header">
          <div className="display-name">{displayName}</div>
          <div className="timestamp">{timestamp}</div>
        </div>
        <p className="send-message">{message}</p>
      </div>
      {/* <Avatar sx={{ bgcolor: grey[500] }} alt={displayName} className="avatar"> */}
      <div className="image-container">
        <Person />
      </div>

    </div>
  );
};
MessageSent.propTypes = {
  message: PropTypes.string,
  timestamp: PropTypes.string,
  displayName: PropTypes.string,
};
