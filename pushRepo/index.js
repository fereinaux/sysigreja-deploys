const git = require('simple-git');

async function deploy() {   
   await git().checkout('sves')
   await git().add('../.')
   await git().commit("impressões em ordem e relatório de parentes")
   await git().push('origin','sves');
}


deploy()