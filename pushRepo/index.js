const git = require('simple-git');

async function deploy() {   
   await git().checkout('ejc')
   await git().add('../.')
   await git().commit("ajustes reunião")
   await git().push('origin','ejc');
}


deploy()