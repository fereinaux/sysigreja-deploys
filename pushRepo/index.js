const git = require('simple-git');

async function deploy() {   
   await git().checkout('ejc')
   await git().add('../.')
   await git().commit("caronas e duplas no círculo")
   await git().push('origin','ejc');
}


deploy()