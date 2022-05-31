const git = require('simple-git');

async function deploy() {   
   await git().checkout('ejc')
   await git().add('../.')
   await git().commit("origem e data de pagamento, customização das mensagens finais")
   await git().push('origin','ejc');
}


deploy()