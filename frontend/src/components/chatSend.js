import React, { Component } from 'react';
var Filter = require('bad-words');
var filter = new Filter();

// Create a ChatSend component which will display incoming and outgoing messages
export class ChatSend extends Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  handleSubmit = event => {
    // Submit the message as long as it isn't empty
    if (this.state.value !== '') {
      // Filter out any bad words if there are any
      var cleaned = filter.clean(this.state.value);
      this.props.send(cleaned);
    }
    this.setState({ value: '' });
    event.preventDefault();
  };

  render() {
    // Simple input
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            value={this.state.value}
            onChange={event => this.setState({ value: event.target.value })}
            autoFocus={true}
          />
          <input type="submit" value="Send" />
        </form>
      </div>
    );
  }
}
