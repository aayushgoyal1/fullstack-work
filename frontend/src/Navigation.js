import React from 'react';
import './css/index.css';
import { Button } from 'semantic-ui-react';
import {username} from './auth.js';

export function Navigation(props) {
  return (
    <nav className="nav-bar">
    <div className="nav-bar-username">
    Welcome, {username}
    </div>
      <Button href="/">Home</Button>
      <Button href="/logout">Logout</Button>
    </nav>
  );
}
