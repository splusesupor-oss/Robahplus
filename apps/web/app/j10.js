
  (function(){
    var coinOv = document.getElementById("coinBuyOverlay");
    var planOv = document.getElementById("planOverlay");
    var rainCont = document.getElementById("dollarRainContainer");
    var toast = document.getElementById("coinToast");
    var rainTimer = null;
    var activeBills = 0;
    var maxBills = 10;

    function showToast(msg) {
      if(!toast) return;
      toast.textContent = msg;
      toast.classList.add("show");
      setTimeout(function(){ toast.classList.remove("show"); }, 2500);
    }

    function spawnBill() {
      if (!coinOv || !coinOv.classList.contains("open")) return;
      if (!rainCont || activeBills >= maxBills) return;

      var bill = document.createElement("div");
      bill.className = "falling-dollar";

      var width = Math.floor(Math.random() * 22) + 40; // 40px to 62px
      var height = Math.round(width * 0.45);
      var left = Math.floor(Math.random() * 88) + 6; // 6% to 94%
      var duration = (Math.random() * 1.8 + 2.2).toFixed(2); // 2.2s to 4.0s
      var rotStart = Math.floor(Math.random() * 60) - 30; // -30 to 30 deg
      var rotEnd = Math.floor(Math.random() * 180) - 90;
      var drift = Math.floor(Math.random() * 80) - 40; // -40px to 40px
      var flipY = Math.random() > 0.5 ? 360 : 180;

      bill.style.width = width + "px";
      bill.style.height = height + "px";
      bill.style.left = left + "%";
      bill.style.setProperty("--rot-start", rotStart + "deg");
      bill.style.setProperty("--rot-end", rotEnd + "deg");
      bill.style.setProperty("--drift", drift + "px");
      bill.style.setProperty("--flip-y", flipY + "deg");
      bill.style.animationDuration = duration + "s";

      activeBills++;
      rainCont.appendChild(bill);

      bill.addEventListener("animationend", function() {
        if (bill.parentNode) bill.parentNode.removeChild(bill);
        activeBills = Math.max(0, activeBills - 1);
      });
    }

    function startRain() {
      stopRain();
      activeBills = 0;
      if (rainCont) rainCont.innerHTML = "";
      for (var i = 0; i < 3; i++) {
        setTimeout(spawnBill, i * 250);
      }
      rainTimer = setInterval(function() {
        if (!coinOv.classList.contains("open")) {
          stopRain();
          return;
        }
        var count = Math.floor(Math.random() * 2) + 1;
        for (var j = 0; j < count; j++) {
          setTimeout(spawnBill, j * 200);
        }
      }, 1000);
    }

    function stopRain() {
      if (rainTimer) {
        clearInterval(rainTimer);
        rainTimer = null;
      }
      activeBills = 0;
      if (rainCont) rainCont.innerHTML = "";
    }

    function openCoinPanel() {
      if (planOv) {
        planOv.classList.remove("open");
        planOv.setAttribute("aria-hidden", "true");
      }
      if (coinOv) {
        coinOv.classList.add("open");
        coinOv.setAttribute("aria-hidden", "false");
        startRain();
      }
    }

    function closeCoinPanel() {
      if (coinOv) {
        coinOv.classList.remove("open");
        coinOv.setAttribute("aria-hidden", "true");
        stopRain();
      }
    }

    function backToPlan() {
      closeCoinPanel();
      if (planOv) {
        planOv.classList.add("open");
        planOv.setAttribute("aria-hidden", "false");
      }
    }

    var closeBtn = document.getElementById("coinCloseBtn");
    var backBtn = document.getElementById("coinBackToPlan");
    if (closeBtn) closeBtn.addEventListener("click", closeCoinPanel);
    if (backBtn) backBtn.addEventListener("click", backToPlan);

    if (coinOv) {
      coinOv.addEventListener("click", function(e) {
        if (e.target === coinOv) closeCoinPanel();
      });
    }

    document.addEventListener("keydown", function(e) {
      if ((e.key === "Escape" || e.key === "Esc") && coinOv && coinOv.classList.contains("open")) {
        closeCoinPanel();
      }
    });

    var cards = document.querySelectorAll(".coin-buy-card");
    cards.forEach(function(card) {
      card.addEventListener("click", function() {
        var coins = card.getAttribute("data-coins");
        var price = card.getAttribute("data-price");
        showToast("بسته " + coins + " سکه (" + price + ") انتخاب شد");
      });
      card.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
    });

    window.openCoinPanel = openCoinPanel;
    window.closeCoinPanel = closeCoinPanel;

    function attachToPlanButton() {
      var planCards = document.querySelectorAll("#planOverlay .plan-card");
      planCards.forEach(function(btn) {
        var text = btn.textContent || "";
        if (text.indexOf("خرید سکه روباه") !== -1) {
          btn.id = "btnPlanBuyCoin";
          var soonBadge = btn.querySelector(".plan-soon");
          if (soonBadge) soonBadge.remove();
          btn.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            openCoinPanel();
          });
        }
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", attachToPlanButton);
    } else {
      attachToPlanButton();
    }
  })();
  