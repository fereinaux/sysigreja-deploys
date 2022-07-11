const git = require('simple-git');

async function deploy() {
   await git().checkout('sves')
   await git().add('../.')
   await git().commit("Padrinhos")
   await git().push('origin', 'sves');
}


deploy()