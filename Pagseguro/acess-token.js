const app = require('./app')

const options = {
  method: 'POST',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${app.token}`,
    X_CLIENT_ID: app.client_id,
    X_CLIENT_SECRET: app.client_secret,
    'content-type': 'application/json'
  },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: '4c7d47df499a4cc292fe88c1470c7150',
    redirect_uri: 'https://sysigreja.com'
  })
};

fetch('https://api.pagseguro.com/oauth2/token', options)
  .then(response => response.json().then(json => console.log(json)))
  .catch(err => console.error(err));
