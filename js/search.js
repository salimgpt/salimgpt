/* =========================================================
   SalimGPT
   File: js/search.js
   Purpose: Homepage Documentary Search
   ========================================================= */

(function () {
  "use strict";


  /* =======================================================
     01. ELEMENTS
     ======================================================= */

  const searchInput =
    document.getElementById("documentarySearch");

  const searchClear =
    document.getElementById("searchClear");

  const documentaryGrid =
    document.getElementById("documentaryGrid");

  const searchEmptyState =
    document.getElementById("searchEmptyState");


  /*
    Search exists only on the homepage.
  */

  if (
    !searchInput ||
    !searchClear ||
    !documentaryGrid
  ) {
    return;
  }


  /* =======================================================
     02. STATE
     ======================================================= */

  let currentQuery = "";

  let searchTimer = null;

  const SEARCH_DELAY = 90;


  /* =======================================================
     03. TEXT NORMALIZATION
     ======================================================= */

  function normalizeText(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }


    return String(value)
      .normalize("NFC")
      .toLocaleLowerCase("bn-BD")
      .replace(/\s+/g, " ")
      .trim();
  }


  /* =======================================================
     04. GET DOCUMENTARY CARDS
     ======================================================= */

  function getDocumentaryCards() {
    return Array.from(
      documentaryGrid.querySelectorAll(
        [
          ".documentary-card",
          "[data-documentary-card]"
        ].join(",")
      )
    );
  }


  /* =======================================================
     05. GET SEARCHABLE CARD TEXT
     ======================================================= */

  function getCardSearchText(card) {

    /*
      documentary-list.js can provide a prepared
      searchable string for best performance.
    */

    if (card.dataset.searchText) {
      return normalizeText(
        card.dataset.searchText
      );
    }


    /*
      Prefer explicit documentary metadata.
    */

    const dataTitle =
      card.dataset.title || "";

    const dataDescription =
      card.dataset.description || "";


    if (
      dataTitle ||
      dataDescription
    ) {
      return normalizeText(
        `${dataTitle} ${dataDescription}`
      );
    }


    /*
      Fallback:
      Search only meaningful title/description text,
      rather than buttons and other card UI.
    */

    const titleElement =
      card.querySelector(
        [
          ".documentary-title",
          "h2",
          "h3"
        ].join(",")
      );


    const descriptionElement =
      card.querySelector(
        [
          ".documentary-description",
          ".documentary-excerpt",
          ".documentary-content p",
          ".documentary-card-content p"
        ].join(",")
      );


    const title =
      titleElement
        ? titleElement.textContent
        : "";


    const description =
      descriptionElement
        ? descriptionElement.textContent
        : "";


    return normalizeText(
      `${title} ${description}`
    );
  }


  /* =======================================================
     06. TOKEN MATCHING
     ======================================================= */

  function matchesSearch(
    searchableText,
    query
  ) {
    if (!query) {
      return true;
    }


    /*
      Split search phrase into words.

      Example:
      "হেরোইনের ইতিহাস"

      will match a card if both words
      exist somewhere in its title/description.
    */

    const searchTerms =
      query
        .split(" ")
        .map(normalizeText)
        .filter(Boolean);


    if (!searchTerms.length) {
      return true;
    }


    return searchTerms.every(
      (term) =>
        searchableText.includes(term)
    );
  }


  /* =======================================================
     07. CARD VISIBILITY
     ======================================================= */

  function showCard(card) {
    card.hidden = false;

    card.removeAttribute(
      "aria-hidden"
    );

    card.classList.remove(
      "is-search-hidden"
    );
  }


  function hideCard(card) {
    card.hidden = true;

    card.setAttribute(
      "aria-hidden",
      "true"
    );

    card.classList.add(
      "is-search-hidden"
    );
  }


  /* =======================================================
     08. EMPTY STATE
     ======================================================= */

  function updateEmptyState(
    visibleCount,
    totalCount
  ) {
    if (!searchEmptyState) {
      return;
    }


    /*
      No cards rendered yet:
      documentary-list.js may still be starting.
    */

    if (totalCount === 0) {
      searchEmptyState.hidden = true;

      return;
    }


    searchEmptyState.hidden =
      visibleCount !== 0;
  }


  /* =======================================================
     09. CLEAR BUTTON
     ======================================================= */

  function updateClearButton() {
    const hasText =
      searchInput.value.trim().length > 0;


    searchClear.hidden =
      !hasText;


    searchClear.setAttribute(
      "aria-hidden",
      String(!hasText)
    );


    if (hasText) {
      searchClear.removeAttribute(
        "tabindex"
      );
    } else {
      searchClear.setAttribute(
        "tabindex",
        "-1"
      );
    }
  }


  /* =======================================================
     10. RUN SEARCH
     ======================================================= */

  function runSearch() {
    currentQuery =
      normalizeText(
        searchInput.value
      );


    const cards =
      getDocumentaryCards();


    let visibleCount = 0;


    cards.forEach((card) => {
      const searchableText =
        getCardSearchText(card);


      const matches =
        matchesSearch(
          searchableText,
          currentQuery
        );


      if (matches) {
        showCard(card);

        visibleCount += 1;
      } else {
        hideCard(card);
      }
    });


    updateClearButton();

    updateEmptyState(
      visibleCount,
      cards.length
    );


    /*
      home.js listens for this event
      to update documentary count and
      other homepage UI.
    */

    document.dispatchEvent(
      new CustomEvent(
        "salimgpt:searchUpdated",
        {
          detail: {
            query: currentQuery,
            visibleCount,
            totalCount: cards.length
          }
        }
      )
    );
  }


  /* =======================================================
     11. SCHEDULE SEARCH
     ======================================================= */

  function scheduleSearch() {
    if (searchTimer) {
      window.clearTimeout(
        searchTimer
      );
    }


    searchTimer =
      window.setTimeout(
        () => {
          searchTimer = null;

          runSearch();
        },
        SEARCH_DELAY
      );
  }


  /* =======================================================
     12. CLEAR SEARCH
     ======================================================= */

  function clearSearch() {
    if (searchTimer) {
      window.clearTimeout(
        searchTimer
      );

      searchTimer = null;
    }


    searchInput.value = "";

    currentQuery = "";


    runSearch();


    searchInput.focus({
      preventScroll: true
    });
  }


  /* =======================================================
     13. KEYBOARD SUPPORT
     ======================================================= */

  function handleSearchKeydown(event) {

    /*
      ESC clears an active search.
    */

    if (
      event.key === "Escape" &&
      searchInput.value
    ) {
      event.preventDefault();

      clearSearch();
    }
  }


  /* =======================================================
     14. REAPPLY SEARCH AFTER CARD RENDER
     ======================================================= */

  function handleDocumentariesRendered() {

    /*
      documentary-list.js renders cards dynamically.

      If the user typed before rendering completed,
      apply that query to the newly created cards.
    */

    runSearch();
  }


  /* =======================================================
     15. OPTIONAL GRID OBSERVER
     ======================================================= */

  function observeGrid() {
    if (
      typeof MutationObserver === "undefined"
    ) {
      return;
    }


    let observerTimer = null;


    const observer =
      new MutationObserver(
        (mutations) => {

          const hasCardChanges =
            mutations.some(
              (mutation) =>
                mutation.type === "childList"
            );


          if (!hasCardChanges) {
            return;
          }


          if (observerTimer) {
            window.clearTimeout(
              observerTimer
            );
          }


          observerTimer =
            window.setTimeout(
              () => {
                observerTimer = null;

                runSearch();
              },
              25
            );
        }
      );


    observer.observe(
      documentaryGrid,
      {
        childList: true
      }
    );
  }


  /* =======================================================
     16. EVENTS
     ======================================================= */

  searchInput.addEventListener(
    "input",
    () => {
      updateClearButton();

      scheduleSearch();
    }
  );


  searchInput.addEventListener(
    "search",
    runSearch
  );


  searchInput.addEventListener(
    "keydown",
    handleSearchKeydown
  );


  searchClear.addEventListener(
    "click",
    clearSearch
  );


  document.addEventListener(
    "salimgpt:documentariesRendered",
    handleDocumentariesRendered
  );


  /* =======================================================
     17. INITIALIZE
     ======================================================= */

  function initializeSearch() {
    searchInput.setAttribute(
      "autocomplete",
      "off"
    );

    searchInput.setAttribute(
      "spellcheck",
      "false"
    );


    searchClear.hidden = true;

    searchClear.setAttribute(
      "aria-hidden",
      "true"
    );

    searchClear.setAttribute(
      "tabindex",
      "-1"
    );


    if (searchEmptyState) {
      searchEmptyState.hidden = true;
    }


    observeGrid();


    /*
      Run once if documentary cards
      have already been rendered.
    */

    if (
      getDocumentaryCards().length
    ) {
      runSearch();
    }
  }


  initializeSearch();

})();