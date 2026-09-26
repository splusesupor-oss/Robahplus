
  (function(){
    var ov=document.getElementById('planOverlay');
    if(!ov) return;
    var closeBtn=document.getElementById('planClose');
    function openPlanPanel(){
      ov.classList.add('open');
      ov.setAttribute('aria-hidden','false');
      if(closeBtn){ try{ closeBtn.focus(); }catch(e){} }
    }
    function closePlanPanel(){
      ov.classList.remove('open');
      ov.setAttribute('aria-hidden','true');
    }
    if(closeBtn) closeBtn.addEventListener('click', closePlanPanel);
    ov.addEventListener('click', function(e){ if(e.target===ov) closePlanPanel(); });
    document.addEventListener('keydown', function(e){ if((e.key==='Escape'||e.key==='Esc')&&ov.classList.contains('open')) closePlanPanel(); });
    var navBtn=document.querySelector('#bottomNav button[data-go="plan"]');
    if(navBtn) navBtn.addEventListener('click', openPlanPanel);
    window.openPlanPanel=openPlanPanel;
    window.closePlanPanel=closePlanPanel;
    try{
      var cards=document.querySelectorAll('#planOverlay .plan-card');
      for(var i=0;i<cards.length;i++){
        var t=cards[i].textContent||'';
        if(t.indexOf('هوش مصنوعی روباه')!==-1){
          cards[i].id='btnPlanAi';
          var sb=cards[i].querySelector('.plan-soon');
          if(sb) sb.remove();
          cards[i].addEventListener('click', function(e){ e.preventDefault(); location.href='/ai'; });
        }

          if(t.indexOf('گروه روباه')!==-1){
            cards[i].id='btnPlanGroup';
            var sbg=cards[i].querySelector('.plan-soon');
            if(sbg) sbg.remove();
            cards[i].insertAdjacentHTML('beforeend','<span class="plan-ext"><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M9 7h8v8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>');
            cards[i].addEventListener('click', function(e){ e.preventDefault(); window.open('https://splus.ir/joingroup/AI_hfuzaN9GGKPWF0MsDJg','_blank','noopener'); });
          }
          if(t.indexOf('ربات سروش پلاس روباه')!==-1){
            cards[i].id='btnPlanBot';
            var sbb=cards[i].querySelector('.plan-soon');
            if(sbb) sbb.remove();
            cards[i].insertAdjacentHTML('beforeend','<span class="plan-ext"><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M9 7h8v8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>');
            cards[i].addEventListener('click', function(e){ e.preventDefault(); window.open('https://splus.ir/Aifox_bot','_blank','noopener'); });
          }
      }
      var btnCr = document.getElementById('btnPlanCreator');
      if (btnCr) {
        btnCr.addEventListener('click', function(e) {
          e.preventDefault();
          if (typeof window.closePlanPanel === 'function') window.closePlanPanel();
          else { var po = document.getElementById('planOverlay'); if (po) po.classList.remove('open'); }
          if (typeof window.openCreatorModal === 'function') window.openCreatorModal();
        });
      }
      var btnSp = document.getElementById('btnPlanSupport');
      if (btnSp) {
        btnSp.addEventListener('click', function(e) {
          e.preventDefault();
          if (typeof window.closePlanPanel === 'function') window.closePlanPanel();
          else { var po = document.getElementById('planOverlay'); if (po) po.classList.remove('open'); }
          if (typeof window.openSupportModal === 'function') window.openSupportModal();
        });
      }
      document.addEventListener('click', function(e) {
        var bCr = e.target.closest && e.target.closest('#btnPlanCreator');
        if (bCr) {
          e.preventDefault();
          if (typeof window.closePlanPanel === 'function') window.closePlanPanel();
          else { var po = document.getElementById('planOverlay'); if (po) po.classList.remove('open'); }
          if (typeof window.openCreatorModal === 'function') window.openCreatorModal();
          return;
        }
        var bSp = e.target.closest && e.target.closest('#btnPlanSupport');
        if (bSp) {
          e.preventDefault();
          if (typeof window.closePlanPanel === 'function') window.closePlanPanel();
          else { var po = document.getElementById('planOverlay'); if (po) po.classList.remove('open'); }
          if (typeof window.openSupportModal === 'function') window.openSupportModal();
          return;
        }
      });
    }catch(e){}
  })();
  