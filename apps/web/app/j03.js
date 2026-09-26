
// Global Error Boundary - prevents white screen (non-destructive)
(function(){
  window.__foxErrors = [];
  window.addEventListener('error', function(e){
    try{
      window.__foxErrors.push({message:e.message, filename:e.filename, lineno:e.lineno});
      console.error('Global Error:', e.message, e.filename+':'+e.lineno);
      setTimeout(function(){
        try{
          var visible=0;
          document.querySelectorAll('section.view').forEach(function(v){
            try{ var cs=getComputedStyle(v); if(cs.display!=='none' && !v.classList.contains('hidden')) visible++; }catch(_){ if(!v.classList.contains('hidden')) visible++; }
          });
          var gcOn = document.querySelectorAll('.gc-view.on').length;
          if(gcOn>0) visible+=gcOn;
          if(visible===0){
            var v1=document.getElementById('view1');
            var vHome=document.getElementById('viewHome');
            var hasSession=false;
            try{ hasSession=!!localStorage.getItem('fox_session'); }catch(_){}
            var target = (hasSession && vHome) ? vHome : v1;
            if(target){
              target.classList.remove('hidden');
              try{ target.style.setProperty('display','flex','important'); }catch(_){ target.style.display='flex'; }
            }
            document.documentElement.classList.remove('auth-boot');
          }
        }catch(_){}
      }, 100);
    }catch(_){}
  });
  window.addEventListener('unhandledrejection', function(e){
    try{ console.error('Unhandled Rejection:', e.reason); }catch(_){}
  });
})();
