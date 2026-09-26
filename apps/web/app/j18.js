
// ===== ROABH PLUS v1.0.6 - FINAL JS =====
const FOX_BOT_CONFIG = {
  swearWords: ["کص","کیر","جنده","حرومزاده","بی ناموس","کس","کون","خارکص","مادرجنده","بی شرف","احمق","گه","گوه","کسخل","کصخل","کیرخر","جاکش","خایه","تخم","سگ","حیوان","نفهم","بی شعور","عوضی","لاشی","پدرسگ","مادرتو","fuck","shit","bitch","asshole","کس ننت","کیرم","کص ننت"],
  autoReplies: {
    "سلام": "سلام روباه عزیز! 🦊 خوش اومدی به گروه روباه پلاس!",
    "سلام روباه": "سلام! من ربات نگهبان گروه روباه هستم 🤖 چطور می‌تونم کمکت کنم؟",
    "خوبی؟": "مرسی، عالی‌ام! 😊 تو چطوری؟",
    "چطوری؟": "عالی! مثل یه روباه باهوش 🦊✨",
    "چه خبر؟": "همه چی آرومه تو جنگل روباه‌ها 🌲 اخبار جدید رو تو گروه دنبال کن!",
    "ربات": "بله؟ من اینجام! برای راهنما کلمه 'راهنما' رو بفرست 📚",
    "راهنما": "📚 راهنمای گروه روباه:\n- سلام کن تا جواب بدم!\n- فحش نده، پیامت حذف می‌شه ⚠️\n- برای ساخت گروه روی + بزن (399 الماس)\n- برای مدیریت، اگه Owner هستی روی مدیریت کلیک کن\n- بازی‌ها رو از بخش سرگرمی‌ها امتحان کن 🎮"
  },
  cooldownMs: 5000,
  lastReply: {}
};
const FOX_PERMISSIONS = {
  owner: ["manage_members","mute_members","ban_members","unban_members","delete_messages","pin_messages","view_reports","manage_bot","edit_group","manage_admins"],
  admin: ["manage_members","mute_members","ban_members","unban_members","delete_messages","pin_messages","view_reports","manage_bot"],
  member: []
};
const FOX_GROUPS_CONFIG = { creationCost: 399, currency: "diamonds" };

// BottomNav Fix - auth-aware (v2)
(function fixBottomNavFinal(){
  const style = document.createElement('style');
  style.textContent =
    'html.has-auth-session #bottomNav.show{display:flex !important}' +
    '#viewFun,#funView{padding-bottom:calc(90px + env(safe-area-inset-bottom,0px)) !important}' +
    '#viewChat,#viewChat .chat-wrap,#viewDooz,#viewMensh,#viewDM,#viewGame,.game-view{padding-bottom:0 !important}' +
    /* صفحات احراز هویت همیشه بالاتر از منوی پایین و FABها بمانند */
    '#view1,#viewLogin,#viewLoginCode,#viewRegisterCode,#view2,#viewRules{z-index:2000;background:radial-gradient(circle at 50% 30%, #FFF1DE 0%, var(--cream) 60%);}' +
    /* وقتی کاربر لاگین نیست، منوی پایین و دکمه‌های شناور هرگز دیده نشوند */
    'html:not(.has-auth-session) #bottomNav,' +
    'html:not(.has-auth-session) .fabs-group,' +
    'html:not(.has-auth-session) #createGroupFab{display:none !important;}';
  document.head.appendChild(style);

  /* آیا کاربر واقعاً وارد حساب شده؟ */
  function isAuthed(){
    try{
      var tok = localStorage.getItem('fox_session');
      var usr = localStorage.getItem('fox_user');
      return !!(tok && usr && tok !== 'null' && tok !== 'undefined');
    }catch(e){ return false; }
  }
  /* منو فقط در همین پنج صفحهٔ اصلیِ تب‌های پایین مجاز است.
     هر جای دیگری (بازی‌ها، چت گروه، چت خصوصی، تنظیمات ادمین و ...) باید پنهان باشد. */
  var NAV_ALLOWED = ['viewHome','viewGroups','viewFun','viewDMList','viewSettings'];
  /* «سرگرمی‌ها» فقط در فهرست بازی‌ها منو دارد؛ داخل خود بازی نه.
     این شناسه‌ها یعنی یک بازی واقعاً باز است. */
  var GAME_VIEWS = ['viewBow','viewTank','viewDooz','viewDots','viewMensh','viewMemory',
                    'viewQuiz','viewSudoku','viewWords','viewGame','viewAdmin','viewDM'];

  /* نکته: عناصری مثل #viewChat با position:fixed هستند و offsetParent آن‌ها null است،
     پس نمی‌توان فقط به offsetParent تکیه کرد. */
  function isVisible(el){
    if (!el || el.classList.contains('hidden')) return false;
    if (el.offsetParent !== null) return true;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    return (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);
  }
  /* آیا صفحه‌ای که الان باز است، اجازهٔ نمایش منو را دارد؟ */
  function navAllowedHere(){
    var i, el;
    /* اگر هر بازی/صفحهٔ تمام‌صفحه باز است → منو نه */
    for (i=0;i<GAME_VIEWS.length;i++){
      if (isVisible(document.getElementById(GAME_VIEWS[i]))) return false;
    }
    /* موتورهای بازی که خودشان روت جدا می‌سازند (تیر و کمان، روباه دونده، طناب‌بازی و ...) */
    var feRoot = document.getElementById('feRoot');
    if (feRoot && feRoot.classList.contains('feOn')) return false;
    var rfa = document.getElementById('ropeFoxApp');
    if (isVisible(rfa)) return false;
    var wba = document.getElementById('wbaApp');
    if (isVisible(wba)) return false;
    /* فقط اگر یکی از پنج صفحهٔ مجاز باز باشد */
    for (i=0;i<NAV_ALLOWED.length;i++){
      if (isVisible(document.getElementById(NAV_ALLOWED[i]))) return true;
    }
    return false;
  }

  /* آخرین وضعیت اعمال‌شده؛ فقط وقتی واقعاً عوض شد DOM را دست می‌زنیم.
     نکته: هرگز MutationObserver روی style/class نگذارید — چون خود این تابع
     همان صفت‌ها را تغییر می‌دهد و حلقه‌ی بی‌نهایت می‌سازد و صفحه قفل می‌شود. */
  var lastState = null;
  function syncNav(){
    var bn = document.getElementById('bottomNav');
    if(!bn) return;
    var authed = isAuthed();
    var ok = authed && navAllowedHere();
    /* کلید باید صفحهٔ فعلی را هم در بر بگیرد تا جابجایی بین خانه/چت/سرگرمی تشخیص داده شود */
    var cur = '';
    for (var k=0;k<NAV_ALLOWED.length;k++){
      if (isVisible(document.getElementById(NAV_ALLOWED[k]))) { cur = NAV_ALLOWED[k]; break; }
    }
    var key = (authed ? '1' : '0') + (ok ? '1' : '0') + cur;
    if (key === lastState && bn.classList.contains('show') === ok && bn.style.visibility === (ok ? 'visible' : 'hidden')) return;   /* هیچ تغییری لازم نیست */
    lastState = key;

    if (document.documentElement.classList.contains('has-auth-session') !== authed) {
      document.documentElement.classList.toggle('has-auth-session', authed);
    }
    if (ok){
      bn.classList.add('show');
      bn.style.display = 'flex';
      bn.style.visibility = 'visible';
    } else {
      /* روی صفحه ورود منو باید کاملاً پنهان شود */
      bn.classList.remove('show');
      bn.style.display = 'none';
      bn.style.visibility = 'hidden';
    }
    /* دکمه‌های شناور (جست‌وجو/جام) فقط در صفحهٔ خانه */
    var atHome = ok && isVisible(document.getElementById('viewHome'));
    var fg = document.querySelector('.fabs-group');
    if (fg) fg.style.display = atHome ? '' : 'none';
    /* دکمهٔ ساخت گروه قابلیت مستقل صفحهٔ چت است؛ چون در HTML داخل viewHome
       قرار داشت، هنگام چت موقتاً به body منتقل می‌شود تا با والد مخفی نشود. */
    var atChat = authed && isVisible(document.getElementById('viewChat'));
    var cg = document.getElementById('createGroupFab');
    if (cg) {
      if (atChat) {
        if (cg.parentNode !== document.body) document.body.appendChild(cg);
        cg.classList.add('in-chat'); cg.style.display = 'flex';
      } else if (atHome && fg) {
        if (cg.parentNode !== fg) fg.insertBefore(cg, fg.firstChild);
        cg.classList.remove('in-chat'); cg.style.display = '';
      } else {
        cg.classList.remove('in-chat'); cg.style.display = 'none';
      }
    }
  }
  /* اجازه بده کد دیگر بعد از ناوبری، وضعیت را فوراً تازه کند */
  window.__foxSyncNav = function(){ lastState = null; syncNav(); };

  document.addEventListener('DOMContentLoaded', syncNav);
  setInterval(syncNav, 1000); /* پشتیبان برای تغییرات غیرمعمول */
  document.addEventListener('DOMContentLoaded', function(){
    /* فقط تغییرات خود صفحه‌ها را ببین؛ bottomNav/FAB را هرگز observe نکن.
       بنابراین syncNav چیزی را که observer می‌بیند تغییر نمی‌دهد و حلقه ایجاد نمی‌شود. */
    var observer = new MutationObserver(function(muts){
      try{ if(window.foxLeaveGroupsUI && document.querySelector('.gc-view.on')){ for(var mi=0;mi<muts.length;mi++){ var tv=muts[mi].target;
        if(tv && tv.classList && tv.classList.contains('view') && !tv.classList.contains('hidden') && tv.style.display!=='none'){ window.foxLeaveGroupsUI(tv.id); break; } } } }catch(e){}
      window.__foxSyncNav(); });
    document.querySelectorAll('section.view, section.gc-view').forEach(function(el){
      observer.observe(el, {attributes:true, attributeFilter:['class','style']});
    });
    ['feRoot','ropeFoxApp','wbaApp'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) observer.observe(el, {attributes:true, attributeFilter:['class','style']});
    });
  });
  var origOpenChat = window.openChat;
  if(origOpenChat){
    window.openChat = function(){ var r=origOpenChat.apply(this,arguments); setTimeout(window.__foxSyncNav,100); return r; };
  }
})();

// ================= Ghost Protection UI (PV only) =================
(function GhostProtectionModule(){
  'use strict';
  var state={peer:'',status:null,busy:false,tokens:new Map(),gatePeer:'',support:'unsupported'};
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function endpoint(peer,path){return '/private-chats/'+encodeURIComponent(peer)+'/'+path;}
  async function req(path,opt){
    opt=opt||{};opt.headers=Object.assign({'content-type':'application/json'},opt.headers||{});
    var r=await api(endpoint(state.peer,path),opt),j=await r.json().catch(function(){return {};});
    if(!r.ok){var e=new Error(j.error||'request_failed');e.status=r.status;e.data=j;throw e;}return j;
  }
  function token(peer){var x=state.tokens.get(String(peer||''));return x&&x.expiresAt>Date.now()?x.token:'';}
  function prepareRows(rows){
    var t=token(state.peer);if(!t||!Array.isArray(rows))return rows||[];
    return rows.map(function(m){if(!m||!m.media||!m.media.url)return m;var copy=Object.assign({},m),media=Object.assign({},m.media);media.url+=(media.url.indexOf('?')>=0?'&':'?')+'ghost_unlock='+encodeURIComponent(t);copy.media=media;return copy;});
  }
  function setHeader(){
    var b=$('foxGhostBtn'),s=$('foxGhostStatus');if(!b||!s)return;
    var st=state.status||{};b.classList.toggle('is-on',!!st.ghost);b.classList.toggle('is-plus',!!st.plus);
    b.setAttribute('aria-pressed',st.ghost?'true':'false');
    s.textContent=st.plus?'پلاس فعال':st.ghost?'فعال':'';s.hidden=!st.ghost;
  }
  function toast(t){if(window.foxToast)foxToast(t);else if(window.showToast)showToast(t);}
  function ensureUI(){
    if($('foxGhostSheet'))return;
    var style=document.createElement('style');style.textContent=`
:root{--control-radius:16px;}
.ghost-list-btn{width:42px;height:42px;border:1px solid var(--theme-border);border-radius:50%;display:grid;place-items:center;background:var(--theme-surface);color:var(--theme-icon);font-size:22px;cursor:pointer;transition:.18s transform,.18s background,.18s box-shadow;flex:0 0 auto}.ghost-list-btn:hover{background:var(--theme-primary-soft)}.ghost-list-btn:active{transform:scale(.92)}.ghost-list-btn:focus-visible{outline:3px solid var(--theme-primary-soft);outline-offset:2px}.ghost-list-btn.is-on{background:var(--theme-primary-soft);box-shadow:0 0 0 2px var(--theme-primary)}.ghost-list-status{font-size:11px;font-weight:800;white-space:nowrap;color:var(--theme-primary-text)}
.ghost-backdrop{position:fixed;inset:0;background:rgba(15,18,22,.48);z-index:5000;opacity:0;pointer-events:none;transition:opacity .2s}.ghost-backdrop.open{opacity:1;pointer-events:auto}.ghost-sheet{position:absolute;left:0;right:0;bottom:0;max-width:560px;margin:auto;background:var(--theme-surface);color:var(--theme-text);border-radius:26px 26px 0 0;padding:10px 16px calc(18px + env(safe-area-inset-bottom,0px));transform:translateY(105%);transition:transform .24s cubic-bezier(.2,.8,.2,1);box-shadow:0 -14px 40px rgba(0,0,0,.2);touch-action:pan-y}.ghost-backdrop.open .ghost-sheet{transform:translateY(0)}.ghost-handle{width:44px;height:5px;border-radius:5px;background:var(--theme-border);margin:2px auto 12px}.ghost-sheet-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.ghost-sheet-head h3{margin:0;font-size:18px}.ghost-close{width:40px;height:40px;border:0;border-radius:50%;background:var(--theme-primary-soft);color:var(--theme-primary);font-size:22px}.ghost-option{width:100%;border:1px solid var(--theme-border);background:var(--theme-surface);border-radius:var(--control-radius);padding:13px;margin:8px 0;display:flex;align-items:center;gap:11px;text-align:right;color:var(--theme-text)}.ghost-option:focus-within{box-shadow:0 0 0 3px var(--theme-primary-soft)}.ghost-opt-icon{font-size:25px}.ghost-opt-copy{flex:1}.ghost-opt-copy strong,.ghost-opt-copy small{display:block}.ghost-opt-copy small{opacity:.68;margin-top:4px;line-height:1.5}.ghost-switch{position:relative;width:48px;height:28px;border:0;border-radius:16px;background:var(--theme-border);transition:.18s}.ghost-switch:before{content:'';position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;background:var(--theme-surface);box-shadow:0 2px 5px rgba(0,0,0,.2);transition:.18s}.ghost-switch.on{background:var(--theme-primary)}.ghost-switch.on:before{transform:translateX(-20px)}.ghost-switch:disabled{opacity:.5}.ghost-peer-picker{display:flex;flex-direction:column;gap:8px;max-height:52vh;overflow:auto}.ghost-peer{width:100%;min-height:58px;border:1px solid var(--theme-border);border-radius:16px;background:var(--theme-surface);color:var(--theme-text);padding:10px 12px;display:flex;align-items:center;gap:10px;text-align:right;font:inherit}.ghost-peer img{width:40px;height:40px;border-radius:50%;object-fit:cover}.ghost-peer span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ghost-peer small{display:block;opacity:.6;margin-top:3px}.ghost-action-row{display:flex;gap:8px;margin-top:10px}.ghost-action{flex:1;min-height:46px;border:0;border-radius:var(--control-radius);font:inherit;font-weight:800;background:var(--theme-primary-soft);color:var(--theme-primary-strong)}.ghost-action.danger{background:color-mix(in srgb,var(--theme-error) 12%,white);color:var(--theme-error)}
.ghost-modal-wrap{position:fixed;inset:0;z-index:5100;background:rgba(15,18,22,.55);display:none;place-items:center;padding:20px}.ghost-modal-wrap.open{display:grid;animation:ghostFade .18s}.ghost-modal{width:min(100%,430px);background:var(--theme-surface);color:var(--theme-text);border-radius:24px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.25)}.ghost-modal h3{margin:0 0 8px}.ghost-modal p{margin:0 0 15px;opacity:.72;line-height:1.8}.ghost-field{margin:10px 0}.ghost-field label{display:block;font-size:12px;font-weight:800;margin-bottom:6px}.ghost-field input{width:100%;height:52px;border:1px solid var(--theme-border);border-radius:var(--control-radius);font:800 22px/1 sans-serif;letter-spacing:9px;text-align:center;background:var(--theme-background);color:var(--theme-text);outline:0}.ghost-field input:focus{border-color:var(--theme-primary);box-shadow:0 0 0 3px var(--theme-primary-soft)}.ghost-error{min-height:22px;color:var(--theme-error);font-size:13px;font-weight:700}.ghost-error.shake{animation:ghostShake .25s}.ghost-modal-actions{display:flex;gap:9px;margin-top:8px}.ghost-submit,.ghost-cancel{min-height:48px;border:0;border-radius:var(--control-radius);font:inherit;font-weight:900}.ghost-submit{flex:2;background:var(--theme-primary);color:var(--theme-primary-text)}.ghost-cancel{flex:1;background:var(--theme-primary-soft);color:var(--theme-primary-strong)}.ghost-submit:disabled{opacity:.55}.ghost-gate{position:absolute;top:74px;left:0;right:0;bottom:0;z-index:40;background:var(--theme-background);display:flex;align-items:center;justify-content:center;padding:24px}.ghost-gate-card{width:min(100%,390px);text-align:center;background:var(--theme-surface);border:1px solid var(--theme-border);border-radius:24px;padding:24px;box-shadow:0 14px 45px rgba(0,0,0,.12)}.ghost-gate-icon{font-size:48px}.ghost-gate h3{margin:10px 0}.ghost-gate p{opacity:.7;line-height:1.8}.ghost-support{font-size:12px;margin-top:8px;color:var(--theme-warning)}@keyframes ghostFade{from{opacity:0}to{opacity:1}}@keyframes ghostShake{25%{transform:translateX(6px)}50%{transform:translateX(-6px)}75%{transform:translateX(4px)}}@media(prefers-reduced-motion:reduce){.ghost-backdrop,.ghost-sheet,.ghost-list-btn{transition:none!important;animation:none!important}}
`;document.head.appendChild(style);
    var back=document.createElement('div');back.id='foxGhostSheet';back.className='ghost-backdrop';back.innerHTML='<div class="ghost-sheet" role="dialog" aria-modal="true" aria-labelledby="ghostSheetTitle"><div class="ghost-handle"></div><div class="ghost-sheet-head"><h3 id="ghostSheetTitle">محافظت از گفت‌وگو</h3><button class="ghost-close" type="button" aria-label="بستن">×</button></div><div id="ghostPeerPicker" class="ghost-peer-picker" hidden></div><button class="ghost-option" type="button" data-ghost="normal"><span class="ghost-opt-icon"><svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><path d="M7 25V14a9 9 0 0 1 18 0v11l-3-2.4-3 2.4-3-2.4-3 2.4-3-2.4L7 25Z" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="13" cy="14" r="1.5" fill="currentColor"/><circle cx="20" cy="14" r="1.5" fill="currentColor"/></svg></span><span class="ghost-opt-copy"><strong>حالت روح</strong><small>در وب، حفاظت از نمایش هنگام خروج از صفحه؛ مسدودسازی Screenshot سیستم‌عامل پشتیبانی نمی‌شود.</small></span><span class="ghost-switch" aria-hidden="true"></span></button><button class="ghost-option" type="button" data-ghost="plus"><span class="ghost-opt-icon"><svg viewBox="0 0 36 32" width="29" height="26" aria-hidden="true"><path d="M5 25V14a9 9 0 0 1 18 0v11l-3-2.4-3 2.4-3-2.4-3 2.4-3-2.4L5 25Z" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="11" cy="14" r="1.5" fill="currentColor"/><circle cx="18" cy="14" r="1.5" fill="currentColor"/><path d="m29 5 1.2 3.1L33 9.3l-2.8 1.2L29 14l-1.2-3.5L25 9.3l2.8-1.2L29 5Z" fill="currentColor"/></svg></span><span class="ghost-opt-copy"><strong>حالت روح پلاس</strong><small>قفل واقعی پیام‌ها در Backend با رمز پنج‌رقمی</small></span><span class="ghost-switch" aria-hidden="true"></span></button><button class="ghost-option" type="button" data-ghost="support"><span class="ghost-opt-icon"><svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><path d="M7 10h18M7 16h18M7 22h18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="10" r="2.6" fill="var(--theme-surface)" stroke="currentColor" stroke-width="2"/><circle cx="21" cy="16" r="2.6" fill="var(--theme-surface)" stroke="currentColor" stroke-width="2"/><circle cx="15" cy="22" r="2.6" fill="var(--theme-surface)" stroke="currentColor" stroke-width="2"/></svg></span><span class="ghost-opt-copy"><strong>تنظیمات محافظت</strong><small id="ghostSupportText">در حال بررسی پشتیبانی…</small></span><span class="ghost-switch" disabled aria-hidden="true"></span></button><div class="ghost-action-row"><button type="button" class="ghost-action" data-ghost="change">تغییر رمز</button><button type="button" class="ghost-action danger" data-ghost="disablePlus">غیرفعال‌سازی پلاس</button></div></div>';
    document.body.appendChild(back);
    var modal=document.createElement('div');modal.id='foxGhostModal';modal.className='ghost-modal-wrap';modal.innerHTML='<form class="ghost-modal" autocomplete="off"><h3 id="ghostModalTitle"></h3><p id="ghostModalText"></p><div id="ghostFields"></div><div class="ghost-error" id="ghostError" role="alert"></div><div class="ghost-modal-actions"><button class="ghost-cancel" type="button">انصراف</button><button class="ghost-submit" type="submit">تأیید</button></div></form>';document.body.appendChild(modal);
    back.querySelector('.ghost-close').onclick=closeSheet;back.addEventListener('click',function(e){if(e.target===back)closeSheet();});
    var sy=0;back.querySelector('.ghost-sheet').addEventListener('pointerdown',function(e){sy=e.clientY;});back.querySelector('.ghost-sheet').addEventListener('pointerup',function(e){if(e.clientY-sy>70)closeSheet();});
    back.querySelectorAll('[data-ghost]').forEach(function(x){x.addEventListener('click',function(){action(x.dataset.ghost);});});
    modal.querySelector('.ghost-cancel').onclick=function(){closeModal(null);};
  }
  function installHeader(){
    ensureUI();var top=document.querySelector('#viewDMList .home-top'),ava=$('dlAva');if(!top||!ava)return;
    var b=$('foxGhostBtn');
    if(!b){b=document.createElement('button');b.id='foxGhostBtn';b.type='button';b.className='ghost-list-btn';b.setAttribute('aria-label','مدیریت حالت روح');b.innerHTML='<svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true"><path d="M7 25V14a9 9 0 0 1 18 0v11l-3.2-2.4L19 25l-3-2.4-3 2.4-2.8-2.4L7 25Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="13" cy="14" r="1.5" fill="currentColor"/><circle cx="20" cy="14" r="1.5" fill="currentColor"/></svg>';top.insertBefore(b,ava);}
    var s=$('foxGhostStatus');if(!s){s=document.createElement('span');s.id='foxGhostStatus';s.className='ghost-list-status';s.hidden=true;b.insertAdjacentElement('afterend',s);}
    b.onclick=openSheet;
  }
  async function refresh(){
    if(!state.peer)return;try{state.status=await req('protection-status',{method:'GET',headers:{}});setHeader();updateSheet();return state.status;}catch(e){toast('دریافت وضعیت محافظت ناموفق بود');throw e;}
  }
  function updateSheet(){
    var root=$('foxGhostSheet'),st=state.status||{};if(!root)return;
    root.querySelector('[data-ghost="normal"] .ghost-switch').classList.toggle('on',!!st.ghost);
    root.querySelector('[data-ghost="plus"] .ghost-switch').classList.toggle('on',!!st.plus);
    root.querySelector('[data-ghost="support"] .ghost-switch').classList.toggle('on',state.support==='supported');
    root.querySelector('[data-ghost="change"]').disabled=!st.plus;root.querySelector('[data-ghost="disablePlus"]').disabled=!st.plus;
    $('ghostSupportText').textContent='مرورگر وب اجازه مسدودسازی Screenshot سیستم‌عامل را نمی‌دهد؛ قفل رمز Backend فعال و واقعی است.';
  }
  function optionsVisible(on){
    var root=$('foxGhostSheet');if(!root)return;
    root.querySelectorAll('[data-ghost]').forEach(function(el){el.style.display=on?'':'none';});
    var row=root.querySelector('.ghost-action-row');if(row)row.style.display=on?'flex':'none';
  }
  function renderPeerPicker(){
    var picker=$('ghostPeerPicker'),title=$('ghostSheetTitle');if(!picker)return;
    state.peer='';state.status=null;setHeader();optionsVisible(false);picker.hidden=false;title.textContent='انتخاب گفت‌وگو برای محافظت';picker.innerHTML='';
    var rows=(typeof lastConvs!=='undefined'&&Array.isArray(lastConvs))?lastConvs.slice().sort(function(a,b){return Number(b.ts||0)-Number(a.ts||0);}):[];
    if(!rows.length){picker.innerHTML='<div class="ghost-option"><span class="ghost-opt-copy"><strong>گفت‌وگویی وجود ندارد</strong><small>ابتدا یک گفت‌وگوی خصوصی ایجاد کنید.</small></span></div>';return;}
    rows.forEach(function(c){var u=typeof peerUser==='function'?peerUser(c.peer):{phone:c.peer,name:c.peer};var btn=document.createElement('button');btn.type='button';btn.className='ghost-peer';var av=(u.avatar&&u.avatar.indexOf('data:')===0)?u.avatar:DEFAULT_AVA;btn.innerHTML='<img src="'+esc(av)+'" alt=""><span><b>'+esc(u.name||u.username||c.peer)+'</b><small>'+esc(c.peer)+'</small></span>';btn.onclick=async function(){state.peer=String(c.peer);picker.hidden=true;optionsVisible(true);title.textContent='محافظت گفت‌وگو با '+String(u.name||u.username||'کاربر');await refresh().catch(function(){});};picker.appendChild(btn);});
  }
  async function openSheet(){
    var root=$('foxGhostSheet');if(!root)return;renderPeerPicker();root.classList.add('open');
  }
  function closeSheet(){$('foxGhostSheet').classList.remove('open');}
  function fields(spec){return spec.map(function(f){return '<div class="ghost-field"><label for="'+f.id+'">'+esc(f.label)+'</label><input id="'+f.id+'" type="password" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" autocomplete="new-password" aria-label="'+esc(f.label)+'"></div>';}).join('');}
  function pinModal(mode){
    var m=$('foxGhostModal'),title=$('ghostModalTitle'),text=$('ghostModalText'),box=$('ghostFields'),err=$('ghostError'),form=m.querySelector('form'),submit=m.querySelector('.ghost-submit');
    var specs=mode==='setup'?[{id:'gp1',label:'رمز پنج‌رقمی'},{id:'gp2',label:'تکرار رمز'}]:mode==='unlock'?[{id:'gp1',label:'رمز پنج‌رقمی'}]:mode==='change'?[{id:'gp0',label:'رمز فعلی'},{id:'gp1',label:'رمز جدید'},{id:'gp2',label:'تکرار رمز جدید'}]:[{id:'gp1',label:'رمز فعلی'}];
    title.textContent=mode==='setup'?'ساخت رمز روح پلاس':mode==='unlock'?'این گفت‌وگو محافظت شده است':mode==='change'?'تغییر رمز روح پلاس':'غیرفعال کردن روح پلاس';
    text.textContent=mode==='unlock'?'رمز ۵ رقمی را وارد کنید':'رمز دقیقاً پنج رقم باشد و در هیچ Storage یا Log ذخیره نمی‌شود.';box.innerHTML=fields(specs);err.textContent='';m.classList.add('open');setTimeout(function(){var i=m.querySelector('input');if(i)i.focus();},80);
    return new Promise(function(resolve){
      m._resolve=resolve;form.onsubmit=async function(e){e.preventDefault();if(state.busy)return;var vals=specs.map(function(x){return $(x.id).value;});
        if(vals.some(function(v){return !/^d{5}$/.test(v);})||(specs.length>1&&mode!=='disable'&&vals[vals.length-1]!==vals[vals.length-2])){err.textContent='رمز باید دقیقاً ۵ رقم باشد و تکرار آن مطابقت داشته باشد.';err.classList.remove('shake');void err.offsetWidth;err.classList.add('shake');return;}
        state.busy=true;submit.disabled=true;submit.textContent='در حال بررسی…';try{specs.forEach(function(x){$(x.id).value='';});resolve(vals);m._resolve=null;m.classList.remove('open');}finally{state.busy=false;submit.disabled=false;submit.textContent='تأیید';}
      };
    });
  }
  function closeModal(v){var m=$('foxGhostModal');m.querySelectorAll('input').forEach(function(i){i.value='';});m.classList.remove('open');if(m._resolve){m._resolve(v);m._resolve=null;}}
  function modalError(e){var el=$('ghostError');if(!el)return;var wait=e&&e.data&&e.data.retryAfter;el.textContent=e.message==='temporarily_locked'?'تلاش‌ها موقتاً محدود شد. '+(wait?wait+' ثانیه دیگر':'بعداً')+' دوباره امتحان کنید.':'رمز صحیح نیست یا درخواست مجاز نیست.';el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');}
  async function action(a){
    if(state.busy)return;var st=state.status||{};
    try{
      if(a==='normal'){state.busy=true;if(st.ghost){if(st.plus){toast('ابتدا روح پلاس را غیرفعال کنید');return;}await req('ghost/disable',{method:'POST',body:'{}'});}else await req('ghost/enable',{method:'POST',body:'{}'});}
      else if(a==='plus'){if(st.plus){toast('روح پلاس فعال است');return;}var v=await pinModal('setup');if(!v)return;state.busy=true;await req('ghost-plus/setup',{method:'POST',body:JSON.stringify({pin:v[0]})});var unlocked=await req('ghost-plus/unlock',{method:'POST',body:JSON.stringify({pin:v[0]})});state.tokens.set(state.peer,{token:unlocked.token,expiresAt:Date.now()+Number(unlocked.expiresIn||600)*1000});v[0]='';v[1]='';}
      else if(a==='change'){var c=await pinModal('change');if(!c)return;state.busy=true;await req('ghost-plus/change-password',{method:'POST',body:JSON.stringify({currentPin:c[0],newPin:c[1]})});state.tokens.delete(state.peer);toast('رمز تغییر کرد؛ نشست‌های قبلی باطل شدند');}
      else if(a==='disablePlus'){var d=await pinModal('disable');if(!d)return;state.busy=true;await req('ghost-plus/disable',{method:'POST',body:JSON.stringify({pin:d[0]})});state.tokens.delete(state.peer);toast('روح پلاس غیرفعال شد');}
      else if(a==='support'){toast('در وب، Screenshot سیستم‌عامل قابل مسدودسازی نیست. قفل پیام‌ها در Backend پشتیبانی می‌شود.');return;}
      await refresh();
    }catch(e){toast(e.message==='plus_active'?'ابتدا روح پلاس را غیرفعال کنید':'عملیات محافظت انجام نشد');}finally{state.busy=false;}
  }
  function showGate(loading){
    var view=$('viewDM');if(!view)return;var g=$('foxGhostGate');if(!g){g=document.createElement('div');g.id='foxGhostGate';g.className='ghost-gate';g.innerHTML='<div class="ghost-gate-card"><div class="ghost-gate-icon"><svg viewBox="0 0 32 32" width="52" height="52" aria-hidden="true"><path d="M7 25V14a9 9 0 0 1 18 0v11l-3-2.4-3 2.4-3-2.4-3 2.4-3-2.4L7 25Z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="13" cy="14" r="1.5" fill="currentColor"/><circle cx="20" cy="14" r="1.5" fill="currentColor"/></svg></div><h3>این گفت‌وگو محافظت شده است</h3><p>برای دریافت و نمایش پیام‌ها، رمز ۵ رقمی را وارد کنید.</p><button type="button" class="ghost-submit">وارد کردن رمز</button><div class="ghost-support">محتوای پیام قبل از تأیید از Backend دریافت نمی‌شود.</div></div>';view.appendChild(g);g.querySelector('button').onclick=unlock;}
    g.style.display='flex';g.querySelector('button').disabled=!!loading;g.querySelector('button').textContent=loading?'در حال بررسی…':'وارد کردن رمز';
    try{dmMessages=[];foxRenderDM([]);}catch(e){var box=$('dmMessages');if(box)box.innerHTML='';}try{stopDMStream();}catch(e){}
  }
  function hideGate(){var g=$('foxGhostGate');if(g)g.style.display='none';}
  async function unlock(){
    var vals=await pinModal('unlock');if(!vals)return;showGate(true);
    try{var j=await req('ghost-plus/unlock',{method:'POST',body:JSON.stringify({pin:vals[0]})});state.tokens.set(state.peer,{token:j.token,expiresAt:Date.now()+Number(j.expiresIn||600)*1000});hideGate();foxLoadDM();foxStartDMStream();}
    catch(e){showGate(false);modalError(e);toast(e.status===429?'تلاش‌ها موقتاً محدود شد':'رمز نادرست است');}
  }
  async function enter(peer){
    /* Never show a lock/loading gate for an unprotected conversation. Backend
       blocks protected content while status is checked, so no preview leaks. */
    installHeader();state.peer=String(peer||'');state.status=null;hideGate();
    try{var st=await refresh();if(state.peer!==String(peer||''))return;if(st.plus&&!token(peer)){showGate(false);}else{hideGate();foxLoadDM();foxStartDMStream();}}
    catch(e){hideGate();}
  }
  async function leave(){
    var peer=state.peer;if(!peer)return;state.tokens.delete(peer);state.peer='';state.status=null;try{dmMessages=[];foxRenderDM([]);}catch(e){}hideGate();
    try{await api(endpoint(peer,'ghost-plus/lock'),{method:'POST',headers:{'content-type':'application/json'},body:'{}'});}catch(e){}
  }
  function installApiToken(){
    try{var base=api;api=function(url,opt){opt=opt||{};var u=String(url||''),peer='';if(u.indexOf('/api/dm')===0&&typeof dmTarget!=='undefined'&&dmTarget)peer=dmTarget.phone;var t=token(peer);if(t){opt=Object.assign({},opt);opt.headers=Object.assign({},opt.headers||{}, {'x-ghost-unlock':t});}return base(url,opt);};}catch(e){}
  }
  function boot(){
    installHeader();installApiToken();
    try{var baseOpen=openDMChat;openDMChat=function(target,ret){state.peer=target&&target.phone?String(target.phone):'';baseOpen(target,ret);enter(state.peer);};}catch(e){}
    var v=$('viewDM');if(v)new MutationObserver(function(){if(v.classList.contains('hidden'))leave();}).observe(v,{attributes:true,attributeFilter:['class','style']});
    document.addEventListener('visibilitychange',function(){var v=$('viewDM');if(document.hidden&&v&&!v.classList.contains('hidden')&&state.status&&state.status.ghost){var box=$('dmMessages');if(box)box.style.filter='blur(18px)';}else{var box2=$('dmMessages');if(box2)box2.style.filter='';}});
  }
  window.FoxGhost={prepareRows:prepareRows,token:token,enter:enter,leave:leave};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

// Create Group FAB Logic
document.addEventListener('DOMContentLoaded', ()=>{
  const fab=document.getElementById('createGroupFab');
  const overlay=document.getElementById('cgOverlay');
  const closeBtn=document.getElementById('cgClose');
  const optCreate=document.getElementById('cgOptCreateGroup');
  const stepOptions=document.getElementById('cgStepOptions');
  const stepForm=document.getElementById('cgStepForm');
  const stepResult=document.getElementById('cgStepResult');
  const backBtn=document.getElementById('cgBackToOptions');
  const avaWrap=document.getElementById('cgAvaWrap');
  const avaInput=document.getElementById('cgAvaInput');
  const avaImg=document.getElementById('cgAvaImg');
  const nameInput=document.getElementById('cgNameInput');
  const preview=document.getElementById('cgPreview');
  const prevAva=document.getElementById('cgPrevAva');
  const prevName=document.getElementById('cgPrevName');
  const confirmBtn=document.getElementById('cgConfirmCreate');
  const walletInfo=document.getElementById('cgWalletInfo');
  let selectedImage=null;
  let requestId=null;

  function openCG(){
    overlay.classList.add('open');
    stepOptions.style.display='block';
    stepForm.style.display='none';
    stepResult.style.display='none';
    requestId = Date.now() + '-' + Math.random().toString(36).slice(2,10);
    checkWallet();
  }
  function closeCG(){ overlay.classList.remove('open'); }
  function checkWallet(){
    try{
      const w = window.FoxWallet ? window.FoxWallet.state : null;
      let diamonds = 0;
      if(w){
        diamonds = w.gems != null ? w.gems : (w.diamonds != null ? w.diamonds : 0);
        if(walletInfo){
          walletInfo.textContent = '💎 موجودی فعلی: ' + diamonds + ' الماس | هزینه ساخت: 399 الماس';
          if(diamonds < 399){
            walletInfo.style.background='#fee2e2';
            walletInfo.style.borderColor='#fca5a5';
            walletInfo.style.color='#991b1b';
          }else{
            walletInfo.style.background='#fef3c7';
            walletInfo.style.borderColor='#fcd34d';
            walletInfo.style.color='#92400e';
          }
        }
      }else{
        if(walletInfo) walletInfo.textContent='در حال دریافت موجودی...';
        setTimeout(checkWallet,1000);
      }
    }catch(e){
      if(walletInfo) walletInfo.textContent='خطا در دریافت موجودی';
    }
  }

  if(fab) fab.addEventListener('click', openCG);
  if(closeBtn) closeBtn.addEventListener('click', closeCG);
  if(overlay) overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeCG(); });
  if(backBtn) backBtn.addEventListener('click', ()=>{ stepForm.style.display='none'; stepOptions.style.display='block'; });
  if(optCreate) optCreate.addEventListener('click', ()=>{
    stepOptions.style.display='none';
    stepForm.style.display='block';
    checkWallet();
  });
  if(avaWrap) avaWrap.addEventListener('click', ()=>avaInput.click());
  if(avaInput) avaInput.addEventListener('change', (e)=>{
    const file=e.target.files[0];
    if(!file) return;
    if(file.size>2*1024*1024){ if(window.foxToast) foxToast('حجم تصویر باید کمتر از 2MB باشد'); return; }
    const reader=new FileReader();
    reader.onload=(ev)=>{
      selectedImage=ev.target.result;
      avaImg.src=selectedImage;
      avaImg.style.display='block';
      avaWrap.querySelector('.ph').style.display='none';
      prevAva.src=selectedImage;
      preview.style.display='flex';
    };
    reader.readAsDataURL(file);
  });
  if(nameInput) nameInput.addEventListener('input', ()=>{
    const name=nameInput.value.trim();
    if(name){ prevName.textContent=name; preview.style.display='flex'; } else { prevName.textContent='نام گروه'; }
  });
  if(confirmBtn) confirmBtn.addEventListener('click', async ()=>{
    const name=nameInput.value.trim();
    if(!name){ if(window.foxToast) foxToast('لطفاً نام گروه را وارد کنید'); return; }
    if(name.length<3){ if(window.foxToast) foxToast('نام گروه باید حداقل 3 حرف باشد'); return; }
    stepForm.style.display='none';
    stepResult.style.display='block';
    document.getElementById('cgResultIcon').textContent='⏳';
    document.getElementById('cgResultTitle').textContent='در حال ساخت گروه...';
    document.getElementById('cgResultDesc').textContent='در حال بررسی موجودی و کسر الماس';
    try{
      const token=localStorage.getItem('fox_session');
      if(!token) throw new Error('no_auth');
      const res=await fetch('/api/groups/create',{
        method:'POST',
        headers:{'content-type':'application/json','authorization':'Bearer '+token},
        body:JSON.stringify({name, image:selectedImage, cost:399, requestId})
      });
      const data=await res.json();
      if(!res.ok || !data.ok){
        if(data.error==='insufficient_diamonds' || data.message && data.message.includes('399')){
          document.getElementById('cgResultIcon').textContent='💎';
          document.getElementById('cgResultTitle').textContent='موجودی کافی نیست';
          document.getElementById('cgResultDesc').innerHTML='برای ساخت گروه به 399 الماس نیاز دارید.<br>موجودی فعلی: '+(data.current||0)+' الماس';
          setTimeout(()=>{ closeCG(); if(window.foxToast) foxToast('برای ساخت گروه به 399 الماس نیاز دارید.'); },2500);
          return;
        }
        if(data.error==='restricted'){
          document.getElementById('cgResultIcon').textContent='⛔';
          document.getElementById('cgResultTitle').textContent='حساب شما محدود شده است';
          document.getElementById('cgResultDesc').textContent=data.reason || 'محدود شده';
          setTimeout(closeCG,2500);
          return;
        }
        throw new Error(data.error||data.message||'create_failed');
      }
      document.getElementById('cgResultIcon').textContent='✅';
      document.getElementById('cgResultTitle').textContent='گروه ساخته شد!';
      document.getElementById('cgResultDesc').textContent='گروه '+name+' با موفقیت ایجاد شد';
      if(window.FoxWallet && data.wallet){ window.FoxWallet.apply(data.wallet); }
      setTimeout(()=>{
        closeCG();
        if(window.foxToast) foxToast('گروه '+name+' ساخته شد! 🎉');
        if(window.refreshHome) window.refreshHome();
        nameInput.value=''; selectedImage=null; avaImg.style.display='none'; avaWrap.querySelector('.ph').style.display='block'; preview.style.display='none';
      },1500);
    }catch(e){
      document.getElementById('cgResultIcon').textContent='❌';
      document.getElementById('cgResultTitle').textContent='خطا در ساخت گروه';
      document.getElementById('cgResultDesc').textContent='دوباره تلاش کنید: '+(e.message||'خطای ناشناخته');
      setTimeout(()=>{ stepResult.style.display='none'; stepForm.style.display='block'; },2000);
    }
  });
});

// Admin Panel
(function initAdminPanelFinal(){
  document.addEventListener('DOMContentLoaded', ()=>{
    const apOverlay=document.getElementById('apOverlay');
    const apBack=document.getElementById('apBack');
    const apTabs=document.querySelectorAll('.ap-tab');
    const apContent=document.getElementById('apContent');
    let currentGroupId='main';
    let currentTab='members';
    let currentPanelRole='member';
    window.openAdminPanel=async function(groupId){
      currentGroupId=groupId||'main';
      const token=localStorage.getItem('fox_session');
      apOverlay.classList.add('open');
      apContent.innerHTML='<div class="ap-empty">در حال بررسی دسترسی...</div>';
      try{
        const roleRes=await fetch('/api/groups/'+currentGroupId,{headers:{'authorization':'Bearer '+token}});
        const roleData=await roleRes.json();
        if(!roleRes.ok || !roleData.ok) throw new Error(roleData.message||roleData.error||'دسترسی نامعتبر');
        currentPanelRole=roleData.role||'member';
        if(currentPanelRole!=='owner' && currentPanelRole!=='admin') throw new Error('شما دسترسی مدیریت این گروه را ندارید');
        apTabs.forEach(t=>{
          const ownerOnly=t.dataset.tab==='codes'||t.dataset.tab==='settings';
          t.hidden=ownerOnly && currentPanelRole!=='owner';
        });
        if(currentPanelRole!=='owner' && (currentTab==='codes'||currentTab==='settings')) currentTab='members';
        apTabs.forEach(t=>t.classList.toggle('active',t.dataset.tab===currentTab));
        loadTab(currentTab);
      }catch(e){
        apContent.innerHTML='<div class="ap-empty">'+escapeHtml(e.message||'باز کردن پنل مدیریت ناموفق بود')+'</div>';
        if(typeof window.foxToast==='function') window.foxToast(e.message||'باز کردن پنل مدیریت ناموفق بود');
      }
    };
    function closeAP(){ apOverlay.classList.remove('open'); }
    if(apBack) apBack.addEventListener('click', closeAP);
    apTabs.forEach(tab=>{
      tab.addEventListener('click', ()=>{
        apTabs.forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        currentTab=tab.dataset.tab;
        loadTab(currentTab);
      });
    });
    async function loadTab(tab){
      apContent.innerHTML='<div class="ap-empty">در حال بارگذاری...</div>';
      const token=localStorage.getItem('fox_session');
      if(!token){ apContent.innerHTML='<div class="ap-empty">لطفاً وارد شوید</div>'; return; }
      try{
        if(tab==='members'){
          const res=await fetch('/api/groups/'+currentGroupId+'/members',{headers:{'authorization':'Bearer '+token}});
          const data=await res.json();
          if(!data.ok) throw new Error(data.error||'خطا');
          if(!data.members || data.members.length===0){ apContent.innerHTML='<div class="ap-empty">هنوز عضوی وجود ندارد</div>'; return; }
          let html='<div class="ap-search"><input type="text" id="apMemberSearch" placeholder="جستجوی اعضا..." oninput="filterMembers(this.value)"></div>';
          html+=data.members.map(m=>`
            <div class="ap-user-row" data-name="${(m.name||'').toLowerCase()}">
              <img class="ap-user-ava" src="${m.avatar||''}" onerror="this.style.display=\'none\'" alt="">
              <div class="ap-user-info">
                <div class="ap-user-name">${escapeHtml(m.name||'بدون نام')} ${m.role==='owner'?'<span class="perm-badge owner">Owner</span>':m.role==='admin'?'<span class="perm-badge admin">Admin</span>':''}</div>
                <div class="ap-user-meta">@${escapeHtml(m.username||'')} • ${m.phone}${currentPanelRole==='owner'?' • کد: '+(m.code||'---'):''}</div>
              </div>
              <div class="ap-actions">
                ${currentPanelRole==='owner' && m.role==='member'?`<button class="ap-btn primary" onclick="makeAdmin('${m.phone}')">ارتقا به مدیر</button>`:''}
                ${currentPanelRole==='owner' && m.role==='admin'?`<button class="ap-btn warn" onclick="removeAdmin('${m.phone}')">عزل مدیر</button>`:''}
                ${m.role!=='owner' && !(currentPanelRole==='admin'&&m.role==='admin')?`<button class="ap-btn danger" onclick="banUser('${m.phone}')">محدود کردن</button>`:''}
              </div>
            </div>
          `).join('');
          apContent.innerHTML=html;
        }else if(tab==='codes'){
          const res=await fetch('/api/admin/codes',{headers:{'authorization':'Bearer '+token}});
          const data=await res.json();
          if(!data.ok) throw new Error(data.error||data.message||'خطا');
          let html='<div class="ap-search"><input type="text" id="apCodeSearch" placeholder="جستجو با کد 6 رقمی، نام، یوزرنیم..."><button class="ap-btn primary" onclick="searchByCode()">جستجو</button></div>';
          if(!data.users || data.users.length===0){ html+='<div class="ap-empty">هنوز کاربری ثبت نشده است</div>'; }
          else{
            html+=data.users.map(u=>`
              <div class="ap-user-row">
                <img class="ap-user-ava" src="${u.avatar||''}" onerror="this.style.display=\'none\'" alt="">
                <div class="ap-user-info">
                  <div class="ap-user-name">${escapeHtml(u.name||'بدون نام')} <span class="ap-user-code">${u.code||'---'}</span> <span class="ap-badge ${u.status}">${u.statusFa||u.status}</span></div>
                  <div class="ap-user-meta">@${escapeHtml(u.username||'')} • ${u.phone} • ${u.banned?'⛔ مسدود':u.restricted?'⚠️ محدود':'✅ فعال'}</div>
                </div>
              </div>
            `).join('');
          }
          apContent.innerHTML=html;
        }else if(tab==='reports'){
          const res=await fetch('/api/groups/'+currentGroupId+'/reports',{headers:{'authorization':'Bearer '+token}});
          const data=await res.json();
          if(!data.ok) throw new Error(data.error);
          if(!data.reports || data.reports.length===0){ apContent.innerHTML='<div class="ap-empty">هنوز گزارشی ثبت نشده است.</div>'; return; }
          let html=data.reports.map(r=>`
            <div class="ap-card">
              <div class="ap-card-title">گزارش #${(r.id||'').toString().slice(-8)} <span class="ap-badge ${r.status}">${r.statusFa||r.status||'جدید'}</span></div>
              <div style="font-size:12px; color:#666; margin-bottom:8px; line-height:1.8;">
                گزارش‌دهنده: ${escapeHtml(r.reporterName||r.reporter||'نامشخص')}<br>
                گزارش‌شده: ${escapeHtml(r.reportedName||r.reported||r.targetId||'نامشخص')}<br>
                دلیل: ${escapeHtml(r.reason||'نامشخص')}<br>
                زمان: ${new Date(r.ts||r.createdAt||Date.now()).toLocaleString('fa-IR')}<br>
                وضعیت: ${r.statusFa||r.status}
              </div>
              ${r.message?`<div style="background:#f5f5f5; padding:8px; border-radius:8px; font-size:12px; margin:8px 0;">${escapeHtml(r.message)}</div>`:''}
              <div class="ap-actions">
                <button class="ap-btn ok" onclick="handleReport('${r.id}','reviewed')">بررسی‌شده</button>
                <button class="ap-btn danger" onclick="handleReport('${r.id}','banned')">مسدود کردن</button>
                <button class="ap-btn ok" onclick="handleReport('${r.id}','done')">اقدام‌شده</button>
                <button class="ap-btn warn" onclick="handleReport('${r.id}','rejected')">ردشده</button>
              </div>
            </div>
          `).join('');
          apContent.innerHTML=html;
        }else if(tab==='bans'){
          const res=await fetch('/api/groups/'+currentGroupId+'/bans',{headers:{'authorization':'Bearer '+token}});
          const data=await res.json();
          if(!data.ok) throw new Error(data.error);
          if(!data.bans || data.bans.length===0){ apContent.innerHTML='<div class="ap-empty">هیچ مسدودی فعالی وجود ندارد</div>'; return; }
          let html=data.bans.map(b=>`
            <div class="ap-card">
              <div class="ap-user-row">
                <div class="ap-user-info">
                  <div class="ap-user-name">${escapeHtml(b.userName||b.phone)} <span class="ap-badge banned">${b.typeFa||'مسدود'}</span></div>
                  <div class="ap-user-meta">دلیل: ${escapeHtml(b.reason||'')} • تا: ${new Date(b.until).toLocaleString('fa-IR')} • باقی: ${b.remaining||''}</div>
                  <div class="ap-user-meta">توسط: ${b.by||'سیستم'} • مدت: ${b.duration||''}</div>
                </div>
                <button class="ap-btn ok" onclick="unbanUser('${b.phone}')">رفع مسدودی</button>
              </div>
            </div>
          `).join('');
          apContent.innerHTML=html;
        }else if(tab==='settings'){
          const res=await fetch('/api/groups/'+currentGroupId,{headers:{'authorization':'Bearer '+token}});
          const data=await res.json();
          if(!data.ok) throw new Error(data.error);
          const g=data.group;
          const perms = data.permissions || [];
          let html=`
            <div class="ap-card">
              <div class="ap-card-title">اطلاعات گروه</div>
              <div style="font-size:12px; line-height:2;">
                ID: <code>${g.id}</code><br>
                نام: ${escapeHtml(g.name)}<br>
                Owner: ${g.owner} ${data.role==='owner'?'<span class="perm-badge owner">شما مالک هستید</span>':''}<br>
                نقش شما: <span class="perm-badge ${data.role}">${data.role}</span><br>
                اعضا: ${g.members?g.members.length:0} نفر<br>
                مدیران: ${g.admins?g.admins.length:0} نفر<br>
                تاریخ ساخت: ${new Date(g.createdAt).toLocaleString('fa-IR')}<br>
                ربات: ${g.botEnabled?'✅ فعال':'❌ غیرفعال'}<br>
                دسترسی‌های شما: ${perms.join(', ')||'هیچ'}
              </div>
            </div>
            ${data.role==='owner' || perms.includes('edit_group') ? `
            <div class="ap-card">
              <div class="ap-card-title">ویرایش گروه</div>
              <div class="cg-form-group"><label class="cg-label">نام گروه</label><input class="cg-input" id="apGroupName" value="${escapeHtml(g.name)}"></div>
              <div class="cg-form-group"><label class="cg-label">قوانین گروه</label><textarea class="cg-input" id="apGroupRules" rows="3">${escapeHtml(g.rules||'')}</textarea></div>
              <div class="cg-form-group"><label class="cg-label">وضعیت ربات</label><select class="cg-input" id="apBotStatus"><option value="true" ${g.botEnabled?'selected':''}>فعال</option><option value="false" ${!g.botEnabled?'selected':''}>غیرفعال</option></select></div>
              <button class="cg-btn primary" onclick="saveGroupSettings()">ذخیره تنظیمات</button>
            </div>` : '<div class="ap-card"><div class="ap-empty">شما دسترسی ویرایش تنظیمات را ندارید</div></div>'}
          `;
          apContent.innerHTML=html;
        }
      }catch(e){
        apContent.innerHTML='<div class="ap-empty">خطا: '+escapeHtml(e.message)+'</div>';
      }
    }
    function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    window.makeAdmin=function(phone){
      foxConfirm('ارتقا به مدیر','کاربر '+phone+' به اختیارات محدود مدیریتی دسترسی پیدا می‌کند.',async function(){
        const token=localStorage.getItem('fox_session');
        try{
          const res=await fetch('/api/groups/'+currentGroupId+'/admin',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+token},body:JSON.stringify({phone,action:'make_admin'})});
          const data=await res.json(); if(!data.ok) throw new Error(data.error||data.message);
          if(window.foxToast) foxToast('کاربر مدیر شد'); loadTab('members');
        }catch(e){ if(window.foxToast) foxToast('خطا: '+e.message); }
      });
    };
    window.removeAdmin=function(phone){
      foxConfirm('عزل مدیر','دسترسی مدیریتی '+phone+' حذف شود؟',async function(){
        const token=localStorage.getItem('fox_session');
        try{
          const res=await fetch('/api/groups/'+currentGroupId+'/admin',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+token},body:JSON.stringify({phone,action:'remove_admin'})});
          const data=await res.json(); if(!data.ok) throw new Error(data.error||data.message);
          if(window.foxToast) foxToast('دسترسی مدیریتی حذف شد'); loadTab('members');
        }catch(e){ if(window.foxToast) foxToast('خطا: '+e.message); }
      });
    };
    window.banUser=function(phone){
      foxPrompt('علت محدودیت','دلیل را واضح بنویسید تا به کاربر نمایش داده شود.','تخلف از قوانین',function(reason){
        if(!String(reason||'').trim()) return;
        foxPrompt('مدت محدودیت','نمونه: 10m، 1h، 1d یا 7d','1h',async function(duration){
          if(!String(duration||'').trim()) return;
          const token=localStorage.getItem('fox_session');
          try{
            const res=await fetch('/api/groups/'+currentGroupId+'/ban',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+token},body:JSON.stringify({phone,reason:String(reason).trim(),duration:String(duration).trim()})});
            const data=await res.json(); if(!data.ok) throw new Error(data.error||data.message);
            if(window.foxToast) foxToast('محدودیت کاربر اعمال شد'); loadTab('bans');
          }catch(e){ if(window.foxToast) foxToast('خطا: '+e.message); }
        });
      });
    };
    window.unbanUser=function(phone){
      foxConfirm('رفع محدودیت','دسترسی‌های '+phone+' فوراً بازگردانده شود؟',async function(){
        const token=localStorage.getItem('fox_session');
        try{
          const res=await fetch('/api/groups/'+currentGroupId+'/unban',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+token},body:JSON.stringify({phone})});
          const data=await res.json(); if(!data.ok) throw new Error(data.error);
          if(window.foxToast) foxToast('محدودیت رفع شد'); loadTab('bans');
        }catch(e){ if(window.foxToast) foxToast('خطا: '+e.message); }
      });
    };
    window.handleReport=async function(reportId, action){
      const token=localStorage.getItem('fox_session');
      try{
        const res=await fetch('/api/groups/'+currentGroupId+'/report_action',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+token},body:JSON.stringify({reportId,action})});
        const data=await res.json(); if(!data.ok) throw new Error(data.error);
        if(window.foxToast) foxToast('گزارش به‌روزرسانی شد: '+action); loadTab('reports');
      }catch(e){ if(window.foxToast) foxToast('خطا: '+e.message); }
    };
    window.searchByCode=async function(){
      const input=document.getElementById('apCodeSearch');
      const code=input.value.trim();
      if(!code) return;
      const token=localStorage.getItem('fox_session');
      try{
        const res=await fetch('/api/admin/codes?search='+encodeURIComponent(code),{headers:{'authorization':'Bearer '+token}});
        const data=await res.json(); if(!data.ok) throw new Error(data.error||data.message);
        let html='<div class="ap-search"><input type="text" id="apCodeSearch" value="'+escapeHtml(code)+'" placeholder="جستجو..."><button class="ap-btn primary" onclick="searchByCode()">جستجو</button></div>';
        if(!data.users || data.users.length===0){ html+='<div class="ap-empty">کاربری با "'+escapeHtml(code)+'" یافت نشد</div>'; }
        else{
          html+=data.users.map(u=>`
            <div class="ap-user-row">
              <img class="ap-user-ava" src="${u.avatar||''}" onerror="this.style.display=\'none\'" alt="">
              <div class="ap-user-info">
                <div class="ap-user-name">${escapeHtml(u.name||'بدون نام')} <span class="ap-user-code">${u.code}</span> <span class="ap-badge ${u.status}">${u.statusFa||u.status}</span></div>
                <div class="ap-user-meta">@${escapeHtml(u.username||'')} • ${u.phone} • ${u.banned?'⛔ مسدود':u.restricted?'⚠️ محدود':'✅ فعال'} • حساب: ${u.statusFa||''}</div>
              </div>
            </div>
          `).join('');
        }
        document.getElementById('apContent').innerHTML=html;
      }catch(e){ if(window.foxToast) foxToast('خطا: '+e.message); }
    };
    window.saveGroupSettings=async function(){
      const name=document.getElementById('apGroupName').value.trim();
      const rules=document.getElementById('apGroupRules').value.trim();
      const botEnabled=document.getElementById('apBotStatus').value==='true';
      const token=localStorage.getItem('fox_session');
      try{
        const res=await fetch('/api/groups/'+currentGroupId+'/update',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+token},body:JSON.stringify({name,rules,botEnabled})});
        const data=await res.json(); if(!data.ok) throw new Error(data.error||data.message);
        if(window.foxToast) foxToast('تنظیمات ذخیره شد'); loadTab('settings');
      }catch(e){ if(window.foxToast) foxToast('خطا: '+e.message); }
    };
    window.filterMembers=function(q){
      q=(q||'').toLowerCase();
      document.querySelectorAll('.ap-user-row[data-name]').forEach(row=>{
        const name=row.getAttribute('data-name')||'';
        row.style.display = name.includes(q) ? 'flex' : 'none';
      });
    };
  });
})();

// Pinned Message
(function initPinnedFinal(){
  document.addEventListener('DOMContentLoaded', ()=>{
    const container=document.getElementById('pinnedMsgContainer');
    window.showPinnedMessage=function(msg){
      if(!msg){ container.style.display='none'; container.innerHTML=''; return; }
      const canUnpin = window.currentUser && (window.currentUser.role==='owner' || window.currentUser.role==='admin');
      container.innerHTML=`
        <div class="pinned-msg" onclick="scrollToMessage('${msg.id}')">
          <div class="pinned-msg-ico">📌</div>
          <div class="pinned-msg-content">
            <div class="pinned-msg-title">پیام سنجاق شده</div>
            <div class="pinned-msg-text">${escapeHtml((msg.text||'').substring(0,80))}</div>
          </div>
          ${canUnpin?`<button class="pinned-msg-unpin" onclick="event.stopPropagation(); unpinMessage()">✕</button>`:''}
        </div>
      `;
      container.style.display='block';
    };
    window.scrollToMessage=function(msgId){
      const el=document.querySelector('[data-msg-id="'+msgId+'"]');
      if(el){ el.scrollIntoView({behavior:'smooth',block:'center'}); el.style.background='#fffbeb'; setTimeout(()=>el.style.background='',2000); }
    };
    window.pinMessage=async function(msgId, text){
      const token=localStorage.getItem('fox_session');
      try{
        const res=await fetch('/api/groups/main/pin',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+token},body:JSON.stringify({messageId:msgId, text:text||''})});
        const data=await res.json(); if(!data.ok) throw new Error(data.error||data.message);
        if(window.foxToast) foxToast('پیام سنجاق شد 📌'); if(data.pinned) showPinnedMessage(data.pinned);
      }catch(e){ if(window.foxToast) foxToast('خطا: '+e.message); }
    };
    window.unpinMessage=async function(){
      const token=localStorage.getItem('fox_session');
      try{
        const res=await fetch('/api/groups/main/unpin',{method:'POST',headers:{'authorization':'Bearer '+token}});
        const data=await res.json(); if(!data.ok) throw new Error(data.error);
        showPinnedMessage(null); if(window.foxToast) foxToast('سنجاق برداشته شد');
      }catch(e){ if(window.foxToast) foxToast('خطا: '+e.message); }
    };
    function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    // Load pinned on start
    setTimeout(async ()=>{
      const token=localStorage.getItem('fox_session');
      if(!token) return;
      try{
        const res=await fetch('/api/groups/main/pinned',{headers:{'authorization':'Bearer '+token}});
        const data=await res.json();
        if(data.ok && data.pinned) showPinnedMessage(data.pinned);
      }catch(e){}
    },1500);
  });
})();

// Reliable capture-phase launchers for the first game row and wallet.  These
// intentionally replace fragile per-node handlers and also work after a view
// is restored from browser cache or re-rendered by an embedded WebView.
(function initPrimaryFunLaunchers(){
  document.addEventListener('click',function(e){
    const target=e.target&&e.target.closest?e.target.closest('#funMensh,#funDooz,#funTank,#funFox,#fbbOpenWalletBtn'):null;
    if(!target) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(window.__foxRestricted) return;
    if(target.id==='fbbOpenWalletBtn'){
      if(typeof window.openMyBalanceModal==='function') window.openMyBalanceModal();
      else if(window.foxToast) foxToast('کیف پول در حال آماده‌سازی است؛ دوباره تلاش کنید');
      return;
    }
    const games={
      funMensh:['fox_board',function(){if(window.openMensh)window.openMensh();}],
      funDooz:['tic_tac_toe',function(){if(window.openDooz)window.openDooz();}],
      funTank:['tank_duel',function(){if(window.openTank)window.openTank();}],
      funFox:['fox_escape',function(){if(window.FE_LAUNCH)window.FE_LAUNCH();}]
    };
    const game=games[target.id];
    if(!game) return;
    if(!window.FoxGameRewardService||typeof window.FoxGameRewardService.launchGame!=='function'){
      if(window.foxToast) foxToast('بازی در حال آماده‌سازی است؛ دوباره تلاش کنید');
      return;
    }
    window.FoxGameRewardService.launchGame(game[0],'solo',game[1]);
  },true);
})();

// Restriction Handling with auto-restore
(function initRestrictionFinal(){
  document.addEventListener('DOMContentLoaded', ()=>{
    const container=document.getElementById('restrictionBannerContainer');
    window.checkRestriction=async function(){
      const token=localStorage.getItem('fox_session');
      if(!token) return;
      try{
        const res=await fetch('/api/user/restriction',{headers:{'authorization':'Bearer '+token}});
        const data=await res.json();
        if(data.restricted){ showRestriction(data); } else { window.__foxRestricted=false; container.style.display='none'; container.innerHTML=''; if(window._restrictionTimer) clearInterval(window._restrictionTimer); }
      }catch(e){}
    };
    function showRestriction(data){
      window.__foxRestricted=true;
      const permanent=!!data.permanent || data.type==='banned' && !data.until;
      const remaining=Math.max(0,Number(data.remainingMs)||0);
      const reason=data.reason||data.msg||data.message||'نامشخص';
      function formatRemaining(ms){
        if(ms<=0) return 'پایان یافته';
        const sec=Math.floor(ms/1000);
        const m=Math.floor(sec/60);
        const s=sec%60;
        const h=Math.floor(m/60);
        const d=Math.floor(h/24);
        if(d>0) return d+' روز و '+(h%24)+' ساعت';
        if(h>0) return h+' ساعت و '+(m%60)+' دقیقه';
        if(m>0) return m+' دقیقه و '+s+' ثانیه';
        return s+' ثانیه';
      }
      container.innerHTML=`
        <section class="restriction-banner" role="alertdialog" aria-modal="true" aria-labelledby="restrictionTitle">
          <div class="restriction-lock" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M7 10V7a5 5 0 0 1 10 0v3M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 14v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>
          <div class="restriction-title" id="restrictionTitle">${permanent?'حساب شما مسدود شده است':'حساب شما موقتاً محدود شده است'}</div>
          <div class="restriction-reason"><b>دلیل:</b> ${escapeHtml(reason)}</div>
          <div class="restriction-countdown" id="restrictionCountdown">${permanent?'مسدودی فعال':formatRemaining(remaining)}</div>
          <div class="restriction-help">${permanent?'دسترسی به پیام‌ها، بازی‌ها، کیف پول و سایر قابلیت‌های روباه متوقف شده است.':'پس از پایان زمان، دسترسی‌ها به‌صورت خودکار و بدون خروج از حساب باز می‌گردد.'}</div>
        </section>
      `;
      container.style.display='block';
      let remainingMs=remaining;
      if(window._restrictionTimer) clearInterval(window._restrictionTimer);
      if(permanent) return;
      window._restrictionTimer=setInterval(()=>{
        remainingMs-=1000;
        const el=document.getElementById('restrictionCountdown');
        if(!el){ clearInterval(window._restrictionTimer); return; }
        if(remainingMs<=0){
          el.textContent='پایان یافته - در حال بارگذاری مجدد...';
          clearInterval(window._restrictionTimer);
          setTimeout(()=>{
            container.style.display='none';
            if(window.checkRestriction) window.checkRestriction();
            if(window.foxToast) foxToast('محدودیت شما پایان یافت ✅');
            // Enable all buttons again
            document.querySelectorAll('button[disabled]').forEach(b=>b.disabled=false);
          },2000);
        }else{ el.textContent=formatRemaining(remainingMs); }
      },1000);
      // Disable main actions
      // Instead of disabling, we rely on backend checks - but show UI
    }
    function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    setTimeout(()=>{ if(window.checkRestriction) window.checkRestriction(); },2000);
    setInterval(()=>{ if(window.checkRestriction) window.checkRestriction(); },30000);
    // Intercept fetch errors for restricted
    const origFetch=window.fetch;
    window.fetch=async function(...args){
      const res=await origFetch.apply(this,args);
      if(res.status===403){
        try{
          const clone=res.clone();
          const data=await clone.json();
          if(data.error==='restricted' || data.error==='banned' || data.error==='muted'){
            const r=data.restriction||data;
            showRestriction({type:r.type||data.error, reason:r.reason||data.reason||data.msg||data.message, remainingMs:r.remainingMs||data.remainingMs||0, until:r.until||data.until, permanent:!!(r.permanent||data.permanent)});
          }
        }catch(e){}
      }
      return res;
    };
  });
})();

// Add Manage button to the REAL group header for owner/admin only.
document.addEventListener('DOMContentLoaded', ()=>{
  let roleLoading=false;
  const mountManageButton=()=>{
    let role=window.__foxMainGroupRole;
    if(role===undefined && location.protocol!=='file:'){
      if(!roleLoading){
        roleLoading=true;
        const token=localStorage.getItem('fox_session')||'';
        fetch('/api/groups/main',{headers:token?{'authorization':'Bearer '+token}:{}}).then(r=>r.json()).then(j=>{
          window.__foxMainGroupRole=j&&j.ok?j.role:'member';
          roleLoading=false;mountManageButton();
          try{if(typeof foxRenderGroup==='function'&&typeof lastMessages!=='undefined')foxRenderGroup(lastMessages);}catch(e){}
        }).catch(()=>{window.__foxMainGroupRole='member';roleLoading=false;});
      }
      return false;
    }
    if(role===undefined) role=window.currentUser&&window.currentUser.role || (typeof currentUser!=='undefined'&&currentUser&&currentUser.role) || '';
    if(['owner','admin'].indexOf(role)<0) return false;
    const header=document.getElementById('groupDrawer');
    if(!header) return false;
    if(!document.getElementById('manageGroupBtn')){
      const btn=document.createElement('button');
      btn.id='manageGroupBtn';btn.type='button';btn.textContent='🛡️ مدیریت';btn.className='g-item';
      
      btn.onclick=()=>{var dr=document.getElementById('groupDrawer'),ov=document.getElementById('groupOverlay');if(dr)dr.classList.remove('open');if(ov)ov.classList.remove('show');if(window.openAdminPanel)window.openAdminPanel(window.__foxGroup||'main');};
      var anchor=document.getElementById('gmMembers'); if(anchor && anchor.nextSibling) header.insertBefore(btn, anchor.nextSibling); else header.appendChild(btn);
    }
    return true;
  };
  let tries=0;const timer=setInterval(()=>{tries++;if(mountManageButton()||tries>=12)clearInterval(timer);},500);
});
