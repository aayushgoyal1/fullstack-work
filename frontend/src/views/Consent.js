import React from 'react';
import { giveConsent } from '../auth';
import config from '../config';
import { Button } from 'semantic-ui-react';
import { Centered } from '../components/Centered';

export function Consent(props) {
  return (
    <Centered>
      <h1>
        This web app allows you to upload videos or record yourself, and the
        videos will be stored and processed on{' '}
        {config.isProduction ? 'a UTD server' : 'this machine'}. Do you consent
        to this?
      </h1>
      <br />
      <Button
        onClick={() => {
          giveConsent(); // Sends the consent to the server
          if (props.onConsentGiven) {
            props.onConsentGiven();
          }
        }}
      >
        Yes, I consent
      </Button>
    </Centered>
  );
}
