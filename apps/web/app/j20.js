
(function(){
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function toast(m){ if(window.foxToast) window.foxToast(m); }
  var overlay=document.getElementById('foxGroupsOverlay');
  if(!overlay) return;
  var list=document.getElementById('foxGroupsList');
  var closeBtn=document.getElementById('foxGroupsClose');
  function authHeaders(){ var t=localStorage.getItem('fox_session')||''; var h={'content-type':'application/json'}; if(t) h['authorization']='Bearer '+t; return h; }
  function setLoading(){ if(list) list.innerHTML='<div class="foxgrp-state">در حال بارگذاری گروه‌ها...</div>'; }
  function setEmpty(){ if(list) list.innerHTML='<div class="foxgrp-state">هنوز گروهی ساخته نشده است.</div>'; }
  function setError(msg){ if(list) list.innerHTML='<div class="foxgrp-state foxgrp-err">'+esc(msg||'خطا در دریافت گروه‌ها')+'</div>'; }
  function render(groups){
    if(!list) return;
    if(!groups || !groups.length){ setEmpty(); return; }
    var html='';
    for(var i=0;i<groups.length;i++){
      var g=groups[i];
      var isSys=(g.type==='system');
      var mc=Number(g.membersCount||0);
      var btn;
      if(isSys){ btn='<button class="foxgrp-btn enter" data-id="'+esc(g.id)+'" data-act="enter">ورود به گفتگو</button>'; }
      else if(g.isMember){ btn='<button class="foxgrp-btn leave" data-id="'+esc(g.id)+'" data-act="leave">خروج از گروه</button>'; }
      else { btn='<button class="foxgrp-btn join" data-id="'+esc(g.id)+'" data-act="join">عضویت</button>'; }
      var status=isSys?'گروه رسمی روباه':(g.isMember?(g.isOwner?'مالک':'عضو'):'عضو نیستی');
      var img=g.image?('<img class="foxgrp-ava" src="'+esc(g.image)+'" alt="" onerror="this.style.opacity=0">'):('<span class="foxgrp-ava foxgrp-ava-ph">🦊</span>');
      html+='<div class="foxgrp-card">'+img
        +'<div class="foxgrp-info"><div class="foxgrp-name">'+esc(g.name||'گروه')+'</div>'
        +'<div class="foxgrp-meta">'+mc+' عضو • '+esc(status)+'</div></div>'
        +btn+'</div>';
    }
    list.innerHTML=html;
  }
  function load(){
    setLoading();
    fetch('/api/groups/list',{headers:authHeaders()}).then(function(r){ return r.json(); }).then(function(j){
      if(j && j.ok) render(j.groups||[]); else setError((j&&j.message)||'خطا در دریافت گروه‌ها');
    }).catch(function(){ setError('خطای شبکه در دریافت گروه‌ها'); });
  }
  function doAction(id,act,btn){
    if(btn) btn.disabled=true;
    var url='/api/groups/'+encodeURIComponent(id)+'/'+act;
    fetch(url,{method:'POST',headers:authHeaders(),body:'{}'}).then(function(r){ return r.json().then(function(j){ return {ok:r.ok,j:j}; }); }).then(function(res){
      if(res.ok && res.j && res.j.ok){ toast(act==='join'?'عضو شدی ✅':'از گروه خارج شدی'); load(); }
      else { toast((res.j&&res.j.message)||'عملیات ناموفق بود'); if(btn) btn.disabled=false; }
    }).catch(function(){ toast('خطای شبکه'); if(btn) btn.disabled=false; });
  }
  function openPanel(){ overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false'); load(); }
  function closePanel(){ overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true'); }
  if(closeBtn) closeBtn.addEventListener('click',closePanel);
  overlay.addEventListener('click',function(e){ if(e.target===overlay) closePanel(); });
  document.addEventListener('keydown',function(e){ if((e.key==='Escape'||e.key==='Esc')&&overlay.classList.contains('open')) closePanel(); });
  if(list) list.addEventListener('click',function(e){
    var btn=e.target.closest?e.target.closest('.foxgrp-btn'):null;
    if(!btn) return;
    var id=btn.getAttribute('data-id'), act=btn.getAttribute('data-act');
    if(act==='enter'){ closePanel(); if(window.openChat) window.openChat(); return; }
    doAction(id,act,btn);
  });
  window.openFoxGroups=openPanel;
})();
