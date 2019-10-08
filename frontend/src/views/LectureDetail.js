import React, { Component } from 'react';
import { JSONList } from '../components/JSONList';
import { AddMedia } from '../components/AddMedia';
import '../css/index.css';

export class LectureDetail extends Component {
  videoRef = React.createRef();
  recordingsListRef = React.createRef();

  render = () => {
    let { groupID, projectID, lectureID } = this.props.match.params;
    return (
      <div class="lecture-detail">
        <div class="video-player">
          <video controls ref={this.videoRef}>
            <source src={`/api/lecture/${lectureID}`} />
          </video>
        </div>
        <h2>Recordings:</h2>
        <JSONList
          ref={this.recordingsListRef}
          api={`/api/videos/lecture/${lectureID}`}
          onClick={{
            history: this.props.history,
            url: `/group/${groupID}/project/${projectID}/lecture/${lectureID}/video/`
          }}
        />
        <AddMedia
          prepopulate={{ groupID, projectID, lectureID }}
          beforeRecording={() => this.videoRef.current.play()}
          onFailure={() => this.videoRef.current.pause()}
          onSuccess={() => {
            this.videoRef.current.pause();
            this.recordingsListRef.current.componentDidMount();
          }}
        />
      </div>
    );
  };
}
