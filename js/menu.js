/* =========================================================
   SalimGPT
   File: js/menu.js
   Purpose: Advanced Side Menu Controller
   ========================================================= */

(function () {
  "use strict";


  /* =======================================================
     01. ELEMENTS
     ======================================================= */

  const menuOpenButton =
    document.getElementById("menuOpenButton");

  const menuCloseButton =
    document.getElementById("menuCloseButton");

  const sideMenu =
    document.getElementById("sideMenu");

  const menuOverlay =
    document.getElementById("menuOverlay");


  /*
    Stop if this page does not contain
    the SalimGPT side menu.
  */

  if (
    !menuOpenButton ||
    !menuCloseButton ||
    !sideMenu ||
    !menuOverlay
  ) {
    return;
  }


  /* =======================================================
     02. STATE
     ======================================================= */

  let isMenuOpen = false;

  let lastFocusedElement = null;


  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");


  /* =======================================================
     03. HELPERS
     ======================================================= */

  function getFocusableElements() {
    return Array.from(
      sideMenu.querySelectorAll(
        focusableSelector
      )
    ).filter((element) => {
      return (
        !element.hidden &&
        element.getAttribute("aria-hidden") !== "true"
      );
    });
  }


  function setAriaState(open) {
    menuOpenButton.setAttribute(
      "aria-expanded",
      String(open)
    );

    sideMenu.setAttribute(
      "aria-hidden",
      String(!open)
    );

    menuOverlay.setAttribute(
      "aria-hidden",
      String(!open)
    );
  }


  /* =======================================================
     04. OPEN MENU
     ======================================================= */

  function openMenu() {
    if (isMenuOpen) {
      return;
    }


    isMenuOpen = true;

    lastFocusedElement =
      document.activeElement;


    document.body.classList.add(
      "menu-open"
    );


    sideMenu.classList.add(
      "is-open"
    );

    menuOverlay.classList.add(
      "is-visible"
    );


    setAriaState(true);


    /*
      Move focus into the menu after
      the opening transition starts.
    */

    window.requestAnimationFrame(() => {
      menuCloseButton.focus({
        preventScroll: true
      });
    });
  }


  /* =======================================================
     05. CLOSE MENU
     ======================================================= */

  function closeMenu(options = {}) {
    if (!isMenuOpen) {
      return;
    }


    const {
      restoreFocus = true
    } = options;


    isMenuOpen = false;


    sideMenu.classList.remove(
      "is-open"
    );

    menuOverlay.classList.remove(
      "is-visible"
    );

    document.body.classList.remove(
      "menu-open"
    );


    setAriaState(false);


    if (
      restoreFocus &&
      lastFocusedElement &&
      document.contains(
        lastFocusedElement
      )
    ) {
      window.requestAnimationFrame(() => {
        lastFocusedElement.focus({
          preventScroll: true
        });
      });
    }


    lastFocusedElement = null;
  }


  /* =======================================================
     06. TOGGLE
     ======================================================= */

  function toggleMenu() {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }


  /* =======================================================
     07. KEYBOARD ACCESSIBILITY
     ======================================================= */

  function handleMenuKeydown(event) {

    if (!isMenuOpen) {
      return;
    }


    /*
      ESC closes menu
    */

    if (event.key === "Escape") {
      event.preventDefault();

      closeMenu();

      return;
    }


    /*
      Focus trap
    */

    if (event.key !== "Tab") {
      return;
    }


    const focusableElements =
      getFocusableElements();


    if (!focusableElements.length) {
      event.preventDefault();

      menuCloseButton.focus();

      return;
    }


    const firstElement =
      focusableElements[0];

    const lastElement =
      focusableElements[
        focusableElements.length - 1
      ];


    if (
      event.shiftKey &&
      document.activeElement === firstElement
    ) {
      event.preventDefault();

      lastElement.focus();

      return;
    }


    if (
      !event.shiftKey &&
      document.activeElement === lastElement
    ) {
      event.preventDefault();

      firstElement.focus();
    }
  }


  /* =======================================================
     08. MENU LINK BEHAVIOUR
     ======================================================= */

  function handleMenuLinkClick(event) {
    const menuLink =
      event.target.closest(
        ".menu-item, .side-menu-brand"
      );


    if (!menuLink) {
      return;
    }


    /*
      Close before navigating.
      No focus restoration is necessary
      because the page is about to change.
    */

    closeMenu({
      restoreFocus: false
    });
  }


  /* =======================================================
     09. TOUCH / POINTER SAFETY
     ======================================================= */

  function handleOverlayPointer(event) {

    /*
      Close only when the overlay itself
      was actually clicked/tapped.
    */

    if (
      event.target === menuOverlay
    ) {
      closeMenu();
    }
  }


  /* =======================================================
     10. WINDOW / PAGE SAFETY
     ======================================================= */

  function handlePageHide() {

    /*
      Prevent stale menu state when the
      browser restores a page from cache.
    */

    if (isMenuOpen) {
      closeMenu({
        restoreFocus: false
      });
    }
  }


  function handleVisibilityChange() {

    /*
      If browser restores DOM state
      unexpectedly, keep ARIA synced.
    */

    if (
      document.visibilityState === "visible"
    ) {
      setAriaState(isMenuOpen);
    }
  }


  /* =======================================================
     11. INITIAL STATE
     ======================================================= */

  function resetMenuState() {
    isMenuOpen = false;


    document.body.classList.remove(
      "menu-open"
    );


    sideMenu.classList.remove(
      "is-open",
      "active"
    );


    menuOverlay.classList.remove(
      "is-visible",
      "active"
    );


    setAriaState(false);
  }


  /* =======================================================
     12. EVENTS
     ======================================================= */

  menuOpenButton.addEventListener(
    "click",
    toggleMenu
  );


  menuCloseButton.addEventListener(
    "click",
    closeMenu
  );


  menuOverlay.addEventListener(
    "click",
    handleOverlayPointer
  );


  sideMenu.addEventListener(
    "click",
    handleMenuLinkClick
  );


  document.addEventListener(
    "keydown",
    handleMenuKeydown
  );


  window.addEventListener(
    "pagehide",
    handlePageHide
  );


  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );


  /* =======================================================
     13. START
     ======================================================= */

  resetMenuState();

})();