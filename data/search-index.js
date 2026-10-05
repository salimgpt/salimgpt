"use strict";

/* =========================================================
   SalimGPT Global
   File: data/search-index.js

   Global Search Index Bootstrap / Generated-Data Target

   Generator:
   - scripts/build-search-index.js

   Search controller:
   - js/global-search.js

   Purpose:
   - Provide a safe initial search-index structure
   - Expose stable search-index global variables
   - Avoid fabricated page titles or descriptions
   - Keep search functional before the first build
   - Be replaced automatically by build-search-index.js

   Important:
   This bootstrap intentionally contains no invented search
   entries.

   Generate the real index with:

   npm run build:search

   The builder scans the actual SalimGPT HTML pages and
   replaces this file with the generated search data.
   ========================================================= */

(function (global) {

  /* =======================================================
     CONFIG
     ======================================================= */

  const BASE_URL =
    "https://salimgpt.github.io/salimgpt/";


  const SOURCE =
    "SalimGPT HTML pages";


  const BUILDER =
    "scripts/build-search-index.js";


  /* =======================================================
     SEARCH INDEX

     Intentionally empty.

     The generated version of this file will contain entries
     extracted from the actual site pages.

     Generated entry structure:

     {
       id: "...",
       title: "...",
       description: "...",
       url: "...",
       route: "...",
       category: "...",
       subcategory: "...",
       h1: "...",
       headings: [...],
       keywords: [...],
       image: "...",
       text: "..."
     }
     ======================================================= */

  const INDEX = [];


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
     * Accent-insensitive Latin search while preserving
     * Bengali, Hindi, Arabic and other writing systems.
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
     SAFE ARRAY
     ======================================================= */

  const toArray = (
    value
  ) => {
    return Array.isArray(
      value
    )
      ? value
      : [];
  };


  /* =======================================================
     BUILD SEARCHABLE TEXT
     ======================================================= */

  const getSearchableText = (
    entry
  ) => {
    if (
      !entry ||
      typeof entry !==
        "object"
    ) {
      return "";
    }


    return normalizeText(
      [
        entry.title,
        entry.h1,
        entry.description,
        entry.category,
        entry.subcategory,
        ...toArray(
          entry.headings
        ),
        ...toArray(
          entry.keywords
        ),
        entry.text
      ]
        .filter(Boolean)
        .join(" ")
    );
  };


  /* =======================================================
     FIND ENTRY BY ID
     ======================================================= */

  const getEntryById = (
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
      INDEX.find(
        (entry) =>
          String(
            entry.id || ""
          )
            .trim()
            .toLowerCase() ===
          wanted
      ) ||
      null
    );
  };


  /* =======================================================
     FIND ENTRY BY URL
     ======================================================= */

  const getEntryByUrl = (
    url
  ) => {
    if (!url) {
      return null;
    }


    let wanted;


    try {
      wanted =
        new URL(
          url,
          BASE_URL
        ).href;
    } catch {
      return null;
    }


    return (
      INDEX.find(
        (entry) => {
          if (!entry.url) {
            return false;
          }


          try {
            return (
              new URL(
                entry.url,
                BASE_URL
              ).href === wanted
            );
          } catch {
            return false;
          }
        }
      ) ||
      null
    );
  };


  /* =======================================================
     FIND ENTRY BY ROUTE
     ======================================================= */

  const normalizeRoute = (
    route
  ) => {
    let value =
      String(
        route || ""
      )
        .trim()
        .replace(
          /\\/g,
          "/"
        );


    if (
      value === "/" ||
      value === ""
    ) {
      return "/";
    }


    value =
      value.replace(
        /^\/+/,
        ""
      );


    value =
      value.replace(
        /index\.html$/i,
        ""
      );


    if (
      !value.endsWith("/")
    ) {
      value += "/";
    }


    return value;
  };


  const getEntryByRoute = (
    route
  ) => {
    const wanted =
      normalizeRoute(
        route
      );


    return (
      INDEX.find(
        (entry) =>
          normalizeRoute(
            entry.route
          ) === wanted
      ) ||
      null
    );
  };


  /* =======================================================
     GET ENTRIES BY CATEGORY
     ======================================================= */

  const getEntriesByCategory = (
    category
  ) => {
    const wanted =
      normalizeText(
        category
      );


    if (!wanted) {
      return [];
    }


    return INDEX.filter(
      (entry) =>
        normalizeText(
          entry.category
        ) === wanted
    );
  };


  /* =======================================================
     GET ENTRIES BY SUBCATEGORY
     ======================================================= */

  const getEntriesBySubcategory = (
    subcategory
  ) => {
    const wanted =
      normalizeText(
        subcategory
      );


    if (!wanted) {
      return [];
    }


    return INDEX.filter(
      (entry) =>
        normalizeText(
          entry.subcategory
        ) === wanted
    );
  };


  /* =======================================================
     SEARCH TERMS
     ======================================================= */

  const getTerms = (
    query
  ) => {
    return normalizeText(
      query
    )
      .split(" ")
      .filter(Boolean);
  };


  /* =======================================================
     SEARCH SCORE
     ======================================================= */

  const scoreEntry = (
    entry,
    normalizedQuery,
    terms
  ) => {
    const title =
      normalizeText(
        entry.title
      );


    const h1 =
      normalizeText(
        entry.h1
      );


    const description =
      normalizeText(
        entry.description
      );


    const category =
      normalizeText(
        entry.category
      );


    const subcategory =
      normalizeText(
        entry.subcategory
      );


    const headings =
      normalizeText(
        toArray(
          entry.headings
        ).join(" ")
      );


    const keywords =
      normalizeText(
        toArray(
          entry.keywords
        ).join(" ")
      );


    const body =
      normalizeText(
        entry.text
      );


    const searchable =
      getSearchableText(
        entry
      );


    /*
     * Every entered term must appear somewhere in
     * the page data.
     */
    if (
      !terms.every(
        (term) =>
          searchable.includes(
            term
          )
      )
    ) {
      return 0;
    }


    let score = 0;


    /* -----------------------------------------------------
       Exact / phrase weighting
       ----------------------------------------------------- */

    if (
      title ===
      normalizedQuery
    ) {
      score += 500;
    } else if (
      title.startsWith(
        normalizedQuery
      )
    ) {
      score += 220;
    } else if (
      title.includes(
        normalizedQuery
      )
    ) {
      score += 150;
    }


    if (
      h1 ===
      normalizedQuery
    ) {
      score += 180;
    } else if (
      h1.includes(
        normalizedQuery
      )
    ) {
      score += 90;
    }


    if (
      subcategory ===
      normalizedQuery
    ) {
      score += 120;
    } else if (
      subcategory.includes(
        normalizedQuery
      )
    ) {
      score += 65;
    }


    if (
      category ===
      normalizedQuery
    ) {
      score += 90;
    } else if (
      category.includes(
        normalizedQuery
      )
    ) {
      score += 45;
    }


    if (
      keywords.includes(
        normalizedQuery
      )
    ) {
      score += 70;
    }


    if (
      headings.includes(
        normalizedQuery
      )
    ) {
      score += 45;
    }


    if (
      description.includes(
        normalizedQuery
      )
    ) {
      score += 30;
    }


    if (
      body.includes(
        normalizedQuery
      )
    ) {
      score += 10;
    }


    /* -----------------------------------------------------
       Individual word weighting
       ----------------------------------------------------- */

    terms.forEach(
      (term) => {

        if (
          title.includes(
            term
          )
        ) {
          score += 35;
        }


        if (
          h1.includes(
            term
          )
        ) {
          score += 28;
        }


        if (
          keywords.includes(
            term
          )
        ) {
          score += 24;
        }


        if (
          subcategory.includes(
            term
          )
        ) {
          score += 20;
        }


        if (
          category.includes(
            term
          )
        ) {
          score += 16;
        }


        if (
          headings.includes(
            term
          )
        ) {
          score += 12;
        }


        if (
          description.includes(
            term
          )
        ) {
          score += 8;
        }


        if (
          body.includes(
            term
          )
        ) {
          score += 3;
        }

      }
    );


    return score;
  };


  /* =======================================================
     SEARCH INDEX
     ======================================================= */

  const searchIndex = (
    query,
    {
      limit = 30,
      category = ""
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
      getTerms(
        normalizedQuery
      );


    if (!terms.length) {
      return [];
    }


    const normalizedCategory =
      normalizeText(
        category
      );


    const numericLimit =
      Number(
        limit
      );


    const finalLimit =
      Number.isFinite(
        numericLimit
      ) &&
      numericLimit > 0
        ? Math.floor(
            numericLimit
          )
        : 30;


    return INDEX

      .filter(
        (entry) => {
          if (
            !normalizedCategory
          ) {
            return true;
          }


          return (
            normalizeText(
              entry.category
            ) ===
            normalizedCategory
          );
        }
      )

      .map(
        (
          entry,
          position
        ) => ({
          entry,

          position,

          score:
            scoreEntry(
              entry,
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


          const titleCompare =
            String(
              a.entry.title || ""
            ).localeCompare(
              String(
                b.entry.title || ""
              ),
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
            a.position -
            b.position
          );

        }
      )

      .slice(
        0,
        finalLimit
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
     CATEGORIES
     ======================================================= */

  const getCategories = () => {
    return Array.from(
      new Set(
        INDEX
          .map(
            (entry) =>
              String(
                entry.category || ""
              ).trim()
          )
          .filter(Boolean)
      )
    )
      .sort(
        (a, b) =>
          a.localeCompare(
            b,
            "en",
            {
              sensitivity:
                "base"
            }
          )
      );
  };


  /* =======================================================
     META
     ======================================================= */

  const META = {

    version:
      1,

    generated:
      false,

    source:
      SOURCE,

    builder:
      BUILDER,

    baseUrl:
      BASE_URL,

    count:
      INDEX.length

  };


  /* =======================================================
     PRIMARY GLOBAL VARIABLES

     These names intentionally match the generated output
     produced by scripts/build-search-index.js.
     ======================================================= */

  global.SALIMGPT_SEARCH_INDEX =
    INDEX;


  global.salimgptSearchIndex =
    INDEX;


  global.SALIMGPT_SEARCH_META =
    META;


  /* =======================================================
     PUBLIC DATA API
     ======================================================= */

  global.SalimGPTSearchData = {

    version:
      META.version,


    isGenerated() {
      return Boolean(
        META.generated
      );
    },


    getAll() {
      return INDEX.map(
        (entry) => ({
          ...entry,

          headings:
            toArray(
              entry.headings
            ).slice(),

          keywords:
            toArray(
              entry.keywords
            ).slice()
        })
      );
    },


    getCount() {
      return INDEX.length;
    },


    getById(
      id
    ) {
      return getEntryById(
        id
      );
    },


    getByUrl(
      url
    ) {
      return getEntryByUrl(
        url
      );
    },


    getByRoute(
      route
    ) {
      return getEntryByRoute(
        route
      );
    },


    getByCategory(
      category
    ) {
      return getEntriesByCategory(
        category
      );
    },


    getBySubcategory(
      subcategory
    ) {
      return getEntriesBySubcategory(
        subcategory
      );
    },


    getCategories() {
      return getCategories();
    },


    search(
      query,
      options = {}
    ) {
      return searchIndex(
        query,
        options
      );
    },


    normalize(
      value
    ) {
      return normalizeText(
        value
      );
    },


    normalizeRoute(
      route
    ) {
      return normalizeRoute(
        route
      );
    },


    getMeta() {
      return {
        ...META
      };
    },


    getBaseUrl() {
      return BASE_URL;
    },


    getBuilderFile() {
      return BUILDER;
    }

  };


  /* =======================================================
     DOCUMENT STATE
     ======================================================= */

  if (
    typeof document !==
    "undefined"
  ) {
    document.documentElement
      .dataset
      .searchDataReady =
        "true";


    document.documentElement
      .dataset
      .searchDataGenerated =
        META.generated
          ? "true"
          : "false";


    document.documentElement
      .dataset
      .searchDataCount =
        String(
          INDEX.length
        );


    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:search-data-ready",
          {
            detail: {
              generated:
                META.generated,

              count:
                INDEX.length,

              source:
                SOURCE
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