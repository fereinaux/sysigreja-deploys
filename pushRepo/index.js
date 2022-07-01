const git = require('simple-git');

async function deploy() {
   await git().checkout('realidade')
   await git().add('../.')
   await git().commit("teste")
   await git().push('origin', 'realidade');
}


deploy()