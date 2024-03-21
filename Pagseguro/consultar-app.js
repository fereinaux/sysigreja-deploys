const app = require('./app')

const options = {
  method: 'GET',
  headers: { accept: 'application/json', Authorization: 'Bearer ' + app.token }
};

fetch('https://api.pagseguro.com/oauth2/application/' + app.client_id, options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));