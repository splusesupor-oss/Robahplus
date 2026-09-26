(function(){
  var banner = null;
  function ensure(){
    if(!banner){
      banner=document.createElement('div');
      banner.id='foxOfflineBanner';
      banner.style.cssText='position:fixed;z-index:2147483647;left:12px;right:12px;bottom:12px;padding:10px 14px;border-radius:14px;background:#593b31;color:#fff8f2;font:700 12px Vazirmatn, sans-serif;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.18);display:none';
      document.body.appendChild(banner);
    }
    return banner;
  }
  function render(){
    var b=ensure();
    if(!navigator.onLine){ b.textContent='حالت آفلاین فعال است؛ بازی‌های تک‌نفره و اطلاعات ذخیره‌شده روی دستگاه در دسترس‌اند.'; b.style.display='block'; }
    else { b.textContent='اتصال برقرار شد؛ قابلیت‌های آنلاین دوباره فعال هستند.'; b.style.display='block'; setTimeout(function(){ if(b) b.style.display='none'; },2200); }
  }
  window.addEventListener('offline',render); window.addEventListener('online',render);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',render); else render();
  if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(e){ try{console.warn('offline cache unavailable',e); }catch(_){} }); }
})();
