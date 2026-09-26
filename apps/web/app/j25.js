
/* ===== جلوگیری از نمایش پیام‌های داخلیِ پل بومی در مرورگر ===== */
(function(){
  if(!window.prompt) return;
  var orig=window.prompt.bind(window);
  function uaHas(t){ try{ return (navigator.userAgent||'').indexOf(t)>=0; }catch(e){ return false; } }
  function jsBridge(){ try{ return !!(window.RobahPush||window.RobahNativeVoice||window.RobahNative||window.Android); }catch(e){ return false; } }
  function androidWebView(){ try{ return /;s*wv)/.test(navigator.userAgent||''); }catch(e){ return false; } }
  function nativeShell(){ return (uaHas('RobahPush/1')||uaHas('RobahNativeVoice/1')) && (androidWebView()||jsBridge()); }
  function internal(m){ return typeof m==='string' && /^__fox_[a-z0-9]+_vd+__$/i.test(m); }
  window.prompt=function(msg,def){
    if(internal(msg) && !nativeShell()){ try{ console.debug('[fox] native bridge skipped in browser'); }catch(e){} return null; }
    return orig(msg,def);
  };
})();
