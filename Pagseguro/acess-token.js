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
    code: 'd4d0b21c1cdc4d0a98007a23584b5c00',
    redirect_uri: 'https://sysigreja.com'
  })
};

fetch('https://api.pagseguro.com/oauth2/token', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));