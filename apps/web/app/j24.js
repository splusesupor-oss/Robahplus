
(function(){
  var PK='/api/wallet/diamond-packages', BUY='/api/wallet/purchase-diamonds', SUP='/api/config/support';
  var FA='۰۱۲۳۴۵۶۷۸۹';
  function fa(n){ return String(n==null?0:n).replace(/[0-9]/g,function(d){return FA[+d];}); }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function uid(){ try{ if(window.crypto&&crypto.randomUUID) return crypto.randomUUID(); }catch(e){} return 'tx'+Date.now()+Math.random().toString(36).slice(2,12); }
  function toast(t){ try{ if(window.foxToast){foxToast(t);return;} }catch(e){} }

  function mk(tag,cls,html){ var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }
  function overlay(id){
    var ov=mk('div','fxs-ov'); ov.id=id; ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true');
    var sh=mk('div','fxs-sheet'); sh.appendChild(mk('div','fxs-grab'));
    ov.appendChild(sh); document.body.appendChild(ov);
    ov.addEventListener('click',function(e){ if(e.target===ov) close(ov); });
    return {ov:ov,sh:sh};
  }
  var stack=[];
  function open(o,title){
    o.sh.innerHTML='<div class="fxs-grab"></div>';
    var head=mk('div','fxs-head');
    head.appendChild(mk('div','fxs-title',title));
    var x=mk('button','fxs-x','✕'); x.type='button'; x.setAttribute('aria-label','بستن');
    x.addEventListener('click',function(){ close(o.ov); });
    head.appendChild(x); o.sh.appendChild(head);
    o.ov.classList.add('show'); o.ov.setAttribute('aria-hidden','false');
    stack.push(o.ov);
    setTimeout(function(){ try{ x.focus(); }catch(e){} },240);
    return head;
  }
  function close(ov){ ov.classList.remove('show'); ov.setAttribute('aria-hidden','true');
    stack=stack.filter(function(x){return x!==ov;}); }
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&stack.length) { e.preventDefault(); close(stack[stack.length-1]); }
  });
  document.addEventListener('keydown',function(e){
    if(e.key!=='Tab'||!stack.length) return;
    var ov=stack[stack.length-1];
    var f=ov.querySelectorAll('button:not([disabled]),[href],input,[tabindex]:not([tabindex="-1"])');
    if(!f.length) return;
    var first=f[0], last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });

  /* ---- wallet: فقط از بک‌اند ---- */
  function walletNow(){
    try{ if(window.FoxWallet&&window.FoxWallet.state) return window.FoxWallet.state; }catch(e){}
    return null;
  }
  function walletFetch(){
    return fetch('/api/wallet',{credentials:'same-origin',cache:'no-store'})
      .then(function(r){ return r.json(); })
      .then(function(j){ if(!j||!j.ok||!j.wallet) throw new Error('nobal'); return j.wallet; });
  }
  function applyWallet(w){
    if(!w) return;
    try{ if(window.FoxWallet) window.FoxWallet.apply(w); }catch(e){}
    try{ if(window.FoxGameRewardService&&window.FoxGameRewardService.updateBalanceUI) window.FoxGameRewardService.updateBalanceUI(w); }catch(e){}
    try{ if(typeof window.refreshFoxWallet==='function') window.refreshFoxWallet(); }catch(e){}
    try{ document.dispatchEvent(new CustomEvent('fox-wallet-updated',{detail:w})); }catch(e){}
  }
  function coinsOf(w){ return w? (Number(w.foxCoins!=null?w.foxCoins:w.coins)||0) : 0; }
  function gemsOf(w){ return w? (Number(w.diamonds!=null?w.diamonds:w.gems)||0) : 0; }

  function balRow(w){
    var d=mk('div','fxs-bal');
    d.innerHTML='<div>'+fa(coinsOf(w))+'<small>🪙 سکه روباه</small></div>'
              +'<div>'+fa(gemsOf(w))+'<small>💎 الماس</small></div>';
    return d;
  }

  /* ================= خرید سکه روباه: نمایش آیدی سازنده ================= */
  var co=null, supportCfg=null;
  function loadSupport(cb){
    if(supportCfg){ cb(supportCfg); return; }
    fetch(SUP,{credentials:'same-origin',cache:'no-store'}).then(function(r){return r.json();})
      .then(function(j){ supportCfg=(j&&j.support)||{username:'osine'}; cb(supportCfg); })
      .catch(function(){ supportCfg={username:'osine'}; cb(supportCfg); });
  }
  function supName(){ return (supportCfg&&supportCfg.username)||'osine'; }

  /* با کلیک روی هر بستهٔ سکه، آیدی سازنده نمایش داده می‌شود */
  function openCoinContact(coins, price){
    if(!co) co=overlay('fxsCoinOv');
    open(co,'🪙 خرید '+fa(coins||'')+' سکه روباه');
    co.sh.appendChild(mk('p','fxs-p','برای دریافت این بسته، مبلغ '+esc(price||'')+' را برای سازنده واریز کنید و آیدی زیر را همراه فیش ارسال نمایید.'));
    var box=mk('div','fxs-support');
    box.innerHTML='<div class="fxs-ava">👤</div><div><b>آیدی سازنده و پشتیبانی</b><span id="fxsSupHandle">@'+esc(supName())+'</span></div>';
    co.sh.appendChild(box);
    loadSupport(function(cfg){
      var h=co.sh.querySelector('#fxsSupHandle');
      if(h) h.textContent='@'+esc(cfg.username||'osine');
    });
    var msg=mk('div','fxs-msg',''); co.sh.appendChild(msg);
    var row=mk('div','fxs-row');
    var b1=mk('button','fxs-btn fxs-pri','💬 پیام به پشتیبانی'); b1.type='button';
    var b2=mk('button','fxs-btn fxs-sec','بستن'); b2.type='button';
    b2.addEventListener('click',function(){ close(co.ov); });
    b1.addEventListener('click',function(){
      b1.disabled=true; msg.className='fxs-msg'; msg.textContent='در حال یافتن پشتیبانی…';
      fetch('/api/users',{credentials:'same-origin'}).then(function(r){return r.json();})
      .then(function(list){
        var sup=null, want=String(supName()).toLowerCase();
        (list||[]).forEach(function(u){ if(String(u.username||'').toLowerCase()===want) sup=u; });
        if(!sup) throw new Error('notfound');
        if(typeof window.openDMChat==='function'){ window.openDMChat({phone:sup.phone,name:sup.name,avatar:sup.avatar,username:sup.username},'dms'); }
        else if(typeof window.openUserProfile==='function'){ window.openUserProfile(sup); }
        else throw new Error('noopener');
        close(co.ov);
      }).catch(function(){
        msg.className='fxs-msg err';
        msg.textContent='گفتگو با @'+supName()+' باز نشد؛ از جستجو نام کاربری را جستجو کنید.';
        b1.disabled=false;
      });
    });
    row.appendChild(b1); row.appendChild(b2);
    co.sh.appendChild(row);
  }

  /* اتصال به کارت‌های بستهٔ سکهٔ موجود در پنل (بدون ساخت بخش جدید) */
  document.addEventListener('click',function(e){
    var card=e.target&&e.target.closest?e.target.closest('.coin-buy-card'):null;
    if(!card) return;
    e.preventDefault(); e.stopPropagation();
    openCoinContact(card.getAttribute('data-coins')||'', card.getAttribute('data-price')||'');
  },true);

  /* ================= اتصال به دکمه‌های موجود ================= */
  function hit(el,txt){
    if(!el) return false;
    var t=String(el.textContent||'').replace(/s+/g,' ').trim();
    if(!t||t.length>70) return false;
    return t.indexOf(txt)>=0;
  }
  document.addEventListener('click',function(e){
    var el=e.target&&e.target.closest?e.target.closest('button,[role="button"],.plan-card,.menu-item,li,a'):null;
    if(!el) return;
  },true);

  /* ================= تأییدیهٔ درون‌برنامه‌ای (جایگزین کادر مرورگر) ================= */
  var cfm=null;
  window.foxConfirm=function(title,text,onYes){
    if(!cfm) cfm=overlay('fxsConfirmOv');
    open(cfm, esc(title||'تأیید'));
    if(text) cfm.sh.appendChild(mk('p','fxs-p',esc(text)));
    var row=mk('div','fxs-row');
    var no=mk('button','fxs-btn fxs-sec','انصراف'); no.type='button';
    var yes=mk('button','fxs-btn fxs-pri','تأیید'); yes.type='button';
    no.addEventListener('click',function(){ close(cfm.ov); });
    yes.addEventListener('click',function(){
      close(cfm.ov);
      try{ if(typeof onYes==='function') onYes(true); }catch(e){}
    });
    row.appendChild(no); row.appendChild(yes); cfm.sh.appendChild(row);
  };

  /* ================= همگام‌سازی زنده: کیف پول ← رتبه‌بندی ================= */
  var syncGems=null, syncCoins=null, syncTimer=null;
  function myPhoneNow(){ try{ return (window.currentUser&&currentUser.phone)||''; }catch(e){ return ''; } }
  function paintLive(gems){
    try{
      var v=document.getElementById('rkMyScoreVal');
      if(v) v.textContent=fa(gems);
    }catch(e){}
    var p=myPhoneNow();
    if(!p) return;
    try{
      var pill=document.querySelector('.rk-card[data-phone="'+p+'"] .rk-score-pill');
      if(pill){ var sp=pill.querySelectorAll('span'); if(sp.length>1) sp[sp.length-1].textContent=fa(gems); }
    }catch(e){}
  }
  function refreshRankingSoon(){
    if(syncTimer) clearTimeout(syncTimer);
    syncTimer=setTimeout(function(){
      var repaint=function(){ paintLive(syncGems); };
      try{
        var p=(typeof window.__foxRankingRefresh==='function')?window.__foxRankingRefresh(true):null;
        if(p&&typeof p.then==='function') p.then(repaint).catch(repaint); else setTimeout(repaint,600);
      }catch(e){ setTimeout(repaint,600); }
    },650);
  }
  function onWalletChanged(w){
    if(!w) return;
    var g=Number(w.diamonds!=null?w.diamonds:w.gems)||0;
    var c=Number(w.foxCoins!=null?w.foxCoins:w.coins)||0;
    if(g===syncGems&&c===syncCoins) return;
    syncGems=g; syncCoins=c;
    paintLive(g);
    refreshRankingSoon();
  }
  /* ===== رهگیری خودکارِ جلسهٔ بازی: جایزه در هر دور، بدون خروج از بازی ===== */
  (function(){
    var curSession=null;
    var baseFetch=window.fetch.bind(window);
    window.fetch=function(input,opts){
      var isClaim=false, isStart=false;
      try{
        var u=new URL(typeof input==='string'?input:input.url, location.href);
        if(u.origin===location.origin){
          if(u.pathname==='/api/game/reward/claim') isClaim=true;
          if(u.pathname==='/api/game/session/start') isStart=true;
        }
      }catch(e){}
      if(isClaim && curSession && opts && typeof opts.body==='string'){
        try{ var b=JSON.parse(opts.body); b.sessionId=curSession; opts.body=JSON.stringify(b); }catch(e){}
      }
      var pr=baseFetch(input,opts);
      if(isClaim||isStart){
        pr=pr.then(function(r){
          try{
            r.clone().json().then(function(j){
              if(j&&j.ok){
                if(j.nextSessionId) curSession=j.nextSessionId;
                else if(j.sessionId) curSession=j.sessionId;
              }
            }).catch(function(){});
          }catch(e){}
          return r;
        });
      }
      return pr;
    };
  })();

  /* بروزرسانی خودکار رتبه‌بندی و کیف پول، هر ۶۰ ثانیه */
  setInterval(function(){
    try{ if(typeof window.__foxRankingRefresh==='function') window.__foxRankingRefresh(true); }catch(e){}
    try{ if(typeof window.refreshFoxWallet==='function') window.refreshFoxWallet(); }catch(e){}
  }, 60000);
  document.addEventListener('fox-wallet-updated',function(e){ onWalletChanged(e.detail); });
  document.addEventListener('fox-wallet-change',function(e){ onWalletChanged(e.detail); });
  (function(){
    var tries=0;
    function hook(){
      if(window.FoxWallet&&typeof window.FoxWallet.apply==='function'&&!window.FoxWallet.__foxSynced){
        var orig=window.FoxWallet.apply.bind(window.FoxWallet);
        window.FoxWallet.apply=function(w){
          var r=orig(w);
          try{ onWalletChanged(r||w); }catch(e){}
          return r;
        };
        window.FoxWallet.__foxSynced=true;
        return true;
      }
      return false;
    }
    if(!hook()){ var iv=setInterval(function(){ tries++; if(hook()||tries>80) clearInterval(iv); },250); }
  })();

  window.FoxStore={openCoinContact:openCoinContact};
})();
