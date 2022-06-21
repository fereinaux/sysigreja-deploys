const git = require('simple-git');

async function deploy() {   
   await git().checkout('cursilhorecon')
   await git().add('../.')
   await git().commit("origem pagamento e listagem com endereço")
   await git().push('origin','cursilhorecon');
}

deploy()