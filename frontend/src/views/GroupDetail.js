import React, { Component } from 'react';
import { JSONList } from '../components/JSONList';
import { AddMedia } from '../components/AddMedia';
import { Grid, Segment } from 'semantic-ui-react';
import '../css/index.css';

// If you want the loading icon and alerts, use this:
// import { Button } from 'semantic-ui-react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

export class GroupDetail extends Component {
  recordingsListRef = React.createRef();

  render = () => {
    let { groupID } = this.props.match.params;

    // If you want to try the loading icon or alert message, use this code:
    // let loadIcon, isCreating = true
    // if (isCreating) {
    //   loadIcon = (
    //     <div
    //       style={{
    //         marginLeft: '10px',
    //         marginBottom: '5px'
    //       }}
    //       className="ui active tiny inline loader"
    //     />
    //   );
    // } else {
    //   loadIcon = <div class="ui disabled loader" />;
    // }
    //
    // In the JSX, use something like this:
    //         <Button
    //           onClick={() => {
    //             toast.success('Hello');
    //             isCreating = true;
    //             this.forceUpdate();
    //           }}
    //         >
    //           Toaster Button
    //         </Button>
    //         {loadIcon}
    //         <ToastContainer />

    return (
      <div className="group-detail-page">
        <Grid stackable columns={1}>
          <Grid.Column>
            <Segment className="segment-projects">
              <u>
                <h2>Projects:</h2>
              </u>
              <JSONList
                api={`/api/projects/${groupID}`}
                onClick={{
                  history: this.props.history,
                  url: `${this.props.match.url}/project/`
                }}
                secondaryIcon={'pie chart'}
                onSecondaryClick={{
                  history: this.props.history,
                  url: '/aggregate-report/project/'
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
                api={`/api/videos/group/${groupID}`}
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
                prepopulate={{ groupID }}
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
