const git = require('simple-git');

async function deploy() {
   await git().checkout('realidade')
   await git().add('../.')
   await git().commit("remover campo centro de custo")
   await git().push('origin', 'realidade');
}


deploy()