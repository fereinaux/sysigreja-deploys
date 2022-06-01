const git = require('simple-git');

async function deploy() {   
   await git().checkout('ejc')
   await git().add('../.')
   await git().commit("data no lancamento, package.json")
   await git().push('origin','ejc');
}


deploy()