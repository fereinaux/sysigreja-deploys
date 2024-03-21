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
    code: '3e4b54707bf74995b9a616917b293412',
    redirect_uri: 'https://sysigreja.com'
  })
};

const req = new Request('https://api.pagseguro.com/oauth2/token', options)
console.log(req.headers.values())
req.json().then(a => console.log(a))
fetch(req)
  .then(response => response)
  .then(response => console.log(response))
  .catch(err => console.error(err));