
/* ===== Soroush Plus Mini App Adapter =====
   The SDK loads async: a synchronous external script in head blocks HTML parsing, and when app.splus.ir
   is slow/unreachable (first browser load, VPN, weak network) the page stays white until the timeout. */
window.__soroushMiniApp = {active:false};
window.__foxSoroushAdapt = function(){ window.__soroushMiniApp = (function(){
  var WA = window.Soroush && window.Soroush.WebApp;
  if (!WA || !WA.initData) return {active:false};
  try { WA.ready(); WA.expand(); } catch(e){}
  var user = (WA.initDataUnsafe && WA.initDataUnsafe.user) || null;
  var theme = WA.themeParams || {};
  var root = document.documentElement;
  function applyTheme(){
    if(theme.bg_color) root.style.setProperty('--soroush-bg',theme.bg_color);
    if(theme.text_color) root.style.setProperty('--soroush-text',theme.text_color);
    if(theme.button_color) root.style.setProperty('--soroush-btn',theme.button_color);
    if(theme.secondary_bg_color) root.style.setProperty('--soroush-bg2',theme.secondary_bg_color);
    document.body.setAttribute('data-soroush-scheme', WA.colorScheme||'light');
  }
  applyTheme();
  try{ WA.onEvent('themeChanged', applyTheme); }catch(e){}
  return {
    active: true, user: user,
    userId: user && user.id,
    firstName: user && user.first_name,
    lastName: user && user.last_name,
    username: user && user.username,
    photoUrl: user && user.photo_url,
    initData: WA.initData,
    close: function(){ try{WA.close();}catch(e){} },
    haptic: function(type){
      try{
        if(type==='success'||type==='error'||type==='warning') WA.HapticFeedback.notificationOccurred(type);
        else WA.HapticFeedback.impactOccurred(type||'medium');
      }catch(e){}
    }
  };
})(); };
(function(){ try{ var sdk=document.createElement('script'); sdk.src='https://app.splus.ir/js/soroush-web-app.js'; sdk.async=true;
  sdk.onload=function(){ try{ window.__foxSoroushAdapt(); }catch(e){} }; (document.head||document.documentElement).appendChild(sdk); }catch(e){} })();
