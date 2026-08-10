(function () {
  "use strict";

  if (window.__VITAIDEAL_LIVE_SEARCH__) return;
  window.__VITAIDEAL_LIVE_SEARCH__ = true;

  var STORE_ID = "40321030";
  var TOKEN = "public_XCRnTDZJsS4quiniVMLmCtQWRU7Hj9qy";

  var INPUT_SELECTOR = ".dmStoreSearchInput";
  var BOX_ID = "vitaideal-live-search";

  var MIN_CHARS = 2;
  var MAX_RESULTS = 6;
  var DELAY = 250;

  var timer = null;
  var controller = null;
  var box = null;
  var currentInput = null;
  var currentProducts = [];
  var activeIndex = -1;

  function isSearchInput(element) {
    return !!(
      element &&
      typeof element.matches === "function" &&
      element.matches(INPUT_SELECTOR)
    );
  }

  function ensureBox() {
    if (box && document.body.contains(box)) {
      return box;
    }

    box = document.getElementById(BOX_ID);

    if (!box) {
      box = document.createElement("div");

      box.id = BOX_ID;
      box.setAttribute("role", "listbox");
      box.setAttribute("aria-label", "Produktsuche");

      box.style.position = "fixed";
      box.style.zIndex = "2147483647";
      box.style.display = "none";
      box.style.pointerEvents = "auto";
      box.style.boxSizing = "border-box";

      box.style.maxHeight = "480px";
      box.style.overflowY = "auto";
      box.style.overscrollBehavior = "contain";

      box.style.background = "#ffffff";

      box.style.border =
        "1px solid rgba(17,24,39,.10)";

      box.style.borderRadius = "16px";

      box.style.boxShadow =
        "0 18px 50px rgba(17,24,39,.16)";

      box.style.padding = "7px";

      box.style.fontFamily =
        "Montserrat, sans-serif";

      box.style.textAlign = "left";

      document.body.appendChild(box);
    }

    return box;
  }

  function setInputExpanded(input, expanded) {
    if (!input) return;

    input.setAttribute(
      "aria-expanded",
      expanded ? "true" : "false"
    );

    input.setAttribute(
      "aria-controls",
      BOX_ID
    );

    input.setAttribute(
      "autocomplete",
      "off"
    );
  }

  function positionBox(input) {
    ensureBox();

    if (!input) return;

    var rect =
      input.getBoundingClientRect();

    var viewportPadding = 10;
    var gap = 7;

    var maxWidth =
      Math.max(
        200,
        window.innerWidth -
          viewportPadding * 2
      );

    var width =
      Math.min(
        Math.max(
          rect.width,
          340
        ),
        maxWidth
      );

    var left = rect.left;

    if (
      left + width >
      window.innerWidth -
        viewportPadding
    ) {
      left =
        window.innerWidth -
        width -
        viewportPadding;
    }

    if (
      left <
      viewportPadding
    ) {
      left =
        viewportPadding;
    }

    var top =
      rect.bottom + gap;

    var availableBelow =
      window.innerHeight -
      top -
      viewportPadding;

    var availableAbove =
      rect.top -
      gap -
      viewportPadding;

    var preferredMaxHeight =
      480;

    var dropdownHeight =
      Math.min(
        preferredMaxHeight,
        Math.max(
          120,
          availableBelow
        )
      );

    if (
      availableBelow < 180 &&
      availableAbove >
        availableBelow
    ) {
      dropdownHeight =
        Math.min(
          preferredMaxHeight,
          Math.max(
            120,
            availableAbove
          )
        );

      top =
        Math.max(
          viewportPadding,
          rect.top -
            gap -
            dropdownHeight
        );
    }

    box.style.left =
      left + "px";

    box.style.top =
      top + "px";

    box.style.width =
      width + "px";

    box.style.maxHeight =
      dropdownHeight + "px";
  }

  function clearActiveResult() {
    activeIndex = -1;

    if (!box) return;

    var items =
      box.querySelectorAll(
        "[data-vitaideal-index]"
      );

    Array.prototype.forEach.call(
      items,
      function (item) {
        item.style.background =
          "transparent";

        item.setAttribute(
          "aria-selected",
          "false"
        );
      }
    );
  }

  function setActiveResult(index) {
    if (
      !box ||
      !currentProducts.length
    ) {
      return;
    }

    var items =
      box.querySelectorAll(
        "[data-vitaideal-index]"
      );

    if (!items.length) {
      return;
    }

    if (index < 0) {
      index =
        items.length - 1;
    }

    if (
      index >=
      items.length
    ) {
      index = 0;
    }

    activeIndex = index;

    Array.prototype.forEach.call(
      items,
      function (
        item,
        itemIndex
      ) {
        var active =
          itemIndex ===
          activeIndex;

        item.style.background =
          active
            ? "#f5f6f7"
            : "transparent";

        item.setAttribute(
          "aria-selected",
          active
            ? "true"
            : "false"
        );
      }
    );

    if (
      items[activeIndex] &&
      typeof items[
        activeIndex
      ].scrollIntoView ===
        "function"
    ) {
      items[
        activeIndex
      ].scrollIntoView({
        block: "nearest"
      });
    }
  }

  function closeBox() {
    if (!box) return;

    box.style.display =
      "none";

    box.innerHTML = "";

    currentProducts = [];

    activeIndex = -1;

    setInputExpanded(
      currentInput,
      false
    );
  }

  function showMessage(
    input,
    text
  ) {
    currentInput = input;

    positionBox(input);

    box.innerHTML = "";

    currentProducts = [];

    activeIndex = -1;

    var message =
      document.createElement(
        "div"
      );

    message.textContent =
      text;

    message.style.padding =
      "18px";

    message.style.textAlign =
      "center";

    message.style.fontSize =
      "13px";

    message.style.lineHeight =
      "1.4";

    message.style.color =
      "#6b7280";

    box.appendChild(
      message
    );

    box.style.display =
      "block";

    setInputExpanded(
      input,
      true
    );
  }

  function normalizeUrl(
    value
  ) {
    if (
      !value ||
      typeof value !==
        "string"
    ) {
      return "";
    }

    try {
      var parsed =
        new URL(
          value,
          window.location.href
        );

      if (
        parsed.protocol ===
          "http:" ||
        parsed.protocol ===
          "https:"
      ) {
        return parsed.href;
      }
    } catch (error) {
      /*
       * Ungültige URL.
       */
    }

    return "";
  }

  function openProduct(
    product
  ) {
    if (!product) return;

    var productId =
      Number(product.id);

    var fallbackUrl =
      normalizeUrl(
        product.url
      );

    closeBox();

    console.log(
      "[Vitaideal Live Search] Produkt geöffnet:",
      productId,
      product.name || ""
    );

    /*
     * Bevorzugt Ecwid.
     * Dadurch bleibt der eingebettete
     * Shop aktiv.
     */
    if (
      window.Ecwid &&
      typeof window.Ecwid
        .openPage ===
        "function" &&
      Number.isFinite(
        productId
      )
    ) {
      try {
        window.Ecwid.openPage(
          "product",
          {
            id: productId
          }
        );

        return;
      } catch (error) {
        console.warn(
          "[Vitaideal Live Search] Ecwid.openPage fehlgeschlagen:",
          error
        );
      }
    }

    /*
     * Falls Ecwid.openPage nicht
     * verfügbar ist, normale
     * Produkt-URL öffnen.
     */
    if (fallbackUrl) {
      window.location.assign(
        fallbackUrl
      );

      return;
    }

    console.warn(
      "[Vitaideal Live Search] Keine Produkt-URL verfügbar:",
      product
    );
  }

  function renderProducts(
    input,
    products
  ) {
    currentInput =
      input;

    currentProducts =
      products.slice(
        0,
        MAX_RESULTS
      );

    activeIndex = -1;

    positionBox(input);

    box.innerHTML = "";

    if (
      !currentProducts.length
    ) {
      showMessage(
        input,
        "Keine Produkte gefunden"
      );

      return;
    }

    currentProducts.forEach(
      function (
        product,
        index
      ) {
        /*
         * ECHTER LINK statt Button.
         *
         * Das macht die Treffer
         * gegenüber Duda/IONOS
         * deutlich robuster.
         */
        var item =
          document.createElement(
            "a"
          );

        var fallbackUrl =
          normalizeUrl(
            product.url
          );

        item.href =
          fallbackUrl || "#";

        item.setAttribute(
          "role",
          "option"
        );

        item.setAttribute(
          "aria-selected",
          "false"
        );

        item.setAttribute(
          "data-vitaideal-index",
          String(index)
        );

        item.style.boxSizing =
          "border-box";

        item.style.width =
          "100%";

        item.style.display =
          "grid";

        item.style.gridTemplateColumns =
          "58px minmax(0,1fr) auto";

        item.style.gap =
          "13px";

        item.style.alignItems =
          "center";

        item.style.padding =
          "10px";

        item.style.borderRadius =
          "12px";

        item.style.background =
          "transparent";

        item.style.color =
          "#111827";

        item.style.fontFamily =
          "Montserrat, sans-serif";

        item.style.textAlign =
          "left";

        item.style.textDecoration =
          "none";

        item.style.cursor =
          "pointer";

        item.style.pointerEvents =
          "auto";

        item.style.touchAction =
          "manipulation";

        item.style.userSelect =
          "none";

        /*
         * BILD
         */
        var imageWrap =
          document.createElement(
            "span"
          );

        imageWrap.style.width =
          "58px";

        imageWrap.style.height =
          "58px";

        imageWrap.style.display =
          "flex";

        imageWrap.style.alignItems =
          "center";

        imageWrap.style.justifyContent =
          "center";

        imageWrap.style.overflow =
          "hidden";

        imageWrap.style.borderRadius =
          "10px";

        imageWrap.style.background =
          "#f5f5f5";

        /*
         * Klick soll immer auf dem
         * gesamten Link landen.
         */
        imageWrap.style.pointerEvents =
          "none";

        var imageUrl =
          product.thumbnailUrl ||
          product.smallThumbnailUrl ||
          product.imageUrl ||
          "";

        if (imageUrl) {
          var img =
            document.createElement(
              "img"
            );

          img.src =
            imageUrl;

          img.alt = "";

          img.loading =
            "lazy";

          img.decoding =
            "async";

          img.style.width =
            "100%";

          img.style.height =
            "100%";

          img.style.objectFit =
            "contain";

          img.style.pointerEvents =
            "none";

          imageWrap.appendChild(
            img
          );
        }

        /*
         * NAME
         */
        var name =
          document.createElement(
            "span"
          );

        name.textContent =
          product.name ||
          "Produkt";

        name.style.minWidth =
          "0";

        name.style.fontSize =
          "13px";

        name.style.lineHeight =
          "1.4";

        name.style.fontWeight =
          "700";

        name.style.pointerEvents =
          "none";

        /*
         * PREIS
         */
        var price =
          document.createElement(
            "span"
          );

        price.textContent =
          product
            .defaultDisplayedPriceFormatted ||
          "";

        price.style.fontSize =
          "13px";

        price.style.fontWeight =
          "600";

        price.style.whiteSpace =
          "nowrap";

        price.style.pointerEvents =
          "none";

        item.appendChild(
          imageWrap
        );

        item.appendChild(
          name
        );

        item.appendChild(
          price
        );

        /*
         * HOVER
         */
        item.addEventListener(
          "mouseenter",
          function () {
            activeIndex =
              index;

            setActiveResult(
              index
            );
          }
        );

        item.addEventListener(
          "mouseleave",
          function () {
            if (
              activeIndex ===
              index
            ) {
              clearActiveResult();
            }
          }
        );

        box.appendChild(
          item
        );
      }
    );

    box.style.display =
      "block";

    setInputExpanded(
      input,
      true
    );
  }

  function searchProducts(
    input,
    query
  ) {
    /*
     * Alte Anfrage abbrechen.
     */
    if (
      controller &&
      typeof controller.abort ===
        "function"
    ) {
      controller.abort();
    }

    controller =
      new AbortController();

    showMessage(
      input,
      "Suche …"
    );

    var url =
      "https://app.ecwid.com/api/v3/" +
      STORE_ID +
      "/products?keyword=" +
      encodeURIComponent(
        query + "*"
      ) +
      "&searchMethod=STOREFRONT" +
      "&limit=" +
      MAX_RESULTS;

    fetch(
      url,
      {
        method: "GET",

        headers: {
          Authorization:
            "Bearer " +
            TOKEN,

          Accept:
            "application/json"
        },

        signal:
          controller.signal,

        credentials:
          "omit"
      }
    )
      .then(
        function (
          response
        ) {
          if (
            !response.ok
          ) {
            throw new Error(
              "Ecwid API HTTP " +
                response.status
            );
          }

          return response.json();
        }
      )

      .then(
        function (data) {
          /*
           * Input wurde eventuell
           * inzwischen ersetzt.
           */
          if (
            !isSearchInput(
              input
            )
          ) {
            return;
          }

          /*
           * Benutzer hat
           * weitergetippt.
           */
          if (
            input.value.trim() !==
            query
          ) {
            return;
          }

          renderProducts(
            input,
            Array.isArray(
              data.items
            )
              ? data.items
              : []
          );
        }
      )

      .catch(
        function (error) {
          if (
            error &&
            error.name ===
              "AbortError"
          ) {
            return;
          }

          console.error(
            "[Vitaideal Live Search]",
            error
          );

          if (
            isSearchInput(
              input
            ) &&
            input.value.trim() ===
              query
          ) {
            showMessage(
              input,
              "Suche konnte nicht geladen werden"
            );
          }
        }
      );
  }

  /*
   * LIVE INPUT
   *
   * Event Delegation ist wichtig,
   * weil Duda/IONOS das Input
   * dynamisch ersetzen kann.
   */
  document.addEventListener(
    "input",
    function (event) {
      var input =
        event.target;

      if (
        !isSearchInput(
          input
        )
      ) {
        return;
      }

      currentInput =
        input;

      var query =
        input.value.trim();

      clearTimeout(
        timer
      );

      if (
        query.length <
        MIN_CHARS
      ) {
        if (
          controller &&
          typeof controller.abort ===
            "function"
        ) {
          controller.abort();
        }

        closeBox();

        return;
      }

      timer =
        setTimeout(
          function () {
            searchProducts(
              input,
              query
            );
          },
          DELAY
        );
    },
    true
  );

  /*
   * INPUT FOCUS
   */
  document.addEventListener(
    "focusin",
    function (event) {
      if (
        !isSearchInput(
          event.target
        )
      ) {
        return;
      }

      currentInput =
        event.target;

      setInputExpanded(
        currentInput,
        !!(
          box &&
          box.style.display !==
            "none"
        )
      );
    },
    true
  );

  /*
   * TASTATUR
   *
   * Pfeil runter/hoch:
   * Ergebnis auswählen
   *
   * Enter:
   * Produkt öffnen
   *
   * Escape:
   * Suche schließen
   */
  document.addEventListener(
    "keydown",
    function (event) {
      if (
        !isSearchInput(
          event.target
        )
      ) {
        return;
      }

      if (
        event.key ===
        "Escape"
      ) {
        event.preventDefault();

        closeBox();

        return;
      }

      if (
        !box ||
        box.style.display ===
          "none" ||
        !currentProducts.length
      ) {
        return;
      }

      if (
        event.key ===
        "ArrowDown"
      ) {
        event.preventDefault();

        setActiveResult(
          activeIndex + 1
        );

        return;
      }

      if (
        event.key ===
        "ArrowUp"
      ) {
        event.preventDefault();

        setActiveResult(
          activeIndex - 1
        );

        return;
      }

      if (
        event.key ===
          "Enter" &&
        activeIndex >= 0
      ) {
        event.preventDefault();
        event.stopPropagation();

        openProduct(
          currentProducts[
            activeIndex
          ]
        );
      }
    },
    true
  );

  /*
   * WICHTIGER KLICK-HANDLER
   *
   * Läuft auf WINDOW in Capture-Phase.
   *
   * Dadurch bekommt Vitaideal den Klick,
   * bevor Duda/IONOS ihn eventuell
   * abfangen kann.
   */
  window.addEventListener(
    "click",
    function (event) {
      var target =
        event.target;

      if (
        target &&
        typeof target.closest ===
          "function"
      ) {
        var resultItem =
          target.closest(
            "#" +
              BOX_ID +
              " [data-vitaideal-index]"
          );

        /*
         * PRODUKT ANGEKLICKT
         */
        if (
          resultItem
        ) {
          var index =
            Number(
              resultItem.getAttribute(
                "data-vitaideal-index"
              )
            );

          event.preventDefault();

          event.stopPropagation();

          if (
            typeof event
              .stopImmediatePropagation ===
            "function"
          ) {
            event.stopImmediatePropagation();
          }

          if (
            Number.isInteger(
              index
            ) &&
            currentProducts[
              index
            ]
          ) {
            openProduct(
              currentProducts[
                index
              ]
            );
          }

          return;
        }

        /*
         * Klick innerhalb des
         * Dropdowns.
         */
        if (
          target.closest(
            "#" + BOX_ID
          )
        ) {
          return;
        }

        /*
         * Klick ins Suchfeld.
         */
        if (
          target.closest(
            INPUT_SELECTOR
          )
        ) {
          return;
        }
      }

      /*
       * Sonst Dropdown schließen.
       */
      closeBox();
    },
    true
  );

  /*
   * DROPDOWN AM INPUT HALTEN
   */
  function reposition() {
    if (
      !box ||
      box.style.display ===
        "none"
    ) {
      return;
    }

    if (
      currentInput &&
      document.body.contains(
        currentInput
      )
    ) {
      positionBox(
        currentInput
      );

      return;
    }

    var input =
      document.querySelector(
        INPUT_SELECTOR
      );

    if (input) {
      currentInput =
        input;

      positionBox(
        input
      );
    }
  }

  window.addEventListener(
    "resize",
    reposition
  );

  window.addEventListener(
    "scroll",
    reposition,
    true
  );

  console.log(
    "[Vitaideal Live Search v4] geladen"
  );
})();
