const git = require('simple-git');

async function deploy() {   
   await git().checkout('ejc')
   await git().add('../.')
   await git().commit("Relatório do Quarto completo/resumido, Reponsável pelo quarto e colunas do excel personalizáveis")
   await git().push('origin','ejc');
}


deploy()