
  (function(){
    try {
      var tok = localStorage.getItem('fox_session');
      var usr = localStorage.getItem('fox_user');
      if (tok && usr && tok !== 'null' && tok !== 'undefined') {
        document.documentElement.classList.add('has-auth-session');
        /* auth-boot فقط برای جلوگیری از پرش صفحه هنگام لود اولیه است.
           بعد از آماده شدن صفحه حذف می‌شود تا دکمه‌های ورود/خروج کار کنند. */
        document.documentElement.classList.add('auth-boot');
        var drop = function(){ document.documentElement.classList.remove('auth-boot'); };
        if (document.readyState === 'complete') setTimeout(drop, 0);
        else window.addEventListener('load', function(){ setTimeout(drop, 50); });
        /* تضمین: حتی اگر load شلیک نشد، حداکثر بعد از ۳ ثانیه آزاد شود */
        setTimeout(drop, 3000);
      }
    } catch(e) {}
  })();
