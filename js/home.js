/* =========================================================
   SalimGPT Global
   File: js/home.js

   Homepage-specific behavior.

   Handles:
   - Footer / side-menu current year
   - Smooth internal anchor navigation
   - Language-card accessibility
   - Upcoming-language status
   - Language-grid semantics
   - Official edition link metadata
   - Initial hash navigation

   Language search:
   js/language-search.js

   Side menu:
   js/menu.js
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     ELEMENTS
     ======================================================= */

  const footerYear =
    document.getElementById("footerYear");

  const menuYear =
    document.getElementById("menuYear");

  const languageGrid =
    document.getElementById("languageGrid");


  const availableLanguageCards =
    Array.from(
      document.querySelectorAll(
        ".language-card.is-available"
      )
    );


  const upcomingLanguageCards =
    Array.from(
      document.querySelectorAll(
        ".language-card.is-upcoming"
      )
    );


  /* =======================================================
     REDUCED MOTION
     ======================================================= */

  const prefersReducedMotion = () => {
    return window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  };


  /* =======================================================
     CURRENT YEAR
     ======================================================= */

  const setCurrentYear = () => {
    const currentYear =
      String(
        new Date().getFullYear()
      );


    if (footerYear) {
      footerYear.textContent =
        currentYear;
    }


    if (menuYear) {
      menuYear.textContent =
        currentYear;
    }
  };


  /* =======================================================
     INTERNAL ANCHOR LINKS
     ======================================================= */

  const initializeInternalAnchors = () => {
    const internalLinks =
      Array.from(
        document.querySelectorAll(
          'a[href^="#"]'
        )
      );


    internalLinks.forEach(
      (link) => {

        link.addEventListener(
          "click",
          (event) => {

            const href =
              link.getAttribute("href");


            if (
              !href ||
              href === "#"
            ) {
              return;
            }


            let targetId = "";


            try {
              targetId =
                decodeURIComponent(
                  href.slice(1)
                );
            } catch (error) {
              targetId =
                href.slice(1);
            }


            if (!targetId) {
              return;
            }


            const target =
              document.getElementById(
                targetId
              );


            if (!target) {
              return;
            }


            event.preventDefault();


            target.scrollIntoView({
              behavior:
                prefersReducedMotion()
                  ? "auto"
                  : "smooth",

              block: "start"
            });


            /*
             * Keep the URL hash updated without
             * forcing a page reload.
             */
            if (
              window.history &&
              typeof window.history.pushState ===
                "function"
            ) {
              window.history.pushState(
                null,
                "",
                `#${encodeURIComponent(
                  targetId
                )}`
              );
            }
          }
        );

      }
    );
  };


  /* =======================================================
     AVAILABLE LANGUAGE CARDS
     ======================================================= */

  const initializeAvailableLanguageCards = () => {
    availableLanguageCards.forEach(
      (card) => {

        const link =
          card.querySelector(
            "a.language-card-link"
          );


        const heading =
          card.querySelector(
            ".language-card-content h3"
          ) ||
          card.querySelector("h3");


        if (
          !link ||
          !heading
        ) {
          return;
        }


        const languageName =
          heading.textContent.trim();


        if (
          languageName &&
          !link.hasAttribute(
            "aria-label"
          )
        ) {
          link.setAttribute(
            "aria-label",
            `Explore the SalimGPT ${languageName} edition`
          );
        }

      }
    );
  };


  /* =======================================================
     UPCOMING LANGUAGE CARDS
     ======================================================= */

  const initializeUpcomingLanguageCards = () => {
    upcomingLanguageCards.forEach(
      (card) => {

        const cardBody =
          card.querySelector(
            ".language-card-link"
          );


        const heading =
          card.querySelector(
            ".language-card-content h3"
          ) ||
          card.querySelector("h3");


        if (!cardBody) {
          return;
        }


        /*
         * Upcoming cards are intentionally
         * non-interactive.
         */
        cardBody.setAttribute(
          "aria-disabled",
          "true"
        );


        if (
          cardBody instanceof HTMLElement
        ) {
          cardBody.removeAttribute(
            "tabindex"
          );
        }


        if (
          heading &&
          !cardBody.hasAttribute(
            "aria-label"
          )
        ) {
          const languageName =
            heading.textContent.trim();


          if (languageName) {
            cardBody.setAttribute(
              "aria-label",
              `${languageName} SalimGPT edition — coming soon`
            );
          }
        }

      }
    );
  };


  /* =======================================================
     LANGUAGE GRID SEMANTICS
     ======================================================= */

  const initializeLanguageGrid = () => {
    if (!languageGrid) {
      return;
    }


    if (
      !languageGrid.hasAttribute(
        "aria-label"
      )
    ) {
      languageGrid.setAttribute(
        "aria-label",
        "Official SalimGPT language editions"
      );
    }
  };


  /* =======================================================
     LANGUAGE EDITION LINKS
     ======================================================= */

  const initializeLanguageEditionLinks = () => {
    availableLanguageCards.forEach(
      (card) => {

        const link =
          card.querySelector(
            "a.language-card-link[href]"
          );


        if (!link) {
          return;
        }


        /*
         * Marker for future analytics
         * or edition-specific behavior.
         */
        link.dataset.editionLink =
          "true";


        /*
         * Official language editions
         * remain in the same tab.
         *
         * If target="_blank" is ever added,
         * ensure safe rel attributes.
         */
        if (
          link.target === "_blank"
        ) {
          const relValues =
            new Set(
              (
                link.getAttribute("rel") ||
                ""
              )
                .split(/\s+/)
                .filter(Boolean)
            );


          relValues.add("noopener");
          relValues.add("noreferrer");


          link.setAttribute(
            "rel",
            Array.from(
              relValues
            ).join(" ")
          );
        }

      }
    );
  };


  /* =======================================================
     INITIAL HASH SUPPORT
     ======================================================= */

  const handleInitialHash = () => {
    const hash =
      window.location.hash;


    if (
      !hash ||
      hash.length <= 1
    ) {
      return;
    }


    let targetId = "";


    try {
      targetId =
        decodeURIComponent(
          hash.slice(1)
        );
    } catch (error) {
      targetId =
        hash.slice(1);
    }


    if (!targetId) {
      return;
    }


    const target =
      document.getElementById(
        targetId
      );


    if (!target) {
      return;
    }


    /*
     * Two animation frames allow the
     * page layout and sticky header
     * to settle before scrolling.
     */
    window.requestAnimationFrame(
      () => {

        window.requestAnimationFrame(
          () => {

            target.scrollIntoView({
              behavior: "auto",
              block: "start"
            });

          }
        );

      }
    );
  };


  /* =======================================================
     HOME INITIALIZATION
     ======================================================= */

  const initializeHome = () => {
    setCurrentYear();

    initializeInternalAnchors();

    initializeAvailableLanguageCards();

    initializeUpcomingLanguageCards();

    initializeLanguageGrid();

    initializeLanguageEditionLinks();

    handleInitialHash();
  };


  /* =======================================================
     DOM READY
     ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initializeHome,
      {
        once: true
      }
    );

  } else {

    initializeHome();

  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.SalimGPTHome = {

    refreshYear() {
      setCurrentYear();
    },


    scrollToLanguages() {
      const section =
        document.getElementById(
          "explore-languages"
        );


      if (!section) {
        return false;
      }


      section.scrollIntoView({
        behavior:
          prefersReducedMotion()
            ? "auto"
            : "smooth",

        block: "start"
      });


      return true;
    }

  };

})();