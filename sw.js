const V='ejefe-v8';
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>{if(r.ok)return c.put(u,r)}).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
function sameApp(u){return u.origin===location.origin}
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const fonts=u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(!sameApp(u)&&!fonts)return;
  const isPage=r.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/sw.js')||u.pathname.endsWith('/');
  if(isPage&&sameApp(u)){
    // network first so updates show up right away; fall back to the saved copy with no signal
    e.respondWith(new Promise(res=>{
      let done=false;
      const fallback=()=>caches.match('index.html').then(h=>h||caches.match('./')).then(h=>{if(!done&&h){done=true;res(h)}});
      const t=setTimeout(fallback,4000);
      fetch(new Request('index.html',{cache:'reload'})).then(n=>{clearTimeout(t);if(n&&n.ok){const cp=n.clone();caches.open(V).then(c=>c.put('index.html',cp))}if(!done){done=true;res(n)}}).catch(()=>{clearTimeout(t);fallback().then(()=>{if(!done)res(Response.error())})});
    }));
    return;
  }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&res.status===200){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
    return hit||net;
  }));
});
