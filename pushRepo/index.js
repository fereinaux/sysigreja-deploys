const git = require('simple-git');

async function deploy() {   
   await git().checkout('sves')
   await git().add('../.')
   await git().commit("adicionando SCC aos tipos de evento")
   await git().push('origin','sves');
}


deploy()