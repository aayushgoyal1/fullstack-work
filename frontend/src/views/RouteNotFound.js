import React from 'react';
import config from '../config';

export function RouteNotFound(props) {
  if (config.isProduction) {
    return (
      <h2>Error 404: Page Not found. Check the URL you are trying to visit</h2>
    );
  } else {
    return (
      <div>
        <h1>404 Page Not Found. Check the URL.</h1>
        <p>
          If the URL is correct, then you need to set up a route. Go to{' '}
          <code>frontend/src/Routes.js</code> and search for{' '}
          <code>PUT ROUTES HERE</code>
        </p>
        <p>
          You'll see <code>PUT ROUTES HERE</code> in two places. The first place
          is where you put the route if it's for anyone, even someone who isn't
          logged in. The second is for routes that are only for logged in users.
        </p>
      </div>
    );
  }
}
