const git = require('simple-git');

async function deploy() {   
   await git().checkout('ejc')
   await git().add('../.')
   await git().commit("ajustes na ordenação, tirar coluna de foto, bloqueio na idade")
   await git().push('origin','ejc');
}


deploy()