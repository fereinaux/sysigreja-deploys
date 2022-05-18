const git = require('simple-git');

async function deploy() {   
   await git().checkout('iecbeventos')
   await git().add('../.')
   await git().commit("ajuste login")
   await git().push('origin','iecbeventos');
}

deploy()