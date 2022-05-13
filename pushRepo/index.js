const git = require('simple-git');

async function deploy() {   
   await git().checkout('cursilhorecon')
   await git().add('../.')
   await git().commit("versão 1")
   await git().push('origin','cursilhorecon');
}

deploy()