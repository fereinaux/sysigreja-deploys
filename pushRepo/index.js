const git = require('simple-git');

async function deploy() {   
   await git().checkout('ejc')
   await git().add('../.')
   await git().commit("Ordenador de Quarto, Reativar Inscrição, Filtro de Presença, Campos Excel")
   await git().push('origin','ejc');
}


deploy()