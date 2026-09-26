
/* ═══ Robah Plus: platform bridge + theme bootstrap (before first paint) ═══
   The Android shell (MainActivity v1.0.5) intercepts window.prompt('__fox_push_v1__') in onJsPrompt.
   In a normal browser prompt() opens a real dialog (debug leak + session token + blocks the main thread),
   so the bridge only works in the native app and is a silent no-op everywhere else. */
(function(){
  var UA=navigator.userAgent||'';
  window.foxIsNativeApp=UA.indexOf('RobahPush/1')>=0;
  window.foxCloseOverlay=function(el){ if(!el) return; el.classList.remove('show','open','active','visible'); el.style.display='none'; el.setAttribute('data-fox-closed','1'); if(!el.__foxReopenObs && window.MutationObserver){ el.__foxReopenObs=new MutationObserver(function(){ var c=el.classList; if(el.getAttribute('data-fox-closed')==='1' && (c.contains('show')||c.contains('open')||c.contains('active')||c.contains('visible'))){ el.removeAttribute('data-fox-closed'); if(el.style.display==='none') el.style.removeProperty('display'); /* the opener only added a class → drop the closer's inline none */ } }); el.__foxReopenObs.observe(el,{attributes:true,attributeFilter:['class']}); } };
  window.foxPushBridge=function(payload){
    if(!window.foxIsNativeApp) return null;
    try{ return window.prompt('__fox_push_v1__',typeof payload==='string'?payload:JSON.stringify(payload||{})); }catch(e){ return null; }
  };
  /* Theme: one source (localStorage.fox_theme) → central tokens on html, before the UI renders */
  try{
    var c=localStorage.getItem('fox_theme');
    if(c && /^#[0-9a-fA-F]{6}$/.test(c)){
      var n=parseInt(c.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;
      var dk=function(x){return Math.max(0,Math.min(255,Math.round(x*0.8)));};
      var hx=function(x){return ('0'+x.toString(16)).slice(-2);};
      var st=document.documentElement.style;
      st.setProperty('--theme-primary',c); st.setProperty('--theme',c);
      st.setProperty('--theme-primary-rgb',r+','+g+','+b);
      st.setProperty('--theme-primary-strong','#'+hx(dk(r))+hx(dk(g))+hx(dk(b)));
      st.setProperty('--theme-primary-soft',c+'22');
    }
  }catch(e){}
})();
