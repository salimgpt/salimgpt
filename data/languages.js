"use strict";

/* =========================================================
   SalimGPT Global
   File: data/languages.js

   Canonical language-edition data.

   Purpose:
   - Define available language editions
   - Define upcoming language editions
   - Provide native language names
   - Provide search terms
   - Provide text direction
   - Provide confirmed edition URLs
   - Support language-cards.js
   - Support language-search.js
   - Keep language data centralized

   Important:
   - No automatic browser-language redirect
   - Upcoming editions do not receive invented URLs
   - Only confirmed SalimGPT edition URLs are published

   Available:
   - Bengali
   - English
   - Hindi

   Upcoming:
   - Urdu
   - Arabic
   - Spanish
   - French
   - Portuguese
   - Indonesian
   - Turkish
   ========================================================= */

(function (global) {

  /* =======================================================
     CONFIG
     ======================================================= */

  const GLOBAL_SITE_URL =
    "https://salimgpt.github.io/salimgpt/";


  const LANGUAGE_DIRECTORY_URL =
    `${GLOBAL_SITE_URL}global/language-editions/`;


  /* =======================================================
     LANGUAGE DATA
     ======================================================= */

  const LANGUAGES = [

    /* =====================================================
       AVAILABLE EDITIONS
       ===================================================== */

    {
      id:
        "bengali",

      code:
        "bn",

      locale:
        "bn",

      name:
        "Bengali",

      englishName:
        "Bengali",

      nativeName:
        "বাংলা",

      shortName:
        "বাংলা",

      status:
        "available",

      direction:
        "ltr",

      script:
        "Bengali",

      url:
        "https://salimgpt.github.io/salimgpt-bn/",

      description:
        "Explore SalimGPT documentary content in Bengali.",

      actionLabel:
        "Explore Bengali Edition",

      searchTerms: [
        "Bengali",
        "Bangla",
        "বাংলা",
        "BN",
        "bn",
        "SalimGPT Bengali",
        "SalimGPT Bangla",
        "বাংলা SalimGPT"
      ]
    },


    {
      id:
        "english",

      code:
        "en",

      locale:
        "en",

      name:
        "English",

      englishName:
        "English",

      nativeName:
        "English",

      shortName:
        "English",

      status:
        "available",

      direction:
        "ltr",

      script:
        "Latin",

      url:
        "https://salimgpt.github.io/salimgpt-en/",

      description:
        "Explore SalimGPT documentary content in English.",

      actionLabel:
        "Explore English Edition",

      searchTerms: [
        "English",
        "EN",
        "en",
        "SalimGPT English"
      ]
    },


    {
      id:
        "hindi",

      code:
        "hi",

      locale:
        "hi",

      name:
        "Hindi",

      englishName:
        "Hindi",

      nativeName:
        "हिन्दी",

      shortName:
        "हिन्दी",

      status:
        "available",

      direction:
        "ltr",

      script:
        "Devanagari",

      url:
        "https://salimgpt.github.io/salimgpt-hi/",

      description:
        "Explore SalimGPT documentary content in Hindi.",

      actionLabel:
        "Explore Hindi Edition",

      searchTerms: [
        "Hindi",
        "हिन्दी",
        "हिंदी",
        "HI",
        "hi",
        "SalimGPT Hindi",
        "हिन्दी SalimGPT",
        "हिंदी SalimGPT"
      ]
    },


    /* =====================================================
       UPCOMING EDITIONS
       ===================================================== */

    {
      id:
        "urdu",

      code:
        "ur",

      locale:
        "ur",

      name:
        "Urdu",

      englishName:
        "Urdu",

      nativeName:
        "اردو",

      shortName:
        "اردو",

      status:
        "upcoming",

      direction:
        "rtl",

      script:
        "Arabic",

      url:
        "",

      description:
        "The Urdu edition of SalimGPT is planned as an upcoming language edition.",

      actionLabel:
        "Coming Soon",

      searchTerms: [
        "Urdu",
        "اردو",
        "UR",
        "ur",
        "SalimGPT Urdu",
        "اردو SalimGPT"
      ]
    },


    {
      id:
        "arabic",

      code:
        "ar",

      locale:
        "ar",

      name:
        "Arabic",

      englishName:
        "Arabic",

      nativeName:
        "العربية",

      shortName:
        "العربية",

      status:
        "upcoming",

      direction:
        "rtl",

      script:
        "Arabic",

      url:
        "",

      description:
        "The Arabic edition of SalimGPT is planned as an upcoming language edition.",

      actionLabel:
        "Coming Soon",

      searchTerms: [
        "Arabic",
        "العربية",
        "AR",
        "ar",
        "SalimGPT Arabic",
        "العربية SalimGPT"
      ]
    },


    {
      id:
        "spanish",

      code:
        "es",

      locale:
        "es",

      name:
        "Spanish",

      englishName:
        "Spanish",

      nativeName:
        "Español",

      shortName:
        "Español",

      status:
        "upcoming",

      direction:
        "ltr",

      script:
        "Latin",

      url:
        "",

      description:
        "The Spanish edition of SalimGPT is planned as an upcoming language edition.",

      actionLabel:
        "Coming Soon",

      searchTerms: [
        "Spanish",
        "Español",
        "Espanol",
        "ES",
        "es",
        "SalimGPT Spanish",
        "SalimGPT Español",
        "SalimGPT Espanol"
      ]
    },


    {
      id:
        "french",

      code:
        "fr",

      locale:
        "fr",

      name:
        "French",

      englishName:
        "French",

      nativeName:
        "Français",

      shortName:
        "Français",

      status:
        "upcoming",

      direction:
        "ltr",

      script:
        "Latin",

      url:
        "",

      description:
        "The French edition of SalimGPT is planned as an upcoming language edition.",

      actionLabel:
        "Coming Soon",

      searchTerms: [
        "French",
        "Français",
        "Francais",
        "FR",
        "fr",
        "SalimGPT French",
        "SalimGPT Français",
        "SalimGPT Francais"
      ]
    },


    {
      id:
        "portuguese",

      code:
        "pt",

      locale:
        "pt",

      name:
        "Portuguese",

      englishName:
        "Portuguese",

      nativeName:
        "Português",

      shortName:
        "Português",

      status:
        "upcoming",

      direction:
        "ltr",

      script:
        "Latin",

      url:
        "",

      description:
        "The Portuguese edition of SalimGPT is planned as an upcoming language edition.",

      actionLabel:
        "Coming Soon",

      searchTerms: [
        "Portuguese",
        "Português",
        "Portugues",
        "PT",
        "pt",
        "SalimGPT Portuguese",
        "SalimGPT Português",
        "SalimGPT Portugues"
      ]
    },


    {
      id:
        "indonesian",

      code:
        "id",

      locale:
        "id",

      name:
        "Indonesian",

      englishName:
        "Indonesian",

      nativeName:
        "Bahasa Indonesia",

      shortName:
        "Indonesia",

      status:
        "upcoming",

      direction:
        "ltr",

      script:
        "Latin",

      url:
        "",

      description:
        "The Indonesian edition of SalimGPT is planned as an upcoming language edition.",

      actionLabel:
        "Coming Soon",

      searchTerms: [
        "Indonesian",
        "Indonesia",
        "Bahasa Indonesia",
        "ID",
        "id",
        "SalimGPT Indonesian",
        "SalimGPT Indonesia",
        "SalimGPT Bahasa Indonesia"
      ]
    },


    {
      id:
        "turkish",

      code:
        "tr",

      locale:
        "tr",

      name:
        "Turkish",

      englishName:
        "Turkish",

      nativeName:
        "Türkçe",

      shortName:
        "Türkçe",

      status:
        "upcoming",

      direction:
        "ltr",

      script:
        "Latin",

      url:
        "",

      description:
        "The Turkish edition of SalimGPT is planned as an upcoming language edition.",

      actionLabel:
        "Coming Soon",

      searchTerms: [
        "Turkish",
        "Türkçe",
        "Turkce",
        "TR",
        "tr",
        "SalimGPT Turkish",
        "SalimGPT Türkçe",
        "SalimGPT Turkce"
      ]
    }

  ];


  /* =======================================================
     NORMALIZE LANGUAGE CODE
     ======================================================= */

  const normalizeLanguageCode = (
    value
  ) => {
    return String(
      value || ""
    )
      .trim()
      .toLowerCase()
      .replace(
        /_/g,
        "-"
      )
      .split("-")[0];
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
     FIND LANGUAGE BY CODE
     ======================================================= */

  const getLanguageByCode = (
    languageCode
  ) => {
    const code =
      normalizeLanguageCode(
        languageCode
      );


    if (!code) {
      return null;
    }


    return (
      LANGUAGES.find(
        (language) =>
          language.code === code
      ) ||
      null
    );
  };


  /* =======================================================
     FIND LANGUAGE BY ID
     ======================================================= */

  const getLanguageById = (
    id
  ) => {
    const wanted =
      String(
        id || ""
      )
        .trim()
        .toLowerCase();


    if (!wanted) {
      return null;
    }


    return (
      LANGUAGES.find(
        (language) =>
          language.id === wanted
      ) ||
      null
    );
  };


  /* =======================================================
     AVAILABLE LANGUAGES
     ======================================================= */

  const getAvailableLanguages = () => {
    return LANGUAGES.filter(
      (language) =>
        language.status ===
        "available"
    );
  };


  /* =======================================================
     UPCOMING LANGUAGES
     ======================================================= */

  const getUpcomingLanguages = () => {
    return LANGUAGES.filter(
      (language) =>
        language.status ===
        "upcoming"
    );
  };


  /* =======================================================
     LANGUAGE STATUS
     ======================================================= */

  const isAvailable = (
    languageCode
  ) => {
    const language =
      getLanguageByCode(
        languageCode
      );


    return Boolean(
      language &&
      language.status ===
        "available"
    );
  };


  const isUpcoming = (
    languageCode
  ) => {
    const language =
      getLanguageByCode(
        languageCode
      );


    return Boolean(
      language &&
      language.status ===
        "upcoming"
    );
  };


  /* =======================================================
     LANGUAGE URL
     ======================================================= */

  const getLanguageUrl = (
    languageCode
  ) => {
    const language =
      getLanguageByCode(
        languageCode
      );


    if (
      !language ||
      language.status !==
        "available"
    ) {
      return "";
    }


    return language.url || "";
  };


  /* =======================================================
     SEARCH LANGUAGE DATA
     ======================================================= */

  const searchLanguages = (
    query
  ) => {
    const normalizedQuery =
      normalizeText(
        query
      );


    if (!normalizedQuery) {
      return [
        ...LANGUAGES
      ];
    }


    const terms =
      normalizedQuery
        .split(" ")
        .filter(Boolean);


    return LANGUAGES.filter(
      (language) => {
        const searchable =
          normalizeText(
            [
              language.id,
              language.code,
              language.locale,
              language.name,
              language.englishName,
              language.nativeName,
              language.shortName,
              language.status,
              language.script,
              ...(Array.isArray(
                language.searchTerms
              )
                ? language.searchTerms
                : [])
            ]
              .filter(Boolean)
              .join(" ")
          );


        if (
          searchable.includes(
            normalizedQuery
          )
        ) {
          return true;
        }


        return terms.every(
          (term) =>
            searchable.includes(
              term
            )
        );
      }
    );
  };


  /* =======================================================
     LANGUAGE COUNTS
     ======================================================= */

  const getCounts = () => {
    const available =
      getAvailableLanguages()
        .length;


    const upcoming =
      getUpcomingLanguages()
        .length;


    return {
      total:
        LANGUAGES.length,

      available,

      upcoming
    };
  };


  /* =======================================================
     RTL LANGUAGES
     ======================================================= */

  const getRtlLanguages = () => {
    return LANGUAGES.filter(
      (language) =>
        language.direction ===
        "rtl"
    );
  };


  /* =======================================================
     LTR LANGUAGES
     ======================================================= */

  const getLtrLanguages = () => {
    return LANGUAGES.filter(
      (language) =>
        language.direction ===
        "ltr"
    );
  };


  /* =======================================================
     LOCALE MATCHING

     This only returns information.
     It never redirects the visitor automatically.
     ======================================================= */

  const findEditionForLocale = (
    locale
  ) => {
    const language =
      getLanguageByCode(
        locale
      );


    if (!language) {
      return null;
    }


    return {
      ...language
    };
  };


  /* =======================================================
     DATA OBJECT
     ======================================================= */

  const LANGUAGE_DATA = {

    version:
      1,

    directoryUrl:
      LANGUAGE_DIRECTORY_URL,

    defaultLanguage:
      "en",

    automaticRedirect:
      false,

    availableCodes:
      getAvailableLanguages()
        .map(
          (language) =>
            language.code
        ),

    upcomingCodes:
      getUpcomingLanguages()
        .map(
          (language) =>
            language.code
        ),

    languages:
      LANGUAGES

  };


  /* =======================================================
     PRIMARY PUBLIC VARIABLES
     ======================================================= */

  global.SALIMGPT_LANGUAGES =
    LANGUAGES;


  global.SALIMGPT_LANGUAGE_DATA =
    LANGUAGE_DATA;


  /* =======================================================
     COMPATIBILITY ALIASES
     ======================================================= */

  global.salimgptLanguages =
    LANGUAGES;


  global.salimgptLanguageData =
    LANGUAGE_DATA;


  global.SalimGPTLanguages =
    LANGUAGE_DATA;


  /* =======================================================
     PUBLIC API
     ======================================================= */

  global.SalimGPTLanguageData = {

    version:
      LANGUAGE_DATA.version,


    getAll() {
      return [
        ...LANGUAGES
      ];
    },


    getAvailable() {
      return getAvailableLanguages();
    },


    getUpcoming() {
      return getUpcomingLanguages();
    },


    getByCode(
      languageCode
    ) {
      return getLanguageByCode(
        languageCode
      );
    },


    getById(
      id
    ) {
      return getLanguageById(
        id
      );
    },


    getUrl(
      languageCode
    ) {
      return getLanguageUrl(
        languageCode
      );
    },


    isAvailable(
      languageCode
    ) {
      return isAvailable(
        languageCode
      );
    },


    isUpcoming(
      languageCode
    ) {
      return isUpcoming(
        languageCode
      );
    },


    search(
      query
    ) {
      return searchLanguages(
        query
      );
    },


    getCounts() {
      return getCounts();
    },


    getRtlLanguages() {
      return getRtlLanguages();
    },


    getLtrLanguages() {
      return getLtrLanguages();
    },


    getDirection(
      languageCode
    ) {
      const language =
        getLanguageByCode(
          languageCode
        );


      return language
        ? language.direction
        : "";
    },


    findEditionForLocale(
      locale
    ) {
      return findEditionForLocale(
        locale
      );
    },


    normalizeCode(
      languageCode
    ) {
      return normalizeLanguageCode(
        languageCode
      );
    },


    /*
     * Deliberately informational only.
     *
     * SalimGPT Global does not automatically redirect
     * visitors according to browser language.
     */
    shouldAutomaticallyRedirect() {
      return false;
    }

  };


  /* =======================================================
     READY STATE
     ======================================================= */

  if (
    typeof document !==
    "undefined"
  ) {
    const counts =
      getCounts();


    document.documentElement
      .dataset
      .languageDataReady =
        "true";


    document.documentElement
      .dataset
      .languageCount =
        String(
          counts.total
        );


    document.documentElement
      .dataset
      .availableLanguageCount =
        String(
          counts.available
        );


    document.documentElement
      .dataset
      .upcomingLanguageCount =
        String(
          counts.upcoming
        );


    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:language-data-ready",
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
  }

})(
  typeof globalThis !== "undefined"
    ? globalThis
    : window
);