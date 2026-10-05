"use strict";

/* =========================================================
   SalimGPT Global
   File: js/global-search.js

   Global Static Search Controller

   Data source:
   - data/search-index.js
   - window.SALIMGPT_SEARCH_INDEX

   Supports:
   - Side-menu global search
   - Dedicated Search page
   - Multiple search interfaces on one page
   - Keyboard navigation
   - Accessible live results
   - Multi-word search
   - Bengali / Hindi / Arabic / Latin text
   - Accent-insensitive Latin search
   - Category-aware ranking
   - Search result limits
   - Escape-to-close / clear
   - Click-outside handling
   - Ctrl/Cmd + K shortcut
   - Public SalimGPTSearch API

   No external dependencies.
   ========================================================= */

(() => {

  /* =======================================================
     CONFIG
     ======================================================= */

  const SITE_BASE_URL =
    "https://salimgpt.github.io/salimgpt/";


  const DEFAULT_MENU_LIMIT =
    8;


  const DEFAULT_PAGE_LIMIT =
    30;


  const MIN_QUERY_LENGTH =
    1;


  const SEARCH_SHORTCUT_KEY =
    "k";


  /* =======================================================
     STATE
     ======================================================= */

  const controllers = [];


  let searchIndex = [];


  let normalizedIndex = [];


  let initialized =
    false;


  /* =======================================================
     HTML DOCUMENT
     ======================================================= */

  const html =
    document.documentElement;


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
     * NFKD allows Latin searches such as:
     *
     * français   → francais
     * português  → portugues
     * türkçe     → turkce
     *
     * Other writing systems remain searchable.
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
     * Remove combining accents used by decomposed
     * Latin characters.
     */
    text =
      text.replace(
        /[\u0300-\u036f]/g,
        ""
      );


    /*
     * Normalize punctuation variants.
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
     * Preserve letters and numbers from all supported
     * writing systems.
     */
    try {
      text =
        text.replace(
          /[^\p{L}\p{N}]+/gu,
          " "
        );
    } catch {
      /*
       * Older browser fallback.
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
     SAFE ARRAY
     ======================================================= */

  const toArray = (
    value
  ) => {
    return Array.isArray(value)
      ? value
      : [];
  };


  /* =======================================================
     NORMALIZE URL
     ======================================================= */

  const normalizeUrl = (
    value
  ) => {
    if (!value) {
      return "";
    }


    try {
      return new URL(
        value,
        SITE_BASE_URL
      ).href;
    } catch {
      return "";
    }
  };


  /* =======================================================
     GET SEARCH INDEX
     ======================================================= */

  const readSearchIndex = () => {
    const candidates = [
      window.SALIMGPT_SEARCH_INDEX,
      window.salimgptSearchIndex
    ];


    for (const candidate of candidates) {
      if (
        Array.isArray(candidate)
      ) {
        return candidate;
      }
    }


    return [];
  };


  /* =======================================================
     NORMALIZE SEARCH ENTRY
     ======================================================= */

  const normalizeEntry = (
    entry,
    position
  ) => {
    const safeEntry =
      entry &&
      typeof entry === "object"
        ? entry
        : {};


    const title =
      String(
        safeEntry.title || ""
      ).trim();


    const description =
      String(
        safeEntry.description || ""
      ).trim();


    const h1 =
      String(
        safeEntry.h1 || ""
      ).trim();


    const category =
      String(
        safeEntry.category || ""
      ).trim();


    const subcategory =
      String(
        safeEntry.subcategory || ""
      ).trim();


    const route =
      String(
        safeEntry.route || ""
      ).trim();


    const image =
      normalizeUrl(
        safeEntry.image
      );


    const url =
      normalizeUrl(
        safeEntry.url
      );


    const headings =
      toArray(
        safeEntry.headings
      )
        .map(
          (heading) =>
            String(
              heading || ""
            ).trim()
        )
        .filter(Boolean);


    const keywords =
      toArray(
        safeEntry.keywords
      )
        .map(
          (keyword) =>
            String(
              keyword || ""
            ).trim()
        )
        .filter(Boolean);


    const text =
      String(
        safeEntry.text || ""
      ).trim();


    const normalized = {
      id:
        String(
          safeEntry.id ||
          `search-result-${position + 1}`
        ),

      title,

      description,

      h1,

      category,

      subcategory,

      route,

      image,

      url,

      headings,

      keywords,

      text,

      position
    };


    normalized.normalizedTitle =
      normalizeText(
        title
      );


    normalized.normalizedDescription =
      normalizeText(
        description
      );


    normalized.normalizedH1 =
      normalizeText(
        h1
      );


    normalized.normalizedCategory =
      normalizeText(
        category
      );


    normalized.normalizedSubcategory =
      normalizeText(
        subcategory
      );


    normalized.normalizedHeadings =
      normalizeText(
        headings.join(" ")
      );


    normalized.normalizedKeywords =
      normalizeText(
        keywords.join(" ")
      );


    normalized.normalizedText =
      normalizeText(
        text
      );


    normalized.normalizedCombined =
      normalizeText(
        [
          title,
          h1,
          category,
          subcategory,
          description,
          headings.join(" "),
          keywords.join(" "),
          text
        ]
          .filter(Boolean)
          .join(" ")
      );


    return normalized;
  };


  /* =======================================================
     PREPARE SEARCH INDEX
     ======================================================= */

  const prepareSearchIndex = () => {
    searchIndex =
      readSearchIndex();


    normalizedIndex =
      searchIndex
        .map(
          normalizeEntry
        )
        .filter(
          (entry) => {
            return Boolean(
              entry.title &&
              entry.url
            );
          }
        );


    html.dataset.searchIndexReady =
      normalizedIndex.length
        ? "true"
        : "false";


    html.dataset.searchIndexCount =
      String(
        normalizedIndex.length
      );


    return normalizedIndex;
  };


  /* =======================================================
     QUERY TERMS
     ======================================================= */

  const getQueryTerms = (
    normalizedQuery
  ) => {
    return normalizedQuery
      .split(" ")
      .map(
        (term) =>
          term.trim()
      )
      .filter(Boolean);
  };


  /* =======================================================
     WORD START MATCH
     ======================================================= */

  const containsWordStart = (
    haystack,
    term
  ) => {
    if (
      !haystack ||
      !term
    ) {
      return false;
    }


    if (
      haystack.startsWith(
        term
      )
    ) {
      return true;
    }


    return haystack.includes(
      ` ${term}`
    );
  };


  /* =======================================================
     SCORE TERM
     ======================================================= */

  const scoreTerm = (
    entry,
    term
  ) => {
    let score = 0;


    if (
      entry.normalizedTitle ===
      term
    ) {
      score += 150;
    }


    if (
      entry.normalizedTitle.startsWith(
        term
      )
    ) {
      score += 70;
    }


    if (
      containsWordStart(
        entry.normalizedTitle,
        term
      )
    ) {
      score += 48;
    }


    if (
      entry.normalizedTitle.includes(
        term
      )
    ) {
      score += 35;
    }


    if (
      entry.normalizedH1.includes(
        term
      )
    ) {
      score += 28;
    }


    if (
      entry.normalizedKeywords.includes(
        term
      )
    ) {
      score += 26;
    }


    if (
      entry.normalizedSubcategory.includes(
        term
      )
    ) {
      score += 24;
    }


    if (
      entry.normalizedCategory.includes(
        term
      )
    ) {
      score += 18;
    }


    if (
      entry.normalizedHeadings.includes(
        term
      )
    ) {
      score += 15;
    }


    if (
      entry.normalizedDescription.includes(
        term
      )
    ) {
      score += 10;
    }


    if (
      entry.normalizedText.includes(
        term
      )
    ) {
      score += 4;
    }


    return score;
  };


  /* =======================================================
     SCORE ENTRY
     ======================================================= */

  const scoreEntry = (
    entry,
    normalizedQuery,
    terms
  ) => {

    /*
     * Every query term must occur somewhere in the
     * indexed entry.
     */
    const allTermsMatch =
      terms.every(
        (term) =>
          entry.normalizedCombined.includes(
            term
          )
      );


    if (!allTermsMatch) {
      return 0;
    }


    let score = 0;


    /*
     * Exact phrase weighting.
     */
    if (
      entry.normalizedTitle ===
      normalizedQuery
    ) {
      score += 500;
    } else if (
      entry.normalizedTitle.startsWith(
        normalizedQuery
      )
    ) {
      score += 220;
    } else if (
      entry.normalizedTitle.includes(
        normalizedQuery
      )
    ) {
      score += 150;
    }


    if (
      entry.normalizedH1 ===
      normalizedQuery
    ) {
      score += 170;
    } else if (
      entry.normalizedH1.includes(
        normalizedQuery
      )
    ) {
      score += 90;
    }


    if (
      entry.normalizedSubcategory ===
      normalizedQuery
    ) {
      score += 120;
    } else if (
      entry.normalizedSubcategory.includes(
        normalizedQuery
      )
    ) {
      score += 70;
    }


    if (
      entry.normalizedCategory ===
      normalizedQuery
    ) {
      score += 90;
    } else if (
      entry.normalizedCategory.includes(
        normalizedQuery
      )
    ) {
      score += 45;
    }


    if (
      entry.normalizedKeywords.includes(
        normalizedQuery
      )
    ) {
      score += 70;
    }


    if (
      entry.normalizedHeadings.includes(
        normalizedQuery
      )
    ) {
      score += 45;
    }


    if (
      entry.normalizedDescription.includes(
        normalizedQuery
      )
    ) {
      score += 30;
    }


    /*
     * Individual term weighting.
     */
    terms.forEach(
      (term) => {
        score +=
          scoreTerm(
            entry,
            term
          );
      }
    );


    /*
     * Prefer shorter titles where relevance is otherwise
     * equivalent.
     */
    if (
      entry.title.length <= 40
    ) {
      score += 4;
    }


    return score;
  };


  /* =======================================================
     SEARCH
     ======================================================= */

  const search = (
    rawQuery,
    {
      limit =
        DEFAULT_PAGE_LIMIT
    } = {}
  ) => {
    const normalizedQuery =
      normalizeText(
        rawQuery
      );


    if (
      normalizedQuery.length <
      MIN_QUERY_LENGTH
    ) {
      return [];
    }


    const terms =
      getQueryTerms(
        normalizedQuery
      );


    if (!terms.length) {
      return [];
    }


    return normalizedIndex
      .map(
        (entry) => {
          return {
            entry,

            score:
              scoreEntry(
                entry,
                normalizedQuery,
                terms
              )
          };
        }
      )

      .filter(
        (result) =>
          result.score > 0
      )

      .sort(
        (a, b) => {
          if (
            b.score !==
            a.score
          ) {
            return (
              b.score -
              a.score
            );
          }


          const titleCompare =
            a.entry.title.localeCompare(
              b.entry.title,
              "en",
              {
                sensitivity:
                  "base"
              }
            );


          if (
            titleCompare !== 0
          ) {
            return titleCompare;
          }


          return (
            a.entry.position -
            b.entry.position
          );
        }
      )

      .slice(
        0,
        Math.max(
          1,
          Number(limit) ||
          DEFAULT_PAGE_LIMIT
        )
      )

      .map(
        (result) => ({
          ...result.entry,
          score:
            result.score
        })
      );
  };


  /* =======================================================
     FIND CONTROLLER ROOT
     ======================================================= */

  const findControllerRoot = (
    input
  ) => {
    return (
      input.closest(
        [
          "[data-global-search]",
          "[data-search-root]",
          ".side-menu-search",
          ".search-page-search",
          ".search-interface",
          ".search-box",
          ".search-form"
        ].join(",")
      ) ||
      input.parentElement ||
      document.body
    );
  };


  /* =======================================================
     FIND RESULTS ELEMENT
     ======================================================= */

  const findResultsElement = (
    input,
    root
  ) => {
    const explicitTarget =
      input.getAttribute(
        "aria-controls"
      );


    if (explicitTarget) {
      const controlled =
        document.getElementById(
          explicitTarget
        );


      if (controlled) {
        return controlled;
      }
    }


    const inputId =
      input.id;


    const knownPairs = {
      globalSearchInput:
        "globalSearchResults",

      searchInput:
        "searchResults",

      searchPageInput:
        "searchPageResults"
    };


    if (
      inputId &&
      knownPairs[inputId]
    ) {
      const known =
        document.getElementById(
          knownPairs[inputId]
        );


      if (known) {
        return known;
      }
    }


    return (
      root.querySelector(
        [
          "[data-search-results]",
          ".global-search-results",
          ".search-results",
          ".search-page-results"
        ].join(",")
      ) ||
      null
    );
  };


  /* =======================================================
     FIND STATUS ELEMENT
     ======================================================= */

  const findStatusElement = (
    input,
    root
  ) => {
    const describedBy =
      input.getAttribute(
        "aria-describedby"
      );


    if (describedBy) {
      const ids =
        describedBy
          .split(/\s+/)
          .filter(Boolean);


      for (const id of ids) {
        const element =
          document.getElementById(
            id
          );


        if (
          element &&
          (
            element.hasAttribute(
              "aria-live"
            ) ||
            element.matches(
              "[data-search-status], .search-status"
            )
          )
        ) {
          return element;
        }
      }
    }


    return (
      root.querySelector(
        [
          "[data-search-status]",
          ".global-search-status",
          ".search-status"
        ].join(",")
      ) ||
      null
    );
  };


  /* =======================================================
     DETECT FULL SEARCH PAGE
     ======================================================= */

  const isFullSearchPageController = (
    input,
    root
  ) => {
    return Boolean(
      input.matches(
        [
          "#searchInput",
          "#searchPageInput",
          "[data-search-page-input]"
        ].join(",")
      ) ||
      root.matches(
        [
          ".search-page-search",
          "[data-search-page]"
        ].join(",")
      ) ||
      document.body.classList.contains(
        "search-page"
      )
    );
  };


  /* =======================================================
     BUILD CONTROLLER
     ======================================================= */

  const createController = (
    input
  ) => {
    const root =
      findControllerRoot(
        input
      );


    const results =
      findResultsElement(
        input,
        root
      );


    if (!results) {
      return null;
    }


    const status =
      findStatusElement(
        input,
        root
      );


    const fullPage =
      isFullSearchPageController(
        input,
        root
      );


    const limitAttribute =
      Number(
        input.getAttribute(
          "data-search-limit"
        ) ||
        root.getAttribute(
          "data-search-limit"
        )
      );


    const limit =
      Number.isFinite(
        limitAttribute
      ) &&
      limitAttribute > 0
        ? limitAttribute
        : (
            fullPage
              ? DEFAULT_PAGE_LIMIT
              : DEFAULT_MENU_LIMIT
          );


    return {
      input,
      root,
      results,
      status,
      fullPage,
      limit,
      activeIndex:
        -1,
      resultLinks:
        [],
      query:
        "",
      renderedResults:
        []
    };
  };


  /* =======================================================
     DISCOVER SEARCH INPUTS
     ======================================================= */

  const discoverSearchInputs = () => {
    const selectors = [
      "#globalSearchInput",
      "#searchInput",
      "#searchPageInput",
      "[data-global-search-input]",
      "[data-search-page-input]",
      "input[data-salimgpt-search]",
      "input[data-search-input]"
    ];


    const found =
      Array.from(
        document.querySelectorAll(
          selectors.join(",")
        )
      );


    /*
     * Remove duplicate element references.
     */
    return Array.from(
      new Set(found)
    );
  };


  /* =======================================================
     CLEAR ELEMENT
     ======================================================= */

  const clearElement = (
    element
  ) => {
    while (
      element.firstChild
    ) {
      element.removeChild(
        element.firstChild
      );
    }
  };


  /* =======================================================
     CREATE RESULT META
     ======================================================= */

  const createResultMeta = (
    entry
  ) => {
    const meta =
      document.createElement(
        "div"
      );


    meta.className =
      "global-search-result-meta search-result-meta";


    const labels = [];


    if (entry.category) {
      labels.push(
        entry.category
      );
    }


    if (
      entry.subcategory &&
      normalizeText(
        entry.subcategory
      ) !==
      normalizeText(
        entry.category
      )
    ) {
      labels.push(
        entry.subcategory
      );
    }


    labels.forEach(
      (
        label,
        index
      ) => {
        if (index > 0) {
          const separator =
            document.createElement(
              "span"
            );


          separator.className =
            "global-search-result-separator";


          separator.setAttribute(
            "aria-hidden",
            "true"
          );


          separator.textContent =
            "•";


          meta.appendChild(
            separator
          );
        }


        const item =
          document.createElement(
            "span"
          );


        item.textContent =
          label;


        meta.appendChild(
          item
        );
      }
    );


    return meta;
  };


  /* =======================================================
     CREATE RESULT ITEM
     ======================================================= */

  const createResultItem = (
    entry,
    resultIndex,
    controller
  ) => {
    const item =
      document.createElement(
        "article"
      );


    item.className =
      "global-search-result search-result-card";


    item.setAttribute(
      "role",
      "presentation"
    );


    const link =
      document.createElement(
        "a"
      );


    link.className =
      "global-search-result-link search-result-link";


    link.href =
      entry.url;


    link.setAttribute(
      "role",
      "option"
    );


    link.setAttribute(
      "aria-selected",
      "false"
    );


    const resultId =
      `${
        controller.input.id ||
        "salimgptSearch"
      }Result${resultIndex + 1}`;


    link.id =
      resultId;


    const content =
      document.createElement(
        "div"
      );


    content.className =
      "global-search-result-content search-result-content";


    const title =
      document.createElement(
        "h3"
      );


    title.className =
      "global-search-result-title search-result-title";


    title.textContent =
      entry.title;


    content.appendChild(
      title
    );


    const meta =
      createResultMeta(
        entry
      );


    if (
      meta.childNodes.length
    ) {
      content.appendChild(
        meta
      );
    }


    if (entry.description) {
      const description =
        document.createElement(
          "p"
        );


      description.className =
        "global-search-result-description search-result-description";


      description.textContent =
        entry.description;


      content.appendChild(
        description
      );
    }


    const arrow =
      document.createElement(
        "span"
      );


    arrow.className =
      "global-search-result-arrow";


    arrow.setAttribute(
      "aria-hidden",
      "true"
    );


    arrow.textContent =
      "→";


    link.appendChild(
      content
    );


    link.appendChild(
      arrow
    );


    return {
      item,
      link
    };
  };


  /* =======================================================
     CREATE NO RESULTS STATE
     ======================================================= */

  const createNoResults = (
    query
  ) => {
    const wrapper =
      document.createElement(
        "div"
      );


    wrapper.className =
      "global-search-empty search-results-empty";


    wrapper.setAttribute(
      "role",
      "status"
    );


    const title =
      document.createElement(
        "strong"
      );


    title.textContent =
      "No results found";


    const text =
      document.createElement(
        "p"
      );


    text.textContent =
      query
        ? `No SalimGPT pages matched “${query}”. Try another keyword.`
        : "Enter a keyword to search SalimGPT.";


    wrapper.appendChild(
      title
    );


    wrapper.appendChild(
      text
    );


    return wrapper;
  };


  /* =======================================================
     CREATE INDEX UNAVAILABLE STATE
     ======================================================= */

  const createUnavailableState = () => {
    const wrapper =
      document.createElement(
        "div"
      );


    wrapper.className =
      "global-search-empty search-results-empty";


    wrapper.setAttribute(
      "role",
      "status"
    );


    const title =
      document.createElement(
        "strong"
      );


    title.textContent =
      "Search is not ready";


    const text =
      document.createElement(
        "p"
      );


    text.textContent =
      "The SalimGPT search index is not available on this page yet.";


    wrapper.appendChild(
      title
    );


    wrapper.appendChild(
      text
    );


    return wrapper;
  };


  /* =======================================================
     SHOW RESULTS CONTAINER
     ======================================================= */

  const showResults = (
    controller
  ) => {
    controller.results.hidden =
      false;


    controller.results.setAttribute(
      "aria-hidden",
      "false"
    );


    controller.root.classList.add(
      "has-search-results"
    );


    controller.root.classList.add(
      "is-search-active"
    );
  };


  /* =======================================================
     HIDE RESULTS CONTAINER
     ======================================================= */

  const hideResults = (
    controller
  ) => {
    if (
      controller.fullPage
    ) {
      controller.root.classList.remove(
        "has-search-results"
      );


      return;
    }


    controller.results.hidden =
      true;


    controller.results.setAttribute(
      "aria-hidden",
      "true"
    );


    controller.root.classList.remove(
      "has-search-results"
    );


    controller.root.classList.remove(
      "is-search-active"
    );


    controller.activeIndex =
      -1;


    controller.input.removeAttribute(
      "aria-activedescendant"
    );
  };


  /* =======================================================
     STATUS TEXT
     ======================================================= */

  const setStatus = (
    controller,
    message
  ) => {
    if (!controller.status) {
      return;
    }


    controller.status.textContent =
      message;
  };


  /* =======================================================
     RESULT COUNT MESSAGE
     ======================================================= */

  const getResultCountMessage = (
    count,
    query
  ) => {
    if (count === 0) {
      return (
        query
          ? `No results found for ${query}.`
          : "Search SalimGPT."
      );
    }


    return (
      count === 1
        ? `1 result found for ${query}.`
        : `${count} results found for ${query}.`
    );
  };


  /* =======================================================
     RESET ACTIVE RESULT
     ======================================================= */

  const resetActiveResult = (
    controller
  ) => {
    controller.resultLinks.forEach(
      (link) => {
        link.classList.remove(
          "is-active"
        );


        link.setAttribute(
          "aria-selected",
          "false"
        );
      }
    );


    controller.activeIndex =
      -1;


    controller.input.removeAttribute(
      "aria-activedescendant"
    );
  };


  /* =======================================================
     SET ACTIVE RESULT
     ======================================================= */

  const setActiveResult = (
    controller,
    index
  ) => {
    const links =
      controller.resultLinks;


    if (!links.length) {
      resetActiveResult(
        controller
      );


      return;
    }


    let nextIndex =
      index;


    if (
      nextIndex < 0
    ) {
      nextIndex =
        links.length - 1;
    }


    if (
      nextIndex >=
      links.length
    ) {
      nextIndex =
        0;
    }


    links.forEach(
      (
        link,
        linkIndex
      ) => {
        const active =
          linkIndex ===
          nextIndex;


        link.classList.toggle(
          "is-active",
          active
        );


        link.setAttribute(
          "aria-selected",
          active
            ? "true"
            : "false"
        );
      }
    );


    controller.activeIndex =
      nextIndex;


    const activeLink =
      links[nextIndex];


    if (activeLink.id) {
      controller.input.setAttribute(
        "aria-activedescendant",
        activeLink.id
      );
    }


    /*
     * Keep the keyboard-selected result visible inside
     * scrollable dropdowns.
     */
    activeLink.scrollIntoView({
      block:
        "nearest"
    });
  };


  /* =======================================================
     RENDER RESULTS
     ======================================================= */

  const renderResults = (
    controller,
    rawQuery
  ) => {
    const query =
      String(
        rawQuery || ""
      ).trim();


    const normalizedQuery =
      normalizeText(
        query
      );


    controller.query =
      query;


    resetActiveResult(
      controller
    );


    clearElement(
      controller.results
    );


    /*
     * Empty query:
     * hide dropdown searches but keep dedicated search page
     * ready for a query.
     */
    if (
      normalizedQuery.length <
      MIN_QUERY_LENGTH
    ) {
      controller.renderedResults =
        [];


      setStatus(
        controller,
        "Search SalimGPT."
      );


      if (
        controller.fullPage
      ) {
        controller.results.appendChild(
          createNoResults(
            ""
          )
        );


        showResults(
          controller
        );
      } else {
        hideResults(
          controller
        );
      }


      return [];
    }


    if (
      !normalizedIndex.length
    ) {
      controller.renderedResults =
        [];


      controller.results.appendChild(
        createUnavailableState()
      );


      setStatus(
        controller,
        "Search index is not available."
      );


      showResults(
        controller
      );


      return [];
    }


    const results =
      search(
        query,
        {
          limit:
            controller.limit
        }
      );


    controller.renderedResults =
      results;


    if (!results.length) {
      controller.results.appendChild(
        createNoResults(
          query
        )
      );


      setStatus(
        controller,
        getResultCountMessage(
          0,
          query
        )
      );


      showResults(
        controller
      );


      return [];
    }


    const list =
      document.createElement(
        "div"
      );


    list.className =
      "global-search-results-list search-results-list";


    list.setAttribute(
      "role",
      "listbox"
    );


    list.setAttribute(
      "aria-label",
      `Search results for ${query}`
    );


    const resultLinks = [];


    results.forEach(
      (
        entry,
        index
      ) => {
        const {
          item,
          link
        } =
          createResultItem(
            entry,
            index,
            controller
          );


        item.appendChild(
          link
        );


        list.appendChild(
          item
        );


        resultLinks.push(
          link
        );
      }
    );


    controller.results.appendChild(
      list
    );


    controller.resultLinks =
      resultLinks;


    setStatus(
      controller,
      getResultCountMessage(
        results.length,
        query
      )
    );


    showResults(
      controller
    );


    return results;
  };


  /* =======================================================
     INPUT HANDLER
     ======================================================= */

  const handleInput = (
    controller
  ) => {
    renderResults(
      controller,
      controller.input.value
    );
  };


  /* =======================================================
     KEYBOARD HANDLER
     ======================================================= */

  const handleKeyDown = (
    event,
    controller
  ) => {
    switch (event.key) {

      case "ArrowDown": {
        if (
          !controller.resultLinks.length
        ) {
          return;
        }


        event.preventDefault();


        setActiveResult(
          controller,
          controller.activeIndex + 1
        );


        break;
      }


      case "ArrowUp": {
        if (
          !controller.resultLinks.length
        ) {
          return;
        }


        event.preventDefault();


        setActiveResult(
          controller,
          controller.activeIndex - 1
        );


        break;
      }


      case "Enter": {
        if (
          controller.activeIndex < 0 ||
          !controller.resultLinks[
            controller.activeIndex
          ]
        ) {
          return;
        }


        event.preventDefault();


        controller.resultLinks[
          controller.activeIndex
        ].click();


        break;
      }


      case "Escape": {
        if (
          controller.query
        ) {
          controller.input.value =
            "";


          renderResults(
            controller,
            ""
          );


          controller.input.focus();
        } else {
          hideResults(
            controller
          );


          controller.input.blur();
        }


        break;
      }


      case "Home": {
        if (
          controller.activeIndex < 0 ||
          !controller.resultLinks.length
        ) {
          return;
        }


        event.preventDefault();


        setActiveResult(
          controller,
          0
        );


        break;
      }


      case "End": {
        if (
          controller.activeIndex < 0 ||
          !controller.resultLinks.length
        ) {
          return;
        }


        event.preventDefault();


        setActiveResult(
          controller,
          controller.resultLinks.length - 1
        );


        break;
      }


      default:
        break;
    }
  };


  /* =======================================================
     INPUT FOCUS HANDLER
     ======================================================= */

  const handleFocus = (
    controller
  ) => {
    if (
      controller.input.value.trim()
    ) {
      renderResults(
        controller,
        controller.input.value
      );
    }
  };


  /* =======================================================
     NATIVE SEARCH EVENT
     ======================================================= */

  const handleNativeSearch = (
    controller
  ) => {
    renderResults(
      controller,
      controller.input.value
    );
  };


  /* =======================================================
     CONTROLLER SETUP
     ======================================================= */

  const initializeController = (
    controller
  ) => {
    const {
      input,
      results
    } =
      controller;


    /*
     * Ensure predictable autocomplete behavior.
     */
    input.setAttribute(
      "autocomplete",
      "off"
    );


    input.setAttribute(
      "spellcheck",
      "false"
    );


    input.setAttribute(
      "autocapitalize",
      "none"
    );


    input.setAttribute(
      "autocorrect",
      "off"
    );


    input.setAttribute(
      "role",
      "combobox"
    );


    input.setAttribute(
      "aria-autocomplete",
      "list"
    );


    input.setAttribute(
      "aria-expanded",
      "false"
    );


    if (!results.id) {
      results.id =
        `${
          input.id ||
          "salimgptSearch"
        }Results`;
    }


    input.setAttribute(
      "aria-controls",
      results.id
    );


    /*
     * Results visibility also updates aria-expanded.
     */
    const originalShowResults =
      showResults;


    /*
     * No monkey patch is needed; keep state synchronized
     * through mutation-safe event handlers below.
     */
    input.addEventListener(
      "input",
      () => {
        handleInput(
          controller
        );


        input.setAttribute(
          "aria-expanded",
          results.hidden
            ? "false"
            : "true"
        );
      }
    );


    input.addEventListener(
      "search",
      () => {
        handleNativeSearch(
          controller
        );


        input.setAttribute(
          "aria-expanded",
          results.hidden
            ? "false"
            : "true"
        );
      }
    );


    input.addEventListener(
      "focus",
      () => {
        handleFocus(
          controller
        );


        input.setAttribute(
          "aria-expanded",
          results.hidden
            ? "false"
            : "true"
        );
      }
    );


    input.addEventListener(
      "keydown",
      (event) => {
        handleKeyDown(
          event,
          controller
        );


        input.setAttribute(
          "aria-expanded",
          results.hidden
            ? "false"
            : "true"
        );
      }
    );


    results.addEventListener(
      "mousedown",
      (event) => {
        /*
         * Prevent the input from losing focus before
         * a search result click finishes.
         */
        const link =
          event.target.closest(
            "a"
          );


        if (link) {
          event.preventDefault();


          link.click();
        }
      }
    );


    if (
      controller.fullPage
    ) {
      renderResults(
        controller,
        input.value
      );
    } else {
      results.hidden =
        true;


      results.setAttribute(
        "aria-hidden",
        "true"
      );
    }


    input.dataset.searchReady =
      "true";


    controller.root.dataset.searchReady =
      "true";


    /*
     * Keep the linter/runtime from interpreting the helper
     * reference as unused in environments that optimize code.
     */
    void originalShowResults;
  };


  /* =======================================================
     CLOSE DROPDOWNS OUTSIDE SEARCH
     ======================================================= */

  const handleDocumentPointerDown = (
    event
  ) => {
    controllers.forEach(
      (controller) => {
        if (
          controller.fullPage
        ) {
          return;
        }


        if (
          controller.root.contains(
            event.target
          )
        ) {
          return;
        }


        hideResults(
          controller
        );


        controller.input.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    );
  };


  /* =======================================================
     GLOBAL KEYBOARD SHORTCUT
     ======================================================= */

  const findPreferredSearchInput =
    () => {

      /*
       * Prefer an already-visible dedicated page search.
       */
      const fullPageController =
        controllers.find(
          (controller) => {
            return (
              controller.fullPage &&
              !controller.input.disabled &&
              controller.input.offsetParent !== null
            );
          }
        );


      if (fullPageController) {
        return fullPageController.input;
      }


      /*
       * Fall back to a visible side-menu/global search input.
       */
      const visibleController =
        controllers.find(
          (controller) => {
            return (
              !controller.input.disabled &&
              controller.input.offsetParent !== null
            );
          }
        );


      return visibleController
        ? visibleController.input
        : null;
    };


  const handleGlobalShortcut = (
    event
  ) => {
    if (
      !(
        event.ctrlKey ||
        event.metaKey
      ) ||
      event.altKey ||
      event.shiftKey ||
      event.key.toLowerCase() !==
        SEARCH_SHORTCUT_KEY
    ) {
      return;
    }


    const input =
      findPreferredSearchInput();


    if (!input) {
      return;
    }


    event.preventDefault();


    try {
      input.focus({
        preventScroll: false
      });
    } catch {
      input.focus();
    }


    input.select();
  };


  /* =======================================================
     SEARCH EVENT
     ======================================================= */

  const dispatchReadyEvent = () => {
    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:search-ready",
          {
            detail: {
              indexCount:
                normalizedIndex.length,

              interfaceCount:
                controllers.length
            }
          }
        )
      );
    } catch {
      /* No action required. */
    }
  };


  /* =======================================================
     INITIALIZE
     ======================================================= */

  const initialize = () => {
    if (initialized) {
      return;
    }


    initialized =
      true;


    prepareSearchIndex();


    const inputs =
      discoverSearchInputs();


    inputs.forEach(
      (input) => {
        if (
          input.dataset.globalSearchBound ===
          "true"
        ) {
          return;
        }


        const controller =
          createController(
            input
          );


        if (!controller) {
          return;
        }


        input.dataset.globalSearchBound =
          "true";


        controllers.push(
          controller
        );


        initializeController(
          controller
        );
      }
    );


    document.addEventListener(
      "pointerdown",
      handleDocumentPointerDown
    );


    document.addEventListener(
      "keydown",
      handleGlobalShortcut
    );


    html.dataset.globalSearchReady =
      "true";


    dispatchReadyEvent();
  };


  /* =======================================================
     REFRESH SEARCH INDEX
     ======================================================= */

  const refreshIndex = () => {
    prepareSearchIndex();


    controllers.forEach(
      (controller) => {
        if (
          controller.input.value.trim()
        ) {
          renderResults(
            controller,
            controller.input.value
          );
        }
      }
    );


    return [
      ...searchIndex
    ];
  };


  /* =======================================================
     FOCUS GLOBAL SEARCH
     ======================================================= */

  const focusSearch = () => {
    const input =
      findPreferredSearchInput();


    if (!input) {
      return false;
    }


    try {
      input.focus();
    } catch {
      return false;
    }


    return true;
  };


  /* =======================================================
     CLEAR ALL SEARCH INTERFACES
     ======================================================= */

  const clearAll = () => {
    controllers.forEach(
      (controller) => {
        controller.input.value =
          "";


        renderResults(
          controller,
          ""
        );


        controller.input.setAttribute(
          "aria-expanded",
          controller.results.hidden
            ? "false"
            : "true"
        );
      }
    );
  };


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.SalimGPTSearch = {

    initialize() {
      initialize();
    },


    search(
      query,
      options = {}
    ) {
      return search(
        query,
        options
      );
    },


    refreshIndex() {
      return refreshIndex();
    },


    getIndex() {
      return searchIndex.map(
        (entry) => ({
          ...entry
        })
      );
    },


    getIndexCount() {
      return normalizedIndex.length;
    },


    getControllers() {
      return controllers.map(
        (controller) => ({
          input:
            controller.input,

          results:
            controller.results,

          fullPage:
            controller.fullPage,

          limit:
            controller.limit,

          query:
            controller.query
        })
      );
    },


    focus() {
      return focusSearch();
    },


    clear() {
      clearAll();
    },


    normalize(
      value
    ) {
      return normalizeText(
        value
      );
    },


    render(
      inputOrId,
      query
    ) {
      let input =
        inputOrId;


      if (
        typeof inputOrId ===
        "string"
      ) {
        input =
          document.getElementById(
            inputOrId
          );
      }


      const controller =
        controllers.find(
          (item) =>
            item.input === input
        );


      if (!controller) {
        return [];
      }


      controller.input.value =
        String(
          query || ""
        );


      return renderResults(
        controller,
        controller.input.value
      );
    }

  };


  /* =======================================================
     RUN
     ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      {
        once: true
      }
    );
  } else {
    initialize();
  }

})();