const app = require('./app')
const token = require('./token-sves')

const options = {
  method: 'POST',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${token.access_token}`,
    'Content-type': 'application/json'
  },
  body: JSON.stringify({
    reference_id: 'Teste',
    customer_modifiable: true,
    items: [{ reference_id: 'teste', name: 'teste', quantity: 1, unit_amount: 5 }],
    redirect_url: 'https://sysigreja.com',
    notification_urls: ['https://sysigreja.com'],
    payment_notification_urls: ['https://sysigreja.com']
  })
};

const request = new Request('https://api.pagseguro.com/checkouts', options)

request.json().then(req => console.log(req))

fetch('https://api.pagseguro.com/checkouts', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));