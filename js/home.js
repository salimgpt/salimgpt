/* =========================================================
   SalimGPT
   File: js/home.js
   Purpose: Homepage initialization and shared homepage state
   ========================================================= */

(function () {
  "use strict";


  /* =======================================================
     01. HELPERS
     ======================================================= */

  const getById = (id) =>
    document.getElementById(id);


  const bengaliDigits = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯"
  };


  function toBengaliNumber(value) {
    return String(value).replace(
      /\d/g,
      (digit) => bengaliDigits[digit]
    );
  }


  function isElementVisible(element) {
    if (!element) {
      return false;
    }

    if (element.hidden) {
      return false;
    }

    if (
      element.getAttribute("aria-hidden") === "true"
    ) {
      return false;
    }

    const style =
      window.getComputedStyle(element);

    return (
      style.display !== "none" &&
      style.visibility !== "hidden"
    );
  }


  /* =======================================================
     02. CURRENT YEAR
     ======================================================= */

  function setCurrentYear() {
    const currentYear =
      new Date().getFullYear();

    const yearInBangla =
      toBengaliNumber(currentYear);

    const footerYear =
      getById("footerYear");

    const menuYear =
      getById("menuYear");


    if (footerYear) {
      footerYear.textContent =
        yearInBangla;
    }


    if (menuYear) {
      menuYear.textContent =
        yearInBangla;
    }
  }


  /* =======================================================
     03. DOCUMENTARY COUNT
     ======================================================= */

  function getRenderedCards() {
    const grid =
      getById("documentaryGrid");

    if (!grid) {
      return [];
    }

    return Array.from(
      grid.querySelectorAll(
        [
          ".documentary-card",
          "[data-documentary-card]"
        ].join(",")
      )
    );
  }


  function updateDocumentaryCount() {
    const countElement =
      getById("documentaryCount");

    if (!countElement) {
      return;
    }


    const cards =
      getRenderedCards();


    /*
      If cards have not been rendered yet,
      leave the existing text untouched.
    */

    if (!cards.length) {
      return;
    }


    const visibleCards =
      cards.filter(isElementVisible);


    const count =
      visibleCards.length;


    countElement.textContent =
      `${toBengaliNumber(count)}টি ডকুমেন্টারি`;
  }


  /* =======================================================
     04. EMPTY SEARCH STATE SAFETY
     ======================================================= */

  function syncEmptyState() {
    const emptyState =
      getById("searchEmptyState");

    const grid =
      getById("documentaryGrid");


    if (!emptyState || !grid) {
      return;
    }


    const cards =
      getRenderedCards();


    /*
      documentary-list.js may still be loading
      the initial cards, so do not show an
      empty-state simply because the grid
      starts empty.
    */

    if (!cards.length) {
      return;
    }


    const visibleCount =
      cards.filter(isElementVisible).length;


    emptyState.hidden =
      visibleCount !== 0;
  }


  /* =======================================================
     05. OBSERVE DOCUMENTARY GRID
     ======================================================= */

  function observeDocumentaryGrid() {
    const grid =
      getById("documentaryGrid");

    if (
      !grid ||
      typeof MutationObserver === "undefined"
    ) {
      return;
    }


    let scheduled = false;


    const refresh = () => {
      if (scheduled) {
        return;
      }

      scheduled = true;

      window.requestAnimationFrame(() => {
        scheduled = false;

        updateDocumentaryCount();
        syncEmptyState();
      });
    };


    const observer =
      new MutationObserver(refresh);


    observer.observe(
      grid,
      {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [
          "hidden",
          "style",
          "class",
          "aria-hidden"
        ]
      }
    );
  }


  /* =======================================================
     06. CUSTOM EVENT SUPPORT
     ======================================================= */

  function bindHomepageEvents() {

    /*
      documentary-list.js can dispatch this after
      rendering all documentary cards.
    */

    document.addEventListener(
      "salimgpt:documentariesRendered",
      () => {
        updateDocumentaryCount();
        syncEmptyState();
      }
    );


    /*
      search.js can dispatch this whenever search
      results change.
    */

    document.addEventListener(
      "salimgpt:searchUpdated",
      () => {
        updateDocumentaryCount();
        syncEmptyState();
      }
    );
  }


  /* =======================================================
     07. HOMEPAGE INITIALIZATION
     ======================================================= */

  function initializeHomepage() {
    setCurrentYear();

    bindHomepageEvents();

    observeDocumentaryGrid();


    /*
      Run once immediately in case
      documentary-list.js already rendered.
    */

    updateDocumentaryCount();
    syncEmptyState();


    document.documentElement.classList.add(
      "salimgpt-ready"
    );
  }


  /* =======================================================
     08. START
     ======================================================= */

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeHomepage,
      {
        once: true
      }
    );
  } else {
    initializeHomepage();
  }

})();
