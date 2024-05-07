
const app = require('./app')
const token = require('./token-missoesrecon')

const options = {
  method: 'GET',
  headers: { accept: 'application/json', Authorization: `Bearer ${token.access_token}`, }
};

fetch('https://api.pagseguro.com/checkouts/CHEC_b503b76b-4323-44cc-9803-e4a4cebff5e0', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

