import React, { Component } from 'react';
import { GroupList } from './GroupList';
import { Switch, Route } from 'react-router-dom';
import { RouteNotFound } from './RouteNotFound';

export class Home extends Component {
  render() {
    return (
      <Switch>
        <Route
          path="/"
          exact
          render={props => (
            <div className="home-page">
              {/* This is where the actual home page is. The rest is just for 404s. */}
              <GroupList {...props} />
            </div>
          )}
        />
        <Route component={RouteNotFound} />
      </Switch>
    );
  }
}
