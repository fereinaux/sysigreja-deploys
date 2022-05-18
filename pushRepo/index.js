const git = require('simple-git');

async function deploy() {   
   await git().checkout('sves')
   await git().add('../.')
   await git().commit("navegar entre registros info")
   await git().push('origin','sves');
}


deploy()