

  const view1=document.getElementById('view1');
  const viewLogin=document.getElementById('viewLogin');
  const view2=document.getElementById('view2');
  const viewRules=document.getElementById('viewRules');
  const viewHome=document.getElementById('viewHome');
  const viewSettings=document.getElementById('viewSettings');
  const viewChat=document.getElementById('viewChat');
  const viewDM=document.getElementById('viewDM');
  const viewDMList=document.getElementById('viewDMList');
  const viewAdmin=document.getElementById('viewAdmin');
  const viewFun=document.getElementById('viewFun');
  const viewDooz=document.getElementById('viewDooz');
  const bottomNav=document.getElementById('bottomNav');
  const DEFAULT_AVA=document.querySelector('img.fox')?document.querySelector('img.fox').src:'';
  function show(el){ if(el){ if(el.tagName==='SECTION'&&el.classList.contains('view')&&window.foxLeaveGroupsUI) window.foxLeaveGroupsUI(el.id); el.classList.remove('hidden'); try{ el.style.removeProperty('display'); }catch(e){} el.style.display='flex'; } }
  function hide(el){ if(el){ el.classList.add('hidden'); el.style.display='none'; } }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function snippet(s){ s=String(s||''); return s.length>40? s.slice(0,40)+'…' : s; }
  function fmtTime(ts){ const d=new Date(ts); return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0'); }
  function adjustHexDarkness(hex, factor) {
    var s = String(hex || '').replace('#', '');
    if (s.length === 3) s = s.split('').map(x => x + x).join('');
    var num = parseInt(s, 16);
    if (isNaN(num)) return hex;
    var r = (num >> 16);
    var g = (num >> 8) & 0x00FF;
    var b = num & 0x0000FF;
    if (factor > 0) {
      r = Math.round(r * (1 - factor));
      g = Math.round(g * (1 - factor));
      b = Math.round(b * (1 - factor));
    } else {
      r = Math.round(r + (255 - r) * (-factor));
      g = Math.round(g + (255 - g) * (-factor));
      b = Math.round(b + (255 - b) * (-factor));
    }
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* Convert legacy orange declarations in component CSS to central tokens.
     This handles game styles and dynamically injected style rules without
     changing semantic success/error/warning colors. */
  function themeizeValue(v){
    if(!v||typeof v!=='string')return v;
    return v
      .replace(/#(?:ff7a00|ff7900|ff6a00|ff7800|f57c00)/gi,'var(--theme-primary)')
      .replace(/#(?:e86500|e65100|d95f00)/gi,'var(--theme-primary-strong)')
      .replace(/rgba?[(][ ]*(?:255[ ]*,[ ]*(?:122|121|106|120)|245[ ]*,[ ]*124)[ ]*,[ ]*0[ ]*(?:,[ ]*([^)]*))?[)]/gi,function(_,a){return a===undefined?'rgb(var(--theme-primary-rgb))':'rgba(var(--theme-primary-rgb),'+a+')';})
      .replace(/rgba?[(][ ]*(?:232[ ]*,[ ]*101|230[ ]*,[ ]*81|217[ ]*,[ ]*95)[ ]*,[ ]*0[ ]*(?:,[ ]*([^)]*))?[)]/gi,function(_,a){return a===undefined?'var(--theme-primary-strong)':'rgba(var(--theme-primary-rgb),'+a+')';});
  }
  function themeizeStyle(style){
    if(!style)return;for(var i=0;i<style.length;i++){var p=style[i];if(p.charAt(0)==='-'&&p.charAt(1)==='-')continue;/* token definitions stay literal: #FF7A00 inside --theme-primary → var(--theme-primary) = self-cycle = invalid */var v=style.getPropertyValue(p),n=themeizeValue(v);if(n!==v)try{style.setProperty(p,n,style.getPropertyPriority(p));}catch(e){}}
  }
  function themeizeRules(rules){
    if(!rules)return;for(var i=0;i<rules.length;i++){var r=rules[i];if(r.style)themeizeStyle(r.style);if(r.cssRules)themeizeRules(r.cssRules);}
  }
  function applyThemeTokens(root){
    try{Array.from(document.styleSheets).forEach(function(s){try{themeizeRules(s.cssRules);}catch(e){}});}catch(e){}
    try{(root||document).querySelectorAll('[style]').forEach(function(el){themeizeStyle(el.style);});}catch(e){}
    try{(root||document).querySelectorAll('[fill],[stroke],[stop-color]').forEach(function(el){['fill','stroke','stop-color'].forEach(function(a){var v=el.getAttribute(a);if(v){var n=themeizeValue(v);if(n!==v)el.setAttribute(a,n);}});});}catch(e){}
  }
  let theme=localStorage.getItem('fox_theme')||'#FF7A00';
  function applyTheme(c){
    if (!c) c = '#FF7A00';
    var dark = adjustHexDarkness(c, 0.20);
    var light = adjustHexDarkness(c, -0.25);
    var soft = c + '22';
    var hex=String(c).replace('#','');if(hex.length===3)hex=hex.split('').map(function(x){return x+x;}).join('');
    var rgb=[parseInt(hex.slice(0,2),16)||255,parseInt(hex.slice(2,4),16)||122,parseInt(hex.slice(4,6),16)||0].join(',');
    document.documentElement.style.setProperty('--theme-primary-rgb', rgb);
    document.documentElement.style.setProperty('--theme-primary', c);
    document.documentElement.style.setProperty('--theme-primary-strong', dark);
    document.documentElement.style.setProperty('--theme-primary-soft', soft);
    document.documentElement.style.setProperty('--theme-icon', c);
    document.documentElement.style.setProperty('--theme', c);
    document.documentElement.style.setProperty('--orange', c);
    document.documentElement.style.setProperty('--orange-dark', dark);
    document.documentElement.style.setProperty('--orange-light', light);
    document.documentElement.style.setProperty('--theme-dark', dark);
    document.documentElement.style.setProperty('--theme-light', light);
    document.documentElement.style.setProperty('--theme-soft', soft);
    document.documentElement.style.setProperty('--primary', c);
    document.querySelectorAll('.theme-btn').forEach(b => {
      b.classList.toggle('sel', (b.dataset.c || '').toLowerCase() === String(c || '').toLowerCase());
    });
    setTimeout(function(){applyThemeTokens(document);},0);
  }
  applyTheme(theme);
  window.addEventListener('load',function(){applyThemeTokens(document);});
  /* A cached profile is only a display cache. The server session remains the
     authority; malformed or stale cache must never prevent the real profile
     from being rendered after sign-in. */
  let currentUser=null;
  try{
    const cached=JSON.parse(localStorage.getItem('fox_user')||'null');
    if(cached && typeof cached==='object') currentUser=cached;
  }catch(e){
    try{ try { window.foxPushBridge(JSON.stringify({ action: 'logout' })); } catch(e) {}
    localStorage.removeItem('fox_user'); }catch(_){}
  }
  function profileIsComplete(user){ return !!(user && user.phone && String(user.name||'').trim()); }
  function saveCurrentUser(user){
    if(!user || typeof user!=='object') return null;
    user=window.FoxProfile?window.FoxProfile.merge(user):user;
    currentUser=user;
    if(window.foxAcceptIdentity)window.foxAcceptIdentity(user);
    if(window.FoxWallet)setTimeout(function(){window.FoxWallet.refresh();},0);
    try{ var cached=Object.assign({},currentUser);delete cached.activeCharacterId;delete cached.ownedCharacterIds;delete cached.profile;localStorage.setItem('fox_user',JSON.stringify(cached)); }catch(e){}
    try{ if(currentUser.phone) localStorage.setItem('fox_last_phone',currentUser.phone); }catch(e){}
    return currentUser;
  }
  function avatarForCurrentUser(user){ return (user && user.avatar) ? user.avatar : DEFAULT_AVA; }
  function renderCurrentUser(){
    if(!currentUser) return;
    const avatar=avatarForCurrentUser(currentUser);
    ['htAva','funAva','setAva'].forEach(function(id){ const el=document.getElementById(id); if(el) el.src=avatar; });
    try{ if(window.updateProfileCharWidget) window.updateProfileCharWidget(); }catch(e){}
    const sn=document.getElementById('setName');
    if(sn){
      sn.textContent=currentUser.name||'بدون نام';
      if(currentUser.verified) applyVerifiedToName(sn,currentUser);
      else { const badge=sn.querySelector&&sn.querySelector('.verified-badge'); if(badge) badge.remove(); }
      try{ if(window.applyCharToName) window.applyCharToName(sn,currentUser); }catch(e){}
    }
    const su=document.getElementById('setUsername');
    if(su){
      const username=String(currentUser.username||'').trim().replace(/^@+/,'');
      su.textContent=username?'@'+username:'';
      su.style.display=username?'block':'none';if(username&&window.applyCharToName)window.applyCharToName(su,currentUser);
    }
    const sb=document.getElementById('setBio');
    if(sb){
      const bio=String(currentUser.bio||'').trim();
      sb.textContent=bio;
      sb.style.display=bio?'block':'none';
    }
  }
  function fillProfileForm(user){
    const u=user||{};
    const name=document.getElementById('nameInput'); if(name) name.value=u.name||'';
    const username=document.getElementById('userInput'); if(username) username.value=u.username||'';
    const bio=document.getElementById('bioInput'); if(bio){ bio.value=u.bio||''; try{ bio.dispatchEvent(new Event('input')); }catch(e){} }
    const preview=document.getElementById('avatarPrev');
    const placeholder=document.querySelector('#avatarWrap .ph');
    if(preview){
      if(u.avatar){ preview.src=u.avatar; preview.style.display='block'; if(placeholder) placeholder.style.display='none'; }
      else { preview.removeAttribute('src'); preview.style.display='none'; if(placeholder) placeholder.style.display=''; }
    }
    const err=document.getElementById('errToast'); if(err) err.style.display='none';
  }
  function showProfileSetup(user){
    if(user && typeof user==='object') saveCurrentUser(user);
    try {
      var _sessTok = localStorage.getItem('fox_session');
      if (user && user.phone && _sessTok) {
        window.foxPushBridge(JSON.stringify({ action: 'session_sync', phone: user.phone, token: _sessTok }));
      }
    } catch(e) {}
    renderCurrentUser();
    fillProfileForm(currentUser);
    document.querySelectorAll('section.view').forEach(function(v){ hide(v); });
    show(view2);
    bottomNav.classList.add('show');
    window.scrollTo(0,0);
  }
  function sendCurrentDevice(){
    if(!currentUser || !currentUser.phone) return;
    try{
      let devId=localStorage.getItem('fox_device_id');
      if(!devId){ devId=(crypto.randomUUID && crypto.randomUUID())||('dev_'+Date.now()+'_'+Math.random().toString(36).slice(2,9)); localStorage.setItem('fox_device_id',devId); }
      localStorage.setItem('fox_device_last',String(Date.now()));
      fetch('/api/device',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({phone:currentUser.phone,device:devId,ua:navigator.userAgent,ts:Date.now()})}).catch(()=>{});
    }catch(e){}
  }
  let authenticatedViewEpoch=0;
  function beginAuthenticatedSession(user){
    authenticatedViewEpoch++;
    saveCurrentUser(user);
    renderCurrentUser();
    if(!profileIsComplete(currentUser)){
      showProfileSetup(currentUser);
      return false;
    }
    [view1,viewLogin,viewLoginCode,viewRegisterCode,view2,viewRules].forEach(function(v){ if(v) hide(v); });
    try {
      var _sp = new URLSearchParams(location.search);
      var _actTab = _sp.get('view') || localStorage.getItem('fox_active_tab') || 'home';
      if (_sp.get('view')) {
        try { history.replaceState(null, '', location.pathname); } catch(e) {}
      }
      var _foxPath = location.pathname;
      if (_foxPath === '/groups' && window.goGroups) {
        window.goGroups(false);
      } else if (_foxPath.indexOf('/group/') === 0 && window.openGroup) {
        window.openGroup(decodeURIComponent(_foxPath.slice(7)), false);
      } else if (_actTab === 'fun') {
        goFun();
      } else {
        goHome();
      }
    } catch(e) {
      goHome();
    }
    loadBlocks();
    sendPing();
    startInbox();
    if(!pingTimer) pingTimer=setInterval(sendPing,45000);
    sendCurrentDevice();
    return true;
  }
  async function loadAuthoritativeCurrentUser(){
    let token=''; try{ token=String(localStorage.getItem('fox_session')||'').trim(); }catch(e){}
    const opt={credentials:'same-origin',headers:{'Accept':'application/json'}};
    if(token) opt.headers.Authorization='Bearer '+token;
    try{
      const r=await fetch('/api/auth/me',opt);
      const j=await r.json();
      if(j && j.ok && j.user){
        saveCurrentUser(j.user);
        if(j.token) try{ localStorage.setItem('fox_session',j.token); }catch(e){}
        return currentUser;
      }
    }catch(e){}
    return null;
  }
  let settingsFrom='home';
  let seenCount=parseInt(localStorage.getItem('fox_seen')||'0');
  let likesMap={};
  let likedSet=new Set();
  function likedKey(){ return 'fox_liked_'+(currentUser?currentUser.phone:'guest'); }
  function setActiveNav(name){ document.querySelectorAll('#bottomNav button').forEach(b=>b.classList.toggle('active', b.dataset.go===name)); }
  function goHome(){
    try{
      try{ if(window.foxLeaveGroupsUI) window.foxLeaveGroupsUI('viewHome'); }catch(e){}
      try { window.foxPushBridge(JSON.stringify({ action: 'active_chat', type: null, id: null })); } catch(e) {}
      document.querySelectorAll('section.view').forEach(function(s) {
        if (s.id !== 'viewHome') {
          s.classList.add('hidden');
          s.style.display = 'none';
        }
      });
      var vh = document.getElementById('viewHome');
      if (vh) {
        vh.classList.remove('hidden');
        try { vh.style.removeProperty('display'); } catch(e) {}
        vh.style.display = 'flex';
        vh.style.visibility='visible';
        vh.style.opacity='1';
      }
      try{ refreshHome(); }catch(e){ console.error('refreshHome failed', e); }
      var bn = document.getElementById('bottomNav');
      if (bn) {
        bn.classList.add('show');
        try { bn.style.removeProperty('display'); } catch(e) {}
        bn.style.display = 'flex';
        bn.style.visibility='visible';
        bn.style.opacity='1';
        document.documentElement.classList.add('has-auth-session');
      }
      try{ if(window.setActiveNav) setActiveNav('home'); }catch(e){}
      try { localStorage.setItem('fox_active_tab', 'home'); } catch(e) {}
      try { window.scrollTo(0, 0); } catch(e) {}
    }catch(e){
      console.error('goHome failed', e);
      try{
        var vh=document.getElementById('viewHome');
        if(vh){ vh.classList.remove('hidden'); vh.style.display='flex'; }
        var bn=document.getElementById('bottomNav');
        if(bn){ bn.classList.add('show'); bn.style.display='flex'; }
      }catch(_){}
    }
  }
  function goSettings(){ hide(viewChat); hide(viewHome); hide(viewDMList); hide(viewFun); hide(viewDooz); show(viewSettings); refreshSettings(); bottomNav.classList.add('show'); setActiveNav('profile'); try{ localStorage.setItem('fox_active_tab','profile'); }catch(e){} }
  function goDMList(){ hide(viewChat); hide(viewHome); hide(viewSettings); hide(viewFun); hide(viewDooz); show(viewDMList); bottomNav.classList.add('show'); setActiveNav('dms'); try{ localStorage.setItem('fox_active_tab','dms'); }catch(e){} refreshDMList(); }
  function openChat(){ hide(viewHome); hide(viewSettings); hide(viewDMList); hide(viewFun); hide(viewDooz); show(viewChat); bottomNav.classList.add('show'); initChat();
    try { window.foxPushBridge(JSON.stringify({ action: 'active_chat', type: 'group', id: (window.__foxGroup||'main') })); } catch(e) {}
    if((window.__foxGroup||'main')==='main'){ seenCount=lastMessages.length; localStorage.setItem('fox_seen',seenCount); } }
    const viewRegisterCode=document.getElementById('viewRegisterCode');
  const viewLoginCode=document.getElementById('viewLoginCode');
  // Helper: device info
  function getDeviceInfo(){
    try{
      const did = localStorage.getItem('fox_device_id') || (crypto.randomUUID ? crypto.randomUUID() : 'dev_'+Date.now()+'_'+Math.random().toString(36).slice(2,9));
      if(!localStorage.getItem('fox_device_id')) localStorage.setItem('fox_device_id', did);
      return {device: did, ua: navigator.userAgent};
    }catch(e){ return {device:'unknown', ua:navigator.userAgent||''}; }
  }
  function showErr(el, msg){
    if(!el) return;
    el.textContent=msg; el.style.display='block';
    setTimeout(()=>{ try{el.style.display='none';}catch(e){} }, 3000);
  }
  function isValidUsername(u){
    if(!u) return true; // optional
    if(u.length>10) return false;
    if(!/^[A-Za-z][A-Za-z0-9*-]{0,9}$/.test(u)) return false;
    if(u.toLowerCase()==='osine') return false; // reserved
    // no Persian, no space, already covered by regex
    return true;
  }
  function normPhone(p){
    const D={'۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9','٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'};
    let s=String(p==null?'':p).trim();
    s=s.replace(/[۰-۹٠-٩]/g,function(c){ return D[c]||c; });
    s=s.replace(/[\s-()._]/g,'');
    return s;
  }
  function isValidPhone(p){ return /^(?:\+98|0098|98|0)?9\d{9}$/.test(normPhone(p)); }
  function toCanonicalPhone(p){ const s=normPhone(p); const m=s.match(/^(?:\+98|0098|98|0)?(9\d{9})$/); return m?('0'+m[1]):s; }
  // Navigation
  const btnRegister=document.getElementById('btnRegister');
  const btnLogin=document.getElementById('btnLogin');
  function safeNav(fromEl,toEl){ try{ if(fromEl) hide(fromEl); if(toEl) show(toEl); window.scrollTo(0,0); }catch(e){ console.error('nav failed',e); } }
  if(btnRegister){ btnRegister.style.cursor='pointer'; btnRegister.addEventListener('click', e=>{ e.preventDefault(); safeNav(view1, viewLogin); }); btnRegister.addEventListener('touchend', e=>{ e.preventDefault(); safeNav(view1, viewLogin); }, {passive:false}); }
  if(btnLogin){ btnLogin.style.cursor='pointer'; btnLogin.addEventListener('click', e=>{ e.preventDefault(); safeNav(view1, viewLoginCode); }); btnLogin.addEventListener('touchend', e=>{ e.preventDefault(); safeNav(view1, viewLoginCode); }, {passive:false}); }
  // Fallback delegation for any overlay issues
  document.addEventListener('click', e=>{ const t=e.target.closest('#btnRegister'); if(t){ e.preventDefault(); safeNav(view1, viewLogin); } });
  document.addEventListener('click', e=>{ const t=e.target.closest('#btnLogin'); if(t){ e.preventDefault(); safeNav(view1, viewLoginCode); } });
  const loginBackBtn=document.getElementById('loginBackBtn');
  if(loginBackBtn) loginBackBtn.addEventListener('click', ()=>{ hide(viewLogin); show(view1); window.scrollTo(0,0); });
  const loginCodeBackBtn=document.getElementById('loginCodeBackBtn');
  if(loginCodeBackBtn) loginCodeBackBtn.addEventListener('click', ()=>{ hide(viewLoginCode); show(view1); window.scrollTo(0,0); });
  const phoneInput=document.getElementById('phoneInput');
  const phoneErr=document.getElementById('phoneErr');
  if(phoneInput){
    var faDig={'۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9','٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'};
    var cleanPhoneVal=function(v){
      let s=String(v==null?'':v).replace(/[۰-۹٠-٩]/g,function(c){ return faDig[c]||c; });
      s=s.replace(/[^+0-9]/g,'');
      if(s.charAt(0)==='+') s='+'+s.slice(1).replace(/\+/g,'');
      else s=s.replace(/\+/g,'');
      const dg=s.replace(/[^0-9]/g,'');
      if(dg.length>12){
        const c=toCanonicalPhone(s);
        return isValidPhone(c)?c:dg.slice(0,12);
      }
      return s;
    };
    phoneInput.addEventListener('input',function(){
      const v=cleanPhoneVal(phoneInput.value);
      if(v!==phoneInput.value) phoneInput.value=v;
    });
    phoneInput.addEventListener('paste',function(e){
      try{
        const t=(e.clipboardData||window.clipboardData).getData('text')||'';
        if(!t) return;
        e.preventDefault();
        const c=toCanonicalPhone(t);
        phoneInput.value=isValidPhone(c)?c:cleanPhoneVal(t);
      }catch(_){}
    });
  }
  const doRegisterBtn=document.getElementById('doRegisterBtn');
  const regInfo=document.getElementById('regInfo');
  let pendingPhone=null;
  let pendingCode=null;
  if(doRegisterBtn) doRegisterBtn.addEventListener('click', async e=>{
    e.preventDefault();
    const phone=toCanonicalPhone(phoneInput?phoneInput.value.trim():'');
    if(!isValidPhone(phone)){ showErr(phoneErr,'شماره معتبر وارد کنید (مثلاً 09123456789)'); if(phoneInput) phoneInput.focus(); return; }
    if(phoneErr) phoneErr.style.display='none';
    doRegisterBtn.style.pointerEvents='none'; doRegisterBtn.style.opacity='0.7';
    try{
      const dev=getDeviceInfo();
      const r=await fetch('/api/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({phone, device:dev.device, ua:dev.ua})});
      const j=await r.json();
      if(!r.ok || !j.ok){ showErr(phoneErr, j.error||'خطا در ثبت‌نام'); return; }
      try{ if(j.token) localStorage.setItem('fox_session',j.token); }catch(e){}
      if(j.user && j.user.phone) saveCurrentUser(j.user);
      pendingPhone=phone; pendingCode=j.code;
      const disp=document.getElementById('regCodeDisplay');
      if(disp) disp.textContent=j.code;
      hide(viewLogin); show(viewRegisterCode); window.scrollTo(0,0);
    }catch(err){ showErr(phoneErr,'خطا در ارتباط'); }
    finally{ doRegisterBtn.style.pointerEvents=''; doRegisterBtn.style.opacity=''; }
  });
  const copyBtn=document.getElementById('copyCodeBtn');
  const copyMsg=document.getElementById('copyMsg');
  if(copyBtn) copyBtn.addEventListener('click', async ()=>{
    const codeEl=document.getElementById('regCodeDisplay');
    const code=(codeEl?codeEl.textContent.trim():'')||pendingCode||'';
    if(!code) return;
    try{ await navigator.clipboard.writeText(code); if(copyMsg){copyMsg.style.display='block'; setTimeout(()=>copyMsg.style.display='none',1800);} }catch(e){
      // fallback
      const ta=document.createElement('textarea'); ta.value=code; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy'); if(copyMsg){copyMsg.style.display='block'; setTimeout(()=>copyMsg.style.display='none',1800);} }catch(e2){} ta.remove();
    }
  });
  const goProfileBtn=document.getElementById('goProfileBtn');
  if(goProfileBtn) goProfileBtn.addEventListener('click', e=>{
    e.preventDefault();
    const user=(currentUser && currentUser.phone) ? currentUser : {phone:pendingPhone||''};
    showProfileSetup(user);
  });
  const codeLoginInput=document.getElementById('codeLoginInput');
  const codeLoginErr=document.getElementById('codeLoginErr');
  const doLoginBtn=document.getElementById('doLoginBtn');
  if(doLoginBtn) doLoginBtn.addEventListener('click', async e=>{
    e.preventDefault();
    const code=(codeLoginInput?codeLoginInput.value.trim():'').replace(/[۰-۹٠-٩]/g,function(c){ const i='۰۱۲۳۴۵۶۷۸۹'.indexOf(c); return String(i>=0?i:'٠١٢٣٤٥٦٧٨٩'.indexOf(c)); });
    if(!/^\d{6}$/.test(code)){ showErr(codeLoginErr,'کد ۶ رقمی معتبر وارد کنید'); return; }
    if(codeLoginErr) codeLoginErr.style.display='none';
    doLoginBtn.style.pointerEvents='none'; doLoginBtn.style.opacity='0.7';
    try{
      const dev=getDeviceInfo();
      const r=await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code, device:dev.device, ua:dev.ua})});
      const j=await r.json();
      if(!r.ok || !j.ok){ showErr(codeLoginErr, j.error||'کد نادرست است'); return; }
      // The response is server-authoritative. Render it before navigating so
      // an existing avatar/name cannot disappear behind a stale local cache.
      try{ if(j.token) localStorage.setItem('fox_session', j.token); }catch(e){}
      try{ fetch('/api/device',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({phone:j.user.phone, device:dev.device, ua:dev.ua, ts:Date.now()})}).catch(()=>{}); }catch(e){}
      beginAuthenticatedSession(j.user);
    }catch(err){ showErr(codeLoginErr,'خطا در ارتباط'); }
    finally{ doLoginBtn.style.pointerEvents=''; doLoginBtn.style.opacity=''; }
  });
  document.getElementById('backBtn').addEventListener('click', ()=>{ hide(view2); show(viewRegisterCode); window.scrollTo(0,0); });
  document.getElementById('rulesDismiss').addEventListener('click', ()=>{ hide(viewRules); show(view2); window.scrollTo(0,0); });
  const BANNED=['پهلوی شاهزاده','پهلوی','کیر','کس','جنده','کونی','کون','لخت','سکس','پورن','سوسول','حروم','حرومزاده','جق','ممه','آشغال','کص','کسکش','خاله رایگان','بيوچک','بیوچک','بیوچ','فاحشه','دیوث','porn','sex','xxx','nude','fuck','dick','pussy','slut','whore','cock','sexy','naked','horny','ass','booty','tits','penis','vagina','hooker','escort','porno'];
  function hasBadName(n){ const s=' '+(n||'').trim().toLowerCase()+' '; return BANNED.some(w=> s.includes(w)); }
  const avatarInput=document.getElementById('avatarInput');
  const avatarPrev=document.getElementById('avatarPrev');
  const avatarPh=document.querySelector('#avatarWrap .ph');
  if(avatarInput) avatarInput.addEventListener('change', ()=>{ const f=avatarInput.files[0]; if(!f) return; const r=new FileReader(); r.onload=e=>{ avatarPrev.src=e.target.result; avatarPrev.style.display='block'; avatarPh.style.display='none'; }; r.readAsDataURL(f); });
  const nameInput=document.getElementById('nameInput');
  const errToast=document.getElementById('errToast');
  document.getElementById('submitBtn').addEventListener('click', async ()=>{
    const name=nameInput.value.trim();
    if(!name){ errToast.textContent='لطفاً نام را وارد کنید.'; errToast.style.display='block'; nameInput.focus(); setTimeout(()=>errToast.style.display='none',1800); return; }
    if(hasBadName(name)){ errToast.textContent='نام نامناسب تشخیص داده شد. لطفاً نام دیگری انتخاب کنید.'; errToast.style.display='block'; nameInput.focus(); setTimeout(()=>errToast.style.display='none',2600); return; }
    if(name.toLowerCase()==='osine'){ errToast.textContent='این نام رزرو شده است.'; errToast.style.display='block'; setTimeout(()=>errToast.style.display='none',2600); return; }
    const unEl=document.getElementById('userInput'), bioEl=document.getElementById('bioInput');
    const un=unEl?unEl.value.trim().replace(/^@+/,''):'';
    if(un && !isValidUsername(un)){ errToast.textContent='نام کاربری نامعتبر است. مثال معتبر: Goala*saq (حرف اول انگلیسی، حداکثر ۱۰ کاراکتر، فقط حروف انگلیسی، عدد، * یا -)'; errToast.style.display='block'; setTimeout(()=>errToast.style.display='none',3500); return; }
    errToast.style.display='none';
    const avatarSrc = avatarPrev.style.display==='block' ? avatarPrev.src : '';
    const bi=bioEl?bioEl.value.trim():'';
    const phone = pendingPhone || toCanonicalPhone(phoneInput?phoneInput.value.trim():'') || (currentUser?currentUser.phone:'');
    if(!phone){ errToast.textContent='شماره یافت نشد، دوباره ثبت‌نام کنید.'; errToast.style.display='block'; return; }
    const token = localStorage.getItem('fox_session') || '';
    const payload={phone, name, avatar:avatarSrc, username:un, bio:bi, token};
    const headers={'content-type':'application/json'}; if(token) headers.Authorization='Bearer '+token;
    try{
      const r=await fetch('/api/user',{method:'POST',credentials:'same-origin',headers,body:JSON.stringify(payload)});
      const j=await r.json();
      if(!r.ok || !j.ok){ errToast.textContent=j.error||'خطا در ذخیره پروفایل'; errToast.style.display='block'; setTimeout(()=>errToast.style.display='none',3000); return; }
      saveCurrentUser(j.user || {phone, name, avatar:avatarSrc, username:un, bio:bi});
      try{ if(j.token) localStorage.setItem('fox_session', j.token); }catch(e){}
      renderCurrentUser();
      hide(view2); show(viewRules); window.scrollTo(0,0);
    }catch(e){ errToast.textContent='خطا در ارتباط'; errToast.style.display='block'; }
  });
  document.getElementById('rulesConfirm').addEventListener('click', ()=>{ hide(viewRules); beginAuthenticatedSession(currentUser); });
  let lastConvs=[];
  let inboxES=null;
  function peerUser(ph){ const _u=lastUsers.find(x=>x.phone===ph); return _u ? Object.assign({}, _u, {verified:verifiedOf(_u)}) : {phone:ph, name:ph}; }
  function totalUnread(){ return lastConvs.reduce((n,c)=>n+(c.unread||0),0); }
  function updateNavBadge(){
    const b=document.getElementById('navDmBadge'); if(!b) return;
    const n=totalUnread();
    b.style.display = n>0 ? 'flex':'none';
    b.textContent = n>99 ? '99+' : n;
  }
  function renderDMList(){
    const list=document.getElementById('dmList'); if(!list) return;
    const empty=document.getElementById('dmListEmpty');
    list.querySelectorAll('.chat-row').forEach(n=>n.remove());
    if(!lastConvs.length){ if(empty) empty.style.display='block'; return; }
    if(empty) empty.style.display='none';
    lastConvs.slice().sort((a,b)=>b.ts-a.ts).forEach(c=>{
      const u=peerUser(c.peer);
      const row=document.createElement('div');
      row.className='chat-row';
      const av=(u.avatar&&u.avatar.indexOf('data:')===0)?u.avatar:DEFAULT_AVA;
      const pre=(currentUser&&c.from===currentUser.phone)?'شما: ':'';
      const badge=(c.unread>0)?'<div class="cr-badge">'+(c.unread>99?'99+':c.unread)+'</div>':'';
      row.innerHTML='<img loading="lazy" decoding="async" class="cr-ava" src="'+escapeHtml(av)+'"/>'
        +'<div class="cr-main"><div class="cr-name">'+UserNameWithCharacter(u.name||c.peer,c.peer,u.name,c.verified||(u&&u.verified),c.char||(u&&u.activeCharacterId))+'</div>'
        +'<div class="cr-last">'+escapeHtml(pre+snippet(c.last||''))+'</div></div>'
        +'<div class="cr-right"><div class="cr-time">'+fmtTime(c.ts)+'</div>'+badge+'</div>';
      const more=document.createElement('button');more.type='button';more.className='fox-row-more';more.textContent='⋮';more.setAttribute('aria-label','گزینه‌های گفتگوی '+(u.name||u.username||c.peer));more.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(window.foxOpenConversationMenu)window.foxOpenConversationMenu(Object.assign({},u,{phone:c.peer}));});row.appendChild(more);
      row.addEventListener('click', ()=>openDMChat(Object.assign({},u),'dms'));
      list.appendChild(row);
    });
  }
  function applyConvs(cs){
    lastConvs=cs||[];
    updateNavBadge();
    if(!viewDMList.classList.contains('hidden')) renderDMList();
  }
  function loadConvs(cb){
    if(!currentUser||!currentUser.phone) return;
    const need = !lastUsers.length;
    const go = ()=> fetch('/api/convs?me='+encodeURIComponent(currentUser.phone))
      .then(r=>r.json()).then(cs=>{ applyConvs(cs); if(cb) cb(); }).catch(()=>{});
    go();
    if(need) fetchMemberRows().then(us=>{if(Array.isArray(us)){lastUsers=us;if(!viewDMList.classList.contains('hidden'))renderDMList();}}).catch(()=>{});
  }
  function refreshDMList(){
    if(currentUser) document.getElementById('dlAva').src = currentUser.avatar || DEFAULT_AVA;
    renderDMList();
    loadConvs();
  }
  function startInbox(){
    if(inboxES || !currentUser || !currentUser.phone) return;
    try{
      inboxES=new EventSource('/api/inbox?me='+encodeURIComponent(currentUser.phone));
      inboxES.addEventListener('convs', e=>{
        try{
          const cs=JSON.parse(e.data)||[];
          const unknown=cs.some(c=>!lastUsers.some(u=>u.phone===c.peer));
          if(unknown) fetchMemberRows().then(us=>{ lastUsers=us||[]; applyConvs(cs); }).catch(()=>applyConvs(cs));
          else applyConvs(cs);
        }catch(_){}
      });
      inboxES.onerror=()=>{ try{inboxES.close();}catch(_){} inboxES=null; };
    }catch(_){}
  }
  function stopInbox(){ if(inboxES){ try{inboxES.close();}catch(_){} inboxES=null; } }
  function markConvRead(peer){
    if(!currentUser||!currentUser.phone||!peer) return;
    const c=lastConvs.find(x=>x.peer===peer);
    if(c && c.unread){ c.unread=0; updateNavBadge(); renderDMList(); }
    fetch('/api/read',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({me:currentUser.phone,peer})}).catch(()=>{});
  }
  function refreshHome(){
    if(currentUser) document.getElementById('htAva').src = currentUser.avatar || DEFAULT_AVA;
    loadConvs();
    fetch('/api/messages').then(r=>r.json()).then(msgs=>{
      if(Array.isArray(msgs)&&msgs.length){if(!lastMessages||!lastMessages.length){lastMessages=msgs.slice(-300);try{foxRemember('group',lastMessages);}catch(e){}}}
      const total=msgs.length;
      const last=msgs[total-1];
      if(last){ document.getElementById('crLast').innerHTML = UserNameWithCharacter(last.name,last.phone,last.name,last.verified,last.char)+': '+escapeHtml(snippet(last.text)); } else { document.getElementById('crLast').textContent = 'پیامی ثبت نشده'; }
      document.getElementById('crTime').textContent = last? fmtTime(last.ts) : '';
      const unread=Math.max(0, total-seenCount);
      const b=document.getElementById('crBadge');
      b.style.display = unread>0 ? 'flex':'none'; b.textContent=unread;
    }).catch(()=>{});
  }
  document.getElementById('cardGroup').addEventListener('click', openChat);
  document.querySelectorAll('#bottomNav button').forEach(b=>b.addEventListener('click', ()=>{
    const g=b.dataset.go;
    if(g==='home') goHome();
    else if(g==='groups'){ if(window.goGroups) window.goGroups(); else openChat(); }
    else if(g==='dms') goDMList();
    else if(g==='profile'){ settingsFrom='home'; goSettings(); }
  }));
  function initPushSettingsUI() {
    var dmT = document.getElementById('pushDmToggle');
    var grT = document.getElementById('pushGroupToggle');
    var soT = document.getElementById('pushSoundToggle');
    var viT = document.getElementById('pushVibeToggle');
    var statusEl = document.getElementById('notifSaveStatus');
    if (!dmT || !grT || !soT || !viT) return;
    try {
      var s = null;
      try {
        var raw = window.foxPushBridge(JSON.stringify({ action: 'get_settings' }));
        if (raw) s = JSON.parse(raw);
      } catch(e) {}
      if (!s) {
        var cached = localStorage.getItem('fox_push_settings');
        if (cached) s = JSON.parse(cached);
      }
      if (s) {
        dmT.checked = s.dm !== false;
        grT.checked = s.group !== false;
        soT.checked = s.sound !== false;
        viT.checked = s.vibe !== false;
      }
    } catch(e) {}

    var statusTimer = null;
    function showStatus(text, type, duration) {
      if (!statusEl) return;
      clearTimeout(statusTimer);
      statusEl.textContent = text;
      statusEl.className = 'notif-status-badge show' + (type ? ' ' + type : '');
      if (duration) {
        statusTimer = setTimeout(function() {
          statusEl.classList.remove('show');
        }, duration);
      }
    }

    async function saveSettings() {
      var s = {
        dm: dmT.checked,
        group: grT.checked,
        sound: soT.checked,
        vibe: viT.checked
      };
      showStatus('در حال ذخیره...', 'loading', 0);
      try { localStorage.setItem('fox_push_settings', JSON.stringify(s)); } catch(e) {}
      try { window.foxPushBridge(JSON.stringify({ action: 'save_settings', dm: s.dm, group: s.group, sound: s.sound, vibe: s.vibe })); } catch(e) {}
      try {
        var tok = localStorage.getItem('fox_session');
        var did = localStorage.getItem('fox_device_id') || 'web';
        if (tok) {
          var res = await fetch('/api/push/settings', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + tok },
            body: JSON.stringify({ deviceId: did, dm: s.dm, group: s.group, sound: s.sound, vibe: s.vibe })
          });
          if (!res.ok) throw new Error('settings_error');
        }
        showStatus('ذخیره شد ✓', '', 2400);
      } catch(e) {
        showStatus('خطا در همگام‌سازی', 'error', 3000);
      }
    }

    [dmT, grT, soT, viT].forEach(function(el){
      el.onchange = saveSettings;
    });
  }

  window.handleFoxDeepLink = function(data) {
    if (!data) return;
    try {
      if (data.type === 'dm' && data.id) {
        if (typeof openDMChat === 'function') openDMChat({ phone: data.id });
      } else if (data.type === 'group') {
        if (typeof openChat === 'function') openChat();
      }
    } catch(e) {}
  };
  try {
    window.addEventListener('fox-open-chat', function(e) {
      if (e && e.detail) window.handleFoxDeepLink(e.detail);
    });
  } catch(e) {}

  function refreshSettings(){
    try { initPushSettingsUI(); } catch(e) {}
    renderCurrentUser();
    /* Refresh from the authenticated server record each time the profile tab
       opens. This fixes stale/blank fields after registering or logging in. */
    loadAuthoritativeCurrentUser().then(function(user){
      if(!user) return;
      if(!profileIsComplete(user)){ showProfileSetup(user); return; }
      renderCurrentUser();
    }).catch(()=>{});
  }
  document.getElementById('settingsBack').addEventListener('click', ()=>{ if(settingsFrom==='chat') openChat(); else goHome(); });
  let pendingProfileAvatar='';
  let profileSaveInFlight=false;
  function setProfileSaveStatus(message, kind){
    const el=document.getElementById('profileSaveStatus');
    if(!el) return;
    if(!message){ el.textContent=''; el.style.display='none'; return; }
    el.textContent=message;
    el.style.display='block';
    el.style.color=kind==='success' ? '#21834c' : '#d64545';
  }
  function setProfileSaveBusy(busy){
    const btn=document.getElementById('saveProfile2');
    if(!btn) return;
    btn.disabled=!!busy;
    btn.style.opacity=busy?'0.68':'';
    btn.style.pointerEvents=busy?'none':'';
    btn.textContent=busy?'در حال ذخیره...':'ذخیره';
  }
  function selectProfileAvatar(file){
    if(!file) return;
    if(String(file.type||'').indexOf('image/')!==0){ setProfileSaveStatus('فقط فایل تصویری مجاز است.','error'); return; }
    if(file.size>12*1024*1024){ setProfileSaveStatus('حجم عکس باید کمتر از ۱۲ مگابایت باشد.','error'); return; }
    const reader=new FileReader();
    reader.onerror=()=>setProfileSaveStatus('خواندن عکس ناموفق بود.','error');
    reader.onload=ev=>{
      const img=new Image();
      img.onerror=()=>setProfileSaveStatus('این فرمت عکس قابل استفاده نیست.','error');
      img.onload=()=>{
        const maxSide=512;
        const scale=Math.min(1,maxSide/Math.max(img.naturalWidth||1,img.naturalHeight||1));
        const w=Math.max(1,Math.round(img.naturalWidth*scale));
        const h=Math.max(1,Math.round(img.naturalHeight*scale));
        const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
        const ctx=canvas.getContext('2d');
        if(!ctx){ setProfileSaveStatus('آماده‌سازی عکس ناموفق بود.','error'); return; }
        ctx.fillStyle='#FFF8F1'; ctx.fillRect(0,0,w,h); ctx.drawImage(img,0,0,w,h);
        const data=canvas.toDataURL('image/jpeg',0.84);
        if(data.length>720000){ setProfileSaveStatus('حجم عکس برای ذخیره زیاد است؛ عکس کوچک‌تری انتخاب کنید.','error'); return; }
        pendingProfileAvatar=data;
        document.getElementById('setAva').src=data;
        setProfileSaveStatus('عکس آمادهٔ ذخیره شد.','success');
      };
      img.src=String(ev.target&&ev.target.result||'');
    };
    reader.readAsDataURL(file);
  }
  document.getElementById('editProfile2').addEventListener('click', ()=>{
    const area=document.getElementById('editArea2'); area.style.display='block';
    pendingProfileAvatar='';
    const avatarInput=document.getElementById('editAva2'); if(avatarInput) avatarInput.value='';
    setProfileSaveStatus('','');
    if(currentUser){
      document.getElementById('editName2').value=currentUser.name||'';
      document.getElementById('editUser2').value=currentUser.username||'';
      document.getElementById('editBio2').value=currentUser.bio||'';
    }
  });
  document.getElementById('editAvaBtn2').addEventListener('click', ()=>document.getElementById('editAva2').click());
  document.getElementById('editAva2').addEventListener('change', e=>selectProfileAvatar(e.target.files&&e.target.files[0]));
  document.getElementById('saveProfile2').addEventListener('click', async ()=>{
    if(profileSaveInFlight) return;
    if(!currentUser || !currentUser.phone){ setProfileSaveStatus('نشست حساب یافت نشد؛ لطفاً دوباره وارد شوید.','error'); return; }
    const nameInput=document.getElementById('editName2');
    const userInput=document.getElementById('editUser2');
    const nm=nameInput.value.trim();
    const un=userInput.value.trim().replace(/^@+/,'');
    const bio=document.getElementById('editBio2').value.trim();
    const oldName=String(currentUser.name||'').trim();
    const oldUsername=String(currentUser.username||'').trim().replace(/^@+/,'');
    const oldBio=String(currentUser.bio||'').trim();
    if(!nm){ setProfileSaveStatus('نام را وارد کنید.','error'); nameInput.focus(); return; }
    if(nm!==oldName && hasBadName(nm)){ setProfileSaveStatus('نام انتخاب‌شده مناسب نیست.','error'); nameInput.focus(); return; }
    if(un!==oldUsername && un && !isValidUsername(un)){ setProfileSaveStatus('نام کاربری باید با حرف انگلیسی شروع شود و حداکثر ۱۰ کاراکتر باشد.','error'); userInput.focus(); return; }
    const draft={phone:currentUser.phone};
    if(nm!==oldName) draft.name=nm;
    if(un!==oldUsername) draft.username=un;
    if(bio!==oldBio) draft.bio=bio;
    if(pendingProfileAvatar) draft.avatar=pendingProfileAvatar;
    if(Object.keys(draft).length===1){ setProfileSaveStatus('تغییری برای ذخیره ندارید.','success'); return; }
    let profileToken=''; try{ profileToken=String(localStorage.getItem('fox_session')||''); }catch(e){}
    draft.profileRevision=Number(currentUser.profileRevision)||0;
    const profileHeaders={'content-type':'application/json'}; if(profileToken) profileHeaders['Authorization']='Bearer '+profileToken;
    profileSaveInFlight=true; setProfileSaveBusy(true); setProfileSaveStatus('','');
    try{
      const r=await fetch('/api/user',{method:'POST',credentials:'same-origin',headers:profileHeaders,body:JSON.stringify(draft)});
      const j=await r.json().catch(()=>({}));
      if(!r.ok || !j.ok){ setProfileSaveStatus((j&& (j.message||j.error))||'ذخیره پروفایل ناموفق بود.','error'); return; }
      saveCurrentUser(j.user||Object.assign({},currentUser,draft));
      if(j.token) try{ localStorage.setItem('fox_session',j.token); }catch(e){}
      pendingProfileAvatar='';
      renderCurrentUser();
      setProfileSaveStatus('پروفایل با موفقیت ذخیره شد.','success');
      setTimeout(()=>{ if(!profileSaveInFlight) document.getElementById('editArea2').style.display='none'; },650);
    }catch(e){ setProfileSaveStatus('خطای ارتباط در ذخیره پروفایل. دوباره تلاش کنید.','error');
    }finally{
      profileSaveInFlight=false; setProfileSaveBusy(false);
    }
  });
  // ===== logout confirm dialog =====
  function doLogout(){
    document.documentElement.classList.remove('has-auth-session');
    authenticatedViewEpoch++;
    let oldToken=''; try{ oldToken=localStorage.getItem('fox_session')||''; }catch(e){}
    try{ const h=oldToken?{'content-type':'application/json','Authorization':'Bearer '+oldToken}:{'content-type':'application/json'}; fetch('/api/auth/logout',{method:'POST',credentials:'same-origin',keepalive:true,headers:h,body:JSON.stringify({})}).catch(()=>{}); }catch(e){}
    localStorage.removeItem('fox_user'); localStorage.removeItem('fox_session'); try{localStorage.removeItem('fox_last_phone');}catch(e){} currentUser=null;if(window.FoxWallet)window.FoxWallet.reset();
    if(es){ try{es.close();}catch(_){} es=null; }
    if(pollTimer){ clearInterval(pollTimer); pollTimer=null; }
    stopInbox(); stopDMStream();
    lastConvs=[];dmMessages=[];lastMessages=[]; updateNavBadge();
    bottomNav.classList.add('show');
    hide(viewSettings); hide(viewChat); hide(viewDMList); hide(viewDM); show(view1); window.scrollTo(0,0);
  }
  // ===== Delete Account Client Logic =====
  const delAccBtn = document.getElementById('deleteAccountBtn');
  const delAccOv = document.getElementById('delAccOv');
  const delAccConfirmBtn = document.getElementById('delAccConfirmBtn');
  const delAccCancelBtn = document.getElementById('delAccCancelBtn');
  const delAccBtnText = document.getElementById('delAccBtnText');
  const delAccBtnSpinner = document.getElementById('delAccBtnSpinner');
  const delAccErrMsg = document.getElementById('delAccErrMsg');

  function openDelAccModal() {
    if (delAccErrMsg) { delAccErrMsg.style.display = 'none'; delAccErrMsg.textContent = ''; }
    if (delAccConfirmBtn) { delAccConfirmBtn.disabled = false; }
    if (delAccCancelBtn) { delAccCancelBtn.disabled = false; }
    if (delAccBtnText) { delAccBtnText.textContent = 'حذف حساب کاربری'; }
    if (delAccBtnSpinner) { delAccBtnSpinner.style.display = 'none'; }
    if (delAccOv) { delAccOv.classList.add('show'); }
  }

  function closeDelAccModal() {
    if (delAccOv) { delAccOv.classList.remove('show'); }
  }

  if (delAccBtn) delAccBtn.addEventListener('click', openDelAccModal);
  if (delAccCancelBtn) delAccCancelBtn.addEventListener('click', closeDelAccModal);
  if (delAccOv) delAccOv.addEventListener('click', (e) => {
    if (e.target.id === 'delAccOv') closeDelAccModal();
  });

  let delAccInProgress = false;
  async function performAccountDeletion() {
    if (delAccInProgress) return;
    delAccInProgress = true;
    delAccConfirmBtn.disabled = true;
    delAccCancelBtn.disabled = true;
    delAccBtnText.textContent = 'در حال حذف حساب کاربری...';
    delAccBtnSpinner.style.display = 'inline-block';
    delAccErrMsg.style.display = 'none';

    let token = '';
    try { token = localStorage.getItem('fox_session') || ''; } catch(e) {}

    try {
      const headers = { 'content-type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        credentials: 'same-origin',
        headers,
        body: JSON.stringify({ token })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'خطایی در حذف حساب رخ داد. لطفاً دوباره تلاش کنید.');
      }

      // Deletion confirmed by server!
      closeDelAccModal();
      openAppModal('حساب حذف شد', '<p style="text-align:center;padding:12px;font-weight:700;color:#16A34A;">حساب شما با موفقیت حذف شد.</p>');

      // Thorough local cleanup
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch(e) {}

      document.documentElement.classList.remove('has-auth-session');
      authenticatedViewEpoch++;
      currentUser = null;
      if (window.FoxWallet) window.FoxWallet.reset();
      if (es) { try { es.close(); } catch(_) {} es = null; }
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      stopInbox(); stopDMStream();
      lastConvs = []; dmMessages = []; lastMessages = []; updateNavBadge();
      bottomNav.classList.add('show');

      // Prevent back navigation
      try {
        history.pushState(null, '', '/');
        history.replaceState(null, '', '/');
        window.onpopstate = function() { history.pushState(null, '', '/'); };
      } catch(e) {}

      setTimeout(() => {
        hide(viewSettings); hide(viewHome); hide(viewChat); hide(viewDMList); hide(viewDM); hide(viewFun);
        show(view1); window.scrollTo(0, 0);
      }, 1200);

    } catch (err) {
      delAccErrMsg.textContent = err.message || 'خطا در ارتباط با سرور';
      delAccErrMsg.style.display = 'block';
      delAccConfirmBtn.disabled = false;
      delAccCancelBtn.disabled = false;
      delAccBtnText.textContent = 'حذف حساب کاربری';
      delAccBtnSpinner.style.display = 'none';
      delAccInProgress = false;
    }
  }

  if (delAccConfirmBtn) delAccConfirmBtn.addEventListener('click', performAccountDeletion);

  function openLogoutDialog(){ document.getElementById('logoutOv').classList.add('show'); }
  function closeLogoutDialog(){ document.getElementById('logoutOv').classList.remove('show'); }
  document.getElementById('logoutBtn2').addEventListener('click', openLogoutDialog);
  document.getElementById('lgCancel').addEventListener('click', closeLogoutDialog);
  document.getElementById('logoutOv').addEventListener('click',(e)=>{ if(e.target.id==='logoutOv') closeLogoutDialog(); });
  document.getElementById('lgConfirm').addEventListener('click', ()=>{ closeLogoutDialog(); doLogout(); });
  document.getElementById('menuBtn').addEventListener('click', ()=>{ document.getElementById('groupDrawer').classList.add('open'); document.getElementById('groupOverlay').classList.add('show'); });
  document.getElementById('groupDrawerClose').addEventListener('click', ()=>{ document.getElementById('groupDrawer').classList.remove('open'); document.getElementById('groupOverlay').classList.remove('show'); });
  document.getElementById('groupOverlay').addEventListener('click', ()=>{ document.getElementById('groupDrawer').classList.remove('open'); document.getElementById('groupOverlay').classList.remove('show'); });
  document.getElementById('gmMembers').addEventListener('click', ()=>{ document.getElementById('groupDrawer').classList.remove('open'); document.getElementById('groupOverlay').classList.remove('show'); openMembers(); });
  let groupNotif=true;
  document.getElementById('gmNotif').addEventListener('click', ()=>{ groupNotif=!groupNotif; document.getElementById('gmNotif').textContent='🔔 اعلان‌های گروه: '+(groupNotif?'روشن':'خاموش'); });
  document.getElementById('gmSearch').addEventListener('click', ()=>{ document.getElementById('groupDrawer').classList.remove('open'); document.getElementById('groupOverlay').classList.remove('show'); openAppModal('جستجو در گروه', '<input id="amInput" placeholder="عبارت مورد نظر..."/>', [ {label:'انصراف',primary:false}, {label:'جستجو',primary:true,onClick:()=>{ const q=document.getElementById('amInput').value.trim(); if(q){ const f=lastMessages.filter(m=> ((m.text||'')+'').includes(q) || ((m.name||'')+'').includes(q)); renderMessages(f.length?f:lastMessages); } }} ]); setTimeout(()=>{ const i=document.getElementById('amInput'); if(i) i.focus(); },50); });
  document.getElementById('gmInfo').addEventListener('click', ()=>{ document.getElementById('groupDrawer').classList.remove('open'); document.getElementById('groupOverlay').classList.remove('show'); document.getElementById('infoTitle').textContent='گروه روباه'; document.getElementById('infoBody').textContent='یک گروه عمومی برای چت و گفتگو. تعداد اعضا در بالای صفحه نمایش داده می‌شود.'; document.getElementById('infoModal').classList.add('show'); });
  document.getElementById('gmShare').addEventListener('click', ()=>{ document.getElementById('groupDrawer').classList.remove('open'); document.getElementById('groupOverlay').classList.remove('show'); const link=location.href; if(navigator.share){ navigator.share({title:'گروه روباه',url:link}).catch(()=>{}); } else { navigator.clipboard.writeText(link).then(()=>openAppModal('اشتراک‌گذاری','لینک گروه کپی شد.',[{label:'باشه',primary:true}])).catch(()=>openAppModal('اشتراک‌گذاری','لینک گروه: '+link,[{label:'باشه',primary:true}])); } });
  document.getElementById('infoClose').addEventListener('click', ()=>{ document.getElementById('infoModal').classList.remove('show'); });
  function openAppModal(title, bodyHtml, actions){
    document.getElementById('amTitle').textContent=title;
    document.getElementById('amBody').innerHTML=bodyHtml;
    const ac=document.getElementById('amActions'); ac.innerHTML='';
    (actions||[]).forEach(a=>{
      const b=document.createElement('button');
      b.className='am-btn '+(a.primary?'primary':'ghost');
      b.textContent=a.label;
      b.onclick=()=>{ if(a.onClick) a.onClick(); if(a.close!==false) closeAppModal(); };
      ac.appendChild(b);
    });
    document.getElementById('amOverlay').classList.add('show');
    document.getElementById('appModal').classList.add('show');
  }
  function closeAppModal(){
    document.getElementById('amOverlay').classList.remove('show');
    document.getElementById('appModal').classList.remove('show');
  }
  document.getElementById('amOverlay').addEventListener('click', closeAppModal);
  function closeMembersModal(){ document.getElementById('membersOverlay').classList.remove('show'); document.getElementById('membersModal').classList.remove('show'); }
  let upBlocked=[];
  function loadBlocks(){ if(!currentUser||!currentUser.phone) return; fetch('/api/block?me='+encodeURIComponent(currentUser.phone)).then(r=>r.json()).then(a=>{ upBlocked=a||[]; }).catch(()=>{}); }
  function fmtLastSeen(ts){
    if(!ts) return '';
    const d=Date.now()-ts;
    if(d<60000) return 'همین الان';
    if(d<3600000) return 'آخرین بازدید '+Math.floor(d/60000)+' دقیقه پیش';
    if(d<86400000) return 'آخرین بازدید '+Math.floor(d/3600000)+' ساعت پیش';
    return 'آخرین بازدید '+Math.floor(d/86400000)+' روز پیش';
  }
  function avatarFor(ph, fallback){
    if(ph==='bot_fox') return '/static/50cfb82dfb86fb6826d12c128df7c367a4e2e4a32e3b23dd4eb80f5ee797c5c1.webp';
    var profile=window.FoxProfile&&window.FoxProfile.get(ph);if(profile)return profile.avatar||DEFAULT_AVA;
    if(currentUser && ph && ph===currentUser.phone && currentUser.avatar) return currentUser.avatar;
    const u = ph ? lastUsers.find(x=>x.phone===ph) : null;
    if(u && u.avatar && u.avatar.indexOf('data:')===0) return u.avatar;
    if(fallback && String(fallback).indexOf('data:')===0) return fallback;
    return DEFAULT_AVA;
  }
  function userFromMsg(mm){
    if(!mm) return null;
    if(mm.isBot || mm.phone==='bot_fox') return null;
    if(mm.deletedUser || mm.name === 'حساب کاربری حذف شده') {
      return { phone: '', name: 'حساب کاربری حذف شده', avatar: DEFAULT_AVA, username: '', bio: '', verified: false, activeCharacterId: '', deletedUser: true };
    }
    let ph=mm.phone, fu=null;
    if(ph) fu=lastUsers.find(u=>u.phone===ph);
    if(!fu && !ph && lastUsers.length){ fu=lastUsers.find(u=>u.name===mm.name); if(fu) ph=fu.phone; }
    if(!fu && currentUser && ph && ph===currentUser.phone) fu=currentUser;
    const base={phone:ph, name:(fu&&fu.name)||mm.name, avatar:(fu&&fu.avatar)||mm.avatar};
    if(fu){ base.username=fu.username; base.bio=fu.bio; base.role=fu.role; base.lastSeen=fu.lastSeen; base.verified=verifiedOf(fu); base.activeCharacterId=fu.activeCharacterId||''; } 
    if(!base.verified && (mm.verified || mm.username && String(mm.username).toLowerCase()==='osine' || mm.name && String(mm.name).toLowerCase()==='osine')) base.verified=true;
    return base;
  }
  function renderUserProfile(u){
    if(window.FoxProfile)u=window.FoxProfile.merge(u);
    const isSelf=!!(currentUser&&u.phone&&u.phone===currentUser.phone);
    document.getElementById('upAva').src=(u.avatar&&u.avatar.indexOf('data:')===0)?u.avatar:DEFAULT_AVA;
    document.getElementById('upName').textContent=u.name||'بدون نام';
    try{
      const _un=document.getElementById('upName');
      if(verifiedOf(u) && _un && !_un.querySelector('.verified-badge')){
        const _b=document.createElement('span'); _b.className='verified-badge'; _b.title='تیم آبی';
        _b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
        _un.appendChild(_b);
      }
      try{ if(window.applyCharToName) window.applyCharToName(_un, u); }catch(e2){}
    }catch(e){}
    const un=document.getElementById('upUsername');
    if(u.username){ un.textContent='@'+u.username; un.style.display='block';if(window.applyCharToName)window.applyCharToName(un,u); } else { un.style.display='none'; un.textContent=''; }
    const bio=document.getElementById('upBio');
    if(u.bio){ bio.textContent=u.bio; bio.style.display='block'; } else { bio.style.display='none'; bio.textContent=''; }
    const st=document.getElementById('upStatus'), dot=document.getElementById('upDot'), stt=document.getElementById('upStatusText');
    if(u.lastSeen){
      const online=(u.online===true) || (u.online===undefined && (Date.now()-u.lastSeen)<70000);
      dot.className='up-dot'+(online?' on':'');
      stt.textContent= online ? 'آنلاین' : fmtLastSeen(u.lastSeen);
      st.style.display='flex';
    } else { st.style.display='none'; }
    const chips=document.getElementById('upChips'); chips.innerHTML='';
    if(verifiedOf(u)){ const _cb=document.createElement('span'); _cb.className='up-chip blue'; _cb.textContent='تیم آبی'; chips.appendChild(_cb); }
    const c1=document.createElement('span'); c1.className='up-chip'; c1.textContent='عضو گروه روباه'; chips.appendChild(c1);
    if(u.role){ const c2=document.createElement('span'); c2.className='up-chip role'; c2.textContent=(u.role==='owner'?'مالک گروه':(u.role==='admin'?'مدیر گروه':u.role)); chips.appendChild(c2); }
    if(isSelf){ const c3=document.createElement('span'); c3.className='up-chip'; c3.textContent='شما'; chips.appendChild(c3); }
    const hasDM=!!(currentUser&&currentUser.phone&&u.phone);
    document.getElementById('upMsg').style.display=(!isSelf&&hasDM)?'inline-block':'none';
    document.getElementById('upEdit').style.display=isSelf?'inline-block':'none';
    document.getElementById('upReport').style.display=isSelf?'none':'inline-block';
    const bbtn=document.getElementById('upBlock');
    bbtn.style.display=(isSelf||!u.phone)?'none':'inline-block';
    const isB=u.phone&&upBlocked.indexOf(u.phone)>=0;
    bbtn.textContent=isB?'✅ رفع مسدودی':'🚫 مسدود';
    document.getElementById('upKebab').style.display=isSelf?'none':'block';
    document.getElementById('upKMsg').style.display=(!isSelf&&hasDM)?'block':'none';
    document.getElementById('upKCopy').style.display=u.username?'block':'none';
  }
  window.openUserProfile=openUserProfile;function openUserProfile(u, ret){
    if(!u || u.deletedUser || u.name === 'حساب کاربری حذف شده') {
      openAppModal('حساب کاربری حذف شده', '<p style="text-align:center;padding:12px;font-size:14px;color:#64748B;">این حساب کاربری حذف شده است و پروفایل آن در دسترس نمی‌باشد.</p>');
      return;
    }
    upTarget=Object.assign({},u); upReturn=ret;
    document.getElementById('upKMenu').classList.remove('show');
    renderUserProfile(upTarget);
    document.getElementById('upOverlay').classList.add('show');
    document.getElementById('upModal').classList.add('show');
    if(u.phone){
      fetch('/api/user?phone='+encodeURIComponent(u.phone)).then(r=>r.json()).then(fresh=>{
        if(fresh&&fresh.phone&&upTarget&&upTarget.phone===fresh.phone){ upTarget=Object.assign({},upTarget,fresh); renderUserProfile(upTarget); }
      }).catch(()=>{});
    }
  }
  // ===== floating search =====
  let hsTimer=null, hsUsers=null;
  function hsEsc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  const GROUPS=[{id:'fox',name:'گروه روباه'}];
  function hsRender(list, groups, q){
    const box=document.getElementById('searchResults');
    if(!q){ box.innerHTML='<div class="sr-empty">نام کاربر، @یوزرنیم یا نام گروه را بنویسید</div>'; return; }
    let h='';
    if(groups.length){
      h+='<div class="sr-sec">گروه‌ها</div>';
      h+=groups.map(g=>'<div class="sr-row" data-grp="'+hsEsc(g.id)+'">'
        +'<img loading="lazy" decoding="async" src="'+hsEsc(DEFAULT_AVA)+'" data-act="grp"/>'
        +'<div class="sr-main" data-act="grp"><div class="sr-name">'+hsEsc(g.name)+'</div></div>'
        +'<button class="sr-open" data-act="grp">باز کردن</button></div>').join('');
    }
    if(list.length){
      h+='<div class="sr-sec">کاربران</div>';
      h+=list.slice(0,25).map(u=>{
        const av=(u.avatar&&u.avatar.indexOf('data:')===0)?u.avatar:DEFAULT_AVA;
        const self=!!(currentUser&&u.phone===currentUser.phone);
        return '<div class="sr-row" data-ph="'+hsEsc(u.phone)+'">'
          +'<img loading="lazy" decoding="async" src="'+hsEsc(av)+'" data-act="profile"/>'
          +'<div class="sr-main" data-act="profile"><div class="sr-name">'+UserNameWithCharacter(u.name||'بدون نام',u.phone,u.name,u.verified,u.activeCharacterId)+'</div>'
          +(u.username?'<div class="sr-user">@'+hsEsc(u.username)+'</div>':'')+'</div>'
          +(self?'':'<button class="sr-msg" data-act="dm">پیام</button>')
          +'</div>';
      }).join('');
    }
    box.innerHTML = h || '<div class="sr-empty">نتیجه‌ای پیدا نشد</div>';
  }
  function hsFilter(q){
    const s=q.trim().toLowerCase().replace(/^@/,'');
    if(!s){ hsRender([],[],''); return; }
    const arr=(hsUsers||lastUsers||[]);
    const out=arr.filter(u=>{
      const un=(u.username||'').toLowerCase(), nm=(u.name||'').toLowerCase(), ph=(u.phone||'');
      return un.indexOf(s)>=0 || nm.indexOf(s)>=0 || ph.indexOf(s)>=0;
    }).sort((a,b)=>{
      const au=(a.username||'').toLowerCase(), bu=(b.username||'').toLowerCase();
      return (au.indexOf(s)===0?0:1)-(bu.indexOf(s)===0?0:1);
    });
    const gs=GROUPS.filter(g=>g.name.toLowerCase().indexOf(s)>=0);
    hsRender(out,gs,s);
  }
  function openSearch(){
    const ov=document.getElementById('searchOv'), inp=document.getElementById('homeSearch');
    ov.classList.add('show'); inp.value=''; hsRender([],[],'');
    fetchMemberRows().then(us=>{ if(us&&us.length){ hsUsers=us; lastUsers=us; } }).catch(()=>{});
    setTimeout(()=>{ try{inp.focus();}catch(_){} },120);
  }
  function closeSearch(){
    const ov=document.getElementById('searchOv'), inp=document.getElementById('homeSearch');
    ov.classList.remove('show'); inp.value=''; hsRender([],[],'');
    try{ inp.blur(); }catch(_){}
  }
  function hsInit(){
    const inp=document.getElementById('homeSearch'); if(!inp) return;
    const fab=document.getElementById('searchFab'), ov=document.getElementById('searchOv');
    fab.addEventListener('click', openSearch);
    document.getElementById('homeSearchX').addEventListener('click', closeSearch);
    ov.addEventListener('click',(e)=>{ if(e.target===ov) closeSearch(); });
    document.addEventListener('keydown',(e)=>{ if(e.key==='Escape'&&ov.classList.contains('show')) closeSearch(); });
    inp.addEventListener('input', ()=>{
      const v=inp.value;
      if(hsTimer) clearTimeout(hsTimer);
      hsTimer=setTimeout(()=>{
        hsFilter(v);
        fetchMemberRows().then(us=>{ if(us&&us.length){ hsUsers=us; lastUsers=us; if(inp.value===v) hsFilter(v); } }).catch(()=>{});
      },140);
    });
    document.getElementById('searchResults').addEventListener('click', (e)=>{
      const row=e.target.closest('.sr-row'); if(!row) return;
      if(row.getAttribute('data-grp')){ closeSearch(); try{ openChat(); }catch(_){} return; }
      const ph=row.getAttribute('data-ph');
      const u=(hsUsers||lastUsers||[]).find(z=>z.phone===ph); if(!u) return;
      const t=e.target.closest('[data-act]');
      const act=t?t.getAttribute('data-act'):'profile';
      if(act==='dm'){ closeSearch(); openDMChat(u,'home'); }
      else { closeSearch(); openUserProfile(u,'home'); }
    });
    // keep FAB in sync with the bottom nav visibility
    const nav=document.getElementById('bottomNav');
    const alignFab=()=>{
      const pb=nav.querySelector('button[data-go="profile"]'); if(!pb) return;
      const r=pb.getBoundingClientRect(); if(!r.width) return;
      fab.style.left=Math.round(r.left+r.width/2-23)+'px';
      fab.style.bottom=Math.round(innerHeight-nav.getBoundingClientRect().top+14)+'px';
    };
    const sync=()=>{ const on=nav.classList.contains('show'); fab.classList.toggle('show', on); if(on){ requestAnimationFrame(alignFab); } else closeSearch(); };
    addEventListener('resize', ()=>{ if(nav.classList.contains('show')) alignFab(); });
    new MutationObserver(sync).observe(nav,{attributes:true,attributeFilter:['class']});
    sync();
  }
  try{ hsInit(); }catch(_){ document.addEventListener('DOMContentLoaded',()=>{try{hsInit();}catch(e){}}); }
  // ===== admin panel =====
  let adPass=null, adData={users:[],messages:[]}, adTab='users';
  function adApi(path, body){
    return fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({pass:adPass},body||{}))}).then(r=>r.json());
  }
  function adEsc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function openAdminGate(){
    adPass=null;
    document.getElementById('adErr').style.display='none';
    document.getElementById('adPass').value='';
    document.getElementById('adGateOv').classList.add('show');
    setTimeout(()=>{ try{document.getElementById('adPass').focus();}catch(_){} },120);
  }
  function closeAdminGate(){ document.getElementById('adGateOv').classList.remove('show'); }
  function tryAdminPass(){
    const v=document.getElementById('adPass').value.trim();
    fetch('/api/admin/auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pass:v})})
      .then(r=>r.json()).then(d=>{
        if(d&&d.ok){ adPass=v; closeAdminGate(); openAdmin(); }
        else { document.getElementById('adErr').style.display='block'; document.getElementById('adPass').value=''; }
      }).catch(()=>{ document.getElementById('adErr').style.display='block'; });
  }
  function openAdmin(){
    hide(viewHome); hide(viewSettings); hide(viewChat); hide(viewDMList); hide(viewDM); hide(viewFun);
    show(viewAdmin); bottomNav.classList.add('show');
    loadAdmin();
  }
  function closeAdmin(){ hide(viewAdmin); show(viewHome); refreshHome(); bottomNav.classList.add('show'); setActiveNav('home'); }
  let adminLoadSeq=0;
  function loadAdmin(offset){
    const seq=++adminLoadSeq,append=typeof offset==='number';
    let status=document.getElementById('adLoadStatus');if(!status){status=document.createElement('div');status.id='adLoadStatus';status.setAttribute('role','status');document.querySelector('#viewAdmin .ad-body').prepend(status);}
    status.textContent='در حال دریافت اطلاعات مدیریت…';
    adApi('/api/admin/state',{offset:append?offset:0}).then(d=>{
      if(seq!==adminLoadSeq)return;
      if(!d||!d.ok)throw new Error(d&&d.error||'unavailable');
      adData=append?Object.assign({},d,{users:adData.users.concat(d.users||[]),messages:adData.messages}):d;renderAdmin();status.textContent='';if(d.unavailableRecords||d.messagesUnavailable){status.textContent='بخشی از اطلاعات موقتاً دریافت نشد. ';const retry=document.createElement('button');retry.textContent='به‌روزرسانی';retry.className='ad-btn';retry.onclick=()=>loadAdmin();status.appendChild(retry);}
      const more=document.getElementById('adLoadMore');if(more)more.remove();
      if(d.nextOffset!==null&&d.nextOffset!==undefined){const button=document.createElement('button');button.id='adLoadMore';button.className='ad-btn';button.textContent='نمایش کاربران بیشتر';button.onclick=()=>loadAdmin(d.nextOffset);document.getElementById('adUsers').appendChild(button);}
    }).catch(err=>{if(seq!==adminLoadSeq)return;status.textContent=(err.message==='auth'||err.message==='denied')?'دسترسی مدیریت تأیید نشد. دوباره وارد حساب مجاز شوید.':'دریافت اطلاعات مدیریت ناموفق بود؛ صفحه بسته نشده است. ';const retry=document.createElement('button');retry.textContent='تلاش مجدد';retry.className='ad-btn';retry.onclick=()=>loadAdmin(append?offset:undefined);status.appendChild(retry);});
  }
  function renderAdmin(){
    const ub=document.getElementById('adUsers'), mb=document.getElementById('adMsgs');
    const me=currentUser&&currentUser.phone;
    const us=(adData.users||[]).slice().sort((a,b)=>(b.lastSeen||0)-(a.lastSeen||0));
    ub.innerHTML = us.length? us.map(u=>{
      if(u.dataUnavailable)return '<div class="ad-card"><b>'+adEsc(u.name||u.phone)+'</b><p>اطلاعات این حساب موقتاً دریافت نشد؛ سایر حساب‌ها در دسترس‌اند.</p></div>';
      const av=(u.avatar&&u.avatar.indexOf('data:')===0)?u.avatar:DEFAULT_AVA;
      const m=u.mod||{};
      const tag = m.banned? '<span class="ad-tag ban">مسدود</span>'
                : m.muted? '<span class="ad-tag mute">محدود</span>'
                : '<span class="ad-tag ok">فعال</span>';
      const self = me && u.phone===me;
      return '<div class="ad-card"><div class="ad-u"><img loading="lazy" decoding="async" src="'+adEsc(av)+'"/><div class="n"><b><span class="nmtx">'+UserNameWithCharacter(u.name||'بدون نام',u.phone,u.name,false,'')+'</span>'+(u.verified?teamBadgeHtml():'')+tag+'</b><span>'+adEsc(u.username?('@'+u.username):u.phone)+'</span></div></div>'
        +'<div class="ad-acts" data-ph="'+adEsc(u.phone)+'">'
        +(self?'':(m.banned
            ? '<button class="ad-btn good" data-a="unban">رفع مسدودی</button>'
            : '<button class="ad-btn danger" data-a="ban">مسدود کردن</button>'))
        +(self?'':(m.muted
            ? '<button class="ad-btn good" data-a="unmute">رفع محدودیت</button>'
            : '<button class="ad-btn warn" data-a="mute" data-min="60">محدود ۱ ساعت</button>'
              +'<button class="ad-btn warn" data-a="mute" data-min="1440">محدود ۱ روز</button>'))
        +'<button class="ad-btn danger" data-a="purge">حذف همه پیام‌ها</button>'
        +'</div></div>';
    }).join('') : '<div class="ad-empty">کاربری نیست</div>';
    const ms=(adData.messages||[]).slice().reverse();
    if(adData.messagesUnavailable){mb.textContent='دریافت پیام‌ها موقتاً ناموفق بود؛ فهرست کاربران همچنان در دسترس است.';return;}
    mb.innerHTML = ms.length? ms.map(m=>'<div class="ad-card"><div class="ad-mh"><b>'+UserNameWithCharacter(m.name||'',m.phone,m.name,false,'')+'</b><span>'+adEsc(fmtTime(m.ts))+'</span></div>'
      +'<div class="ad-m">'+adEsc(m.text||'')+'</div>'
      +'<div class="ad-acts" data-id="'+adEsc(m.id)+'"><button class="ad-btn danger" data-a="delmsg">حذف پیام</button></div></div>').join('')
      : '<div class="ad-empty">پیامی نیست</div>';
  }
  function adInit(){
    const gm=document.getElementById('gmAdmin');
    if(gm) gm.addEventListener('click', ()=>{
      document.getElementById('groupDrawer').classList.remove('open');
      document.getElementById('groupOverlay').classList.remove('show');
      openAdminGate();
    });
    document.getElementById('adEnter').addEventListener('click', tryAdminPass);
    document.getElementById('adPass').addEventListener('keydown', e=>{ if(e.key==='Enter') tryAdminPass(); });
    document.getElementById('adGateX').addEventListener('click', closeAdminGate);
    document.getElementById('adGateOv').addEventListener('click', e=>{ if(e.target.id==='adGateOv') closeAdminGate(); });
    document.getElementById('adBack').addEventListener('click', ()=>{ adPass=null; closeAdmin(); });
    document.querySelectorAll('.ad-tab').forEach(t=>t.addEventListener('click', ()=>{
      adTab=t.dataset.tab;
      document.querySelectorAll('.ad-tab').forEach(x=>x.classList.toggle('active',x===t));
      document.getElementById('adUsers').style.display = adTab==='users'?'block':'none';
      document.getElementById('adMsgs').style.display = adTab==='msgs'?'block':'none';
    }));
    document.getElementById('adUsers').addEventListener('click', (e)=>{
      const b=e.target.closest('.ad-btn'); if(!b) return;
      const ph=b.closest('.ad-acts').getAttribute('data-ph'); const a=b.dataset.a;
      b.disabled=true;
      if(a==='purge'){
        if(!confirm('حذف همه پیام‌های این کاربر در گروه؟')){ b.disabled=false; return; }
        adApi('/api/admin/purgeuser',{phone:ph}).then(loadAdmin);
      } else {
        adApi('/api/admin/mod',{phone:ph,action:a,minutes:parseInt(b.dataset.min||'60',10)}).then(loadAdmin);
      }
    });
    document.getElementById('adMsgs').addEventListener('click', (e)=>{
      const b=e.target.closest('.ad-btn'); if(!b) return;
      const id=b.closest('.ad-acts').getAttribute('data-id');
      b.disabled=true;
      adApi('/api/admin/delmsg',{id:id}).then(loadAdmin);
    });
  }
  try{ adInit(); }catch(_){ document.addEventListener('DOMContentLoaded',()=>{try{adInit();}catch(e){}}); }
  function closeUserProfile(){ document.getElementById('upKMenu').classList.remove('show'); document.getElementById('upOverlay').classList.remove('show'); document.getElementById('upModal').classList.remove('show'); }
  function reportUser(){
    const u=upTarget; if(!u) return;
    openAppModal('گزارش کاربر','<textarea id="amText" rows="3" placeholder="علت گزارش را بنویسید..."></textarea>',[ {label:'انصراف',primary:false}, {label:'ارسال',primary:true,onClick:()=>{ const r=document.getElementById('amText').value.trim(); if(r){ fetch('/api/report',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:'user:'+(u.phone||''),name:u.name,text:'گزارش کاربر',reason:r})}).catch(()=>{}); } }} ]);
  }
  function toggleBlockUser(){
    const u=upTarget; if(!u||!u.phone||!currentUser||!currentUser.phone) return;
    const isB=upBlocked.indexOf(u.phone)>=0;
    fetch('/api/block',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({me:currentUser.phone,other:u.phone,unblock:isB})})
      .then(r=>r.json()).then(res=>{ upBlocked=res.blocked||[]; renderUserProfile(upTarget); renderMessages(lastMessages); }).catch(()=>{});
  }
  let dmES=null, dmReplyTarget=null;
  function dmKeyOf(a,b){ return [a,b].sort().join('_'); }
  window.openDMChat=openDMChat;function openDMChat(target, ret){
    if(!target || !target.phone){ openAppModal('چت خصوصی','این کاربر شناسه معتبری ندارد.',[{label:'باشه',primary:true}]); return; }
    if(!currentUser || !currentUser.phone){ openAppModal('چت خصوصی','ابتدا وارد حساب شوید.',[{label:'باشه',primary:true}]); return; }
    dmTarget=Object.assign({},target);
    try { if (target && target.phone) window.foxPushBridge(JSON.stringify({ action: 'active_chat', type: 'dm', id: target.phone })); } catch(e) {} dmReturn=ret; dmClearReply();
    setDMTitle(target);
    document.getElementById('dmAva').src=(target.avatar&&target.avatar.indexOf('data:')===0)?target.avatar:DEFAULT_AVA;
    hide(viewHome); hide(viewSettings); hide(viewChat); hide(viewDMList); hide(viewFun); bottomNav.classList.add('show'); show(viewDM);
    dmMessages=[]; document.getElementById('dmMessages').innerHTML='';
    startDMStream(); markConvRead(target.phone);
    if(target.phone){ fetch('/api/user?phone='+encodeURIComponent(target.phone)).then(r=>r.json()).then(f=>{ if(f&&f.phone&&dmTarget&&dmTarget.phone===f.phone){ dmTarget=Object.assign({},dmTarget,f); setDMTitle(dmTarget); document.getElementById('dmAva').src=(dmTarget.avatar&&dmTarget.avatar.indexOf('data:')===0)?dmTarget.avatar:DEFAULT_AVA; } }).catch(()=>{}); }
  }
  function stopDMStream(){ if(dmES){ try{dmES.close();}catch(_){} dmES=null; } if(dmTimer){ clearInterval(dmTimer); dmTimer=null; } }
  function startDMStream(){
    stopDMStream();
    if(!currentUser||!dmTarget) return;
    try{
      dmES=new EventSource('/api/dmstream?me='+encodeURIComponent(currentUser.phone)+'&other='+encodeURIComponent(dmTarget.phone));
      dmES.addEventListener('dm', e=>{
        try{ const m=JSON.parse(e.data);
          dmMessages=dmMessages.filter(x=>!(x.pending && x.from===m.from && x.text===m.text));
          if(!dmMessages.some(x=>x.id===m.id)){ dmMessages.push(m); renderDM(dmMessages); if(currentUser && m.from!==currentUser.phone) markConvRead(m.from); }
        }catch(_){}
      });
      dmES.onerror=()=>{ try{dmES.close();}catch(_){} dmES=null; if(!dmTimer) dmTimer=setInterval(loadDM,1000); };
    }catch(_){ if(!dmTimer) dmTimer=setInterval(loadDM,1000); }
  }
  function closeDM(){
    try { window.foxPushBridge(JSON.stringify({ action: 'active_chat', type: null, id: null })); } catch(e) {} if(window.foxCancelChatVoice)window.foxCancelChatVoice();stopDMStream(); dmClearReply(); const peer=dmTarget&&dmTarget.phone; hide(viewDM); if(peer) markConvRead(peer); if(dmReturn==='chat'){ show(viewChat); bottomNav.classList.add('show'); setActiveNav('groups'); } else if(dmReturn==='members'){ goHome(); openMembers(); } else if(dmReturn==='dms'){ goDMList(); } else { goHome(); } }
  function loadDM(){ if(!dmTarget||!currentUser) return; fetch('/api/dm?me='+encodeURIComponent(currentUser.phone)+'&other='+encodeURIComponent(dmTarget.phone)).then(r=>r.json()).then(msgs=>{ const pend=dmMessages.filter(x=>x.pending); dmMessages=(msgs||[]).concat(pend.filter(p=>!(msgs||[]).some(s=>s.text===p.text&&s.from===p.from))); renderDM(dmMessages); }).catch(()=>{}); }
  function dmClearReply(){ dmReplyTarget=null; const el=document.getElementById('dmReplyPreview'); if(el) el.classList.remove('show'); }
  function renderDM(msgs){
    const c=document.getElementById('dmMessages'); c.innerHTML='';
    (msgs||[]).forEach(m=>{
      const me=currentUser && m.from===currentUser.phone;
      const div=document.createElement('div');
      div.className='msg '+(me?'me':'oth');
      div.setAttribute('data-id', m.id);
      const av=avatarFor(m.from, m.avatar) || (me?(currentUser.avatar||DEFAULT_AVA):((dmTarget&&dmTarget.avatar)||DEFAULT_AVA));
      let html='';
      let rt = m.replyTo ? '<div class="reply-to" data-rid="'+escapeHtml(m.replyTo.id)+'">↩️ '+escapeHtml(m.replyTo.name)+': '+escapeHtml(snippet(m.replyTo.text))+'</div>' : '';
      html+='<img loading="lazy" decoding="async" class="m-ava" src="'+escapeHtml(av)+'"/>'+'<div class="body">'+'<div class="nm">'+UserNameWithCharacter(m.name,m.from,m.name,m.verified,m.char)+'</div>'+rt+'<div class="tx">'+escapeHtml(m.text)+'</div>'+'</div>';
      div.innerHTML=html;
      c.appendChild(div);
    });
    c.scrollTop=c.scrollHeight;
  }

  function sendDM(){
    const ta=document.getElementById('dmInput'); const text=ta.value.trim(); if(!text) return;
    if(!currentUser||!currentUser.phone){ openAppModal('خطا','کاربر شناسایی نشد.',[{label:'باشه',primary:true}]); return; }
    if(!dmTarget||!dmTarget.phone){ openAppModal('خطا','مقصد پیام مشخص نیست.',[{label:'باشه',primary:true}]); return; }
    let replyTo=null;
    if(dmReplyTarget){ const rm=dmMessages.find(x=>x.id===dmReplyTarget); if(rm) replyTo={id:rm.id,name:rm.name,text:rm.text}; }
    const payload={me:currentUser.phone, other:dmTarget.phone, name:currentUser.name, avatar:currentUser.avatar, text, replyTo};
    const tmpId='tmp'+Date.now();
    dmMessages.push({id:tmpId, from:currentUser.phone, name:currentUser.name, avatar:currentUser.avatar, text, ts:Date.now(), replyTo, pending:true});
    renderDM(dmMessages);
    ta.value=''; dmClearReply();
    fetch('/api/dm',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})
      .then(r=>r.json())
      .then(m=>{
        dmMessages=dmMessages.filter(x=>x.id!==tmpId);
        if(m && m.error==='blocked'){ renderDM(dmMessages); openAppModal('ارسال نشد','این کاربر شما را مسدود کرده است.',[{label:'باشه',primary:true}]); return; }
        if(m && m.id && !dmMessages.some(x=>x.id===m.id)) dmMessages.push(m);
        renderDM(dmMessages);
      })
      .catch(()=>{ loadDM(); });
  }
  document.getElementById('dmMessages').addEventListener('click', e=>{
    const rt=e.target.closest('.reply-to');
    if(rt){ const rid=rt.getAttribute('data-rid'); const el=document.querySelector('#dmMessages .msg[data-id="'+rid+'"]'); if(el) el.scrollIntoView({behavior:'smooth',block:'center'}); return; }
    const mEl=e.target.closest('.msg');
    if(mEl){
      const id=mEl.getAttribute('data-id'); const m=dmMessages.find(x=>x.id===id); if(!m) return;
      dmReplyTarget=id;
      document.getElementById('dmRpName').innerHTML=UserNameWithCharacter(m.name,m.from,m.name,m.verified,m.char);
      document.getElementById('dmRpText').textContent=snippet(m.text);
      document.getElementById('dmReplyPreview').classList.add('show');
    }
  });
  document.getElementById('dmRpX').addEventListener('click', dmClearReply);

  function renderMembersList(us){
    const ml=document.getElementById('membersList'); ml.innerHTML='';
    (us||[]).forEach(u=>{
      const av=(u.avatar&&u.avatar.indexOf('data:')===0)?u.avatar:DEFAULT_AVA;
      const row=document.createElement('div'); row.className='mrow'; row.style.cursor='pointer';
      const on = (u.online===true) || (u.online===undefined && u.lastSeen && (Date.now()-u.lastSeen)<70000);
      const sub = u.username ? '<small style="color:#999;direction:ltr;">@'+escapeHtml(u.username)+'</small>' : '';
      row.innerHTML='<img loading="lazy" decoding="async" src="'+escapeHtml(av)+'"/> <span>'+UserNameWithCharacter(u.name||'بدون نام',u.phone,u.name,u.verified,u.activeCharacterId)+' '+sub+'</span>'+(on?'<span class="up-dot on" style="margin-inline-start:auto;"></span>':'');
      row.addEventListener('click', ()=>{ closeMembersModal(); openUserProfile(Object.assign({},u),'members'); });
      ml.appendChild(row);
    });
  }
  function foxGroupMembersOnly(us){ var gid=window.__foxGroup||'main', info=window.__foxGroupInfo; if(gid==='main'||!info) return us||[]; var set={}; [].concat(info.members||[], info.admins||[], info.owner?[info.owner]:[]).forEach(function(p){ set[p]=1; }); return (us||[]).filter(function(u){ return u&&set[u.phone]; }); }
  function openMembers(){
    renderMembersList(foxGroupMembersOnly(lastUsers));
    document.getElementById('membersOverlay').classList.add('show');
    document.getElementById('membersModal').classList.add('show');
    fetchMemberRows().then(us=>{ lastUsers=us||[]; renderMembersList(foxGroupMembersOnly(lastUsers)); }).catch(()=>{});
  }
  (function(){ const mb=document.getElementById('membersBtn2'); if(mb) mb.addEventListener('click', openMembers); })();
  document.getElementById('membersClose').addEventListener('click', ()=>{ document.getElementById('membersOverlay').classList.remove('show'); document.getElementById('membersModal').classList.remove('show'); });
  document.getElementById('membersOverlay').addEventListener('click', ()=>{ document.getElementById('membersOverlay').classList.remove('show'); document.getElementById('membersModal').classList.remove('show'); });
  document.getElementById('upOverlay').addEventListener('click', closeUserProfile);
  document.getElementById('upMsg').addEventListener('click', ()=>{ const t=upTarget; closeUserProfile(); if(t&&t.phone) openDMChat(t, upReturn); });
  document.getElementById('upEdit').addEventListener('click', ()=>{ closeUserProfile(); settingsFrom='chat'; goSettings(); document.getElementById('editProfile2').click(); });
  document.getElementById('upReport').addEventListener('click', reportUser);
  document.getElementById('upBlock').addEventListener('click', toggleBlockUser);
  document.getElementById('upKebab').addEventListener('click', e=>{ e.stopPropagation(); document.getElementById('upKMenu').classList.toggle('show'); });
  document.getElementById('upKMsg').addEventListener('click', ()=>{ document.getElementById('upKMenu').classList.remove('show'); const t=upTarget; closeUserProfile(); if(t&&t.phone) openDMChat(t, upReturn); });
  document.getElementById('upKCopy').addEventListener('click', ()=>{ document.getElementById('upKMenu').classList.remove('show'); const t=upTarget; if(!t||!t.username) return; const v='@'+t.username; if(navigator.clipboard){ navigator.clipboard.writeText(v).then(()=>openAppModal('کپی شد', v, [{label:'باشه',primary:true}])).catch(()=>{}); } else { openAppModal('نام کاربری', v, [{label:'باشه',primary:true}]); } });
  document.getElementById('upKReport').addEventListener('click', ()=>{ document.getElementById('upKMenu').classList.remove('show'); reportUser(); });
  document.getElementById('upKBlock').addEventListener('click', ()=>{ document.getElementById('upKMenu').classList.remove('show'); toggleBlockUser(); });
  document.getElementById('upModal').addEventListener('click', e=>{ if(!e.target.closest('.up-kmenu') && !e.target.closest('.up-kebab')) document.getElementById('upKMenu').classList.remove('show'); });
  document.getElementById('dmBack').addEventListener('click', closeDM);
  document.getElementById('dmSend').addEventListener('click', sendDM);
  document.getElementById('dmInput').addEventListener('keydown', e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendDM(); } });
  document.querySelectorAll('.theme-btn').forEach(b=>b.addEventListener('click',()=>{ theme=b.dataset.c; localStorage.setItem('fox_theme',theme); applyTheme(theme); }));
  document.getElementById('chatBackBtn').addEventListener('click', ()=>{ var gid=window.__foxGroup||'main'; try{ if(window.__foxMarkGroupSeen) window.__foxMarkGroupSeen(gid); }catch(e){}
    var ret=window.__foxChatReturn||'home', pushed=!!window.__foxChatPushed; window.__foxChatPushed=false;
    if(pushed && location.pathname.indexOf('/group/')===0 && history.length>1){ history.back(); return; }
    window.__foxChatReturn='';
    if(ret==='groups' && window.goGroups){ window.goGroups(false); try{ history.replaceState({foxGroups:true,path:'/groups'},'','/groups'); }catch(e){} return; }
    hide(viewChat); show(viewHome); refreshHome(); bottomNav.classList.add('show'); setActiveNav('home'); try{ if(location.pathname!=='/') history.replaceState(null,'','/'); }catch(e){} });
  let lastMessages=[];
  let es=null, pollTimer=null, memberTimer=null;
  let pingTimer=null;
  function sendPing(){ if(!currentUser||!currentUser.phone) return; fetch('/api/ping',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({phone:currentUser.phone})}).catch(()=>{}); }
  var usersRequest=null;function fetchMemberRows(){if(usersRequest)return usersRequest;usersRequest=(async()=>{let offset='',rows=[];for(let page=0;page<45;page++){const r=await fetch('/api/users'+(offset?'?offset='+offset:''));if(!r.ok)throw new Error('members');const batch=await r.json();if(Array.isArray(batch))rows.push(...batch);offset=r.headers.get('x-next-offset')||'';if(!offset)break;}return rows;})().finally(()=>{usersRequest=null;});return usersRequest;}

  function initChat(){ if(lastMessages.length)renderMessages(lastMessages);if(!lastUsers.length)setTimeout(function(){if(!viewChat.classList.contains('hidden'))updateMembers();},1500); startStream(); loadBlocks(); sendPing(); if(!pingTimer) pingTimer=setInterval(sendPing, 45000); if(!memberTimer) memberTimer=setInterval(function(){if(!document.hidden&&!viewChat.classList.contains('hidden'))updateMembers();}, 30000); }
  var groupLoadBusy=false;function loadMessages(){if(groupLoadBusy||document.hidden)return;groupLoadBusy=true;fetch('/api/messages').then(r=>{if(!r.ok)throw new Error();return r.json();}).then(msgs=>{if(!Array.isArray(msgs))return;lastMessages=msgs;renderMessages(lastMessages);}).catch(()=>{}).finally(()=>{groupLoadBusy=false;});}
  function renderMessages(msgs){
    const c=document.getElementById('messages'); c.innerHTML='';
    (msgs||[]).filter(m=>!(m.phone && upBlocked.indexOf(m.phone)>=0)).forEach(m=>{
      const div=document.createElement('div');
      const me = currentUser && m.name===currentUser.name;
      div.className='msg '+(me?'me':'oth');
      div.setAttribute('data-id', m.id);
      const av = avatarFor(m.phone, m.avatar);
      let html='';
      let rt = m.replyTo ? '<div class="reply-to" data-rid="'+escapeHtml(m.replyTo.id)+'">↩️ '+escapeHtml(m.replyTo.name)+': '+escapeHtml(snippet(m.replyTo.text))+'</div>' : '';
      let lk = likesMap[m.id] ? '<div class="lk">♥ '+likesMap[m.id]+'</div>' : '';
      html+='<img loading="lazy" decoding="async" class="m-ava" src="'+escapeHtml(av)+'"/>'+'<div class="body">'+'<div class="nm">'+UserNameWithCharacter(m.name,m.phone,m.name,m.verified,m.char)+'</div>'+rt+'<div class="tx">'+escapeHtml(m.text)+'</div>'+lk+'</div>';
      div.innerHTML=html;
      c.appendChild(div);
    });
    c.scrollTop=c.scrollHeight;
  }
  function sendMsg(){
    const ta=document.getElementById('msgInput');
    const text=ta.value.trim(); if(!text) return;
    let replyTo=null;
    if(replyTarget){ const m=lastMessages.find(x=>x.id===replyTarget); if(m) replyTo={id:m.id,name:m.name,text:m.text}; }
    const payload={name:currentUser?currentUser.name:'مهمان', text, avatar:currentUser?currentUser.avatar:'', phone:currentUser?currentUser.phone:'', replyTo};
    const tmpId='tmp'+Date.now();
    const tmp={id:tmpId, name:currentUser?currentUser.name:'مهمان', text, avatar:currentUser?currentUser.avatar:'', phone:currentUser?currentUser.phone:'', ts:Date.now(), replyTo};
    lastMessages.push(tmp); renderMessages(lastMessages);
    ta.value=''; clearReply();
    fetch('/api/messages',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})
      .then(r=>r.json())
      .then(m=>{
        if(m&&m.error){
          lastMessages=lastMessages.filter(x=>x.id!==tmpId); renderMessages(lastMessages);
          openAppModal('ارسال نشد', m.msg||'اجازه ارسال پیام ندارید', [{label:'باشد',primary:true}]);
          return;
        }
        if(m&&m.id){ lastMessages=lastMessages.filter(x=>x.id!==tmpId); if(!lastMessages.some(x=>x.id===m.id)) lastMessages.push(m); renderMessages(lastMessages); }
      })
      .catch(()=>{ loadMessages(); });
  }
  document.getElementById('sendBtn').addEventListener('click', sendMsg);
  document.getElementById('msgInput').addEventListener('keydown', e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMsg(); } });
  function startStream(){ if(es) return; try{ es=new EventSource('/api/stream'); es.addEventListener('msg', e=>{ try{ const m=JSON.parse(e.data); if(lastMessages.some(x=>x.id===m.id)) return; lastMessages.push(m); renderMessages(lastMessages); }catch(_){} }); es.onerror=()=>{ try{es.close();}catch(_){} es=null; startPoll(); }; }catch(_){ startPoll(); } }
  function startPoll(){ if(pollTimer) return; pollTimer=setInterval(loadMessages, 2000); }
  const msgMenu=document.getElementById('msgMenu');
  let replyTarget=null;
  let currentReportMsg=null;
  let upTarget=null, upReturn='home';
  let dmTarget=null, dmReturn='home', dmMessages=[], dmTimer=null;
  let lastUsers=[];
  document.getElementById('messages').addEventListener('click', e=>{
    const rt=e.target.closest('.reply-to');
    if(rt){ const rid=rt.getAttribute('data-rid'); const el=document.querySelector('.msg[data-id="'+rid+'"]'); if(el) el.scrollIntoView({behavior:'smooth',block:'center'}); return; }
    const profEl=e.target.closest('.m-ava') || e.target.closest('.nm');
    if(profEl){ e.stopPropagation(); const mEl=e.target.closest('.msg'); const mm=lastMessages.find(x=>x.id===mEl.getAttribute('data-id')); const base=userFromMsg(mm); if(base) openUserProfile(base,'chat'); return; }
    const msgEl=e.target.closest('.msg');
    if(msgEl){ replyTarget=msgEl.getAttribute('data-id');
      const _m=lastMessages.find(x=>x.id===replyTarget); const _u=userFromMsg(_m);
      const _self=!!(currentUser&&_u&&_u.phone&&_u.phone===currentUser.phone);
      document.getElementById('miDM').style.display=(!_self&&_u&&_u.phone&&currentUser&&currentUser.phone)?'block':'none';
      document.getElementById('miDelete').hidden=!(_m&&currentUser&&(_m.phone===currentUser.phone||['owner','admin','moderator'].indexOf(currentUser.role)>=0));
      msgMenu.classList.add('show'); const mw=msgMenu.offsetWidth, mh=msgMenu.offsetHeight; let x=e.clientX, y=e.clientY; if(x+mw>window.innerWidth-8) x=window.innerWidth-8-mw; if(x<8) x=8; if(y+mh>window.innerHeight-8) y=window.innerHeight-8-mh; if(y<8) y=8; msgMenu.style.left=x+'px'; msgMenu.style.top=y+'px'; }
  });
  document.addEventListener('click', e=>{ if(!msgMenu.contains(e.target) && !e.target.closest('.msg')) msgMenu.classList.remove('show'); });
  document.getElementById('miReply').addEventListener('click', ()=>{
    const m=lastMessages.find(x=>x.id===replyTarget);
    if(m){ document.getElementById('rpName').innerHTML=UserNameWithCharacter(m.name,m.phone,m.name,m.verified,m.char); document.getElementById('rpText').textContent=snippet(m.text); document.getElementById('replyPreview').classList.add('show'); }
    msgMenu.classList.remove('show');
  });
  document.getElementById('miDM').addEventListener('click', ()=>{
    msgMenu.classList.remove('show');
    const m=lastMessages.find(x=>x.id===replyTarget); const u=userFromMsg(m); if(!u) return;
    if(currentUser && u.phone===currentUser.phone){ openAppModal('پیام خصوصی','نمی‌توانید به خودتان پیام خصوصی بدهید.',[{label:'باشه',primary:true}]); return; }
    openDMChat(u,'chat');
  });
  document.getElementById('miProfile').addEventListener('click', ()=>{
    msgMenu.classList.remove('show');
    const m=lastMessages.find(x=>x.id===replyTarget); const u=userFromMsg(m); if(u) openUserProfile(u,'chat');
  });
  document.getElementById('miSave').addEventListener('click', ()=>{ const m=lastMessages.find(x=>x.id===replyTarget); if(!m) return; const key='fox_saved_'+(currentUser?currentUser.phone:'guest'); let arr=JSON.parse(localStorage.getItem(key)||'[]'); if(!arr.some(x=>x.id===m.id)){ arr.push(m); localStorage.setItem(key, JSON.stringify(arr)); } openAppModal('ذخیره پیام','پیام برای شما ذخیره شد.',[{label:'باشه',primary:true}]); msgMenu.classList.remove('show'); });
  document.getElementById('miCopy').addEventListener('click', ()=>{ const m=lastMessages.find(x=>x.id===replyTarget); if(!m) return; const link=location.origin+location.pathname+'?msg='+encodeURIComponent(m.id); if(navigator.clipboard){ navigator.clipboard.writeText(link).then(()=>openAppModal('کپی لینک پیام','لینک پیام کپی شد.',[{label:'باشه',primary:true}])).catch(()=>openAppModal('کپی لینک پیام','لینک پیام: '+link,[{label:'باشه',primary:true}])); } else { openAppModal('کپی لینک پیام','لینک پیام: '+link,[{label:'باشه',primary:true}]); } msgMenu.classList.remove('show'); });
  document.getElementById('miReport').addEventListener('click', ()=>{ const m=lastMessages.find(x=>x.id===replyTarget); if(!m) return; currentReportMsg=m; openAppModal('گزارش پیام','<textarea id="amText" rows="3" placeholder="علت گزارش را بنویسید..."></textarea>', [ {label:'انصراف',primary:false}, {label:'ارسال گزارش',primary:true,onClick:()=>{ const r=document.getElementById('amText').value.trim(); if(r && currentReportMsg){ fetch('/api/report',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:currentReportMsg.id,name:currentReportMsg.name,text:currentReportMsg.text,reason:r})}).then(()=>{}).catch(()=>{}); } }} ]); setTimeout(()=>{ const t=document.getElementById('amText'); if(t) t.focus(); },50); msgMenu.classList.remove('show'); });
  document.getElementById('miLike').addEventListener('click', ()=>{
    const m=lastMessages.find(x=>x.id===replyTarget); if(!m) return;
    const key=likedKey(); const liked=likedSet.has(m.id); const delta=liked?-1:1;
    if(liked) likedSet.delete(m.id); else likedSet.add(m.id);
    localStorage.setItem(key, JSON.stringify([...likedSet]));
    fetch('/api/like',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:m.id, delta})}).then(r=>r.json()).then(res=>{ likesMap[m.id]=res.count; renderMessages(lastMessages); }).catch(()=>{});
    msgMenu.classList.remove('show');
  });
  document.getElementById('rpX').addEventListener('click', clearReply);
  function clearReply(){ replyTarget=null; document.getElementById('replyPreview').classList.remove('show'); }
  function updateMembers(){ return fetchMemberRows().then(us=>{ lastUsers=us||[]; if((window.__foxGroup||'main')==='main') document.getElementById('chatMembers').textContent='👥 '+(us?us.length:0).toLocaleString('fa-IR')+' عضو'; if(lastMessages.length) renderMessages(lastMessages); if(dmMessages.length) renderDM(dmMessages); }).catch(()=>{}); }
  // helper to render verified badge (backend determined)
  /* ═══════ تیم آبی ═══════ */
  function verifiedOf(u){
    try{
      if(!u) return false;
      if(u.verified) return true;
      const un=(u.username||'').toString().toLowerCase(), nm=(u.name||'').toString().toLowerCase();
      return un==='osine' || nm==='osine';
    }catch(e){ return false; }
  }
  function teamBadgeHtml(small){
    return '<span class="verified-badge'+(small?' sm':'')+'" title="تیم آبی" aria-label="تیم آبی"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>';
  }
  function badgeForPhone(phone, name, explicitVerified){
    try{
      if(explicitVerified) return teamBadgeHtml(true);
      let u=null;
      if(phone) u=(lastUsers||[]).find(x=>x&&x.phone===phone);
      if(!u && name) u=(lastUsers||[]).find(x=>x&&x.name===name);
      if(!u && currentUser && phone && phone===currentUser.phone) u=currentUser;
      return verifiedOf(u) ? teamBadgeHtml(true) : '';
    }catch(e){ return ''; }
  }
  function setDMTitle(t){
    try{
      var _t=document.getElementById('dmTitle'); if(!_t) return;
      _t.textContent=(t&&t.name)||'چت خصوصی';
      if(verifiedOf(t)){
        var _b=document.createElement('span'); _b.className='verified-badge sm'; _b.title='تیم آبی';
        _b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
        _t.appendChild(_b);
      }
      try{ if(window.applyCharToName) window.applyCharToName(_t, t); }catch(e3){}
    }catch(e){}
  }
  function verifiedBadgeHtml(user){
    if(!user || !user.verified) return '';
    return '<span class="verified-badge" title="حساب تأییدشده"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>';
  }
  function applyVerifiedToName(el, user){
    try{
      if(!el || !user || !user.verified) return;
      if(el.querySelector && el.querySelector('.verified-badge')) return;
      const b=document.createElement('span');
      b.className='verified-badge'; b.title='حساب تأییدشده';
      b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
      el.appendChild(b);
    }catch(e){}
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    // Optimistic instant session boot from cached credentials (no login screen flicker)
    try {
      var _savedUser = JSON.parse(localStorage.getItem('fox_user') || 'null');
      var _savedTok = String(localStorage.getItem('fox_session') || '').trim();
      if (_savedTok && _savedUser && _savedUser.phone && _savedTok !== 'null' && _savedTok !== 'undefined') {
        currentUser = _savedUser;
        renderCurrentUser();
        fillProfileForm(currentUser);
        if (profileIsComplete(currentUser)) {
          [view1, viewLogin, viewLoginCode, viewRegisterCode, view2, viewRules].forEach(function(v) { if (v) hide(v); });
          show(viewHome);
          refreshHome();
          bottomNav.classList.add('show');
        }
      }
    } catch(e) {}

    /* Do not enter the home/profile UI from a stale local object. /auth/me
       supplies the current server profile via the valid same-origin cookie or
       an explicitly issued Bearer token. */
    let token=''; try{ token=String(localStorage.getItem('fox_session')||'').trim(); }catch(e){}
    if(token==='null'||token==='undefined') token='';
    const meOpt={credentials:'same-origin',headers:{'Accept':'application/json'}};
    if(token) meOpt.headers.Authorization='Bearer '+token;
    const bootEpoch=authenticatedViewEpoch;
    fetch('/api/auth/me',meOpt).then(r=>r.json()).then(j=>{
      if(bootEpoch!==authenticatedViewEpoch) return;
      if(j && j.ok && j.user){
        if(j.token) try{ localStorage.setItem('fox_session',j.token); }catch(e){}
        beginAuthenticatedSession(j.user);
      } else {
        // Token invalid or expired - clear auth state and show login
        try{ document.documentElement.classList.remove('has-auth-session'); }catch(e){}
        try{ document.documentElement.classList.remove('auth-boot'); }catch(e){}
        try{
          // Show view1 if no valid session
          var v1=document.getElementById('view1');
          if(v1){ v1.classList.remove('hidden'); v1.style.removeProperty('display'); }
          var vh=document.getElementById('viewHome');
          if(vh){ vh.classList.add('hidden'); vh.style.display='none'; }
          var bn=document.getElementById('bottomNav');
          if(bn) bn.classList.remove('show');
        }catch(e){}
      }
    }).catch(function(){
      try{ document.documentElement.classList.remove('has-auth-session'); }catch(e){}
      try{ document.documentElement.classList.remove('auth-boot'); }catch(e){}
      try{
        var v1=document.getElementById('view1');
        if(v1){ v1.classList.remove('hidden'); v1.style.removeProperty('display'); }
      }catch(e){}
    });
  });

  // ===== View Fun (سرگرمی‌ها) =====
  function goFun(){ 
    // 1. Hide all views except viewFun
    document.querySelectorAll('section.view').forEach(function(s) {
      if (s.id !== 'viewFun') {
        s.classList.add('hidden');
        s.style.display = 'none';
      }
    });

    // 2. Hide/close all overlays across all 12 games
    var ovIds = [
      'mnMenu', 'mnWait', 'mnWin',
      'dzMenu', 'dzWait', 'dzModal',
      'tkPick', 'tkWait', 'tkRes', 'tkPvp',
      'dtMenu', 'dtWait', 'dtWin',
      'sdModeOv', 'sdResultOv', 'sdQueueOv',
      'bowResult', 'bowCharSheet', 'bowQueue', 'bowOverlay',
      'wbaModal', 'wbaWait', 'wbaResult',
      'qzWait', 'qzResult',
      'memoryQueue', 'memoryResult'
    ];
    ovIds.forEach(function(id) { window.foxCloseOverlay(document.getElementById(id)); });

    // 3. Reset special dynamically created roots
    var _feRoot = document.getElementById('feRoot');
    if (_feRoot) {
      _feRoot.classList.remove('feOn');
      _feRoot.style.display = 'none';
    }
    var _feBack = document.getElementById('feBack');
    if (_feBack) _feBack.style.display = 'none';
    var _rfa = document.getElementById('ropeFoxApp');
    if (_rfa) {
      _rfa.classList.add('hidden');
      _rfa.style.display = 'none';
    }

    // 4. Close reward and store modals
    if (window.FoxGameRewardService) {
      try { window.FoxGameRewardService.closeVictoryModal(); } catch(e) {}
      try { window.FoxGameRewardService.closeInsufficientDiamondsModal(); } catch(e) {}
      try { window.FoxGameRewardService.refreshBalance(); } catch(e) {}
    }
    ['myBalanceModal','planOverlay','coinBuyOverlay','diamondBuyOverlay'].forEach(function(id){ window.foxCloseOverlay(document.getElementById(id)); });

    // 5. Explicitly display viewFun
    var vf = document.getElementById('viewFun');
    if (vf) {
      vf.classList.remove('hidden');
      try { vf.style.removeProperty('display'); } catch(e) {}
      vf.style.display = 'flex';
    }

    // 6. Reset scrolling and body overflow
    try {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      if (document.body) document.body.style.overflow = '';
      if (document.documentElement) document.documentElement.style.overflow = '';
    } catch(e) {}

    // 7. Activate bottomNav
    var bn = document.getElementById('bottomNav');
    if (bn) {
      bn.classList.add('show');
      try { bn.style.removeProperty('display'); } catch(e) {}
      bn.style.display = 'flex';
    }
    if (typeof setActiveNav === 'function') setActiveNav('fun');
    try { localStorage.setItem('fox_active_tab', 'fun'); } catch(e) {}

    // 8. Update user avatar
    if (currentUser) {
      var fAva = document.getElementById('funAva');
      if (fAva) fAva.src = currentUser.avatar || DEFAULT_AVA;
    }
  }
  document.querySelector('#bottomNav button[data-go="fun"]').addEventListener('click', goFun);
  window.goFun = goFun;
// ===== Central Game Reward & Wallet Service =====
  window.FoxGameRewardService = (function() {
    let activeSessionId = null;
    let activeGameCode = null;
    let activeMode = 'solo';

    async function checkGameAccess(gameCode, mode = 'solo') {
      let token = '';
      try { token = localStorage.getItem('fox_session') || ''; } catch(e) {}
      const headers = { 'content-type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      const res = await fetch('/api/game/session/start', {
        method: 'POST',
        credentials: 'same-origin',
        headers,
        body: JSON.stringify({ gameCode, mode })
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok && data.ok, data, status: res.status };
    }

    function showInsufficientDiamondsModal(diamonds) {
      const ov = document.getElementById('insufficientDiamondsModal');
      const val = document.getElementById('idmCurrentDiamonds');
      if (val) val.textContent = String(diamonds != null ? diamonds : 0);
      if (ov) ov.classList.add('show');
    }

    function closeInsufficientDiamondsModal() {
      const ov = document.getElementById('insufficientDiamondsModal');
      if (ov) ov.classList.remove('show');
    }

    function launchGame(gameCode, mode, launchCallback) {
      checkGameAccess(gameCode, mode).then(result => {
        if (!result.ok) {
          var err = result.data && result.data.error;
          if (err === 'insufficient_diamonds') {
            showInsufficientDiamondsModal(result.data && result.data.diamonds);
          } else if (err === 'auth') {
            if (window.foxToast) window.foxToast('نشست حساب معتبر نیست؛ دوباره وارد شوید.');
            else if (window.showToast) window.showToast('نشست حساب معتبر نیست؛ دوباره وارد شوید.');
          } else {
            if (window.foxToast) window.foxToast('شروع بازی ممکن نشد؛ اتصال را بررسی و دوباره تلاش کنید.');
            else if (window.showToast) window.showToast('شروع بازی ممکن نشد؛ دوباره تلاش کنید.');
          }
          return;
        }
        activeSessionId = result.data.sessionId;
        activeGameCode = gameCode;
        activeMode = mode;
        if (typeof launchCallback === 'function') {
          launchCallback(activeSessionId);
        }
      }).catch(err => {
        console.warn('Game access check fallback:', err);
        if (typeof launchCallback === 'function') {
          launchCallback(null);
        }
      });
    }

    async function claimReward(opts = {}) {
      const gameCode = opts.gameCode || activeGameCode;
      const mode = opts.mode || activeMode || 'solo';
      const result = opts.result || 'win';
      const sessionId = opts.sessionId || activeSessionId;
      const levelId = opts.levelId || null;
      const questionId = opts.questionId || null;

      let token = '';
      try { token = localStorage.getItem('fox_session') || ''; } catch(e) {}
      const headers = { 'content-type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      try {
        const res = await fetch('/api/game/reward/claim', {
          method: 'POST',
          credentials: 'same-origin',
          headers,
          body: JSON.stringify({ sessionId, gameCode, mode, result, levelId, questionId })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          if (data.wallet) {
            updateBalanceUI(data.wallet);
          }
          showVictoryModal({
            gameCode,
            mode,
            result,
            levelId,
            diamonds: data.reward ? data.reward.diamonds : 0,
            foxCoins: data.reward ? data.reward.foxCoins : 0
          });
          return { ok: true, reward: data.reward, wallet: data.wallet };
        }
        return { ok: false, error: data.error, message: data.message };
      } catch(err) {
        console.error('Failed to claim game reward:', err);
        return { ok: false, error: String(err) };
      }
    }

    function updateBalanceUI(wallet) {
      if (!wallet) return;
      const dEl = document.getElementById('funBalanceDiamonds');
      const cEl = document.getElementById('funBalanceCoins');
      const dWrap = document.getElementById('fbbDiamondsWrap');
      const cWrap = document.getElementById('fbbCoinsWrap');

      const d = wallet.diamonds != null ? wallet.diamonds : (wallet.gems != null ? wallet.gems : 0);
      const c = wallet.foxCoins != null ? wallet.foxCoins : (wallet.coins != null ? wallet.coins : 0);

      if (dEl) dEl.textContent = Number(d).toLocaleString('fa-IR');
      if (cEl) cEl.textContent = Number(c).toLocaleString('fa-IR');

      if (dWrap) { dWrap.classList.add('highlight'); setTimeout(() => dWrap.classList.remove('highlight'), 800); }
      if (cWrap) { cWrap.classList.add('highlight'); setTimeout(() => cWrap.classList.remove('highlight'), 800); }

      const mbD = document.getElementById('mbDiamondsVal');
      const mbC = document.getElementById('mbCoinsVal');
      if (mbD) mbD.textContent = Number(d).toLocaleString('fa-IR');
      if (mbC) mbC.textContent = Number(c).toLocaleString('fa-IR');

      const idmD = document.getElementById('idmCurrentDiamonds');
      if (idmD) idmD.textContent = Number(d).toLocaleString('fa-IR');

      const chC = document.getElementById('charsCoins');
      if (chC) chC.textContent = Number(c).toLocaleString('fa-IR');

      try {
        if (typeof currentUser !== 'undefined' && currentUser) {
          currentUser.diamonds = d;
          currentUser.gems = d;
          currentUser.foxCoins = c;
          currentUser.coins = c;
          if (currentUser.wallet) {
            currentUser.wallet.diamonds = d;
            currentUser.wallet.gems = d;
            currentUser.wallet.foxCoins = c;
            currentUser.wallet.coins = c;
          }
          localStorage.setItem('fox_user', JSON.stringify(currentUser));
        }
      } catch(e) {}
    }

    function refreshBalance() {
      let token = '';
      try { token = localStorage.getItem('fox_session') || ''; } catch(e) {}
      const headers = { 'content-type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      fetch('/api/wallet', { credentials: 'same-origin', headers })
        .then(r => r.json())
        .then(data => {
          if (data && data.ok && data.wallet) {
            updateBalanceUI(data.wallet);
          }
        })
        .catch(() => {});
    }

    function showVictoryModal(info) {
      const ov = document.getElementById('gameVictoryModal');
      if (!ov) return;
      const titleEl = document.getElementById('gvmTitle');
      const dChip = document.getElementById('gvmDiamondChip');
      const cChip = document.getElementById('gvmCoinChip');
      const dVal = document.getElementById('gvmDiamondVal');
      const cVal = document.getElementById('gvmCoinVal');

      if (info.gameCode === 'sudoku' && (info.result === 'board_complete' || info.result === 'win')) {
        if (titleEl) titleEl.textContent = '🎉 جدول با موفقیت تکمیل شد!';
      } else if (info.levelId || info.result === 'level_complete') {
        if (titleEl) titleEl.textContent = '🎉 مرحله با موفقیت تکمیل شد!';
      } else {
        if (titleEl) titleEl.textContent = '🎉 پیروز شدی!';
      }

      if (info.diamonds > 0) {
        if (dVal) dVal.textContent = '+' + Number(info.diamonds).toLocaleString('fa-IR');
        if (dChip) dChip.style.display = 'flex';
      } else {
        if (dChip) dChip.style.display = 'none';
      }

      if (info.foxCoins > 0) {
        if (cVal) cVal.textContent = '+' + Number(info.foxCoins).toLocaleString('fa-IR');
        if (cChip) cChip.style.display = 'flex';
      } else {
        if (cChip) cChip.style.display = 'none';
      }

      ov.classList.add('show');
    }

    function closeVictoryModal() {
      const ov = document.getElementById('gameVictoryModal');
      if (ov) ov.classList.remove('show');
    }

    return {
      launchGame,
      checkGameAccess,
      claimReward,
      updateBalanceUI,
      refreshBalance,
      showVictoryModal,
      closeVictoryModal,
      showInsufficientDiamondsModal,
      closeInsufficientDiamondsModal,
      getActiveSessionId: () => activeSessionId
    };
  })();

  window.reportGameReward = function(gameCode, mode, result, extra) {
    return window.FoxGameRewardService.claimReward(Object.assign({ gameCode, mode, result }, extra));
  };

  // My Balance Modal Functions
  function openMyBalanceModal() {
    const ov = document.getElementById('myBalanceModal');
    if (!ov) return;
    ov.classList.add('show');

    let token = '';
    try { token = localStorage.getItem('fox_session') || ''; } catch(e) {}
    const headers = { 'content-type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    fetch('/api/wallet', { credentials: 'same-origin', headers })
      .then(r => r.json())
      .then(data => {
        if (data && data.ok && data.wallet) {
          const w = data.wallet;
          const d = w.diamonds != null ? w.diamonds : (w.gems != null ? w.gems : 0);
          const c = w.foxCoins != null ? w.foxCoins : (w.coins != null ? w.coins : 0);
          const mbD = document.getElementById('mbDiamondsVal');
          const mbC = document.getElementById('mbCoinsVal');
          if (mbD) mbD.textContent = Number(d).toLocaleString('fa-IR');
          if (mbC) mbC.textContent = Number(c).toLocaleString('fa-IR');
          if (window.FoxGameRewardService && typeof window.FoxGameRewardService.updateBalanceUI === 'function') {
            window.FoxGameRewardService.updateBalanceUI(w);
          }
          
          const eD = document.getElementById('mbTotalEarnedDiamonds');
          const eC = document.getElementById('mbTotalEarnedCoins');
          const sD = document.getElementById('mbTotalSpentDiamonds');
          const sC = document.getElementById('mbTotalSpentCoins');
          const gp = document.getElementById('mbGamesPlayed');
          const gw = document.getElementById('mbGamesWon');

          if (eD) eD.textContent = Number(w.totalDiamondsEarned || 0).toLocaleString('fa-IR');
          if (eC) eC.textContent = Number(w.totalFoxCoinsEarned || 0).toLocaleString('fa-IR');
          if (sD) sD.textContent = Number(w.totalDiamondsSpent || 0).toLocaleString('fa-IR');
          if (sC) sC.textContent = Number(w.totalFoxCoinsSpent || 0).toLocaleString('fa-IR');
          if (gp) gp.textContent = Number(w.gamesPlayed || 0).toLocaleString('fa-IR');
          if (gw) gw.textContent = Number(w.gamesWon || 0).toLocaleString('fa-IR');

          FoxGameRewardService.updateBalanceUI(w);
        }
      }).catch(() => {});

    loadWalletTransactions();
  }
  window.openMyBalanceModal = openMyBalanceModal;

  function loadWalletTransactions() {
    const listEl = document.getElementById('mbTxList');
    if (!listEl) return;
    listEl.innerHTML = '<div class="mb-tx-empty">در حال بارگذاری تاریخچه...</div>';

    let token = '';
    try { token = localStorage.getItem('fox_session') || ''; } catch(e) {}
    const headers = { 'content-type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    fetch('/api/wallet/transactions', { credentials: 'same-origin', headers })
      .then(r => r.json())
      .then(data => {
        if (!data || !data.ok || !Array.isArray(data.transactions) || data.transactions.length === 0) {
          listEl.innerHTML = '<div class="mb-tx-empty">هنوز هیچ تراکنشی ثبت نشده است.</div>';
          return;
        }
        listEl.innerHTML = '';
        data.transactions.forEach(tx => {
          const row = document.createElement('div');
          row.className = 'mb-tx-item';

          let isPlus = false;
          let label = '';
          let subLabel = '';
          let icon = '🎁';
          let amountStr = '';

          if (tx.type === 'game_reward' || tx.type === 'level_reward' || tx.type === 'quiz_correct_answer') {
            isPlus = true;
            icon = '🎁';
            if (tx.gameCode === 'fox_board' || tx.gameCode === 'mensh') label = 'منچ با روباه';
            else if (tx.gameCode === 'tic_tac_toe' || tx.gameCode === 'dooz') label = 'بازی دوز';
            else if (tx.gameCode === 'tank_duel' || tx.gameCode === 'tank') label = 'دوئل تانک‌ها';
            else if (tx.gameCode === 'fox_escape' || tx.gameCode === 'fox') label = 'فرار روباه';
            else if (tx.gameCode === 'memory_battle' || tx.gameCode === 'memory') label = 'نبرد حافظه';
            else if (tx.gameCode === 'dots_boxes' || tx.gameCode === 'dots') label = 'نقطه‌ها و جعبه‌ها';
            else if (tx.gameCode === 'sudoku') label = 'سودوکو';
            else if (tx.gameCode === 'quiz') label = 'چهارگزینه‌ای';
            else if (tx.gameCode === 'bow_duel' || tx.gameCode === 'bow' || tx.gameCode === 'archer') label = 'دوئل تیر و کمان';
            else if (tx.gameCode === 'lumberjack' || tx.gameCode === 'timber') label = 'هیزم‌شکن';
            else if (tx.gameCode === 'rope_cut' || tx.gameCode === 'rope') label = 'طناب‌چین روباه';
            else if (tx.gameCode === 'word_battle' || tx.gameCode === 'words') label = 'نبرد کلمات روباه';
            else label = 'پاداش بازی';
            subLabel = 'پاداش بازی (' + (tx.mode === 'online' ? 'آنلاین' : 'تک‌نفره') + ')';
          } else if (tx.type === 'credit' || tx.type === 'admin_transfer' || tx.kind === 'transfer' || tx.kind === 'assetgrant') {
            isPlus = true;
            const isCoin = tx.currency === 'coins' || (tx.foxCoins > 0 && !tx.diamonds);
            icon = isCoin ? '🪙' : '💎';
            label = isCoin ? 'واریز سکه روباه (انتقال / خرید)' : 'واریز الماس (انتقال / خرید)';
            subLabel = tx.performedBy ? ('واریز از طرف مدیریت (' + tx.performedBy + ')') : 'واریز مستقیم به کیف پول';
          } else if (tx.type === 'purchase' || tx.kind === 'diamond_pack' || tx.kind === 'diamond_pack_purchase') {
            isPlus = true;
            icon = '💎';
            label = 'خرید بسته الماس با سکه روباه';
            subLabel = 'تبدیل سکه روباه به الماس';
          } else if (tx.type === 'debit' || tx.kind === 'chars') {
            isPlus = false;
            icon = '🛍️';
            label = 'خرید کاراکتر / کسر موجودی';
            subLabel = 'خرج‌شده در فروشگاه';
          } else {
            isPlus = tx.type === 'credit';
            icon = isPlus ? '🎁' : '🛍️';
            label = tx.gameCode || 'تراکنش حساب';
            subLabel = tx.type || '';
          }

          if (typeof tx.amount === 'object' && tx.amount) {
            const parts = [];
            if (tx.amount.diamonds) parts.push('+' + Number(tx.amount.diamonds).toLocaleString('fa-IR') + ' 💎');
            if (tx.amount.foxCoins) parts.push('+' + Number(tx.amount.foxCoins).toLocaleString('fa-IR') + ' 🪙');
            amountStr = parts.join(' ');
          } else if (tx.currency === 'coins' || tx.asset === 'coins') {
            const val = Number(tx.foxCoins || tx.amount || 0);
            amountStr = (isPlus ? '+' : '-') + val.toLocaleString('fa-IR') + ' 🪙';
          } else if (tx.currency === 'gems' || tx.currency === 'diamonds' || tx.asset === 'gems') {
            const val = Number(tx.diamonds || tx.amount || 0);
            amountStr = (isPlus ? '+' : '-') + val.toLocaleString('fa-IR') + ' 💎';
          } else {
            amountStr = (isPlus ? '+' : '-') + (tx.amount || 0);
          }

          const dateStr = new Date(tx.createdAt || tx.at || Date.now()).toLocaleDateString('fa-IR', { hour: '2-digit', minute: '2-digit' });

          row.innerHTML = '<div class="mb-tx-lead"><span class="mb-tx-badge">' + icon + '</span><div class="mb-tx-desc"><span class="mb-tx-title">' + escapeHtml(label) + '</span><span class="mb-tx-time">' + escapeHtml(subLabel) + ' · ' + escapeHtml(dateStr) + '</span></div></div><span class="mb-tx-amount ' + (isPlus ? 'plus' : 'minus') + '">' + amountStr + '</span>';
          listEl.appendChild(row);
        });
      }).catch(() => {
        listEl.innerHTML = '<div class="mb-tx-empty">خطا در دریافت تاریخچه.</div>';
      });
  }

  function closeMyBalanceModal() {
    const ov = document.getElementById('myBalanceModal');
    if (ov) ov.classList.remove('show');
  }

  // Hook Modal Buttons
  const mbCloseBtn = document.getElementById('mbCloseBtn');
  if (mbCloseBtn) mbCloseBtn.addEventListener('click', closeMyBalanceModal);
  const mbRefreshTxBtn = document.getElementById('mbRefreshTxBtn');
  if (mbRefreshTxBtn) mbRefreshTxBtn.addEventListener('click', openMyBalanceModal);
  const fbbOpenWalletBtn = document.getElementById('fbbOpenWalletBtn');
  if (fbbOpenWalletBtn) fbbOpenWalletBtn.addEventListener('click', openMyBalanceModal);

  const btnPlanWallet = document.getElementById('btnPlanWallet');
  if (btnPlanWallet) {
    btnPlanWallet.addEventListener('click', function() {
      const planOv = document.getElementById('planOverlay');
      if (planOv) planOv.classList.remove('open');
      openMyBalanceModal();
    });
  }

  const gvmContinueBtn = document.getElementById('gvmContinueBtn');
  if (gvmContinueBtn) gvmContinueBtn.addEventListener('click', function() {
    FoxGameRewardService.closeVictoryModal();
  });
  const gvmViewWalletBtn = document.getElementById('gvmViewWalletBtn');
  if (gvmViewWalletBtn) gvmViewWalletBtn.addEventListener('click', function() {
    FoxGameRewardService.closeVictoryModal();
    openMyBalanceModal();
  });
  const gvmBackFunBtn = document.getElementById('gvmBackFunBtn');
  if (gvmBackFunBtn) gvmBackFunBtn.addEventListener('click', function() {
    FoxGameRewardService.closeVictoryModal();
    if (window.goFun) window.goFun();
  });

  const idmBuyDiamondsBtn = document.getElementById('idmBuyDiamondsBtn');
  if (idmBuyDiamondsBtn) idmBuyDiamondsBtn.addEventListener('click', function() {
    FoxGameRewardService.closeInsufficientDiamondsModal();
    if (window.openDiamondPanel) window.openDiamondPanel();
    else if (window.openRanking) window.openRanking();
  });
  const fbbDiamondsWrap = document.getElementById('fbbDiamondsWrap');
  if (fbbDiamondsWrap) fbbDiamondsWrap.addEventListener('click', function() {
    if (window.openDiamondPanel) window.openDiamondPanel();
  });
  const idmCloseBtn = document.getElementById('idmCloseBtn');
  if (idmCloseBtn) idmCloseBtn.addEventListener('click', function() {
    FoxGameRewardService.closeInsufficientDiamondsModal();
  });

  // Guarded Game Launch Handlers
  document.getElementById('funTimber').addEventListener('click', function(){
    FoxGameRewardService.launchGame('lumberjack', 'solo', function(sid){ try{ if(sid) localStorage.setItem('fox_timber_session', sid); }catch(e){} location.href='/timber' + (sid ? ('?sessionId=' + encodeURIComponent(sid)) : ''); });
  });
  document.getElementById('funRope').addEventListener('click', function(){
    FoxGameRewardService.launchGame('rope_cut', 'solo', function(){ if(window.openRopeFox) window.openRopeFox(); });
  });
  document.getElementById('funWords').addEventListener('click', function(){
    FoxGameRewardService.launchGame('word_battle', 'solo', function(){ if(window.openWords) window.openWords(); });
  });
  document.getElementById('funArcher').addEventListener('click', function(){
    FoxGameRewardService.launchGame('bow_duel', 'solo', function(){ if (window.openBow) window.openBow(); });
  });
  document.getElementById('funQuiz').addEventListener('click', function(){
    FoxGameRewardService.launchGame('quiz', 'solo', function(){ if(window.openQuiz) window.openQuiz(false); });
  });
  document.getElementById('funSudoku').addEventListener('click', function(){
    FoxGameRewardService.launchGame('sudoku', 'solo', function(){ if(window.openSudoku) window.openSudoku(); });
  });
  document.getElementById('funDots').addEventListener('click', function(){
    FoxGameRewardService.launchGame('dots_boxes', 'solo', function(){ if (window.openDots) window.openDots(); });
  });
  document.getElementById('funMemory').addEventListener('click', function(){
    FoxGameRewardService.launchGame('memory_battle', 'solo', function(){ if(window.openMemory) window.openMemory(); });
  });
  document.getElementById('funFox').addEventListener('click', function(){
    FoxGameRewardService.launchGame('fox_escape', 'solo', function(){ if (window.FE_LAUNCH) window.FE_LAUNCH(); });
  });
  window.goFun = goFun;

  /* ===== Global Native & Browser Back Navigation Bridge ===== */
  window.handleFoxBack = function() {
    try {
      // 1. Check top-level overlays & modals
      var openModals = [
        'gameVictoryModal', 'insufficientDiamondsModal', 'myBalanceModal',
        'planOverlay', 'coinBuyOverlay', 'diamondBuyOverlay', 'charsOverlay',
        'creatorOverlay', 'supportOverlay'
      ];
      for (var i = 0; i < openModals.length; i++) {
        var m = document.getElementById(openModals[i]);
        if (m && (m.classList.contains('open') || m.classList.contains('show') || m.style.display === 'flex' || m.style.display === 'block')) {
          window.foxCloseOverlay(m);
          return true;
        }
      }

      // 2. Fox Escape (z-index 99990)
      var feRoot = document.getElementById('feRoot');
      if (feRoot && (feRoot.classList.contains('feOn') || feRoot.style.display === 'block')) {
        if (typeof window.feExit === 'function') {
          try { window.feExit(); } catch(e) { goFun(); }
        } else {
          goFun();
        }
        return true;
      }

      // 3. Rope Cut (z-index 9999)
      var rfa = document.getElementById('ropeFoxApp');
      if (rfa && !rfa.classList.contains('hidden') && rfa.style.display !== 'none') {
        if (window.ROPEFOX && window.ROPEFOX.game) {
          try { window.ROPEFOX.game.close(); } catch(e) { goFun(); }
        } else {
          goFun();
        }
        return true;
      }

      // 4. In-game menu overlays (Mensh, Dooz, Dots, Sudoku, Bow, Words, Tank)
      var gameOvs = ['mnMenu', 'mnWait', 'mnWin', 'dzMenu', 'dzWait', 'dtMenu', 'dtWait', 'dtWin', 'sdModeOv', 'sdResultOv', 'bowResult', 'bowCharSheet', 'wbaModal', 'tkPick', 'tkWait', 'tkRes'];
      for (var j = 0; j < gameOvs.length; j++) {
        var gov = document.getElementById(gameOvs[j]);
        if (gov && (gov.classList.contains('show') || gov.classList.contains('open') || gov.style.display === 'flex' || gov.style.display === 'block')) {
          gov.classList.remove('show', 'open');
          gov.style.display = 'none';
          goFun();
          return true;
        }
      }

      // 5. Active Game Views
      var vMensh = document.getElementById('viewMensh');
      if (vMensh && !vMensh.classList.contains('hidden') && vMensh.style.display !== 'none') {
        var mnB = document.getElementById('mnBack');
        if (mnB) { mnB.click(); } else { goFun(); }
        return true;
      }

      var vDooz = document.getElementById('viewDooz');
      if (vDooz && !vDooz.classList.contains('hidden') && vDooz.style.display !== 'none') {
        var dzB = document.getElementById('dzBack');
        if (dzB) { dzB.click(); } else { goFun(); }
        return true;
      }

      var vTank = document.getElementById('viewTank');
      if (vTank && !vTank.classList.contains('hidden') && vTank.style.display !== 'none') {
        var tkB = document.getElementById('tkBack');
        if (tkB) { tkB.click(); } else { goFun(); }
        return true;
      }

      var vDots = document.getElementById('viewDots');
      if (vDots && !vDots.classList.contains('hidden') && vDots.style.display !== 'none') {
        var dtB = document.getElementById('dtBack');
        if (dtB) { dtB.click(); } else { goFun(); }
        return true;
      }

      var vSudoku = document.getElementById('viewSudoku');
      if (vSudoku && !vSudoku.classList.contains('hidden') && vSudoku.style.display !== 'none') {
        var sdB = document.getElementById('sdBack');
        if (sdB) { sdB.click(); } else { goFun(); }
        return true;
      }

      var vQuiz = document.getElementById('viewQuiz');
      if (vQuiz && !vQuiz.classList.contains('hidden') && vQuiz.style.display !== 'none') {
        var qzB = document.getElementById('qzBack');
        if (qzB) { qzB.click(); } else { goFun(); }
        return true;
      }

      var vBow = document.getElementById('viewBow');
      if (vBow && !vBow.classList.contains('hidden') && vBow.style.display !== 'none') {
        var bwB = document.getElementById('bowBack');
        if (bwB) { bwB.click(); } else { goFun(); }
        return true;
      }

      var vWords = document.getElementById('viewWords');
      if (vWords && !vWords.classList.contains('hidden') && vWords.style.display !== 'none') {
        var wB = document.getElementById('wbaExit');
        if (wB) { wB.click(); } else { goFun(); }
        return true;
      }

      var vMem = document.getElementById('viewMemory');
      if (vMem && !vMem.classList.contains('hidden') && vMem.style.display !== 'none') {
        var memB = document.getElementById('memoryBack');
        if (memB) { memB.click(); } else { goFun(); }
        return true;
      }

      // 6. Sub-views: Chat or DM
      var vChat = document.getElementById('viewChat');
      if (vChat && !vChat.classList.contains('hidden') && vChat.style.display !== 'none') {
        if (location.pathname === '/groups' || location.pathname.indexOf('/group/') === 0) return false; /* Groups router decides */
        goHome();
        return true;
      }
      var vDM = document.getElementById('viewDM');
      if (vDM && !vDM.classList.contains('hidden') && vDM.style.display !== 'none') {
        if (typeof goDMList === 'function') goDMList(); else goHome();
        return true;
      }

      // 7. Secondary main tabs: Settings or DMList -> return to Home
      var vSet = document.getElementById('viewSettings');
      if (vSet && !vSet.classList.contains('hidden') && vSet.style.display !== 'none') {
        goHome();
        return true;
      }
      var vDML = document.getElementById('viewDMList');
      if (vDML && !vDML.classList.contains('hidden') && vDML.style.display !== 'none') {
        goHome();
        return true;
      }

      // 8. Fun Tab: Back on Fun tab returns to Home
      var vFun = document.getElementById('viewFun');
      if (vFun && !vFun.classList.contains('hidden') && vFun.style.display !== 'none') {
        goHome();
        return true;
      }

      // 9. Home Tab (or unhandled) -> return false
      return false;
    } catch(err) {
      console.warn('handleFoxBack error:', err);
      return false;
    }
  };

  // Restore active view on bfcache navigation (pageshow)
  window.addEventListener('pageshow', function(e) {
    try {
      if (!e || !e.persisted) return; /* normal load: boot decides (it used to call goFun on every load and override /groups) */
      if (location.pathname === '/groups' || location.pathname.indexOf('/group/') === 0) return;
      var actTab = localStorage.getItem('fox_active_tab');
      if (actTab === 'fun' || new URLSearchParams(location.search).get('view') === 'fun') {
        if (typeof window.goFun === 'function') window.goFun();
      }
    } catch(err) {}
  });

  // Browser popstate navigation hook
  window.addEventListener('popstate', function(e) {
    if (window.handleFoxBack && window.handleFoxBack()) {
      e.preventDefault();
    }
  });

  document.getElementById('funDooz').addEventListener('click', function(){
    FoxGameRewardService.launchGame('tic_tac_toe', 'solo', function(){ window.openDooz(); });
  });
  document.getElementById('funTank').addEventListener('click', function(){
    FoxGameRewardService.launchGame('tank_duel', 'solo', function(){ if(window.openTank) window.openTank(); });
  });
  document.getElementById('funMensh').addEventListener('click', function(){
    FoxGameRewardService.launchGame('fox_board', 'solo', function(){ window.openMensh(); });
  });

/* ===== FOX WORD BATTLE: core modules ===== */
/* ===== FOX WORD BATTLE: core modules ===== */
/* ===== FOX WORD BATTLE: core modules ===== */
/* ===== FOX WORD BATTLE: core modules ===== */
var FoxWordCore=(function(){
'use strict';
var LETTERS=Array.from('ااااببپتتثجچحخددذررزژسسشصضطظعغفقککگگللممننووههیی');
var WORDS=[
{word:'ابر',category:'طبیعت',difficulty:1},{word:'باد',category:'طبیعت',difficulty:1},{word:'برف',category:'طبیعت',difficulty:1},{word:'کوه',category:'طبیعت',difficulty:1},{word:'رود',category:'طبیعت',difficulty:1},{word:'ماه',category:'طبیعت',difficulty:1},{word:'گل',category:'طبیعت',difficulty:1},{word:'باغ',category:'طبیعت',difficulty:1},{word:'روباه',category:'حیوانات',difficulty:1},{word:'گوزن',category:'حیوانات',difficulty:1},{word:'پلنگ',category:'حیوانات',difficulty:1},{word:'کبوتر',category:'حیوانات',difficulty:2},{word:'پرستو',category:'حیوانات',difficulty:2},{word:'خرگوش',category:'حیوانات',difficulty:2},{word:'دلفین',category:'حیوانات',difficulty:2},{word:'پروانه',category:'حیوانات',difficulty:3},{word:'نارنجی',category:'رنگ‌ها',difficulty:2},{word:'بنفش',category:'رنگ‌ها',difficulty:1},{word:'قرمز',category:'رنگ‌ها',difficulty:1},{word:'طلایی',category:'رنگ‌ها',difficulty:2},{word:'فیروزه',category:'رنگ‌ها',difficulty:3},{word:'جنگل',category:'طبیعت',difficulty:1},{word:'باران',category:'طبیعت',difficulty:1},{word:'ستاره',category:'طبیعت',difficulty:2},{word:'آسمان',category:'طبیعت',difficulty:2},{word:'خورشید',category:'طبیعت',difficulty:3},{word:'دریاچه',category:'طبیعت',difficulty:3},{word:'کوهستان',category:'طبیعت',difficulty:3},{word:'مدرسه',category:'دانش',difficulty:2},{word:'کتاب',category:'دانش',difficulty:1},{word:'قلم',category:'دانش',difficulty:1},{word:'دفتر',category:'دانش',difficulty:1},{word:'آزمایش',category:'دانش',difficulty:3},{word:'دانشگاه',category:'دانش',difficulty:3},{word:'مهندس',category:'شغل‌ها',difficulty:2},{word:'پزشک',category:'شغل‌ها',difficulty:1},{word:'نقاش',category:'شغل‌ها',difficulty:1},{word:'خلبان',category:'شغل‌ها',difficulty:2},{word:'دوستی',category:'احساسات',difficulty:2},{word:'شادی',category:'احساسات',difficulty:1},{word:'آرامش',category:'احساسات',difficulty:2},{word:'امید',category:'احساسات',difficulty:1},{word:'پیروزی',category:'احساسات',difficulty:3},{word:'هویج',category:'خوراکی‌ها',difficulty:1},{word:'نارگیل',category:'خوراکی‌ها',difficulty:2},{word:'هندوانه',category:'خوراکی‌ها',difficulty:3},{word:'پرتقال',category:'خوراکی‌ها',difficulty:2},{word:'زعفران',category:'خوراکی‌ها',difficulty:3},{word:'آبنبات',category:'خوراکی‌ها',difficulty:2},{word:'تهران',category:'شهرها',difficulty:1},{word:'شیراز',category:'شهرها',difficulty:1},{word:'تبریز',category:'شهرها',difficulty:1},{word:'اصفهان',category:'شهرها',difficulty:2},{word:'کرمان',category:'شهرها',difficulty:1},{word:'همدان',category:'شهرها',difficulty:1},{word:'هواپیما',category:'وسایل',difficulty:3},{word:'دوچرخه',category:'وسایل',difficulty:3},{word:'رایانه',category:'وسایل',difficulty:2},{word:'تلفن',category:'وسایل',difficulty:1},{word:'قطار',category:'وسایل',difficulty:1},{word:'چراغ',category:'وسایل',difficulty:1},{word:'پنجره',category:'خانه',difficulty:2},{word:'آینه',category:'خانه',difficulty:1},{word:'صندلی',category:'خانه',difficulty:2},{word:'فرش',category:'خانه',difficulty:1},{word:'کمد',category:'خانه',difficulty:1},{word:'بالش',category:'خانه',difficulty:1},{word:'فانوس',category:'وسایل',difficulty:2},{word:'کشتی',category:'وسایل',difficulty:1},{word:'قایق',category:'وسایل',difficulty:1},{word:'ساعت',category:'وسایل',difficulty:1},{word:'کلید',category:'وسایل',difficulty:1},{word:'لبخند',category:'احساسات',difficulty:2},{word:'آزادی',category:'احساسات',difficulty:2},{word:'مهربان',category:'احساسات',difficulty:3},{word:'بهار',category:'فصل‌ها',difficulty:1},{word:'پاییز',category:'فصل‌ها',difficulty:2},{word:'تابستان',category:'فصل‌ها',difficulty:3},{word:'زمستان',category:'فصل‌ها',difficulty:3},{word:'موسیقی',category:'هنر',difficulty:3},{word:'شعر',category:'هنر',difficulty:1},{word:'داستان',category:'هنر',difficulty:2},{word:'نمایش',category:'هنر',difficulty:2}
];
var LEVELS=[
{id:1,size:4,count:4,maxDifficulty:1,minLength:3,maxLength:4,ai:'easy',time:75,env:0,title:'آغاز جنگل'},
{id:2,size:4,count:5,maxDifficulty:1,minLength:3,maxLength:5,ai:'easy',time:70,env:1,title:'کوچه‌های شب'},
{id:3,size:5,count:6,maxDifficulty:2,minLength:4,maxLength:6,ai:'normal',time:75,env:2,title:'مه اسرارآمیز'},
{id:4,size:5,count:7,maxDifficulty:2,minLength:4,maxLength:7,ai:'normal',time:70,env:3,title:'کتابخانه چوبی'},
{id:5,size:5,count:7,maxDifficulty:3,minLength:4,maxLength:7,ai:'hard',time:68,env:4,title:'قلهٔ واژه‌ها'},
{id:6,size:6,count:8,maxDifficulty:3,minLength:4,maxLength:8,ai:'hard',time:75,env:0,title:'جنگل ژرف'},
{id:7,size:6,count:8,maxDifficulty:3,minLength:4,maxLength:8,ai:'expert',time:72,env:1,title:'شب نهایی'},
{id:8,size:7,count:9,maxDifficulty:3,minLength:4,maxLength:8,ai:'expert',time:80,env:2,title:'استاد کلمات'}
];
var AI={easy:{base:4800,perLetter:430,error:.28,skill:.25,label:'آسان'},normal:{base:3500,perLetter:330,error:.12,skill:.52,label:'معمولی'},hard:{base:2400,perLetter:250,error:.04,skill:.78,label:'سخت'},expert:{base:1550,perLetter:180,error:0,skill:1,label:'حرفه‌ای'}};
function shuffle(a,rng){rng=rng||Math.random;for(var i=a.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function scoreOf(w){return({1:10,2:20,3:30}[w.difficulty]||10)+Math.max(0,Array.from(w.word).length-4)*2;}
function GridGenerator(){}
GridGenerator.prototype.generate=function(level){for(var attempt=0;attempt<180;attempt++){var n=level.size,grid=Array.from({length:n},function(){return Array(n).fill('');}),pool=shuffle(WORDS.filter(function(w){var l=Array.from(w.word).length;return w.difficulty<=level.maxDifficulty&&l>=level.minLength&&l<=level.maxLength;}).slice()),targets=[];for(var i=0;i<pool.length&&targets.length<level.count;i++){var path=this.place(grid,pool[i].word);if(path)targets.push({id:targets.length,word:pool[i].word,category:pool[i].category,difficulty:pool[i].difficulty,score:scoreOf(pool[i]),path:path,owner:null});}if(targets.length===level.count){for(var r=0;r<n;r++)for(var c=0;c<n;c++)if(!grid[r][c])grid[r][c]=LETTERS[Math.floor(Math.random()*LETTERS.length)];return{size:n,grid:grid,targets:targets};}}throw new Error('grid_generation_failed');};
GridGenerator.prototype.place=function(grid,word){var ch=Array.from(word),n=grid.length,dirs=shuffle([[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].slice());for(var t=0;t<240;t++){var d=dirs[t%dirs.length],r=Math.floor(Math.random()*n),c=Math.floor(Math.random()*n),endR=r+d[0]*(ch.length-1),endC=c+d[1]*(ch.length-1);if(endR<0||endR>=n||endC<0||endC>=n)continue;var ok=true,path=[];for(var i=0;i<ch.length;i++){var rr=r+d[0]*i,cc=c+d[1]*i;if(grid[rr][cc]&&grid[rr][cc]!==ch[i]){ok=false;break;}path.push(rr*n+cc);}if(!ok)continue;for(var k=0;k<ch.length;k++){var pr=Math.floor(path[k]/n),pc=path[k]%n;grid[pr][pc]=ch[k];}return path;}return null;};
function scanGrid(board,words){var n=board.size,g=board.grid,out=[],dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];words.forEach(function(w){var ch=Array.from(w.word),found=null;for(var r=0;r<n&&!found;r++)for(var c=0;c<n&&!found;c++)for(var q=0;q<dirs.length&&!found;q++){var d=dirs[q],er=r+d[0]*(ch.length-1),ec=c+d[1]*(ch.length-1);if(er<0||er>=n||ec<0||ec>=n)continue;var path=[],ok=true;for(var i=0;i<ch.length;i++){var rr=r+d[0]*i,cc=c+d[1]*i;if(g[rr][cc]!==ch[i]){ok=false;break;}path.push(rr*n+cc);}if(ok)found=path;}if(found)out.push({target:w,path:found});});return out;}
function selfTest(){var gen=new GridGenerator();for(var l=0;l<LEVELS.length;l++)for(var k=0;k<3;k++){var b=gen.generate(LEVELS[l]),f=scanGrid(b,b.targets);if(b.targets.length!==LEVELS[l].count||f.length!==b.targets.length)throw new Error('word_engine_self_test_level_'+LEVELS[l].id);}return true;}
return{WORDS:WORDS,LEVELS:LEVELS,AI:AI,GridGenerator:GridGenerator,scanGrid:scanGrid,scoreOf:scoreOf,shuffle:shuffle,selfTest:selfTest};
})();
/* ===== FOX WORD BATTLE: UI, input, state, AI and round systems ===== */
(function(C){
'use strict';if(typeof document==='undefined')return;var V=document.getElementById('viewWords');if(!V)return;
var ASSETS={backgrounds:['/static/6d7c70cc28f0b91ecd53762734b33f2019dca1baffc2061399422aa21a77d3df.webp','/static/e9226d8c1e72fed4cc15e7d70f5a4ca01ecde493c08adbe27904ecd993cac6e0.webp','/static/d4362224fce43d10f7bf00e261417aee64380d67adf3206676d238fb1c440bbc.webp','/static/e09782212d1c89c365906177e26182dd747877502f7261f7b0e58723f2d2be37.webp','/static/765f2957bedc6875bdb8b8967671e43eccd33e7c5c35415881c505f8909c12c2.webp'],fox:{idle:'/static/b80aa56d75c2dbb6f4c3374870f94076a0ba9be341789f87229c0e774659d471.webp',thinking:'/static/ef5074f70cfbfaa9a7df1237b265db2ac824e39257ce5bfedf7380d10cadec73.webp',searching:'/static/ef5074f70cfbfaa9a7df1237b265db2ac824e39257ce5bfedf7380d10cadec73.webp',found:'/static/d2648cea994e282d5a1acd0a7393de15d9464d1aafd98cbe06fae3a77ed9cb78.webp',happy:'/static/d2648cea994e282d5a1acd0a7393de15d9464d1aafd98cbe06fae3a77ed9cb78.webp',win:'/static/d01e88f1fe5967a13bec20180afec09852e8bd014c46891da863bbd3064b859b.webp',lose:'/static/af07bccb88f4c52531ce6fb0572419508a6f8f0d30a228735b37d4c07f465b1c.webp'}};
var ENV_NAMES=['جنگل روباه','دهکده شبانه','جنگل مه‌آلود','کلبه چوبی','کوهستان'];
function E(id){return document.getElementById(id);}function fa(n){return String(Math.max(0,Math.round(n))).replace(/[0-9]/g,function(d){return'۰۱۲۳۴۵۶۷۸۹'[+d];});}
function Sound(){this.muted=false;this.ctx=null;}Sound.prototype.play=function(type){if(this.muted)return;var map={tap:[430,.045,.035],found:[760,.14,.08],bad:[145,.18,.07],fox:[260,.12,.06],win:[880,.35,.09],lose:[155,.35,.07],button:[520,.06,.04]},x=map[type]||map.button;try{this.ctx=this.ctx||new(window.AudioContext||window.webkitAudioContext)();var o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type==='bad'?'sawtooth':'sine';o.frequency.value=x[0];g.gain.setValueAtTime(x[2],this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+x[1]);o.connect(g);g.connect(this.ctx.destination);o.start();o.stop(this.ctx.currentTime+x[1]);}catch(e){}};
function Game(){this.sound=new Sound();this.gen=new C.GridGenerator();this.levelIndex=0;this.env=0;this.unlocked=Math.max(1,+(localStorage.getItem('fox_words_unlocked')||1));this.record=+(localStorage.getItem('fox_words_record')||0);this.state='menu';this.mode='solo';this.online=null;this.onlinePoll=0;this.queuePoll=0;this.queueStarted=0;this.board=null;this.playerScore=0;this.foxScore=0;this.remaining=0;this.endAt=0;this.timer=0;this.aiTimer=0;this.selection=[];this.pointer=false;this.aiPath=[];this.toastTimer=0;this.bind();this.buildMenu();this.setFox('idle',E('wbaStartFox'));E('wbaRecord').textContent=fa(this.record);}
Game.prototype.bind=function(){var self=this;E('wbaExit').onclick=function(){self.exit();};E('wbaBegin').onclick=function(){self.mode==='online'?self.startOnline():self.startLevel();};E('wbaModeSolo').onclick=function(){self.mode='solo';self.buildMenu();self.sound.play('button');};E('wbaModeOnline').onclick=function(){self.mode='online';self.buildMenu();self.sound.play('button');};E('wbaQueueCancel').onclick=function(){self.cancelQueue();};E('wbaPause').onclick=function(){self.pause();};E('wbaResume').onclick=function(){self.resume();};E('wbaRestart').onclick=function(){self.restart();};E('wbaQuit').onclick=function(){self.exit();};E('wbaResultRestart').onclick=function(){self.restart();};E('wbaResultExit').onclick=function(){self.exit();};E('wbaNext').onclick=function(){self.next();};E('wbaSound').onclick=E('wbaPlaySound').onclick=function(){self.sound.muted=!self.sound.muted;E('wbaSound').textContent=E('wbaPlaySound').textContent=self.sound.muted?'🔇':'🔊';};var box=E('wbaGridBox');box.addEventListener('pointerdown',function(e){self.pointerDown(e);});box.addEventListener('pointermove',function(e){self.pointerMove(e);});box.addEventListener('pointerup',function(e){self.pointerUp(e);});box.addEventListener('pointercancel',function(e){self.pointerUp(e);});window.addEventListener('resize',function(){self.drawLines();});};
Game.prototype.buildMenu=function(){var self=this,envs=E('wbaEnvs');envs.innerHTML='';ASSETS.backgrounds.forEach(function(src,i){var b=document.createElement('button');b.className='wba-env'+(i===self.env?' on':'');b.innerHTML='<img loading="lazy" decoding="async" alt="'+ENV_NAMES[i]+'" src="'+src+'"><span>'+ENV_NAMES[i]+'</span>';b.onclick=function(){self.sound.play('button');self.env=i;self.applyBackground();self.buildMenu();};envs.appendChild(b);});var levels=E('wbaLevels');levels.innerHTML='';C.LEVELS.forEach(function(l,i){var locked=l.id>self.unlocked,b=document.createElement('button');b.className='wba-level'+(i===self.levelIndex?' on':'')+(locked?' locked':'');b.innerHTML='<b>'+(locked?'🔒':fa(l.id))+'</b><small>'+l.size+'×'+l.size+' · '+C.AI[l.ai].label+'</small>';b.onclick=function(){if(locked){self.toast('این مرحله هنوز قفل است');return;}self.levelIndex=i;self.env=l.env;self.applyBackground();self.buildMenu();};levels.appendChild(b);});var l=C.LEVELS[this.levelIndex];E('wbaLevelInfo').textContent=l.title+' · '+fa(l.count)+' واژه';E('wbaModeSolo').classList.toggle('on',this.mode==='solo');E('wbaModeOnline').classList.toggle('on',this.mode==='online');E('wbaBegin').textContent=this.mode==='online'?'پیدا کردن حریف':'شروع مرحله با روباه';this.applyBackground();};
Game.prototype.applyBackground=function(){E('wbaApp').style.backgroundImage='url("'+ASSETS.backgrounds[this.env]+'")';};
Game.prototype.open=function(){this.stopAll();this.state='menu';document.querySelectorAll('.view').forEach(function(x){x.classList.add('hidden');x.style.display='none';});V.classList.remove('hidden');V.style.display='flex';try{bottomNav.classList.add('show');}catch(e){}E('wbaStart').classList.remove('wba-hidden');E('wbaPlay').classList.add('wba-hidden');E('wbaPauseLayer').classList.add('wba-hidden');E('wbaQueue').classList.add('wba-hidden');E('wbaResult').classList.add('wba-hidden');this.buildMenu();this.setFox('idle',E('wbaStartFox'));};
Game.prototype.exit=function(){this.stopAll();this.leaveOnline();this.state='menu';V.classList.add('hidden');V.style.display='none';if(window.goFun)window.goFun();};
Game.prototype.stopAll=function(){clearInterval(this.timer);clearTimeout(this.aiTimer);clearInterval(this.onlinePoll);clearInterval(this.queuePoll);this.timer=this.aiTimer=this.onlinePoll=this.queuePoll=0;this.pointer=false;};
Game.prototype.identity=function(){var u=null;try{u=typeof currentUser!=='undefined'?currentUser:null;}catch(e){}var id=u&&u.phone;try{if(!id){id=localStorage.getItem('fox_words_guest');if(!id){id='wg_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);localStorage.setItem('fox_words_guest',id);}}}catch(e){id='wg_'+Math.random().toString(36).slice(2);}return{phone:String(id),name:String(u&&u.name||'بازیکن').slice(0,20)};};
Game.prototype.api=async function(path,opt){var r=await fetch('/api/words/'+path,opt||{}),j=await r.json();if(!r.ok||j&&j.error)throw new Error(j&&j.error||'network');return j;};
Game.prototype.startOnline=async function(){this.sound.play('button');this.stopAll();this.mode='online';var level=C.LEVELS[this.levelIndex],me=this.identity(),board=this.gen.generate(level);this.online={phone:me.phone,name:me.name,room:'',seat:-1,opponent:'حریف',seenClaim:0};this.state='queue';this.queueStarted=Date.now();E('wbaQueue').classList.remove('wba-hidden');E('wbaQueueText').textContent='یک بازیکن برای مرحله '+fa(level.id)+' پیدا می‌کنیم.';E('wbaQueueTime').textContent='۰۰:۰۰';var self=this;this._qLast=-1;this.queuePoll=setInterval(function(){var s=Math.floor((Date.now()-self.queueStarted)/1000);E('wbaQueueTime').textContent=fa(Math.floor(s/60))+':'+fa(('0'+s%60).slice(-2));if(s!==self._qLast){self._qLast=s;self.waitOnline();}},500);try{var r=await this.api('join',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({phone:me.phone,name:me.name,level:level.id,env:this.env,time:level.time,board:board})});if(r.room)return this.enterOnline(r);}catch(e){this.cancelQueue(false);this.toast('اتصال به مسابقه ممکن نشد');}};
Game.prototype.waitOnline=async function(){if(!this.online||this.online.room)return;try{var r=await this.api('wait?me='+encodeURIComponent(this.online.phone));if(r&&r.room)this.enterOnline(r);}catch(e){}};
Game.prototype.enterOnline=function(meta){clearInterval(this.queuePoll);this.queuePoll=0;this.online.room=meta.room;this.online.seat=Number(meta.seat);this.online.opponent=meta.opponent||'حریف';E('wbaQueue').classList.add('wba-hidden');this.syncOnline();var self=this;this.onlinePoll=setInterval(function(){self.syncOnline();},650);};
Game.prototype.syncOnline=async function(){if(!this.online||!this.online.room)return;try{var st=await this.api('state?room='+encodeURIComponent(this.online.room)+'&me='+encodeURIComponent(this.online.phone));this.applyOnline(st);}catch(e){}};
Game.prototype.applyOnline=function(st){if(!st||!st.board)return;var first=!this.board||this.state==='menu'||this.state==='queue',seat=this.online.seat;this.mode='online';if(first){this.board=JSON.parse(JSON.stringify(st.board));this.board.targets.forEach(function(t){t.owner=t.owner===null?null:t.owner===seat?'me':'ai';});this.state=st.phase==='paused'?'paused':'playing';E('wbaStart').classList.add('wba-hidden');E('wbaPlay').classList.remove('wba-hidden');E('wbaResult').classList.add('wba-hidden');E('wbaLevelTitle').textContent='دونفره آنلاین · مرحله '+fa(st.level);E('wbaDifficulty').textContent='حریف: '+this.online.opponent;E('wbaAiState').textContent=this.online.opponent;E('wbaAiDetail').textContent='در همان جدول با تو رقابت می‌کند';E('wbaFox').src=ASSETS.fox.idle;var lbl=E('wbaFoxScore').parentElement.querySelector('.name');if(lbl)lbl.textContent='امتیاز حریف';this.renderGrid();}else{for(var i=0;i<this.board.targets.length;i++){var o=st.board.targets[i].owner;this.board.targets[i].owner=o===null?null:o===seat?'me':'ai';}}this.playerScore=st.scores[seat]||0;this.foxScore=st.scores[1-seat]||0;this.endAt=st.endAt||Date.now()+(st.remaining||0);this.remaining=st.phase==='paused'?(st.remaining||0):Math.max(0,this.endAt-Date.now());if(st.lastClaim&&st.lastClaim.version>this.online.seenClaim){this.online.seenClaim=st.lastClaim.version;if(st.lastClaim.seat!==seat){this.aiPath=st.lastClaim.path||[];this.setFox('found');this.setAIText(this.online.opponent+' پیدا کرد: «'+st.lastClaim.word+'»','امتیاز حریف به‌روزرسانی شد');var self=this;setTimeout(function(){self.aiPath=[];self.paint();self.drawLines();},700);}}this.updateHUD();this.paint();this.drawLines();if(st.phase==='paused'&&this.state!=='paused'){this.state='paused';E('wbaApp').classList.add('paused');E('wbaPauseLayer').classList.remove('wba-hidden');}else if(st.phase==='play'&&this.state==='paused'&&E('wbaPauseLayer').classList.contains('wba-hidden')){this.state='playing';E('wbaApp').classList.remove('paused');}else if(st.phase==='play')this.state='playing';if(st.phase==='done')this.finishOnline(st);};
Game.prototype.cancelQueue=async function(back){clearInterval(this.queuePoll);this.queuePoll=0;var o=this.online;this.online=null;E('wbaQueue').classList.add('wba-hidden');if(o)try{await this.api('cancel',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({phone:o.phone})});}catch(e){}if(back!==false){this.state='menu';E('wbaStart').classList.remove('wba-hidden');}};
Game.prototype.claimOnline=async function(target,path){if(!this.online)return;try{var st=await this.api('claim',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({room:this.online.room,phone:this.online.phone,targetId:target.id,path:path})});this.applyOnline(st);}catch(e){this.toast(e.message==='claimed'?'این واژه را حریف زودتر پیدا کرد':'واژه ثبت نشد');this.syncOnline();}};
Game.prototype.finishOnline=function(st){if(this.state==='result')return;this.stopAll();this.state='result';var seat=this.online.seat,win=st.winner===seat,draw=st.winner===-1;E('wbaFinalPlayer').textContent=fa(st.scores[seat]||0);E('wbaFinalFox').textContent=fa(st.scores[1-seat]||0);E('wbaResultTitle').textContent=draw?'مساوی شد!':win?'برنده شدی!':this.online.opponent+' برنده شد!';E('wbaResultText').textContent=draw?'هر دو بازیکن امتیاز برابر گرفتند.':win?'در رقابت زنده، واژه‌های بیشتری پیدا کردی.':'حریف واقعی این مسابقه امتیاز بیشتری گرفت.';var img=E('wbaResultFox');img.src=win?ASSETS.fox.lose:draw?ASSETS.fox.idle:ASSETS.fox.win;img.className='wba-fox '+(win?'lose':draw?'idle':'win');E('wbaNext').classList.add('wba-hidden');E('wbaResult').classList.remove('wba-hidden');
try {
  if (win && window.FoxGameRewardService) {
    FoxGameRewardService.claimReward({ gameCode: 'word_battle', mode: 'online', result: 'win' });
  }
} catch(e) {}
this.sound.play(win?'win':'lose');};
Game.prototype.leaveOnline=function(){var o=this.online;if(o&&o.room)fetch('/api/words/leave',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({room:o.room,phone:o.phone})}).catch(function(){});this.online=null;};
Game.prototype.startLevel=function(){this.sound.play('button');this.stopAll();this.mode='solo';this.online=null;var level=C.LEVELS[this.levelIndex];this.board=this.gen.generate(level);this.playerScore=this.foxScore=0;this.remaining=level.time*1000;this.endAt=Date.now()+this.remaining;this.state='playing';this.selection=[];this.aiPath=[];E('wbaStart').classList.add('wba-hidden');E('wbaPlay').classList.remove('wba-hidden');E('wbaResult').classList.add('wba-hidden');E('wbaPauseLayer').classList.add('wba-hidden');E('wbaQueue').classList.add('wba-hidden');E('wbaApp').classList.remove('paused');var _sl=E('wbaFoxScore').parentElement.querySelector('.name');if(_sl)_sl.textContent='امتیاز روباه';E('wbaLevelTitle').textContent='مرحله '+fa(level.id)+' · '+level.title;E('wbaDifficulty').textContent=C.AI[level.ai].label+' · جدول '+fa(level.size)+'×'+fa(level.size);this.renderGrid();this.updateHUD();this.setFox('idle');this.setAIText('روباه Grid را بررسی می‌کند…','کلمات افقی، عمودی و مورب را جست‌وجو می‌کند');var self=this;this.timer=setInterval(function(){self.tick();},200);this.scheduleAI();};
Game.prototype.renderGrid=function(){var self=this,g=E('wbaGrid');g.innerHTML='';g.style.gridTemplateColumns='repeat('+this.board.size+',1fr)';for(var r=0;r<this.board.size;r++)for(var c=0;c<this.board.size;c++){var d=document.createElement('div'),idx=r*this.board.size+c;d.className='wba-cell';d.dataset.index=idx;d.textContent=this.board.grid[r][c];g.appendChild(d);}this.renderWords();requestAnimationFrame(function(){self.drawLines();});};
Game.prototype.renderWords=function(){var w=E('wbaWords');w.innerHTML='';this.board.targets.forEach(function(t){var x=document.createElement('span');x.className='wba-chip'+(t.owner?' '+t.owner:'');x.textContent=(t.owner==='me'?'✓ ':t.owner==='ai'?'🦊 ':'')+t.word;w.appendChild(x);});var found=this.board.targets.filter(function(t){return t.owner;}).length;E('wbaFoundCount').textContent=fa(found)+'/'+fa(this.board.targets.length);};
Game.prototype.tick=function(){if(this.state!=='playing')return;this.remaining=Math.max(0,this.endAt-Date.now());E('wbaTime').textContent=fa(Math.ceil(this.remaining/1000));E('wbaTimeBox').classList.toggle('danger',this.remaining<=10000);if(this.remaining<=0){if(this.mode==='online')this.syncOnline();else this.finish();}};
Game.prototype.updateHUD=function(){E('wbaPlayerScore').textContent=fa(this.playerScore);E('wbaFoxScore').textContent=fa(this.foxScore);E('wbaTime').textContent=fa(Math.ceil(this.remaining/1000));this.renderWords();};
Game.prototype.setFox=function(state,img){img=img||E('wbaFox');if(!img)return;var src=ASSETS.fox[state]||ASSETS.fox.idle;img.style.opacity='0';var box=img.parentElement;box.classList.toggle('wba-thinking',state==='thinking'||state==='searching');setTimeout(function(){img.src=src;img.className='wba-fox '+state;img.style.opacity='1';},90);};
Game.prototype.setAIText=function(a,b){E('wbaAiState').textContent=a;E('wbaAiDetail').textContent=b||'';};
Game.prototype.scheduleAI=function(){var self=this;if(this.state!=='playing')return;clearTimeout(this.aiTimer);var level=C.LEVELS[this.levelIndex],profile=C.AI[level.ai],available=this.board.targets.filter(function(t){return!t.owner;});if(!available.length)return;this.setFox('thinking');this.setAIText('روباه در حال فکر کردن…','در حال اسکن مسیرهای ممکن');var scan=C.scanGrid(this.board,available);if(!scan.length)return;scan.sort(function(a,b){return b.target.score-a.target.score||b.target.word.length-a.target.word.length;});var rank=Math.floor((1-profile.skill)*(scan.length-1));var choice=scan[Math.min(scan.length-1,rank)];if(Math.random()<profile.error&&scan.length>1)choice=scan[scan.length-1];var delay=profile.base+Array.from(choice.target.word).length*profile.perLetter;this.aiTimer=setTimeout(function(){self.aiReveal(choice);},delay);};
Game.prototype.aiReveal=function(choice){var self=this;if(this.state!=='playing'||choice.target.owner){this.scheduleAI();return;}this.aiPath=choice.path.slice();this.setFox('searching');this.setAIText('روباه مسیر را پیدا کرد…',choice.target.category+' · '+fa(choice.target.score)+' امتیاز');this.paint();this.drawLines();this.aiTimer=setTimeout(function(){if(self.state!=='playing')return;if(!choice.target.owner){choice.target.owner='ai';self.foxScore+=choice.target.score;self.sound.play('fox');self.setFox('found');self.setAIText('روباه پیدا کرد: «'+choice.target.word+'»','امتیاز روباه به‌روزرسانی شد');self.aiPath=[];self.updateHUD();self.paint();self.drawLines();if(self.checkEnd())return;self.aiTimer=setTimeout(function(){self.scheduleAI();},650);}else{self.aiPath=[];self.paint();self.drawLines();self.scheduleAI();}},850);};
Game.prototype.pointerDown=function(e){if(this.state!=='playing')return;var cell=e.target.closest('.wba-cell');if(!cell)return;e.preventDefault();E('wbaGridBox').setPointerCapture&&E('wbaGridBox').setPointerCapture(e.pointerId);this.pointer=true;this.selection=[+cell.dataset.index];this.sound.play('tap');this.paint();this.drawLines();};
Game.prototype.pointerMove=function(e){if(!this.pointer||this.state!=='playing')return;e.preventDefault();var el=document.elementFromPoint(e.clientX,e.clientY),cell=el&&el.closest&&el.closest('.wba-cell');if(!cell)return;var idx=+cell.dataset.index,last=this.selection[this.selection.length-1];if(idx===last)return;if(this.selection.length>1&&idx===this.selection[this.selection.length-2]){this.selection.pop();this.paint();this.drawLines();return;}if(this.selection.indexOf(idx)>=0||!this.adjacent(last,idx))return;this.selection.push(idx);this.sound.play('tap');this.paint();this.drawLines();};
Game.prototype.pointerUp=function(e){if(!this.pointer)return;this.pointer=false;if(this.state!=='playing'){this.selection=[];return;}var word=this.selection.map(function(i){var c=E('wbaGrid').children[i];return c?c.textContent:'';}).join(''),rev=Array.from(word).reverse().join(''),target=this.board.targets.find(function(t){return!t.owner&&(t.word===word||t.word===rev);});if(target){var claimPath=this.selection.slice();this.selection=[];this.paint();this.drawLines();if(this.mode==='online'){this.sound.play('found');this.claimOnline(target,claimPath);return;}target.owner='me';this.playerScore+=target.score;this.sound.play('found');this.toast('+'+fa(target.score)+' · '+target.word);this.updateHUD();this.paint();this.drawLines();if(this.checkEnd())return;this.scheduleAI();}else{this.sound.play('bad');this.invalidFlash();this.toast(word?'واژه معتبر نیست':'مسیر را کامل کن');var self=this;setTimeout(function(){self.selection=[];self.paint();self.drawLines();},280);}};
Game.prototype.adjacent=function(a,b){var n=this.board.size,ar=Math.floor(a/n),ac=a%n,br=Math.floor(b/n),bc=b%n;return Math.max(Math.abs(ar-br),Math.abs(ac-bc))===1;};
Game.prototype.invalidFlash=function(){this.selection.forEach(function(i){var c=E('wbaGrid').children[i];if(c)c.classList.add('invalid');});};
Game.prototype.paint=function(){if(!this.board)return;var cells=E('wbaGrid').children,meFound={},aiFound={};this.board.targets.forEach(function(t){if(t.owner==='me')t.path.forEach(function(i){meFound[i]=1;});if(t.owner==='ai')t.path.forEach(function(i){aiFound[i]=1;});});for(var i=0;i<cells.length;i++){cells[i].classList.remove('player','ai','found-me','found-ai','invalid');if(meFound[i])cells[i].classList.add('found-me');if(aiFound[i])cells[i].classList.add('found-ai');if(this.selection.indexOf(i)>=0)cells[i].classList.add('player');if(this.aiPath.indexOf(i)>=0)cells[i].classList.add('ai');}};
Game.prototype.pathPoints=function(path){var grid=E('wbaGrid'),box=E('wbaGridBox'),gr=grid.getBoundingClientRect(),br=box.getBoundingClientRect();return path.map(function(i){var c=grid.children[i];if(!c)return'';var r=c.getBoundingClientRect();return(r.left+r.width/2-br.left-10)+','+(r.top+r.height/2-br.top-10);}).join(' ');};
Game.prototype.drawLines=function(){if(!this.board)return;E('wbaPlayerLine').setAttribute('points',this.pathPoints(this.selection));E('wbaAiLine').setAttribute('points',this.pathPoints(this.aiPath));};
Game.prototype.toast=function(t){var x=E('wbaToast');x.textContent=t;x.classList.add('show');clearTimeout(this.toastTimer);this.toastTimer=setTimeout(function(){x.classList.remove('show');},1700);};
Game.prototype.checkEnd=function(){if(this.board.targets.every(function(t){return!!t.owner;})){this.finish();return true;}return false;};
Game.prototype.pause=function(){if(this.state!=='playing')return;this.remaining=Math.max(0,this.endAt-Date.now());this.state='paused';clearInterval(this.timer);clearTimeout(this.aiTimer);clearInterval(this.onlinePoll);this.timer=this.aiTimer=this.onlinePoll=0;if(this.mode==='online'&&this.online)this.api('pause',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({room:this.online.room,phone:this.online.phone,action:'pause'})}).catch(function(){});this.selection=[];this.aiPath=[];this.paint();this.drawLines();E('wbaApp').classList.add('paused');E('wbaPauseLayer').classList.remove('wba-hidden');};
Game.prototype.resume=function(){if(this.state!=='paused')return;this.sound.play('button');this.state='playing';this.endAt=Date.now()+this.remaining;E('wbaApp').classList.remove('paused');E('wbaPauseLayer').classList.add('wba-hidden');var self=this;this.timer=setInterval(function(){self.tick();},200);if(this.mode==='online'&&this.online){this.api('pause',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({room:this.online.room,phone:this.online.phone,action:'resume'})}).then(function(st){self.applyOnline(st);}).catch(function(){});this.onlinePoll=setInterval(function(){self.syncOnline();},650);}else this.scheduleAI();};
Game.prototype.restart=function(){this.sound.play('button');E('wbaPauseLayer').classList.add('wba-hidden');E('wbaResult').classList.add('wba-hidden');if(this.mode==='online'){this.leaveOnline();this.startOnline();}else this.startLevel();};
Game.prototype.finish=function(){if(this.state==='result')return;this.stopAll();this.state='result';this.remaining=Math.max(0,this.endAt-Date.now());var win=this.playerScore>this.foxScore,draw=this.playerScore===this.foxScore;
try {
  if (win && window.FoxGameRewardService) {
    FoxGameRewardService.claimReward({ gameCode: 'word_battle', mode: 'solo', result: 'win' });
  }
} catch(e) {}E('wbaFinalPlayer').textContent=fa(this.playerScore);E('wbaFinalFox').textContent=fa(this.foxScore);E('wbaResultTitle').textContent=draw?'مساوی شد!':win?'برنده شدی!':'روباه برنده شد!';E('wbaResultText').textContent=draw?'رقابت کاملاً برابر بود.':win?'واژه‌ها را سریع‌تر و دقیق‌تر پیدا کردی.':'روباه این بار مسیرهای بهتری پیدا کرد.';var img=E('wbaResultFox');img.src=win?ASSETS.fox.lose:draw?ASSETS.fox.idle:ASSETS.fox.win;img.className='wba-fox '+(win?'lose':draw?'idle':'win');if(win){this.sound.play('win');var next=Math.min(C.LEVELS.length,this.levelIndex+2);if(next>this.unlocked){this.unlocked=next;localStorage.setItem('fox_words_unlocked',String(next));}}else this.sound.play('lose');if(this.playerScore>this.record){this.record=this.playerScore;localStorage.setItem('fox_words_record',String(this.record));}E('wbaNext').classList.toggle('wba-hidden',!win||this.levelIndex>=C.LEVELS.length-1);E('wbaResult').classList.remove('wba-hidden');};
Game.prototype.next=function(){if(this.levelIndex<C.LEVELS.length-1){this.levelIndex++;this.env=C.LEVELS[this.levelIndex].env;}this.startLevel();};
try{C.selfTest();}catch(err){console.error('Fox Word Battle self-test failed',err);}var game=new Game();window.openWords=function(){game.open();};window.__FOX_WORD_BATTLE__={game:game,core:C};
})(FoxWordCore);

/* ===== MEMORY FOX 2027 — تک‌نفره + دونفره آنلاین (حریف واقعی) ===== */
(function () {
  var startPanel = document.getElementById('memoryStartPanel');
  var gamePanel = document.getElementById('memoryGamePanel');
  var board = document.getElementById('memoryBoard');
  var resultLayer = document.getElementById('memoryResult');
  var resultTitle = document.getElementById('memoryResultTitle');
  var resultKicker = document.getElementById('memoryResultKicker');
  var resultText = document.getElementById('memoryResultText');
  var resultScore = document.getElementById('memoryResultScore');
  var resultScoreLabel = document.getElementById('memoryResultScoreLabel');
  var resultMoves = document.getElementById('memoryResultMoves');
  var resultTime = document.getElementById('memoryResultTime');
  var resultNote = document.getElementById('memoryResultNote');
  var resultAgain = document.getElementById('memoryAgain');
  var confetti = document.getElementById('memoryConfetti');
  var soundButton = document.getElementById('memorySound');
  var soundIcon = document.getElementById('memorySoundIcon');
  var queueLayer = document.getElementById('memoryQueue');
  var queueWait = document.getElementById('memoryQueueWait');
  var queueTitle = document.getElementById('memoryQueueTitle');
  var queueSub = document.getElementById('memoryQueueSub');
  var queueActions = document.getElementById('memoryQueueActions');
  var brandSub = document.getElementById('memoryBrandSub');
  var hintEl = document.getElementById('memoryHint');

  if (!startPanel || !gamePanel || !board) return;

  var PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  var RECORD_KEY = 'fox_memory_records_2027_v1';
  var SOUND_KEY = 'fox_memory_sound_2027';
  var TOTAL_CARDS = 12;
  var TOTAL_PAIRS = 6;
  var POLL_MS = 750;
  var MATCH_HOLD = 560;
  var WRONG_HOLD = 640;

  /* تصویرهای سبک وکتوری برای روی کارت‌ها (۱۲ طرح، هر بازی ۶ طرح تصادفی) */
  var MEMORY_ART = [
    { id: 'fox', label: 'روباه', body: '<path d="M43 61 34 27l28 17c10-6 26-6 36 0l28-17-9 34c8 10 8 27 0 41-11 19-49 19-60 0-8-14-8-31 0-41Z" fill="#f47b2a"/><path d="M43 61 34 27l28 17-11 17Z" fill="#ffb35c"/><path d="m117 61 9-34-28 17 11 17Z" fill="#d85b19"/><path d="M52 91c8-13 40-13 48 0-5 17-14 23-24 23s-19-6-24-23Z" fill="#fff2df"/><circle cx="63" cy="79" r="4" fill="#2e160b"/><circle cx="97" cy="79" r="4" fill="#2e160b"/><path d="M76 91q4 4 8 0" stroke="#2e160b" stroke-width="3" stroke-linecap="round"/><path d="M80 92v8" stroke="#2e160b" stroke-width="2.5" stroke-linecap="round"/><path d="M54 69 45 64M106 69l9-5" stroke="#fff2df" stroke-width="3" stroke-linecap="round" opacity=".8"/>' },
    { id: 'tail', label: 'دم روباه', body: '<path d="M41 112c-13-27-2-67 28-76 26-8 56 6 58 30 2 21-22 32-41 21-9-5-15-15-11-24 3-7 12-10 18-4 5 5 3 12-4 15 12 4 22-1 20-9-3-12-24-17-39-8-18 11-21 34-11 50Z" fill="#f47b2a"/><path d="M73 37c25-8 52 4 54 28 2 17-12 27-26 26 10-5 15-14 11-25-6-17-29-23-45-15-15 8-23 22-23 38-6-22 2-44 29-52Z" fill="#ffb35c" opacity=".82"/><path d="M46 113c-10-21-6-39 8-52 5 14 15 24 30 29-8 16-20 24-38 23Z" fill="#cc5117" opacity=".88"/>' },
    { id: 'coin', label: 'سکه', body: '<circle cx="80" cy="80" r="43" fill="#f5b52e"/><circle cx="80" cy="80" r="34" fill="none" stroke="#fff0a3" stroke-width="4" opacity=".9"/><circle cx="80" cy="80" r="27" fill="#e69719"/><path d="m80 54 7 17 18 1-14 11 5 18-16-10-16 10 5-18-14-11 18-1 7-17Z" fill="#ffe998"/><path d="M49 61q31-25 62 0" stroke="#fff6c5" stroke-width="4" stroke-linecap="round" opacity=".7"/>' },
    { id: 'diamond', label: 'الماس', body: '<path d="m80 28 39 35-39 69-39-69 39-35Z" fill="#48d4d3"/><path d="M41 63h78L80 132 41 63Z" fill="#20aebc"/><path d="m80 28 14 35-14 69-14-69 14-35Z" fill="#a8fff0" opacity=".75"/><path d="m41 63 25 0 14 69M119 63H94L80 132" fill="none" stroke="#d4fff7" stroke-width="3" opacity=".7"/><path d="m80 28 14 35H66l14-35Z" fill="#e1fffa" opacity=".75"/>' },
    { id: 'crown', label: 'تاج', body: '<path d="M31 55 51 72l29-38 29 38 20-17-10 68H41L31 55Z" fill="#f4b531"/><path d="M41 104h78l-3 19H44l-3-19Z" fill="#d88b16"/><path d="M39 105h82" stroke="#ffe99a" stroke-width="5" stroke-linecap="round"/><circle cx="51" cy="72" r="6" fill="#ff6d5b"/><circle cx="80" cy="43" r="6" fill="#77dbcb"/><circle cx="109" cy="72" r="6" fill="#c99bff"/><path d="M45 91h70" stroke="#fff2b7" stroke-width="4" stroke-linecap="round" opacity=".85"/>' },
    { id: 'chest', label: 'صندوق گنج', body: '<path d="M34 61h92v55a9 9 0 0 1-9 9H43a9 9 0 0 1-9-9V61Z" fill="#9d4b24"/><path d="M31 61c3-18 19-29 49-29s46 11 49 29H31Z" fill="#c96a2b"/><path d="M80 32v29" stroke="#f2af4b" stroke-width="5"/><path d="M34 70h92" stroke="#f2af4b" stroke-width="5"/><rect x="71" y="78" width="18" height="26" rx="4" fill="#ffd36e"/><circle cx="80" cy="88" r="3" fill="#7a3a16"/><path d="M45 51q35-15 70 0" stroke="#ffd98a" stroke-width="4" stroke-linecap="round" opacity=".75"/>' },
    { id: 'leaf', label: 'برگ جنگل', body: '<path d="M80 133C38 117 28 78 46 40c34 4 58 28 45 64-4 12-8 20-11 29Z" fill="#4dbb76"/><path d="M80 132C76 98 67 70 47 42" stroke="#d4f29e" stroke-width="5" stroke-linecap="round"/><path d="M61 72 42 64M69 91 48 88M75 108 55 111" stroke="#d4f29e" stroke-width="3" stroke-linecap="round" opacity=".9"/><path d="M84 115c23-11 31-28 28-51 14 17 9 45-28 69" fill="#258b60"/><path d="M108 65 84 115" stroke="#9be69a" stroke-width="3" stroke-linecap="round"/>' },
    { id: 'star', label: 'ستاره', body: '<path d="m80 26 13 36 38 1-30 23 11 37-32-22-32 22 11-37-30-23 38-1 13-36Z" fill="#ffd45a"/><path d="m80 42 8 26 28 1-22 16 8 26-22-15-22 15 8-26-22-16 28-1 8-26Z" fill="#f2a52d"/><path d="M80 46v61M51 72h58" stroke="#ffedab" stroke-width="3" opacity=".85"/>' },
    { id: 'key', label: 'کلید', body: '<circle cx="56" cy="70" r="25" fill="none" stroke="#e9b94d" stroke-width="10"/><circle cx="56" cy="70" r="9" fill="#ffe8a2"/><path d="m75 87 52 32-10 10-11-7-8 8-9-6 8-9-10-6 9-10-20-12Z" fill="#c98a25"/><path d="m82 92 43 27" stroke="#ffe8a2" stroke-width="4" stroke-linecap="round" opacity=".8"/>' },
    { id: 'crystal', label: 'کریستال', body: '<path d="m54 27 27 8 25-7 20 32-31 73-33-5-19-67 11-34Z" fill="#a67af2"/><path d="m54 27 27 8-4 40-34-15 11-33ZM81 35l25-7 20 32-49 15 4-40Z" fill="#d8b9ff"/><path d="m44 60 34 15 17 58-33-5-18-68ZM93 75l33-15-31 73-2-58Z" fill="#7148ca" opacity=".86"/><path d="M81 35 78 75l15 0" fill="none" stroke="#f4eaff" stroke-width="4" opacity=".8"/>' },
    { id: 'lantern', label: 'فانوس', body: '<path d="M62 38c0-12 8-20 18-20s18 8 18 20" fill="none" stroke="#efb44b" stroke-width="6" stroke-linecap="round"/><path d="M51 45h58l-5 75H56l-5-75Z" fill="#d56f2c"/><path d="M46 45h68M59 120h42" stroke="#ffd66d" stroke-width="6" stroke-linecap="round"/><path d="M63 53v55M80 53v55M97 53v55" stroke="#ffeaaa" stroke-width="3" opacity=".75"/><path d="M80 57c-13 14-13 34 0 48 13-14 13-34 0-48Z" fill="#ffe484" opacity=".95"/><path d="M63 36h34" stroke="#ffdc72" stroke-width="4" stroke-linecap="round"/>' },
    { id: 'map', label: 'نقشه گنج', body: '<path d="m31 45 31-14 36 14 31-14v75l-31 14-36-14-31 14V45Z" fill="#e8c27d"/><path d="M62 31v75M98 45v61" stroke="#ad6b2e" stroke-width="3"/><path d="M46 86c12-16 23-5 34-17 11-12 18-6 27-17" fill="none" stroke="#d4552b" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 7"/><path d="m108 46 5 12 12 1-9 8 3 12-11-7-11 7 3-12-9-8 12-1 5-12Z" fill="#e45e32"/><circle cx="80" cy="69" r="5" fill="#bb4a27"/>' }
  ];;

  var M = {
    mode: 'single',
    token: 0,
    soundOn: localStorage.getItem(SOUND_KEY) !== '0',
    audio: null,
    /* ---- تک‌نفره ---- */
    deck: [],
    art: [],
    cardState: [],
    firstIndex: -1,
    secondIndex: -1,
    wrongPair: null,
    lockBoard: false,
    matchedPairs: 0,
    moves: 0,
    scoreBase: 0,
    elapsed: 0,
    startedAt: 0,
    timerId: null,
    pendingTimer: null,
    gameOver: true,
    /* ---- دونفره آنلاین ---- */
    myPhone: '',
    room: '',
    seat: -1,
    net: null,
    netBusy: false,
    skew: 0,
    localOpen: {},
    resultShown: false,
    waitingAgain: false,
    /* ---- عمومی ---- */
    lastTurn: null,
    lastPendingKey: '',
    soundReady: false,
    uiTimer: null,
    queueTimer: null,
    queuePoll: null
  };

  function byId(id) { return document.getElementById(id); }
  function fa(value) { return String(value).replace(/\d/g, function (d) { return PERSIAN_DIGITS[d]; }); }
  function formatTime(seconds) {
    var s = Math.max(0, Math.floor(seconds || 0));
    var mm = Math.floor(s / 60);
    var ss = s % 60;
    return fa(String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0'));
  }
  function myPhone() {
    try { return (typeof currentUser !== 'undefined' && currentUser && currentUser.phone) ? String(currentUser.phone) : ''; }
    catch (e) { return ''; }
  }
  function myName() {
    try {
      if (typeof currentUser !== 'undefined' && currentUser) {
        var n = currentUser.name || currentUser.username || '';
        if (n) return String(n).slice(0, 20);
      }
    } catch (e) {}
    return 'روباه';
  }

  /* ---------------- records ---------------- */
  function readRecords() {
    var fallback = { bestScore: 0, bestTime: 0, bestMoves: 0 };
    try {
      var value = JSON.parse(localStorage.getItem(RECORD_KEY) || 'null');
      return value && typeof value === 'object' ? Object.assign(fallback, value) : fallback;
    } catch (e) { return fallback; }
  }
  function writeRecords(value) {
    try { localStorage.setItem(RECORD_KEY, JSON.stringify(value)); } catch (e) {}
  }
  function updateRecordUI() {
    var r = readRecords();
    if (byId('memoryBestScore')) byId('memoryBestScore').textContent = fa(r.bestScore || 0);
    if (byId('memoryBestTime')) byId('memoryBestTime').textContent = r.bestTime ? formatTime(r.bestTime) : '—';
    if (byId('memoryBestMoves')) byId('memoryBestMoves').textContent = r.bestMoves ? fa(r.bestMoves) : '—';
  }

  /* ---------------- card art ---------------- */
  function svgSource(item) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="' + item.label + '"><defs><radialGradient id="g" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#fffaf1"/><stop offset="1" stop-color="#ffe1b8"/></radialGradient></defs><circle cx="80" cy="80" r="70" fill="url(#g)"/><circle cx="80" cy="80" r="58" fill="none" stroke="#ffffff" stroke-width="2" opacity=".7"/>' + item.body + '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }
  var ART_SRC = {};
  MEMORY_ART.forEach(function (item) {
    ART_SRC[item.id] = svgSource(item);
    var image = new Image();
    image.decoding = 'async';
    image.src = ART_SRC[item.id];
  });
  function shuffle(items) {
    var a = items.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  /* آرایهٔ تصویرهای همین دست بازی */
  function activeArt() {
    if (M.mode === 'online') return M.net && M.net.art ? M.net.art : null;
    return M.art;
  }
  function artItem(pairId) {
    var a = activeArt();
    if (!a || pairId < 0 || pairId >= a.length) return null;
    return MEMORY_ART[a[pairId]] || null;
  }

  /* ---------------- audio ---------------- */
  function updateSoundButton() {
    soundButton.setAttribute('aria-label', M.soundOn ? 'صدا روشن است' : 'صدا خاموش است');
    soundButton.title = M.soundOn ? 'خاموش کردن صدا' : 'روشن کردن صدا';
    soundIcon.innerHTML = M.soundOn
      ? '<path d="M4.5 10v4h3l4 3.5v-11L7.5 10h-3Z" fill="currentColor"/><path d="M15 9a4.4 4.4 0 0 1 0 6M17.5 6.7a7.5 7.5 0 0 1 0 10.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
      : '<path d="M4.5 10v4h3l4 3.5v-11L7.5 10h-3Z" fill="currentColor"/><path d="m15 9 5 6M20 9l-5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';
  }
  function ensureAudio() {
    if (!M.soundOn) return null;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!M.audio) {
      try { M.audio = new Ctx(); } catch (e) { return null; }
    }
    if (M.audio.state === 'suspended') M.audio.resume().catch(function () {});
    return M.audio;
  }
  function tone(freq, delay, duration, type, volume) {
    var ctx = ensureAudio();
    if (!ctx) return;
    try {
      var start = ctx.currentTime + (delay || 0);
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume || 0.045, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(start); osc.stop(start + duration + 0.03);
    } catch (e) {}
  }
  function sound(kind) {
    if (!M.soundOn) return;
    if (kind === 'flip') tone(430, 0, .085, 'sine', .034);
    else if (kind === 'match') { tone(620, 0, .12, 'sine', .05); tone(880, .09, .18, 'sine', .045); }
    else if (kind === 'wrong') tone(180, 0, .17, 'triangle', .04);
    else if (kind === 'turn') { tone(320, 0, .08, 'sine', .035); tone(540, .08, .1, 'sine', .035); }
    else if (kind === 'found') { tone(560, 0, .1, 'sine', .045); tone(760, .09, .12, 'sine', .045); tone(980, .19, .2, 'sine', .04); }
    else if (kind === 'victory') { tone(520, 0, .16, 'sine', .05); tone(680, .12, .16, 'sine', .05); tone(900, .24, .28, 'sine', .05); }
    else tone(480, 0, .07, 'sine', .03);
  }
  function closeAudio() {
    if (M.audio) { try { M.audio.close(); } catch (e) {} M.audio = null; }
  }

  /* ---------------- timers ---------------- */
  function stopTimer() { if (M.timerId) { clearInterval(M.timerId); M.timerId = null; } }
  function updateTimer() {
    if (M.mode !== 'single' || !M.startedAt || M.gameOver) return;
    M.elapsed = Math.floor((Date.now() - M.startedAt) / 1000);
    var el = byId('memoryTimer');
    if (el) el.textContent = formatTime(M.elapsed);
  }
  function startTimer() {
    stopTimer();
    M.startedAt = Date.now();
    M.elapsed = 0;
    var el = byId('memoryTimer');
    if (el) el.textContent = formatTime(0);
    M.timerId = setInterval(updateTimer, 1000);
  }
  function clearPending() { if (M.pendingTimer) { clearTimeout(M.pendingTimer); M.pendingTimer = null; } }

  /* ---------------- view model ---------------- */
  function nowSkewed() { return Date.now() - (M.skew || 0); }
  function view() {
    if (M.mode === 'online') {
      if (!M.net || !M.net.board) return null;
      var n = M.net;
      return {
        board: n.board,
        reveal: n.reveal || [],
        turn: n.turn,
        mySeat: M.seat,
        scores: n.scores || [0, 0],
        moves: n.moves || [0, 0],
        winner: n.winner,
        pending: n.pending || null,
        names: n.names || ['روباه', 'حریف'],
        matched: (n.scores ? n.scores[0] + n.scores[1] : 0),
        turnStart: n.turnStart || 0,
        turnLimit: n.turnLimit || 25000,
        startAt: n.startAt || 0,
        raw: n
      };
    }
    var reveal = [];
    for (var i = 0; i < TOTAL_CARDS; i++) reveal.push(M.cardState[i] ? M.deck[i] : -1);
    return {
      board: M.cardState,
      reveal: reveal,
      turn: 0,
      mySeat: 0,
      scores: [M.scoreBase, 0],
      moves: [M.moves, 0],
      winner: M.gameOver ? 0 : null,
      pending: M.wrongPair,
      names: ['بازیکن', ''],
      matched: M.matchedPairs,
      turnStart: 0,
      turnLimit: 0,
      startAt: 0,
      raw: null
    };
  }
  function remainingSeconds(v) {
    if (!v || !v.turnLimit) return 0;
    var left = v.turnLimit - (nowSkewed() - (v.turnStart || 0));
    return Math.max(0, Math.ceil(left / 1000));
  }
  function canPlay(v) {
    if (!v || v.winner !== null) return false;
    if (v.startAt && nowSkewed() < v.startAt) return false;   // تا پایان شمارش معکوس
    if (M.mode === 'single') return !M.lockBoard && !M.gameOver;
    if (v.turn !== v.mySeat) return false;
    if (v.pending) return false;
    if (v.raw && v.raw.lockUntil && nowSkewed() < v.raw.lockUntil) return false;
    return true;
  }

  /* ---------------- board DOM ---------------- */
  function buildBoard() {
    board.replaceChildren();
    var frag = document.createDocumentFragment();
    for (var i = 0; i < TOTAL_CARDS; i++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'memory-card';
      btn.dataset.index = String(i);
      btn.dataset.art = '';
      btn.dataset.state = '0';
      btn.dataset.open = '0';
      btn.setAttribute('role', 'gridcell');
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'کارت پشت‌رو');
      btn.innerHTML =
        '<span class="memory-card-under"><span class="memory-face memory-card-front"></span></span>' +
        '<span class="memory-card-cover"><span class="memory-face memory-card-back" aria-hidden="true"></span><span class="memory-face memory-card-back-inner" aria-hidden="true"></span></span>';
      frag.appendChild(btn);
    }
    board.appendChild(frag);
    M.soundReady = false;
    M.lastTurn = null;
    M.lastPendingKey = '';
    M.localOpen = {};
  }

  function applyView() {
    var v = view();
    if (!v) return;
    var newSfx = { flip: 0, match: 0, wrong: 0, turn: 0 };
    for (var i = 0; i < TOTAL_CARDS; i++) {
      var card = board.children[i];
      if (!card) continue;
      var st = v.board[i] || 0;
      var rid = v.reveal[i];
      if (rid >= 0) {
        var art = artItem(rid);
        if (art && card.dataset.art !== art.id) {
          card.dataset.art = art.id;
          var front = card.querySelector('.memory-card-front');
          if (front) front.innerHTML = '<img loading="lazy" decoding="async" src="' + ART_SRC[art.id] + '" alt="' + art.label + '"/><span>' + art.label + '</span>';
        }
      }
      /* باز کردن خوش‌بینانه (بلافاصله بعد از لمس خودمان) */
      if (st === 0 && M.mode === 'online' && M.localOpen[i]) st = 1;
      var open = st > 0;
      var wasOpen = card.dataset.open === '1';
      if (open && !wasOpen) newSfx.flip++;
      if (card.dataset.state !== '2' && st === 2) {
        newSfx.match++;
        card.classList.remove('is-match');
        void card.offsetWidth;
        card.classList.add('is-match');
        (function (c) { setTimeout(function () { c.classList.remove('is-match'); }, 580); })(card);
      }
      card.classList.toggle('is-flipped', open);
      card.classList.toggle('is-matched', st === 2);
      card.disabled = (st === 2);
      card.setAttribute('aria-pressed', open ? 'true' : 'false');
      card.setAttribute('aria-label', open
        ? (st === 2 ? 'جفت پیدا شد: ' + (artItem(v.reveal[i]) ? artItem(v.reveal[i]).label : '') : 'کارت باز')
        : 'کارت پشت‌رو');
      card.dataset.open = open ? '1' : '0';
      card.dataset.state = String(st);
      card.classList.toggle('is-wrong', !!(v.pending && v.pending.indexOf(i) >= 0));
      card.classList.toggle('is-blocked', !canPlay(v));
    }
    var pendingKey = v.pending ? v.pending.join(',') : '';
    if (pendingKey && pendingKey !== M.lastPendingKey) newSfx.wrong++;
    M.lastPendingKey = pendingKey;
    if (M.soundReady) {
      if (newSfx.wrong) sound('wrong');
      else if (newSfx.match) sound('match');
      else if (newSfx.flip) sound('flip');
      if (M.mode === 'online' && M.lastTurn !== null && v.turn !== M.lastTurn && v.winner === null) {
        newSfx.turn++;
        animateTurnNote();
      }
    }
    if (newSfx.turn) sound('turn');
    M.lastTurn = v.turn;
    M.soundReady = true;
    updateHud(v);
  }

  function animateTurnNote() {
    var note = byId('memoryTurn');
    if (!note) return;
    note.classList.remove('is-change');
    void note.offsetWidth;
    note.classList.add('is-change');
  }

  function updateHud(v) {
    var online = M.mode === 'online';
    byId('memoryPairs').textContent = fa(v.matched) + '/' + fa(TOTAL_PAIRS);
    byId('memoryMoves').textContent = fa((v.moves[0] || 0) + (v.moves[1] || 0));
    byId('memoryScore0').textContent = fa(v.scores[0] || 0);
    byId('memoryScore1').textContent = fa(v.scores[1] || 0);
    gamePanel.classList.toggle('is-single', !online);
    byId('memoryPlayer1').style.display = online ? 'flex' : 'none';
    byId('memoryPlayerName0').textContent = online
      ? ((v.names && v.names[M.seat]) || 'شما')
      : 'بازیکن';
    byId('memoryPlayerName1').textContent = online
      ? ((v.names && v.names[1 - M.seat]) || 'حریف')
      : '';
    var myTurn = v.winner === null && (online ? v.turn === v.mySeat : true);
    byId('memoryPlayer0').classList.toggle('is-current', online ? v.turn === M.seat : true);
    byId('memoryPlayer1').classList.toggle('is-current', online && v.turn !== M.seat);
    if (brandSub) brandSub.textContent = online ? 'دونفره آنلاین · حریف واقعی' : 'تک‌نفره · رکورد شخصی';
    if (hintEl) hintEl.textContent = online
      ? 'هر جفت درست یک امتیاز دارد و نوبتت ادامه پیدا می‌کند. جفت اشتباه، نوبت را به حریف می‌دهد.'
      : 'دو کارت را باز کن؛ اگر همسان باشند، نوبتت ادامه دارد.';
    var note = byId('memoryTurn');
    if (note) {
      if (v.winner !== null) {
        note.textContent = 'پایان بازی';
        note.classList.remove('is-mine');
      } else if (!online) {
        note.textContent = 'نوبت شماست';
        note.classList.add('is-mine');
      } else {
        note.innerHTML = (myTurn ? 'نوبت شما' : 'نوبت حریف') + ' · <b>' + fa(remainingSeconds(v)) + '</b> ثانیه';
        note.classList.toggle('is-mine', myTurn);
      }
    }
    var tm = byId('memoryTimer');
    var tl = byId('memoryTimeLabel');
    if (online) {
      if (tl) tl.textContent = 'زمان نوبت';
      if (tm) tm.textContent = fa(remainingSeconds(v));
    } else {
      if (tl) tl.textContent = 'زمان';
      if (tm) tm.textContent = formatTime(M.elapsed);
    }
  }

  function tickCountdown() {
    if (M.mode !== 'online') return;
    var v = view();
    if (!v) {
      // Fallback: تا اولین poll، شمارش محلی 2.6 ثانیه‌ای را نمایش بده
      if (M.room && M.startedNetAt) {
        var estLeft = Math.max(0, Math.ceil((M.startedNetAt + 5000 - Date.now()) / 1000));
        // فال‌بک: اگر به هر دلیل گیر کرد، بعد ۵.۲ ثانیه حتما باز کن
        if (Date.now() - M.startedNetAt > 5200 && !M.boardOpen) {
          M.boardOpen = true;
          if (typeof gamePanel !== 'undefined' && gamePanel) gamePanel.classList.add('is-active');
          setQueueState('off');
          return;
        }
        if (estLeft > 0) {
          if (queueWait) queueWait.textContent = fa(estLeft);
          if (queueLayer && !queueLayer.classList.contains('is-found')) setQueueState('found', M.partnerName);
          else if (queueTitle) queueTitle.textContent = 'حریف پیدا شد! شروع تا ' + fa(estLeft) + ' ثانیه';
          return;
        } else {
          // 0 شد — فوراً ببند
          if (!M.boardOpen) {
          M.boardOpen = true;
          if (typeof gamePanel !== 'undefined' && gamePanel) gamePanel.classList.add('is-active');
          setQueueState('off');
        }
      }
      return;
    }
  }
    // هاردتایم‌اوت ریشه‌ای: هر دو بازیکن حداکثر ۵.۲ ثانیه بعد از Match وارد می‌شوند
    if (M.startedNetAt && !M.boardOpen && Date.now() - M.startedNetAt > 5200) {
      M.boardOpen = true;
      if (typeof gamePanel !== 'undefined' && gamePanel) gamePanel.classList.add('is-active');
      setQueueState('off');
      return;
    }
    /* --- شمارش معکوس مشترک: هر دو بازیکن بر اساس ساعت سرور هم‌زمان شروع می‌کنند --- */
    if (v.startAt && nowSkewed() < v.startAt) {
      var left = Math.max(0, Math.ceil((v.startAt - nowSkewed()) / 1000));
      if (queueWait) queueWait.textContent = fa(left);
      if (queueLayer && !queueLayer.classList.contains('is-found')) setQueueState('found', M.partnerName);
      else if (queueTitle) queueTitle.textContent = left>0 ? ('حریف پیدا شد! شروع تا ' + fa(left) + ' ثانیه') : 'شروع!';
      if (left <= 0) {
        // از 1 به 0 رسید — فوراً پنجره را ببند و بازی را شروع کن
        if (!M.boardOpen) {
          M.boardOpen = true;
          if (typeof gamePanel !== 'undefined' && gamePanel) gamePanel.classList.add('is-active');
          setQueueState('off');
        }
        return;
      }
      return;
    }
    if (!M.boardOpen) {
      M.boardOpen = true;
      gamePanel.classList.add('is-active');
      setQueueState('off');
    }
    if (v.winner !== null) return;
    var note = byId('memoryTurn');
    if (!note) return;
    var myTurn = v.turn === v.mySeat;
    note.innerHTML = (myTurn ? 'نوبت شما' : 'نوبت حریف') + ' · <b>' + fa(remainingSeconds(v)) + '</b> ثانیه';
    var tm = byId('memoryTimer');
    if (tm) tm.textContent = fa(remainingSeconds(v));
  }

  /* ---------------- confetti / result ---------------- */
  function createConfetti() {
    confetti.replaceChildren();
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < 24; i++) {
      var piece = document.createElement('i');
      piece.style.left = ((i * 37) % 101) + '%';
      piece.style.animationDelay = ((i % 8) * .07) + 's';
      piece.style.setProperty('--drift', (((i % 5) - 2) * 24) + 'px');
      fragment.appendChild(piece);
    }
    confetti.appendChild(fragment);
  }
  function showResult(cfg) {
    resultScoreLabel.textContent = cfg.scoreLabel;
    resultScore.textContent = cfg.score;
    resultMoves.textContent = cfg.moves;
    resultTime.textContent = cfg.time;
    resultKicker.textContent = cfg.kicker;
    resultTitle.textContent = cfg.title;
    resultText.textContent = cfg.text;
    if (resultNote) resultNote.textContent = cfg.note || '';
    if (resultAgain) {
      resultAgain.disabled = !!cfg.againDisabled;
      resultAgain.textContent = cfg.againLabel || 'بازی دوباره';
    }
    createConfetti();
    resultLayer.classList.add('is-visible');
  }
  function hideResult() {
    resultLayer.classList.remove('is-visible');
    confetti.replaceChildren();
  }

  /* ================= SOLO ================= */
  function startSolo() {
    stopNetPoll();
    leaveRoomSoft();
    M.mode = 'single';
    M.token += 1;
    clearPending();
    hideResult();
    stopTimer();
    M.art = shuffle(MEMORY_ART.map(function (_, i) { return i; })).slice(0, TOTAL_PAIRS);
    var pairs = [];
    for (var i = 0; i < TOTAL_PAIRS; i++) pairs.push(i, i);
    M.deck = shuffle(pairs);
    M.cardState = new Array(TOTAL_CARDS).fill(0);
    M.firstIndex = -1;
    M.secondIndex = -1;
    M.wrongPair = null;
    M.lockBoard = false;
    M.matchedPairs = 0;
    M.moves = 0;
    M.scoreBase = 0;
    M.elapsed = 0;
    M.gameOver = false;
    enterGameView();
    startPanel.classList.remove('is-open');
    gamePanel.classList.add('is-active');
    buildBoard();
    applyView();
    startTimer();
    sound('button');
    var app = byId('memoryApp');
    if (app) app.scrollTop = 0;
  }

  function soloFlip(index) {
    if (M.mode !== 'single' || M.gameOver || M.lockBoard) return;
    if (index < 0 || index >= TOTAL_CARDS) return;
    if (M.cardState[index] !== 0) return;
    if (M.firstIndex === index) return;
    M.cardState[index] = 1;
    M.moves += 1;
    var token = M.token;
    applyView();
    if (M.firstIndex < 0) { M.firstIndex = index; return; }
    var a = M.firstIndex, b = index;
    M.secondIndex = b;
    M.lockBoard = true;
    clearPending();
    M.pendingTimer = setTimeout(function () {
      M.pendingTimer = null;
      if (token !== M.token || M.gameOver) return;
      if (M.deck[a] === M.deck[b]) {
        M.cardState[a] = 2;
        M.cardState[b] = 2;
        M.matchedPairs += 1;
        M.scoreBase += 100;
        M.firstIndex = -1;
        M.secondIndex = -1;
        M.lockBoard = false;
        applyView();
        if (M.matchedPairs === TOTAL_PAIRS) finishSolo();
      } else {
        M.wrongPair = [a, b];
        applyView();
        M.pendingTimer = setTimeout(function () {
          M.pendingTimer = null;
          if (token !== M.token) return;
          M.cardState[a] = 0;
          M.cardState[b] = 0;
          M.wrongPair = null;
          M.firstIndex = -1;
          M.secondIndex = -1;
          M.lockBoard = false;
          applyView();
        }, WRONG_HOLD);
      }
    }, MATCH_HOLD);
  }

  function calculateSingleScore() {
    var moveBonus = Math.max(0, (TOTAL_PAIRS * 2 + 12) - M.moves) * 7;
    var timeBonus = Math.max(0, 240 - M.elapsed * 3);
    return (M.scoreBase || 0) + moveBonus + timeBonus;
  }

  function finishSolo() {
    if (M.gameOver) return;
    updateTimer();
    M.gameOver = true;
    try {
      if (window.FoxGameRewardService) {
        FoxGameRewardService.claimReward({ gameCode: 'memory_battle', mode: 'solo', result: 'win' });
      }
    } catch(e) {}
    stopTimer();
    clearPending();
    var finalScore = calculateSingleScore();
    var records = readRecords();
    var isRecord = false;
    if (finalScore > (records.bestScore || 0)) { records.bestScore = finalScore; isRecord = true; }
    if (!records.bestTime || M.elapsed < records.bestTime) { records.bestTime = M.elapsed; isRecord = true; }
    if (!records.bestMoves || M.moves < records.bestMoves) { records.bestMoves = M.moves; isRecord = true; }
    writeRecords(records);
    updateRecordUI();
    showResult({
      scoreLabel: 'امتیاز',
      score: fa(finalScore),
      moves: fa(M.moves),
      time: formatTime(M.elapsed),
      kicker: 'پایان بازی تک‌نفره',
      title: isRecord ? 'رکورد جدید!' : 'آفرین!',
      text: isRecord
        ? 'تمرکز فوق‌العاده بود؛ رکورد تازه‌ای برای روباه ثبت شد.'
        : 'همه جفت‌ها را پیدا کردی. حالا می‌توانی رکوردت را بهتر کنی.',
      againLabel: 'بازی دوباره'
    });
    sound('victory');
  }

  /* ================= ONLINE ================= */
  function netApi(path, body) {
    var opts = body
      ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
      : { cache: 'no-store' };
    return fetch(path, opts).then(function (r) {
      return r.json().catch(function () { return null; });
    }).catch(function () { return null; });
  }

  function showQueue(on) {
    setQueueState(on ? 'searching' : 'off');
  }
  function stopQueueTimers() {
    if (M.queueTimer) { clearInterval(M.queueTimer); M.queueTimer = null; }
    if (M.queuePoll) { clearInterval(M.queuePoll); M.queuePoll = null; }
    if (M.queueBeat) { clearInterval(M.queueBeat); M.queueBeat = null; }
  }
  function startMatchmaking() {
    var phone = myPhone();
    if (!phone) {
      openAppModal('ورود لازم است', 'برای بازی دونفره آنلاین باید اول با شماره موبایل خودت وارد حساب روباه شوی.', [{ label: 'باشه', primary: true }]);
      return;
    }
    M.mode = 'online';
    M.myPhone = phone;
    M.token += 1;
    M.room = '';
    M.net = null;
    M.seat = -1;
    M.resultShown = false;
    M.waitingAgain = false;
    hideResult();
    enterGameView();
    gamePanel.classList.remove('is-active');
    startPanel.classList.remove('is-open');
    buildBoard();
    showQueue(true);
    sound('button');
    var t0 = Date.now();
    if (queueWait) queueWait.textContent = formatTime(0);
    stopQueueTimers();
    M.queueTimer = setInterval(function () {
      if (queueWait) queueWait.textContent = formatTime(Math.floor((Date.now() - t0) / 1000));
    }, 500);

    netApi('/api/memh/active?me=' + encodeURIComponent(phone)).then(function (r) {
      if (r && r.room) { joinRoom(r.room); return; }
      netApi('/api/memh/join', { phone: phone, name: myName() }).then(function (res) {
        if (!res) { cancelMatchmaking(); openAppModal('ارتباط برقرار نشد', 'به سرور وصل نشدیم. اینترنت را بررسی کن و دوباره امتحان کن.', [{ label: 'باشه', primary: true }]); return; }
        if (res.room) { joinRoom(res.room, { seat: res.seat, partner: res.partner }); return; }
        /* در صف هستم: هر ۷۰۰ms از لابی می‌پرسم (لابی روی Durable Object است،
           پس جواب همیشه به‌روز است و دو بازیکن با هم وارد می‌شوند) */
        setTimeout(pollQueue, 220);
        M.queuePoll = setInterval(pollQueue, 700);
      });
    });
  }
  function pollQueue() {
    var phone = M.myPhone;
    if (!phone || M.room) return;
    netApi('/api/memh/wait?me=' + encodeURIComponent(phone)).then(function (w) {
      if (M.room || !w) return;
      if (w.room) { joinRoom(w.room, { seat: w.seat, partner: w.partner }); return; }
      if (queueSub && w.pos >= 0) queueSub.textContent = w.pos === 0 ? 'نفر اول صف هستی؛ منتظر بازیکن بعدی…' : 'در صف هستی؛ منتظر بازیکن‌های دیگر…';
    });
  }
  function cancelMatchmaking() {
    stopQueueTimers();
    showQueue(false);
    var phone = myPhone();
    if (phone) netApi('/api/memh/cancel', { phone: phone });
  }
  function joinRoom(room, info) {
    if (!room || M.room === room) return;
    stopQueueTimers();
    M.room = room;
    M.net = null;
    M.seat = (info && typeof info.seat === 'number' && info.seat >= 0) ? info.seat : -1;
    if (info && info.partner) M.partnerName = info.partner;
    M.resultShown = false;
    M.waitingAgain = false;
    M.startedNetAt = Date.now();
    M.boardOpen = false;
    M._force1 = null;
    hideResult();
    enterGameView();
    startPanel.classList.remove('is-open');
    gamePanel.classList.remove('is-active');
    buildBoard();
    // برای sync دقیق، تا اولین poll هم شمارش محلی ۵ ثانیه‌ای داشته باشیم — هر دو بازیکن یک startAt مشترک می‌بینند
    if (!M.net) {
      M.net = { board: Array(CARDS).fill(0), reveal: Array(CARDS).fill(-1), turn:0, scores:[0,0], moves:[0,0], winner:null, startAt: M.startedNetAt + 5000, turnStart: M.startedNetAt + 5000, now: Date.now() };
    }
    setQueueState('found', info && info.partner);
    sound('found');
    startNetPoll();
    pollNet();
  }
  /* پنجرهٔ انتظار دو حالت دارد: searching (چرخ‌های در حال چرخش) و found (شمارش معکوس) */
  function setQueueState(state, partner) {
    if (!queueLayer) return;
    queueLayer.classList.toggle('is-visible', state !== 'off');
    queueLayer.classList.toggle('is-found', state === 'found');
    if (state === 'searching') {
      if (queueTitle) queueTitle.textContent = 'در حال جستجوی حریف…';
      if (queueSub) queueSub.textContent = 'بازی دونفره آنلاین است. به‌محض پیدا شدن بازیکن هم‌سطح، میز حافظه برای هر دو نفر باز می‌شود.';
      if (queueActions) queueActions.style.display = '';
    } else if (state === 'found') {
      if (queueTitle) queueTitle.textContent = 'حریف پیدا شد!';
      if (queueSub) queueSub.textContent = (partner ? partner + ' ' : '') + 'هم‌بازی تو شد — هر دو با هم شروع می‌کنیم…';
      if (queueActions) queueActions.style.display = 'none';
    }
  }
  function stopNetPoll() {
    if (M.netPoll) { clearInterval(M.netPoll); M.netPoll = null; }
    if (M.uiTimer) { clearInterval(M.uiTimer); M.uiTimer = null; }
  }
  function startNetPoll() {
    stopNetPoll();
    M.netPoll = setInterval(pollNet, 750);
    M.uiTimer = setInterval(tickCountdown, 100);
  }
  function pollNet() {
    if (!M.room || M.netBusy) return;
    M.netBusy = true;
    var room = M.room;
    netApi('/api/memh/state?room=' + encodeURIComponent(room) + '&me=' + encodeURIComponent(M.myPhone)).then(function (st) {
      M.netBusy = false;
      if (M.room !== room) return;
      if (!st || !st.board) {
        if (!M.roomGone) { M.roomGone = true; }
        return;
      }
      M.roomGone = false;
      if (typeof st.seat === 'number' && st.seat >= 0) M.seat = st.seat;
      if (st.now) M.skew = Date.now() - st.now;
      // جلوگیری از race: اگر استارت سرور خیلی جلوتر بود، با شروع محلی همگام کن
      var wasOver = M.net && M.net.winner !== null;
      if (!M.net) M.startedNetAt = Date.now();
      M.net = st;
      for (var oi in M.localOpen) { if (st.board[Number(oi)]) delete M.localOpen[oi]; }
      if (wasOver && st.winner === null) {
        /* دست جدید شروع شد */
        M.resultShown = false;
        M.waitingAgain = false;
        M.boardOpen = false;
        hideResult();
        buildBoard();
        M.startedNetAt = Date.now();
        gamePanel.classList.remove('is-active');
        setQueueState('found', M.partnerName);
      }
      applyView();
      if (st.winner !== null && !M.resultShown) finishOnline(st);
    });
  }
  function netFlip(index) {
    var v = view();
    if (!v || v.winner !== null) return;
    if (v.startAt && nowSkewed() < v.startAt) return;
    if (v.turn !== v.mySeat) { sound('wrong'); animateTurnNote(); return; }
    if (v.pending) return;
    if (v.raw && v.raw.lockUntil && nowSkewed() < v.raw.lockUntil) return;
    if (v.board[index] !== 0) return;
    M.localOpen[index] = Date.now();
    (function (i) {
      setTimeout(function () {
        if (M.localOpen[i] && M.net && M.net.board && M.net.board[i] === 0) delete M.localOpen[i];
      }, 2600);
    })(index);
    applyView();
    netApi('/api/memh/flip', { room: M.room, phone: M.myPhone, index: index }).then(function (r) {
      if (r && typeof r.seat === 'number' && r.seat >= 0) M.seat = r.seat;
      if (r && r.error === 'noturn') { delete M.localOpen[index]; sound('wrong'); }
      pollNet();
    });
  }
  function finishOnline(st) {
    if (M.resultShown) return;
    M.resultShown = true;
    var my = M.seat;
    var oppName = (st.names && st.names[1 - my]) || 'حریف';
    var mine = st.scores[my] || 0;
    var theirs = st.scores[1 - my] || 0;
    var movesTotal = (st.moves[0] || 0) + (st.moves[1] || 0);
    var title, text, kicker;
    if (st.winner === -1) {
      kicker = 'پایان دوئل';
      title = 'مساوی!';
      text = 'هر دو با دقت یکسان جنگیدید. بازی دوباره را بزن تا برنده معلوم شود.';
    } else if (st.winner === my) {
      try {
        if (window.FoxGameRewardService) {
          FoxGameRewardService.claimReward({ gameCode: 'memory_battle', mode: 'online', result: 'win' });
        }
      } catch(e) {}
      kicker = 'پیروزی';
      title = 'برنده شدی!';
      text = st.reason === 'left'
        ? oppName + ' از میز خارج شد و بازی به نام تو ثبت شد.'
        : (st.reason === 'away'
            ? oppName + ' چند نوبت پشت‌سرهم بازی نکرد و از میز کنار گذاشته شد.'
            : 'حافظه‌ات از ' + oppName + ' قوی‌تر بود.');
    } else {
      kicker = 'پایان دوئل';
      title = oppName + ' برد';
      text = st.reason === 'left'
        ? 'میزی را ترک کردی، پس نتیجه به نام حریف ثبت شد.'
        : (st.reason === 'away'
            ? 'چند نوبت پیاپی بازی نکردی، پس میز به ' + oppName + ' رسید.'
            : 'این دست را به ' + oppName + ' واگذار کردی؛ دست بعد جبران کن.');
    }
    showResult({
      scoreLabel: 'جفت‌ها',
      score: fa(mine) + ' ـ ' + fa(theirs),
      moves: fa(movesTotal),
      time: formatTime(Math.round((Date.now() - (M.startedNetAt || Date.now())) / 1000)),
      kicker: kicker,
      title: title,
      text: text,
      note: 'برای شروع دست بعد، هر دو بازیکن باید «بازی دوباره» را بزنند.',
      againLabel: 'بازی دوباره'
    });
    sound(st.winner === my ? 'victory' : 'turn');
  }

  function requestAgain() {
    if (M.mode === 'single') { startSolo(); return; }
    if (!M.room) { toModeMenu(); return; }
    M.waitingAgain = true;
    if (resultAgain) { resultAgain.disabled = true; resultAgain.textContent = 'در انتظار حریف…'; }
    if (resultNote) resultNote.textContent = 'درخواستت ثبت شد؛ منتظر تأیید حریف هستیم…';
    netApi('/api/memh/again', { room: M.room, phone: M.myPhone }).then(function (r) {
      if (r && r.error) {
        M.waitingAgain = false;
        if (resultAgain) { resultAgain.disabled = false; resultAgain.textContent = 'بازی دوباره'; }
      }
      pollNet();
    });
  }
  function leaveRoomSoft() {
    if (M.room && M.myPhone) {
      netApi('/api/memh/leave', { room: M.room, phone: M.myPhone });
    }
    M.room = '';
    M.net = null;
    M.seat = -1;
    M.resultShown = false;
    M.waitingAgain = false;
  }
  function leaveRoom() {
    stopNetPoll();
    stopQueueTimers();
    showQueue(false);
    leaveRoomSoft();
  }

  /* ================= views / navigation ================= */
  function enterGameView() {
    ['viewHome', 'viewChat', 'viewDMList', 'viewSettings', 'viewFun', 'viewDooz', 'viewTank', 'viewBow'].forEach(function (id) {
      var view = byId(id); if (view) hide(view);
    });
    var vm = byId('viewMemory');
    if (vm) show(vm);
    var nav = byId('bottomNav');
    if (nav) nav.classList.add('show');
  }
  function returnToFun() {
    ['viewHome', 'viewChat', 'viewDMList', 'viewSettings', 'viewDooz', 'viewTank', 'viewMemory', 'viewBow'].forEach(function (id) {
      var view = byId(id); if (view) hide(view);
    });
    var fun = byId('viewFun');
    if (fun) show(fun);
    var nav = byId('bottomNav');
    if (nav) nav.classList.add('show');
    if (typeof setActiveNav === 'function') setActiveNav('fun');
    var avatar = byId('funAva');
    if (avatar && typeof currentUser !== 'undefined' && currentUser) avatar.src = currentUser.avatar || (typeof DEFAULT_AVA !== 'undefined' ? DEFAULT_AVA : '');
  }
  function toModeMenu() {
    M.token += 1;
    clearPending();
    stopTimer();
    stopNetPoll();
    M.mode = 'single';
    M.gameOver = true;
    hideResult();
    showQueue(false);
    gamePanel.classList.remove('is-active', 'is-single');
    startPanel.classList.add('is-open');
    board.replaceChildren();
    updateRecordUI();
    closeAudio();
    var app = byId('memoryApp');
    if (app) app.scrollTop = 0;
  }
  function exitMemory() {
    var phone = myPhone();
    cancelMatchmaking();
    if (M.room && phone) netApi('/api/memh/leave', { room: M.room, phone: phone });
    stopNetPoll();
    M.room = '';
    M.net = null;
    M.seat = -1;
    M.resultShown = false;
    M.token += 1;
    clearPending();
    stopTimer();
    hideResult();
    gamePanel.classList.remove('is-active', 'is-single');
    startPanel.classList.remove('is-open');
    board.replaceChildren();
    closeAudio();
    returnToFun();
  }

  var ICON_SOLO = '<svg viewBox="0 0 48 48" fill="none" width="26" height="26"><circle cx="24" cy="15" r="7" stroke="#8a3000" stroke-width="2.6"/><path d="M11 39c.9-7.2 5.5-11.2 13-11.2S36.1 31.8 37 39" stroke="#8a3000" stroke-width="2.6" stroke-linecap="round"/><path d="M36 11h6M39 8v6" stroke="#8a3000" stroke-width="2.2" stroke-linecap="round"/></svg>';
  var ICON_DUO = '<svg viewBox="0 0 48 48" fill="none" width="26" height="26"><circle cx="17.5" cy="16" r="6" stroke="#8a3000" stroke-width="2.4"/><circle cx="32" cy="18" r="5" stroke="#8a3000" stroke-width="2.4"/><path d="M7.5 38c.8-6.8 4.4-10.2 10.5-10.2s9.7 3.4 10.5 10.2M27 29c1.6-2.1 3.9-3.1 6.8-3.1 4.3 0 6.7 2.4 7.2 7.1" stroke="#8a3000" stroke-width="2.4" stroke-linecap="round"/></svg>';

  function openModeModal() {
    if (!M.myPhone) M.myPhone = myPhone();
    openAppModal('نبرد حافظه روباه ۲۰۲۷',
      '<div class="mmm">' +
        '<button class="mmm-btn" type="button" id="mmmSolo"><span class="mmm-ico">' + ICON_SOLO + '</span><b>تک‌نفره</b><small>تنها بازی کن و رکورد شخصی‌ات را بشکن</small></button>' +
        '<button class="mmm-btn" type="button" id="mmmDuo"><span class="mmm-ico">' + ICON_DUO + '</span><b>دونفره آنلاین</b><small>دنبال یک حریف واقعی می‌گردیم و میز را باز می‌کنیم</small></button>' +
      '</div>', []);
    var s = document.getElementById('mmmSolo');
    var d = document.getElementById('mmmDuo');
    if (s) s.onclick = function () { closeAppModal(); M.mode = 'single'; startSolo(); };
    if (d) d.onclick = function () { closeAppModal(); startMatchmaking(); };
  }

  /* ================= wiring ================= */
  function onBoardClick(event) {
    var card = event.target.closest ? event.target.closest('.memory-card') : null;
    if (!card || !board.contains(card) || card.disabled) return;
    var index = Number(card.dataset.index);
    if (!Number.isInteger(index)) return;
    if (M.mode === 'single') soloFlip(index);
    else netFlip(index);
  }
  board.addEventListener('click', onBoardClick);
  byId('memorySingleStart').addEventListener('click', function () { startSolo(); });
  byId('memoryDuoStart').addEventListener('click', function () { startMatchmaking(); });
  byId('memoryRestart').addEventListener('click', function () {
    if (M.mode === 'single') startSolo(); else requestAgain();
  });
  byId('memoryAgain').addEventListener('click', function(){
    // For online, hide again and only allow return per user request
    try { if (M && M.mode==='online') { hideOnlineAgainButtons(); return; } } catch(e){}
    requestAgain();
  });
  byId('memoryToModes').addEventListener('click', function () {
    if (M.mode === 'online' && M.room) {
      openAppModal('خروج از میز آنلاین', 'اگر خارج شوی، این دست به نام حریف ثبت می‌شود.', [
        { label: 'بمانم', primary: true },
        { label: 'خارج شو', onClick: function () { leaveRoom(); toModeMenu(); } }
      ]);
      return;
    }
    toModeMenu();
  });
  var changeModeBtn = byId('memoryChangeMode');
  if (changeModeBtn) changeModeBtn.addEventListener('click', function () {
    if (M.mode === 'online' && M.room) {
      openAppModal('خروج از میز آنلاین', 'اگر خارج شوی، این دست به نام حریف ثبت می‌شود.', [
        { label: 'بمانم', primary: true },
        { label: 'خروج و تغییر حالت', onClick: function () { leaveRoom(); toModeMenu(); } }
      ]);
      return;
    }
    toModeMenu();
  });
  byId('memoryBack').addEventListener('click', exitMemory);
  var queueCancel = byId('memoryQueueCancel');
  if (queueCancel) queueCancel.addEventListener('click', function () {
    cancelMatchmaking();
    toModeMenu();
  });
  soundButton.addEventListener('click', function () {
    M.soundOn = !M.soundOn;
    try { localStorage.setItem(SOUND_KEY, M.soundOn ? '1' : '0'); } catch (e) {}
    updateSoundButton();
    if (M.soundOn) sound('button'); else closeAudio();
  });

  window.openMemory = function () {
    M.mode = 'single';
    updateRecordUI();
    openModeModal();
  };

  updateSoundButton();
  updateRecordUI();

  /* ---------- debug hook (only with ?debug=1) ---------- */
  try {
    if (location.search.indexOf('debug=1') >= 0) {
      window.MEMH_DEBUG = {
        state: function () {
          var v = view();
          return {
            mode: M.mode, room: M.room, seat: M.seat, turn: v ? v.turn : -1,
            cards: M.mode === 'single' ? M.cardState.slice() : (M.net ? M.net.board.slice() : []),
            pairs: M.mode === 'single' ? M.matchedPairs : (M.net ? (M.net.scores[0] + M.net.scores[1]) : 0),
            moves: M.mode === 'single' ? M.moves : (M.net ? (M.net.moves[0] + M.net.moves[1]) : 0),
            winner: v ? v.winner : null, lock: M.lockBoard, over: M.gameOver
          };
        },
        deck: function () { return M.mode === 'single' ? M.deck.slice() : (M.net ? M.net.deckHint : null); },
        solo: function () { return M.deck.slice(); },
        click: function (i) { M.mode === 'single' ? soloFlip(i) : netFlip(i); },
        answer: function () {
          var v = view(); if (!v) return null;
          for (var i = 0; i < TOTAL_CARDS; i++) { if (v.reveal[i] >= 0 && v.board[i] === 1) return { idx: i, pair: v.reveal[i] }; }
          return null;
        }
      };
    }
  } catch (e) {}
})();






/* ===== BOW DUEL — دوئل تیر و کمان روباه (فرانت‌اند) ===== */
(function () {
/* ===== BOWCORE v2 — موتور مشترک دوئل تیر و کمان روباه (client + worker) =====
   فیزیک تیر، سکوها، باد، آسیب، شخصیت‌های داده‌محور، کمپین و هوش مصنوعی حریف.
   این فایل عمداً بدون بک‌تیک، بک‌اسلش و الگوی دلار-آکولاد نوشته شده تا
   هم داخل رشتهٔ HTML ورکر و هم داخل کد سرور قابل تزریق باشد. */
var BOWCORE = (function () {
  var W = 1000, H = 600;
  var GRAV = 560;
  var DMG_BODY = 18, DMG_HEAD = 27, DMG_LIMB = 11, DMG_LEG = 9;
  /* ===== آسیب بر پایهٔ نیروی ضربه ===== */
  var REF_SPEED = 650;
  var IMPACT_MIN = 0.45;
  var IMPACT_MAX = 1.85;
  function impactFactor(speed) {
    var sp = Number(speed);
    if (!isFinite(sp) || sp <= 0) return 1;
    var f = Math.pow(sp / REF_SPEED, 1.25);
    if (f < IMPACT_MIN) f = IMPACT_MIN;
    if (f > IMPACT_MAX) f = IMPACT_MAX;
    return f;
  }
  var DRAW_MIN = 0.78, DRAW_MAX = 1.24;
  function drawFactor(initialSpeed) {
    var sp = Number(initialSpeed);
    if (!isFinite(sp) || sp <= 0) return 1;
    var k = (sp - SPEED_MIN) / SPEED_RANGE;
    if (k < 0) k = 0;
    if (k > 1) k = 1;
    return DRAW_MIN + (DRAW_MAX - DRAW_MIN) * k;
  }

  /* =====================================================================
     شخصیت‌ها — ۹ روباه با آمار واقعی و داده‌محور.
     همهٔ رفتارها از همین جدول خوانده می‌شوند؛ افزودن شخصیت جدید یعنی
     افزودن یک ردیف. هیچ کد اختصاصی برای شخصیت خاصی وجود ندارد.
       hp       جان پایه (واقعاً در بازی استفاده می‌شود)
       dmgIn    ضریب آسیبِ دریافتی (مقاومت؛ کمتر = مقاوم‌تر)
       dmgOut   ضریب آسیبِ واردشده
       pow      قدرت پرتاب (سرعت اولیهٔ تیر)
       acc      دقت (پراکندگی زاویهٔ شلیک کمتر می‌شود)
       drawMs   زمان کشیدن کامل کمان
       cd       خنک‌شدن کمان بعد از هر شلیک (میلی‌ثانیه)
       unlock   روش باز شدن: free | wins:N | soon
                (فعلاً فقط ۳ شخصیت اول آزادند؛ برای باز کردن بقیه بعداً همین فیلد عوض می‌شود)
     ===================================================================== */
  var CHARACTERS = [
    { id: 0, key: 'fire',    name: 'روباه آتشین',   bow: 0 },
    { id: 1, key: 'arctic',  name: 'روباه قطبی',    bow: 1 },
    { id: 2, key: 'shadow',  name: 'روباه سایه',    bow: 2 },
    { id: 3, key: 'ranger',  name: 'تکاور صحرا',    bow: 3 },
    { id: 4, key: 'knight',  name: 'شوالیه زمردین', bow: 4 },
    { id: 5, key: 'storm',   name: 'روباه صاعقه',   bow: 5 },
    { id: 6, key: 'sky',     name: 'روباه آسمانی',  bow: 6 },
    { id: 7, key: 'royal',   name: 'روباه سلطنتی',  bow: 7 },
    { id: 8, key: 'phoenix', name: 'روباه افسانه‌ای', bow: 8 }
  ];
  var CHAR_STATS = [
    { hp: 92,  dmgIn: 1.00, dmgOut: 0.96, pow: 0.96, acc: 0.86, drawMs: 920, cd: 950, unlock: { type: 'free' } },
    { hp: 100, dmgIn: 1.00, dmgOut: 1.00, pow: 1.00, acc: 0.90, drawMs: 880, cd: 920, unlock: { type: 'free' } },
    { hp: 106, dmgIn: 0.97, dmgOut: 1.03, pow: 1.03, acc: 0.92, drawMs: 850, cd: 900, unlock: { type: 'free' } },
    { hp: 112, dmgIn: 0.95, dmgOut: 1.06, pow: 1.06, acc: 0.94, drawMs: 820, cd: 880, unlock: { type: 'soon' } },
    { hp: 118, dmgIn: 0.92, dmgOut: 1.09, pow: 1.09, acc: 0.95, drawMs: 790, cd: 860, unlock: { type: 'soon' } },
    { hp: 124, dmgIn: 0.90, dmgOut: 1.12, pow: 1.12, acc: 0.96, drawMs: 760, cd: 840, unlock: { type: 'soon' } },
    { hp: 130, dmgIn: 0.88, dmgOut: 1.14, pow: 1.14, acc: 0.97, drawMs: 730, cd: 820, unlock: { type: 'soon' } },
    { hp: 138, dmgIn: 0.85, dmgOut: 1.18, pow: 1.18, acc: 0.98, drawMs: 680, cd: 800, unlock: { type: 'soon' } },
    { hp: 146, dmgIn: 0.82, dmgOut: 1.22, pow: 1.22, acc: 1.00, drawMs: 620, cd: 780, unlock: { type: 'soon' } }
  ];
  function statsOf(cId) {
    var n = Number(cId);
    if (!isFinite(n) || n < 0) n = 0;
    if (n >= CHAR_STATS.length) n = CHAR_STATS.length - 1;
    return CHAR_STATS[n];
  }
  function charPower(cId) { return statsOf(cId).dmgOut; }

  /* =====================================================================
     آناتومی اسپرایت‌ها — از خود Assetها اندازه‌گیری شده است:
       w       نسبت عرض تصویر به ارتفاع (پیکسل)
       feetX   محل کف پا روی عرض تصویر (۰..۱) — پا دقیقاً روی pos می‌ایستد
       handX/Y محل مشِ دست جلو (گرفتگاه کمان) روی تصویر (۰..۱)
       torsoCx مرکز تنه روی عرض تصویر (۰..۱)
       headEnd پایینِ سر (گلو) به نسبت ارتفاع (۰..۱)
     ارتفاع رسم همهٔ شخصیت‌ها ART_H است و جعبه‌های برخورد از همین
     داده‌ها ساخته می‌شوند تا تصویر و فیزیک همیشه هم‌راستا باشند.
     ===================================================================== */
  var ART_H = 126;
  var CHAR_ART = [
    { w: 0.7148, feetX: 0.3736, handX: 0.9889, handY: 0.754, torsoCx: 0.4390, headEnd: 0.156 },
    { w: 0.7852, feetX: 0.4356, handX: 0.9827, handY: 0.766, torsoCx: 0.3652, headEnd: 0.173 },
    { w: 0.6680, feetX: 0.5904, handX: 0.9856, handY: 0.738, torsoCx: 0.4474, headEnd: 0.154 },
    { w: 0.7578, feetX: 0.4828, handX: 0.9897, handY: 0.75, torsoCx: 0.4670, headEnd: 0.154 },
    { w: 0.7773, feetX: 0.4464, handX: 0.9899, handY: 0.764, torsoCx: 0.4468, headEnd: 0.195 },
    { w: 0.7578, feetX: 0.4882, handX: 0.9842, handY: 0.74, torsoCx: 0.3794, headEnd: 0.161 },
    { w: 0.7930, feetX: 0.5140, handX: 0.9898, handY: 0.758, torsoCx: 0.3484, headEnd: 0.156 },
    { w: 0.7266, feetX: 0.4899, handX: 0.9858, handY: 0.775, torsoCx: 0.3900, headEnd: 0.180 },
    { w: 0.7695, feetX: 0.6300, handX: 0.9900, handY: 0.742, torsoCx: 0.3800, headEnd: 0.150 }
  ];
  function artOf(cId) {
    var n = Number(cId);
    if (!isFinite(n) || n < 0) n = 0;
    if (n >= CHAR_ART.length) n = CHAR_ART.length - 1;
    return CHAR_ART[n];
  }
  function drawWOf(cId) { return artOf(cId).w * ART_H; }

  /* ابعاد مرجع تنه (جعبهٔ اصلی برخورد) */
  var PLAYER_W = 40, PLAYER_H = ART_H;
  var HIT_PAD = 16;

  var SPEED_MIN = 330, SPEED_RANGE = 460;
  var MAX_FLIGHT = 6.0;
  var TURN_LIMIT_MS = 75000;
  var AWAY_LIMIT = 2;
  var COUNTDOWN_MS = 3000;
  var FLY_TAIL_MS = 450;
  var RT_COOLDOWN_P = 950;
  var RT_COOLDOWN_AI = 3000;

  /* ===== تیرها — شش نوع با قدرت پلکانی؛ سرعت هم واقعاً اعمال می‌شود ===== */
  var ARROWS = [
    { id: 1, name: 'تیر چوبی', tier: 'پایه', dmgMult: 1.00, speedMult: 1.00,
      headMult: 1.00, color: '#caa46a', fletch: '#FF7A00', glow: 'rgba(255,150,60,0.0)',
      effect: null, unlock: { type: 'free' }, locked: false,
      desc: 'تیر استاندارد کمانداران روباه.' },
    { id: 2, name: 'تیر آهنین', tier: 'سطح ۲', dmgMult: 1.15, speedMult: 1.03,
      headMult: 1.10, color: '#9fb4c6', fletch: '#7ea8d8', glow: 'rgba(150,190,235,0.0)',
      effect: null, unlock: { type: 'campaign', level: 8 }, locked: true,
      desc: 'نوک آهنی؛ از مرحلهٔ ۸ حریف از آن استفاده می‌کند.' },
    { id: 3, name: 'تیر پولادین', tier: 'سطح ۳', dmgMult: 1.32, speedMult: 1.06,
      headMult: 1.20, color: '#c3c9d4', fletch: '#5fd0ff', glow: 'rgba(120,205,255,0.0)',
      effect: null, unlock: { type: 'campaign', level: 15 }, locked: true,
      desc: 'بدنهٔ پولاد؛ از مرحلهٔ ۱۵ به بعد.' },
    { id: 4, name: 'تیر آتشین', tier: 'سطح ۴', dmgMult: 1.52, speedMult: 1.09,
      headMult: 1.32, color: '#e08a3c', fletch: '#ff5a2a', glow: 'rgba(255,120,40,0.0)',
      effect: null, unlock: { type: 'campaign', level: 22 }, locked: true,
      desc: 'سرِ شعله‌ور؛ از مرحلهٔ ۲۲ به بعد.' },
    { id: 5, name: 'تیر یخی', tier: 'سطح ۵', dmgMult: 1.74, speedMult: 1.12,
      headMult: 1.45, color: '#9fe4ff', fletch: '#39c8ff', glow: 'rgba(120,220,255,0.0)',
      effect: null, unlock: { type: 'campaign', level: 29 }, locked: true,
      desc: 'تیغهٔ یخ؛ از مرحلهٔ ۲۹ به بعد.' },
    { id: 6, name: 'تیر اژدها', tier: 'سطح ۶', dmgMult: 2.00, speedMult: 1.16,
      headMult: 1.60, color: '#ffd76a', fletch: '#ff3d6e', glow: 'rgba(255,190,80,0.0)',
      effect: null, unlock: { type: 'campaign', level: 36 }, locked: true,
      desc: 'قدرتمندترین تیر؛ مراحل ۳۶ تا ۴۰.' }
  ];
  function arrowById(id) {
    var n = Number(id);
    if (!isFinite(n)) return ARROWS[0];
    for (var i = 0; i < ARROWS.length; i++) if (ARROWS[i].id === n) return ARROWS[i];
    return ARROWS[0];
  }
  function arrowDmgMult(id) {
    var a = arrowById(id);
    var m = Number(a && a.dmgMult);
    if (!isFinite(m) || m <= 0) return 1;
    return m;
  }
  function arrowSpeedMult(id) {
    var a = arrowById(id);
    var m = Number(a && a.speedMult);
    if (!isFinite(m) || m <= 0) return 1;
    return m;
  }
  function unlockedArrowIds() {
    var out = [];
    for (var i = 0; i < ARROWS.length; i++) if (!ARROWS[i].locked) out.push(ARROWS[i].id);
    if (!out.length) out.push(ARROWS[0].id);
    return out;
  }
  function isArrowUsable(id) { return !arrowById(id).locked; }

  /* ===== کمپین: تیر و شخصیت حریف بر پایهٔ شمارهٔ مرحله =====
     ۱-۷ چوبی، ۸-۱۴ آهنین، ۱۵-۲۱ پولادین، ۲۲-۲۸ آتشین، ۲۹-۳۵ یخی، ۳۶-۴۰ اژدها */
  var CAMPAIGN_LEVELS = 40;
  function campaignArrowForLevel(lv) {
    var n = Number(lv);
    if (!isFinite(n) || n < 1) n = 1;
    if (n > CAMPAIGN_LEVELS) n = CAMPAIGN_LEVELS;
    if (n <= 7) return 1;
    if (n <= 14) return 2;
    if (n <= 21) return 3;
    if (n <= 28) return 4;
    if (n <= 35) return 5;
    return 6;
  }
  /* شخصیت حریف: با پیشرفت مراحل قوی‌تر می‌شود؛ مرحلهٔ ۴۰ = روباه افسانه‌ای */
  function aiCharForLevel(lv) {
    var n = Number(lv);
    if (!isFinite(n) || n < 1) n = 1;
    if (n >= CAMPAIGN_LEVELS) return 8;
    if (n >= 39) return 7;
    var band = campaignArrowForLevel(n);
    return Math.min(6, Math.max(0, band - 1));
  }

  /* خنک‌شدن حریف بر پایهٔ مرحله: ۱۵۲۰ms در مرحلهٔ ۱ تا ۶۴۰ms در مرحلهٔ ۴۰.
     سرعت واقعی کشیدن هم از drawMs شخصیت حریف می‌آید؛ بنابراین هزینهٔ واقعی
     هر شلیک حریف با بازیکن قابل مقایسه است. */
  function aiCooldownFor(level) {
    var n = Number(level);
    if (!isFinite(n) || n < 1) n = 1;
    if (n > CAMPAIGN_LEVELS) n = CAMPAIGN_LEVELS;
    var t = (n - 1) / (CAMPAIGN_LEVELS - 1);
    return Math.round(1520 - 880 * t);
  }

  var DIFFS = [
    { id: 'easy', name: 'آسان', angleErr: 9.0, powerErr: 0.16, thinkMin: 1000, thinkMax: 1900, headChance: 0.15, blunder: 0.14, powerBoost: 1.00, dmgBoost: 1.00 },
    { id: 'medium', name: 'متوسط', angleErr: 4.2, powerErr: 0.085, thinkMin: 850, thinkMax: 1500, headChance: 0.4, blunder: 0.05, powerBoost: 1.03, dmgBoost: 1.02 },
    { id: 'hard', name: 'سخت', angleErr: 1.7, powerErr: 0.032, thinkMin: 700, thinkMax: 1150, headChance: 0.75, blunder: 0.0, powerBoost: 1.06, dmgBoost: 1.04 }
  ];

  var ARENAS = [
    { id: 0, name: 'جنگل فانتزی', plat: '#6a4526', platTop: '#8fd35c', platEdge: '#3d2812', particle: 'leaf' },
    { id: 1, name: 'خرابه‌های باستانی', plat: '#7b7360', platTop: '#b7ab8a', platEdge: '#4c4636', particle: 'dust' },
    { id: 2, name: 'صخره‌های معلق', plat: '#77685a', platTop: '#96bf6d', platEdge: '#4c4030', particle: 'cloud' },
    { id: 3, name: 'شب مه‌آلود', plat: '#3c4162', platTop: '#5d6690', platEdge: '#22263e', particle: 'firefly' },
    { id: 4, name: 'آسمان فانتزی', plat: '#b9859f', platTop: '#f0b6cf', platEdge: '#7c4f66', particle: 'petal' }
  ];

  var LEVEL_BANDS = [
    { max: 10, name: 'آموزشی', wMin: 146, wMax: 182, gapMin: 330, gapMax: 410, yMin: 224, yMax: 356, dMin: 0, dMax: 46 },
    { max: 20, name: 'متنوع', wMin: 130, wMax: 172, gapMin: 360, gapMax: 470, yMin: 200, yMax: 402, dMin: 0, dMax: 98 },
    { max: 30, name: 'چالشی', wMin: 118, wMax: 156, gapMin: 396, gapMax: 520, yMin: 178, yMax: 424, dMin: 16, dMax: 132 },
    { max: 39, name: 'حرفه‌ای', wMin: 106, wMax: 142, gapMin: 424, gapMax: 556, yMin: 160, yMax: 446, dMin: 46, dMax: 156 },
    { max: 40, name: 'نبرد نهایی', wMin: 98, wMax: 120, gapMin: 540, gapMax: 640, yMin: 150, yMax: 452, dMin: 110, dMax: 160 }
  ];
  function bandForLevel(n) {
    for (var i = 0; i < LEVEL_BANDS.length; i++) if (n <= LEVEL_BANDS[i].max) return LEVEL_BANDS[i];
    return LEVEL_BANDS[LEVEL_BANDS.length - 1];
  }

  /* سختی مرحله‌ای: خطای طبیعی کم می‌شود و کمی قدرت/آسیب اضافه می‌شود.
     افزایش سختی از مسیر دقت و انتخاب تیر است، نه کند کردن غیرمنطقی AI. */
  function diffForLevel(n) {
    var t = Math.max(0, Math.min(1, (n - 1) / (CAMPAIGN_LEVELS - 1)));
    return {
      id: 'lv' + n,
      name: 'مرحله ' + n,
      angleErr: 9.6 - 8.6 * t,
      powerErr: 0.170 - 0.146 * t,
      thinkMin: 1050 - 400 * t,
      thinkMax: 1950 - 850 * t,
      headChance: 0.12 + 0.70 * t,
      blunder: Math.max(0, 0.16 - 0.16 * t),
      powerBoost: 1.02 + 0.10 * t,
      dmgBoost: 1.00 + 0.08 * t
    };
  }

  function levelDef(arenaId, n) {
    var ar = Number(arenaId);
    if (!isFinite(ar) || ar < 0) ar = 0;
    ar = ar % ARENAS.length;
    var lv = Math.round(Number(n));
    if (!isFinite(lv) || lv < 1) lv = 1;
    if (lv > CAMPAIGN_LEVELS) lv = CAMPAIGN_LEVELS;
    var band = bandForLevel(lv);
    var isBoss = lv === CAMPAIGN_LEVELS;
    var rng = mulberry32(((ar + 1) * 7919 + lv * 104729 + 13) >>> 0);
    function pick(a, b) { return a + rng() * (b - a); }
    var p0w, p1w, gap, p0x, p1x, p0y, p1y;
    if (isBoss) {
      p0w = Math.round(pick(band.wMin, band.wMax));
      p1w = Math.round(pick(band.wMin, band.wMax));
      gap = Math.round(pick(band.gapMin, band.gapMax));
      p0x = Math.round(pick(34, 92));
      p1x = p0x + p0w + gap;
      if (p1x + p1w > W - 30) p1x = W - 30 - p1w;
      p0y = Math.round(pick(392, 452));
      p1y = Math.round(pick(150, 224));
    } else {
      p0w = Math.round(pick(band.wMin, band.wMax));
      p1w = Math.round(pick(band.wMin, band.wMax));
      gap = Math.round(pick(band.gapMin, band.gapMax));
      var maxX0 = Math.max(30, W - 30 - p1w - gap - p0w);
      p0x = Math.round(pick(30, Math.max(31, maxX0)));
      p1x = p0x + p0w + gap;
      var shape = lv % 6;
      p0y = Math.round(pick(band.yMin, band.yMax));
      if (shape === 0) p1y = Math.round(pick(Math.max(band.yMin, p0y - 26), Math.min(band.yMax, p0y + 26)));
      else if (shape === 1) p1y = Math.round(pick(band.yMin, Math.min(band.yMax, Math.max(band.yMin + 1, p0y - band.dMax))));
      else if (shape === 2) p1y = Math.round(pick(Math.max(band.yMin, Math.min(band.yMax - 1, p0y + band.dMin)), band.yMax));
      else if (shape === 3) p1y = Math.round(pick(band.yMin, band.yMax));
      else if (shape === 4) p1y = Math.round(pick(Math.max(band.yMin, Math.min(band.yMax - 1, p0y + band.dMin)), band.yMax));
      else p1y = Math.round(pick(band.yMin, Math.min(band.yMax, Math.max(band.yMin + 1, p0y - band.dMax))));
    }
    if (p1x + p1w > W - 30) p1x = W - 30 - p1w;
    if (p1x < p0x + p0w + 320) p1x = p0x + p0w + 320;
    if (p1x + p1w > W - 30) { p0x = Math.max(24, W - 30 - p1w - 320 - p0w); p1x = p0x + p0w + 320; }
    if (p0y < 150) p0y = 150;
    if (p0y > 452) p0y = 452;
    if (p1y < 150) p1y = 150;
    if (p1y > 452) p1y = 452;
    var plats = [
      { x: Math.round(p0x), y: Math.round(p0y), w: Math.round(p0w), h: 26 },
      { x: Math.round(p1x), y: Math.round(p1y), w: Math.round(p1w), h: 26 }
    ];
    return {
      arena: ar,
      level: lv,
      isBoss: isBoss,
      band: band.name,
      plats: plats,
      pos: [Math.round(plats[0].x + plats[0].w / 2), Math.round(plats[1].x + plats[1].w / 2)],
      difficulty: diffForLevel(lv),
      aiChar: aiCharForLevel(lv),
      aiArrow: campaignArrowForLevel(lv),
      extras: { windBias: 0, obstacles: [], movingPlat: null, boss: isBoss ? { hp: 140 } : null },
      seed: ((ar + 1) * 7919 + lv * 104729 + 13) >>> 0
    };
  }

  function mulberry32(a) {
    a = a >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function windFor(seed, turnNo) {
    var r = mulberry32((seed ^ Math.imul(turnNo + 7, 0x9E3779B1)) >>> 0);
    return Math.round((r() * 2 - 1) * 55);
  }
  function makePlatforms(rng) {
    var p0 = { x: 30 + Math.floor(rng() * 80), y: 190 + Math.floor(rng() * 280), w: 100 + Math.floor(rng() * 60), h: 26 };
    var gap = 400 + Math.floor(rng() * 300);
    var p1 = { x: p0.x + p0.w + gap, y: 190 + Math.floor(rng() * 280), w: 100 + Math.floor(rng() * 60), h: 26 };
    if (p1.x + p1.w > W - 30) p1.x = W - 30 - p1.w;
    if (p1.x - (p0.x + p0.w) < 360) p1.x = p0.x + p0.w + 360;
    if (p1.x + p1.w > W - 30) p1.w = Math.max(88, W - 30 - p1.x);
    return [p0, p1];
  }

  /* ===== وضعیت آغازین مسابقه ===== */
  function seatModsFallback(st, seat) { return statsOf(st && st.chars ? st.chars[seat] : seat); }
  function startState(opts) {
    opts = opts || {};
    var seed = (opts.seed >>> 0) || ((Date.now() ^ Math.floor(Math.random() * 4294967295)) >>> 0);
    var rng = mulberry32(seed);
    var arena = (opts.arena === undefined || opts.arena === null || opts.arena < 0) ? Math.floor(rng() * ARENAS.length) : (opts.arena % ARENAS.length);
    var plats;
    if (opts.plats && opts.plats.length === 2 &&
        isFinite(opts.plats[0] && opts.plats[0].x) && isFinite(opts.plats[1] && opts.plats[1].x)) {
      plats = [
        { x: Math.round(opts.plats[0].x), y: Math.round(opts.plats[0].y), w: Math.round(opts.plats[0].w), h: 26 },
        { x: Math.round(opts.plats[1].x), y: Math.round(opts.plats[1].y), w: Math.round(opts.plats[1].w), h: 26 }
      ];
    } else {
      plats = makePlatforms(rng);
    }
    var NC = CHARACTERS.length;
    var chars = (opts.chars && opts.chars.length === 2)
      ? [((Math.round(opts.chars[0]) % NC) + NC) % NC, ((Math.round(opts.chars[1]) % NC) + NC) % NC]
      : [0, 1];
    var s0 = statsOf(chars[0]), s1 = statsOf(chars[1]);
    var campaign = (opts.campaign && opts.campaign.level) ? { arena: arena, level: Math.round(opts.campaign.level) } : null;
    var diff = null;
    if (campaign) diff = diffForLevel(campaign.level);
    else if (opts.aiDiff) {
      for (var di = 0; di < DIFFS.length; di++) if (DIFFS[di].id === opts.aiDiff) diff = DIFFS[di];
    }
    var boostO = diff ? diff.dmgBoost : 1;
    var boostP = diff ? diff.powerBoost : 1;
    var startPos = (opts.pos && opts.pos.length === 2) ? opts.pos : null;
    var arrows = [
      opts.arrows && opts.arrows[0] && isArrowUsable(opts.arrows[0]) ? arrowById(opts.arrows[0]).id : 1,
      opts.arrows && opts.arrows[1] && isArrowUsable(opts.arrows[1]) ? arrowById(opts.arrows[1]).id : 1
    ];
    /* کمپین: تیر حریف همیشه از قانون مرحله می‌آید (قابل تغییر از کلاینت نیست) */
    if (campaign) arrows[1] = campaignArrowForLevel(campaign.level);
    return {
      v: 2,
      matchId: opts.matchId || ('b' + seed.toString(36)),
      gen: opts.gen || 1,
      names: opts.names && opts.names.length === 2 ? [String(opts.names[0]).slice(0, 24), String(opts.names[1]).slice(0, 24)] : ['بازیکن', 'روباه هوشمند'],
      phones: opts.phones && opts.phones.length === 2 ? [String(opts.phones[0]), String(opts.phones[1])] : null,
      chars: chars,
      arena: arena,
      seed: seed,
      plats: plats,
      hp: [s0.hp, s1.hp],
      hpMax: [s0.hp, s1.hp],
      pos: startPos ? [clampPosRaw(plats[0], startPos[0]), clampPosRaw(plats[1], startPos[1])]
                    : [Math.round(plats[0].x + plats[0].w / 2), Math.round(plats[1].x + plats[1].w / 2)],
      arrows: arrows,
      mods: [
        { dmgIn: s0.dmgIn, dmgOut: s0.dmgOut, pow: s0.pow, acc: s0.acc, drawMs: s0.drawMs, cd: s0.cd },
        { dmgIn: s1.dmgIn, dmgOut: s1.dmgOut * boostO, pow: s1.pow * boostP, acc: s1.acc, drawMs: s1.drawMs, cd: s1.cd }
      ],
      campaign: campaign,
      turn: 0,
      turnNo: 0,
      realtime: !!opts.realtime,
      aiCd: campaign ? aiCooldownFor(campaign.level) : s1.cd,
      ready: [0, 0],
      shotsLive: [],
      shotSeq: 0,
      spreadSeq: 0,
      wind: windFor(seed, 0),
      phase: 'countdown',
      startAt: 0,
      flyUntil: 0,
      lastShot: null,
      shots: [0, 0],
      hits: [0, 0],
      dmgDone: [0, 0],
      winner: null,
      pendingWinner: null,
      reason: '',
      again: [false, false],
      away: [0, 0],
      turnStart: 0,
      finishedAt: 0,
      ts: 0
    };
  }
  function seatMods(st, seat) {
    if (st && st.mods && st.mods[seat]) return st.mods[seat];
    return seatModsFallback(st, seat);
  }

  /* مرکز تنه روی محور x (بر پایهٔ آناتومی اسپرایت) */
  function torsoX(st, seat) {
    var a = artOf(st.chars ? st.chars[seat] : seat);
    return st.pos[seat] + (a.torsoCx - a.feetX) * (a.w * ART_H);
  }
  /* نقطهٔ گرفتگاه کمان (دست جلو) — تیر دقیقاً از همین‌جا خارج می‌شود */
  function handPoint(st, seat) {
    var a = artOf(st.chars ? st.chars[seat] : seat);
    var dir = seat === 0 ? 1 : -1;
    return {
      x: st.pos[seat] + dir * ((a.handX - a.feetX) * (a.w * ART_H) + 3),
      y: st.plats[seat].y - ART_H * a.handY
    };
  }
  /* جعبهٔ اصلی بدن (تنه) — هم‌راستا با تصویر */
  function playerBox(st, seat) {
    var p = st.plats[seat];
    var cx = torsoX(st, seat);
    return { x: cx - PLAYER_W / 2, y: p.y - PLAYER_H, w: PLAYER_W, h: PLAYER_H };
  }
  /* جعبهٔ برخورد گسترده (بازو/دُم/لباس) */
  function hitBox(st, seat) {
    var p = st.plats[seat];
    var cx = torsoX(st, seat);
    return { x: cx - (PLAYER_W / 2 + HIT_PAD), y: p.y - PLAYER_H, w: PLAYER_W + HIT_PAD * 2, h: PLAYER_H };
  }
  /* ناحیهٔ بدن از ارتفاع نقطهٔ اصابت — سرِ هر شخصیت از آناتومی خودش */
  function bodyPart(b, x, y, coreHit, headEndFrac) {
    var ry = (y - b.y) / b.h;
    if (coreHit === false) return 'limb';
    var he = isFinite(headEndFrac) ? headEndFrac + 0.06 : 0.22;
    if (ry <= he) return 'head';
    if (ry >= 0.80) return 'leg';
    return 'body';
  }
  function partBase(part) {
    if (part === 'head') return DMG_HEAD;
    if (part === 'body') return DMG_BODY;
    if (part === 'limb') return DMG_LIMB;
    if (part === 'leg') return DMG_LEG;
    return DMG_BODY;
  }

  /* ===== شبیه‌سازی دقیق پرتاب تیر ===== */
  function simulateShot(st, seat, x0, y0, vx, vy, arrowId, opts) {
    var a = arrowById(arrowId);
    var mBody = Number(a.dmgMult); if (!isFinite(mBody) || mBody <= 0) mBody = 1;
    var mHead = Number(a.headMult); if (!isFinite(mHead) || mHead <= 0) mHead = mBody;
    var sp0 = Math.sqrt(vx * vx + vy * vy);
    var modsA = seatMods(st, seat);
    var drawF = drawFactor(sp0);
    var fast = !!(opts && opts.fast);
    var maxT = (opts && opts.maxT) || MAX_FLIGHT;
    var dt = 1 / 120;
    var x = x0, y = y0, t = 0;
    var canHitOwner = false;
    var i, s, p, b;
    while (t < maxT) {
      x += vx * dt;
      y += vy * dt;
      vy += GRAV * dt;
      vx += st.wind * dt;
      t += dt;
      if (t > 0.18) canHitOwner = true;
      for (s = 0; s < 2; s++) {
        if (s === seat && !canHitOwner) continue;
        b = hitBox(st, s);
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          var cb = playerBox(st, s);
          var coreHit = false;
          var px2 = x, py2 = y, pvx = vx, pvy = vy, k2;
          for (k2 = 0; k2 < 26; k2++) {
            if (px2 >= cb.x && px2 <= cb.x + cb.w && py2 >= cb.y && py2 <= cb.y + cb.h) { coreHit = true; break; }
            px2 += pvx * dt; py2 += pvy * dt; pvy += GRAV * dt;
            if (py2 > cb.y + cb.h + 30) break;
          }
          var victimArt = artOf(st.chars ? st.chars[s] : s);
          var part = bodyPart(b, x, y, coreHit, victimArt.headEnd);
          var base = partBase(part);
          var spd = Math.sqrt(vx * vx + vy * vy);
          var imp = impactFactor(spd);
          var modsV = seatMods(st, s);
          var dmg = Math.round(base * (part === 'head' ? mHead : mBody) * imp * drawF * modsA.dmgOut * modsV.dmgIn);
          if (dmg < 1) dmg = 1;
          return { type: 'hit', seat: s, part: part, dmg: dmg, arrow: a.id,
                   x: x, y: y, t: t, spd: Math.round(spd), imp: Math.round(imp * 100) / 100 };
        }
      }
      for (i = 0; i < 2; i++) {
        p = st.plats[i];
        if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h + 16) {
          return { type: 'platform', x: x, y: Math.min(y, p.y), t: t };
        }
      }
      if (y >= H - 8) return { type: 'ground', x: x, y: H - 8, t: t };
      if (x < -60 || x > W + 60) return { type: 'out', x: x, y: y, t: t };
      if (fast && (x < -40 || x > W + 40)) return { type: 'out', x: x, y: y, t: t };
    }
    return { type: 'out', x: x, y: y, t: t };
  }

  function arrowAt(shot, t) {
    return {
      x: shot.x0 + shot.vx * t + 0.5 * shot.wind * t * t,
      y: shot.y0 + shot.vy * t + 0.5 * GRAV * t * t
    };
  }
  function clampPower(p) {
    p = Number(p);
    if (!isFinite(p)) p = 0.5;
    return Math.max(0.25, Math.min(1, p));
  }
  /* زاویهٔ منفی یعنی نشانه‌گیری رو به پایین — برای حریفِ پایین‌تر لازم است */
  function clampAngle(a) {
    a = Number(a);
    if (!isFinite(a)) a = 45;
    return Math.max(-58, Math.min(86, a));
  }
  function clampPosRaw(p, x) {
    x = Number(x);
    if (!isFinite(x)) x = p.x + p.w / 2;
    return Math.round(Math.max(p.x + 14, Math.min(p.x + p.w - 14, x)));
  }
  function clampPos(st, seat, x) {
    return clampPosRaw(st.plats[seat], x);
  }

  /* ===== شلیک ===== */
  function shoot(st, seat, angleDeg, power, now, arrowId) {
    if (!st || !st.matchId) return { error: 'noroom' };
    if (st.winner !== null) return { error: 'finished' };
    if (st.realtime) {
      if (st.phase === 'countdown') return { error: 'phase' };
      if ((st.ready[seat] || 0) > (now || 0)) return { error: 'cooldown' };
    } else {
      if (st.phase !== 'aim') return { error: 'phase' };
      if (st.turn !== seat) return { error: 'turn' };
    }
    var useId = (arrowId === undefined || arrowId === null) ? (st.arrows ? st.arrows[seat] : 1) : arrowId;
    if (!isArrowUsable(useId)) useId = 1;
    /* کمپین: تیر حریف همیشه مطابق قانون مرحله است — از کلاینت قابل تغییر نیست
       (تیر مرحله به قفلِ تیرهای بازیکن ربطی ندارد؛ قانون مرحله است) */
    if (st.campaign && seat === 1) useId = campaignArrowForLevel(st.campaign.level);
    var mods = seatMods(st, seat);
    var ang = clampAngle(angleDeg);
    var pw = clampPower(power);
    /* پراکندگی طبیعی بر پایهٔ دقت شخصیت (قطعی و بازتولیدپذیر) */
    st.spreadSeq = (st.spreadSeq || 0) + 1;
    var srng = mulberry32((((st.seed || 1) ^ Math.imul(st.spreadSeq * 2654435761 + seat * 97, 40503)) >>> 0));
    ang += (srng() * 2 - 1) * 2.6 * (1 - Math.min(1, Math.max(0, mods.acc)));
    var sp = (SPEED_MIN + pw * SPEED_RANGE) * arrowSpeedMult(useId) * mods.pow;
    var rad = ang * Math.PI / 180;
    var dir = seat === 0 ? 1 : -1;
    var hp0 = handPoint(st, seat);
    var x0 = hp0.x, y0 = hp0.y;
    var vx = Math.cos(rad) * sp * dir;
    var vy = -Math.sin(rad) * sp;
    var res = simulateShot(st, seat, x0, y0, vx, vy, useId);
    st.shots[seat]++;
    if (res.type === 'hit') {
      st.hp[res.seat] = Math.max(0, st.hp[res.seat] - res.dmg);
      if (res.seat !== seat) {
        st.hits[seat]++;
        st.dmgDone[seat] += res.dmg;
      }
      if (st.hp[0] <= 0 || st.hp[1] <= 0) {
        st.pendingWinner = st.hp[0] <= 0 ? 1 : 0;
        st.reason = (res.seat === seat && st.hp[seat] <= 0) ? 'self' : 'ko';
      }
    }
    if (st.realtime) {
      st.shotSeq = (st.shotSeq || 0) + 1;
      var rtShot = {
        id: st.matchId + '-rt' + st.shotSeq + '-' + seat,
        seat: seat, x0: x0, y0: y0, vx: vx, vy: vy,
        wind: st.wind, res: res, t0: now || 0, arrow: useId
      };
      st.lastShot = rtShot;
      if (!st.shotsLive) st.shotsLive = [];
      st.shotsLive.push(rtShot);
      while (st.shotsLive.length > 12) st.shotsLive.shift();
      var cd = seat === 0 ? mods.cd : (st.aiCd || mods.cd);
      st.ready[seat] = (now || 0) + cd;
      st.phase = 'aim';
      if (st.pendingWinner !== null && st.pendingWinner !== undefined) {
        st.winner = st.pendingWinner;
        st.phase = 'over';
        st.finishedAt = now || 0;
      }
      return { ok: true, shot: rtShot, hp: [st.hp[0], st.hp[1]], res: res };
    }
    st.lastShot = {
      id: st.matchId + '-' + st.turnNo + '-' + seat,
      seat: seat, x0: x0, y0: y0, vx: vx, vy: vy,
      wind: st.wind, res: res, t0: now || 0, arrow: useId
    };
    st.flyFor = res.t;
    st.flyUntil = (now || 0) + res.t * 1000 + FLY_TAIL_MS;
    st.phase = 'fly';
    return { ok: true, shot: st.lastShot, hp: [st.hp[0], st.hp[1]], res: res };
  }

  /* ===== پیشروی وضعیت ===== */
  function tick(st, now) {
    if (!st || !st.matchId) return false;
    var changed = false;
    if (st.phase === 'countdown' && now >= (st.startAt || 0)) {
      st.phase = 'aim';
      st.turnStart = now;
      changed = true;
    }
    if (st.realtime) {
      var slot = Math.floor(now / 6000);
      if (slot !== st.windSlot) {
        st.windSlot = slot;
        st.wind = windFor(st.seed, slot);
        changed = true;
      }
      if (st.shotsLive && st.shotsLive.length) {
        for (var q = st.shotsLive.length - 1; q >= 0; q--) {
          var sh = st.shotsLive[q];
          if (now >= sh.t0 + sh.res.t * 1000 + FLY_TAIL_MS) st.shotsLive.splice(q, 1);
        }
      }
      if (st.winner === null && (st.hp[0] <= 0 || st.hp[1] <= 0)) {
        st.winner = st.hp[0] <= 0 ? 1 : 0;
        st.phase = 'over';
        st.finishedAt = now;
        changed = true;
      }
      if (changed) st.ts = now;
      return changed;
    }
    if (st.phase === 'fly' && now >= (st.flyUntil || 0)) {
      if (st.pendingWinner !== null && st.pendingWinner !== undefined) {
        st.winner = st.pendingWinner;
        st.phase = 'over';
        st.finishedAt = now;
      } else {
        st.phase = 'aim';
        st.turn = 1 - st.turn;
        st.turnNo++;
        st.wind = windFor(st.seed, st.turnNo);
        st.turnStart = now;
      }
      changed = true;
    }
    if (!st.noAway && st.phase === 'aim' && st.winner === null && st.turnStart && now - st.turnStart > TURN_LIMIT_MS) {
      st.away[st.turn]++;
      if (st.away[st.turn] >= AWAY_LIMIT) {
        st.winner = 1 - st.turn;
        st.reason = 'timeout';
        st.phase = 'over';
        st.finishedAt = now;
      } else {
        st.turn = 1 - st.turn;
        st.turnNo++;
        st.wind = windFor(st.seed, st.turnNo);
        st.turnStart = now;
      }
      changed = true;
    }
    if (changed) st.ts = now;
    return changed;
  }

  /* ===== حریف هوشمند =====
     مسیر واقعی تیر شبیه‌سازی می‌شود (گرانش + باد + سکوها + ارتفاع حریف).
     جستجوی زاویه شامل زاویه‌های منفی است تا حریفِ پایین‌تر را هم درست
     هدف بگیرد؛ بین برخوردها، ضربهٔ سریع‌تر و کشنده‌تر ترجیح داده می‌شود. */
  function aiPlan(st, seat, diffId, rnd) {
    var d = null, i;
    if (diffId && typeof diffId === 'object') d = diffId;
    if (!d) { d = DIFFS[1]; for (i = 0; i < DIFFS.length; i++) if (DIFFS[i].id === diffId) d = DIFFS[i]; }
    if (!rnd) rnd = Math.random;
    var mods = seatMods(st, seat);
    var aiArrow = (st.arrows && st.arrows[seat]) ? st.arrows[seat] : 1;
    if (!isArrowUsable(aiArrow)) aiArrow = 1;
    if (st.campaign) aiArrow = campaignArrowForLevel(st.campaign.level);
    var spMult = arrowSpeedMult(aiArrow) * mods.pow;
    var victim = 1 - seat;
    var tb = hitBox(st, victim);
    var wantHead = rnd() < d.headChance;
    var ty = wantHead ? tb.y + tb.h * 0.10 : tb.y + tb.h * 0.45;
    var tx = (tb.x + tb.w / 2);
    var dir = seat === 0 ? 1 : -1;
    var hp0 = handPoint(st, seat);
    var x0 = hp0.x, y0 = hp0.y;
    function tryShot(a, pw) {
      var sp = (SPEED_MIN + pw * SPEED_RANGE) * spMult;
      var rad = a * Math.PI / 180;
      return simulateShot(st, seat, x0, y0, Math.cos(rad) * sp * dir, -Math.sin(rad) * sp, aiArrow, { fast: true, maxT: 2.6 });
    }
    function scoreOf(res) {
      if (res.type === 'hit') {
        if (res.seat === seat) return 9000;
        var partScore = res.part === 'head' ? 0 : (res.part === 'body' ? 45 : 120);
        /* امتیاز کمتر = بهتر: سر بهتر از تنه، آسیب بیشتر و پرواز سریع‌تر ترجیح دارد */
        return partScore - res.dmg * 0.12 + res.t * 26;
      }
      var dx = res.x - tx, dy = res.y - ty;
      return 380 + Math.sqrt(dx * dx + dy * dy);
    }
    var best = null, a, pi, pw, res, sc;
    for (a = -48; a <= 84; a += 4) {
      for (pi = 0; pi < 5; pi++) {
        pw = 0.4 + pi * 0.15;
        res = tryShot(a, pw);
        sc = scoreOf(res);
        if (best === null || sc < best.sc) best = { a: a, pw: pw, sc: sc };
      }
    }
    if (best) {
      var bA = best.a, bP = best.pw;
      for (a = bA - 4; a <= bA + 4; a += 1) {
        for (pi = 0; pi < 9; pi++) {
          pw = Math.max(0.25, Math.min(1, bP - 0.14 + pi * 0.035));
          res = tryShot(a, pw);
          sc = scoreOf(res);
          if (sc < best.sc) best = { a: a, pw: pw, sc: sc };
        }
      }
    } else { best = { a: 45, pw: 0.7, sc: 0 }; }
    var errScale = 1 / Math.min(1, Math.max(0.5, mods.acc));
    var angle = best.a + (rnd() * 2 - 1) * d.angleErr * errScale;
    var power = clampPower(best.pw + (rnd() * 2 - 1) * d.powerErr);
    if (d.blunder && rnd() < d.blunder) angle += (rnd() * 2 - 1) * 9;
    return { angle: clampAngle(angle), power: power, aimedHead: wantHead, arrow: aiArrow };
  }

  function publicState(st) {
    if (!st) return null;
    return {
      v: st.v, matchId: st.matchId, gen: st.gen || 1,
      names: st.names, phones: st.phones, chars: st.chars,
      arena: st.arena, seed: st.seed, plats: st.plats,
      hp: [st.hp[0], st.hp[1]], hpMax: st.hpMax ? [st.hpMax[0], st.hpMax[1]] : [100, 100],
      mods: st.mods || null,
      pos: [st.pos[0], st.pos[1]],
      turn: st.turn, turnNo: st.turnNo, wind: st.wind,
      phase: st.phase, startAt: st.startAt, flyUntil: st.flyUntil,
      lastShot: st.lastShot, shots: st.shots, hits: st.hits, dmgDone: st.dmgDone,
      arrows: st.arrows ? [st.arrows[0], st.arrows[1]] : [1, 1],
      campaign: st.campaign || null,
      winner: st.winner, reason: st.reason, again: st.again, away: st.away,
      turnStart: st.turnStart, finishedAt: st.finishedAt, ts: st.ts
    };
  }

  return {
    W: W, H: H, GRAV: GRAV,
    DMG_BODY: DMG_BODY, DMG_HEAD: DMG_HEAD, DMG_LIMB: DMG_LIMB, DMG_LEG: DMG_LEG,
    impactFactor: impactFactor, REF_SPEED: REF_SPEED,
    RT_COOLDOWN_P: RT_COOLDOWN_P, RT_COOLDOWN_AI: RT_COOLDOWN_AI,
    PLAYER_W: PLAYER_W, PLAYER_H: PLAYER_H, ART_H: ART_H, HIT_PAD: HIT_PAD,
    SPEED_MIN: SPEED_MIN, SPEED_RANGE: SPEED_RANGE,
    TURN_LIMIT_MS: TURN_LIMIT_MS, COUNTDOWN_MS: COUNTDOWN_MS,
    CHARACTERS: CHARACTERS, CHAR_STATS: CHAR_STATS, statsOf: statsOf, charPower: charPower,
    CHAR_ART: CHAR_ART, artOf: artOf, drawWOf: drawWOf,
    DIFFS: DIFFS, ARENAS: ARENAS,
    ARROWS: ARROWS, arrowById: arrowById, arrowDmgMult: arrowDmgMult,
    arrowSpeedMult: arrowSpeedMult, unlockedArrowIds: unlockedArrowIds, isArrowUsable: isArrowUsable,
    CAMPAIGN_LEVELS: CAMPAIGN_LEVELS, LEVEL_BANDS: LEVEL_BANDS,
    campaignArrowForLevel: campaignArrowForLevel, aiCharForLevel: aiCharForLevel,
    aiCooldownFor: aiCooldownFor, bandForLevel: bandForLevel, diffForLevel: diffForLevel, levelDef: levelDef,
    mulberry32: mulberry32, windFor: windFor, makePlatforms: makePlatforms,
    startState: startState, seatMods: seatMods, torsoX: torsoX, handPoint: handPoint,
    playerBox: playerBox, hitBox: hitBox, bodyPart: bodyPart, partBase: partBase,
    simulateShot: simulateShot, arrowAt: arrowAt,
    clampPower: clampPower, clampAngle: clampAngle, clampPos: clampPos, clampPosRaw: clampPosRaw,
    shoot: shoot, tick: tick, aiPlan: aiPlan, publicState: publicState
  };
})();


var BOWIMG = {"fox0":"/static/84043e7ec228b8815ffa48d79afc939dee4e9f0ff9fc98529b106ac5fca53774.webp","fox1":"/static/79c6dca8f7806d61874b8c78bd0dc9ca7a2664bdeb2a842037f6c9b206908ac3.webp","fox2":"/static/15e8a21b8481693e24ee3b8ac39059b6f21a128f481c3259c781071d12d4c2c6.webp","fox3":"/static/0c77a088c2ecdf6a506df0dcc38de0a514090735b01259ee56db1c4a16b7c8f5.webp","fox4":"/static/d33211605e87a6b777b4602375b891af6b2fc20894e5ec8cf2a386559dd7bec2.webp","fox5":"/static/1980c814bb52d68a9e320971a9ad91d41523f83786e1245b03bf90ceaa6c40ab.webp","fox6":"/static/a7a4975c84f64707410abd95e5058f8a7f457082be538f93113f8a93db772db3.webp","fox7":"/static/56cb0d00478912423e952b623634b6b642b4f871ddbcc2f173a6cbd36c047bb6.webp","fox8":"/static/d6f9ec2ff465f8e2f917853510bd77e55d3d9f28fdb9172b4246373c5d82f24d.webp","bow0":"/static/6482131f71dff8b345442f54cc16662c2a85676434707a27b406a6d0506ea66a.webp","bow1":"/static/1b11ec720f5b215080db0c3b4c311472d58ae46936c01bd477c7cbb8da31086a.webp","bow2":"/static/07b63c23130ebadaf3684e5eaa1c6fd5ab0fcf1a91522e0d2f56bb56aed6dff9.webp","bow3":"/static/c619d30a4e2a04fd954ddd324d2b549c4ef3033b2f8d5a0e1b3de96dafdb3c39.webp","bow4":"/static/2f1ea0a59918dbfb9d29515946088ac55ebabca87b9e94b05c0ec49a7baa651a.webp","bow5":"/static/e7aaa87bd29bd850c0ea93bc7c33a5ef7173578a0b3ab5c9bf6d36860bff5044.webp","bow6":"/static/797493d7203bf33a011538db9bd3dcb883c39d941de5341957fa0fb42cce188a.webp","bow7":"/static/3015ba18bc4ab625a7a745e982b0b72af131b01fbdad9fbab7ab533246d201a8.webp","bow8":"/static/f8ba62e99c2592bb195c3ea2089ea9cfb715cfcb8f4b31753217a6e8b1ec2a34.webp","arena0":"/static/abee4befba55a24bb6250204c399d586b1ea97734683aa879ec41a4a2c4d8f74.webp","arena1":"/static/8316f44e4aec035c5583d7d79f00f38999325fb6c415a1233956ea6320a7ad46.webp","arena2":"/static/d72033abc9ac010501f9a7386fb5c7525780daebd30e78544bd84b7cf18e0ac2.webp","arena3":"/static/c723523fdc77d374a11b472af3eb19f31ea2f2299046e14017ed94279e748a61.webp","arena4":"/static/f0372989ba0bfaa2b1cdba6a23d74d5b0b27036ef00351d5ac6737a8beea2188.webp","icon":"/static/864226c681a0fe15d0e17b53434ef1e7924aec6c68fada49012c61d0e51bcec1.webp"};
  /* خرابهٔ خون برای نقطهٔ اصابت تیر (شفاف) */
  var BLOOD_SPRITE = new Image();
  BLOOD_SPRITE.src = '/static/0dfb441d4ff9e66c1accb3834d6594962b61f613fd5879675e2ece1502f23bc5.png';
  /* ===== کمان اختصاصی هر شخصیت =========================================
     هر روباه کمان خودش را دارد. شخصیت‌هایی که در خود اسپرایت کمان دارند
     (۳ تکاور صحرا و ۴ شوالیه زمردین) با hasOwnBow=true علامت خورده‌اند تا
     کمان دوم رویشان کشیده نشود و فقط تیر روی کمانِ خودِ تصویر بنشیند. */
  /* ===== کمان اختصاصی هر شخصیت — تصویر واقعی (Asset) ===================
     دیگر هیچ کمانی با خط/منحنی/شکل هندسی کشیده نمی‌شود. هر شخصیت یک
     تصویر کمان مخصوص خودش دارد که در دستش قرار می‌گیرد، با دست می‌چرخد
     و هنگام کشیدن زه حالتش عوض می‌شود.
       img    : کلید تصویر در BOWIMG
       h      : ارتفاع کمان در جهان بازی (متناسب با قد روباه ~۱۶۲)
       gripY  : محل دستهٔ کمان روی تصویر (۰ بالا .. ۱ پایین) = مرکز چرخش
       nockIn : فاصلهٔ نشستن تیر از دسته به سمت داخل
       tipY   : محل سرِ بازوها برای بستن زه (نسبت به ارتفاع)
       string : رنگ زه
       hasOwnBow : این شخصیت در خود اسپرایت هم کمان دارد (تکاور/شوالیه)
                   که در این صورت کمانِ تصویری روی همان دست می‌نشیند. */
  var BOWSTYLE = [
    { img: 'bow0', h: 118, tipTopX: 0.35, tipBotX: 0.35, gripCx: 0.55, pullPx: 20, string: 'rgba(255,224,178,.95)' },
    { img: 'bow1', h: 116, tipTopX: 0.39, tipBotX: 0.39, gripCx: 0.53, pullPx: 20, string: 'rgba(220,245,255,.95)' },
    { img: 'bow2', h: 117, tipTopX: 0.16, tipBotX: 0.16, gripCx: 0.33, pullPx: 21, string: 'rgba(232,206,255,.95)' },
    { img: 'bow3', h: 120, tipTopX: 0.23, tipBotX: 0.23, gripCx: 0.44, pullPx: 21, string: 'rgba(245,238,214,.95)' },
    { img: 'bow4', h: 119, tipTopX: 0.16, tipBotX: 0.16, gripCx: 0.56, pullPx: 20, string: 'rgba(224,255,236,.95)' },
    { img: 'bow5', h: 118, tipTopX: 0.27, tipBotX: 0.29, gripCx: 0.58, pullPx: 21, string: 'rgba(255,244,176,.96)' },
    { img: 'bow6', h: 120, tipTopX: 0.23, tipBotX: 0.23, gripCx: 0.50, pullPx: 20, string: 'rgba(255,250,220,.96)' },
    { img: 'bow7', h: 119, tipTopX: 0.33, tipBotX: 0.33, gripCx: 0.48, pullPx: 20, string: 'rgba(255,228,240,.96)' },
    { img: 'bow8', h: 122, tipTopX: 0.31, tipBotX: 0.31, gripCx: 0.53, pullPx: 22, string: 'rgba(255,240,200,.96)' }
  ];
  function bowStyleFor(cId) { return BOWSTYLE[cId % BOWSTYLE.length]; }

                        var BC = BOWCORE;
  var V = document.getElementById('viewBow');
  if (!V) return;

  function el(id) { return document.getElementById(id); }
  function byId(id) { return document.getElementById(id); }
  var FA = '۰۱۲۳۴۵۶۷۸۹';
  function fa(n) {
    n = String(n);
    var out = '';
    for (var i = 0; i < n.length; i++) {
      var c = n.charCodeAt(i);
      out += (c >= 48 && c <= 57) ? FA.charAt(c - 48) : n.charAt(i);
    }
    return out;
  }
  function pad2(n) { return (n < 10 ? '۰' : '') + fa(n); }
  function clampN(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function myPhone() {
    try { return (typeof currentUser !== 'undefined' && currentUser && currentUser.phone) ? String(currentUser.phone) : ''; } catch (e) { return ''; }
  }
  function myName() {
    try {
      if (typeof currentUser !== 'undefined' && currentUser) {
        var n = currentUser.name || currentUser.username || '';
        if (n) return String(n).slice(0, 20);
      }
    } catch (e) {}
    return 'روباه';
  }
  function api(path, body) {
    var opts = body
      ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
      : { cache: 'no-store' };
    return fetch(path, opts).then(function (r) { return r.json().catch(function () { return null; }); }).catch(function () { return null; });
  }

  /* ---------- صدا (سنتز سبک، بدون فایل) ---------- */
  var SND = { on: (localStorage.getItem('fox_bow_sound') || '1') !== '0', ctx: null };
  function actx() {
    if (!SND.ctx) { try { SND.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { SND.ctx = null; } }
    if (SND.ctx && SND.ctx.state === 'suspended') { try { SND.ctx.resume(); } catch (e) {} }
    return SND.ctx;
  }
  function tone(f1, f2, dur, type, vol, delay) {
    if (!SND.on) return;
    var c = actx(); if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f1, t0);
    if (f2 && f2 !== f1) o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noiseBurst(dur, vol, freq) {
    if (!SND.on) return;
    var c = actx(); if (!c) return;
    var n = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, n, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = c.createBufferSource(); src.buffer = buf;
    var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq || 900;
    var g = c.createGain(); g.gain.value = vol || 0.14;
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start();
  }
  /* نام فارسی ناحیهٔ اصابت — برای بازخورد روی صحنه */
  function PART_FA(part) {
    if (part === 'head') return 'اصابت به سر!';
    if (part === 'body') return 'اصابت به تنه';
    if (part === 'limb') return 'اصابت به بازو';
    if (part === 'leg') return 'اصابت به پا';
    return 'اصابت';
  }
  function sfx(name) {
    if (name === 'click') tone(760, 760, 0.06, 'triangle', 0.08);
    else if (name === 'draw') noiseBurst(0.16, 0.05, 500);
    else if (name === 'shoot') { noiseBurst(0.22, 0.16, 2200); tone(420, 90, 0.2, 'sine', 0.1); }
    else if (name === 'thud') { noiseBurst(0.14, 0.2, 300); tone(120, 60, 0.16, 'sine', 0.18); }
    else if (name === 'head') { tone(660, 880, 0.1, 'square', 0.07); noiseBurst(0.12, 0.16, 400); }
    else if (name === 'count') tone(520, 520, 0.09, 'triangle', 0.1);
    else if (name === 'win') { tone(523, 523, 0.14, 'triangle', 0.12); tone(659, 659, 0.14, 'triangle', 0.12, 0.13); tone(784, 784, 0.24, 'triangle', 0.13, 0.26); }
    else if (name === 'lose') { tone(220, 130, 0.5, 'sine', 0.14); }
  }

  /* ---------- تصاویر ---------- */
  var foxImg = [], arenaImg = [], heroImg = null;
  function mkImg(src) { var im = new Image(); im.src = src; return im; }
  for (var fi = 0; fi < 9; fi++) foxImg.push(mkImg(BOWIMG['fox' + fi]));
  /* تصاویر کمان هر شخصیت (Asset واقعی، نه شکل کدنویسی‌شده) */
  var bowImg = {};
  for (var bi2 = 0; bi2 < 9; bi2++) bowImg['bow' + bi2] = mkImg(BOWIMG['bow' + bi2]);
  for (var ai3 = 0; ai3 < 5; ai3++) arenaImg.push(mkImg(BOWIMG['arena' + ai3]));
  heroImg = mkImg(BOWIMG.icon);
  if (el('bowHeroImg')) el('bowHeroImg').src = BOWIMG.icon;

  /* ---------- وضعیت ---------- */
  var PREF_KEY = 'fox_bow_prefs_v1';
  var prefs = { charIdx: 0, arenaIdx: 0, diff: 'medium', arrowId: 1 };
  try {
    var pp = JSON.parse(localStorage.getItem(PREF_KEY) || 'null');
    if (pp && typeof pp === 'object') {
      if (pp.charIdx >= 0 && pp.charIdx < BC.CHARACTERS.length) prefs.charIdx = pp.charIdx;
      if (pp.arenaIdx >= 0 && pp.arenaIdx < 5) prefs.arenaIdx = pp.arenaIdx;
      if (pp.diff) prefs.diff = pp.diff;
      if (pp.arrowId) prefs.arrowId = pp.arrowId;
    }
  } catch (e) {}
  /* تیر قفل‌شده هرگز انتخاب‌شده باقی نمی‌ماند (ضد جعل از کلاینت) */
  if (!BC.isArrowUsable(prefs.arrowId)) prefs.arrowId = 1;
  function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} }
  function myArrow() {
    var a = BC.arrowById(prefs.arrowId);
    return BC.isArrowUsable(a.id) ? a : BC.ARROWS[0];
  }

  /* ---------- پیشرفت کمپین (هر محیط جداگانه، پایدار) ----------
     از همان سازوکار ذخیره‌سازی موجود پروژه (localStorage) استفاده می‌کند و
     هیچ‌وقت دادهٔ قبلی کاربر را پاک یا بازنشانی نمی‌کند؛ فقط کلید جدید می‌سازد. */
  var CAMP_KEY = 'fox_bow_campaign_v1';
  var camp = { v: 1, unlocked: {}, won: {} };
  try {
    var cp = JSON.parse(localStorage.getItem(CAMP_KEY) || 'null');
    if (cp && typeof cp === 'object' && cp.unlocked && cp.won) { camp.unlocked = cp.unlocked; camp.won = cp.won; }
  } catch (e) {}
  function campSave() { try { localStorage.setItem(CAMP_KEY, JSON.stringify(camp)); } catch (e) {} }
  function campKey(ar) { return 'a' + ar; }
  /* مرحلهٔ بازشدهٔ یک محیط؛ محیط تازه همیشه از مرحلهٔ ۱ شروع می‌شود */
  function campUnlocked(ar) {
    var n = Number(camp.unlocked[campKey(ar)]);
    if (!isFinite(n) || n < 1) n = 1;
    if (n > BC.CAMPAIGN_LEVELS) n = BC.CAMPAIGN_LEVELS;
    return n;
  }
  function campWon(ar) {
    var n = Number(camp.won[campKey(ar)]);
    return (isFinite(n) && n >= 0) ? n : 0;
  }
  function campWin(ar, lv) {
    var k = campKey(ar);
    if (lv > campWon(ar)) camp.won[k] = lv;
    var next = Math.min(BC.CAMPAIGN_LEVELS, Math.max(campUnlocked(ar), lv + 1));
    camp.unlocked[k] = next;
    campSave();
    return next;
  }

  var G = {
    mode: null,            /* single | online */
    st: null,              /* وضعیت مشترک بازی */
    seat: 0,
    room: '',
    partner: '',
    myPhone: '',
    serverOff: 0,
    netFails: 0,
    aim: { angle: 52, power: 0.7 },   /* زاویهٔ پیش‌فرض کمی رو به بالا */
    aimDrag: false,
    /* وضعیت کشیدن کمان با انگشت: هر Drag فقط یک تیر */
    aim2: { active: false, pid: null, sx: 0, sy: 0, x: 0, y: 0, dist: 0, power: 0, angle: 45, fired: false },
    /* وضعیت نشانه‌گیری حریف آنلاین (برای انیمیشن نرم، بدون پرش شبکه) */
    netAim: [null, null],
    /* اطلاعات مرحلهٔ کمپین (فقط حالت single) */
    camp: null,
    input: { dir: 0 },
    moveLastPost: 0,
    posVis: [0, 0],
    flight: null,          /* {id, start, done, shot} */
    fxDone: {},
    parts: [],
    popups: [],
    rings: [],
    windDots: [],
    shake: 0,
    raf: 0,
    lastT: 0,
    loopOn: false,
    pollT: 0,
    queueT: 0,
    queueT0: 0,
    ai: { active: false, phase: '', until: 0, plan: null, fromA: 45, fromP: 0.6, tA: 0, tP: 0, move: null, aimNow: { angle: 45, power: 0.55 } },
    resShown: false,
    againAsked: false,
    overSoundDone: false,
    closed: false
  };
  function nowFn() { return Date.now() + (G.mode === 'online' ? G.serverOff : 0); }

  /* ---------- پنل‌ها ---------- */
  var P_START = el('bowStart'), P_QUEUE = el('bowQueue'), P_GAME = el('bowGame');
  var P_CAMP = el('bowCamp'), P_LEVELS = el('bowLevels');
  function enterGameArena() {
    var app = el('bowApp');
    if (app) app.classList.add('bow-in-arena');
    if (V) V.classList.add('bow-in-arena');
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(function () {});
      }
    } catch (e) {}
    /* چیدمان تازه (چرخش/تمام‌صفحه) باید قبل از محاسبهٔ اندازهٔ بوم بنشیند.
       اگر fit زودتر اجرا شود، عرض/ارتفاع صفر خوانده می‌شود و صحنه سیاه
       می‌ماند تا وقتی کاربر خارج و دوباره وارد شود. */
    refitSoon();
  }

  /* چند بار پشت‌سرهم fit می‌زند تا هر تأخیر چیدمانی/چرخشی جبران شود.
     اگر اندازهٔ صحنه هنوز صفر باشد، تا آماده شدن ادامه می‌دهد. */
  function refitSoon() {
    var tries = 0;
    function attempt() {
      tries++;
      var stg = el('bowStage');
      var w = stg ? stg.offsetWidth : 0, h = stg ? stg.offsetHeight : 0;
      fit();
      if (G.loopOn) render(Date.now());
      if ((w < 40 || h < 40) && tries < 30) {
        requestAnimationFrame(attempt);
        return;
      }
      if (tries < 4) setTimeout(attempt, tries === 1 ? 60 : 220);
    }
    requestAnimationFrame(function () { requestAnimationFrame(attempt); });
  }

  function exitGameArena() {
    var app = el('bowApp');
    if (app) app.classList.remove('bow-in-arena');
    if (V) V.classList.remove('bow-in-arena');
    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    } catch (e) {}
    requestAnimationFrame(function () { fit(); });
    setTimeout(function () { fit(); }, 120);
  }

  function showPanel(p) {
    var all = [P_START, P_QUEUE, P_GAME, P_CAMP, P_LEVELS, P_CHAR];
    for (var i = 0; i < all.length; i++) if (all[i]) all[i].classList.add('hidden');
    if (p) p.classList.remove('hidden');
    /* نوار بالا در صفحهٔ اول روشن است، در بقیه تیره */
    var appEl = el('bowApp');
    if (appEl) appEl.classList.toggle('bow-head-light', p === P_START);
    if (V) V.classList.toggle('bow-head-light', p === P_START);
    if (p === P_GAME) {
      enterGameArena();
    } else {
      exitGameArena();
    }
  }
  var toastT = 0;
  function toast(msg) {
    var t = el('bowToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    if (toastT) clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ---------- مدیریت ویو ---------- */
  var MAIN_VIEWS = ['viewHome', 'viewChat', 'viewDMList', 'viewDM', 'viewSettings', 'viewFun', 'viewDooz', 'viewTank', 'viewMemory', 'viewQuiz', 'viewSudoku', 'viewMensh', 'viewDots'];
  function enterView() {
    for (var i = 0; i < MAIN_VIEWS.length; i++) {
      var n = byId(MAIN_VIEWS[i]);
      if (n) { n.classList.add('hidden'); n.style.display = 'none'; }
    }
    var q = byId('viewQuiz'); if (q) q.style.display = 'none';
    V.classList.remove('hidden');
    V.style.display = 'block';
    var nav = byId('bottomNav'); if (nav) nav.classList.add('show');
    var app = el('bowApp'); if (app) app.classList.remove('is-closing');
  }
  function hideView() {
    V.classList.add('hidden');
    V.style.display = 'none';
  }
  /* اگر کاربر از مسیر دیگری وارد بازی دیگری شد، این بازی خودکار بسته می‌شود */
  var mo = new MutationObserver(function () {
    if (V.classList.contains('hidden')) return;
    for (var i = 0; i < MAIN_VIEWS.length; i++) {
      var n = byId(MAIN_VIEWS[i]);
      if (n && !n.classList.contains('hidden') && n.style.display !== 'none') {
        hardExit(true);
        return;
      }
    }
  });
  for (var mvi = 0; mvi < MAIN_VIEWS.length; mvi++) {
    (function (id) {
      var n = byId(id);
      if (n) mo.observe(n, { attributes: true, attributeFilter: ['class', 'style'] });
    })(MAIN_VIEWS[mvi]);
  }

  /* ---------- انتخاب شخصیت + سیستم بازشدن ----------
     شخصیت‌های ۰ تا ۲ آزادند؛ ۳ تا ۶ با برد کمپین باز می‌شوند و دو شخصیت
     جدید (سلطنتی و افسانه‌ای) فعلاً قفل‌اند — روش باز شدن بعداً به
 CHAR_STATS[i].unlock اضافه می‌شود بدون تغییر دیگر کدها. */
  function totalCampWins() {
    var t = 0;
    for (var a = 0; a < BC.ARENAS.length; a++) t += campWon(a);
    return t;
  }
  function charUnlockInfo(i) {
    var u = BC.CHAR_STATS[i] && BC.CHAR_STATS[i].unlock;
    if (!u || u.type === 'free') return { locked: false };
    if (u.type === 'wins') return { locked: totalCampWins() < u.wins, need: u.wins };
    return { locked: true, soon: true };
  }
  function charLocked(i) { return charUnlockInfo(i).locked; }
  var LOCK_SVG = '<svg viewBox="0 0 24 24" fill="none"><rect x="4.5" y="10.5" width="15" height="10" rx="2.6" stroke="currentColor" stroke-width="2.4"></rect><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path></svg>';
  var charSelCtx = { mode: 'campaign', arena: 0, level: 1 };
  var P_CHAR = el('bowChar');
  function openCharSelect(ctx) {
    charSelCtx = ctx || charSelCtx;
    buildCharSelectUI();
    showPanel(P_CHAR);
    sfx('click');
  }
  function statBar(label, val, max, unit) {
    var k = Math.max(0.04, Math.min(1, val / max));
    return '<div class="bow-cs-row"><span class="bow-cs-lbl">' + label + '</span>' +
      '<span class="bow-cs-track"><i style="width:' + Math.round(k * 100) + '%"></i></span>' +
      '<b class="bow-cs-val">' + fa(Math.round(val)) + (unit || '') + '</b></div>';
  }
  function buildCharSelectUI() {
    var t = el('bowCharTitle'), s2 = el('bowCharSub');
    if (t) {
      if (charSelCtx.mode === 'campaign') t.textContent = BC.ARENAS[charSelCtx.arena].name + ' · مرحله ' + fa(charSelCtx.level);
      else t.textContent = 'دو نفره آنلاین';
    }
    if (s2) s2.textContent = 'قدرت شخصیت‌ها واقعاً در بازی اثر دارد: جان، آسیب، سرعت تیر، دقت و کشش';
    var grid = el('bowCharGrid');
    if (grid) {
      grid.innerHTML = '';
      for (var i = 0; i < BC.CHARACTERS.length; i++) {
        (function (ci) {
          var info = charUnlockInfo(ci);
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'bow-charcard' + (info.locked ? ' locked' : '') + (prefs.charIdx === ci && !info.locked ? ' on' : '');
          var pwTxt;
          if (info.soon) pwTxt = 'به‌زودی';
          else if (info.need) pwTxt = 'با ' + fa(info.need) + ' برد';
          else pwTxt = 'رده ' + fa(ci + 1);
          b.innerHTML = '<img loading="lazy" decoding="async" alt=""/><span class="bow-charcard-name"></span>' +
            '<small class="bow-charcard-pw"></small>' +
            (info.locked ? '<em class="bow-charcard-lock" aria-hidden="true">' + LOCK_SVG + '</em>' : '');
          b.firstChild.src = BOWIMG['fox' + ci];
          b.querySelector('.bow-charcard-name').textContent = BC.CHARACTERS[ci].name;
          b.querySelector('.bow-charcard-pw').textContent = pwTxt;
          b.addEventListener('click', function () {
            if (info.locked) {
              sfx('click');
              b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge');
              toast(info.soon ? 'این شخصیت به‌زودی باز می‌شود' : 'برای باز شدن این شخصیت ' + fa(info.need) + ' برد کمپین لازم است');
              return;
            }
            prefs.charIdx = ci; savePrefs(); sfx('click');
            buildCharSelectUI();
          });
          grid.appendChild(b);
        })(i);
      }
    }
    var stBox = el('bowCharStats');
    if (stBox) {
      var st2 = BC.statsOf(prefs.charIdx);
      stBox.innerHTML =
        '<div class="bow-cs-head"><img loading="lazy" decoding="async" alt=""/><b></b><small>رده ' + fa(prefs.charIdx + 1) + ' از ' + fa(BC.CHARACTERS.length) + '</small></div>' +
        statBar('جان', st2.hp, 150) +
        statBar('آسیب', st2.dmgOut * 100, 130) +
        statBar('سرعت تیر', st2.pow * 100, 130) +
        statBar('دقت', st2.acc * 100, 100) +
        statBar('مقاومت', (2 - st2.dmgIn) * 100, 125) +
        statBar('سرعت کشش', (1000 - st2.drawMs) / 10, 40);
      var himg = stBox.querySelector('.bow-cs-head img');
      if (himg) himg.src = BOWIMG['fox' + prefs.charIdx];
      var hb = stBox.querySelector('.bow-cs-head b');
      if (hb) hb.textContent = BC.CHARACTERS[prefs.charIdx].name;
    }
    var sb = el('bowCharStart');
    if (sb) {
      if (charSelCtx.mode === 'campaign') sb.textContent = 'شروع مرحلهٔ ' + fa(charSelCtx.level);
      else sb.textContent = 'جستجوی حریف';
    }
    var _aon = document.querySelector('#bowArrowOpt .bow-arrowopt-name');
    if (_aon) _aon.textContent = myArrow().name;
  }
  var charBack = el('bowCharBack');
  if (charBack) charBack.addEventListener('click', function () {
    sfx('click');
    if (charSelCtx.mode === 'campaign') openLevels(charSelCtx.arena);
    else showPanel(P_START);
  });
  var charStartBtn = el('bowCharStart');
  if (charStartBtn) charStartBtn.addEventListener('click', function () {
    sfx('click');
    if (charLocked(prefs.charIdx)) { toast('این شخصیت قفل است — اول آن را باز کن'); return; }
    if (charSelCtx.mode === 'campaign') startMatch(charSelCtx.level, prefs.charIdx);
    else startOnline();
  });
  var onlBtn = el('bowOnlineBtn');
  if (onlBtn) onlBtn.addEventListener('click', function () { sfx('click'); openCharSelect({ mode: 'online' }); });

  /* ---------- بستن و پاک‌سازی ---------- */
  function stopTimers() {
    if (G.raf) { cancelAnimationFrame(G.raf); G.raf = 0; }
    if (G.pollT) { clearInterval(G.pollT); G.pollT = 0; }
    if (G.queueT) { clearInterval(G.queueT); G.queueT = 0; }
    G.loopOn = false;
    G.ai.active = false;
  }
  function leaveMatchSilent() {
    if (G.mode === 'online' && G.room && G.myPhone && G.st && G.st.winner === null) {
      try {
        fetch('/api/bow/leave', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ room: G.room, phone: G.myPhone }), keepalive: true }).catch(function () {});
      } catch (e) {}
    }
  }
  function hardExit(silent) {
    exitGameArena();
    leaveMatchSilent();
    stopTimers();
    G.mode = null; G.st = null; G.room = ''; G.flight = null; G.parts = []; G.popups = []; G.rings = []; G.splats = [];
    G.aim2.active = false; G.aimDrag = false; hidePowerMeter(); closeArrows();
    G.resShown = false; G.againAsked = false; G.netFails = 0;
    var r = el('bowResult'); if (r) r.classList.add('hidden');
    hideView();
    if (!silent && typeof window.goFun === 'function') { try { window.goFun(); } catch (e) {} }
  }
  el('bowBack').addEventListener('click', function () { sfx('click'); hardExit(false); });
  var gBack = el('bowGameBack');
  if (gBack) gBack.addEventListener('click', function () { sfx('click'); hardExit(false); });
  var gSound = el('bowGameSound');
  if (gSound) gSound.addEventListener('click', function () {
    SND.on = !SND.on;
    try { localStorage.setItem('fox_bow_sound', SND.on ? '1' : '0'); } catch (e) {}
    syncSoundBtn();
    if (SND.on) sfx('click');
  });
  el('bowExitBtn').addEventListener('click', function () { sfx('click'); hardExit(false); });
  el('bowSound').addEventListener('click', function () {
    SND.on = !SND.on;
    try { localStorage.setItem('fox_bow_sound', SND.on ? '1' : '0'); } catch (e) {}
    el('bowSound').style.opacity = SND.on ? '1' : '.45';
    if (SND.on) sfx('click');
  });
  el('bowSound').style.opacity = SND.on ? '1' : '.45';

  window.addEventListener('pagehide', function () { leaveMatchSilent(); });
  window.addEventListener('beforeunload', function () { leaveMatchSilent(); });

  /* ---------- شروع مسابقهٔ کمپین ----------
     تک‌نفره فقط در بستر کمپین اجرا می‌شود:
     حالت ← محیط ← مرحله ← شخصیت ← شروع.
     شخصیت و تیر حریف از قانون مرحله می‌آید. */
  function startMatch(lv, charIdx) {
    lv = Number(lv) || 1;
    if (campUnlocked(prefs.arenaIdx) < lv) { toast('این مرحله هنوز باز نشده'); return; }
    var def = BC.levelDef(prefs.arenaIdx, lv);
    var myChar = (typeof charIdx === 'number' && charIdx >= 0 && charIdx < BC.CHARACTERS.length) ? charIdx : prefs.charIdx;
    if (charLocked(myChar)) myChar = 0;
    prefs.charIdx = myChar; savePrefs();
    var aiName = BC.CHARACTERS[def.aiChar].name + ' · مرحله ' + fa(def.level);
    var st = BC.startState({
      names: [myName() || 'روباه', aiName],
      phones: null,
      chars: [myChar, def.aiChar],
      arena: def.arena,
      seed: def.seed,
      plats: def.plats,
      pos: def.pos,
      arrows: [myArrow().id, 1],
      campaign: { arena: def.arena, level: def.level },
      realtime: true
    });
    st.startAt = Date.now() + 2600;
    st.noAway = true;
    G.mode = 'single'; G.seat = 0; G.room = ''; G.myPhone = ''; G.serverOff = 0;
    G.netFails = 0; G.againAsked = false; G.overSoundDone = false;
    G.camp = { arena: def.arena, level: def.level, diff: def.difficulty, isBoss: def.isBoss };
    mountState(st);
    showPanel(P_GAME);
    startLoop();
    sfx('count');
  }

  /* ---------- شروع آنلاین ---------- */
  function setQueueNote(t) { var n = el('bowQueueNote'); if (n) n.textContent = t; }
  function startOnline() {
    var phone = myPhone();
    if (!phone) {
      toast('برای بازی آنلاین اول با شماره موبایل وارد شو');
      return;
    }
    G.mode = 'online'; G.myPhone = phone; G.room = ''; G.seat = 0; G.partner = '';
    G.againAsked = false; G.overSoundDone = false; G.netFails = 0;
    showPanel(P_QUEUE);
    G.queueT0 = Date.now();
    if (G.queueT) clearInterval(G.queueT);
    G.queueT = setInterval(function () {
      var s = Math.floor((Date.now() - G.queueT0) / 1000);
      el('bowQueueTimer').textContent = pad2(Math.floor(s / 60)) + ':' + pad2(s % 60);
    }, 500);
    setQueueNote('در حال اتصال به سرور…');
    pollWaitLoop();
  }
  function pollWaitLoop() {
    api('/api/bow/join', { phone: G.myPhone, name: myName(), arrowId: prefs.arrowId, char: prefs.charIdx }).then(function (r) {
      if (G.mode !== 'online' || !P_QUEUE || P_QUEUE.classList.contains('hidden')) return;
      if (r && r.error) { setQueueNote('خطا: ' + r.error); return; }
      if (r && r.room) { onMatched(r.room, r.seat || 0, r.partner || 'حریف'); return; }
      setQueueNote('در صف بازیابی… جایگاه ' + fa((r && r.pos >= 0 ? r.pos : 0) + 1));
      if (G.queueT) clearInterval(G.queueT);
      G.queueT = setInterval(function () {
        var s = Math.floor((Date.now() - G.queueT0) / 1000);
        el('bowQueueTimer').textContent = pad2(Math.floor(s / 60)) + ':' + pad2(s % 60);
        api('/api/bow/wait?me=' + encodeURIComponent(G.myPhone)).then(function (w) {
          if (G.mode !== 'online' || P_QUEUE.classList.contains('hidden')) return;
          if (w && w.room) { onMatched(w.room, w.seat || 0, w.partner || 'حریف'); }
          else if (w && w.pos !== undefined && w.pos >= 0) setQueueNote('در صف بازیابی… جایگاه ' + fa(w.pos + 1));
        });
      }, 900);
    });
  }

  el('bowQueueCancel').addEventListener('click', function () {
    sfx('click');
    if (G.queueT) clearInterval(G.queueT);
    api('/api/bow/cancel', { phone: G.myPhone || myPhone() });
    G.mode = null;
    showPanel(P_START);
  });

  function onMatched(room, seat, partner) {
    if (G.queueT) clearInterval(G.queueT);
    G.room = room; G.seat = seat; G.partner = partner || 'حریف';
    G.st = null; G.resShown = false; G.againAsked = false; G.flight = null; G.fxDone = {};
    showPanel(P_GAME);
    startLoop();
    if (G.pollT) clearInterval(G.pollT);
    G.pollT = setInterval(netPoll, 550);
    netPoll();
    sfx('count');
  }
  function netPoll() {
    if (G.mode !== 'online' || !G.room) return;
    api('/api/bow/state?room=' + encodeURIComponent(G.room) + '&me=' + encodeURIComponent(G.myPhone)).then(function (pub) {
      if (G.mode !== 'online' || !G.room) return;
      if (!pub || !pub.matchId) {
        G.netFails++;
        if (G.netFails > 12) { toast('اتصال نبرد برقرار نشد'); hardExit(false); }
        return;
      }
      G.netFails = 0;
      if (typeof pub.now === 'number') {
        var target = pub.now - Date.now();
        G.serverOff = G.serverOff === 0 ? target : (G.serverOff * 0.65 + target * 0.35);
      }
      applyState(pub);
    }).catch(function () {
      G.netFails++;
      var note = el('bowTurnNote');
      if (note && G.netFails > 3) note.textContent = 'اتصال ضعیف… تلاش مجدد';
    });
  }

  /* ---------- اعمال وضعیت ---------- */
  function mountState(st) {
    G.st = st;
    G.posVis = [st.pos[0], st.pos[1]];
    G.flight = null; G.fxDone = {}; G.parts = []; G.popups = []; G.rings = []; G.splats = [];
    G.aim = { angle: 45, power: 0.7 };
    G.aim2 = { active: false, pid: null, sx: 0, sy: 0, x: 0, y: 0, dist: 0, power: 0, angle: 45, fired: false };
    G.aimDrag = false;
    hidePowerMeter();
    G.ai.active = false; G.ai.phase = ''; G.ai.aimNow = { angle: 45, power: 0.55 };
    G.resShown = false; G.againAsked = false; G.overSoundDone = false; G.campNotified = false;
    var r = el('bowResult'); if (r) r.classList.add('hidden');
    var again = el('bowAgainBtn');
    if (again) { again.disabled = false; }
    syncPowerUI();
    syncAngleUI();
    updateHud();
  }
  function applyState(pub) {
    var prevId = G.st ? G.st.matchId : '';
    var prevShotId = G.st && G.st.lastShot ? G.st.lastShot.id : '';
    G.st = pub;
    if (pub.matchId !== prevId) { mountState(pub); return; }
    if (pub.lastShot && pub.lastShot.id !== prevShotId) {
      /* شلیک حریف: انیمیشن رها شدن را روی همان صندلی اجرا کن */
      if (pub.lastShot.seat !== G.seat) rigFire(pub.lastShot.seat);
      beginFlight(pub.lastShot);
    }
    syncNetAim(pub);
    updateHud();
    maybeResult();
  }

  /* وضعیت نشانه‌گیری حریف آنلاین را برای ریگ انیمیشن آماده می‌کند.
     مقدارها هدفِ نرم‌سازی‌اند، پس لگ شبکه باعث پرش دست و کمان نمی‌شود. */
  function syncNetAim(pub) {
    if (G.mode !== 'online' || !pub) return;
    var opp = 1 - G.seat;
    var aiming = pub.winner === null && pub.phase === 'aim' && pub.turn === opp;
    var prev = G.netAim[opp];
    if (!aiming) {
      G.netAim[opp] = { drawing: false, angle: prev ? prev.angle : 50, power: 0 };
      return;
    }
    /* سرور زاویهٔ زندهٔ حریف را نمی‌فرستد؛ یک کشش باورپذیر می‌سازیم که
       با زمانِ سپری‌شده از شروع نوبت بالا می‌رود (نرم و بدون پرش). */
    var held = pub.turnStart ? (Date.now() - pub.turnStart) / 1000 : 0;
    var ramp = clampN(held / 2.2, 0, 1);
    var base = prev && prev.angle ? prev.angle : 48;
    G.netAim[opp] = {
      drawing: ramp > 0.08,
      angle: base + Math.sin(held * 1.3) * 4.5,
      power: 0.25 + ramp * 0.55
    };
  }
  function beginFlight(shot) {
    if (G.flight && G.flight.id === shot.id) return;
    G.flight = { id: shot.id, start: nowFn(), shot: shot, done: false };
    if (shot.seat !== G.seat) sfx('shoot');
  }
  function flightLocalDone() {
    if (!G.st || !G.st.lastShot) return true;
    if (!G.flight || G.flight.id !== G.st.lastShot.id) return true;
    var t = (nowFn() - G.flight.start) / 1000;
    return t >= G.flight.shot.res.t;
  }
  function maybeResult() {
    var st = G.st;
    if (!st || st.winner === null || G.resShown) return;
    if (!flightLocalDone()) return;
    G.resShown = true;
    try {
      if (st.winner === G.seat && window.FoxGameRewardService) {
        FoxGameRewardService.claimReward({ gameCode: 'bow_duel', mode: (G.mode === 'online') ? 'online' : 'solo', result: 'win' });
      }
    } catch(e) {}
    if (G.mode === 'single' && G.camp && st.winner === G.seat) {
      var preWins = totalCampWins();
      var nx = campWin(G.camp.arena, G.camp.level);
      if (!G.campNotified) {
        G.campNotified = true;
        if (G.camp.level >= BC.CAMPAIGN_LEVELS) toast('آخرین مرحلهٔ این محیط را بردی!');
        else if (nx <= BC.CAMPAIGN_LEVELS) toast('مرحله ' + fa(nx) + ' باز شد');
        var postWins = totalCampWins();
        for (var ci2 = 0; ci2 < BC.CHARACTERS.length; ci2++) {
          var u2 = BC.CHAR_STATS[ci2].unlock;
          if (u2 && u2.type === 'wins' && preWins < u2.wins && postWins >= u2.wins)
            toast('شخصیت جدید باز شد: ' + BC.CHARACTERS[ci2].name + '!');
        }
      }
    }
    showResult(st);
  }
  function hpClass(p) { return p > 55 ? '' : (p > 28 ? ' mid' : ' low'); }
  function updateHud() {
    var st = G.st; if (!st) return;
    var mySeat = G.seat;
    var p0 = st.hp[mySeat], p1 = st.hp[1 - mySeat];
    el('bowP0Name').textContent = (st.names[mySeat] || 'من') + (mySeat === 0 ? ' (سکوی چپ)' : ' (سکوی راست)');
    el('bowP1Name').textContent = (st.names[1 - mySeat] || 'حریف') + (mySeat === 0 ? ' (سکوی راست)' : ' (سکوی چپ)');
    var hm0 = (st.hpMax && st.hpMax[mySeat]) || 100, hm1 = (st.hpMax && st.hpMax[1 - mySeat]) || 100;
    var f0 = el('bowP0Hp'), f1 = el('bowP1Hp');
    f0.style.width = Math.round(p0 / hm0 * 100) + '%'; f1.style.width = Math.round(p1 / hm1 * 100) + '%';
    f0.className = 'bow-hp-fill' + hpClass(p0 / hm0 * 100); f1.className = 'bow-hp-fill' + hpClass(p1 / hm1 * 100);
    el('bowP0HpTxt').textContent = fa(p0); el('bowP1HpTxt').textContent = fa(p1);
    var w = st.wind || 0;
    var wsvg = el('bowWind').querySelector('svg');
    wsvg.style.transform = w < 0 ? 'rotate(180deg)' : 'none';
    el('bowWindTxt').textContent = fa(Math.abs(w));
    var badge = el('bowTurnBadge'), note = el('bowTurnNote');
    var myTurn = st.turn === mySeat && st.phase === 'aim' && st.winner === null;
    if (st.realtime) {
      /* نبرد زنده: به‌جای نوبت، آمادگی کمان نشان داده می‌شود */
      var k = cooldownK(mySeat);
      if (st.winner !== null) {
        badge.textContent = 'پایان نبرد'; badge.className = 'bow-turn-badge';
        note.textContent = 'نبرد تمام شد';
      } else if (st.phase === 'countdown') {
        badge.textContent = 'آماده‌سازی'; badge.className = 'bow-turn-badge';
        note.textContent = 'آماده شو…';
      } else if (k >= 1) {
        badge.textContent = 'کمان آماده'; badge.className = 'bow-turn-badge mine';
        note.textContent = 'نبرد زنده — هر وقت خواستی شلیک کن';
      } else {
        badge.textContent = 'پر کردن کمان ' + fa(Math.round(k * 100)) + '٪';
        badge.className = 'bow-turn-badge';
        note.textContent = 'کمان در حال آماده شدن…';
      }
    }
    else if (st.winner !== null) { badge.textContent = 'پایان نبرد'; badge.className = 'bow-turn-badge'; note.textContent = 'نبرد تمام شد'; }
    else if (st.phase === 'countdown') { badge.textContent = 'آماده‌سازی'; badge.className = 'bow-turn-badge'; }
    else if (st.phase === 'fly') { badge.textContent = 'تیر در پرواز'; badge.className = 'bow-turn-badge'; note.textContent = 'تیر در پرواز…'; }
    else if (myTurn) { badge.textContent = 'نوبت تو'; badge.className = 'bow-turn-badge mine'; note.textContent = 'نوبت شماست — نشانه بگیر و شلیک کن'; }
    else { badge.textContent = 'نوبت حریف'; badge.className = 'bow-turn-badge'; note.textContent = 'نوبت حریف…'; }
    el('bowArenaTag').textContent = 'میدان: ' + BC.ARENAS[st.arena].name + ' · باد ' + (w < 0 ? 'به چپ' : 'به راست') + ' ' + fa(Math.abs(w));
    var ctl = el('bowControls');
    var canNow = st.realtime ? (st.winner === null && st.phase !== 'countdown') : myTurn;
    if (canNow) ctl.classList.remove('disabled'); else ctl.classList.add('disabled');
    var hint = el('bowDragHint');
    if (hint) {
      if (st.winner !== null) hint.textContent = 'نبرد تمام شد';
      else if (st.phase === 'countdown') hint.textContent = 'آماده شو…';
      else if (st.realtime) hint.textContent = cooldownK(mySeat) >= 1
        ? 'بکش و رها کن — هرچه بیشتر بکشی ضربه سنگین‌تر است'
        : 'کمان در حال پر شدن…';
      else if (st.phase === 'fly') hint.textContent = 'تیر در پرواز…';
      else if (myTurn) hint.textContent = 'انگشتت را روی صحنه بکش و رها کن تا تیر شلیک شود';
      else hint.textContent = 'نوبت حریف…';
    }
    /* تراشهٔ تیر و مرحله روی صحنه */
    var lvChip = el('bowLevelChip');
    if (lvChip) {
      if (G.mode === 'single' && G.camp) {
        lvChip.classList.remove('hidden');
        lvChip.querySelector('b').textContent = fa(G.camp.level) + ' / ' + fa(BC.CAMPAIGN_LEVELS);
        lvChip.querySelector('span').textContent = (G.camp.isBoss ? 'نبرد نهایی · ' : 'مرحله ') + BC.ARENAS[st.arena].name;
      } else lvChip.classList.add('hidden');
    }
    syncArrowChip();
    var again = el('bowAgainBtn');
    if (G.mode === 'online' && G.againAsked && st.again && st.again[mySeat] && !st.again[1 - mySeat]) {
      again.disabled = true; again.textContent = 'در انتظار حریف…';
    }
  }
  function canAct() {
    var st = G.st;
    if (!st || st.winner !== null || G.resShown) return false;
    if (st.realtime) {
      /* بلادرنگ: هر وقت کمان خنک شده باشد می‌توانی شلیک کنی */
      return st.phase !== 'countdown' && (st.ready[G.seat] || 0) <= Date.now();
    }
    return st.phase === 'aim' && st.turn === G.seat;
  }

  /* نسبت آماده‌بودن کمان (۰ تا ۱) برای نشانگر خنک‌شدن */
  function cooldownK(seat) {
    var st = G.st;
    if (!st || !st.realtime) return 1;
    var cd = BC.seatMods(st, seat).cd;
    if (seat === 1 && st.aiCd) cd = st.aiCd;
    var left = (st.ready[seat] || 0) - Date.now();
    if (left <= 0) return 1;
    return clampN(1 - left / cd, 0, 1);
  }

  /* ---------- کنترل‌ها ---------- */
  function syncAngleUI() { var n = el('bowAngVal'); if (n) n.textContent = fa(Math.round(G.aim.angle)) + '°'; }
  function syncPowerUI() {
    var n = el('bowPowVal'); if (n) n.textContent = fa(Math.round(G.aim.power * 100)) + '٪';
    var r = el('bowPowerRange'); if (r) r.value = String(Math.round(G.aim.power * 100));
  }
  function nudgeAngle(d) {
    if (!canMove()) return;
    G.aim.angle = clampN(G.aim.angle + d, -58, 86);
    syncAngleUI();
  }
  function bindMove(btn, dir) {
    function down(e) { e.preventDefault(); if (canMove()) { G.input.dir = dir; btn.classList.add('hold'); moveNow(); } }
    function up() { if (G.input.dir === dir) G.input.dir = 0; btn.classList.remove('hold'); }
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
  }
  bindMove(el('bowMoveL'), -1); bindMove(el('bowMoveR'), 1);
  /* در نبرد زنده، جابه‌جایی به خنک‌شدن کمان وابسته نیست */
  function canMove() {
    var st = G.st;
    if (!st || st.winner !== null || G.resShown) return false;
    if (st.realtime) return st.phase !== 'countdown';
    return canAct();
  }
  function moveNow() {
    if (!canMove() || !G.input.dir) return;
    var st = G.st;
    var nx = BC.clampPos(st, G.seat, st.pos[G.seat] + G.input.dir * 2.6);
    st.pos[G.seat] = nx;
    G.posVis[G.seat] = nx;
    if (G.mode === 'online' && Date.now() - G.moveLastPost > 200) {
      G.moveLastPost = Date.now();
      api('/api/bow/move', { room: G.room, phone: G.myPhone, x: nx });
    }
  }
  /* =====================================================================
     کنترل لمسی کمان — «کشیدن و رها کردن»
     - Touch / Pointer / Mouse همه از مسیر Pointer Events می‌روند
     - هر Drag دقیقاً یک تیر: TouchStart → کشیدن → رها کردن → یک پرتابه
     - قدرت از مقدار کشش، زاویه از جهت کشش (معکوس، مثل کشیدن واقعی زه)
     ===================================================================== */
  var cv = el('bowCanvas');
  var AIM_MAX = 190;   /* بیشترین کشش مجاز به پیکسل صفحه — بیشتر از این اثر ندارد */
  var AIM_MIN = 22;    /* زیر این مقدار کشش، تیر شلیک نمی‌شود */
  var AIM_DEAD = 9;    /* حداقل جابه‌جایی تا Drag آغاز شود */

  /* آیا میدان نبرد در حالت چرخیدهٔ ۹۰ درجه است؟ (گوشی عمودی + داخل آرنا) */
  function arenaRot() {
    try {
      var app = el('bowApp');
      if (!app || !app.classList.contains('bow-in-arena')) return false;
      return window.innerHeight > window.innerWidth;
    } catch (e) { return false; }
  }

  /* مختصات لمس روی بوم. وقتی صحنه ۹۰ درجه چرخیده، نقطهٔ صفحه با ماتریس
     معکوس به مختصات محلی بوم تبدیل می‌شود تا نشانه‌گیری دقیق بماند. */
  function canvasPoint(e) {
    if (arenaRot()) {
      return { x: e.clientY, y: window.innerWidth - e.clientX };
    }
    var r = cv.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  /* تبدیل کشش انگشت به زاویه و قدرت */
  function applyDragVec() {
    var a = G.aim2;
    var dxs = a.sx - a.x, dys = a.sy - a.y;      /* معکوس جهت انگشت = جهت پرتاب */
    var dist = Math.sqrt(dxs * dxs + dys * dys);
    a.dist = dist;
    var dirSign = G.seat === 0 ? 1 : -1;
    var ax = dxs * dirSign, ay = -dys;
    if (dist < 10) return;
    /* پاین‌رفتن تیر مجاز است: زاویه از -۵۸ (رو به پاین) تا ۸۶ درجه */
    a.angle = clampN(Math.atan2(ay, ax) * 180 / Math.PI, -58, 86);
    /* نرمال‌سازی کشش به قدرت: از حداقلِ مجاز تا Maximum Power */
    var t = (dist - AIM_MIN) / (AIM_MAX - AIM_MIN);
    a.power = clampN(0.25 + t * 0.75, 0.25, 1);
    /* کشش واقعی: قدرت با زمان نگه‌داشتن کامل می‌شود (سرعت کشش شخصیت) */
    var drawMs2 = (G.st) ? BC.seatMods(G.st, G.seat).drawMs : 900;
    var heldMs = a.t0 ? (Date.now() - a.t0) : drawMs2;
    var rampK = clampN(heldMs / drawMs2, 0, 1);
    a.power = clampN(a.power * (0.55 + 0.45 * rampK), 0.25, 1);
    G.aim.angle = a.angle;
    G.aim.power = a.power;
    syncAngleUI(); syncPowerUI();
    showPowerMeter(a.power);
  }

  function aimDown(e) {
    if (!canMove()) return;
    if (G.aim2.active) return;                   /* یک Drag در هر لحظه */
    if (e.button !== undefined && e.button !== 0) return;
    var p = canvasPoint(e);
    G.aim2.active = true; G.aim2.pid = e.pointerId; G.aim2.t0 = Date.now();
    G.aim2.sx = p.x; G.aim2.sy = p.y; G.aim2.x = p.x; G.aim2.y = p.y;
    G.aim2.dist = 0; G.aim2.fired = false;
    G.aimDrag = true;
    try { cv.setPointerCapture(e.pointerId); } catch (e2) {}
    e.preventDefault();
  }
  function aimMove(e) {
    if (!G.aim2.active || e.pointerId !== G.aim2.pid) return;
    if (!canMove()) { aimCancel(); return; }
    var p = canvasPoint(e);
    G.aim2.x = p.x; G.aim2.y = p.y;
    if (G.aim2.dist < AIM_DEAD && Math.abs(p.x - G.aim2.sx) + Math.abs(p.y - G.aim2.sy) < AIM_DEAD) return;
    applyDragVec();
    if (!G.aim2.drawn) { G.aim2.drawn = true; sfx('draw'); }
    e.preventDefault();
  }
  function aimUp(e) {
    if (!G.aim2.active || e.pointerId !== G.aim2.pid) return;
    var a = G.aim2;
    a.active = false; G.aimDrag = false;
    hidePowerMeter();
    try { cv.releasePointerCapture(e.pointerId); } catch (e2) {}
    if (a.fired) return;                          /* هرگز دو تیر از یک Drag */
    a.fired = true;
    if (a.dist < AIM_MIN) {
      if (a.dist >= AIM_DEAD) toast('کمان را بیشتر بکش…');
      return;                                     /* کشش کم = شلیک ناخواسته نداریم */
    }
    if (!canAct()) {
      if (G.st && G.st.realtime) toast('کمان هنوز آماده نیست…');
      return;
    }
    doShoot(G.aim.angle, G.aim.power);
  }
  function aimCancel() {
    if (!G.aim2.active) return;
    G.aim2.active = false; G.aim2.fired = true;
    G.aimDrag = false;
    hidePowerMeter();
  }
  cv.addEventListener('pointerdown', aimDown);
  cv.addEventListener('pointermove', aimMove);
  cv.addEventListener('pointerup', aimUp);
  cv.addEventListener('pointercancel', aimCancel);
  cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  window.addEventListener('blur', aimCancel);
  document.addEventListener('visibilitychange', function () { if (document.hidden) aimCancel(); });

  /* نوار قدرت زنده، فقط هنگام کشیدن */
  function showPowerMeter(p) {
    var m = el('bowPowerMeter'); if (!m) return;
    m.classList.add('on');
    var f = el('bowPowerFill'); if (f) f.style.width = Math.round(p * 100) + '%';
    var t = el('bowPowerTxt'); if (t) t.textContent = fa(Math.round(p * 100)) + '٪';
    m.className = 'bow-power' + (p > 0.86 ? ' max' : '') + ' on';
  }
  function hidePowerMeter() {
    var m = el('bowPowerMeter'); if (m) m.classList.remove('on');
  }

  /* کیبورد فقط به‌عنوان دسترسی‌پذیری دسکتاپ؛ کنترل اصلی همان Drag است */
  window.addEventListener('keydown', function (e) {
    if (V.classList.contains('hidden')) return;
    if (e.key === 'ArrowUp') { nudgeAngle(1.5); syncAngleUI(); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { nudgeAngle(-1.5); syncAngleUI(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { if (canAct()) { G.input.dir = -1; moveNow(); G.input.dir = 0; } e.preventDefault(); }
    else if (e.key === 'ArrowRight') { if (canAct()) { G.input.dir = 1; moveNow(); G.input.dir = 0; } e.preventDefault(); }
    else if (e.key === ' ' || e.key === 'Enter') { if (canAct()) { doShoot(G.aim.angle, G.aim.power); e.preventDefault(); } }
  });

  /* ---------- شلیک ---------- */
  function doShoot(angle, power) {
    if (!canAct()) return;
    var ang = Math.round(clampN(angle === undefined ? G.aim.angle : angle, 4, 86) * 10) / 10;
    var pw = Math.round(clampN(power === undefined ? G.aim.power : power, 0.25, 1) * 100) / 100;
    var arrow = myArrow();
    if (G.mode === 'single') {
      var r = BC.shoot(G.st, G.seat, ang, pw, Date.now(), arrow.id);
      if (r.error) {
        if (r.error === 'cooldown') toast('کمان هنوز آماده نیست…');
        else toast('الان نمی‌توانی شلیک کنی');
        return;
      }
      beginFlight(r.shot || G.st.lastShot);
      rigFire(G.seat);            /* انیمیشن رها شدن زه */
      sfx('shoot');
      updateHud();
    } else {
      /* arrowId هم فرستاده می‌شود؛ سرور تیر قفل‌شده را نمی‌پذیرد و قدرت را
         خودش از روی تعریف تیر حساب می‌کند، پس تغییر کلاینت قدرت نمی‌سازد. */
      api('/api/bow/shoot', { room: G.room, phone: G.myPhone, angle: ang, power: pw, arrowId: arrow.id }).then(function (pub) {
        if (!pub || pub.error) {
          toast(pub && pub.error === 'turn' ? 'نوبت تو نیست!' : 'شلیک ثبت نشد، دوباره تلاش کن');
          netPoll();
          return;
        }
        rigFire(G.seat);          /* انیمیشن رها شدن زه */
        sfx('shoot');
        applyState(pub);
      });
    }
  }

  /* ---------- حریف هوشمند (تک‌نفره) ---------- */
  function aiUpdate(now) {
    var st = G.st;
    if (!st || G.mode !== 'single' || st.winner !== null) { G.ai.active = false; return; }

    /* ---- حالت بلادرنگ: حریف پیوسته و بدون نوبت تیراندازی می‌کند ---- */
    if (st.realtime) {
      if (st.phase === 'countdown') { G.ai.active = false; return; }
      var readyAt = st.ready[1] || 0;
      /* سرعت کشیدن کمان حریف از آمار شخصیت خودش می‌آید — دقیقاً مثل بازیکن؛
         بین شلیک‌ها فقط همان خنک‌شدنِ مرحله فاصله می‌اندازد. */
      var drawMs = BC.seatMods(st, 1).drawMs;
      if (!G.ai.active) {
        if (now < readyAt - drawMs) return;
        G.ai.active = true;
        G.ai.plan = BC.aiPlan(st, 1, (G.camp && G.camp.diff) ? G.camp.diff : prefs.diff, Math.random);
        G.ai.fromA = G.ai.aimNow.angle;
        G.ai.fromP = G.ai.aimNow.power;
        G.ai.phase = 'aim';
        G.ai.until = Math.max(now + Math.min(drawMs, 220), readyAt);
        /* گاهی جابه‌جا می‌شود تا نبرد زنده به نظر برسد */
        if (Math.random() < 0.35) {
          var shift = (Math.random() < 0.5 ? -1 : 1) * (14 + Math.random() * 30);
          var to = BC.clampPos(st, 1, st.pos[1] + shift);
          G.ai.move = { from: st.pos[1], to: to, t0: now, dur: 420 };
          st.pos[1] = to;
        }
        return;
      }
      /* میان‌یابی نرم زاویه/قدرت تا لحظهٔ شلیک */
      var span = Math.max(1, G.ai.until - (readyAt - drawMs));
      var kk = clampN(1 - (G.ai.until - now) / span, 0, 1);
      var e2 = 1 - Math.pow(1 - kk, 3);
      G.ai.aimNow.angle = G.ai.fromA + (G.ai.plan.angle - G.ai.fromA) * e2;
      G.ai.aimNow.power = G.ai.fromP + (G.ai.plan.power - G.ai.fromP) * e2;
      if (now >= G.ai.until && now >= readyAt) {
        var rr2 = BC.shoot(st, 1, G.ai.plan.angle, G.ai.plan.power, now);
        G.ai.active = false; G.ai.phase = '';
        if (rr2.ok) { rigFire(1); beginFlight(rr2.shot); sfx('shoot'); updateHud(); }
      }
      return;
    }
    if (st.phase !== 'aim' || st.turn !== 1) { G.ai.active = false; return; }
    if (!G.ai.active) {
      G.ai.active = true;
      var d = BC.DIFFS[1];
      for (var i = 0; i < BC.DIFFS.length; i++) if (BC.DIFFS[i].id === prefs.diff) d = BC.DIFFS[i];
      var think = d.thinkMin + Math.random() * (d.thinkMax - d.thinkMin);
      /* گاهی کمی جابه‌جا می‌شود تا طبیعی به نظر برسد */
      if (Math.random() < 0.3) {
        var shift = (Math.random() < 0.5 ? -1 : 1) * (12 + Math.random() * 26);
        var to = BC.clampPos(st, 1, st.pos[1] + shift);
        G.ai.move = { from: st.pos[1], to: to, t0: now, dur: 420 };
        st.pos[1] = to;
      }
      G.ai.phase = 'think';
      G.ai.until = now + think;
      return;
    }
    if (G.ai.phase === 'think' && now >= G.ai.until) {
      G.ai.plan = BC.aiPlan(st, 1, prefs.diff, Math.random);
      G.ai.phase = 'aim';
      G.ai.tA = 0; G.ai.tP = 0;
      G.ai.fromA = G.ai.aimNow.angle; G.ai.fromP = G.ai.aimNow.power;
      G.ai.until = now + 720;
      return;
    }
    if (G.ai.phase === 'aim') {
      var k = clampN((now - (G.ai.until - 720)) / 720, 0, 1);
      var ease = 1 - Math.pow(1 - k, 3);
      G.ai.aimNow.angle = G.ai.fromA + (G.ai.plan.angle - G.ai.fromA) * ease;
      G.ai.aimNow.power = G.ai.fromP + (G.ai.plan.power - G.ai.fromP) * ease;
      G.ai.tA = G.ai.aimNow.angle; G.ai.tP = G.ai.aimNow.power;
      if (k >= 1) {
        var r = BC.shoot(st, 1, G.ai.plan.angle, G.ai.plan.power, Date.now());
        G.ai.active = false; G.ai.phase = '';
        if (r.ok) { rigFire(1); beginFlight(st.lastShot); sfx('shoot'); updateHud(); }
      }
    }
  }

  /* ---------- حلقهٔ اصلی ---------- */
  var ctx = cv.getContext('2d');
  var VIEW = { s: 1, ox: 0, oy: 0, cw: 0, ch: 0, dpr: 1 };
  /* دوربین: جهان ۱۰۰۰×۶۰۰ همیشه کامل دیده می‌شود، ولی تا حد ممکن بزرگ
     نمایش داده می‌شود. پس‌زمینهٔ صحنه خودش کل کادر را پوشش می‌دهد، پس هیچ
     نوار خالی یا حاشیهٔ سفیدی دور میدان بازی نمی‌ماند. در Landscape فضای
     افقی بیشتری می‌گیریم و در Portrait هم شخصیت‌ها بزرگ می‌مانند. */
  function fit() {
    var stg = el('bowStage');
    var r = stg.getBoundingClientRect();
    VIEW.dpr = Math.min(2.5, window.devicePixelRatio || 1);
    /* offsetWidth/Height اندازهٔ واقعی چیدمان است و تحت تأثیر transform
       چرخش قرار نمی‌گیرد؛ برخلاف getBoundingClientRect. */
    VIEW.cw = Math.max(200, stg.offsetWidth || r.width);
    VIEW.ch = Math.max(150, stg.offsetHeight || r.height);
    cv.width = Math.floor(VIEW.cw * VIEW.dpr);
    cv.height = Math.floor(VIEW.ch * VIEW.dpr);
    var base = Math.min(VIEW.cw / BC.W, VIEW.ch / BC.H);
    /* زوم اضافی برای بزرگ‌تر دیده شدن شخصیت‌ها؛ ولی هرگز آن‌قدر نه که سکو یا
       بازیکن از کادر بیرون برود. سقف زوم از روی محدودهٔ واقعی همان میدان
       محاسبه می‌شود، پس در هر مرحله و هر نسبت صفحه درست کار می‌کند. */
    var fitW = BC.W, fitH = BC.H;
    if (G.st && G.st.plats && G.st.plats.length === 2) {
      var pa = G.st.plats[0], pb = G.st.plats[1];
      fitW = Math.max(BC.W * 0.5, (pb.x + pb.w) - pa.x + 230);
      fitH = Math.max(BC.H * 0.5, Math.max(pb.y + 132, pa.y + 132) - Math.min(pa.y - 186, pb.y - 186));
    }
    var cap = Math.max(base, Math.min(VIEW.cw / fitW, VIEW.ch / fitH));
    var asp = VIEW.cw / VIEW.ch;
    /* زوم کمتر از قبل: میدان کوچک‌تر دیده می‌شود تا پس‌زمینهٔ محیط بیشتر
       در کادر بماند و فاصلهٔ سکوها هم چشمگیرتر حس شود. */
    var wantZoom = 1.00;
    if (asp > 2.0) wantZoom = 0.86;
    else if (asp > 1.72) wantZoom = 0.92;
    else if (asp < 0.62) wantZoom = 0.95;
    VIEW.s = Math.min(cap, base * wantZoom);
    VIEW.ox = (VIEW.cw - BC.W * VIEW.s) / 2;
    VIEW.oy = (VIEW.ch - BC.H * VIEW.s) / 2;
    /* پس‌زمینهٔ صحنه هم‌اندازهٔ کادر، برای پوشش کامل */
    if (stg) stg.setAttribute('data-bg', String(G.st ? G.st.arena : 0));
    syncHudHeight();
  }

  /* ارتفاع واقعی نوار HUD را به CSS می‌دهد تا چیپ‌ها هرگز زیر آن نروند */
  function syncHudHeight() {
    try {
      var hud = V && V.querySelector('.bow-hud');
      if (!hud) return;
      var h = hud.offsetHeight || 58;
      var app = el('bowApp');
      if (app) app.style.setProperty('--bow-hud-h', h + 'px');
      if (V) V.style.setProperty('--bow-hud-h', h + 'px');
    } catch (e) {}
  }
  window.addEventListener('resize', function () { fit(); });
  function onRotChange() { fit(); setTimeout(fit, 100); setTimeout(fit, 300); }
  window.addEventListener('orientationchange', onRotChange);
  if (window.screen && window.screen.orientation && window.screen.orientation.addEventListener) {
    window.screen.orientation.addEventListener('change', onRotChange);
  }
  /* چرخش گوشی وسط بازی: فقط اندازه دوباره محاسبه می‌شود، بازی Reset نمی‌شود */
  if (window.screen && window.screen.orientation && window.screen.orientation.addEventListener) {
    window.screen.orientation.addEventListener('change', function () { if (G.loopOn) fit(); });
  }
  window.addEventListener('orientationchange', function () { setTimeout(function () { if (G.loopOn) fit(); }, 120); });

  function startLoop() {
    if (G.loopOn) return;
    G.loopOn = true;
    fit();
    refitSoon();
    G.lastT = Date.now();
    var step = function (ts) {
      if (!G.loopOn) return;
      update(Date.now());
      render(Date.now());
      G.raf = requestAnimationFrame(step);
    };
    G.raf = requestAnimationFrame(step);
  }

  var lastCountN = -1;
  function update(now) {
    var st = G.st;
    if (!st) return;
    /* حرکت روان به سمت موقعیت قطعی (برای خودم در آنلاین، موقعیت محلی مقدم است تا لگ دیده نشود) */
    for (var s2 = 0; s2 < 2; s2++) {
      var target = st.pos[s2];
      if (s2 === G.seat && G.mode === 'single') G.posVis[s2] = target;
      else if (s2 === G.seat && G.mode === 'online') {
        if (Math.abs(G.posVis[s2] - target) > 90) G.posVis[s2] = target;
      } else {
        G.posVis[s2] = G.posVis[s2] + (target - G.posVis[s2]) * 0.22;
      }
    }
    if (G.mode === 'single') {
      BC.tick(st, now);
      aiUpdate(now);
      maybeResult();
      if (!st.realtime && st.phase === 'fly' && st.lastShot && (!G.flight || G.flight.id !== st.lastShot.id)) beginFlight(st.lastShot);
      /* بلادرنگ: حرکت پیوستهٔ بازیکن با نگه‌داشتن دکمه */
      if (st.realtime && G.input.dir && st.winner === null && st.phase !== 'countdown') moveNow();
    } else if (G.mode === 'online' && G.input.dir && canAct()) moveNow();
    /* شمارش معکوس */
    var c = el('bowCount');
    if (st.phase === 'countdown' && st.startAt) {
      var remain = Math.ceil((st.startAt - nowFn()) / 1000);
      var n = remain > 0 ? remain : 0;
      if (n !== lastCountN) {
        lastCountN = n;
        c.classList.remove('hidden');
        c.textContent = n > 0 ? fa(n) : 'نبرد!';
        sfx('count');
        if (n === 0) setTimeout(function () { c.classList.add('hidden'); lastCountN = -1; }, 650);
      }
    } else if (!c.classList.contains('hidden') && st.phase !== 'countdown') {
      c.classList.add('hidden');
      lastCountN = -1;
    }
    updateHud();
  }

  /* ---------- افکت‌ها ---------- */
  function spawnParts(x, y, n, cols, spd, up, life, size) {
    for (var i = 0; i < n; i++) {
      if (G.parts.length > 90) G.parts.shift();
      var a = Math.random() * Math.PI * 2;
      var v = spd * (0.35 + Math.random() * 0.9);
      G.parts.push({
        x: x, y: y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v - (up || 0),
        g: 260 + Math.random() * 160,
        life: life * (0.6 + Math.random() * 0.7), t: 0,
        col: cols[Math.floor(Math.random() * cols.length)],
        size: size * (0.6 + Math.random() * 0.8),
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 8
      });
    }
  }
  function bloodFx(x, y, dmg) {
    spawnParts(x, y, 9, ['#c22225', '#e5484d', '#8f181b'], 130, 60, 0.55, 3.2);
    G.rings.push({ x: x, y: y, t: 0, life: 0.4, col: 'rgba(255,90,70,' });
    G.popups.push({ x: x, y: y - 26, t: 0, life: 1, txt: '-' + fa(dmg), col: '#ff6b5e' });
    G.shake = Math.min(11, 4 + dmg * 0.22);
  }
  function dustFx(x, y, arena) {
    var cols = ['#d8c9a8', '#b8a688', '#cbb98f'];
    if (arena === 3) cols = ['#6a7aa8', '#8a96c0', '#525e88'];
    if (arena === 2) cols = ['#c9b8a0', '#a89878', '#e0d2b8'];
    spawnParts(x, y, 8, cols, 90, 30, 0.5, 3.4);
    G.rings.push({ x: x, y: y, t: 0, life: 0.35, col: 'rgba(230,220,190,' });
    G.shake = Math.max(G.shake, 3);
  }
  function winFx() {
    spawnParts(BC.W / 2, 120, 46, ['#ffd45a', '#ff9d3c', '#fff3c4', '#ffb35c'], 210, 140, 1.4, 3.6);
  }

  /* ---------- رندر ---------- */
  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  /* پس‌زمینه: همیشه کل کادر را به‌صورت Cover پر می‌کند (بدون کشیدگی و بدون
     نوار خالی). در Portrait و Landscape مرکز تصویر حفظ می‌شود. */
  function drawBgImg(c) {
    var img = arenaImg[G.st ? G.st.arena : 0];
    if (!img || !img.complete || !img.naturalWidth) {
      var g0 = c.createLinearGradient(0, 0, 0, VIEW.ch);
      g0.addColorStop(0, '#243450'); g0.addColorStop(1, '#120a05');
      c.fillStyle = g0; c.fillRect(0, 0, VIEW.cw, VIEW.ch);
      return;
    }
    var sc = Math.max(VIEW.cw / img.naturalWidth, VIEW.ch / img.naturalHeight);
    var dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
    c.drawImage(img, (VIEW.cw - dw) / 2, (VIEW.ch - dh) / 2, dw, dh);
  }
  function drawPlatform(c, p, ar, rng, seat) {
    /* سایهٔ معلق بودن */
    c.save();
    c.globalAlpha = 0.28;
    c.fillStyle = '#000';
    c.beginPath();
    c.ellipse(p.x + p.w / 2, p.y + p.h + 30, p.w * 0.42, 9, 0, 0, 6.29);
    c.fill();
    c.restore();
    /* بدنهٔ سکو — بزرگ‌تر از قبل. سطح قابل راه رفتن همان p.x تا p.x+p.w
       است و دقیقاً با رویهٔ چمنی یکی است، پس برخورد خراب نمی‌شود. */
    var ledge = 23;
    c.fillStyle = ar.plat;
    rr(c, p.x - ledge, p.y, p.w + ledge * 2, p.h + 26, 12); c.fill();
    c.fillStyle = ar.platEdge;
    rr(c, p.x - ledge + 6, p.y + p.h + 14, p.w + ledge * 2 - 12, 14, 7); c.fill();
    c.globalAlpha = 0.55; c.fillStyle = ar.platEdge;
    rr(c, p.x - ledge + 2, p.y + p.h + 2, p.w + ledge * 2 - 4, 8, 4); c.fill();
    c.globalAlpha = 1;
    /* روی چمنی/سنگی: دقیقاً هم‌اندازهٔ سطح واقعی ایستادن */
    c.fillStyle = ar.platTop;
    rr(c, p.x - 4, p.y - 4, p.w + 8, 12, 6); c.fill();
    /* تزئین قطعی: بوته‌ها و ریشه‌های آویزان */
    var tufts = 2 + Math.floor(rng() * 3);
    c.fillStyle = ar.platTop;
    for (var i = 0; i < tufts; i++) {
      var tx = p.x + 8 + rng() * (p.w - 16);
      c.beginPath(); c.arc(tx, p.y - 5, 3 + rng() * 2.6, 0, 6.29); c.fill();
    }
    c.strokeStyle = 'rgba(30,20,10,.55)';
    c.lineWidth = 2;
    var vines = 1 + Math.floor(rng() * 2);
    for (var v = 0; v < vines; v++) {
      var vx = p.x + 10 + rng() * (p.w - 20);
      var vl = 14 + rng() * 26;
      c.beginPath();
      c.moveTo(vx, p.y + p.h + 12);
      c.quadraticCurveTo(vx + 4 + rng() * 6 - 3, p.y + p.h + 12 + vl / 2, vx + (rng() * 8 - 4), p.y + p.h + 12 + vl);
      c.stroke();
    }
  }
  function drawWindDots(c, dt) {
    var st = G.st; if (!st) return;
    var ar = BC.ARENAS[st.arena];
    var wind = st.wind || 0;
    if (G.windDots.length < 14) {
      for (var i = 0; i < 14; i++) G.windDots.push({ x: Math.random() * BC.W, y: Math.random() * BC.H, ph: Math.random() * 6.28, sp: 0.5 + Math.random(), sz: 1.6 + Math.random() * 2.4 });
    }
    for (var k = 0; k < G.windDots.length; k++) {
      var d = G.windDots[k];
      d.x += (wind * 0.035 + d.sp * 6 * (wind >= 0 ? 1 : -1)) * dt;
      d.y += Math.sin(d.ph + Date.now() / 900) * 0.12;
      if (d.x > BC.W + 20) d.x = -20;
      if (d.x < -20) d.x = BC.W + 20;
      c.save();
      var alpha = ar.particle === 'firefly' ? (0.35 + Math.sin(d.ph + Date.now() / 240) * 0.3) : 0.3;
      c.globalAlpha = Math.max(0.05, alpha);
      c.fillStyle = ar.particle === 'firefly' ? '#cfeel' : 'rgba(255,250,235,1)';
      if (ar.particle === 'firefly') {
        c.shadowColor = '#aaffcc'; c.shadowBlur = 8;
        c.fillStyle = '#bdffc8';
      }
      c.beginPath();
      c.arc(d.x, d.y, d.sz, 0, 6.29);
      c.fill();
      c.restore();
    }
  }
  /* راهنمای نشانه‌گیری: مسیر قوسی واقعی (همان فرمول فیزیک تیر) + حلقهٔ قدرت.
     هنگام Drag پررنگ‌تر و کامل‌تر نمایش داده می‌شود. */
  function drawAimGuide(c, dragging) {
    var st = G.st;
    if (!st) return;
    if (!dragging && !canAct()) return;
    if (!dragging && st.phase !== 'aim') return;
    var dirSign = G.seat === 0 ? 1 : -1;
    var hp0 = BC.handPoint(st, G.seat);
    var x0 = hp0.x;
    var y0 = hp0.y;
    var arrow = myArrow();
    var sp = (BC.SPEED_MIN + G.aim.power * BC.SPEED_RANGE) * BC.arrowSpeedMult(arrow.id) * BC.seatMods(st, G.seat).pow;
    var rad = G.aim.angle * Math.PI / 180;
    var vx = Math.cos(rad) * sp * dirSign, vy = -Math.sin(rad) * sp;
    var shot = { x0: x0, y0: y0, vx: vx, vy: vy, wind: st.wind };
    var n = dragging ? 16 : 8;
    var step = dragging ? 0.062 : 0.075;
    c.save();
    for (var i = 1; i <= n; i++) {
      var p2 = BC.arrowAt(shot, i * step);
      if (p2.y > BC.H || p2.x < -20 || p2.x > BC.W + 20) break;
      c.globalAlpha = dragging ? (0.92 - i * 0.048) : (0.62 - i * 0.055);
      c.fillStyle = dragging ? arrow.fletch : '#fff';
      c.beginPath();
      c.arc(p2.x, p2.y, Math.max(1.6, (dragging ? 4.6 : 3.4) - i * 0.2), 0, 6.29);
      c.fill();
    }
    /* حلقهٔ قدرت دور جای کمان */
    if (dragging) {
      var R0 = 30;
      c.globalAlpha = 0.28;
      c.strokeStyle = '#fff';
      c.lineWidth = 5;
      c.beginPath(); c.arc(x0, y0, R0, 0, 6.29); c.stroke();
      c.globalAlpha = 0.95;
      c.strokeStyle = G.aim.power > 0.86 ? '#ffcf5c' : arrow.fletch;
      c.lineWidth = 5;
      c.beginPath(); c.arc(x0, y0, R0, -1.5708, -1.5708 + 6.2832 * G.aim.power); c.stroke();
      c.globalAlpha = 1;
      c.font = '800 17px Vazirmatn, Tahoma, sans-serif';
      c.textAlign = 'center';
      c.lineWidth = 4; c.strokeStyle = 'rgba(20,8,2,.85)';
      var lbl = fa(Math.round(G.aim.power * 100)) + '٪';
      c.strokeText(lbl, x0, y0 - R0 - 12);
      c.fillStyle = '#ffe3bd';
      c.fillText(lbl, x0, y0 - R0 - 12);
    }
    c.restore();
  }
  /* =====================================================================
     ریگ انیمیشن دست و کمان — الگوبرداری‌شده از «فرار روباه»
     ---------------------------------------------------------------------
     در «فرار روباه» حرکت پاها اینگونه ساخته می‌شود:
       ۱) یک ماشین حالت (run / jump / slide / …) حالت فعلی را تعیین می‌کند
       ۲) یک انباشتگر زمان (P.animT += dt) مستقل از نرخ فریم جلو می‌رود
       ۳) شمارهٔ فریم از روی animT * fps گرفته می‌شود
       ۴) lerp(a, b, t) مقادیر را نرم می‌کند تا پرش نداشته باشد
     همان چهار اصل را اینجا برای دست‌ها و کمان به کار می‌بریم، با این
     تفاوت که به‌جای فریم‌های اسپرایت، زاویه و جابه‌جایی مفاصل را
     درون‌یابی می‌کنیم (اسکلت‌بندی) — چون کمان باید آزادانه بچرخد.

     حالت‌ها:  idle → raise → draw → hold → release → recover → idle
  ================================================================== */
  var ARIG = {
    idle:    { fps: 1.6, bob: 2.6 },
    raise:   { dur: 260 },
    draw:    { dur: 0 },     /* طول کشش را انگشت کاربر تعیین می‌کند */
    release: { dur: 300 },
    recover: { dur: 340 }
  };
  /* یک ریگ برای هر صندلی */
  var rigs = [mkRig(), mkRig()];
  function mkRig() {
    return {
      st: 'idle', animT: 0, stT: 0, last: 0,
      /* مقادیر نمایش‌داده‌شده (نرم‌شده) */
      angle: 52, power: 0, pull: 0, rise: 0, recoil: 0,
      /* مقصدها */
      tAngle: 52, tPower: 0, tPull: 0, tRise: 0,
      shotAt: 0
    };
  }
  function rigSet(r, st, now) {
    if (r.st === st) return;
    r.st = st; r.stT = now;
  }
  /* نرم‌کنندهٔ مستقل از نرخ فریم (همان منطق lerp فرار روباه) */
  function damp(cur, target, dt, rate) {
    var k = 1 - Math.exp(-rate * dt);
    return cur + (target - cur) * k;
  }
  /* پیشروی ریگ یک بازیکن */
  function rigStep(r, seatIdx, now) {
    var dt = r.last ? Math.min(0.05, (now - r.last) / 1000) : 0.016;
    r.last = now;
    r.animT += dt;
    var st = G.st;
    if (!st) return;

    var drawing = false, aimA = 52, aimP = 0;
    if (seatIdx === G.seat) {
      /* بازیکن محلی: مستقیم از انگشت روی صفحه */
      drawing = !!(G.aim2 && G.aim2.active) && canAct();
      aimA = G.aim.angle;
      aimP = drawing ? G.aim.power : 0;
    } else if (G.mode === 'single' && seatIdx === 1) {
      /* حریف هوشمند: هنگام نشانه‌گیری */
      drawing = !!(G.ai.active && G.ai.phase === 'aim');
      aimA = G.ai.aimNow.angle;
      aimP = drawing ? G.ai.aimNow.power : 0;
    } else {
      /* حریف آنلاین: از روی وضعیت شبکه (بدون پرش) */
      var na = G.netAim && G.netAim[seatIdx];
      if (na) { drawing = !!na.drawing; aimA = na.angle; aimP = na.power; }
    }

    /* --- ماشین حالت --- */
    var age = now - r.stT;
    if (r.st === 'release') {
      if (age >= ARIG.release.dur) rigSet(r, 'recover', now);
    } else if (r.st === 'recover') {
      if (age >= ARIG.recover.dur) rigSet(r, 'idle', now);
    } else if (drawing) {
      if (r.st === 'idle') rigSet(r, 'raise', now);
      else if (r.st === 'raise' && age >= ARIG.raise.dur) rigSet(r, 'draw', now);
    } else if (r.st === 'raise' || r.st === 'draw') {
      /* رها شد بدون شلیک (یا شلیک انجام شد) */
      rigSet(r, r.pull > 0.15 ? 'release' : 'idle', now);
    }

    /* --- مقصدها بر پایهٔ حالت --- */
    if (r.st === 'idle') {
      r.tPull = 0; r.tRise = 0; r.tPower = 0;
      /* تنفس آرام: نوسان ملایم زاویه (حالت زنده، نه بی‌جان) */
      r.tAngle = 50 + Math.sin(r.animT * ARIG.idle.fps) * 3.2
                    + Math.sin(r.animT * 0.73 + seatIdx) * 1.4;
    } else if (r.st === 'raise') {
      var k = clampN(age / ARIG.raise.dur, 0, 1);
      var e = 1 - Math.pow(1 - k, 3);
      r.tAngle = aimA; r.tRise = e; r.tPull = aimP * 0.35 * e; r.tPower = aimP;
    } else if (r.st === 'draw') {
      r.tAngle = aimA; r.tRise = 1; r.tPull = aimP; r.tPower = aimP;
    } else if (r.st === 'release') {
      /* پس‌زدن کمان و بازگشت سریع زه */
      var kr = clampN(age / ARIG.release.dur, 0, 1);
      r.tPull = 0; r.tRise = 1 - kr * 0.45; r.tPower = 0;
      r.tAngle = aimA;
    } else if (r.st === 'recover') {
      var kc = clampN(age / ARIG.recover.dur, 0, 1);
      r.tPull = 0; r.tRise = (1 - kc) * 0.55; r.tPower = 0;
      r.tAngle = r.tAngle + (50 - r.tAngle) * kc;
    }

    /* --- نرم‌سازی (بدون پرش، مستقل از FPS) --- */
    var fast = r.st === 'release' ? 26 : 14;
    r.angle  = damp(r.angle,  r.tAngle, dt, r.st === 'draw' ? 22 : 10);
    r.pull   = damp(r.pull,   r.tPull,  dt, fast);
    r.rise   = damp(r.rise,   r.tRise,  dt, 12);
    r.power  = damp(r.power,  r.tPower, dt, 16);
    /* ضربهٔ پس‌زدن هنگام شلیک */
    var since = now - r.shotAt;
    r.recoil = since < 260 ? Math.sin((1 - since / 260) * Math.PI) * (1 - since / 260) : 0;
  }
  /* هنگام شلیک صدا زده می‌شود تا انیمیشن رهاشدن اجرا شود */
  function rigFire(seatIdx) {
    var r = rigs[seatIdx]; if (!r) return;
    r.shotAt = Date.now();
    rigSet(r, 'release', r.shotAt);
    r.pull = r.tPull = 0;
  }

  
  /* =====================================================================
     رسم یکپارچه شخصیت روباه (Unified Complete Fox Archer Artwork)
     - بدون تکه‌تکه بودن یا اندام‌های شناور در DOM
     - کف پاها دقیقاً مماس با سطح بالای Platform (st.plats[seatIdx].y)
     - انیمیشن‌های تنفس (Idle)، کشیدن (Aim / Pull)، پس‌زدن (Shoot / Recoil)
       و دریافت آسیب (Hit / Damage Flinch + Red Flash) مستقیماً روی اسپریت
     ===================================================================== */
  /* =====================================================================
     کمان واقعی — تصویر اختصاصی هر شخصیت، داخل دستِ او.
     گرفتگاه کمان دقیقاً روی مشِ دست جلو (اندازه‌گیری‌شده از خود Asset)
     قرار دارد، همراه زاویهٔ نشانه‌گیری می‌چرخد، زه هنگام کشیدن خم می‌شود
     و تیر هنگام رها شدن از همان نقطه خارج می‌شود که موتور شلیک می‌کند.
     ===================================================================== */
  function drawBowOnChar(c, seatIdx, cId, rig, drawW) {
    var st = G.st;
    var art = BC.CHAR_ART[cId];
    var bs = bowStyleFor(cId);
    var img = bowImg[bs.img];
    if (!img || !img.complete || !img.naturalWidth) return;
    var bh = bs.h;
    var bw = bh * (img.naturalWidth / img.naturalHeight);
    var gripX = (art.handX - art.feetX) * drawW;
    var gripY = -art.handY * BC.ART_H;
    c.save();
    c.translate(gripX, gripY);
    c.rotate(-rig.angle * Math.PI / 180);
    var gx = -bs.gripCx * bw;
    var gy = -0.5 * bh;
    c.drawImage(img, gx, gy, bw, bh);
    var tTx = (bs.tipTopX - bs.gripCx) * bw;
    var tBx = (bs.tipBotX - bs.gripCx) * bw;
    var tTy = -0.5 * bh + 2;
    var tBy = 0.5 * bh - 2;
    var pull = rig.pull * bs.pullPx;
    var nx = -pull, ny = 0;
    c.strokeStyle = bs.string;
    c.lineWidth = 2;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(tTx, tTy);
    c.quadraticCurveTo(nx, ny, tBx, tBy);
    c.stroke();
    if (rig.pull > 0.06 && st && st.winner === null) {
      var curArrowId = (st.arrows ? st.arrows[seatIdx] : (seatIdx === G.seat ? prefs.arrowId : 1));
      var flArrow = BC.arrowById(curArrowId || 1);
      c.save();
      c.translate(nx + 4, 0);
      renderFlightProjectile(c, flArrow, false);
      if (rig.pull > 0.55) {
        c.globalAlpha = Math.min(1, (rig.pull - 0.55) * 1.6);
        var grad = c.createRadialGradient(20, 0, 1, 20, 0, 13);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, flArrow.color);
        grad.addColorStop(1, 'rgba(255,170,51,0)');
        c.fillStyle = grad;
        c.beginPath();
        c.arc(20, 0, 13, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }
    c.restore();
  }

  function drawPlayer(c, seatIdx, now) {
    var st = G.st;
    if (!st || !c) return;
    var p = st.plats[seatIdx];
    if (!p) return;

    var cId = 0;
    if (st.chars && st.chars[seatIdx] !== undefined) {
      cId = Math.abs(st.chars[seatIdx]) % BC.CHARACTERS.length;
    } else {
      cId = seatIdx % BC.CHARACTERS.length;
    }

    var img = foxImg[cId];
    if (!img || !img.complete || !img.naturalWidth) return;

    var rig = rigs[seatIdx];
    try { rigStep(rig, seatIdx, now); } catch(e) {}

    var px = (G.posVis && G.posVis[seatIdx] !== undefined) ? G.posVis[seatIdx] : st.pos[seatIdx];
    var py = p.y;
    var facing = (seatIdx === 0) ? 1 : -1;

    var art = BC.CHAR_ART[cId];
    var drawH = BC.ART_H;
    var drawW = art.w * drawH;
    var ax = art.feetX * drawW;

    c.save();
    c.globalAlpha = 0.35;
    c.fillStyle = '#000';
    c.beginPath();
    c.ellipse(px, py + 1, 30, 6, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();

    c.save();
    c.translate(px, py);
    c.scale(facing, 1);

    var breath = Math.sin(rig.animT * 2.8 + seatIdx * 1.5);
    var sway = Math.sin(rig.animT * 1.8 + seatIdx) * 0.015;
    var scaleY = 1.0 + breath * 0.015;
    var scaleX = 1.0 - breath * 0.008;
    var dx = 0, dy = 0, rot = sway;

    if (G.input && G.input.dir && canMove() && seatIdx === G.seat) {
      var walkStep = Math.sin(rig.animT * 14);
      dy -= Math.abs(walkStep) * 4;
      rot += walkStep * 0.03;
    }

    if (rig.pull > 0.02 || rig.st === 'draw' || rig.st === 'raise') {
      var angDiff = (rig.angle - 48) * (Math.PI / 180);
      rot -= angDiff * 0.16;
      dx -= rig.pull * 6;
      scaleX += rig.pull * 0.02;
      scaleY -= rig.pull * 0.02;
    }

    if (rig.recoil > 0.01) {
      var impulse = Math.sin(rig.recoil * Math.PI);
      dx += impulse * 9;
      rot += impulse * 0.06;
    }

    var hitAge = (now - (rig.hitAt || 0)) / 1000;
    var isHit = hitAge < 0.38;
    if (isHit) {
      var hitK = 1 - hitAge / 0.38;
      dx -= hitK * 15;
      rot -= hitK * 0.12;
      dy += Math.sin(hitAge * 35) * 3;
    }

    if (st.winner !== null) {
      if (st.winner === seatIdx) {
        var vJump = Math.abs(Math.sin(rig.animT * 6)) * 18;
        dy -= vJump;
        rot = Math.sin(rig.animT * 6) * 0.05;
      } else {
        scaleY = 0.84;
        scaleX = 1.06;
        rot = -0.14;
        dy = 0;
      }
    }

    c.translate(dx, dy);
    c.rotate(rot);
    c.scale(scaleX, scaleY);

    /* اسپرایت کامل و یکپارچهٔ شخصیت — کف پا دقیقاً روی سطح سکو */
    c.drawImage(img, -ax, -drawH, drawW, drawH);

    /* کمان واقعی در دست (بعد از بدن، قبل از افکت‌ها) */
    drawBowOnChar(c, seatIdx, cId, rig, drawW);

    if (isHit) {
      c.save();
      c.globalAlpha = Math.min(0.4, (1 - hitAge / 0.38) * 0.55);
      var _hr = Math.max(ax, drawH) * 0.72;
      var _hg = c.createRadialGradient(0, 0, 4, 0, 0, _hr);
      _hg.addColorStop(0, 'rgba(255,64,54,.85)');
      _hg.addColorStop(0.55, 'rgba(220,40,40,.35)');
      _hg.addColorStop(1, 'rgba(220,40,40,0)');
      c.fillStyle = _hg;
      c.beginPath();
      c.arc(0, 0, _hr, 0, 6.29);
      c.fill();
      c.restore();
    }

    c.restore();
  }

  function drawFlight(c, now) {
    var st = G.st;
    if (!st) return;
    /* بلادرنگ: چند تیر هم‌زمان در هوا هستند */
    if (st.realtime) {
      var live = st.shotsLive || [];
      for (var li = 0; li < live.length; li++) drawOneShot(c, now, live[li], true);
      return;
    }
    if (!st.lastShot) return;
    drawOneShot(c, now, st.lastShot, false);
  }

  /* رسم یک تیر مشخص. rt=true یعنی زمان از t0 خودِ تیر گرفته می‌شود. */
  function drawOneShot(c, now, shotArg, rt) {
    var st = G.st;
    var shot = shotArg;
    var flArrow = BC.arrowById(shot.arrow || (st.arrows ? st.arrows[shot.seat] : 1));
    var active, t;
    if (rt) {
      active = true;
      t = (now - shot.t0) / 1000;
    } else {
      active = G.flight && G.flight.id === shot.id;
      t = active ? (now - G.flight.start) / 1000 : shot.res.t + 1;
    }
    t = Math.max(0, t);
    var res = shot.res;
    var drawT = Math.min(t, res.t);
    var pos = BC.arrowAt(shot, drawT);
    /* دنبالهٔ تیر */
    if (t < res.t) {
      var tp = BC.arrowAt(shot, Math.max(0, drawT - 0.09));
      c.save();
      c.globalAlpha = 0.35;
      c.strokeStyle = '#ffe9c4';
      c.lineWidth = 2;
      c.beginPath(); c.moveTo(tp.x, tp.y); c.lineTo(pos.x, pos.y); c.stroke();
      c.restore();
    }
    /* خود تیر */
    if (t < res.t + 0.45) {
      var vx = shot.vx + shot.wind * drawT, vy = shot.vy + BC.GRAV * drawT;
      var ang = Math.atan2(vy, vx);
      c.save();
      c.translate(pos.x, pos.y);
      c.rotate(ang);
      if (t >= res.t) c.globalAlpha = Math.max(0, 1 - (t - res.t) / 0.45);
      renderFlightProjectile(c, flArrow, t < res.t);
      c.restore();
    }
    /* افکت لحظهٔ برخورد (یک بار برای هر تیر) */
    if (t >= res.t && active && (rt || !G.flight.done)) {
      if (!rt) G.flight.done = true;
      if (!G.fxDone[shot.id]) {
        G.fxDone[shot.id] = true;
        if (res.type === 'hit') {
          bloodFx(res.x, res.y, res.dmg);
          /* تصویر خرابهٔ خون در نقطهٔ دقیق اصابت تیر */
          (G.splats = G.splats || []).push({ x: res.x, y: res.y, t: 0, life: 1.15, s: 34 + Math.min(46, res.dmg * 1.6), rot: (Math.random() - 0.5) * 0.9 });
          G.hitFlash = { seat: res.seat, t: now };
          if (rigs[res.seat]) { rigs[res.seat].hitAt = now; rigs[res.seat].hitDmg = res.dmg; }
          if (res.seat === G.seat) toast('تیر به خودت برگشت!');
          else toast(PART_FA(res.part) + ' · ' + fa(res.dmg) + '- جان');
          sfx((res.part === 'head' || res.part === 'body') ? (res.part === 'head' ? 'head' : 'thud') : 'thud');
        } else if (res.type === 'platform' || res.type === 'ground') {
          dustFx(res.x, res.y, st.arena);
          sfx('thud');
        }
      }
    }
  }

  function renderFlightProjectile(c, flArrow, flying) {
    c.strokeStyle = flArrow.color;
    c.lineWidth = (flArrow.id === 2 || flArrow.id === 6) ? 3.4 : 3;
    c.beginPath(); c.moveTo(-22, 0); c.lineTo(14, 0); c.stroke();
    if (flArrow.id === 3) {
      c.strokeStyle = '#38bdf8'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-16, 0); c.lineTo(10, 0); c.stroke();
    } else if (flArrow.id === 4) {
      c.strokeStyle = '#f97316'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(-16, 0); c.lineTo(10, 0); c.stroke();
    } else if (flArrow.id === 5) {
      c.strokeStyle = '#ffffff'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-16, 0); c.lineTo(10, 0); c.stroke();
    } else if (flArrow.id === 6) {
      c.strokeStyle = '#facc15'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(-16, 0); c.lineTo(10, 0); c.stroke();
    }
    if (flArrow.id === 1) {
      c.fillStyle = '#78716c';
      c.beginPath(); c.moveTo(20, 0); c.lineTo(12, -3.2); c.lineTo(12, 3.2); c.closePath(); c.fill();
    } else if (flArrow.id === 2) {
      c.fillStyle = '#64748b';
      c.beginPath(); c.moveTo(22, 0); c.lineTo(11, -4.2); c.lineTo(13, 0); c.lineTo(11, 4.2); c.closePath(); c.fill();
    } else if (flArrow.id === 3) {
      c.fillStyle = '#0284c7';
      c.beginPath(); c.moveTo(22, 0); c.lineTo(12, -3.6); c.lineTo(12, 3.6); c.closePath(); c.fill();
    } else if (flArrow.id === 4) {
      c.fillStyle = '#ea580c';
      c.beginPath(); c.moveTo(23, 0); c.lineTo(11, -4.5); c.lineTo(14, 0); c.lineTo(11, 4.5); c.closePath(); c.fill();
      c.fillStyle = '#fde047';
      c.beginPath(); c.arc(15, 0, 2.2, 0, Math.PI * 2); c.fill();
    } else if (flArrow.id === 5) {
      c.fillStyle = '#7dd3fc';
      c.beginPath(); c.moveTo(22, 0); c.lineTo(12, -4); c.lineTo(12, 4); c.closePath(); c.fill();
      c.fillStyle = '#ffffff';
      c.beginPath(); c.arc(15, 0, 1.8, 0, Math.PI * 2); c.fill();
    } else {
      c.fillStyle = '#eab308';
      c.beginPath(); c.moveTo(24, 0); c.lineTo(11, -4.5); c.lineTo(14, 0); c.lineTo(11, 4.5); c.closePath(); c.fill();
      c.fillStyle = '#f43f5e';
      c.beginPath(); c.arc(15, 0, 2.5, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = flArrow.fletch;
    c.beginPath(); c.moveTo(-22, 0); c.lineTo(-28, -4.5); c.lineTo(-24, 0); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-22, 0); c.lineTo(-28, 4.5); c.lineTo(-24, 0); c.closePath(); c.fill();
  }

  function drawParts(c, dt) {
    /* خرابه‌های خون: کوچک در نقطهٔ اصابت، مثل پاشیدن خون محو می‌شوند */
    for (var sp3 = (G.splats = G.splats || []).length - 1; sp3 >= 0; sp3--) {
      var sl = G.splats[sp3];
      sl.t += dt;
      if (sl.t >= sl.life) { G.splats.splice(sp3, 1); continue; }
      var skl = sl.t < 0.12 ? sl.t / 0.12 : 1;
      var sal = 1 - Math.max(0, (sl.t - 0.45) / (sl.life - 0.45));
      var ssz = sl.s * (0.55 + 0.45 * skl);
      c.save();
      c.globalAlpha = Math.max(0, sal) * 0.92;
      c.translate(sl.x, sl.y);
      c.rotate(sl.rot);
      if (BLOOD_SPRITE.complete && BLOOD_SPRITE.naturalWidth) c.drawImage(BLOOD_SPRITE, -ssz / 2, -ssz / 2, ssz, ssz);
      c.restore();
    }
    for (var i = G.parts.length - 1; i >= 0; i--) {
      var p = G.parts[i];
      p.t += dt;
      if (p.t >= p.life) { G.parts.splice(i, 1); continue; }
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      var a = 1 - p.t / p.life;
      c.save();
      c.globalAlpha = a * 0.9;
      c.fillStyle = p.col;
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.beginPath();
      c.arc(0, 0, p.size / 2, 0, 6.29);
      c.fill();
      c.restore();
    }
    for (var r2 = G.rings.length - 1; r2 >= 0; r2--) {
      var rg = G.rings[r2];
      rg.t += dt;
      if (rg.t >= rg.life) { G.rings.splice(r2, 1); continue; }
      var k = rg.t / rg.life;
      c.save();
      c.strokeStyle = rg.col + (1 - k) * 0.8 + ')';
      c.lineWidth = 2.4;
      c.beginPath();
      c.arc(rg.x, rg.y, 6 + k * 34, 0, 6.29);
      c.stroke();
      c.restore();
    }
    for (var q = G.popups.length - 1; q >= 0; q--) {
      var pu = G.popups[q];
      pu.t += dt;
      if (pu.t >= pu.life) { G.popups.splice(q, 1); continue; }
      var kk = pu.t / pu.life;
      c.save();
      c.globalAlpha = 1 - kk * kk;
      c.font = '800 22px Vazirmatn, Tahoma, sans-serif';
      c.textAlign = 'center';
      c.lineWidth = 4;
      c.strokeStyle = 'rgba(20,8,2,.8)';
      c.strokeText(pu.txt, pu.x, pu.y - kk * 42);
      c.fillStyle = pu.col;
      c.fillText(pu.txt, pu.x, pu.y - kk * 42);
      c.restore();
    }
  }
  function render(now) {
    var c = ctx;
    var dt = Math.min(0.05, (now - G.lastT) / 1000 || 0.016);
    G.lastT = now;
    c.setTransform(VIEW.dpr, 0, 0, VIEW.dpr, 0, 0);
    c.clearRect(0, 0, VIEW.cw, VIEW.ch);
    if (!G.st) { c.fillStyle = '#120903'; c.fillRect(0, 0, VIEW.cw, VIEW.ch); return; }
    drawBgImg(c);
    /* مه پایین صحنه */
    c.save();
    var grd = c.createLinearGradient(0, VIEW.ch * 0.82, 0, VIEW.ch);
    grd.addColorStop(0, 'rgba(10,6,2,0)');
    grd.addColorStop(1, 'rgba(10,6,2,.55)');
    c.fillStyle = grd;
    c.fillRect(0, VIEW.ch * 0.82, VIEW.cw, VIEW.ch * 0.18);
    c.restore();
    var shx = 0, shy = 0;
    if (G.shake > 0.4) {
      shx = (Math.random() - 0.5) * G.shake;
      shy = (Math.random() - 0.5) * G.shake;
      G.shake *= 0.86;
    } else G.shake = 0;
    c.save();
    c.translate(VIEW.ox + shx * VIEW.s, VIEW.oy + shy * VIEW.s);
    c.scale(VIEW.s, VIEW.s);
    drawWindDots(c, dt);
    var st = G.st;
    var ar = BC.ARENAS[st.arena];
    var rng0 = BC.mulberry32((st.seed ^ 0xB0771) >>> 0);
    var rng1 = BC.mulberry32((st.seed ^ 0xB0772) >>> 0);
    drawPlatform(c, st.plats[0], ar, rng0, 0);
    drawPlatform(c, st.plats[1], ar, rng1, 1);
    drawAimGuide(c, G.aim2.active && G.aim2.dist >= AIM_DEAD);
    /* حریف اول کشیده می‌شود، بعد من */
    var oppSeat = 1 - G.seat;
    drawPlayer(c, oppSeat, now);
    drawPlayer(c, G.seat, now);
    drawFlight(c, now);
    drawParts(c, dt);
    c.restore();
  }

  /* ---------- نتیجه ---------- */
  function reasonText(st) {
    var loserSeat = 1 - st.winner;
    if (st.reason === 'left') return loserSeat === G.seat ? 'تو نبرد را ترک کردی' : 'حریف نبرد را ترک کرد';
    if (st.reason === 'timeout') return loserSeat === G.seat ? 'دو نوبت تو بدون بازی گذشت' : 'حریف دو نوبت بی‌پاسخ ماند';
    if (st.reason === 'self') return loserSeat === G.seat ? 'تیرت به خودت برگشت!' : 'حریف با تیر خودش زمین خورد!';
    return 'جان یکی از کماندارها به صفر رسید';
  }
  function showResult(st) {
    var myWin = st.winner === G.seat;
    el('bowResKicker').textContent = 'پایان نبرد · ' + BC.ARENAS[st.arena].name;
    var t = el('bowResTitle');
    t.textContent = myWin ? 'پیروزی!' : 'شکست';
    t.className = myWin ? 'win' : 'lose';
    el('bowResSub').textContent = reasonText(st);
    var acc0 = st.shots[G.seat] ? Math.round(st.hits[G.seat] / st.shots[G.seat] * 100) : 0;
    var acc1 = st.shots[1 - G.seat] ? Math.round(st.hits[1 - G.seat] / st.shots[1 - G.seat] * 100) : 0;
    el('bowResStats').innerHTML =
      '<div class="bow-rs-l">' + escapeHtml(st.names[G.seat]) + '</div><div class="bow-rs-m">بازیکن</div><div class="bow-rs-r">' + escapeHtml(st.names[1 - G.seat]) + '</div>' +
      '<div class="bow-rs-l">' + fa(st.shots[G.seat]) + '</div><div class="bow-rs-m">تیر شلیک‌شده</div><div class="bow-rs-r">' + fa(st.shots[1 - G.seat]) + '</div>' +
      '<div class="bow-rs-l">' + fa(st.hits[G.seat]) + '</div><div class="bow-rs-m">اصابت به حریف</div><div class="bow-rs-r">' + fa(st.hits[1 - G.seat]) + '</div>' +
      '<div class="bow-rs-l">' + fa(acc0) + '٪</div><div class="bow-rs-m">دقت</div><div class="bow-rs-r">' + fa(acc1) + '٪</div>' +
      '<div class="bow-rs-l">' + fa(st.dmgDone[G.seat]) + '</div><div class="bow-rs-m">آسیب واردشده</div><div class="bow-rs-r">' + fa(st.dmgDone[1 - G.seat]) + '</div>' +
      '<div class="bow-rs-l">' + fa(st.hp[G.seat]) + '</div><div class="bow-rs-m">جان باقی‌مانده</div><div class="bow-rs-r">' + fa(st.hp[1 - G.seat]) + '</div>';
    /* دکمه‌های کمپین در کارت نتیجه */
    /* رنگ مدال بر اساس نتیجه */
    var rcard = V.querySelector('.bow-result-card');
    if (rcard) rcard.classList.toggle('is-lose', !myWin);

    var nxt = el('bowNextLvl');
    var lst = el('bowLevelList');
    var againB = el('bowAgainBtn');
    function setTxt(btn, title, sub) {
      if (!btn) return;
      var b = btn.querySelector('.bow-rbtn-txt b');
      var sm = btn.querySelector('.bow-rbtn-txt small');
      if (b) b.textContent = title;
      if (sm) { if (sub) { sm.textContent = sub; sm.classList.remove('hidden'); } else sm.classList.add('hidden'); }
    }

    if (G.mode === 'single' && G.camp) {
      /* کمپین: مرحله بعد + تلاش دوباره + فهرست مرحله‌ها */
      if (myWin && G.camp.level < BC.CAMPAIGN_LEVELS) {
        nxt.classList.remove('hidden');
        setTxt(nxt, 'مرحله ' + fa(G.camp.level + 1), 'ادامهٔ کمپین');
      } else {
        nxt.classList.add('hidden');
      }
      if (lst) {
        lst.classList.remove('hidden');
        setTxt(lst, G.camp.isBoss ? 'محیط‌ها' : 'مرحله‌ها', '');
      }
      setTxt(againB, myWin ? 'بازی دوباره' : 'تلاش دوباره',
             'مرحله ' + fa(G.camp.level) + ' از نو');
    } else {
      if (nxt) nxt.classList.add('hidden');
      if (lst) lst.classList.add('hidden');
      setTxt(againB, 'بازی مجدد',
             G.mode === 'online' ? 'با همین حریف' : 'یک نبرد تازه');
    }
    if (againB) againB.disabled = false;
    el('bowResult').classList.remove('hidden');
    if (!G.overSoundDone) {
      G.overSoundDone = true;
      if (myWin) { sfx('win'); winFx(); } else sfx('lose');
    }
    updateHud();
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
  }
  el('bowAgainBtn').addEventListener('click', function () {
    sfx('click');
    if (G.mode === 'single') { if (G.camp) startMatch(G.camp.level, prefs.charIdx); return; }
    if (!G.room || !G.myPhone || !G.st) return;
    api('/api/bow/again', { room: G.room, phone: G.myPhone }).then(function (pub) {
      if (!pub || pub.error) { toast('ثبت درخواست بازی مجدد نشد'); return; }
      G.againAsked = true;
      if (pub.matchId !== G.st.matchId) { applyState(pub); }
      else {
        G.st = pub;
        var again = el('bowAgainBtn');
        again.disabled = true;
        var ab = again.querySelector('.bow-rbtn-txt b');
        var as2 = again.querySelector('.bow-rbtn-txt small');
        if (ab) ab.textContent = 'در انتظار حریف…';
        if (as2) as2.textContent = 'درخواست ارسال شد';
      }
    });
  });

  /* =====================================================================
     سامانهٔ انتخاب نوع تیر — «۶ تیر»
     ماژولار: برای افزودن قابلیت به تیرهای ۲ تا ۶ فقط جدول BC.ARROWS را
     گسترش بده (آسیب، سرعت، اثر ویژه، روش باز شدن). اینجا چیزی سخت‌کد نیست.
     ===================================================================== */
  function syncArrowChip() {
    var chip = el('bowArrowChip');
    if (!chip) return;
    var a = myArrow();
    var nm = chip.querySelector('.bow-arrow-chip-name');
    var dot = chip.querySelector('.bow-arrow-chip-dot');
    if (nm) nm.textContent = a.name;
    if (dot) dot.style.background = a.fletch;
  }


  function getArrowSvg(id) {
    if (id === 1) {
      return '<svg viewBox="0 0 54 54" fill="none" aria-hidden="true">' +
        '<circle cx="27" cy="27" r="24" fill="rgba(202,164,106,0.12)" stroke="rgba(202,164,106,0.3)" stroke-width="1.5"/>' +
        '<line x1="12" y1="42" x2="38" y2="16" stroke="#caa46a" stroke-width="3.5" stroke-linecap="round"/>' +
        '<line x1="14" y1="40" x2="36" y2="18" stroke="#8c6436" stroke-width="1.2" stroke-linecap="round"/>' +
        '<polygon points="43,11 33,13 41,21" fill="#78716c" stroke="#57534e" stroke-width="1.2"/>' +
        '<line x1="33" y1="17" x2="37" y2="21" stroke="#d97706" stroke-width="1.5"/>' +
        '<path d="M11 43 L17 42 L13 36 Z" fill="#FF7A00"/>' +
        '<path d="M11 43 L12 37 L18 41 Z" fill="#e86500"/>' +
      '</svg>';
    } else if (id === 2) {
      return '<svg viewBox="0 0 54 54" fill="none" aria-hidden="true">' +
        '<circle cx="27" cy="27" r="24" fill="rgba(159,180,198,0.14)" stroke="rgba(159,180,198,0.35)" stroke-width="1.5"/>' +
        '<line x1="12" y1="42" x2="38" y2="16" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>' +
        '<line x1="14" y1="40" x2="36" y2="18" stroke="#cbd5e1" stroke-width="1.4" stroke-linecap="round"/>' +
        '<path d="M44 10 L32 14 L36 18 L32 22 L44 10 Z" fill="#64748b" stroke="#cbd5e1" stroke-width="1.2"/>' +
        '<path d="M10 44 L18 43 L14 35 Z" fill="#7ea8d8"/>' +
        '<path d="M10 44 L11 36 L19 40 Z" fill="#475569"/>' +
      '</svg>';
    } else if (id === 3) {
      return '<svg viewBox="0 0 54 54" fill="none" aria-hidden="true">' +
        '<circle cx="27" cy="27" r="24" fill="rgba(95,208,255,0.15)" stroke="rgba(95,208,255,0.4)" stroke-width="1.5"/>' +
        '<line x1="12" y1="42" x2="38" y2="16" stroke="#1e293b" stroke-width="4.2" stroke-linecap="round"/>' +
        '<line x1="15" y1="39" x2="35" y2="19" stroke="#38bdf8" stroke-width="1.6" stroke-linecap="round"/>' +
        '<polygon points="45,9 31,14 40,23" fill="#0284c7" stroke="#e0f2fe" stroke-width="1.5"/>' +
        '<circle cx="37" cy="17" r="2" fill="#38bdf8"/>' +
        '<path d="M9 45 L18 43 L13 34 Z" fill="#5fd0ff"/>' +
        '<path d="M9 45 L11 36 L20 41 Z" fill="#0369a1"/>' +
      '</svg>';
    } else if (id === 4) {
      return '<svg viewBox="0 0 54 54" fill="none" aria-hidden="true">' +
        '<circle cx="27" cy="27" r="24" fill="rgba(255,75,43,0.16)" stroke="rgba(255,75,43,0.45)" stroke-width="1.5"/>' +
        '<line x1="12" y1="42" x2="38" y2="16" stroke="#450a0a" stroke-width="4.2" stroke-linecap="round"/>' +
        '<line x1="14" y1="40" x2="36" y2="18" stroke="#f97316" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M46 8 C43 14 37 14 32 15 C35 19 39 20 41 24 C44 20 47 14 46 8 Z" fill="#ea580c" stroke="#fef08a" stroke-width="1.3"/>' +
        '<circle cx="40" cy="14" r="2.5" fill="#fde047"/>' +
        '<path d="M9 45 L19 44 L14 34 Z" fill="#dc2626"/>' +
        '<path d="M9 45 L10 35 L20 40 Z" fill="#f97316"/>' +
      '</svg>';
    } else if (id === 5) {
      return '<svg viewBox="0 0 54 54" fill="none" aria-hidden="true">' +
        '<circle cx="27" cy="27" r="24" fill="rgba(56,189,248,0.16)" stroke="rgba(56,189,248,0.45)" stroke-width="1.5"/>' +
        '<line x1="12" y1="42" x2="38" y2="16" stroke="#bae6fd" stroke-width="4.2" stroke-linecap="round"/>' +
        '<line x1="14" y1="40" x2="36" y2="18" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>' +
        '<polygon points="46,8 33,13 41,21" fill="#7dd3fc" stroke="#ffffff" stroke-width="1.4"/>' +
        '<polygon points="38,12 36,18 42,16" fill="#ffffff" opacity="0.8"/>' +
        '<path d="M9 45 L18 43 L13 34 Z" fill="#38bdf8"/>' +
        '<path d="M9 45 L11 36 L20 41 Z" fill="#e0f2fe"/>' +
      '</svg>';
    } else {
      return '<svg viewBox="0 0 54 54" fill="none" aria-hidden="true">' +
        '<circle cx="27" cy="27" r="24" fill="rgba(244,63,94,0.18)" stroke="rgba(250,204,21,0.5)" stroke-width="1.5"/>' +
        '<line x1="12" y1="42" x2="38" y2="16" stroke="#3b0764" stroke-width="4.2" stroke-linecap="round"/>' +
        '<line x1="14" y1="40" x2="36" y2="18" stroke="#facc15" stroke-width="1.8" stroke-linecap="round"/>' +
        '<path d="M46 8 L32 13 L36 18 L38 23 L46 8 Z" fill="#eab308" stroke="#fef08a" stroke-width="1.3"/>' +
        '<circle cx="39" cy="15" r="3.2" fill="#f43f5e" stroke="#ffe4e6" stroke-width="1"/>' +
        '<path d="M9 45 L19 44 L14 34 Z" fill="#facc15"/>' +
        '<path d="M9 45 L10 35 L20 40 Z" fill="#9333ea"/>' +
      '</svg>';
    }
  }

  function buildArrowCards() {
    var list = el('bowArrowList');
    if (!list) return;
    list.innerHTML = '';
    for (var i = 0; i < BC.ARROWS.length; i++) {
      (function (a) {
        var card = document.createElement('button');
        card.type = 'button';
        var locked = !!a.locked;
        var active = !locked && a.id === myArrow().id;
        card.className = 'bow-arrow-card' + (locked ? ' locked' : '') + (active ? ' active' : '');
        card.setAttribute('data-arrow', String(a.id));
        card.setAttribute('aria-disabled', locked ? 'true' : 'false');
        var power = 0;
        for (var k = 0; k < BC.ARROWS.length; k++) if (BC.ARROWS[k].dmgMult <= a.dmgMult) power++;
        var stars = '';
        for (var s2 = 0; s2 < BC.ARROWS.length; s2++) {
          stars += '<i class="' + (s2 < power ? 'on' : '') + '"></i>';
        }
        card.innerHTML =
          '<span class="bow-arrow-ico" style="--ac:' + a.color + ';--af:' + a.fletch + '">' +
            getArrowSvg(a.id) +
          '</span>' +
          '<span class="bow-arrow-main">' +
            '<b class="bow-arrow-name"></b>' +
            '<span class="bow-arrow-tier"></span>' +
            '<span class="bow-arrow-stars">' + stars + '</span>' +
            '<small class="bow-arrow-desc"></small>' +
          '</span>' +
          '<span class="bow-arrow-state"></span>';
        card.querySelector('.bow-arrow-name').textContent = a.name;
        card.querySelector('.bow-arrow-tier').textContent = a.tier;
        card.querySelector('.bow-arrow-desc').textContent = a.desc;
        var stEl = card.querySelector('.bow-arrow-state');
        if (locked) {
          stEl.className = 'bow-arrow-state lock';
          stEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.6" stroke="currentColor" stroke-width="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>حریف · مرحلهٔ ' + fa(a.unlock.level) + '</span>';
        } else if (active) {
          stEl.className = 'bow-arrow-state on';
          stEl.textContent = 'در دست تو';
        } else {
          stEl.className = 'bow-arrow-state free';
          stEl.textContent = 'آزاد';
        }
        card.addEventListener('click', function () {
          sfx('click');
          if (a.locked) {
            card.classList.remove('nudge');
            void card.offsetWidth;
            card.classList.add('nudge');
            toast(a.name + ' تیر حریف است · از مرحلهٔ ' + fa(a.unlock.level) + ' در کمپین به کار می‌برد');
            return;
          }
          prefs.arrowId = a.id;
          savePrefs();
          if (G.mode === 'single' && G.st && G.st.arrows) G.st.arrows[G.seat] = a.id;
          buildArrowCards();
          syncArrowChip();
          toast(a.name + ' انتخاب شد — فوراً اعمال می‌شود');
        });
        list.appendChild(card);
      })(BC.ARROWS[i]);
    }
  }

  function openArrows() {
    buildArrowCards();
    var o = el('bowArrowOverlay');
    if (o) { o.classList.remove('hidden'); o.setAttribute('aria-hidden', 'false'); }
  }
  function closeArrows() {
    var o = el('bowArrowOverlay');
    if (o) { o.classList.add('hidden'); o.setAttribute('aria-hidden', 'true'); }
  }
  var arrowChipBtn = el('bowArrowChip');
  if (arrowChipBtn) arrowChipBtn.addEventListener('click', function (e) { e.stopPropagation(); sfx('click'); openArrows(); });
  var arrowOptBtn = el('bowArrowOpt');
  if (arrowOptBtn) {
    arrowOptBtn.addEventListener('click', function () { sfx('click'); openArrows(); });
    var on = arrowOptBtn.querySelector('.bow-arrowopt-name');
    if (on) on.textContent = myArrow().name;
  }
  var arrowClose = el('bowArrowClose');
  if (arrowClose) arrowClose.addEventListener('click', function () { sfx('click'); closeArrows(); });
  var arrowOv = el('bowArrowOverlay');
  if (arrowOv) {
    /* لمس بیرون پنل = بستن پنل */
    arrowOv.addEventListener('pointerdown', function (e) {
      if (e.target === arrowOv || e.target.classList.contains('bow-sheet-back')) closeArrows();
    });
  }
  syncArrowChip();

  /* =====================================================================
     کمپین تک‌نفره — هر محیط ۴۰ مرحلهٔ مستقل با پیشرفت جداگانه
     ===================================================================== */
  function openCamp() {
    buildCampCards();
    showPanel(P_CAMP);
    sfx('click');
  }
  function buildCampCards() {
    var row = el('bowCampRow');
    if (!row) return;
    row.innerHTML = '';
    for (var a = 0; a < BC.ARENAS.length; a++) {
      (function (ar) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'bow-camp-card';
        b.innerHTML = '<img loading="lazy" decoding="async" alt=""/><span class="bow-camp-body">' +
          '<b></b>' +
          '<span class="bow-camp-count"></span>' +
          '<span class="bow-camp-bar"><i></i></span>' +
          '<small></small>' +
          '</span>';
        b.firstChild.src = BOWIMG['arena' + ar];
        var un = campUnlocked(ar), won = campWon(ar);
        b.querySelector('b').textContent = BC.ARENAS[ar].name;
        b.querySelector('.bow-camp-count').textContent = fa(un) + ' / ' + fa(BC.CAMPAIGN_LEVELS);
        b.querySelector('.bow-camp-bar i').style.width = Math.round(won / BC.CAMPAIGN_LEVELS * 100) + '%';
        b.querySelector('small').textContent = won >= BC.CAMPAIGN_LEVELS
          ? 'کامل شد · آزاد برای بازی دوباره'
          : (won > 0 ? 'مرحلهٔ باز: ' + fa(un) : 'شروع از مرحلهٔ ۱');
        b.addEventListener('click', function () { sfx('click'); openLevels(ar); });
        row.appendChild(b);
      })(a);
    }
  }
  function openLevels(ar) {
    prefs.arenaIdx = ar;
    savePrefs();
    buildLevelGrid(ar);
    showPanel(P_LEVELS);
    sfx('click');
  }
  function buildLevelGrid(ar) {
    var t = el('bowLevelsTitle');
    if (t) t.textContent = BC.ARENAS[ar].name;
    var sub = el('bowLevelsSub');
    if (sub) sub.textContent = fa(BC.CAMPAIGN_LEVELS) + ' مرحله · باز: ' + fa(campUnlocked(ar)) + ' · برده: ' + fa(campWon(ar));
    var grid = el('bowLevelGrid');
    if (!grid) return;
    grid.innerHTML = '';
    var un = campUnlocked(ar), won = campWon(ar);
    for (var lv = 1; lv <= BC.CAMPAIGN_LEVELS; lv++) {
      (function (n) {
        var b = document.createElement('button');
        b.type = 'button';
        var locked = n > un;
        b.className = 'bow-lvl' + (locked ? ' locked' : '') + (n <= won ? ' won' : '') + (n === BC.CAMPAIGN_LEVELS ? ' boss' : '');
        b.disabled = locked;
        b.setAttribute('data-lvl', String(n));
        b.innerHTML = '<b></b><i></i>';
        b.querySelector('b').textContent = locked ? '' : fa(n);
        var ic = b.querySelector('i');
        if (locked) {
          ic.className = 'lk';
          ic.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10.5" width="14" height="9.5" rx="2.4" stroke="currentColor" stroke-width="2"/><path d="M8.4 10.5V8.2a3.6 3.6 0 0 1 7.2 0v2.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
        } else if (n <= won) {
          ic.className = 'ck';
          ic.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12.5 4.6 4.6L19 7.6" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
        b.addEventListener('click', function () {
          if (locked) { toast('اول مرحلهٔ ' + fa(n - 1) + ' را ببر'); return; }
          sfx('click');
          openCharSelect({ mode: 'campaign', arena: ar, level: n });
        });
        grid.appendChild(b);
      })(lv);
    }
  }
  var campEntry = el('bowCampBtn');
  if (campEntry) campEntry.addEventListener('click', function () { openCamp(); });
  var campBack = el('bowCampBack');
  if (campBack) campBack.addEventListener('click', function () { sfx('click'); showPanel(P_START); });
  var lvlBack = el('bowLevelsBack');
  if (lvlBack) lvlBack.addEventListener('click', function () { sfx('click'); openCamp(); });
  var nextLvl = el('bowNextLvl');
  if (nextLvl) nextLvl.addEventListener('click', function () {
    sfx('click');
    if (G.camp && G.camp.level < BC.CAMPAIGN_LEVELS) startMatch(G.camp.level + 1, prefs.charIdx);
  });
  var lvlList = el('bowLevelList');
  if (lvlList) lvlList.addEventListener('click', function () {
    sfx('click');
    hidePowerMeter();
    var r = el('bowResult'); if (r) r.classList.add('hidden');
    G.resShown = false;
    if (G.camp) openLevels(G.camp.arena); else showPanel(P_START);
  });

  /* ---------- ورود به بازی ---------- */
  /* قلاب تست/اشکال‌زدایی — فقط برای خودآزمایی؛ روی منطق بازی اثر ندارد */
  window.__FOX_BOW__ = {
    G: G, prefs: prefs, camp: camp, BC: BC, VIEW: VIEW,
    rigs: rigs, BOWSTYLE: BOWSTYLE, bowImg: bowImg,
    aimConst: { AIM_MAX: AIM_MAX, AIM_MIN: AIM_MIN, AIM_DEAD: AIM_DEAD },
    startMatch: startMatch, openCamp: openCamp,
    openLevels: openLevels, openArrows: openArrows, closeArrows: closeArrows,
    openCharSelect: openCharSelect, buildCharSelectUI: buildCharSelectUI,
    charLocked: charLocked, charUnlockInfo: charUnlockInfo, totalCampWins: totalCampWins, charSelCtx: charSelCtx,
    buildLevelGrid: buildLevelGrid, doShoot: doShoot, canAct: canAct,
    myArrow: myArrow, campUnlocked: campUnlocked, campWon: campWon, campWin: campWin,
    showPanel: showPanel, panels: { START: P_START, QUEUE: P_QUEUE, GAME: P_GAME, CAMP: P_CAMP, LEVELS: P_LEVELS, CHAR: P_CHAR }
  };

  window.openBow = function () {
    enterView();
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(function () {});
      }
    } catch (e) {}
    showPanel(P_START);
    G.mode = null; G.st = null; G.room = '';
    stopTimers();
    /* اگر نبرد آنلاین نیمه‌کاره داریم، ادامه بده */
    var phone = myPhone();
    if (phone) {
      api('/api/bow/active?me=' + encodeURIComponent(phone)).then(function (r) {
        if (!r || !r.room) return;
        if (!V.classList.contains('hidden') && (G.mode === null)) {
          G.mode = 'online'; G.myPhone = phone;
          onMatched(r.room, r.seat || 0, r.partner || 'حریف');
          toast('بازگشت به نبرد ناتمام!');
        }
      });
    }
  };

})();
/* ===== MENSH ROBAH ENGINE (shared client/server) ===== */
var MENSH = (function () {
  var TRACK = [[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,5],[6,4],[6,3],[6,2],[6,1],[6,0],[7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[9,6],[10,6],[11,6],[12,6],[13,6],[14,6],[14,7],[14,8],[13,8],[12,8],[11,8],[10,8],[9,8],[8,9],[8,10],[8,11],[8,12],[8,13],[8,14],[7,14],[6,14],[6,13],[6,12],[6,11],[6,10],[6,9],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8],[0,7]];
  var START = [0, 12, 25, 38];
  var SAFE = {}; [0, 12, 25, 38, 8, 21, 34, 47].forEach(function (i) { SAFE[i] = 1; });
  var HOME = [
    [[1,7],[2,7],[3,7],[4,7],[5,7]],
    [[7,1],[7,2],[7,3],[7,4],[7,5]],
    [[13,7],[12,7],[11,7],[10,7],[9,7]],
    [[7,13],[7,12],[7,11],[7,10],[7,9]]
  ];
  var COLORS = ['orange', 'green', 'blue', 'yellow'];
  var SEAT = [0, 2]; // 2-player seats: orange vs blue (diagonal)
  // 2-player mode uses seats 0 (orange) and 2 (blue)
  function trackIdx(p, s) { return (START[SEAT[p]] + s) % 52; }
  function cellOf(p, s) {
    if (s < 0) return null;
    if (s <= 51) return TRACK[trackIdx(p, s)];
    if (s <= 56) return HOME[SEAT[p]][s - 52];
    return [7, 7];
  }
  function newState(names) {
    return {
      v: 1, names: names || ['بازیکن ۱', 'بازیکن ۲'], phones: null,
      pos: [[-1, -1, -1, -1], [-1, -1, -1, -1]],
      turn: 0, dice: 0, phase: 'roll', winner: null, anim: null, abandoned: null, ts: Date.now()
    };
  }
  function movesFor(st, p, d) {
    var out = [];
    for (var i = 0; i < 4; i++) {
      var s = st.pos[p][i];
      if (s === -1) { if (d === 6) out.push(i); continue; }
      if (s === 57) continue;
      if (s + d <= 57) out.push(i);
    }
    return out;
  }
  function doRoll(st, p, d) {
    if (st.winner !== null || st.phase !== 'roll' || st.turn !== p) return null;
    st.dice = d;
    st.phase = movesFor(st, p, d).length ? 'move' : 'nomove';
    st.ts = Date.now();
    return st;
  }
  function doMove(st, p, i) {
    if (st.winner !== null || st.phase !== 'move' || st.turn !== p) return null;
    if (movesFor(st, p, st.dice).indexOf(i) < 0) return null;
    var from = st.pos[p][i];
    var ns = from === -1 ? 0 : from + st.dice;
    st.pos[p][i] = ns;
    var cap = [];
    if (ns <= 51) {
      var ti = trackIdx(p, ns);
      if (!SAFE[ti]) {
        for (var op = 0; op < 2; op++) {
          if (op === p) continue;
          for (var j = 0; j < 4; j++) {
            var os = st.pos[op][j];
            if (os > -1 && os <= 51 && trackIdx(op, os) === ti) { st.pos[op][j] = -1; cap.push([op, j]); }
          }
        }
      }
    }
    var extra = (st.dice === 6) || cap.length > 0 || ns === 57;
    st.anim = { p: p, i: i, from: from, to: ns, cap: cap, ts: Date.now() };
    var done = st.pos[p].every(function (s) { return s === 57; });
    if (done) { st.winner = p; st.phase = 'end'; }
    else {
      if (!extra) st.turn = 1 - p;
      st.phase = 'roll'; st.dice = 0;
    }
    st.ts = Date.now();
    return st;
  }
  function doPass(st, p) {
    if (st.winner !== null || st.phase !== 'nomove' || st.turn !== p) return null;
    st.turn = 1 - p; st.phase = 'roll'; st.dice = 0; st.ts = Date.now();
    return st;
  }
  /* ---- AI ---- */
  function aiPick(st, diff) {
    var p = st.turn, d = st.dice;
    var mv = movesFor(st, p, d);
    if (!mv.length) return -1;
    if (mv.length === 1) return mv[0];
    var noise = diff === 'easy' ? 140 : diff === 'hard' ? 4 : 30;
    var best = null;
    mv.forEach(function (i) {
      var sc = scoreMove(st, p, i) + Math.random() * noise;
      if (best === null || sc > best.sc) best = { i: i, sc: sc };
    });
    return best.i;
  }
  function scoreMove(st, p, i) {
    var d = st.dice, s = st.pos[p][i];
    var ns = s === -1 ? 0 : s + d;
    var sc = 0;
    if (s === -1) sc += 48;
    if (ns === 57) sc += 95;
    else if (ns >= 52) sc += 35 + ns;
    if (ns <= 51) {
      var ti = trackIdx(p, ns);
      for (var op = 0; op < 2; op++) {
        if (op === p) continue;
        for (var j = 0; j < 4; j++) {
          var os = st.pos[op][j];
          if (os > -1 && os <= 51 && trackIdx(op, os) === ti && !SAFE[ti]) sc += 85;
        }
      }
      if (SAFE[ti]) sc += 26;
      else {
        for (var op2 = 0; op2 < 2; op2++) {
          if (op2 === p) continue;
          for (var k = 0; k < 4; k++) {
            var os2 = st.pos[op2][k];
            if (os2 > -1 && os2 <= 51) {
              var dist = (ti - trackIdx(op2, os2) + 52) % 52;
              if (dist >= 1 && dist <= 6) sc -= 38;
            }
          }
        }
      }
      sc += 8 + ns * 0.7;
    }
    return sc;
  }
  return { TRACK: TRACK, START: START, SAFE: SAFE, HOME: HOME, COLORS: COLORS, SEAT: SEAT, trackIdx: trackIdx, cellOf: cellOf, newState: newState, movesFor: movesFor, doRoll: doRoll, doMove: doMove, doPass: doPass, aiPick: aiPick };
})();

/* ===== MENSH ROBAH CLIENT ===== */
(function () {
  var M_CX = [91, 151, 211, 278, 334, 395, 451, 512, 572, 627, 688, 743, 812, 872, 932].map(function (v) { return v / 1024; });
  var M_CY = [91, 149, 209, 276, 334, 391, 448, 507, 568, 628, 687, 742, 808, 868, 925].map(function (v) { return v / 1024; });
  var M_SOCK = {"orange": [[134, 133], [224, 133], [134, 220], [224, 220]], "green": [[798, 133], [888, 133], [798, 221], [888, 221]], "blue": [[801, 799], [892, 799], [801, 887], [892, 887]], "yellow": [[131, 799], [222, 799], [131, 887], [222, 887]]};
  Object.keys(M_SOCK).forEach(function (k) { M_SOCK[k] = M_SOCK[k].map(function (pt) { return [pt[0] / 1024, pt[1] / 1024]; }); });
  var PIMG = { orange: '/static/154b2acf61433949f1424a19821857ccfb3cc8687babff6b25fc8e6175283346.webp', green: '/static/616e607696fae23d63dae38ba7c15c2f8cdf754486b54edcbc6c40e5af4bcdf6.webp', blue: '/static/d46aa5deff1fab8d68f3cb8074da3268778d8e9c35b45d6a3988d488ecc96246.webp', yellow: '/static/38a38c1dffa39fe748e1761a146882451ab476debc6cf99c4ea6332340ddfe1f.webp' };
  var COL_OF = [MENSH.COLORS[MENSH.SEAT[0]], MENSH.COLORS[MENSH.SEAT[1]]];
  var FIN_OFF = [[-0.045, -0.045], [0.045, -0.045], [-0.045, 0.045], [0.045, 0.045]];

  var viewMensh = document.getElementById('viewMensh');
  var boardBox = document.getElementById('mnBoardBox');
  var piecesBox = document.getElementById('mnPieces');
  var diceBtn = document.getElementById('mnDice');
  var statusEl = document.getElementById('mnStatus');

  var G = { els: {}, mode: null };           // {mode:'single'|'online', st, diff, me, room, token, poll, els:{}, lastAnim, busy}
  function fa(n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }

  /* ---------- sound ---------- */
  var SND = (function () {
    var ctx = null;
    function ac() { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; }
    function tone(f0, f1, dur, type, vol) {
      if (localStorage.getItem('fox_mensh_mute') === '1') return;
      var c = ac(); if (!c) return;
      var o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t);
      if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(vol || 0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
    }
    return {
      dice: function () { tone(220, 90, 0.14, 'square', 0.08); setTimeout(function () { tone(300, 120, 0.12, 'square', 0.07); }, 90); },
      step: function () { tone(680, 680, 0.05, 'triangle', 0.07); },
      enter: function () { tone(300, 620, 0.16, 'sine', 0.12); },
      cap: function () { tone(500, 110, 0.3, 'sawtooth', 0.12); },
      home: function () { [523, 659, 784].forEach(function (f, i) { setTimeout(function () { tone(f, f, 0.14, 'sine', 0.12); }, i * 90); }); },
      win: function () { [523, 659, 784, 1046, 784, 1046].forEach(function (f, i) { setTimeout(function () { tone(f, f, 0.16, 'triangle', 0.13); }, i * 120); }); },
      click: function () { tone(900, 700, 0.05, 'triangle', 0.06); }
    };
  })();

  /* ---------- geometry ---------- */
  function seatCol(p) { return COL_OF[p]; }
  function baseXY(p, i) { return M_SOCK[seatCol(p)][i]; }
  function cellXY(p, s) {
    var c = MENSH.cellOf(p, s);
    return [M_CX[c[0]], M_CY[c[1]]];
  }
  function targetXY(st, p, i) {
    var s = st.pos[p][i];
    if (s === -1) return baseXY(p, i);
    if (s === 57) return [M_CX[7] + FIN_OFF[i][0] * (p ? 1 : 1), M_CY[7] + FIN_OFF[i][1]];
    return cellXY(p, s);
  }

  /* ---------- pieces DOM ---------- */
  function buildPieces() {
    piecesBox.innerHTML = '';
    G.els = {};
    for (var p = 0; p < 2; p++) for (var i = 0; i < 4; i++) {
      var d = document.createElement('div');
      d.className = 'mn-piece'; d.dataset.p = p; d.dataset.i = i;
      var im = document.createElement('img'); im.src = PIMG[seatCol(p)]; im.alt = '';
      d.appendChild(im); piecesBox.appendChild(d); G.els[p + '_' + i] = d;
    }
  }
  function placeAll(st, instant) {
    var groups = {};
    var pts = [];
    for (var p = 0; p < 2; p++) for (var i = 0; i < 4; i++) {
      var xy = targetXY(st, p, i);
      var key = Math.round(xy[0] * 300) + '_' + Math.round(xy[1] * 300);
      (groups[key] = groups[key] || []).push(pts.length);
      pts.push({ p: p, i: i, x: xy[0], y: xy[1], home: st.pos[p][i] === 57 });
    }
    Object.keys(groups).forEach(function (k) {
      var arr = groups[k];
      if (arr.length > 1) arr.forEach(function (idx, n) {
        var off = [[-0.016, -0.014], [0.016, -0.014], [-0.016, 0.014], [0.016, 0.014]][n % 4];
        pts[idx].x += off[0]; pts[idx].y += off[1];
      });
    });
    pts.forEach(function (pt) {
      var el = G.els[pt.p + '_' + pt.i];
      el.classList.toggle('home', pt.home);
      if (instant) { el.style.transition = 'none'; }
      el.style.left = (pt.x * 100) + '%'; el.style.top = (pt.y * 100) + '%';
      if (instant) { void el.offsetWidth; el.style.transition = ''; }
    });
  }

  /* ---------- effects ---------- */
  function fx(x, y, color, big) {
    var d = document.createElement('div');
    d.className = 'mn-fx';
    var s = big ? 60 : 34;
    d.style.cssText = 'left:' + (x * 100) + '%;top:' + (y * 100) + '%;width:' + s + 'px;height:' + s + 'px;transform:translate(-50%,-50%);background:radial-gradient(circle,' + color + ' 0%,transparent 70%);';
    boardBox.appendChild(d);
    d.animate([{ opacity: 1, transform: 'translate(-50%,-50%) scale(.4)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.7)' }], { duration: 500 }).onfinish = function () { d.remove(); };
  }
  function shake() { boardBox.classList.remove('mn-shake'); void boardBox.offsetWidth; boardBox.classList.add('mn-shake'); }

  /* ---------- movement animation ---------- */
  function animateMove(st, done) {
    var a = st.anim;
    var el = G.els[a.p + '_' + a.i];
    var path = [];
    if (a.from === -1) { path.push(baseXY(a.p, a.i)); for (var s = 0; s <= a.to; s++) path.push(cellXY(a.p, s)); }
    else { for (var s2 = a.from; s2 <= a.to; s2++) path.push(s2 === 57 ? [M_CX[7] + FIN_OFF[a.i][0], M_CY[7] + FIN_OFF[a.i][1]] : cellXY(a.p, s2)); }
    if (G.busy) { placeAll(st); if (done) done(); return; }
    G.busy = true;
    var keys = path.map(function (pt) { return { left: (pt[0] * 100) + '%', top: (pt[1] * 100) + '%' }; });
    var dur = Math.max(260, (keys.length - 1) * 130);
    var anim = el.animate(keys, { duration: dur, easing: 'cubic-bezier(.3,.7,.4,1)' });
    var stepT = setInterval(function () { SND.step(); }, 130);
    anim.onfinish = function () {
      clearInterval(stepT);
      el.style.left = keys[keys.length - 1].left; el.style.top = keys[keys.length - 1].top;
      if (a.to === 0 && a.from === -1) { var e = cellXY(a.p, 0); fx(e[0], e[1], 'rgba(255,200,80,.8)'); SND.enter(); }
      if (a.to === 57) { fx(M_CX[7], M_CY[7], 'rgba(255,215,90,.9)', true); SND.home(); }
      if (a.cap && a.cap.length) {
        SND.cap(); shake();
        a.cap.forEach(function (c) {
          var ce = G.els[c[0] + '_' + c[1]];
          var to = baseXY(c[0], c[1]);
          fx(targetXY(st, c[0], c[1])[0], targetXY(st, c[0], c[1])[1], 'rgba(255,60,40,.85)', true);
          ce.animate([{ left: ce.style.left, top: ce.style.top }, { left: (to[0] * 100) + '%', top: (to[1] * 100) + '%' }], { duration: 420, easing: 'ease-in' }).onfinish = function () { ce.style.left = (to[0] * 100) + '%'; ce.style.top = (to[1] * 100) + '%'; };
        });
      }
      placeAll(st);
      G.busy = false;
      if (done) done();
    };
  }

  /* ---------- dice ---------- */
  var PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  function face(n) {
    diceBtn.querySelectorAll('.pp').forEach(function (pp) { pp.classList.toggle('on', (PIPS[n] || []).indexOf(+pp.dataset.p) >= 0); });
  }
  function rollAnim(final, cb) {
    SND.dice();
    diceBtn.classList.remove('rolling'); void diceBtn.offsetWidth; diceBtn.classList.add('rolling');
    var t = setInterval(function () { face(1 + Math.floor(Math.random() * 6)); }, 75);
    setTimeout(function () { clearInterval(t); face(final); diceBtn.classList.remove('rolling'); if (cb) cb(); }, 680);
  }

  /* ---------- UI sync ---------- */
  function homeCount(st, p) { return st.pos[p].filter(function (s) { return s === 57; }).length; }
  function mySeat() { if (!G) return 0; if (G.mode === 'single') return 0; return G.st.phones && G.st.phones[0] === G.me ? 0 : 1; }
  function updUI(st) {
    var ms = mySeat();
    document.getElementById('mnName0').textContent = st.names[0];
    document.getElementById('mnName1').textContent = st.names[1];
    document.getElementById('mnHome0').textContent = fa(homeCount(st, 0)) + '/۴';
    document.getElementById('mnHome1').textContent = fa(homeCount(st, 1)) + '/۴';
    document.getElementById('mnChip0').classList.toggle('turn', st.turn === 0 && st.winner === null);
    document.getElementById('mnChip1').classList.toggle('turn', st.turn === 1 && st.winner === null);
    var my = st.turn === ms;
    var canRoll = st.winner === null && st.phase === 'roll' && my;
    diceBtn.disabled = !canRoll;
    var canMoves = (st.winner === null && st.phase === 'move' && my) ? MENSH.movesFor(st, st.turn, st.dice) : [];
    for (var p = 0; p < 2; p++) for (var i = 0; i < 4; i++) {
      var el = G.els[p + '_' + i];
      el.classList.toggle('can', p === st.turn && canMoves.indexOf(i) >= 0);
      el.classList.remove('sel');
    }
    if (st.winner !== null) { statusEl.textContent = '🏁 بازی تمام شد'; }
    else if (st.phase === 'roll') statusEl.textContent = my ? 'نوبت توست — تاس بینداز 🎲' : 'نوبت ' + st.names[st.turn] + '…';
    else if (st.phase === 'move') statusEl.textContent = my ? 'تاس ' + fa(st.dice) + ' — یک مهره‌ی درخشان را انتخاب کن' : st.names[st.turn] + ' در حال حرکت…';
    else statusEl.textContent = my ? 'حرکتی نداری…' : 'حرکتی ندارد…';
  }
  function checkWin(st) {
    if (st.winner === null) return false;
    if (G && G._winShown) return true;
    if (G) G._winShown = true;
    var ms = mySeat();
    try {
      if (st.winner === ms && window.FoxGameRewardService) {
        FoxGameRewardService.claimReward({ gameCode: 'fox_board', mode: (G && G.mode === 'online') ? 'online' : 'solo', result: 'win' });
      }
    } catch(e) {}
    document.getElementById('mnWinTitle').textContent = st.winner === ms ? '🎉 بردی!' : 'باختی!';
    document.getElementById('mnWinText').textContent = 'برنده: ' + st.names[st.winner];
    document.getElementById('mnWinFox').textContent = st.winner === ms ? '🦊' : '🐾';
    // For online 2-player, hide again per user request - only return
    if (G.mode === 'online') {
      document.getElementById('mnAgain').style.display = 'none';
      var rb=document.getElementById('mnWinBack'); if(rb) { rb.textContent='↩ بازگشت به منو'; rb.style.fontSize='17px'; rb.style.minHeight='56px'; }
    } else {
      document.getElementById('mnAgain').style.display = (G.mode === 'single' || st.winner !== null) ? 'block' : 'none';
    }
    try { hideOnlineAgainButtons(); } catch(e){}
    document.getElementById('mnWin').classList.add('show');
    SND.win();
    if (G.mode === 'single') localStorage.removeItem('fox_mensh');
    return true;
  }
  function checkAbandon(st) {
    if (!st.abandoned || st.winner === null) return false;
    if (G && G._winShown) return true;
    if (G) G._winShown = true;
    document.getElementById('mnWinTitle').textContent = 'حریف خارج شد';
    document.getElementById('mnWinText').textContent = 'برنده: ' + st.names[mySeat()];
    document.getElementById('mnWin').classList.add('show');
    return true;
  }

  /* ---------- single mode ---------- */
  function saveSingle() { if (G && G.mode === 'single' && G.st.winner === null) localStorage.setItem('fox_mensh', JSON.stringify({ st: G.st, diff: G.diff })); }
  function startSingle(diff, savedSt) {
    stopPoll();
    if (G && G.aiT) clearInterval(G.aiT);
    G = { mode: 'single', diff: diff, token: (G && G.token) || 0, els: {}, _winShown: false };
    G.token++;
    G.st = savedSt || MENSH.newState(['شما', 'روباه هوشمند 🦊']);
    hideOvs(); buildPieces(); placeAll(G.st, true); face(1); updUI(G.st);
    saveSingle();
    G.aiT = setInterval(function () {
      if (!G || G.mode !== 'single' || !G.st || G.st.winner !== null || G.busy || G.aiLock) return;
      var st = G.st;
      if (st.turn !== 1) return;
      if (Date.now() - (G.lastAi || 0) < 1600) return;
      if (st.phase === 'roll') aiStep();
      else if (st.phase === 'move') aiMove();
      else if (st.phase === 'nomove') { G.aiLock = true; MENSH.doPass(st, 1); placeAll(st); G.aiLock = false; G.lastAi = Date.now(); afterSync(); }
    }, 350);
    if (G.st.winner === null) afterSync();
  }
  function afterSync() {
    var st = G.st;
    updUI(st);
    if (checkWin(st)) return;
    if (G.mode === 'single' && st.winner === null && st.turn === 1) setTimeout(aiStep, 800);
    if (G.mode === 'single' && st.winner === null && st.phase === 'nomove' && st.turn === 0) {
      setTimeout(function () { if (G && G.st === st) { MENSH.doPass(st, 0); placeAll(st); saveSingle(); afterSync(); } }, 350);
    }
  }
  function aiStep() {
    if (!G || G.mode !== 'single' || G.st.winner !== null || G.st.turn !== 1 || G.aiLock) return;
    G.aiLock = true; G.lastAi = Date.now();
    var st = G.st, tok = G.token;
    if (st.phase === 'roll') {
      var d = 1 + Math.floor(Math.random() * 6);
      rollAnim(d, function () {
        if (!G || G.token !== tok || G.st !== st) return;
        MENSH.doRoll(st, 1, d);
        if (st.phase === 'nomove') { updUI(st); setTimeout(function () { if (G && G.token === tok && G.st === st) { MENSH.doPass(st, 1); placeAll(st); G.aiLock = false; afterSync(); } else G.aiLock = false; }, 800); return; }
        updUI(st);
        setTimeout(function () { if (G && G.token === tok && G.st === st) aiMove(); else G.aiLock = false; }, 500);
      });
    } else aiMove();
  }
  function aiMove() {
    var st = G.st, tok = G.token;
    G.aiLock = true; G.lastAi = Date.now();
    var pick = MENSH.aiPick(st, G.diff);
    if (pick < 0) { MENSH.doPass(st, 1); G.aiLock = false; afterSync(); return; }
    MENSH.doMove(st, 1, pick);
    animateMove(st, function () { G.aiLock = false; if (G && G.token === tok) { saveSingle(); afterSync(); } });
    updUI(st);
  }

  /* ---------- online mode ---------- */
  function api(path, body) {
    return fetch(path, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {}).then(function (r) { return r.json(); });
  }
  function stopPoll() { if (G && G.poll) { clearInterval(G.poll); G.poll = null; } if (G && G.waitT) { clearInterval(G.waitT); G.waitT = null; } }
  function startOnline(room) {
    stopPoll();
    var me = G.me;
    G.mode = 'online'; G.room = room; G.lastAnim = 0; G.passTs = 0; G.diceTs = 0; G._winShown = false;
    hideOvs();
    api('/api/mensh/state?room=' + encodeURIComponent(room)).then(function (st) {
      if (!st || !st.pos) return;
      G.st = st;
      if (!G.els || !G.els['0_0']) buildPieces();
      placeAll(st, true); face(st.dice || 1); updUI(st); checkWin(st); checkAbandon(st);
      G.poll = setInterval(poll, 350);
    });
  }
  function poll() {
    if (!G || G.mode !== 'online') return;
    api('/api/mensh/state?room=' + encodeURIComponent(G.room)).then(function (st) {
      if (!G || G.mode !== 'online' || !st || !st.pos) return;
      var prev = G.st;
      G.st = st;
      if (st.dice && (st.phase === 'move' || st.phase === 'nomove') && st.ts !== G.diceTs) { G.diceTs = st.ts; rollAnim(st.dice); }
      if (st.anim && st.anim.ts !== G.lastAnim) {
        G.lastAnim = st.anim.ts;
        animateMove(st, function () { placeAll(st); });
      } else {
        placeAll(st);
      }
      if (st.dice) face(st.dice);
      updUI(st);
      if (checkWin(st) || checkAbandon(st)) return;
      var ms = mySeat();
      if (st.phase === 'nomove' && st.turn === ms && st.ts !== G.passTs) {
        G.passTs = st.ts;
        setTimeout(function () { if (G && G.mode === 'online' && G.st && G.st.ts === st.ts) api('/api/mensh/pass', { room: G.room, phone: G.me }); }, 800);
      }
    }).catch(function () {});
  }
  var faceLast = 1;
  function joinOnline() {
    var cu = null; try { cu = JSON.parse(localStorage.getItem('fox_user')); } catch (e) {}
    if (!cu || !cu.phone) return;
    G = G || { els: {}, mode: null };
    enterGameView();
    G.me = cu.phone; G.myName = cu.name || 'بازیکن';
    document.getElementById('mnMenu').classList.remove('show');
    document.getElementById('mnWait').classList.add('show');
    api('/api/mensh/join', { phone: G.me, name: G.myName }).then(function (r) {
      if (r.room) { startOnline(r.room); return; }
      G.waitT = setInterval(function () {
        api('/api/mensh/wait?me=' + encodeURIComponent(G.me)).then(function (w) {
          if (w.room) { clearInterval(G.waitT); G.waitT = null; startOnline(w.room); }
        }).catch(function () {});
      }, 350);
    });
  }

  /* ---------- overlays / flow ---------- */
  function hideOvs() { ['mnMenu', 'mnWait', 'mnWin'].forEach(function (id) { document.getElementById(id).classList.remove('show'); }); }
  function openMenu() {
    hideOvs();
    var saved = null; try { saved = JSON.parse(localStorage.getItem('fox_mensh') || 'null'); } catch (e) {}
    document.getElementById('mnResume').style.display = (saved && saved.st && saved.st.winner === null) ? 'block' : 'none';
    G = G || { els: {}, mode: null };
    var ro = document.getElementById('mnResumeOnline'); ro.style.display = 'none';
    var cu2 = null; try { cu2 = JSON.parse(localStorage.getItem('fox_user')); } catch (e) {}
    if (cu2 && cu2.phone) api('/api/mensh/active?me=' + encodeURIComponent(cu2.phone)).then(function (r) {
      if (r.room) { ro.style.display = 'block'; ro.dataset.room = r.room; G.me = cu2.phone; G.myName = cu2.name || 'بازیکن'; }
    }).catch(function () {});
    document.getElementById('mnMenu').classList.add('show');
  }
  function enterGameView() {
    G = G || { els: {}, mode: null };
    hide(viewChat); hide(viewHome); hide(viewSettings); hide(viewDMList); hide(viewDM); hide(viewFun);
    show(viewMensh); bottomNav.classList.add('show');
    if (!G.els || !G.els['0_0']) buildPieces();
    if (G.st) { placeAll(G.st, true); updUI(G.st); }
  }
  window.openMensh = function () {
    if (G && G.mode === 'online' && G.room && G.st && G.st.winner === null && !G.st.abandoned) { enterGameView(); if (!G.poll) G.poll = setInterval(poll, 350); }
    else if (G && G.mode === 'single' && G.st && G.st.winner === null) { enterGameView(); }
    else openMenu();
  };
  function leaveMensh() {
    if (G && G.mode === 'online' && G.room && G.st && G.st.winner === null && !G.st.abandoned) {
      api('/api/mensh/leave', { room: G.room, phone: G.me });
    }
    if (G && G.waitT) { api('/api/mensh/cancel', { phone: G.me }); }
    stopPoll();
    if (G && G.aiT) { clearInterval(G.aiT); G.aiT = null; }
    hideOvs(); hide(viewMensh); goFun();
  }

  /* ---------- events ---------- */
  document.getElementById('mnBack').addEventListener('click', leaveMensh);
  document.getElementById('mnMenuBack').addEventListener('click', leaveMensh);
  document.getElementById('mnWinBack').addEventListener('click', function () { document.getElementById('mnWin').classList.remove('show'); leaveMensh(); });
  document.getElementById('mnSound').addEventListener('click', function () {
    var m = localStorage.getItem('fox_mensh_mute') === '1';
    localStorage.setItem('fox_mensh_mute', m ? '0' : '1');
    this.textContent = m ? '🔊' : '🔇';
    if (m) SND.click();
  });
  document.getElementById('mnSound').textContent = localStorage.getItem('fox_mensh_mute') === '1' ? '🔇' : '🔊';
  document.getElementById('mnRestart').addEventListener('click', function () {
    if (!G) return;
    if (G.mode === 'single') startSingle(G.diff);
    else if (G.mode === 'online' && G.st && G.st.winner !== null) api('/api/mensh/restart', { room: G.room, phone: G.me });
  });
  document.getElementById('mnDiff').querySelectorAll('button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.getElementById('mnDiff').querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on'); SND.click();
    });
  });
  document.getElementById('mnSingle').addEventListener('click', function () {
    var d = document.querySelector('#mnDiff button.on').dataset.d;
    enterGameView(); startSingle(d);
  });
  document.getElementById('mnResume').addEventListener('click', function () {
    var saved = JSON.parse(localStorage.getItem('fox_mensh'));
    enterGameView(); startSingle(saved.diff || 'normal', saved.st);
  });
  document.getElementById('mnOnline').addEventListener('click', joinOnline);
  document.getElementById('mnResumeOnline').addEventListener('click', function () { if (this.dataset.room) { enterGameView(); startOnline(this.dataset.room); } });
  document.getElementById('mnCancel').addEventListener('click', function () {
    if (G && G.waitT) { clearInterval(G.waitT); G.waitT = null; }
    api('/api/mensh/cancel', { phone: G.me });
    document.getElementById('mnWait').classList.remove('show');
    openMenu();
  });
  document.getElementById('mnAgain').addEventListener('click', function () {
    document.getElementById('mnWin').classList.remove('show');
    if (G.mode === 'single') startSingle(G.diff);
    else api('/api/mensh/restart', { room: G.room, phone: G.me });
  });
  diceBtn.addEventListener('click', function () {
    if (!G || !G.st || diceBtn.disabled) return;
    var st = G.st, ms = mySeat();
    if (G.mode === 'single') {
      if (st.turn !== 0 || st.phase !== 'roll') return;
      var arr = new Uint32Array(1); crypto.getRandomValues(arr);
      var d = 1 + (arr[0] % 6);
      diceBtn.disabled = true;
      rollAnim(d, function () {
        MENSH.doRoll(st, 0, d);
        updUI(st); saveSingle();
        if (st.phase === 'move') SND.click();
        afterSync();
      });
    } else {
      diceBtn.disabled = true;
      api('/api/mensh/roll', { room: G.room, phone: G.me });
    }
  });
  piecesBox.addEventListener('click', function (e) {
    var el = e.target.closest('.mn-piece');
    if (!el || !G || !G.st) return;
    var p = +el.dataset.p, i = +el.dataset.i;
    var st = G.st, ms = mySeat();
    if (st.winner !== null || st.phase !== 'move' || st.turn !== ms || p !== ms) return;
    if (MENSH.movesFor(st, ms, st.dice).indexOf(i) < 0) return;
    SND.click();
    if (G.mode === 'single') {
      MENSH.doMove(st, ms, i);
      el.classList.remove('can');
      animateMove(st, function () { saveSingle(); afterSync(); });
      updUI(st);
    } else {
      api('/api/mensh/move', { room: G.room, phone: G.me, piece: i });
    }
  });
})();



function DOTSE_make() {
  function boxCount(d) { return (d - 1) * (d - 1); }
  function lineCount(d) { return 2 * d * (d - 1); }
  function hIdx(r, c, d) { return r * (d - 1) + c; }
  function vIdx(r, c, d) { return d * (d - 1) + r * d + c; }
  function boxSides(i, d) {
    var w = d - 1, bx = i % w, by = (i / w) | 0;
    return [hIdx(by, bx, d), hIdx(by + 1, bx, d), vIdx(by, bx, d), vIdx(by, bx + 1, d)];
  }
  function lineBoxes(l, d) {
    var w = d - 1, out = [];
    if (l < d * w) {
      var r = (l / w) | 0, c = l % w;
      if (r > 0) out.push((r - 1) * w + c);
      if (r < w) out.push(r * w + c);
    } else {
      var l2 = l - d * w, r2 = (l2 / d) | 0, c2 = l2 % d;
      if (c2 > 0) out.push(r2 * w + (c2 - 1));
      if (c2 < w) out.push(r2 * w + c2);
    }
    return out;
  }
  function ensureLineOwners(st) {
    if (!st) return;
    var n = lineCount(st.d);
    if (!st.lineOwners || st.lineOwners.length !== n) {
      var lo = [];
      for (var i=0;i<n;i++) {
        if (st.lines && st.lines[i] === -1) lo.push(-1);
        else if (st.lines && (st.lines[i] === 1 || st.lines[i] === 0 && false)) {
          // old format: 1=filled, 0=empty
          if (st.lines[i] === 1) {
            // try to infer from last or default to 0
            if (st.last && st.last.line === i) lo.push(st.last.by);
            else lo.push(0);
          } else lo.push(-1);
        } else if (st.lines && (st.lines[i] === 0 || st.lines[i] === 1) && typeof st.lines[i] === 'number' && st.lines[i] >=0 && st.lines[i] <=1 && st.v >=2) {
          // new format where lines is owner: -1 empty, 0/1 owner
          // Actually if v>=2 and lines contains 0/1 owner, we should have lineOwners same
          // But to be safe, treat lines as owner if it is 0/1 and lineOwners missing, and convert
          lo.push(-1);
        } else {
          lo.push(-1);
        }
      }
      // If lines is new owner format (contains -1,0,1) and lineOwners missing, migrate
      if (st.lines && st.lines.length===n) {
        var hasNeg = false;
        for (var k=0;k<n;k++) if (st.lines[k]===-1) { hasNeg=true; break; }
        if (hasNeg) {
          // lines is owner format, convert to boolean + owners
          for (var k=0;k<n;k++) {
            var v = st.lines[k];
            if (v===-1) { lo[k]=-1; st.lines[k]=0; }
            else if (v===0 || v===1) { lo[k]=v; st.lines[k]=1; }
            else { lo[k]=-1; st.lines[k]=0; }
          }
        } else {
          // old boolean format, already handled
          for (var k=0;k<n;k++) {
            if (st.lines[k]) {
              if (lo[k]===-1) lo[k]= (st.last && st.last.line===k) ? st.last.by : 0;
            }
          }
        }
      }
      st.lineOwners = lo;
    }
    // Ensure lines is boolean existence (0/1)
    if (st.lines && st.lineOwners) {
      for (var i=0;i<st.lines.length;i++) {
        if (st.lineOwners[i]>=0) st.lines[i]=1;
        else if (st.lineOwners[i]===-1) st.lines[i]=0;
      }
    }
    // Status migration: ensure status/closed fields exist (backward compat)
    if (st && !st.status) {
      if (st.winner !== null || st.abandoned) { st.status = 'FINISHED'; st.closed = true; st.finishedAt = st.finishedAt || st.ts; st.closedAt = st.closedAt || Date.now(); }
      else { st.status = 'ACTIVE'; st.closed = false; }
    }
  }
  function recomputeScores(st) {
    if (!st || !st.boxes) return;
    var s0=0,s1=0;
    for (var i=0;i<st.boxes.length;i++) {
      if (st.boxes[i]===0) s0++;
      else if (st.boxes[i]===1) s1++;
    }
    st.scores = [s0,s1];
  }
  function newState(d, names, phones, turn) {
    var lines = [], lineOwners=[], boxes = [], i;
    for (i = 0; i < lineCount(d); i++) { lines.push(0); lineOwners.push(-1); }
    for (i = 0; i < boxCount(d); i++) boxes.push(-1);
    var now = Date.now();
    return { v: 3, d: d, names: names || ['بازیکن ۱', 'بازیکن ۲'], phones: phones || null,
      lines: lines, lineOwners: lineOwners, boxes: boxes, scores: [0, 0], turn: turn | 0, winner: null,
      abandoned: null, reason: null, last: null, ts: now, turnStart: now, turnTimeout: 30000, moveSeq: 0, history: [], status: 'ACTIVE', closed: false, finishedAt: null, closedAt: null, rematchRoom: null, prevRoom: null };
  }
  function sideCount(st, i) {
    var s = boxSides(i, st.d), n = 0, k;
    for (k = 0; k < 4; k++) n += st.lines[s[k]] ? 1 : 0;
    return n;
  }
  function checkTimeout(st) {
    if (!st || st.winner !== null || st.abandoned) return false;
    ensureLineOwners(st);
    var now = Date.now();
    var limit = st.turnTimeout || 30000;
    var start = st.turnStart || st.ts || now;
    if (now - start > limit) {
      var loser = st.turn;
      // Winner based on boxes, not just opponent - if equal scores, draw
      if (st.scores[0] === st.scores[1]) st.winner = 'draw';
      else st.winner = st.scores[0] > st.scores[1] ? 0 : 1;
      st.abandoned = st.phones ? st.phones[loser] : null;
      st.reason = 'timeout';
      st.status = 'FINISHED';
      st.closed = true;
      st.finishedAt = now;
      st.closedAt = now;
      st.ts = now;
      return true;
    }
    return false;
  }
  function apply(st, p, l) {
    if (!st || st.winner !== null || st.abandoned) return { error: 'ended' };
    ensureLineOwners(st);
    checkTimeout(st);
    if (st.winner !== null) return { error: 'timeout', winner: st.winner };
    if (st.turn !== p) return { error: 'noturn' };
    if (typeof l !== 'number' || (l | 0) !== l || l < 0 || l >= lineCount(st.d)) return { error: 'badline' };
    if (st.lines[l]) return { error: 'used' };
    if (st.lineOwners[l] !== -1) return { error: 'used' };
    // authoritative: set line
    st.lines[l] = 1;
    st.lineOwners[l] = p;
    var now = Date.now();
    st.ts = now;
    var done = [], bs = lineBoxes(l, st.d), k, i;
    for (k = 0; k < bs.length; k++) {
      i = bs[k];
      if (st.boxes[i] === -1 && sideCount(st, i) === 4) { st.boxes[i] = p; done.push(i); }
    }
    recomputeScores(st);
    if (!done.length) st.turn = 1 - st.turn;
    st.turnStart = now;
    st.moveSeq = (st.moveSeq || 0) + 1;
    st.history = st.history || [];
    st.history.push({ line: l, by: p, boxes: done.slice(), ts: now, seq: st.moveSeq });
    if (st.history.length > 100) st.history.shift();
    if (st.scores[0] + st.scores[1] === boxCount(st.d)) {
      st.winner = st.scores[0] > st.scores[1] ? 0 : (st.scores[1] > st.scores[0] ? 1 : 'draw');
      st.reason = st.reason || 'done';
      st.status = 'FINISHED';
      st.closed = true;
      st.finishedAt = st.ts;
      st.closedAt = Date.now();
    }
    st.last = { line: l, by: p, boxes: done, ts: st.ts, seq: st.moveSeq };
    return { ok: true, boxes: done };
  }
  return { boxCount: boxCount, lineCount: lineCount, hIdx: hIdx, vIdx: vIdx, boxSides: boxSides,
           lineBoxes: lineBoxes, newState: newState, sideCount: sideCount, apply: apply, checkTimeout: checkTimeout, ensureLineOwners: ensureLineOwners, recomputeScores: recomputeScores };
}

/* ===== FOX DOTS & BOXES 2027 — Dots and Boxes (single/local/online) ===== */
(function () {
  if (!document.getElementById('viewDots')) return;
  var E = DOTSE_make();

  /* ---------- sound ---------- */
  var DSND = (function () {
    var ctx = null;
    function ac() { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; }
    function tone(f0, f1, dur, type, vol) {
      if (localStorage.getItem('fox_dots_mute') === '1') return;
      var c = ac(); if (!c) return;
      var o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t);
      if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(vol || 0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
    }
    return {
      line: function () { tone(430, 320, 0.07, 'triangle', 0.09); },
      capture: function () { [620, 830].forEach(function (f, i) { setTimeout(function () { tone(f, f, 0.12, 'sine', 0.12); }, i * 80); }); },
      turn: function () { tone(300, 300, 0.05, 'sine', 0.05); },
      error: function () { tone(190, 120, 0.14, 'sawtooth', 0.06); },
      click: function () { tone(700, 600, 0.05, 'triangle', 0.06); },
      win: function () { [523, 659, 784, 1046, 1318].forEach(function (f, i) { setTimeout(function () { tone(f, f, 0.16, 'triangle', 0.12); }, i * 110); }); },
      lose: function () { [392, 311, 262].forEach(function (f, i) { setTimeout(function () { tone(f, f, 0.18, 'sine', 0.1); }, i * 150); }); }
    };
  })();

  function dtFa(n) { return String(n).replace(/d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
  function $(id) { return document.getElementById(id); }
  function userName() { try { if (typeof currentUser !== 'undefined' && currentUser && currentUser.name) return currentUser.name; } catch (e) {} return 'شما'; }
  function userPhone() { try { if (typeof currentUser !== 'undefined' && currentUser && currentUser.phone) return currentUser.phone; } catch (e) {} return ''; }

  /* ---------- state ---------- */
  var S = {
    mode: null, d: 5, st: null, diff: 'normal', size: 4, busy: false, ended: false,
    token: 0, aiT: null, poll: null, waitT: null, room: null, seat: 0, testDelay: 0
  };
  var els = { lines: [], cells: [], dots: [], builtD: 0 };
  var PAD = 9;

  try {
    var cfg = JSON.parse(localStorage.getItem('fox_dots_cfg') || '{}');
    if (cfg.diff) S.diff = cfg.diff;
    if (cfg.size) S.size = cfg.size;
  } catch (e) {}
  function saveCfg() { try { localStorage.setItem('fox_dots_cfg', JSON.stringify({ diff: S.diff, size: S.size })); } catch (e) {} }
  function loadRec() { try { return JSON.parse(localStorage.getItem('fox_dots_rec') || '{}'); } catch (e) { return {}; } }
  function saveRec(r) { try { localStorage.setItem('fox_dots_rec', JSON.stringify(r)); } catch (e) {} }

  /* ---------- AI ---------- */
  function aiPick(st, level) {
    var d = st.d, n = E.lineCount(d), l, i, k;
    var free = [];
    for (l = 0; l < n; l++) if (!st.lines[l]) free.push(l);
    if (!free.length) return -1;
    function completesOn(ll) {
      var bs = E.lineBoxes(ll, d), c = 0;
      for (k = 0; k < bs.length; k++) { i = bs[k]; if (st.boxes[i] === -1 && E.sideCount(st, i) === 3) c++; }
      return c;
    }
    function givesAway(ll) {
      var bs = E.lineBoxes(ll, d);
      for (k = 0; k < bs.length; k++) { i = bs[k]; if (st.boxes[i] === -1 && E.sideCount(st, i) === 2) return true; }
      return false;
    }
    function chainCost(ll) {
      var lines = st.lines.slice(), boxes = st.boxes.slice(), taken = 0, guard = 0, changed = true;
      lines[ll] = 1;
      while (changed && guard++ < 128) {
        changed = false;
        for (i = 0; i < boxes.length; i++) {
          if (boxes[i] !== -1) continue;
          var s = E.boxSides(i, d), cnt = 0, missing = -1;
          for (k = 0; k < 4; k++) { if (lines[s[k]]) cnt++; else missing = s[k]; }
          if (cnt === 4) { boxes[i] = 1; taken++; changed = true; }
          else if (cnt === 3 && missing >= 0) { lines[missing] = 1; boxes[i] = 1; taken++; changed = true; }
        }
      }
      return taken;
    }
    function rndPick(a) { return a[(Math.random() * a.length) | 0]; }
    var comp = [], safe = [], risky = [];
    for (var j = 0; j < free.length; j++) {
      l = free[j];
      var c = completesOn(l);
      if (c > 0) comp.push([l, c]); else if (!givesAway(l)) safe.push(l); else risky.push(l);
    }
    if (level <= 0) {
      if (comp.length && Math.random() < 0.55) { comp.sort(function (a, b) { return b[1] - a[1]; }); return comp[0][0]; }
      if (safe.length && Math.random() < 0.5) return rndPick(safe);
      return rndPick(free);
    }
    if (comp.length) { comp.sort(function (a, b) { return b[1] - a[1]; }); return comp[0][0]; }
    if (level === 1) { if (safe.length) return rndPick(safe); return rndPick(risky); }
    if (safe.length) {
      var best = [], min = 99;
      for (var j2 = 0; j2 < safe.length; j2++) {
        var bs2 = E.lineBoxes(safe[j2], d), sv = 0;
        for (k = 0; k < bs2.length; k++) if (st.boxes[bs2[k]] === -1) sv += E.sideCount(st, bs2[k]);
        if (sv < min) { min = sv; best = [safe[j2]]; } else if (sv === min) best.push(safe[j2]);
      }
      return rndPick(best);
    }
    var bestL = risky[0], bestLoss = 99;
    for (var j3 = 0; j3 < risky.length; j3++) {
      var loss = chainCost(risky[j3]);
      if (loss < bestLoss) { bestLoss = loss; bestL = risky[j3]; }
    }
    return bestL;
  }
  function diffLevel() { return S.diff === 'hard' ? 2 : S.diff === 'easy' ? 0 : 1; }
  function aiName() { return S.diff === 'hard' ? 'روباه حرفه‌ای 🦊' : S.diff === 'easy' ? 'روباه بازیگوش 🦊' : 'روباه هوشمند 🦊'; }

  /* ---------- board build ---------- */
  function buildBoard(d) {
    S.d = d;
    var cell = (100 - 2 * PAD) / (d - 1);
    var hitL = cell * 0.9, hitT = cell * 0.5;
    var cellsHtml = [], linesHtml = [], dotsHtml = [], i, r, c;
    var w = d - 1;
    for (i = 0; i < w * w; i++) {
      var bx = i % w, by = (i / w) | 0;
      cellsHtml.push('<div class="dt-cell" data-c="' + i + '" style="left:' + (PAD + bx * cell + cell * 0.09) + '%;top:' + (PAD + by * cell + cell * 0.09) + '%;width:' + (cell * 0.82) + '%;height:' + (cell * 0.82) + '%"></div>');
    }
    for (r = 0; r < d; r++) for (c = 0; c < w; c++) {
      linesHtml.push('<div class="dt-line h" data-l="' + E.hIdx(r, c, d) + '" style="left:' + (PAD + c * cell + cell * 0.05) + '%;top:' + (PAD + r * cell - hitT / 2) + '%;width:' + (cell * 0.9) + '%;height:' + hitT + '%"></div>');
    }
    for (r = 0; r < w; r++) for (c = 0; c < d; c++) {
      linesHtml.push('<div class="dt-line v" data-l="' + E.vIdx(r, c, d) + '" style="left:' + (PAD + c * cell - hitT / 2) + '%;top:' + (PAD + r * cell + cell * 0.05) + '%;width:' + hitT + '%;height:' + (cell * 0.9) + '%"></div>');
    }
    var ds = cell * 0.34;
    for (r = 0; r < d; r++) for (c = 0; c < d; c++) {
      dotsHtml.push('<div class="dt-dot" style="left:' + (PAD + c * cell) + '%;top:' + (PAD + r * cell) + '%;width:' + ds + '%"></div>');
    }
    $('dtCells').innerHTML = cellsHtml.join('');
    $('dtLines').innerHTML = linesHtml.join('');
    $('dtDots').innerHTML = dotsHtml.join('');
    els.lines = Array.prototype.slice.call($('dtLines').children);
    els.cells = Array.prototype.slice.call($('dtCells').children);
    els.dots = Array.prototype.slice.call($('dtDots').children);
    els.builtD = d;
  }
  function lineEl(l) { for (var i = 0; i < els.lines.length; i++) if (+els.lines[i].dataset.l === l) return els.lines[i]; return null; }

  function markLine(l, by, glow) {
    var el = lineEl(l); if (!el) return;
    el.classList.remove('prev', 't0', 't1');
    if (el.classList.contains('on')) return;
    el.classList.add('on', 't' + by);
    var last = document.querySelector('.dt-line.last'); if (last) last.classList.remove('last');
    if (glow) el.classList.add('last');
    void el.offsetWidth;
  }
  function markBox(i, by, animate) {
    var elc = els.cells[i]; if (!elc || elc.classList.contains('own' + by)) return;
    elc.classList.add('own' + by);
    if (animate !== false) {
      var mk = document.createElement('div'); mk.className = 'mk';
      elc.appendChild(mk);
    }
  }
  function blinkLine(l) {
    var el = lineEl(l); if (!el) return;
    el.classList.remove('err'); void el.offsetWidth; el.classList.add('err');
    setTimeout(function () { el.classList.remove('err'); }, 350);
  }
  function renderFull(st) {
    if (E.ensureLineOwners) E.ensureLineOwners(st);
    // Clear existing line colors first to ensure authoritative colors
    for (var i=0;i<els.lines.length;i++) {
      var el = els.lines[i];
      el.classList.remove('on','t0','t1','last','prev');
    }
    // Render lines with authoritative owner color
    for (var l = 0; l < st.lines.length; l++) if (st.lines[l]) {
      var el = lineEl(l);
      if (!el) continue;
      var by = -1;
      if (st.lineOwners && st.lineOwners[l] !== undefined && st.lineOwners[l] !== -1) by = st.lineOwners[l];
      else by = guessColor(l, st);
      if (by===-1) by=0;
      el.classList.add('on', 't' + by);
      if (st.last && st.last.line === l) el.classList.add('last');
    }
    // Render boxes - clear first
    for (var j=0;j<els.cells.length;j++) {
      var cell = els.cells[j];
      cell.classList.remove('own0','own1');
      var mk = cell.querySelector('.mk');
      if (mk) mk.remove();
    }
    for (var i = 0; i < st.boxes.length; i++) if (st.boxes[i] !== -1) markBox(i, st.boxes[i], false);
    updateHUD();
  }
  function guessColor(l, st) {
    if (st.lineOwners && st.lineOwners[l] !== undefined && st.lineOwners[l] !== -1) return st.lineOwners[l];
    if (st.last && st.last.line === l) return st.last.by;
    // Strict fallback: check both boxes that share this line, if one is completed, use its owner (box completer)
    var bs = E.lineBoxes(l, st.d);
    // Prefer box owner if line is part of a completed box
    for (var k = 0; k < bs.length; k++) {
      var idx = bs[k];
      if (st.boxes[idx] !== -1) return st.boxes[idx];
    }
    // If no box, use last mover as line owner (who placed this line)
    if (st.last && st.last.by !== undefined) return st.last.by;
    // Default to turn player (should not happen for completed lines)
    return st.turn;
  }

  /* ---------- HUD ---------- */
  var prevScores = [0, 0];
  function dtRemainSec() {
    try {
      var st = S.st; if (!st) return null;
      if (st.winner !== null || st.abandoned) return null;
      if (S.mode !== 'online') return null;
      var limit = st.turnTimeout || 30000;
      var start = st.turnStart || st.ts || Date.now();
      var elapsed = Date.now() - start;
      var remain = Math.max(0, Math.ceil((limit - elapsed) / 1000));
      return remain;
    } catch(e){ return null; }
  }
  function updateHUD() {
    var st = S.st; if (!st) return;
    $('dtName0').textContent = st.names[0];
    $('dtName1').textContent = st.names[1];
    var s0 = $('dtScore0'), s1 = $('dtScore1');
    s0.textContent = dtFa(st.scores[0]); s1.textContent = dtFa(st.scores[1]);
    if (st.scores[0] !== prevScores[0]) { s0.classList.remove('bump'); void s0.offsetWidth; s0.classList.add('bump'); }
    if (st.scores[1] !== prevScores[1]) { s1.classList.remove('bump'); void s1.offsetWidth; s1.classList.add('bump'); }
    prevScores = [st.scores[0], st.scores[1]];
    var t = st.turn;
    $('dtChip0').classList.toggle('turn', st.winner === null && t === 0);
    $('dtChip1').classList.toggle('turn', st.winner === null && t === 1);
    try { if (typeof updateRestartVisibility==='function') updateRestartVisibility(); } catch(e){}
    var rem = dtRemainSec();
    if (st.winner !== null) {
      if (st.reason === 'timeout') {
        $('dtTurn').textContent = 'پایان — تایم‌اوت ⏰';
      } else {
        $('dtTurn').textContent = 'پایان بازی 🏁';
      }
    }
    else if (S.mode === 'local') { $('dtTurn').textContent = 'نوبت ' + st.names[t]; }
    else if (S.mode === 'single') { $('dtTurn').textContent = t === 0 ? 'نوبت شما' : 'نوبت روباه'; }
    else {
      if (rem !== null) {
        $('dtTurn').textContent = (t === S.seat ? 'نوبت شما' : 'نوبت حریف') + ' ⏳ ' + dtFa(rem) + 'ث';
      } else {
        $('dtTurn').textContent = t === S.seat ? 'نوبت شما' : 'نوبت حریف';
      }
    }
    var msg;
    if (st.winner !== null) {
      if (st.reason === 'timeout') {
        var loserName = st.names ? st.names[1 - st.winner] : '';
        msg = '⏰ ' + (loserName || 'بازیکن') + ' زمان را از دست داد — بازنده شد';
      } else msg = 'بازی تمام شد';
    }
    else if (S.mode === 'local') msg = st.names[st.turn] + ' — یک خط بکش';
    else if (S.mode === 'single') msg = st.turn === 0 ? 'نوبت توست — روی یک خط بزن' : 'روباه در حال فکر کردن…';
    else {
      if (rem !== null && rem <= 3 && st.turn === S.seat) msg = '⏰ عجله کن! ' + dtFa(rem) + ' ثانیه مانده';
      else msg = st.turn === S.seat ? 'نوبت توست — یک خط بکش' : 'نوبت حریف… صبر کن';
    }
    $('dtStatus').textContent = msg;
  }

  /* ---------- move handling ---------- */
  function interactive() {
    if (!S.st || S.st.winner !== null || S.busy || S.ended) return false;
    if (S.mode === 'single' && S.st.turn !== 0) return false;
    if (S.mode === 'online' && S.st.turn !== S.seat) return false;
    return true;
  }
  function tryLine(l) {
    if (!interactive()) return;
    if (S.st.lines[l]) { blinkLine(l); DSND.error(); return; }
    if (S.st.lineOwners && S.st.lineOwners[l] !== -1) { blinkLine(l); DSND.error(); return; }
    if (S.mode === 'online') {
      // Online: authoritative server, no optimistic local that can cause color mismatch
      // Show pending but wait for server state
      S.busy = true;
      var el = lineEl(l);
      if (el) el.classList.add('prev', 't' + S.seat);
      api('/api/dots/move', { room: S.room, phone: S.me, line: l }).then(function (r) {
        S.busy = false;
        if (el) el.classList.remove('prev', 't0', 't1');
        if (r && r.error) {
          console.warn('Dots move error', r);
          if (r.state) {
            applyRemote(r.state);
          } else {
            resync();
          }
        } else if (r && r.state) {
          applyRemote(r.state);
        } else {
          resync();
        }
        updateHUD();
      }).catch(function (e) {
        console.error('Dots move fetch error', e);
        S.busy = false;
        if (el) el.classList.remove('prev', 't0', 't1');
        resync();
      });
      return;
    }
    doLocalMove(l, true);
  }
  function doLocalMove(l, allowAI) {
    var st = S.st, by = st.turn;
    if (E.ensureLineOwners) E.ensureLineOwners(st);
    var r = E.apply(st, by, l);
    if (r.error) return;
    // Use authoritative owner from state after apply
    var owner = (st.lineOwners && st.lineOwners[l] !== -1) ? st.lineOwners[l] : by;
    markLine(l, owner, true);
    for (var k = 0; k < r.boxes.length; k++) markBox(r.boxes[k], owner, true);
    if (r.boxes.length) DSND.capture(); else { DSND.line(); setTimeout(DSND.turn, 90); }
    updateHUD();
    persistGame();
    if (st.winner !== null) { endGame(); return; }
    if (allowAI && S.mode === 'single' && st.turn === 1) scheduleAI();
  }
  function scheduleAI() {
    var tok = ++S.token;
    S.busy = true; updateHUD();
    var wait = S.testDelay ? S.testDelay : 480 + Math.random() * 420;
    S.aiT = setTimeout(function () {
      if (tok !== S.token || !S.st || S.mode !== 'single' || S.st.turn !== 1) { S.busy = false; return; }
      var l = aiPick(S.st, diffLevel());
      var ghost = S.testDelay ? 0 : 260;
      var el = lineEl(l);
      if (el && ghost) { el.classList.add('prev', 't1'); }
      setTimeout(function () {
        if (tok !== S.token) { S.busy = false; return; }
        if (el) el.classList.remove('prev', 't1');
        S.busy = false;
        doLocalMove(l, true);
      }, ghost);
    }, wait);
  }

  /* ---------- persistence (offline modes) ---------- */
  function persistGame() {
    try {
      if (S.mode === 'single' || S.mode === 'local') {
        if (S.st && S.st.winner === null) localStorage.setItem('fox_dots_save', JSON.stringify({ st: S.st, diff: S.diff, size: S.size, mode: S.mode }));
        else localStorage.removeItem('fox_dots_save');
      }
    } catch (e) {}
  }
  function savedGame() {
    try {
      var g = JSON.parse(localStorage.getItem('fox_dots_save') || 'null');
      if (g && g.st && g.st.lines && g.st.winner === null) return g;
    } catch (e) {}
    return null;
  }

  /* ---------- end / win ---------- */
  function recBump(kind) {
    var r = loadRec();
    r[kind] = (r[kind] || 0) + 1;
    saveRec(r);
  }
  function endGame(remote) {
    if (S.ended) return;
    S.ended = true;
    if (S.turnTimer) { clearInterval(S.turnTimer); S.turnTimer=null; }
    var st = S.st, w = st.winner;
    try { localStorage.removeItem('fox_dots_save'); } catch (e) {}
    if (S.mode === 'single') recBump(w === 'draw' ? 'd' : w === 0 ? 'w' : 'l');
    else if (S.mode === 'online') recBump(w === 'draw' ? 'od' : w === S.seat ? 'ow' : 'ol');
    setTimeout(function () {
      if (!S.st || S.st.winner === null) return;
      var w2 = S.st.winner;
      $('dtWinFox').textContent = w2 === 'draw' ? '🤝' : '🏆';
      try {
        if (window.FoxGameRewardService) {
          if (S.mode === 'single' && w2 === 0) {
            FoxGameRewardService.claimReward({ gameCode: 'dots_boxes', mode: 'solo', result: 'win' });
          } else if (S.mode === 'online' && w2 === S.seat) {
            FoxGameRewardService.claimReward({ gameCode: 'dots_boxes', mode: 'online', result: 'win' });
          }
        }
      } catch(e) {}
      if (w2 === 'draw') $('dtWinTitle').textContent = 'بازی مساوی شد';
      else if (S.mode === 'single') $('dtWinTitle').textContent = w2 === 0 ? '🎉 بردی!' : st.names[w2] + ' برد!';
      else $('dtWinTitle').textContent = 'برنده: ' + st.names[w2];
      $('dtWinText').textContent = S.st.abandoned ? 'حریف از بازی خارج شد' : '';
      $('dtWinRows').innerHTML =
        '<div class="row r0"><span>' + st.names[0] + '</span><b>' + dtFa(st.scores[0]) + ' خانه</b></div>' +
        '<div class="row r1"><span>' + st.names[1] + '</span><b>' + dtFa(st.scores[1]) + ' خانه</b></div>';
      // Online 2-player: hide "play again" to avoid spam, only show "return"
      if (S.mode === 'online') {
        $('dtAgain').style.display = 'none';
        $('dtWinBack').textContent = '↩ بازگشت به منو';
      } else {
        $('dtAgain').style.display = 'block';
        $('dtAgain').textContent = '🔄 بازی دوباره';
        $('dtWinBack').textContent = 'بازگشت';
      }
      $('dtWin').classList.add('show');
      try { hideOnlineAgainButtons(); } catch(e){}
      updateHUD();
      if (w2 === 'draw') DSND.turn();
      else if (S.mode === 'single' && w2 === 1) DSND.lose();
      else DSND.win();
    }, remote ? 500 : 700);
  }

  /* ---------- lifecycle ---------- */
  function enterView() {
    document.querySelectorAll('.view').forEach(function (v) {
      if (v.id !== 'viewDots') { v.classList.add('hidden'); v.style.display = 'none'; }
    });
    var vv = $('viewDots');
    vv.classList.remove('hidden'); vv.style.display = 'flex';
    var bn = $('bottomNav'); if (bn) bn.classList.remove('show');
  }
  function hideOvs() { ['dtMenu', 'dtWait', 'dtWin'].forEach(function (id) { $(id).classList.remove('show'); }); }
  // Hide "play again" for all online 2-player games (per user request)
  function hideOnlineAgainButtons() {
    try {
      var isOnline = false;
      if (typeof S !== 'undefined' && S.mode === 'online') isOnline = true;
      if (typeof state !== 'undefined' && state.mode === 'online') isOnline = true;
      if (typeof G !== 'undefined' && (G.mode === 'online' || G.mode === 'duel')) isOnline = true;
      if (typeof M !== 'undefined' && M.mode === 'online') isOnline = true;
      // Also check for Dooz, Mensh, Memory online flags
      try { if (localStorage.getItem('fox_dooz_mode')==='online') isOnline=true; } catch(e){}
      try { if (localStorage.getItem('fox_mensh') && JSON.parse(localStorage.getItem('fox_mensh')||'{}').st && JSON.parse(localStorage.getItem('fox_mensh')||'{}').st.phones) isOnline=true; } catch(e){}
      try { var _fe = document.getElementById('viewFox'); if(_fe && !_fe.classList.contains('hidden')){ var _g = window._feG || null; if(_g && _g.mode==='duel') isOnline=true; } } catch(e){}
      try { if (window._feG && window._feG.mode==='duel') isOnline=true; } catch(e){}
      try { if (window._tankG && (window._tankG.mode==='online' || window._tankG.online)) isOnline=true; } catch(e){}
      try { if (window._tankOnline) isOnline=true; } catch(e){}
      try { var _tk = document.getElementById('viewTank'); if(_tk && !_tk.classList.contains('hidden') && window._tankOnline) isOnline=true; } catch(e){}
      try { if (window.FOXDOTS && FOXDOTS.state && FOXDOTS.state().mode==='online') isOnline=true; } catch(e){}
      try { if (typeof currentDoozMode !== 'undefined' && currentDoozMode==='online') isOnline=true; } catch(e){}
      if (isOnline) {
        ['dtAgain','dzPlayAgainBtn','mnAgain','memoryAgain','feBRestart','feBRetry','tkAgain'].forEach(function(id){
          var el=document.getElementById(id);
          if(el) el.style.display='none';
        });
        ['dtRestart','dzRestart','mnRestart','memoryRestart','tkRestart','feBNext'].forEach(function(id){
          var el=document.getElementById(id);
          if(el) el.style.display='none';
        });
        // Also hide any primary again buttons in modals
        document.querySelectorAll('.mn-btn.primary, .dz-action-btn.primary, .memory-result-btn.primary').forEach(function(el){
          if (el && el.id && el.id.toLowerCase().includes('again')) el.style.display='none';
        });
      } else {
        ['dtAgain','dzPlayAgainBtn','mnAgain','memoryAgain','feBRestart','feBRetry','tkAgain'].forEach(function(id){
          var el=document.getElementById(id);
          if(el) el.style.display='block';
        });
        ['dtRestart','dzRestart','mnRestart','memoryRestart'].forEach(function(id){
          var el=document.getElementById(id);
          if(el) el.style.display='flex';
        });
      }
    } catch(e){}
  }
  // Periodically enforce hide for online games
  try { setInterval(function(){ try{hideOnlineAgainButtons();}catch(e){} }, 800); } catch(e){}
  function stopTimers() {
    if (S.aiT) { clearTimeout(S.aiT); S.aiT = null; }
    if (S.poll) { clearInterval(S.poll); S.poll = null; }
    if (S.waitT) { clearInterval(S.waitT); S.waitT = null; }
    if (S.turnTimer) { clearInterval(S.turnTimer); S.turnTimer = null; }
  }
  function newGame(mode, st0) {
    S.token++;
    stopTimers();
    S.mode = mode; S.ended = false; S.busy = false; prevScores = [0, 0];
    try { if (typeof updateRestartVisibility==='function') updateRestartVisibility(); } catch(e){}
    var d = st0 ? st0.d : (S.size + 1);
    if (mode === 'single') S.st = st0 || E.newState(d, [userName(), aiName()], null, 0);
    else if (mode === 'local') S.st = st0 || E.newState(d, ['بازیکن ۱ 🦊', 'بازیکن ۲ 🐺'], null, 0);
    els.builtD = 0;
    buildBoard(S.st.d);
    renderFull(S.st);
    hideOvs(); enterView(); updateHUD();
    persistGame();
    if (S.mode === 'single' && S.st.turn === 1) scheduleAI();
  }
  function leaveDots() {
    if (S.mode === 'online' && S.room) {
      if (S.st && S.st.winner === null && !S.st.abandoned && S.st.status !== 'FINISHED' && !S.st.closed) {
        api('/api/dots/leave', { room: S.room, phone: S.me });
      } else if (S.st && (S.st.winner !== null || S.st.status === 'FINISHED' || S.st.closed || S.st.abandoned)) {
        // Finished match: ensure it stays FINISHED/CLOSED and not active - just clear local, don't resurrect
        try { api('/api/dots/leave', { room: S.room, phone: S.me }); } catch(e){}
      }
    }
    if (S.waitT) api('/api/dots/cancel', { phone: S.me });
    S.token++;
    stopTimers();
    // Clear state completely so next join creates fresh GameState (no board/turn/score carryover)
    S.st = null;
    S.ended = false;
    S.busy = false;
    S.seat = 0;
    var oldRoom = S.room;
    S.mode = null; S.room = null;
    try { if (typeof updateRestartVisibility==='function') updateRestartVisibility(); } catch(e){}
    var vv = $('viewDots'); vv.classList.add('hidden'); vv.style.display = 'none';
    if (window.goFun) window.goFun();
  }

  /* ---------- api ---------- */
  function api(path, body) {
    return fetch(path, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {}).then(function (r) { return r.json(); });
  }

  /* ---------- online ---------- */
  function joinOnline() {
    var me = userPhone();
    if (!me) { if (window.openAppModal) openAppModal('بازی آنلاین', 'برای بازی آنلاین ابتدا وارد حساب کاربری شو.', [{ label: 'باشه', primary: true }]); return; }
    S.me = me;
    hideOvs();
    $('dtWait').classList.add('show');
    api('/api/dots/join', { phone: me, name: userName() }).then(function (r) {
      if (r && r.room) { 
        if (S.waitT) { clearInterval(S.waitT); S.waitT = null; }
        startOnline(r.room); 
      }
      else {
        if (S.waitT) clearInterval(S.waitT);
        S.waitT = setInterval(function () {
          api('/api/dots/wait?me=' + encodeURIComponent(me)).then(function (w) {
            if (w && w.room) { 
              if (S.waitT) { clearInterval(S.waitT); S.waitT = null; }
              startOnline(w.room); 
            }
          }).catch(function () {});
        }, 350);
      }
    }).catch(function () { $('dtWait').classList.remove('show'); });
  }
  function startOnline(room) {
    if (S.room === room && S.mode === 'online' && S.st && S.st.status !== 'FINISHED' && !S.st.closed) return;
    stopTimers();
    // Fresh GameState for new match - ensure no carryover from previous match
    S.mode = 'online'; S.room = room; S.ended = false; S.busy = false; S.st = null;
    try { if (typeof updateRestartVisibility==='function') updateRestartVisibility(); } catch(e){}
    // Clear any cached save for online (should not persist across matches)
    try { localStorage.removeItem('fox_dots_save'); } catch(e){}
    hideOvs(); enterView();
    // Ensure board container exists before building - initialization law
    if (!$('dtCells') || !$('dtLines') || !$('dtDots')) {
      console.error('Dots board containers not found');
      return;
    }
    // Guard: prevent double init - mark room immediately
    api('/api/dots/state?room=' + encodeURIComponent(room)).then(function (st) {
      if (S.mode !== 'online' || S.room !== room) return;
      if (!st || !st.lines) {
        console.error('Dots invalid state', st);
        // Retry after short delay - hold pending state pattern
        setTimeout(function(){ if (S.room===room) startOnline(room); }, 500);
        return;
      }
      // Validate required fields for initialization - initialization law
      if (!st.phones || !st.names || st.phones.length !== 2) {
        console.error('Dots invalid players', st);
        setTimeout(function(){ if (S.room===room) startOnline(room); }, 500);
        return;
      }
      S.st = st;
      S.seat = st.phones && st.phones[0] === S.me ? 0 : 1;
      if (S.seat !== 0 && S.seat !== 1) S.seat = 0;
      els.builtD = 0;
      try {
        buildBoard(st.d);
        renderFull(st);
        updateHUD();
        checkAbandon();
      } catch (e) {
        console.error('Dots board render error', e);
        return;
      }
      if (S.poll) clearInterval(S.poll);
      S.poll = setInterval(poll, 400);
      if (S.turnTimer) clearInterval(S.turnTimer);
      S.turnTimer = setInterval(function(){ if (S.mode==='online' && S.st && S.st.winner===null) updateHUD(); }, 250);
    }).catch(function (e) {
      console.error('Dots state fetch error', e);
      setTimeout(function(){ if (S.room===room && S.mode==='online') startOnline(room); }, 800);
    });
  }
  function countOn(a) { var n = 0; for (var i = 0; i < a.length; i++) if (a[i]) n++; return n; }
  function applyRemote(st) {
    var old = S.st;
    if (E.ensureLineOwners) E.ensureLineOwners(st);
    if (!old || !old.lines || old.d !== st.d || countOn(st.lines) < countOn(old.lines) || (st.moveSeq && old.moveSeq && st.moveSeq < old.moveSeq)) {
      // Full rebuild needed - board size changed or state went back (reconnect)
      els.builtD = 0;
      try { buildBoard(st.d); } catch(e){ console.error('buildBoard in applyRemote', e); return; }
      S.st = st; S.ended = false; S.busy = false; prevScores = [0, 0];
      $('dtWin').classList.remove('show');
      try { renderFull(st); } catch(e){ console.error('renderFull in applyRemote', e); }
      updateHUD();
      if (st.winner !== null) endGame(true);
      return;
    }
    // Authoritative sync: use lineOwners for color, not guess
    for (var l = 0; l < st.lines.length; l++) {
      if (st.lines[l] && !old.lines[l]) {
        var by = -1;
        if (st.lineOwners && st.lineOwners[l] !== -1) by = st.lineOwners[l];
        else if (st.last && st.last.line === l) by = st.last.by;
        else by = st.turn === S.seat ? S.seat : 1-S.seat; // fallback
        if (by===-1) by = st.last ? st.last.by : 0;
        markLine(l, by, st.last && st.last.line === l);
      } else if (st.lines[l] && old.lines[l] && st.lineOwners && old.lineOwners) {
        // Color correction if mismatch (fixes blue/orange bug)
        var oldBy = old.lineOwners[l];
        var newBy = st.lineOwners[l];
        if (oldBy !== newBy && newBy !== -1) {
          var el = lineEl(l);
          if (el) {
            el.classList.remove('t0','t1');
            el.classList.add('t' + newBy);
          }
        }
      }
    }
    var capped = false;
    for (var i = 0; i < st.boxes.length; i++) {
      if (st.boxes[i] !== -1 && old.boxes[i] === -1) { markBox(i, st.boxes[i], true); capped = true; }
      else if (st.boxes[i] !== -1 && old.boxes[i] !== -1 && st.boxes[i] !== old.boxes[i]) {
        // Box owner changed (should never happen) - correct it authoritatively
        var cell = els.cells[i];
        if (cell) {
          cell.classList.remove('own0','own1');
          cell.classList.add('own' + st.boxes[i]);
        }
      }
    }
    var hadWinner = old.winner !== null;
    S.st = st;
    if (!hadWinner && (st.last && st.last.by !== undefined)) { if (capped) DSND.capture(); else if (st.turn === S.seat) DSND.line(); }
    S.busy = false;
    updateHUD();
    if (st.winner !== null) {
      if (S.turnTimer) { clearInterval(S.turnTimer); S.turnTimer=null; }
      endGame(true);
    }
  }
  function poll() {
    if (S.mode !== 'online' || !S.room) return;
    // If already FINISHED, don't poll old room (prevents resurrection)
    if (S.st && (S.st.winner !== null || S.st.status === 'FINISHED' || S.st.closed)) {
      checkAbandon();
      return;
    }
    api('/api/dots/state?room=' + encodeURIComponent(S.room)).then(function (st) {
      if (S.mode !== 'online' || !st || !st.lines) return;
      // If server says FINISHED but we are polling old room that has rematchRoom, switch
      if (st.rematchRoom && st.winner !== null && st.room !== st.rematchRoom) {
        // Server indicates new match exists, auto-switch
        // Only switch if we are the player who should follow (poll will show new room via active? But we can stay on old for display)
        // Keep showing old for result, but stop polling
        applyRemote(st);
        checkAbandon();
        return;
      }
      applyRemote(st);
      checkAbandon();
    }).catch(function () {});
  }
  function checkAbandon() {
    var st = S.st;
    if (st && (st.abandoned || st.winner !== null || st.status === 'FINISHED' || st.closed)) {
      if (S.poll) { clearInterval(S.poll); S.poll = null; }
      if (S.turnTimer) { clearInterval(S.turnTimer); S.turnTimer = null; }
    }
  }
  function resync() {
    if (!S.room) return;
    api('/api/dots/state?room=' + encodeURIComponent(S.room)).then(function (st) {
      if (st && st.lines) {
        els.builtD = 0;
        try { buildBoard(st.d); S.st = st; S.ended = st.winner !== null; renderFull(st); updateHUD(); } catch(e){ console.error('resync error', e); }
        if (S.turnTimer) clearInterval(S.turnTimer);
        if (S.mode==='online' && st.winner===null) S.turnTimer = setInterval(function(){ if (S.mode==='online' && S.st && S.st.winner===null) updateHUD(); }, 250);
        if (st.winner !== null) endGame(true);
      }
    }).catch(function () {});
  }

  /* ---------- menu ---------- */
  function refreshMenu() {
    var g = savedGame();
    $('dtResume').style.display = g ? 'block' : 'none';
    var ro = $('dtResumeOnline'); ro.style.display = 'none';
    var me = userPhone();
    if (me) {
      api('/api/dots/active?me=' + encodeURIComponent(me)).then(function (a) {
        if (a && a.room) { ro.dataset.room = a.room; ro.style.display = 'block'; }
      }).catch(function () {});
    }
    $('dtDiff').querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.d === S.diff); });
    $('dtSize').querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', +b.dataset.b === S.size); });
    var r = loadRec();
    $('dtRec').textContent = 'برد مقابل روباه: ' + dtFa(r.w || 0) + ' · باخت: ' + dtFa(r.l || 0) + ' · مساوی: ' + dtFa(r.d || 0) + ' — برد آنلاین: ' + dtFa(r.ow || 0);
  }
  function openMenu() { refreshMenu(); $('dtMenu').classList.add('show'); }

  /* ---------- events ---------- */
  $('dtLines').addEventListener('pointerover', function (e) {
    var el = e.target.closest ? e.target.closest('.dt-line') : null;
    if (!el || el.classList.contains('on') || !interactive()) return;
    el.classList.add('prev', 't' + S.st.turn);
  });
  $('dtLines').addEventListener('pointerout', function (e) {
    var el = e.target.closest ? e.target.closest('.dt-line') : null;
    if (!el || el.classList.contains('on')) return;
    el.classList.remove('prev', 't0', 't1');
  });
  $('dtLines').addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('.dt-line') : null;
    if (!el) return;
    el.classList.remove('prev', 't0', 't1');
    DSND.click();
    tryLine(+el.dataset.l);
  });
  $('dtBack').addEventListener('click', function () { hideOvs(); leaveDots(); });
  // Hide restart button for online to enforce return-only flow
  function updateRestartVisibility() {
    var r = $('dtRestart');
    if (r) r.style.display = (S.mode === 'online') ? 'none' : 'flex';
  }
  $('dtRestart').addEventListener('click', function () {
    if (!S.st) return;
    if (S.mode === 'online') {
      var isFin = S.st.winner !== null || S.st.status === 'FINISHED' || S.st.closed;
      if (isFin) {
        var oldRoom = S.room;
        api('/api/dots/restart', { room: oldRoom, phone: S.me }).then(function (r) {
          if (r && r.room && r.room !== oldRoom) {
            $('dtWin').classList.remove('show');
            // New match created - switch to new room with fresh state
            S.room = r.room;
            if (r.state) {
              // Use new state directly if provided
              S.st = null;
              startOnline(r.room);
              // Apply after startOnline ensures poll restart
              setTimeout(function(){ if (r.state && S.room===r.room) applyRemote(r.state); }, 50);
            } else {
              startOnline(r.room);
            }
          } else if (r && r.state) {
            applyRemote(r.state);
          } else if (r && r.existing && r.room) {
            startOnline(r.room);
          }
        }).catch(function(e){ console.error('restart error', e); });
      }
    } else newGame(S.mode);
  });
  $('dtSound').addEventListener('click', function () {
    var m = localStorage.getItem('fox_dots_mute') === '1';
    localStorage.setItem('fox_dots_mute', m ? '0' : '1');
    this.textContent = m ? '🔊' : '🔇';
    if (m) DSND.click();
  });
  $('dtSound').textContent = localStorage.getItem('fox_dots_mute') === '1' ? '🔇' : '🔊';
  $('dtDiff').querySelectorAll('button').forEach(function (b) {
    b.addEventListener('click', function () {
      S.diff = b.dataset.d; saveCfg(); DSND.click();
      $('dtDiff').querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    });
  });
  $('dtSize').querySelectorAll('button').forEach(function (b) {
    b.addEventListener('click', function () {
      S.size = +b.dataset.b; saveCfg(); DSND.click();
      $('dtSize').querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    });
  });
  $('dtSingle').addEventListener('click', function () { newGame('single'); });
  $('dtLocal').addEventListener('click', function () { newGame('local'); });
  $('dtOnline').addEventListener('click', joinOnline);
  $('dtResume').addEventListener('click', function () {
    var g = savedGame(); if (!g) return;
    S.diff = g.diff || S.diff; S.size = g.size || S.size;
    newGame(g.mode || 'single', g.st);
  });
  $('dtResumeOnline').addEventListener('click', function () { if (this.dataset.room) startOnline(this.dataset.room); });
  $('dtCancel').addEventListener('click', function () {
    if (S.waitT) { clearInterval(S.waitT); S.waitT = null; }
    api('/api/dots/cancel', { phone: S.me });
    $('dtWait').classList.remove('show');
    openMenu();
  });
  $('dtMenuBack').addEventListener('click', function () { hideOvs(); leaveDots(); });
  $('dtWinBack').addEventListener('click', function () { hideOvs(); leaveDots(); });
  $('dtAgain').addEventListener('click', function () {
    $('dtWin').classList.remove('show');
    if (S.mode === 'online') {
      var oldRoom = S.room;
      api('/api/dots/restart', { room: oldRoom, phone: S.me }).then(function (r) {
        if (r && r.room && r.room !== oldRoom) {
          // New match - full reset, no board/turn/score carryover
          S.st = null;
          S.ended = false;
          S.busy = false;
          startOnline(r.room);
        } else if (r && r.state && r.room && r.room === oldRoom) {
          // Fallback: same room reused (legacy) - force new via join
          console.warn('restart returned same room, forcing new join');
          S.st = null;
          startOnline(r.room);
        } else if (r && r.state) {
          applyRemote(r.state);
        }
      }).catch(function(e){ console.error('again error', e); });
    } else newGame(S.mode);
  });

  window.openDots = function () { enterView(); openMenu(); };
  window.FOXDOTS = {
    E: E, ai: aiPick,
    state: function () { return S; },
    setDelay: function (ms) { S.testDelay = ms; },
    move: function (l) { tryLine(l); },
    newGame: newGame
  };
})();

/* ===== DOOZ ROBAH 2027 ENGINE (ONLINE + OFFLINE + AI) ===== */
(function () {
  var viewDooz = document.getElementById('viewDooz');
  if (!viewDooz) return;

  var DOOZ_CONFIG = {
    cells: [
      { idx: 0, r: 0, c: 0, x: 29.1, y: 29.1, w: 19.5, h: 19.5 },
      { idx: 1, r: 0, c: 1, x: 50.0, y: 29.1, w: 19.5, h: 19.5 },
      { idx: 2, r: 0, c: 2, x: 70.9, y: 29.1, w: 19.5, h: 19.5 },
      { idx: 3, r: 1, c: 0, x: 29.1, y: 50.0, w: 19.5, h: 19.5 },
      { idx: 4, r: 1, c: 1, x: 50.0, y: 50.0, w: 19.5, h: 19.5 },
      { idx: 5, r: 1, c: 2, x: 70.9, y: 50.0, w: 19.5, h: 19.5 },
      { idx: 6, r: 2, c: 0, x: 29.1, y: 70.9, w: 19.5, h: 19.5 },
      { idx: 7, r: 2, c: 1, x: 50.0, y: 70.9, w: 19.5, h: 19.5 },
      { idx: 8, r: 2, c: 2, x: 70.9, y: 70.9, w: 19.5, h: 19.5 }
    ],
    winLines: [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]
  };

  /* ---------- Audio Synthesizer (Web Audio API) ---------- */
  var AudioEngine = (function () {
    var ctx = null;
    function getCtx() {
      try {
        if (!ctx) {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (AC) ctx = new AC();
        }
        if (ctx && ctx.state === 'suspended') ctx.resume();
      } catch (e) {}
      return ctx;
    }
    return {
      playO: function () {
        if (!state.sound) return;
        var c = getCtx(); if (!c) return;
        try {
          var osc = c.createOscillator(), g = c.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, c.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, c.currentTime + 0.12);
          g.gain.setValueAtTime(0.28, c.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
          osc.connect(g); g.connect(c.destination);
          osc.start(); osc.stop(c.currentTime + 0.2);
        } catch (e) {}
      },
      playX: function () {
        if (!state.sound) return;
        var c = getCtx(); if (!c) return;
        try {
          var osc = c.createOscillator(), g = c.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, c.currentTime);
          osc.frequency.exponentialRampToValueAtTime(220, c.currentTime + 0.15);
          g.gain.setValueAtTime(0.3, c.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);
          osc.connect(g); g.connect(c.destination);
          osc.start(); osc.stop(c.currentTime + 0.18);
        } catch (e) {}
      },
      playWin: function () {
        if (!state.sound) return;
        var c = getCtx(); if (!c) return;
        try {
          [523.25, 659.25, 783.99, 1046.50].forEach(function (freq, idx) {
            var osc = c.createOscillator(), g = c.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, c.currentTime + idx * 0.1);
            g.gain.setValueAtTime(0.25, c.currentTime + idx * 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + idx * 0.1 + 0.35);
            osc.connect(g); g.connect(c.destination);
            osc.start(c.currentTime + idx * 0.1);
            osc.stop(c.currentTime + idx * 0.1 + 0.35);
          });
        } catch (e) {}
      },
      playDraw: function () {
        if (!state.sound) return;
        var c = getCtx(); if (!c) return;
        try {
          [440, 392].forEach(function (freq, idx) {
            var osc = c.createOscillator(), g = c.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, c.currentTime + idx * 0.14);
            g.gain.setValueAtTime(0.2, c.currentTime + idx * 0.14);
            g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + idx * 0.14 + 0.25);
            osc.connect(g); g.connect(c.destination);
            osc.start(c.currentTime + idx * 0.14);
            osc.stop(c.currentTime + idx * 0.14 + 0.25);
          });
        } catch (e) {}
      },
      playStart: function () {
        if (!state.sound) return;
        var c = getCtx(); if (!c) return;
        try {
          var osc = c.createOscillator(), g = c.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, c.currentTime);
          osc.frequency.exponentialRampToValueAtTime(640, c.currentTime + 0.15);
          g.gain.setValueAtTime(0.2, c.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);
          osc.connect(g); g.connect(c.destination);
          osc.start(); osc.stop(c.currentTime + 0.18);
        } catch (e) {}
      }
    };
  })();

  function createPieceSVG(symbol) {
    if (symbol === 'O') {
      return '<svg viewBox="0 0 100 100" class="dz-piece dz-piece-o">'
        + '<circle cx="50" cy="50" r="34" class="dz-o-base"/>'
        + '<circle cx="50" cy="50" r="34" class="dz-o-ring"/>'
        + '<circle cx="50" cy="50" r="34" class="dz-o-spec"/>'
        + '<circle cx="50" cy="50" r="23" class="dz-o-tech"/>'
        + '</svg>';
    } else {
      return '<svg viewBox="0 0 100 100" class="dz-piece dz-piece-x">'
        + '<line x1="22" y1="22" x2="78" y2="78" class="dz-x-base"/>'
        + '<line x1="78" y1="22" x2="22" y2="78" class="dz-x-base"/>'
        + '<line x1="22" y1="22" x2="78" y2="78" class="dz-x-blade"/>'
        + '<line x1="78" y1="22" x2="22" y2="78" class="dz-x-blade"/>'
        + '<line x1="25" y1="25" x2="45" y2="45" class="dz-x-spec"/>'
        + '<line x1="75" y1="25" x2="55" y2="45" class="dz-x-spec"/>'
        + '<circle cx="50" cy="50" r="4" class="dz-x-core"/>'
        + '</svg>';
    }
  }

  /* ---------- State ---------- */
  var state = {
    board: [null, null, null, null, null, null, null, null, null],
    turn: 'O',
    mode: localStorage.getItem('fox_dooz_mode') || 'single',
    diff: localStorage.getItem('fox_dooz_diff') || 'hard',
    sound: localStorage.getItem('fox_dooz_sound') !== 'off',
    scores: { o: 0, x: 0, draw: 0 },
    isOver: false,
    isThinking: false,
    // Online matchmaking state
    room: null,
    me: null,
    myName: 'بازیکن',
    onlineSeat: -1, // 0 = O, 1 = X
    onlineNames: ['بازیکن ۱', 'بازیکن ۲'],
    pollTimer: null,
    waitTimer: null
  };

  try {
    var rawScores = localStorage.getItem('fox_dooz_scores');
    if (rawScores) state.scores = JSON.parse(rawScores);
  } catch (e) {}

  function checkWinner(board) {
    for (var i = 0; i < DOOZ_CONFIG.winLines.length; i++) {
      var line = DOOZ_CONFIG.winLines[i];
      var a = line[0], b = line[1], c = line[2];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: line };
      }
    }
    var full = true;
    for (var j = 0; j < 9; j++) {
      if (board[j] === null) { full = false; break; }
    }
    if (full) return { winner: 'draw', line: null };
    return null;
  }

  /* ---------- Minimax & AI Engine ---------- */
  function minimax(board, depth, isMaximizing) {
    var res = checkWinner(board);
    if (res) {
      if (res.winner === 'X') return 10 - depth;
      if (res.winner === 'O') return depth - 10;
      if (res.winner === 'draw') return 0;
    }
    var i, ev;
    if (isMaximizing) {
      var maxEval = -Infinity;
      for (i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          ev = minimax(board, depth + 1, false);
          board[i] = null;
          if (ev > maxEval) maxEval = ev;
        }
      }
      return maxEval;
    } else {
      var minEval = Infinity;
      for (i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          ev = minimax(board, depth + 1, true);
          board[i] = null;
          if (ev < minEval) minEval = ev;
        }
      }
      return minEval;
    }
  }

  function getAIMove(board, diff) {
    var free = [];
    for (var i = 0; i < 9; i++) {
      if (board[i] === null) free.push(i);
    }
    if (!free.length) return -1;

    if (diff === 'easy') {
      if (Math.random() < 0.75) {
        return free[Math.floor(Math.random() * free.length)];
      }
    }

    if (diff === 'medium') {
      for (var m = 0; m < free.length; m++) {
        var idx = free[m];
        board[idx] = 'X';
        var w = checkWinner(board);
        board[idx] = null;
        if (w && w.winner === 'X') return idx;
      }
      if (Math.random() < 0.85) {
        for (var n = 0; n < free.length; n++) {
          var bidx = free[n];
          board[bidx] = 'O';
          var bw = checkWinner(board);
          board[bidx] = null;
          if (bw && bw.winner === 'O') return bidx;
        }
      }
      if (board[4] === null && Math.random() < 0.65) return 4;
      var corners = [0, 2, 6, 8].filter(function (c) { return board[c] === null; });
      if (corners.length && Math.random() < 0.6) {
        return corners[Math.floor(Math.random() * corners.length)];
      }
      return free[Math.floor(Math.random() * free.length)];
    }

    var bestScore = -Infinity;
    var bestMoves = [];
    for (var k = 0; k < free.length; k++) {
      var cand = free[k];
      board[cand] = 'X';
      var score = minimax(board, 0, false);
      board[cand] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [cand];
      } else if (score === bestScore) {
        bestMoves.push(cand);
      }
    }
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  /* ---------- DOM Elements ---------- */
  var cellsContainer = document.getElementById('dzCells');
  var turnDot = document.getElementById('dzTurnDot');
  var turnText = document.getElementById('dzTurnText');
  var modeBadge = document.getElementById('dzModeBadge');
  var scoreOEl = document.getElementById('dzScoreO');
  var scoreXEl = document.getElementById('dzScoreX');
  var scoreDrawEl = document.getElementById('dzScoreDraw');
  var soundBtn = document.getElementById('dzSound');
  var restartBtn = document.getElementById('dzRestart');
  var newGameBtn = document.getElementById('dzNewGameBtn');
  var changeModeBtn = document.getElementById('dzChangeModeBtn');
  var resetScoreBtn = document.getElementById('dzResetScoreBtn');
  var modalOv = document.getElementById('dzModalOv');
  var modalIcon = document.getElementById('dzModalIcon');
  var modalTitle = document.getElementById('dzModalTitle');
  var modalSub = document.getElementById('dzModalSub');
  var playAgainBtn = document.getElementById('dzPlayAgainBtn');
  var closeModalBtn = document.getElementById('dzCloseModalBtn');
  var backBtn = document.getElementById('dzBack');

  // Mode Selection Modals
  var dzMenu = document.getElementById('dzMenu');
  var dzWait = document.getElementById('dzWait');
  var dzOptSingle = document.getElementById('dzOptSingle');
  var dzOptPvp = document.getElementById('dzOptPvp');
  var dzOptOnline = document.getElementById('dzOptOnline');
  var dzOptResume = document.getElementById('dzOptResume');
  var dzOptBack = document.getElementById('dzOptBack');
  var dzWaitCancel = document.getElementById('dzWaitCancel');
  var dzMenuDiffBtns = document.querySelectorAll('#dzMenuDiff button');

  var cellElements = [];

  function buildCells() {
    if (!cellsContainer) return;
    cellsContainer.innerHTML = '';
    cellElements = [];
    DOOZ_CONFIG.cells.forEach(function (cfg) {
      var btn = document.createElement('button');
      btn.className = 'dz-cell';
      btn.dataset.idx = cfg.idx;
      btn.style.left = cfg.x + '%';
      btn.style.top = cfg.y + '%';
      btn.style.width = cfg.w + '%';
      btn.style.height = cfg.h + '%';
      btn.addEventListener('click', function () { handleCellClick(cfg.idx); });
      cellsContainer.appendChild(btn);
      cellElements.push(btn);
    });
  }

  function updateUI() {
    if (scoreOEl) scoreOEl.textContent = state.scores.o;
    if (scoreXEl) scoreXEl.textContent = state.scores.x;
    if (scoreDrawEl) scoreDrawEl.textContent = state.scores.draw;
    if (soundBtn) soundBtn.textContent = state.sound ? '🔊' : '🔇';

    if (state.mode === 'online') {
      var p1 = state.onlineNames[0] || 'بازیکن ۱';
      var p2 = state.onlineNames[1] || 'بازیکن ۲';
      if (modeBadge) modeBadge.textContent = '🌐 آنلاین: ' + p1 + ' (⭕) vs ' + p2 + ' (❌)';
      if (state.isOver) return;

      var isMyTurn = (state.onlineSeat === 0 && state.turn === 'O') || (state.onlineSeat === 1 && state.turn === 'X');
      if (isMyTurn) {
        if (turnText) turnText.textContent = 'نوبت شماست (' + (state.onlineSeat === 0 ? '⭕' : '❌') + ')';
        if (turnDot) turnDot.className = 'dz-turn-indicator ' + (state.onlineSeat === 0 ? 'turn-o' : 'turn-x');
      } else {
        var oppName = state.onlineSeat === 0 ? p2 : p1;
        var oppSymbol = state.onlineSeat === 0 ? '❌' : '⭕';
        if (turnText) turnText.textContent = 'نوبت ' + oppName + ' (' + oppSymbol + ') است…';
        if (turnDot) turnDot.className = 'dz-turn-indicator ' + (state.onlineSeat === 0 ? 'turn-x' : 'turn-o');
      }
      return;
    }

    if (state.mode === 'pvp') {
      if (modeBadge) modeBadge.textContent = '👥 دونفره روی یک دستگاه (آفلاین)';
      if (state.isOver) return;
      if (state.turn === 'O') {
        if (turnText) turnText.textContent = 'نوبت بازیکن ۱ (⭕)';
        if (turnDot) turnDot.className = 'dz-turn-indicator turn-o';
      } else {
        if (turnText) turnText.textContent = 'نوبت بازیکن ۲ (❌)';
        if (turnDot) turnDot.className = 'dz-turn-indicator turn-x';
      }
      return;
    }

    // Single Player
    var diffLabel = state.diff === 'easy' ? 'آسان' : state.diff === 'medium' ? 'متوسط' : 'سخت (Minimax)';
    if (modeBadge) modeBadge.textContent = '🤖 تک‌نفره مقابل روباه (' + diffLabel + ')';
    if (state.isOver) return;

    if (state.isThinking) {
      if (turnText) turnText.textContent = '🦊 روباه در حال تفکر...';
      if (turnDot) turnDot.className = 'dz-turn-indicator turn-x';
      return;
    }

    if (state.turn === 'O') {
      if (turnText) turnText.textContent = 'نوبت شما (⭕)';
      if (turnDot) turnDot.className = 'dz-turn-indicator turn-o';
    } else {
      if (turnText) turnText.textContent = 'نوبت روباه (❌)';
      if (turnDot) turnDot.className = 'dz-turn-indicator turn-x';
    }
  }

  /* ---------- User Interaction ---------- */
  function handleCellClick(idx) {
    if (state.isOver || state.isThinking) return;
    if (state.board[idx] !== null) return;

    if (state.mode === 'online') {
      var isMyTurn = (state.onlineSeat === 0 && state.turn === 'O') || (state.onlineSeat === 1 && state.turn === 'X');
      if (!isMyTurn) return;

      // Online move dispatch
      makeMove(idx, state.turn);
      if (state.room && state.me) {
        fetch('/api/dooz/move', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ room: state.room, phone: state.me, cell: idx })
        }).then(function (r) { return r.json(); }).then(function (res) {
          if (res && res.state) syncOnlineState(res.state);
        }).catch(function () {});
      }
      return;
    }

    if (state.mode === 'single' && state.turn !== 'O') return;

    makeMove(idx, state.turn);

    if (!state.isOver && state.mode === 'single' && state.turn === 'X') {
      state.isThinking = true;
      updateUI();
      setTimeout(function () {
        if (state.isOver) return;
        var aiIdx = getAIMove(state.board, state.diff);
        if (aiIdx !== -1) {
          makeMove(aiIdx, 'X');
        }
        state.isThinking = false;
        updateUI();
      }, 380);
    }
  }

  function makeMove(idx, symbol) {
    state.board[idx] = symbol;
    if (cellElements[idx]) {
      cellElements[idx].innerHTML = createPieceSVG(symbol);
      cellElements[idx].setAttribute('disabled', 'true');
    }

    if (symbol === 'O') AudioEngine.playO();
    else AudioEngine.playX();

    var result = checkWinner(state.board);
    if (result) {
      handleGameOver(result);
    } else {
      state.turn = state.turn === 'O' ? 'X' : 'O';
      updateUI();
    }
  }

  function handleGameOver(result) {
    state.isOver = true;
    if (result.winner === 'draw') {
      state.scores.draw++;
      saveScores();
      AudioEngine.playDraw();
      if (turnText) turnText.textContent = '🤝 بازی مساوی شد';
      if (turnDot) turnDot.className = 'dz-turn-indicator';
      setTimeout(function () { showModal('draw'); }, 450);
    } else {
      if (result.winner === 'O') state.scores.o++;
      else state.scores.x++;
      saveScores();
      AudioEngine.playWin();

      if (result.line) {
        result.line.forEach(function (i) {
          if (cellElements[i]) cellElements[i].classList.add('dz-win-cell');
        });
      }

      var winnerName = '';
      if (state.mode === 'online') {
        var p1 = state.onlineNames[0] || 'بازیکن ۱';
        var p2 = state.onlineNames[1] || 'بازیکن ۲';
        winnerName = result.winner === 'O' ? p1 + ' (⭕)' : p2 + ' (❌)';
      } else if (state.mode === 'pvp') {
        winnerName = result.winner === 'O' ? 'بازیکن ۱ (⭕)' : 'بازیکن ۲ (❌)';
      } else {
        winnerName = result.winner === 'O' ? 'شما (⭕)' : 'روباه (❌)';
      }

      if (turnText) turnText.textContent = '🏆 ' + winnerName + ' برنده شد!';
      try {
        if (window.FoxGameRewardService) {
          if (state.mode === 'online') {
            var mySeat = state.onlineSeat === 0 ? 'O' : 'X';
            if (result.winner === mySeat) {
              FoxGameRewardService.claimReward({ gameCode: 'tic_tac_toe', mode: 'online', result: 'win' });
            }
          } else if (state.mode !== 'pvp' && result.winner === 'O') {
            FoxGameRewardService.claimReward({ gameCode: 'tic_tac_toe', mode: 'solo', result: 'win' });
          }
        }
      } catch(e) {}
      setTimeout(function () { showModal(result.winner); }, 500);
    }
    updateUI();
  }

  function showModal(winner) {
    if (!modalOv) return;
    if (winner === 'draw') {
      if (modalIcon) modalIcon.textContent = '🤝';
      if (modalTitle) modalTitle.textContent = 'بازی مساوی شد!';
      if (modalSub) modalSub.textContent = 'رقابت بسیار پایاپای و هیجان‌انگیزی بود!';
    } else if (winner === 'O') {
      if (modalIcon) modalIcon.textContent = '🏆';
      if (state.mode === 'online') {
        var isMe = state.onlineSeat === 0;
        if (modalTitle) modalTitle.textContent = isMe ? '🏆 تبریک! شما برنده شدید!' : '🏆 ' + (state.onlineNames[0] || 'حریف') + ' برنده شد!';
        if (modalSub) modalSub.textContent = isMe ? 'یک پیروزی درخشان در بازی آنلاین!' : 'بازی زیبایی بود!';
      } else {
        if (modalTitle) modalTitle.textContent = state.mode === 'single' ? 'تبریک! شما برنده شدید!' : 'بازیکن ۱ (⭕) برنده شد!';
        if (modalSub) modalSub.textContent = state.mode === 'single' ? 'هوش مصنوعی روباه را با مهارت شکست دادید!' : 'یک پیروزی مقتدرانه!';
      }
    } else {
      if (modalIcon) modalIcon.textContent = state.mode === 'single' ? '🦊' : '🏆';
      if (state.mode === 'online') {
        var isMe2 = state.onlineSeat === 1;
        if (modalTitle) modalTitle.textContent = isMe2 ? '🏆 تبریک! شما برنده شدید!' : '🏆 ' + (state.onlineNames[1] || 'حریف') + ' برنده شد!';
        if (modalSub) modalSub.textContent = isMe2 ? 'یک پیروزی درخشان در بازی آنلاین!' : 'بازی زیبایی بود!';
      } else {
        if (modalTitle) modalTitle.textContent = state.mode === 'single' ? 'روباه برنده شد!' : 'بازیکن ۲ (❌) برنده شد!';
        if (modalSub) modalSub.textContent = state.mode === 'single' ? 'روباه این دور را هوشمندانه‌تر بازی کرد. دوباره امتحان کن!' : 'یک پیروزی قاطع!';
      }
    }
    modalOv.classList.add('show');
  }

  function closeModal() {
    if (modalOv) modalOv.classList.remove('show');
  }

  function resetGame() {
    for (var i = 0; i < 9; i++) state.board[i] = null;
    state.turn = 'O';
    state.isOver = false;
    state.isThinking = false;
    cellElements.forEach(function (el) {
      el.innerHTML = '';
      el.removeAttribute('disabled');
      el.classList.remove('dz-win-cell');
    });
    closeModal();
    AudioEngine.playStart();
    updateUI();

    if (state.mode === 'online' && state.room && state.me) {
      fetch('/api/dooz/restart', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ room: state.room, phone: state.me })
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (res && res.state) syncOnlineState(res.state);
      }).catch(function () {});
    }
  }

  function saveScores() {
    try {
      localStorage.setItem('fox_dooz_scores', JSON.stringify(state.scores));
    } catch (e) {}
  }

  /* ---------- Online Matchmaking ---------- */
  function stopDoozPoll() {
    if (state.pollTimer) { clearInterval(state.pollTimer); state.pollTimer = null; }
    if (state.waitTimer) { clearInterval(state.waitTimer); state.waitTimer = null; }
  }

  function hideDoozModals() {
    if (dzMenu) dzMenu.classList.remove('show');
    if (dzWait) dzWait.classList.remove('show');
  }

  function openDoozMenu() {
    hideDoozModals();
    var hasActive = state.board.some(function (c) { return c !== null; }) && !state.isOver;
    if (dzOptResume) dzOptResume.style.display = hasActive ? 'block' : 'none';

    dzMenuDiffBtns.forEach(function (b) {
      b.classList.toggle('on', b.dataset.d === state.diff);
    });

    if (dzMenu) dzMenu.classList.add('show');
  }

  function joinOnlineDooz() {
    var cu = null;
    try { cu = JSON.parse(localStorage.getItem('fox_user')); } catch (e) {}
    if (!cu || !cu.phone) {
      if (typeof openAppModal === 'function') {
        openAppModal('ورود به حساب لازم است', 'برای بازی آنلاین دوز ابتدا باید وارد حساب کاربری خود شوید.', [{ label: 'باشه', primary: true }]);
      } else {
        alert('برای بازی آنلاین باید ابتدا وارد حساب کاربری خود شوید.');
      }
      return;
    }

    state.me = cu.phone;
    state.myName = cu.name || 'بازیکن';

    hideDoozModals();
    if (dzWait) dzWait.classList.add('show');

    fetch('/api/dooz/join', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone: state.me, name: state.myName })
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (res.room) {
        startOnlineDooz(res.room);
      } else if (res.waiting) {
        state.waitTimer = setInterval(function () {
          fetch('/api/dooz/wait?me=' + encodeURIComponent(state.me))
            .then(function (r) { return r.json(); })
            .then(function (w) {
              if (w.room) {
                clearInterval(state.waitTimer);
                state.waitTimer = null;
                startOnlineDooz(w.room);
              }
            }).catch(function () {});
        }, 350);
      }
    }).catch(function () {});
  }

  function cancelOnlineWait() {
    stopDoozPoll();
    if (state.me) {
      fetch('/api/dooz/cancel', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone: state.me })
      }).catch(function () {});
    }
    hideDoozModals();
    openDoozMenu();
  }

  function startOnlineDooz(room) {
    stopDoozPoll();
    state.mode = 'online';
    state.room = room;
    localStorage.setItem('fox_dooz_mode', 'online');
    hideDoozModals();

    enterGameView();

    fetch('/api/dooz/state?room=' + encodeURIComponent(room))
      .then(function (r) { return r.json(); })
      .then(function (st) {
        if (!st || !st.board) return;
        syncOnlineState(st);
        state.pollTimer = setInterval(pollOnlineDooz, 350);
      });
  }

  function pollOnlineDooz() {
    if (!state.room || state.mode !== 'online') return;
    fetch('/api/dooz/state?room=' + encodeURIComponent(state.room))
      .then(function (r) { return r.json(); })
      .then(function (st) {
        if (!st || !st.board) return;
        syncOnlineState(st);
      }).catch(function () {});
  }

  function syncOnlineState(st) {
    // 10s turn timer handling
    try{
      var _isMyTurn = (st.phones && state.me) ? ((st.phones[0]===state.me && st.turn==='O') || (st.phones[1]===state.me && st.turn==='X')) : false;
      // ensure timer element exists
      var _timerEl = document.getElementById('dzTimer');
      if(!_timerEl){
        var _card = document.getElementById('dzTurnCard');
        if(_card){
          _timerEl=document.createElement('span');
          _timerEl.id='dzTimer';
          _timerEl.style.cssText='margin-inline-start:8px;font-weight:800;font-size:12px;background:rgba(255,122,0,.18);border:1px solid rgba(255,122,0,.32);padding:3px 8px;border-radius:999px;color:#ffd9a8;';
          _card.appendChild(_timerEl);
        }
      }
      if(_timerEl){
        if(st.winner!==null || st.abandoned){
          _timerEl.style.display='none';
          if(state._doozTimer) { clearInterval(state._doozTimer); state._doozTimer=null; }
        } else {
          _timerEl.style.display='inline-flex';
          // start interval if not running or turn changed
          if(state._lastTurn!==st.turn || !state._doozTimer){
            state._lastTurn=st.turn;
            if(state._doozTimer) clearInterval(state._doozTimer);
            var _start = st.turnStart || Date.now();
            var _timeout = st.turnTimeout || 10000;
            function _upd(){
              var _left = Math.max(0, _timeout - (Date.now()-_start));
              var _sec = Math.ceil(_left/1000);
              _timerEl.textContent = '⏱ ' + _sec + ' ثانیه';
              _timerEl.style.background = _sec<=3 ? 'rgba(255,60,60,.25)' : 'rgba(255,122,0,.18)';
              _timerEl.style.borderColor = _sec<=3 ? 'rgba(255,60,60,.5)' : 'rgba(255,122,0,.32)';
              if(_left<=0){
                clearInterval(state._doozTimer); state._doozTimer=null;
                // trigger poll to let backend declare timeout
                setTimeout(function(){ pollOnlineDooz(); }, 200);
              }
            }
            _upd();
            state._doozTimer = setInterval(_upd, 250);
          }
        }
      }
    }catch(e){}
    state.onlineNames = st.names || ['بازیکن ۱', 'بازیکن ۲'];
    if (st.phones && state.me) {
      state.onlineSeat = st.phones[0] === state.me ? 0 : st.phones[1] === state.me ? 1 : -1;
    } else if (st.phones && !state.me) {
      try{ var _cu=JSON.parse(localStorage.getItem('fox_user')||'null'); if(_cu && _cu.phone){ state.me=_cu.phone; state.onlineSeat = st.phones[0]===state.me?0:st.phones[1]===state.me?1:-1; } }catch(e){}
    }

    // Check board differences
    for (var i = 0; i < 9; i++) {
      if (st.board[i] !== state.board[i]) {
        state.board[i] = st.board[i];
        if (cellElements[i]) {
          if (st.board[i]) {
            cellElements[i].innerHTML = createPieceSVG(st.board[i]);
            cellElements[i].setAttribute('disabled', 'true');
          } else {
            cellElements[i].innerHTML = '';
            cellElements[i].removeAttribute('disabled');
          }
        }
      }
    }

    state.turn = st.turn;

    if (st.winner !== null && !state.isOver) {
      state.isOver = true;
      if (st.line) {
        st.line.forEach(function (idx) {
          if (cellElements[idx]) cellElements[idx].classList.add('dz-win-cell');
        });
      }
      if (st.winner === 'draw') {
        state.scores.draw++;
        AudioEngine.playDraw();
      } else {
        if (st.winner === 'O') state.scores.o++;
        else state.scores.x++;
        AudioEngine.playWin();
      }
      saveScores();
      showModal(st.winner);
    } else if (st.winner === null && state.isOver) {
      state.isOver = false;
      cellElements.forEach(function (el) { el.classList.remove('dz-win-cell'); });
      closeModal();
    }

    updateUI();
  }

  function leaveDooz() {
    stopDoozPoll();
    if (state.mode === 'online' && state.room && state.me) {
      fetch('/api/dooz/leave', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ room: state.room, phone: state.me })
      }).catch(function () {});
    }
    hideDoozModals();
    hide(viewDooz);
    goFun();
  }

  function enterGameView() {
    hide(viewHome); hide(viewSettings); hide(viewDMList); hide(viewDM); hide(viewFun); hide(viewMensh);
    show(viewDooz);
    bottomNav.classList.add('show');
    if (!cellElements.length) buildCells();
    updateUI();
  }

  /* ---------- Event Handlers ---------- */
  if (restartBtn) restartBtn.addEventListener('click', resetGame);
  if (newGameBtn) newGameBtn.addEventListener('click', resetGame);
  if (playAgainBtn) playAgainBtn.addEventListener('click', function(){
    try { if (state && state.mode==='online') { hideOnlineAgainButtons(); return; } } catch(e){}
    resetGame();
  });
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (backBtn) backBtn.addEventListener('click', leaveDooz);

  if (changeModeBtn) {
    changeModeBtn.addEventListener('click', function () {
      openDoozMenu();
    });
  }

  if (resetScoreBtn) {
    resetScoreBtn.addEventListener('click', function () {
      state.scores = { o: 0, x: 0, draw: 0 };
      saveScores();
      updateUI();
    });
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', function () {
      state.sound = !state.sound;
      localStorage.setItem('fox_dooz_sound', state.sound ? 'on' : 'off');
      updateUI();
    });
  }

  // Menu Modal Actions
  if (dzOptSingle) {
    dzOptSingle.addEventListener('click', function () {
      stopDoozPoll();
      state.mode = 'single';
      localStorage.setItem('fox_dooz_mode', 'single');
      hideDoozModals();
      enterGameView();
      resetGame();
    });
  }

  if (dzOptPvp) {
    dzOptPvp.addEventListener('click', function () {
      stopDoozPoll();
      state.mode = 'pvp';
      localStorage.setItem('fox_dooz_mode', 'pvp');
      hideDoozModals();
      enterGameView();
      resetGame();
    });
  }

  if (dzOptOnline) {
    dzOptOnline.addEventListener('click', function () {
      joinOnlineDooz();
    });
  }

  if (dzOptResume) {
    dzOptResume.addEventListener('click', function () {
      hideDoozModals();
      enterGameView();
    });
  }

  if (dzOptBack) {
    dzOptBack.addEventListener('click', function () {
      hideDoozModals();
      goFun();
    });
  }

  if (dzWaitCancel) {
    dzWaitCancel.addEventListener('click', cancelOnlineWait);
  }

  dzMenuDiffBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      dzMenuDiffBtns.forEach(function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
      state.diff = btn.dataset.d;
      localStorage.setItem('fox_dooz_diff', state.diff);
    });
  });

  // When clicking on funDooz from games list, open the mode selection dialog!
  window.openDooz = function () {
    openDoozMenu();
  };

  buildCells();
  updateUI();
})();

/* ==== TANK SPRITES ==== */
window.TANK_SPRITES={"p1h":{w:74,h:128,"url":"/static/6ae62ae64a4c273bcbe97a570f104773e0d593212ea1f93e56d53304521e335b.webp"},"p2h":{w:65,h:128,"url":"/static/1b55c7c6728c59679246fec814fc60dc4dcc71a28d7f26706fa6fddb265ab560.webp"},"p1t":{w:96,h:195,"url":"/static/b15d8b94cbf459ba3bb6b1a43acf76a52dbef2e761cb2d94e7f6a737971c0fb3.webp"},"p2t":{w:96,h:171,"url":"/static/cd6f90c4584aef892105802a157dab55a288f9d5eba6e1831286d77753fc1f59.webp"},"crate":{w:64,h:64,"url":"/static/d239b2fca06867aedc2494c48d91c1af759c9a4ce967867aa08caa1d4787b1d4.webp"},"rock":{w:64,h:64,"url":"/static/db24b2b086be1a26a0dfb859e6af76485f1093c993cd92ba74055e772b456ff5.webp"},"wall":{w:64,h:64,"url":"/static/29f797ab9ff3686cb6be420d005c68a62980792496d1b586e61be5d2b181e721.webp"}};

/* ==== TANK SPRITES v2 (4 new tanks + shells) ==== */
window.TANK_SPRITES2={"sh1":{"w":128,"h":64,"url":"/static/086829b86d643e6faac692a87fa1183d27de6bc60de3f356dd1e228861c32204.webp"},"sh2":{"w":128,"h":64,"url":"/static/387da39806d3a6eb7863aba449a48951e62d389e6fc03a79517a35ef043f6f5a.webp"},"sh3":{"w":128,"h":64,"url":"/static/9822cbc58951c75949de7c308ea0166037c02e8dcf8578b28dbbaa5d56e90620.webp"},"sh4":{"w":128,"h":64,"url":"/static/0da1bb38e5e581c25b5047ed3f9f9a217ff175d1a727706b8d67688c2ae38982.webp"},"t1h":{"w":148,"h":256,"url":"/static/391950836944f011596e33ef6013b7c75f4750bf4ef8198886216a72b7c0c71a.webp"},"t1t":{"w":232,"h":450,"url":"/static/08422e0d7cac1d580874ee0ef38f487475b47b876ef27707998872b72c2d154c.webp"},"t2h":{"w":148,"h":256,"url":"/static/834693c45920d0facabfa2b0179ee849de2ef7472368a792b57e1d633db04fac.webp"},"t2t":{"w":232,"h":434,"url":"/static/ea5b89fd28773e1998dd6e0a2dcae3aca886392dbd59c4440eded11afd02083b.webp"},"t3h":{"w":148,"h":256,"url":"/static/9ed7c25ee7777d73c13d22bf251b0b001a2580e8ecfd5aad5ad2c8a0394f73ba.webp"},"t3t":{"w":232,"h":435,"url":"/static/cdbc4af06b7f04f89e2d68dde0069dec8ccdc99a11763a9ce13a2c7ca069a829.webp"},"t4h":{"w":148,"h":256,"url":"/static/e92de6e6cacc145572e5c849f390039ce875dfae0abcb4b2cc91eca4053db2bd.webp"},"t4t":{"w":232,"h":418,"url":"/static/9f80981825a5c8281a093de27bec27ccfbcd9aeb1ac37eb95d690b90081aa2ad.webp"},"p1h":{"w":74,"h":128,"url":"/static/6ae62ae64a4c273bcbe97a570f104773e0d593212ea1f93e56d53304521e335b.webp"},"p2h":{"w":65,"h":128,"url":"/static/1b55c7c6728c59679246fec814fc60dc4dcc71a28d7f26706fa6fddb265ab560.webp"},"p1t":{"w":96,"h":195,"url":"/static/b15d8b94cbf459ba3bb6b1a43acf76a52dbef2e761cb2d94e7f6a737971c0fb3.webp"},"p2t":{"w":96,"h":171,"url":"/static/cd6f90c4584aef892105802a157dab55a288f9d5eba6e1831286d77753fc1f59.webp"},"t5h":{"w":148,"h":256,"url":"/static/cadb665d9d2f560fd8773d2922beefa6c39de20e1923ba2da56a6dae3ee0ac39.webp"},"t5t":{"w":232,"h":450,"url":"/static/9d6a9f6c91b9dd119d720f930e46ac20276043ee3ff349c4531afefc19b6a4b8.webp"},"sh5":{"w":128,"h":64,"url":"/static/ca62856d6a9894aa727847f0aa50a46f34baa076bc1fabdea5785d67430d2028.webp"},"sh6":{"w":128,"h":64,"url":"/static/714408117da91d28ebe91a57e1ec08071c98942b5411d49db7bc99307083a2a7.webp"}};
window.TANK_DEFS=[{"id":"t0","name":"روباه نارنجی","sub":"تانک پیش‌فرض","kind":"default","hull":"p1h","turret":"p1t","shell":"sh1","col":"#FF9A3C","col2":"#FF7A2B","pvx":0.5,"pvy":0.7,"dmg":12,"rate":620,"bspd":780,"hp":100,"spd":250,"r":42},{"id":"t1","name":"تانک آتشین","sub":"زره سنگین، آسیب زیاد","kind":"new","hull":"t1h","turret":"t1t","shell":"sh1","col":"#FF5A2B","col2":"#B3241A","pvx":0.4978,"pvy":0.6944,"dmg":16,"rate":700,"bspd":760,"hp":115,"spd":235,"r":43},{"id":"t2","name":"تانک یخی","sub":"سریع و خوش‌دست","kind":"new","hull":"t2h","turret":"t2t","shell":"sh2","col":"#4DE3FF","col2":"#2E9FE0","pvx":0.4978,"pvy":0.6924,"dmg":11,"rate":520,"bspd":880,"hp":95,"spd":290,"r":41},{"id":"t3","name":"تانک سایبری","sub":"شلیک پیوسته","kind":"new","hull":"t3h","turret":"t3t","shell":"sh3","col":"#B44DFF","col2":"#7A1FD0","pvx":0.4978,"pvy":0.6736,"dmg":13,"rate":430,"bspd":820,"hp":100,"spd":265,"r":42},{"id":"t4","name":"تانک طلایی","sub":"متعادل و کمیاب","kind":"new","hull":"t4h","turret":"t4t","shell":"sh4","col":"#FFC24D","col2":"#C88410","pvx":0.4978,"pvy":0.6244,"dmg":15,"rate":560,"bspd":800,"hp":110,"spd":258,"r":43},{"id": "t5", "name": "تانک سمی", "sub": "زهر سبز، خطرناک", "kind": "new", "hull": "t5h", "turret": "t5t", "shell": "sh5", "col": "#3EE06B", "col2": "#1FA24A", "pvx": 0.4978, "pvy": 0.69, "dmg": 14, "rate": 600, "bspd": 810, "hp": 105, "spd": 262, "r": 42}];

/* ===== FOX TANK DUEL 2027 — GAME ENGINE ===== */
(function () {
  var viewTank = document.getElementById('viewTank');
  if (!viewTank) return;

  var TAU = Math.PI * 2;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function angLerp(a, b, t) {
    var d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI;
    return a + d * t;
  }
  function angDiff(a, b) {
    return ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI;
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* ---------- Sprites ---------- */
  var SPR = window.TANK_SPRITES || {};
  var IMG = {}, imgReady = 0, imgTotal = 0;
  for (var k in SPR) {
    if (!SPR.hasOwnProperty(k)) continue;
    imgTotal++;
    (function (key) {
      var im = new Image();
      im.onload = function () { imgReady++; };
      im.onerror = function () { imgReady++; };
      im.src = SPR[key].url || ('data:image/webp;base64,' + SPR[key].b64);
      IMG[key] = im;
    })(k);
  }
  var TURRET_PIVOT = { p1t: 0.70, p2t: 0.655 };

  /* ---------- v2 tank catalogue (4 new tanks + the original) ---------- */
  var SPR2 = window.TANK_SPRITES2 || {}, IMG2 = {};
  for (var k2 in SPR2) {
    if (!SPR2.hasOwnProperty(k2)) continue;
    (function (key) {
      var im2 = new Image();
      im2.src = SPR2[key].url || ('data:image/webp;base64,' + SPR2[key].b64);
      IMG2[key] = im2;
    })(k2);
  }
  var TANK_DEFS = window.TANK_DEFS || [];
  function shellOf(t) { return (t && t.shell) || 'sh1'; }
  var TANK_COUNT = TANK_DEFS.length || 1;
  /* only the first two tanks and first two shells are unlocked; the rest show a lock */
  var LOCKED_TANKS = { 2: 1, 3: 1, 4: 1, 5: 1 };
  var LOCKED_SHELLS = { sh3: 1, sh4: 1, sh5: 1, sh6: 1 };
  function tankIdOf(i) { var dd = TANK_DEFS[i]; return (dd && dd.id) ? dd.id : ("t" + i); }
  var OWNED_ITEMS = {};
  var WALLET_COINS = null;
  function isOwned(id) { return !!OWNED_ITEMS[id]; }
  function tankLocked(i) { return !!LOCKED_TANKS[i] && !isOwned(tankIdOf(i)); }
  function shellLocked(k) { return !!LOCKED_SHELLS[k] && !isOwned(k); }
  /* ---------- فروشگاه تانک: تانک‌ها و توپ‌های قفل با سکه روباه خریده می‌شوند (backend مرجع قیمت‌هاست) ---------- */
  var SHOP_PRICE = { t2: 90, t3: 120, t4: 200, t5: 240, sh3: 100, sh4: 150, sh5: 120, sh6: 140 };
  function tkFa(n) {
    try { if (typeof fa === "function") return fa(n); } catch (e) {}
    return String(n).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[+d]; });
  }
  function tkToast(m) {
    try { if (typeof toast === "function") { toast(m); return; } } catch (e) {}
  }
  function shopAuth() {
    var u = null;
    try { u = (typeof currentUser !== "undefined" && currentUser) ? currentUser : JSON.parse(localStorage.getItem("fox_user") || "null"); } catch (e) { u = null; }
    var t = "";
    try { t = String(localStorage.getItem("fox_session") || "").trim(); } catch (e) { t = ""; }
    if (!u || !u.phone || !t) return null;
    return { phone: u.phone, token: t };
  }
  function refreshShopUI() {
    try { buildGrid(); } catch (e) {}
    var sl = 0;
    try { sl = PICK.slots ? PICK.slots[Math.min(PICK.slotIdx, PICK.slots.length - 1)] : 0; } catch (e) { sl = 0; }
    try { markCards(G.picks[sl]); } catch (e) {}
    try { bindCfg(sl); } catch (e) {}
    try { renderSlots(); } catch (e) {}
  }
  function shopApply(j) {
    if (!j || !j.ok) return;
    OWNED_ITEMS = {};
    var list = j.owned || [];
    for (var i = 0; i < list.length; i++) OWNED_ITEMS[list[i]] = 1;
    if (j.wallet && typeof j.wallet.coins === "number") WALLET_COINS = j.wallet.coins;
    else if (typeof j.coins === "number") WALLET_COINS = j.coins;
  }
  function syncShop(cb) {
    var a = shopAuth();
    if (!a) { OWNED_ITEMS = {}; WALLET_COINS = null; refreshShopUI(); if (cb) cb(); return; }
    fetch("/api/tank/shop?phone=" + encodeURIComponent(a.phone) + "&token=" + encodeURIComponent(a.token), { credentials: "same-origin", cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (j) { shopApply(j); refreshShopUI(); if (cb) cb(); })
      .catch(function () { refreshShopUI(); if (cb) cb(); });
  }
  var tkBuyOv = null;
  function closeBuy() { if (tkBuyOv) tkBuyOv.classList.remove("show"); }
  function ensureBuyModal() {
    if (tkBuyOv) return tkBuyOv;
    tkBuyOv = document.createElement("div");
    tkBuyOv.className = "tkbuy-ov";
    tkBuyOv.innerHTML = '<div class="tkbuy" role="dialog" aria-modal="true">' +
      '<div class="tkbuy-ico" id="tkBuyIco">🛒</div>' +
      '<div class="tkbuy-name" id="tkBuyName"></div>' +
      '<div class="tkbuy-price" id="tkBuyPrice"></div>' +
      '<div class="tkbuy-q">آیا مایل به خرید هستید؟</div>' +
      '<div class="tkbuy-bal" id="tkBuyBal"></div>' +
      '<div class="tkbuy-msg" id="tkBuyMsg"></div>' +
      '<div class="tkbuy-row">' +
      '<button class="tkbuy-btn no" id="tkBuyNo" type="button">انصراف</button>' +
      '<button class="tkbuy-btn buy" id="tkBuyYes" type="button">خرید</button>' +
      '</div></div>';
    document.body.appendChild(tkBuyOv);
    tkBuyOv.addEventListener("click", function (e) { if (e.target === tkBuyOv) closeBuy(); });
    document.getElementById("tkBuyNo").addEventListener("click", closeBuy);
    document.getElementById("tkBuyYes").addEventListener("click", function () {
      var btn = this, id = btn.getAttribute("data-id") || "";
      var msgEl = document.getElementById("tkBuyMsg");
      var balEl = document.getElementById("tkBuyBal");
      var a = shopAuth();
      if (!a) { msgEl.textContent = "برای خرید اول وارد حساب کاربری خود شوید."; return; }
      btn.disabled = true; btn.textContent = "در حال پرداخت…";
      fetch("/api/tank/buy", {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: a.phone, token: a.token, id: id })
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { st: r.status, j: j }; }); })
        .then(function (res) {
          var j = res.j || {};
          if (j.ok) {
            OWNED_ITEMS[id] = 1;
            if (j.wallet && typeof j.wallet.coins === "number") WALLET_COINS = j.wallet.coins;
            try { if (window.FoxWallet && typeof window.FoxWallet.refresh === "function") window.FoxWallet.refresh(); } catch (e) {}
            refreshShopUI();
            closeBuy();
            tkToast(j.alreadyOwned ? "این آیتم قبلاً خریداری شده است" : "خرید با موفقیت انجام شد ✅");
            return;
          }
          if (j.wallet && typeof j.wallet.coins === "number") WALLET_COINS = j.wallet.coins;
          balEl.innerHTML = (WALLET_COINS === null) ? "" : ("موجودی کیف پول: <b>" + tkFa(WALLET_COINS) + " سکه روباه</b>");
          if (j.error === "insufficient_coins") {
            var need = Math.max(0, (SHOP_PRICE[id] || 0) - (WALLET_COINS || 0));
            msgEl.textContent = "موجودی سکه روباه کافی نیست — " + tkFa(need) + " سکه کم دارید.";
          } else {
            msgEl.textContent = j.message || "خرید ناموفق بود. دوباره تلاش کنید.";
          }
          btn.disabled = false; btn.textContent = "خرید";
        }).catch(function () {
          msgEl.textContent = "خطای شبکه. دوباره تلاش کنید.";
          btn.disabled = false; btn.textContent = "خرید";
        });
    });
    return tkBuyOv;
  }
  function openBuy(id, name, ico) {
    if (!SHOP_PRICE[id]) return;
    var m = ensureBuyModal();
    document.getElementById("tkBuyIco").textContent = ico || "🛒";
    document.getElementById("tkBuyName").textContent = name || "";
    document.getElementById("tkBuyPrice").innerHTML = "🪙 " + tkFa(SHOP_PRICE[id]) + " سکه روباه";
    var balEl = document.getElementById("tkBuyBal");
    balEl.innerHTML = (WALLET_COINS === null) ? "" : ("موجودی کیف پول: <b>" + tkFa(WALLET_COINS) + " سکه روباه</b>");
    document.getElementById("tkBuyMsg").textContent = "";
    var yes = document.getElementById("tkBuyYes");
    yes.setAttribute("data-id", id);
    yes.disabled = false;
    yes.textContent = "خرید";
    m.classList.add("show");
  }
  function tankDef(i) { return TANK_DEFS[i] || TANK_DEFS[0] || null; }
  function bulletTex(t) {
    var d = tankDef(t && t.tank);
    var k3 = (d && d.shell) || 'sh1';
    return IMG2[k3] || null;
  }

  /* ---------- Arena definitions ---------- */
  var W = 1400, H = 2000;   // world units (portrait battlefield)

  function mkWalls() {
    var t = 40;
    return [
      { x: 0, y: 0, w: W, h: t, solid: true, kind: 'wall' },
      { x: 0, y: H - t, w: W, h: t, solid: true, kind: 'wall' },
      { x: 0, y: 0, w: t, h: H, solid: true, kind: 'wall' },
      { x: W - t, y: 0, w: t, h: H, solid: true, kind: 'wall' }
    ];
  }

  var ARENAS = [
    {
      name: 'کوچه‌های روباه',
      ground: '#2b2118', accent: '#3a2a1c', grid: '#46331f',
      blocks: function () {
        var b = mkWalls();
        function W_(x, y, w, h) { b.push({ x: x, y: y, w: w, h: h, solid: true, kind: 'wall' }); }
        function C_(x, y) { b.push({ x: x, y: y, w: 80, h: 80, solid: true, kind: 'crate', hp: 3, mhp: 3 }); }
        function R_(x, y) { b.push({ x: x, y: y, w: 90, h: 90, solid: true, kind: 'rock' }); }
        W_(240, 300, 300, 46); W_(860, 300, 300, 46);
        W_(240, 300, 46, 220); W_(1114, 300, 46, 220);
        W_(180, 800, 46, 400); W_(1174, 800, 46, 400);
        W_(500, 950, 400, 46);
        W_(240, 1560, 300, 46); W_(860, 1560, 300, 46);
        W_(240, 1380, 46, 226); W_(1114, 1380, 46, 226);
        C_(640, 640); C_(640, 1280); C_(360, 1000); C_(960, 1000);
        C_(300, 640); C_(1020, 640); C_(300, 1280); C_(1020, 1280);
        R_(430, 150); R_(880, 150); R_(430, 1760); R_(880, 1760); R_(120, 1000); R_(1190, 1000);
        return b;
      },
      spawns: [{ x: 700, y: 1830, a: -Math.PI / 2 }, { x: 700, y: 170, a: Math.PI / 2 }],
      pups: [{ x: 712, y: 1062 }, { x: 187, y: 462 }, { x: 1212, y: 462 }, { x: 187, y: 1537 }, { x: 1212, y: 1537 }]
    },
    {
      name: 'کارخانه متروکه',
      ground: '#1d2126', accent: '#272d34', grid: '#333b45',
      blocks: function () {
        var b = mkWalls();
        function W_(x, y, w, h) { b.push({ x: x, y: y, w: w, h: h, solid: true, kind: 'wall' }); }
        function C_(x, y) { b.push({ x: x, y: y, w: 80, h: 80, solid: true, kind: 'crate', hp: 3, mhp: 3 }); }
        function R_(x, y) { b.push({ x: x, y: y, w: 90, h: 90, solid: true, kind: 'rock' }); }
        W_(300, 420, 46, 340); W_(1054, 420, 46, 340);
        W_(300, 420, 260, 46); W_(840, 420, 260, 46);
        W_(560, 760, 280, 46);
        W_(140, 980, 360, 46); W_(900, 980, 360, 46);
        W_(560, 1240, 280, 46);
        W_(300, 1500, 46, 340); W_(1054, 1500, 46, 340);
        W_(300, 1794, 260, 46); W_(840, 1794, 260, 46);
        C_(700, 560); C_(700, 1400); C_(460, 1100); C_(860, 1100);
        C_(180, 620); C_(1140, 620); C_(180, 1340); C_(1140, 1340);
        C_(700, 900); C_(700, 1060);
        R_(420, 200); R_(980, 200); R_(420, 1780); R_(980, 1780);
        return b;
      },
      spawns: [{ x: 700, y: 1820, a: -Math.PI / 2 }, { x: 700, y: 180, a: Math.PI / 2 }],
      pups: [{ x: 662, y: 1012 }, { x: 187, y: 937 }, { x: 1212, y: 937 }, { x: 700, y: 300 }, { x: 700, y: 1700 }]
    },
    {
      name: 'بیابان نارنجی',
      ground: '#4a3220', accent: '#5c3f27', grid: '#6b4a2d',
      blocks: function () {
        var b = mkWalls();
        function W_(x, y, w, h) { b.push({ x: x, y: y, w: w, h: h, solid: true, kind: 'wall' }); }
        function C_(x, y) { b.push({ x: x, y: y, w: 80, h: 80, solid: true, kind: 'crate', hp: 3, mhp: 3 }); }
        function R_(x, y) { b.push({ x: x, y: y, w: 90, h: 90, solid: true, kind: 'rock' }); }
        W_(420, 560, 560, 46);
        W_(420, 1400, 560, 46);
        W_(160, 860, 46, 300); W_(1194, 860, 46, 300);
        R_(300, 300); R_(1010, 300); R_(300, 1610); R_(1010, 1610);
        R_(655, 900); R_(655, 1010);
        R_(430, 1000); R_(880, 1000);
        C_(655, 320); C_(655, 1640); C_(300, 780); C_(1010, 780);
        C_(300, 1180); C_(1010, 1180); C_(480, 760); C_(830, 760);
        C_(480, 1200); C_(830, 1200);
        return b;
      },
      spawns: [{ x: 700, y: 1810, a: -Math.PI / 2 }, { x: 700, y: 190, a: Math.PI / 2 }],
      pups: [{ x: 262, y: 1012 }, { x: 1137, y: 1012 }, { x: 712, y: 662 }, { x: 712, y: 1337 }, { x: 700, y: 180 }]
    }
  ];

  var NEW_TANKS = 5;   // 4 new tanks + the classic orange fox tank
  /* single player: you + the smart fox. local 2P: five tanks. online: two. */
  function matchCount() {
    if (G.online || G.mode === 'online') return 2;
    if (G.mode === 'local') return NEW_TANKS;
    return 2;
  }

  var PUP_TYPES = [
    { k: 'health', ico: '❤️', col: '#ff4d5e' },
    { k: 'shield', ico: '🛡', col: '#4db4ff' },
    { k: 'speed', ico: '⚡', col: '#ffd23f' },
    { k: 'power', ico: '💥', col: '#ff8a3d' },
    { k: 'rapid', ico: '🔥', col: '#ff6b2c' }
  ];

  /* ---------- Audio ---------- */
  var Snd = (function () {
    var ctx = null, muted = localStorage.getItem('fox_tank_mute') === '1';
    function C() {
      try {
        if (!ctx) { var A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A(); }
        if (ctx && ctx.state === 'suspended') ctx.resume();
      } catch (e) { }
      return ctx;
    }
    function tone(f1, f2, dur, type, vol) {
      if (muted) return; var c = C(); if (!c) return;
      try {
        var o = c.createOscillator(), g = c.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(f1, c.currentTime);
        if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), c.currentTime + dur);
        g.gain.setValueAtTime(vol || 0.2, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
        o.connect(g); g.connect(c.destination);
        o.start(); o.stop(c.currentTime + dur + 0.02);
      } catch (e) { }
    }
    function noise(dur, vol, filt) {
      if (muted) return; var c = C(); if (!c) return;
      try {
        var n = Math.floor(c.sampleRate * dur);
        var buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        var s = c.createBufferSource(); s.buffer = buf;
        var g = c.createGain(); g.gain.setValueAtTime(vol || 0.3, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
        var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filt || 900;
        s.connect(f); f.connect(g); g.connect(c.destination); s.start();
      } catch (e) { }
    }
    return {
      isMuted: function () { return muted; },
      toggle: function () { muted = !muted; localStorage.setItem('fox_tank_mute', muted ? '1' : '0'); return muted; },
      fire: function () { tone(280, 90, 0.16, 'square', 0.16); noise(0.2, 0.3, 1400); },
      hit: function () { tone(180, 60, 0.14, 'sawtooth', 0.2); noise(0.14, 0.25, 700); },
      boom: function () { noise(0.6, 0.5, 420); tone(120, 32, 0.55, 'sawtooth', 0.26); },
      crate: function () { noise(0.3, 0.32, 1100); tone(200, 80, 0.2, 'triangle', 0.12); },
      pup: function () { tone(520, 1050, 0.2, 'sine', 0.2); tone(780, 1400, 0.16, 'sine', 0.1); },
      win: function () { [523, 659, 784, 1046].forEach(function (f, i) { setTimeout(function () { tone(f, f * 1.25, 0.2, 'triangle', 0.2); }, i * 130); }); },
      lose: function () { [440, 350, 260, 180].forEach(function (f, i) { setTimeout(function () { tone(f, f * 0.7, 0.26, 'sawtooth', 0.18); }, i * 150); }); },
      start: function () { tone(330, 660, 0.22, 'triangle', 0.18); }
    };
  })();

  /* ---------- Canvas ---------- */
  var cv = document.getElementById('tkCanvas');
  var ctx2 = cv.getContext('2d');
  var DPR = 1, viewW = 0, viewH = 0, scale = 1, offX = 0, offY = 0;

  function resize() {
    var r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    viewW = r.width; viewH = r.height;
    cv.width = Math.round(viewW * DPR);
    cv.height = Math.round(viewH * DPR);
    scale = Math.min(viewW / W, viewH / H);
    offX = (viewW - W * scale) / 2;
    offY = (viewH - H * scale) / 2;
    var p2 = document.getElementById('tkP2Ctrl');
    if (p2) p2.style.width = Math.round(r.width) + 'px';
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', function () { setTimeout(resize, 220); });

  /* ---------- Game state ---------- */
  var G = {
    running: false, mode: 'ai', arena: 0, diff: 'normal',
    tanks: [], bullets: [], parts: [], pups: [], blocks: [],
    over: false, winner: -1, t0: 0, elapsed: 0,
    shake: 0, raf: 0, last: 0, online: false, seat: 0,
    ws: null, netQ: [], lastNet: 0, banner: '', bannerT: 0,
    /* 5-tank arena: picks[0] = me, [1] = opponent / player 2, [2..4] = AI */
    picks: [0, 1, 2, 3, 4], deaths: 0, lastKill: '',
    /* per-tank settings: {p: power 0..4, hp: difficulty 0..3, team: 1 blue | 2 red | 0 solo} */
    cfg: null
  }
  try{ window._tankG=G; window._tankOnline=false; }catch(e){};

  function cfgOf(i) {
    if (!G.cfg) G.cfg = [];
    while (G.cfg.length <= i) G.cfg.push({ shell: '' });
    var c = G.cfg[i] || {};
    if (typeof c.shell !== 'string') c.shell = '';
    G.cfg[i] = c;
    return c;
  }
  /* no teams: every tank fights for itself (single player = you vs the smart fox) */
  function sameTeam() { return false; }
  var SHELL_KEYS = ['sh1', 'sh2', 'sh3', 'sh4', 'sh5', 'sh6'];
  var SHELL_LBL = { sh1: 'آتشین', sh2: 'یخی', sh3: 'پلاسما', sh4: 'طلایی', sh5: 'سمی', sh6: 'صاعقه' };
  /* جان و آسیب خودکار: از تانک انتخاب‌شده ضربدر توپ انتخاب‌شده — دیگر دستی نیست */
  var SHELL_DMG_M = { sh1: 1.20, sh2: 0.90, sh3: 1.30, sh4: 1.10, sh5: 1.15, sh6: 1.25 };
  var SHELL_HP_M = { sh1: 1.00, sh2: 1.20, sh3: 0.85, sh4: 1.10, sh5: 1.05, sh6: 0.95 };
  function tankStats(d, shellKey) {
    var k = (shellKey && SHELL_LBL[shellKey]) ? shellKey : ((d && d.shell) || 'sh1');
    var hp = Math.max(40, Math.round((d ? d.hp : 100) * (SHELL_HP_M[k] || 1)));
    var dmg = Math.max(3, Math.round((d ? d.dmg : 12) * (SHELL_DMG_M[k] || 1)));
    return { hp: hp, dmg: dmg, shell: k };
  }
  function Tank(i, sp) {
    var d = tankDef(G.picks && G.picks[i] !== undefined ? G.picks[i] : 0);
    var cf = cfgOf(i);
    var st = tankStats(d, cf.shell);
    var hp = st.hp;
    return {
      i: i, x: sp.x, y: sp.y, a: sp.a, ta: sp.a,
      vx: 0, vy: 0, hp: hp, mhp: hp,
      r: d ? d.r : 42, cool: 0, fireRate: d ? d.rate : 620,
      spd: d ? d.spd : 250, base: d ? d.spd : 250,
      bspd: d ? d.bspd : 780, bdmg: d ? d.dmg : 12,
      team: 0,
      shell: st.shell, hpAuto: st.hp, dmgAuto: st.dmg,
      tank: (G.picks && G.picks[i] !== undefined ? G.picks[i] : 0),
      name: d ? d.name : '', hull: d ? d.hull : 'p1h', turret: d ? d.turret : 'p1t',
      pvx: d && d.pvx !== undefined ? d.pvx : 0.5,
      pvy: d && d.pvy !== undefined ? d.pvy : 0.70,
      hcol: (d && d.col) || '#FF9A3C',
      kind: d ? d.kind : 'default',
      shield: 0, power: 0, rapid: 0, speedb: 0,
      hitT: 0, dead: false, recoil: 0, trackPhase: 0, respawnAt: 0,
      mv: { x: 0, y: 0 }, am: { x: 0, y: 0 }, wantFire: false,
      lastPX: sp.x, lastPY: sp.y
    };
  }

  function freeSpot(x, y, r) {
    function clear(px, py) {
      if (px < r + 44 || px > W - r - 44 || py < r + 44 || py > H - r - 44) return false;
      for (var i = 0; i < G.blocks.length; i++) {
        var b = G.blocks[i];
        if (b.solid && circleRect(px, py, r, b)) return false;
      }
      return true;
    }
    if (clear(x, y)) return { x: x, y: y };
    for (var rad = 14; rad < 520; rad += 14) {
      for (var k = 0; k < 24; k++) {
        var a = k * TAU / 24;
        var nx = x + Math.cos(a) * rad, ny = y + Math.sin(a) * rad;
        if (clear(nx, ny)) return { x: nx, y: ny };
      }
    }
    return { x: x, y: y };
  }

  function spawnPoints(A, n) {
    var list = [A.spawns[0], A.spawns[1]];
    var cx = W / 2, cy = H / 2;
    if (n > 2) {
      list.push({ x: cx - 430, y: A.spawns[0].y, a: A.spawns[0].a });
      list.push({ x: cx + 430, y: A.spawns[0].y, a: A.spawns[0].a });
    }
    if (n > 4) list.push({ x: cx, y: cy, a: A.spawns[0].a });
    if (n > 5) {
      list.push({ x: cx - 430, y: A.spawns[1].y, a: A.spawns[1].a });
      list.push({ x: cx + 430, y: A.spawns[1].y, a: A.spawns[1].a });
    }
    return list;
  }

  function loadArena(idx) {
    var A = ARENAS[idx];
    G.arena = idx;
    G.blocks = A.blocks();
    G.pups = [];
    G.bullets = []; G.parts = [];
    var n = matchCount();
    var pts = spawnPoints(A, n);
    G.tanks = [];
    for (var q = 0; q < n; q++) G.tanks.push(Tank(q, pts[q] || A.spawns[0]));
    G.deaths = 0; G.lastKill = '';
    for (var si = 0; si < G.tanks.length; si++) {
      var tk0 = G.tanks[si];
      var fs = freeSpot(tk0.x, tk0.y, tk0.r);
      for (var pass = 0; pass < 24; pass++) {
        var clash = false;
        for (var pj = 0; pj < si; pj++) {
          var o0 = G.tanks[pj];
          if (Math.hypot(fs.x - o0.x, fs.y - o0.y) < tk0.r + o0.r + 16) { clash = true; break; }
        }
        if (!clash) break;
        var an0 = pass * (TAU / 24);
        fs = freeSpot(tk0.x + Math.cos(an0) * (70 + pass * 26),
                      tk0.y + Math.sin(an0) * (70 + pass * 26), tk0.r);
      }
      tk0.x = fs.x; tk0.y = fs.y;
      tk0.lastPX = fs.x; tk0.lastPY = fs.y;
    }
    G.over = false; G.winner = -1;
    G.t0 = performance.now(); G.elapsed = 0;
    G.pupTimer = 2600;
    G.netSeq = 0; G.lastNet = 0;
    for (var ri = 0; ri < G.tanks.length; ri++) {
      G.tanks[ri]._buf = null; G.tanks[ri]._clock = 0; G.tanks[ri]._seq = undefined;
    }
    document.getElementById('tkArenaName').textContent = A.name;
    syncHUD();
  }

  /* ---------- Collision ---------- */
  function circleRect(cx, cy, cr, r) {
    var nx = clamp(cx, r.x, r.x + r.w), ny = clamp(cy, r.y, r.y + r.h);
    var dx = cx - nx, dy = cy - ny;
    return dx * dx + dy * dy < cr * cr;
  }
  function resolveTank(t, nx, ny) {
    var ox = t.x, oy = t.y;
    t.x = nx;
    for (var i = 0; i < G.blocks.length; i++) {
      var b = G.blocks[i]; if (!b.solid) continue;
      if (circleRect(t.x, t.y, t.r, b)) { t.x = ox; break; }
    }
    t.y = ny;
    for (var j = 0; j < G.blocks.length; j++) {
      var b2 = G.blocks[j]; if (!b2.solid) continue;
      if (circleRect(t.x, t.y, t.r, b2)) { t.y = oy; break; }
    }
    // tank vs tank (any number of tanks share the arena)
    for (var ti2 = 0; ti2 < G.tanks.length; ti2++) {
      var o = G.tanks[ti2];
      if (!o || o === t || o.dead) continue;
      var dx = t.x - o.x, dy = t.y - o.y, d = Math.hypot(dx, dy), md = t.r + o.r;
      if (d > 0 && d < md) {
        var push = (md - d) / 2;
        if (G.online) {
          // only ever move MY OWN tank; shoving the replica desynced both screens
          t.x += dx / d * (md - d); t.y += dy / d * (md - d);
        } else {
          t.x += dx / d * push; t.y += dy / d * push;
          o.x -= dx / d * push; o.y -= dy / d * push;
        }
      }
    }
    t.x = clamp(t.x, t.r + 40, W - t.r - 40);
    t.y = clamp(t.y, t.r + 40, H - t.r - 40);
  }

  /* ---------- Particles ---------- */
  function burst(x, y, n, col, spd, life, size) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * TAU, s = rnd(spd * 0.35, spd);
      G.parts.push({
        x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: rnd(life * 0.55, life), max: life,
        col: col, sz: rnd(size * 0.5, size)
      });
    }
  }
  function smoke(x, y, n) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * TAU, s = rnd(10, 60);
      G.parts.push({
        x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: rnd(0.5, 1.1), max: 1.1, col: 'smoke', sz: rnd(10, 26)
      });
    }
  }

  /* ---------- Firing ---------- */
  function tankDmg(t) {
    var base = (t && t.bdmg) || 12;
    var pm = SHELL_DMG_M[(t && t.shell) || 'sh1'] || 1;
    var dmg = Math.max(3, Math.round(base * pm));
    return (t && t.power > 0) ? Math.round(dmg * 1.5) : dmg;
  }
  function fire(t) {
    if (t.dead || t.cool > 0) return;
    var rate = t.rapid > 0 ? t.fireRate * 0.42 : t.fireRate;
    t.cool = rate;
    t.recoil = 1;
    var mx = Math.cos(t.ta), my = Math.sin(t.ta);
    var bx = t.x + mx * 62, by = t.y + my * 62;
    var bs = (t.bspd || 780);
    G.bullets.push({
      x: bx, y: by, vx: mx * bs, vy: my * bs,
      own: t.i, dmg: tankDmg(t), r: 7, tx: t.tank, sh: t.shell,
      life: 2.6, pw: t.power > 0
    });
    burst(bx, by, 9, t.hcol || '#ffb04a', 220, 0.32, 7);
    G.shake = Math.max(G.shake, 5);
    Snd.fire();
    if (G.online && t.i === G.seat) {
      netSend({ t: 'fire', a: +t.ta.toFixed(3), x: Math.round(t.x), y: Math.round(t.y),
                dmg: tankDmg(t), pw: t.power > 0 ? 1 : 0, tx: t.tank, bs: bs, sh: t.shell });
    }
  }

  function damage(t, dmg, fromX, fromY) {
    if (t.dead) return;
    if (t.shield > 0) { dmg = Math.round(dmg * 0.35); }
    t.hp -= dmg;
    t.hitT = 1;
    var ang = Math.atan2(t.y - fromY, t.x - fromX);
    t.vx += Math.cos(ang) * 90; t.vy += Math.sin(ang) * 90;
    burst(t.x, t.y, 16, '#ff7a2f', 260, 0.45, 8);
    G.shake = Math.max(G.shake, 9);
    Snd.hit();
    if (t.hp <= 0) {
      t.hp = 0; t.dead = true;
      onDeath(t);
    }
    // I own my health: publish it the instant it changes so the other screen
    // never shows a stale HP bar (waiting for the next tick lost whole hits
    // on a lossy link)
    if (G.online && t.i === G.seat) netPush();
    syncHUD();
  }

  /* ---------- Power-ups ---------- */
  function spawnPup() {
    var A = ARENAS[G.arena];
    var spots = A.pups.filter(function (s) {
      return !G.pups.some(function (p) { return Math.hypot(p.x - s.x, p.y - s.y) < 40; });
    });
    if (!spots.length) return;
    var s = spots[Math.floor(Math.random() * spots.length)];
    var fs = freeSpot(s.x, s.y, 30);
    var ty = PUP_TYPES[Math.floor(Math.random() * PUP_TYPES.length)];
    G.pups.push({ x: fs.x, y: fs.y, k: ty.k, ico: ty.ico, col: ty.col, t: 0 });
  }
  function crateHit(idx, dmg) {
    var bk = G.blocks[idx];
    if (!bk || !bk.solid || bk.kind !== 'crate' || bk.hp === undefined) return;
    bk.hp -= dmg;
    Snd.crate();
    if (bk.hp <= 0) {
      burst(bk.x + bk.w / 2, bk.y + bk.h / 2, 30, '#c98c46', 300, 0.8, 11);
      smoke(bk.x + bk.w / 2, bk.y + bk.h / 2, 12);
      bk.solid = false; bk.gone = 1; G.shake = Math.max(G.shake, 8);
    }
  }

  function takePup(t, p) {
    if (p.k === 'health') t.hp = Math.min(t.mhp, t.hp + 30);
    else if (p.k === 'shield') t.shield = 8000;
    else if (p.k === 'speed') { t.speedb = 7000; }
    else if (p.k === 'power') t.power = 8000;
    else if (p.k === 'rapid') t.rapid = 7000;
    burst(p.x, p.y, 22, p.col, 240, 0.5, 8);
    Snd.pup(); syncHUD();
  }

  /* ---------- AI ---------- */
  function nearestFoe(t) {
    var best = null, bd = 1e9;
    for (var i = 0; i < G.tanks.length; i++) {
      var o = G.tanks[i];
      if (!o || o === t || o.dead) continue;
      var d = Math.hypot(o.x - t.x, o.y - t.y);
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  }
  function aiThink(t, dt) {
    var e = nearestFoe(t);
    if (!e || t.dead) { t.mv.x = t.mv.y = 0; t.wantFire = false; return; }
    var D = G.diff;
    var acc = D === 'easy' ? 0.28 : D === 'hard' ? 0.055 : 0.13;
    var react = D === 'easy' ? 1.6 : D === 'hard' ? 0.5 : 0.95;

    var dx = e.x - t.x, dy = e.y - t.y, dist = Math.hypot(dx, dy);
    // lead the target a bit on hard
    var lead = D === 'hard' ? dist / 780 : D === 'normal' ? dist / 1400 : 0;
    var aimX = e.x + e.vx * lead, aimY = e.y + e.vy * lead;
    var want = Math.atan2(aimY - t.y, aimX - t.x);
    t._aiA = t._aiA === undefined ? t.ta : t._aiA;
    t._aiA = angLerp(t._aiA, want + (Math.random() - 0.5) * acc, 1 - Math.pow(0.001, dt));
    t.am.x = Math.cos(t._aiA); t.am.y = Math.sin(t._aiA);

    // line of sight
    var los = hasLOS(t.x, t.y, e.x, e.y);
    t._fireT = (t._fireT || 0) - dt;
    var aligned = Math.abs(angDiff(t.ta, want)) < (D === 'hard' ? 0.13 : 0.22);
    t.wantFire = los && aligned && t._fireT <= 0;
    if (t.wantFire) t._fireT = react * rnd(0.6, 1.2);

    // movement: seek good range, strafe, dodge, grab pups
    var target = null;
    var near = null, nd = 1e9;
    for (var i = 0; i < G.pups.length; i++) {
      var d2 = Math.hypot(G.pups[i].x - t.x, G.pups[i].y - t.y);
      if (d2 < nd) { nd = d2; near = G.pups[i]; }
    }
    var lowHP = t.hp < 45;
    if (near && (nd < 420 || lowHP)) target = near;

    var mx = 0, my = 0;
    if (target) {
      mx = target.x - t.x; my = target.y - t.y;
    } else {
      var ideal = 520;
      var k = dist > ideal + 90 ? 1 : dist < ideal - 90 ? -1 : 0;
      mx = dx / (dist || 1) * k; my = dy / (dist || 1) * k;
      // strafe
      t._str = (t._str || 1);
      if (Math.random() < 0.006) t._str *= -1;
      mx += -dy / (dist || 1) * 0.85 * t._str;
      my += dx / (dist || 1) * 0.85 * t._str;
    }
    // avoid incoming bullets
    for (var b = 0; b < G.bullets.length; b++) {
      var bl = G.bullets[b]; if (bl.own === t.i) continue;
      var rx = t.x - bl.x, ry = t.y - bl.y;
      var bd = Math.hypot(rx, ry);
      if (bd < 340) {
        var ba = Math.atan2(bl.vy, bl.vx), ta2 = Math.atan2(ry, rx);
        if (Math.abs(angDiff(ba, ta2)) < 0.42) {
          mx += -bl.vy / 780 * 2.4; my += bl.vx / 780 * 2.4;
        }
      }
    }
    // wall avoidance
    var pad = 190;
    if (t.x < pad) mx += 1.1; if (t.x > W - pad) mx -= 1.1;
    if (t.y < pad) my += 1.1; if (t.y > H - pad) my -= 1.1;
    // unstick
    var moved = Math.hypot(t.x - t.lastPX, t.y - t.lastPY);
    t._stuck = moved < 0.7 ? (t._stuck || 0) + dt : 0;
    if (t._stuck > 0.45) {
      t._jA = t._jA === undefined || Math.random() < 0.02 ? Math.random() * TAU : t._jA;
      mx = Math.cos(t._jA) * 1.5; my = Math.sin(t._jA) * 1.5;
      if (t._stuck > 1.5) t._stuck = 0;
    }
    t.lastPX = t.x; t.lastPY = t.y;
    var m = Math.hypot(mx, my);
    if (m > 0.001) { t.mv.x = mx / m; t.mv.y = my / m; } else { t.mv.x = t.mv.y = 0; }
  }

  function hasLOS(x1, y1, x2, y2) {
    var steps = 22, dx = (x2 - x1) / steps, dy = (y2 - y1) / steps;
    for (var s = 1; s < steps; s++) {
      var px = x1 + dx * s, py = y1 + dy * s;
      for (var i = 0; i < G.blocks.length; i++) {
        var b = G.blocks[i]; if (!b.solid) continue;
        if (px > b.x && px < b.x + b.w && py > b.y && py < b.y + b.h) return false;
      }
    }
    return true;
  }

  /* ---------- Update ---------- */
  function update(dt) {
    G.elapsed = (performance.now() - G.t0) / 1000;
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 42);

    for (var i = 0; i < G.tanks.length; i++) {
      var t = G.tanks[i];
      if (t.dead) {
        if (!G.online && t.respawnAt && G.elapsed >= t.respawnAt) respawnTank(t);
        continue;
      }

      // any tank that is not driven by a human thinks for itself
      var human = G.online ? (i === G.seat) : (G.mode === 'local' ? (i < 2) : (i === 0));
      if (!human) aiThink(t, dt);

      // ONLINE: the opponent tank is NOT simulated here. Running local physics
      // on it (velocity, friction, wall blocking, tank-vs-tank push) made every
      // screen drift into its own private world. It is now a pure replica of
      // the authoritative state its real owner broadcasts.
      if (G.online && i !== G.seat) {
        t.cool = Math.max(0, t.cool - dt * 1000);
        t.hitT = Math.max(0, t.hitT - dt * 2.6);
        t.recoil = Math.max(0, t.recoil - dt * 5.2);
        netLerp(t, dt);
        continue;
      }

      // timers
      t.cool = Math.max(0, t.cool - dt * 1000);
      t.shield = Math.max(0, t.shield - dt * 1000);
      t.power = Math.max(0, t.power - dt * 1000);
      t.rapid = Math.max(0, t.rapid - dt * 1000);
      t.speedb = Math.max(0, t.speedb - dt * 1000);
      t.hitT = Math.max(0, t.hitT - dt * 2.6);
      t.recoil = Math.max(0, t.recoil - dt * 5.2);

      var sp = t.base * (t.speedb > 0 ? 1.5 : 1);
      var mag = Math.hypot(t.mv.x, t.mv.y);
      if (mag > 0.08) {
        var wa = Math.atan2(t.mv.y, t.mv.x);
        t.a = angLerp(t.a, wa, 1 - Math.pow(0.0009, dt));
        var align = Math.max(0, Math.cos(angDiff(t.a, wa)));
        t.vx += Math.cos(t.a) * sp * align * dt * 7.5;
        t.vy += Math.sin(t.a) * sp * align * dt * 7.5;
        t.trackPhase += dt * 9;
      }
      // friction
      var fr = Math.pow(0.0016, dt);
      t.vx *= fr; t.vy *= fr;
      var vm = Math.hypot(t.vx, t.vy);
      if (vm > sp) { t.vx = t.vx / vm * sp; t.vy = t.vy / vm * sp; }
      resolveTank(t, t.x + t.vx * dt, t.y + t.vy * dt);

      // turret aim
      if (Math.hypot(t.am.x, t.am.y) > 0.12) {
        var wt = Math.atan2(t.am.y, t.am.x);
        t.ta = angLerp(t.ta, wt, 1 - Math.pow(0.00005, dt));
      }
      if (t.wantFire) fire(t);

      // pickups
      for (var p = G.pups.length - 1; p >= 0; p--) {
        var pu = G.pups[p];
        if (Math.hypot(pu.x - t.x, pu.y - t.y) < t.r + 26) {
          takePup(t, pu); G.pups.splice(p, 1);
          if (G.online) netSend({ t: 'pup', x: pu.x, y: pu.y, k: pu.k, who: t.i });
        }
      }
    }

    // bullets
    for (var b = G.bullets.length - 1; b >= 0; b--) {
      var bl = G.bullets[b];
      bl.life -= dt;
      var nx = bl.x + bl.vx * dt, ny = bl.y + bl.vy * dt;
      var gone = bl.life <= 0;
      if (!gone) {
        for (var k2 = 0; k2 < G.blocks.length; k2++) {
          var bk = G.blocks[k2]; if (!bk.solid) continue;
          if (circleRect(nx, ny, bl.r, bk)) {
            burst(nx, ny, 12, bk.kind === 'crate' ? '#c98c46' : '#9aa3ad', 220, 0.4, 7);
            if (bk.kind === 'crate' && bk.hp !== undefined) {
              // only the shooter resolves crate damage, then tells the peer,
              // so a crate never survives on one screen and vanishes on the other
              if (!G.online || bl.own === G.seat) {
                crateHit(k2, bl.pw ? 2 : 1);
                if (G.online) netSend({ t: 'ch', i: k2, d: bl.pw ? 2 : 1 });
              } else { Snd.crate(); }
            } else { Snd.hit(); }
            gone = true; break;
          }
        }
      }
      if (!gone) {
        for (var ti = 0; ti < G.tanks.length; ti++) {
          var tk = G.tanks[ti];
          if (tk.dead || ti === bl.own) continue;
          if (Math.hypot(nx - tk.x, ny - tk.y) < tk.r + bl.r) {
            if (!G.online) {
              damage(tk, bl.dmg, bl.x, bl.y);
            } else if (bl.own === G.seat) {
              // I hit them: I own this bullet, so I report it. They apply the
              // damage to themselves and broadcast the resulting HP.
              netSend({ t: 'hit', dmg: bl.dmg, fx: bl.x, fy: bl.y });
              // optimistic local echo so the hit reads instantly at my end;
              // the victim's authoritative HP overwrites this a moment later
              tk.hp = Math.max(0, tk.hp - (tk.shield > 0 ? Math.round(bl.dmg * 0.35) : bl.dmg));
              tk.hitT = 1;
              burst(nx, ny, 14, '#ff7a2f', 240, 0.4, 8);
              G.shake = Math.max(G.shake, 9);
              Snd.hit(); syncHUD();
            } else {
              // their bullet on my screen is cosmetic only — the real hit
              // arrives as a 'hit' message, so counting it here would double-hit
              burst(nx, ny, 10, '#ff9a3c', 200, 0.34, 7);
            }
            gone = true; break;
          }
        }
      }
      if (gone) { G.bullets.splice(b, 1); continue; }
      bl.x = nx; bl.y = ny;
    }

    // particles
    for (var q = G.parts.length - 1; q >= 0; q--) {
      var pt = G.parts[q];
      pt.life -= dt;
      if (pt.life <= 0) { G.parts.splice(q, 1); continue; }
      pt.x += pt.vx * dt; pt.y += pt.vy * dt;
      pt.vx *= Math.pow(0.12, dt); pt.vy *= Math.pow(0.12, dt);
    }

    // pups
    for (var z = 0; z < G.pups.length; z++) G.pups[z].t += dt;
    if (!G.online || G.seat === 0) {
      G.pupTimer -= dt * 1000;
      if (G.pupTimer <= 0 && G.pups.length < 3) {
        G.pupTimer = rnd(7000, 12000);
        spawnPup();
        if (G.online) {
          var lp = G.pups[G.pups.length - 1];
          if (lp) netSend({ t: 'spup', x: lp.x, y: lp.y, k: lp.k });
        }
      }
    }

    if (G.online) netTick(dt);
    if (G.bannerT > 0) G.bannerT -= dt;

    /* ---------- victory: last tank standing (free for all) ---------- */
    if (!G.over && !G.online) {
      var liveRep = null, liveN = 0;
      for (var w2 = 0; w2 < G.tanks.length; w2++) {
        var tw = G.tanks[w2];
        if (tw.dead) continue;
        liveN++; liveRep = tw;
      }
      if (liveN <= 1) endGame(liveRep ? liveRep.i : 0);
    }
  }

  /* ---------- Render ---------- */
  function drawGround() {
    var A = ARENAS[G.arena];
    ctx2.fillStyle = A.ground;
    ctx2.fillRect(0, 0, W, H);
    // subtle vignette-ish panels
    ctx2.fillStyle = A.accent;
    for (var y = 0; y < H; y += 200) {
      for (var x = 0; x < W; x += 200) {
        if (((x / 200 + y / 200) | 0) % 2 === 0) ctx2.fillRect(x, y, 200, 200);
      }
    }
    ctx2.strokeStyle = A.grid; ctx2.lineWidth = 2; ctx2.globalAlpha = 0.5;
    ctx2.beginPath();
    for (var gx = 0; gx <= W; gx += 100) { ctx2.moveTo(gx, 0); ctx2.lineTo(gx, H); }
    for (var gy = 0; gy <= H; gy += 100) { ctx2.moveTo(0, gy); ctx2.lineTo(W, gy); }
    ctx2.stroke(); ctx2.globalAlpha = 1;
    // center emblem
    ctx2.save();
    ctx2.globalAlpha = 0.07; ctx2.fillStyle = '#FF7A00';
    ctx2.beginPath(); ctx2.arc(W / 2, H / 2, 210, 0, TAU); ctx2.fill();
    ctx2.restore();
  }

  function drawBlocks() {
    for (var i = 0; i < G.blocks.length; i++) {
      var b = G.blocks[i];
      if (b.gone) continue;
      var im = b.kind === 'crate' ? IMG.crate : b.kind === 'rock' ? IMG.rock : IMG.wall;
      if (im && im.complete && im.naturalWidth) {
        if (b.kind === 'wall') {
          var tw = 64;
          for (var x = b.x; x < b.x + b.w; x += tw) {
            for (var y = b.y; y < b.y + b.h; y += tw) {
              var ww = Math.min(tw, b.x + b.w - x), hh = Math.min(tw, b.y + b.h - y);
              ctx2.drawImage(im, 0, 0, im.naturalWidth * (ww / tw), im.naturalHeight * (hh / tw), x, y, ww, hh);
            }
          }
        } else {
          ctx2.drawImage(im, b.x, b.y, b.w, b.h);
        }
      } else {
        ctx2.fillStyle = b.kind === 'crate' ? '#8a6234' : b.kind === 'rock' ? '#6d7278' : '#3b4148';
        ctx2.fillRect(b.x, b.y, b.w, b.h);
      }
      if (b.kind === 'crate' && b.hp !== undefined && b.hp < b.mhp) {
        ctx2.save();
        ctx2.globalAlpha = 0.5;
        ctx2.strokeStyle = '#1a0f06'; ctx2.lineWidth = 3;
        for (var c = 0; c < (b.mhp - b.hp); c++) {
          ctx2.beginPath();
          ctx2.moveTo(b.x + 10 + c * 16, b.y + 8);
          ctx2.lineTo(b.x + 22 + c * 12, b.y + b.h - 8);
          ctx2.stroke();
        }
        ctx2.restore();
      }
    }
  }

  function drawTank(t) {
    if (t.dead) return;
    var hull = IMG2[t.hull] || (t.i === 0 ? IMG.p1h : IMG.p2h);
    var tur = IMG2[t.turret] || (t.i === 0 ? IMG.p1t : IMG.p2t);
    var hs = SPR2[t.hull] || SPR.p1h;
    var ts = SPR2[t.turret] || SPR.p1t;
    var isNew = t.kind === 'new';

    ctx2.save();
    ctx2.translate(t.x, t.y);

    // shadow
    ctx2.save();
    ctx2.globalAlpha = 0.34; ctx2.fillStyle = '#000';
    ctx2.beginPath(); ctx2.ellipse(5, 8, 46, 40, 0, 0, TAU); ctx2.fill();
    ctx2.restore();

    // shield ring
    if (t.shield > 0) {
      ctx2.save();
      var pul = 0.55 + Math.sin(performance.now() / 150) * 0.2;
      ctx2.globalAlpha = pul;
      ctx2.strokeStyle = '#4db4ff'; ctx2.lineWidth = 4;
      ctx2.beginPath(); ctx2.arc(0, 0, 56, 0, TAU); ctx2.stroke();
      ctx2.globalAlpha = 0.14; ctx2.fillStyle = '#4db4ff';
      ctx2.beginPath(); ctx2.arc(0, 0, 56, 0, TAU); ctx2.fill();
      ctx2.restore();
    }

    // HULL (sprite faces up => +PI/2)
    ctx2.save();
    ctx2.rotate(t.a + Math.PI / 2);
    var HW = 104, HH = HW * (hs.h / hs.w);
    if (hull && hull.complete && hull.naturalWidth) ctx2.drawImage(hull, -HW / 2, -HH / 2, HW, HH);
    else { ctx2.fillStyle = t.hcol || (t.i === 0 ? '#d1762a' : '#dfe3e8'); ctx2.fillRect(-HW / 2, -HH / 2, HW, HH); }
    ctx2.restore();

    // TURRET
    ctx2.save();
    ctx2.rotate(t.ta + Math.PI / 2);
    ctx2.translate(0, t.recoil * 9);
    var TW = isNew ? 82 : 86, TH = TW * (ts.h / ts.w);
    var pv = (t.pvy !== undefined ? t.pvy : (t.i === 0 ? TURRET_PIVOT.p1t : TURRET_PIVOT.p2t));
    var pvx = (t.pvx !== undefined ? t.pvx : 0.5);
    if (tur && tur.complete && tur.naturalWidth) ctx2.drawImage(tur, -TW * pvx, -TH * pv, TW, TH);
    else { ctx2.fillStyle = t.hcol || (t.i === 0 ? '#e08a35' : '#f0f3f6'); ctx2.fillRect(-16, -TH * pv, 32, TH); }
    ctx2.restore();

    // hit flash
    if (t.hitT > 0) {
      ctx2.save();
      ctx2.globalAlpha = t.hitT * 0.55;
      ctx2.globalCompositeOperation = 'lighter';
      ctx2.fillStyle = '#ff5b2e';
      ctx2.beginPath(); ctx2.arc(0, 0, 52, 0, TAU); ctx2.fill();
      ctx2.restore();
    }
    // damage smoke
    if (t.hp < t.mhp * 0.35 && Math.random() < 0.3) smoke(t.x + rnd(-14, 14), t.y + rnd(-14, 14), 1);

    ctx2.restore();

    // nameplate + mini hp
    ctx2.save();
    ctx2.translate(t.x, t.y - 74);
    ctx2.fillStyle = 'rgba(8,6,4,.62)';
    ctx2.beginPath();
    var rw = 92, rh = 12;
    ctx2.roundRect ? ctx2.roundRect(-rw / 2, -rh / 2, rw, rh, 6) : ctx2.rect(-rw / 2, -rh / 2, rw, rh);
    ctx2.fill();
    var col = t.hcol || (t.i === 0 ? '#FF9A3C' : '#EDEFF2');
    ctx2.fillStyle = col;
    var pw = (rw - 6) * (t.hp / t.mhp);
    ctx2.beginPath();
    ctx2.roundRect ? ctx2.roundRect(-rw / 2 + 3, -rh / 2 + 3, Math.max(0, pw), rh - 6, 4) : ctx2.rect(-rw / 2 + 3, -rh / 2 + 3, Math.max(0, pw), rh - 6);
    ctx2.fill();
    ctx2.restore();
  }

  function drawBullets() {
    for (var i = 0; i < G.bullets.length; i++) {
      var b = G.bullets[i];
      var a = Math.atan2(b.vy, b.vx);
      ctx2.save();
      ctx2.translate(b.x, b.y); ctx2.rotate(a);
      /* tracer flame */
      ctx2.globalCompositeOperation = 'lighter';
      var g = ctx2.createLinearGradient(-42, 0, 10, 0);
      g.addColorStop(0, 'rgba(255,140,40,0)');
      g.addColorStop(1, b.pw ? 'rgba(255,220,120,.95)' : 'rgba(255,170,70,.85)');
      ctx2.fillStyle = g;
      ctx2.beginPath(); ctx2.ellipse(-22, 0, b.pw ? 36 : 28, b.pw ? 9 : 7, 0, 0, TAU); ctx2.fill();
      ctx2.globalCompositeOperation = 'source-over';
      /* shell artwork */
      var sd = tankDef(b.tx);
      var shKey = b.sh || (sd && sd.shell) || 'sh1';
      var sh = IMG2[shKey];
      var ssp = SPR2[shKey];
      if (sh && ssp && sh.complete && sh.naturalWidth) {
        var sw = b.pw ? 90 : 78;
        var sh2 = sw * (ssp.h / ssp.w);
        var glow = (sd && sd.col) || '#ffd9a0';
        ctx2.save();
        ctx2.globalAlpha = b.pw ? 0.7 : 0.38;
        ctx2.globalCompositeOperation = 'lighter';
        ctx2.drawImage(sh, -sw * 0.5, -sh2 * 0.5, sw * 1.3, sh2 * 1.3);
        ctx2.restore();
        ctx2.save();
        ctx2.shadowColor = glow;
        ctx2.shadowBlur = 16;
        ctx2.drawImage(sh, -sw / 2, -sh2 / 2, sw, sh2);
        ctx2.restore();
        ctx2.drawImage(sh, -sw / 2, -sh2 / 2, sw, sh2);
      } else {
        ctx2.globalCompositeOperation = 'lighter';
        ctx2.fillStyle = b.pw ? '#fff3cf' : '#ffd9a0';
        ctx2.beginPath(); ctx2.arc(0, 0, b.pw ? 8 : 6, 0, TAU); ctx2.fill();
      }
      ctx2.restore();
    }
  }

  function drawParts() {
    ctx2.save();
    for (var i = 0; i < G.parts.length; i++) {
      var p = G.parts[i], k = p.life / p.max;
      if (p.col === 'smoke') {
        ctx2.globalAlpha = k * 0.34;
        ctx2.fillStyle = '#8d8d8d';
        ctx2.beginPath(); ctx2.arc(p.x, p.y, p.sz * (2 - k), 0, TAU); ctx2.fill();
      } else {
        ctx2.globalCompositeOperation = 'lighter';
        ctx2.globalAlpha = k;
        ctx2.fillStyle = p.col;
        ctx2.beginPath(); ctx2.arc(p.x, p.y, p.sz * k, 0, TAU); ctx2.fill();
        ctx2.globalCompositeOperation = 'source-over';
      }
    }
    ctx2.restore();
  }

  function drawPups() {
    for (var i = 0; i < G.pups.length; i++) {
      var p = G.pups[i];
      var bob = Math.sin(p.t * 3) * 6;
      ctx2.save();
      ctx2.translate(p.x, p.y + bob);
      ctx2.globalAlpha = 0.28;
      ctx2.fillStyle = p.col;
      ctx2.beginPath(); ctx2.arc(0, 0, 34 + Math.sin(p.t * 4) * 4, 0, TAU); ctx2.fill();
      ctx2.globalAlpha = 1;
      ctx2.fillStyle = 'rgba(18,12,7,.85)';
      ctx2.beginPath(); ctx2.arc(0, 0, 25, 0, TAU); ctx2.fill();
      ctx2.strokeStyle = p.col; ctx2.lineWidth = 3;
      ctx2.beginPath(); ctx2.arc(0, 0, 25, 0, TAU); ctx2.stroke();
      ctx2.font = '26px system-ui,sans-serif';
      ctx2.textAlign = 'center'; ctx2.textBaseline = 'middle';
      ctx2.fillText(p.ico, 0, 2);
      ctx2.restore();
    }
  }

  function render() {
    ctx2.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx2.clearRect(0, 0, viewW, viewH);
    ctx2.fillStyle = '#0b0906';
    ctx2.fillRect(0, 0, viewW, viewH);
    var sx = G.shake ? rnd(-G.shake, G.shake) : 0;
    var sy = G.shake ? rnd(-G.shake, G.shake) : 0;
    ctx2.save();
    ctx2.translate(offX + sx, offY + sy);
    ctx2.scale(scale, scale);
    drawGround();
    drawBlocks();
    drawPups();
    drawParts();
    for (var i = 0; i < G.tanks.length; i++) drawTank(G.tanks[i]);
    drawBullets();
    ctx2.restore();
  }

  /* ---------- Loop ---------- */
  function loop(ts) {
    if (!G.running) return;
    G.raf = requestAnimationFrame(loop);
    if (!G.last) G.last = ts;
    var dt = Math.min((ts - G.last) / 1000, 0.05);
    G.last = ts;
    readInput();
    if (!G.over) update(dt);
    render();
    updateHUDLive();
  }
  function start() {
    G.running = true; G.last = 0;
    cancelAnimationFrame(G.raf);
    G.raf = requestAnimationFrame(loop);
  }
  function stop() { G.running = false; cancelAnimationFrame(G.raf); }

  /* ---------- HUD ---------- */
  function hudIndexOf(t) {
    if (!t) return 0;
    if (G.online) return t.i === G.seat ? 0 : 1;
    if (G.mode === 'local') return t.i < 2 ? t.i : 0;
    return t.i === 0 ? 0 : 1;
  }
  function syncHUD() {
    var _slot = [null, null];
    for (var q = 0; q < G.tanks.length; q++) {
      var tq = G.tanks[q]; if (!tq) continue;
      var sIdx = hudIndexOf(tq);
      if (!_slot[sIdx]) _slot[sIdx] = tq;
    }
    for (var i = 0; i < 2; i++) {
      var t = _slot[i]; if (!t) continue;
      var bar = document.getElementById('tkHp' + i);
      var num = document.getElementById('tkHpN' + i);
      var nme = document.getElementById('tkName' + i);
      if (nme) {
        var who = (i === 0)
          ? 'تو'
          : (G.mode === 'local'
              ? 'بازیکن ۲'
              : (G.online ? 'حریف' : (t.name || 'روباه هوشمند')));
        nme.textContent = who;
      }
      if (bar) bar.style.width = (t.hp / t.mhp * 100) + '%';
      if (num) num.textContent = Math.max(0, Math.round(t.hp));
      var bd = document.getElementById('tkBuff' + i);
      if (bd) {
        var s = '';
        if (t.shield > 0) s += '🛡';
        if (t.speedb > 0) s += '⚡';
        if (t.power > 0) s += '💥';
        if (t.rapid > 0) s += '🔥';
        bd.textContent = s;
      }
    }
  }
  function updateHUDLive() {
    syncHUD();
    var el = document.getElementById('tkTimer');
    if (el) {
      var s = Math.floor(G.elapsed), m = Math.floor(s / 60);
      el.textContent = (m < 10 ? '0' : '') + m + ':' + ((s % 60) < 10 ? '0' : '') + (s % 60);
    }
  }

  /* ---------- Controls ---------- */
  var joyL = { id: null, bx: 0, by: 0, x: 0, y: 0, act: false };
  var joyR = { id: null, bx: 0, by: 0, x: 0, y: 0, act: false };
  var keys = {};

  function setupJoy(el, J, onFire) {
    var knob = el.querySelector('.tk-knob');
    var R = 56;
    function pos(e) {
      var r = el.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    }
    function move(cx, cy, p) {
      var dx = cx - p.cx, dy = cy - p.cy;
      var d = Math.hypot(dx, dy);
      if (d > R) { dx = dx / d * R; dy = dy / d * R; }
      J.x = dx / R; J.y = dy / R;
      knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    }
    function down(e) {
      e.preventDefault();
      var tch = e.changedTouches ? e.changedTouches[0] : e;
      J.id = e.changedTouches ? tch.identifier : 'm';
      J.act = true;
      var p = pos(el);
      move(tch.clientX, tch.clientY, p);
      el.classList.add('on');
    }
    function moveH(e) {
      if (!J.act) return;
      var list = e.changedTouches ? e.changedTouches : [e];
      for (var i = 0; i < list.length; i++) {
        var tc = list[i];
        var id = e.changedTouches ? tc.identifier : 'm';
        if (id !== J.id) continue;
        e.preventDefault();
        move(tc.clientX, tc.clientY, pos(el));
      }
    }
    function up(e) {
      if (!J.act) return;
      var list = e.changedTouches ? e.changedTouches : [e];
      for (var i = 0; i < list.length; i++) {
        var id = e.changedTouches ? list[i].identifier : 'm';
        if (id !== J.id) continue;
        J.act = false; J.id = null; J.x = 0; J.y = 0;
        knob.style.transform = 'translate(0,0)';
        el.classList.remove('on');
      }
    }
    el.addEventListener('touchstart', down, { passive: false });
    el.addEventListener('touchmove', moveH, { passive: false });
    el.addEventListener('touchend', up); el.addEventListener('touchcancel', up);
    el.addEventListener('mousedown', down);
    window.addEventListener('mousemove', moveH);
    window.addEventListener('mouseup', up);
  }

  function readInput() {
    if (G.over) {
      for (var z = 0; z < G.tanks.length; z++) { G.tanks[z].mv.x = 0; G.tanks[z].mv.y = 0; G.tanks[z].wantFire = false; }
      return;
    }
    var me = G.online ? G.tanks[G.seat] : G.tanks[0];
    if (me) me.wantFire = false;
    if (G.mode === 'local' && G.tanks[1]) G.tanks[1].wantFire = false;
    if (me && !me.dead) {
      var mx = joyL.x, my = joyL.y;
      if (keys['w'] || keys['arrowup']) my -= 1;
      if (keys['s'] || keys['arrowdown']) my += 1;
      if (keys['a'] || keys['arrowleft']) mx -= 1;
      if (keys['d'] || keys['arrowright']) mx += 1;
      var m = Math.hypot(mx, my);
      me.mv.x = m > 1 ? mx / m : mx;
      me.mv.y = m > 1 ? my / m : my;
      var ax = joyR.x, ay = joyR.y;
      if (keys['j']) ax -= 1; if (keys['l']) ax += 1;
      if (keys['i']) ay -= 1; if (keys['k']) ay += 1;
      if (Math.hypot(ax, ay) > 0.12) { me.am.x = ax; me.am.y = ay; }
      if (joyR.act && Math.hypot(joyR.x, joyR.y) > 0.82 && G.autoFire) me.wantFire = true;
      if (keys[' ']) me.wantFire = true;
    }
    // Local 2P: player 2 on keyboard
    if (G.mode === 'local') {
      var p2 = G.tanks[1];
      if (p2 && !p2.dead) {
        var bx = 0, by = 0;
        if (keys['t']) by -= 1; if (keys['g']) by += 1;
        if (keys['f']) bx -= 1; if (keys['h']) bx += 1;
        var bm = Math.hypot(bx, by);
        if (bm > 0) { p2.mv.x = bx / bm; p2.mv.y = by / bm; }
        else if (!joy2L.act) { p2.mv.x = 0; p2.mv.y = 0; }
        if (joy2L.act) { p2.mv.x = -joy2L.x; p2.mv.y = -joy2L.y; }
        if (joy2R.act && Math.hypot(joy2R.x, joy2R.y) > 0.12) { p2.am.x = -joy2R.x; p2.am.y = -joy2R.y; }
        if (keys['e'] || keys['enter']) p2.wantFire = true;
      }
    }
  }

  var joy2L = { x: 0, y: 0, act: false }, joy2R = { x: 0, y: 0, act: false };

  window.addEventListener('keydown', function (e) {
    if (!G.running) return;
    keys[e.key.toLowerCase()] = true;
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(e.key.toLowerCase()) >= 0) e.preventDefault();
  });
  window.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });

  /* ---------- Networking (WebSocket via Durable Object) ---------- */

  // The opponent arrives at 20 Hz while we draw at 60. Snapping to each packet
  // looked like teleporting, so we hold a short buffer and play it back with a
  // fixed delay: smooth motion that still tracks the authoritative path.
  var NET_DELAY = 0.11;          // seconds of deliberate playback lag
  function netLerp(t, dt) {
    var buf = t._buf;
    if (!buf || !buf.length) return;
    t._clock = (t._clock || 0) + dt;
    var target = t._clock - NET_DELAY;

    while (buf.length > 2 && buf[1].t <= target) buf.shift();

    if (buf.length === 1 || buf[0].t > target) {
      var only = buf[0];
      t.x = only.x; t.y = only.y; t.a = only.a; t.ta = only.ta;
      return;
    }
    var p0 = buf[0], p1 = buf[1];
    var span = p1.t - p0.t;
    var k = span > 0.0001 ? (target - p0.t) / span : 1;
    k = k < 0 ? 0 : k > 1 ? 1 : k;
    t.x = p0.x + (p1.x - p0.x) * k;
    t.y = p0.y + (p1.y - p0.y) * k;
    t.a = p0.a + (((p1.a - p0.a + Math.PI) % TAU + TAU) % TAU - Math.PI) * k;
    t.ta = p0.ta + (((p1.ta - p0.ta + Math.PI) % TAU + TAU) % TAU - Math.PI) * k;
  }

  function netSend(o) {
    if (!G.ws || G.ws.readyState !== 1) return;
    try { G.ws.send(JSON.stringify(o)); } catch (e) { }
  }
  function netPush() {
    if (!G.online) return;
    var me = G.tanks[G.seat];
    if (!me) return;
    G.netSeq = (G.netSeq || 0) + 1;
    netSend({
      t: 's', n: G.netSeq,
      x: Math.round(me.x), y: Math.round(me.y),
      a: +me.a.toFixed(3), ta: +me.ta.toFixed(3),
      hp: Math.round(me.hp), d: me.dead ? 1 : 0,
      sh: me.shield > 0 ? 1 : 0, sp: me.speedb > 0 ? 1 : 0,
      pw: me.power > 0 ? 1 : 0, rp: me.rapid > 0 ? 1 : 0, tx: me.tank, shl: me.shell
    });
    G.lastNet = 0;
  }

  function netTick(dt) {
    G.lastNet += dt;
    if (G.lastNet < 0.05) return;    // 20 Hz state sync
    G.lastNet = 0;
    var me = G.tanks[G.seat];
    if (!me) return;
    G.netSeq = (G.netSeq || 0) + 1;
    netSend({
      t: 's', n: G.netSeq,
      x: Math.round(me.x), y: Math.round(me.y),
      a: +me.a.toFixed(3), ta: +me.ta.toFixed(3),
      hp: Math.round(me.hp), d: me.dead ? 1 : 0,
      sh: me.shield > 0 ? 1 : 0, sp: me.speedb > 0 ? 1 : 0,
      pw: me.power > 0 ? 1 : 0, rp: me.rapid > 0 ? 1 : 0, tx: me.tank, shl: me.shell
    });
  }
  function setReplicaTank(t, idx, shellKey) {
    var d = tankDef(idx);
    if (shellKey) t.shell = shellKey;
    if (!d || t.tank === idx) return;
    t.tank = idx; t.hull = d.hull; t.turret = d.turret;
    t.hcol = d.col; t.kind = d.kind;
    t.pvx = (d.pvx !== undefined ? d.pvx : 0.5);
    t.pvy = (d.pvy !== undefined ? d.pvy : 0.7);
    t.r = d.r; t.mhp = d.hp; t.bdmg = d.dmg; t.bspd = d.bspd; t.fireRate = d.rate;
  }
  function applyNet(m) {
    var opp = G.tanks[1 - G.seat];
    if (!opp) return;

    if (m.t === 's') {
      // drop packets that arrive out of order (UDP-like reordering over relay)
      if (m.n !== undefined) {
        if (opp._seq !== undefined && m.n <= opp._seq) return;
        opp._seq = m.n;
      }
      if (!opp._buf) { opp._buf = []; opp._clock = 0; }
      // stamp on our own clock; wall-clocks between two phones are never equal
      var last = opp._buf.length ? opp._buf[opp._buf.length - 1].t : opp._clock;
      var stamp = Math.max(opp._clock, last + 0.001);
      opp._buf.push({ t: stamp, x: m.x, y: m.y, a: m.a, ta: m.ta });
      if (opp._buf.length > 14) opp._buf.shift();

      // big gap (tab resume / lag spike) -> hard snap instead of a long glide
      if (Math.hypot(m.x - opp.x, m.y - opp.y) > 420) {
        opp._buf = [{ t: opp._clock, x: m.x, y: m.y, a: m.a, ta: m.ta }];
        opp.x = m.x; opp.y = m.y; opp.a = m.a; opp.ta = m.ta;
      }

      if (m.tx !== undefined) setReplicaTank(opp, m.tx, m.shl);   // their tank + shell
      // owner is authoritative over its own HP and buffs
      if (m.hp !== undefined) opp.hp = m.hp;
      if (m.d) { if (!opp.dead) { opp.dead = true; onDeath(opp); } }
      opp.shield = m.sh ? 1 : 0;
      opp.speedb = m.sp ? 1 : 0;
      opp.power = m.pw ? 1 : 0;
      opp.rapid = m.rp ? 1 : 0;
      syncHUD();

    } else if (m.t === 'fire') {
      opp.ta = m.a; opp.recoil = 1;
      var mx = Math.cos(m.a), my = Math.sin(m.a);
      G.bullets.push({
        x: m.x + mx * 62, y: m.y + my * 62,
        vx: mx * (m.bs || 780), vy: my * (m.bs || 780), own: opp.i,
        dmg: m.dmg || 12, r: 7, life: 2.6, pw: !!m.pw,
        tx: (m.tx !== undefined ? m.tx : opp.tank),
        sh: (m.sh !== undefined ? m.sh : opp.shell)
      });
      burst(m.x + mx * 62, m.y + my * 62, 9, '#ffb04a', 220, 0.32, 7);
      Snd.fire();

    } else if (m.t === 'hit') {
      // they report hitting me; I am authoritative over my own health
      var me = G.tanks[G.seat];
      if (me && !me.dead) damage(me, m.dmg || 12, m.fx || me.x, m.fy || me.y);

    } else if (m.t === 'ch') {
      crateHit(m.i, m.d || 1);

    } else if (m.t === 'spup') {
      var ty = PUP_TYPES.filter(function (p) { return p.k === m.k; })[0] || PUP_TYPES[0];
      G.pups.push({ x: m.x, y: m.y, k: ty.k, ico: ty.ico, col: ty.col, t: 0 });

    } else if (m.t === 'pup') {
      for (var i = G.pups.length - 1; i >= 0; i--) {
        if (Math.hypot(G.pups[i].x - m.x, G.pups[i].y - m.y) < 40) {
          burst(G.pups[i].x, G.pups[i].y, 18, '#ffd23f', 230, 0.45, 8);
          G.pups.splice(i, 1);
        }
      }

    } else if (m.t === 'bye') {
      showBanner('حریف بازی را ترک کرد');
      setTimeout(function () { endGame(G.seat); }, 600);
    }
  }

  // death visuals, applied identically on both screens
  function respawnTank(t) {
    var A = ARENAS[G.arena];
    var pts = spawnPoints(A, G.tanks.length);
    var sp = pts[t.i] || A.spawns[0];
    var fs = freeSpot(sp.x, sp.y, t.r);
    t.x = fs.x; t.y = fs.y; t.lastPX = fs.x; t.lastPY = fs.y;
    t.vx = t.vy = 0; t.a = t.ta = sp.a;
    t.hp = t.mhp; t.dead = false; t.hitT = 0; t.recoil = 0; t.respawnAt = 0;
    t.shield = 0; t.power = 0; t.rapid = 0; t.speedb = 0;
    t._buf = null; t._clock = 0; t._seq = undefined;
    burst(t.x, t.y, 30, t.hcol || '#FF9A3C', 240, 0.6, 10);
    var meIdx = G.online ? G.seat : 0;
    if (t.i === meIdx) showBanner('مجدداً وارد میدان شدی');
    syncHUD();
  }

  function onDeath(t) {
    burst(t.x, t.y, 60, '#ff9a3c', 420, 1.0, 16);
    burst(t.x, t.y, 34, '#ffd98a', 300, 0.85, 11);
    smoke(t.x, t.y, 26);
    G.shake = 26; Snd.boom();
    G.deaths = (G.deaths || 0) + 1;
    if (G.tanks.length > 2) {
      // battle arena: fox tanks respawn, the round only ends at the last tank
      t.respawnAt = G.elapsed + 3.4;
      var alive = 0;
      for (var i = 0; i < G.tanks.length; i++) if (!G.tanks[i].dead) alive++;
      if (alive <= 1) {
        for (var j = 0; j < G.tanks.length; j++) if (!G.tanks[j].dead) { endGame(j); return; }
      }
      return;
    }
    endGame(1 - t.i);
  }

  function showBanner(txt) {
    G.banner = txt; G.bannerT = 2.4;
    var el = document.getElementById('tkBanner');
    if (el) { el.textContent = txt; el.classList.add('show'); setTimeout(function () { el.classList.remove('show'); }, 2200); }
  }

  /* ---------- Game over ---------- */
  function endGame(winner) {
    if (G.over) return;
    G.over = true; G.winner = winner;
    try{ if(G.online || G.mode==='online'){ var _a=document.getElementById('tkAgain'); if(_a) _a.style.display='none'; var _r=document.getElementById('tkRestart'); if(_r) _r.style.display='none'; } }catch(e){}
    var iWon = G.online ? (winner === G.seat) : (winner === 0);
    try {
      if (iWon && window.FoxGameRewardService) {
        FoxGameRewardService.claimReward({ gameCode: 'tank_duel', mode: G.online ? 'online' : 'solo', result: 'win' });
      }
    } catch(e) {}
    setTimeout(function () {
      var ov = document.getElementById('tkOver');
      var ic = document.getElementById('tkOverIcon');
      var ti = document.getElementById('tkOverTitle');
      var sb = document.getElementById('tkOverSub');
      if (G.mode === 'local') {
        ic.textContent = '🏆';
        ti.textContent = 'پیروزی بازیکن ' + (winner === 0 ? '۱' : '۲') + '!';
        sb.textContent = winner === 0 ? '🦊 تانک روباه نارنجی برنده شد' : '🦊 تانک روباه سفید برنده شد';
      } else if (iWon) {
        ic.textContent = '🏆'; ti.textContent = 'پیروزی!';
        sb.textContent = '🦊 تانک روباه ' + (G.seat === 0 ? 'نارنجی' : 'سفید') + ' — نبرد را بردی!';
      } else {
        ic.textContent = '💥'; ti.textContent = 'شکست خوردی!';
        sb.textContent = 'تانک تو منهدم شد. دوباره تلاش کن!';
      }
      try{ if(G.online){ var _ta=document.getElementById('tkAgain'); if(_ta) _ta.style.display='none'; } }catch(e){} try{ hideOnlineAgainButtons(); }catch(e){}
      ov.classList.add('show');
      if (iWon || G.mode === 'local') Snd.win(); else Snd.lose();
    }, 350);
  }

  /* ---------- Menu / flow ---------- */
  function hideAll() {
    ['tkMenu', 'tkWait', 'tkOver', 'tkArenaPick', 'tkPick'].forEach(function (id) {
      var e = document.getElementById(id); if (e) e.classList.remove('show');
    });
  }
  function openMenu() {
    hideAll();
    document.getElementById('tkMenu').classList.add('show');
  }
  function enterView() {
    // hide EVERY other view (view1 / login / chat / admin included)
    Array.prototype.forEach.call(document.querySelectorAll('section.view'), function (s) {
      if (s.id !== 'viewTank') s.classList.add('hidden');
    });
    viewTank.classList.remove('hidden');
    /* بعضی بازی‌ها (سودوکو/حافظه) با style.display='none' این نما را مخفی می‌کنند؛
       کلاس hidden به‌تنهایی کافی نیست — display درون‌خطی هم باید برداشته شود. وگرنه صفحه سفید می‌ماند. */
    viewTank.style.display = 'flex';
    try { window.scrollTo(0, 0); } catch (e) {}
    var bn = document.getElementById('bottomNav');
    if (bn) bn.classList.remove('show');
    resize();
  }
  function leave() {
    stop();
    if (G.ws) { try { netSend({ t: 'bye' }); G.ws.close(); } catch (e) { } G.ws = null; }
    G.online = false;
    hideAll();
    viewTank.classList.add('hidden');
    try { viewTank.style.display = 'none'; } catch (e) {}
    if (typeof window.goFun === 'function') window.goFun();
    else {
      var vf = document.getElementById('viewFun');
      if (vf) vf.classList.remove('hidden');
      var bn = document.getElementById('bottomNav');
      if (bn) bn.classList.add('show');
    }
  }

  function beginMatch(mode, arenaIdx) {
    G.mode = mode;
    G.online = (mode === 'online');
    if (!G.online) {
      var need = matchCount();
      var pk = (G.picks && G.picks.length) ? G.picks.slice(0, need) : [];
      while (pk.length < need) pk.push(null);
      var mine = (G.mode === 'local') ? 2 : 1;
      if (pk[0] === null || pk[0] === undefined) pk[0] = 0;
      if (G.mode === 'local' && (pk[1] === null || pk[1] === undefined)) pk[1] = 1;
      var used = {}, pool = [];
      for (var q0 = 0; q0 < TANK_COUNT; q0++) used[q0] = 0;
      for (var q1 = 0; q1 < mine; q1++) used[pk[q1]] = 1;
      for (var q2 = 0; q2 < TANK_COUNT; q2++) if (!used[q2]) pool.push(q2);
      for (var q3 = pool.length - 1; q3 > 0; q3--) { var q4 = Math.floor(Math.random() * (q3 + 1)); var qt = pool[q3]; pool[q3] = pool[q4]; pool[q4] = qt; }
      for (var q5 = mine; q5 < need; q5++) pk[q5] = pool.length ? pool.pop() : (Math.floor(Math.random() * TANK_COUNT));
      G.picks = pk;
    }
    loadArena(arenaIdx === undefined ? G.arena : arenaIdx);
    hideAll();
    enterView();
    document.getElementById('tkP2Ctrl').style.display = (mode === 'local') ? 'flex' : 'none';
    setTimeout(resize, 30);
    document.getElementById('tkName0').textContent = mode === 'local' ? 'بازیکن ۱' : (G.online ? (G.seat === 0 ? 'تو' : 'حریف') : 'تو');
    document.getElementById('tkName1').textContent = mode === 'local' ? 'بازیکن ۲' : (G.online ? (G.seat === 1 ? 'تو' : 'حریف') : 'روباه هوشمند');
    Snd.start();
    start();
    try { syncHUD(); } catch (e) {}
  }

  /* ---------- Online matchmaking ---------- */
  /* ---------- Online matchmaking (robust) ---------- */
  function showWaitMsg(t) { var p = document.getElementById('tkWaitMsg'); if (p) p.textContent = t; }
  function showWaitBtn(id, on) { var b = document.getElementById(id); if (b) b.style.display = on ? 'block' : 'none'; }
  function stopWaitTimers() {
    if (G.waitAiT) { clearTimeout(G.waitAiT); G.waitAiT = null; }
    if (G.retryT) { clearTimeout(G.retryT); G.retryT = null; }
  }
  function startWaitTimers() {
    if (G.waitAiT) clearTimeout(G.waitAiT);
    G.waitAiT = setTimeout(function () {
      if (G.waiting) {
        showWaitBtn('tkWaitAi', true);
        showWaitMsg('هنوز حریف آنلاینی پیدا نشد — می‌توانی با روباه هوشمند بازی کنی یا بیشتر صبر کنی');
      }
    }, 20000);
  }
  function joinOnline() {
    var cu = null;
    try { cu = JSON.parse(localStorage.getItem('fox_user')); } catch (e) { }
    if (!cu || !cu.phone) {
      if (typeof openAppModal === 'function') openAppModal('ورود لازم است', 'برای نبرد آنلاین ابتدا وارد حساب کاربری شو.', [{ label: 'باشه', primary: true }]);
      else alert('برای بازی آنلاین ابتدا وارد شوید');
      return;
    }
    hideAll();
    document.getElementById('tkWait').classList.add('show');
    showWaitMsg('به محض اتصال بازیکن دیگر، نبرد آغاز می‌شود');
    showWaitBtn('tkWaitAi', false);
    showWaitBtn('tkWaitRetry', false);
    G.waiting = true; G.retryN = 0; G.lastCu = cu;
    startWaitTimers();
    tankConnect(cu);
  }
  function tankConnect(cu) {
    if (!G.waiting) return;
    var proto = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var _a = (typeof G.arena === 'number' ? G.arena : 0); if (Math.random() < 0.5) _a = Math.floor(Math.random() * 3);
    var url = proto + location.host + '/api/tank/ws?phone=' + encodeURIComponent(cu.phone) +
      '&name=' + encodeURIComponent(cu.name || 'روباه') + '&arena=' + _a;
    var ws = null;
    try { ws = new WebSocket(url); } catch (e) { scheduleTankRetry(cu); return; }
    G.ws = ws; try { window._tankG = G; window._tankOnline = true; } catch (e) { }
    ws.onopen = function () {
      try { ws.send(JSON.stringify({ t: 'hello' })); } catch (e) { }
    };
    ws.onmessage = function (ev) {
      var m; try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (m.t === 'png') { try { ws.send(JSON.stringify({ t: 'pong' })); } catch (e) { } return; }
      if (m.t === 'pong') { return; }
      if (m.t === 'start') {
        G.waiting = false; stopWaitTimers();
        G.seat = m.seat; G.arena = m.arena || 0;
        beginMatch('online', G.arena);
        showBanner('حریف پیدا شد: ' + (m.opp || 'روباه'));
      } else if (m.t === 'wait') {
        showWaitMsg('در صف هستی؛ هر لحظه ممکن است حریف وصل شود');
      } else {
        applyNet(m);
      }
    };
    ws.onclose = function (ev) {
      if (G.ws === ws) G.ws = null;
      var code = (ev && ev.code) || 0;
      if (code === 1000) { /* this account joined from elsewhere: do not fight */
        G.waiting = false; stopWaitTimers();
        showWaitBtn('tkWaitRetry', true);
        showWaitMsg('این حساب از جای دیگری وارد جست‌وجو شد');
        return;
      }
      if (G.waiting && !G.over) { scheduleTankRetry(cu); return; }
      if (G.online && !G.over) { showBanner('اتصال قطع شد'); }
    };
    ws.onerror = function () { try { ws.close(); } catch (e) { } };
  }
  function scheduleTankRetry(cu) {
    if (!G.waiting) return;
    G.retryN = (G.retryN || 0) + 1;
    if (G.retryN > 5) {
      showWaitMsg('اتصال آنلاین برقرار نشد. دوباره تلاش کن یا با روباه هوشمند بازی کن');
      showWaitBtn('tkWaitRetry', true);
      showWaitBtn('tkWaitAi', true);
      return;
    }
    showWaitMsg('اتصال قطع شد؛ تلاش دوباره (' + G.retryN + '/۵)…');
    G.retryT = setTimeout(function () { tankConnect(cu); }, 1300);
  }
  function cancelWait() {
    G.waiting = false; stopWaitTimers();
    if (G.ws) { try { G.ws.onclose = null; G.ws.close(); } catch (e) { } G.ws = null; }
    hideAll(); openMenu();
  }

  /* ---------- Wire UI ---------- */
  setupJoy(document.getElementById('tkJoyL'), joyL);
  setupJoy(document.getElementById('tkJoyR'), joyR);
  setupJoy(document.getElementById('tkJoy2L'), joy2L);
  setupJoy(document.getElementById('tkJoy2R'), joy2R);

  function bindFire(btn, getTank) {
    function go(e) {
      e.preventDefault();
      var t = getTank(); if (t) fire(t);
      btn.classList.add('hit');
      setTimeout(function () { btn.classList.remove('hit'); }, 110);
    }
    btn.addEventListener('touchstart', go, { passive: false });
    btn.addEventListener('mousedown', go);
  }
  bindFire(document.getElementById('tkFire'), function () { return G.online ? G.tanks[G.seat] : G.tanks[0]; });
  bindFire(document.getElementById('tkFire2'), function () { return G.tanks[1]; });

  document.getElementById('tkBack').addEventListener('click', leave);
  document.getElementById('tkMute').addEventListener('click', function () {
    var m = Snd.toggle();
    this.textContent = m ? '🔇' : '🔊';
  });
  document.getElementById('tkMute').textContent = Snd.isMuted() ? '🔇' : '🔊';

  document.getElementById('tkOptAI').addEventListener('click', function () { openPick('ai'); });
  document.getElementById('tkOptLocal').addEventListener('click', function () { openPick('local'); });
  document.getElementById('tkOptOnline').addEventListener('click', function () { openPick('online'); });
  document.getElementById('tkOptArena').addEventListener('click', function () {
    hideAll(); document.getElementById('tkArenaPick').classList.add('show');
  });
  document.getElementById('tkOptBack').addEventListener('click', function () { hideAll(); leave(); });
  document.getElementById('tkWaitCancel').addEventListener('click', cancelWait);
  document.getElementById('tkWaitAi').addEventListener('click', function () {
    G.waiting = false; stopWaitTimers();
    if (G.ws) { try { G.ws.onclose = null; G.ws.close(); } catch (e) { } G.ws = null; }
    hideAll();
    G.picks = [];
    beginMatch('ai', Math.floor(Math.random() * 3));
  });
  document.getElementById('tkWaitRetry').addEventListener('click', function () {
    showWaitBtn('tkWaitRetry', false);
    showWaitMsg('تلاش دوباره برای اتصال…');
    G.retryN = 0;
    if (G.waiting && G.lastCu) tankConnect(G.lastCu);
  });

  Array.prototype.forEach.call(document.querySelectorAll('#tkDiff button'), function (b) {
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('#tkDiff button'), function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      G.diff = b.dataset.d;
      localStorage.setItem('fox_tank_diff', G.diff);
    });
  });
  G.diff = localStorage.getItem('fox_tank_diff') || 'normal';
  Array.prototype.forEach.call(document.querySelectorAll('#tkDiff button'), function (b) {
    b.classList.toggle('on', b.dataset.d === G.diff);
  });

  Array.prototype.forEach.call(document.querySelectorAll('.tk-arena-card'), function (c) {
    c.addEventListener('click', function () {
      G.arena = parseInt(c.dataset.a, 10);
      localStorage.setItem('fox_tank_arena', G.arena);
      hideAll(); openMenu();
      Array.prototype.forEach.call(document.querySelectorAll('.tk-arena-card'), function (x) { x.classList.remove('on'); });
      c.classList.add('on');
    });
  });
  G.arena = parseInt(localStorage.getItem('fox_tank_arena') || '0', 10) || 0;

  document.getElementById('tkAgain').addEventListener('click', function () {
    hideAll();
    if (G.online) { leave(); return; }
    openPick(G.mode === 'local' ? 'local' : 'ai'); return;   // rematch = pick tanks again
    beginMatch(G.mode, G.arena);
  });
  document.getElementById('tkPickArena').addEventListener('click', function () {
    hideAll(); document.getElementById('tkArenaPick').classList.add('show');
  });
  document.getElementById('tkOverBack').addEventListener('click', leave);

  G.autoFire = false;

  window.__TK = G;
  window.__TKAPI = { loadArena: loadArena, beginMatch: beginMatch, openMenu: openMenu, hideAll: hideAll, fire: fire, start: start, stop: stop, Snd: Snd, resize: resize };

  window.openTank = function () {
    // hardened first-open: ALWAYS show the menu first (never leave a blank/white screen),
    // then initialise canvas/arena; any init failure degrades gracefully instead of breaking the view.
    try { enterView(); } catch (e) { if (window.console && console.warn) console.warn('tank enterView', e); }
    try { openMenu(); } catch (e) { if (window.console && console.warn) console.warn('tank openMenu', e); }
    try { resize(); } catch (e) { if (window.console && console.warn) console.warn('tank resize', e); }
    try {
      if (!G.tanks.length) loadArena(G.arena);
      render();
    } catch (e) {
      if (window.console && console.warn) console.warn('tank init', e);
      try { setTimeout(function () { resize(); if (!G.tanks.length) loadArena(G.arena); render(); }, 60); } catch (e2) {}
    }
  };


  /* ================= TANK PICKER (5-tank arena) ================= */
  var PICK = { mode: 'ai', steps: [0], step: 0 };
  function tankName(i) { var d = tankDef(i); return d ? d.name : ''; }
  function paintCard(cvEl, def) {
    if (!cvEl || !def) return;
    var g = cvEl.getContext('2d');
    var hs = SPR2[def.hull] || SPR.p1h, ts = SPR2[def.turret] || SPR.p1t;
    var h = IMG2[def.hull], t2 = IMG2[def.turret];
    var HW = 104, HH = HW * (hs.h / hs.w);
    var TW = 82, TH = TW * (ts.h / ts.w);
    var pvx = (def.pvx !== undefined ? def.pvx : 0.5);
    var pvy = (def.pvy !== undefined ? def.pvy : 0.7);
    var x0 = Math.min(-HW / 2, -TW * pvx), x1 = Math.max(HW / 2, TW * (1 - pvx));
    var y0 = Math.min(-HH / 2, -TH * pvy), y1 = Math.max(HH / 2, TH * (1 - pvy));
    var sc = Math.min(cvEl.width * 0.84 / (x1 - x0), cvEl.height * 0.84 / (y1 - y0));
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, cvEl.width, cvEl.height);
    g.translate(cvEl.width / 2 - (x0 + x1) / 2 * sc, cvEl.height / 2 - (y0 + y1) / 2 * sc);
    g.scale(sc, sc);
    if (h && h.complete && h.naturalWidth) g.drawImage(h, -HW / 2, -HH / 2, HW, HH);
    if (t2 && t2.complete && t2.naturalWidth) g.drawImage(t2, -TW * pvx, -TH * pvy, TW, TH);
  }
  function cardHTML(i, def) {
    var tid = tankIdOf(i);
    var locked = tankLocked(i);
    var lock = locked ? '<span class="tk-lock">🔒</span>' : '';
    var badge = locked ? '' : ((def.kind === 'new')
      ? '<span class="tk-pc-badge new">جدید</span>'
      : '<span class="tk-pc-badge">پیش‌فرض</span>');
    var buy = locked
      ? '<button class="tk-pc-buy" data-buy="' + tid + '" type="button">🛒 ' + tkFa(SHOP_PRICE[tid] || 0) + ' سکه</button>'
      : '';
    return '<div class="tk-pcard' + (locked ? ' locked' : '') + '" data-t="' + i + '" role="button" tabindex="0" style="--tc:' + def.col + '">' + badge + lock +
      '<canvas class="tk-pc-art" width="190" height="232"></canvas>' +
      '<b class="tk-pc-name">' + def.name + '</b>' +
      '<i class="tk-pc-sub">' + def.sub + '</i>' +
      '<span class="tk-pc-row"><span>❤ ' + def.hp + '</span><span>⚡ ' + def.spd + '</span><span>💥 ' + def.dmg + '</span></span>' + buy +
      '</div>';
  }
  function markCards(active) {
    Array.prototype.forEach.call(document.querySelectorAll('#tkPickGrid .tk-pcard'), function (c) {
      c.classList.toggle('on', parseInt(c.dataset.t, 10) === active);
    });
  }
  function buildGrid() {
    var grid = document.getElementById('tkPickGrid');
    if (!grid) return;
    var html = '';
    for (var i = 0; i < TANK_DEFS.length; i++) html += cardHTML(i, TANK_DEFS[i]);
    grid.innerHTML = html;
    Array.prototype.forEach.call(grid.querySelectorAll('.tk-pcard'), function (c, i) {
      paintCard(c.querySelector('canvas'), TANK_DEFS[i]);
      c.addEventListener('click', function (e) {
        var t0 = e && e.target ? e.target : null;
        var bb = (t0 && t0.closest) ? t0.closest('.tk-pc-buy') : null;
        if (bb) { try { e.stopPropagation(); } catch (er) {} openBuy(bb.getAttribute('data-buy'), (TANK_DEFS[i] || {}).name, '🛒'); return; }
        choose(i);
      });
      c.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        try { e.preventDefault(); } catch (er) {}
        choose(i);
      });
    });
  }
  function choose(i) {
    var slot = PICK.steps[Math.min(PICK.step, PICK.steps.length - 1)];
    if (slot === undefined) slot = 0;
    G.picks[slot] = i;
    try { localStorage.setItem('fox_tank_picks', JSON.stringify(G.picks)); } catch (e) {}
    var hint = document.getElementById('tkPickHint');
    if (PICK.mode === 'online') {
      markCards(i);
      if (hint) hint.textContent = 'تانک تو: ' + tankName(i) + ' — آماده‌ای';
      return;
    }
    PICK.step = Math.min(PICK.step + 1, PICK.steps.length);
    if (PICK.step >= PICK.steps.length) {
      markCards(i);
      if (hint) hint.textContent = 'تانک‌های دیگر خودکار انتخاب می‌شوند — دکمهٔ «شروع نبرد» را بزن';
    } else {
      var nxt = PICK.steps[PICK.step];
      markCards(G.picks[nxt]);
      if (hint) hint.textContent = (nxt === 1 ? 'نوبت: بازیکن ۲' : 'نوبت: تانک خودت') +
        ' — یکی دیگر انتخاب کن';
    }
  }
  function loadPicks() {
    var pk = [0, 1, 2, 3, 4];
    try {
      var saved = JSON.parse(localStorage.getItem('fox_tank_picks'));
      if (saved && saved.length >= NEW_TANKS) pk = saved.slice(0, NEW_TANKS);
    } catch (e) {}
    for (var i = 0; i < NEW_TANKS; i++) if (!TANK_DEFS[pk[i]]) pk[i] = i % TANK_COUNT;
    return pk;
  }
  function openPick(mode) {
    PICK.mode = (mode === 'local') ? 'local' : (mode === 'online' ? 'online' : 'ai');
    PICK.steps = (PICK.mode === 'local') ? [0, 1] : [0];
    PICK.step = 0;
    G.picks = loadPicks();
    var ttl = document.getElementById('tkPickTitle');
    var sbb = document.getElementById('tkPickSub');
    var gob = document.getElementById('tkPickGo');
    if (ttl) ttl.textContent = (PICK.mode === 'online') ? 'انتخاب تانک آنلاین' : 'انتخاب تانک';
    if (sbb) sbb.textContent = (PICK.mode === 'online')
      ? 'تانکی که باهاش به میدان می‌روی را انتخاب کن.'
      : ((PICK.mode === 'local')
        ? 'دو بازیکن روی یک دستگاه: اول تانک بازیکن ۱، بعد بازیکن ۲.'
        : 'در میدان ۵ تانک داریم: تانک تو + ۴ ورزه‌گر که روباه هوشمند هدایتشان می‌کند.');
    if (gob) gob.textContent = (PICK.mode === 'online') ? '🌐 جست‌وجوی حریف' : '⚔ شروع نبرد';
    buildGrid();
    markCards(G.picks[PICK.steps[0]]);
    var h0 = document.getElementById('tkPickHint');
    if (h0) h0.textContent = (PICK.mode === 'online')
      ? 'تانک خودت را بزن'
      : ((PICK.mode === 'local') ? 'نوبت: تانک بازیکن ۱' : 'تانک خودت را بزن');
    hideAll();
    try { document.body.style.overflow = 'hidden'; } catch (e) {}
    var ov = document.getElementById('tkPick');
    if (ov) ov.classList.add('show');
  }
  function closePick() {
    hideAll();
    try { document.body.style.overflow = ''; } catch (e) {}
  }
  (function wirePick() {
    var go = document.getElementById('tkPickGo');
    var cx = document.getElementById('tkPickCancel');
    if (go) go.addEventListener('click', function () {
      closePick();
      if (PICK.mode === 'online') { joinOnline(); return; }
      beginMatch(PICK.mode === 'local' ? 'local' : 'ai', G.arena);
    });
    if (cx) cx.addEventListener('click', function () { closePick(); openMenu(); });
    G.picks = loadPicks();
  })();


  /* ============ per-tank settings (tank + shell only) ============ */

  function slotLabel(slot) {
    if (PICK.mode === 'online') return 'تانک تو';
    if (slot === 0) return 'تانک تو';
    if (PICK.mode === 'local') return 'تانک بازیکن ' + (slot + 1);
    return 'تانک روباه هوشمند';
  }
  function cfgText(slot) {
    var c = cfgOf(slot), d = tankDef(G.picks[slot] || 0), st = tankStats(d, c.shell);
    return (d ? d.name : '') + ' · توپ ' +
      (SHELL_LBL[st.shell] || '') + ' · جان ' + st.hp +
      ' · آسیب ' + st.dmg;
  }
  function saveCfg() {
    try {
      localStorage.setItem('fox_tank_cfg', JSON.stringify({ picks: G.picks, cfg: G.cfg }));
    } catch (e) {}
  }
  function loadCfg() {
    try {
      var o = JSON.parse(localStorage.getItem('fox_tank_cfg'));
      if (!o) return;
      if (o.picks && o.picks.length >= NEW_TANKS) G.picks = o.picks.slice(0, NEW_TANKS);
      if (o.cfg && o.cfg.length) G.cfg = o.cfg;
    } catch (e) {}
  }
  function ensureCfg(mode) {
    if (!G.cfg || !G.cfg.length) G.cfg = [];
    for (var i = 0; i < NEW_TANKS; i++) {
      var d = G.cfg[i];
      if (!d || typeof d !== 'object') d = G.cfg[i] = { shell: '' };
      if (typeof d.shell !== 'string') d.shell = '';
    }
    if (mode === 'online' && G.picks.length !== 1) G.picks = [G.picks[0] || 0];
    for (var j = 0; j < NEW_TANKS; j++) G.picks[j] = (typeof G.picks[j] === 'number') ? G.picks[j] : j;
    /* a human slot may never start on a locked tank (saved picks are sanitised) */
    if (PICK.slots && PICK.slots.length) {
      for (var k2 = 0; k2 < PICK.slots.length; k2++) {
        var ps = PICK.slots[k2];
        if (tankLocked(G.picks[ps])) G.picks[ps] = 0;
      }
    }
    for (var q = 0; q < NEW_TANKS; q++) {
      if (shellLocked(G.cfg[q].shell)) G.cfg[q].shell = (tankDef(G.picks[q] || 0) || {}).shell || 'sh1';
    }
  }
  function renderSlots() {
    var box = document.getElementById('tkSlots');
    if (!box) return;
    var html = '';
    for (var i = 0; i < PICK.slots.length; i++) {
      var slot = PICK.slots[i];
      html += '<button class="tk-slot' + (i === PICK.slotIdx ? ' on' : '') + '" data-s="' + i + '" type="button">' +
        slotLabel(slot) + ' • <b>' + cfgText(slot) + '</b></button>';
    }
    box.innerHTML = html;
    Array.prototype.forEach.call(box.querySelectorAll('.tk-slot'), function (b) {
      b.addEventListener('click', function () {
        PICK.slotIdx = parseInt(b.dataset.s, 10) || 0;
        var sl = PICK.slots[PICK.slotIdx];
        markCards(G.picks[sl]);
        bindCfg(sl);
        renderSlots();
      });
    });
  }
  function bindCfg(slot) {
    var c = cfgOf(slot);
    var bar = document.getElementById('tkCfgFor');
    var note = document.getElementById('tkCfgNote');
    if (bar) bar.textContent = 'تنظیمات ' + slotLabel(slot) + ' — ' + (tankDef(G.picks[slot] || 0) || {}).name;
    if (note) note.textContent = 'جان و آسیب خودکار از روی تانک و توپ حساب می‌شوند.';
    var sbox = document.getElementById('tkCfgS');
    if (sbox) {
      if (!c.shell || shellLocked(c.shell)) c.shell = (tankDef(G.picks[slot] || 0) || {}).shell || 'sh1';
      Array.prototype.forEach.call(sbox.querySelectorAll('.tk-sh'), function (b) {
        var key = b.dataset.v;
        b.classList.toggle('on', key === c.shell);
        var cvv = b.querySelector('canvas');
        if (cvv) paintShell(cvv, key);
        var wrap = b.parentNode;
        var bb = wrap ? wrap.querySelector('.tk-sh-buy') : null;
        if (bb) {
          bb.style.display = '';
          var pe = bb.querySelector('.tk-sh-price');
          if (pe) pe.textContent = tkFa(SHOP_PRICE[key] || 0);
          bb.onclick = function (e2) {
            try { e2.stopPropagation(); } catch (er) {}
            openBuy(key, 'توپ ' + (SHELL_LBL[key] || ''), '💥');
          };
        }
        b.onclick = function () {
          if (shellLocked(key)) {
            openBuy(key, 'توپ ' + (SHELL_LBL[key] || ''), '💥');
            return;
          }
          c.shell = key;
          saveCfg();
          bindCfg(slot);
          renderSlots();
        };
      });
    }
    paintAuto(slot);
  }
  /* نمایش خودکار جان و آسیب تانک با توپ انتخاب‌شده */
  function paintAuto(slot) {
    var el = document.getElementById('tkCfgAuto');
    if (!el) return;
    var c = cfgOf(slot), d = tankDef(G.picks[slot] || 0), st = tankStats(d, c.shell);
    var lbl = SHELL_LBL[st.shell] || '';
    el.innerHTML = '<b>' + 'جان' + ' ' + st.hp + '</b> · <b>' + 'آسیب هر شلیک' +
      ' ' + st.dmg + '</b> — ' + ((d && d.name) || '') + ' + توپ ' + lbl + ' (' + 'خودکار' + ')' ;
  }
  function paintShell(cv, key) {
    var im = IMG2[key], sp = SPR2[key];
    if (!im || !sp || !cv || !im.complete || !im.naturalWidth) return;
    var g = cv.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, cv.width, cv.height);
    var w = Math.min(cv.width * 0.9, cv.width), h = w * (sp.h / sp.w);
    g.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
  }
  function refreshOrder() {
    var el = document.getElementById('tkOrder');
    if (!el) return;
    el.textContent = 'حالت آزاد: هر تانک هر زمان بخواهد شلیک می‌کند.';
  }

  /* --- the picker flow, rewritten: one tank at a time --- */
  choose = function (i) {
    if (tankLocked(i)) {
      openBuy(tankIdOf(i), (TANK_DEFS[i] || {}).name, '🛒');
      return;
    }
    var slot = PICK.slots[Math.min(PICK.slotIdx, PICK.slots.length - 1)];
    if (slot === undefined) slot = 0;
    G.picks[slot] = i;
    PICK.picked = true;
    saveCfg();
    // stay on this tank so its power / hp / team can be set right now
    markCards(G.picks[slot]);
    bindCfg(slot);
    renderSlots();
    refreshOrder();
    var hint = document.getElementById('tkPickHint');
    if (hint) hint.textContent = 'تانک انتخاب شد — قدرت شلیک، سختی جان و تیمش را بزن ، بعد «تانک بعدی»';
  };
  function pickNextSlot() {
    if (PICK.slotIdx < PICK.slots.length - 1) {
      PICK.slotIdx++;
      markCards(G.picks[PICK.slots[PICK.slotIdx]]);
      bindCfg(PICK.slots[PICK.slotIdx]);
      renderSlots();
      var hint = document.getElementById('tkPickHint');
      if (hint) hint.textContent = 'نوبت: ' + slotLabel(PICK.slots[PICK.slotIdx]) + ' — یک تانک انتخاب کن';
    } else {
      var hint2 = document.getElementById('tkPickHint');
      if (hint2) hint2.textContent = 'همه‌ی تانک‌ها آماده‌اند — دکمهٔ «شروع نبرد» را بزن';
    }
  }

  buildGrid = function () {
    var grid = document.getElementById('tkPickGrid');
    if (!grid) return;
    var html = '';
    for (var i = 0; i < TANK_DEFS.length; i++) html += cardHTML(i, TANK_DEFS[i]);
    grid.innerHTML = html;
    Array.prototype.forEach.call(grid.querySelectorAll('.tk-pcard'), function (c, i) {
      paintCard(c.querySelector('canvas'), TANK_DEFS[i]);
      c.addEventListener('click', function () { choose(i); });
    });
  };

  openPick = function (mode) {
    PICK.mode = (mode === 'local') ? 'local' : (mode === 'online' ? 'online' : 'ai');
    PICK.slots = (PICK.mode === 'online') ? [0] : ((PICK.mode === 'local') ? [0, 1] : [0]);
    PICK.slotIdx = 0;
    G.picks = loadPicks();
    ensureCfg(PICK.mode);
    try { syncShop(); } catch (e) {}
    var ttl = document.getElementById('tkPickTitle');
    var sbb = document.getElementById('tkPickSub');
    var gob = document.getElementById('tkPickGo');
    if (ttl) ttl.textContent = (PICK.mode === 'online') ? 'انتخاب تانک آنلاین' : 'انتخاب و تنطیم تانک‌ها';
    if (sbb) sbb.textContent = (PICK.mode === 'online')
      ? 'تانک و قدرت شلیکت را انتخاب کن.'
      : 'تانک خودت را انتخاب کن؛ تانک روباه هوشمند به‌صورت خودکار انتخاب می‌شود.';
    if (gob) gob.textContent = (PICK.mode === 'online') ? '🌐 جست‌وجوی حریف' : '⚔ شروع نبرد';
    buildGrid();
    markCards(G.picks[PICK.slots[0]]);
    bindCfg(PICK.slots[0]);
    renderSlots();
    refreshOrder();
    var h0 = document.getElementById('tkPickHint');
    if (h0) h0.textContent = 'تانک ' + (PICK.slots[0] + 1) + ' را انتخاب کن';
    hideAll();
    try { document.body.style.overflow = 'hidden'; } catch (e) {}
    var ov = document.getElementById('tkPick');
    if (ov) ov.classList.add('show');
  };

  (function wireNext() {
    var n = document.getElementById('tkCfgNext');
    if (n) n.addEventListener('click', pickNextSlot);
  })();
  loadCfg();
  ensureCfg('ai');

  resize();
})();

/* ===== FOX ESCAPE — فرار روباه (single + online duel) ===== */
/* ============================================================
   فرار روباه — Fox Escape  v1.0
   Single-player (40 levels) + Online 2-fox race duel
   Part of ROBAH PLUS (ai-fox worker). Self-contained module.
   ============================================================ */
var FE = (function(){
'use strict';

/* ---------- CONST / WORLD ---------- */
var VW = 1280, VH = 720;            // internal canvas size (VW adapts to screen aspect)
var YOFF = 0;                        // vertical world offset for tall (non-rotated portrait) screens
var GY = 596;                        // ground band top
var LANE_Y = [624, 676, 650];        // lane track y (0 upper, 1 lower, 2 center)
var LANE_S = [0.93, 1.03, 0.98];     // lane visual scale
var FOX_X = 355;                     // fox screen x
var GRAV = 2450, JUMP_V = -1005, JUMP_HOLD_G = 1450, JUMP_HOLD_T = 0.30, MAX_FALL = 1500;
var SLIDE_T = 0.65;
var T = 1000; // ms

function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
function lerp(a,b,t){ return a+(b-a)*t; }
function rnd(a,b){ return a+Math.random()*(b-a); }
function irnd(a,b){ return Math.floor(rnd(a,b+1)); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function now(){ return Date.now(); }
function fmt(n){ n=Math.floor(n); var s='',c; while(n>=1000){ c=('00'+(n%1000)).slice(-3); s=','+c+s; n=Math.floor(n/1000);} return n+s; }

/* deterministic rng (mulberry32) — same seed => same track (duel parity) */
function RNG(seed){ var a=seed>>>0; return function(){ a|=0; a=(a+0x6D2B79F5)|0; var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }

/* ---------- ASSETS ---------- */
var A = {};
var ADEF = {
  car:    '/static/116f5316d27dd329a3cd161a2b59605fff810e41d80102f8723016b1169cebc6.webp',
  scorp:  '/static/e965c2fac760765c2b9443d3cfb02f1c45d42c2a492c09fcdba4282f9e674fbd.webp',
  lizard: '/static/477727fe78b5407a5259c12522af9616e2228a1a4d6c34d9e87117f85eaae3c2.webp',
  wolf:   '/static/19ab9593d9a7d2cdb8ccf49bf646288fdfb80ddfff4f3c83f9d379d7fe6fda0e.webp',
  eagle:  '/static/ba15faf7bc97dd575806a08d6f5d4d2d2a2aa239e0f896aa84feea2bf07398ef.webp',
  drone:  '/static/554ffd61088c524c8582bc2e022d083e9b723765ef7ef6bf06d2d0852132f73c.webp',
  city:   '/static/9aeebf0db6c347de3101fb2fb530b01250dacfd962a47534ddac616e6f523093.webp',
  forest: '/static/a06b395d5eff2f8fddb270256d76497bdbea1de3471fd4fc56d9ccbb864f6cfc.webp',
  desert: '/static/655ef084fb195d5f19d6dc64135bd61d534b44820609f594dcb81a4d60cb4ef5.webp',
  mount:  '/static/29ec84e683a58cf70b46d056cc2cad8845324cbf3679527d5f771ebb90a2a8eb.webp',
  factory:'/static/8dc21e2a4d138b3629220a9a8e8be9e7b1a92f34abc0860d16760e305d399dca.webp',
  fox:    '/static/91b308e9a176e6af95e5c4cfd808b08cef09fc6a29de1d42a74175e93a8ab04b.webp'
};
var assetsReady = false;
function loadAssets(done){
  var keys = Object.keys(ADEF), n = keys.length, bad = false;
  if (!n){ assetsReady = true; done(); return; }
  keys.forEach(function(k){
    var im = new Image();
    im.onload = function(){ if(--n===0){ assetsReady = true; done(); } };
    im.onerror = function(){ bad = true; if(--n===0){ assetsReady = true; done(); } };
    im.src = ADEF[k];
    A[k] = im;
  });
}

/* fox atlas: 6x4 grid of 192px cells (source frames), bottom-aligned feet */
var CELL = 192;
var ANIM = {
  run:   { f:[0,1,2,3,4,5], fps:14, loop:true },
  jump:  { f:[6,7],         fps:9,  loop:false },
  fall:  { f:[8],           fps:8,  loop:true },
  slide: { f:[9,10],        fps:8,  loop:true },
  hit:   { f:[11],          fps:8,  loop:false },
  death: { f:[12,13],       fps:6,  loop:false },
  idle:  { f:[14,15],       fps:2.2,loop:true }
};
var foxSheetAlt = null;   // hue-shifted copy for the rival fox
/* ===== رنگ ثابت هر بازیکن =====
   صندلی ۰ = نارنجی ، صندلی ۱ = آبی.
   هر کس روی گوشی خودش رنگ خودش را می‌بیند و حریف رنگ دیگر را — پس
   «نارنجی» در گوشی من همان بازیکنی است که در گوشی حریف هم نارنجی است. */
var ME = { seat: 0, color: 'orange' };
function otherColor(c){ return c === 'blue' ? 'orange' : 'blue'; }
function sheetFor(c){ return c === 'blue' ? (foxSheetAlt || A.fox) : A.fox; }
function mySheet(){ return sheetFor(ME.color); }
function oppSheet(){ return sheetFor(otherColor(ME.color)); }
function oppColor(){ return otherColor(ME.color); }
function colorName(c){ return c === 'blue' ? 'آبی' : 'نارنجی'; }
function colorDot(c){ return c === 'blue' ? '🔵' : '🦊'; }
function colorHex(c){ return c === 'blue' ? '#4fc3f7' : '#ff9a3c'; }
function colorHexLight(c){ return c === 'blue' ? '#7fe3ff' : '#ffc27a'; }
function colorTagBg(c){ return c === 'blue' ? 'rgba(10,30,50,0.68)' : 'rgba(58,24,0,0.68)'; }
function colorGrad(c){ return c === 'blue' ? 'linear-gradient(90deg,#2f86c4,#7fe3ff)' : 'linear-gradient(90deg,#ff7a00,#ffc25e)'; }
function duelSub(){
  var oc = oppColor();
  return colorDot(ME.color) + ' ' + colorName(ME.color) + ' = تو &nbsp;•&nbsp; ' +
         colorDot(oc) + ' ' + colorName(oc) + ' = ' + (OPP.name || 'حریف');
}
function setSeat(seat){
  ME.seat = (Number(seat) === 1) ? 1 : 0;
  ME.color = ME.seat === 1 ? 'blue' : 'orange';
  applyColorUI();
}
function applyColorUI(){
  try{
    if (H.progF) H.progF.style.background = colorGrad(ME.color);
    if (H.progO) H.progO.style.background = colorHex(oppColor());
    if (H.count){
      var sp = H.count.querySelector('span');
      if (sp){ sp.style.color = colorHexLight(ME.color); sp.style.textShadow = '0 0 40px ' + colorHex(ME.color); }
      var sb = H.count.querySelector('.feCntSub');
      if (sb) sb.innerHTML = duelSub();
    }
  }catch(e){}
}

function buildAltFox(){
  try{
    foxSheetAlt = document.createElement('canvas');
    foxSheetAlt.width = A.fox.width; foxSheetAlt.height = A.fox.height;
    var c = foxSheetAlt.getContext('2d');
    c.filter = 'hue-rotate(175deg) saturate(1.1)';
    c.drawImage(A.fox, 0, 0);
    c.filter = 'none';
  }catch(e){ foxSheetAlt = null; }
}
/* draw one frame; x=center, yBottom=feet line; w=target width */
function drawFox(ctx, sheet, fi, x, yBottom, w, flip, alpha){
  var sx = (fi%6)*CELL, sy = Math.floor(fi/6)*CELL;
  var im = ctx.drawImage;
  var h = w; // square cells
  ctx.save();
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  if (flip){ ctx.translate(x, yBottom); ctx.scale(-1,1); ctx.drawImage(sheet, sx, sy, CELL, CELL, -w/2, -h, w, h); }
  else { ctx.drawImage(sheet, sx, sy, CELL, CELL, x-w/2, yBottom-h, w, h); }
  ctx.restore();
}

/* 2-frame sprite draw (enemy sheets): x=center, yBottom=feet, h=height */
function drawSpr(ctx, key, fi, x, yBottom, h, alpha){
  var im = A[key];
  if (!im || !im.width) return;
  var fw = Math.floor(im.width/2), fh = im.height;
  var w2 = h * fw/fh;
  ctx.save();
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  ctx.drawImage(im, fi*fw, 0, fw, fh, x-w2/2, yBottom-h, w2, h);
  ctx.restore();
}

/* ---------- SAVE ---------- */
var SKEY = 'fe_save_v1';
var SV = null;
function saveLoad(){
  if (SV) return SV;
  SV = { best:{}, bestDist:0, coins:0, unlocked:1, unlockedE:{}, duel:{w:0,l:0}, opt:{sfx:1,music:1,rot:1}, seenTut:0 };
  try{
    var raw = localStorage.getItem(SKEY);
    if (raw){ var d = JSON.parse(raw); if (d && typeof d==='object'){
      SV.best = d.best || SV.best; SV.bestDist = d.bestDist||0; SV.coins = d.coins||0;
      SV.unlocked = d.unlocked||1; SV.unlockedE = d.unlockedE||{}; SV.duel = d.duel||SV.duel; SV.opt = d.opt||SV.opt; SV.seenTut = d.seenTut||0;
      /* migrate old city records: sN -> b_cN */
      for (var k in SV.best){
        if (/^sd+$/.test(k)){ var nn = k.slice(1); if (!SV.best['b_c'+nn]) SV.best['b_c'+nn] = SV.best[k]; }
      }
      /* migrate old linear unlock into city progress */
      if (!SV.unlockedE.u_c && SV.unlocked > 1) SV.unlockedE.u_c = SV.unlocked;
      for (var th in {c:1,f:1,d:1,m:1,k:1}){ if (!SV.unlockedE['u_'+th]) SV.unlockedE['u_'+th] = 1; }
    }}
  }catch(e){}
  return SV;
}
var saveDirty = false;
function saveStore(){ saveDirty = true; try{ localStorage.setItem(SKEY, JSON.stringify(SV)); }catch(e){} }
function opt(k){ return SV.opt[k] ? 1 : 0; }

/* server mirror (best-effort, non-blocking) */
var feUser = null;
function detectUser(){ try{ feUser = JSON.parse(localStorage.getItem('fox_user')||'null'); }catch(e){ feUser = null; } }
var synced = false, syncTimer = null;
function serverSync(){
  if (!feUser || !feUser.phone || synced) return;
  synced = true;
  try{
    fetch('/api/fe/sync', { method:'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({ cmd:'load', phone: feUser.phone }) }).then(function(r){ return r.json(); }).then(function(j){
      if (j && j.ok && j.data){
        var d = j.data, ch = false;
        if (d.unlocked && d.unlocked > SV.unlocked){ SV.unlocked = d.unlocked; ch = true; }
        if (d.coins && d.coins > SV.coins){ SV.coins = d.coins; ch = true; }
        if (d.bestDist && d.bestDist > SV.bestDist){ SV.bestDist = d.bestDist; ch = true; }
        if (d.best){ for (var k in d.best){ if (!SV.best[k] || d.best[k] > SV.best[k]){ SV.best[k] = d.best[k]; ch = true; } } }
        if (d.duel){ SV.duel.w = Math.max(SV.duel.w||0, d.duel.w||0); SV.duel.l = Math.max(SV.duel.l||0, d.duel.l||0); }
        if (ch) saveStore();
      }
    }).catch(function(){});
  }catch(e){}
}
function serverPush(){
  if (!feUser || !feUser.phone) return;
  try{
    fetch('/api/fe/sync', { method:'POST', headers:{'content-type':'application/json'}, keepalive:true,
      body: JSON.stringify({ cmd:'save', phone: feUser.phone, data: {
        unlocked: SV.unlocked, coins: SV.coins, bestDist: SV.bestDist, best: SV.best, duel: SV.duel } })
    }).catch(function(){});
  }catch(e){}
}
function pushSoon(){ if (syncTimer) return; syncTimer = setTimeout(function(){ syncTimer = null; serverPush(); }, 2500); }

/* ---------- AUDIO (WebAudio synth — no files, no lag) ---------- */
var Snd = (function(){
  var ac = null, master = null, musicG = null, musicOn = false, mTimer = null, mStep = 0, mNext = 0;
  function ctx(){
    if (ac) return ac;
    try{
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
      musicG = ac.createGain(); musicG.gain.value = 0.0; musicG.connect(master);
    }catch(e){ ac = null; }
    return ac;
  }
  function resume(){ var c = ctx(); if (c && c.state === 'suspended'){ try{ c.resume(); }catch(e){} } }
  function env(g, t0, a, d, peak){ g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(peak, t0+a); g.gain.exponentialRampToValueAtTime(0.0001, t0+a+d); }
  function tone(type, f0, f1, dur, peak, when, dest){
    var c = ctx(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, when);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(30,f1), when+dur);
    env(g, when, 0.008, dur, peak);
    o.connect(g); g.connect(dest || master);
    o.start(when); o.stop(when+dur+0.06);
  }
  function noise(dur, peak, fc, when){
    var c = ctx(); if (!c) return;
    var len = Math.max(1, Math.floor(c.sampleRate*dur));
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i=0;i<len;i++) d[i] = Math.random()*2-1;
    var src = c.createBufferSource(); src.buffer = buf;
    var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = fc;
    var g = c.createGain(); env(g, when, 0.005, dur, peak);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(when);
  }
  var SFX = {
    click:  function(t){ tone('square', 700, 900, 0.05, 0.12, t); },
    jump:   function(t){ tone('square', 320, 640, 0.13, 0.14, t); },
    djump:  function(t){ tone('square', 420, 820, 0.12, 0.12, t); },
    slide:  function(t){ noise(0.20, 0.10, 900, t); },
    coin:   function(t){ tone('sine', 980, 1500, 0.09, 0.16, t); tone('sine', 1500, 1900, 0.07, 0.09, t+0.05); },
    silver: function(t){ tone('sine', 800, 1300, 0.10, 0.16, t); tone('sine', 1300, 2100, 0.10, 0.11, t+0.06); },
    gem:    function(t){ tone('triangle', 700, 1200, 0.12, 0.18, t); tone('triangle', 1050, 1800, 0.14, 0.14, t+0.08); tone('sine', 1600, 2400, 0.16, 0.10, t+0.16); },
    hit:    function(t){ noise(0.18, 0.30, 2200, t); tone('square', 190, 70, 0.22, 0.24, t); },
    die:    function(t){ tone('sawtooth', 300, 60, 0.55, 0.22, t); noise(0.4, 0.18, 1200, t+0.05); },
    power:  function(t){ tone('triangle', 520, 780, 0.09, 0.16, t); tone('triangle', 780, 1170, 0.09, 0.16, t+0.08); tone('triangle', 1170, 1560, 0.12, 0.16, t+0.16); },
    dash:   function(t){ tone('sawtooth', 120, 900, 0.28, 0.16, t); noise(0.3, 0.12, 2600, t); },
    shield: function(t){ tone('sine', 600, 300, 0.25, 0.16, t); },
    heart:  function(t){ tone('sine', 660, 660, 0.10, 0.16, t); tone('sine', 880, 880, 0.14, 0.16, t+0.10); },
    win:    function(t){ var n=[523,659,784,1046,1318]; for(var i=0;i<5;i++) tone('triangle', n[i], n[i], 0.16, 0.16, t+i*0.09); },
    lose:   function(t){ var n=[392,330,262,196]; for(var i=0;i<4;i++) tone('sawtooth', n[i], n[i]*0.97, 0.20, 0.14, t+i*0.14); },
    tick:   function(t){ tone('sine', 900, 900, 0.06, 0.12, t); },
    go:     function(t){ tone('sine', 1200, 1200, 0.14, 0.16, t); },
    breakS: function(t){ noise(0.14, 0.22, 3000, t); tone('square', 240, 120, 0.12, 0.12, t); }
  };
  function sfx(name){
    if (!opt('sfx')) return;
    var c = ctx(); if (!c) return;
    if (c.state === 'suspended'){ try{ c.resume(); }catch(e){} }
    var f = SFX[name]; if (f) f(c.currentTime);
  }
  /* --- music: tiny lookahead scheduler, one timer only --- */
  var BASS = [110,110,131,98, 110,110,147,98];
  var LEAD = [440,0,523,0, 587,523,0,392, 440,0,523,587, 659,0,523,0];
  function schedMusic(){
    if (!musicOn || !ac) return;
    while (mNext < ac.currentTime + 0.18){
      var spb = 60/132/2;
      var s = mStep % 16;
      tone('square', BASS[s%8], 0, spb*0.9, 0.05, mNext, musicG);
      var L = LEAD[s];
      if (L) tone('triangle', L, 0, spb*0.85, 0.045, mNext, musicG);
      if (s%2===0) { try{ var c=ac; var len=Math.floor(c.sampleRate*0.03); var b=c.createBuffer(1,len,c.sampleRate); var d=b.getChannelData(0); for(var i=0;i<len;i++)d[i]=Math.random()*2-1; var src=c.createBufferSource(); src.buffer=b; var g=c.createGain(); var hp=c.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=6000; env(g,mNext,0.002,0.03,0.03); src.connect(hp);hp.connect(g);g.connect(musicG); src.start(mNext);}catch(e){} }
      mNext += spb; mStep++;
    }
  }
  function musicStart(){
    if (!opt('music')) return;
    var c = ctx(); if (!c) return;
    resume();
    if (musicOn) return;
    musicOn = true; mStep = 0; mNext = c.currentTime + 0.06;
    musicG.gain.cancelScheduledValues(c.currentTime);
    musicG.gain.setValueAtTime(0.0001, c.currentTime);
    musicG.gain.linearRampToValueAtTime(0.55, c.currentTime+0.6);
    if (mTimer) clearInterval(mTimer);
    mTimer = setInterval(schedMusic, 40);
  }
  function musicStop(){
    if (!musicOn) return;
    musicOn = false;
    if (mTimer){ clearInterval(mTimer); mTimer = null; }
    if (ac){ musicG.gain.cancelScheduledValues(ac.currentTime); musicG.gain.linearRampToValueAtTime(0.0001, ac.currentTime+0.25); }
  }
  function setMusic(onoff){
    SV.opt.music = onoff?1:0; saveStore();
    if (onoff) musicStart(); else musicStop();
  }
  function setSfx(onoff){ SV.opt.sfx = onoff?1:0; saveStore(); }
  return { sfx:sfx, musicStart:musicStart, musicStop:musicStop, setMusic:setMusic, setSfx:setSfx, resume:resume };
})();

/* ---------- THEMES ---------- */
var THEMES = {
  city:    { img:'city',    band:'#6b5140', band2:'#57422f', line:'#8a6d52', fog:'rgba(255,150,60,0.10)', weather:'dusk' },
  forest:  { img:'forest',  band:'#2e4634', band2:'#24382a', line:'#4a6b4e', fog:'rgba(20,40,80,0.22)',   weather:'firefly' },
  desert:  { img:'desert',  band:'#c98d4f', band2:'#b0763c', line:'#e0aa68', fog:'rgba(255,170,60,0.14)', weather:'sand' },
  mount:   { img:'mount',   band:'#5d6b7a', band2:'#4c5a68', line:'#7d8ea0', fog:'rgba(120,160,220,0.14)',weather:'snow' },
  factory: { img:'factory', band:'#4a4440', band2:'#3a3532', line:'#6a5f55', fog:'rgba(30,40,60,0.25)',   weather:'dust' }
};

/* ---------- LEVELS (5 environments × 40 levels each) ---------- */
var THEME_ORDER = ['city','forest','desert','mount','factory'];
var LVL_KEY = { city:'c', forest:'f', desert:'d', mount:'m', factory:'k' };
function levelDef(tn){
  /* tn = "7" (city 7) or "f7" (forest 7) */
  var s = String(tn);
  var theme = 'city', n;
  if (/^[a-z]/.test(s)){ theme = ({ c:'city', f:'forest', d:'desert', m:'mount', k:'factory' })[s[0]] || 'city'; n = parseInt(s.slice(1),10) || 1; }
  else { n = parseInt(s,10) || 1; }
  n = clamp(n, 1, 40);
  var diff = (n-1)/39;
  var len = Math.round(8800 + n*420 + (n>20 ? (n-20)*300 : 0));
  var base = Math.min(398 + (n-1)*6.2, 610);
  var L = {
    n:n, theme:theme, key:LVL_KEY[theme] + n, diff:diff, len:len, base:base,
    ramp: Math.min(0.22 + diff*0.2, 0.42),
    dens: 0.35 + diff*0.62,
    seed: ((n*13371 + 77) + THEME_ORDER.indexOf(theme)*911) >>> 0,
    dualBias: n >= 20 ? 0.55 : 0.3,
    e_porcu: n >= 6, e_crow: n >= 9, e_saw: n >= 7, e_mover: n >= 8,
    e_blade: n >= 10, e_turret: n >= 15, e_fall: n >= 21, e_boulder: n >= 25,
    e_wall: n >= 5, e_bridge: n >= 12, e_spikes: n >= 3, e_pit: n >= 3,
    gem: n >= 4, pwEvery: n < 10 ? 1500 : 1900
  };
  /* theme-exclusive enemies */
  if (theme === 'city'){ L.e_car = n >= 4; L.e_pit = n >= 3; }
  if (theme === 'forest'){ L.e_wolf = n >= 4; }
  if (theme === 'desert'){ L.e_scorp = n >= 3; L.e_lizard = n >= 6; L.e_pit = true; L.e_spikes = true; }
  if (theme === 'mount'){ L.e_eagle = n >= 4; L.e_fall = n >= 21; }
  if (theme === 'factory'){ L.e_drone = n >= 4; L.e_turret = n >= 15; }
  return L;
}

/* ---------- WORLD / SPAWNER ---------- */
var W = {
  camX:0, spd:400, L:null, rng:null,
  ob:[], co:[], en:[], fl:[],
  nextX:900, zone:'single', zoneLeft:1400, lastChunk:'',
  finX:0, pwDist:0, weather:[], shake:0, shakeT:0, flash:0, slow:1,
  dist:0, Theme:THEMES.city, time:0
};

function jdist(){ return W.spd * 0.82; }
function safeGap(){ return Math.max(250, W.spd * 0.56); }

/* entity constructors (pooled-ish; arrays trimmed behind camera) */
function addOb(k, wx, lane, ex){
  var o = { k:k, wx:wx, lane:lane, y:LANE_Y[lane], t:0, dead:false, w:60, h:60 };
  if (ex) for (var p in ex) o[p] = ex[p];
  W.ob.push(o); return o;
}
function addCo(k, wx, y, lane, pw){
  W.co.push({ k:k, wx:wx, y:y, lane:lane, t:Math.random()*6, dead:false, pw:pw||'', mag:false });
}
function addEn(k, wx, lane, ex){
  var e = { k:k, wx:wx, lane:lane, y:LANE_Y[lane], t:Math.random()*3, dead:false, vx:0, st:0 };
  if (ex) for (var p2 in ex) e[p2] = ex[p2];
  W.en.push(e); return e;
}
function coinArc(x, lane, topY, n){
  n = n || 5;
  for (var i=0;i<n;i++){
    var f = i/(n-1) - 0.5;
    addCo('coin', x + f*jdist()*0.72, topY + f*f*260, lane);
  }
}
function coinLine(x, lane, n, dy){
  for (var i=0;i<n;i++) addCo('coin', x + i*54, LANE_Y[lane]-46-(dy||0), lane);
}
function coinRow(x, lane, n, y){
  for (var i=0;i<n;i++) addCo('coin', x + i*54, y, lane);
}

/* ---- environment-exclusive chunks ---- */
var THEME_CHUNKS = {
  city: [
    { id:'t_car', minL:4, wgt:3, fn:function(x, lane){
        addEn('car', x + jdist()*0.7, lane, { vx:-(W.spd*0.24 + 90) });
        coinArc(x + jdist()*0.7, lane, LANE_Y[lane]-156, 5);
        return jdist()*2.1;
    }},
    { id:'t_traffic', minL:12, wgt:2, dual:true, fn:function(x){
        addEn('car', x + jdist()*0.6, 0, { vx:-(W.spd*0.22+80) });
        addEn('car', x + jdist()*1.4, 1, { vx:-(W.spd*0.22+80) });
        coinLine(x + jdist()*0.2, 0, 2);
        coinLine(x + jdist()*1.0, 1, 2);
        return jdist()*2.5;
    }},
    { id:'t_hydrant', minL:1, wgt:2, fn:function(x, lane){
        addOb('hydrant', x + jdist()*0.5, lane, { w:38, h:58 });
        coinArc(x + jdist()*0.5, lane, LANE_Y[lane]-118, 4);
        return jdist()*1.3;
    }},
    { id:'t_bumper', minL:8, wgt:2, fn:function(x, lane){
        var g = jdist()*0.8;
        addOb('box', x+g*0.5, lane, { w:54, h:56 });
        addEn('car', x+g*1.5, lane, { vx:-(W.spd*0.2+70) });
        coinRow(x+g*0.5, lane, 2, LANE_Y[lane]-128);
        coinArc(x+g*1.5, lane, LANE_Y[lane]-150, 4);
        return g*2.4;
    }}
  ],
  forest: [
    { id:'t_wolf', minL:4, wgt:3, fn:function(x, lane){
        addEn('wolf', x + jdist()*0.75, lane, { vx:-(W.spd*0.2 + 76) });
        coinArc(x + jdist()*0.75, lane, LANE_Y[lane]-150, 5);
        return jdist()*2.2;
    }},
    { id:'t_pack', minL:14, wgt:2, fn:function(x, lane){
        addEn('wolf', x + jdist()*0.7, lane, { vx:-(W.spd*0.2+80) });
        addOb('rock', x + jdist()*1.5, lane, { w:54, h:58 });
        coinArc(x + jdist()*0.7, lane, LANE_Y[lane]-148, 4);
        coinArc(x + jdist()*1.5, lane, LANE_Y[lane]-128, 4);
        return jdist()*2.6;
    }},
    { id:'t_stump', minL:1, wgt:2, fn:function(x, lane){
        addOb('stump', x + jdist()*0.5, lane, { w:56, h:52 });
        coinArc(x + jdist()*0.5, lane, LANE_Y[lane]-110, 4);
        return jdist()*1.3;
    }},
    { id:'t_brush', minL:6, wgt:2, dual:true, fn:function(x){
        addOb('stump', x + 120, 0, { w:52, h:48 });
        addEn('wolf', x + 320, 1, { vx:-70 });
        addCo('gem', x + 520, LANE_Y[1]-150, 1);
        coinLine(x + 60, 0, 3);
        return 720;
    }}
  ],
  desert: [
    { id:'t_scorp', minL:3, wgt:3, fn:function(x, lane){
        addEn('scorp', x + jdist()*0.6, lane, { w:66, h:34, vx:-58 });
        coinArc(x + jdist()*0.6, lane, LANE_Y[lane]-132, 5);
        return jdist()*2.0;
    }},
    { id:'t_lizard', minL:6, wgt:2, fn:function(x, lane){
        addEn('lizard', x + jdist()*0.7, lane, { w:74, h:30, vx:-(W.spd*0.18+60) });
        coinArc(x + jdist()*0.7, lane, LANE_Y[lane]-122, 4);
        return jdist()*2.1;
    }},
    { id:'t_duo', minL:12, wgt:2, fn:function(x, lane){
        addEn('scorp', x + jdist()*0.6, lane, { w:64, h:32, vx:-52 });
        addEn('lizard', x + jdist()*1.5, lane, { w:72, h:30, vx:-(W.spd*0.18+64) });
        coinRow(x + jdist()*0.3, lane, 2, LANE_Y[lane]-56);
        coinArc(x + jdist()*1.5, lane, LANE_Y[lane]-138, 4);
        return jdist()*2.6;
    }},
    { id:'t_cactus', minL:1, wgt:3, fn:function(x, lane){
        addOb('cactus', x + jdist()*0.5, lane, { w:44, h:76 });
        coinArc(x + jdist()*0.5, lane, LANE_Y[lane]-136, 4);
        return jdist()*1.35;
    }},
    { id:'t_quicksand', minL:9, wgt:2, dual:true, fn:function(x){
        var pw = rnd(200, 280);
        addOb('pit', x + jdist()*0.5, 0, { w:pw });
        addOb('cactus', x + jdist()*0.9, 1, { w:40, h:70 });
        coinArc(x + jdist()*0.5 + pw/2, 0, LANE_Y[0]-150, 4);
        coinLine(x + jdist()*0.5, 1, 3);
        return jdist()*2.3;
    }}
  ],
  mount: [
    { id:'t_eagle', minL:4, wgt:3, fn:function(x, lane){
        addEn('eagle', x + jdist()*0.9, lane, { w:78, h:44, baseY:LANE_Y[lane]-170, amp:40, swooped:0 });
        addOb('spikes', x + jdist()*0.9, lane, { w:104, h:24 });
        coinRow(x + jdist()*0.55, lane, 3, LANE_Y[lane]-60);
        return jdist()*2.3;
    }},
    { id:'t_chasm', minL:6, wgt:2, fn:function(x, lane){
        var pw = rnd(230, 300);
        addOb('pit', x + jdist()*0.5, lane, { w:pw });
        coinArc(x + jdist()*0.5 + pw/2, lane, LANE_Y[lane]-158, 5);
        return jdist()*0.5 + pw + jdist()*1.0;
    }},
    { id:'t_pines', minL:1, wgt:2, fn:function(x, lane){
        addOb('stump', x + jdist()*0.5, lane, { w:52, h:56 });
        addOb('rock', x + jdist()*1.2, lane, { w:52, h:54 });
        coinLine(x + jdist()*0.2, lane, 3);
        return jdist()*2.1;
    }},
    { id:'t_storm', minL:15, wgt:2, fn:function(x, lane){
        addEn('eagle', x + jdist()*0.8, lane, { w:76, h:42, baseY:LANE_Y[lane]-166, amp:46, swooped:0 });
        addEn('fall', x + jdist()*1.8, lane, { r:32, vy:0, dropped:0 });
        coinLine(x + jdist()*0.4, lane, 3);
        return jdist()*2.9;
    }}
  ],
  factory: [
    { id:'t_drone', minL:4, wgt:3, fn:function(x, lane){
        addEn('drone', x + jdist()*0.85, lane, { w:84, h:52, baseY:LANE_Y[lane]-176, amp:34, drop:0 });
        coinLine(x + jdist()*0.35, lane, 3);
        return jdist()*2.3;
    }},
    { id:'t_magnet', minL:10, wgt:2, fn:function(x, lane){
        addEn('drone', x + jdist()*0.8, lane, { w:82, h:50, baseY:LANE_Y[lane]-174, amp:30, drop:1 });
        addOb('spikes', x + jdist()*1.1, lane, { w:110, h:24 });
        coinRow(x + jdist()*0.4, lane, 3, LANE_Y[lane]-58);
        return jdist()*2.4;
    }},
    { id:'t_gear', minL:1, wgt:2, fn:function(x, lane){
        addOb('crate', x + jdist()*0.5, lane, { w:56, h:58 });
        coinArc(x + jdist()*0.5, lane, LANE_Y[lane]-118, 4);
        return jdist()*1.35;
    }},
    { id:'t_gauntlet', minL:18, wgt:2, fn:function(x, lane){
        addOb('blade', x + jdist()*0.6, lane, { len:LANE_Y[lane]-44, r:34, ph:Math.random()*3 });
        addEn('drone', x + jdist()*1.7, lane, { w:80, h:50, baseY:LANE_Y[lane]-172, amp:32, drop:0 });
        coinLine(x + jdist()*0.2, lane, 2);
        coinArc(x + jdist()*1.7, lane, LANE_Y[lane]-150, 4);
        return jdist()*2.9;
    }}
  ]
};
/* ---- chunk library: each returns its width; all designed solvable ---- */
var CHUNKS = [
  { id:'solo', minL:1, wgt:3, fn:function(x, lane){
      var kind = pick(['box','rock']);
      var h = rnd(50, 82);
      addOb(kind, x + jdist()*0.5, lane, { w:58, h:h });
      coinArc(x + jdist()*0.5, lane, LANE_Y[lane]-120-h*0.4, 5);
      return jdist()*1.25;
  }},
  { id:'double', minL:2, wgt:3, fn:function(x, lane){
      var g = jdist()*0.85;
      addOb(pick(['box','rock']), x+g*0.5, lane, { w:58, h:rnd(48,74) });
      addOb(pick(['box','rock']), x+g*1.4, lane, { w:58, h:rnd(48,74) });
      coinLine(x+g*0.2, lane, 3);
      coinArc(x+g*1.4, lane, LANE_Y[lane]-118, 4);
      return g*2.1;
  }},
  { id:'triple', minL:6, wgt:2, fn:function(x, lane){
      var g = jdist()*0.8;
      for (var i=0;i<3;i++) addOb(pick(['box','rock']), x+g*(0.45+i*0.85), lane, { w:54, h:rnd(46,68) });
      coinRow(x+g*0.45, lane, 3, LANE_Y[lane]-132);
      return g*3.0;
  }},
  { id:'pit', minL:3, wgt:3, fn:function(x, lane){
      var pw = clamp(rnd(170, 250) + W.L.diff*90, 170, 330);
      addOb('pit', x + jdist()*0.45, lane, { w:pw });
      coinArc(x + jdist()*0.45 + pw/2, lane, LANE_Y[lane]-150, 5);
      if (W.L.diff > 0.35 && W.rng() < 0.5) addOb('rock', x + jdist()*0.45 + pw + safeGap()*0.75, lane, { w:56, h:56 });
      return jdist()*0.45 + pw + jdist()*0.95;
  }},
  { id:'spikes', minL:3, wgt:2, fn:function(x, lane){
      var sw = rnd(100, 150);
      addOb('spikes', x + jdist()*0.5, lane, { w:sw, h:26 });
      coinRow(x + jdist()*0.28, lane, 4, LANE_Y[lane]-142);
      return jdist()*1.35;
  }},
  { id:'wall', minL:5, wgt:2, fn:function(x, lane){
      addOb('wall', x + jdist()*0.55, lane, { w:46, h:rnd(98,122) });
      coinArc(x + jdist()*0.55, lane, LANE_Y[lane]-172, 5);
      return jdist()*1.35;
  }},
  { id:'saw', minL:7, wgt:2, fn:function(x, lane){
      addEn('saw', x + jdist()*0.85, lane, { r:33, vx:-(W.spd*0.22+70) });
      coinArc(x + jdist()*0.85, lane, LANE_Y[lane]-146, 4);
      return jdist()*1.6;
  }},
  { id:'mover', minL:8, wgt:2, fn:function(x, lane){
      addOb('mover', x + jdist()*0.55, lane, { w:62, h:38, base:LANE_Y[lane]-58, amp:140, ph:0 });
      addOb('mover', x + jdist()*1.35, lane, { w:62, h:38, base:LANE_Y[lane]-58, amp:140, ph:2.1 });
      coinLine(x + jdist()*0.35, lane, 2, 40);
      coinLine(x + jdist()*1.15, lane, 2, 40);
      return jdist()*2.2;
  }},
  { id:'blade', minL:10, wgt:2, fn:function(x, lane){
      var ph1 = Math.random()*3;
      addOb('blade', x + jdist()*0.6, lane, { len:LANE_Y[lane]-44, r:36, ph:ph1 });
      coinLine(x + jdist()*0.2, lane, 2);
      var wid = jdist()*1.5;
      if (W.L.diff > 0.45){
        addOb('blade', x + jdist()*1.6, lane, { len:LANE_Y[lane]-44, r:36, ph:ph1 + Math.PI });
        coinLine(x + jdist()*1.2, lane, 2);
        wid = jdist()*2.5;
      }
      return wid;
  }},
  { id:'bridge', minL:12, wgt:2, fn:function(x, lane){
      var pw = rnd(300, 400);
      addOb('pit', x + jdist()*0.5, 2, { w:pw, full:true });
      coinRow(x + jdist()*0.5 + 20, 2, Math.floor(pw/60), LANE_Y[2]-96);
      return jdist()*0.5 + pw + jdist()*0.8;
  }},
  { id:'choice', minL:4, wgt:3, dual:true, fn:function(x){
      var pitLane = Math.random()<0.5?0:1, obLane = 1-pitLane;
      var pw = rnd(190, 260);
      addOb('pit', x + jdist()*0.5, pitLane, { w:pw });
      coinArc(x + jdist()*0.5 + pw/2, pitLane, LANE_Y[pitLane]-148, 4);
      addOb(pick(['box','rock']), x + jdist()*0.75, obLane, { w:56, h:62 });
      coinLine(x + jdist()*0.45, obLane, 3);
      return jdist()*2.0;
  }},
  { id:'zig', minL:4, wgt:2, dual:true, fn:function(x){
      for (var i=0;i<6;i++){
        var ln = i%2;
        addCo('coin', x + i*90, LANE_Y[ln]-46, ln);
      }
      addOb('rock', x + 200, 1, { w:52, h:50 });
      addOb('box', x + 380, 0, { w:52, h:50 });
      return 760;
  }},
  { id:'porcu', minL:999, wgt:0, fn:function(x, lane){ return 0; }},
  { id:'crow', minL:999, wgt:0, fn:function(x, lane){ return 0; }},
  { id:'turret', minL:999, wgt:0, fn:function(x, lane){ return 0; }},
  { id:'fallrock', minL:21, wgt:2, fn:function(x, lane){
      addEn('fall', x + jdist()*0.8, lane, { r:34, vy:0, dropped:0 });
      addEn('fall', x + jdist()*1.7, lane, { r:34, vy:0, dropped:0 });
      coinLine(x + jdist()*0.5, lane, 4);
      return jdist()*2.6;
  }},
  { id:'boulder', minL:25, wgt:2, fn:function(x, lane){
      addEn('boulder', x + jdist()*1.3, lane, { r:50, vx:-(W.spd*0.30+60) });
      coinArc(x + jdist()*1.3, lane, LANE_Y[lane]-168, 5);
      return jdist()*2.4;
  }},
  { id:'power', minL:1, wgt:2, fn:function(x, lane){
      addCo('pw', x + jdist()*0.5, LANE_Y[lane]-108, lane, pickPower());
      coinLine(x + jdist()*0.15, lane, 2);
      return jdist()*1.1;
  }},
  { id:'gem', minL:4, wgt:1, fn:function(x, lane){
      addOb('box', x + jdist()*0.45, lane, { w:54, h:56 });
      addCo('gem', x + jdist()*0.78, LANE_Y[lane]-158, lane);
      coinArc(x + jdist()*0.5, lane, LANE_Y[lane]-136, 3);
      return jdist()*1.5;
  }},
  { id:'rest', minL:1, wgt:1, fn:function(x, lane){
      coinLine(x + 80, lane, 6);
      return 640;
  }}
];
function pickPower(){
  var r = Math.random(), LV = W.L ? W.L.n : 1;
  if (r < 0.24) return 'shield';
  if (r < 0.46) return 'speed';
  if (r < 0.68) return 'magnet';
  if (r < 0.84) return 'dash';
  return LV >= 3 ? 'life' : 'shield';
}
function chunkAllowed(c){
  var L = W.L;
  if (L.n < c.minL) return false;
  if (c.dual && W.zone !== 'dual') return false;
  if ((c.id === 't_car' && !L.e_car) || (c.id === 't_wolf' && !L.e_wolf) ||
      (c.id === 't_scorp' && !L.e_scorp) || (c.id === 't_lizard' && !L.e_lizard) ||
      (c.id === 't_eagle' && !L.e_eagle) || (c.id === 't_drone' && !L.e_drone)) return false;
  if (c.id === 'saw' && !L.e_saw) return false;
  if (c.id === 'mover' && !L.e_mover) return false;
  if (c.id === 'blade' && !L.e_blade) return false;
  if (c.id === 'porcu' && !L.e_porcu) return false;
  if (c.id === 'crow' && !L.e_crow) return false;
  if (c.id === 'turret' && !L.e_turret) return false;
  if (c.id === 'fallrock' && !L.e_fall) return false;
  if (c.id === 'boulder' && !L.e_boulder) return false;
  if (c.id === 'wall' && !L.e_wall) return false;
  if (c.id === 'bridge' && !L.e_bridge) return false;
  if (c.id === 'pit' && !L.e_pit) return false;
  if (c.id === 'spikes' && !L.e_spikes) return false;
  if (c.id === W.lastChunk) return false;
  return true;
}
function spawnAhead(){
  var L = W.L;
  var limit = W.camX + VW + 700;
  var guard = 0;
  while (W.nextX < limit && guard++ < 60){
    if (W.nextX > L.len - 500){ W.nextX = L.len + 10; break; }
    /* zone management */
    W.zoneLeft -= 0;
    if (W.zoneLeft <= 0){
      var wantDual = (G.mode === 'duel') ? (W.rng() < 0.7) : (W.rng() < L.dualBias);
      W.zone = wantDual ? 'dual' : 'single';
      W.zoneLeft = W.rng() < 0.5 ? rnd(1500, 2600) : rnd(2400, 3800);
    }
    var pool = [], tw = 0;
    var allC = CHUNKS.concat(THEME_CHUNKS[L.theme] || []);
    for (var i=0;i<allC.length;i++){
      var c = allC[i];
      if (c.wgt <= 0) continue;
      if ((c.id==='power') && W.nextX - W.pwDist < L.pwEvery) continue;
      if (!chunkAllowed(c)) continue;
      pool.push(c); tw += c.wgt;
    }
    if (!pool.length){ W.nextX += 400; continue; }
    var r = W.rng()*tw, sel = pool[0];
    for (var j=0;j<pool.length;j++){ r -= pool[j].wgt; if (r <= 0){ sel = pool[j]; break; } }
    W.lastChunk = sel.id;
    if (sel.id === 'power') W.pwDist = W.nextX;
    var lane = (W.zone === 'dual') ? (W.rng() < 0.5 ? 0 : 1) : (W.rng() < 0.5 ? 0 : 1);
    if (W.zone === 'single' && (G.mode !== 'duel') && W.rng() < 0.5) lane = 2;
    var wdt = sel.fn(W.nextX, lane);
    var gap = (lerp(360, 205, L.dens) + W.rng()*150) * (W.spd/440);
    W.nextX += Math.max(wdt, 320) + gap;
    W.zoneLeft -= wdt + gap;
  }
  /* finish line */
  W.finX = L.len;
}
function resetWorld(L){
  W.camX = 0; W.spd = L.base; W.L = L; W.rng = RNG(L.seed);
  W.ob.length = 0; W.co.length = 0; W.en.length = 0; W.fl.length = 0;
  W.nextX = 900 + L.base*0.4; W.zone = 'single'; W.zoneLeft = 1800; W.lastChunk = '';
  W.pwDist = 0; W.dist = 0; W.time = 0; W.slow = 1; W.flash = 0; W.shake = 0;
  W.Theme = THEMES[L.theme];
  initWeather();
  spawnAhead();
}

/* ---------- WEATHER / AMBIENT PARTICLES ---------- */
function initWeather(){
  W.weather.length = 0;
  var kind = W.Theme.weather, n = kind === 'firefly' ? 26 : (kind === 'snow' ? 44 : 30);
  for (var i=0;i<n;i++){
    W.weather.push({ x:Math.random()*VW, y:Math.random()*VH, s:rnd(1,3), ph:Math.random()*6, k:kind });
  }
}
function updWeather(dt){
  var arr = W.weather, k = W.Theme.weather;
  for (var i=0;i<arr.length;i++){
    var p = arr[i];
    if (k === 'snow'){ p.y += (24+p.s*16)*dt; p.x += Math.sin(p.ph+W.time*1.4)*24*dt - W.spd*0.06*dt; if (p.y>VH){ p.y=-6; p.x=Math.random()*VW; } }
    else if (k === 'sand'){ p.x -= (W.spd*0.55+p.s*60)*dt; p.y += Math.sin(p.ph+W.time*3)*30*dt; if (p.x<-10){ p.x=VW+10; p.y=Math.random()*VH; } }
    else if (k === 'firefly'){ p.x += Math.sin(p.ph+W.time*0.9)*20*dt - W.spd*0.04*dt; p.y += Math.cos(p.ph*1.3+W.time*0.7)*16*dt; if (p.x<-10)p.x=VW+10; if (p.x>VW+10)p.x=-10; if(p.y<0)p.y=VH; if(p.y>VH)p.y=0; }
    else if (k === 'dust'){ p.x -= (W.spd*0.10+p.s*8)*dt; p.y -= 8*dt; if (p.x<-10){ p.x=VW+8; p.y=Math.random()*VH; } if (p.y<-8)p.y=VH; }
    else { p.x -= (W.spd*0.05)*dt; if (p.x<-10){ p.x=VW+10; p.y=Math.random()*VH; } }
  }
}

/* ---------- FX POOLS ---------- */
var PT = [], PTP = 320;
for (var pi=0; pi<PTP; pi++) PT.push({ on:false });
function emit(x, y, vx, vy, life, size, col, k){
  for (var i=0;i<PTP;i++){
    var p = PT[i];
    if (!p.on){
      p.on=true; p.x=x; p.y=y; p.vx=vx; p.vy=vy; p.life=life; p.max=life; p.size=size; p.col=col; p.k=k||'dot';
      return;
    }
  }
}
function burst(x, y, n, col, spd, k){
  for (var i=0;i<n;i++){
    var a = Math.random()*6.283, v = rnd(spd*0.3, spd);
    emit(x, y, Math.cos(a)*v, Math.sin(a)*v - spd*0.25, rnd(0.35,0.8), rnd(2,5.5), col, k);
  }
}
function updPT(dt){
  for (var i=0;i<PTP;i++){
    var p = PT[i];
    if (!p.on) continue;
    p.life -= dt;
    if (p.life <= 0){ p.on = false; continue; }
    p.x += p.vx*dt; p.y += p.vy*dt;
    if (p.k === 'dust' || p.k === 'fire') p.vy -= 60*dt;
    else p.vy += 680*dt;
    if (p.k === 'spark') p.vx *= 0.98;
  }
}
function addFloat(x, y, txt, col){ W.fl.push({ x:x, y:y, txt:txt, col:col||'#fff', life:0.9 }); }

/* ---------- PLAYER ---------- */
var P = {
  wx:0, y:0, vy:0, lanePos:1, laneT:1, st:'run', slideT:0, invT:0,
  shieldT:0, speedT:0, magT:0, dashT:0, lives:1, coins:0, score:0,
  combo:0, comboT:0, animT:0, frame:0, dead:false, deathT:0, finished:false,
  finT:0, pitFall:false, jumpHeld:false, jumpT:0, hits:0, startT:0
};
function resetPlayer(){
  P.wx = 0; P.y = LANE_Y[1]; P.vy = 0; P.lanePos = 1; P.laneT = 1;
  P.st = 'run'; P.slideT = 0; P.invT = 0; P.shieldT = 0; P.speedT = 0; P.magT = 0; P.dashT = 0;
  P.lives = 1; P.coins = 0; P.score = 0; P.combo = 0; P.comboT = 0; P.animT = 0; P.frame = 0;
  P.dead = false; P.deathT = 0; P.finished = false; P.finT = 0; P.pitFall = false; P.jumpHeld = false; P.hits = 0;
  P.startT = now();
}
function foxSpeed(){
  var s = W.spd;
  if (P.speedT > 0) s *= 1.38;
  if (P.dashT > 0) s *= 1.65;
  return s;
}
function pJump(){
  if (G.state !== 'play' || P.dead || P.finished) return;
  if (P.st === 'run'){
    P.st = 'jump'; P.vy = JUMP_V; P.jumpT = 0; P.jumpHeld = true;
    P.slideT = 0; Snd.sfx('jump');
    dustAt(FOX_X, P.y, 5);
  } else if (P.st === 'slide'){
    P.st = 'jump'; P.vy = JUMP_V*0.92; P.jumpT = 0; P.jumpHeld = true; P.slideT = 0;
    Snd.sfx('jump'); dustAt(FOX_X, P.y, 5);
  }
  if (G.mode === 'duel'){ NET._ls = 0; netSend(); }
}
function pSlide(){
  if (G.state !== 'play' || P.dead || P.finished) return;
  if (P.st === 'jump'){ P.vy = Math.max(P.vy, 620); }  // fast-fall into slide
  if (P.st === 'run' || P.st === 'slide'){
    if (P.st !== 'slide'){ Snd.sfx('slide'); }
    P.st = 'slide'; P.slideT = SLIDE_T;
    dustAt(FOX_X-20, P.y, 6);
  }
  if (G.mode === 'duel'){ NET._ls = 0; netSend(); }
}
function pLane(dir){
  if (G.state !== 'play' || P.dead || P.finished) return;
  var t = clamp(P.laneT + dir, 0, 1);
  if (t !== P.laneT){ P.laneT = t; Snd.sfx('click'); if (G.mode === 'duel'){ NET._ls = 0; netSend(); } }
}
function dustAt(x, y, n){
  for (var i=0;i<n;i++)
    emit(x+rnd(-14,10), y-rnd(0,8), -rnd(60,190)+ (foxSpeed()-W.spd), -rnd(10,90), rnd(0.3,0.6), rnd(2,5), 'rgba(200,180,150,0.5)', 'dust');
}
function updPlayer(dt){
  if (P.dead){
    P.deathT += dt;
    if (P.pitFall){ P.y += 460*dt; }
    else if (P.deathT < 0.85){ P.y = Math.max(LANE_Y[Math.round(P.lanePos)] , P.y - 40*dt); }
    return;
  }
  if (P.finished) return;
  var ty = LANE_Y[Math.round(P.laneT*2)/2 * 2 === 0 ? 0 : 1];
  /* lane interpolation (0..1) — smooth, ~90ms */
  P.lanePos += (P.laneT - P.lanePos) * Math.min(1, dt*16);
  if (Math.abs(P.laneT - P.lanePos) < 0.01) P.lanePos = P.laneT;
  var trackY = LANE_Y[P.lanePos < 0.35 ? 0 : (P.lanePos > 0.65 ? 1 : 2)];
  /* timers */
  if (P.invT > 0) P.invT -= dt;
  if (P.shieldT > 0) P.shieldT -= dt;
  if (P.speedT > 0) P.speedT -= dt;
  if (P.magT > 0) P.magT -= dt;
  if (P.dashT > 0) P.dashT -= dt;
  if (P.comboT > 0){ P.comboT -= dt; if (P.comboT <= 0) P.combo = 0; }
  /* vertical */
  var gy = trackY;
  if (P.st === 'jump'){
    P.jumpT += dt;
    var g = (P.jumpHeld && P.vy < 0 && P.jumpT < JUMP_HOLD_T) ? JUMP_HOLD_G : GRAV;
    P.vy += g*dt; P.y += P.vy*dt;
    if (P.y >= gy){
      P.y = gy; P.vy = 0; P.st = 'run'; dustAt(FOX_X, P.y, 4);
      Snd.sfx('click');
    }
  } else if (P.st === 'slide'){
    P.slideT -= dt;
    P.y = gy;
    if (Math.random() < 0.5) dustAt(FOX_X-30, P.y, 1);
    if (P.slideT <= 0){ P.st = 'run'; }
  } else {
    P.y = gy;
  }
  /* forward motion */
  var sp = foxSpeed();
  P.wx += sp*dt;
  W.dist = P.wx;
  /* score: distance */
  P.score += sp*dt/12;
  /* run dust + dash fire */
  if (P.st === 'run' && Math.random() < 0.35) dustAt(FOX_X-26, P.y, 1);
  if (P.dashT > 0 && Math.random() < 0.8)
    emit(FOX_X-30+rnd(-8,8), P.y-rnd(8,30), -rnd(120,260), rnd(-40,40), rnd(0.25,0.5), rnd(3,7), pick(['#ff9a3d','#ffcf5e','#ff6a00']), 'fire');
  if (P.speedT > 0 && Math.random() < 0.4)
    emit(FOX_X-24, P.y-rnd(6,26), -rnd(200,340), rnd(-20,20), 0.3, rnd(2,4), 'rgba(140,220,255,0.7)', 'spark');
  /* animation */
  P.animT += dt;
}
function foxFrame(){
  var a;
  if (P.dead) a = ANIM.death;
  else if (P.pitFall) a = ANIM.fall;
  else if (P.st === 'jump') a = (P.vy < 0 ? ANIM.jump : ANIM.fall);
  else if (P.st === 'slide') a = ANIM.slide;
  else a = ANIM.run;
  var idx;
  if (a.loop){
    idx = a.f[Math.floor(P.animT*a.fps) % a.f.length];
  } else {
    if (P.dead){
      var di = Math.floor(P.deathT*a.fps);
      idx = a.f[Math.min(di, a.f.length-1)];
    } else {
      idx = a.f[Math.min(Math.floor(P.animT*a.fps), a.f.length-1)];
    }
  }
  return idx;
}
function killPlayer(pit){
  if (P.dead || P.finished) return;
  if (P.invT > 0 && !pit) return;
  P.hits++;
  if (P.shieldT > 0 && !pit){
    P.shieldT = 0; P.invT = 1.3; Snd.sfx('shield');
    burst(FOX_X, P.y-30, 16, '#7fd4ff', 260, 'spark');
    addFloat(FOX_X, P.y-90, 'سپر شکست!', '#7fd4ff');
    return;
  }
  if (P.lives > 1 && !pit){
    P.lives--; P.invT = 1.7; Snd.sfx('hit'); W.shake = 10; W.shakeT = 0.35; W.flash = 0.35;
    burst(FOX_X, P.y-30, 14, '#ff7a50', 240, 'spark');
    addFloat(FOX_X, P.y-90, '-۱ جان', '#ff8866');
    hudLives();
    return;
  }
  /* real death */
  P.dead = true; P.deathT = 0; P.pitFall = !!pit;
  if (!pit){ Snd.sfx('die'); W.shake = 14; W.shakeT = 0.4; W.flash = 0.5; burst(FOX_X, P.y-30, 22, '#ff5533', 300, 'spark'); }
  else Snd.sfx('die');
  if (G.mode === 'duel'){
    NET.send({ t:'die' });
    DUE.failed = true;
    Snd.musicStop();
    setTimeout(duelAfterDeath, pit ? 700 : 950);
  } else {
    setTimeout(gameOver, pit ? 700 : 950);
  }
}

/* ---------- COLLISION ---------- */
function foxBox(){
  var bx, by, bw, bh;
  if (P.st === 'slide'){ bw = 86; bh = 28; }
  else { bw = 56; bh = 46; }
  bx = FOX_X - bw/2 + 4;
  by = P.y - bh;
  return { x:bx, y:by, w:bw-8, h:bh-4 };
}
function boxHit(b, x, y, w, h){
  return b.x < x+w && b.x+b.w > x && b.y < y+h && b.y+b.h > y;
}
function effLane(){
  if (P.lanePos < 0.32) return 0;
  if (P.lanePos > 0.68) return 1;
  return 2;
}
function collide(){
  if (P.dead || P.finished) return;
  var b = foxBox(), ln = effLane(), i, o;
  var dashOn = P.dashT > 0;
  for (i=0;i<W.ob.length;i++){
    o = W.ob[i];
    if (o.dead) continue;
    var sx = o.wx - W.camX;
    if (sx < -260 || sx > VW + 260) continue;
    if (o.lane !== 2 && o.lane !== ln && !(o.lane===2)) {
      if (o.lane !== ln) {
        // during lane transition treat center as both
        if (!(ln === 2 && (o.lane===0 || o.lane===1))) continue;
      }
    }
    if (o.k === 'pit'){
      if (P.st !== 'jump' && P.y >= o.y - 6){
        var pad = 14;
        if (P.wx > o.wx + pad && P.wx < o.wx + o.w - pad){
          if (o.full || laneOK(o.lane)){
            if (!P.pitFall){ P.pitFall = true; P.dead = true; P.deathT = 0; Snd.sfx('die');
              if (G.mode === 'duel' && NET.ws) NET.send({ t:'die' });
              setTimeout(gameOver, 750);
              return;
            }
          }
        }
      }
      continue;
    }
    var ox, oy, ow, oh;
    if (o.k === 'mover'){ ow = o.w; oh = o.h; ox = sx - ow/2; oy = o.base - Math.abs(Math.sin(W.time*2.2 + o.ph))*o.amp - oh; }
    else if (o.k === 'blade'){
      var ang = Math.sin(W.time*2.4 + o.ph)*1.05;
      var px = sx, py = -20, bx2 = px + Math.sin(ang)*o.len, by2 = py + Math.cos(ang)*o.len;
      var rr = o.r + 22;
      var cx = clamp(bx2, b.x, b.x+b.w), cy = clamp(by2, b.y, b.y+b.h);
      if ((cx-bx2)*(cx-bx2) + (cy-by2)*(cy-by2) < rr*rr*0.55){ hitOb(o, dashOn); }
      continue;
    }
    else { ow = o.w; oh = o.h; ox = sx - ow/2; oy = o.y - oh; }
    if (boxHit(b, ox+6, oy+6, ow-12, oh-12)) hitOb(o, dashOn);
  }
  /* enemies */
  for (i=0;i<W.en.length;i++){
    var e = W.en[i];
    if (e.dead) continue;
    var sx2 = e.wx - W.camX;
    if (sx2 < -200 || sx2 > VW + 240) continue;
    if (e.lane !== 2 && e.lane !== ln) continue;
    var ex, ey, ew, eh;
    if (e.k === 'saw' || e.k === 'fall' || e.k === 'boulder' || e.k === 'car' || e.k === 'wolf' || e.k === 'eagle' || e.k === 'drone'){
      var r = e.r + 18;
      var cx2 = clamp(sx2, b.x, b.x+b.w), cy2 = clamp(e.y, b.y, b.y+b.h);
      if ((cx2-sx2)*(cx2-sx2) + (cy2-e.y)*(cy2-e.y) < r*r*0.6){
        if (dashOn && e.k !== 'boulder'){ e.dead = true; breakEnemy(e); }
        else killPlayer(false);
      }
      continue;
    }
    ew = e.w; eh = e.h; ex = sx2 - ew/2; ey = e.y - eh;
    if (e.k === 'bolt'){ eh = 14; ey = e.y - 7; }
    if (boxHit(b, ex+5, ey+5, ew-10, eh-10)){
      if (dashOn){ e.dead = true; breakEnemy(e); }
      else killPlayer(false);
    }
  }
  /* pickups */
  var magR = P.magT > 0 ? 250 : 0;
  for (i=0;i<W.co.length;i++){
    var c = W.co[i];
    if (c.dead) continue;
    var cx3 = c.wx - W.camX;
    if (cx3 < -60 || cx3 > VW + 90) continue;
    if (c.lane !== 2 && c.lane !== ln && !(ln===2)) continue;
    var cy3 = c.y + Math.sin(c.t*3)*5;
    if (magR > 0 && c.k !== 'pw'){
      var dx = FOX_X - cx3, dy = (P.y-34) - cy3, d2 = dx*dx + dy*dy;
      if (d2 < magR*magR){
        var d = Math.sqrt(d2) || 1;
        c.wx += (dx/d) * 560 * dtFrame; c.y += (dy/d) * 560 * dtFrame;
        c.mag = true;
      }
    }
    var pr = c.k === 'pw' ? 40 : 34;
    if (Math.abs(cx3 - FOX_X) < pr && Math.abs(cy3 - (P.y-28)) < pr + (P.st==='slide'? -6 : 8)){
      pickUp(c);
    }
  }
}
function hitOb(o, dashOn){
  if (o.dead) return;
  if (dashOn && (o.k === 'box' || o.k === 'rock')){
    o.dead = true; Snd.sfx('breakS');
    burst(o.wx - W.camX, o.y - o.h/2, 14, '#b07b3f', 300, 'dot');
    P.score += 50; addFloat(o.wx - W.camX, o.y - o.h - 20, '+۵۰', '#ffd27f');
    W.shake = 5; W.shakeT = 0.18;
    return;
  }
  killPlayer(false);
}
function breakEnemy(e){
  Snd.sfx('breakS');
  burst(e.wx - W.camX, e.y - 20, 14, '#8a8f99', 280, 'dot');
  P.score += 50; addFloat(e.wx - W.camX, e.y - 50, '+۵۰', '#ffd27f');
}
function pickUp(c){
  if (c.dead) return;
  c.dead = true;
  var sx = c.wx - W.camX;
  if (c.k === 'coin' || c.k === 'sil'){
    var val = c.k === 'coin' ? 1 : 5;
    P.coins += val;
    P.combo = Math.min(P.combo + 1, 20); P.comboT = 1.2;
    var pts = (c.k === 'coin' ? 10 : 40) + P.combo*2;
    P.score += pts;
    Snd.sfx(c.k === 'coin' ? 'coin' : 'silver');
    burst(sx, c.y, 5, c.k === 'coin' ? '#e8a94e' : '#cfd6e2', 150, 'spark');
    if (P.combo >= 5) addFloat(sx, c.y-26, 'کمبو ×' + P.combo, '#ffe08a');
    hudCoins();
  } else if (c.k === 'gem'){
    P.coins += 25; P.score += 200; Snd.sfx('gem');
    burst(sx, c.y, 18, '#57e6b8', 260, 'spark');
    addFloat(sx, c.y-30, '+۲۵ 💎', '#57e6b8');
    hudCoins();
  } else if (c.k === 'pw'){
    grantPower(c.pw, sx, c.y);
  }
}
function grantPower(kind, sx, sy){
  Snd.sfx('power');
  W.flash = 0.22;
  if (kind === 'shield'){ P.shieldT = 8; addFloat(sx, sy-40, 'سپر!', '#7fd4ff'); burst(sx, sy, 12, '#7fd4ff', 220, 'spark'); }
  else if (kind === 'speed'){ P.speedT = 6; addFloat(sx, sy-40, 'سرعت!', '#8ce0ff'); burst(sx, sy, 12, '#8ce0ff', 220, 'spark'); }
  else if (kind === 'magnet'){ P.magT = 8; addFloat(sx, sy-40, 'آهن‌ربا!', '#ff9a9a'); burst(sx, sy, 12, '#ff9a9a', 220, 'spark'); }
  else if (kind === 'dash'){ P.dashT = 3.2; addFloat(sx, sy-40, 'شتاب‌شکست!', '#ffb056'); burst(sx, sy, 14, '#ffb056', 260, 'fire'); W.shake = 4; W.shakeT = 0.15; }
  else if (kind === 'life'){
    if (P.lives < 3){ P.lives++; addFloat(sx, sy-40, '+۱ جان', '#ff7a7a'); }
    else { P.score += 300; addFloat(sx, sy-40, '+۳۰۰', '#ff7a7a'); }
    Snd.sfx('heart'); burst(sx, sy, 12, '#ff7a7a', 200, 'spark');
    hudLives();
  }
}

/* ---------- ENEMY / OBSTACLE UPDATE ---------- */
function updEntities(dt){
  var i, o;
  for (i=W.ob.length-1;i>=0;i--){
    o = W.ob[i];
    o.t += dt;
    if (o.wx - W.camX < -420) { W.ob.splice(i,1); continue; }
  }
  for (i=W.co.length-1;i>=0;i--){
    var c = W.co[i];
    c.t += dt;
    if ((c.wx - W.camX < -160 && !c.mag) || (c.dead && c.wx - W.camX < -160)) { W.co.splice(i,1); continue; }
  }
  for (i=W.en.length-1;i>=0;i--){
    var e = W.en[i];
    e.t += dt;
    if (e.wx - W.camX < -420){ W.en.splice(i,1); continue; }
    if (P.dead) continue;
    if (e.k === 'saw' || e.k === 'boulder'){
      e.wx += e.vx*dt;
      e.y = LANE_Y[e.lane] - (e.k==='boulder' ? e.r*0.55 : e.r*0.6) - Math.abs(Math.sin(e.t*9))*4;
      if (e.k === 'boulder' && Math.random() < 0.3) emit(e.wx - W.camX + rnd(-20,20), LANE_Y[e.lane]-6, -rnd(40,120), -rnd(10,60), 0.4, rnd(2,4), 'rgba(160,140,120,0.5)', 'dust');
    } else if (e.k === 'porcu'){
      e.wx += e.vx*dt;
      e.y = LANE_Y[e.lane];
    } else if (e.k === 'crow'){
      var distX = e.wx - P.wx;
      if (!e.swooped && distX < 430 && distX > 0 && Math.random() < 0.02){ e.swooped = 1; e.sy = e.y; }
      if (e.swooped === 1){
        e.y += (P.y - 46 - e.y) * Math.min(1, dt*4.5);
        if (distX < -30){ e.swooped = 2; }
      } else if (e.swooped === 2){
        e.y += (e.baseY - e.y) * Math.min(1, dt*3);
        if (Math.abs(e.y - e.baseY) < 8) e.swooped = 0;
      } else {
        e.y = e.baseY + Math.sin(e.t*2.6)*e.amp;
      }
      e.wx -= 26*dt;
    } else if (e.k === 'turret'){
      var d2 = e.wx - P.wx;
      e.cd -= dt;
      if (e.cd <= 0 && d2 < 950 && d2 > 60 && !P.dead && !P.finished){
        e.cd = 1.75;
        var high = (Math.floor(e.t*10) % 2) === 0;
        /* high bolt => must slide; low bolt => must jump */
        addEn('bolt', e.wx - 40, e.lane, { vx:-(W.spd + 240), y: LANE_Y[e.lane] - (high ? 38 : 12), w:44, h:14 });
        Snd.sfx('click');
      }
    } else if (e.k === 'fall'){
      if (!e.dropped && e.wx - P.wx < 240){ e.dropped = 1; e.vy = 140; e.y = LANE_Y[e.lane] - 330; }
      if (e.dropped){
        e.vy += 2600*dt; e.y += e.vy*dt;
        var gyy = LANE_Y[e.lane] - e.r*0.4;
        if (e.y >= gyy){
          e.y = gyy;
          if (!e.landed){ e.landed = 1; W.shake = 6; W.shakeT = 0.2; dustAt(e.wx - W.camX, LANE_Y[e.lane], 8); Snd.sfx('breakS'); }
          e.stay = (e.stay || 0) + dt;
          if (e.stay > 2.2) e.dead = true;
        }
      }
    } else if (e.k === 'bolt'){
      e.wx += e.vx*dt;
    } else if (e.k === 'car'){
      e.wx += e.vx*dt;
      e.y = LANE_Y[e.lane] - 4;
    } else if (e.k === 'scorp'){
      e.wx += e.vx*dt;
      e.y = LANE_Y[e.lane] + Math.sin(e.t*7)*2;
    } else if (e.k === 'lizard'){
      e.wx += e.vx*dt;
      e.y = LANE_Y[e.lane];
    } else if (e.k === 'wolf'){
      e.wx += e.vx*dt;
      e.y = LANE_Y[e.lane];
    } else if (e.k === 'eagle'){
      var dxe = e.wx - P.wx;
      if (!e.swooped && dxe < 430 && dxe > 0 && Math.random() < 0.02){ e.swooped = 1; }
      if (e.swooped === 1){
        e.y += (P.y - 50 - e.y) * Math.min(1, dt*4.5);
        if (dxe < -30) e.swooped = 2;
      } else if (e.swooped === 2){
        e.y += (e.baseY - e.y) * Math.min(1, dt*3);
        if (Math.abs(e.y - e.baseY) < 8) e.swooped = 0;
      } else {
        e.y = e.baseY + Math.sin(e.t*2.6)*e.amp;
      }
      e.wx -= 26*dt;
    } else if (e.k === 'drone'){
      e.y = e.baseY + Math.sin(e.t*2.4)*e.amp;
      if (e.drop && !e.dropped && e.wx - P.wx < 200 && e.wx - P.wx > 0 && Math.random() < 0.012){
        e.dropped = 1;
        addEn('bolt', e.wx - 30, e.lane, { vx:-(W.spd + 200), y:e.y + 30, w:40, h:13 });
      }
      e.wx -= 18*dt;
    }
  }
  for (i=W.fl.length-1;i>=0;i--){
    var f = W.fl[i];
    f.life -= dt; f.y -= 46*dt;
    if (f.life <= 0) W.fl.splice(i,1);
  }
  updPT(dt);
  updWeather(dt);
  if (W.shakeT > 0){ W.shakeT -= dt; if (W.shakeT <= 0) W.shake = 0; }
  if (W.flash > 0) W.flash -= dt*1.6;
}

/* ---------- RIVAL (online ghost / bot) ---------- */
var OPP = {
  on:false, bot:false, name:'', wx:0, rx:0, lanePos:1, y:0, st:'run', animT:0,
  coins:0, finished:false, finT:0, dead:false, lastNet:0, skill:0.86, jit:0
};
function resetOpp(bot, name){
  OPP.on = true; OPP.bot = !!bot; OPP.name = name || 'حریف';
  OPP.wx = 0; OPP.rx = 0; OPP.lanePos = 1; OPP.y = LANE_Y[1]; OPP.st = 'run';
  OPP.animT = 0; OPP.coins = 0; OPP.finished = false; OPP.dead = false; OPP.lastNet = 0;
  OPP.skill = clamp(0.80 + W.L.diff*0.14, 0.8, 0.95);
}
function updOpp(dt){
  if (!OPP.on) return;
  OPP.animT += dt;
  if (OPP.bot && !OPP.dead && !OPP.finished && (G.state === 'play' || G.state === 'spec')){
    /* bot brain: reads the same track, jumps/slides with human-like delay */
    var sp = foxSpeed() * OPP.skill;
    OPP.wx += sp*dt;
    var look = sp * 0.42;
    var act = null, i, o;
    for (i=0;i<W.ob.length;i++){
      o = W.ob[i];
      if (o.dead) continue;
      var d = o.wx - OPP.wx;
      if (d > 20 && d < look){
        if (o.k === 'pit'){ if (d < sp*0.30) act = 'jump'; }
        else if (o.k === 'spikes'){ if (d < sp*0.24) act = 'jump'; }
        else if (o.k === 'blade'){ if (d < sp*0.2) act = 'slide'; }
        else if (o.k === 'mover'){
          var yy = o.base - Math.abs(Math.sin(W.time*2.2 + o.ph))*o.amp;
          if (yy > LANE_Y[o.lane]-90 && d < sp*0.26) act = 'slide';
        } else { if (d < sp*0.26) act = 'jump'; }
        if (act) break;
      }
    }
    if (!act){
      for (i=0;i<W.en.length;i++){
        var e = W.en[i];
        if (e.dead) continue;
        var d2 = e.wx - OPP.wx;
        if (d2 > 20 && d2 < sp*0.30){
          if (e.k === 'crow') act = OPP.jit ? 'jump' : 'slide';
          else act = 'jump';
          break;
        }
      }
    }
    if (Math.random() < 0.006) OPP.jit = 1 - OPP.jit;
    if (act === 'jump' && OPP.st === 'run'){ OPP.st = 'jump'; OPP.vy = JUMP_V*OPP.skill; }
    if (act === 'slide'){ OPP.st = 'slide'; OPP.slideT = 0.5; }
    if (OPP.st === 'jump'){
      OPP.vy += GRAV*dt; OPP.y += OPP.vy*dt;
      var gy = LANE_Y[Math.round(OPP.lanePos)];
      if (OPP.y >= gy){ OPP.y = gy; OPP.st = 'run'; }
    } else if (OPP.st === 'slide'){
      OPP.slideT -= dt; OPP.y = LANE_Y[Math.round(OPP.lanePos)];
      if (OPP.slideT <= 0) OPP.st = 'run';
    } else OPP.y = LANE_Y[Math.round(OPP.lanePos)];
    /* bot mistakes: occasionally clips an obstacle */
    if (Math.random() < 0.0009 * (1.3 - OPP.skill) * 60 * dt * 60){ /* rare */ }
    if (OPP.wx >= W.L.len && !OPP.finished){ OPP.finished = true; OPP.finT = W.time; duelOnOppFinish(); }
  }
  if (!OPP.bot){
    /* real rival: interpolate snapshot buffer at a constant 110ms behind => smooth, no rubber-band */
    var B = NET.buf;
    if (B && B.length >= 2){
      var rt = now() - 110;
      var sa = B[0], sb = B[B.length-1];
      for (var kb=0; kb<B.length-1; kb++){
        if (B[kb].rt <= rt && B[kb+1].rt >= rt){ sa = B[kb]; sb = B[kb+1]; break; }
      }
      var spn = sb.rt - sa.rt;
      var f2 = spn > 1 ? clamp((rt - sa.rt)/spn, 0, 1) : 1;
      OPP.rx  = sa.x + (sb.x - sa.x)*f2;
      OPP.y   = sa.y + (sb.y - sa.y)*f2;
      OPP.lanePos = sa.l + (sb.l - sa.l)*f2;
      if (!OPP.dead) OPP.st = sb.s === 1 ? 'jump' : (sb.s === 2 ? 'slide' : (sb.s === 3 ? 'hit' : 'run'));
      OPP.wx = sb.x;
    } else {
      OPP.rx += (OPP.wx - OPP.rx) * Math.min(1, dt*10);
    }
  } else {
    OPP.rx += (OPP.wx - OPP.rx) * Math.min(1, dt*8);
  }
}

/* ---------- RENDER ---------- */
var CV = null, CX = null, vigCv = null;
var slices = {};   // theme -> {sky, mid, bot} pre-masked mirrored canvases

function mkSlice(img, y0f, y1f, fadeTop, fadeBot){
  var iw = img.width, ih = img.height;
  var sy = Math.floor(ih*y0f), sh = Math.floor(ih*(y1f-y0f));
  var sw = iw;
  var c1 = document.createElement('canvas');
  c1.width = sw; c1.height = sh;
  var x1 = c1.getContext('2d');
  x1.drawImage(img, 0, sy, sw, sh, 0, 0, sw, sh);
  if (fadeTop > 0){
    var g1 = x1.createLinearGradient(0,0,0,sh*fadeTop);
    g1.addColorStop(0,'rgba(0,0,0,1)'); g1.addColorStop(1,'rgba(0,0,0,0)');
    x1.globalCompositeOperation = 'destination-out';
    x1.fillStyle = g1; x1.fillRect(0,0,sw,sh*fadeTop);
    x1.globalCompositeOperation = 'source-over';
  }
  if (fadeBot > 0){
    var g2 = x1.createLinearGradient(0,sh*(1-fadeBot),0,sh);
    g2.addColorStop(0,'rgba(0,0,0,0)'); g2.addColorStop(1,'rgba(0,0,0,1)');
    x1.globalCompositeOperation = 'destination-out';
    x1.fillStyle = g2; x1.fillRect(0,sh*(1-fadeBot),sw,sh*fadeBot);
    x1.globalCompositeOperation = 'source-over';
  }
  /* mirrored tile for seamless wrap */
  var c2 = document.createElement('canvas');
  c2.width = sw*2; c2.height = sh;
  var x2 = c2.getContext('2d');
  x2.drawImage(c1, 0, 0);
  x2.save(); x2.translate(sw*2, 0); x2.scale(-1,1); x2.drawImage(c1, 0, 0); x2.restore();
  return c2;
}
function buildSlices(){
  var map = { city:'city', forest:'forest', desert:'desert', mount:'mount', factory:'factory' };
  for (var k in map){
    var img = A[map[k]];
    /* full-bleed cover: scale the whole art to cover 1280x720+ground, then slice it */
    var needH = GY + 8;                       /* must reach below the ground line */
    var imgAr = img.width / img.height;
    var cvW, cvH;
    if (imgAr < VW/needH){ cvW = VW; cvH = VW/imgAr; }   /* tall enough already */
    else { cvH = needH; cvW = needH * imgAr; }
    var cover = document.createElement('canvas');
    cover.width = Math.round(cvW); cover.height = Math.round(cvH);
    var ccx = cover.getContext('2d');
    ccx.drawImage(img, 0, 0, cover.width, cover.height);
    slices[k] = {
      sky: mkSlice(cover, 0.0, 0.46, 0, 0.30),
      mid: mkSlice(cover, 0.30, 0.72, 0.18, 0.22),
      bot: mkSlice(cover, 0.58, 1.0, 0.26, 0)
    };
  }
  vigCv = document.createElement('canvas');
  vigCv.width = VW; vigCv.height = VH;
  var vx = vigCv.getContext('2d');
  var g = vx.createRadialGradient(VW/2, VH/2, VH*0.45, VW/2, VH/2, VH*0.95);
  g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(20,8,0,0.42)');
  vx.fillStyle = g; vx.fillRect(0,0,VW,VH);
}
function drawLayer(sl, par, yDst, hDst){
  var tw = sl.width * (hDst / sl.height);
  var off = ((W.camX*par) % tw + tw) % tw;
  var x;
  for (x = -off - tw; x < VW + 56; x += tw) CX.drawImage(sl, x, yDst, tw, hDst);
}
function drawBG(){
  var s = slices[W.L.theme];
  if (!s){ CX.fillStyle = '#241609'; CX.fillRect(0,0,VW,VH); return; }
  /* overscan ±24px horizontally & vertically: parallax shifts never reveal edges */
  CX.save(); CX.translate(-24,-14);
  drawLayer(s.sky, 0.05, 0, 320 + YOFF);
  drawLayer(s.mid, 0.22, 172 + YOFF, 320);
  drawLayer(s.bot, 0.45, 368 + YOFF, 250);
  CX.restore();
  /* theme fog tint */
  CX.fillStyle = W.Theme.fog;
  CX.fillRect(0,0,VW,VH);
}
function drawBand(){
  var th = W.Theme;
  var g = CX.createLinearGradient(0,GY,0,VH);
  g.addColorStop(0, th.band); g.addColorStop(0.25, th.band); g.addColorStop(1, th.band2);
  CX.fillStyle = g;
  /* top edge follows pits: draw solid then cut pits */
  CX.fillRect(0, GY, VW, VH-GY);
  CX.fillStyle = 'rgba(255,255,255,0.13)';
  CX.fillRect(0, GY, VW, 3);
  /* track lines */
  CX.strokeStyle = th.line; CX.lineWidth = 2;
  CX.setLineDash([16, 22]);
  CX.lineDashOffset = -(W.camX % 38);
  CX.globalAlpha = 0.5;
  CX.beginPath(); CX.moveTo(0, LANE_Y[0]+26); CX.lineTo(VW, LANE_Y[0]+26); CX.stroke();
  CX.beginPath(); CX.moveTo(0, LANE_Y[1]+26); CX.lineTo(VW, LANE_Y[1]+26); CX.stroke();
  CX.setLineDash([]);
  CX.globalAlpha = 1;
  /* moving ticks */
  CX.fillStyle = 'rgba(0,0,0,0.12)';
  var tx = -(W.camX % 96);
  for (var x=tx; x<VW; x+=96){ CX.fillRect(x, GY+8, 3, 10); CX.fillRect(x+48, LANE_Y[1]+30, 3, 8); }
  /* pits (dark gaps) */
  for (var i=0;i<W.ob.length;i++){
    var o = W.ob[i];
    if (o.k !== 'pit' || o.dead) continue;
    var sx = o.wx - W.camX;
    if (sx > VW + 60 || sx + o.w < -60) continue;
    var y0 = o.full ? GY : (o.lane === 0 ? GY+2 : LANE_Y[1]-34);
    var h0 = o.full ? VH-GY : (o.lane === 0 ? LANE_Y[1]-34-GY : VH-(LANE_Y[1]-34));
    var gr = CX.createLinearGradient(0, y0, 0, y0+h0);
    gr.addColorStop(0, '#100a06'); gr.addColorStop(1, '#241610');
    CX.fillStyle = gr;
    CX.fillRect(sx, y0, o.w, h0);
    CX.fillStyle = 'rgba(0,0,0,0.5)';
    CX.fillRect(sx, y0, 8, h0); CX.fillRect(sx+o.w-8, y0, 8, h0);
    /* jagged edge */
    CX.fillStyle = '#0c0805';
    CX.beginPath(); CX.moveTo(sx, y0+h0);
    for (var j=0;j<=6;j++) CX.lineTo(sx + o.w*j/6, y0+h0 - (j%2? 7:0));
    CX.lineTo(sx+o.w, y0+h0); CX.closePath(); CX.fill();
    CX.strokeStyle = 'rgba(255,190,110,0.25)'; CX.lineWidth = 2;
    CX.strokeRect(sx+1, y0+1, o.w-2, 3);
  }
}
function roundRect(x,y,w,h,r){
  CX.beginPath();
  CX.moveTo(x+r,y); CX.lineTo(x+w-r,y); CX.quadraticCurveTo(x+w,y,x+w,y+r);
  CX.lineTo(x+w,y+h-r); CX.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  CX.lineTo(x+r,y+h); CX.quadraticCurveTo(x,y+h,x,y+h-r);
  CX.lineTo(x,y+r); CX.quadraticCurveTo(x,y,x+r,y);
  CX.closePath();
}
function drawOb(o){
  var sx = o.wx - W.camX;
  if (sx < -200 || sx > VW + 200) return;
  var sc = LANE_S[o.lane] || 1;
  CX.save(); CX.translate(sx, o.y); CX.scale(sc, sc);
  if (o.k === 'box'){
    var w=o.w, h=o.h;
    var g = CX.createLinearGradient(-w/2,0,w/2,0);
    g.addColorStop(0,'#8a5a2b'); g.addColorStop(0.5,'#b0793d'); g.addColorStop(1,'#7c4f24');
    CX.fillStyle = g; roundRect(-w/2, -h, w, h, 6); CX.fill();
    CX.strokeStyle = '#5e3a17'; CX.lineWidth = 3; CX.stroke();
    CX.strokeStyle = 'rgba(94,58,23,0.7)'; CX.lineWidth = 4;
    CX.beginPath(); CX.moveTo(-w/2+6,-h+6); CX.lineTo(w/2-6,-6); CX.moveTo(w/2-6,-h+6); CX.lineTo(-w/2+6,-6); CX.stroke();
    CX.fillStyle = 'rgba(255,220,160,0.25)'; CX.fillRect(-w/2+4, -h+4, w-8, 5);
  } else if (o.k === 'hydrant'){
    var wh=o.w, hh=o.h;
    CX.fillStyle = 'rgba(0,0,0,0.25)';
    CX.beginPath(); CX.ellipse(0, 2, wh*0.5, 6, 0, 0, 6.3); CX.fill();
    CX.fillStyle = '#c93a2c'; roundRect(-wh/2, -hh+10, wh, hh-10, 7); CX.fill();
    CX.fillStyle = '#a52d22'; CX.fillRect(-wh/2-4, -hh+26, wh+8, 8);
    CX.fillStyle = '#e8594a'; roundRect(-wh/2-3, -hh, wh+6, 13, 6); CX.fill();
    CX.fillStyle = 'rgba(255,255,255,0.3)'; CX.fillRect(-wh/2+4, -hh+12, 4, hh-16);
    CX.fillStyle = '#8a241b';
    CX.beginPath(); CX.arc(-wh/2-5, -hh+30, 4, 0, 6.3); CX.fill();
    CX.beginPath(); CX.arc(wh/2+5, -hh+30, 4, 0, 6.3); CX.fill();
  } else if (o.k === 'stump'){
    var sh=o.w, sh2=o.h;
    CX.fillStyle = 'rgba(0,0,0,0.25)';
    CX.beginPath(); CX.ellipse(0, 2, sh*0.52, 6, 0, 0, 6.3); CX.fill();
    var gs = CX.createLinearGradient(-sh/2,0,sh/2,0);
    gs.addColorStop(0,'#6d4a2c'); gs.addColorStop(0.5,'#8a6136'); gs.addColorStop(1,'#5e3f24');
    CX.fillStyle = gs; roundRect(-sh/2, -sh2+8, sh, sh2-8, 5); CX.fill();
    CX.fillStyle = '#a37a48';
    CX.beginPath(); CX.ellipse(0, -sh2+9, sh/2, 8, 0, 0, 6.3); CX.fill();
    CX.strokeStyle = '#7d5a33'; CX.lineWidth = 1.6;
    CX.beginPath(); CX.ellipse(0, -sh2+9, sh/3.2, 4.5, 0, 0, 6.3); CX.stroke();
    CX.beginPath(); CX.ellipse(0, -sh2+9, sh/6, 2.2, 0, 0, 6.3); CX.stroke();
    CX.fillStyle = '#5e8f3e';
    CX.beginPath(); CX.ellipse(-sh*0.28, -sh2*0.35, 7, 4, 0.5, 0, 6.3); CX.fill();
    CX.beginPath(); CX.ellipse(sh*0.3, -sh2*0.55, 6, 3.5, -0.4, 0, 6.3); CX.fill();
  } else if (o.k === 'cactus'){
    var cw2=o.w, ch2=o.h;
    CX.fillStyle = 'rgba(0,0,0,0.25)';
    CX.beginPath(); CX.ellipse(0, 2, cw2*0.5, 6, 0, 0, 6.3); CX.fill();
    var cg = CX.createLinearGradient(-cw2/2,0,cw2/2,0);
    cg.addColorStop(0,'#3e7d3a'); cg.addColorStop(0.55,'#57a04a'); cg.addColorStop(1,'#35682f');
    CX.fillStyle = cg; roundRect(-cw2*0.32, -ch2, cw2*0.64, ch2, cw2*0.3); CX.fill();
    CX.fillStyle = cg;
    roundRect(-cw2/2, -ch2*0.66, cw2*0.26, ch2*0.3, 6); CX.fill();
    CX.fillRect(-cw2/2+3, -ch2*0.42, cw2*0.26, 8);
    roundRect(cw2/2-cw2*0.26, -ch2*0.78, cw2*0.26, ch2*0.38, 6); CX.fill();
    CX.fillRect(cw2/2-cw2*0.26-3, -ch2*0.5, cw2*0.26, 8);
    CX.strokeStyle = 'rgba(230,240,210,0.5)'; CX.lineWidth = 1.2;
    CX.beginPath(); CX.moveTo(0,-ch2+6); CX.lineTo(0,-6); CX.stroke();
    CX.fillStyle = '#e86a8a';
    CX.beginPath(); CX.arc(0, -ch2-2, 4.5, 0, 6.3); CX.fill();
  } else if (o.k === 'crate'){
    var kw=o.w, kh=o.h;
    var kg = CX.createLinearGradient(-kw/2,0,kw/2,0);
    kg.addColorStop(0,'#5a6470'); kg.addColorStop(0.5,'#79828f'); kg.addColorStop(1,'#4e5761');
    CX.fillStyle = kg; roundRect(-kw/2, -kh, kw, kh, 5); CX.fill();
    CX.strokeStyle = '#39404a'; CX.lineWidth = 3; roundRect(-kw/2, -kh, kw, kh, 5); CX.stroke();
    CX.strokeStyle = 'rgba(255,200,80,0.85)'; CX.lineWidth = 2.5;
    CX.beginPath(); CX.moveTo(-kw/2+6, -kh+6); CX.lineTo(kw/2-6, -6); CX.moveTo(kw/2-6, -kh+6); CX.lineTo(-kw/2+6, -6); CX.stroke();
    CX.fillStyle = 'rgba(255,255,255,0.18)'; CX.fillRect(-kw/2+3, -kh+3, kw-6, 4);
  } else if (o.k === 'rock'){
    var w2=o.w, h2=o.h;
    CX.fillStyle = '#6e6a63';
    CX.beginPath();
    CX.moveTo(-w2/2, 0); CX.lineTo(-w2/2+8, -h2*0.72); CX.lineTo(-w2*0.1, -h2);
    CX.lineTo(w2*0.28, -h2*0.86); CX.lineTo(w2/2, -h2*0.34); CX.lineTo(w2/2-4, 0);
    CX.closePath(); CX.fill();
    CX.fillStyle = '#8a857c'; CX.beginPath();
    CX.moveTo(-w2/2+8, -h2*0.72); CX.lineTo(-w2*0.1, -h2); CX.lineTo(w2*0.05, -h2*0.55); CX.closePath(); CX.fill();
    CX.fillStyle = 'rgba(0,0,0,0.25)'; CX.beginPath();
    CX.moveTo(w2*0.28, -h2*0.86); CX.lineTo(w2/2, -h2*0.34); CX.lineTo(w2*0.12, -h2*0.3); CX.closePath(); CX.fill();
  } else if (o.k === 'wall'){
    var w3=o.w, h3=o.h;
    CX.fillStyle = '#7d6b58'; CX.fillRect(-w3/2, -h3, w3, h3);
    CX.strokeStyle = '#5b4c3c'; CX.lineWidth = 2;
    for (var ry=0; ry<h3; ry+=18){
      CX.beginPath(); CX.moveTo(-w3/2, -h3+ry); CX.lineTo(w3/2, -h3+ry); CX.stroke();
      var off2 = (ry/18)%2 ? 0 : w3/2;
      CX.beginPath(); CX.moveTo(-off2+ (off2?0:0), -h3+ry); CX.stroke();
    }
    CX.fillStyle = '#93816c'; CX.fillRect(-w3/2-4, -h3-10, w3+8, 12);
    CX.fillStyle = 'rgba(255,255,255,0.12)'; CX.fillRect(-w3/2, -h3, 6, h3);
  } else if (o.k === 'spikes'){
    var w4=o.w;
    CX.fillStyle = '#3d4148'; roundRect(-w4/2, -8, w4, 8, 3); CX.fill();
    CX.fillStyle = '#b9c2cd';
    var n = Math.floor(w4/22);
    for (var si=0; si<n; si++){
      var x0 = -w4/2 + si*22;
      CX.beginPath(); CX.moveTo(x0, -6); CX.lineTo(x0+11, -30); CX.lineTo(x0+22, -6); CX.closePath(); CX.fill();
      CX.fillStyle = 'rgba(255,255,255,0.35)';
      CX.beginPath(); CX.moveTo(x0+11, -30); CX.lineTo(x0+15, -12); CX.lineTo(x0+11, -12); CX.closePath(); CX.fill();
      CX.fillStyle = '#b9c2cd';
    }
  } else if (o.k === 'mover'){
    var yy = o.base - Math.abs(Math.sin(W.time*2.2 + o.ph))*o.amp;
    CX.translate(0, -((o.y - (o.base - Math.abs(Math.sin(W.time*2.2 + o.ph))*o.amp))));
    var w5=o.w, h5=o.h;
    CX.fillStyle = 'rgba(0,0,0,0.25)';
    CX.beginPath(); CX.ellipse(0, LANE_Y[o.lane]-o.y+2, w5*0.42, 7, 0, 0, 6.3); CX.fill();
    var g5 = CX.createLinearGradient(0,-h5,0,0);
    g5.addColorStop(0,'#8f98a8'); g5.addColorStop(1,'#5a6272');
    CX.fillStyle = g5; roundRect(-w5/2, -yy + (o.base - yy) - h5, w5, h5, 8); CX.fill();
    CX.save();
    CX.beginPath(); roundRect(-w5/2, -yy, w5, h5, 8); CX.clip();
    CX.fillStyle = '#e8b23a';
    for (var hx=-w5/2; hx<w5/2; hx+=26){ CX.beginPath(); CX.moveTo(hx,-yy+h5); CX.lineTo(hx+13,-yy+h5); CX.lineTo(hx+26,-yy); CX.lineTo(hx+13,-yy); CX.closePath(); CX.fill(); }
    CX.restore();
    CX.strokeStyle = '#454c59'; CX.lineWidth = 3; roundRect(-w5/2, -yy, w5, h5, 8); CX.stroke();
  } else if (o.k === 'blade'){
    var ang = Math.sin(W.time*2.4 + o.ph)*1.05;
    var px = 0, py = -o.y + 34;
    var bx = px + Math.sin(ang)*o.len, by = py + Math.cos(ang)*o.len;
    CX.strokeStyle = '#69707e'; CX.lineWidth = 5;
    CX.beginPath(); CX.moveTo(px, py); CX.lineTo(bx, by); CX.stroke();
    CX.fillStyle = '#3a404c'; CX.beginPath(); CX.arc(px, py, 9, 0, 6.3); CX.fill();
    CX.translate(bx, by); CX.rotate(W.time*9);
    CX.fillStyle = '#c8d2de';
    for (var ti=0; ti<8; ti++){
      CX.rotate(6.283/8);
      CX.beginPath(); CX.moveTo(-5, -o.r+2); CX.lineTo(0, -o.r-11); CX.lineTo(5, -o.r+2); CX.closePath(); CX.fill();
    }
    CX.fillStyle = '#8792a2'; CX.beginPath(); CX.arc(0, 0, o.r, 0, 6.3); CX.fill();
    CX.fillStyle = '#525a68'; CX.beginPath(); CX.arc(0, 0, o.r*0.55, 0, 6.3); CX.fill();
    CX.fillStyle = '#e0483e'; CX.beginPath(); CX.arc(0, 0, 6, 0, 6.3); CX.fill();
  }
  CX.restore();
}
function drawEn(e){
  var sx = e.wx - W.camX;
  if (sx < -200 || sx > VW + 240) return;
  var sc = LANE_S[e.lane] || 1;
  CX.save(); CX.translate(sx, e.y); CX.scale(sc, sc);
  if (e.k === 'saw' || e.k === 'boulder'){
    var r = e.r;
    CX.rotate((e.wx) / r * (e.vx < 0 ? 1 : -1) * -1);
    if (e.k === 'saw'){
      CX.fillStyle = '#c3ccd8';
      for (var ti2=0; ti2<10; ti2++){
        CX.rotate(6.283/10);
        CX.beginPath(); CX.moveTo(-6, -r+3); CX.lineTo(0, -r-10); CX.lineTo(6, -r+3); CX.closePath(); CX.fill();
      }
      CX.fillStyle = '#79828f'; CX.beginPath(); CX.arc(0,0,r,0,6.3); CX.fill();
      CX.fillStyle = '#a5aebc'; CX.beginPath(); CX.arc(0,0,r*0.62,0,6.3); CX.fill();
      CX.fillStyle = '#48505c'; CX.beginPath(); CX.arc(0,0,r*0.2,0,6.3); CX.fill();
    } else {
      CX.fillStyle = '#7b6a58'; CX.beginPath(); CX.arc(0,0,r,0,6.3); CX.fill();
      CX.fillStyle = '#93816d';
      CX.beginPath(); CX.arc(-r*0.3,-r*0.3,r*0.42,0,6.3); CX.fill();
      CX.strokeStyle = '#5d4f40'; CX.lineWidth = 4;
      CX.beginPath(); CX.arc(0,0,r*0.7,0.4,2.4); CX.stroke();
      CX.beginPath(); CX.arc(0,0,r*0.45,3.4,5.4); CX.stroke();
    }
  } else if (e.k === 'car'){
    var fr = (e.t*10|0) % 2;
    CX.fillStyle = 'rgba(0,0,0,0.28)';
    CX.beginPath(); CX.ellipse(0, 3, 52, 8, 0, 0, 6.3); CX.fill();
    drawSpr(CX, 'car', fr, 0, 6, 84);
  } else if (e.k === 'scorp'){
    var fr2 = (e.t*8|0) % 2;
    CX.fillStyle = 'rgba(0,0,0,0.25)';
    CX.beginPath(); CX.ellipse(0, 2, 34, 5, 0, 0, 6.3); CX.fill();
    drawSpr(CX, 'scorp', fr2, 0, 4, 46);
  } else if (e.k === 'lizard'){
    var fr3 = (e.t*11|0) % 2;
    CX.fillStyle = 'rgba(0,0,0,0.22)';
    CX.beginPath(); CX.ellipse(0, 2, 38, 5, 0, 0, 6.3); CX.fill();
    drawSpr(CX, 'lizard', fr3, 0, 3, 42);
  } else if (e.k === 'wolf'){
    var fr4 = (e.t*9|0) % 2;
    CX.fillStyle = 'rgba(0,0,0,0.28)';
    CX.beginPath(); CX.ellipse(0, 3, 42, 7, 0, 0, 6.3); CX.fill();
    drawSpr(CX, 'wolf', fr4, 0, 4, 64);
  } else if (e.k === 'eagle'){
    var fr5 = (e.t*7|0) % 2;
    drawSpr(CX, 'eagle', fr5, 0, 8, 52);
  } else if (e.k === 'drone'){
    var fr6 = (e.t*14|0) % 2;
    drawSpr(CX, 'drone', fr6, 0, 0, 58);
    CX.fillStyle = 'rgba(255,60,40,' + (0.25 + 0.2*Math.sin(W.time*8)) + ')';
    CX.beginPath(); CX.ellipse(0, 8, 16, 3.5, 0, 0, 6.3); CX.fill();
  } else if (e.k === 'fall'){
    if (!e.dropped){
      CX.rotate(0);
      var shake = Math.sin(W.time*24)*3;
      CX.translate(shake, 0);
    }
    CX.fillStyle = '#74675a';
    CX.beginPath(); CX.arc(0, -e.r*0.5 - (e.dropped? 0 : 320), e.r, 0, 6.3); CX.fill();
    if (!e.dropped){
      CX.setTransform && CX.restore(); CX.save(); CX.translate(sx, e.y); CX.scale(sc, sc);
      CX.fillStyle = 'rgba(255,60,40,' + (0.25 + 0.2*Math.sin(W.time*10)) + ')';
      CX.beginPath(); CX.ellipse(0, -6, e.r*0.9, 8, 0, 0, 6.3); CX.fill();
    } else {
      CX.strokeStyle = '#57493d'; CX.lineWidth = 3;
      CX.beginPath(); CX.moveTo(-e.r*0.5, -e.r*0.9); CX.lineTo(0, -e.r*0.4); CX.lineTo(-e.r*0.2, 0); CX.stroke();
    }
  } else if (e.k === 'bolt'){
    var g7 = CX.createLinearGradient(-26, 0, 26, 0);
    g7.addColorStop(0, 'rgba(255,110,40,0)'); g7.addColorStop(0.5, '#ffb03d'); g7.addColorStop(1, 'rgba(255,110,40,0)');
    CX.fillStyle = g7;
    roundRect(-26, -7, 52, 14, 7); CX.fill();
    CX.fillStyle = '#fff3c0'; roundRect(-8, -4, 16, 8, 4); CX.fill();
  }
  CX.restore();
}
function coinColor(k){ return k === 'gem' ? ['#3ee6ae','#0f9d6c'] : (k === 'sil' ? ['#dfe6f2','#8f9bb3'] : ['#ffd257','#c9861c']); }
function drawCo(c){
  if (c.dead) return;
  var sx = c.wx - W.camX;
  if (sx < -80 || sx > VW + 100) return;
  var bob = Math.sin(c.t*3)*5;
  var y = c.y + bob;
  CX.save(); CX.translate(sx, y);
  if (c.k === 'pw'){
    var cols = { shield:['#69c9ff','#2a6fb0'], speed:['#8ce0ff','#2d7fa8'], magnet:['#ff8f8f','#a83a3a'], life:['#ff7d8a','#a83351'], dash:['#ffb056','#b06018'] };
    var cc = cols[c.pw] || cols.shield;
    var pulse = 1 + Math.sin(c.t*5)*0.08;
    CX.scale(pulse, pulse);
    CX.fillStyle = 'rgba(255,255,255,0.18)';
    CX.beginPath(); CX.arc(0, 0, 30 + Math.sin(c.t*5)*4, 0, 6.3); CX.fill();
    var g = CX.createRadialGradient(-6,-8,4, 0,0,26);
    g.addColorStop(0, cc[0]); g.addColorStop(1, cc[1]);
    CX.fillStyle = g; CX.beginPath(); CX.arc(0, 0, 24, 0, 6.3); CX.fill();
    CX.strokeStyle = 'rgba(255,255,255,0.75)'; CX.lineWidth = 3; CX.stroke();
    CX.fillStyle = '#fff'; CX.strokeStyle = '#fff'; CX.lineWidth = 3.5;
    CX.beginPath();
    if (c.pw === 'shield'){
      CX.moveTo(0,-12); CX.lineTo(10,-7); CX.lineTo(10,3); CX.quadraticCurveTo(10,11,0,14);
      CX.quadraticCurveTo(-10,11,-10,3); CX.lineTo(-10,-7); CX.closePath(); CX.fill();
    } else if (c.pw === 'speed'){
      CX.moveTo(4,-14); CX.lineTo(-6,2); CX.lineTo(0,2); CX.lineTo(-4,14); CX.lineTo(7,-2); CX.lineTo(1,-2); CX.closePath(); CX.fill();
    } else if (c.pw === 'magnet'){
      CX.arc(0, -2, 10, 3.14, 0, false);
      CX.lineTo(10, 10); CX.lineTo(4, 10); CX.lineTo(4, -2+10);
      CX.moveTo(-10, 8); CX.lineTo(-4, 8); CX.lineTo(-4, -2);
      CX.stroke();
      CX.fillStyle = '#fff'; CX.fillRect(-11, 8, 8, 5); CX.fillRect(3, 8, 8, 5);
    } else if (c.pw === 'life'){
      CX.moveTo(0, 12); CX.bezierCurveTo(-15, 0, -9, -12, 0, -5); CX.bezierCurveTo(9, -12, 15, 0, 0, 12); CX.fill();
    } else {
      CX.moveTo(-11,-3); CX.lineTo(-3,-3); CX.lineTo(-3,-11); CX.lineTo(3,-11); CX.lineTo(3,-3);
      CX.lineTo(11,-3); CX.lineTo(11,3); CX.lineTo(3,3); CX.lineTo(3,11); CX.lineTo(-3,11); CX.lineTo(-3,3);
      CX.lineTo(-11,3); CX.closePath(); CX.fill();
    }
  } else {
    var cc2 = coinColor(c.k);
    var sq = Math.abs(Math.sin(c.t*3.4));
    var r = c.k === 'gem' ? 17 : (c.k === 'sil' ? 15 : 13);
    CX.scale(0.35 + sq*0.65, 1);
    if (c.k === 'gem'){
      CX.fillStyle = cc2[0];
      CX.beginPath(); CX.moveTo(0,-r*1.2); CX.lineTo(r*0.9,-r*0.2); CX.lineTo(0, r*1.25); CX.lineTo(-r*0.9,-r*0.2); CX.closePath(); CX.fill();
      CX.fillStyle = 'rgba(255,255,255,0.5)';
      CX.beginPath(); CX.moveTo(0,-r*1.2); CX.lineTo(r*0.9,-r*0.2); CX.lineTo(0,-r*0.1); CX.closePath(); CX.fill();
    } else {
      var g2 = CX.createLinearGradient(0,-r,0,r);
      g2.addColorStop(0, cc2[0]); g2.addColorStop(1, cc2[1]);
      CX.fillStyle = g2; CX.beginPath(); CX.arc(0, 0, r, 0, 6.3); CX.fill();
      CX.strokeStyle = 'rgba(255,255,255,0.65)'; CX.lineWidth = 2.5; CX.stroke();
      CX.strokeStyle = cc2[1]; CX.lineWidth = 2;
      CX.beginPath(); CX.arc(0, 0, r*0.55, 0, 6.3); CX.stroke();
    }
  }
  CX.restore();
}
function drawFinish(){
  var sx = W.finX - W.camX;
  if (sx < -160 || sx > VW + 320) return;
  CX.save(); CX.translate(sx, 0);
  CX.fillStyle = 'rgba(255,255,255,0.08)';
  CX.fillRect(-30, 120, 60, GY-120);
  CX.fillStyle = '#e9e4da';
  CX.fillRect(-14, 140, 10, GY-140); CX.fillRect(64, 140, 10, GY-140);
  CX.fillStyle = '#c9c2b4';
  CX.fillRect(-24, 130, 112, 18);
  /* checkered banner */
  for (var i=0;i<9;i++){
    for (var j=0;j<2;j++){
      CX.fillStyle = (i+j)%2 ? '#2c2c2c' : '#f5f1e8';
      CX.fillRect(-24+i*12.5, 148+j*13, 12.5, 13);
    }
  }
  CX.fillStyle = '#ff7a00';
  roundRect(-24, 176, 112, 30, 8); CX.fill();
  CX.fillStyle = '#fff'; CX.font = 'bold 20px Vazirmatn, Tahoma'; CX.textAlign = 'center';
  CX.fillText('پایان', 32, 198);
  CX.restore();
}
P.trail = [];
P.trailT = 0;
function render(){
  if (!CX || !vigCv) { if (CX){ CX.fillStyle='#1a120a'; CX.fillRect(0,0,VW,VH); } return; }
  CX.setTransform(1,0,0,1,0,0);
  CX.clearRect(0,0,VW,VH);
  var shx = W.shake ? rnd(-W.shake, W.shake) : 0;
  var shy = W.shake ? rnd(-W.shake*0.6, W.shake*0.6) : 0;
  CX.save(); CX.translate(shx, shy + YOFF);
  drawBG();
  drawBand();
  drawFinish();
  var i;
  for (i=0;i<W.ob.length;i++) if (W.ob[i].lane === 0) drawOb(W.ob[i]);
  for (i=0;i<W.en.length;i++) if (W.en[i].lane === 0) drawEn(W.en[i]);
  for (i=0;i<W.ob.length;i++) if (W.ob[i].lane !== 0) drawOb(W.ob[i]);
  for (i=0;i<W.en.length;i++) if (W.en[i].lane !== 0) drawEn(W.en[i]);
  for (i=0;i<W.co.length;i++) drawCo(W.co[i]);
  /* rival */
  if (OPP.on && !OPP.botHidden){
    var osx = FOX_X + (OPP.rx - P.wx);
    if (osx > -160 && osx < VW + 160){
      var osc = lerp(0.93, 1.03, OPP.lanePos);
      var ofw = (OPP.st === 'slide' ? 128 : 102) * osc;
      CX.save(); CX.globalAlpha = OPP.dead ? 0.45 : 0.94;
      drawFox(CX, oppSheet(), oppFrame(), osx, OPP.y, ofw, false);
      CX.restore();
      CX.save();
      CX.font = 'bold 15px Vazirmatn, Tahoma'; CX.textAlign = 'center';
      var tw2 = CX.measureText(OPP.name).width + 18;
      CX.fillStyle = colorTagBg(oppColor());
      roundRect(osx - tw2/2, OPP.y - 148*osc - 16, tw2, 24, 12); CX.fill();
      CX.fillStyle = colorHexLight(oppColor()); CX.fillText(OPP.name, osx, OPP.y - 148*osc + 1);
      CX.restore();
    }
  }
  /* player trail (dash afterimage) */
  if (P.dashT > 0 && P.trail.length){
    for (i=0;i<P.trail.length;i++){
      var tr = P.trail[i];
      drawFox(CX, mySheet(), tr.f, FOX_X - (i+1)*26, tr.y, tr.w, false, 0.16);
    }
  }
  /* player */
  if (G.state !== 'menu'){
    var fw = (P.st === 'slide' ? 128 : 102) * lerp(0.93, 1.03, P.lanePos);
    var hgt = P.y - LANE_Y[P.lanePos < 0.35 ? 0 : (P.lanePos > 0.65 ? 1 : 2)];
    /* shadow */
    CX.save();
    CX.fillStyle = 'rgba(0,0,0,' + (0.3 - clamp(hgt/500,0,0.22)) + ')';
    CX.beginPath(); CX.ellipse(FOX_X, P.y+4, fw*0.34, 8, 0, 0, 6.3); CX.fill();
    CX.restore();
    var blink = P.invT > 0 && Math.sin(P.invT*30) > 0;
    if (!blink || P.dead){
      drawFox(CX, mySheet(), foxFrame(), FOX_X, P.y, fw, false, P.dead ? 1 : 0.98);
    }
    if (P.shieldT > 0){
      CX.save();
      var sa = P.shieldT < 1.5 ? (0.4 + 0.35*Math.sin(P.invT*0+now()*0.02)) : 0.55;
      CX.strokeStyle = 'rgba(120,210,255,' + sa + ')'; CX.lineWidth = 3;
      CX.fillStyle = 'rgba(120,210,255,0.10)';
      CX.beginPath(); CX.arc(FOX_X, P.y-38, 62 + Math.sin(now()*0.008)*3, 0, 6.3);
      CX.fill(); CX.stroke();
      CX.restore();
    }
    if (P.magT > 0){
      CX.save(); CX.strokeStyle = 'rgba(255,140,140,' + (0.25+0.15*Math.sin(now()*0.01)) + ')';
      CX.lineWidth = 2; CX.setLineDash([8,10]);
      CX.beginPath(); CX.arc(FOX_X, P.y-34, 120, 0, 6.3); CX.stroke();
      CX.setLineDash([]); CX.restore();
    }
    if (OPP.on && G.mode === 'duel' && !P.dead){
      /* my-fox chip so players never confuse which fox is theirs */
      CX.save();
      CX.font = 'bold 15px Vazirmatn, Tahoma'; CX.textAlign = 'center';
      var lw3 = CX.measureText('تو').width + 20;
      CX.fillStyle = 'rgba(140,60,5,0.8)';
      roundRect(FOX_X - lw3/2, P.y - fw - 34, lw3, 24, 12); CX.fill();
      CX.strokeStyle = 'rgba(255,190,110,0.7)'; CX.lineWidth = 1.5;
      roundRect(FOX_X - lw3/2, P.y - fw - 34, lw3, 24, 12); CX.stroke();
      CX.fillStyle = '#ffd9a0'; CX.fillText('تو', FOX_X, P.y - fw - 17);
      CX.restore();
    }
  }
  /* particles */
  CX.save();
  for (i=0;i<PTP;i++){
    var p = PT[i];
    if (!p.on) continue;
    var a = clamp(p.life/p.max, 0, 1);
    if (p.k === 'fire' || p.k === 'spark') CX.globalCompositeOperation = 'lighter';
    else CX.globalCompositeOperation = 'source-over';
    CX.globalAlpha = a;
    CX.fillStyle = p.col;
    if (p.k === 'spark'){
      CX.fillRect(p.x - p.size/2, p.y - p.size/2, p.size + Math.abs(p.vx)*0.02, p.size);
    } else {
      CX.beginPath(); CX.arc(p.x, p.y, p.size*(0.5+a*0.5), 0, 6.3); CX.fill();
    }
  }
  CX.restore();
  /* weather */
  CX.save();
  var wk = W.Theme.weather;
  for (i=0;i<W.weather.length;i++){
    var wp = W.weather[i];
    if (wk === 'firefly'){
      var fa = 0.4 + 0.4*Math.sin(wp.ph + W.time*3);
      CX.globalCompositeOperation = 'lighter';
      CX.fillStyle = 'rgba(180,255,120,' + fa*0.5 + ')';
      CX.beginPath(); CX.arc(wp.x, wp.y, wp.s*1.6, 0, 6.3); CX.fill();
      CX.globalCompositeOperation = 'source-over';
    } else if (wk === 'sand'){
      CX.fillStyle = 'rgba(240,200,140,0.4)';
      CX.fillRect(wp.x, wp.y, wp.s*7, 1.6);
    } else if (wk === 'snow'){
      CX.fillStyle = 'rgba(255,255,255,0.7)';
      CX.beginPath(); CX.arc(wp.x, wp.y, wp.s, 0, 6.3); CX.fill();
    } else if (wk === 'dust'){
      CX.fillStyle = 'rgba(200,190,170,0.18)';
      CX.beginPath(); CX.arc(wp.x, wp.y, wp.s*2.2, 0, 6.3); CX.fill();
    } else {
      CX.fillStyle = 'rgba(255,210,150,0.2)';
      CX.beginPath(); CX.arc(wp.x, wp.y, wp.s*1.5, 0, 6.3); CX.fill();
    }
  }
  CX.restore();
  /* floats */
  CX.save();
  CX.font = 'bold 22px Vazirmatn, Tahoma'; CX.textAlign = 'center';
  for (i=0;i<W.fl.length;i++){
    var f = W.fl[i];
    CX.globalAlpha = clamp(f.life/0.9, 0, 1);
    CX.fillStyle = 'rgba(0,0,0,0.4)';
    CX.fillText(f.txt, f.x+2, f.y+2);
    CX.fillStyle = f.col;
    CX.fillText(f.txt, f.x, f.y);
  }
  CX.restore();
  /* speed streaks */
  if (P.speedT > 0 || P.dashT > 0){
    CX.save(); CX.globalAlpha = 0.2; CX.fillStyle = '#fff';
    for (i=0;i<8;i++){
      var ly = (i*97 + (W.time*700)%97) % VH;
      CX.fillRect((i*211 + W.time*1900)%VW, ly, 90 + (i%3)*40, 2);
    }
    CX.restore();
  }
  CX.restore();
  /* vignette + flash */
  CX.drawImage(vigCv, 0, 0);
  if (W.flash > 0){
    CX.fillStyle = 'rgba(255,255,255,' + clamp(W.flash,0,0.5) + ')';
    CX.fillRect(0,0,VW,VH);
  }
  /* portrait letterbox: canvas is letterboxed via CSS, nothing to draw */
}
function oppFrame(){
  var a = OPP.dead ? ANIM.death : (OPP.st === 'jump' ? ANIM.jump : (OPP.st === 'slide' ? ANIM.slide : ANIM.run));
  if (a.loop) return a.f[Math.floor(OPP.animT*a.fps) % a.f.length];
  return a.f[Math.min(Math.floor(OPP.animT*a.fps), a.f.length-1)];
}

/* ---------- CSS ---------- */
var FE_CSS = [
'#feRoot{position:fixed;inset:0;z-index:99990;background:#120b06;display:none;direction:rtl;font-family:Vazirmatn,IRANSans,Segoe UI,Tahoma,sans-serif;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;overflow:hidden;}',
'#feRoot.feOn{display:block;}',
'#feStage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}',
'#feWrap{position:relative;transform-origin:center center;}',
'#feCv{display:block;width:100%;height:100%;background:#1a120a;touch-action:none;}',
'#feUI{position:absolute;inset:0;pointer-events:none;color:#fff;}',
'#feUI *{box-sizing:border-box;-webkit-user-select:none;user-select:none;}',
'.feBtnP{pointer-events:auto;}',
'#feHudT{position:absolute;top:1.6%;right:2%;left:2%;display:flex;align-items:flex-start;justify-content:space-between;gap:8px;z-index:3;pointer-events:none;}',
'.feChip{background:rgba(20,12,6,0.62);border:1px solid rgba(255,160,70,0.35);border-radius:14px;padding:6px 13px;font-weight:800;font-size:clamp(12px,2.6vh,19px);color:#ffe7c9;box-shadow:0 3px 10px rgba(0,0,0,0.35);white-space:nowrap;}',
'.feChip b{color:#ffcf7d;}',
'#feScore{font-size:clamp(16px,3.4vh,26px);color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.6);font-weight:800;}',
'#feLives{display:flex;gap:3px;font-size:clamp(13px,2.8vh,20px);}',
'#fePauseBtn{width:clamp(34px,6.4vh,48px);height:clamp(34px,6.4vh,48px);border-radius:13px;border:none;background:linear-gradient(160deg,rgba(90,55,25,0.72),rgba(40,24,12,0.78));box-shadow:0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,200,120,0.3);color:#ffd9a0;font-size:clamp(15px,3vh,22px);display:flex;align-items:center;justify-content:center;cursor:pointer;}',
'#feProg{position:absolute;top:calc(1.6% + clamp(40px,7.6vh,58px));right:2%;left:2%;height:6px;border-radius:4px;background:rgba(0,0,0,0.35);display:none;}',
'#feProgFill{height:100%;width:0%;border-radius:4px;background:linear-gradient(90deg,#ff7a00,#ffc25e);}',
'#feProgOpp{position:absolute;top:-4px;width:14px;height:14px;border-radius:50%;background:#4fc3f7;border:2px solid #fff;margin-right:-7px;right:0;display:none;}',
'#fePowers{position:absolute;bottom:2.4%;right:2%;display:flex;flex-direction:column;gap:8px;}',
'.fePwIc{width:clamp(36px,6.6vh,50px);height:clamp(36px,6.6vh,50px);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:clamp(16px,3vh,24px);background:rgba(15,10,5,0.6);border:2px solid rgba(255,255,255,0.25);position:relative;overflow:hidden;display:none;}',
'.fePwIc i{position:absolute;inset:0;background:conic-gradient(rgba(255,190,80,0.55) var(--p,100%), transparent 0);pointer-events:none;}',
'#feTouch{position:absolute;inset:0;pointer-events:auto;}',
'.feCtl{position:absolute;width:clamp(50px,9.2vh,68px);height:clamp(50px,9.2vh,68px);border-radius:22px;border:none;padding:0;display:flex;align-items:center;justify-content:center;pointer-events:auto;cursor:pointer;background:linear-gradient(160deg,rgba(90,55,25,0.72),rgba(40,24,12,0.78));box-shadow:0 4px 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,200,120,0.35), inset 0 -2px 6px rgba(0,0,0,0.4);opacity:0.94;transition:transform .06s;backdrop-filter:blur(3px);}',
'.feCtl svg{width:62%;height:62%;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.5));}',
'.feCtl:active{transform:scale(0.92);background:linear-gradient(160deg,rgba(255,150,50,0.85),rgba(210,100,20,0.9));box-shadow:0 0 18px rgba(255,150,50,0.65), inset 0 1px 0 rgba(255,220,160,0.5);}',
'#feCtlJ{right:2.2%;bottom:calc(3% + clamp(62px,11.5vh,92px));}#feCtlS{right:2.2%;bottom:3%;}#feCtlL{left:2.2%;bottom:calc(3% + clamp(62px,11.5vh,92px));}#feCtlR{left:2.2%;bottom:3%;}',
'.feOv{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(10,6,2,0.72);backdrop-filter:blur(5px);pointer-events:auto;z-index:5;}',
'.feOv.feShow{display:flex;}',
'.fePanel{background:linear-gradient(160deg,#2b1c10,#1c110a);border:1.5px solid rgba(255,150,60,0.45);border-radius:24px;padding:clamp(14px,3.4vh,30px) clamp(18px,4vh,40px);text-align:center;max-width:min(88%,560px);max-height:92%;overflow-y:auto;box-shadow:0 18px 60px rgba(0,0,0,0.6);}',
'.feTitle{font-size:clamp(22px,5.4vh,40px);font-weight:800;color:#ffb35c;text-shadow:0 0 24px rgba(255,122,0,0.45);margin-bottom:4px;}',
'.feSub{font-size:clamp(12px,2.4vh,17px);color:#d8b48c;margin-bottom:14px;}',
'.feBig{width:100%;margin:7px 0;padding:clamp(10px,2vh,15px);border:none;border-radius:15px;font-family:inherit;font-weight:800;font-size:clamp(14px,2.8vh,20px);cursor:pointer;color:#3a2008;background:linear-gradient(135deg,#ffb056,#ff7a00);box-shadow:0 6px 18px rgba(255,122,0,0.35);transition:transform .08s;}',
'.feBig:active{transform:scale(0.97);}',
'.feBig.feG{background:linear-gradient(135deg,#7fe0a0,#2eae6e);color:#06301a;box-shadow:0 6px 18px rgba(46,174,110,0.35);}',
'.feBig.feB{background:linear-gradient(135deg,#7fc9ff,#2e86c9);color:#062038;box-shadow:0 6px 18px rgba(46,134,201,0.35);}',
'.feBig.feGhost{background:rgba(255,255,255,0.08);color:#e8d4bb;box-shadow:none;border:1px solid rgba(255,255,255,0.18);}',
'.feRow{display:flex;gap:8px;}',
'.feStats{display:flex;gap:8px;justify-content:center;margin:12px 0;flex-wrap:wrap;}',
'.feStat{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:13px;padding:8px 14px;min-width:86px;}',
'.feStat small{display:block;color:#c9a578;font-size:clamp(10px,1.9vh,13px);margin-bottom:2px;}',
'.feStat b{font-size:clamp(15px,3vh,22px);color:#ffe7c9;}',
'#feNewRec{display:none;color:#ffd23e;font-weight:800;font-size:clamp(15px,3vh,22px);margin:6px 0;text-shadow:0 0 18px rgba(255,210,62,0.6);animation:fePulse 0.9s infinite;}',
'@keyframes fePulse{0%,100%{transform:scale(1);}50%{transform:scale(1.08);}}',
'#feLevels{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:12px 0;max-height:52vh;overflow-y:auto;padding:2px;}',
'#feEnvRow{display:flex;gap:6px;justify-content:center;margin:10px 0 2px;flex-wrap:wrap;}',
'#feEnvCards{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin:10px 0;}',
'.feECard{position:relative;border:none;border-radius:16px;padding:0;cursor:pointer;overflow:hidden;aspect-ratio:3/4.1;font-family:inherit;box-shadow:0 4px 14px rgba(0,0,0,0.4);transition:transform .08s;}',
'.feECard:active{transform:scale(0.95);}',
'.feECard img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}',
'.feECard .feEGrad{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,6,2,0.05) 30%,rgba(10,6,2,0.85));}',
'.feECard .feEName{position:absolute;bottom:6px;left:0;right:0;color:#ffe7c9;font-weight:800;font-size:clamp(10px,2vh,15px);text-shadow:0 1px 4px #000;}',
'.feECard .feESt{position:absolute;top:6px;left:6px;right:6px;display:flex;justify-content:space-between;font-size:clamp(8px,1.6vh,11px);color:#ffd9a0;text-shadow:0 1px 3px #000;font-weight:700;}',
'.feECard.feEOn{outline:3px solid #ffb35c;outline-offset:-3px;}',
'.feECard .feEDone{color:#8fe6a8;}',
'.feEnv{padding:8px 13px;border-radius:12px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.06);color:#e8d4bb;font-family:inherit;font-weight:700;font-size:clamp(11px,2.2vh,15px);cursor:pointer;}',
'.feEnv.feOn{background:linear-gradient(135deg,rgba(255,176,86,0.4),rgba(255,122,0,0.22));border-color:rgba(255,180,90,0.65);color:#ffe0b0;}',
'.feLvl{aspect-ratio:1;border-radius:13px;border:1.5px solid rgba(255,160,70,0.35);background:rgba(255,255,255,0.05);color:#ffe7c9;font-family:inherit;font-weight:800;font-size:clamp(13px,2.6vh,19px);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:0;}',
'.feLvl small{font-size:clamp(8px,1.5vh,11px);color:#caa06c;font-weight:400;}',
'.feLvl.feDone{background:linear-gradient(150deg,rgba(255,150,50,0.28),rgba(255,122,0,0.12));border-color:rgba(255,190,90,0.6);}',
'.feLvl.feLock{opacity:0.38;pointer-events:none;}',
'#feCount{position:absolute;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;pointer-events:none;z-index:4;}',
'#feCount span{font-size:clamp(60px,17vh,130px);font-weight:800;color:#ffb35c;text-shadow:0 0 40px rgba(255,122,0,0.7);animation:feCnt 1s ease-out;}',
'@keyframes feCnt{0%{transform:scale(1.7);opacity:0;}25%{opacity:1;}100%{transform:scale(0.92);opacity:0.85;}}',
'.feCntSub{font-size:clamp(13px,2.8vh,20px);font-weight:800;color:#ffd9a0;background:rgba(20,12,6,0.6);border-radius:12px;padding:6px 16px;margin-top:10px;}',
'#feBanner{position:absolute;top:16%;left:50%;transform:translateX(-50%);background:rgba(20,12,6,0.85);border:1px solid rgba(255,160,70,0.5);color:#ffe7c9;font-weight:800;font-size:clamp(14px,3vh,21px);border-radius:16px;padding:10px 22px;display:none;white-space:nowrap;z-index:4;pointer-events:none;}',
'.feSpin{width:44px;height:44px;border-radius:50%;border:4px solid rgba(255,160,70,0.25);border-top-color:#ff9a3d;margin:0 auto 12px;animation:feSpin 0.9s linear infinite;}',
'@keyframes feSpin{to{transform:rotate(360deg);}}',
'.feTglRow{display:flex;gap:8px;justify-content:center;margin-top:10px;}',
'.feTgl{flex:1;padding:9px 4px;border-radius:12px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.06);color:#e8d4bb;font-family:inherit;font-weight:700;font-size:clamp(11px,2.1vh,15px);cursor:pointer;}',
'.feTgl.feOn{background:rgba(255,150,50,0.25);border-color:rgba(255,170,80,0.55);color:#ffd9a0;}',
'#feBack{position:absolute;top:1.6%;left:2%;width:clamp(34px,6.4vh,48px);height:clamp(34px,6.4vh,48px);border-radius:13px;border:none;background:linear-gradient(160deg,rgba(90,55,25,0.72),rgba(40,24,12,0.78));box-shadow:0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,200,120,0.3);color:#ffd9a0;font-size:clamp(15px,3vh,22px);display:none;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;z-index:6;}',
'.feHint{font-size:clamp(10px,1.9vh,14px);color:#b8977a;margin-top:8px;}',
'#feCtlHint{position:absolute;bottom:20%;left:50%;transform:translateX(-50%);display:none;background:rgba(20,12,6,0.7);color:#ffe7c9;padding:8px 18px;border-radius:14px;font-size:clamp(11px,2.2vh,16px);font-weight:700;pointer-events:none;white-space:nowrap;}',
'#feSpec{position:absolute;top:24%;left:50%;transform:translateX(-50%);display:none;flex-direction:column;align-items:center;gap:5px;background:rgba(20,12,6,0.88);border:1px solid rgba(255,160,70,0.5);border-radius:18px;padding:10px 20px;z-index:6;text-align:center;box-shadow:0 6px 22px rgba(0,0,0,0.45);}',
'#feSpecT{color:#ffe7c9;font-weight:800;font-size:clamp(13px,2.6vh,19px);}',
'#feSpecS{color:#ffc27a;font-weight:700;font-size:clamp(11px,2.2vh,16px);direction:rtl;}',
'#feSpecB{margin-top:3px;background:linear-gradient(160deg,#ff9a3c,#ff6a00);border:none;color:#2a1200;font-weight:800;border-radius:12px;padding:6px 18px;font-size:clamp(11px,2.2vh,16px);cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,0.35);}'
].join('');

/* ---------- DOM ---------- */
var G = { state:'off', mode:'sp', L:null, busy:false, countTok:0, overSent:false, playAt:0 }; try{ window._feG=G; }catch(e){};
/* قوانین برد دوئل (۲۰۲۷): سوختن = خارج شدن؛ برنده فقط با خط پایان */
var DUE = { failed:false };
var root, stage, wrap, cv, ui, ctx2 = null;
function el(tag, cls, html, parent){
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}
var H = {};   // dom handles
function buildUI(){
  root = document.createElement('div');
  root.id = 'feRoot';
  root.innerHTML = '<style>' + FE_CSS + '</style>';
  stage = el('div','', '', root); stage.id = 'feStage';
  wrap = el('div','', '', stage); wrap.id = 'feWrap';
  cv = document.createElement('canvas');
  cv.id = 'feCv'; cv.width = VW; cv.height = VH;
  wrap.appendChild(cv);
  ui = el('div','', '', wrap); ui.id = 'feUI';
  /* top hud */
  var ht = el('div','', '', ui); ht.id = 'feHudT';
  var hRight = el('div','', '', ht); hRight.style.display = 'flex'; hRight.style.gap = '8px'; hRight.style.alignItems = 'center';
  H.lives = el('div','feChip','', hRight); H.lives.id = 'feLives';
  H.score = el('div','feChip','', hRight); H.score.id = 'feScore';
  H.coins = el('div','feChip','', hRight);
  var hLeft = el('div','', '', ht); hLeft.style.display = 'flex'; hLeft.style.gap = '8px';
  H.lvl = el('div','feChip','', hLeft); H.lvl.id = 'feLvl';
  H.pause = el('div','feBtnP','', hLeft); H.pause.id = 'fePauseBtn'; H.pause.innerHTML = '⏸';
  /* progress */
  var pr = el('div','', '', ui); pr.id = 'feProg';
  H.progF = el('div','', '', pr); H.progF.id = 'feProgFill';
  H.progO = el('div','', '', pr); H.progO.id = 'feProgOpp';
  /* powers */
  var pws = el('div','', '', ui); pws.id = 'fePowers';
  H.pw = {};
  ['shield','speed','magnet','dash'].forEach(function(k){
    var d = el('div','fePwIc','', pws);
    d.innerHTML = ({shield:'🛡',speed:'⚡',magnet:'🧲',dash:'🔥'})[k] + '<i></i>';
    H.pw[k] = d;
  });
  /* touch layer + controls */
  H.touch = el('div','feBtnP','', ui); H.touch.id = 'feTouch';
  var SVG_UP = '<svg viewBox="0 0 24 24" fill="none"><path d="M12 4 L20 13 H15.5 V20 H8.5 V13 H4 Z" fill="#ffcf8a" stroke="#5e3510" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  var SVG_DN = '<svg viewBox="0 0 24 24" fill="none"><path d="M12 20 L4 11 H8.5 V4 H15.5 V11 H20 Z" fill="#ffcf8a" stroke="#5e3510" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  var SVG_LF = '<svg viewBox="0 0 24 24" fill="none"><path d="M6 12 L13 5.5 V9.5 H20 V14.5 H13 V18.5 Z" fill="#ffcf8a" stroke="#5e3510" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  var SVG_RT = '<svg viewBox="0 0 24 24" fill="none"><path d="M18 12 L11 5.5 V9.5 H4 V14.5 H11 V18.5 Z" fill="#ffcf8a" stroke="#5e3510" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  H.ctlJ = el('div','feCtl','', ui); H.ctlJ.id = 'feCtlJ'; H.ctlJ.innerHTML = SVG_UP;
  H.ctlS = el('div','feCtl','', ui); H.ctlS.id = 'feCtlS'; H.ctlS.innerHTML = SVG_DN;
  H.ctlL = el('div','feCtl','', ui); H.ctlL.id = 'feCtlL'; H.ctlL.innerHTML = SVG_LF;
  H.ctlR = el('div','feCtl','', ui); H.ctlR.id = 'feCtlR'; H.ctlR.innerHTML = SVG_RT;
  H.hint = el('div','', '', ui); H.hint.id = 'feCtlHint';
  /* overlays */
  /* build overlays (return the overlay element with .p panel attached) */
  function ov(id){
    var o = el('div','feOv','', ui); o.id = id;
    var p = el('div','fePanel','', o);
    o.p = p;
    return o;
  }
  var m = ov('feMenu');
  H.menu = m;
  m.p.innerHTML = '<div class="feTitle">🦊 فرار روباه</div>' +
    '<div class="feSub">بدو، بپر، سُر بخور و از موانع فرار کن!</div>' +
    '<div class="feStats"><div class="feStat"><small>بهترین امتیاز</small><b id="feMBest">0</b></div>' +
    '<div class="feStat"><small>امتیاز جمع‌آوری‌شدهٔ بازی (نه موجودی حساب)</small><b id="feMCoins">0</b></div>' +
    '<div class="feStat"><small>دوئل (برد-باخت)</small><b id="feMDuel">0-0</b></div></div>' +
    '<button class="feBig feBtnP" id="feBSp">🎮 تک‌نفره — ماجراجویی ۴۰ مرحله</button>' +
    '<button class="feBig feG feBtnP" id="feBDuel">🏆 مسابقه آنلاین دونفره</button>' +
    '<div class="feRow"><button class="feBig feGhost feBtnP" id="feBRot">📱 حالت نمایش</button>' +
    '<button class="feBig feGhost feBtnP" id="feBSnd">🔊 صدا: روشن</button></div>' +
    '<div class="feHint">کشیدن انگشت = حرکت • دکمه‌های لمسی هم فعال‌اند • مناسب سن +۱۳</div>';
  var lv = ov('feLevelsOv');
  H.levels = lv;
  lv.p.innerHTML = '<div class="feTitle">مرحله‌ها</div>' +
    '<div id="feEnvCards"></div><div id="feEnvRow" style="display:none"></div><div id="feLevels" class="feBtnP"></div>' +
    '<button class="feBig feGhost feBtnP" id="feBLvBack">بازگشت</button>';
  var dw = ov('feWait');
  H.wait = dw;
  dw.p.innerHTML = '<div class="feSpin"></div><div class="feTitle" style="font-size:clamp(17px,3.6vh,26px)">در انتظار حریف…</div>' +
    '<div class="feSub">دنبال یک روباه دیگر می‌گردیم…</div>' +
    '<button class="feBig feG feBtnP" id="feBBot">🤖 مسابقه با روباه سایه</button>' +
    '<button class="feBig feGhost feBtnP" id="feBCancel">انصراف</button>';
  var pa = ov('fePauseOv');
  H.pauseOv = pa;
  pa.p.innerHTML = '<div class="feTitle">⏸ توقف</div>' +
    '<button class="feBig feBtnP" id="feBResume">▶ ادامه</button>' +
    '<button class="feBig feGhost feBtnP" id="feBRestart">🔄 شروع دوباره</button>' +
    '<button class="feBig feGhost feBtnP" id="feBQuit">🏠 خروج به منو</button>' +
    '<div class="feTglRow"><button class="feTgl feBtnP" id="feTSnd">🔊 افکت</button><button class="feTgl feBtnP" id="feTMus">🎵 موسیقی</button><button class="feTgl feBtnP" id="feTRot">🔄 چرخش</button></div>';
  var go = ov('feOver');
  H.over = go;
  go.p.innerHTML = '<div class="feTitle" id="feOvTitle">🦊 بازی تمام شد</div><div id="feNewRec">🏆 رکورد جدید!</div>' +
    '<div class="feStats">' +
    '<div class="feStat"><small>امتیاز</small><b id="feOScore">0</b></div>' +
    '<div class="feStat"><small>مسافت</small><b id="feODist">0</b></div>' +
    '<div class="feStat"><small>سکه</small><b id="feOCoin">0</b></div>' +
    '<div class="feStat"><small>رکورد</small><b id="feOBest">0</b></div></div>' +
    '<button class="feBig feBtnP" id="feBRetry">🔄 دوباره بازی کن</button>' +
    '<button class="feBig feG feBtnP" id="feBNext" style="display:none">▶ مرحله بعد</button>' +
    '<button class="feBig feGhost feBtnP" id="feBHome">🏠 بازگشت</button>';
  H.count = el('div','', '', ui); H.count.id = 'feCount';
  H.banner = el('div','', '', ui); H.banner.id = 'feBanner';
  /* پنل تماشاچی (دوئل: بعد از سوختن) */
  H.spec = el('div','', '', ui); H.spec.id = 'feSpec';
  H.specT = el('div','', '', H.spec); H.specT.id = 'feSpecT';
  H.specS = el('div','', '', H.spec); H.specS.id = 'feSpecS';
  H.specB = el('button','', 'انصراف از مسابقه', H.spec); H.specB.id = 'feSpecB';
  H.specB.addEventListener('click', function(){ Snd.sfx('click'); duelLeave(); });
  H.back = el('div','feBtnP','', root); H.back.id = 'feBack'; H.back.innerHTML = '✕';
  document.body.appendChild(root);
  ctx2 = cv.getContext('2d');
  CX = ctx2;
}
function $(id){ return document.getElementById(id); }
function showOv(o){ if (o) o.classList.add('feShow'); }
function hideOv(o){ if (o) o.classList.remove('feShow'); }
function hideAllOv(){ ['feMenu','feLevelsOv','feWait','fePauseOv','feOver'].forEach(function(id){ hideOv($(id)); }); }
function banner(txt, ms){
  H.banner.textContent = txt; H.banner.style.display = 'block';
  clearTimeout(banner._t);
  banner._t = setTimeout(function(){ H.banner.style.display = 'none'; }, ms || 1800);
}
function refreshMenuStats(){
  $('feMBest').textContent = fmt(bestScore());
  $('feMCoins').textContent = fmt(SV.coins);
  $('feMDuel').textContent = (SV.duel.w||0) + '-' + (SV.duel.l||0);
  var sb = $('feBSnd');
  sb.textContent = '🔊 صدا: ' + (opt('sfx') ? 'روشن' : 'خاموش');
  $('feBRot').textContent = opt('rot') ? '🔄 چرخش: خودکار' : '🔒 چرخش: خاموش';
}
function bestScore(){
  var b = 0;
  for (var k in SV.best) if (SV.best[k] > b) b = SV.best[k];
  return b;
}
var FE_ENV_NAMES = { city:'شهر', forest:'جنگل', desert:'بیابان', mount:'کوهستان', factory:'کارخانه' };
var FE_ENV_ASSET = { city:'city', forest:'forest', desert:'desert', mount:'mount', factory:'factory' };
var feEnvSel = 'city';
function envUnlocked(theme, i){
  /* within each environment: level 1 open + first-of-run open + progress stored per env */
  var ku = 'u_' + LVL_KEY[theme];
  return i === 1 || i <= (SV.unlockedE && SV.unlockedE[ku] || 1);
}
function envProgress(theme){
  var ku = 'u_' + LVL_KEY[theme];
  var u = (SV.unlockedE && SV.unlockedE[ku]) || 1;
  if (SV.unlockedE && SV.unlockedE[ku + 'd']){
    var d = SV.unlockedE[ku + 'd'], c = 0;
    for (var i2 = 1; i2 <= 40; i2++) if (d[i2]) c++;
    return c;
  }
  return Math.max(0, u - 1);
}
function buildLevels(){
  var box = $('feLevels');
  box.innerHTML = '';
  var theme = feEnvSel;
  for (var i=1;i<=40;i++){
    var b = el('button','feLvl feBtnP','', box);
    var bk = 'b_' + LVL_KEY[theme] + i;
    var done = SV.best[bk] > 0;
    var lock = !envUnlocked(theme, i);
    if (lock) { b.classList.add('feLock'); b.innerHTML = '🔒<small>مرحله ' + i + '</small>'; }
    else {
      if (done) b.classList.add('feDone');
      b.innerHTML = i + (done ? '<small>⭐ ' + fmt(SV.best[bk]) + '</small>' : '<small>مرحله</small>');
      (function(n){
        b.addEventListener('click', function(){ Snd.sfx('click'); startLevel(LVL_KEY[theme] + n); });
      })(i);
    }
  }
}
function buildEnvTabs(){
  var cards = $('feEnvCards');
  if (!cards) return;
  cards.innerHTML = '';
  THEME_ORDER.forEach(function(th){
    var b = el('button','feECard feBtnP' + (feEnvSel===th ? ' feEOn' : ''), '', cards);
    var done = envProgress(th);
    b.innerHTML = '<img loading="lazy" decoding="async" src="' + ADEF[FE_ENV_ASSET[th]] + '" alt=""/>' +
      '<span class="feEGrad"></span>' +
      '<span class="feESt"><span>' + done + '/۴۰</span><span class="feEDone">' + (done >= 40 ? '✅' : '') + '</span></span>' +
      '<span class="feEName">' + FE_ENV_NAMES[th] + '</span>';
    b.addEventListener('click', function(){
      Snd.sfx('click');
      feEnvSel = th;
      buildEnvTabs();
      buildLevels();
    });
  });
}

/* ---------- ROTATION / FULLSCREEN ---------- */
var rotated = false;
var fitDeb = null;
function fitCanvas(){
  /* canvas internal size follows the real screen aspect — no letterbox, no empty space */
  if (!cv || !A || !A.city || !A.city.width) return;
  var w = rotated ? window.innerHeight : window.innerWidth;
  var h = rotated ? window.innerWidth : window.innerHeight;
  if (!w || !h) return;
  if (w >= h){
    YOFF = 0; VH = 720;
    VW = Math.max(900, Math.min(Math.round(720 * w / h), 2240));
  } else {
    /* portrait without rotation: keep world width, extend world down */
    VW = 1280;
    VH = Math.min(Math.max(Math.round(1280 * h / w), 720), 2400);
    YOFF = Math.round((VH - 720) / 2);
  }
  cv.width = VW; cv.height = VH;
  if (wrap){ wrap.style.width = w + 'px'; wrap.style.height = h + 'px'; }
  buildSlices();
}
function fitCanvasSoon(){
  if (fitDeb) clearTimeout(fitDeb);
  fitDeb = setTimeout(function(){ fitDeb = null; fitCanvas(); }, 140);
}
function applyRot(){
  if (!root || !root.classList.contains('feOn')) return;
  var portrait = window.innerHeight > window.innerWidth;
  rotated = portrait && opt('rot');
  var ww = window.innerWidth, wh = window.innerHeight;
  /* the frame ALWAYS fills the whole viewport */
  if (rotated){
    wrap.style.width = wh + 'px';
    wrap.style.height = ww + 'px';
    wrap.style.transform = 'translateX(-50%) translateY(-50%) rotate(90deg)';
    wrap.style.position = 'absolute';
    wrap.style.left = '50%'; wrap.style.top = '50%';
  } else {
    wrap.style.transform = 'none';
    wrap.style.position = 'relative';
    wrap.style.left = ''; wrap.style.top = '';
    wrap.style.width = ww + 'px';
    wrap.style.height = wh + 'px';
  }
  fitCanvasSoon();
}
function tryFullscreen(){
  try{
    var d = document.documentElement;
    if (!document.fullscreenElement && d.requestFullscreen){
      var r = d.requestFullscreen();
      if (r && r.catch) r.catch(function(){});
    }
    try{
      if (screen.orientation && screen.orientation.lock){
        var r2 = screen.orientation.lock('landscape');
        if (r2 && r2.catch) r2.catch(function(){});
      }
    }catch(e){}
  }catch(e){}
}
window.addEventListener('resize', function(){ applyRot(); });
window.addEventListener('orientationchange', function(){ setTimeout(applyRot, 120); });

/* viewport point -> canvas internal coords (handles rotated mode) */
function mapPoint(vx, vy){
  var r = cv.getBoundingClientRect();
  if (rotated){
    var u = (vy - r.top) / r.height;
    var v = (r.right - vx) / r.width;
    return { x: u * VW, y: v * VH };
  }
  return { x: (vx - r.left) / r.width * VW, y: (vy - r.top) / r.height * VH };
}

/* ---------- INPUT ---------- */
function bindInput(){
  /* keyboard */
  document.addEventListener('keydown', function(e){
    if (!root.classList.contains('feOn')) return;
    var k = e.key;
    if (k === 'ArrowUp' || k === 'w' || k === 'W' || k === ' '){ e.preventDefault(); pJump(); }
    else if (k === 'ArrowDown' || k === 's' || k === 'S'){ e.preventDefault(); pSlide(); }
    else if (k === 'ArrowLeft' || k === 'a' || k === 'A'){ e.preventDefault(); pLane(-1); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D'){ e.preventDefault(); pLane(1); }
    else if (k === 'p' || k === 'P' || k === 'Escape'){ if (G.state === 'play') doPause(); else if (G.state === 'pause') doResume(); }
  });
  /* swipe on touch layer */
  var t0 = null, swiped = false;
  H.touch.addEventListener('pointerdown', function(e){
    if (G.state !== 'play') return;
    t0 = { x:e.clientX, y:e.clientY, id:e.pointerId, t:now() };
    swiped = false;
    try{ H.touch.setPointerCapture(e.pointerId); }catch(err){}
  });
  H.touch.addEventListener('pointermove', function(e){
    if (!t0 || swiped || e.pointerId !== t0.id) return;
    var dx = e.clientX - t0.x, dy = e.clientY - t0.y;
    var TH = 24;
    if (Math.abs(dx) > TH || Math.abs(dy) > TH){
      swiped = true;
      if (Math.abs(dx) > Math.abs(dy)){ pLane(dx > 0 ? 1 : -1); }
      else if (dy < 0){ pJump(); }
      else { pSlide(); }
    }
  });
  H.touch.addEventListener('pointerup', function(e){
    if (!t0 || e.pointerId !== t0.id){ t0 = null; return; }
    if (!swiped){
      var d = now() - t0.t;
      var pt = mapPoint(e.clientX, e.clientY);
      if (d < 260 && pt.y < VH*0.72) pJump();
      else if (d < 400) pSlide();
    }
    t0 = null;
  });
  H.touch.addEventListener('pointercancel', function(){ t0 = null; });
  /* buttons */
  function holdBtn(elm, down, up){
    elm.addEventListener('pointerdown', function(e){ e.preventDefault(); e.stopPropagation(); down(); });
    if (up) elm.addEventListener('pointerup', function(e){ e.preventDefault(); up(); });
    if (up) elm.addEventListener('pointercancel', function(){ up(); });
    elm.addEventListener('click', function(e){ e.preventDefault(); });
  }
  holdBtn(H.ctlJ, function(){ pJump(); });
  holdBtn(H.ctlS, function(){ pSlide(); });
  holdBtn(H.ctlL, function(){ pLane(-1); });
  holdBtn(H.ctlR, function(){ pLane(1); });
  H.pause.addEventListener('click', function(){ if (G.state === 'play') doPause(); });
  H.back.addEventListener('click', function(){ feExit(); });
  /* menu */
  $('feBSp').addEventListener('click', function(){ Snd.sfx('click'); buildEnvTabs(); buildLevels(); hideOv(H.menu); showOv(H.levels); });
  $('feBDuel').addEventListener('click', function(){ Snd.sfx('click'); duelJoin(); });
  $('feBSnd').addEventListener('click', function(){ Snd.setSfx(!opt('sfx')); if (opt('sfx')) Snd.sfx('click'); refreshMenuStats(); syncTgl(); });
  $('feBRot').addEventListener('click', function(){ SV.opt.rot = opt('rot') ? 0 : 1; saveStore(); applyRot(); refreshMenuStats(); syncTgl(); Snd.sfx('click'); });
  $('feBLvBack').addEventListener('click', function(){ Snd.sfx('click'); hideOv(H.levels); showOv(H.menu); });
  $('feBBot').addEventListener('click', function(){ Snd.sfx('click'); netCancel(); hideAllOv(); startDuel(true); });
  $('feBCancel').addEventListener('click', function(){ Snd.sfx('click'); netCancel(); hideAllOv(); showOv(H.menu); });
  $('feBResume').addEventListener('click', function(){ Snd.sfx('click'); doResume(); });
  $('feBRestart').addEventListener('click', function(){ Snd.sfx('click'); hideAllOv(); restartCurrent(); });
  $('feBQuit').addEventListener('click', function(){ Snd.sfx('click'); hideAllOv(); toMenu(); });
  $('feBRetry').addEventListener('click', function(){ Snd.sfx('click'); hideAllOv(); restartCurrent(); });
  $('feBNext').addEventListener('click', function(){ Snd.sfx('click'); hideAllOv(); startLevel(G.L.n >= 40 ? G.L.key : (LVL_KEY[G.L.theme] + (G.L.n + 1))); });
  $('feBHome').addEventListener('click', function(){ Snd.sfx('click'); hideAllOv(); toMenu(); });
  /* pause overlay toggles */
  $('feTSnd').addEventListener('click', function(){ Snd.setSfx(!opt('sfx')); syncTgl(); });
  $('feTMus').addEventListener('click', function(){ Snd.setMusic(!opt('music')); syncTgl(); });
  $('feTRot').addEventListener('click', function(){ SV.opt.rot = opt('rot') ? 0 : 1; saveStore(); applyRot(); syncTgl(); });
  /* auto-pause when tab hidden */
  document.addEventListener('visibilitychange', function(){
    if (document.hidden && G.state === 'play') doPause();
  });
  window.addEventListener('blur', function(){ if (G.state === 'play') doPause(); });
}
function syncTgl(){
  var t1 = $('feTSnd'), t2 = $('feTMus'), t3 = $('feTRot');
  if (t1){ t1.classList.toggle('feOn', !!opt('sfx')); t1.textContent = (opt('sfx')?'🔊':'🔇') + ' افکت'; }
  if (t2){ t2.classList.toggle('feOn', !!opt('music')); t2.textContent = (opt('music')?'🎵':'🎵✕') + ' موسیقی'; }
  if (t3){ t3.classList.toggle('feOn', !!opt('rot')); t3.textContent = opt('rot') ? '🔄 چرخش خودکار' : '🔒 چرخش قفل'; }
}

/* ---------- HUD ---------- */
var hudC = { s:-1, c:-1, l:-1, lv:-1, pr:-1 };
function hudLives(){
  var h = '';
  for (var i=0;i<Math.max(P.lives,1);i++) h += '❤️';
  H.lives.innerHTML = h;
  H.lives.style.display = P.lives > 1 ? 'flex' : 'none';
}
function hudCoins(){ H.coins.innerHTML = '🪙 <b>' + fmt(P.coins) + '</b>'; }
function updHud(){
  var s = Math.floor(P.score);
  if (s !== hudC.s){ hudC.s = s; H.score.textContent = fmt(s); }
  if (P.coins !== hudC.c){ hudC.c = P.coins; hudCoins(); }
  if (P.lives !== hudC.l){ hudC.l = P.lives; hudLives(); }
  var prog = clamp(P.wx / W.L.len * 100, 0, 100);
  var pr2 = Math.floor(prog*2);
  if (pr2 !== hudC.pr){
    hudC.pr = pr2;
    H.progF.style.width = prog + '%';
    if (OPP.on){
      H.progO.style.display = 'block';
      H.progO.style.right = clamp(OPP.rx / W.L.len * 100, 0, 100) + '%';
    }
  }
  var lvlTxt = FE_ENV_NAMES[G.L.theme] + ' ' + G.L.n;
  if (lvlTxt !== hudC.lv){ hudC.lv = lvlTxt; H.lvl.textContent = lvlTxt; }
  /* power timers */
  pwHud('shield', P.shieldT, 8);
  pwHud('speed', P.speedT, 6);
  pwHud('magnet', P.magT, 8);
  pwHud('dash', P.dashT, 3.2);
}
function pwHud(k, t, max){
  var d = H.pw[k];
  if (t > 0){
    d.style.display = 'flex';
    d.querySelector('i').style.setProperty('--p', (t/max*100) + '%');
  } else d.style.display = 'none';
}

/* ---------- GAME FLOW ---------- */
function startLevel(n){
  G.mode = 'sp';
  beginLevel(n, false);
}
/* n may be "c7" / "f12" / "d30" ... (env + level) or a number (legacy city) */
function beginLevel(n, duel, cdOpts){
  G.overSent = false;
  var L = levelDef(n);
  G.L = L;
  resetWorld(L);
  resetPlayer();
  OPP.on = false; OPP.botHidden = false;
  if (duel){ resetOpp(false, OPP.name); NET.buf.length = 0; }
  hudC = { s:-1, c:-1, l:-1, lv:-1, pr:-1 };
  H.lvl.style.display = 'flex';
  H.progO.style.display = duel ? 'block' : 'none';
  $('feProg').style.display = 'block';
  hideAllOv();
  G.state = 'count';
  applyRot();
  var opts = cdOpts;
  if (duel && !opts){
    opts = { seq:['۵','۴','۳','۲','۱','برو!'], total:5000,
      sub: duelSub() };
  }
  countdown(function(){
    G.state = 'play';
    Snd.musicStart();
    if (G.mode === 'duel'){ NET._ls = 0; netSend(); }
    if (n === 1 && G.mode === 'sp' && !SV.seenTut){
      showHint('کشیدن بالا = پرش • پایین = سُرخوردن • چپ/راست = تغییر مسیر', 4200);
      SV.seenTut = 1; saveStore();
    }
  }, opts);
}
function medOf(arr){ var a = arr.slice().sort(function(x,y){ return x-y; }); return a[Math.floor(a.length/2)]; }
function countdown(cb, opts){
  var tok = ++G.countTok;
  opts = opts || {};
  var seq = opts.seq || ['۳','۲','۱','برو!'];
  var total = opts.total || 2800;
  var sub = opts.sub || '';
  H.count.style.display = 'flex';
  var per = total / seq.length;
  var t0 = now(), last = -1;
  function paint(idx){
    H.count.innerHTML = '<span style="color:' + colorHexLight(ME.color) + ';text-shadow:0 0 40px ' + colorHex(ME.color) + '">' + seq[idx] + '</span>' + (sub ? '<small class="feCntSub">' + sub + '</small>' : '');
    Snd.sfx(idx === seq.length - 1 ? 'go' : 'tick');
  }
  function step2(){
    if (tok !== G.countTok) return;
    var el3 = now() - t0;
    if (el3 >= total){ H.count.style.display = 'none'; G.playAt = now(); cb(); return; }
    var idx = Math.min(seq.length - 1, Math.floor(el3 / per));
    if (idx !== last){ last = idx; paint(idx); }
    setTimeout(step2, 50);
  }
  paint(0);
  step2();
}
function showHint(txt, ms){
  H.hint.textContent = txt;
  H.hint.style.display = 'block';
  clearTimeout(showHint._t);
  showHint._t = setTimeout(function(){ H.hint.style.display = 'none'; }, ms || 2500);
}
function doPause(){
  if (G.state !== 'play') return;
  G.state = 'pause';
  Snd.musicStop();
  showOv(H.pauseOv);
  syncTgl();
}
function doResume(){
  if (G.state !== 'pause') return;
  hideAllOv();
  countdown(function(){ G.state = 'play'; Snd.musicStart(); });
}
function restartCurrent(){
  if (G.mode === 'duel'){ startDuel(OPP.bot); }
  else beginLevel(G.L.key, false);
}
function toMenu(){
  G.countTok++;
  G.state = 'menu';
  G.mode = 'sp';
  setSeat(0);           /* بازگشت به حالت تک‌نفره: من همیشه نارنجی */
  OPP.name = 'حریف';
  netCancel();
  Snd.musicStop();
  W.ob.length = 0; W.co.length = 0; W.en.length = 0; W.fl.length = 0;
  W.camX = 0; W.spd = 400; W.L = levelDef(1); W.Theme = THEMES.city; W.time = 0;
  resetPlayer(); OPP.on = false;
  $('feProg').style.display = 'none';
  H.lvl.style.display = 'none';
  refreshMenuStats();
  hideAllOv();
  showOv(H.menu);
  applyRot();
}
function feExit(){
  try{ if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); }catch(e){}
  G.countTok++;
  netCancel();
  G.state = 'off';
  Snd.musicStop();
  if (root) root.classList.remove('feOn');
  if (H && H.back) H.back.style.display = 'none';
  if (typeof window.goFun === 'function') window.goFun();
}
if (typeof window !== 'undefined') window.feExit = feExit;
function gameOver(){
  if (G.overSent) return;
  try{ if(G.mode==='duel'){ var _a=document.getElementById('feBRestart'); if(_a) _a.style.display='none'; var _b=document.getElementById('feBRetry'); if(_b) _b.style.display='none'; var _n=document.getElementById('feBNext'); if(_n && G.mode==='duel') _n.style.display='none'; } }catch(e){}
  G.overSent = true;
  G.state = 'dead';
  Snd.musicStop();
  var sc = Math.floor(P.score);
  var key = G.L.key;
  var isRec = false;
  if (G.mode === 'sp'){
    if (!SV.best[key] || sc > SV.best[key]){ SV.best[key] = sc; isRec = true; }
    if (P.wx > SV.bestDist) SV.bestDist = Math.floor(P.wx);
    SV.coins += P.coins;
    saveStore(); pushSoon();
  }
  $('feOvTitle').textContent = '🦊 بازی تمام شد';
  $('feNewRec').style.display = isRec ? 'block' : 'none';
  $('feOScore').textContent = fmt(sc);
  $('feODist').textContent = fmt(Math.floor(P.wx/10)) + ' متر';
  $('feOCoin').textContent = fmt(P.coins);
  $('feOBest').textContent = fmt(Math.max(SV.best[key]||0, 0));
  $('feBNext').style.display = 'none';
  $('feBRetry').textContent = G.mode === 'duel' ? '🔄 مسابقه دوباره' : '🔄 دوباره بازی کن';
  showOv(H.over);
}
function showFinish(){
  if (G.overSent) return;
  try{ if(G.mode==='duel'){ var _a=document.getElementById('feBRestart'); if(_a) _a.style.display='none'; var _b=document.getElementById('feBRetry'); if(_b) _b.style.display='none'; } }catch(e){}
  G.overSent = true;
  G.state = 'dead';
  Snd.musicStop();
  Snd.sfx('win');
  var sc = Math.floor(P.score);
  var key = G.L.key;
  var isRec = false;
  if (!SV.best[key] || sc > SV.best[key]){ SV.best[key] = sc; isRec = true; }
  if (G.mode === 'sp'){
    var ku = 'u_' + LVL_KEY[G.L.theme];
    if (!SV.unlockedE) SV.unlockedE = {};
    var cur = SV.unlockedE[ku] || 1;
    if (G.L.n >= cur && cur < 40) SV.unlockedE[ku] = G.L.n + 1;
  }
  SV.coins += P.coins;
  saveStore(); pushSoon();
  for (var i=0;i<3;i++){
    (function(d){
      setTimeout(function(){
        burst(rnd(300,900), rnd(160,360), 26, pick(['#ffd23e','#ff7a50','#7fd4ff','#8ce0a0']), 340, 'spark');
        Snd.sfx('power');
      }, d);
    })(i*280);
  }
  try {
    if (window.FoxGameRewardService) {
      FoxGameRewardService.claimReward({ gameCode: 'fox_escape', mode: 'solo', result: 'level_complete', levelId: G.L.n });
    }
  } catch(e) {}
  $('feOvTitle').textContent = '🎉 مرحله ' + G.L.n + ' کامل شد!';
  $('feNewRec').style.display = isRec ? 'block' : 'none';
  $('feOScore').textContent = fmt(sc);
  $('feODist').textContent = fmt(Math.floor(P.wx/10)) + ' متر';
  $('feOCoin').textContent = fmt(P.coins);
  $('feOBest').textContent = fmt(SV.best[key]);
  $('feOBest').parentNode.querySelector('small').textContent = 'رکورد مرحله';
  if (G.L.n < 40){ $('feBNext').style.display = 'block'; }
  setTimeout(function(){ showOv(H.over); }, 950);
}
function duelNewMatch(){
  DUE.failed = false;
  OPP.left = false;
  specHide();
  if (NET.finTimer){ clearTimeout(NET.finTimer); NET.finTimer = null; }
}
/* ---------- قوانین برد ۲۰۲۷: برنده فقط با رسیدن به خط پایان ---------- */
function specShow(t, s){
  if (!H.spec) return;
  H.specT.textContent = t; H.specS.textContent = s;
  H.spec.style.display = 'flex';
}
function specHide(){ if (H.spec) H.spec.style.display = 'none'; }
function specTick(){
  if (G.state !== 'spec' || !H.spec) return;
  var pc = OPP.on ? Math.round(clamp(OPP.rx / W.L.len, 0, 1) * 100) : 0;
  var t = 'پیشرفت حریف: ' + pc + '٪';
  if (H.specS && H.specS.textContent !== t) H.specS.textContent = t;
}
function duelAfterDeath(){          /* من سوختم → مسابقه ادامه دارد */
  if (G.overSent) return;
  if (OPP.finished){ duelResult('lose', 'حریف به خط پایان رسید — باختی 😔'); return; }
  if (OPP.dead){ duelResult('draw', 'هر دو سوختید و هیچ‌کس به خط پایان نرسید 🤝'); return; }
  if (G.state === 'count'){ G.countTok++; }
  G.state = 'spec';
  specShow('💀 سوختی!', 'حریف باید به خط پایان برسه تا نتیجه معلوم شه');
}
function duelOnOppFinish(){          /* حریف به خط پایان رسید */
  if (G.overSent) return;
  if (P.finished){ duelResult(P.finT <= OPP.finT ? (P.finT === OPP.finT ? 'draw' : 'win') : 'lose', 'پایان مسابقه'); return; }
  if (DUE.failed || P.dead){ duelResult('lose', 'حریف به خط پایان رسید — باختی 😔'); return; }
  banner('حریف خط پایان را رد کرد — تو هم می‌توانی!', 2400);
}
function duelOppLeft(){              /* حریف از بازی خارج شد / اتصالش قطع شد */
  if (OPP.left || G.overSent) return;
  OPP.left = true;
  if (OPP.finished) return;          /* حریف زودتر رسیده بود؛ مقایسهٔ زمان تعیین می‌کند */
  if (OPP.dead){                     /* قبلاً سوخته بود → من باید به خط پایان برسم */
    if (P.finished){ duelResult('win', 'تو به خط پایان رسیدی 🏆'); return; }
    if (DUE.failed || P.dead){ duelResult('draw', 'هیچ‌کس به خط پایان نرسید 🤝'); return; }
    banner('حریف مسابقه را ترک کرد — تا خط پایان برو تا ببری 🏆', 2800);
    return;
  }
  duelResult('win', 'حریف از مسابقه خارج شد — برد تو 🏆');
}
function duelLeave(){                /* دکمهٔ انصراف تماشاچی */
  NET.send({ t:'left' });
  if (NET.ws){ try{ NET.ws.onclose = null; NET.ws.close(); }catch(e){} NET.ws = null; }
  if (NET.pingIv){ clearInterval(NET.pingIv); NET.pingIv = null; }
  duelResult(DUE.failed ? 'lose' : 'lose', 'مسابقه را ترک کردی');
}
function duelEnd(won, why){ duelResult(won ? 'win' : 'lose', why); }
function duelResult(kind, why){
  if (G.overSent || !root.classList.contains('feOn')) return;
  G.overSent = true;
  G.state = 'dead';
  specHide();
  if (NET.finTimer){ clearTimeout(NET.finTimer); NET.finTimer = null; }
  Snd.musicStop();
  if (kind === 'win'){ SV.duel.w = (SV.duel.w||0) + 1; Snd.sfx('win'); }
  else if (kind === 'lose'){ SV.duel.l = (SV.duel.l||0) + 1; Snd.sfx('lose'); }
  else { Snd.sfx('lose'); }
  saveStore(); pushSoon();
  try {
    if (kind === 'win' && window.FoxGameRewardService) {
      FoxGameRewardService.claimReward({ gameCode: 'fox_escape', mode: 'online', result: 'win' });
    }
  } catch(e) {}
  $('feOvTitle').textContent = kind === 'win' ? '🏆 بردی!' : (kind === 'lose' ? '😔 باختی' : '🤝 مساوی');
  $('feNewRec').style.display = 'none';
  $('feOScore').textContent = fmt(Math.floor(P.score));
  $('feODist').textContent = fmt(Math.floor(P.wx/10)) + ' متر';
  $('feOCoin').textContent = fmt(P.coins);
  $('feOBest').textContent = (SV.duel.w||0) + ' برد - ' + (SV.duel.l||0) + ' باخت';
  $('feOBest').parentNode.querySelector('small').textContent = 'نبرد دوئل';
  $('feBNext').style.display = 'none';
  try{ if(G.mode==='duel'){ var _a=document.getElementById('feBRestart'); if(_a) _a.style.display='none'; var _b=document.getElementById('feBRetry'); if(_b) _b.style.display='none'; } }catch(e){}
  $('feBRetry').textContent = '🔄 مسابقه دوباره';
  try{ if(G.mode==='duel'){ var _b2=document.getElementById('feBRetry'); if(_b2) _b2.style.display='none'; } }catch(e){}
  banner(why || (kind === 'win' ? 'برنده مسابقه!' : (kind === 'draw' ? 'مساوی شد' : 'حریف زودتر رسید')), 2200);
  setTimeout(function(){ showOv(H.over); try{ if(G.mode==='duel'){ var _a=document.getElementById('feBRestart'); if(_a) _a.style.display='none'; var _b=document.getElementById('feBRetry'); if(_b) _b.style.display='none'; } hideOnlineAgainButtons(); }catch(e){} }, 700);
}

/* ---------- NETWORK (duel) ---------- */
var NET = { ws:null, waitT:0, finTimer:null, buf:[], off:0, offS:[], pingIv:null };
/* شروع دوئل با هم‌زمانی دقیق: هر دو گوشی به یک لحظهٔ سرور می‌شمارند.
   اگر نمونهٔ ساعت هنوز آماده نیست، چند نمونهٔ سریع می‌گیریم (حداکثر ~۰.۶ ثانیه). */
function beginDuelSynced(m){
  var tries = 0;
  function fire(){
    var delay = 5000;
    if (m.at){
      var svNow = now() + (NET.off || 0);
      delay = clamp(m.at + 5000 - svNow, 700, 6500);
    }
    startDuel(false, m.lv, { seq:['۵','۴','۳','۲','۱','برو!'], total: delay, sub: duelSub() });
    banner('حریف پیدا شد: ' + OPP.name, 2200);
  }
  function sample(){
    if (NET.offS.length || tries >= 3){ fire(); return; }
    tries++;
    try{ if (NET.ws && NET.ws.readyState === 1) NET.ws.send(JSON.stringify({ t:'ping2', c: now() })); }catch(e){}
    setTimeout(sample, 190);
  }
  sample();
}
function duelJoin(keepRetry){
  detectUser(); serverSync();
  if (!feUser || !feUser.phone){
    banner('برای مسابقه آنلاین ابتدا وارد حساب کاربری شو', 2600);
    return;
  }
  hideAllOv();
  showOv(H.wait);
  NET.hunting = true; if (!keepRetry) NET.retryN = 0;
  var proto = location.protocol === 'https:' ? 'wss://' : 'ws://';
  var url = proto + location.host + '/api/fe/ws?phone=' + encodeURIComponent(feUser.phone) +
    '&name=' + encodeURIComponent(feUser.name || 'روباه') + '&lv=' + clamp(SV.unlocked,1,40);
  try{
    var ws = new WebSocket(url);
    NET.ws = ws;
    NET.waitT = now();
    NET.offS.length = 0; NET.off = 0;
    ws.onopen = function(){
      try{ ws.send(JSON.stringify({ t:'hello' })); }catch(e){}
      try{ ws.send(JSON.stringify({ t:'ping2', c: now() })); }catch(e){}
      if (NET.pingIv) clearInterval(NET.pingIv);
      NET.pingIv = setInterval(function(){
        try{ if (ws.readyState === 1) ws.send(JSON.stringify({ t:'ping2', c: now() })); }catch(e){}
      }, 1800);
    };
    ws.onmessage = function(ev){
      var m = null;
      try{ m = JSON.parse(ev.data); }catch(e){ return; }
      if (!m || !m.t) return;
      if (m.t === 'png'){ try{ ws.send(JSON.stringify({ t:'pong' })); }catch(e){} return; }
      if (m.t === 'pong') return;
      if (m.t === 'pong2'){
        var t3 = now(), rtt = t3 - m.c;
        var off = m.s - m.c - rtt/2;   /* server clock minus client clock */
        NET.offS.push(off);
        if (NET.offS.length > 5) NET.offS.shift();
        NET.off = medOf(NET.offS);
        return;
      }
      if (m.t === 'wait'){ return; }
      if (m.t === 'start'){
        NET.hunting = false;
        OPP.name = m.opp || 'حریف';
        setSeat(typeof m.seat === 'number' ? m.seat : 0);   /* رنگ ثابت من در این مسابقه */
        hideAllOv();
        beginDuelSynced(m);
        return;
      }
      netApply(m);
    };
    ws.onclose = function(ev){
      if (NET.ws !== ws) return;
      NET.ws = null;
      if (NET.pingIv){ clearInterval(NET.pingIv); NET.pingIv = null; }
      if (NET.hunting){
        var cc = (ev && ev.code) || 0;
        if (cc === 1000){ NET.hunting = false; banner('این حساب از جای دیگری وارد شد', 2200); return; }
        NET.retryN = (NET.retryN || 0) + 1;
        if (NET.retryN <= 5){
          banner('اتصال قطع شد؛ تلاش دوباره…', 1800);
          setTimeout(function(){ if (NET.hunting) duelJoin(1); }, 1400);
          return;
        }
        NET.hunting = false;
        banner('اتصال برقرار نشد — می‌توانی با روباه بازی کنی', 2600);
        try{ var fw = document.getElementById('feWait'); if (fw) fw.classList.remove('feShow'); }catch(e){}
        return;
      }
      if (G.mode === 'duel' && OPP.on && !OPP.bot && !G.overSent &&
          (G.state === 'play' || G.state === 'count' || G.state === 'spec')){
        banner('حریف قطع شد', 1600);
        G.countTok++;          /* stop pending countdown */
        setTimeout(duelOppLeft, 800);
      }
    };
    ws.onerror = function(){};
    setTimeout(function(){
      if (NET.ws === ws && ws.readyState === 0){
        try{ ws.close(); }catch(e){}
        NET.ws = null;
        if (G.state !== 'off' && $('feWait').classList.contains('feShow')){
          banner('اتصال برقرار نشد — می‌توانی با روباه سایه مسابقه بدهی', 3000);
        }
      }
    }, 8000);
  }catch(e){
    NET.ws = null;
    banner('اتصال برقرار نشد', 2200);
  }
}
function netCancel(){
  NET.hunting = false;
  if (NET.ws){ try{ NET.ws.onclose = null; NET.ws.close(); }catch(e){} NET.ws = null; }
  if (NET.pingIv){ clearInterval(NET.pingIv); NET.pingIv = null; }
  if (NET.finTimer){ clearTimeout(NET.finTimer); NET.finTimer = null; }
  NET.buf.length = 0;
}
function startDuel(bot, lv, cdOpts){
  G.overSent = false;
    G.mode = 'duel';
  try{ if(typeof THEME_ORDER!=='undefined' && (!lv || lv==='city' || lv===0 || lv==='0')){ var _th=THEME_ORDER[Math.floor(Math.random()*THEME_ORDER.length)]; var _n=Math.floor(Math.random()*40)+1; var _k={city:'c',forest:'f',desert:'d',mount:'m',factory:'k'}[_th]||'c'; if(!lv || lv==='city') lv=_k+_n; } }catch(e){}
  duelNewMatch();
  var n = (typeof lv==='string' && /^[a-z]/.test(lv)) ? lv : clamp(lv || SV.unlocked, 1, 40);
  if (bot){ OPP.bot = true; OPP.name = 'روباه سایه'; setSeat(0); }
  else OPP.bot = false;
  beginLevel(n, true, cdOpts);
}
function netSend(){
  if (!NET.ws || NET.ws.readyState !== 1 || G.state !== 'play') return;
  if (now() - NET._ls < 55) return;
  NET._ls = now();
  NET.send({ t:'s', x:Math.round(P.wx), y:Math.round(P.y), l:Math.round(P.lanePos*20)/20,
    s: P.dead ? 3 : (P.st === 'jump' ? 1 : (P.st === 'slide' ? 2 : 0)), c:P.coins });
}
NET.send = function(o){
  if (!NET.ws || NET.ws.readyState !== 1) return;
  try{ NET.ws.send(JSON.stringify(o)); }catch(e){}
};
function netApply(m){
  if (m.t === 's'){
    if (!OPP.on) return;
    OPP.wx = m.x || 0;
    OPP.y = m.y || LANE_Y[1];
    OPP.lanePos = clamp(m.l || 0.5, 0, 1);
    OPP.st = m.s === 1 ? 'jump' : (m.s === 2 ? 'slide' : (m.s === 3 ? 'hit' : 'run'));
    NET.buf.push({ rt: now(), x: OPP.wx, y: OPP.y, l: OPP.lanePos, s: m.s || 0 });
    if (NET.buf.length > 8) NET.buf.shift();
    if (m.s === 3 && !OPP.dead && !OPP.botHidden){
      OPP.dead = true;
      banner('حریف سوخت! 🦊🔥', 2000);
    }
    if (m.c !== undefined) OPP.coins = m.c;
  } else if (m.t === 'die'){
    if (OPP.on && !OPP.dead){
      OPP.dead = true;
      if (P.finished){ duelResult('win', 'تو به خط پایان رسیدی و حریف نرسید 🏆'); }
      else if (DUE.failed || P.dead){ duelResult('draw', 'هر دو سوختید و هیچ‌کس به خط پایان نرسید 🤝'); }
      else banner('حریف سوخت! 🔥 تا خط پایان بدو تا برنده شی 🏆', 2800);
    }
  } else if (m.t === 'left' || m.t === 'bye'){
    duelOppLeft();
  } else if (m.t === 'fin'){
    if (OPP.on && !OPP.finished){
      OPP.finished = true; OPP.finT = (m.tm || 0) / 1000;   /* ثانیه — هم‌واحد با P.finT */
      duelOnOppFinish();
    }
  }
}
function checkDuelFinish(){
  if (G.mode !== 'duel' || !P.finished || G.overSent) return;
  NET.send({ t:'fin', tm:Math.round(P.finT*1000) });
  DUE.failed = false;
  if (OPP.finished){ duelOnOppFinish(); return; }
  if (OPP.dead || OPP.left){ duelResult('win', 'به خط پایان رسیدی 🏆'); return; }
  /* من اول رسیدم: مهلت کوتاه برای پیام در راهِ حریف، بعد بردِ خط پایانِ من */
  G.state = 'spec';
  banner('🏁 رسیدی! منتظر حریف…', 2600);
  specShow('🏁 به خط پایان رسیدی', 'منتظر حریف…');
  if (!NET.finTimer){
    NET.finTimer = setTimeout(function(){
      NET.finTimer = null;
      if (!G.overSent) duelResult('win', 'تو به خط پایان رسیدی و حریف نرسید 🏆');
    }, 2500);
  }
}

/* ---------- MAIN LOOP (single rAF, fixed timestep) ---------- */
var rafId = 0, lastTs = 0, acc = 0, stepN = 0;
var FIXED = 1/60;
var dtFrame = 0.016;
var fpsS = { n:0, t:0, v:60 };
function loop(ts){
  rafId = requestAnimationFrame(loop);
  if (!lastTs) lastTs = ts;
  var el2 = (ts - lastTs)/1000;
  lastTs = ts;
  if (el2 > 0.25) el2 = 0.25;
  dtFrame = el2;
  fpsS.n++; fpsS.t += el2;
  if (fpsS.t >= 1){ fpsS.v = Math.round(fpsS.n/fpsS.t); fpsS.n = 0; fpsS.t = 0; }
  if (G.state === 'play' || G.state === 'spec'){
    acc += el2 * W.slow;
    var guard = 0;
    while (acc >= FIXED && guard++ < 4){ stepN++; try{ step(FIXED); }catch(e){ try{ console.error('STEP ERR', e && e.message); }catch(e2){} break; } acc -= FIXED; }
  } else {
    acc = 0;
    if (G.state === 'dead' || G.state === 'count'){ W.time += el2; updPT(el2); updWeather(el2);
      if (W.shakeT > 0){ W.shakeT -= el2; if (W.shakeT <= 0) W.shake = 0; }
      if (W.flash > 0) W.flash -= el2*1.6;
      if (G.state === 'dead' && P.dead){ P.deathT += el2; if (P.pitFall) P.y += 300*el2; }
    }
  }
  if (root && root.classList.contains('feOn')) { render(); if (G.state === 'play' || G.state === 'dead' || G.state === 'spec') updHud(); }
}
function step(dt){
  W.time += dt;
  /* speed ramp: fair progression */
  var prog = clamp(P.wx / W.L.len, 0, 1);
  W.spd = W.L.base * (1 + W.L.ramp * prog);
  W.camX = (G.state === 'spec' && OPP.on) ? (OPP.rx - FOX_X) : (P.wx - FOX_X);
  spawnAhead();
  if (G.state === 'spec'){
    /* تماشاچی: بازیکن سوخته دیگر حرکت نمی‌کند؛ دوربین دنبال حریف است */
    if (P.dead){ P.deathT += dt; if (P.pitFall) P.y += 460*dt; }
    updOpp(dt); updEntities(dt); specTick();
  } else {
    updPlayer(dt);
    updOpp(dt);
    updEntities(dt);
    collide(dt);
    netSend();
  }
  /* dash trail */
  if (P.dashT > 0){
    P.trailT -= dt;
    if (P.trailT <= 0){
      P.trailT = 0.045;
      P.trail.unshift({ f:foxFrame(), y:P.y, w:(P.st === 'slide' ? 128 : 102) });
      if (P.trail.length > 3) P.trail.pop();
    }
  } else if (P.trail.length) P.trail.length = 0;
  /* finish */
  if (!P.finished && !P.dead && P.wx >= W.L.len){
    P.finished = true; P.finT = W.time;
    if (G.mode === 'sp'){ setTimeout(showFinish, 650); }
    else { checkDuelFinish(); }
  }
  if (P.finished && G.state === 'play'){
    P.wx += foxSpeed()*dt*0.4;
  }
}

/* ---------- LAUNCH ---------- */
function feLaunch(){
  if (!root){
    saveLoad(); detectUser(); serverSync();
    buildUI(); buildSlicesWhenReady(); bindInput();
  }
  if (root.classList.contains('feOn')) return;
  if (!rafId) rafId = requestAnimationFrame(loop);
  root.classList.add('feOn');
  H.back.style.display = 'flex';
  G.overSent = false;
  tryFullscreen();
  applyRot();
  toMenu();
  syncTgl();
  serverSync();
}
function buildSlicesWhenReady(){
  loadAssets(function(){
    fitCanvas();
    buildSlices();
    buildAltFox();
    W.L = levelDef(1); W.Theme = THEMES.city;
    resetPlayer();
  });
}
/* preview render for the menu background */
setInterval(function(){
  if (root && root.classList.contains('feOn') && G.state === 'menu' && assetsReady){
    W.camX += 2.2;
    render();
  }
}, 33);

/* ---------- DEBUG (only with ?debug=1) ---------- */
try{
  if (location.search.indexOf('debug=1') >= 0){
    window.FE_DEBUG = {
      state:function(){ return { st:G.state, mode:G.mode, lvl:G.L && G.L.n, wx:Math.round(P.wx), y:Math.round(P.y),
        score:Math.floor(P.score), coins:P.coins, spd:Math.round(W.spd), fps:fpsS.v, tm:+W.time.toFixed(2), slow:W.slow, steps:stepN, acc:+acc.toFixed(3), pa:G.playAt||0, off:Math.round(NET.off||0),
        ob:W.ob.length, co:W.co.length, en:W.en.length, nx:Math.round(W.nextX), zone:W.zone, fin:Math.round(W.finX), os:G.overSent, fin_:P.finished, opp:OPP.on?{wx:Math.round(OPP.wx),dead:OPP.dead,fin:OPP.finished}:null }; },
      jump:pJump, slide:pSlide, left:function(){ pLane(-1); }, right:function(){ pLane(1); },
      kill:function(){ P.invT=0; P.shieldT=0; P.lives=1; killPlayer(false); },
      power:function(k){ grantPower(k||'shield', FOX_X, P.y-60); },
      eat:function(){ for (var i=0;i<W.co.length;i++){ var c=W.co[i]; if (!c.dead && Math.abs(c.wx-W.camX-FOX_X)<60){ pickUp(c); return 1; } } return 0; },
      spawnCoin:function(){ W.co.push({ k:'coin', wx:W.camX+FOX_X, y:LANE_Y[1]-46, lane:1, t:0, dead:false, pw:'' }); return W.co.length; },
      drawProbe:function(){ /* returns how many non-dead coins the renderer would draw this frame */
        var n=0; for (var i=0;i<W.co.length;i++){ var c=W.co[i]; var sx=c.wx-W.camX; if (!c.dead && sx>-80 && sx<VW+100) n++; } return n; },
      forceDraw:function(){ render(); },
      coins:function(n){ P.coins+=n; hudCoins(); },
      skip:function(n){ P.wx+=n||1000; W.camX=P.wx-FOX_X; spawnAhead(); },
      enemies:function(){ try{ return W.en.map(function(e){ return e.k; }); }catch(e){ return []; } },
      timeScale:function(x){ W.slow = x||1; },
      colors:function(){ return { seat: ME.seat, me: ME.color, opp: oppColor(), localSheet: (mySheet() === foxSheetAlt ? 'blue' : 'orange'), oppSheet: (oppSheet() === foxSheetAlt ? 'blue' : 'orange') }; },
      seat:function(n){ setSeat(n); return ME.color; },
      dieOpp:function(){ netApply({ t:'die' }); },
      finOpp:function(){ netApply({ t:'fin', tm:0.1 }); },
      mem:function(){ return performance && performance.memory ? Math.round(performance.memory.usedJSHeapSize/1048576) : -1; }
    };
  }
}catch(e){}

/* export */
return { launch: feLaunch };
})();
if (typeof window !== 'undefined') window.FE_LAUNCH = function(){ try{ FE.launch(); }catch(e){ try{ console.error(e); }catch(e2){} } };




/* ===== SUDOKU ASSETS (تصاویر واقعی روباه و جنگل) ===== */
window.__sdBgSrc = "/static/e5962971f14d41c03fd677eaa3204444219a0679b2c9ba7fbebf2153e6f8f404.webp";
window.__sdFoxSrc = "/static/c18e78214ecc8564766474475191bdf8108b2f654d9bacd9c0b609adc9d21eb5.webp";
window.__sdTrophySrc = "/static/73fed013e70250a4d6bb830b8fa6a362f55fc8a1e23d1ff8840396411465d927.webp";

/* =====================================================================
   SUDOKU CORE — سودوکوی روباه ۲۰۲۷
   موتور مستقل و بدون وابستگی به UI:
   • تولید جدول معتبر با Backtracking + درهم‌سازی تصادفی
   • تضمین یکتایی جواب (شمارش جواب‌ها با سقف)
   • رتبه‌بندی سختی بر اساس تکنیک‌های حل + تعداد سرنخ
   • قابل استفاده هم در مرورگر و هم در Cloudflare Worker
   نکته: این فایل نباید بک‌تیک، بک‌اسلش یا dollar{ داشته باشد (داخل تمپلیت HTML تزریق می‌شود)
   ===================================================================== */
var SudokuCore = (function () {
  'use strict';

  /* ---------- تولیدکنندهٔ عدد تصادفی قابل تکرار (mulberry32) ---------- */
  function makeRng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 1831565813) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rng) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  /* ---------- شاخص‌های خانه، ردیف، ستون، بلوک ---------- */
  function rowOf(i) { return (i / 9) | 0; }
  function colOf(i) { return i % 9; }
  function boxOf(i) { return ((rowOf(i) / 3) | 0) * 3 + ((colOf(i) / 3) | 0); }

  function canPlace(grid, idx, v) {
    var r = rowOf(idx), c = colOf(idx), b = boxOf(idx);
    for (var k = 0; k < 9; k++) {
      if (grid[r * 9 + k] === v) return false;
      if (grid[k * 9 + c] === v) return false;
    }
    var br = (b / 3 | 0) * 3, bc = (b % 3) * 3;
    for (var rr = 0; rr < 3; rr++) {
      for (var cc = 0; cc < 3; cc++) {
        if (grid[(br + rr) * 9 + (bc + cc)] === v) return false;
      }
    }
    return true;
  }

  /* ---------- آیا قرار دادن v در idx طبق قوانین (ردیف/ستون/بلوک) مجاز است؟ ---------- */
  function isLegal(board, idx, v) {
    if (!v) return true;
    var r = rowOf(idx), c = colOf(idx), b = boxOf(idx);
    for (var k = 0; k < 9; k++) {
      var ri = r * 9 + k, ci = k * 9 + c;
      if (ri !== idx && board[ri] === v) return false;
      if (ci !== idx && board[ci] === v) return false;
    }
    var br = (b / 3 | 0) * 3, bc = (b % 3) * 3;
    for (var rr = 0; rr < 3; rr++) for (var cc = 0; cc < 3; cc++) {
      var bi = (br + rr) * 9 + (bc + cc);
      if (bi !== idx && board[bi] === v) return false;
    }
    return true;
  }

  /* ---------- انتخاب خانه با کمترین گزینه (MRV) برای سرعت حل ---------- */
  function findBestCell(grid) {
    var best = -1, bestMask = 0, bestCount = 10;
    for (var i = 0; i < 81; i++) {
      if (grid[i] !== 0) continue;
      var mask = 0, count = 0;
      for (var v = 1; v <= 9; v++) {
        if (canPlace(grid, i, v)) { mask |= (1 << v); count++; }
      }
      if (count === 0) return { idx: i, mask: 0, count: 0 };
      if (count < bestCount) { bestCount = count; best = i; bestMask = mask; if (count === 1) break; }
    }
    return { idx: best, mask: bestMask, count: bestCount };
  }

  /* ---------- شمارش جواب‌ها با سقف (برای بررسی یکتایی) ---------- */
  function countSolutions(grid, limit) {
    limit = limit || 2;
    var work = grid.slice();
    var found = 0;
    (function solve() {
      if (found >= limit) return;
      var cell = findBestCell(work);
      if (cell.idx === -1) { found++; return; }
      if (cell.count === 0) return;
      for (var v = 1; v <= 9 && found < limit; v++) {
        if (!(cell.mask & (1 << v))) continue;
        work[cell.idx] = v;
        solve();
        work[cell.idx] = 0;
      }
    })();
    return found;
  }

  /* ---------- حل کامل جدول (اولین جواب) ---------- */
  function solve(grid) {
    var work = grid.slice();
    var ok = (function rec() {
      var cell = findBestCell(work);
      if (cell.idx === -1) return true;
      if (cell.count === 0) return false;
      for (var v = 1; v <= 9; v++) {
        if (!(cell.mask & (1 << v))) continue;
        work[cell.idx] = v;
        if (rec()) return true;
        work[cell.idx] = 0;
      }
      return false;
    })();
    return ok ? work : null;
  }

  /* ---------- تولید جدول کامل و معتبر ---------- */
  function fullSolution(rng) {
    var grid = new Array(81).fill(0);
    var order = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    (function fill(pos) {
      if (pos === 81) return true;
      var nums = shuffle(order.slice(), rng);
      for (var k = 0; k < 9; k++) {
        var v = nums[k];
        if (canPlace(grid, pos, v)) {
          grid[pos] = v;
          if (fill(pos + 1)) return true;
          grid[pos] = 0;
        }
      }
      return false;
    })(0);
    return grid;
  }

  /* ---------- تعداد سرنخ هدف برای هر سختی ---------- */
  var LEVELS = {
    easy:       { key: 'easy',       label: 'آسان',     clues: 44, minClues: 40 },
    medium:     { key: 'medium',     label: 'متوسط',    clues: 35, minClues: 32 },
    hard:       { key: 'hard',       label: 'سخت',      clues: 29, minClues: 26 },
    expert:     { key: 'expert',     label: 'حرفه‌ای',  clues: 25, minClues: 22 }
  };

  /* ---------- تولید معما با تضمین جواب یکتا ---------- */
  function generate(options) {
    options = options || {};
    var seed = (options.seed === undefined || options.seed === null)
      ? ((Date.now() ^ Math.floor(Math.random() * 2147483647)) >>> 0)
      : (options.seed >>> 0);
    var levelKey = LEVELS[options.difficulty] ? options.difficulty : 'medium';
    var lv = LEVELS[levelKey];
    var rng = makeRng(seed);

    var solution = fullSolution(rng);
    var puzzle = solution.slice();

    // ترتیب حذف تصادفی خانه‌ها
    var order = [];
    for (var i = 0; i < 81; i++) order.push(i);
    shuffle(order, rng);

    var clues = 81;
    for (var k = 0; k < order.length; k++) {
      if (clues <= lv.clues) break;
      var idx = order[k];
      var backup = puzzle[idx];
      if (backup === 0) continue;
      puzzle[idx] = 0;
      // بررسی یکتایی جواب
      if (countSolutions(puzzle, 2) !== 1) {
        puzzle[idx] = backup;   // بازگرداندن سرنخ
      } else {
        clues--;
      }
    }

    return {
      seed: seed,
      difficulty: levelKey,
      label: lv.label,
      puzzle: puzzle,
      solution: solution,
      clues: clues,
      givens: puzzle.map(function (v) { return v !== 0; })
    };
  }

  /* ---------- اعتبارسنجی ---------- */
  function isValidSolution(grid) {
    if (!grid || grid.length !== 81) return false;
    for (var i = 0; i < 81; i++) {
      var v = grid[i];
      if (!(v >= 1 && v <= 9)) return false;
      for (var j = i + 1; j < 81; j++) {
        var w = grid[j];
        if (w !== v) continue;
        if (rowOf(i) === rowOf(j)) return false;
        if (colOf(i) === colOf(j)) return false;
        if (boxOf(i) === boxOf(j)) return false;
      }
    }
    return true;
  }

  /* ---------- شمارش خانه‌های درست (برای امتیازدهی آنلاین سمت سرور) ---------- */
  function countCorrect(board, solution) {
    var n = 0;
    for (var i = 0; i < 81; i++) if (board && board[i] && board[i] === solution[i]) n++;
    return n;
  }

  /* ---------- تناقض‌های فعلی جدول (برای راهنمای سخت) ---------- */
  function findConflicts(board) {
    var bad = {};
    for (var i = 0; i < 81; i++) {
      var v = board[i];
      if (!v) continue;
      for (var j = 0; j < 81; j++) {
        if (i === j || !board[j] || board[j] !== v) continue;
        if (rowOf(i) === rowOf(j) || colOf(i) === colOf(j) || boxOf(i) === boxOf(j)) { bad[i] = 1; bad[j] = 1; }
      }
    }
    return bad;
  }

  return {
    makeRng: makeRng,
    rowOf: rowOf, colOf: colOf, boxOf: boxOf,
    canPlace: canPlace,
    isLegal: isLegal,
    solve: solve,
    countSolutions: countSolutions,
    generate: generate,
    isValidSolution: isValidSolution,
    countCorrect: countCorrect,
    findConflicts: findConflicts,
    LEVELS: LEVELS
  };
})();

/* =====================================================================
   SUDOKU FOX 2027 — کلاینت بازی
   منطق بازی از UI جدا است (SudokuCore موتور) و این لایه فقط نمایش/تعامل
   بدون بک‌تیک، بک‌اسلش یا dollar{ (داخل تمپلیت HTML تزریق می‌شود)
   ===================================================================== */
(function () {
  'use strict';
  var view = document.getElementById('viewSudoku');
  if (!view) return;

  var $ = function (id) { return document.getElementById(id); };
  var boardEl = $('sdBoard');
  if (!boardEl) return;

  /* ---------- ثابت‌ها ---------- */
  var SAVE_KEY = 'fox_sudoku_save_v1';
  var REC_KEY = 'fox_sudoku_records_v1';
  var SOUND_KEY = 'fox_sudoku_sound_v1';
  var ONLINE_SECONDS = 300;          // زمان محدود حالت آنلاین: ۵ دقیقه
  var HINT_PENALTY = 25;
  var FA = '۰۱۲۳۴۵۶۷۸۹';

  /* ---------- وضعیت ---------- */
  var S = {
    mode: 'single',        // single | online
    difficulty: 'medium',
    puzzle: null,          // سرنخ‌های اولیه (۰ = خالی)
    solution: null,
    board: null,           // وضعیت فعلی
    givens: null,
    notes: null,           // آرایهٔ ۸۱ عضوی از Set نبود → آرایهٔ آرایه‌ها
    selected: -1,
    noteMode: false,
    errors: 0,
    hints: 0,
    startAt: 0,
    elapsed: 0,
    timerId: null,
    undo: [],
    redo: [],
    finished: false,
    started: false,
    // آنلاین
    room: '', seat: -1, partner: '',
    limit: 0, deadline: 0, pollId: null, syncId: null, oppDone: false, myDone: false
  };

  var lastUsers = (typeof window !== 'undefined' && window.__lastUsersRef) ? window.__lastUsersRef : null;

  /* ---------- صدا (WebAudio، کوتاه و ظریف) ---------- */
  var AC = null, soundOn = localStorage.getItem(SOUND_KEY) !== '0';
  function ac() {
    try {
      if (!AC) {
        var C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        AC = new C();
      }
      if (AC.state === 'suspended') AC.resume();
      return AC;
    } catch (e) { return null; }
  }
  function tone(freq, dur, vol, type) {
    if (!soundOn) return;
    var a = ac(); if (!a) return;
    try {
      var o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, a.currentTime);
      g.gain.setValueAtTime(0.0001, a.currentTime);
      g.gain.exponentialRampToValueAtTime(vol || 0.05, a.currentTime + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
      o.connect(g); g.connect(a.destination);
      o.start(); o.stop(a.currentTime + dur + 0.02);
    } catch (e) {}
  }
  var SND = {
    pick:  function () { tone(660, 0.055, 0.028, 'triangle'); },
    place: function () { tone(880, 0.075, 0.036, 'sine'); setTimeout(function () { tone(1180, 0.06, 0.022, 'sine'); }, 45); },
    wrong: function () { tone(190, 0.16, 0.05, 'sawtooth'); },
    erase: function () { tone(360, 0.06, 0.022, 'triangle'); },
    note:  function () { tone(520, 0.04, 0.018, 'sine'); },
    win:   function () { [660, 880, 1050, 1320].forEach(function (f, i) { setTimeout(function () { tone(f, 0.2, 0.04, 'sine'); }, i * 90); }); },
    lose:  function () { [420, 330, 250].forEach(function (f, i) { setTimeout(function () { tone(f, 0.22, 0.04, 'triangle'); }, i * 120); }); }
  };
  function updateSoundBtn() {
    var b = $('sdSound'); if (!b) return;
    b.classList.toggle('on', soundOn);
    var ic = $('sdSoundIcon');
    if (ic) ic.innerHTML = soundOn
      ? '<path d="M4.5 10v4h3l4 3.5v-11L7.5 10h-3Z" fill="currentColor"/><path d="M15 9a4.4 4.4 0 0 1 0 6M17.6 6.4a8 8 0 0 1 0 11.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>'
      : '<path d="M4.5 10v4h3l4 3.5v-11L7.5 10h-3Z" fill="currentColor"/><path d="m16 9.5 4 5m0-5-4 5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>';
    b.setAttribute('aria-label', soundOn ? 'صدا روشن' : 'صدا خاموش');
  }

  /* ---------- ابزار ---------- */
  function fa(n) { return String(n).replace(/[0-9]/g, function (d) { return FA[+d]; }); }
  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function myPhone() {
    try {
      var u = window.currentUser || JSON.parse(localStorage.getItem('fox_user') || 'null');
      return (u && u.phone) ? String(u.phone) : '';
    } catch (e) { return ''; }
  }
  function myName() {
    try {
      var u = window.currentUser || JSON.parse(localStorage.getItem('fox_user') || 'null');
      return (u && u.name) ? String(u.name).slice(0, 20) : 'بازیکن';
    } catch (e) { return 'بازیکن'; }
  }
  function apiGet(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) { return r.json(); });
  }
  function apiPost(url, body) {
    return fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {}) })
      .then(function (r) { return r.json(); });
  }

  /* ---------- ساخت DOM جدول و صفحه‌کلید ---------- */
  var cells = [];
  function buildBoard() {
    boardEl.innerHTML = '';
    cells = [];
    // دقیقاً ۸۱ عنصر مستقل (۹×۹) — خانهٔ خالی هم عنصر خودش را دارد؛ حذف/ادغام هرگز
    for (var i = 0; i < 81; i++) {
      var __r = SudokuCore.rowOf(i), __c = SudokuCore.colOf(i);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sd-cell sudoku-cell' + ((__c === 2 || __c === 5) ? ' br' : '') + ((__r === 2 || __r === 5) ? ' bl' : '');
      b.setAttribute('data-idx', i);
      b.setAttribute('data-r', __r);
      b.setAttribute('data-c', __c);
      b.setAttribute('role', 'gridcell');
      b.style.gridRow = String(__r + 1);
      b.style.gridColumn = String(__c + 1);
      boardEl.appendChild(b);
      cells.push(b);
    }
    fitBoard();
  }
  // مربع بودن جدول تضمینی: حتی روی مرورگرهای قدیمی بدون aspect-ratio
  function fitBoard() {
    if (!boardEl) return;
    boardEl.style.height = '';
    boardEl.style.width = '';
    var w = boardEl.offsetWidth;
    if (w > 0) {
      // عرض داخلی را به مضرب ۹ snap می‌کنیم تا هر ۹ ترک دقیقاً هم‌پیکسل شوند
      var inner = w - 5; // ۲.۵px کادر در هر سمت
      if (inner > 90) {
        var snap = inner - (inner % 9) + 5;
        boardEl.style.width = snap + 'px';
        boardEl.style.height = snap + 'px';
      } else {
        boardEl.style.height = w + 'px';
      }
    }
  }
  window.addEventListener('resize', fitBoard);
  window.addEventListener('orientationchange', function () { setTimeout(fitBoard, 220); });
  var numsWrap = $('sdNums'), numBtns = [], built = false;
  function ensureBuilt() {
    if (built) { return; }
    buildBoard();
    buildPad();
    built = true;
  }
  function buildPad() {
    numsWrap.innerHTML = ''; numBtns = [];
    for (var v = 1; v <= 9; v++) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sd-num';
      b.innerHTML = '<span>' + fa(v) + '</span><span class="cnt" data-c="' + v + '"></span>';
      b.setAttribute('data-v', v);
      b.setAttribute('aria-label', 'عدد ' + fa(v));
      numsWrap.appendChild(b); numBtns.push(b);
    }
    var er = document.createElement('button');
    er.type = 'button'; er.className = 'sd-num erase';
    er.setAttribute('data-v', '0');
    er.setAttribute('aria-label', 'پاک‌کردن خانه');
    er.innerHTML = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none"><path d="M4 15.5 11.6 8a2 2 0 0 1 2.8 0l4.6 4.6a2 2 0 0 1 0 2.8l-3.6 3.6H6.4L4 16.9a1 1 0 0 1 0-1.4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m9.6 12.4 5.2 5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    numsWrap.appendChild(er); numBtns.push(er);
  }

  /* ---------- رندر ---------- */
  function countNumber(v) {
    var n = 0;
    for (var i = 0; i < 81; i++) if (S.board[i] === v) n++;
    return n;
  }
  function renderNumbers() {
    for (var k = 1; k <= 9; k++) {
      var b = numBtns[k - 1]; if (!b || k > 9) continue;
      var c = countNumber(k);
      b.classList.toggle('done', c >= 9);
      var el = b.querySelector('.cnt');
      if (el) el.textContent = c >= 9 ? '✓' : (c > 0 ? fa(9 - c) : '');
    }
  }
  function renderBoard() {
    if (!S.board) return;
    var sel = S.selected;
    var selVal = sel >= 0 ? S.board[sel] : 0;
    var conflict = SudokuCore.findConflicts(S.board);
    var selR = sel >= 0 ? SudokuCore.rowOf(sel) : -1;
    var selC = sel >= 0 ? SudokuCore.colOf(sel) : -1;
    var selB = sel >= 0 ? SudokuCore.boxOf(sel) : -1;

    for (var i = 0; i < 81; i++) {
      var el = cells[i], v = S.board[i], given = S.givens[i];
      var cls = 'sd-cell sudoku-cell';
      var r = SudokuCore.rowOf(i), c = SudokuCore.colOf(i);
      if (c === 2 || c === 5) cls += ' br';
      if (r === 2 || r === 5) cls += ' bl';
      if (given) cls += ' given'; else if (v) cls += ' mine';
      // هایلایت مستقل: ردیف/ستون/بلوک خانهٔ انتخابی + خانه‌های هم‌عدد، هر دو هم‌زمان
      var inUnit = sel >= 0 && i !== sel && (r === selR || c === selC || SudokuCore.boxOf(i) === selB);
      var sameVal = !!(v && selVal && v === selVal && i !== sel);
      if (inUnit) cls += ' peer';
      if (sameVal) cls += ' samenum';
      if (i === sel) cls += ' sel';
      // خطا فقط طبق قوانین سودوکو (تکرار در ردیف/ستون/بلوک)
      if (!given && v && conflict[i]) cls += ' wrong';
      else if (!given && v && !conflict[i] && v !== S.solution[i]) cls += ' off';
      el.className = cls;

      if (!given && v === 0 && S.notes[i] && S.notes[i].length) {
        var h = '';
        for (var n = 1; n <= 9; n++) {
          var on = S.notes[i].indexOf(n) >= 0;
          h += '<i class="' + (on ? 'hl' : '') + '">' + (on ? fa(n) : '') + '</i>';
        }
        el.innerHTML = '<span class="sd-notes">' + h + '</span>';
      } else {
        el.textContent = v ? fa(v) : '';
      }
      el.setAttribute('aria-label', 'خانه ' + fa(r + 1) + '-' + fa(c + 1) + (v ? '، ' + fa(v) : '، خالی'));
    }
    renderNumbers();
  }

  /* ---------- تایمر ---------- */
  function stopTimer() { if (S.timerId) { clearInterval(S.timerId); S.timerId = null; } }
  function startTimer() {
    stopTimer();
    S.timerId = setInterval(function () {
      if (S.finished || !S.started) return;
      if (S.mode === 'online') {
        if (!S.room || !S.deadline) { return; }   // هنوز حریف پیدا نشده
        var left = Math.max(0, Math.round((S.deadline - Date.now()) / 1000));
        var tEl = $('sdTimer'); if (tEl) tEl.textContent = fa(fmtTime(left));
        var chip = $('sdChipTimer'); if (chip) chip.classList.toggle('danger', left <= 30);
        if (left <= 0) { onlineTimeUp(); }
        return;
      }
      S.elapsed = Math.round((Date.now() - S.startAt) / 1000);
      var e = $('sdTimer'); if (e) e.textContent = fa(fmtTime(S.elapsed));
    }, 250);
  }

  /* ---------- ذخیره/بازیابی ---------- */
  function save() {
    if (S.mode === 'online') return;   // بازی آنلاین وضعیت سرور دارد
    if (!S.started) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        mode: 'single',
        difficulty: S.difficulty, puzzle: S.puzzle, solution: S.solution,
        board: S.board, givens: S.givens, notes: S.notes,
        errors: S.errors, hints: S.hints, elapsed: S.elapsed,
        startAt: Date.now() - S.elapsed * 1000, finished: S.finished, ts: Date.now()
      }));
    } catch (e) {}
  }
  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
  function loadSave() {
    try {
      var raw = localStorage.getItem(SAVE_KEY); if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || !d.puzzle || !d.board) return null;
      if (d.finished) return null;
      if (Date.now() - (d.ts || 0) > 7 * 24 * 3600 * 1000) return null;
      return d;
    } catch (e) { return null; }
  }

  /* ---------- رکوردها ---------- */
  function levelScoreBase(d) {
    return { easy: 700, medium: 1100, hard: 1600, expert: 2200 }[d] || 1100;
  }
  function computeScore() {
    var base = levelScoreBase(S.difficulty);
    var timePen = Math.floor(S.elapsed / 6);          // هر ۶ ثانیه یک امتیاز
    var errPen = S.errors * 45;
    var hintPen = S.hints * HINT_PENALTY;
    var bonus = S.mode === 'online' ? 250 : 0;
    return Math.max(60, base - timePen - errPen - hintPen + bonus);
  }
  function getRecords() {
    try { return JSON.parse(localStorage.getItem(REC_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function bestOf(diff, kind) {
    var rec = getRecords()[diff];
    return rec ? rec[kind] : null;
  }
  function updateRecord() {
    var recs = getRecords();
    var cur = recs[S.difficulty] || { bestScore: 0, bestTime: null, wins: 0 };
    var score = computeScore();
    cur.wins = (cur.wins || 0) + 1;
    if (score > (cur.bestScore || 0)) cur.bestScore = score;
    if (S.mode !== 'online' && (cur.bestTime === null || cur.bestTime === undefined || S.elapsed < cur.bestTime)) cur.bestTime = S.elapsed;
    recs[S.difficulty] = cur;
    try { localStorage.setItem(REC_KEY, JSON.stringify(recs)); } catch (e) {}
    return { cur: cur, isBestScore: score >= (cur.bestScore || 0), isBestTime: S.mode !== 'online' && cur.bestTime === S.elapsed };
  }

  /* ---------- تعامل با خانه‌ها ---------- */
  function selectCell(i) {
    S.selected = i;
    SND.pick();
    renderBoard();
  }
  function realIndexFromEvent(e) {
    var el = e.target.closest ? e.target.closest('.sd-cell') : null;
    if (!el) return -1;
    var idx = parseInt(el.getAttribute('data-idx'), 10);
    return isNaN(idx) ? -1 : idx;
  }
  boardEl.addEventListener('click', function (e) {
    var i = realIndexFromEvent(e);
    if (i < 0) return;
    if (S.finished) return;
    if (S.mode === 'online' && S.myDone) return;
    selectCell(i);
  });
  boardEl.addEventListener('touchstart', function (e) {
    var i = realIndexFromEvent(e);
    if (i >= 0) { S.selected = i; renderBoard(); }
  }, { passive: true });

  /* ---------- اقدام‌ها (با Undo/Redo) ---------- */
  function pushUndo() {
    S.undo.push({ board: S.board.slice(), notes: S.notes.map(function (a) { return a.slice(); }), errors: S.errors });
    if (S.undo.length > 80) S.undo.shift();
    S.redo.length = 0;
  }
  function placeNumber(v) {
    if (S.finished || !S.started) return;
    var i = S.selected;
    if (i < 0) { flashHint('اول یک خانه را انتخاب کن'); return; }
    if (S.givens[i]) return;
    if (S.mode === 'online' && S.myDone) return;

    if (S.noteMode) {
      pushUndo();
      if (S.board[i]) { S.board[i] = 0; }   // یادداشت جای عدد می‌نشیند
      var arr = S.notes[i].slice();
      var p = arr.indexOf(v);
      if (p >= 0) arr.splice(p, 1); else arr.push(v);
      S.notes[i] = arr;
      SND.note(); renderBoard(); save();
      return;
    }

    // غیرمجاز فقط اگر در ردیف/ستون/بلوک تکرار شود — نه با مقایسهٔ کل جدول
    if (!SudokuCore.isLegal(S.board, i, v)) {
      S.errors++;
      SND.wrong();
      pulseChip('sdChipErr');
      var ec = $('sdErrors'); if (ec) ec.textContent = fa(S.errors);
      flashHint(unitReason(i, v));
      var badEl = cells[i];
      if (badEl) { badEl.classList.remove('wrong'); void badEl.offsetWidth; badEl.classList.add('wrong'); }
      checkTimeoutPenalty();
      renderBoard();
      return;
    }
    pushUndo();
    S.board[i] = v;
    S.notes[i] = [];
    var srcEl = cells[i];
    SND.place();
    if (v === S.solution[i]) {
      srcEl.classList.remove('ok'); void srcEl.offsetWidth; srcEl.classList.add('ok');
      flashUnits(i);
    }
    S.selected = i;
    renderBoard();
    save();
    onlineMove(i, v);
    if (isComplete()) return;
    autoClearNotes(i, v);
  }

  /* ---------- پیام دلیل غیرمجاز بودن ---------- */
  function unitReason(i, v) {
    var r = SudokuCore.rowOf(i), c = SudokuCore.colOf(i), b = SudokuCore.boxOf(i);
    for (var k = 0; k < 9; k++) {
      if (r * 9 + k !== i && S.board[r * 9 + k] === v) return 'عدد ' + fa(v) + ' قبلاً در این ردیف هست';
      if (k * 9 + c !== i && S.board[k * 9 + c] === v) return 'عدد ' + fa(v) + ' قبلاً در این ستون هست';
    }
    var br = (b / 3 | 0) * 3, bc = (b % 3) * 3;
    for (var rr = 0; rr < 3; rr++) for (var cc = 0; cc < 3; cc++) {
      var bi = (br + rr) * 9 + (bc + cc);
      if (bi !== i && S.board[bi] === v) return 'عدد ' + fa(v) + ' قبلاً در این بلوک هست';
    }
    return 'این عدد اینجا مجاز نیست';
  }
  function autoClearNotes(idx, v) {
    // حذف یادداشت همان عدد در هم‌ردیف/ستون/بلوک
    var r = SudokuCore.rowOf(idx), c = SudokuCore.colOf(idx), b = SudokuCore.boxOf(idx);
    for (var i = 0; i < 81; i++) {
      if (i === idx) continue;
      if (SudokuCore.rowOf(i) === r || SudokuCore.colOf(i) === c || SudokuCore.boxOf(i) === b) {
        var p = S.notes[i].indexOf(v);
        if (p >= 0) { S.notes[i].splice(p, 1); }
      }
    }
  }
  function flashUnits(idx) {
    var r = SudokuCore.rowOf(idx), c = SudokuCore.colOf(idx), b = SudokuCore.boxOf(idx);
    var group = [];
    for (var i = 0; i < 81; i++) {
      if (SudokuCore.rowOf(i) === r || SudokuCore.colOf(i) === c || SudokuCore.boxOf(i) === b) group.push(i);
    }
    // اگر کل ردیف/ستون/بلوک پر و درست بود، جرقه بزن
    [['row', r], ['col', c], ['box', b]].forEach(function (pair) {
      var kind = pair[0], n = pair[1], full = true, idc = [];
      for (var i = 0; i < 81; i++) {
        var same = (kind === 'row' ? SudokuCore.rowOf(i) === n : kind === 'col' ? SudokuCore.colOf(i) === n : SudokuCore.boxOf(i) === n);
        if (!same) continue;
        idc.push(i);
        if (S.board[i] !== S.solution[i]) full = false;
      }
      if (full) {
        idc.forEach(function (k) { var el = cells[k]; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); });
        tone(1320, 0.12, 0.03, 'sine');
      }
    });
  }
  function erase() {
    if (S.finished || !S.started) return;
    var i = S.selected;
    if (i < 0 || S.givens[i]) return;
    if (S.mode === 'online' && S.myDone) return;
    pushUndo();
    if (S.board[i] !== 0 || (S.notes[i] && S.notes[i].length)) {
      S.board[i] = 0; S.notes[i] = [];
      SND.erase(); renderBoard(); save();
      onlineMove(i, 0);
    }
  }
  function undo() {
    if (S.finished) return;
    if (S.mode === 'online') {
      // سرور مرجع است: آخرین حرکت خودم را برمی‌گرداند
      apiPost('/api/sudoku/undo', { room: S.room, phone: myPhone() }).then(function (r) {
        if (r && r.state && r.state.me && r.state.me.board) {
          S.board = r.state.me.board.slice();
          renderBoard();
        }
      }).catch(function () {});
      return;
    }
    if (!S.undo.length) return;
    var st = S.undo.pop();
    S.redo.push({ board: S.board.slice(), notes: S.notes.map(function (a) { return a.slice(); }), errors: S.errors });
    S.board = st.board; S.notes = st.notes; S.errors = st.errors;
    var e2 = $('sdErrors'); if (e2) e2.textContent = fa(S.errors);
    SND.erase(); renderBoard(); save();
  }
  function redo() {
    if (S.finished) return;
    if (S.mode === 'online') return;   // در آنلاین، سرور مرجع است و redo معنای مستقل ندارد
    if (!S.redo.length) return;
    var st = S.redo.pop();
    S.undo.push({ board: S.board.slice(), notes: S.notes.map(function (a) { return a.slice(); }), errors: S.errors });
    S.board = st.board; S.notes = st.notes; S.errors = st.errors;
    var e2 = $('sdErrors'); if (e2) e2.textContent = fa(S.errors);
    SND.place(); renderBoard(); save();
  }
  function hint() {
    if (S.finished || !S.started) return;
    if (S.mode === 'online') { flashHint('راهنما در حالت آنلاین غیرفعال است'); return; }
    var i = S.selected;
    if (i < 0 || S.givens[i] || S.board[i] === S.solution[i]) {
      // یک خانهٔ خالی تصادفی انتخاب کن
      var empt = [];
      for (var k = 0; k < 81; k++) if (!S.givens[k] && S.board[k] !== S.solution[k]) empt.push(k);
      if (!empt.length) return;
      i = empt[Math.floor(Math.random() * empt.length)];
    }
    pushUndo();
    S.board[i] = S.solution[i];
    S.notes[i] = [];
    autoClearNotes(i, S.board[i]);
    S.hints++;
    S.selected = i;
    SND.place();
    renderBoard(); save();
    flashUnits(i);
    if (isComplete()) return;
  }
  function flashHint(msg) {
    var sub = $('sdSub');
    if (!sub) return;
    var old = sub.innerHTML;
    sub.innerHTML = '<span style="color:#ffd06a">' + msg + '</span>';
    setTimeout(function () { if (sub.innerHTML.indexOf('ffd06a') >= 0) sub.innerHTML = old; }, 1600);
  }
  function pulseChip(id) {
    var c = $(id); if (!c) return;
    c.classList.remove('pulse'); void c.offsetWidth; c.classList.add('pulse');
  }
  function checkTimeoutPenalty() {
    if (S.mode !== 'online') return;
    if (S.errors > 0 && S.errors % 3 === 0) {
      S.deadline -= 15000;      // هر ۳ خطا ۱۵ ثانیه از زمان کم می‌شود
      flashHint('هر ۳ خطا ۱۵ ثانیه از زمان کم می‌شود');
    }
  }

  /* ---------- پایان بازی ---------- */
  // برنده فقط وقتی که کل جدول پر و طبق قوانین معتبر و برابر راه‌حل یکتا باشد
  function isComplete() {
    if (!S.board || S.board.length !== 81) return false;
    for (var i = 0; i < 81; i++) if (!(S.board[i] >= 1 && S.board[i] <= 9)) return false;
    if (!SudokuCore.isValidSolution(S.board)) return false;
    for (var j = 0; j < 81; j++) if (S.board[j] !== S.solution[j]) return false;
    finishWin();
    return true;
  }
  function finishWin() {
    if (S.finished) return;
    S.finished = true;
    stopTimer();
    SND.win();
    try {
      if (window.FoxGameRewardService) {
        FoxGameRewardService.claimReward({ gameCode: 'sudoku', mode: 'solo', result: 'board_complete' });
      }
    } catch(e) {}
    if (S.mode !== 'online') {
      S.elapsed = Math.round((Date.now() - S.startAt) / 1000);
      var rec = updateRecord();
      showResult(rec);
      clearSave();
    } else {
      // آنلاین: آخرین حرکت قبلاً به سرور فرستاده شده؛ سرور برد را تأیید می‌کند
      S.myDone = true;
      stopTimer();
      var sub = $('sdSub');
      if (sub) sub.innerHTML = '<span style="color:#8ce6a8">جدول کامل شد! در انتظار تأیید سرور…</span>';
      pollOnline();
    }
  }
  function onlineTimeUp() {
    if (S.mode !== 'online' || !S.room) { stopTimer(); return; }
    stopTimer();
    var sub = $('sdSub');
    if (sub) sub.innerHTML = '<span style="color:#ff9c9c">زمان تمام شد! در انتظار نتیجهٔ سرور…</span>';
    // سرور برندهٔ پایان زمان را تعیین می‌کند
    pollOnline();
  }
  var medal = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" style="vertical-align:-2px;margin-inline-end:5px"><circle cx="12" cy="14.4" r="5.1" stroke="currentColor" stroke-width="1.9"/><path d="M8.6 9.6 5.4 3.6h4.2l2.4 4.6 2.4-4.6h4.2l-3.2 6" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>', trophy = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" style="vertical-align:-2px;margin-inline-end:5px"><path d="M7 4h10v4.2a5 5 0 0 1-10 0V4Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M7 5.2H4.6v1.6A3.6 3.6 0 0 0 8 10.6M17 5.2h2.4v1.6a3.6 3.6 0 0 1-3.4 3.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M12 13.4V17m-3.4 3h6.8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>', star = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" style="vertical-align:-2px;margin-inline-end:5px"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8L12 3.6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  function showResult(rec) {
    var ov = $('sdResultOv');
    var score = computeScore();
    $('sdResTime').textContent = fa(fmtTime(S.elapsed));
    $('sdResScore').textContent = fa(score);
    $('sdResErr').textContent = fa(S.errors);
    $('sdResHint').textContent = fa(S.hints);
    var rank = medal + 'پیروزی', ttl = 'آفرین! جدول کامل شد';
    var perfect = S.errors === 0 && S.hints === 0;
    if (perfect) { rank = trophy + 'برد بی‌نقص'; ttl = 'بی‌نقص! بدون خطا و راهنما'; }
    else if (S.errors === 0) { rank = medal + 'برد درخشان'; }
    else if (S.errors <= 3) { rank = star + 'برد خوب'; }
    $('sdRank').textContent = rank;
    $('sdResultTitle').textContent = ttl;
    $('sdResultSub').textContent = 'سختی ' + SudokuCore.LEVELS[S.difficulty].label + ' · ' + fa(S.difficulty === 'expert' ? 25 : 0) + ' ' + 'خانه خالی پر شد';
    var best = $('sdResBest');
    var bs = rec && rec.cur ? rec.cur.bestScore : 0;
    var bt = rec && rec.cur ? rec.cur.bestTime : null;
    best.className = 'sd-best' + ((rec && rec.isBestScore) ? '' : ' none');
    best.innerHTML = (rec && rec.isBestScore ? star + 'رکورد جدید امتیاز! ' : 'بهترین امتیاز: ') + fa(bs) +
      (bt !== null && bt !== undefined ? ' · بهترین زمان: ' + fa(fmtTime(bt)) : '');
    ov.classList.add('show');
    confetti(26);
  }
  function confetti(n) {
    var c = $('sdConfetti'); if (!c) return;
    c.innerHTML = '';
    var colors = ['#ffb457', '#ff7a2e', '#8ce6a8', '#7fd8ff', '#ffd06a', '#ff9c9c'];
    for (var i = 0; i < n; i++) {
      var s = document.createElement('i');
      s.style.left = Math.round(Math.random() * 96) + '%';
      s.style.background = colors[i % colors.length];
      s.style.animationDelay = (Math.random() * 1.6).toFixed(2) + 's';
      s.style.animationDuration = (2.3 + Math.random() * 1.6).toFixed(2) + 's';
      s.style.transform = 'rotate(' + Math.round(Math.random() * 360) + 'deg)';
      c.appendChild(s);
    }
    setTimeout(function () { if (c) c.innerHTML = ''; }, 5200);
  }

  /* ---------- شروع بازی ---------- */
  function showSplash(txt) {
    var sp = $('sdSplash'); if (!sp) return;
    $('sdSplashText').textContent = txt || 'در حال ساخت جدول معتبر…';
    sp.classList.add('show');
  }
  function hideSplash() { var sp = $('sdSplash'); if (sp) sp.classList.remove('show'); }

  function newGame(diff, mode, opts) {
    opts = opts || {};
    S.difficulty = SudokuCore.LEVELS[diff] ? diff : 'medium';
    S.mode = mode || 'single';
    S.finished = false; S.started = false;
    S.errors = 0; S.hints = 0; S.undo = []; S.redo = [];
    S.selected = -1; S.noteMode = false; S.oppDone = false; S.myDone = false;
    setTab(false);
    showSplash('در حال ساخت جدول معتبر…');
    setTimeout(function () {
      var gen = SudokuCore.generate({ difficulty: S.difficulty, seed: opts.seed });
      S.puzzle = gen.puzzle; S.solution = gen.solution;
      S.board = gen.puzzle.slice();
      S.givens = gen.givens.slice();
      S.notes = [];
      for (var i = 0; i < 81; i++) S.notes.push([]);
      S.elapsed = 0; S.startAt = Date.now();
      if (S.mode !== 'online' || (S.deadline && S.deadline > Date.now())) { S.started = true; }
      $('sdDiffLabel').textContent = '';
      var dl = document.createElement('span'); dl.textContent = gen.label; $('sdDiffLabel').textContent = gen.label;
      var e2 = $('sdErrors'); if (e2) e2.textContent = fa(0);
      $('sdTimer').textContent = fa(fmtTime(S.mode === 'online' ? ONLINE_SECONDS : 0));
      $('sdChipTimer').classList.remove('danger');
      updateSubByMode();
      hideSplash();
      renderBoard();
      if (S.mode !== 'online' || (S.deadline && S.deadline > Date.now())) { startTimer(); }
      save();
      if (S.mode === 'online') { startOnlineSync(); pollOnline(false); }
    }, 40);
  }
  function updateSubByMode() {
    var sub = $('sdSub');
    if (!sub) return;
    if (S.mode === 'online') {
      sub.innerHTML = '<span>رقابت آنلاین</span><span class="sd-dot"></span><span>' + (S.partner || 'حریف') + '</span><span class="sd-dot"></span><span>زمان محدود</span>';
    } else {
      sub.innerHTML = '<span>تک‌نفره</span><span class="sd-dot"></span><span>' + (SudokuCore.LEVELS[S.difficulty] ? SudokuCore.LEVELS[S.difficulty].label : '') + '</span>';
    }
  }
  function resumeGame(d) {
    S.mode = 'single';
    S.difficulty = d.difficulty;
    S.puzzle = d.puzzle; S.solution = d.solution;
    S.board = d.board; S.givens = d.givens;
    S.notes = d.notes || [];
    while (S.notes.length < 81) S.notes.push([]);
    S.errors = d.errors || 0; S.hints = d.hints || 0;
    S.elapsed = d.elapsed || 0;
    S.startAt = Date.now() - S.elapsed * 1000;
    S.finished = false; S.started = true; S.selected = -1; S.undo = []; S.redo = [];
    $('sdDiffLabel').textContent = SudokuCore.LEVELS[S.difficulty].label;
    $('sdErrors').textContent = fa(S.errors);
    $('sdTimer').textContent = fa(fmtTime(S.elapsed));
    updateSubByMode();
    goGame();
    renderBoard();
    startTimer();
  }

  /* ============================================================
     حالت آنلاین — زمان محدود ۵ دقیقه، برنده کسی که بیشتر پر کند
     ============================================================ */
  /* ---------- ارسال حرکت به سرور (مرجع) ---------- */
  function onlineMove(idx, val) {
    if (S.mode !== 'online' || !S.room || S.finished) return;
    S.seq = (S.seq || 0) + 1;
    apiPost('/api/sudoku/move', { room: S.room, phone: myPhone(), idx: idx, val: val, seq: S.seq })
      .then(applyServerState).catch(function () {});
  }
  function applyServerState(r) {
    if (!r || !r.state) return;
    var st = r.state;
    if (st.deadline) S.deadline = st.deadline;
    if (st.opp) { S.partner = st.opp.name || S.partner; S.oppDone = !!st.opp.done; updateOppChip(st); }
    if (st.over) { showOnlineResult(st); }
  }
  function updateOppChip(st) {
    var sub = $('sdSub');
    if (!sub || !st.opp) return;
    sub.innerHTML = '<span>رقابت آنلاین</span><span class="sd-dot"></span><span>' + (st.opp.name || S.partner) +
      '</span><span class="sd-dot"></span><span>حریف: ' + fa(st.opp.correct || 0) + ' درست</span>';
  }
  function startOnlineSync() {
    stopOnlineSync();
    S.pollId = setInterval(function () { pollOnline(); }, 1200);
    pollOnline();
  }
  function stopOnlineSync() { if (S.pollId) { clearInterval(S.pollId); S.pollId = null; } }
  function pollOnline() {
    if (S.mode !== 'online' || !S.room) return;
    apiGet('/api/sudoku/state?room=' + encodeURIComponent(S.room) + '&me=' + encodeURIComponent(myPhone()))
      .then(function (st) {
        if (!st || st.error) return;
        applyServerState({ state: st });
      }).catch(function () {});
  }
  function showOnlineResult(st) {
    var ov = $('sdVsOv');
    if (!ov) return;
    if (ov.classList.contains('show')) return;
    S.finished = true; S.myDone = true;
    stopTimer(); stopOnlineSync();
    var me = myPhone();
    var myCount = (st.me && st.me.correct) || 0;
    var oppName = (st.opp && st.opp.name) || S.partner || 'حریف';
    var oppCount = (st.opp && st.opp.correct) || 0;
    var timeUp = !!st.timeUp;
    var iWin = st.winner === me;
    var draw = st.draw || !st.winner;
    $('sdVsTitle').innerHTML = draw ? 'مساوی!' : (iWin ? star + 'بردی!' : 'باختی');
    $('sdVsSub').textContent = timeUp ? 'زمان ۵ دقیقه تمام شد' : 'یک بازیکن جدول را حل کرد';
    $('sdVsBoard').innerHTML =
      '<div class="pl' + (iWin ? ' win' : '') + '"><b>شما</b><span>' + fa(myCount) + '</span></div>' +
      '<div class="mid">در برابر</div>' +
      '<div class="pl' + (!iWin && !draw ? ' win' : '') + '"><b>' + oppName + '</b><span>' + fa(oppCount) + '</span></div>';
    $('sdVsStats').innerHTML =
      '<div class="sd-stat"><span>خانه‌های درست شما</span><b>' + fa(myCount) + '</b></div>' +
      '<div class="sd-stat"><span>خانه‌های درست حریف</span><b>' + fa(oppCount) + '</b></div>';
    ov.classList.add('show');
    if (iWin) {
      SND.win(); confetti(30);
      try {
        if (window.FoxGameRewardService) {
          FoxGameRewardService.claimReward({ gameCode: 'sudoku', mode: 'online', result: 'win' });
        }
      } catch(e) {}
    } else if (!draw) { SND.lose(); }
    // بستن مسابقه تا دوباره Active نشود
    apiPost('/api/sudoku/cancel', { phone: me }).catch(function () {});
  }

  /* ---------- جریان‌های UI ---------- */
  var modeGrid = $('sdModeGrid'), diffGrid = $('sdDiffGrid');
  var pick = { mode: 'single', diff: 'medium' };

  function modeCards() {
    return [
      { k: 'single', t: 'تک‌نفره', s: 'تمرین و شکستن رکورد شخصی' },
      { k: 'online', t: 'دونفره آنلاین', s: 'حریف واقعی · زمان محدود ۵ دقیقه' }
    ];
  }
  function renderPicker() {
    if (modeGrid) {
      modeGrid.innerHTML = modeCards().map(function (m) {
        return '<button class="sd-opt' + (pick.mode === m.k ? ' sel' : '') + '" data-mode="' + m.k + '">' +
          '<span class="ico"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8.4" r="3.3" stroke="currentColor" stroke-width="1.9"/><path d="M5.6 20c.6-3.7 3.1-5.6 6.4-5.6s5.8 1.9 6.4 5.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg></span>' +
          '<span class="tx"><b>' + m.t + '</b><small>' + m.s + '</small></span></button>';
      }).join('');
    }
    if (diffGrid) {
      diffGrid.innerHTML = Object.keys(SudokuCore.LEVELS).map(function (k) {
        var lv = SudokuCore.LEVELS[k];
        return '<button class="sd-opt' + (pick.diff === k ? ' sel' : '') + '" data-diff="' + k + '" style="padding:9px 10px">' +
          '<span class="tx"><b>' + lv.label + '</b><small>' + lv.clues + ' سرنخ</small></span></button>';
      }).join('');
    }
  }
  function bindPicker(root) {
    // واگذاری رویداد روی خودِ ظرف: با innerHTML دوباره‌ساخته‌شده هم زنده می‌ماند
    if (!root || root.__sdBound) return;
    root.__sdBound = true;
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mode],[data-diff]');
      if (!b || !root.contains(b)) return;
      var m = b.getAttribute('data-mode'), d = b.getAttribute('data-diff');
      if (m) pick.mode = m;
      if (d) pick.diff = d;
      SND.pick();
      renderPicker();
    });
  }

  function goGame() {
    var mb2 = $('sdMenuBtn'); if (mb2) mb2.style.display = '';
    var mp = $('sdMenuPane'), gp = $('sdGamePane');
    if (mp) mp.style.display = 'none';
    if (gp) gp.style.display = 'block';
    var body = $('sdBody'); if (body) body.scrollTop = 0;
    fitBoard(); setTimeout(fitBoard, 120);
  }
  function goMenu() {
    showSplash('در حال ساخت جدول معتبر…');  // فقط پوشش لحظه‌ای
    var mb = $('sdMenuBtn'); if (mb) mb.style.display = 'none';
    var mp = $('sdMenuPane'), gp = $('sdGamePane');
    if (gp) gp.style.display = 'none';
    if (mp) mp.style.display = 'block';
    var rv = $('sdResumeBtn');
    if (rv) rv.style.display = loadSave() ? 'block' : 'none';
    var body = $('sdBody'); if (body) body.scrollTop = 0;
    // منوی داخلی خودش کارت‌های حالت را نشان می‌دهد
    renderPicker();
    var dg = $('sdDiffGrid'), mg = $('sdModeGrid');
    if (dg) bindPicker(dg);
    if (mg) bindPicker(mg);
    hideSplash();
    $('sdTitle').textContent = 'سودوکوی روباه ۲۰۲۷';
    $('sdTimer').textContent = fa(fmtTime(0));
    $('sdErrors').textContent = '۰';
    $('sdDiffLabel').textContent = SudokuCore.LEVELS[pick.diff].label;
    $('sdChipTimer').classList.remove('danger');
    var sub = $('sdSub'); if (sub) sub.innerHTML = '<span>۹×۹ استاندارد · جواب یکتا</span>';
    stopTimer(); stopOnlineSync();
    S.started = false; S.mode = 'single'; S.room = '';
    if (S.mode === 'online') cancelQueue();
  }

  function enterView() {
    var all = ['viewHome', 'viewChat', 'viewDMList', 'viewDM', 'viewSettings', 'viewFun', 'viewDooz', 'viewTank', 'viewMemory', 'viewBow'];
    all.forEach(function (id) { var el = $(id); if (el) { el.classList.add('hidden'); el.style.display = 'none'; } });
    view.classList.remove('hidden'); view.style.display = 'flex';
    var nav = $('bottomNav'); if (nav) nav.classList.add('show');
    var app = $('sdApp'); if (app) app.classList.remove('is-closing');
    setTimeout(fitBoard, 30);
  }
  function exitView() {
    stopTimer(); stopOnlineSync(); cancelQueue();
    var app = $('sdApp');
    if (app) app.classList.add('is-closing');
    setTimeout(function () {
      view.classList.add('hidden'); view.style.display = 'none';
      if (app) app.classList.remove('is-closing');
      if (typeof window.goFun === 'function') { try { window.goFun(); } catch (e) {} }
      else { var f = $('viewFun'); if (f) { f.classList.remove('hidden'); f.style.display = 'flex'; } }
    }, 220);
  }

  /* ---------- صف آنلاین — وضعیت واحد، بازیابی خودکار، خطای واقعی ---------- */
  var queueId = null, joinBusy = false, queueGen = 0;
  function setQueueMsg(pos) {
    var txt = $('sdQueueText');
    if (txt) txt.textContent = 'در حال جستجوی حریف…' + (pos >= 0 ? ' (نفر ' + fa(pos + 1) + ' در صف)' : '');
  }
  function showQueueUI() {
    var bar = $('sdQueueBar'); if (bar) bar.style.display = 'flex';
    setQueueMsg(-1);
  }
  function hideQueueUI() { var bar = $('sdQueueBar'); if (bar) bar.style.display = 'none'; }
  function failQueueUI(msg) {
    joinBusy = false;
    if (queueId) { clearInterval(queueId); queueId = null; }
    var txt = $('sdQueueText');
    if (txt) txt.textContent = msg;
    setTimeout(function () { hideQueueUI(); goMenu(); }, 1800);
  }
  function startQueue() {
    if (queueId || joinBusy) return;   // جلوگیری از شروع دوبارهٔ صف
    showQueueUI();
    var me = myPhone();
    if (!me) { failQueueUI('برای بازی آنلاین ابتدا وارد حساب کاربری شو'); return; }
    var gen = ++queueGen;              // توکن همین سشن صف — هر لغو/شروع مجدد آن را باطل می‌کند
    joinBusy = true;
    var tries = 0;
    var joinOnce = function () {
      if (gen !== queueGen) return;    // صف لغو شده
      apiPost('/api/sudoku/join', { phone: me, name: myName(), difficulty: pick.diff })
        .then(function (r) {
          if (gen !== queueGen) return;
          joinBusy = false;
          if (r && r.room) { onMatched(r); return; }
          setQueueMsg(-1);
          if (queueId) clearInterval(queueId);
          queueId = setInterval(function () {
            if (gen !== queueGen) { clearInterval(queueId); queueId = null; return; }
            apiPost('/api/sudoku/wait', { phone: me }).then(function (w) {
              if (gen !== queueGen) return;
              if (w && w.room) { clearInterval(queueId); queueId = null; onMatched(w); }
              else if (w && w.pos !== undefined && w.pos >= 0) { setQueueMsg(w.pos); }
            }).catch(function () { /* خطای گذرای شبکه — جستجو ادامه دارد */ });
          }, 1400);
        })
        .catch(function () {
          if (gen !== queueGen) return;
          tries += 1;
          if (tries < 3) { setTimeout(joinOnce, 1300); }   // تلاش مجدد خودکار، بدون نمایش خطای دروغین
          else { failQueueUI('اتصال برقرار نشد؛ دوباره تلاش کنید'); }
        });
    };
    joinOnce();
  }
  function cancelQueue() {
    queueGen++;                        // همه‌ی کال‌بک‌های در پرواز باطل می‌شوند (بدون race)
    joinBusy = false;
    if (queueId) { clearInterval(queueId); queueId = null; }
    hideQueueUI();
    if (myPhone()) apiPost('/api/sudoku/cancel', { phone: myPhone() }).catch(function () {});
  }
  function onMatched(r) {
    if (queueId) { clearInterval(queueId); queueId = null; }
    if (S.mode === 'online' && S.room === r.room && !S.finished) return;  // رویداد تکراری
    S.mode = 'online';
    S.room = r.room; S.seat = r.seat; S.partner = r.partner || 'حریف';
    showQueueUI();
    var t = $('sdQueueText'); if (t) t.textContent = 'حریف پیدا شد: ' + S.partner + ' — اتصال…';
    SND.win();
    var qc = $('sdQueueCancel'); if (qc) qc.style.display = 'none';
    // جدول و وضعیت را از سرور (مرجع) بگیر تا هر دو بازیکن دقیقاً یک Board/Puzzle/State داشته باشند
    var grab = function (n) {
      apiGet('/api/sudoku/state?room=' + encodeURIComponent(r.room) + '&me=' + encodeURIComponent(myPhone()))
        .then(function (st) {
          if (st && !st.error) {
            hideQueueUI();
            if (qc) qc.style.display = '';
            buildOnlineFromState(st);
            return;
          }
          if (n < 2) { setTimeout(function () { grab(n + 1); }, 900); return; }
          failQueueUI('خطا در دریافت جدول؛ دوباره تلاش کنید');
        })
        .catch(function () {
          if (n < 2) { setTimeout(function () { grab(n + 1); }, 900); return; }
          failQueueUI('اتصال برقرار نشد؛ دوباره تلاش کنید');
        });
    };
    setTimeout(function () { grab(0); }, 400);
  }

  /* ---------- ساخت بازی آنلاین از وضعیت مرجع سرور ---------- */
  function buildOnlineFromState(st) {
    S.mode = 'online';
    S.difficulty = st.difficulty || S.difficulty;
    S.puzzle = st.puzzle.slice();
    S.solution = st.solution.slice();
    S.givens = st.givens.slice();
    S.board = (st.me && st.me.board && st.me.board.length === 81) ? st.me.board.slice() : st.puzzle.slice();
    S.notes = []; for (var i = 0; i < 81; i++) S.notes.push([]);
    S.errors = 0; S.hints = 0; S.undo = []; S.redo = []; S.seq = 0;
    S.selected = -1; S.noteMode = false; setTab(false);
    S.finished = false; S.myDone = false; S.oppDone = false;
    S.deadline = st.deadline || (Date.now() + ONLINE_SECONDS * 1000);
    S.started = true;
    $('sdDiffLabel').textContent = (SudokuCore.LEVELS[S.difficulty] || {}).label || '';
    $('sdErrors').textContent = fa(0);
    goGame();
    updateSubByMode();
    renderBoard();
    stopTimer(); startTimer();
    startOnlineSync();
  }

  /* ---------- ورودی فیزیکی کیبورد (دسکتاپ) ---------- */
  document.addEventListener('keydown', function (e) {
    if (view.classList.contains('hidden')) return;
    if (e.key >= '1' && e.key <= '9') { placeNumber(parseInt(e.key, 10)); }
    else if (e.key === 'Backspace' || e.key === 'Delete') { erase(); }
    else if (e.key === 'ArrowLeft') { move(-1, 0); }
    else if (e.key === 'ArrowRight') { move(1, 0); }
    else if (e.key === 'ArrowUp') { move(0, -1); }
    else if (e.key === 'ArrowDown') { move(0, 1); }
    else if (e.key === 'n' || e.key === 'N') { setTab(!S.noteMode); }
    else if (e.key === 'Escape') { if ($('sdModeOv').classList.contains('show')) $('sdModeOv').classList.remove('show'); }
  });
  function move(dx, dy) {
    if (S.finished) return;
    var i = S.selected < 0 ? 40 : S.selected;
    var r = Math.min(8, Math.max(0, SudokuCore.rowOf(i) + dy));
    var c = Math.min(8, Math.max(0, SudokuCore.colOf(i) + dx));
    S.selected = r * 9 + c;
    renderBoard();
  }

  /* ---------- اتصال دکمه‌ها ---------- */
  function setTab(note) {
    S.noteMode = !!note;
    var a = $('sdTabNum'), b = $('sdTabNote');
    if (a) a.classList.toggle('on', !S.noteMode);
    if (b) b.classList.toggle('on', S.noteMode);
  }
  $('sdTabNum').addEventListener('click', function () { setTab(false); SND.pick(); });
  $('sdTabNote').addEventListener('click', function () { setTab(true); SND.pick(); });
  numsWrap.addEventListener('click', function (e) {
    var b = e.target.closest('.sd-num'); if (!b) return;
    var v = parseInt(b.getAttribute('data-v'), 10);
    if (v === 0) { erase(); return; }
    placeNumber(v);
  });
  $('sdErase').addEventListener('click', function () { erase(); });
  $('sdUndo').addEventListener('click', function () { undo(); });
  $('sdRedo').addEventListener('click', function () { redo(); });
  $('sdHint').addEventListener('click', function () { hint(); });
  $('sdBack').addEventListener('click', function () {
    if (S.started && !S.finished && S.mode !== 'online') {
      save();
      exitView();
    } else { exitView(); }
  });
  $('sdSound').addEventListener('click', function () {
    soundOn = !soundOn;
    try { localStorage.setItem(SOUND_KEY, soundOn ? '1' : '0'); } catch (e) {}
    updateSoundBtn();
    if (soundOn) SND.pick();
  });
  $('sdQueueCancel').addEventListener('click', function () { cancelQueue(); goMenu(); });

  /* مودال انتخاب حالت (از صفحهٔ سرگرمی‌ها) */
  var modeList = $('sdModeList'), diffList = $('sdDiffList');
  function renderModalLists() {
    if (modeList) {
      modeList.innerHTML = modeCards().map(function (m) {
        return '<button class="sd-opt' + (pick.mode === m.k ? ' sel' : '') + '" data-mode="' + m.k + '">' +
          '<span class="ico"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8.4" r="3.3" stroke="currentColor" stroke-width="1.9"/><path d="M5.6 20c.6-3.7 3.1-5.6 6.4-5.6s5.8 1.9 6.4 5.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg></span>' +
          '<span class="tx"><b>' + m.t + '</b><small>' + m.s + '</small></span></button>';
      }).join('');
    }
    if (diffList) {
      diffList.innerHTML =
        '<div style="font-size:10.5px;font-weight:900;color:#ffc98a;margin:8px 4px 5px;text-align:right">درجهٔ سختی</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">' +
        Object.keys(SudokuCore.LEVELS).map(function (k) {
          var lv = SudokuCore.LEVELS[k];
          return '<button class="sd-opt' + (pick.diff === k ? ' sel' : '') + '" data-diff="' + k + '" style="padding:9px 10px">' +
            '<span class="tx"><b>' + lv.label + '</b><small>' + lv.clues + ' سرنخ</small></span></button>';
        }).join('') + '</div>';
    }
    bindPicker(modeList); bindPicker(diffList);
  }
  function openModeModal() {
    renderModalLists();
    $('sdModeOv').classList.add('show');
  }
  $('sdModeClose').addEventListener('click', function () { $('sdModeOv').classList.remove('show'); if (!S.started || S.finished) { exitView(); } });
  $('sdModeOv').addEventListener('click', function (e) { if (e.target === $('sdModeOv')) $('sdModeOv').classList.remove('show'); });
  $('sdModeStart').addEventListener('click', function () {
    $('sdModeOv').classList.remove('show');
    launch(pick.diff, pick.mode);
  });

  /* منوی داخلی */
  $('sdStartBtn').addEventListener('click', function () { launch(pick.diff, pick.mode); });
  // دکمهٔ «منو»: از بازی به منوی سودوکو برگرد (بازی/ذخیره دست‌نخورده می‌ماند)
  $('sdMenuBtn').addEventListener('click', function () {
    SND.pick();
    if (S.mode === 'online') { cancelQueue(); resetOnline(); }
    else { stopTimer(); }
    goMenu();
  });
  $('sdResumeBtn').addEventListener('click', function () {
    var d = loadSave(); if (!d) return;
    resumeGame(d);
  });

  function launch(diff, mode) {
    if (mode === 'online') {
      goGame();
      stopOnlineSync(); stopTimer();
      S.room = ''; S.deadline = 0; S.myDone = false; S.oppDone = false;
      S.started = false; S.finished = false;
      hideSplash();
      startQueue();
      return;
    }
    goGame();
    newGame(diff, mode, {});
  }

  /* نتیجه */
  $('sdResNew').addEventListener('click', function () {
    $('sdResultOv').classList.remove('show');
    launch(S.difficulty, 'single');
  });
  $('sdResAgain').addEventListener('click', function () {
    $('sdResultOv').classList.remove('show');
    launch(S.difficulty, 'single');
  });
  $('sdResMenu').addEventListener('click', function () {
    $('sdResultOv').classList.remove('show');
    goMenu();
  });
  $('sdVsMenu').addEventListener('click', function () {
    $('sdVsOv').classList.remove('show');
    resetOnline();
    goMenu();
  });
  function resetOnline() {
    S.mode = 'single'; S.room = ''; S.seat = -1; S.finished = false; S.myDone = false; S.oppDone = false;
    stopOnlineSync();
  }

  /* ---------- API عمومی ---------- */
  window.openSudoku = function (opts) {
    opts = opts || {};
    enterView();
    ensureBuilt();
    renderPicker();
    var fox = $('sdMenuFox'); if (fox && !fox.src) fox.src = window.__sdFoxSrc || '';
    var fox2 = $('sdModeFox'); if (fox2 && !fox2.src) fox2.src = window.__sdFoxSrc || '';
    var f3 = $('sdResultFox'); if (f3 && !f3.src) f3.src = window.__sdTrophySrc || '';
    var sp = $('sdSplashFox'); if (sp && !sp.src) sp.src = window.__sdFoxSrc || '';
    updateSoundBtn();
    // اگر بازی تک‌نفره‌ای در جریان است و تمام نشده، همان را ادامه بده
    if (!opts.fresh && !opts.difficulty && S.started && !S.finished && S.mode === 'single' && S.board && S.board.length === 81) {
      goGame(); renderBoard(); startTimer(); return;
    }
    if (pendingOnline && !opts.fresh && opts.mode !== 'online') {
      var po = pendingOnline; pendingOnline = null;
      resumeOnlineGame(po);
      return;
    }
    if (opts.difficulty) pick.diff = opts.difficulty;
    if (opts.mode === 'online') { launch(pick.diff, 'online'); return; }
    // اگر بازی ذخیره‌شده هست، منو با دکمهٔ ادامه نشان داده می‌شود
    var saved = loadSave();
    if (saved && !opts.fresh) { goMenu(); }
    else if (opts.fresh) { launch(pick.diff, opts.mode || 'single'); }
    else { goMenu(); }
  };

  /* ---------- راه‌اندازی ---------- */
  var pendingOnline = null;
  var bgImg = $('sdBgImg');
  if (bgImg && window.__sdBgSrc) bgImg.src = window.__sdBgSrc;

  // اگر بازی آنلاین نیمه‌تمام وجود دارد، فقط نشانه‌گذاری می‌کنیم؛
  // ورود به بازی فقط وقتی که کاربر خودش صفحهٔ سودوکو را باز کند.
  function checkOnlineActive() {
    var me = myPhone(); if (!me) return;
    apiGet('/api/sudoku/active?me=' + encodeURIComponent(me)).then(function (r) {
      pendingOnline = (r && r.room) ? r : null;
      var b = $('sdOnlineResumeBtn');
      if (b) { b.style.display = pendingOnline ? '' : 'none'; if (pendingOnline) b.querySelector('b').textContent = 'بازگشت به مسابقهٔ آنلاین'; }
    }).catch(function () {});
  }
  function resumeOnlineGame(r) {
    enterView(); ensureBuilt(); renderPicker();
    if (!(r && r.room && r.puzzle && r.puzzle.length === 81)) { pendingOnline = null; goMenu(); return; }
    S.room = r.room; S.seat = r.seat !== undefined ? r.seat : -1; S.partner = r.partner || 'حریف';
    var st = {
      difficulty: r.difficulty || 'medium',
      puzzle: r.puzzle, solution: r.solution, givens: r.givens,
      deadline: r.deadline || (Date.now() + (r.msLeft || ONLINE_SECONDS * 1000)),
      me: { board: r.board }
    };
    buildOnlineFromState(st);
    SND.pick();
  }
  setTimeout(checkOnlineActive, 2500);

  renderPicker();
  updateSoundBtn();
})();


