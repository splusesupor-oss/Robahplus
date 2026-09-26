
(function(){
  // ---- Fox Font Generator (self-contained, template-literal safe) ----
  function cp(n){ return String.fromCodePoint(n); }
  function rng(upperBase, lowerBase, digitBase, exUp, exLo){
    return { type:'range', upperBase:upperBase, lowerBase:lowerBase, digitBase:digitBase||0, exUp:exUp||{}, exLo:exLo||{} };
  }
  function ex(pairs){ var o={}; for(var i=0;i<pairs.length;i++){ o[pairs[i][0]]=cp(pairs[i][1]); } return o; }
  var italicHolesUp = ex([['B',0x212C],['E',0x2130],['F',0x2131],['H',0x210B],['I',0x2110],['L',0x2112],['M',0x2133],['R',0x211B]]);
  var italicHolesLo = ex([['e',0x212F],['g',0x210A],['o',0x2134]]);
  var frakturHolesUp = ex([['C',0x212D],['H',0x210C],['I',0x2111],['R',0x211C],['Z',0x2128]]);
  var dsHolesUp = ex([['C',0x2102],['H',0x210D],['N',0x2115],['P',0x2119],['Q',0x211A],['R',0x211D],['Z',0x2124]]);
  var FONT_STYLES = [
    { id:'monospace', title:'Monospace', order:1, enabled:true, map:rng(0x1D670,0x1D68A,0x1D7F6) },
    { id:'bold', title:'Bold', order:2, enabled:true, map:rng(0x1D400,0x1D41A,0x1D7CE) },
    { id:'italic', title:'Italic', order:3, enabled:true, map:rng(0x1D434,0x1D44E,0,italicHolesUp,italicHolesLo) },
    { id:'boldItalic', title:'Bold Italic', order:4, enabled:true, map:rng(0x1D468,0x1D482) },
    { id:'sans', title:'Sans', order:5, enabled:true, map:rng(0x1D5A0,0x1D5BA,0x1D7E2) },
    { id:'sansBold', title:'Sans Bold', order:6, enabled:true, map:rng(0x1D5D4,0x1D5EE,0x1D7EC) },
    { id:'sansItalic', title:'Sans Italic', order:7, enabled:true, map:rng(0x1D608,0x1D622) },
    { id:'sansBoldItalic', title:'Sans Bold Italic', order:8, enabled:true, map:rng(0x1D63C,0x1D656) },
    { id:'doubleStruck', title:'Double-Struck', order:9, enabled:true, map:rng(0x1D538,0x1D552,0x1D7D8,dsHolesUp) },
    { id:'script', title:'Script', order:10, enabled:true, map:rng(0x1D49C,0x1D4B6,0,italicHolesUp,italicHolesLo) },
    { id:'boldScript', title:'Bold Script', order:11, enabled:true, map:rng(0x1D4D0,0x1D4EA) },
    { id:'gothic', title:'Gothic', order:12, enabled:true, map:rng(0x1D504,0x1D51E,0,frakturHolesUp) },
    { id:'boldGothic', title:'Bold Gothic', order:13, enabled:true, map:rng(0x1D56C,0x1D586) },
    { id:'fullwidth', title:'Fullwidth', order:14, enabled:true, map:rng(0xFF21,0xFF41,0xFF10) },
    { id:'circled', title:'Circled', order:15, enabled:true, map:{type:'circled'} },
    { id:'smallCaps', title:'Small Caps', order:16, enabled:true, map:{type:'smallcaps'} },
    { id:'decorative', title:'Decorative', order:17, enabled:true, map:{type:'decorative'} }
  ];
  var SMALL = { a:0x1D00,b:0x0299,c:0x1D04,d:0x1D05,e:0x1D07,f:0xA730,g:0x0262,h:0x029C,i:0x026A,j:0x1D0A,k:0x1D0B,l:0x029F,m:0x1D0D,n:0x0274,o:0x1D0F,p:0x1D18,q:0x0071,r:0x0280,s:0xA731,t:0x1D1B,u:0x1D1C,v:0x1D20,w:0x1D21,x:0x0078,y:0x028F,z:0x1D22 };
  var DECO = [0x0301,0x0300,0x0342,0x033E,0x0345,0x032F];
  function isUp(c){ return c>='A' && c<='Z'; }
  function isLo(c){ return c>='a' && c<='z'; }
  function isDig(c){ return c>='0' && c<='9'; }
  function applyRange(str,m){
    var out='';
    for(var i=0;i<str.length;i++){
      var c=str[i];
      if(isUp(c)){ out += m.exUp[c] ? m.exUp[c] : cp(m.upperBase + (c.charCodeAt(0)-65)); }
      else if(isLo(c)){ out += (m.exLo && m.exLo[c]) ? m.exLo[c] : cp(m.lowerBase + (c.charCodeAt(0)-97)); }
      else if(isDig(c)){ out += m.digitBase ? cp(m.digitBase + (c.charCodeAt(0)-48)) : c; }
      else { out += c; }
    }
    return out;
  }
  function applyCircled(str){
    var out='';
    for(var i=0;i<str.length;i++){
      var c=str[i], cc=c.charCodeAt(0);
      if(isUp(c)) out += cp(0x24B6 + (cc-65));
      else if(isLo(c)) out += cp(0x24D0 + (cc-97));
      else if(c>='1' && c<='9') out += cp(0x2460 + (cc-49));
      else if(c==='0') out += cp(0x24EA);
      else out += c;
    }
    return out;
  }
  function applySmallCaps(str){
    var out='';
    for(var i=0;i<str.length;i++){ var c=str[i]; out += isLo(c) ? cp(SMALL[c]) : c; }
    return out;
  }
  function applyDecorative(str){
    var out='', k=0;
    for(var i=0;i<str.length;i++){
      var c=str[i], cc=c.charCodeAt(0);
      var letter = (cc>=65&&cc<=90)||(cc>=97&&cc<=122)||(cc>=0x0600&&cc<=0x06FF);
      out += c;
      if(letter){ out += cp(DECO[k % DECO.length]); k++; }
    }
    return out;
  }
  function transformOne(str,style){
    var m=style.map; if(!m) return str;
    if(m.type==='range') return applyRange(str,m);
    if(m.type==='circled') return applyCircled(str);
    if(m.type==='smallcaps') return applySmallCaps(str);
    if(m.type==='decorative') return applyDecorative(str);
    return str;
  }
  function transform(text){
    var t = String(text==null?'':text);
    if(t.trim()==='') return [];
    var active = FONT_STYLES.filter(function(s){ return s.enabled; }).sort(function(a,b){ return a.order-b.order; });
    return active.map(function(s){ return { id:s.id, title:s.title, text: transformOne(t,s) }; });
  }

  // ---- UI ----
  var overlay=document.getElementById('foxFontOverlay');
  if(!overlay) return;
  var input=document.getElementById('foxFontInput');
  var list=document.getElementById('foxFontList');
  var empty=document.getElementById('foxFontEmpty');
  var closeBtn=document.getElementById('foxFontClose');
  var toastEl=document.getElementById('foxFontToast');

  function showToast(msg){
    if(!toastEl) return;
    toastEl.textContent=msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t=setTimeout(function(){ toastEl.classList.remove('show'); },2200);
  }
  function escapeHtml(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function render(){
    var val=input?input.value:'';
    var res=transform(val);
    if(!res.length){
      if(list) list.innerHTML='';
      if(empty) empty.style.display='';
      return;
    }
    if(empty) empty.style.display='none';
    if(!list) return;
    var html='';
    for(var i=0;i<res.length;i++){
      var r=res[i];
      html += '<div class="foxfont-row">'
            +   '<div class="foxfont-row-top">'
            +     '<span class="foxfont-style-name">'+escapeHtml(r.title)+'</span>'
            +     '<button type="button" class="foxfont-copy" data-copy="'+r.id+'" aria-label="کپی">کپی</button>'
            +   '</div>'
            +   '<div class="foxfont-text" dir="auto" data-text="'+r.id+'">'+escapeHtml(r.text)+'</div>'
            + '</div>';
    }
    list.innerHTML=html;
  }
  function copyText(txt){
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(function(){ showToast('کپی شد ✓'); }, function(){ fallbackCopy(txt); });
    } else { fallbackCopy(txt); }
  }
  function fallbackCopy(txt){
    try{
      var ta=document.createElement('textarea');
      ta.value=txt; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.top='-1000px';
      document.body.appendChild(ta); ta.select();
      var ok=document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(ok?'کپی شد ✓':'کپی نشد؛ دستی انتخاب کن');
    }catch(e){ showToast('کپی نشد؛ دستی انتخاب کن'); }
  }
  function openPanel(){
    overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false');
    setTimeout(function(){ if(input){ try{ input.focus(); }catch(e){} } },60);
  }
  function closePanel(){ overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true'); }
  if(closeBtn) closeBtn.addEventListener('click',closePanel);
  overlay.addEventListener('click',function(e){ if(e.target===overlay) closePanel(); });
  document.addEventListener('keydown',function(e){ if((e.key==='Escape'||e.key==='Esc')&&overlay.classList.contains('open')) closePanel(); });
  if(input) input.addEventListener('input',render);
  if(list) list.addEventListener('click',function(e){
    var btn=e.target.closest ? e.target.closest('.foxfont-copy') : null;
    if(!btn) return;
    var id=btn.getAttribute('data-copy');
    var node=list.querySelector('[data-text="'+id+'"]');
    if(node) copyText(node.textContent||'');
  });

  // Inject the "فونت اسم" card into the Plans grid
  function addPlanCard(){
    var grid=document.querySelector('#planOverlay .plan-grid');
    if(!grid) return;
    if(document.getElementById('foxFontPlanCard')) return;
    var card=document.createElement('button');
    card.type='button'; card.className='plan-card'; card.id='foxFontPlanCard';
    card.innerHTML='<span class="plan-ic pc-ai"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20l4.5-1 9-9-3.5-3.5-9 9L4 20z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span><b>فونت اسم</b>';
    card.addEventListener('click',function(e){ e.preventDefault(); openPanel(); });
    grid.appendChild(card);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addPlanCard);
  else addPlanCard();
  render();
})();
