"use strict";

/* =========================================================
   SalimGPT Global
   File: js/language-cards.js

   Language Edition Card Controller

   Works with:
   - #languageGrid
   - [data-language-card]
   - .language-edition-card
   - .language-edition-link
   - .language-edition-code
   - .language-edition-status
   - .language-edition-content
   - .language-edition-footer
   - .languages-count

   Responsibilities:
   - Enhance language cards
   - Distinguish available / upcoming editions
   - Apply correct LTR / RTL language direction
   - Improve accessibility
   - Validate available-edition links
   - Keep edition counts synchronized
   - Add useful card metadata
   - Support optional data/languages.js
   - Render from data only if the HTML grid is empty
   - Never perform automatic language redirects
   - Expose a public SalimGPTLanguageCards API

   No external dependencies.
   ========================================================= */

(() => {

  /* =======================================================
     CONFIG
     ======================================================= */

  const GRID_ID =
    "languageGrid";


  const CARD_SELECTOR =
    "[data-language-card]";


  const AVAILABLE_CLASS =
    "is-available";


  const UPCOMING_CLASS =
    "is-upcoming";


  const RTL_LANGUAGE_CODES =
    new Set([
      "ar",
      "ur",
      "fa",
      "he",
      "ps"
    ]);


  /*
   * Confirmed SalimGPT language editions.

   * These values are used only for validating the three
   * currently available global-edition links.
   *
   * Upcoming languages are deliberately not assigned URLs.
   */
  const OFFICIAL_AVAILABLE_EDITIONS = {
    bn:
      "https://salimgpt.github.io/salimgpt-bn/",

    en:
      "https://salimgpt.github.io/salimgpt-en/",

    hi:
      "https://salimgpt.github.io/salimgpt-hi/"
  };


  /* =======================================================
     ELEMENTS
     ======================================================= */

  const grid =
    document.getElementById(
      GRID_ID
    );


  /* =======================================================
     PAGE GUARD
     ======================================================= */

  if (!grid) {
    return;
  }


  /* =======================================================
     STATE
     ======================================================= */

  let cards = [];

  let initialized =
    false;


  /* =======================================================
     NORMALIZE TEXT
     ======================================================= */

  const normalizeText = (
    value
  ) => {
    return String(
      value || ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  };


  /* =======================================================
     NORMALIZE LANGUAGE CODE
     ======================================================= */

  const normalizeLanguageCode = (
    value
  ) => {
    return normalizeText(
      value
    )
      .toLowerCase()
      .replace(
        /_/g,
        "-"
      );
  };


  /* =======================================================
     GET PRIMARY LANGUAGE CODE
     ======================================================= */

  const getPrimaryLanguageCode = (
    value
  ) => {
    const code =
      normalizeLanguageCode(
        value
      );


    return code
      .split("-")[0] || "";
  };


  /* =======================================================
     LANGUAGE DIRECTION
     ======================================================= */

  const getLanguageDirection = (
    languageCode
  ) => {
    const primaryCode =
      getPrimaryLanguageCode(
        languageCode
      );


    return RTL_LANGUAGE_CODES.has(
      primaryCode
    )
      ? "rtl"
      : "ltr";
  };


  /* =======================================================
     CARD ELEMENTS
     ======================================================= */

  const getCardLink = (
    card
  ) => {
    return card.querySelector(
      ".language-edition-link"
    );
  };


  const getCardHeading = (
    card
  ) => {
    return card.querySelector(
      ".language-edition-content h3"
    );
  };


  const getCardDescription = (
    card
  ) => {
    return card.querySelector(
      ".language-edition-content p"
    );
  };


  const getCardCodeElement = (
    card
  ) => {
    return card.querySelector(
      ".language-edition-code"
    );
  };


  const getCardStatusElement = (
    card
  ) => {
    return card.querySelector(
      ".language-edition-status"
    );
  };


  const getCardContent = (
    card
  ) => {
    return card.querySelector(
      ".language-edition-content"
    );
  };


  const getCardFooter = (
    card
  ) => {
    return card.querySelector(
      ".language-edition-footer"
    );
  };


  /* =======================================================
     CARD STATUS
     ======================================================= */

  const getCardStatus = (
    card
  ) => {
    if (
      card.classList.contains(
        AVAILABLE_CLASS
      )
    ) {
      return "available";
    }


    if (
      card.classList.contains(
        UPCOMING_CLASS
      )
    ) {
      return "upcoming";
    }


    const statusElement =
      getCardStatusElement(
        card
      );


    const statusText =
      normalizeText(
        statusElement
          ? statusElement.textContent
          : ""
      )
        .toLowerCase();


    if (
      statusText.includes(
        "available"
      )
    ) {
      return "available";
    }


    if (
      statusText.includes(
        "upcoming"
      ) ||
      statusText.includes(
        "coming soon"
      )
    ) {
      return "upcoming";
    }


    return "unknown";
  };


  /* =======================================================
     LANGUAGE CODE
     ======================================================= */

  const getCardLanguageCode = (
    card
  ) => {
    const lang =
      card.getAttribute(
        "lang"
      );


    if (lang) {
      return normalizeLanguageCode(
        lang
      );
    }


    const link =
      getCardLink(
        card
      );


    if (link) {
      const hreflang =
        link.getAttribute(
          "hreflang"
        );


      if (hreflang) {
        return normalizeLanguageCode(
          hreflang
        );
      }
    }


    const codeElement =
      getCardCodeElement(
        card
      );


    if (codeElement) {
      return normalizeLanguageCode(
        codeElement.textContent
      );
    }


    return "";
  };


  /* =======================================================
     LANGUAGE NAME
     ======================================================= */

  const getCardLanguageName = (
    card
  ) => {
    const heading =
      getCardHeading(
        card
      );


    return normalizeText(
      heading
        ? heading.textContent
        : ""
    );
  };


  /* =======================================================
     LANGUAGE DESCRIPTION
     ======================================================= */

  const getCardDescriptionText = (
    card
  ) => {
    const description =
      getCardDescription(
        card
      );


    return normalizeText(
      description
        ? description.textContent
        : ""
    );
  };


  /* =======================================================
     CARD URL
     ======================================================= */

  const getCardUrl = (
    card
  ) => {
    const link =
      getCardLink(
        card
      );


    if (
      !link ||
      link.tagName.toLowerCase() !==
        "a"
    ) {
      return "";
    }


    const href =
      link.getAttribute(
        "href"
      );


    if (!href) {
      return "";
    }


    try {
      return new URL(
        href,
        window.location.href
      ).href;
    } catch {
      return "";
    }
  };


  /* =======================================================
     IS AVAILABLE
     ======================================================= */

  const isAvailableCard = (
    card
  ) => {
    return (
      getCardStatus(
        card
      ) === "available"
    );
  };


  /* =======================================================
     IS UPCOMING
     ======================================================= */

  const isUpcomingCard = (
    card
  ) => {
    return (
      getCardStatus(
        card
      ) === "upcoming"
    );
  };


  /* =======================================================
     VALIDATE AVAILABLE EDITION URL
     ======================================================= */

  const validateEditionUrl = (
    card
  ) => {
    if (
      !isAvailableCard(
        card
      )
    ) {
      return true;
    }


    const languageCode =
      getPrimaryLanguageCode(
        getCardLanguageCode(
          card
        )
      );


    const expectedUrl =
      OFFICIAL_AVAILABLE_EDITIONS[
        languageCode
      ];


    /*
     * A language not present in the current official map is
     * not blocked. This makes future editions possible
     * without requiring immediate script changes.
     */
    if (!expectedUrl) {
      return true;
    }


    const actualUrl =
      getCardUrl(
        card
      );


    if (!actualUrl) {
      card.dataset.editionLinkValid =
        "false";


      return false;
    }


    let normalizedActual;
    let normalizedExpected;


    try {
      normalizedActual =
        new URL(
          actualUrl
        ).href;


      normalizedExpected =
        new URL(
          expectedUrl
        ).href;
    } catch {
      card.dataset.editionLinkValid =
        "false";


      return false;
    }


    const valid =
      normalizedActual ===
      normalizedExpected;


    card.dataset.editionLinkValid =
      valid
        ? "true"
        : "false";


    return valid;
  };


  /* =======================================================
     APPLY LANGUAGE DIRECTION
     ======================================================= */

  const applyLanguageDirection = (
    card
  ) => {
    const languageCode =
      getCardLanguageCode(
        card
      );


    const direction =
      getLanguageDirection(
        languageCode
      );


    card.dataset.languageDirection =
      direction;


    const content =
      getCardContent(
        card
      );


    if (content) {
      content.setAttribute(
        "dir",
        direction
      );
    }


    /*
     * Keep the structural card layout LTR so code/status
     * badges and logo positions remain visually consistent.
     *
     * Only language copy uses its natural reading direction.
     */
    const footer =
      getCardFooter(
        card
      );


    if (
      footer &&
      direction === "rtl" &&
      !footer.classList.contains(
        "muted"
      )
    ) {
      footer.setAttribute(
        "dir",
        "rtl"
      );
    }
  };


  /* =======================================================
     AVAILABLE CARD ACCESSIBILITY
     ======================================================= */

  const enhanceAvailableCard = (
    card
  ) => {
    const link =
      getCardLink(
        card
      );


    if (!link) {
      return;
    }


    const languageName =
      getCardLanguageName(
        card
      );


    const languageCode =
      getCardLanguageCode(
        card
      );


    if (
      link.tagName.toLowerCase() ===
      "a"
    ) {
      if (
        !link.getAttribute(
          "aria-label"
        ) &&
        languageName
      ) {
        link.setAttribute(
          "aria-label",
          `Open the ${languageName} SalimGPT edition`
        );
      }


      if (
        languageCode &&
        !link.getAttribute(
          "hreflang"
        )
      ) {
        link.setAttribute(
          "hreflang",
          languageCode
        );
      }


      link.removeAttribute(
        "aria-disabled"
      );
    }


    card.dataset.languageStatus =
      "available";
  };


  /* =======================================================
     UPCOMING CARD ACCESSIBILITY
     ======================================================= */

  const enhanceUpcomingCard = (
    card
  ) => {
    const surface =
      getCardLink(
        card
      );


    if (!surface) {
      return;
    }


    const languageName =
      getCardLanguageName(
        card
      );


    /*
     * Upcoming editions are informational cards.
     * They must not behave like clickable links.
     */
    surface.setAttribute(
      "aria-disabled",
      "true"
    );


    /*
     * Non-interactive <div> cards should not accidentally
     * enter keyboard navigation.
     */
    if (
      surface.tagName.toLowerCase() !==
      "a"
    ) {
      surface.removeAttribute(
        "tabindex"
      );


      surface.setAttribute(
        "role",
        "group"
      );


      if (
        languageName &&
        !surface.getAttribute(
          "aria-label"
        )
      ) {
        surface.setAttribute(
          "aria-label",
          `${languageName} SalimGPT edition — coming soon`
        );
      }
    }


    card.dataset.languageStatus =
      "upcoming";
  };


  /* =======================================================
     STATUS BADGE
     ======================================================= */

  const enhanceStatusBadge = (
    card
  ) => {
    const statusElement =
      getCardStatusElement(
        card
      );


    if (!statusElement) {
      return;
    }


    const status =
      getCardStatus(
        card
      );


    if (
      status === "available"
    ) {
      statusElement.classList.add(
        "available"
      );


      statusElement.classList.remove(
        "upcoming"
      );


      return;
    }


    if (
      status === "upcoming"
    ) {
      statusElement.classList.add(
        "upcoming"
      );


      statusElement.classList.remove(
        "available"
      );
    }
  };


  /* =======================================================
     CARD METADATA
     ======================================================= */

  const applyCardMetadata = (
    card,
    position
  ) => {
    const languageCode =
      getCardLanguageCode(
        card
      );


    const languageName =
      getCardLanguageName(
        card
      );


    const description =
      getCardDescriptionText(
        card
      );


    const statusValue =
      getCardStatus(
        card
      );


    if (languageCode) {
      card.dataset.languageCode =
        languageCode;
    }


    if (languageName) {
      card.dataset.languageName =
        languageName;
    }


    if (description) {
      card.dataset.languageDescription =
        description;
    }


    card.dataset.languageStatus =
      statusValue;


    card.dataset.languagePosition =
      String(
        position + 1
      );
  };


  /* =======================================================
     ENHANCE CARD
     ======================================================= */

  const enhanceCard = (
    card,
    position
  ) => {
    if (
      !(card instanceof HTMLElement)
    ) {
      return;
    }


    applyCardMetadata(
      card,
      position
    );


    applyLanguageDirection(
      card
    );


    enhanceStatusBadge(
      card
    );


    if (
      isAvailableCard(
        card
      )
    ) {
      enhanceAvailableCard(
        card
      );


      validateEditionUrl(
        card
      );
    } else if (
      isUpcomingCard(
        card
      )
    ) {
      enhanceUpcomingCard(
        card
      );
    }


    card.dataset.languageCardReady =
      "true";
  };


  /* =======================================================
     EDITION COUNTS
     ======================================================= */

  const getCounts = () => {
    const available =
      cards.filter(
        isAvailableCard
      ).length;


    const upcoming =
      cards.filter(
        isUpcomingCard
      ).length;


    return {
      total:
        cards.length,

      available,

      upcoming
    };
  };


  /* =======================================================
     UPDATE AVAILABLE COUNT BADGE
     ======================================================= */

  const updateCountBadge = () => {
    const countBadges =
      document.querySelectorAll(
        ".languages-group .languages-count"
      );


    if (!countBadges.length) {
      return;
    }


    const counts =
      getCounts();


    /*
     * The current language directory places both available
     * and upcoming cards inside one grid, while the visible
     * group header describes the official editions available
     * now. Therefore the badge reflects available editions.
     */
    const label =
      counts.available === 1
        ? "Edition"
        : "Editions";


    countBadges.forEach(
      (badge) => {
        badge.textContent =
          `${counts.available} ${label}`;


        badge.setAttribute(
          "aria-label",
          `${counts.available} language ${label.toLowerCase()} available now`
        );
      }
    );
  };


  /* =======================================================
     OPTIONAL DATA SOURCE
     ======================================================= */

  const getLanguageData = () => {
    const candidates = [
      window.SALIMGPT_LANGUAGES,
      window.salimgptLanguages,
      window.SalimGPTLanguages
    ];


    for (const candidate of candidates) {
      if (
        Array.isArray(
          candidate
        )
      ) {
        return candidate;
      }


      if (
        candidate &&
        Array.isArray(
          candidate.languages
        )
      ) {
        return candidate.languages;
      }
    }


    return [];
  };


  /* =======================================================
     ESCAPE ATTRIBUTE
     ======================================================= */

  const escapeAttribute = (
    value
  ) => {
    return String(
      value || ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      );
  };


  /* =======================================================
     ESCAPE TEXT
     ======================================================= */

  const escapeHtml = (
    value
  ) => {
    return String(
      value || ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#39;"
      );
  };


  /* =======================================================
     NORMALIZE DATA STATUS
     ======================================================= */

  const normalizeDataStatus = (
    value
  ) => {
    const status =
      normalizeText(
        value
      )
        .toLowerCase();


    return status ===
      "available"
      ? "available"
      : "upcoming";
  };


  /* =======================================================
     DATA SEARCH TERMS
     ======================================================= */

  const createSearchTerms = (
    language
  ) => {
    const terms = [];


    [
      language.name,
      language.nativeName,
      language.englishName,
      language.code
    ].forEach(
      (value) => {
        if (value) {
          terms.push(
            normalizeText(
              value
            )
          );
        }
      }
    );


    if (
      Array.isArray(
        language.searchTerms
      )
    ) {
      language.searchTerms.forEach(
        (term) => {
          if (term) {
            terms.push(
              normalizeText(
                term
              )
            );
          }
        }
      );
    }


    return Array.from(
      new Set(
        terms.filter(Boolean)
      )
    ).join(" ");
  };


  /* =======================================================
     RENDER CARD FROM DATA
     ======================================================= */

  const createCardFromData = (
    language
  ) => {
    const code =
      normalizeLanguageCode(
        language.code
      );


    const primaryCode =
      getPrimaryLanguageCode(
        code
      );


    const name =
      normalizeText(
        language.nativeName ||
        language.name ||
        language.englishName ||
        code.toUpperCase()
      );


    const description =
      normalizeText(
        language.description ||
        language.tagline ||
        ""
      );


    const status =
      normalizeDataStatus(
        language.status
      );


    const available =
      status === "available";


    const searchTerms =
      createSearchTerms(
        language
      );


    const actionLabel =
      normalizeText(
        language.actionLabel ||
        (
          available
            ? `Explore ${name} Edition`
            : "Coming Soon"
        )
      );


    const dataUrl =
      normalizeText(
        language.url
      );


    const officialUrl =
      OFFICIAL_AVAILABLE_EDITIONS[
        primaryCode
      ] || "";


    const url =
      available
        ? (
            dataUrl ||
            officialUrl
          )
        : "";


    const card =
      document.createElement(
        "article"
      );


    card.className =
      `language-edition-card ${
        available
          ? AVAILABLE_CLASS
          : UPCOMING_CLASS
      }`;


    card.setAttribute(
      "data-language-card",
      ""
    );


    if (searchTerms) {
      card.setAttribute(
        "data-language-search",
        searchTerms
      );
    }


    if (code) {
      card.setAttribute(
        "lang",
        code
      );
    }


    const safeName =
      escapeHtml(
        name
      );


    const safeDescription =
      escapeHtml(
        description
      );


    const safeCode =
      escapeHtml(
        code.toUpperCase()
      );


    const safeActionLabel =
      escapeHtml(
        actionLabel
      );


    const logoMarkup =
      `
        <img
          class="language-edition-logo"
          src="../assets/brand/logo.svg"
          alt=""
          width="72"
          height="72"
          loading="lazy"
          aria-hidden="true"
        >
      `;


    const innerMarkup =
      `
        <div class="language-edition-header">

          <span class="language-edition-code">
            ${safeCode}
          </span>

          <span class="language-edition-status ${available ? "available" : "upcoming"}">
            ${available ? "Available" : "Upcoming"}
          </span>

        </div>

        <div class="language-edition-main">

          <div class="language-edition-content">

            <h3>
              ${safeName}
            </h3>

            ${
              safeDescription
                ? `
                  <p>
                    ${safeDescription}
                  </p>
                `
                : ""
            }

          </div>

          ${logoMarkup}

        </div>

        <div class="language-edition-footer${available ? "" : " muted"}">

          <span>
            ${safeActionLabel}
          </span>

          ${
            available
              ? `
                <span aria-hidden="true">
                  →
                </span>
              `
              : ""
          }

        </div>
      `;


    if (
      available &&
      url
    ) {
      card.innerHTML =
        `
          <a
            class="language-edition-link"
            href="${escapeAttribute(url)}"
            hreflang="${escapeAttribute(code)}"
          >
            ${innerMarkup}
          </a>
        `;
    } else {
      card.innerHTML =
        `
          <div
            class="language-edition-link"
            aria-disabled="true"
          >
            ${innerMarkup}
          </div>
        `;
    }


    return card;
  };


  /* =======================================================
     RENDER DATA ONLY WHEN GRID IS EMPTY
     ======================================================= */

  const renderFromDataIfNeeded = () => {
    const existingCards =
      grid.querySelectorAll(
        CARD_SELECTOR
      );


    if (
      existingCards.length > 0
    ) {
      return false;
    }


    const languageData =
      getLanguageData();


    if (
      !languageData.length
    ) {
      return false;
    }


    const fragment =
      document.createDocumentFragment();


    languageData.forEach(
      (language) => {
        if (
          !language ||
          typeof language !==
            "object"
        ) {
          return;
        }


        fragment.appendChild(
          createCardFromData(
            language
          )
        );
      }
    );


    grid.appendChild(
      fragment
    );


    return true;
  };


  /* =======================================================
     REFRESH CARD CACHE
     ======================================================= */

  const refreshCards = () => {
    cards =
      Array.from(
        grid.querySelectorAll(
          CARD_SELECTOR
        )
      );


    cards.forEach(
      (
        card,
        index
      ) => {
        enhanceCard(
          card,
          index
        );
      }
    );


    updateCountBadge();


    grid.dataset.languageCardsReady =
      "true";


    grid.dataset.languageCardCount =
      String(
        cards.length
      );


    const counts =
      getCounts();


    grid.dataset.availableLanguages =
      String(
        counts.available
      );


    grid.dataset.upcomingLanguages =
      String(
        counts.upcoming
      );


    return cards;
  };


  /* =======================================================
     FIND CARD
     ======================================================= */

  const findCardByCode = (
    languageCode
  ) => {
    const wanted =
      getPrimaryLanguageCode(
        languageCode
      );


    if (!wanted) {
      return null;
    }


    return (
      cards.find(
        (card) => {
          return (
            getPrimaryLanguageCode(
              getCardLanguageCode(
                card
              )
            ) === wanted
          );
        }
      ) ||
      null
    );
  };


  /* =======================================================
     CARD INFORMATION
     ======================================================= */

  const getCardInfo = (
    card
  ) => {
    if (!card) {
      return null;
    }


    return {
      code:
        getCardLanguageCode(
          card
        ),

      name:
        getCardLanguageName(
          card
        ),

      description:
        getCardDescriptionText(
          card
        ),

      status:
        getCardStatus(
          card
        ),

      direction:
        getLanguageDirection(
          getCardLanguageCode(
            card
          )
        ),

      url:
        getCardUrl(
          card
        ),

      visible:
        !card.hidden
    };
  };


  /* =======================================================
     DISPATCH READY EVENT
     ======================================================= */

  const dispatchReadyEvent = () => {
    const counts =
      getCounts();


    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:language-cards-ready",
          {
            detail: {
              total:
                counts.total,

              available:
                counts.available,

              upcoming:
                counts.upcoming
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
      refreshCards();

      return;
    }


    initialized =
      true;


    /*
     * The current page contains static HTML cards.
     *
     * data/languages.js support exists as a fallback only,
     * so static content remains crawlable and accessible.
     */
    renderFromDataIfNeeded();


    refreshCards();


    dispatchReadyEvent();
  };


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.SalimGPTLanguageCards = {

    initialize() {
      initialize();
    },


    refresh() {
      return refreshCards();
    },


    getCards() {
      return [
        ...cards
      ];
    },


    getAvailableCards() {
      return cards.filter(
        isAvailableCard
      );
    },


    getUpcomingCards() {
      return cards.filter(
        isUpcomingCard
      );
    },


    getVisibleCards() {
      return cards.filter(
        (card) =>
          !card.hidden
      );
    },


    getCounts() {
      return {
        ...getCounts()
      };
    },


    getCardByCode(
      languageCode
    ) {
      return findCardByCode(
        languageCode
      );
    },


    getLanguage(
      languageCode
    ) {
      return getCardInfo(
        findCardByCode(
          languageCode
        )
      );
    },


    getLanguages() {
      return cards
        .map(
          getCardInfo
        )
        .filter(Boolean);
    },


    isAvailable(
      languageCode
    ) {
      const card =
        findCardByCode(
          languageCode
        );


      return Boolean(
        card &&
        isAvailableCard(
          card
        )
      );
    },


    isUpcoming(
      languageCode
    ) {
      const card =
        findCardByCode(
          languageCode
        );


      return Boolean(
        card &&
        isUpcomingCard(
          card
        )
      );
    },


    getOfficialUrl(
      languageCode
    ) {
      const code =
        getPrimaryLanguageCode(
          languageCode
        );


      return (
        OFFICIAL_AVAILABLE_EDITIONS[
          code
        ] ||
        ""
      );
    },


    validateEdition(
      languageCode
    ) {
      const card =
        findCardByCode(
          languageCode
        );


      if (!card) {
        return false;
      }


      return validateEditionUrl(
        card
      );
    },


    /*
     * SalimGPT intentionally does not automatically redirect
     * visitors based on browser or device language.
     *
     * This method only returns information about a matching
     * edition. Navigation remains a user decision.
     */
    findEditionForLocale(
      locale
    ) {
      const code =
        getPrimaryLanguageCode(
          locale
        );


      const card =
        findCardByCode(
          code
        );


      if (!card) {
        return null;
      }


      return getCardInfo(
        card
      );
    }

  };


  /* =======================================================
     RUN
     ======================================================= */

  initialize();

})();