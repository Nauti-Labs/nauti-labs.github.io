(function () {
  var SOON = "Coming back soon";
  var style = document.createElement("style");
  style.textContent = "[hidden]{display:none !important}a.is-parked,a.is-parked:hover{cursor:default}";
  document.head.appendChild(style);

  function destination(product, el) {
    if (!product) return "";
    var surface = el.getAttribute("data-surface");
    if (surface && product[surface]) return product[surface];
    return product.href || "";
  }

  function paint(el, live) {
    var label = el.getAttribute(live ? "data-live-label" : "data-soon-label");
    if (label) {
      var slot = el.querySelector("[data-product-label]");
      if (slot) slot.textContent = label;
      else if (el.hasAttribute("data-label-only")) el.textContent = label;
    }
    var state = el.querySelector("[data-product-state]");
    if (state) {
      var stateLabel = el.getAttribute(live ? "data-live-state" : "data-soon-state");
      state.textContent = stateLabel || (live ? "Live" : SOON);
    }
  }

  function soonPanel(el) {
    var board = el.closest("[data-product-board]") || el.parentElement;
    return board ? board.querySelector("[data-product-soon]") : null;
  }

  function park(el) {
    if (el.tagName === "IFRAME") {
      el.removeAttribute("data-src");
      el.setAttribute("src", "about:blank");
      el.hidden = true;
      var parked = soonPanel(el);
      if (parked) parked.hidden = false;
      return;
    }
    if (el.tagName === "A") {
      el.removeAttribute("href");
      el.removeAttribute("target");
      el.removeAttribute("rel");
      el.setAttribute("aria-disabled", "true");
      el.classList.add("is-parked");
    }
    paint(el, false);
  }

  function openProduct(el, href) {
    if (el.tagName === "IFRAME") {
      el.dataset.src = href;
      el.hidden = false;
      var parked = soonPanel(el);
      if (parked) parked.hidden = true;
      var board = el.closest(".board");
      if (!board || board.classList.contains("active")) el.src = href;
      return;
    }
    if (el.tagName === "A") {
      el.setAttribute("href", href);
      el.removeAttribute("aria-disabled");
      el.classList.remove("is-parked");
      if (el.hasAttribute("data-external")) {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
      }
    }
    paint(el, true);
  }

  function apply(config) {
    document.querySelectorAll("[data-product]").forEach(function (el) {
      var product = config[el.getAttribute("data-product")];
      var href = product && product.live === true ? destination(product, el) : "";
      if (href) openProduct(el, href);
      else park(el);
    });

    document.querySelectorAll("[data-enable-when]").forEach(function (el) {
      var product = config[el.getAttribute("data-enable-when")];
      var href = el.getAttribute("data-href") || "";
      if (product && product.live === true && href) {
        el.setAttribute("href", href);
        el.removeAttribute("aria-disabled");
        el.classList.remove("is-parked");
        if (el.hasAttribute("data-external")) {
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener");
        }
        paint(el, true);
      } else {
        el.removeAttribute("href");
        el.setAttribute("aria-disabled", "true");
        el.classList.add("is-parked");
        paint(el, false);
      }
    });

    document.querySelectorAll("[data-show-when-live]").forEach(function (el) {
      var product = config[el.getAttribute("data-show-when-live")];
      el.hidden = !(product && product.live === true);
    });

    document.querySelectorAll("[data-show-when-parked]").forEach(function (el) {
      var product = config[el.getAttribute("data-show-when-parked")];
      el.hidden = !!(product && product.live === true);
    });

    document.querySelectorAll("[data-product-redirect]").forEach(function (el) {
      var product = config[el.getAttribute("data-product-redirect")];
      if (product && product.live === true && product.href) {
        window.location.replace(product.href);
      }
    });

    document.dispatchEvent(new CustomEvent("nauti-products-ready"));
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a.is-parked");
    if (!link) return;
    event.preventDefault();
  });

  fetch("/assets/products.json", { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("product switch unavailable");
      return res.json();
    })
    .then(apply)
    .catch(function () {
      apply({});
    });
})();
