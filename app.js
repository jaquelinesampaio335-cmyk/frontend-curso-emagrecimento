/*
  Frontend app.js
  IMPORTANT: replace API_BASE with the URL of your deployed backend (Render).
  Example:
    const API_BASE = 'https://seu-backend.onrender.com'
*/
const API_BASE = 'https://backend-curso-emagrecimento.onrender.com'; // <- replace me

async function request(path, opts={}){
  const res = await fetch(API_BASE + path, opts);
  if(!res.ok) {
    const body = await res.json().catch(()=>({error:'server'}));
    throw new Error(body.error || 'network');
  }
  return res.json();
}

function saveUser(u){ localStorage.setItem('ce_user', JSON.stringify(u)); }
function getUser(){ return JSON.parse(localStorage.getItem('ce_user')||'null'); }
function logout(){ localStorage.removeItem('ce_user'); window.location='index.html'; }

// Auth actions (login/register)
if(document.getElementById('btn-register')){
  document.getElementById('btn-register').addEventListener('click', async ()=>{
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const msg = document.getElementById('msg');
    msg.innerText='';
    try{
      const res = await request('/api/auth/register', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({name,email,password})});
      msg.innerText = 'Registrado com sucesso. Faça login.';
    }catch(err){ msg.innerText = 'Erro: '+err.message; }
  });
}

if(document.getElementById('btn-login')){
  document.getElementById('btn-login').addEventListener('click', async ()=>{
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const msg = document.getElementById('msg');
    msg.innerText='';
    try{
      const res = await request('/api/auth/login', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({email,password})});
      saveUser(res.user);
      window.location = 'dashboard.html';
    }catch(err){ msg.innerText = 'Erro: '+err.message; }
  });
}

// Dashboard logic
if(document.getElementById('modules-area')){
  (async ()=>{
    const user = getUser();
    if(!user) { window.location='login.html'; return; }
    document.getElementById('user-name').innerText = user.name || user.email;
    document.getElementById('logout').addEventListener('click', ()=>logout());

    const res = await request('/api/modulos');
    const mods = res.modulos || res.modules || [];
    // compute weeks since start
    const start = new Date(user.startDate || user.registeredAt);
    const now = new Date();
    const weeks = Math.floor((now - start)/(1000*60*60*24*7)) + 1;
    let unlocked=0;
    if(weeks>=10) unlocked=3;
    else if(weeks>=7) unlocked=2;
    else if(weeks>=4) unlocked=1;
    else unlocked=0;
    // render modules
    const container = document.getElementById('modules-area');
    mods.forEach((m,idx)=>{
      const card = document.createElement('div');
      card.className='module-card';
      const locked = idx>unlocked;
      card.innerHTML = `<h3>${m.title || m.name}</h3><p>${locked?'<em>Bloqueado até sua liberação</em>':'Liberado'} </p><a href="modulos.html?mod=${m.id}">Abrir módulo</a>`;
      container.appendChild(card);
    });
    // progress placeholder
    document.getElementById('progress').innerText = '0%';
  })();
}

// Módulo page
if(document.getElementById('lessons-list')){
  (async ()=>{
    const params = new URLSearchParams(location.search);
    const modId = params.get('mod');
    const res = await request('/api/modulos');
    const mod = res.modulos.find(x=>x.id==modId || x.id==parseInt(modId));
    if(!mod){ document.getElementById('module-title').innerText='Módulo não encontrado'; return; }
    document.getElementById('module-title').innerText = mod.title || mod.name;
    const user = getUser();
    const start = new Date(user.startDate || user.registeredAt);
    const now = new Date();
    const week = Math.floor((now - start)/(1000*60*60*24*7)) + 1;
    const unlockedModuleIndex = (week>=10?3:week>=7?2:week>=4?1:0);
    const modIndex = (typeof mod.id === 'string')? parseInt(mod.id.replace('m',''))-1 : (mod.id-1);
    const moduleUnlocked = modIndex <= unlockedModuleIndex;
    const list = document.getElementById('lessons-list');
    (mod.aulas || mod.lessons || []).forEach(a=>{
      const li = document.createElement('li');
      if(!moduleUnlocked) li.innerHTML = `<strong>${a.title}</strong> - <em>Bloqueada até liberação</em>`;
      else li.innerHTML = `<strong>${a.title}</strong> - <a href="aula.html?mod=${mod.id}&aula=${a.id || a.title}">Assistir</a>`;
      list.appendChild(li);
    });
  })();
}

// Aula page
if(document.getElementById('video-player')){
  (async ()=>{
    const params = new URLSearchParams(location.search);
    const modId = params.get('mod');
    const aulaId = params.get('aula');
    const user = getUser();
    if(!user){ window.location='login.html'; return; }
    const res = await request('/api/modulos');
    const mod = res.modulos.find(x=> x.id==modId || x.id==parseInt(modId));
    const lesson = (mod.aulas || mod.lessons || []).find(a=> (a.id==aulaId) || (a.title==aulaId));
    document.getElementById('lesson-title').innerText = lesson.title;
    document.getElementById('lesson-desc').innerText = lesson.description || '';
    const start = new Date(user.startDate || user.registeredAt);
    const now = new Date();
    const week = Math.floor((now - start)/(1000*60*60*24*7)) + 1;
    const unlockedModuleIndex = (week>=10?3:week>=7?2:week>=4?1:0);
    const modIndex = (typeof mod.id === 'string')? parseInt(mod.id.replace('m',''))-1 : (mod.id-1);
    const moduleUnlocked = modIndex <= unlockedModuleIndex;
    if(!moduleUnlocked){ document.getElementById('blocked-msg').innerText = 'Aula bloqueada até liberação do módulo.'; return; }
    // show video
    const src = lesson.video_url;
    document.getElementById('video-src').src = src;
    const v = document.getElementById('video-player');
    v.style.display='block';
    v.load();
  })();
}
