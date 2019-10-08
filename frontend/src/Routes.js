import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Home } from './views/Home';
import { ProjectDetail } from './views/ProjectDetail';
import { GroupDetail } from './views/GroupDetail';
import { LectureDetail } from './views/LectureDetail';
import { VideoDetail } from './views/VideoDetail';
import { Login } from './views/Login';
import { Consent } from './views/Consent';
import { isLoggedIn, initialLoginPromise, consented } from './auth.js';

export class Routes extends Component {
  state = { ready: false };

  componentDidMount = async () => {
    await initialLoginPromise;
    this.setState({ ready: true });
  };

  // PUT ROUTES HERE if you want them to be accessible by anyone, even if they are not logged in
  notLoggedInRoutes = {
    '/login': Login
  };

  // PUT ROUTES HERE if you want them to be accessible ONLY BY LOGGED IN USERS
  loggedInRoutes = {
    '/group/:groupID': {
      '': GroupDetail,
      '/video/:videoID': VideoDetail,
      '/project/:projectID': {
        '': ProjectDetail,
        '/video/:videoID': VideoDetail,
        '/lecture/:lectureID': {
          '': LectureDetail,
          '/video/:videoID': VideoDetail
        }
      }
    },
    '/aggregate-report': {
      '/group/:groupID': VideoDetail,
      '/project/:projectID': VideoDetail,
      '/lecture/:lectureID': VideoDetail
    },
    '/': Home
  };

  render() {
    if (!this.state.ready) return <div />;
    else if (!consented && isLoggedIn) {
      return (
        <Consent
          onConsentGiven={() =>
            this.setState({
              /* Refresh */
            })
          }
        />
      );
    } else {
      return (
        <div>
          <Switch>
            {nestedRoutes(this.notLoggedInRoutes)}

            {/* This route is for everything else. It redirects to the login page if you aren't logged in. */}
            <Route
              render={props => {
                if (!isLoggedIn) {
                  return (
                    <Redirect
                      to={{
                        pathname: '/login',
                        state: { from: props.location }
                      }}
                    />
                  );
                } else {
                  return (
                    <div>
                      <Navigation />
                      <Switch>{nestedRoutes(this.loggedInRoutes)}</Switch>
                    </div>
                  );
                }
              }}
            />
            {/* Don't add any routes here! They won't be executed because the previous route matches everything */}
          </Switch>
        </div>
      );
    }
  }
}

export function nestedRoutes(routes, path_prefix = '') {
  let routesToShow = [];
  let routePaths = Object.keys(routes).sort((a, b) => b.length - a.length); // Most specific paths first
  for (const routePath of routePaths) {
    let Component = routes[routePath];
    // If Component is a function/class, then add its route. Else, recurse
    if (typeof Component === 'function') {
      routesToShow.push(
        <Route
          key={path_prefix + routePath}
          path={path_prefix + routePath}
          render={props => <Component {...props} exact />}
        />
      );
    } else {
      routesToShow = routesToShow.concat(
        nestedRoutes(routes[routePath], path_prefix + routePath)
      );
    }
  }
  return routesToShow;
}
