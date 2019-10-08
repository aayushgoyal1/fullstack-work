import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { saml, isLoggedIn } from '../auth.js';
import Logo from '../images/1logoMSP.png';
import { Input, Button, Form } from 'semantic-ui-react';

export class Login extends Component {
  state = {
    // Redirect away from the login page if they're already logged in or if SAML is enabled
    redirectNow: isLoggedIn,
    username: ''
  };

  login = async event => {
    // Prevent the default browser action for the submit button
    event.preventDefault();

    // TODO: use try-catch, and show errors visually
    await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.state.username,
        password: 'this must be set for passport-local'
      })
    });
    let { from } = this.props.location.state || { from: { pathname: '/' } };
    window.location.href = from.pathname;
  };

  render() {
    if (saml) {
      window.location = '/api/login';
      return <div />;
    } else if (this.state.redirectNow) {
      // This is where the user came from. We should redirect them to this path once they log in
      // Get this from the location state, or if that's empty, assume they came from the home page
      let { from } = this.props.location.state || { from: { pathname: '/' } };
      return <Redirect to={from} />;
    } else {
      return (
        <div className="login-page">
          <img
            className="main-logo"
            src={Logo}
            alt="UTDallas Multimodal Signal Processing Laboratory logo"
          />
          <Form className="login-form" onSubmit={this.login}>
            <Form.Field>
              <label>Please enter your USERNAME</label>
              <Input
                required
                type="text"
                placeholder="Enter username here"
                value={this.state.username}
                onChange={event =>
                  this.setState({ username: event.target.value })
                }
              />
            </Form.Field>
            <Button type="submit">Submit</Button>
          </Form>
        </div>
      );
    }
  }
}
