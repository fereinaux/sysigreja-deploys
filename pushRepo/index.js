const git = require('simple-git');

async function deploy() {   
   await git().checkout('realidaderecon')
   await git().add('../.')
   await git().commit("crachás e delete do equipante que é círculo")
   await git().push('origin','realidaderecon');
}

deploy()