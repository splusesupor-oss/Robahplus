
  /* شمارنده کاراکتر «درباره من» — فقط نمایشی؛ تغییری در داده یا منطق نمی‌دهد */
  (function(){
    try{
      var ta=document.getElementById('bioInput'), cnt=document.getElementById('bioCount');
      if(!ta||!cnt) return;
      var FA='۰۱۲۳۴۵۶۷۸۹';
      var MAX=parseInt(ta.getAttribute('maxlength'),10)||200;
      function fa(n){ return String(n).replace(/\d/g,function(d){return FA[+d];}); }
      function sync(){ try{ cnt.textContent=fa(ta.value.length)+'/'+fa(MAX); }catch(e){} }
      ta.addEventListener('input',sync);
      ta.addEventListener('change',sync);
      sync();
    }catch(e){}
  })();
  