const git = require('simple-git')
const axios = require('axios').default

async function commit() {
  await git.simpleGit().add('.')
  await git.simpleGit().commit(`deploy ${(new Date()).toLocaleDateString()} ${(new Date()).toLocaleTimeString()} `)
  await git.simpleGit().push()
  console.log('commit done')

  Promise.all([
    //iecb
    axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=843290be-8694-27e8-3314-1639bfa03bd6')
    , axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=e5a99bd6-8e2e-2ffe-b733-c90f91848c8e')
    , axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=b2aa0709-303a-b350-586e-8910385f00a7')
    , axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=328c45f2-e65f-aea8-a8fd-baeacf358737')
    , axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=a3c1cf1d-51bc-b3b4-0849-9d63ad16798c')
    , axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=176bf52e-c283-eb93-d381-5b6b460ace4f')
    , axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=f3224fb6-1a1f-b43a-b96b-2be9f6305752')
    //anglicana
    , axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=33030063-d038-0eab-5d8c-44da689e4bcb')
    //impacto
    , axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=ba236585-577f-2905-0bd0-bbedb42914a5')
    //sysigreja
    , axios.post('https://plesk6400.is.cc:8443/modules/git/public/web-hook.php?uuid=c4615387-45a9-6973-2f53-ef78f3dc2b4f')
  ]).then(() => {
    console.log('webhook done')
  })
}

commit()