/* =========================================================
   SalimGPT Global
   File: js/menu.js

   Shared side-menu behavior.

   Handles:
   - Open / close drawer
   - Overlay interaction
   - Escape key
   - Focus management
   - Focus trapping
   - Scroll locking
   - Accordion navigation
   - One accordion open at a time
   - Current-page accordion reveal
   - ARIA synchronization
   - Responsive-safe interaction
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     ELEMENTS
     ======================================================= */

  const menuOpenButton =
    document.getElementById("menuOpenButton");

  const menuCloseButton =
    document.getElementById("menuCloseButton");

  const sideMenu =
    document.getElementById("sideMenu");

  const menuOverlay =
    document.getElementById("menuOverlay");


  if (
    !menuOpenButton ||
    !menuCloseButton ||
    !sideMenu ||
    !menuOverlay
  ) {
    return;
  }


  const menuNavigation =
    sideMenu.querySelector(
      ".side-menu-navigation"
    );


  const accordionButtons =
    Array.from(
      sideMenu.querySelectorAll(
        ".side-menu-group-toggle"
      )
    );


  const directMenuLinks =
    Array.from(
      sideMenu.querySelectorAll(
        ".menu-entry[href]"
      )
    );


  const submenuLinks =
    Array.from(
      sideMenu.querySelectorAll(
        ".side-menu-submenu a[href]"
      )
    );


  const menuSearchInput =
    sideMenu.querySelector(
      "#globalSearchInput"
    );


  /* =======================================================
     STATE
     ======================================================= */

  let isMenuOpen = false;

  let lastFocusedElement = null;

  let previousBodyOverflow = "";

  let previousBodyPaddingRight = "";


  /* =======================================================
     FOCUSABLE SELECTOR
     ======================================================= */

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");


  /* =======================================================
     HELPER: VISIBLE ELEMENT
     ======================================================= */

  const isElementVisible = (element) => {
    if (!element) {
      return false;
    }


    if (element.hasAttribute("hidden")) {
      return false;
    }


    const style =
      window.getComputedStyle(element);


    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      element.getClientRects().length > 0
    );
  };


  /* =======================================================
     HELPER: FOCUSABLE ELEMENTS
     ======================================================= */

  const getFocusableElements = () => {
    return Array.from(
      sideMenu.querySelectorAll(
        focusableSelector
      )
    ).filter(isElementVisible);
  };


  /* =======================================================
     HELPER: CONTROLLED SUBMENU
     ======================================================= */

  const getControlledSubmenu = (button) => {
    if (!button) {
      return null;
    }


    const submenuId =
      button.getAttribute(
        "aria-controls"
      );


    if (!submenuId) {
      return null;
    }


    return document.getElementById(
      submenuId
    );
  };


  /* =======================================================
     BODY SCROLL LOCK
     ======================================================= */

  const lockPageScroll = () => {
    previousBodyOverflow =
      document.body.style.overflow;

    previousBodyPaddingRight =
      document.body.style.paddingRight;


    const scrollbarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;


    if (scrollbarWidth > 0) {
      document.body.style.paddingRight =
        `${scrollbarWidth}px`;
    }


    document.body.style.overflow =
      "hidden";
  };


  const unlockPageScroll = () => {
    document.body.style.overflow =
      previousBodyOverflow;

    document.body.style.paddingRight =
      previousBodyPaddingRight;
  };


  /* =======================================================
     CLOSE ACCORDION
     ======================================================= */

  const closeAccordion = (button) => {
    if (!button) {
      return;
    }


    const submenu =
      getControlledSubmenu(button);


    button.setAttribute(
      "aria-expanded",
      "false"
    );


    if (submenu) {
      submenu.hidden = true;
    }
  };


  /* =======================================================
     OPEN ACCORDION
     ======================================================= */

  const openAccordion = (
    button,
    {
      scrollIntoView = false
    } = {}
  ) => {
    if (!button) {
      return;
    }


    const submenu =
      getControlledSubmenu(button);


    /*
     * Only one expandable group remains open.
     */
    accordionButtons.forEach(
      (otherButton) => {
        if (otherButton !== button) {
          closeAccordion(otherButton);
        }
      }
    );


    button.setAttribute(
      "aria-expanded",
      "true"
    );


    if (submenu) {
      submenu.hidden = false;
    }


    if (
      scrollIntoView &&
      menuNavigation
    ) {
      window.requestAnimationFrame(
        () => {
          button.scrollIntoView({
            behavior:
              window.matchMedia(
                "(prefers-reduced-motion: reduce)"
              ).matches
                ? "auto"
                : "smooth",

            block: "nearest"
          });
        }
      );
    }
  };


  /* =======================================================
     TOGGLE ACCORDION
     ======================================================= */

  const toggleAccordion = (button) => {
    const isExpanded =
      button.getAttribute(
        "aria-expanded"
      ) === "true";


    if (isExpanded) {
      closeAccordion(button);
    } else {
      openAccordion(
        button,
        {
          scrollIntoView: true
        }
      );
    }
  };


  /* =======================================================
     CLOSE ALL ACCORDIONS
     ======================================================= */

  const closeAllAccordions = () => {
    accordionButtons.forEach(
      (button) => {
        closeAccordion(button);
      }
    );
  };


  /* =======================================================
     CURRENT PAGE GROUP
     ======================================================= */

  const revealCurrentPageGroup = () => {
    const currentLink =
      sideMenu.querySelector(
        '.side-menu-submenu a[aria-current="page"],' +
        '.side-menu-submenu a.is-active'
      );


    if (!currentLink) {
      return;
    }


    const submenu =
      currentLink.closest(
        ".side-menu-submenu"
      );


    if (
      !submenu ||
      !submenu.id
    ) {
      return;
    }


    const parentButton =
      accordionButtons.find(
        (button) =>
          button.getAttribute(
            "aria-controls"
          ) === submenu.id
      );


    if (parentButton) {
      openAccordion(parentButton);
    }
  };


  /* =======================================================
     SET MENU ARIA STATE
     ======================================================= */

  const setMenuState = (open) => {
    menuOpenButton.setAttribute(
      "aria-expanded",
      open ? "true" : "false"
    );


    sideMenu.setAttribute(
      "aria-hidden",
      open ? "false" : "true"
    );


    menuOverlay.setAttribute(
      "aria-hidden",
      open ? "false" : "true"
    );
  };


  /* =======================================================
     OPEN MENU
     ======================================================= */

  const openMenu = () => {
    if (isMenuOpen) {
      return;
    }


    isMenuOpen = true;


    lastFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : menuOpenButton;


    lockPageScroll();


    document.body.classList.add(
      "menu-open"
    );


    sideMenu.classList.add(
      "is-open"
    );


    menuOverlay.classList.add(
      "is-visible"
    );


    setMenuState(true);


    if ("inert" in sideMenu) {
      sideMenu.inert = false;
    }


    window.requestAnimationFrame(
      () => {
        menuCloseButton.focus({
          preventScroll: true
        });
      }
    );
  };


  /* =======================================================
     CLOSE MENU
     ======================================================= */

  const closeMenu = ({
    restoreFocus = true
  } = {}) => {
    if (!isMenuOpen) {
      return;
    }


    isMenuOpen = false;


    document.body.classList.remove(
      "menu-open"
    );


    sideMenu.classList.remove(
      "is-open"
    );


    menuOverlay.classList.remove(
      "is-visible"
    );


    setMenuState(false);


    unlockPageScroll();


    if (
      restoreFocus &&
      lastFocusedElement &&
      document.contains(
        lastFocusedElement
      )
    ) {
      window.requestAnimationFrame(
        () => {
          lastFocusedElement.focus({
            preventScroll: true
          });
        }
      );
    }


    lastFocusedElement = null;
  };


  /* =======================================================
     TOGGLE MENU
     ======================================================= */

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };


  /* =======================================================
     FOCUS TRAP
     ======================================================= */

  const trapFocus = (event) => {
    if (
      !isMenuOpen ||
      event.key !== "Tab"
    ) {
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


    const activeElement =
      document.activeElement;


    if (
      event.shiftKey &&
      activeElement === firstElement
    ) {
      event.preventDefault();

      lastElement.focus();

      return;
    }


    if (
      !event.shiftKey &&
      activeElement === lastElement
    ) {
      event.preventDefault();

      firstElement.focus();
    }
  };


  /* =======================================================
     ESCAPE KEY
     ======================================================= */

  const handleEscapeKey = (event) => {
    if (
      event.key !== "Escape" ||
      !isMenuOpen
    ) {
      return;
    }


    event.preventDefault();


    /*
     * If search has focus and content,
     * Escape first clears it.
     */
    if (
      menuSearchInput &&
      document.activeElement ===
        menuSearchInput &&
      menuSearchInput.value
    ) {
      menuSearchInput.value = "";

      menuSearchInput.dispatchEvent(
        new Event(
          "input",
          {
            bubbles: true
          }
        )
      );

      return;
    }


    closeMenu();
  };


  /* =======================================================
     ACCORDION KEYBOARD NAVIGATION
     ======================================================= */

  const handleAccordionKeyboard = (
    event,
    currentButton
  ) => {
    if (!accordionButtons.length) {
      return;
    }


    const currentIndex =
      accordionButtons.indexOf(
        currentButton
      );


    if (currentIndex === -1) {
      return;
    }


    let targetIndex = null;


    switch (event.key) {

      case "ArrowDown":
        targetIndex =
          (
            currentIndex + 1
          ) %
          accordionButtons.length;
        break;


      case "ArrowUp":
        targetIndex =
          (
            currentIndex -
            1 +
            accordionButtons.length
          ) %
          accordionButtons.length;
        break;


      case "Home":
        targetIndex = 0;
        break;


      case "End":
        targetIndex =
          accordionButtons.length - 1;
        break;


      case "ArrowRight":
        if (
          currentButton.getAttribute(
            "aria-expanded"
          ) !== "true"
        ) {
          event.preventDefault();

          openAccordion(
            currentButton,
            {
              scrollIntoView: true
            }
          );
        }

        return;


      case "ArrowLeft":
        if (
          currentButton.getAttribute(
            "aria-expanded"
          ) === "true"
        ) {
          event.preventDefault();

          closeAccordion(
            currentButton
          );
        }

        return;


      default:
        return;
    }


    event.preventDefault();


    accordionButtons[
      targetIndex
    ].focus();
  };


  /* =======================================================
     LINK CLICK
     ======================================================= */

  const handleMenuLinkClick = (
    event
  ) => {
    const link =
      event.currentTarget;


    const href =
      link.getAttribute("href");


    if (
      !href ||
      href === "#" ||
      href.startsWith(
        "javascript:"
      )
    ) {
      return;
    }


    closeMenu({
      restoreFocus: false
    });
  };


  /* =======================================================
     OPEN BUTTON
     ======================================================= */

  menuOpenButton.addEventListener(
    "click",
    toggleMenu
  );


  /* =======================================================
     CLOSE BUTTON
     ======================================================= */

  menuCloseButton.addEventListener(
    "click",
    () => {
      closeMenu();
    }
  );


  /* =======================================================
     OVERLAY CLICK
     ======================================================= */

  menuOverlay.addEventListener(
    "click",
    () => {
      closeMenu();
    }
  );


  /* =======================================================
     ACCORDION EVENTS
     ======================================================= */

  accordionButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {
          toggleAccordion(button);
        }
      );


      button.addEventListener(
        "keydown",
        (event) => {
          handleAccordionKeyboard(
            event,
            button
          );
        }
      );

    }
  );


  /* =======================================================
     DIRECT MENU LINKS
     ======================================================= */

  directMenuLinks.forEach(
    (link) => {
      link.addEventListener(
        "click",
        handleMenuLinkClick
      );
    }
  );


  /* =======================================================
     SUBMENU LINKS
     ======================================================= */

  submenuLinks.forEach(
    (link) => {
      link.addEventListener(
        "click",
        handleMenuLinkClick
      );
    }
  );


  /* =======================================================
     GLOBAL KEYBOARD
     ======================================================= */

  document.addEventListener(
    "keydown",
    (event) => {
      handleEscapeKey(event);
      trapFocus(event);
    }
  );


  /* =======================================================
     KEEP FOCUS INSIDE DRAWER
     ======================================================= */

  document.addEventListener(
    "focusin",
    (event) => {
      if (!isMenuOpen) {
        return;
      }


      if (
        sideMenu.contains(
          event.target
        )
      ) {
        return;
      }


      const focusableElements =
        getFocusableElements();


      const fallbackElement =
        focusableElements[0] ||
        menuCloseButton;


      fallbackElement.focus({
        preventScroll: true
      });
    }
  );


  /* =======================================================
     INITIAL STATE
     ======================================================= */

  const initializeMenu = () => {
    isMenuOpen = false;


    document.body.classList.remove(
      "menu-open"
    );


    sideMenu.classList.remove(
      "is-open"
    );


    menuOverlay.classList.remove(
      "is-visible"
    );


    setMenuState(false);


    closeAllAccordions();


    revealCurrentPageGroup();
  };


  /* =======================================================
     INITIALIZE
     ======================================================= */

  initializeMenu();


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.SalimGPTMenu = {

    open() {
      openMenu();
    },


    close() {
      closeMenu();
    },


    toggle() {
      toggleMenu();
    },


    isOpen() {
      return isMenuOpen;
    },


    closeAllAccordions() {
      closeAllAccordions();
    },


    openAccordionById(
      submenuId
    ) {
      if (!submenuId) {
        return false;
      }


      const button =
        accordionButtons.find(
          (accordionButton) =>
            accordionButton.getAttribute(
              "aria-controls"
            ) === submenuId
        );


      if (!button) {
        return false;
      }


      openAccordion(
        button,
        {
          scrollIntoView: true
        }
      );


      return true;
    }

  };

})();