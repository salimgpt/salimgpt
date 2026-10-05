"use strict";

/* =========================================================
   SalimGPT Global
   File: js/language-search.js

   Language Edition Search

   Works with:
   - #languageSearch
   - #languageSearchClear
   - #languageSearchStatus
   - #languageGrid
   - #languageNoResults
   - [data-language-card]
   - [data-language-search]

   Features:
   - Instant language filtering
   - Native-language search
   - English-name search
   - Language-code search
   - Accent-insensitive Latin search
   - Multi-word search
   - Available / Upcoming result counts
   - Clear button
   - Escape-to-clear
   - IME-safe input for Bengali, Hindi, Arabic, etc.
   - Accessible live status
   - No-results state
   - Public SalimGPTLanguageSearch API

   No external dependencies.
   ========================================================= */

(() => {

  /* =======================================================
     ELEMENTS
     ======================================================= */

  const input =
    document.getElementById(
      "languageSearch"
    );


  const clearButton =
    document.getElementById(
      "languageSearchClear"
    );


  const status =
    document.getElementById(
      "languageSearchStatus"
    );


  const grid =
    document.getElementById(
      "languageGrid"
    );


  const noResults =
    document.getElementById(
      "languageNoResults"
    );


  /* =======================================================
     PAGE GUARD
     ======================================================= */

  if (
    !input ||
    !grid
  ) {
    return;
  }


  /* =======================================================
     STATE
     ======================================================= */

  let cards =
    Array.from(
      grid.querySelectorAll(
        "[data-language-card]"
      )
    );


  let isComposing =
    false;


  let currentQuery =
    "";


  /* =======================================================
     NORMALIZE TEXT
     ======================================================= */

  const normalizeText = (
    value
  ) => {
    let text =
      String(
        value || ""
      )
        .toLowerCase()
        .trim();


    /*
     * NFKD separates Latin accents so:
     *
     * français → francais
     * português → portugues
     * türkçe → turkce
     *
     * Bengali, Hindi, Arabic and other scripts remain
     * searchable in their native writing systems.
     */
    if (
      typeof text.normalize ===
      "function"
    ) {
      text =
        text.normalize(
          "NFKD"
        );
    }


    /*
     * Remove combining marks used by decomposed Latin
     * characters without stripping Indic vowel signs or
     * Arabic-script characters.
     */
    text =
      text.replace(
        /[\u0300-\u036f]/g,
        ""
      );


    /*
     * Normalize common punctuation variants.
     */
    text =
      text
        .replace(
          /[’‘`´]/g,
          "'"
        )
        .replace(
          /[‐-‒–—―]/g,
          "-"
        );


    /*
     * Convert punctuation to spaces while keeping
     * Unicode letters and numbers intact.
     */
    try {
      text =
        text.replace(
          /[^\p{L}\p{N}]+/gu,
          " "
        );
    } catch {
      /*
       * Fallback for older browsers without Unicode
       * property escape support.
       */
      text =
        text.replace(
          /[^\w\u0080-\uFFFF]+/g,
          " "
        );
    }


    return text
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  };


  /* =======================================================
     CARD SEARCH TEXT
     ======================================================= */

  const buildCardSearchText = (
    card
  ) => {
    const explicitTerms =
      card.getAttribute(
        "data-language-search"
      ) || "";


    const lang =
      card.getAttribute(
        "lang"
      ) || "";


    const visibleText =
      card.textContent || "";


    const link =
      card.querySelector(
        "a[href]"
      );


    const hreflang =
      link
        ? (
            link.getAttribute(
              "hreflang"
            ) || ""
          )
        : "";


    return normalizeText(
      [
        explicitTerms,
        lang,
        hreflang,
        visibleText
      ].join(" ")
    );
  };


  /* =======================================================
     CARD CACHE
     ======================================================= */

  const prepareCards = () => {
    cards =
      Array.from(
        grid.querySelectorAll(
          "[data-language-card]"
        )
      );


    cards.forEach(
      (card) => {
        card.dataset.normalizedLanguageSearch =
          buildCardSearchText(
            card
          );
      }
    );
  };


  /* =======================================================
     CARD STATUS
     ======================================================= */

  const isAvailableCard = (
    card
  ) => {
    return card.classList.contains(
      "is-available"
    );
  };


  const isUpcomingCard = (
    card
  ) => {
    return card.classList.contains(
      "is-upcoming"
    );
  };


  /* =======================================================
     PLURALIZATION
     ======================================================= */

  const editionLabel = (
    count
  ) => {
    return count === 1
      ? "edition"
      : "editions";
  };


  const matchLabel = (
    count
  ) => {
    return count === 1
      ? "match"
      : "matches";
  };


  /* =======================================================
     INITIAL STATUS
     ======================================================= */

  const getTotalCounts = () => {
    const available =
      cards.filter(
        isAvailableCard
      ).length;


    const upcoming =
      cards.filter(
        isUpcomingCard
      ).length;


    return {
      available,
      upcoming,
      total:
        cards.length
    };
  };


  /* =======================================================
     UPDATE STATUS
     ======================================================= */

  const updateStatus = (
    visibleCards,
    query
  ) => {
    if (!status) {
      return;
    }


    const totalCounts =
      getTotalCounts();


    /*
     * Default state.
     */
    if (!query) {
      const parts = [];


      if (
        totalCounts.available > 0
      ) {
        parts.push(
          `${totalCounts.available} ${editionLabel(totalCounts.available)} available now`
        );
      }


      if (
        totalCounts.upcoming > 0
      ) {
        parts.push(
          `${totalCounts.upcoming} upcoming`
        );
      }


      status.textContent =
        parts.length
          ? parts.join(" · ")
          : "No language editions listed";


      return;
    }


    /*
     * Search result state.
     */
    const availableMatches =
      visibleCards.filter(
        isAvailableCard
      ).length;


    const upcomingMatches =
      visibleCards.filter(
        isUpcomingCard
      ).length;


    const totalMatches =
      visibleCards.length;


    if (
      totalMatches === 0
    ) {
      status.textContent =
        "No matching language editions";

      return;
    }


    const parts = [
      `${totalMatches} ${matchLabel(totalMatches)}`
    ];


    if (
      availableMatches > 0
    ) {
      parts.push(
        `${availableMatches} available now`
      );
    }


    if (
      upcomingMatches > 0
    ) {
      parts.push(
        `${upcomingMatches} upcoming`
      );
    }


    status.textContent =
      parts.join(" · ");
  };


  /* =======================================================
     UPDATE CLEAR BUTTON
     ======================================================= */

  const updateClearButton = (
    hasQuery
  ) => {
    if (!clearButton) {
      return;
    }


    clearButton.hidden =
      !hasQuery;


    clearButton.setAttribute(
      "aria-hidden",
      hasQuery
        ? "false"
        : "true"
    );
  };


  /* =======================================================
     UPDATE NO-RESULTS STATE
     ======================================================= */

  const updateNoResults = (
    resultCount,
    hasQuery
  ) => {
    if (!noResults) {
      return;
    }


    const shouldShow =
      hasQuery &&
      resultCount === 0;


    noResults.hidden =
      !shouldShow;


    noResults.setAttribute(
      "aria-hidden",
      shouldShow
        ? "false"
        : "true"
    );
  };


  /* =======================================================
     QUERY MATCHER
     ======================================================= */

  const cardMatchesQuery = (
    card,
    normalizedQuery
  ) => {
    if (!normalizedQuery) {
      return true;
    }


    const searchable =
      card.dataset
        .normalizedLanguageSearch ||
      buildCardSearchText(
        card
      );


    /*
     * Exact full-phrase match gets the simplest path.
     */
    if (
      searchable.includes(
        normalizedQuery
      )
    ) {
      return true;
    }


    /*
     * For multi-word searches every entered term must
     * occur somewhere in the card's searchable text.
     *
     * Example:
     * "bangla bn"
     * "hindi hi"
     */
    const terms =
      normalizedQuery
        .split(" ")
        .filter(Boolean);


    if (!terms.length) {
      return true;
    }


    return terms.every(
      (term) =>
        searchable.includes(
          term
        )
    );
  };


  /* =======================================================
     APPLY FILTER
     ======================================================= */

  const applyFilter = (
    rawQuery = input.value
  ) => {
    const normalizedQuery =
      normalizeText(
        rawQuery
      );


    currentQuery =
      normalizedQuery;


    const visibleCards = [];


    cards.forEach(
      (card) => {
        const matches =
          cardMatchesQuery(
            card,
            normalizedQuery
          );


        card.hidden =
          !matches;


        card.setAttribute(
          "aria-hidden",
          matches
            ? "false"
            : "true"
        );


        if (matches) {
          visibleCards.push(
            card
          );
        }
      }
    );


    const hasQuery =
      normalizedQuery.length > 0;


    updateClearButton(
      hasQuery
    );


    updateNoResults(
      visibleCards.length,
      hasQuery
    );


    updateStatus(
      visibleCards,
      normalizedQuery
    );


    /*
     * Useful state hooks for CSS or diagnostics.
     */
    grid.dataset.searchActive =
      hasQuery
        ? "true"
        : "false";


    grid.dataset.visibleLanguages =
      String(
        visibleCards.length
      );


    /*
     * Emit a lightweight custom event so another component
     * can react without tightly coupling to this script.
     */
    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:language-search",
          {
            detail: {
              query:
                rawQuery,

              normalizedQuery,

              visibleCount:
                visibleCards.length,

              totalCount:
                cards.length
            }
          }
        )
      );
    } catch {
      /* No action required. */
    }


    return visibleCards;
  };


  /* =======================================================
     CLEAR SEARCH
     ======================================================= */

  const clearSearch = ({
    focus = true
  } = {}) => {

    input.value =
      "";


    currentQuery =
      "";


    applyFilter(
      ""
    );


    if (focus) {
      try {
        input.focus({
          preventScroll: true
        });
      } catch {
        input.focus();
      }
    }
  };


  /* =======================================================
     INPUT EVENT
     ======================================================= */

  const handleInput = () => {
    if (isComposing) {
      return;
    }


    applyFilter(
      input.value
    );
  };


  /* =======================================================
     IME SUPPORT
     ======================================================= */

  const handleCompositionStart =
    () => {
      isComposing =
        true;
    };


  const handleCompositionEnd =
    () => {
      isComposing =
        false;


      applyFilter(
        input.value
      );
    };


  /* =======================================================
     KEYBOARD
     ======================================================= */

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key !==
      "Escape"
    ) {
      return;
    }


    if (
      input.value.trim()
    ) {
      event.preventDefault();


      clearSearch({
        focus: true
      });


      return;
    }


    /*
     * When already empty, Escape simply removes focus.
     */
    input.blur();
  };


  /* =======================================================
     NATIVE SEARCH EVENT
     ======================================================= */

  const handleSearchEvent =
    () => {
      /*
       * Browsers can fire "search" when their native
       * clear control or Enter behavior is used.
       */
      if (!isComposing) {
        applyFilter(
          input.value
        );
      }
    };


  /* =======================================================
     CLEAR BUTTON
     ======================================================= */

  const handleClearClick =
    (event) => {
      event.preventDefault();


      clearSearch({
        focus: true
      });
    };


  /* =======================================================
     REFRESH
     ======================================================= */

  const refresh = () => {
    prepareCards();


    applyFilter(
      input.value
    );
  };


  /* =======================================================
     INITIALIZE
     ======================================================= */

  const initialize = () => {
    prepareCards();


    input.setAttribute(
      "aria-controls",
      grid.id ||
      "languageGrid"
    );


    if (status) {
      input.setAttribute(
        "aria-describedby",
        status.id ||
        "languageSearchStatus"
      );
    }


    /*
     * Disable browser spelling corrections that can interfere
     * with language names.
     */
    input.setAttribute(
      "autocapitalize",
      "none"
    );


    input.setAttribute(
      "autocorrect",
      "off"
    );


    input.addEventListener(
      "input",
      handleInput
    );


    input.addEventListener(
      "search",
      handleSearchEvent
    );


    input.addEventListener(
      "keydown",
      handleKeyDown
    );


    input.addEventListener(
      "compositionstart",
      handleCompositionStart
    );


    input.addEventListener(
      "compositionend",
      handleCompositionEnd
    );


    if (clearButton) {
      clearButton.addEventListener(
        "click",
        handleClearClick
      );
    }


    /*
     * Run immediately so counts are derived from the DOM
     * rather than being permanently hard-coded.
     */
    applyFilter(
      input.value
    );


    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:language-search-ready",
          {
            detail: {
              totalCount:
                cards.length
            }
          }
        )
      );
    } catch {
      /* No action required. */
    }
  };


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.SalimGPTLanguageSearch = {

    initialize() {
      refresh();
    },


    search(query) {
      input.value =
        String(
          query || ""
        );


      return applyFilter(
        input.value
      );
    },


    clear(options = {}) {
      clearSearch(
        options
      );
    },


    refresh() {
      refresh();
    },


    getQuery() {
      return input.value;
    },


    getNormalizedQuery() {
      return currentQuery;
    },


    getCards() {
      return [
        ...cards
      ];
    },


    getVisibleCards() {
      return cards.filter(
        (card) =>
          !card.hidden
      );
    },


    getCounts() {
      const visibleCards =
        cards.filter(
          (card) =>
            !card.hidden
        );


      return {
        total:
          cards.length,

        visible:
          visibleCards.length,

        available:
          cards.filter(
            isAvailableCard
          ).length,

        upcoming:
          cards.filter(
            isUpcomingCard
          ).length,

        visibleAvailable:
          visibleCards.filter(
            isAvailableCard
          ).length,

        visibleUpcoming:
          visibleCards.filter(
            isUpcomingCard
          ).length
      };
    }

  };


  /* =======================================================
     RUN
     ======================================================= */

  initialize();

})();