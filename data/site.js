"use strict";

/* =========================================================
   SalimGPT Global
   File: data/site.js

   Central public site configuration.

   Purpose:
   - Brand metadata
   - Canonical site information
   - Route map
   - Navigation structure
   - Language editions
   - Topic gateways
   - Trust / editorial information
   - Shared labels and URLs

   This file contains public configuration only.
   It contains no private keys, tokens or credentials.

   SalimGPT:
   Research-Based Documentary Media
   Human-Led. AI-Assisted. Editorially Reviewed. Multilingual.
   ========================================================= */

(function (global) {

  /* =======================================================
     CORE SITE INFORMATION
     ======================================================= */

  const SITE = {

    id:
      "salimgpt-global",

    name:
      "SalimGPT",

    shortName:
      "SalimGPT",

    type:
      "Documentary Media",

    description:
      "SalimGPT is an independent, research-based multilingual documentary media brand producing human-led, AI-assisted and editorially reviewed documentary content.",

    positioning:
      "Research-Based Documentary Media — Human-Led. AI-Assisted. Editorially Reviewed. Multilingual.",

    baseUrl:
      "https://salimgpt.github.io/salimgpt/",

    basePath:
      "/salimgpt/",

    defaultLanguage:
      "en",

    defaultLanguageName:
      "English",

    repositoryDirectory:
      "salimgpt",

    founder:
      "Mohammad Salim",

    editorialModel: {
      humanLed:
        true,

      aiAssisted:
        true,

      editoriallyReviewed:
        true,

      multilingual:
        true
    }

  };


  /* =======================================================
     CANONICAL BRAND ASSETS
     ======================================================= */

  const BRAND = {

    logo:
      "assets/brand/logo.svg",

    wordmark:
      "assets/brand/wordmark.svg",

    defaultShareImage:
      "assets/brand/default-og.webp",

    banner:
      "assets/brand/banner.webp",

    colors: {
      pink:
        "#f71950",

      darkPink:
        "#d90e40",

      pinkSoft:
        "#fff0f4",

      blue:
        "#087cf0",

      background:
        "#f7f8fa",

      backgroundSecondary:
        "#f1f3f6",

      white:
        "#ffffff",

      text:
        "#111216",

      textSecondary:
        "#202126"
    }

  };


  /* =======================================================
     ROUTE HELPERS
     ======================================================= */

  const route = (
    pathname = ""
  ) => {
    const clean =
      String(pathname || "")
        .replace(
          /^\/+/,
          ""
        );


    return clean
      ? `${SITE.baseUrl}${clean}`
      : SITE.baseUrl;
  };


  /* =======================================================
     MAIN ROUTES
     ======================================================= */

  const ROUTES = {

    home:
      route(),

    exploreLanguages:
      route(
        "explore-languages/"
      ),


    /* -----------------------------------------------------
       Discover
       ----------------------------------------------------- */

    latestDocumentaries:
      route(
        "latest-documentaries/"
      ),

    featuredDocumentaries:
      route(
        "featured-documentaries/"
      ),

    allDocumentaries:
      route(
        "all-documentaries/"
      ),

    documentarySeries:
      route(
        "documentary-series/"
      ),

    topics:
      route(
        "topics/"
      ),

    collections:
      route(
        "collections/"
      ),

    mostViewed:
      route(
        "most-viewed/"
      ),

    editorsPicks:
      route(
        "editors-picks/"
      ),

    documentaryArchive:
      route(
        "documentary-archive/"
      ),


    /* -----------------------------------------------------
       Topics
       ----------------------------------------------------- */

    history:
      route(
        "topics/history/"
      ),

    society:
      route(
        "topics/society/"
      ),

    science:
      route(
        "topics/science/"
      ),

    technology:
      route(
        "topics/technology/"
      ),

    humanCivilization:
      route(
        "topics/human-civilization/"
      ),

    mystery:
      route(
        "topics/mystery/"
      ),

    investigations:
      route(
        "topics/investigations/"
      ),

    currentAffairs:
      route(
        "topics/current-affairs/"
      ),


    /* -----------------------------------------------------
       Global
       ----------------------------------------------------- */

    languageEditions:
      route(
        "global/language-editions/"
      ),

    youtubeMultiLanguageAudio:
      route(
        "global/youtube-multi-language-audio/"
      ),

    officialSocialProfiles:
      route(
        "global/official-social-profiles/"
      ),

    whereToWatch:
      route(
        "global/where-to-watch/"
      ),


    /* -----------------------------------------------------
       About
       ----------------------------------------------------- */

    about:
      route(
        "about/"
      ),

    salimgptStory:
      route(
        "about/salimgpt-story/"
      ),

    whySalimgpt:
      route(
        "about/why-salimgpt/"
      ),

    missionVision:
      route(
        "about/mission-vision/"
      ),

    founderDirector:
      route(
        "about/founder-director/"
      ),


    /* -----------------------------------------------------
       How We Work
       ----------------------------------------------------- */

    documentaryApproach:
      route(
        "how-we-work/documentary-approach/"
      ),

    researchMethodology:
      route(
        "how-we-work/research-methodology/"
      ),

    sourceEvidenceStandards:
      route(
        "how-we-work/source-evidence-standards/"
      ),

    factChecking:
      route(
        "how-we-work/fact-checking/"
      ),

    editorialStandards:
      route(
        "how-we-work/editorial-standards/"
      ),

    productionProcess:
      route(
        "how-we-work/production-process/"
      ),

    humanLedAiAssisted:
      route(
        "how-we-work/human-led-ai-assisted/"
      ),

    visualSyntheticMedia:
      route(
        "how-we-work/visual-synthetic-media/"
      ),

    originalityCreativeDirection:
      route(
        "how-we-work/originality-creative-direction/"
      ),

    correctionsUpdates:
      route(
        "how-we-work/corrections-updates/"
      ),


    /* -----------------------------------------------------
       Trust
       ----------------------------------------------------- */

    transparency:
      route(
        "trust/transparency/"
      ),

    editorialIndependence:
      route(
        "trust/editorial-independence/"
      ),

    humanReviewStandard:
      route(
        "trust/human-review-standard/"
      ),

    ownershipCopyright:
      route(
        "trust/ownership-copyright/"
      ),

    contentUsePermissions:
      route(
        "trust/content-use-permissions/"
      ),


    /* -----------------------------------------------------
       Help
       ----------------------------------------------------- */

    faq:
      route(
        "help/faq/"
      ),

    search:
      route(
        "help/search/"
      ),

    contact:
      route(
        "help/contact/"
      ),

    correctionRequest:
      route(
        "help/correction-request/"
      ),

    copyrightRequest:
      route(
        "help/copyright-request/"
      ),


    /* -----------------------------------------------------
       Legal
       ----------------------------------------------------- */

    privacy:
      route(
        "legal/privacy/"
      ),

    terms:
      route(
        "legal/terms/"
      ),

    disclaimer:
      route(
        "legal/disclaimer/"
      )

  };


  /* =======================================================
     TOPIC GATEWAYS
     ======================================================= */

  const TOPICS = [

    {
      id:
        "history",

      name:
        "History",

      path:
        "topics/history/",

      url:
        ROUTES.history
    },

    {
      id:
        "society",

      name:
        "Society",

      path:
        "topics/society/",

      url:
        ROUTES.society
    },

    {
      id:
        "science",

      name:
        "Science",

      path:
        "topics/science/",

      url:
        ROUTES.science
    },

    {
      id:
        "technology",

      name:
        "Technology",

      path:
        "topics/technology/",

      url:
        ROUTES.technology
    },

    {
      id:
        "human-civilization",

      name:
        "Human Civilization",

      path:
        "topics/human-civilization/",

      url:
        ROUTES.humanCivilization
    },

    {
      id:
        "mystery",

      name:
        "Mystery",

      path:
        "topics/mystery/",

      url:
        ROUTES.mystery
    },

    {
      id:
        "investigations",

      name:
        "Investigations",

      path:
        "topics/investigations/",

      url:
        ROUTES.investigations
    },

    {
      id:
        "current-affairs",

      name:
        "Current Affairs",

      path:
        "topics/current-affairs/",

      url:
        ROUTES.currentAffairs
    }

  ];


  /* =======================================================
     LANGUAGE EDITIONS
     ======================================================= */

  const LANGUAGES = [

    /* -----------------------------------------------------
       Available
       ----------------------------------------------------- */

    {
      code:
        "bn",

      name:
        "Bengali",

      nativeName:
        "বাংলা",

      englishName:
        "Bengali",

      status:
        "available",

      direction:
        "ltr",

      url:
        "https://salimgpt.github.io/salimgpt-bn/",

      searchTerms: [
        "Bengali",
        "Bangla",
        "বাংলা",
        "BN"
      ]
    },

    {
      code:
        "en",

      name:
        "English",

      nativeName:
        "English",

      englishName:
        "English",

      status:
        "available",

      direction:
        "ltr",

      url:
        "https://salimgpt.github.io/salimgpt-en/",

      searchTerms: [
        "English",
        "EN"
      ]
    },

    {
      code:
        "hi",

      name:
        "Hindi",

      nativeName:
        "हिन्दी",

      englishName:
        "Hindi",

      status:
        "available",

      direction:
        "ltr",

      url:
        "https://salimgpt.github.io/salimgpt-hi/",

      searchTerms: [
        "Hindi",
        "हिन्दी",
        "हिंदी",
        "HI"
      ]
    },


    /* -----------------------------------------------------
       Upcoming
       ----------------------------------------------------- */

    {
      code:
        "ur",

      name:
        "Urdu",

      nativeName:
        "اردو",

      englishName:
        "Urdu",

      status:
        "upcoming",

      direction:
        "rtl",

      url:
        "",

      searchTerms: [
        "Urdu",
        "اردو",
        "UR"
      ]
    },

    {
      code:
        "ar",

      name:
        "Arabic",

      nativeName:
        "العربية",

      englishName:
        "Arabic",

      status:
        "upcoming",

      direction:
        "rtl",

      url:
        "",

      searchTerms: [
        "Arabic",
        "العربية",
        "AR"
      ]
    },

    {
      code:
        "es",

      name:
        "Spanish",

      nativeName:
        "Español",

      englishName:
        "Spanish",

      status:
        "upcoming",

      direction:
        "ltr",

      url:
        "",

      searchTerms: [
        "Spanish",
        "Español",
        "Espanol",
        "ES"
      ]
    },

    {
      code:
        "fr",

      name:
        "French",

      nativeName:
        "Français",

      englishName:
        "French",

      status:
        "upcoming",

      direction:
        "ltr",

      url:
        "",

      searchTerms: [
        "French",
        "Français",
        "Francais",
        "FR"
      ]
    },

    {
      code:
        "pt",

      name:
        "Portuguese",

      nativeName:
        "Português",

      englishName:
        "Portuguese",

      status:
        "upcoming",

      direction:
        "ltr",

      url:
        "",

      searchTerms: [
        "Portuguese",
        "Português",
        "Portugues",
        "PT"
      ]
    },

    {
      code:
        "id",

      name:
        "Indonesian",

      nativeName:
        "Bahasa Indonesia",

      englishName:
        "Indonesian",

      status:
        "upcoming",

      direction:
        "ltr",

      url:
        "",

      searchTerms: [
        "Indonesian",
        "Bahasa Indonesia",
        "Indonesia",
        "ID"
      ]
    },

    {
      code:
        "tr",

      name:
        "Turkish",

      nativeName:
        "Türkçe",

      englishName:
        "Turkish",

      status:
        "upcoming",

      direction:
        "ltr",

      url:
        "",

      searchTerms: [
        "Turkish",
        "Türkçe",
        "Turkce",
        "TR"
      ]
    }

  ];


  /* =======================================================
     NAVIGATION
     ======================================================= */

  const NAVIGATION = [

    {
      id:
        "home",

      label:
        "Home",

      url:
        ROUTES.home
    },

    {
      id:
        "explore-languages",

      label:
        "Explore Languages",

      url:
        ROUTES.exploreLanguages
    },

    {
      id:
        "discover",

      label:
        "Discover",

      children: [

        {
          id:
            "latest-documentaries",

          label:
            "Latest Documentaries",

          url:
            ROUTES.latestDocumentaries
        },

        {
          id:
            "featured-documentaries",

          label:
            "Featured Documentaries",

          url:
            ROUTES.featuredDocumentaries
        },

        {
          id:
            "all-documentaries",

          label:
            "All Documentaries",

          url:
            ROUTES.allDocumentaries
        },

        {
          id:
            "documentary-series",

          label:
            "Documentary Series",

          url:
            ROUTES.documentarySeries
        },

        {
          id:
            "topics",

          label:
            "Topics",

          url:
            ROUTES.topics
        },

        {
          id:
            "collections",

          label:
            "Collections",

          url:
            ROUTES.collections
        },

        {
          id:
            "most-viewed",

          label:
            "Most Viewed",

          url:
            ROUTES.mostViewed
        },

        {
          id:
            "editors-picks",

          label:
            "Editor’s Picks",

          url:
            ROUTES.editorsPicks
        },

        {
          id:
            "documentary-archive",

          label:
            "Documentary Archive",

          url:
            ROUTES.documentaryArchive
        }

      ]
    },

    {
      id:
        "topics",

      label:
        "Topics",

      url:
        ROUTES.topics,

      children:
        TOPICS.map(
          (topic) => ({
            id:
              topic.id,

            label:
              topic.name,

            url:
              topic.url
          })
        )
    },

    {
      id:
        "global",

      label:
        "Global",

      children: [

        {
          id:
            "language-editions",

          label:
            "Language Editions",

          url:
            ROUTES.languageEditions
        },

        {
          id:
            "youtube-multi-language-audio",

          label:
            "YouTube Multi-Language Audio",

          url:
            ROUTES.youtubeMultiLanguageAudio
        },

        {
          id:
            "official-social-profiles",

          label:
            "Official Social Profiles",

          url:
            ROUTES.officialSocialProfiles
        },

        {
          id:
            "where-to-watch",

          label:
            "Where to Watch",

          url:
            ROUTES.whereToWatch
        }

      ]
    },

    {
      id:
        "about",

      label:
        "About",

      url:
        ROUTES.about,

      children: [

        {
          id:
            "about-salimgpt",

          label:
            "About SalimGPT",

          url:
            ROUTES.about
        },

        {
          id:
            "salimgpt-story",

          label:
            "SalimGPT Story",

          url:
            ROUTES.salimgptStory
        },

        {
          id:
            "why-salimgpt",

          label:
            "Why SalimGPT",

          url:
            ROUTES.whySalimgpt
        },

        {
          id:
            "mission-vision",

          label:
            "Mission & Vision",

          url:
            ROUTES.missionVision
        },

        {
          id:
            "founder-director",

          label:
            "Founder & Director",

          url:
            ROUTES.founderDirector
        }

      ]
    },

    {
      id:
        "how-we-work",

      label:
        "How We Work",

      children: [

        {
          id:
            "documentary-approach",

          label:
            "Documentary Approach",

          url:
            ROUTES.documentaryApproach
        },

        {
          id:
            "research-methodology",

          label:
            "Research Methodology",

          url:
            ROUTES.researchMethodology
        },

        {
          id:
            "source-evidence-standards",

          label:
            "Source & Evidence Standards",

          url:
            ROUTES.sourceEvidenceStandards
        },

        {
          id:
            "fact-checking",

          label:
            "Fact-Checking",

          url:
            ROUTES.factChecking
        },

        {
          id:
            "editorial-standards",

          label:
            "Editorial Standards",

          url:
            ROUTES.editorialStandards
        },

        {
          id:
            "production-process",

          label:
            "Production Process",

          url:
            ROUTES.productionProcess
        },

        {
          id:
            "human-led-ai-assisted",

          label:
            "Human-Led, AI-Assisted",

          url:
            ROUTES.humanLedAiAssisted
        },

        {
          id:
            "visual-synthetic-media",

          label:
            "Visual & Synthetic Media",

          url:
            ROUTES.visualSyntheticMedia
        },

        {
          id:
            "originality-creative-direction",

          label:
            "Originality & Creative Direction",

          url:
            ROUTES.originalityCreativeDirection
        },

        {
          id:
            "corrections-updates",

          label:
            "Corrections & Updates",

          url:
            ROUTES.correctionsUpdates
        }

      ]
    },

    {
      id:
        "trust",

      label:
        "Trust",

      children: [

        {
          id:
            "transparency",

          label:
            "Transparency",

          url:
            ROUTES.transparency
        },

        {
          id:
            "editorial-independence",

          label:
            "Editorial Independence",

          url:
            ROUTES.editorialIndependence
        },

        {
          id:
            "human-review-standard",

          label:
            "Human Review Standard",

          url:
            ROUTES.humanReviewStandard
        },

        {
          id:
            "ownership-copyright",

          label:
            "Ownership & Copyright",

          url:
            ROUTES.ownershipCopyright
        },

        {
          id:
            "content-use-permissions",

          label:
            "Content Use & Permissions",

          url:
            ROUTES.contentUsePermissions
        }

      ]
    },

    {
      id:
        "help",

      label:
        "Help",

      children: [

        {
          id:
            "faq",

          label:
            "FAQ",

          url:
            ROUTES.faq
        },

        {
          id:
            "search",

          label:
            "Search",

          url:
            ROUTES.search
        },

        {
          id:
            "contact",

          label:
            "Contact",

          url:
            ROUTES.contact
        },

        {
          id:
            "correction-request",

          label:
            "Correction Request",

          url:
            ROUTES.correctionRequest
        },

        {
          id:
            "copyright-request",

          label:
            "Copyright Request",

          url:
            ROUTES.copyrightRequest
        }

      ]
    },

    {
      id:
        "legal",

      label:
        "Legal",

      children: [

        {
          id:
            "privacy",

          label:
            "Privacy",

          url:
            ROUTES.privacy
        },

        {
          id:
            "terms",

          label:
            "Terms",

          url:
            ROUTES.terms
        },

        {
          id:
            "disclaimer",

          label:
            "Disclaimer",

          url:
            ROUTES.disclaimer
        }

      ]
    }

  ];


  /* =======================================================
     FOOTER NAVIGATION
     ======================================================= */

  const FOOTER = {

    primaryLinks: [

      {
        label:
          "About",

        url:
          ROUTES.about
      },

      {
        label:
          "How We Work",

        url:
          ROUTES.documentaryApproach
      },

      {
        label:
          "Trust",

        url:
          ROUTES.transparency
      },

      {
        label:
          "FAQ",

        url:
          ROUTES.faq
      },

      {
        label:
          "Contact",

        url:
          ROUTES.contact
      }

    ],

    legalLinks: [

      {
        label:
          "Privacy",

        url:
          ROUTES.privacy
      },

      {
        label:
          "Terms",

        url:
          ROUTES.terms
      },

      {
        label:
          "Disclaimer",

        url:
          ROUTES.disclaimer
      }

    ]

  };


  /* =======================================================
     EDITORIAL / TRUST MODEL
     ======================================================= */

  const EDITORIAL = {

    researchBased:
      true,

    humanLed:
      true,

    aiAssisted:
      true,

    humanFinalApproval:
      true,

    factChecking:
      true,

    sourceReview:
      true,

    correctionsSupported:
      true,

    principles: [

      "Research",

      "Source verification",

      "Fact-checking",

      "Human editorial judgment",

      "Creative direction",

      "Human review",

      "Final human approval"

    ],

    aiRole: [
      "Research assistance",
      "Drafting assistance",
      "Language and localization assistance",
      "Visual development assistance",
      "Production assistance",
      "Synthetic media assistance where appropriate"
    ]

  };


  /* =======================================================
     DISTRIBUTION MODEL
     ======================================================= */

  const DISTRIBUTION = {

    website:
      SITE.baseUrl,

    youtube: {

      model:
        "single-main-channel",

      multiLanguageAudio:
        true,

      /*
       * No external YouTube URL is defined here until an
       * official channel URL is explicitly confirmed.
       */
      url:
        ""
    },

    socialProfiles: {

      /*
       * Official external profile URLs should only be added
       * after they are explicitly confirmed.
       */
      confirmed:
        [],

      page:
        ROUTES.officialSocialProfiles
    },

    whereToWatch:
      ROUTES.whereToWatch

  };


  /* =======================================================
     SEARCH CONFIGURATION
     ======================================================= */

  const SEARCH = {

    indexVariable:
      "SALIMGPT_SEARCH_INDEX",

    indexFile:
      "data/search-index.js",

    searchPage:
      ROUTES.search,

    menuResultLimit:
      8,

    pageResultLimit:
      30,

    shortcut:
      "Ctrl/Cmd + K"

  };


  /* =======================================================
     FAQ CONFIGURATION
     ======================================================= */

  const FAQ = {

    indexVariable:
      "SALIMGPT_FAQ_INDEX",

    dataFile:
      "data/faq.js",

    page:
      ROUTES.faq

  };


  /* =======================================================
     FORM CONFIGURATION
     ======================================================= */

  const FORMS = {

    /*
     * Static GitHub Pages has no built-in server-side form
     * processor. No endpoint is invented here.
     */

    backendConnected:
      false,

    contact:
      ROUTES.contact,

    correctionRequest:
      ROUTES.correctionRequest,

    copyrightRequest:
      ROUTES.copyrightRequest

  };


  /* =======================================================
     LANGUAGE HELPERS
     ======================================================= */

  const getLanguage = (
    languageCode
  ) => {
    const code =
      String(
        languageCode || ""
      )
        .toLowerCase()
        .replace(
          /_/g,
          "-"
        )
        .split("-")[0];


    return (
      LANGUAGES.find(
        (language) =>
          language.code === code
      ) ||
      null
    );
  };


  const getAvailableLanguages =
    () => {
      return LANGUAGES.filter(
        (language) =>
          language.status ===
          "available"
      );
    };


  const getUpcomingLanguages =
    () => {
      return LANGUAGES.filter(
        (language) =>
          language.status ===
          "upcoming"
      );
    };


  /* =======================================================
     NAVIGATION HELPERS
     ======================================================= */

  const findNavigationItem = (
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


    for (const group of NAVIGATION) {

      if (
        String(
          group.id
        ).toLowerCase() ===
        wanted
      ) {
        return group;
      }


      if (
        Array.isArray(
          group.children
        )
      ) {
        const child =
          group.children.find(
            (item) =>
              String(
                item.id
              ).toLowerCase() ===
              wanted
          );


        if (child) {
          return child;
        }
      }
    }


    return null;
  };


  /* =======================================================
     ROUTE LOOKUP
     ======================================================= */

  const findRouteByUrl = (
    url
  ) => {
    let target;


    try {
      target =
        new URL(
          url,
          SITE.baseUrl
        ).href;
    } catch {
      return "";
    }


    for (
      const [
        key,
        value
      ]
      of Object.entries(
        ROUTES
      )
    ) {
      if (
        value === target
      ) {
        return key;
      }
    }


    return "";
  };


  /* =======================================================
     FULL PUBLIC CONFIG
     ======================================================= */

  const DATA = {

    version:
      1,

    site:
      SITE,

    brand:
      BRAND,

    routes:
      ROUTES,

    topics:
      TOPICS,

    languages:
      LANGUAGES,

    navigation:
      NAVIGATION,

    footer:
      FOOTER,

    editorial:
      EDITORIAL,

    distribution:
      DISTRIBUTION,

    search:
      SEARCH,

    faq:
      FAQ,

    forms:
      FORMS

  };


  /* =======================================================
     PRIMARY PUBLIC VARIABLES
     ======================================================= */

  global.SALIMGPT_SITE =
    DATA;


  global.SALIMGPT_SITE_DATA =
    DATA;


  global.SALIMGPT_ROUTES =
    ROUTES;


  global.SALIMGPT_NAVIGATION =
    NAVIGATION;


  global.SALIMGPT_TOPICS =
    TOPICS;


  global.SALIMGPT_LANGUAGES =
    LANGUAGES;


  global.SALIMGPT_BRAND =
    BRAND;


  /* =======================================================
     COMPATIBILITY ALIASES
     ======================================================= */

  global.salimgptSite =
    DATA;


  global.salimgptRoutes =
    ROUTES;


  global.salimgptNavigation =
    NAVIGATION;


  global.salimgptTopics =
    TOPICS;


  global.salimgptLanguages =
    LANGUAGES;


  /* =======================================================
     PUBLIC HELPERS
     ======================================================= */

  global.SalimGPTData = {

    getSite() {
      return SITE;
    },


    getBrand() {
      return BRAND;
    },


    getRoutes() {
      return {
        ...ROUTES
      };
    },


    getRoute(
      routeName
    ) {
      return (
        ROUTES[
          routeName
        ] ||
        ""
      );
    },


    getTopics() {
      return [
        ...TOPICS
      ];
    },


    getLanguages() {
      return [
        ...LANGUAGES
      ];
    },


    getAvailableLanguages() {
      return getAvailableLanguages();
    },


    getUpcomingLanguages() {
      return getUpcomingLanguages();
    },


    getLanguage(
      languageCode
    ) {
      return getLanguage(
        languageCode
      );
    },


    getNavigation() {
      return [
        ...NAVIGATION
      ];
    },


    findNavigationItem(
      id
    ) {
      return findNavigationItem(
        id
      );
    },


    findRouteByUrl(
      url
    ) {
      return findRouteByUrl(
        url
      );
    },


    toUrl(
      pathname
    ) {
      return route(
        pathname
      );
    }

  };


  /* =======================================================
     READY FLAG
     ======================================================= */

  if (
    typeof document !==
    "undefined"
  ) {
    document.documentElement
      .dataset
      .siteDataReady =
        "true";


    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:data-ready",
          {
            detail: {
              version:
                DATA.version,

              languageCount:
                LANGUAGES.length,

              topicCount:
                TOPICS.length,

              routeCount:
                Object.keys(
                  ROUTES
                ).length
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