import React, { Component } from 'react';
import config from '../../config';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

export class Record extends Component {
  state = { responses: [], recorder: undefined };
  previewRef = React.createRef();

  componentWillUnmount() {
    if (this.state.recorder) {
      this.stopRecording();
    }
  }

  render() {
    // Don't render if this browser doesn't support the MediaRecorder API
    if (typeof window.MediaRecorder === 'undefined') {
      return <div />;
    }
    return (
      <div>
        {this.state.recorder ? (
          <p
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              margin: 'auto',
              height: '100px',
              width: '200px',
              lineHeight: '100px',
              textAlign: 'center',
              border: '1px dashed #333',
              background: 'rgba(255, 0, 0, .7)',
              borderRadius: '25px',
              fontWeight: 'bold',
              fontSize: '20px'
            }}
          >
            RECORDING
          </p>
        ) : null}
        <Button
          onClick={
            this.state.recorder ? this.stopRecording : this.startRecording
          }
        >
          {this.state.recorder ? 'Stop Recording' : 'Record yourself'}
        </Button>
        <video
          autoPlay
          muted
          ref={this.previewRef}
          style={{
            width: '50vw',
            height: '50vh',
            display: this.state.recorder ? 'block' : 'none'
          }}
        />
      </div>
    );
  }

  record = async stream => {
    // The video should be matroska (mkv) or webm - use whatever the browser supports
    let videoMIME = 'video/x-matroska';
    let videoExtension = 'mkv';
    if (MediaRecorder.isTypeSupported('video/webm')) {
      videoMIME = 'video/webm';
      videoExtension = 'webm';
    }

    // If the URL starts with /, then we need to prefix it (e.g. by ws://localhost:3000 or by wss://utdnec.app)
    let prefix = '';
    if (this.props.url[0] === '/') {
      prefix = window.location.origin.replace(/^http/, 'ws');
    }
    // If appendExtension is true, then append the extension to the end of the URL
    let suffix = this.props.appendExtension ? videoExtension : '';
    // Now connect
    let socket = new WebSocket(prefix + this.props.url + suffix);
    socket.onerror = event => {
      console.error('WebSocket error:', event);
      alert('There was an issue connecting with the server, try refreshing');
    };
    socket.onclose = event => {
      console.log('WebSocket closed:', event);
    };
    // Store the responses the server sends
    socket.onmessage = event => {
      this.setState(state => {
        state.responses.push(JSON.parse(event.data));
        return state;
      });
    };
    let buffered = []; // This is data that hasn't been sent over the socket yet
    let recorder = new MediaRecorder(stream, {
      mimeType: videoMIME,
      audioBitsPerSecond: 1000000,
      videoBitsPerSecond: 8000000
    });
    this.setState({ recorder });
    recorder.ondataavailable = event => {
      // If the socket is open, send the data
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(event.data);
      } else if (socket.readyState === WebSocket.CONNECTING) {
        // Socket isn't open, so buffer this data and send it later
        buffered.push(event.data);
      } else {
        // The socket isn't even trying to connect!
        this.stopRecording();
        this.onFailure(new Error('Not connected to server! Cannot send video'));
      }
    };
    recorder.start();
    setInterval(() => {
      if (recorder.state === 'recording') {
        recorder.requestData();
      }
    }, config.intervalToSendVideo);

    return new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = event => {
        reject(event.name);
      };
    });
  };
  startRecording = async () => {
    const [stream] = await Promise.all([
      navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 4096 },
          height: { ideal: 2160 }
        },
        audio: true
      }),
      this.props.beforeRecording()
    ]);

    const preview = this.previewRef.current;
    this.videoStream = preview.srcObject = stream;
    preview.captureStream = preview.captureStream || preview.mozCaptureStream;
    this.record(preview.captureStream());
  };
  stopRecording = () => {
    if (this.state.recorder) {
      this.state.recorder.stop();
      this.videoStream.getTracks().forEach(track => track.stop());
      this.setState({ recorder: undefined });
      this.props.onSuccess(this.state.responses);
    }
  };
}

Record.propTypes = {
  appendExtension: PropTypes.bool,
  url: PropTypes.string.isRequired, // The URL we use to connect to the server
  beforeRecording: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func.isRequired
};
