const git = require('simple-git');

async function deploy() {   
   await git().checkout('realidaderecon')
   await git().add('../.')
   await git().commit("version 2")
   await git().push('origin','realidaderecon');
}

deploy()