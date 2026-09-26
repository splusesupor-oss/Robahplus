
/* ===== FOX QUIZ 2026 — مسابقه چهارگزینه‌ای روباه (client) ===== */
(function () {
  'use strict';
  var Q = {
    active: false, mode: null, room: null, seat: -1, partner: '',
    cur: null, lock: false, tStart: 0, qTimer: null, pollTimer: null, waitTimer: null,
    lastNextOnline: null, answeredQi: -1, soloWaitNext: null, score: 0
  };
  function E(id) { return document.getElementById(id); }
  function show(el) { if (el) el.classList.remove('qzHide'); }
  function hide(el) { if (el) el.classList.add('qzHide'); }
  var _post = (typeof apiPost === 'function') ? apiPost : function (u, b) {
    return fetch(u, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b || {}) }).then(function (r) { return r.json(); });
  };
  function _try(fn, tries, delay) {
    return fn().catch(function (e) {
      if (tries > 0) return new Promise(function (res) { setTimeout(res, delay || 450); }).then(function () { return _try(fn, tries - 1, delay); });
      throw e;
    });
  }
  function failStart(why) {
    toast('شروع بازی ممکن نشد' + (why ? ': ' + why : ''));
    goHome();
  }
  var _get = (typeof apiGet === 'function') ? apiGet : function (u) { return fetch(u, { cache: 'no-store' }).then(function (r) { return r.json(); }); };
  function me() {
    try { var p = (typeof myPhone === 'function') ? myPhone() : ''; if (p) return String(p); } catch (e) {}
    try {
      var u = JSON.parse(localStorage.getItem('fox_user') || 'null');
      if (u && u.phone) return String(u.phone);
    } catch (e2) {}
    return '';
  }
  function mn() { try { return (typeof myName === 'function') ? myName() : 'بازیکن'; } catch (e) { return 'بازیکن'; } }
  var FAD = '۰۱۲۳۴۵۶۷۸۹';
  function qzFa(x) { return String(x).replace(/[0-9]/g, function (d) { return FAD[+d]; }); }
  function esc(s) {
    try { return (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s == null ? '' : s); }
    catch (e) { return String(s == null ? '' : s); }
  }
  var LETTERS = ['الف', 'ب', 'ج', 'د'];

  /* ---------- view control ---------- */
  function enterView() {
    var secs = document.querySelectorAll('section.view');
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].id !== 'viewQuiz') { secs[i].classList.add('hidden'); secs[i].style.display = 'none'; }
    }
    var v = E('viewQuiz');
    v.classList.remove('hidden'); v.style.display = 'block';
    var bn = document.getElementById('bottomNav');
    if (bn) { bn.classList.remove('show'); bn.style.display = 'flex'; }
  }
  function exitQuiz() {
    stopAllTimers();
    Q.active = false; Q.mode = null; Q.lock = false; Q.room = null; Q.answeredQi = -1;
    var v = E('viewQuiz');
    v.classList.add('hidden'); v.style.display = 'none';
    var bn = document.getElementById('bottomNav');
    if (bn) { bn.style.display = ''; bn.classList.add('show'); }
    if (typeof window.goFun === 'function') window.goFun();
    else { var vf = E('viewFun'); if (vf) { vf.classList.remove('hidden'); vf.style.display = 'flex'; } }
  }
  function stopAllTimers() {
    if (Q.qTimer) { clearInterval(Q.qTimer); Q.qTimer = null; }
    if (Q.pollTimer) { clearInterval(Q.pollTimer); Q.pollTimer = null; }
    if (Q.waitTimer) { clearInterval(Q.waitTimer); Q.waitTimer = null; }
  }
  function setPanel(name) {
    hide(E('qzHome')); hide(E('qzWait')); hide(E('qzFound')); hide(E('qzPlay'));
    hide(E('qzStageOv')); hide(E('qzFinalOv'));
    if (name) show(E(name));
    var ts = E('qzTopScore');
    if (ts) { if (name === 'qzPlay') show(ts); else hide(ts); }
  }

  /* ---------- toast ---------- */
  function toast(txt, cls) {
    var old = document.querySelector('.qz-toast'); if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'qz-toast' + (cls ? ' ' + cls : '');
    t.textContent = txt;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 1900);
  }
  /* ---------- confetti ---------- */
  function confetti(el, count) {
    if (!el) return;
    el.innerHTML = '';
    var em = ['#FF7A00', '#ffb15c', '#8b5cf6', '#22c55e', '#ffd76a', '#ff8fab'];
    for (var i = 0; i < (count || 14); i++) {
      var s = document.createElement('i');
      s.style.background = em[Math.floor(Math.random() * em.length)];
      s.style.width = (6 + Math.random() * 7) + 'px';
      s.style.height = (9 + Math.random() * 9) + 'px';
      s.style.borderRadius = Math.random() > .5 ? '50%' : '3px';
      s.style.insetInlineStart = (4 + Math.random() * 92) + '%';
      s.style.animationDelay = (Math.random() * 1.2) + 's';
      el.appendChild(s);
    }
  }

  /* ---------- HUD ---------- */
  function setHud(stage, sp, per, score) {
    E('qzStagePill').textContent = 'مرحله ' + qzFa(stage);
    E('qzQNum').textContent = 'سؤال ' + qzFa(sp) + ' از ' + qzFa(per);
    var chip = E('qzScoreChip');
    chip.textContent = 'امتیاز ' + qzFa(score);
    chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
    E('qzTopScoreV').textContent = qzFa(score);
  }

  /* ---------- timer ---------- */
  function startTimer(ms, onOut) {
    if (Q.qTimer) clearInterval(Q.qTimer);
    var bar = E('qzTimerBar');
    var total = ms || 30000;
    Q.tStart = Date.now();
    bar.classList.remove('low');
    Q.qTimer = setInterval(function () {
      var remain = total - (Date.now() - Q.tStart);
      var pct = Math.max(0, remain / total * 100);
      bar.style.width = pct + '%';
      if (pct < 28) bar.classList.add('low');
      if (remain <= 0) {
        clearInterval(Q.qTimer); Q.qTimer = null;
        onOut();
      }
    }, 60);
  }
  function stopTimer() { if (Q.qTimer) { clearInterval(Q.qTimer); Q.qTimer = null; } }
  function elapsed() { return Date.now() - Q.tStart; }

  /* ---------- question render ---------- */
  function renderQuestion(cur, marks, marksPrefix) {
    Q.cur = cur;
    E('qzCat').textContent = cur.cat || 'دانش عمومی';
    E('qzQText').textContent = cur.q;
    var card = E('qzQCard');
    card.classList.remove('qin'); void card.offsetWidth; card.classList.add('qin');
    var host = E('qzOpts');
    host.innerHTML = '';
    for (var i = 0; i < 4; i++) {
      (function (idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'qz-opt pop';
        b.style.animationDelay = (idx * 0.07) + 's';
        b.innerHTML = '<span class="ltr">' + LETTERS[idx] + '</span><span class="txt">' + esc(cur.o[idx]) + '</span>';
        b.addEventListener('click', function () { submitAnswer(idx, b); });
        host.appendChild(b);
      })(i);
    }
    renderMarks(marks);
  }
  function renderMarks(marks) {
    var host = E('qzMarks');
    if (!host) return;
    host.innerHTML = '';
    if (!marks || !marks.length) return;
    for (var i = 0; i < marks.length; i++) {
      var d = document.createElement('span');
      d.className = 'qz-mark' + (marks[i] === 1 ? ' g' : marks[i] === 0 ? ' b' : '');
      host.appendChild(d);
    }
  }
  function lockOpts(chosen, correctIdx) {
    var btns = E('qzOpts').querySelectorAll('.qz-opt');
    for (var i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
      if (chosen >= 0 && i === chosen && i !== correctIdx) btns[i].classList.add('bad');
      if (i === correctIdx) btns[i].classList.add('good');
      else if (i !== chosen) btns[i].classList.add('dim');
    }
  }
  function markChosen(btn) { btn.classList.add('picked'); }

  /* ---------- SOLO ---------- */
  function startSolo(fresh) {
    if (!me()) { toast('اول باید وارد حساب کاربری شوید'); return; }
    setPanel(null);
    var btn = E('qzBtnSolo'); if (btn) btn.disabled = true;
    _try(function () { return _post('/api/quiz/solo/start', { phone: me(), fresh: !!fresh }); }, 2).then(function (r) {
      if (btn) btn.disabled = false;
      if (!r || (!r.playing && !r.done)) { failStart(r && r.error ? String(r.error) : 'پاسخ نامعتبر'); return; }
      Q.mode = 'solo';
      if (r.done) { soloFinal(r, null); return; }
      Q.score = r.score || 0;
      setPanel('qzPlay');
      hide(E('qzOpp')); hide(E('qzYouBar'));
      try { renderSoloQ(r.cur, r); } catch (e) { failStart('خطای نمایش: ' + (e && e.message ? e.message : 'ناشناخته')); }
    }).catch(function () { if (btn) btn.disabled = false; toast('خطای اتصال — اینترنت را بررسی کنید'); goHome(); });
  }
  function soloMarks(r) {
    var m = [];
    var stagePos = r.cur ? (r.cur.n - 1) % 5 : 0;
    for (var i = 0; i < 5; i++) m.push(-1);
    return m;
  }
  function renderSoloQ(cur, r) {
    hide(E('qzStageOv'));
    hide(E('qzOpp')); hide(E('qzYouBar'));
    setHud(cur.stage, cur.sp, 5, r.score);
    var marks = [];
    for (var i = 0; i < 5; i++) marks.push(i < (cur.sp - 1) ? null : -1);
    Q.lock = false;
    Q.answeredQi = -1;
    renderQuestion(cur, marks);
    startTimer(cur.qt || 30000, function () { submitAnswer(-1, null); });
  }
  function submitAnswer(choice, btn) {
    if (Q.mode === 'solo') return soloSubmit(choice, btn);
    if (Q.mode === 'online') return onlineSubmit(choice, btn);
  }
  function soloSubmit(choice, btn) {
    if (Q.lock) return;
    Q.lock = true;
    stopTimer();
    var ms = elapsed();
    if (btn) markChosen(btn);
    _post('/api/quiz/solo/answer', { phone: me(), choice: choice, ms: ms, qi: (Q.cur && Q.cur.n ? Q.cur.n - 1 : -1) }).then(function (r) {
      if (r.error) { Q.lock = false; toast(r.error === 'nosolo' ? 'جلسه‌ای یافت نشد' : 'خطا'); return; }
      if (r.dup) { return; }
      lockOpts(choice, r.correctIndex);
      if (r.ok && r.pts) {
        toast('+' + qzFa(r.pts) + ' امتیاز!', 'pts');
        try {
          if (window.FoxGameRewardService) {
            FoxGameRewardService.claimReward({
              gameCode: 'quiz',
              mode: 'solo',
              result: 'correct_answer',
              questionId: (Q.cur && Q.cur.q ? Q.cur.q.id : null)
            });
          }
        } catch(e) {}
      }
      else if (!r.ok && choice >= 0) { toast('اشتباه شد!'); }
      else { toast('وقت تمام شد'); }
      Q.score = r.score || 0;
      setHud(Q.cur.stage, Q.cur.sp, 5, Q.score);
      setTimeout(function () {
        if (r.stageResult) {
          showStageResult(r.stageResult, function () {
            if (r.done) soloFinal(null, r);
            else renderSoloQ(r.next, { score: r.score });
          });
        } else if (r.done) {
          soloFinal(null, r);
        } else if (r.next) {
          renderSoloQ(r.next, { score: r.score });
        }
      }, 1050);
    }).catch(function () { Q.lock = false; toast('خطای اتصال'); });
  }
  function showStageResult(st, onNext) {
    E('qzStageTitle').textContent = 'پایان مرحله ' + qzFa(st.stage);
    var stats = E('qzStageStats');
    stats.innerHTML =
      '<div class="qz-stat green"><b>' + qzFa(st.ok) + ' از ۵</b><span>پاسخ صحیح</span></div>' +
      '<div class="qz-stat red"><b>' + qzFa(st.bad) + '</b><span>پاسخ غلط</span></div>' +
      '<div class="qz-stat purple"><b>' + qzFa(st.score) + '</b><span>امتیاز کل</span></div>' +
      '<div class="qz-stat"><b>' + qzFa((st.avgMs / 1000).toFixed(1)) + ' ث</b><span>میانگین زمان</span></div>';
    var stars = E('qzStars').children;
    for (var i = 0; i < stars.length; i++) stars[i].classList.remove('on');
    setTimeout(function () {
      for (var k = 0; k < stars.length; k++) { if (k < st.ok) stars[k].classList.add('on'); }
    }, 200);
    confetti(E('qzStageConf'), st.ok >= 3 ? 16 : 6);
    E('qzStageNext').textContent = 'ادامه به مرحله بعد';
    show(E('qzStageOv'));
    var nextBtn = E('qzStageNext');
    nextBtn.onclick = function () { hide(E('qzStageOv')); onNext(); };
  }
  function soloFinal(viewOrNull, lastAnswer) {
    var score = (viewOrNull && viewOrNull.score != null) ? viewOrNull.score : (lastAnswer && lastAnswer.score != null ? lastAnswer.score : Q.score);
    var ok = (viewOrNull && viewOrNull.ok != null) ? viewOrNull.ok : (lastAnswer && lastAnswer.okN != null ? lastAnswer.okN : 0);
    var bad = (viewOrNull && viewOrNull.bad != null) ? viewOrNull.bad : (lastAnswer && lastAnswer.badN != null ? lastAnswer.badN : 0);
    var n = (viewOrNull && viewOrNull.n != null) ? viewOrNull.n : (lastAnswer && lastAnswer.n != null ? lastAnswer.n : 0);
    var ffx = E('qzFinalFox'); if (ffx) ffx.className = 'bigfox' + (ok >= bad ? '' : ' dim');
    E('qzFinalTitle').textContent = 'پایان بازی! مجموع ' + qzFa(n) + ' سؤال';
    hide(E('qzFinalBadge')); hide(E('qzFinalDuo'));
    E('qzFinalStats').innerHTML =
      '<div class="qz-stat green"><b>' + qzFa(ok) + '</b><span>صحیح</span></div>' +
      '<div class="qz-stat red"><b>' + qzFa(bad) + '</b><span>غلط</span></div>' +
      '<div class="qz-stat purple"><b>' + qzFa(score) + '</b><span>امتیاز نهایی</span></div>' +
      '<div class="qz-stat"><b>' + qzFa(Math.round(ok / Math.max(1, n) * 100)) + '٪</b><span>دقت</span></div>';
    confetti(E('qzFinalConf'), 12);
    show(E('qzFinalOv'));
    E('qzFinalAgain').onclick = function () { hide(E('qzFinalOv')); startSolo(true); };
    E('qzFinalHome').onclick = function () { exitQuiz(); };
  }

  /* ---------- ONLINE ---------- */
  function startOnlineSearch() {
    if (!me()) { toast('اول باید وارد حساب کاربری شوید'); return; }
    Q.mode = 'online';
    Q.answeredQi = -1;
    setPanel('qzWait');
    var btn2 = E('qzBtnOnline'); if (btn2) btn2.disabled = true;
    _try(function () { return _post('/api/quiz/join', { phone: me(), name: mn() }); }, 2).then(function (r) {
      if (btn2) btn2.disabled = false;
      if (!r || r.error) { toast('ورود به مسابقه ممکن نشد' + (r && r.error ? ': ' + r.error : '')); goHome(); return; }
      if (r.room) { gotMatch(r); return; }
      if (r.waiting) { pollWait(); return; }
      goHome();
    }).catch(function () { if (btn2) btn2.disabled = false; toast('خطای اتصال — اینترنت را بررسی کنید'); goHome(); });
  }
  function pollWait() {
    if (Q.waitTimer) clearInterval(Q.waitTimer);
    Q.waitTimer = setInterval(function () {
      if (Q.mode !== 'online') { clearInterval(Q.waitTimer); Q.waitTimer = null; return; }
      _get('/api/quiz/wait?me=' + encodeURIComponent(me())).then(function (r) {
        if (r && r.room) { clearInterval(Q.waitTimer); Q.waitTimer = null; gotMatch(r); }
      }).catch(function () {});
    }, 1300);
  }
  function gotMatch(meta) {
    Q.room = meta.room; Q.seat = (meta.seat != null ? meta.seat : -1); Q.partner = meta.partner || 'حریف';
    E('qzFoundName').textContent = 'رقابت با «' + Q.partner + '» — ۳ مرحله × ۴ سؤال';
    setPanel('qzFound');
    setTimeout(function () {
      setPanel('qzPlay');
      show(E('qzOpp')); show(E('qzYouBar'));
      E('qzOppName').textContent = Q.partner;
      fetchOnlineState();
      if (Q.pollTimer) clearInterval(Q.pollTimer);
      Q.pollTimer = setInterval(fetchOnlineState, 1500);
    }, 1600);
  }
  function fetchOnlineState() {
    if (Q.mode !== 'online' || !Q.room) return;
    _get('/api/quiz/state?room=' + encodeURIComponent(Q.room) + '&phone=' + encodeURIComponent(me())).then(function (v) {
      if (!v || v.error) return;
      Q.lastView = v;
      applyOnlineView(v, true);
    }).catch(function () {});
  }
  function applyOnlineView(v, fromPoll) {
    if (v.finished) {
      if (Q.pollTimer) { clearInterval(Q.pollTimer); Q.pollTimer = null; }
      stopTimer();
      hide(E('qzStageOv'));
      onlineFinal(v);
      return;
    }
    /* HUD */
    var stage = v.next ? v.next.stage : 3;
    var sp = v.next ? v.next.sp : 4;
    setHud(stage, sp, 4, 0);
    E('qzScoreChip').textContent = qzFa(v.you.ok) + ' ✓ شما';
    E('qzTopScoreV').textContent = qzFa(v.you.ok);
    E('qzOppBar').style.width = Math.round(v.opp.n / 12 * 100) + '%';
    E('qzOppOk').textContent = qzFa(v.opp.ok) + ' ✓';
    renderMarks(v.you.marks);
    var yd = E('qzYouDots');
    yd.innerHTML = '';
    for (var i = 0; i < v.you.marks.length; i++) {
      var d = document.createElement('span');
      d.className = 'qz-mark' + (v.you.marks[i] === 1 ? ' g' : v.you.marks[i] === 0 ? ' b' : '');
      yd.appendChild(d);
    }
    /* stage interstitial: handled client-side on answer submit */
    if (Q.lock) return; /* keep animation until answered view arrives */
    if (v.next) {
      if (!Q.cur || Q.cur.qi !== v.next.qi) {
        Q.answeredQi = -1;
        renderQuestion(v.next, v.you.marks);
        startTimer(v.next.qt || 30000, function () { submitAnswer(-1, null); });
      }
    } else {
      /* finished mine; waiting for opponent */
      E('qzQText').textContent = 'همه‌ی سؤال‌ها تمام شد!';
      E('qzOpts').innerHTML = '<div class="qz-waitnote">منتظر پایان پاسخ‌های حریف...</div>';
      stopTimer();
    }
  }
  function onlineSubmit(choice, btn) {
    if (Q.lock) return;
    Q.lock = true;
    stopTimer();
    var ms = elapsed();
    if (btn) markChosen(btn);
    _post('/api/quiz/answer', { room: Q.room, phone: me(), choice: choice, ms: ms, qi: (Q.cur && typeof Q.cur.qi === 'number' ? Q.cur.qi : -1) }).then(function (v) {
      if (!v || v.error) { Q.lock = false; toast('خطا در ثبت پاسخ'); return; }
      Q.lastView = v;
      var a = v.answered;
      if (a) {
        lockOpts(choice, a.correctIndex);
        if (a.ok) toast('آفرین!', 'pts');
        else if (choice >= 0) toast('اشتباه شد!');
        else toast('وقت تمام شد');
      }
      var myNewCount = v.you ? v.you.n : 0;
      setTimeout(function () {
        if (v.finished) { onlineFinal(v); return; }
        Q.lock = false;
        var wasStageEnd = (myNewCount % 4 === 0) && myNewCount > 0 && v.next;
        if (wasStageEnd) {
          onlineStageBanner(v);
        } else {
          applyOnlineView(v, false);
        }
      }, 1100);
    }).catch(function () { Q.lock = false; toast('خطای اتصال'); });
  }
  function onlineStageBanner(v) {
    var sg = v.stages && v.stages.length ? v.stages[Math.min(2, Math.floor((v.you.n - 1) / 4))] : null;
    var t = sg ? sg : { stage: Math.floor((v.you.n - 1) / 4) + 1, you: 0, opp: 0 };
    E('qzStageTitle').textContent = 'مرحله ' + qzFa(t.stage) + ' تمام شد!';
    E('qzStageStats').innerHTML =
      '<div class="qz-stat green"><b>' + qzFa(t.you) + ' از ۴</b><span>تو</span></div>' +
      '<div class="qz-stat purple"><b>' + qzFa(v.you.ok) + '</b><span>کل صحیح‌های تو</span></div>' +
      '<div class="qz-stat"><b>' + qzFa(v.opp.ok) + '</b><span>کل صحیح‌های حریف</span></div>' +
      '<div class="qz-stat red"><b>' + qzFa(v.you.n - v.you.ok) + '</b><span>غلط‌های تو</span></div>';
    var stars = E('qzStars').children;
    for (var i = 0; i < stars.length; i++) stars[i].classList.remove('on');
    setTimeout(function () { for (var k = 0; k < stars.length; k++) { if (k < (t.you || 0)) stars[k].classList.add('on'); } }, 200);
    confetti(E('qzStageConf'), (t.you || 0) >= 2 ? 12 : 5);
    E('qzStageNext').textContent = (t.stage >= 3) ? 'مشاهده ادامه' : 'مرحله ' + qzFa(t.stage + 1);
    show(E('qzStageOv'));
    E('qzStageNext').onclick = function () {
      hide(E('qzStageOv'));
      applyOnlineView(Q.lastView, false);
    };
  }
  function onlineFinal(v) {
    stopTimer();
    var res = v.result || 'draw';
    var bd = E('qzFinalBadge');
    bd.classList.remove('qzHide', 'win', 'lose', 'draw');
    var ti = 'مساوی شد!';
    if (res === 'win') {
      ti = 'برنده شدی!'; bd.classList.add('win'); bd.textContent = 'برنده';
      try {
        if (window.FoxGameRewardService) {
          FoxGameRewardService.claimReward({ gameCode: 'quiz', mode: 'online', result: 'win' });
        }
      } catch(e) {}
    }
    else if (res === 'lose') { ti = 'این دور باختی!'; bd.classList.add('lose'); bd.textContent = 'باخت'; if (v.abandoned) ti = 'حریف مسابقه را ترک کرد'; }
    else { bd.classList.add('draw'); bd.textContent = 'مساوی'; }
    if (v.abandoned && res === 'win') ti = 'حریف مسابقه را ترک کرد — برنده شدی!';
    bd.classList.add('qz-result-badge', res === 'win' ? 'win' : res === 'lose' ? 'lose' : 'draw');
    var ffx2 = E('qzFinalFox'); if (ffx2) ffx2.className = 'bigfox' + (res === 'win' ? '' : ' dim');
    E('qzFinalTitle').textContent = ti;
    show(bd);
    show(E('qzFinalDuo'));
    var y = v.final ? v.final.you : { ok: 0 }, o = v.final ? v.final.opp : { ok: 0 };
    E('qzFinalYouOk').textContent = qzFa(y.ok);
    E('qzFinalOppOk').textContent = qzFa(o.ok);
    E('qzFinalOppName').textContent = (v.partner || 'حریف');
    buildDots(E('qzFinalYouDots'), v.final ? v.final.you.marks : []);
    buildDots(E('qzFinalOppDots'), v.final ? v.final.opp.marks : []);
    E('qzFinalStats').innerHTML =
      '<div class="qz-stat green"><b>' + qzFa(y.ok) + '</b><span>صحیح تو</span></div>' +
      '<div class="qz-stat red"><b>' + qzFa(y.bad) + '</b><span>غلط تو</span></div>' +
      '<div class="qz-stat"><b>' + qzFa(y.avgMs ? (y.avgMs / 1000).toFixed(1) : '۰') + ' ث</b><span>میانگین زمان تو</span></div>' +
      '<div class="qz-stat purple"><b>' + qzFa(o.ok) + ' / ' + qzFa(o.bad) + '</b><span>صحیح/غلط حریف</span></div>';
    if (res === 'win') confetti(E('qzFinalConf'), 20);
    show(E('qzFinalOv'));
    E('qzFinalAgain').onclick = function () {
      hide(E('qzFinalOv'));
      Q.room = null; Q.cur = null; Q.lock = false;
      startOnlineSearch();
    };
    E('qzFinalHome').onclick = function () { exitQuiz(); };
  }
  function buildDots(host, marks) {
    host.innerHTML = '';
    for (var i = 0; i < (marks || []).length; i++) {
      var d = document.createElement('i');
      d.className = marks[i] === 1 ? 'g' : marks[i] === 0 ? 'b' : 'n';
      host.appendChild(d);
    }
  }

  /* ---------- home / navigation ---------- */
  function goHome() {
    stopAllTimers();
    setPanel('qzHome');
    Q.mode = null; Q.lock = false; Q.room = null;
  }
  function helpModal() {
    var html = '۵ سؤال = ۱ مرحله • هر پاسخ صحیح ۱۰۰ امتیاز + جایزه‌ی سرعت<br/>سؤال‌ها تصادفی و بدون تکرارند و گزینه‌ها به‌هم‌ریخته می‌شوند<br/><br/><b>آنلاین:</b> ۳ مرحله × ۴ سؤال؛ هر دو نفر همان سؤال‌ها را می‌بینند. برنده کسی است که پاسخ صحیح بیشتری داشته باشد. هر سؤال ۳۰ ثانیه وقت داری!';
    try {
      if (typeof openAppModal === 'function') { openAppModal('راهنمای مسابقه چهارگزینه‌ای', html, [{ label: 'باشه', primary: true }]); return; }
    } catch (e) {}
    toast('هر ۵ سؤال ۱ مرحله — آنلاین ۳×۴');
  }

  window.openQuiz = function (fresh) {
    Q.active = true;
    enterView();
    goHome();
    var app = E('quizApp');
    if (window.__qzBg && !app.dataset.bg) { app.style.setProperty('--qzbg', 'url(' + window.__qzBg + ')'); app.dataset.bg = '1'; }
    var him = E('qzHeroImg');
    if (window.__qzMascot && !him.dataset.s) { him.src = window.__qzMascot; him.dataset.s = '1'; }
    if (window.__qzWaitFox) {
      ['qzWaitFox', 'qzOppAva', 'qzStageFox', 'qzFinalFox'].forEach(function (id) {
        var im = E(id); if (im && !im.dataset.s) { im.src = window.__qzWaitFox; im.dataset.s = '1'; }
      });
      var vs = document.querySelector('#qzFound .vs-fox');
      if (vs && !vs.dataset.s) { vs.src = window.__qzWaitFox; vs.dataset.s = '1'; }
    }
    if (!fresh) {
      /* resume unfinished online match if any */
      _get('/api/quiz/active?me=' + encodeURIComponent(me())).then(function (r) {
        if (r && r.room && Q.active && !Q.mode) {
          gotMatch(r);
        }
      }).catch(function () {});
    }
  };

  /* ---------- wiring ---------- */
  function wire() {
    var b;
    b = E('qzBtnSolo'); if (b) b.addEventListener('click', function () { startSolo(false); });
    b = E('qzBtnOnline'); if (b) b.addEventListener('click', function () { startOnlineSearch(); });
    b = E('qzBtnHelp'); if (b) b.addEventListener('click', helpModal);
    b = E('qzWaitCancel'); if (b) b.addEventListener('click', function () {
      _post('/api/quiz/cancel', { phone: me() }); exitQuiz();
    });
    b = E('qzBack'); if (b) b.addEventListener('click', function () {
      if (Q.mode === 'online' && Q.room && Q.pollTimer) {
        _post('/api/quiz/leave', { room: Q.room, phone: me() });
        exitQuiz();
        return;
      }
      exitQuiz();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) return;
      if (Q.active && Q.mode === 'online' && Q.room) fetchOnlineState();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();

