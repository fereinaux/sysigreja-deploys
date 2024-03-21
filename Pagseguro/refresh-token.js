const token = require('./token-sysigreja')
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
  body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: token.refresh_token })
};

fetch('https://api.pagseguro.com/oauth2/refresh', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));