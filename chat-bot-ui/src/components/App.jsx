// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef } from "react";

// react-bootstrap v2.8+
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// react-bootstrap 0.33.1
// import { Container } from "react-bootstrap/lib/TabContainer";
// import { Col } from "react-bootstrap/lib/Col";
// import { Row } from "react-bootstrap/lib/Row";

import { MessagePending, MessageReceive, MessageSent } from "./Message";
import { UserInput } from "./UserInput";
import { useAppState } from '../contexts/AppContext';

import config from "../config";

import "./App.css";


function App() {
  const { messages } = useAppState();
  const scrollToRef = useRef(null);

  useEffect(
    // implementation function
    () => {
      console.log('App useEffect() scrolling');
      scrollToRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    },
    // list of dependencies - these are generally references inside the useEffect function
    // if messages is different from the previous render, then we wil execute
    [messages]
  );

  return (
    <Container className="app shadow">
      { /* TODO - bootstrap 3.x fix.  Added shadow class */ }
      <Row className="message-body">
        <Col>
          {/* <Container> */}
              {messages.map((message, index) => {
                if (message.messageReceived) {
                  return (
                    <div key={`c-${index}`}>
                      <MessageReceive
                        key={`mr-${index}`}
                        message={message.messageReceived}
                        timestamp={message.messageTimestamp}
                        displayName={config.CHAT_BOT_NAME}
                      />
                    </div>
                  );
                } else if (message.messageSent) {
                  return (
                    <div key={`c-${index}`} >
                      <MessageSent
                        key={`ms-${index}`}
                        message={message.messageSent}
                        timestamp={message.messageTimestamp}
                      />
                    </div>
                  );
                } else if (message.messagePending) {
                  return (
                    <div key={`c-${index}`} >
                      <MessagePending key={`ms-${index}`}/>
                    </div>
                  );
                }
              })
            }
            <div ref={scrollToRef} />
          {/* </Container> */}
        </Col>
      </Row>
      <Row>
        <Col>
          <UserInput></UserInput>
        </Col>
      </Row>
    </Container>
  );
}

export { App };
