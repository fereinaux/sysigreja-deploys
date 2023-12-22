const git = require('simple-git')
const axios = require('axios').default

async function commit() {
  await git.simpleGit().add('.')
  await git.simpleGit().commit('deploy')
  await git.simpleGit().push()
  console.log('commit done')
  await axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=843290be-8694-27e8-3314-1639bfa03bd6')
  await axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=e5a99bd6-8e2e-2ffe-b733-c90f91848c8e')
  await axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=b2aa0709-303a-b350-586e-8910385f00a7')
  await axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=328c45f2-e65f-aea8-a8fd-baeacf358737')
  await axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=a3c1cf1d-51bc-b3b4-0849-9d63ad16798c')
  //impacto
  await axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=ba236585-577f-2905-0bd0-bbedb42914a5')
  //sysigreja
  await axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=c4615387-45a9-6973-2f53-ef78f3dc2b4f')
  
  console.log('webhook done')
}

commit()