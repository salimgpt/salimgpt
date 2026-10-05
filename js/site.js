"use strict";

/* =========================================================
   SalimGPT Global
   File: js/site.js

   Shared site-level behavior.

   Handles:
   - JavaScript-ready document state
   - Dynamic copyright year
   - Current-page navigation state
   - Parent navigation group state
   - Accessible same-page anchor navigation
   - Reduced-motion preference
   - External-link security
   - Image loading/error state
   - Back-to-top controls when present
   - Small reusable site utilities
   - Public SalimGPTSite API

   Menu-specific behavior:
   - js/menu.js

   Search-specific behavior:
   - js/global-search.js
   ========================================================= */

(() => {

  /* =======================================================
     CONFIG
     ======================================================= */

  const SITE_NAME =
    "SalimGPT";


  const SITE_BASE_URL =
    "https://salimgpt.github.io/salimgpt/";


  const SITE_BASE_PATH =
    "/salimgpt/";


  /* =======================================================
     DOCUMENT STATE
     ======================================================= */

  const html =
    document.documentElement;


  /*
   * Allows CSS to progressively enhance components
   * when JavaScript is available.
   */
  html.classList.add(
    "js"
  );


  html.classList.remove(
    "no-js"
  );


  /* =======================================================
     REDUCED MOTION
     ======================================================= */

  const reducedMotionQuery =
    window.matchMedia
      ? window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        )
      : null;


  const prefersReducedMotion = () => {
    return Boolean(
      reducedMotionQuery &&
      reducedMotionQuery.matches
    );
  };


  /* =======================================================
     HELPER: SAFE URI DECODING
     ======================================================= */

  const safeDecodeURIComponent = (
    value
  ) => {
    try {
      return decodeURIComponent(
        value
      );
    } catch {
      return value;
    }
  };


  /* =======================================================
     HELPER: NORMALIZE PATH
     ======================================================= */

  const normalizePath = (
    pathname
  ) => {
    let value =
      safeDecodeURIComponent(
        String(
          pathname || "/"
        )
      );


    /*
     * Normalize Windows-style slashes in case the site
     * is previewed from a local environment.
     */
    value =
      value.replace(
        /\\/g,
        "/"
      );


    /*
     * Collapse duplicate slashes.
     */
    value =
      value.replace(
        /\/{2,}/g,
        "/"
      );


    /*
     * Remove explicit index.html.
     */
    value =
      value.replace(
        /\/index\.html$/i,
        "/"
      );


    /*
     * Root remains root.
     */
    if (!value) {
      value = "/";
    }


    /*
     * Directory routes use a trailing slash.
     *
     * File URLs such as:
     * /favicon.svg
     * /404.html
     *
     * are left unchanged.
     */
    const finalSegment =
      value
        .split("/")
        .filter(Boolean)
        .pop() || "";


    const appearsToBeFile =
      /\.[a-z0-9]{1,12}$/i.test(
        finalSegment
      );


    if (
      !appearsToBeFile &&
      !value.endsWith("/")
    ) {
      value += "/";
    }


    return value;
  };


  /* =======================================================
     HELPER: URL FROM LINK
     ======================================================= */

  const getUrl = (
    value
  ) => {
    if (!value) {
      return null;
    }


    try {
      return new URL(
        value,
        window.location.href
      );
    } catch {
      return null;
    }
  };


  /* =======================================================
     HELPER: SAME DOCUMENT
     ======================================================= */

  const isSameDocumentUrl = (
    url
  ) => {
    if (!url) {
      return false;
    }


    /*
     * file:// previews can have unusual origin values,
     * so compare protocol/host/path carefully.
     */
    const currentUrl =
      new URL(
        window.location.href
      );


    const sameProtocol =
      url.protocol ===
      currentUrl.protocol;


    const sameHost =
      url.host ===
      currentUrl.host;


    const samePath =
      normalizePath(
        url.pathname
      ) ===
      normalizePath(
        currentUrl.pathname
      );


    if (
      currentUrl.protocol === "file:"
    ) {
      return (
        sameProtocol &&
        samePath
      );
    }


    return (
      sameProtocol &&
      sameHost &&
      samePath
    );
  };


  /* =======================================================
     HELPER: SITE-LOCAL URL
     ======================================================= */

  const isInternalUrl = (
    url
  ) => {
    if (!url) {
      return false;
    }


    if (
      url.protocol === "file:"
    ) {
      return true;
    }


    return (
      url.origin ===
      window.location.origin
    );
  };


  /* =======================================================
     HELPER: FOCUSABLE TARGET
     ======================================================= */

  const isNaturallyFocusable = (
    element
  ) => {
    if (
      !(element instanceof HTMLElement)
    ) {
      return false;
    }


    if (
      element.matches(
        [
          "a[href]",
          "button",
          "input",
          "select",
          "textarea",
          "summary",
          "[contenteditable='true']",
          "[tabindex]"
        ].join(",")
      )
    ) {
      return true;
    }


    return false;
  };


  /* =======================================================
     COPYRIGHT YEAR
     ======================================================= */

  const updateCurrentYear = () => {
    const year =
      String(
        new Date().getFullYear()
      );


    const yearTargets =
      document.querySelectorAll(
        [
          "#footerYear",
          "#menuYear",
          "[data-current-year]"
        ].join(",")
      );


    yearTargets.forEach(
      (element) => {
        element.textContent =
          year;
      }
    );
  };


  /* =======================================================
     CURRENT PAGE NAVIGATION
     ======================================================= */

  const navigationLinkSelector = [
    ".side-menu-navigation a[href]",
    ".footer-links a[href]",
    ".footer-legal-links a[href]"
  ].join(",");


  const linkMatchesCurrentPage = (
    link
  ) => {
    if (
      !(link instanceof HTMLAnchorElement)
    ) {
      return false;
    }


    const href =
      link.getAttribute(
        "href"
      );


    if (
      !href ||
      href === "#" ||
      href.startsWith("#")
    ) {
      return false;
    }


    const url =
      getUrl(href);


    if (!url) {
      return false;
    }


    return isSameDocumentUrl(
      url
    );
  };


  const resetSideMenuActiveLinks = () => {
    const sideMenuLinks =
      document.querySelectorAll(
        [
          ".side-menu-navigation a[aria-current='page']",
          ".side-menu-submenu a.is-active",
          ".menu-entry.is-active"
        ].join(",")
      );


    sideMenuLinks.forEach(
      (link) => {
        link.removeAttribute(
          "aria-current"
        );


        link.classList.remove(
          "is-active"
        );
      }
    );


    /*
     * Group buttons are recalculated below.
     */
    document
      .querySelectorAll(
        ".side-menu-group-toggle.is-active"
      )
      .forEach(
        (button) => {
          button.classList.remove(
            "is-active"
          );
        }
      );
  };


  const markCurrentNavigation = () => {
    const links =
      Array.from(
        document.querySelectorAll(
          navigationLinkSelector
        )
      );


    if (!links.length) {
      return;
    }


    resetSideMenuActiveLinks();


    links.forEach(
      (link) => {
        if (
          !linkMatchesCurrentPage(
            link
          )
        ) {
          /*
           * Remove an incorrect page state copied from
           * another page, while leaving unrelated classes.
           */
          if (
            link.getAttribute(
              "aria-current"
            ) === "page"
          ) {
            link.removeAttribute(
              "aria-current"
            );
          }


          return;
        }


        link.setAttribute(
          "aria-current",
          "page"
        );


        if (
          link.closest(
            ".side-menu-navigation"
          )
        ) {
          link.classList.add(
            "is-active"
          );
        }


        const submenu =
          link.closest(
            ".side-menu-submenu"
          );


        if (
          submenu &&
          submenu.id
        ) {
          const controlledId =
            submenu.id;


          const parentToggle =
            Array.from(
              document.querySelectorAll(
                ".side-menu-group-toggle"
              )
            ).find(
              (button) =>
                button.getAttribute(
                  "aria-controls"
                ) === controlledId
            );


          if (parentToggle) {
            parentToggle.classList.add(
              "is-active"
            );
          }
        }
      }
    );
  };


  /* =======================================================
     SAME-PAGE ANCHOR TARGET
     ======================================================= */

  const getHashTarget = (
    hash
  ) => {
    if (
      !hash ||
      hash === "#"
    ) {
      return null;
    }


    const rawId =
      safeDecodeURIComponent(
        hash.slice(1)
      );


    if (!rawId) {
      return null;
    }


    /*
     * getElementById is preferred because IDs can contain
     * characters that require escaping in querySelector.
     */
    const directTarget =
      document.getElementById(
        rawId
      );


    if (directTarget) {
      return directTarget;
    }


    /*
     * Support legacy named anchors.
     */
    const namedAnchors =
      document.getElementsByName(
        rawId
      );


    return (
      namedAnchors.length
        ? namedAnchors[0]
        : null
    );
  };


  /* =======================================================
     ACCESSIBLE TARGET FOCUS
     ======================================================= */

  const focusAnchorTarget = (
    target
  ) => {
    if (
      !(target instanceof HTMLElement)
    ) {
      return;
    }


    const alreadyFocusable =
      isNaturallyFocusable(
        target
      );


    let temporaryTabIndex =
      false;


    if (!alreadyFocusable) {
      target.setAttribute(
        "tabindex",
        "-1"
      );


      temporaryTabIndex =
        true;
    }


    try {
      target.focus({
        preventScroll: true
      });
    } catch {
      target.focus();
    }


    if (temporaryTabIndex) {
      const removeTemporaryTabIndex =
        () => {
          /*
           * Only remove the tabindex if this script
           * added the temporary -1 state.
           */
          if (
            target.getAttribute(
              "tabindex"
            ) === "-1"
          ) {
            target.removeAttribute(
              "tabindex"
            );
          }


          target.removeEventListener(
            "blur",
            removeTemporaryTabIndex
          );
        };


      target.addEventListener(
        "blur",
        removeTemporaryTabIndex,
        {
          once: true
        }
      );
    }
  };


  /* =======================================================
     SCROLL TO HASH TARGET
     ======================================================= */

  const scrollToTarget = (
    target,
    {
      updateHistory = true,
      hash = ""
    } = {}
  ) => {
    if (
      !(target instanceof HTMLElement)
    ) {
      return false;
    }


    target.scrollIntoView({
      behavior:
        prefersReducedMotion()
          ? "auto"
          : "smooth",

      block:
        "start"
    });


    window.requestAnimationFrame(
      () => {
        focusAnchorTarget(
          target
        );
      }
    );


    if (
      updateHistory &&
      hash &&
      window.history &&
      typeof window.history.pushState ===
        "function"
    ) {
      const nextUrl =
        `${window.location.pathname}${window.location.search}${hash}`;


      window.history.pushState(
        null,
        "",
        nextUrl
      );
    }


    return true;
  };


  /* =======================================================
     SAME-PAGE ANCHOR CLICK
     ======================================================= */

  const handleAnchorClick = (
    event
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }


    const link =
      event.target.closest(
        "a[href]"
      );


    if (
      !link ||
      !(link instanceof HTMLAnchorElement)
    ) {
      return;
    }


    if (
      link.hasAttribute(
        "download"
      )
    ) {
      return;
    }


    const href =
      link.getAttribute(
        "href"
      );


    if (
      !href ||
      href === "#"
    ) {
      return;
    }


    const url =
      getUrl(href);


    if (
      !url ||
      !url.hash ||
      !isSameDocumentUrl(url)
    ) {
      return;
    }


    const target =
      getHashTarget(
        url.hash
      );


    if (!target) {
      return;
    }


    event.preventDefault();


    scrollToTarget(
      target,
      {
        updateHistory: true,
        hash:
          url.hash
      }
    );
  };


  /* =======================================================
     INITIAL HASH ACCESSIBILITY
     ======================================================= */

  const enhanceInitialHash = () => {
    const hash =
      window.location.hash;


    if (!hash) {
      return;
    }


    const target =
      getHashTarget(
        hash
      );


    if (!target) {
      return;
    }


    /*
     * The browser normally performs the initial scroll.
     * We only improve keyboard/screen-reader focus after
     * the document has settled.
     */
    window.requestAnimationFrame(
      () => {
        window.requestAnimationFrame(
          () => {
            focusAnchorTarget(
              target
            );
          }
        );
      }
    );
  };


  /* =======================================================
     HASHCHANGE
     ======================================================= */

  const handleHashChange = () => {
    const target =
      getHashTarget(
        window.location.hash
      );


    if (!target) {
      return;
    }


    focusAnchorTarget(
      target
    );
  };


  /* =======================================================
     EXTERNAL-LINK SECURITY
     ======================================================= */

  const secureExternalLinks = () => {
    const links =
      document.querySelectorAll(
        "a[href]"
      );


    links.forEach(
      (link) => {
        if (
          !(link instanceof HTMLAnchorElement)
        ) {
          return;
        }


        const href =
          link.getAttribute(
            "href"
          );


        if (
          !href ||
          href.startsWith("#") ||
          href.startsWith(
            "mailto:"
          ) ||
          href.startsWith(
            "tel:"
          ) ||
          href.startsWith(
            "sms:"
          )
        ) {
          return;
        }


        const url =
          getUrl(href);


        if (!url) {
          return;
        }


        const external =
          !isInternalUrl(
            url
          );


        if (external) {
          link.classList.add(
            "external-link"
          );
        }


        /*
         * target="_blank" links should not give the opened
         * page access to window.opener.
         */
        if (
          link.getAttribute(
            "target"
          ) === "_blank"
        ) {
          const relValues =
            new Set(
              (
                link.getAttribute(
                  "rel"
                ) || ""
              )
                .split(/\s+/)
                .filter(Boolean)
            );


          relValues.add(
            "noopener"
          );


          relValues.add(
            "noreferrer"
          );


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
     IMAGE STATE
     ======================================================= */

  const setImageLoaded = (
    image
  ) => {
    image.dataset.imageState =
      "loaded";


    image.classList.add(
      "is-loaded"
    );


    image.classList.remove(
      "is-loading",
      "is-load-error"
    );


    const mediaContainer =
      image.closest(
        "figure"
      );


    if (mediaContainer) {
      mediaContainer.classList.remove(
        "has-image-error",
        "is-image-loading"
      );


      mediaContainer.classList.add(
        "has-image-loaded"
      );
    }
  };


  const setImageError = (
    image
  ) => {
    image.dataset.imageState =
      "error";


    image.classList.add(
      "is-load-error"
    );


    image.classList.remove(
      "is-loading",
      "is-loaded"
    );


    const mediaContainer =
      image.closest(
        "figure"
      );


    if (mediaContainer) {
      mediaContainer.classList.remove(
        "is-image-loading",
        "has-image-loaded"
      );


      mediaContainer.classList.add(
        "has-image-error"
      );
    }
  };


  const registerImage = (
    image
  ) => {
    if (
      !(image instanceof HTMLImageElement)
    ) {
      return;
    }


    if (
      image.dataset.siteImageRegistered ===
      "true"
    ) {
      return;
    }


    image.dataset.siteImageRegistered =
      "true";


    /*
     * Decorative logos and SVG identity assets do not need
     * loading-state classes.
     */
    const source =
      image.currentSrc ||
      image.getAttribute(
        "src"
      ) ||
      "";


    const isBrandSvg =
      /assets\/brand\/.*\.svg(?:[?#]|$)/i.test(
        source
      );


    if (isBrandSvg) {
      return;
    }


    if (
      image.complete
    ) {
      if (
        image.naturalWidth > 0
      ) {
        setImageLoaded(
          image
        );
      } else {
        setImageError(
          image
        );
      }


      return;
    }


    image.dataset.imageState =
      "loading";


    image.classList.add(
      "is-loading"
    );


    const mediaContainer =
      image.closest(
        "figure"
      );


    if (mediaContainer) {
      mediaContainer.classList.add(
        "is-image-loading"
      );
    }


    image.addEventListener(
      "load",
      () => {
        setImageLoaded(
          image
        );
      },
      {
        once: true
      }
    );


    image.addEventListener(
      "error",
      () => {
        setImageError(
          image
        );
      },
      {
        once: true
      }
    );
  };


  const initializeImages = () => {
    document
      .querySelectorAll(
        "img"
      )
      .forEach(
        registerImage
      );
  };


  /* =======================================================
     BACK TO TOP
     ======================================================= */

  const initializeBackToTop = () => {
    const buttons =
      document.querySelectorAll(
        [
          "[data-back-to-top]",
          ".back-to-top"
        ].join(",")
      );


    if (!buttons.length) {
      return;
    }


    buttons.forEach(
      (button) => {
        button.addEventListener(
          "click",
          (event) => {
            event.preventDefault();


            window.scrollTo({
              top: 0,

              behavior:
                prefersReducedMotion()
                  ? "auto"
                  : "smooth"
            });


            const main =
              document.getElementById(
                "main-content"
              );


            if (main) {
              window.requestAnimationFrame(
                () => {
                  focusAnchorTarget(
                    main
                  );
                }
              );
            }
          }
        );
      }
    );
  };


  /* =======================================================
     REDUCED MOTION DOCUMENT STATE
     ======================================================= */

  const syncMotionPreference = () => {
    const reduced =
      prefersReducedMotion();


    html.classList.toggle(
      "reduced-motion",
      reduced
    );


    html.dataset.motion =
      reduced
        ? "reduced"
        : "full";
  };


  const observeMotionPreference = () => {
    if (!reducedMotionQuery) {
      return;
    }


    syncMotionPreference();


    const handler =
      () => {
        syncMotionPreference();
      };


    if (
      typeof reducedMotionQuery.addEventListener ===
      "function"
    ) {
      reducedMotionQuery.addEventListener(
        "change",
        handler
      );
    } else if (
      typeof reducedMotionQuery.addListener ===
      "function"
    ) {
      /*
       * Older Safari fallback.
       */
      reducedMotionQuery.addListener(
        handler
      );
    }
  };


  /* =======================================================
     SITE BASE INFORMATION
     ======================================================= */

  const setSiteDocumentData = () => {
    html.dataset.site =
      "salimgpt";


    html.dataset.siteBasePath =
      SITE_BASE_PATH;
  };


  /* =======================================================
     PAGE READY STATE
     ======================================================= */

  const setPageReady = () => {
    html.classList.add(
      "site-ready"
    );


    html.dataset.siteReady =
      "true";
  };


  /* =======================================================
     CUSTOM READY EVENT
     ======================================================= */

  const dispatchReadyEvent = () => {
    const detail = {
      site:
        SITE_NAME,

      baseUrl:
        SITE_BASE_URL,

      basePath:
        SITE_BASE_PATH,

      path:
        normalizePath(
          window.location.pathname
        )
    };


    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:ready",
          {
            detail
          }
        )
      );
    } catch {
      /*
       * Ignore CustomEvent failures in very old browsers.
       */
    }
  };


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  let initialized =
    false;


  const initialize = () => {
    if (initialized) {
      return;
    }


    initialized = true;


    setSiteDocumentData();

    updateCurrentYear();

    secureExternalLinks();

    markCurrentNavigation();

    initializeImages();

    initializeBackToTop();

    observeMotionPreference();

    enhanceInitialHash();


    document.addEventListener(
      "click",
      handleAnchorClick
    );


    window.addEventListener(
      "hashchange",
      handleHashChange
    );


    setPageReady();

    dispatchReadyEvent();
  };


  /* =======================================================
     INITIALIZE AT THE CORRECT TIME
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


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.SalimGPTSite = {

    name:
      SITE_NAME,


    baseUrl:
      SITE_BASE_URL,


    basePath:
      SITE_BASE_PATH,


    initialize() {
      initialize();
    },


    getCurrentYear() {
      return new Date()
        .getFullYear();
    },


    getCurrentPath() {
      return normalizePath(
        window.location.pathname
      );
    },


    normalizePath(
      pathname
    ) {
      return normalizePath(
        pathname
      );
    },


    prefersReducedMotion() {
      return prefersReducedMotion();
    },


    markCurrentNavigation() {
      markCurrentNavigation();
    },


    updateCurrentYear() {
      updateCurrentYear();
    },


    secureExternalLinks() {
      secureExternalLinks();
    },


    refreshImages() {
      initializeImages();
    },


    scrollToId(
      id,
      {
        updateHistory = true
      } = {}
    ) {
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
        return false;
      }


      const target =
        document.getElementById(
          cleanId
        );


      if (!target) {
        return false;
      }


      return scrollToTarget(
        target,
        {
          updateHistory,

          hash:
            `#${encodeURIComponent(
              cleanId
            )}`
        }
      );
    }

  };

})();