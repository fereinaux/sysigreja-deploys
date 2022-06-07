const git = require('simple-git');

async function deploy() {   
   await git().checkout('realidade')
   await git().add('../.')
   await git().commit("ajuste impressão equipes")
   await git().push('origin','realidade');
}


deploy()