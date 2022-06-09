const git = require('simple-git');

async function deploy() {   
   await git().checkout('ejc')
   await git().add('../.')
   await git().commit("reunião agora possui horário e título, existem anexos comuns a todas as equipes, campos do checkin corrigidos para equipe e campos do participante no excel corrigido")
   await git().push('origin','ejc');
}


deploy()