
  // Fallback to prevent white screen: if after 2.5s no view visible, force view (non-destructive)
  (function(){
    function forceVisible(){
      try{
        var visible=0;
        document.querySelectorAll('section.view').forEach(function(v){
          try{
            var cs=getComputedStyle(v);
            if(cs.display!=='none' && !v.classList.contains('hidden')) visible++;
          }catch(_){
            if(!v.classList.contains('hidden')) visible++;
          }
        });
        var gcViews = document.querySelectorAll('.gc-view.on');
        if(gcViews.length>0) visible+=gcViews.length;
        if(visible===0){
          console.warn('Fallback: white screen detected, forcing view');
          var hasSession=false;
          try{ hasSession=!!localStorage.getItem('fox_session'); }catch(_){}
          var targetId = hasSession ? 'viewHome' : 'view1';
          var vTarget = document.getElementById(targetId) || document.getElementById('view1');
          if(vTarget){
            vTarget.classList.remove('hidden');
            try{ vTarget.style.setProperty('display','flex','important'); }catch(_){ vTarget.style.display='flex'; }
            try{ vTarget.style.setProperty('visibility','visible','important'); }catch(_){ vTarget.style.visibility='visible'; }
            try{ vTarget.style.setProperty('opacity','1','important'); }catch(_){ vTarget.style.opacity='1'; }
          }
          try{ document.documentElement.classList.remove('auth-boot'); }catch(_){}
          try{
            if(hasSession){
              document.documentElement.classList.add('has-auth-session');
              var bnav=document.getElementById('bottomNav');
              if(bnav) bnav.classList.add('show');
            }
          }catch(_){}
        }
      }catch(e){ console.error('Fallback error', e); }
    }
    setTimeout(forceVisible, 1500);
    setTimeout(forceVisible, 2500);
    setTimeout(forceVisible, 4000);
    window.addEventListener('load', function(){ setTimeout(forceVisible, 500); });
  })();
