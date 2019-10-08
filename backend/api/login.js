const { readFileSync, existsSync } = require('fs');
const { promisify } = require('util');
const randomBytes = promisify(require('crypto').randomBytes);
const { createHash } = require('crypto');
const passport = require('passport');

let samlMetadata = '';

if (config.SAML) {
  const SamlStrategy = require('passport-saml').Strategy;
  const ss = new SamlStrategy(
    {
      callbackUrl: config.SAML.entityID,
      entryPoint: 'https://idp.utdallas.edu/idp/profile/SAML2/Redirect/SSO',
      issuer: 'https://utdnec.app',
      privateCert: readFileSync(config.SAML.sign.privateKey, 'utf-8'),
      decryptionPvk: readFileSync(config.SAML.encrypt.privateKey, 'utf-8'),
      identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
      // This is the cert from https://idp.utdallas.edu/idp/shibboleth - do NOT change it unless you absolutely must. Check with identityprovider@utdallas.edu
      cert:
        'MIIDLDCCAhSgAwIBAgIVAKxr332EVudjRIrBOrqMFIPg2iBHMA0GCSqGSIb3DQEBBQUAMBsxGTAXBgNVBAMTEGlkcC51dGRhbGxhcy5lZHUwHhcNMTAwNjA3MjA1NDQ1WhcNMzAwNjA3MjA1NDQ1WjAbMRkwFwYDVQQDExBpZHAudXRkYWxsYXMuZWR1MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoN7NLFiI35At7nZDk5hSXOYPI3PU8mlFpsOY4xeSr97ZoIEs2T8eyUIHJEN+XmWrpFeyBRWp5sYoSCUJcqMUTyXIDjwriDKvpYumdqk1tDTTXCA7jdC9uaMpXERXMuknOJrBSeMr+sN+R1YSD+YR/DwwKcOxOkulTgNLHv0wTspMrfDIobvlSEnWi0dRh3mnDWCCohoTeMs5MhsDuYlpLDYHYUlPmIw/79/tSkd3dV68y42FZKbKHorKUtKgv3zXzOzrIczp9MW9GHDRohpmamVmYgpaAsGDM3d4EmgZAThFNQAVeP+BDo+UASEEzbuBjnMn99x67Ka7heEQgiscpQIDAQABo2cwZTBEBgNVHREEPTA7ghBpZHAudXRkYWxsYXMuZWR1hidodHRwczovL2lkcC51dGRhbGxhcy5lZHUvaWRwL3NoaWJib2xldGgwHQYDVR0OBBYEFF37bNekZX/PdczWcPYmwzFuT7w+MA0GCSqGSIb3DQEBBQUAA4IBAQBfVAtcXTBICrXjODHo00mxhMhZV4uK3QGwRhYWf0PhClq/8I4lipnVDKRmzgC4U8wLLh3msJxR4VqVLwycCSL8QxKYqkJJfnRlzEzhg/w8m7iYuiSdYSu4i62c3jGT0i3TGg3yCBk2cdgorf2tbAwDimYF2TFcPInUp7XGaxDf9nxw4z7NNsNVkUZBjl8WmmUwMtPNUDFDaw8HmVn0J2WcBneDgHFOfFS2aYPeytiEEM7pLc6HaAunOLXymg6VBSKYkC+wUZdIl7otJrccXzqERisCn91uRsbkcD1U5ziboM4m9h4sYC/RP7yrFAUt9XM/aAl5JCBD8A+hnx+R50IW'
    },
    (profile, done) => {
      // Hash the NetID
      const hash = createHash('sha512-256');
      hash.update(profile['urn:oid:0.9.2342.19200300.100.1.1']);

      // Return the info that we have on the user
      done(null, {
        _id: hash.digest('hex'),
        username: profile['urn:oid:2.5.4.42'] // First Name
      });
    }
  );
  passport.use(ss);
  samlMetadata = ss.generateServiceProviderMetadata(
    readFileSync(config.SAML.encrypt.cert, 'utf-8'),
    readFileSync(config.SAML.sign.cert, 'utf-8')
  );
} else {
  const LocalStrategy = require('passport-local');
  passport.use(
    new LocalStrategy((username, password, done) => {
      done(null, {
        _id: username,
        username
      });
    })
  );
}

module.exports = (req, res, next) => {
  passport.authenticate(
    config.SAML ? 'saml' : 'local',
    async (err, user, info) => {
      if (err) {
        return res.status(500).json(err);
      }

      // This will contain the users's ID
      let id;

      // First, try and find the user in the DB. If they don't exist, catch that error and create their account.
      try {
        let userRecord = await mongo.collection('users').findOne(user);
        id = userRecord._id.toString();
        user.consented = userRecord.consented;
      } catch (err) {
        // This user doesn't exist, so create them.
        // Insert the user into MongoDB, and capture the id of the user (because it may have not been included in user)
        user.consented = false; // The user hasn't given consent yet
        id = (await mongo.collection('users').insertOne(user)).insertedId;
        // Also create a group for this user
        await mongo
          .collection('groups')
          .insertOne({ name: 'My Group', members: [id] });
      }

      // Next, create a new session for this user
      const sessionCookie = (await randomBytes(64)).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Session expires after 24 hours
      await mongo
        .collection('sessions')
        .insertOne({ userID: id, sessionCookie, expires });

      const cookieSettings = {
        path: '/api', // Only applies to /api so that static resources don't have the extra baggage
        expires // Add the expiration date and time to the cookie
      };

      res.cookie('id', id, cookieSettings);
      res.cookie('sessionCookie', sessionCookie, cookieSettings);

      res.redirect('/');
    }
  )(req, res, next);
};

module.exports.samlMetadata = (req, res) => {
  if (!config.SAML) {
    res.status(501).json({ error: 'SAML not configured!' });
  } else {
    res.set('Content-Type', 'application/xml;charset=utf-8');
    res.send(samlMetadata);
  }
};
