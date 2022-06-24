const git = require('simple-git');

async function deploy() {   
   await git().checkout('ejc')
   await git().add('../.')
   await git().commit("Controle de Padrinhos")
   await git().push('origin','ejc');
}


deploy()