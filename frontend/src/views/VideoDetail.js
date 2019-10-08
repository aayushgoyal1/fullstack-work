import React, { Component } from 'react';
import { TimeSlice } from '../components/TimeSlice';
import { PieChart } from '../components/PieChart';
import { Centered } from '../components/Centered';
import '../css/index.css';

export class VideoDetail extends Component {
  state = { report: false, error: false };

  componentDidMount = async () => {
    let url = '/api/report/';
    if (this.props.match.params.videoID) {
      url += 'video/' + this.props.match.params.videoID;
    } else if (this.props.match.params.lectureID) {
      url += 'lecture/' + this.props.match.params.lectureID;
    } else if (this.props.match.params.projectID) {
      url += 'project/' + this.props.match.params.projectID;
    } else if (this.props.match.params.groupID) {
      url += 'group/' + this.props.match.params.groupID;
    }
    try {
      let report = await fetch(url);
      report = await report.json();
      if (report.error) {
        this.setState({ report: false, error: report.error });
      } else {
        this.setState({ report, error: false });
      }
    } catch (error) {
      this.setState({ report: false, error });
    }
  };

  render = () => {
    if (this.state.error) {
      return (
        <Centered>
          <h1>{this.state.error}</h1>
          <p>
            Videos take seconds for their initial analysis to be available. A
            lecture cannot be analyzed unless it has videos that have been
            analyzed. If you try to analyze a project, you will only see
            analyses for videos recorded under that project, but not under any
            specific lecture. Similarly, if you try to analyze a group, you will
            only see analyses of videos recorded for that group, but not videos
            recorded for projects or lectures within that group
          </p>
        </Centered>
      );
    } else if (!this.state.report) {
      // TODO: put loading icon here
      return <div />;
    }
    return (
      <div>
        <div className="pie-chart">
          <PieChart {...this.state.report} />
        </div>
        <div className="time-slice">
          <TimeSlice {...this.state.report} />
        </div>
      </div>
    );
  };
}
