"use strict";

/* =========================================================
   SalimGPT Global
   File: scripts/build-faq-index.js

   Static FAQ index generator for GitHub Pages.

   Source:
   - help/faq/index.html

   Output:
   - data/faq.js

   Responsibilities:
   - Read the canonical FAQ page
   - Extract FAQ groups
   - Extract questions and answers
   - Extract useful internal links
   - Generate stable FAQ IDs
   - Create browser-ready FAQ data
   - Create FAQ group metadata
   - Create FAQ search text
   - Validate duplicate questions / IDs
   - Require no external npm dependencies

   Node.js: >= 18
   ========================================================= */


const fs = require("fs");
const path = require("path");


/* =========================================================
   CONFIG
   ========================================================= */

const PROJECT_ROOT =
  path.resolve(__dirname, "..");


const SOURCE_FILE =
  path.join(
    PROJECT_ROOT,
    "help",
    "faq",
    "index.html"
  );


const OUTPUT_FILE =
  path.join(
    PROJECT_ROOT,
    "data",
    "faq.js"
  );


const BASE_URL =
  "https://salimgpt.github.io/salimgpt/";


const FAQ_URL =
  `${BASE_URL}help/faq/`;


const MINIMUM_NODE_MAJOR = 18;


const MAX_QUESTION_LENGTH = 300;


const MAX_ANSWER_LENGTH = 5000;


const MAX_LINKS_PER_ANSWER = 12;


/* =========================================================
   TERMINAL COLORS
   ========================================================= */

const supportsColor =
  Boolean(process.stdout.isTTY) &&
  process.env.NO_COLOR === undefined;


const color = {
  reset:
    supportsColor
      ? "\x1b[0m"
      : "",

  bold:
    supportsColor
      ? "\x1b[1m"
      : "",

  red:
    supportsColor
      ? "\x1b[31m"
      : "",

  green:
    supportsColor
      ? "\x1b[32m"
      : "",

  yellow:
    supportsColor
      ? "\x1b[33m"
      : "",

  blue:
    supportsColor
      ? "\x1b[34m"
      : "",

  gray:
    supportsColor
      ? "\x1b[90m"
      : ""
};


/* =========================================================
   LOG HELPERS
   ========================================================= */

function success(message) {
  console.log(
    `${color.green}✓${color.reset} ${message}`
  );
}


function info(message) {
  console.log(
    `${color.blue}•${color.reset} ${message}`
  );
}


function warning(message) {
  console.log(
    `${color.yellow}⚠${color.reset} ${message}`
  );
}


function fail(message) {
  console.error(
    `${color.red}✗${color.reset} ${message}`
  );
}


/* =========================================================
   NODE VERSION
   ========================================================= */

function validateNodeVersion() {
  const major =
    Number(
      process.versions.node
        .split(".")[0]
    );


  if (
    !Number.isInteger(major) ||
    major < MINIMUM_NODE_MAJOR
  ) {
    throw new Error(
      `Node.js ${MINIMUM_NODE_MAJOR}+ is required. Current version: ${process.versions.node}`
    );
  }
}


/* =========================================================
   BASIC PATH HELPERS
   ========================================================= */

function normalizeSlashes(value) {
  return String(value || "")
    .replace(/\\/g, "/");
}


function relativeToProject(filePath) {
  return normalizeSlashes(
    path.relative(
      PROJECT_ROOT,
      filePath
    )
  );
}


/* =========================================================
   HTML ENTITY DECODER
   ========================================================= */

function decodeHtmlEntities(value) {
  if (!value) {
    return "";
  }


  const namedEntities = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: "\"",
    apos: "'",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    hellip: "…",
    rsquo: "’",
    lsquo: "‘",
    rdquo: "”",
    ldquo: "“",
    copy: "©",
    reg: "®",
    trade: "™"
  };


  return String(value)

    .replace(
      /&#(\d+);/g,
      (_, number) => {
        const codePoint =
          Number(number);


        if (
          !Number.isFinite(codePoint) ||
          codePoint < 0
        ) {
          return "";
        }


        try {
          return String.fromCodePoint(
            codePoint
          );
        } catch {
          return "";
        }
      }
    )

    .replace(
      /&#x([0-9a-f]+);/gi,
      (_, hex) => {
        const codePoint =
          parseInt(hex, 16);


        if (
          !Number.isFinite(codePoint) ||
          codePoint < 0
        ) {
          return "";
        }


        try {
          return String.fromCodePoint(
            codePoint
          );
        } catch {
          return "";
        }
      }
    )

    .replace(
      /&([a-z][a-z0-9]+);/gi,
      (match, name) => {
        const key =
          name.toLowerCase();


        return Object.prototype
          .hasOwnProperty.call(
            namedEntities,
            key
          )
          ? namedEntities[key]
          : match;
      }
    );
}


/* =========================================================
   TEXT NORMALIZATION
   ========================================================= */

function normalizeWhitespace(value) {
  return decodeHtmlEntities(
    value || ""
  )
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/* =========================================================
   STRIP HTML
   ========================================================= */

function stripTags(value) {
  return normalizeWhitespace(
    String(value || "")

      .replace(
        /<!--[\s\S]*?-->/g,
        " "
      )

      .replace(
        /<script\b[^>]*>[\s\S]*?<\/script>/gi,
        " "
      )

      .replace(
        /<style\b[^>]*>[\s\S]*?<\/style>/gi,
        " "
      )

      .replace(
        /<svg\b[^>]*>[\s\S]*?<\/svg>/gi,
        " "
      )

      .replace(
        /<br\s*\/?>/gi,
        " "
      )

      .replace(
        /<\/(?:p|div|li|h1|h2|h3|h4|h5|h6|summary)>/gi,
        " "
      )

      .replace(
        /<[^>]+>/g,
        " "
      )
  );
}


/* =========================================================
   GET ATTRIBUTE
   ========================================================= */

function getAttribute(
  tag,
  attributeName
) {
  const escaped =
    attributeName.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );


  const regex =
    new RegExp(
      `\\b${escaped}\\s*=\\s*["']([^"']*)["']`,
      "i"
    );


  const match =
    String(tag || "")
      .match(regex);


  return match
    ? match[1].trim()
    : "";
}


/* =========================================================
   EXTRACT FIRST TAG TEXT
   ========================================================= */

function extractFirstTagText(
  html,
  tagName
) {
  const regex =
    new RegExp(
      `<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`,
      "i"
    );


  const match =
    String(html || "")
      .match(regex);


  return match
    ? stripTags(match[1])
    : "";
}


/* =========================================================
   GET DOCUMENT TITLE
   ========================================================= */

function extractDocumentTitle(html) {
  const title =
    extractFirstTagText(
      html,
      "title"
    );


  if (!title) {
    return "";
  }


  return title.trim();
}


/* =========================================================
   GET META DESCRIPTION
   ========================================================= */

function extractMetaDescription(html) {
  const metaTags =
    String(html || "")
      .match(
        /<meta\b[^>]*>/gi
      ) || [];


  for (const tag of metaTags) {
    const name =
      getAttribute(
        tag,
        "name"
      )
        .toLowerCase();


    if (
      name !==
      "description"
    ) {
      continue;
    }


    return normalizeWhitespace(
      getAttribute(
        tag,
        "content"
      )
    );
  }


  return "";
}


/* =========================================================
   GET CANONICAL
   ========================================================= */

function extractCanonicalUrl(html) {
  const links =
    String(html || "")
      .match(
        /<link\b[^>]*>/gi
      ) || [];


  for (const tag of links) {
    const rel =
      getAttribute(
        tag,
        "rel"
      )
        .toLowerCase()
        .split(/\s+/);


    if (
      !rel.includes(
        "canonical"
      )
    ) {
      continue;
    }


    const href =
      getAttribute(
        tag,
        "href"
      );


    if (href) {
      return href;
    }
  }


  return FAQ_URL;
}


/* =========================================================
   SLUGIFY
   ========================================================= */

function slugify(value) {
  const normalized =
    normalizeWhitespace(value)
      .toLowerCase()

      .replace(
        /[’‘']/g,
        ""
      )

      .replace(
        /&/g,
        " and "
      )

      .replace(
        /[^a-z0-9]+/g,
        "-"
      )

      .replace(
        /-+/g,
        "-"
      )

      .replace(
        /^-+|-+$/g,
        ""
      );


  return normalized || "faq";
}


/* =========================================================
   ENSURE UNIQUE ID
   ========================================================= */

function createUniqueId(
  preferredId,
  usedIds
) {
  const baseId =
    slugify(preferredId);


  if (
    !usedIds.has(baseId)
  ) {
    usedIds.add(baseId);

    return baseId;
  }


  let counter = 2;


  while (
    usedIds.has(
      `${baseId}-${counter}`
    )
  ) {
    counter += 1;
  }


  const finalId =
    `${baseId}-${counter}`;


  usedIds.add(finalId);


  return finalId;
}


/* =========================================================
   URL RESOLUTION
   ========================================================= */

function resolveUrl(
  rawUrl,
  baseUrl = FAQ_URL
) {
  const value =
    String(rawUrl || "")
      .trim();


  if (!value) {
    return "";
  }


  if (
    value.startsWith("#")
  ) {
    return `${baseUrl.split("#")[0]}${value}`;
  }


  try {
    return new URL(
      value,
      baseUrl
    ).href;
  } catch {
    return value;
  }
}


/* =========================================================
   EXTRACT LINKS
   ========================================================= */

function extractLinks(
  html,
  baseUrl
) {
  const links = [];

  const seen =
    new Set();


  const regex =
    /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;


  let match;


  while (
    (match = regex.exec(
      String(html || "")
    ))
  ) {
    const attributes =
      match[1];


    const text =
      stripTags(
        match[2]
      );


    const href =
      getAttribute(
        attributes,
        "href"
      );


    if (
      !href ||
      href.startsWith(
        "javascript:"
      )
    ) {
      continue;
    }


    const resolvedUrl =
      resolveUrl(
        href,
        baseUrl
      );


    const key =
      `${resolvedUrl}|${text}`;


    if (seen.has(key)) {
      continue;
    }


    seen.add(key);


    links.push({
      text,
      href,
      url:
        resolvedUrl
    });


    if (
      links.length >=
      MAX_LINKS_PER_ANSWER
    ) {
      break;
    }
  }


  return links;
}


/* =========================================================
   EXTRACT FAQ GROUP SECTIONS
   ========================================================= */

function extractFaqGroupSections(html) {
  const sections = [];


  const sectionRegex =
    /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;


  let match;


  while (
    (match = sectionRegex.exec(html))
  ) {
    const attributes =
      match[1];


    const content =
      match[2];


    const className =
      getAttribute(
        attributes,
        "class"
      );


    if (
      !className
        .split(/\s+/)
        .includes(
          "faq-group-section"
        )
    ) {
      continue;
    }


    sections.push({
      attributes,
      content
    });
  }


  return sections;
}


/* =========================================================
   GROUP TITLE
   ========================================================= */

function extractGroupTitle(
  sectionContent
) {
  const heading =
    extractFirstTagText(
      sectionContent,
      "h2"
    );


  if (heading) {
    return heading;
  }


  const h3 =
    extractFirstTagText(
      sectionContent,
      "h3"
    );


  return h3 || "FAQ";
}


/* =========================================================
   GROUP EYEBROW
   ========================================================= */

function extractGroupEyebrow(
  sectionContent
) {
  const match =
    String(sectionContent || "")
      .match(
        /<p\b[^>]*class=["'][^"']*\bfaq-section-eyebrow\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i
      );


  return match
    ? stripTags(match[1])
    : "";
}


/* =========================================================
   EXTRACT DETAILS BLOCKS
   ========================================================= */

function extractDetailsBlocks(
  sectionContent
) {
  const blocks = [];


  const detailsRegex =
    /<details\b([^>]*)>([\s\S]*?)<\/details>/gi;


  let match;


  while (
    (match = detailsRegex.exec(
      sectionContent
    ))
  ) {
    const attributes =
      match[1];


    const className =
      getAttribute(
        attributes,
        "class"
      );


    if (
      className &&
      !className
        .split(/\s+/)
        .includes(
          "faq-item"
        )
    ) {
      continue;
    }


    blocks.push({
      attributes,
      content:
        match[2]
    });
  }


  return blocks;
}


/* =========================================================
   EXTRACT QUESTION
   ========================================================= */

function extractQuestion(
  detailsContent
) {
  /*
   * Preferred markup:
   *
   * <summary>
   *   <span class="faq-question">
   *     Question
   *   </span>
   * </summary>
   */
  const questionMatch =
    String(detailsContent || "")
      .match(
        /<[^>]+class=["'][^"']*\bfaq-question\b[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i
      );


  if (questionMatch) {
    return stripTags(
      questionMatch[1]
    );
  }


  /*
   * Fallback to visible <summary>.
   */
  const summaryMatch =
    String(detailsContent || "")
      .match(
        /<summary\b[^>]*>([\s\S]*?)<\/summary>/i
      );


  if (!summaryMatch) {
    return "";
  }


  return stripTags(
    summaryMatch[1]
      .replace(
        /<[^>]+class=["'][^"']*\bfaq-toggle-icon\b[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi,
        " "
      )
  );
}


/* =========================================================
   EXTRACT ANSWER HTML
   ========================================================= */

function extractAnswerHtml(
  detailsContent
) {
  const answerMatch =
    String(detailsContent || "")
      .match(
        /<div\b[^>]*class=["'][^"']*\bfaq-answer\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
      );


  if (answerMatch) {
    return answerMatch[1];
  }


  /*
   * Fallback:
   * remove summary and use the remaining details body.
   */
  return String(
    detailsContent || ""
  )
    .replace(
      /<summary\b[^>]*>[\s\S]*?<\/summary>/i,
      " "
    )
    .trim();
}


/* =========================================================
   EXTRACT ANSWER TEXT
   ========================================================= */

function extractAnswerText(
  answerHtml
) {
  let answer =
    stripTags(answerHtml);


  if (
    answer.length >
    MAX_ANSWER_LENGTH
  ) {
    answer =
      `${answer.slice(
        0,
        MAX_ANSWER_LENGTH
      ).trim()}…`;
  }


  return answer;
}


/* =========================================================
   CREATE GROUP ANCHOR URL
   ========================================================= */

function createGroupUrl(
  canonicalUrl,
  groupId
) {
  const cleanBase =
    canonicalUrl.split("#")[0];


  if (!groupId) {
    return cleanBase;
  }


  return `${cleanBase}#${groupId}`;
}


/* =========================================================
   FAQ GROUP PARSER
   ========================================================= */

function parseFaqGroups(
  html,
  canonicalUrl
) {
  const sections =
    extractFaqGroupSections(
      html
    );


  if (!sections.length) {
    throw new Error(
      "No .faq-group-section sections were found in help/faq/index.html."
    );
  }


  const groups = [];

  const faqItems = [];

  const usedIds =
    new Set();

  const usedQuestions =
    new Set();


  sections.forEach(
    (
      section,
      sectionIndex
    ) => {
      const rawGroupId =
        getAttribute(
          section.attributes,
          "id"
        );


      const groupTitle =
        extractGroupTitle(
          section.content
        );


      const groupEyebrow =
        extractGroupEyebrow(
          section.content
        );


      const groupId =
        rawGroupId ||
        slugify(
          groupTitle
        ) ||
        `faq-group-${sectionIndex + 1}`;


      const groupUrl =
        createGroupUrl(
          canonicalUrl,
          groupId
        );


      const detailBlocks =
        extractDetailsBlocks(
          section.content
        );


      const groupQuestionIds = [];


      detailBlocks.forEach(
        (
          details,
          itemIndex
        ) => {
          let question =
            extractQuestion(
              details.content
            );


          if (!question) {
            warning(
              `Skipped FAQ item ${itemIndex + 1} in "${groupTitle}": question text not found.`
            );

            return;
          }


          if (
            question.length >
            MAX_QUESTION_LENGTH
          ) {
            question =
              question
                .slice(
                  0,
                  MAX_QUESTION_LENGTH
                )
                .trim();
          }


          const normalizedQuestion =
            question.toLowerCase();


          if (
            usedQuestions.has(
              normalizedQuestion
            )
          ) {
            warning(
              `Duplicate FAQ question skipped: "${question}"`
            );

            return;
          }


          const answerHtml =
            extractAnswerHtml(
              details.content
            );


          const answer =
            extractAnswerText(
              answerHtml
            );


          if (!answer) {
            warning(
              `FAQ question has no answer text: "${question}"`
            );
          }


          const sourceItemId =
            getAttribute(
              details.attributes,
              "id"
            );


          const id =
            createUniqueId(
              sourceItemId ||
              question,
              usedIds
            );


          const links =
            extractLinks(
              answerHtml,
              groupUrl
            );


          const searchText =
            normalizeWhitespace(
              [
                question,
                answer,
                groupTitle,
                groupEyebrow,
                ...links.map(
                  (link) =>
                    link.text
                )
              ]
                .filter(Boolean)
                .join(" ")
            );


          const item = {
            id,

            groupId,

            groupTitle,

            groupEyebrow,

            position:
              faqItems.length + 1,

            groupPosition:
              groupQuestionIds.length + 1,

            question,

            answer,

            links,

            url:
              groupUrl,

            searchText
          };


          faqItems.push(item);

          groupQuestionIds.push(id);

          usedQuestions.add(
            normalizedQuestion
          );
        }
      );


      groups.push({
        id:
          groupId,

        title:
          groupTitle,

        eyebrow:
          groupEyebrow,

        position:
          groups.length + 1,

        url:
          groupUrl,

        count:
          groupQuestionIds.length,

        questionIds:
          groupQuestionIds
      });
    }
  );


  return {
    groups,
    items:
      faqItems
  };
}


/* =========================================================
   FAQPAGE JSON-LD CHECK
   ========================================================= */

function countFaqPageJsonLdQuestions(
  html
) {
  const scripts =
    String(html || "")
      .match(
        /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi
      ) || [];


  let count = 0;


  for (const block of scripts) {
    const contentMatch =
      block.match(
        /<script\b[^>]*>([\s\S]*?)<\/script>/i
      );


    if (!contentMatch) {
      continue;
    }


    const raw =
      contentMatch[1]
        .trim();


    if (!raw) {
      continue;
    }


    try {
      const json =
        JSON.parse(raw);


      const nodes = [];


      if (
        json &&
        typeof json === "object"
      ) {
        nodes.push(json);


        if (
          Array.isArray(
            json["@graph"]
          )
        ) {
          nodes.push(
            ...json["@graph"]
          );
        }
      }


      for (const node of nodes) {
        if (
          !node ||
          typeof node !== "object"
        ) {
          continue;
        }


        if (
          node["@type"] ===
          "FAQPage" &&
          Array.isArray(
            node.mainEntity
          )
        ) {
          count +=
            node.mainEntity.length;
        }
      }
    } catch {
      /*
       * JSON-LD syntax validation belongs to the
       * HTML/build validation layer. This builder
       * only performs a non-fatal consistency check.
       */
    }
  }


  return count;
}


/* =========================================================
   CREATE FAQ STRUCTURED-DATA REPRESENTATION
   ========================================================= */

function createFaqSchemaItems(items) {
  return items.map(
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
}


/* =========================================================
   VALIDATE RESULT
   ========================================================= */

function validateFaqData(
  groups,
  items
) {
  if (!groups.length) {
    throw new Error(
      "FAQ build produced zero groups."
    );
  }


  if (!items.length) {
    throw new Error(
      "FAQ build produced zero questions."
    );
  }


  const ids =
    new Set();


  for (const item of items) {
    if (!item.id) {
      throw new Error(
        "FAQ item is missing an ID."
      );
    }


    if (ids.has(item.id)) {
      throw new Error(
        `Duplicate FAQ ID generated: ${item.id}`
      );
    }


    ids.add(item.id);


    if (!item.question) {
      throw new Error(
        `FAQ item "${item.id}" is missing a question.`
      );
    }


    if (!item.answer) {
      warning(
        `FAQ item "${item.id}" has an empty answer.`
      );
    }


    if (!item.groupId) {
      throw new Error(
        `FAQ item "${item.id}" is missing groupId.`
      );
    }
  }


  const groupIds =
    new Set(
      groups.map(
        (group) =>
          group.id
      )
    );


  for (const item of items) {
    if (
      !groupIds.has(
        item.groupId
      )
    ) {
      throw new Error(
        `FAQ item "${item.id}" references unknown group "${item.groupId}".`
      );
    }
  }
}


/* =========================================================
   SAFE JAVASCRIPT JSON
   ========================================================= */

function stringifyForJavaScript(value) {
  return JSON
    .stringify(
      value,
      null,
      2
    )
    .replace(
      /\u2028/g,
      "\\u2028"
    )
    .replace(
      /\u2029/g,
      "\\u2029"
    )
    .replace(
      /<\/script/gi,
      "<\\/script"
    );
}


/* =========================================================
   CREATE OUTPUT SOURCE
   ========================================================= */

function createOutputSource({
  page,
  groups,
  items
}) {
  const pageJson =
    stringifyForJavaScript(
      page
    );


  const groupsJson =
    stringifyForJavaScript(
      groups
    );


  const itemsJson =
    stringifyForJavaScript(
      items
    );


  const schemaJson =
    stringifyForJavaScript(
      createFaqSchemaItems(
        items
      )
    );


  return `"use strict";

/* =========================================================
   SalimGPT Global FAQ Data

   AUTO-GENERATED FILE.
   Source: help/faq/index.html
   Builder: scripts/build-faq-index.js

   Do not edit this file manually.

   Rebuild with:

   npm run build:faq
   ========================================================= */

(function (global) {

  const page = ${pageJson};


  const groups = ${groupsJson};


  const items = ${itemsJson};


  const schemaItems = ${schemaJson};


  /* -------------------------------------------------------
     Primary public variables
     ------------------------------------------------------- */

  global.SALIMGPT_FAQ_PAGE = page;

  global.SALIMGPT_FAQ_GROUPS = groups;

  global.SALIMGPT_FAQ_INDEX = items;


  /* -------------------------------------------------------
     Compatibility aliases
     ------------------------------------------------------- */

  global.SALIMGPT_FAQ = items;

  global.salimgptFaq = items;

  global.salimgptFaqIndex = items;

  global.salimgptFaqGroups = groups;


  /* -------------------------------------------------------
     Lightweight FAQPage-compatible data
     ------------------------------------------------------- */

  global.SALIMGPT_FAQ_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": schemaItems
  };


  /* -------------------------------------------------------
     Metadata
     ------------------------------------------------------- */

  global.SALIMGPT_FAQ_META = {
    version: 1,

    source:
      "help/faq/index.html",

    url:
      page.url,

    groupCount:
      groups.length,

    questionCount:
      items.length
  };


  /* -------------------------------------------------------
     Utility: find FAQ by ID
     ------------------------------------------------------- */

  global.getSalimGPTFaqById =
    function getSalimGPTFaqById(id) {

      const wanted =
        String(id || "")
          .trim()
          .toLowerCase();


      if (!wanted) {
        return null;
      }


      return (
        items.find(
          (item) =>
            item.id.toLowerCase() ===
            wanted
        ) ||
        null
      );
    };


  /* -------------------------------------------------------
     Utility: get FAQs by group
     ------------------------------------------------------- */

  global.getSalimGPTFaqByGroup =
    function getSalimGPTFaqByGroup(groupId) {

      const wanted =
        String(groupId || "")
          .trim()
          .toLowerCase();


      if (!wanted) {
        return [];
      }


      return items.filter(
        (item) =>
          item.groupId.toLowerCase() ===
          wanted
      );
    };


  /* -------------------------------------------------------
     Utility: basic FAQ search
     ------------------------------------------------------- */

  global.searchSalimGPTFaq =
    function searchSalimGPTFaq(query) {

      const normalizedQuery =
        String(query || "")
          .toLowerCase()
          .replace(/\\s+/g, " ")
          .trim();


      if (!normalizedQuery) {
        return [];
      }


      const terms =
        normalizedQuery
          .split(" ")
          .filter(Boolean);


      return items
        .map(
          (item) => {

            const question =
              item.question.toLowerCase();

            const answer =
              item.answer.toLowerCase();

            const group =
              item.groupTitle.toLowerCase();

            const searchable =
              item.searchText.toLowerCase();


            let score = 0;


            if (
              question ===
              normalizedQuery
            ) {
              score += 100;
            }


            if (
              question.startsWith(
                normalizedQuery
              )
            ) {
              score += 50;
            }


            if (
              question.includes(
                normalizedQuery
              )
            ) {
              score += 30;
            }


            if (
              answer.includes(
                normalizedQuery
              )
            ) {
              score += 12;
            }


            if (
              group.includes(
                normalizedQuery
              )
            ) {
              score += 10;
            }


            for (const term of terms) {

              if (
                question.includes(term)
              ) {
                score += 8;
              }


              if (
                answer.includes(term)
              ) {
                score += 3;
              }


              if (
                searchable.includes(term)
              ) {
                score += 1;
              }
            }


            return {
              item,
              score
            };
          }
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
              a.item.position -
              b.item.position
            );
          }
        )

        .map(
          (result) =>
            result.item
        );
    };

})(
  typeof globalThis !== "undefined"
    ? globalThis
    : window
);
`;
}


/* =========================================================
   ENSURE OUTPUT DIRECTORY
   ========================================================= */

function ensureOutputDirectory() {
  fs.mkdirSync(
    path.dirname(
      OUTPUT_FILE
    ),
    {
      recursive: true
    }
  );
}


/* =========================================================
   BUILD
   ========================================================= */

function buildFaqIndex() {
  console.log(
    `${color.bold}\nSalimGPT Global — FAQ Index Builder${color.reset}`
  );


  console.log(
    `${color.gray}${PROJECT_ROOT}${color.reset}\n`
  );


  /* -------------------------------------------------------
     Node
     ------------------------------------------------------- */

  validateNodeVersion();


  success(
    `Node.js ${process.versions.node}`
  );


  /* -------------------------------------------------------
     Source
     ------------------------------------------------------- */

  if (
    !fs.existsSync(
      SOURCE_FILE
    )
  ) {
    throw new Error(
      `FAQ source file not found: ${relativeToProject(SOURCE_FILE)}`
    );
  }


  const sourceStat =
    fs.statSync(
      SOURCE_FILE
    );


  if (
    !sourceStat.isFile()
  ) {
    throw new Error(
      `FAQ source is not a file: ${relativeToProject(SOURCE_FILE)}`
    );
  }


  if (
    sourceStat.size === 0
  ) {
    throw new Error(
      `FAQ source file is empty: ${relativeToProject(SOURCE_FILE)}`
    );
  }


  info(
    `Reading ${relativeToProject(SOURCE_FILE)}`
  );


  const html =
    fs.readFileSync(
      SOURCE_FILE,
      "utf8"
    );


  /* -------------------------------------------------------
     Page metadata
     ------------------------------------------------------- */

  const canonicalUrl =
    extractCanonicalUrl(
      html
    ) || FAQ_URL;


  const pageTitle =
    extractDocumentTitle(
      html
    );


  const pageDescription =
    extractMetaDescription(
      html
    );


  const h1 =
    extractFirstTagText(
      html,
      "h1"
    );


  const page = {
    title:
      pageTitle,

    heading:
      h1,

    description:
      pageDescription,

    url:
      canonicalUrl
  };


  /* -------------------------------------------------------
     Parse FAQ
     ------------------------------------------------------- */

  const {
    groups,
    items
  } =
    parseFaqGroups(
      html,
      canonicalUrl
    );


  validateFaqData(
    groups,
    items
  );


  /* -------------------------------------------------------
     Structured-data consistency note
     ------------------------------------------------------- */

  const jsonLdQuestionCount =
    countFaqPageJsonLdQuestions(
      html
    );


  if (
    jsonLdQuestionCount > 0 &&
    jsonLdQuestionCount !==
      items.length
  ) {
    warning(
      `Visible FAQ contains ${items.length} question(s), while FAQPage JSON-LD currently contains ${jsonLdQuestionCount}. This can be intentional if the structured data uses only representative questions.`
    );
  }


  /* -------------------------------------------------------
     Output
     ------------------------------------------------------- */

  ensureOutputDirectory();


  const output =
    createOutputSource({
      page,
      groups,
      items
    });


  fs.writeFileSync(
    OUTPUT_FILE,
    output,
    "utf8"
  );


  const outputStat =
    fs.statSync(
      OUTPUT_FILE
    );


  /* -------------------------------------------------------
     Summary
     ------------------------------------------------------- */

  success(
    `Generated ${relativeToProject(OUTPUT_FILE)}`
  );


  success(
    `${groups.length} FAQ group(s) indexed.`
  );


  success(
    `${items.length} FAQ question(s) indexed.`
  );


  info(
    `Output size: ${(outputStat.size / 1024).toFixed(1)} KB`
  );


  console.log("");


  for (const group of groups) {
    info(
      `${group.title}: ${group.count} question(s)`
    );
  }


  console.log(
    `\n${color.green}${color.bold}FAQ INDEX BUILD PASSED${color.reset}\n`
  );
}


/* =========================================================
   RUN
   ========================================================= */

try {
  buildFaqIndex();
} catch (error) {

  fail(
    "FAQ index build failed."
  );


  console.error(
    `\n${color.red}${
      error && error.stack
        ? error.stack
        : error
    }${color.reset}\n`
  );


  process.exitCode = 1;
}
