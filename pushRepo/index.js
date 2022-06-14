const git = require('simple-git');

async function deploy() {   
   await git().checkout('ejc')
   await git().add('../.')
   await git().commit("imprimir tudo e refatoramento caronas")
   await git().push('origin','ejc');
}


deploy()