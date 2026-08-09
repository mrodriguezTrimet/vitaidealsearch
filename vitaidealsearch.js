function () {
  "use strict";

  if (window.__VITAIDEAL_LIVE_SEARCH__) return;
  window.__VITAIDEAL_LIVE_SEARCH__ = true;

  var STORE_ID = "40321030";
  var TOKEN = "public_XCRnTDZJsS4quiniVMLmCtQWRU7Hj9qy";

  var INPUT_SELECTOR = ".dmStoreSearchInput";

  var MIN_CHARS = 2;
  var MAX_RESULTS = 6;
  var DELAY = 250;

  var timer = null;
  var controller = null;
  var box = null;


  function ensureBox() {
    if (box && document.body.contains(box)) {
      return box;
    }

    box = document.getElementById("vitaideal-live-search");

    if (!box) {
      box = document.createElement("div");

      box.id = "vitaideal-live-search";

      box.style.position = "fixed";
      box.style.zIndex = "2147483647";
      box.style.display = "none";

      box.style.maxHeight = "480px";
      box.style.overflowY = "auto";

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


  function positionBox(input) {
    ensureBox();

    var rect = input.getBoundingClientRect();

    var width =
      Math.max(rect.width, 340);

    var maxWidth =
      Math.max(
        200,
        window.innerWidth - 20
      );

    if (width > maxWidth) {
      width = maxWidth;
    }

    var left = rect.left;

    if (
      left + width >
      window.innerWidth - 10
    ) {
      left =
        window.innerWidth -
        width -
        10;
    }

    if (left < 10) {
      left = 10;
    }

    box.style.left =
      left + "px";

    box.style.top =
      (rect.bottom + 7) + "px";

    box.style.width =
      width + "px";
  }


  function closeBox() {
    if (!box) return;

    box.style.display = "none";
    box.innerHTML = "";
  }


  function showMessage(input, text) {
    positionBox(input);

    box.innerHTML = "";

    var message =
      document.createElement("div");

    message.textContent = text;

    message.style.padding = "18px";
    message.style.textAlign = "center";
    message.style.fontSize = "13px";
    message.style.color = "#6b7280";

    box.appendChild(message);

    box.style.display = "block";
  }


  function renderProducts(input, products) {
    positionBox(input);

    box.innerHTML = "";

    if (!products.length) {
      showMessage(
        input,
        "Keine Produkte gefunden"
      );

      return;
    }


    products.forEach(function (product) {

      var button =
        document.createElement("button");

      button.type = "button";

      button.style.appearance = "none";
      button.style.width = "100%";

      button.style.display = "grid";

      button.style.gridTemplateColumns =
        "58px minmax(0,1fr) auto";

      button.style.gap = "13px";
      button.style.alignItems = "center";

      button.style.padding = "10px";

      button.style.border = "0";
      button.style.borderRadius = "12px";

      button.style.background =
        "transparent";

      button.style.color = "#111827";

      button.style.fontFamily =
        "Montserrat, sans-serif";

      button.style.textAlign = "left";
      button.style.cursor = "pointer";


      var imageWrap =
        document.createElement("span");

      imageWrap.style.width = "58px";
      imageWrap.style.height = "58px";

      imageWrap.style.display = "flex";

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


      if (product.thumbnailUrl) {

        var img =
          document.createElement("img");

        img.src =
          product.thumbnailUrl;

        img.alt = "";

        img.loading = "lazy";

        img.style.width = "100%";
        img.style.height = "100%";

        img.style.objectFit =
          "contain";

        imageWrap.appendChild(img);
      }


      var name =
        document.createElement("span");

      name.textContent =
        product.name ||
        "Produkt";

      name.style.minWidth = "0";

      name.style.fontSize =
        "13px";

      name.style.lineHeight =
        "1.4";

      name.style.fontWeight =
        "700";


      var price =
        document.createElement("span");

      price.textContent =
        product.defaultDisplayedPriceFormatted ||
        "";

      price.style.fontSize =
        "13px";

      price.style.fontWeight =
        "600";

      price.style.whiteSpace =
        "nowrap";


      button.appendChild(
        imageWrap
      );

      button.appendChild(
        name
      );

      button.appendChild(
        price
      );


      button.addEventListener(
        "mouseenter",
        function () {

          button.style.background =
            "#f5f6f7";
        }
      );


      button.addEventListener(
        "mouseleave",
        function () {

          button.style.background =
            "transparent";
        }
      );


      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();
          event.stopPropagation();

          closeBox();


          var productId =
            Number(product.id);


          if (
            window.Ecwid &&
            typeof window.Ecwid.openPage ===
              "function" &&
            Number.isFinite(productId)
          ) {

            window.Ecwid.openPage(
              "product",
              {
                id: productId
              }
            );

            return;
          }


          if (product.url) {

            window.location.href =
              product.url;
          }

        }
      );


      box.appendChild(button);

    });


    box.style.display =
      "block";
  }


  function searchProducts(
    input,
    query
  ) {

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

          "Authorization":
            "Bearer " + TOKEN,

          "Accept":
            "application/json"
        },

        signal:
          controller.signal
      }
    )

    .then(function (response) {

      if (!response.ok) {

        throw new Error(
          "Ecwid API HTTP " +
          response.status
        );
      }

      return response.json();
    })

    .then(function (data) {

      /*
       * Benutzer hat während der
       * Anfrage weitergetippt.
       */
      if (
        input.value.trim() !==
        query
      ) {
        return;
      }


      renderProducts(
        input,
        Array.isArray(data.items)
          ? data.items
          : []
      );

    })

    .catch(function (error) {

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


      showMessage(
        input,
        "Suche konnte nicht geladen werden"
      );

    });

  }


  /*
   * INPUT EVENT
   *
   * Event Delegation, damit es auch
   * funktioniert, wenn Duda/IONOS
   * das Input neu rendert.
   */
  document.addEventListener(
    "input",
    function (event) {

      var input =
        event.target;


      if (
        !input ||
        typeof input.matches !==
          "function" ||
        !input.matches(
          INPUT_SELECTOR
        )
      ) {
        return;
      }


      var query =
        input.value.trim();


      clearTimeout(timer);


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
   * Außerhalb klicken
   */
  document.addEventListener(
    "click",
    function (event) {

      if (
        event.target.closest &&
        event.target.closest(
          "#vitaideal-live-search"
        )
      ) {
        return;
      }


      if (
        event.target.closest &&
        event.target.closest(
          INPUT_SELECTOR
        )
      ) {
        return;
      }


      closeBox();

    },
    true
  );


  /*
   * ESC
   */
  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key ===
        "Escape"
      ) {
        closeBox();
      }

    }
  );


  /*
   * Dropdown beim Scrollen
   * am Suchfeld halten.
   */
  function reposition() {

    if (
      !box ||
      box.style.display ===
        "none"
    ) {
      return;
    }


    var input =
      document.querySelector(
        INPUT_SELECTOR
      );


    if (input) {
      positionBox(input);
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
    "[Vitaideal Live Search] geladen"
  );

})();
