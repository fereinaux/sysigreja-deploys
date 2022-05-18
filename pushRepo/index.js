const git = require('simple-git');

async function deploy() {   
   await git().checkout('realidaderecon')
   await git().add('../.')
   await git().commit("editar data de lançamento")
   await git().push('origin','realidaderecon');
}

deploy()