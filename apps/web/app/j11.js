
  (function(){
    "use strict";
    var ov = document.getElementById("diamondBuyOverlay");
    var planOv = document.getElementById("planOverlay");
    var rainCont = document.getElementById("diamondRainContainer");
    var toast = document.getElementById("diamondToast");
    var grid = document.getElementById("dmCardsGrid");
    if (!ov) return;

    /* ---------- toast ---------- */
    var toastTimer = null;
    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add("show");
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2500);
    }

    /* ---------- background diamonds ---------- */
    var rainTimer = null;
    var activeGems = 0;
    var GEMS_PER_TICK = 10;   /* about ten new gems every second */

    function gemLimit() {
      /* concurrent gems are capped so the effect stays smooth on phones */
      var w = window.innerWidth || 360;
      if (w < 420) return 42;
      if (w < 720) return 46;
      return 50;
    }
    function reducedMotion() {
      return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }

    function onGemEnd(e) {
      var el = e.currentTarget;
      el.removeEventListener("animationend", onGemEnd);
      if (el.parentNode) el.parentNode.removeChild(el);
      activeGems = Math.max(0, activeGems - 1);
    }

    function spawnGem() {
      if (!ov.classList.contains("open")) return;
      if (!rainCont || activeGems >= gemLimit()) return;

      var gem = document.createElement("div");
      gem.className = "falling-diamond";

      var size = Math.round(Math.random() * 22) + 14;          /* 14 - 36 px */
      var left = Math.random() * 92 + 2;                       /* 2% - 94% */
      var duration = (Math.random() * 2.6 + 2.6).toFixed(2);   /* 2.6 - 5.2 s */
      var op = (Math.random() * 0.4 + 0.5).toFixed(2);         /* 0.50 - 0.90 */
      var rotStart = Math.round(Math.random() * 70) - 35;
      var rotEnd = Math.round(Math.random() * 260) - 130;
      var drift = Math.round(Math.random() * 96) - 48;
      var flip = Math.random() > 0.5 ? 360 : 200;
      var scale = (Math.random() * 0.35 + 0.85).toFixed(2);

      gem.style.width = size + "px";
      gem.style.height = size + "px";
      gem.style.left = left + "%";
      gem.style.setProperty("--dm-rot-start", rotStart + "deg");
      gem.style.setProperty("--dm-rot-end", rotEnd + "deg");
      gem.style.setProperty("--dm-drift", drift + "px");
      gem.style.setProperty("--dm-flip", flip + "deg");
      gem.style.setProperty("--dm-scale", scale);
      gem.style.setProperty("--dm-op", op);
      gem.style.animationDuration = duration + "s";

      gem.addEventListener("animationend", onGemEnd);
      rainCont.appendChild(gem);
      activeGems++;
    }

    function startRain() {
      if (reducedMotion()) return;
      stopRain();
      if (rainCont) rainCont.innerHTML = "";
      activeGems = 0;
      for (var i = 0; i < 5; i++) setTimeout(spawnGem, i * 80);
      rainTimer = setInterval(function () {
        if (!ov.classList.contains("open")) { stopRain(); return; }
        var room = gemLimit() - activeGems;
        var n = Math.min(GEMS_PER_TICK, Math.max(0, room));
        for (var j = 0; j < n; j++) setTimeout(spawnGem, j * 40);   /* spread the tick out */
      }, 1000);
    }

    function stopRain() {
      if (rainTimer) { clearInterval(rainTimer); rainTimer = null; }
      activeGems = 0;
      if (rainCont) rainCont.innerHTML = "";
    }

    /* ---------- open / close ---------- */
    function openDiamondPanel() {
      if (planOv) {
        planOv.classList.remove("open");
        planOv.setAttribute("aria-hidden", "true");
      }
      ov.classList.add("open");
      ov.setAttribute("aria-hidden", "false");
      startRain();
      var x = document.getElementById("dmCloseBtn");
      if (x) { try { x.focus({ preventScroll: true }); } catch (e) {} }
    }

    function closeDiamondPanel() {
      ov.classList.remove("open");
      ov.setAttribute("aria-hidden", "true");
      stopRain();
    }

    function backToPlan() {
      closeDiamondPanel();
      if (planOv) {
        planOv.classList.add("open");
        planOv.setAttribute("aria-hidden", "false");
      }
    }

    var closeBtn = document.getElementById("dmCloseBtn");
    var backBtn = document.getElementById("dmBackToPlan");
    if (closeBtn) closeBtn.addEventListener("click", closeDiamondPanel);
    if (backBtn) backBtn.addEventListener("click", backToPlan);

    ov.addEventListener("click", function (e) {
      if (e.target === ov) closeDiamondPanel();
    });

    document.addEventListener("keydown", function (e) {
      if ((e.key === "Escape" || e.key === "Esc") && ov.classList.contains("open")) {
        closeDiamondPanel();
      }
    });

    /* pause the effect while the tab is hidden (saves battery / keeps FPS) */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopRain();
      else if (ov.classList.contains("open")) startRain();
    });

    /* ---------- card selection (UI only — no purchase logic yet) ---------- */
    var cards = grid ? grid.querySelectorAll(".dm-buy-card") : [];
    var selectedCard = null;

    function paintCard(card, on) {
      card.classList.toggle("is-selected", on);
      card.setAttribute("aria-pressed", on ? "true" : "false");
      var lbl = card.querySelector(".dm-select-label");
      if (lbl) lbl.textContent = on ? "انتخاب شد" : "انتخاب بسته";
    }

    async function selectCard(card) {
      for (var i = 0; i < cards.length; i++) paintCard(cards[i], false);
      paintCard(card, true);
      selectedCard = card;
      var d = Number(card.getAttribute("data-diamonds") || 0);
      var c = Number(card.getAttribute("data-coins") || 0);
      var pkgId = card.getAttribute("data-package") || ("dm_" + d);

      var confirmMsg = 'آیا مایل به خرید بسته ' + d.toLocaleString('fa-IR') + ' الماس در ازای ' + c.toLocaleString('fa-IR') + ' سکه روباه هستید؟';
      var proceed = async function() {
        try {
          var token = '';
          try { token = localStorage.getItem('fox_session') || ''; } catch(e) {}
          var headers = { 'content-type': 'application/json' };
          if (token) headers['Authorization'] = 'Bearer ' + token;

          var res = await fetch('/api/diamonds/purchase', {
            method: 'POST',
            credentials: 'same-origin',
            headers: headers,
            body: JSON.stringify({ packageId: pkgId, payWithCoins: true })
          });
          var data = await res.json().catch(function(){ return {}; });
          if (!res.ok || !data.ok) {
            if (data.error === 'insufficient_coins') {
              if (window.foxToast) foxToast(data.message || 'سکه روباه کافی ندارید!');
              else showToast(data.message || 'سکه روباه کافی ندارید!');
              return;
            }
            throw new Error(data.message || data.error || 'خطا در خرید');
          }

          if (data.wallet) {
            if (window.FoxWallet) window.FoxWallet.apply(data.wallet);
            if (window.FoxGameRewardService) window.FoxGameRewardService.updateBalanceUI(data.wallet);
          }
          if (window.foxToast) {
            foxToast('🎉 بسته ' + d.toLocaleString('fa-IR') + ' الماس با موفقیت دریافت شد!');
          } else {
            showToast('🎉 بسته ' + d.toLocaleString('fa-IR') + ' الماس خریداری شد!');
          }
          closeDiamondPanel();
        } catch(err) {
          if (window.foxToast) foxToast(err.message || 'خطا در خرید بسته');
          else showToast(err.message || 'خطا در خرید بسته');
        }
      };

      if (window.foxConfirm) {
        foxConfirm('خرید بسته الماس', confirmMsg, proceed);
      } else if (confirm(confirmMsg)) {
        proceed();
      }
    }

    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        card.addEventListener("click", function () { selectCard(card); });
        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            selectCard(card);
          }
        });
      })(cards[i]);
    }

    /* ---------- hook the plan hub card ---------- */
    function attachToPlanCard() {
      var planCards = document.querySelectorAll("#planOverlay .plan-card");
      for (var i = 0; i < planCards.length; i++) {
        var btn = planCards[i];
        if (btn.id === "btnPlanBuyDiamond") continue;
        var text = btn.textContent || "";
        if (text.indexOf("خرید الماس") !== -1) {
          btn.id = "btnPlanBuyDiamond";
          var soon = btn.querySelector(".plan-soon");
          if (soon) soon.remove();
          btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            openDiamondPanel();
          });
        }
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", attachToPlanCard);
    } else {
      attachToPlanCard();
    }

    window.openDiamondPanel = openDiamondPanel;
    window.closeDiamondPanel = closeDiamondPanel;
  })();
  