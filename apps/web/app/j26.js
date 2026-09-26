(function(){
'use strict';
var state=null,owner='',epoch=0,request=null,walletES=null,identityES=null,ready=false,lastWalletAt=0,identities=new Map(),need=new Set(),identityTimer=0;
var FA='۰۱۲۳۴۵۶۷۸۹';function fa(n){return String(n).replace(/[0-9]/g,function(d){return FA[+d];});}
function selfPhone(){try{return typeof currentUser!=='undefined'&&currentUser?currentUser.phone:'';}catch(e){return '';}}
function by(id){return document.getElementById(id);}
function setStatus(text){var el=by('foxWalletStatus');if(el)el.textContent=text;}
function redrawIdentity(phone){document.querySelectorAll('[data-fox-name-phone]').forEach(function(el){if(el.getAttribute('data-fox-name-phone')!==phone)return;Array.from(el.children).filter(function(x){return x.classList.contains('fox-char-badge');}).forEach(function(x){x.remove();});var v=identities.get(phone);if(v&&v.activeCharacterId&&window.charBadgeHtml)el.insertAdjacentHTML('beforeend',window.charBadgeHtml(v.activeCharacterId));});}
function acceptIdentity(v){if(window.FoxProfile)window.FoxProfile.changed(v);if(!v||!v.phone||typeof v.activeCharacterId!=='string'||!Number.isFinite(Number(v.characterRevision)))return;var old=identities.get(v.phone);if(old&&Number(old.characterRevision)>Number(v.characterRevision))return;identities.set(v.phone,{phone:v.phone,activeCharacterId:v.activeCharacterId,characterRevision:Number(v.characterRevision),at:Date.now()});need.delete(v.phone);if(old&&old.activeCharacterId===v.activeCharacterId)return;redrawIdentity(v.phone);}
function requestIdentity(phone){if(!/^09\d{9}$/.test(String(phone||'')))return;var known=identities.get(phone);if(known&&Date.now()-known.at<60000)return;need.add(phone);clearTimeout(identityTimer);identityTimer=setTimeout(loadIdentities,40);}
async function loadIdentities(){if(document.hidden||!owner||!need.size)return;var phones=Array.from(need).slice(0,64),generation=epoch;phones.forEach(function(p){need.delete(p);});try{var r=await fetch('/api/identities?phones='+encodeURIComponent(phones.join(',')),{credentials:'same-origin',cache:'no-store'});var j=await r.json();if(generation!==epoch)return;if(r.ok&&j.ok)(j.identities||[]).forEach(acceptIdentity);}catch(e){}if(need.size)identityTimer=setTimeout(loadIdentities,50);}
window.foxIdentityCharacter=function(phone){requestIdentity(phone);var v=identities.get(phone);return v?v.activeCharacterId:'';};
window.foxAcceptIdentity=acceptIdentity;
function apply(w,authenticatedOwn){if(!w||w.source!=='wallet-v1'||!Number.isFinite(w.revision))return state;if(authenticatedOwn&&owner&&owner!==w.phone)reset();if(!authenticatedOwn&&owner!==w.phone)return state;if(!owner)owner=w.phone;if(owner!==w.phone)return state;if(state&&state.revision>w.revision)return state;state=w;ready=true;lastWalletAt=Date.now();acceptIdentity({phone:w.phone,activeCharacterId:w.active,characterRevision:w.characterRevision});
 var c=by('foxWalletCoins'),g=by('foxWalletGems');if(c){c.textContent=fa(w.coins);c.dataset.value=String(w.coins);}if(g){g.textContent=fa(w.gems);g.dataset.value=String(w.gems);}setStatus('موجودی تأییدشدهٔ حساب');
 window.dispatchEvent(new CustomEvent('fox-wallet-change',{detail:w}));return state;}
function stopStreams(){if(walletES)walletES.close();if(identityES)identityES.close();walletES=identityES=null;}
function reset(){epoch++;stopStreams();owner='';state=null;ready=false;request=null;identities.clear();need.clear();document.querySelectorAll('.fox-char-badge').forEach(function(x){x.remove();});['foxWalletCoins','foxWalletGems'].forEach(function(id){var el=by(id);if(el){el.textContent='—';delete el.dataset.value;}});setStatus('برای مشاهدهٔ موجودی وارد حساب شوید');window.dispatchEvent(new CustomEvent('fox-wallet-reset'));}
function connect(){if(!owner||document.hidden)return;var generation=epoch;if(!walletES){try{walletES=new EventSource('/api/wallet/stream');walletES.addEventListener('wallet',function(e){if(generation!==epoch)return;try{apply(JSON.parse(e.data));}catch(ignore){}});walletES.onerror=function(){if(generation===epoch)setStatus('ارتباط قطع است؛ آخرین موجودی تأییدشده نمایش داده می‌شود');};}catch(e){}}
 if(!identityES){try{identityES=new EventSource('/api/identities/stream');identityES.addEventListener('identity',function(e){if(generation!==epoch)return;try{acceptIdentity(JSON.parse(e.data));}catch(ignore){}});identityES.onopen=function(){if(generation!==epoch)return;document.querySelectorAll('[data-fox-name-phone]').forEach(function(el){var phone=el.getAttribute('data-fox-name-phone');need.add(phone);});loadIdentities();};}catch(e){}}}
function refresh(){if(request)return request;var generation=epoch;var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},12000);request=fetch('/api/wallet',{credentials:'same-origin',cache:'no-store',signal:controller.signal}).then(function(r){return r.json().then(function(j){if(generation!==epoch)return null;if(!r.ok||!j.ok){if(r.status===401){reset();return null;}throw new Error('wallet');}var w=apply(j.wallet,true);connect();loadIdentities();return w;});}).catch(function(){if(generation===epoch)setStatus(state?'دریافت موجودی جدید ناموفق؛ آخرین مقدار تأییدشده':'دریافت موجودی ناموفق؛ دوباره تلاش کنید');return null;}).finally(function(){clearTimeout(timer);if(generation===epoch)request=null;});return request;}
window.FoxWallet={apply:apply,refresh:refresh,reset:reset,get state(){return state;},get ready(){return ready;}};
// Intercept only relevant same-origin JSON results. A grant for someone else is never our wallet.
var baseFetch=window.fetch.bind(window);window.fetch=function(input,opts){var path='';try{var u=new URL(typeof input==='string'?input:input.url,location.href);if(u.origin===location.origin)path=u.pathname;}catch(e){}
 return baseFetch(input,opts).then(async function(r){if(!r.ok)return r;var walletPath=['/api/wallet','/api/chars/me','/api/chars/buy','/api/chars/activate','/api/chat/buy-credits','/api/game/reward/claim','/api/tank/buy','/api/tank/shop'].indexOf(path)>=0;
 if(walletPath||path==='/api/user'||path==='/api/users'||path.indexOf('/api/auth/')===0){try{var j=await r.clone().json();if(walletPath&&path!=='/api/wallet'&&j.ok&&j.wallet)apply(j.wallet);if(path==='/api/users'&&Array.isArray(j))j.forEach(acceptIdentity);if(path==='/api/user')acceptIdentity(j.user||j);if(path.indexOf('/api/auth/')===0){if(path==='/api/auth/logout')reset();else if(j.ok&&j.user){acceptIdentity(j.user);setTimeout(refresh,0);}}}catch(ignore){}}return r;});};
function mount(){var old=document.getElementById('foxAccountWallet');if(old)old.remove();}
 document.addEventListener('visibilitychange',function(){if(document.hidden)stopStreams();else if(owner||selfPhone()||location.pathname==='/ai')refresh();});window.addEventListener('online',function(){if(owner||selfPhone())refresh();});
 setInterval(function(){if(document.hidden)return;if(owner&&selfPhone()&&selfPhone()!==owner){reset();refresh();return;}if((owner||selfPhone())&&Date.now()-lastWalletAt>20000)refresh();},5000);
 refresh();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

(function(){
'use strict';
var profiles=new Map(),pending=new Map(),wanted=new Map(),epoch=0,dirty=new Map(),paintTimer=0;
var fields=['name','username','avatar','bio','profileRevision','profileUpdatedAt'];
function merge(u){if(!u||!u.phone)return u;var p=profiles.get(u.phone);if(!p||Number(p.profileRevision)<=Number(u.profileRevision||0))return u;return Object.assign({},u,p);}
function redraw(u,bulk){
 try{
  if(typeof currentUser!=='undefined'&&currentUser&&currentUser.phone===u.phone){Object.assign(currentUser,u);renderCurrentUser();}
  if(typeof lastUsers!=='undefined'){var i=lastUsers.findIndex(function(x){return x.phone===u.phone;});if(i>=0)lastUsers[i]=Object.assign({},lastUsers[i],u);else lastUsers.push(u);}
  if(typeof hsUsers!=='undefined'&&Array.isArray(hsUsers))hsUsers=hsUsers.map(function(x){return x.phone===u.phone?Object.assign({},x,u):x;});
  if(typeof dmTarget!=='undefined'&&dmTarget&&dmTarget.phone===u.phone){Object.assign(dmTarget,u);setDMTitle(dmTarget);var avatar=document.getElementById('dmAva');if(avatar)avatar.src=u.avatar||DEFAULT_AVA;}
  if(typeof upTarget!=='undefined'&&upTarget&&upTarget.phone===u.phone){Object.assign(upTarget,u);if(document.getElementById('upModal').classList.contains('show'))renderUserProfile(upTarget);}
  // Existing messages keep their IDs/content; only the visible current account identity changes.
  if(bulk&&typeof lastMessages!=='undefined'&&lastMessages.length)renderMessages(lastMessages);
  if(bulk&&typeof dmMessages!=='undefined'&&dmMessages.length)renderDM(dmMessages);
  if(bulk&&document.getElementById('membersModal')&&document.getElementById('membersModal').classList.contains('show'))renderMembersList(lastUsers.map(merge));
  if(bulk&&typeof viewDMList!=='undefined'&&!viewDMList.classList.contains('hidden'))renderDMList();
  document.querySelectorAll('[data-fox-label-kind][data-fox-name-phone]').forEach(function(el){if(el.getAttribute('data-fox-name-phone')!==u.phone)return;var text=el.getAttribute('data-fox-label-kind')==='username'?(u.username?'@'+u.username:''):u.name;var node=Array.from(el.childNodes).find(function(n){return n.nodeType===3;});if(node)node.nodeValue=text;});
 }catch(e){console.warn('profile render retry',e);}
}
function accept(u){if(!u||u.dataUnavailable||!/^09\d{9}$/.test(u.phone)||typeof u.avatar!=='string'||typeof u.name!=='string')return u;var old=profiles.get(u.phone),rev=Number(u.profileRevision)||0;if(old&&old.profileRevision>rev)return Object.assign({},u,old);var p={phone:u.phone};fields.forEach(function(k){p[k]=u[k]===undefined?(k.indexOf('Revision')>=0||k.indexOf('UpdatedAt')>=0?0:''):u[k];});p.profileRevision=rev;
 if(old&&JSON.stringify(old)===JSON.stringify(p))return u;profiles.set(u.phone,p);dirty.set(u.phone,p);clearTimeout(paintTimer);paintTimer=setTimeout(function(){var rows=Array.from(dirty.values());dirty.clear();rows.forEach(function(p,i){redraw(p,i===rows.length-1);});},25);return u;}
function changed(v){if(!v||typeof v.profileRevision!=='number')return;var old=profiles.get(v.phone);if(old&&old.profileRevision>=v.profileRevision)return;if(!old&&!document.querySelector('[data-fox-name-phone="'+v.phone+'"]'))return;wanted.set(v.phone,Math.max(wanted.get(v.phone)||0,v.profileRevision));if(pending.has(v.phone))return;var generation=epoch,loaded=false;
 var task=fetch('/api/user?phone='+encodeURIComponent(v.phone),{cache:'no-store',credentials:'same-origin'}).then(function(r){if(!r.ok)throw new Error();return r.json();}).then(function(u){if(generation===epoch){accept(u.user||u);loaded=true;}}).catch(function(){}).finally(function(){if(generation===epoch){pending.delete(v.phone);if(loaded&&(wanted.get(v.phone)||0)>Number((profiles.get(v.phone)||{}).profileRevision||0))changed({phone:v.phone,profileRevision:wanted.get(v.phone)});}});pending.set(v.phone,task);}
function reset(){epoch++;clearTimeout(paintTimer);dirty.clear();profiles.clear();pending.clear();wanted.clear();}
window.FoxProfile={get:function(phone){return profiles.get(phone);},merge:merge,accept:accept,changed:changed,reset:reset};
window.addEventListener('fox-wallet-reset',reset);
var previousFetch=window.fetch.bind(window);
window.fetch=function(input,opts){var path='';try{var u=new URL(typeof input==='string'?input:input.url,location.href);if(u.origin===location.origin)path=u.pathname;}catch(e){}var generation=epoch;
 return previousFetch(input,opts).then(async function(r){if(!r.ok||!['/api/user','/api/users','/api/auth/me','/api/auth/login','/api/auth/register','/api/admin/state'].includes(path))return r;try{var data=await r.clone().json();if(generation!==epoch)return r;
 if(Array.isArray(data))data=data.map(function(u){return merge(accept(u));});else if(data&&data.user)data.user=merge(accept(data.user));else if(data&&Array.isArray(data.users))data.users=data.users.map(function(u){return merge(accept(u));});else if(data&&data.phone)data=merge(accept(data));
 var headers=new Headers(r.headers);headers.delete('content-length');headers.delete('content-encoding');return new Response(JSON.stringify(data),{status:r.status,statusText:r.statusText,headers:headers});}catch(e){return r;}});
};
})();
