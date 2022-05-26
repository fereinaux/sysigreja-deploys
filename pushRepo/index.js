const git = require('simple-git');

async function deploy() {   
   await git().checkout('realidaderecon')
   await git().add('../.')
   await git().commit("Origem e Data de lançamento para pagamentos")
   await git().push('origin','realidaderecon');
}

deploy()