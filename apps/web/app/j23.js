
// Final force - ensure bottom nav and home visible if logged in
(function(){
  function forceNav(){
    try{
      var hasSession=false;
      try{ hasSession=!!localStorage.getItem('fox_session'); }catch(_){}
      if(hasSession){
        document.documentElement.classList.add('has-auth-session');
        if(window.__foxSyncNav) window.__foxSyncNav(); /* single source of truth for the bottom nav */
        // Ensure viewHome is visible if no other view is on
        var visible=0;
        document.querySelectorAll('section.view').forEach(function(v){
          try{
            var cs=getComputedStyle(v);
            if(cs.display!=='none' && !v.classList.contains('hidden')) visible++;
          }catch(_){}
        });
        var gcOn=document.querySelectorAll('.gc-view.on').length;
        if(visible===0 && gcOn===0){
          var vh=document.getElementById('viewHome');
          if(vh){
            vh.classList.remove('hidden');
            try{ vh.style.setProperty('display','flex','important'); }catch(_){ vh.style.display='flex'; }
          }
        }
      }
    }catch(e){}
  }
  setTimeout(forceNav, 800);
  setTimeout(forceNav, 2000);
  setTimeout(forceNav, 4000);
  window.addEventListener('load', function(){ setTimeout(forceNav, 500); });
})();
