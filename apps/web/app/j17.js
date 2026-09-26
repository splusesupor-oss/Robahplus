
(function() {
  // ===== Fox Creator Modal Logic =====
  var OSINE_DATA = {
    phone: '09921521811',
    name: 'osine',
    username: 'osine',
    verified: true,
    role: 'owner',
    bio: 'پشتیبانی و سازنده پیام رسان رقابت آنلاین روباه'
  };

  function openCreatorModal() {
    var crOv = document.getElementById('creatorOverlay');
    if (!crOv) return;
    crOv.classList.add('open');
    crOv.setAttribute('aria-hidden', 'false');
    try {
      fetch('/api/user?phone=' + encodeURIComponent(OSINE_DATA.phone))
        .then(function(r){ return r.json(); })
        .then(function(u){
          if (u) {
            OSINE_DATA = Object.assign({}, OSINE_DATA, u);
            var ava = document.getElementById('crModalAva');
            if (ava && u.avatar && u.avatar.indexOf('data:') === 0) ava.src = u.avatar;
          }
        }).catch(function(){});
    } catch(e){}
  }
  function closeCreatorModal() {
    var crOv = document.getElementById('creatorOverlay');
    if (!crOv) return;
    crOv.classList.remove('open');
    crOv.setAttribute('aria-hidden', 'true');
  }
  window.openCreatorModal = openCreatorModal;
  window.closeCreatorModal = closeCreatorModal;

  var crOv = document.getElementById('creatorOverlay');
  var crClose = document.getElementById('creatorCloseBtn');
  var crCopy = document.getElementById('crCopyPill');
  var crDm = document.getElementById('crDmBtn');
  var crProf = document.getElementById('crProfileBtn');
  var crAva = document.getElementById('crModalAva');

  if (crClose) crClose.addEventListener('click', closeCreatorModal);
  if (crOv) crOv.addEventListener('click', function(e){ if (e.target === crOv) closeCreatorModal(); });
  document.addEventListener('keydown', function(e){
    if ((e.key === 'Escape' || e.key === 'Esc') && crOv && crOv.classList.contains('open')) closeCreatorModal();
  });

  if (crCopy) {
    crCopy.addEventListener('click', function(e) {
      e.preventDefault();
      var uname = '@osine';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(uname).then(function() {
          if (typeof foxToast === 'function') foxToast('نام کاربری @osine کپی شد ✓');
        }).catch(function() {
          if (typeof foxToast === 'function') foxToast(uname);
        });
      } else {
        if (typeof foxToast === 'function') foxToast('نام کاربری: @osine');
      }
    });
  }

  if (crDm) {
    crDm.addEventListener('click', function(e) {
      e.preventDefault();
      closeCreatorModal();
      if (typeof window.closePlanPanel === 'function') window.closePlanPanel();
      if (typeof currentUser === 'undefined' || !currentUser || !currentUser.phone) {
        if (typeof openAppModal === 'function') openAppModal('ورود به حساب', 'برای چت خصوصی با سازنده ابتدا وارد حساب خود شوید.', [{label:'باشه',primary:true}]);
        return;
      }
      if (typeof openDMChat === 'function') {
        openDMChat(Object.assign({}, OSINE_DATA), 'home');
      }
    });
  }

  if (crProf) {
    crProf.addEventListener('click', function(e) {
      e.preventDefault();
      closeCreatorModal();
      if (typeof window.closePlanPanel === 'function') window.closePlanPanel();
      if (typeof openUserProfile === 'function') {
        openUserProfile(Object.assign({}, OSINE_DATA), 'home');
      }
    });
  }

  // ===== Fox Support Live Chat Logic =====
  var supOv = document.getElementById('supportOverlay');
  var supClose = document.getElementById('supCloseBtn');
  var supList = document.getElementById('supMessagesList');
  var supTyping = document.getElementById('supTyping');
  var supInput = document.getElementById('supInput');
  var supSend = document.getElementById('supSendBtn');
  var supChips = document.getElementById('supChips');
  var supportHistory = [];

  function openSupportModal() {
    if (!supOv) return;
    supOv.classList.add('open');
    supOv.setAttribute('aria-hidden', 'false');
    if (supInput) setTimeout(function(){ try { supInput.focus(); } catch(e){} }, 200);
  }
  function closeSupportModal() {
    if (!supOv) return;
    supOv.classList.remove('open');
    supOv.setAttribute('aria-hidden', 'true');
  }
  window.openSupportModal = openSupportModal;
  window.closeSupportModal = closeSupportModal;

  if (supClose) supClose.addEventListener('click', closeSupportModal);
  if (supOv) supOv.addEventListener('click', function(e){ if (e.target === supOv) closeSupportModal(); });
  document.addEventListener('keydown', function(e){
    if ((e.key === 'Escape' || e.key === 'Esc') && supOv && supOv.classList.contains('open')) closeSupportModal();
  });

  function formatSupportText(str) {
    if (!str) return '';
    var s = String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    s = s.replace(/[*][*]([^*]+)[*][*]/g, '<b>$1</b>');
    s = s.replace(/@osine(?=[^a-zA-Z0-9_]|$)/gi, '<button type="button" class="sup-osine-pill" data-open-osine="true">@osine</button>');
    s = s.split(String.fromCharCode(10)).join('<br/>');
    return s;
  }

  function appendSupportMsg(role, text) {
    if (!supList) return;
    var row = document.createElement('div');
    row.className = 'sup-msg ' + (role === 'user' ? 'user' : 'bot');
    var timeTag = role === 'user' ? 'شما' : 'پشتیبانی هوشمند';
    var formatted = formatSupportText(text);
    row.innerHTML = '<div class="sup-msg-bubble">' + formatted + '<span class="sup-time">' + timeTag + '</span></div>';
    supList.appendChild(row);
    supList.scrollTop = supList.scrollHeight;

    // Attach click for @osine pills
    var pills = row.querySelectorAll('[data-open-osine]');
    pills.forEach(function(pill) {
      pill.addEventListener('click', function(e) {
        e.preventDefault();
        closeSupportModal();
        if (typeof openDMChat === 'function') {
          openDMChat(Object.assign({}, OSINE_DATA), 'home');
        }
      });
    });
  }

  async function sendSupportQuery(queryText) {
    var q = String(queryText || '').trim();
    if (!q) return;
    appendSupportMsg('user', q);
    supportHistory.push({ role: 'user', content: q });
    if (supInput) supInput.value = '';
    if (supTyping) supTyping.classList.add('show');
    if (supList) supList.scrollTop = supList.scrollHeight;

    try {
      var res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: q, history: supportHistory.slice(-4) })
      });
      var j = await res.json();
      if (supTyping) supTyping.classList.remove('show');
      var reply = j && j.reply ? j.reply : 'پاسخ این مورد در پایگاه دانش ثبت نشده است یا نیازمند بررسی مستقیم حساب شماست. لطفاً به سازنده روباه با نام کاربری @osine در چت خصوصی پیام دهید.';
      appendSupportMsg('bot', reply);
      supportHistory.push({ role: 'assistant', content: reply });
    } catch(err) {
      if (supTyping) supTyping.classList.remove('show');
      appendSupportMsg('bot', 'متأسفانه در اتصال به مرکز پشتیبانی مشکلی رخ داد. لطفاً اتصال اینترنت خود را بررسی کنید یا مستقیماً به سازنده روباه با نام کاربری @osine پیام دهید.');
    }
  }

  if (supSend && supInput) {
    supSend.addEventListener('click', function(e) {
      e.preventDefault();
      sendSupportQuery(supInput.value);
    });
    supInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendSupportQuery(supInput.value);
      }
    });
  }

  if (supChips) {
    supChips.addEventListener('click', function(e) {
      var btn = e.target.closest('button[data-prompt]');
      if (!btn) return;
      var promptText = btn.getAttribute('data-prompt');
      if (promptText) sendSupportQuery(promptText);
    });
  }
})();

  /* ===== Fox Ranking System Client Runtime ===== */
  var rkData = null, rkCurrentTab = 'weekly', rkTimer = null, rkActiveEndsAt = 0, rkServerOffset = 0;

  function rkFaNum(n) {
    if (n === null || n === undefined) return '۰';
    var faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return String(n).replace(/[0-9]/g, function(d) { return faDigits[Number(d)]; });
  }

  function rkEsc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function rkFormatTimer(sec) {
    if (sec <= 0) return '۰۰:۰۰:۰۰';
    var days = Math.floor(sec / 86400);
    var hrs = Math.floor((sec % 86400) / 3600);
    var mins = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    if (days > 0) {
      return rkFaNum(days) + ' روز و ' + rkFaNum(hrs) + ' ساعت و ' + rkFaNum(mins) + ' دقیقه';
    }
    return (hrs < 10 ? '۰' : '') + rkFaNum(hrs) + ':' + (mins < 10 ? '۰' : '') + rkFaNum(mins) + ':' + (s < 10 ? '۰' : '') + rkFaNum(s);
  }

  function openRanking() {
    var ov = document.getElementById('rankingOverlay');
    if (!ov) return;
    ov.classList.add('open');
    loadRankingData(false);
  }

  function closeRanking() {
    var ov = document.getElementById('rankingOverlay');
    if (ov) ov.classList.remove('open');
    if (rkTimer) { clearInterval(rkTimer); rkTimer = null; }
  }

  function updateRankingCountdown() {
    var el = document.getElementById('rkCountdown');
    if (!el || !rkActiveEndsAt) return;
    var now = Date.now() + rkServerOffset;
    var remainingSec = Math.max(0, Math.floor((rkActiveEndsAt - now) / 1000));
    el.textContent = rkFormatTimer(remainingSec);
  }

  window.__foxRankingRefresh=loadRankingData;async function loadRankingData(force) {
    var loading = document.getElementById('rkLoading');
    var listEl = document.getElementById('rkList');
    var emptyEl = document.getElementById('rkEmpty');
    if (!rkData || force) {
      if (loading) loading.style.display = 'flex';
      if (listEl) listEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'none';
    }
    try {
      var r = await fetch('/api/ranking', { headers: { 'Accept': 'application/json' } });
      var j = await r.json();
      if (!j || !j.ok) throw new Error('fetch_failed');
      rkData = j;
      rkServerOffset = (j.serverTime || Date.now()) - Date.now();
      
      if (rkCurrentTab === 'daily' && j.periods && j.periods.daily) {
        rkActiveEndsAt = j.periods.daily.endsAt;
      } else if (j.periods && j.periods.weekly) {
        rkActiveEndsAt = j.periods.weekly.endsAt;
      }
      if (rkTimer) clearInterval(rkTimer);
      updateRankingCountdown();
      rkTimer = setInterval(updateRankingCountdown, 1000);

      renderRankingView();
    } catch (e) {
      if (loading) loading.innerHTML = '<span style="color:#ef4444;font-weight:700;">خطا در دریافت جدول رتبه‌بندی</span><button type="button" class="rk-view-prizes-btn" style="margin-top:8px;" onclick="loadRankingData(true)">تلاش دوباره</button>';
    }
  }

  function renderRankingView() {
    var loading = document.getElementById('rkLoading');
    var listEl = document.getElementById('rkList');
    var emptyEl = document.getElementById('rkEmpty');
    var myCard = document.getElementById('rkMyCard');
    if (loading) loading.style.display = 'none';

    if (!rkData) return;
    var items = (rkCurrentTab === 'daily') ? rkData.daily : (rkCurrentTab === 'all') ? rkData.alltime : rkData.weekly;
    items = items || [];

    if (!items.length) {
      if (listEl) listEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'flex';
      if (myCard) myCard.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (listEl) {
      listEl.style.display = 'flex';
      listEl.style.flexDirection = 'column';
      listEl.style.width = '100%';
      var myPhone = (window.currentUser && currentUser.phone) || '';
      var html = '';

      items.forEach(function(u) {
        var isTop3 = u.rank <= 3;
        var rankClass = u.rank === 1 ? 'rk-card-gold' : u.rank === 2 ? 'rk-card-silver' : u.rank === 3 ? 'rk-card-bronze' : '';
        var badgeClass = u.rank === 1 ? 'gold' : u.rank === 2 ? 'silver' : u.rank === 3 ? 'bronze' : '';
        var crown = u.rank === 1 ? '<span class="rk-crown">👑</span>' : '';
        var isMe = myPhone && (u.phone === myPhone);
        var meClass = isMe ? ' rk-card-me' : '';

        var charBadge = '';
        if (u.activeChar && window.charBadgeHtml) {
          charBadge = window.charBadgeHtml(u.activeChar);
        } else if (u.activeChar && window.FOX_CHARS_IMG && window.FOX_CHARS_IMG[u.activeChar]) {
          var ch = window.FOX_CHARS_IMG[u.activeChar];
          charBadge = '<span class="rk-char-badge"><img src="' + ch.s + '" alt=""/><span>' + rkEsc(ch.n) + '</span></span>';
        }

        var prizeBtn = '';
        if (isTop3 && u.prize) {
          prizeBtn = '<button class="rk-card-prize-btn ' + badgeClass + '" type="button" data-rank="' + u.rank + '" data-phone="' + u.phone + '" data-name="' + rkEsc(u.name) + '" data-prize="' + u.prize + '">'
                   + '<span>🎁 ' + rkFaNum(u.prize) + ' الماس</span>'
                   + '</button>';
        }

        var ava = u.avatar || (window.DEFAULT_AVA || '/static/50cfb82dfb86fb6826d12c128df7c367a4e2e4a32e3b23dd4eb80f5ee797c5c1.webp');
        var verifiedTick = u.verified ? '<span class="rk-verified-tick" title="حساب تأییدشده">✓</span>' : '';

        html += '<div class="rk-card ' + rankClass + meClass + '" data-phone="' + u.phone + '">'
              +   '<div class="rk-rank-badge ' + badgeClass + '">'
              +     crown
              +     '<span>' + rkFaNum(u.rank) + '</span>'
              +   '</div>'
              +   '<div class="rk-ava-wrap">'
              +     '<img src="' + ava + '" class="rk-ava" alt="' + rkEsc(u.name) + '" loading="lazy"/>'
              +   '</div>'
              +   '<div class="rk-user-details">'
              +     '<div class="rk-name-row">'
              +       '<span class="rk-name">' + rkEsc(u.name) + '</span>'
              +       verifiedTick
              +       charBadge
              +     '</div>'
              +     (u.username ? '<span class="rk-username">@' + rkEsc(u.username) + '</span>' : '')
              +   '</div>'
              +   '<div class="rk-score-col">'
              +     '<div class="rk-score-pill">'
              +       '<span class="rk-gem">💎</span>'
              +       '<span>' + rkFaNum(u.score) + '</span>'
              +     '</div>'
              +     prizeBtn
              +   '</div>'
              + '</div>';
      });

      listEl.innerHTML = html;

      listEl.querySelectorAll('.rk-card-prize-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var rank = Number(btn.getAttribute('data-rank'));
          var name = btn.getAttribute('data-name');
          var prize = Number(btn.getAttribute('data-prize'));
          openPrizeModal({ rank: rank, name: name, prize: prize });
        });
      });
    }

    if (myCard) {
      var myPhone = (window.currentUser && currentUser.phone) || '';
      if (myPhone && rkData.myRank) {
        var myInfo = (rkCurrentTab === 'daily') ? rkData.myRank.daily : (rkCurrentTab === 'all') ? rkData.myRank.allTime : rkData.myRank.weekly;
        if (myInfo) {
          myCard.style.display = 'flex';
          var numEl = document.getElementById('rkMyRankNum');
          var subEl = document.getElementById('rkMySub');
          var valEl = document.getElementById('rkMyScoreVal');
          if (numEl) numEl.textContent = '#' + rkFaNum(myInfo.rank);
          if (subEl) subEl.textContent = myInfo.rank <= 3 ? '🎉 تبریک! شما در جایگاه جایزه‌دار هستید' : 'فاصله تا جوایز برتر: ' + rkFaNum(Math.max(1, myInfo.rank - 3)) + ' رتبه';
          if (valEl) valEl.textContent = rkFaNum(myInfo.score);
        } else {
          myCard.style.display = 'none';
        }
      } else {
        myCard.style.display = 'none';
      }
    }
  }

  function openPrizeModal(target) {
    var ov = document.getElementById('rankingPrizeModal');
    var sec = document.getElementById('rkClaimSection');
    if (!ov) return;

    var claimable = (rkData && rkData.claimable) || (target && target.prize ? target : null);
    var html = '';

    if (claimable && (claimable.eligible || (target && target.prize)) && !claimable.claimed) {
      var prizeAmt = claimable.prize || 100;
      var rankNum = claimable.rank || 1;
      html = '<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:12px;margin-bottom:6px;">'
           +   '<div style="font-weight:900;color:#15803d;margin-bottom:4px;">🎉 تبریک! جایزه رتبه ' + rkFaNum(rankNum) + ' آماده دریافت است</div>'
           +   '<div style="font-size:12px;color:#166534;margin-bottom:10px;">شما برنده ' + rkFaNum(prizeAmt) + ' الماس شدید. برای واریز مستقیم به کیف پول درون‌برنامه کلیک کنید:</div>'
           +   '<button type="button" class="rk-claim-btn" id="rkClaimPrizeBtn">💎 دریافت ' + rkFaNum(prizeAmt) + ' الماس جایزه</button>'
           + '</div>';
    } else if (claimable && claimable.claimed) {
      html = '<div class="rk-claim-status" style="background:#f0fdf4;color:#15803d;border-color:#bbf7d0;font-weight:800;">'
           +   '✓ جایزه دوره پیشین (' + rkFaNum(claimable.prize) + ' الماس) قبلاً با موفقیت به کیف پول شما واریز شده است.'
           + '</div>';
    } else {
      html = '<div class="rk-claim-status">'
           +   '⏳ جوایز دوره هفتگی (۱۰۰، ۷۰ و ۵۰ الماس) دوشنبه هر هفته ساعت ۰۰:۰۰ UTC نهایی و به ۳ قهرمان برتر تعلق می‌گیرد.'
           + '</div>';
    }

    if (sec) sec.innerHTML = html;
    ov.classList.add('open');

    var claimBtn = document.getElementById('rkClaimPrizeBtn');
    if (claimBtn) {
      claimBtn.addEventListener('click', async function() {
        claimBtn.disabled = true;
        claimBtn.textContent = 'در حال واریز الماس‌ها…';
        try {
          var r = await fetch('/api/ranking/claim', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ periodType: (claimable && claimable.periodType) || 'weekly', periodKey: claimable && claimable.periodKey })
          });
          var j = await r.json();
          if (!r.ok || !j.ok) {
            if (j.error === 'already_claimed') {
              if (sec) sec.innerHTML = '<div class="rk-claim-status" style="background:#f0fdf4;color:#15803d;border-color:#bbf7d0;font-weight:800;">✓ جایزه این دوره قبلاً دریافت شده است.</div>';
              return;
            }
            throw new Error(j.error || 'claim_failed');
          }
          if (window.FoxWallet && j.wallet) window.FoxWallet.apply(j.wallet);
          if (sec) sec.innerHTML = '<div class="rk-claim-status" style="background:#f0fdf4;color:#15803d;border-color:#bbf7d0;font-weight:900;">'
                        +   '💎 ' + rkFaNum(j.prize) + ' الماس با موفقیت به کیف پول شما واریز شد!'
                        + '</div>';
          if (window.foxToast) foxToast('جایزه رتبه‌بندی به کیف پول شما افزوده شد 💎');
          loadRankingData(true);
        } catch (err) {
          claimBtn.disabled = false;
          claimBtn.textContent = 'خطا در واریز؛ دوباره امتحان کنید';
        }
      });
    }
  }

  function closePrizeModal() {
    var ov = document.getElementById('rankingPrizeModal');
    if (ov) ov.classList.remove('open');
  }

  function initRankingUI() {
    var prizeOv = document.getElementById('rankingPrizeModal');
    if (prizeOv) {
      prizeOv.addEventListener('click', function(e) {
        if (e.target === prizeOv) closePrizeModal();
      });
    }
    var fabRk = document.getElementById('rankingFab');
    if (fabRk) fabRk.addEventListener('click', openRanking);

    var closeBtn = document.getElementById('rkCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeRanking);

    var refBtn = document.getElementById('rkRefreshBtn');
    if (refBtn) refBtn.addEventListener('click', function() { loadRankingData(true); });

    var viewPrizesBtn = document.getElementById('rkViewPrizesBtn');
    if (viewPrizesBtn) viewPrizesBtn.addEventListener('click', function() { openPrizeModal(); });

    var prizeCloseBtn = document.getElementById('rkPrizeCloseBtn');
    if (prizeCloseBtn) prizeCloseBtn.addEventListener('click', closePrizeModal);

    var buyLinkBtn = document.getElementById('rkBuyLinkBtn');
    if (buyLinkBtn) {
      buyLinkBtn.addEventListener('click', function() {
        closeRanking();
        if (window.openDiamondPanel) openDiamondPanel();
      });
    }

    ['rkTabWeekly', 'rkTabDaily', 'rkTabAll'].forEach(function(tabId) {
      var tabBtn = document.getElementById(tabId);
      if (!tabBtn) return;
      tabBtn.addEventListener('click', function() {
        document.querySelectorAll('.rk-tab').forEach(function(b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        tabBtn.classList.add('active');
        tabBtn.setAttribute('aria-selected', 'true');
        rkCurrentTab = tabBtn.getAttribute('data-tab');
        if (rkData && rkData.periods) {
          if (rkCurrentTab === 'daily') rkActiveEndsAt = rkData.periods.daily.endsAt;
          else rkActiveEndsAt = rkData.periods.weekly.endsAt;
        }
        updateRankingCountdown();
        renderRankingView();
      });
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        var rkOv = document.getElementById('rankingOverlay');
        var prizeOv = document.getElementById('rankingPrizeModal');
        if (prizeOv && prizeOv.classList.contains('open')) closePrizeModal();
        else if (rkOv && rkOv.classList.contains('open')) closeRanking();
      }
    });

    // Wire real purchase flow into diamond shop cards
    var dmCards = document.querySelectorAll('#dmCardsGrid .dm-buy-card');
    dmCards.forEach(function(card) {
      card.addEventListener('click', function(e) {
        var d = Number(card.getAttribute('data-diamonds'));
        var c = Number(card.getAttribute('data-coins'));
        var pkgId = 'dm_' + d;
        if (window.foxConfirm) {
          foxConfirm('خرید بسته الماس', 'آیا مایل به خرید بسته ' + rkFaNum(d) + ' الماس به همراه ' + rkFaNum(c) + ' سکه هدیه هستید؟', async function() {
            try {
              var r = await fetch('/api/diamonds/purchase', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ packageId: pkgId })
              });
              var j = await r.json();
              if (!r.ok || !j.ok) throw new Error(j.error || 'buy_failed');
              if (window.FoxWallet && j.wallet) window.FoxWallet.apply(j.wallet);
              if (window.foxToast) foxToast('بسته ' + rkFaNum(d) + ' الماس با موفقیت دریافت شد! رتبه شما در جدول قهرمانان ثبت شد 💎');
              if (document.getElementById('rankingOverlay') && document.getElementById('rankingOverlay').classList.contains('open')) {
                loadRankingData(true);
              }
            } catch (err) {
              if (window.foxToast) foxToast('خطا در خرید بسته؛ دوباره تلاش کنید.');
            }
          });
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRankingUI);
  } else {
    initRankingUI();
  }
  window.FoxRanking = {
    open: openRanking,
    close: closeRanking,
    refresh: loadRankingData,
    openPrizes: openPrizeModal
  };

