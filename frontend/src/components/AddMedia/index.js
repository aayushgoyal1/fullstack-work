import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FileUpload } from './FileUpload';
import { Record } from './Record';
import { sessionCookie, userID } from '../../auth.js';
import { Divider, Form, Dropdown } from 'semantic-ui-react';
import '../../css/index.css';

export class AddMedia extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupID: props.prepopulate.groupID,
      projectID: props.prepopulate.projectID,
      lectureID: props.prepopulate.lectureID,
      dropdownOptions: {
        groups: [],
        projects: [],
        lectures: []
      }
    };
  }

  componentDidMount = async () => {
    let groups = await fetch('/api/groups');
    groups = await groups.json();
    this.setState({
      dropdownOptions: {
        groups: groups.map(convertToDropdownOptions),
        projects: this.state.dropdownOptions.projects,
        lectures: this.state.dropdownOptions.lectures
      }
    });
    const { projectID, lectureID } = this.state;
    await this.refreshProjects();
    if (projectID) {
      this.setState({ projectID });
      await this.refreshLectures();
      if (lectureID) {
        this.setState({ lectureID });
      }
    }
  };

  refreshProjects = async () => {
    let projects = await fetch('/api/projects/' + this.state.groupID);
    projects = await projects.json();
    this.setState({
      dropdownOptions: {
        groups: this.state.dropdownOptions.groups,
        projects: projects.map(convertToDropdownOptions),
        lectures: []
      },
      projectID: undefined,
      lectureID: undefined // Lectures can't be chosen before projects!
    });
  };

  refreshLectures = async () => {
    let lectures = await fetch('/api/lectures/project/' + this.state.projectID);
    lectures = await lectures.json();
    this.setState({
      dropdownOptions: {
        groups: this.state.dropdownOptions.groups,
        projects: this.state.dropdownOptions.projects,
        lectures: lectures.map(convertToDropdownOptions)
      },
      lectureID: undefined
    });
  };

  onSuccess = recordingID => {
    // TODO: add visual indicator of success
    if (this.props.onSuccess) {
      this.props.onSuccess(recordingID);
    }
  };
  onFailure = err => {
    // TODO: add visual indicator of failure
    if (this.props.onFailure) {
      this.props.onFailure(err);
    }
  };

  render() {
    let controls;
    if (this.props.controls) {
      controls = (
        <Form>
          <Form.Field>
            <Dropdown
              placeholder="Group"
              search
              selection
              options={this.state.dropdownOptions.groups}
              value={this.state.groupID}
              onChange={(e, { value }) => {
                this.setState({ groupID: value });
                this.refreshProjects();
              }}
            />
          </Form.Field>
          <Form.Field>
            <Dropdown
              placeholder="Choose a Project (optional)"
              search
              selection
              options={this.state.dropdownOptions.projects}
              value={this.state.projectID}
              onChange={(e, { value }) => this.setState({ projectID: value })}
            />
          </Form.Field>
          <Form.Field>
            <Dropdown
              placeholder="Choose a Lecture (optional)"
              search
              selection
              options={this.state.dropdownOptions.lectures}
              value={this.state.lectureID}
              onChange={(e, { value }) => this.setState({ lectureID: value })}
            />
          </Form.Field>
        </Form>
      );
    }

    let url;
    if (this.state.groupID) {
      url =
        '/api/video/' + userID + '/' + sessionCookie + '/' + this.state.groupID;
      if (this.state.projectID) {
        url += '/' + this.state.projectID;
        if (this.state.lectureID) {
          url += '/' + this.state.lectureID;
        }
      }
    }
    return (
      <div>
        {controls}
        <Divider />
        <FileUpload
          url={url}
          onSuccess={this.onSuccess}
          onFailure={this.onFailure}
        />
        <Divider />
        <Record
          url={url + '/'}
          appendExtension
          beforeRecording={
            this.props.beforeRecording ||
            (() => new Promise(resolve => resolve()))
          }
          onSuccess={([firstResponse]) => this.onSuccess(firstResponse)}
          onFailure={this.onFailure}
        />
      </div>
    );
  }
}

AddMedia.propTypes = {
  // These are defaults for fields that will be sent to the server to describe the video recorded.
  // Users can override these fields if controls is set to true.
  prepopulate: PropTypes.shape({
    groupID: PropTypes.string,
    projectID: PropTypes.string,
    lectureID: PropTypes.string
  }).isRequired,

  // If true, then a form with inputs for the group and stuff like that will be shown
  controls: PropTypes.bool,

  beforeRecording: PropTypes.func,
  onSuccess: PropTypes.func,
  onFailure: PropTypes.func
};

// Given an array from MongoDB, turn it into dropdown options
function convertToDropdownOptions({ _id, name }) {
  return {
    key: _id,
    text: name,
    value: _id
  };
}
