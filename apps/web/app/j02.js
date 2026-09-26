
// Ultra-early white-screen guard for mobile - runs before any other JS (non-destructive)
(function(){
  try{
    var tok = localStorage.getItem('fox_session');
    // Only clear obviously invalid string values, not valid tokens
    if(tok==='null' || tok==='undefined' || tok===''){
      localStorage.removeItem('fox_session');
      localStorage.removeItem('fox_user');
      document.documentElement.classList.remove('has-auth-session','auth-boot');
    }
    // Force show a view after 1.5s if nothing visible (mobile) - WITHOUT removing session
    setTimeout(function(){
      try{
        var views = document.querySelectorAll('section.view');
        var visible = 0;
        for(var i=0;i<views.length;i++){
          var v=views[i];
          try{
            var cs = window.getComputedStyle ? window.getComputedStyle(v) : v.style;
            if(cs && cs.display!=='none' && !v.classList.contains('hidden') && v.offsetHeight>5) visible++;
          }catch(_){
            if(!v.classList.contains('hidden')) visible++;
          }
        }
        var gcOn = document.querySelectorAll('.gc-view.on').length;
        if(visible===0 && gcOn===0){
          console.warn('Early guard: white screen detected, forcing visible view');
          // Do NOT remove session - keep user logged in
          document.documentElement.classList.remove('auth-boot');
          // Try to show viewHome if has session, else view1
          var hasSession = false;
          try{ hasSession = !!localStorage.getItem('fox_session'); }catch(_){}
          var targetId = hasSession ? 'viewHome' : 'view1';
          var vTarget = document.getElementById(targetId) || document.getElementById('view1');
          if(vTarget){
            vTarget.classList.remove('hidden');
            try{ vTarget.style.setProperty('display','flex','important'); }catch(_){ vTarget.style.display='flex'; }
            try{ vTarget.style.setProperty('visibility','visible','important'); }catch(_){ vTarget.style.visibility='visible'; }
            try{ vTarget.style.setProperty('opacity','1','important'); }catch(_){ vTarget.style.opacity='1'; }
          }
          document.body.style.display='block';
          document.body.style.visibility='visible';
          // Ensure bottom nav shows if has session
          try{
            if(hasSession){
              document.documentElement.classList.add('has-auth-session');
              var bnav=document.getElementById('bottomNav');
              if(bnav) bnav.classList.add('show');
            }
          }catch(_){}
        }
      }catch(e){}
    }, 1500);
  }catch(e){}
})();
