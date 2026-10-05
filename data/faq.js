"use strict";

/* =========================================================
   SalimGPT Global
   File: data/faq.js

   FAQ Data Bootstrap / Generated-Data Target

   Primary source:
   - help/faq/index.html

   Generator:
   - scripts/build-faq-index.js

   Purpose:
   - Provide a safe initial FAQ data structure
   - Support js/faq.js before the first build
   - Expose stable global FAQ variables
   - Expose FAQ lookup/search helpers
   - Never invent FAQ questions or answers
   - Be replaced automatically by the FAQ build script

   Important:
   This file intentionally starts with no fabricated FAQ
   entries. Run the FAQ builder after the canonical FAQ page
   has been created or updated:

   npm run build:faq

   The generated version of this file will contain the real
   questions and answers extracted from:
   help/faq/index.html
   ========================================================= */

(function (global) {

  /* =======================================================
     CONFIG
     ======================================================= */

  const BASE_URL =
    "https://salimgpt.github.io/salimgpt/";


  const FAQ_URL =
    `${BASE_URL}help/faq/`;


  const SOURCE_FILE =
    "help/faq/index.html";


  const BUILDER_FILE =
    "scripts/build-faq-index.js";


  /* =======================================================
     PAGE INFORMATION

     Keep this generic in the bootstrap file.

     The build script replaces these values with metadata
     extracted from the actual FAQ page.
     ======================================================= */

  const PAGE = {

    title:
      "FAQ | SalimGPT",

    heading:
      "Frequently Asked Questions",

    description:
      "",

    url:
      FAQ_URL

  };


  /* =======================================================
     FAQ GROUPS

     Intentionally empty.

     The generated file will contain records such as:

     {
       id: "...",
       title: "...",
       eyebrow: "...",
       position: 1,
       url: "...",
       count: 3,
       questionIds: [...]
     }
     ======================================================= */

  const GROUPS = [];


  /* =======================================================
     FAQ ITEMS

     Intentionally empty.

     Questions and answers must come from the canonical FAQ
     page rather than being duplicated or invented here.

     The generated file will contain records such as:

     {
       id: "...",
       groupId: "...",
       groupTitle: "...",
       groupEyebrow: "...",
       position: 1,
       groupPosition: 1,
       question: "...",
       answer: "...",
       links: [...],
       url: "...",
       searchText: "..."
     }
     ======================================================= */

  const ITEMS = [];


  /* =======================================================
     TEXT NORMALIZATION
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


    /*
     * Remove decomposed Latin accents while preserving
     * Bengali, Hindi, Arabic and other writing systems.
     */
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
     FAQ ITEM SEARCH TEXT
     ======================================================= */

  const getSearchText = (
    item
  ) => {
    if (
      !item ||
      typeof item !==
        "object"
    ) {
      return "";
    }


    return normalizeText(
      [
        item.question,
        item.answer,
        item.groupTitle,
        item.groupEyebrow,
        item.searchText,
        ...(Array.isArray(
          item.links
        )
          ? item.links.map(
              (link) =>
                link &&
                link.text
                  ? link.text
                  : ""
            )
          : [])
      ]
        .filter(Boolean)
        .join(" ")
    );
  };


  /* =======================================================
     FIND FAQ BY ID
     ======================================================= */

  const getFaqById = (
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
      ITEMS.find(
        (item) =>
          String(
            item.id || ""
          )
            .toLowerCase() ===
          wanted
      ) ||
      null
    );
  };


  /* =======================================================
     FIND FAQ GROUP
     ======================================================= */

  const getGroupById = (
    groupId
  ) => {
    const wanted =
      String(
        groupId || ""
      )
        .trim()
        .toLowerCase();


    if (!wanted) {
      return null;
    }


    return (
      GROUPS.find(
        (group) =>
          String(
            group.id || ""
          )
            .toLowerCase() ===
          wanted
      ) ||
      null
    );
  };


  /* =======================================================
     FAQS BY GROUP
     ======================================================= */

  const getFaqsByGroup = (
    groupId
  ) => {
    const wanted =
      String(
        groupId || ""
      )
        .trim()
        .toLowerCase();


    if (!wanted) {
      return [];
    }


    return ITEMS.filter(
      (item) =>
        String(
          item.groupId || ""
        )
          .toLowerCase() ===
        wanted
    );
  };


  /* =======================================================
     FIND FAQ BY QUESTION
     ======================================================= */

  const getFaqByQuestion = (
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
      ITEMS.find(
        (item) =>
          normalizeText(
            item.question
          ) === wanted
      ) ||
      null
    );
  };


  /* =======================================================
     SEARCH SCORING
     ======================================================= */

  const scoreFaq = (
    item,
    normalizedQuery,
    terms
  ) => {
    const question =
      normalizeText(
        item.question
      );


    const answer =
      normalizeText(
        item.answer
      );


    const group =
      normalizeText(
        item.groupTitle
      );


    const searchable =
      getSearchText(
        item
      );


    /*
     * All terms must occur somewhere in the FAQ entry.
     */
    const allTermsPresent =
      terms.every(
        (term) =>
          searchable.includes(
            term
          )
      );


    if (!allTermsPresent) {
      return 0;
    }


    let score = 0;


    /* -----------------------------------------------------
       Full-query relevance
       ----------------------------------------------------- */

    if (
      question ===
      normalizedQuery
    ) {
      score += 300;
    } else if (
      question.startsWith(
        normalizedQuery
      )
    ) {
      score += 180;
    } else if (
      question.includes(
        normalizedQuery
      )
    ) {
      score += 120;
    }


    if (
      group ===
      normalizedQuery
    ) {
      score += 80;
    } else if (
      group.includes(
        normalizedQuery
      )
    ) {
      score += 40;
    }


    if (
      answer.includes(
        normalizedQuery
      )
    ) {
      score += 35;
    }


    /* -----------------------------------------------------
       Individual term relevance
       ----------------------------------------------------- */

    terms.forEach(
      (term) => {

        if (
          question.includes(
            term
          )
        ) {
          score += 24;
        }


        if (
          group.includes(
            term
          )
        ) {
          score += 12;
        }


        if (
          answer.includes(
            term
          )
        ) {
          score += 8;
        }


        if (
          searchable.includes(
            term
          )
        ) {
          score += 2;
        }

      }
    );


    return score;
  };


  /* =======================================================
     SEARCH FAQ
     ======================================================= */

  const searchFaq = (
    query,
    {
      limit = 50
    } = {}
  ) => {
    const normalizedQuery =
      normalizeText(
        query
      );


    if (!normalizedQuery) {
      return [];
    }


    const terms =
      normalizedQuery
        .split(" ")
        .filter(Boolean);


    if (!terms.length) {
      return [];
    }


    const numericLimit =
      Number(limit);


    const finalLimit =
      Number.isFinite(
        numericLimit
      ) &&
      numericLimit > 0
        ? Math.floor(
            numericLimit
          )
        : 50;


    return ITEMS

      .map(
        (item) => ({
          item,

          score:
            scoreFaq(
              item,
              normalizedQuery,
              terms
            )
        })
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


          return (
            Number(
              a.item.position || 0
            ) -
            Number(
              b.item.position || 0
            )
          );

        }
      )

      .slice(
        0,
        finalLimit
      )

      .map(
        (result) =>
          result.item
      );
  };


  /* =======================================================
     FAQ SCHEMA ITEMS
     ======================================================= */

  const createSchemaItems =
    () => {
      return ITEMS

        .filter(
          (item) =>
            item.question &&
            item.answer
        )

        .map(
          (item) => ({
            "@type":
              "Question",

            "name":
              item.question,

            "acceptedAnswer": {
              "@type":
                "Answer",

              "text":
                item.answer
            }
          })
        );
    };


  /* =======================================================
     FAQPAGE SCHEMA
     ======================================================= */

  const createFaqSchema =
    () => {
      return {
        "@context":
          "https://schema.org",

        "@type":
          "FAQPage",

        "mainEntity":
          createSchemaItems()
      };
    };


  /* =======================================================
     COUNTS
     ======================================================= */

  const getCounts = () => {
    return {

      groups:
        GROUPS.length,

      questions:
        ITEMS.length,

      answered:
        ITEMS.filter(
          (item) =>
            Boolean(
              String(
                item.answer || ""
              ).trim()
            )
        ).length

    };
  };


  /* =======================================================
     DATA META
     ======================================================= */

  const META = {

    version:
      1,

    generated:
      false,

    source:
      SOURCE_FILE,

    builder:
      BUILDER_FILE,

    url:
      FAQ_URL,

    groupCount:
      GROUPS.length,

    questionCount:
      ITEMS.length

  };


  /* =======================================================
     PRIMARY GLOBAL VARIABLES

     These names match the generated output created by:
     scripts/build-faq-index.js
     ======================================================= */

  global.SALIMGPT_FAQ_PAGE =
    PAGE;


  global.SALIMGPT_FAQ_GROUPS =
    GROUPS;


  global.SALIMGPT_FAQ_INDEX =
    ITEMS;


  global.SALIMGPT_FAQ =
    ITEMS;


  global.SALIMGPT_FAQ_SCHEMA =
    createFaqSchema();


  global.SALIMGPT_FAQ_META =
    META;


  /* =======================================================
     COMPATIBILITY ALIASES
     ======================================================= */

  global.salimgptFaq =
    ITEMS;


  global.salimgptFaqIndex =
    ITEMS;


  global.salimgptFaqGroups =
    GROUPS;


  global.salimgptFaqPage =
    PAGE;


  /* =======================================================
     GENERATED-BUILDER COMPATIBILITY HELPERS

     build-faq-index.js also exposes these names.
     Keeping them here means js/faq.js and other components
     behave consistently before and after a build.
     ======================================================= */

  global.getSalimGPTFaqById =
    function getSalimGPTFaqById(
      id
    ) {
      return getFaqById(
        id
      );
    };


  global.getSalimGPTFaqByGroup =
    function getSalimGPTFaqByGroup(
      groupId
    ) {
      return getFaqsByGroup(
        groupId
      );
    };


  global.searchSalimGPTFaq =
    function searchSalimGPTFaq(
      query
    ) {
      return searchFaq(
        query
      );
    };


  /* =======================================================
     PUBLIC API
     ======================================================= */

  global.SalimGPTFAQData = {

    version:
      META.version,


    isGenerated() {
      return Boolean(
        META.generated
      );
    },


    getPage() {
      return {
        ...PAGE
      };
    },


    getGroups() {
      return GROUPS.map(
        (group) => ({
          ...group,

          questionIds:
            Array.isArray(
              group.questionIds
            )
              ? [
                  ...group.questionIds
                ]
              : []
        })
      );
    },


    getItems() {
      return ITEMS.map(
        (item) => ({
          ...item,

          headings:
            Array.isArray(
              item.headings
            )
              ? [
                  ...item.headings
                ]
              : item.headings,

          links:
            Array.isArray(
              item.links
            )
              ? item.links.map(
                  (link) => ({
                    ...link
                  })
                )
              : []
        })
      );
    },


    getById(
      id
    ) {
      return getFaqById(
        id
      );
    },


    getByQuestion(
      question
    ) {
      return getFaqByQuestion(
        question
      );
    },


    getGroupById(
      groupId
    ) {
      return getGroupById(
        groupId
      );
    },


    getByGroup(
      groupId
    ) {
      return getFaqsByGroup(
        groupId
      );
    },


    search(
      query,
      options = {}
    ) {
      return searchFaq(
        query,
        options
      );
    },


    getCounts() {
      return {
        ...getCounts()
      };
    },


    getSchema() {
      return createFaqSchema();
    },


    getSourceFile() {
      return SOURCE_FILE;
    },


    getBuilderFile() {
      return BUILDER_FILE;
    },


    getUrl() {
      return FAQ_URL;
    },


    normalize(
      value
    ) {
      return normalizeText(
        value
      );
    }

  };


  /* =======================================================
     DOCUMENT STATE
     ======================================================= */

  if (
    typeof document !==
    "undefined"
  ) {
    const counts =
      getCounts();


    document.documentElement
      .dataset
      .faqDataReady =
        "true";


    document.documentElement
      .dataset
      .faqDataGenerated =
        META.generated
          ? "true"
          : "false";


    document.documentElement
      .dataset
      .faqDataCount =
        String(
          counts.questions
        );


    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:faq-data-ready",
          {
            detail: {
              generated:
                META.generated,

              groupCount:
                counts.groups,

              questionCount:
                counts.questions,

              source:
                SOURCE_FILE
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
