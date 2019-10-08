// Cache whether the user is logged in or not, and other related details
let isLoggedIn = null;
let userID = null;
let sessionCookie = null;
let saml = null;
let consented = null;
let username = null;

// Check if the user is logged in, and adjust the cache based on that value
const initialLoginPromise = fetch('/api/is-logged-in').then(async res => {
  isLoggedIn = res.ok;
  if (res.ok) {
    const json = await res.json();
    userID = json.userID;
    sessionCookie = json.sessionCookie;
    consented = json.consented;
    username = json.username;
  }
  const metadata = await fetch('/api/login/metadata');
  saml = metadata.ok;
});

const giveConsent = () => {
  consented = true;
  fetch('/api/gave-consent', { method: 'POST' });
};

export {
  isLoggedIn,
  userID,
  username,
  saml,
  sessionCookie,
  consented,
  giveConsent,
  initialLoginPromise
};
