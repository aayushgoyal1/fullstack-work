import React, { Component } from 'react';
import { JSONList } from '../components/JSONList';

export class GroupList extends Component {
  render = () => {
    return (
      <div className="groups-section">
        <h2>Groups:</h2>
        <JSONList
          api={'/api/groups'}
          onClick={{ history: this.props.history, url: '/group/' }}
          secondaryIcon={'pie chart'}
          onSecondaryClick={{
            history: this.props.history,
            url: '/aggregate-report/group/'
          }}
        />
      </div>
    );
  };
}
