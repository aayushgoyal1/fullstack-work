import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import '../../css/index.css';

export class FileUpload extends Component {
  state = { selectedFile: null };

  async checkFile(fileName, size) {
    if (!fileName) {
      throw new Error('File name is empty!');
    }
    let acceptedFormats = await fetch('/api/format/list');
    acceptedFormats = await acceptedFormats.json();
    let dots = fileName.split('.');
    // Parse file extension
    let fileType = dots[dots.length - 1].toLowerCase();

    if (!acceptedFormats.includes(fileType)) {
      throw new Error(
        'Incompatible Format. Please upload files that end in types: \n' +
          acceptedFormats.join(', ')
      );
    }
    let freeSpace = await fetch('/api/usage');
    freeSpace = +(await freeSpace.json());
    if (size * 2 > freeSpace) {
      throw new Error('Error: File Size is Too Large. Please try again.');
    }
  }

  // Update the state with new file
  handleSelectFile = event => {
    this.setState({
      selectedFile: event.target.files[0]
    });
  };

  // To upload
  handleUploadFile = async () => {
    try {
      await this.checkFile(
        this.state.selectedFile.name,
        this.state.selectedFile.size
      );
      // create a new form data
      const fd = new FormData();
      // append attributes to form data
      fd.append('video', this.state.selectedFile, this.state.selectedFile.name);
      // make a post request (to upload the video to a sever)
      let response = await fetch(this.props.url, { method: 'POST', body: fd });
      response = await response.json();
      // Notify the parent component that the upload succeeded
      this.props.onSuccess(response);
    } catch (err) {
      // Notify the parent component that the upload failed
      this.props.onFailure(err);
    }
  };

  render() {
    // Input that accepts only video files and upload button that uploads
    return (
      <div>
        <input type="file" onChange={this.handleSelectFile} />
        <Button onClick={this.handleUploadFile}>upload</Button>
      </div>
    );
  }
}

FileUpload.propTypes = {
  url: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func.isRequired
};
