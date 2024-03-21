const app = require('./app')

const options = {
  method: 'POST',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${app.token}`,
    'content-type': 'application/json'
  },
  body: JSON.stringify({ name: 'sysigreja', redirect_uri: 'https://sysigreja.com' })
};

fetch('https://api.pagseguro.com/oauth2/application', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));