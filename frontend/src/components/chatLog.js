import React, { Component } from 'react';

// Chatlog component which will display incoming and outgoing messages
export class ChatLog extends Component {
  render() {
    // If there are no messages, then display message
    if (this.props.history.length === 0) {
      return (
        <div>
          <p>
            You just joined, and you'll only see new messages. Wait for people
            to send them!
          </p>
        </div>
      );
    } else {
      // Otherwise, map through the history prop (passed from backend --> App.js --> here)
      return (
        <ol>
          {this.props.history.map(({ timestamp, from, message }, id) => (
            <li key={id}>
              <small style={{ color: 'grey' }}>
                {from} at {timestamp}:{' '}
              </small>
              {message}
            </li>
          ))}
        </ol>
      );
    }
  }
}
