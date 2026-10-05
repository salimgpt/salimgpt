"use strict";

/* =========================================================
   SalimGPT Global
   File: scripts/build-sitemap.js

   Static XML sitemap generator for GitHub Pages.

   Output:
   - sitemap.xml

   Responsibilities:
   - Validate Node.js version
   - Read canonical SalimGPT routes
   - Skip missing / empty pages during normal development
   - Detect noindex pages
   - Read and validate canonical URLs
   - Prevent duplicate sitemap URLs
   - Keep URLs inside the SalimGPT global site
   - Escape XML safely
   - Generate deterministic sitemap.xml
   - Optionally include file-based lastmod dates
   - Support strict validation mode
   - Require no external npm dependencies

   Node.js: >= 18
   ========================================================= */


const fs = require("fs");
const path = require("path");


/* =========================================================
   PROJECT CONFIG
   ========================================================= */

const PROJECT_ROOT =
  path.resolve(__dirname, "..");


const OUTPUT_FILE =
  path.join(
    PROJECT_ROOT,
    "sitemap.xml"
  );


const BASE_URL =
  "https://salimgpt.github.io/salimgpt/";


const MINIMUM_NODE_MAJOR = 18;


/*
 * Strict mode:
 *
 * SALIMGPT_STRICT_SITEMAP=1 npm run build:sitemap
 *
 * Normal mode:
 * - Missing or empty routes are skipped with warnings.
 *
 * Strict mode:
 * - Missing/empty canonical routes fail the sitemap build.
 */
const STRICT_MODE =
  process.env.SALIMGPT_STRICT_SITEMAP === "1";


/*
 * Optional lastmod support:
 *
 * SALIMGPT_SITEMAP_LASTMOD=1 npm run build:sitemap
 *
 * Disabled by default because filesystem modification dates can
 * change when a repository is copied, extracted or redeployed.
 */
const INCLUDE_LASTMOD =
  process.env.SALIMGPT_SITEMAP_LASTMOD === "1";


/* =========================================================
   CANONICAL SALIMGPT ROUTES

   Keep this list aligned with:
   - scripts/build.js
   - public site architecture

   Home is represented by an empty route.
   ========================================================= */

const EXPECTED_ROUTES = [

  /* Main */
  "",
  "explore-languages/",

  /* Discover */
  "latest-documentaries/",
  "featured-documentaries/",
  "all-documentaries/",
  "documentary-series/",
  "topics/",
  "collections/",
  "most-viewed/",
  "editors-picks/",
  "documentary-archive/",

  /* Topics */
  "topics/history/",
  "topics/society/",
  "topics/science/",
  "topics/technology/",
  "topics/human-civilization/",
  "topics/mystery/",
  "topics/investigations/",
  "topics/current-affairs/",

  /* Global */
  "global/language-editions/",
  "global/youtube-multi-language-audio/",
  "global/official-social-profiles/",
  "global/where-to-watch/",

  /* About */
  "about/",
  "about/salimgpt-story/",
  "about/why-salimgpt/",
  "about/mission-vision/",
  "about/founder-director/",

  /* How We Work */
  "how-we-work/documentary-approach/",
  "how-we-work/research-methodology/",
  "how-we-work/source-evidence-standards/",
  "how-we-work/fact-checking/",
  "how-we-work/editorial-standards/",
  "how-we-work/production-process/",
  "how-we-work/human-led-ai-assisted/",
  "how-we-work/visual-synthetic-media/",
  "how-we-work/originality-creative-direction/",
  "how-we-work/corrections-updates/",

  /* Trust */
  "trust/transparency/",
  "trust/editorial-independence/",
  "trust/human-review-standard/",
  "trust/ownership-copyright/",
  "trust/content-use-permissions/",

  /* Help */
  "help/faq/",
  "help/search/",
  "help/contact/",
  "help/correction-request/",
  "help/copyright-request/",

  /* Legal */
  "legal/privacy/",
  "legal/terms/",
  "legal/disclaimer/"
];


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
   BUILD STATE
   ========================================================= */

const warnings = [];
const errors = [];


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


function addWarning(message) {
  warnings.push(message);
}


function addError(message) {
  errors.push(message);
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


  success(
    `Node.js ${process.versions.node}`
  );
}


/* =========================================================
   PATH HELPERS
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


function routeToFile(route) {
  if (!route) {
    return path.join(
      PROJECT_ROOT,
      "index.html"
    );
  }


  return path.join(
    PROJECT_ROOT,
    route,
    "index.html"
  );
}


function routeToExpectedUrl(route) {
  if (!route) {
    return BASE_URL;
  }


  return `${BASE_URL}${route}`;
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
   GET ATTRIBUTE
   ========================================================= */

function getAttribute(
  tag,
  attributeName
) {
  const escapedName =
    attributeName.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );


  const regex =
    new RegExp(
      `\\b${escapedName}\\s*=\\s*["']([^"']*)["']`,
      "i"
    );


  const match =
    String(tag || "")
      .match(regex);


  return match
    ? normalizeWhitespace(
        match[1]
      )
    : "";
}


/* =========================================================
   META CONTENT
   ========================================================= */

function getMetaContent(
  html,
  attributeName,
  expectedValue
) {
  const tags =
    String(html || "")
      .match(
        /<meta\b[^>]*>/gi
      ) || [];


  const expected =
    expectedValue.toLowerCase();


  for (const tag of tags) {
    const actualValue =
      getAttribute(
        tag,
        attributeName
      )
        .toLowerCase();


    if (
      actualValue !==
      expected
    ) {
      continue;
    }


    return getAttribute(
      tag,
      "content"
    );
  }


  return "";
}


/* =========================================================
   CANONICAL URL EXTRACTION
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
        .split(/\s+/)
        .filter(Boolean);


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


  return "";
}


/* =========================================================
   ROBOTS / NOINDEX
   ========================================================= */

function isNoIndex(html) {
  const robots =
    getMetaContent(
      html,
      "name",
      "robots"
    )
      .toLowerCase();


  if (!robots) {
    return false;
  }


  const directives =
    robots
      .split(",")
      .map(
        (item) =>
          item.trim()
      )
      .filter(Boolean);


  return directives.some(
    (directive) =>
      directive === "noindex" ||
      directive.startsWith(
        "noindex "
      )
  );
}


/* =========================================================
   VALID URL
   ========================================================= */

function isValidSiteUrl(value) {
  if (!value) {
    return false;
  }


  let parsed;


  try {
    parsed =
      new URL(value);
  } catch {
    return false;
  }


  return (
    parsed.protocol === "https:" &&
    value.startsWith(
      BASE_URL
    )
  );
}


/* =========================================================
   NORMALIZE CANONICAL URL
   ========================================================= */

function normalizeCanonicalUrl(value) {
  if (!value) {
    return "";
  }


  let parsed;


  try {
    parsed =
      new URL(value);
  } catch {
    return "";
  }


  parsed.hash = "";
  parsed.search = "";


  return parsed.href;
}


/* =========================================================
   XML ESCAPING
   ========================================================= */

function escapeXml(value) {
  return String(value || "")
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
      "&apos;"
    );
}


/* =========================================================
   LAST MODIFIED DATE
   ========================================================= */

function getLastModifiedDate(filePath) {
  const stat =
    fs.statSync(filePath);


  /*
   * Sitemap lastmod uses YYYY-MM-DD.
   */
  return stat.mtime
    .toISOString()
    .slice(0, 10);
}


/* =========================================================
   READ PAGE
   ========================================================= */

function readPage(route) {
  const filePath =
    routeToFile(route);


  const relativePath =
    relativeToProject(filePath);


  const expectedUrl =
    routeToExpectedUrl(route);


  if (
    !fs.existsSync(filePath)
  ) {
    const message =
      `Missing page: ${relativePath}`;


    if (STRICT_MODE) {
      addError(message);
    } else {
      addWarning(message);
    }


    return null;
  }


  const stat =
    fs.statSync(filePath);


  if (!stat.isFile()) {
    const message =
      `Expected HTML file but found something else: ${relativePath}`;


    if (STRICT_MODE) {
      addError(message);
    } else {
      addWarning(message);
    }


    return null;
  }


  if (stat.size === 0) {
    const message =
      `Empty page skipped: ${relativePath}`;


    if (STRICT_MODE) {
      addError(message);
    } else {
      addWarning(message);
    }


    return null;
  }


  const html =
    fs.readFileSync(
      filePath,
      "utf8"
    );


  if (isNoIndex(html)) {
    info(
      `Skipped noindex page: ${relativePath}`
    );


    return null;
  }


  const rawCanonical =
    extractCanonicalUrl(html);


  let url =
    expectedUrl;


  if (!rawCanonical) {
    addWarning(
      `${relativePath}: canonical URL missing; using expected route URL.`
    );
  } else {
    const canonical =
      normalizeCanonicalUrl(
        rawCanonical
      );


    if (!canonical) {
      addWarning(
        `${relativePath}: invalid canonical URL "${rawCanonical}"; using expected route URL.`
      );
    } else if (
      !isValidSiteUrl(
        canonical
      )
    ) {
      addWarning(
        `${relativePath}: canonical URL is outside ${BASE_URL}; using expected route URL.`
      );
    } else {
      url =
        canonical;
    }
  }


  if (
    url !== expectedUrl
  ) {
    addWarning(
      `${relativePath}: canonical URL "${url}" does not match expected "${expectedUrl}".`
    );
  }


  return {
    route,
    filePath,
    relativePath,
    url,
    lastmod:
      INCLUDE_LASTMOD
        ? getLastModifiedDate(
            filePath
          )
        : ""
  };
}


/* =========================================================
   COLLECT SITEMAP ENTRIES
   ========================================================= */

function collectEntries() {
  const entries = [];

  const seenUrls =
    new Map();


  for (const route of EXPECTED_ROUTES) {
    const page =
      readPage(route);


    if (!page) {
      continue;
    }


    if (
      seenUrls.has(
        page.url
      )
    ) {
      addError(
        `Duplicate sitemap URL "${page.url}" found in both "${seenUrls.get(page.url)}" and "${page.relativePath}".`
      );


      continue;
    }


    seenUrls.set(
      page.url,
      page.relativePath
    );


    entries.push(page);
  }


  return entries;
}


/* =========================================================
   SITEMAP XML
   ========================================================= */

function createSitemapXml(entries) {
  const lines = [];


  lines.push(
    '<?xml version="1.0" encoding="UTF-8"?>'
  );


  lines.push(
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  );


  for (const entry of entries) {
    lines.push("  <url>");

    lines.push(
      `    <loc>${escapeXml(entry.url)}</loc>`
    );


    if (
      INCLUDE_LASTMOD &&
      entry.lastmod
    ) {
      lines.push(
        `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`
      );
    }


    lines.push("  </url>");
  }


  lines.push("</urlset>");


  return `${lines.join("\n")}\n`;
}


/* =========================================================
   VALIDATE GENERATED XML
   ========================================================= */

function validateGeneratedXml(
  xml,
  entries
) {
  if (
    !xml.startsWith(
      '<?xml version="1.0" encoding="UTF-8"?>'
    )
  ) {
    throw new Error(
      "Generated sitemap is missing a valid XML declaration."
    );
  }


  if (
    !xml.includes(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    )
  ) {
    throw new Error(
      "Generated sitemap is missing the sitemap urlset namespace."
    );
  }


  const locCount =
    (
      xml.match(
        /<loc>/g
      ) || []
    ).length;


  if (
    locCount !==
    entries.length
  ) {
    throw new Error(
      `Generated sitemap contains ${locCount} <loc> element(s), expected ${entries.length}.`
    );
  }


  for (const entry of entries) {
    if (
      !isValidSiteUrl(
        entry.url
      )
    ) {
      throw new Error(
        `Invalid sitemap URL: ${entry.url}`
      );
    }
  }
}


/* =========================================================
   WRITE SITEMAP
   ========================================================= */

function writeSitemap(entries) {
  const xml =
    createSitemapXml(
      entries
    );


  validateGeneratedXml(
    xml,
    entries
  );


  fs.writeFileSync(
    OUTPUT_FILE,
    xml,
    "utf8"
  );


  return fs.statSync(
    OUTPUT_FILE
  ).size;
}


/* =========================================================
   PRINT WARNINGS
   ========================================================= */

function printWarnings() {
  if (!warnings.length) {
    return;
  }


  console.log(
    `\n${color.bold}${color.yellow}Warnings (${warnings.length})${color.reset}`
  );


  for (const item of warnings) {
    console.log(
      `${color.yellow}⚠${color.reset} ${item}`
    );
  }
}


/* =========================================================
   PRINT ERRORS
   ========================================================= */

function printErrors() {
  if (!errors.length) {
    return;
  }


  console.log(
    `\n${color.bold}${color.red}Errors (${errors.length})${color.reset}`
  );


  for (const item of errors) {
    console.log(
      `${color.red}✗${color.reset} ${item}`
    );
  }
}


/* =========================================================
   BUILD SUMMARY
   ========================================================= */

function printSummary(
  entries,
  outputSize
) {
  console.log(
    `\n${color.bold}=========================================================`
  );


  console.log(
    "SalimGPT Global Sitemap Summary"
  );


  console.log(
    `=========================================================${color.reset}`
  );


  console.log(
    `Expected routes : ${EXPECTED_ROUTES.length}`
  );


  console.log(
    `Sitemap URLs    : ${entries.length}`
  );


  console.log(
    `Warnings        : ${warnings.length}`
  );


  console.log(
    `Errors          : ${errors.length}`
  );


  console.log(
    `Strict mode     : ${STRICT_MODE ? "ON" : "OFF"}`
  );


  console.log(
    `Lastmod         : ${INCLUDE_LASTMOD ? "ON" : "OFF"}`
  );


  console.log(
    `Output          : ${relativeToProject(OUTPUT_FILE)}`
  );


  if (
    typeof outputSize === "number"
  ) {
    console.log(
      `Output size     : ${(outputSize / 1024).toFixed(1)} KB`
    );
  }
}


/* =========================================================
   BUILD
   ========================================================= */

function buildSitemap() {
  console.log(
    `${color.bold}\nSalimGPT Global — Sitemap Builder${color.reset}`
  );


  console.log(
    `${color.gray}${BASE_URL}${color.reset}\n`
  );


  /* -------------------------------------------------------
     Node
     ------------------------------------------------------- */

  validateNodeVersion();


  /* -------------------------------------------------------
     Collect pages
     ------------------------------------------------------- */

  const entries =
    collectEntries();


  info(
    `${entries.length}/${EXPECTED_ROUTES.length} route(s) eligible for sitemap.`
  );


  /* -------------------------------------------------------
     Fatal route/duplicate errors
     ------------------------------------------------------- */

  if (errors.length) {
    printWarnings();

    printErrors();

    printSummary(
      entries
    );


    throw new Error(
      "Sitemap validation failed before output was written."
    );
  }


  if (!entries.length) {
    throw new Error(
      "No indexable SalimGPT pages were found. sitemap.xml was not generated."
    );
  }


  /* -------------------------------------------------------
     Write sitemap
     ------------------------------------------------------- */

  const outputSize =
    writeSitemap(
      entries
    );


  success(
    `Generated ${relativeToProject(OUTPUT_FILE)}`
  );


  success(
    `${entries.length} URL(s) written to sitemap.xml`
  );


  /* -------------------------------------------------------
     Warnings / summary
     ------------------------------------------------------- */

  printWarnings();


  printSummary(
    entries,
    outputSize
  );


  console.log(
    `\n${color.green}${color.bold}SITEMAP BUILD PASSED${color.reset}\n`
  );
}


/* =========================================================
   RUN
   ========================================================= */

try {
  buildSitemap();
} catch (error) {

  if (
    !errors.length
  ) {
    console.error(
      `\n${color.red}${color.bold}Sitemap build failed.${color.reset}`
    );
  }


  console.error(
    `\n${color.red}${
      error && error.stack
        ? error.stack
        : error
    }${color.reset}\n`
  );


  process.exitCode = 1;
}