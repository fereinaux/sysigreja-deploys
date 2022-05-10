const git = require('simple-git');

async function deploy() {   
   await git().checkout('iecbeventos')
   await git().add('../.')
   await git().commit("ajuste no campo de apelido")
   await git().push('origin','iecbeventos');
}

deploy()