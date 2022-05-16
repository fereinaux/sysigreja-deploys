const git = require('simple-git');

async function deploy() {   
   await git().checkout('sves')
   await git().add('../.')
   await git().commit("marcadores, excluir equipanteEvento, link whatsapp")
   await git().push('origin','sves');
}


deploy()