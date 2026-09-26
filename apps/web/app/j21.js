
(function(){
  try{
  // ===== Helpers =====
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function byId(id){ return document.getElementById(id); }
  function myPhone(){ try{ return (window.currentUser && currentUser.phone) || (JSON.parse(localStorage.getItem('fox_user')||'{}').phone) || ''; }catch(e){ return (window.currentUser&&currentUser.phone)||''; } }
  function headers(){ var t=localStorage.getItem('fox_session')||''; var h={'content-type':'application/json'}; if(t) h['authorization']='Bearer '+t; return h; }
  function fmtTime(ts){
    if(!ts) return '';
    var d=new Date(Number(ts));
    var now=new Date();
    var diff=now - d;
    if(diff<60000) return 'همین الان';
    if(diff<3600000) return Math.floor(diff/60000)+' دقیقه پیش';
    if(diff<86400000) return d.toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'});
    if(diff<604800000) return Math.floor(diff/86400000)+' روز پیش';
    return d.toLocaleDateString('fa-IR');
  }
  function toast(msg){
    var el=byId('gcToast');
    if(!el) { if(window.foxToast) window.foxToast(msg); return; }
    el.textContent=msg;
    el.classList.add('on');
    clearTimeout(el._t);
    el._t=setTimeout(function(){ el.classList.remove('on'); }, 2600);
  }

  // ===== State =====
  var APPV=['viewHome','viewChat','viewDM','viewDMList','viewSettings','viewFun','viewDooz'];
  function hideApp(){ APPV.forEach(function(id){ var el=byId(id); if(el){ el.classList.add('hidden'); el.style.display='none'; } }); }
  function gcOff(){ ['viewGroups','viewGroupChat'].forEach(function(id){ var el=byId(id); if(el) el.classList.remove('on'); }); }
  function nav(showNav){ if(window.setActiveNav) setActiveNav(showNav?'groups':''); if(window.__foxSyncNav) window.__foxSyncNav(); }

  var state={
    groups:[],
    filtered:[],
    tab:'all',
    q:'',
    loading:false,
    offset:0,
    hasMore:true,
    total:0,
    searchTimer:null,
    currentGroupId:null,
    currentGroup:null,
    es:null,
    msgTimer:null,
    wallet:{diamonds:0},
    avatarBase64:'',
    createBusy:false
  };

  // ===== Routing =====
  function pushRoute(path){
    try{ history.pushState({foxGroups:true,path:path},'',path); }catch(e){}
  }
  function replaceRoute(path){
    try{ history.replaceState({foxGroups:true,path:path},'',path); }catch(e){}
  }
  function getRouteGroupId(){
    var m=location.pathname.match(/^\/group\/([^/?#]+)/);
    return m?decodeURIComponent(m[1]):null;
  }
  window.addEventListener('popstate',function(){
    var gid=getRouteGroupId();
    if(location.pathname==='/groups'){
      goGroups(false);
    } else if(gid){
      openGroup(gid,false);
    } else {
      /* back to '/' → leave the Groups UI and the group chat, return to Home */
      var vcx=byId('viewChat');
      var inGroupsUI=(byId('viewGroups')&&byId('viewGroups').classList.contains('on'))||(vcx&&!vcx.classList.contains('hidden'));
      if(inGroupsUI && typeof window.goHome==='function'){ window.__foxChatReturn=''; window.goHome(); }
    }
  });

  // ===== Groups List =====
  function goGroups(push){
    try{
      if(push!==false) pushRoute('/groups');
      try{ localStorage.setItem('fox_active_tab','groups'); }catch(e){}
      hideApp(); gcOff();
      var v=byId('viewGroups'); if(v) v.classList.add('on');
      nav(true);
      loadGroups(true);
      closeCreateModal();
      leaveGroupChat();
    }catch(e){
      console.error('goGroups failed', e);
      try{
        var vh=document.getElementById('viewHome');
        var v1=document.getElementById('view1');
        if(vh){ vh.classList.remove('hidden'); try{ vh.style.setProperty('display','flex','important'); }catch(_){ vh.style.display='flex'; } }
        else if(v1){ v1.classList.remove('hidden'); try{ v1.style.setProperty('display','flex','important'); }catch(_){ v1.style.display='flex'; } }
        gcOff();
        if(window.foxToast) foxToast('خطا در نمایش گروه‌ها');
      }catch(_){}
    }
  }
  window.goGroups=goGroups;

  function loadGroups(reset){
    if(reset){
      state.offset=0;
      state.groups=[];
      state.hasMore=true;
      var list=byId('gcList');
      if(list) renderSkeletons(6);
    }
    if(state.loading || !state.hasMore) return;
    state.loading=true;
    var params=new URLSearchParams();
    params.set('tab',state.tab);
    if(state.q) params.set('q',state.q);
    params.set('limit','50');
    params.set('offset',String(state.offset));
    fetch('/api/groups/list?'+params.toString(),{headers:headers()}).then(function(r){return r.json();}).then(function(j){
      state.loading=false;
      if(!j||!j.ok){
        if(reset) setError(j&&j.message||'دریافت گروه‌ها انجام نشد');
        else toast(j&&j.message||'خطا در دریافت');
        return;
      }
      var newGroups=j.groups||[];
      if(reset) state.groups=newGroups;
      else state.groups=state.groups.concat(newGroups);
      state.total=j.total||state.groups.length;
      state.hasMore=!!j.hasMore;
      state.offset=j.nextOffset!=null?j.nextOffset:state.groups.length;
      renderGroups();
    }).catch(function(){
      state.loading=false;
      if(reset) setError('خطای شبکه در دریافت گروه‌ها');
      else toast('خطای شبکه');
    });
  }

  function renderSkeletons(n){
    var list=byId('gcList');
    if(!list) return;
    list.innerHTML='';
    for(var i=0;i<n;i++){
      var d=document.createElement('div');
      d.className='gc-skel-card';
      d.innerHTML='<div class="gc-skel-ava"></div><div class="gc-skel-lines"><div class="gc-skel-line long"></div><div class="gc-skel-line short"></div><div class="gc-skel-line long" style="width:70%"></div></div>';
      list.appendChild(d);
    }
  }
  function setError(msg){
    var list=byId('gcList');
    if(!list) return;
    list.innerHTML='<div class="gc-err"><div style="font-size:36px">⚠️</div><div style="font-weight:800">'+esc(msg)+'</div><button class="gc-empty-btn" id="gcRetryBtn" type="button">تلاش دوباره</button></div>';
    var btn=byId('gcRetryBtn');
    if(btn) btn.addEventListener('click',function(){ loadGroups(true); });
  }
  function renderGroups(){
    var list=byId('gcList');
    if(!list) return;
    if(!state.groups.length){
      if(state.q){
        list.innerHTML='<div class="gc-empty"><div class="gc-empty-icon">🔍</div><div class="gc-empty-title">نتیجه‌ای یافت نشد</div><div class="gc-empty-sub">برای "'+esc(state.q)+'" گروهی پیدا نکردیم. نام دیگری را امتحان کنید.</div></div>';
      } else if(state.tab==='managed'){
        list.innerHTML='<div class="gc-empty"><div class="gc-empty-icon">👑</div><div class="gc-empty-title">گروه مدیریتی ندارید</div><div class="gc-empty-sub">گروه‌هایی که شما مالک یا ادمین آن‌ها هستید اینجا نمایش داده می‌شود. یک گروه جدید بسازید.</div><button class="gc-empty-btn" id="gcEmptyCreate" type="button">ساخت گروه</button></div>';
        var b=byId('gcEmptyCreate'); if(b) b.addEventListener('click',openCreateModal);
      } else if(state.tab==='new'){
        list.innerHTML='<div class="gc-empty"><div class="gc-empty-icon">✨</div><div class="gc-empty-title">گروه جدیدی نیست</div><div class="gc-empty-sub">گروه‌های ساخته‌شده در ۷ روز اخیر اینجا نمایش داده می‌شوند. اولین گروه جدید را شما بسازید.</div><button class="gc-empty-btn" id="gcEmptyCreate2" type="button">ساخت گروه</button></div>';
        var b2=byId('gcEmptyCreate2'); if(b2) b2.addEventListener('click',openCreateModal);
      } else {
        list.innerHTML='<div class="gc-empty"><div class="gc-empty-icon">💬</div><div class="gc-empty-title">هنوز عضو هیچ گروهی نیستید</div><div class="gc-empty-sub">گروه روباه اصلی همیشه در دسترس است. گروه جدید بسازید یا منتظر دعوت بمانید.</div><button class="gc-empty-btn" id="gcEmptyCreate3" type="button">ساخت گروه — ۳۹۹ الماس</button></div>';
        var b3=byId('gcEmptyCreate3'); if(b3) b3.addEventListener('click',openCreateModal);
      }
      return;
    }
    list.innerHTML='';
    state.groups.forEach(function(g){
      // IMPORTANT: each card must have real groupId, no fallback to main
      var groupId = g.id || g.groupId;
      if(!groupId) return; // skip fake
      var card=document.createElement('div');
      card.className='gc-card';
      card.setAttribute('data-group-id',groupId);
      var avaHtml = g.photo || g.image ? '<img src="'+esc(g.photo||g.image)+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '🦊';
      var roleBadge='';
      if(g.role==='owner') roleBadge='<span class="gc-role-badge owner">مالک</span>';
      else if(g.role==='admin') roleBadge='<span class="gc-role-badge admin">ادمین</span>';
      else if(g.isOwner) roleBadge='<span class="gc-role-badge owner">مالک</span>';
      else if(g.isAdmin) roleBadge='<span class="gc-role-badge admin">ادمین</span>';
      var lastMsgText = g.lastMessageText || g.lastMessage?.text || '';
      var lastSender = g.lastMessageSender || g.lastMessage?.name || '';
      var lastPreview = '';
      if(lastMsgText){
        lastPreview = lastSender ? '<strong>'+esc(lastSender)+':</strong> '+esc(lastMsgText) : esc(lastMsgText);
      } else {
        lastPreview = '👥 '+Number(g.memberCount||g.membersCount||0)+' عضو';
      }
      var timeText = g.lastMessageTime ? fmtTime(g.lastMessageTime) : (g.createdAt?fmtTime(g.createdAt):'');
      var unreadHtml = g.unreadCount && g.unreadCount>0 ? '<span class="gc-unread">'+(g.unreadCount>99?'99+':g.unreadCount)+'</span>' : '<span class="gc-unread hidden">0</span>';
      card.innerHTML=
        '<div class="gc-ava">'+avaHtml+'</div>'+
        '<div class="gc-info">'+
          '<div class="gc-name-row"><div class="gc-name">'+esc(g.name||'گروه')+'</div>'+roleBadge+'</div>'+
          '<div class="gc-meta"><span class="gc-last-msg">'+lastPreview+'</span></div>'+
        '</div>'+
        '<div class="gc-right"><span class="gc-time">'+esc(timeText)+'</span>'+unreadHtml+'</div>';
      // Critical: use real groupId, not hardcoded
      card.addEventListener('click',function(){
        openGroup(groupId,true,g);
      });
      list.appendChild(card);
    });
    // Infinite scroll
    if(state.hasMore){
      var more=document.createElement('div');
      more.style.textAlign='center';
      more.style.padding='12px';
      more.innerHTML='<button class="gc-tab" id="gcLoadMore" type="button">نمایش بیشتر</button>';
      list.appendChild(more);
      var lm=byId('gcLoadMore');
      if(lm) lm.addEventListener('click',function(){ loadGroups(false); });
    }
  }

  // ===== Search =====
  var searchInput=byId('gcSearchInput');
  var searchClear=byId('gcSearchClear');
  var searchWrap=byId('gcSearchWrap');
  if(searchInput){
    searchInput.addEventListener('input',function(){
      var v=this.value.trim();
      if(searchClear){
        if(v) searchClear.classList.add('on');
        else searchClear.classList.remove('on');
      }
      clearTimeout(state.searchTimer);
      state.searchTimer=setTimeout(function(){
        state.q=v;
        loadGroups(true);
      },320);
    });
  }
  if(searchClear){
    searchClear.addEventListener('click',function(){
      if(searchInput){ searchInput.value=''; searchInput.focus(); }
      searchClear.classList.remove('on');
      state.q='';
      loadGroups(true);
    });
  }
  var searchToggle=byId('gcSearchToggle');
  if(searchToggle && searchWrap){
    searchToggle.addEventListener('click',function(){
      searchWrap.scrollIntoView({behavior:'smooth',block:'center'});
      if(searchInput) searchInput.focus();
    });
  }

  // ===== Tabs =====
  var tabsEl=byId('gcTabs');
  if(tabsEl){
    tabsEl.addEventListener('click',function(e){
      var btn=e.target.closest('.gc-tab');
      if(!btn) return;
      var tab=btn.getAttribute('data-tab');
      if(!tab || tab===state.tab) return;
      state.tab=tab;
      tabsEl.querySelectorAll('.gc-tab').forEach(function(b){ b.classList.toggle('active',b.getAttribute('data-tab')===tab); });
      loadGroups(true);
    });
  }

  // ===== Group Chat (independent per groupId) =====
  /* ═══ Shared Group Engine ═══
     All groups (main + custom) open in ONE engine: #viewChat + live layer (foxGroupUrl / foxStartGroup / foxRenderGroup).
     The old #viewGroupChat renderer was a separate text-only copy and has been removed. */
  function openGroup(groupId, push, preloaded){
    var gid=String(groupId==null?'':groupId).trim();
    if(!gid){ toast('شناسه گروه نامعتبر است'); return; }
    state.currentGroupId=gid; state.currentGroup=preloaded||null;
    var fromGroups=(byId('viewGroups')&&byId('viewGroups').classList.contains('on'))||location.pathname==='/groups';
    window.__foxChatReturn=fromGroups?'groups':'home';
    if(typeof origOpenGroupChat!=='function'){ toast('خطا در باز کردن گروه'); return; }
    origOpenGroupChat(gid, preloaded||null);
    var path='/group/'+encodeURIComponent(gid);
    if(location.pathname!==path){ if(push===false){ replaceRoute(path); } else { pushRoute(path); window.__foxChatPushed=true; } }
    setTimeout(function(){ markGroupSeen(gid); },1200);
  }
  window.openGroup=openGroup;
  window.__foxMarkGroupSeen=function(gid){ try{ markGroupSeen(gid); }catch(e){} };
  window.foxLeaveGroupsUI=function(nextViewId){
    var wasOn=false;
    ['viewGroups','viewGroupChat'].forEach(function(id){ var el=byId(id); if(el&&el.classList.contains('on')){ el.classList.remove('on'); wasOn=true; } });
    if(wasOn){ try{ leaveGroupChat(); }catch(e){} }
    var p=location.pathname, vc=byId('viewChat'), chatOpen=!!(vc&&!vc.classList.contains('hidden'));
    /* reset the URL only when the Groups UI / group chat was really open (during boot the router must still see the route) */
    if(nextViewId!=='viewChat' && (p==='/groups'||p.indexOf('/group/')===0) && (wasOn || (chatOpen && p.indexOf('/group/')===0))) replaceRoute('/');
  };
  // Legacy compatibility - but fixed to use real id, not hardcoded main
  // Save originals
  var origOpenGroupChat = window.openGroupChat;
  var origSetActiveGroup = window.setActiveGroup;
  window.openGroupChat=function(id,g){
    if(!id){ toast('شناسه گروه نامعتبر'); return; }
    openGroup(id,true,g);
  };
  window.setActiveGroup=function(id,g){
    // Preserve original behavior for main chat
    if(typeof origSetActiveGroup==='function'){
      try{ origSetActiveGroup(id,g); }catch(e){}
    }
    state.currentGroupId=id;
    state.currentGroup=g||null;
  };

  function leaveGroupChat(){
    if(state.es){ try{state.es.close();}catch(e){} state.es=null; }
    if(state.msgTimer){ clearInterval(state.msgTimer); state.msgTimer=null; }
    state.currentGroupId=null;
    state.currentGroup=null;
    var box=byId('gcMessages');
    if(box) box.innerHTML='';
  }

  function loadGroupMessages(groupId){
    var gid=groupId||state.currentGroupId;
    if(!gid) return;
    var box=byId('gcMessages');
    if(box) box.innerHTML='<div style="padding:20px;text-align:center;color:var(--groups-muted)">در حال بارگذاری پیام‌ها...</div>';
    fetch('/api/groups/'+encodeURIComponent(gid)+'/messages',{headers:headers()}).then(function(r){return r.json();}).then(function(rows){
      if(!Array.isArray(rows)) rows=[];
      renderGroupMessages(rows);
    }).catch(function(){
      if(box) box.innerHTML='<div style="padding:20px;text-align:center;color:var(--groups-error)">خطا در دریافت پیام‌ها</div>';
    });
  }

  function renderGroupMessages(rows){
    var box=byId('gcMessages');
    if(!box) return;
    box.innerHTML='';
    var phone=myPhone();
    rows.slice(-200).forEach(function(m){
      var mine=phone && (m.phone===phone || m.from===phone);
      var div=document.createElement('div');
      div.className='msg '+(mine?'me':'oth');
      div.setAttribute('data-id',m.id||'');
      var nameHtml = !mine ? '<div class="nm">'+esc(m.name||'')+'</div>' : '';
      div.innerHTML='<div class="body">'+nameHtml+'<div class="tx">'+esc(m.text||'')+'</div></div>';
      box.appendChild(div);
    });
    box.scrollTop=box.scrollHeight;
  }

  function startGroupStream(groupId){
    var gid=groupId||state.currentGroupId;
    if(!gid) return;
    leaveGroupChat(); // close previous
    state.currentGroupId=gid;
    try{
      var es=new EventSource('/api/groups/'+encodeURIComponent(gid)+'/stream');
      state.es=es;
      es.addEventListener('snapshot',function(e){
        try{
          var rows=JSON.parse(e.data);
          if(Array.isArray(rows)) renderGroupMessages(rows);
        }catch(_){}
      });
      es.addEventListener('dm',function(e){
        try{
          var m=JSON.parse(e.data);
          if(m&&m.id){
            var box=byId('gcMessages');
            if(box){
              var phone=myPhone();
              var mine=phone && (m.phone===phone || m.from===phone);
              var div=document.createElement('div');
              div.className='msg '+(mine?'me':'oth');
              div.setAttribute('data-id',m.id);
              var nameHtml = !mine ? '<div class="nm">'+esc(m.name||'')+'</div>' : '';
              div.innerHTML='<div class="body">'+nameHtml+'<div class="tx">'+esc(m.text||'')+'</div></div>';
              box.appendChild(div);
              box.scrollTop=box.scrollHeight;
            }
          }
        }catch(_){}
      });
      es.onerror=function(){
        try{es.close();}catch(_){}
        state.es=null;
        if(!state.msgTimer) state.msgTimer=setInterval(function(){ loadGroupMessages(gid); },5000);
      };
    }catch(_){
      if(!state.msgTimer) state.msgTimer=setInterval(function(){ loadGroupMessages(gid); },5000);
    }
  }

  function sendGroupMessage(){
    var inp=byId('gcInput');
    var gid=state.currentGroupId;
    if(!inp||!gid) return;
    var text=(inp.value||'').trim();
    if(!text) return;
    inp.value='';
    var phone=myPhone();
    var optimistic={id:'tmp_'+Date.now(),phone:phone,from:phone,name:(window.currentUser&&currentUser.name)||'',text:text,ts:Date.now()};
    var box=byId('gcMessages');
    if(box){
      var div=document.createElement('div');
      div.className='msg me';
      div.innerHTML='<div class="body"><div class="tx">'+esc(text)+'</div></div>';
      box.appendChild(div);
      box.scrollTop=box.scrollHeight;
    }
    fetch('/api/groups/'+encodeURIComponent(gid)+'/messages',{method:'POST',headers:headers(),body:JSON.stringify({text:text})}).then(function(r){return r.json();}).then(function(m){
      if(m&&m.id){
        loadGroupMessages(gid);
        markGroupSeen(gid);
      }
    }).catch(function(){ toast('ارسال ناموفق بود'); });
  }

  function markGroupSeen(groupId){
    var gid=groupId||state.currentGroupId;
    if(!gid) return;
    fetch('/api/groups/'+encodeURIComponent(gid)+'/seen',{method:'POST',headers:headers(),body:'{}'}).catch(function(){});
  }

  // Send handlers
  var sendBtn=byId('gcSend');
  var inputEl=byId('gcInput');
  if(sendBtn) sendBtn.addEventListener('click',sendGroupMessage);
  if(inputEl){
    inputEl.addEventListener('keydown',function(e){
      if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendGroupMessage(); }
    });
    inputEl.addEventListener('input',function(){
      this.style.height='auto';
      this.style.height=Math.min(this.scrollHeight,120)+'px';
    });
  }
  var backBtn=byId('gcBack');
  if(backBtn) backBtn.addEventListener('click',function(){ leaveGroupChat(); goGroups(); });

  // ===== Create Group =====
  function openCreateModal(){
    var overlay=byId('gcCreateOverlay');
    if(!overlay) return;
    overlay.classList.add('on');
    loadWallet();
    // Reset
    state.avatarBase64='';
    var avaBig=byId('gcAvatarBig');
    if(avaBig) avaBig.innerHTML='<span>🦊</span><div class="gc-avatar-cam">📷</div>';
    var previewAva=byId('gcPreviewAva');
    if(previewAva) previewAva.innerHTML='🦊';
    var nameIn=byId('gcNameInput');
    var descIn=byId('gcDescInput');
    if(nameIn) nameIn.value='';
    if(descIn) descIn.value='';
    updatePreview();
    var err=byId('gcCreateError');
    if(err) err.style.display='none';
  }
  function closeCreateModal(){
    var overlay=byId('gcCreateOverlay');
    if(overlay) overlay.classList.remove('on');
  }
  window.openCreateGroup=openCreateModal;

  function loadWallet(){
    fetch('/api/wallet',{headers:headers()}).then(function(r){return r.json();}).then(function(j){
      if(j&&j.ok&&j.wallet){
        var d=j.wallet.diamonds!=null?j.wallet.diamonds:(j.wallet.gems||0);
        state.wallet.diamonds=Number(d)||0;
        var balEl=byId('gcWalletBalance');
        if(balEl) balEl.textContent=Number(d).toLocaleString('fa-IR')+' الماس';
      } else {
        // fallback from user api?
        fetch('/api/me',{headers:headers()}).then(function(r){return r.json();}).catch(function(){return null;}).then(function(u){
          if(u&&u.diamonds!=null){
            state.wallet.diamonds=Number(u.diamonds)||0;
            var balEl=byId('gcWalletBalance');
            if(balEl) balEl.textContent=Number(u.diamonds).toLocaleString('fa-IR')+' الماس';
          }
        });
      }
    }).catch(function(){
      var balEl=byId('gcWalletBalance');
      if(balEl) balEl.textContent='—';
    });
  }

  function updatePreview(){
    var nameIn=byId('gcNameInput');
    var descIn=byId('gcDescInput');
    var previewName=byId('gcPreviewName');
    var previewDesc=byId('gcPreviewDesc');
    if(previewName) previewName.textContent=(nameIn&&nameIn.value.trim())||'نام گروه';
    if(previewDesc) previewDesc.textContent=(descIn&&descIn.value.trim())||'توضیحات گروه';
  }

  var nameInput=byId('gcNameInput');
  var descInput=byId('gcDescInput');
  if(nameInput) nameInput.addEventListener('input',updatePreview);
  if(descInput) descInput.addEventListener('input',updatePreview);

  var avatarBig=byId('gcAvatarBig');
  var avatarInput=byId('gcAvatarInput');
  if(avatarBig && avatarInput){
    avatarBig.addEventListener('click',function(){ avatarInput.click(); });
    avatarInput.addEventListener('change',function(){
      var file=this.files&&this.files[0];
      if(!file) return;
      if(file.size>2*1024*1024){ toast('حجم عکس باید کمتر از ۲ مگابایت باشد'); return; }
      var reader=new FileReader();
      reader.onload=function(e){
        var base64=e.target.result;
        state.avatarBase64=base64;
        avatarBig.innerHTML='<img src="'+esc(base64)+'" alt=""><div class="gc-avatar-cam">📷</div>';
        var previewAva=byId('gcPreviewAva');
        if(previewAva) previewAva.innerHTML='<img src="'+esc(base64)+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
      };
      reader.readAsDataURL(file);
    });
  }

  var createBtn=byId('gcCreateBtn');
  if(createBtn){
    createBtn.addEventListener('click',function(){
      if(state.createBusy) return;
      var nameIn=byId('gcNameInput');
      var descIn=byId('gcDescInput');
      var name=(nameIn&&nameIn.value.trim())||'';
      var desc=(descIn&&descIn.value.trim())||'';
      var errEl=byId('gcCreateError');
      if(errEl) errEl.style.display='none';
      if(!name || name.length<3){
        if(errEl){ errEl.textContent='نام گروه باید حداقل ۳ حرف باشد'; errEl.style.display='block'; }
        return;
      }
      if(state.wallet.diamonds<399){
        if(errEl){ errEl.textContent='برای ساخت گروه به ۳۹۹ الماس نیاز دارید. موجودی شما: '+(state.wallet.diamonds||0)+' الماس'; errEl.style.display='block'; }
        toast('موجودی الماس کافی نیست');
        return;
      }
      state.createBusy=true;
      createBtn.disabled=true;
      createBtn.textContent='در حال ساخت...';
      var requestId=Date.now()+'-'+Math.random().toString(36).slice(2,10);
      fetch('/api/groups/create',{method:'POST',headers:headers(),body:JSON.stringify({name:name,description:desc,image:state.avatarBase64,requestId:requestId})}).then(function(r){return r.json().then(function(j){return {status:r.status,body:j};});}).then(function(res){
        state.createBusy=false;
        createBtn.disabled=false;
        createBtn.textContent='تأیید و ساخت گروه — ۳۹۹ الماس';
        var j=res.body;
        if(res.status===400 && j&&j.error==='insufficient_diamonds'){
          if(errEl){ errEl.textContent=j.message||'موجودی کافی نیست'; errEl.style.display='block'; }
          toast(j.message||'الماس کافی نیست');
          loadWallet();
          return;
        }
        if(!j||!j.ok){
          if(errEl){ errEl.textContent=(j&&j.message)||'ساخت گروه ناموفق بود'; errEl.style.display='block'; }
          toast((j&&j.message)||'خطا در ساخت گروه');
          return;
        }
        toast('گروه "'+(j.group&&j.group.name||name)+'" با موفقیت ساخته شد 🎉');
        closeCreateModal();
        // Open new group immediately with real groupId
        var newId=j.group&&j.group.id;
        if(newId){
          // Refresh wallet
          loadWallet();
          // Reload groups and open new group
          state.groups=[];
          loadGroups(true);
          setTimeout(function(){ openGroup(newId,true,j.group); },600);
        } else {
          loadGroups(true);
        }
      }).catch(function(){
        state.createBusy=false;
        createBtn.disabled=false;
        createBtn.textContent='تأیید و ساخت گروه — ۳۹۹ الماس';
        if(errEl){ errEl.textContent='خطای شبکه'; errEl.style.display='block'; }
        toast('خطای شبکه');
      });
    });
  }

  var closeBtn=byId('gcCreateClose');
  var overlay=byId('gcCreateOverlay');
  if(closeBtn) closeBtn.addEventListener('click',closeCreateModal);
  if(overlay) overlay.addEventListener('click',function(e){ if(e.target===overlay) closeCreateModal(); });

  // FAB
  var fab=byId('gcFab');
  if(fab) fab.addEventListener('click',openCreateModal);

  // More button placeholder
  var moreBtn=byId('gcMoreBtn');
  if(moreBtn) moreBtn.addEventListener('click',function(){ toast('به‌زودی: تنظیمات گروه‌ها'); });

  var chatMenu=byId('gcChatMenu');
  if(chatMenu) chatMenu.addEventListener('click',function(){ toast('به‌زودی: منوی گروه'); });

  // Bottom nav integration - ensure groups button calls goGroups
  document.addEventListener('DOMContentLoaded',function(){
    // Override bottom nav groups button if exists
    var bottomNav=byId('bottomNav');
    if(bottomNav){
      bottomNav.addEventListener('click',function(e){
        var btn=e.target.closest('button[data-go="groups"]');
        if(btn){
          e.preventDefault();
          e.stopPropagation();
          goGroups();
        }
      },true);
    }
    // Handle initial route
    var gid=getRouteGroupId();
    var hasSess=false; try{ hasSess=!!localStorage.getItem('fox_session'); }catch(e){}
    if(!hasSess){ /* not signed in: auth screens take over */ }
    else if(gid){
      // If direct /group/:id, open it after a short delay to allow auth
      setTimeout(function(){ openGroup(gid,false); },400);
    } else if(location.pathname==='/groups'){
      setTimeout(function(){ goGroups(false); },100);
    }
  });

  // Preserve main group card behavior - use original openGroupChat to avoid breaking viewChat
  var cardGroup=byId('cardGroup');
  if(cardGroup){
    // Do NOT replace with new viewGroupChat for main; keep original flow
    // Just ensure it opens main via original handler if exists
    // If we previously overrode, restore original click by using origOpenGroupChat
    try{
      // Remove any existing listeners by cloning once, but then call origOpenGroupChat
      var newCard=cardGroup.cloneNode(true);
      cardGroup.parentNode.replaceChild(newCard,cardGroup);
      newCard.addEventListener('click',function(){
        if(typeof origOpenGroupChat==='function'){
          try{ window.__foxChatReturn='home'; openGroup('main',true,{id:'main',name:'گروه روباه',type:'system'}); return; }catch(e){}
        }
        if(window.openChat){ try{ window.openChat(); }catch(e){} }
      });
    }catch(e){}
  }

  // Periodic refresh of groups list when in groups view
  setInterval(function(){
    var v=byId('viewGroups');
    if(v && v.classList.contains('on') && !state.loading && !state.q){
      // silent refresh without skeletons
      var params=new URLSearchParams();
      params.set('tab',state.tab);
      params.set('limit','50');
      params.set('offset','0');
      fetch('/api/groups/list?'+params.toString(),{headers:headers()}).then(function(r){return r.json();}).then(function(j){
        if(j&&j.ok){
          // Only update if counts changed or new groups
          if((j.groups||[]).length!==state.groups.length){
            state.groups=j.groups||[];
            renderGroups();
          } else {
            // Check for new last messages
            var changed=false;
            for(var i=0;i<j.groups.length;i++){
              var ng=j.groups[i];
              var og=state.groups.find(function(x){return x.id===ng.id;});
              if(!og || og.lastMessageTime!==ng.lastMessageTime || og.unreadCount!==ng.unreadCount){
                changed=true; break;
              }
            }
            if(changed){
              state.groups=j.groups;
              renderGroups();
            }
          }
        }
      }).catch(function(){});
    }
  },15000);
  }catch(e){
    console.error('Groups Engine Error Boundary: init failed', e, e.stack);
    try{
      var hasVisible = false;
      try{
        document.querySelectorAll('section.view').forEach(function(v){
          var cs = window.getComputedStyle ? getComputedStyle(v) : null;
          if(cs && cs.display!=='none' && !v.classList.contains('hidden')) hasVisible=true;
        });
      }catch(_){}
      if(!hasVisible){
        var v1=document.getElementById('view1');
        if(v1){
          v1.classList.remove('hidden');
          try{ v1.style.setProperty('display','flex','important'); }catch(_){ v1.style.display='flex'; }
        }
        try{ document.documentElement.classList.remove('has-auth-session','auth-boot'); }catch(_){}
      }
      if(window.foxToast) window.foxToast('خطا در گروه‌ها، صفحه اصلی فعال است');
    }catch(_){}
  }
})();
