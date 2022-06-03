const git = require('simple-git');

async function deploy() {   
   await git().checkout('sves')
   await git().add('../.')
   await git().commit("ajustes")
   await git().push('origin','sves');
}


deploy()