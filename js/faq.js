"use strict";

/* =========================================================
   SalimGPT Global
   File: js/faq.js

   FAQ Page Controller

   Works with the static FAQ page and optionally:
   - data/faq.js
   - window.SALIMGPT_FAQ_INDEX

   Supported markup:
   - .faq-group-section
   - .faq-item
   - .faq-question
   - .faq-answer

   Optional controls:
   - #faqSearch
   - #faqSearchInput
   - [data-faq-search-input]
   - #faqSearchClear
   - [data-faq-search-clear]
   - #faqSearchStatus
   - [data-faq-search-status]
   - #faqNoResults
   - [data-faq-no-results]
   - [data-faq-expand-all]
   - [data-faq-collapse-all]

   Features:
   - Native <details> FAQ enhancement
   - FAQ search and filtering
   - Bengali / Hindi / Arabic / Latin-safe search
   - Accent-insensitive Latin matching
   - Multi-word search
   - Group visibility management
   - Search result counts
   - Clear search
   - Escape-to-clear
   - Expand all / collapse all
   - Deep-link support
   - Auto-open linked FAQ
   - Accessible status updates
   - Keyboard-friendly behavior
   - Optional FAQ-index integration
   - Public SalimGPTFAQ API

   No external dependencies.
   ========================================================= */

(() => {

  /* =======================================================
     CONFIG
     ======================================================= */

  const GROUP_SELECTOR =
    ".faq-group-section";


  const ITEM_SELECTOR =
    ".faq-item";


  const QUESTION_SELECTOR =
    ".faq-question";


  const ANSWER_SELECTOR =
    ".faq-answer";


  const SEARCH_INPUT_SELECTORS = [
    "#faqSearch",
    "#faqSearchInput",
    "[data-faq-search-input]"
  ];


  const CLEAR_BUTTON_SELECTORS = [
    "#faqSearchClear",
    "[data-faq-search-clear]"
  ];


  const STATUS_SELECTORS = [
    "#faqSearchStatus",
    "[data-faq-search-status]"
  ];


  const NO_RESULTS_SELECTORS = [
    "#faqNoResults",
    "[data-faq-no-results]"
  ];


  const EXPAND_ALL_SELECTORS = [
    "[data-faq-expand-all]",
    "#faqExpandAll"
  ];


  const COLLAPSE_ALL_SELECTORS = [
    "[data-faq-collapse-all]",
    "#faqCollapseAll"
  ];


  /* =======================================================
     STATE
     ======================================================= */

  let groups = [];

  let items = [];

  let searchInput = null;

  let clearButton = null;

  let searchStatus = null;

  let noResults = null;

  let expandAllButtons = [];

  let collapseAllButtons = [];

  let initialized = false;

  let isComposing = false;

  let currentQuery = "";


  /* =======================================================
     DOCUMENT
     ======================================================= */

  const html =
    document.documentElement;


  /* =======================================================
     FIRST MATCH
     ======================================================= */

  const findFirst = (
    selectors
  ) => {
    for (const selector of selectors) {
      const element =
        document.querySelector(
          selector
        );


      if (element) {
        return element;
      }
    }


    return null;
  };


  /* =======================================================
     ALL MATCHES
     ======================================================= */

  const findAll = (
    selectors
  ) => {
    const result = [];


    selectors.forEach(
      (selector) => {
        document
          .querySelectorAll(
            selector
          )
          .forEach(
            (element) => {
              if (
                !result.includes(
                  element
                )
              ) {
                result.push(
                  element
                );
              }
            }
          );
      }
    );


    return result;
  };


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
     * NFKD makes searches such as:
     *
     * français  → francais
     * português → portugues
     *
     * while preserving Bengali, Hindi, Arabic and other
     * scripts for direct native-language searching.
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


    text =
      text.replace(
        /[\u0300-\u036f]/g,
        ""
      );


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


    try {
      text =
        text.replace(
          /[^\p{L}\p{N}]+/gu,
          " "
        );
    } catch {
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
     SAFE HASH DECODE
     ======================================================= */

  const decodeHash = (
    hash
  ) => {
    const value =
      String(
        hash || ""
      )
        .replace(
          /^#/,
          ""
        );


    if (!value) {
      return "";
    }


    try {
      return decodeURIComponent(
        value
      );
    } catch {
      return value;
    }
  };


  /* =======================================================
     REDUCED MOTION
     ======================================================= */

  const prefersReducedMotion =
    () => {
      return Boolean(
        window.matchMedia &&
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
      );
    };


  /* =======================================================
     GET QUESTION
     ======================================================= */

  const getQuestionElement = (
    item
  ) => {
    return (
      item.querySelector(
        QUESTION_SELECTOR
      ) ||
      item.querySelector(
        "summary"
      )
    );
  };


  /* =======================================================
     GET ANSWER
     ======================================================= */

  const getAnswerElement = (
    item
  ) => {
    return (
      item.querySelector(
        ANSWER_SELECTOR
      ) ||
      Array.from(
        item.children
      ).find(
        (child) =>
          child.tagName !==
          "SUMMARY"
      ) ||
      null
    );
  };


  /* =======================================================
     GET QUESTION TEXT
     ======================================================= */

  const getQuestionText = (
    item
  ) => {
    const question =
      getQuestionElement(
        item
      );


    return String(
      question
        ? question.textContent
        : ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  };


  /* =======================================================
     GET ANSWER TEXT
     ======================================================= */

  const getAnswerText = (
    item
  ) => {
    const answer =
      getAnswerElement(
        item
      );


    return String(
      answer
        ? answer.textContent
        : ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  };


  /* =======================================================
     GET GROUP TITLE
     ======================================================= */

  const getGroupTitle = (
    group
  ) => {
    const heading =
      group.querySelector(
        "h2, h3"
      );


    return String(
      heading
        ? heading.textContent
        : ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  };


  /* =======================================================
     OPTIONAL GENERATED FAQ INDEX
     ======================================================= */

  const getGeneratedFaqIndex =
    () => {
      const candidates = [
        window.SALIMGPT_FAQ_INDEX,
        window.SALIMGPT_FAQ,
        window.salimgptFaqIndex,
        window.salimgptFaq
      ];


      for (const candidate of candidates) {
        if (
          Array.isArray(
            candidate
          )
        ) {
          return candidate;
        }
      }


      return [];
    };


  /* =======================================================
     FIND INDEX ENTRY
     ======================================================= */

  const findIndexEntry = (
    item
  ) => {
    const generatedIndex =
      getGeneratedFaqIndex();


    if (!generatedIndex.length) {
      return null;
    }


    const itemId =
      item.id || "";


    if (itemId) {
      const byId =
        generatedIndex.find(
          (entry) =>
            entry &&
            entry.id ===
            itemId
        );


      if (byId) {
        return byId;
      }
    }


    const question =
      normalizeText(
        getQuestionText(
          item
        )
      );


    if (!question) {
      return null;
    }


    return (
      generatedIndex.find(
        (entry) =>
          normalizeText(
            entry &&
            entry.question
          ) === question
      ) ||
      null
    );
  };


  /* =======================================================
     ITEM SEARCH TEXT
     ======================================================= */

  const buildItemSearchText = (
    item,
    group
  ) => {
    const explicitSearch =
      item.getAttribute(
        "data-faq-search"
      ) || "";


    const question =
      getQuestionText(
        item
      );


    const answer =
      getAnswerText(
        item
      );


    const groupTitle =
      getGroupTitle(
        group
      );


    const indexEntry =
      findIndexEntry(
        item
      );


    const indexText =
      indexEntry
        ? [
            indexEntry.question,
            indexEntry.answer,
            indexEntry.groupTitle,
            indexEntry.groupEyebrow,
            indexEntry.searchText
          ]
            .filter(Boolean)
            .join(" ")
        : "";


    return normalizeText(
      [
        explicitSearch,
        question,
        answer,
        groupTitle,
        indexText
      ]
        .filter(Boolean)
        .join(" ")
    );
  };


  /* =======================================================
     CREATE FALLBACK ITEM ID
     ======================================================= */

  const createItemId = (
    item,
    index
  ) => {
    if (item.id) {
      return item.id;
    }


    const question =
      normalizeText(
        getQuestionText(
          item
        )
      );


    let slug =
      question
        .replace(
          /\s+/g,
          "-"
        )
        .replace(
          /[^a-z0-9-]/g,
          ""
        )
        .replace(
          /-+/g,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        );


    if (!slug) {
      slug =
        `faq-${index + 1}`;
    }


    let candidate =
      slug;


    let suffix = 2;


    while (
      document.getElementById(
        candidate
      )
    ) {
      candidate =
        `${slug}-${suffix}`;


      suffix += 1;
    }


    item.id =
      candidate;


    return candidate;
  };


  /* =======================================================
     ENHANCE ITEM
     ======================================================= */

  const enhanceItem = (
    item,
    group,
    index
  ) => {
    if (
      !(item instanceof HTMLElement)
    ) {
      return;
    }


    const id =
      createItemId(
        item,
        index
      );


    const question =
      getQuestionElement(
        item
      );


    const answer =
      getAnswerElement(
        item
      );


    item.dataset.faqReady =
      "true";


    item.dataset.faqPosition =
      String(
        index + 1
      );


    item.dataset.faqSearchNormalized =
      buildItemSearchText(
        item,
        group
      );


    if (group.id) {
      item.dataset.faqGroup =
        group.id;
    }


    /*
     * Native <details>/<summary> already provides strong
     * accessibility semantics. We only add IDs/data hooks.
     */
    if (
      item.tagName ===
      "DETAILS"
    ) {
      if (
        question &&
        !question.id
      ) {
        question.id =
          `${id}-question`;
      }


      if (
        answer &&
        !answer.id
      ) {
        answer.id =
          `${id}-answer`;
      }


      if (
        question &&
        answer
      ) {
        question.setAttribute(
          "aria-controls",
          answer.id
        );
      }


      item.addEventListener(
        "toggle",
        () => {
          item.classList.toggle(
            "is-open",
            item.open
          );


          item.dataset.faqOpen =
            item.open
              ? "true"
              : "false";
        }
      );


      item.classList.toggle(
        "is-open",
        item.open
      );


      item.dataset.faqOpen =
        item.open
          ? "true"
          : "false";
    }
  };


  /* =======================================================
     PREPARE DOM
     ======================================================= */

  const prepareFaq = () => {
    groups =
      Array.from(
        document.querySelectorAll(
          GROUP_SELECTOR
        )
      );


    items = [];


    groups.forEach(
      (
        group,
        groupIndex
      ) => {
        const groupItems =
          Array.from(
            group.querySelectorAll(
              ITEM_SELECTOR
            )
          );


        group.dataset.faqGroupReady =
          "true";


        group.dataset.faqGroupPosition =
          String(
            groupIndex + 1
          );


        group.dataset.faqItemCount =
          String(
            groupItems.length
          );


        groupItems.forEach(
          (item) => {
            const position =
              items.length;


            enhanceItem(
              item,
              group,
              position
            );


            items.push(
              item
            );
          }
        );
      }
    );


    html.dataset.faqReady =
      "true";


    html.dataset.faqCount =
      String(
        items.length
      );


    html.dataset.faqGroupCount =
      String(
        groups.length
      );
  };


  /* =======================================================
     ITEM MATCH
     ======================================================= */

  const itemMatchesQuery = (
    item,
    normalizedQuery
  ) => {
    if (!normalizedQuery) {
      return true;
    }


    const searchable =
      item.dataset
        .faqSearchNormalized ||
      normalizeText(
        item.textContent
      );


    if (
      searchable.includes(
        normalizedQuery
      )
    ) {
      return true;
    }


    const terms =
      normalizedQuery
        .split(" ")
        .filter(Boolean);


    return terms.every(
      (term) =>
        searchable.includes(
          term
        )
    );
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
     UPDATE NO RESULTS
     ======================================================= */

  const updateNoResults = (
    visibleCount,
    hasQuery
  ) => {
    if (!noResults) {
      return;
    }


    const show =
      hasQuery &&
      visibleCount === 0;


    noResults.hidden =
      !show;


    noResults.setAttribute(
      "aria-hidden",
      show
        ? "false"
        : "true"
    );
  };


  /* =======================================================
     UPDATE STATUS
     ======================================================= */

  const updateStatus = (
    visibleCount,
    query
  ) => {
    if (!searchStatus) {
      return;
    }


    if (!query) {
      searchStatus.textContent =
        items.length === 1
          ? "1 FAQ question"
          : `${items.length} FAQ questions`;


      return;
    }


    if (
      visibleCount === 0
    ) {
      searchStatus.textContent =
        "No matching FAQ questions";


      return;
    }


    searchStatus.textContent =
      visibleCount === 1
        ? "1 matching FAQ question"
        : `${visibleCount} matching FAQ questions`;
  };


  /* =======================================================
     GROUP VISIBILITY
     ======================================================= */

  const updateGroupVisibility = (
    group
  ) => {
    const groupItems =
      Array.from(
        group.querySelectorAll(
          ITEM_SELECTOR
        )
      );


    const visibleItems =
      groupItems.filter(
        (item) =>
          !item.hidden
      );


    const visible =
      visibleItems.length > 0;


    group.hidden =
      !visible;


    group.setAttribute(
      "aria-hidden",
      visible
        ? "false"
        : "true"
    );


    group.dataset.visibleFaqItems =
      String(
        visibleItems.length
      );


    group.dataset.faqGroupVisible =
      visible
        ? "true"
        : "false";
  };


  /* =======================================================
     APPLY FILTER
     ======================================================= */

  const applyFilter = (
    rawQuery =
      searchInput
        ? searchInput.value
        : ""
  ) => {
    const query =
      String(
        rawQuery || ""
      );


    const normalizedQuery =
      normalizeText(
        query
      );


    currentQuery =
      normalizedQuery;


    let visibleCount = 0;


    items.forEach(
      (item) => {
        const matches =
          itemMatchesQuery(
            item,
            normalizedQuery
          );


        item.hidden =
          !matches;


        item.setAttribute(
          "aria-hidden",
          matches
            ? "false"
            : "true"
        );


        item.classList.toggle(
          "is-search-match",
          Boolean(
            normalizedQuery &&
            matches
          )
        );


        if (matches) {
          visibleCount += 1;
        }


        /*
         * When searching, opening matched FAQ items makes
         * the matching answer immediately visible.
         */
        if (
          normalizedQuery &&
          matches &&
          item.tagName ===
            "DETAILS"
        ) {
          item.open =
            true;
        }


        /*
         * Close filtered-out items so stale expanded content
         * does not remain visually active.
         */
        if (
          normalizedQuery &&
          !matches &&
          item.tagName ===
            "DETAILS"
        ) {
          item.open =
            false;
        }
      }
    );


    groups.forEach(
      updateGroupVisibility
    );


    const hasQuery =
      normalizedQuery.length > 0;


    updateClearButton(
      hasQuery
    );


    updateNoResults(
      visibleCount,
      hasQuery
    );


    updateStatus(
      visibleCount,
      normalizedQuery
    );


    html.classList.toggle(
      "faq-search-active",
      hasQuery
    );


    html.dataset.faqSearchActive =
      hasQuery
        ? "true"
        : "false";


    html.dataset.faqVisibleCount =
      String(
        visibleCount
      );


    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:faq-search",
          {
            detail: {
              query,

              normalizedQuery,

              visibleCount,

              totalCount:
                items.length
            }
          }
        )
      );
    } catch {
      /* No action required. */
    }


    return items.filter(
      (item) =>
        !item.hidden
    );
  };


  /* =======================================================
     CLEAR SEARCH
     ======================================================= */

  const clearSearch = (
    {
      focus = true,
      collapse = false
    } = {}
  ) => {
    if (searchInput) {
      searchInput.value =
        "";
    }


    currentQuery =
      "";


    applyFilter(
      ""
    );


    if (collapse) {
      collapseAll();
    }


    if (
      focus &&
      searchInput
    ) {
      try {
        searchInput.focus({
          preventScroll: true
        });
      } catch {
        searchInput.focus();
      }
    }
  };


  /* =======================================================
     OPEN ITEM
     ======================================================= */

  const openItem = (
    item,
    {
      scroll = false,
      focus = false
    } = {}
  ) => {
    if (!item) {
      return false;
    }


    if (
      item.tagName ===
      "DETAILS"
    ) {
      item.open =
        true;
    }


    item.classList.add(
      "is-open"
    );


    item.dataset.faqOpen =
      "true";


    if (scroll) {
      item.scrollIntoView({
        behavior:
          prefersReducedMotion()
            ? "auto"
            : "smooth",

        block:
          "start"
      });
    }


    if (focus) {
      const question =
        getQuestionElement(
          item
        );


      if (
        question instanceof
        HTMLElement
      ) {
        try {
          question.focus({
            preventScroll: true
          });
        } catch {
          question.focus();
        }
      }
    }


    return true;
  };


  /* =======================================================
     CLOSE ITEM
     ======================================================= */

  const closeItem = (
    item
  ) => {
    if (!item) {
      return false;
    }


    if (
      item.tagName ===
      "DETAILS"
    ) {
      item.open =
        false;
    }


    item.classList.remove(
      "is-open"
    );


    item.dataset.faqOpen =
      "false";


    return true;
  };


  /* =======================================================
     EXPAND ALL
     ======================================================= */

  function expandAll({
    visibleOnly = false
  } = {}) {
    items.forEach(
      (item) => {
        if (
          visibleOnly &&
          item.hidden
        ) {
          return;
        }


        openItem(
          item
        );
      }
    );


    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:faq-expand-all"
        )
      );
    } catch {
      /* No action required. */
    }
  }


  /* =======================================================
     COLLAPSE ALL
     ======================================================= */

  function collapseAll({
    visibleOnly = false
  } = {}) {
    items.forEach(
      (item) => {
        if (
          visibleOnly &&
          item.hidden
        ) {
          return;
        }


        closeItem(
          item
        );
      }
    );


    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:faq-collapse-all"
        )
      );
    } catch {
      /* No action required. */
    }
  }


  /* =======================================================
     FIND FAQ BY ID
     ======================================================= */

  const findItemById = (
    id
  ) => {
    const cleanId =
      String(
        id || ""
      )
        .replace(
          /^#/,
          ""
        )
        .trim();


    if (!cleanId) {
      return null;
    }


    const direct =
      document.getElementById(
        cleanId
      );


    if (
      direct &&
      direct.matches(
        ITEM_SELECTOR
      )
    ) {
      return direct;
    }


    if (direct) {
      return direct.closest(
        ITEM_SELECTOR
      );
    }


    return null;
  };


  /* =======================================================
     FIND FAQ BY QUESTION
     ======================================================= */

  const findItemByQuestion = (
    question
  ) => {
    const wanted =
      normalizeText(
        question
      );


    if (!wanted) {
      return null;
    }


    return (
      items.find(
        (item) =>
          normalizeText(
            getQuestionText(
              item
            )
          ) === wanted
      ) ||
      null
    );
  };


  /* =======================================================
     OPEN CURRENT HASH
     ======================================================= */

  const openHashTarget = (
    {
      scroll = false
    } = {}
  ) => {
    const id =
      decodeHash(
        window.location.hash
      );


    if (!id) {
      return false;
    }


    const directTarget =
      document.getElementById(
        id
      );


    if (!directTarget) {
      return false;
    }


    const item =
      directTarget.matches(
        ITEM_SELECTOR
      )
        ? directTarget
        : directTarget.closest(
            ITEM_SELECTOR
          );


    if (item) {
      openItem(
        item,
        {
          scroll,
          focus: false
        }
      );


      const group =
        item.closest(
          GROUP_SELECTOR
        );


      if (group) {
        group.hidden =
          false;


        group.setAttribute(
          "aria-hidden",
          "false"
        );
      }


      return true;
    }


    /*
     * Hash may point to a whole FAQ group.
     */
    const group =
      directTarget.matches(
        GROUP_SELECTOR
      )
        ? directTarget
        : directTarget.closest(
            GROUP_SELECTOR
          );


    if (group) {
      group.hidden =
        false;


      group.setAttribute(
        "aria-hidden",
        "false"
      );


      if (scroll) {
        group.scrollIntoView({
          behavior:
            prefersReducedMotion()
              ? "auto"
              : "smooth",

          block:
            "start"
        });
      }


      return true;
    }


    return false;
  };


  /* =======================================================
     INPUT
     ======================================================= */

  const handleSearchInput = () => {
    if (
      isComposing ||
      !searchInput
    ) {
      return;
    }


    applyFilter(
      searchInput.value
    );
  };


  /* =======================================================
     IME START
     ======================================================= */

  const handleCompositionStart =
    () => {
      isComposing =
        true;
    };


  /* =======================================================
     IME END
     ======================================================= */

  const handleCompositionEnd =
    () => {
      isComposing =
        false;


      if (searchInput) {
        applyFilter(
          searchInput.value
        );
      }
    };


  /* =======================================================
     SEARCH KEYBOARD
     ======================================================= */

  const handleSearchKeydown = (
    event
  ) => {
    if (
      event.key !==
      "Escape"
    ) {
      return;
    }


    if (
      searchInput &&
      searchInput.value.trim()
    ) {
      event.preventDefault();


      clearSearch({
        focus: true
      });


      return;
    }


    if (searchInput) {
      searchInput.blur();
    }
  };


  /* =======================================================
     NATIVE SEARCH
     ======================================================= */

  const handleNativeSearch =
    () => {
      if (
        !isComposing &&
        searchInput
      ) {
        applyFilter(
          searchInput.value
        );
      }
    };


  /* =======================================================
     CLEAR BUTTON
     ======================================================= */

  const handleClearClick = (
    event
  ) => {
    event.preventDefault();


    clearSearch({
      focus: true
    });
  };


  /* =======================================================
     EXPAND ALL CONTROL
     ======================================================= */

  const handleExpandAllClick = (
    event
  ) => {
    event.preventDefault();


    expandAll({
      visibleOnly:
        Boolean(
          currentQuery
        )
    });
  };


  /* =======================================================
     COLLAPSE ALL CONTROL
     ======================================================= */

  const handleCollapseAllClick = (
    event
  ) => {
    event.preventDefault();


    collapseAll({
      visibleOnly:
        Boolean(
          currentQuery
        )
    });
  };


  /* =======================================================
     HASH CHANGE
     ======================================================= */

  const handleHashChange =
    () => {
      openHashTarget({
        scroll: true
      });
    };


  /* =======================================================
     DETAILS HASH UPDATE
     ======================================================= */

  const initializeItemHashBehavior =
    () => {
      items.forEach(
        (item) => {
          if (
            item.tagName !==
            "DETAILS"
          ) {
            return;
          }


          const summary =
            item.querySelector(
              "summary"
            );


          if (!summary) {
            return;
          }


          summary.addEventListener(
            "click",
            () => {
              /*
               * Do not alter the URL automatically here.
               * Native FAQ interaction should remain clean,
               * while direct deep links continue to work.
               */
            }
          );
        }
      );
    };


  /* =======================================================
     SETUP SEARCH
     ======================================================= */

  const initializeSearch = () => {
    searchInput =
      findFirst(
        SEARCH_INPUT_SELECTORS
      );


    clearButton =
      findFirst(
        CLEAR_BUTTON_SELECTORS
      );


    searchStatus =
      findFirst(
        STATUS_SELECTORS
      );


    noResults =
      findFirst(
        NO_RESULTS_SELECTORS
      );


    if (!searchInput) {
      updateStatus(
        items.length,
        ""
      );


      return;
    }


    searchInput.setAttribute(
      "autocomplete",
      "off"
    );


    searchInput.setAttribute(
      "spellcheck",
      "false"
    );


    searchInput.setAttribute(
      "autocapitalize",
      "none"
    );


    searchInput.setAttribute(
      "autocorrect",
      "off"
    );


    searchInput.setAttribute(
      "aria-label",
      searchInput.getAttribute(
        "aria-label"
      ) ||
      "Search frequently asked questions"
    );


    if (
      searchStatus &&
      searchStatus.id
    ) {
      const existing =
        (
          searchInput.getAttribute(
            "aria-describedby"
          ) || ""
        )
          .split(/\s+/)
          .filter(Boolean);


      if (
        !existing.includes(
          searchStatus.id
        )
      ) {
        existing.push(
          searchStatus.id
        );


        searchInput.setAttribute(
          "aria-describedby",
          existing.join(" ")
        );
      }
    }


    searchInput.addEventListener(
      "input",
      handleSearchInput
    );


    searchInput.addEventListener(
      "search",
      handleNativeSearch
    );


    searchInput.addEventListener(
      "keydown",
      handleSearchKeydown
    );


    searchInput.addEventListener(
      "compositionstart",
      handleCompositionStart
    );


    searchInput.addEventListener(
      "compositionend",
      handleCompositionEnd
    );


    if (clearButton) {
      clearButton.addEventListener(
        "click",
        handleClearClick
      );
    }


    applyFilter(
      searchInput.value
    );
  };


  /* =======================================================
     SETUP GLOBAL FAQ CONTROLS
     ======================================================= */

  const initializeControls =
    () => {
      expandAllButtons =
        findAll(
          EXPAND_ALL_SELECTORS
        );


      collapseAllButtons =
        findAll(
          COLLAPSE_ALL_SELECTORS
        );


      expandAllButtons.forEach(
        (button) => {
          button.addEventListener(
            "click",
            handleExpandAllClick
          );
        }
      );


      collapseAllButtons.forEach(
        (button) => {
          button.addEventListener(
            "click",
            handleCollapseAllClick
          );
        }
      );
    };


  /* =======================================================
     REFRESH
     ======================================================= */

  const refresh = () => {
    prepareFaq();


    if (searchInput) {
      applyFilter(
        searchInput.value
      );
    }


    openHashTarget({
      scroll: false
    });


    return [
      ...items
    ];
  };


  /* =======================================================
     READY EVENT
     ======================================================= */

  const dispatchReadyEvent =
    () => {
      try {
        document.dispatchEvent(
          new CustomEvent(
            "salimgpt:faq-ready",
            {
              detail: {
                groupCount:
                  groups.length,

                questionCount:
                  items.length
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
      refresh();

      return;
    }


    initialized =
      true;


    prepareFaq();


    initializeSearch();


    initializeControls();


    initializeItemHashBehavior();


    openHashTarget({
      scroll: false
    });


    window.addEventListener(
      "hashchange",
      handleHashChange
    );


    dispatchReadyEvent();
  };


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.SalimGPTFAQ = {

    initialize() {
      initialize();
    },


    refresh() {
      return refresh();
    },


    search(query) {
      if (searchInput) {
        searchInput.value =
          String(
            query || ""
          );
      }


      return applyFilter(
        query
      );
    },


    clear(options = {}) {
      clearSearch(
        options
      );
    },


    expandAll(options = {}) {
      expandAll(
        options
      );
    },


    collapseAll(options = {}) {
      collapseAll(
        options
      );
    },


    open(id, options = {}) {
      const item =
        findItemById(
          id
        );


      if (!item) {
        return false;
      }


      return openItem(
        item,
        options
      );
    },


    close(id) {
      const item =
        findItemById(
          id
        );


      if (!item) {
        return false;
      }


      return closeItem(
        item
      );
    },


    findById(id) {
      return findItemById(
        id
      );
    },


    findByQuestion(question) {
      return findItemByQuestion(
        question
      );
    },


    getItems() {
      return [
        ...items
      ];
    },


    getVisibleItems() {
      return items.filter(
        (item) =>
          !item.hidden
      );
    },


    getGroups() {
      return [
        ...groups
      ];
    },


    getQuery() {
      return searchInput
        ? searchInput.value
        : "";
    },


    getNormalizedQuery() {
      return currentQuery;
    },


    getCounts() {
      return {
        groups:
          groups.length,

        total:
          items.length,

        visible:
          items.filter(
            (item) =>
              !item.hidden
          ).length,

        open:
          items.filter(
            (item) =>
              item.tagName ===
                "DETAILS" &&
              item.open
          ).length
      };
    },


    openCurrentHash(options = {}) {
      return openHashTarget(
        options
      );
    },


    normalize(value) {
      return normalizeText(
        value
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
