const git = require('simple-git');

async function deploy() {   
   await git().checkout('cursilhorecon')
   await git().add('../.')
   await git().commit("webconfig")
   await git().push('origin','cursilhorecon');
}

deploy()