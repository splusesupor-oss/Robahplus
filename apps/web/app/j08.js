
  (function(){
    'use strict';
    var FA='۰۱۲۳۴۵۶۷۸۹';
    function faNum(n){ return String(n==null?0:n).replace(/[0-9]/g, function(d){ return FA[+d]; }); }
    function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
    var COIN_SVG='<svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#f5a623"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#fff" stroke-width="2"/></svg>';
    var GEM_SVG='<svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10l4 6-9 10L3 10z" fill="#38bdf8" stroke="#fff" stroke-width="1.4"/><path d="M3 10h18M7 4l5 6 5-6M12 10l0 10" stroke="#fff" stroke-width="1.2" fill="none"/></svg>';
    var SPENT_SVG='<svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M7 7l10 10M17 7L7 17" stroke="#b3541e" stroke-width="2.2" stroke-linecap="round"/></svg>';
    var GAME_SVG='<svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="7" width="19" height="12" rx="6" fill="#22a050"/><path d="M8.5 11v4M6.5 13h4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="15.5" cy="12" r="1.3" fill="#fff"/><circle cx="18" cy="14.5" r="1.3" fill="#fff"/></svg>';
    function auth(){
      try{
        var u=(typeof currentUser!=='undefined'&&currentUser)?currentUser:JSON.parse(localStorage.getItem('fox_user')||'null');
        var t=localStorage.getItem('fox_session')||'';
        if(u&&u.phone) return {phone:u.phone,token:t};
      }catch(e){}
      return null;
    }
    function fmtDate(ts){
      try{
        if(!ts) return '';
        return new Date(ts).toLocaleDateString('fa-IR');
      }catch(e){ return ''; }
    }
    function charThumb(id){
      try{
        if(window.FOX_CHARS_IMG&&window.FOX_CHARS_IMG[id]) return window.FOX_CHARS_IMG[id].s;
      }catch(e){}
      return '';
    }
    function charName(id){
      try{
        if(window.FOX_CHARS_IMG&&window.FOX_CHARS_IMG[id]&&window.FOX_CHARS_IMG[id].n) return window.FOX_CHARS_IMG[id].n;
      }catch(e){}
      return 'کاراکتر روباه';
    }
    function itemMeta(h){
      var kind=h.kind||'';
      if(kind==='chars') return {t:charName(h.id), img:charThumb(h.id), p:(faNum(h.price||0)+' سکه')};
      if(kind==='coins') return {t:'بسته سکه', dot:'c', dotT:'+', p:('+'+faNum(h.amount||0)+' سکه')};
      if(kind==='gems') return {t:'بسته الماس', dot:'g', dotT:'◆', p:('+'+faNum(h.amount||0)+' الماس')};
      if(kind==='titles') return {t:'نشان '+esc(h.id||''), dot:'', dotT:'✦', p:(faNum(Math.round((h.price||0)/1000))+' سکه')};
      if(kind==='stories') return {t:'بسته استوری', dot:'', dotT:'◉', p:(faNum(Math.round((h.price||0)/1000))+' سکه')};
      return {t:kind||'خرید', dot:'', dotT:'•', p:(h.price?(faNum(h.price)+' سکه'):'')};
    }
    function openFxwPanel(){
      var ov=document.getElementById('fxwOverlay');
      if(!ov) return;
      ov.classList.add('open');
      ov.setAttribute('aria-hidden','false');
      var c=document.getElementById('fxwClose');
      if(c){ try{ c.focus(); }catch(e){} }
      loadWallet();
    }
    function closeFxwPanel(){
      var ov=document.getElementById('fxwOverlay');
      if(!ov) return;
      ov.classList.remove('open');
      ov.setAttribute('aria-hidden','true');
    }
    window.openFxwPanel=openFxwPanel;
    window.closeFxwPanel=closeFxwPanel;
    function renderGuest(){
      var body=document.getElementById('fxwBody');
      if(body) body.innerHTML='<div class="fxw-guest">برای مشاهده موجودی سکه و الماس،<br>اول یک حساب بساز یا وارد شو</div>';
    }
    function renderWallet(w){
      var body=document.getElementById('fxwBody');
      if(!body) return;
      var hist=w.history||[];
  
      var items='';
      if(!hist.length){
        items='<div class="fxw-empty">هنوز چیزی نخریدی</div>';
      } else {
        for(var i=0;i<hist.length;i++){
          var m=itemMeta(hist[i]);
          var icon=m.img?'<img src="'+m.img+'" alt="" width="38" height="38" loading="lazy"/>':'<span class="fxw-dot '+(m.dot||'')+'">'+m.dotT+'</span>';
          items+='<div class="fxw-item">'+icon+'<div class="fxw-info"><b>'+m.t+'</b><span>'+fmtDate(hist[i].at)+'</span></div><span class="fxw-price">'+m.p+'</span></div>';
        }
      }
      body.innerHTML='<div class="fxw-row">'+COIN_SVG+'<span>سکه روباه</span><b>'+faNum(w.coins||0)+'</b></div>'
        +'<div class="fxw-row">'+GEM_SVG+'<span>الماس</span><b>'+faNum(w.gems||0)+'</b></div>'
        +'<div class="fxw-row spent">'+SPENT_SVG+'<span>خرج‌شده</span><b>'+faNum(w.spent||0)+' سکه</b></div>'
        +'<div class="fxw-hist-title">تاریخچه خریدها <span class="fxw-count">'+faNum(hist.length)+'</span></div>'
        +'<div class="fxw-hist">'+items+'</div>'
        ;
    }
    function loadWallet(){
      if(!window.FoxWallet)return;var body=document.getElementById('fxwBody');
      if(window.FoxWallet.state)renderWallet(window.FoxWallet.state);
      else if(body)body.textContent='در حال دریافت موجودی واقعی…';
      window.FoxWallet.refresh().then(function(w){if(w)renderWallet(w);else if(body)body.textContent='دریافت موجودی ناموفق؛ دوباره تلاش کنید.';});
    }
    window.refreshFoxWallet=function(){return window.FoxWallet&&window.FoxWallet.refresh();};
    window.addEventListener('fox-wallet-change',function(e){var ov=document.getElementById('fxwOverlay');if(ov&&ov.classList.contains('open'))renderWallet(e.detail);});
    window.addEventListener('fox-wallet-reset',renderGuest);
    (function init(){
      var ov=document.getElementById('fxwOverlay');
      if(!ov) return;
      var closeBtn=document.getElementById('fxwClose');
      if(closeBtn) closeBtn.addEventListener('click', closeFxwPanel);
      ov.addEventListener('click', function(e){ if(e.target===ov) closeFxwPanel(); });
      document.addEventListener('keydown', function(e){
        if((e.key==='Escape'||e.key==='Esc')&&ov.classList.contains('open')) closeFxwPanel();
      });
      try{
        var cards=document.querySelectorAll('#planOverlay .plan-card');
        for(var i=0;i<cards.length;i++){
          var t=cards[i].textContent||'';
          if(t.indexOf('موجودی من')!==-1){
            cards[i].addEventListener('click', function(e){
              e.preventDefault();
              if(typeof window.closePlanPanel==='function') window.closePlanPanel();
              else { var po=document.getElementById('planOverlay'); if(po) po.classList.remove('open'); }
              openFxwPanel();
            });
          }
        }
      }catch(e){}
    })();
  })();
  