import React, { Component } from 'react';
import { JSONList } from '../components/JSONList';
import { AddMedia } from '../components/AddMedia';
import { Grid, Segment } from 'semantic-ui-react';
import '../css/index.css';

export class ProjectDetail extends Component {
  recordingsListRef = React.createRef();

  render = () => {
    let { groupID, projectID } = this.props.match.params;
    return (
      <div className="group-detail-page">
        <Grid stackable columns={1}>
          <Grid.Column>
            <Segment className="segment-projects">
              <u>
                <h2>Lectures:</h2>
              </u>
              <JSONList
                api={`/api/lectures/project/${projectID}`}
                onClick={{
                  history: this.props.history,
                  url: `${this.props.match.url}/lecture/`
                }}
                secondaryIcon={'pie chart'}
                onSecondaryClick={{
                  history: this.props.history,
                  url: '/aggregate-report/lecture/'
                }}
              />
            </Segment>
          </Grid.Column>
          <Grid.Column>
            <Segment className="segment-recordings">
              <u>
                <h2>Recordings:</h2>
              </u>
              <JSONList
                ref={this.recordingsListRef}
                api={`/api/videos/project/${projectID}`}
                onClick={{
                  history: this.props.history,
                  url: `${this.props.match.url}/video/`
                }}
              />
            </Segment>
          </Grid.Column>
          <Grid.Column>
            <Segment className="segment-addmedia">
              <u>
                <h2>Add Media:</h2>
              </u>
              <AddMedia
                controls
                prepopulate={{ groupID, projectID }}
                onSuccess={() =>
                  this.recordingsListRef.current.componentDidMount()
                }
              />
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  };
}
