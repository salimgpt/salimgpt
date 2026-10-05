"use strict";

/* =========================================================
   SalimGPT Global
   File: scripts/build-search-index.js

   Static search-index generator for GitHub Pages.

   Output:
   - data/search-index.js

   Responsibilities:
   - Scan searchable HTML pages
   - Use <main> content where available
   - Ignore header/menu/footer chrome
   - Read title, description, headings and page text
   - Preserve canonical URLs
   - Categorize pages by route
   - Skip noindex pages
   - Skip 404.html
   - Remove duplicate entries
   - Generate deterministic browser-ready JavaScript
   - Require no external npm packages

   Node.js: >= 18
   ========================================================= */


const fs = require("fs");
const path = require("path");


/* =========================================================
   CONFIG
   ========================================================= */

const PROJECT_ROOT =
  path.resolve(__dirname, "..");

const OUTPUT_FILE =
  path.join(
    PROJECT_ROOT,
    "data",
    "search-index.js"
  );

const BASE_URL =
  "https://salimgpt.github.io/salimgpt/";

const MINIMUM_NODE_MAJOR = 18;

const MAX_SEARCH_TEXT_LENGTH = 7000;

const MAX_DESCRIPTION_LENGTH = 400;

const MAX_HEADINGS = 18;


/* =========================================================
   DIRECTORIES THAT MUST NOT BE INDEXED
   ========================================================= */

const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".github",
  ".build",
  "node_modules",
  "dist",
  "coverage"
]);


/* =========================================================
   FILES THAT MUST NOT BECOME SEARCH RESULTS
   ========================================================= */

const IGNORED_FILES = new Set([
  "404.html"
]);


/* =========================================================
   ROUTE CATEGORY MAP
   ========================================================= */

const CATEGORY_MAP = {
  "latest-documentaries": "Discover",
  "featured-documentaries": "Discover",
  "all-documentaries": "Discover",
  "documentary-series": "Discover",
  "topics": "Topics",
  "collections": "Discover",
  "most-viewed": "Discover",
  "editors-picks": "Discover",
  "documentary-archive": "Discover",

  "global": "Global",
  "about": "About SalimGPT",
  "how-we-work": "How We Work",
  "trust": "Trust & Transparency",
  "help": "Help",
  "legal": "Legal",
  "explore-languages": "Languages"
};


/* =========================================================
   SUBCATEGORY MAP
   ========================================================= */

const SUBCATEGORY_MAP = {
  "history": "History",
  "society": "Society",
  "science": "Science",
  "technology": "Technology",
  "human-civilization": "Human Civilization",
  "mystery": "Mystery",
  "investigations": "Investigations",
  "current-affairs": "Current Affairs",

  "language-editions": "Language Editions",
  "youtube-multi-language-audio": "YouTube Multi-Language Audio",
  "official-social-profiles": "Official Social Profiles",
  "where-to-watch": "Where to Watch",

  "salimgpt-story": "The SalimGPT Story",
  "why-salimgpt": "Why SalimGPT",
  "mission-vision": "Mission & Vision",
  "founder-director": "Founder & Director",

  "documentary-approach": "Documentary Approach",
  "research-methodology": "Research Methodology",
  "source-evidence-standards": "Source & Evidence Standards",
  "fact-checking": "Fact-Checking",
  "editorial-standards": "Editorial Standards",
  "production-process": "Production Process",
  "human-led-ai-assisted": "Human-Led, AI-Assisted",
  "visual-synthetic-media": "Visual & Synthetic Media",
  "originality-creative-direction": "Originality & Creative Direction",
  "corrections-updates": "Corrections & Updates",

  "transparency": "Transparency",
  "editorial-independence": "Editorial Independence",
  "human-review-standard": "Human Review Standard",
  "ownership-copyright": "Ownership & Copyright",
  "content-use-permissions": "Content Use & Permissions",

  "faq": "FAQ",
  "search": "Search",
  "contact": "Contact",
  "correction-request": "Correction Request",
  "copyright-request": "Copyright Request",

  "privacy": "Privacy Policy",
  "terms": "Terms of Use",
  "disclaimer": "Disclaimer"
};


/* =========================================================
   TERMINAL COLORS
   ========================================================= */

const supportsColor =
  Boolean(process.stdout.isTTY) &&
  process.env.NO_COLOR === undefined;


const color = {
  reset: supportsColor ? "\x1b[0m" : "",
  bold: supportsColor ? "\x1b[1m" : "",
  green: supportsColor ? "\x1b[32m" : "",
  yellow: supportsColor ? "\x1b[33m" : "",
  red: supportsColor ? "\x1b[31m" : "",
  blue: supportsColor ? "\x1b[34m" : "",
  gray: supportsColor ? "\x1b[90m" : ""
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
      process.versions.node.split(".")[0]
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
   PATH HELPERS
   ========================================================= */

function normalizeSlashes(value) {
  return value.replace(/\\/g, "/");
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
   RECURSIVE WALK
   ========================================================= */

function walkDirectory(directory) {
  const files = [];


  if (!fs.existsSync(directory)) {
    return files;
  }


  const entries =
    fs.readdirSync(
      directory,
      {
        withFileTypes: true
      }
    );


  for (const entry of entries) {
    if (
      entry.isDirectory() &&
      IGNORED_DIRECTORIES.has(
        entry.name
      )
    ) {
      continue;
    }


    const fullPath =
      path.join(
        directory,
        entry.name
      );


    if (entry.isDirectory()) {
      files.push(
        ...walkDirectory(
          fullPath
        )
      );

      continue;
    }


    if (
      entry.isFile() &&
      path
        .extname(entry.name)
        .toLowerCase() === ".html"
    ) {
      files.push(fullPath);
    }
  }


  return files;
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


  return value
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

        return Object.prototype.hasOwnProperty.call(
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
   REMOVE HTML TAGS
   ========================================================= */

function stripTags(value) {
  return normalizeWhitespace(
    String(value || "")
      .replace(
        /<br\s*\/?>/gi,
        " "
      )
      .replace(
        /<\/(?:p|div|section|article|li|h1|h2|h3|h4|h5|h6)>/gi,
        " "
      )
      .replace(
        /<[^>]+>/g,
        " "
      )
  );
}


/* =========================================================
   ATTRIBUTE ESCAPE
   ========================================================= */

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}


/* =========================================================
   GET META CONTENT
   ========================================================= */

function getMetaContent(
  html,
  attribute,
  expectedValue
) {
  const tags =
    html.match(
      /<meta\b[^>]*>/gi
    ) || [];


  const expected =
    expectedValue.toLowerCase();


  for (const tag of tags) {
    const attributeRegex =
      new RegExp(
        `\\b${escapeRegex(attribute)}\\s*=\\s*["']([^"']+)["']`,
        "i"
      );


    const attributeMatch =
      tag.match(
        attributeRegex
      );


    if (
      !attributeMatch ||
      attributeMatch[1]
        .trim()
        .toLowerCase() !== expected
    ) {
      continue;
    }


    const contentMatch =
      tag.match(
        /\bcontent\s*=\s*["']([^"']*)["']/i
      );


    if (contentMatch) {
      return normalizeWhitespace(
        contentMatch[1]
      );
    }
  }


  return "";
}


/* =========================================================
   GET LINK HREF
   ========================================================= */

function getLinkHref(
  html,
  relValue
) {
  const tags =
    html.match(
      /<link\b[^>]*>/gi
    ) || [];


  const wanted =
    relValue.toLowerCase();


  for (const tag of tags) {
    const relMatch =
      tag.match(
        /\brel\s*=\s*["']([^"']+)["']/i
      );


    if (!relMatch) {
      continue;
    }


    const relValues =
      relMatch[1]
        .toLowerCase()
        .split(/\s+/);


    if (
      !relValues.includes(
        wanted
      )
    ) {
      continue;
    }


    const hrefMatch =
      tag.match(
        /\bhref\s*=\s*["']([^"']+)["']/i
      );


    if (hrefMatch) {
      return hrefMatch[1].trim();
    }
  }


  return "";
}


/* =========================================================
   EXTRACT TAG TEXT
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
    html.match(regex);


  return match
    ? stripTags(match[1])
    : "";
}


/* =========================================================
   EXTRACT ALL HEADING TEXT
   ========================================================= */

function extractHeadings(html) {
  const headings = [];

  const regex =
    /<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi;

  let match;


  while (
    (match = regex.exec(html))
  ) {
    const heading =
      stripTags(match[2]);


    if (
      heading &&
      !headings.includes(heading)
    ) {
      headings.push(heading);
    }


    if (
      headings.length >=
      MAX_HEADINGS
    ) {
      break;
    }
  }


  return headings;
}


/* =========================================================
   EXTRACT MAIN CONTENT
   ========================================================= */

function extractMainHtml(html) {
  const mainMatch =
    html.match(
      /<main\b[^>]*>([\s\S]*?)<\/main>/i
    );


  if (mainMatch) {
    return mainMatch[1];
  }


  const bodyMatch =
    html.match(
      /<body\b[^>]*>([\s\S]*?)<\/body>/i
    );


  if (bodyMatch) {
    return bodyMatch[1];
  }


  return html;
}


/* =========================================================
   SANITIZE SEARCHABLE HTML
   ========================================================= */

function sanitizeSearchHtml(html) {
  return String(html || "")
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
      /<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi,
      " "
    )
    .replace(
      /<template\b[^>]*>[\s\S]*?<\/template>/gi,
      " "
    )
    .replace(
      /<svg\b[^>]*>[\s\S]*?<\/svg>/gi,
      " "
    )
    .replace(
      /<form\b[^>]*>[\s\S]*?<\/form>/gi,
      " "
    );
}


/* =========================================================
   EXTRACT SEARCHABLE TEXT
   ========================================================= */

function extractSearchText(mainHtml) {
  const sanitized =
    sanitizeSearchHtml(
      mainHtml
    );


  let text =
    stripTags(sanitized);


  if (
    text.length >
    MAX_SEARCH_TEXT_LENGTH
  ) {
    text =
      `${text.slice(
        0,
        MAX_SEARCH_TEXT_LENGTH
      ).trim()}…`;
  }


  return text;
}


/* =========================================================
   EXTRACT TITLE
   ========================================================= */

function extractTitle(html) {
  const title =
    extractFirstTagText(
      html,
      "title"
    );


  if (!title) {
    return "";
  }


  /*
   * Keep the full title if removing the brand
   * would leave nothing useful.
   */
  const cleaned =
    title
      .replace(
        /\s*\|\s*SalimGPT(?:\s+.*)?$/i,
        ""
      )
      .trim();


  return cleaned || title;
}


/* =========================================================
   EXTRACT DESCRIPTION
   ========================================================= */

function extractDescription(html) {
  let description =
    getMetaContent(
      html,
      "name",
      "description"
    );


  if (
    description.length >
    MAX_DESCRIPTION_LENGTH
  ) {
    description =
      `${description.slice(
        0,
        MAX_DESCRIPTION_LENGTH
      ).trim()}…`;
  }


  return description;
}


/* =========================================================
   EXTRACT KEYWORDS
   ========================================================= */

function extractMetaKeywords(html) {
  const keywords =
    getMetaContent(
      html,
      "name",
      "keywords"
    );


  if (!keywords) {
    return [];
  }


  return keywords
    .split(",")
    .map(
      (keyword) =>
        normalizeWhitespace(keyword)
    )
    .filter(Boolean)
    .slice(0, 30);
}


/* =========================================================
   NOINDEX DETECTION
   ========================================================= */

function isNoIndex(html) {
  const robots =
    getMetaContent(
      html,
      "name",
      "robots"
    )
      .toLowerCase();


  return (
    robots
      .split(",")
      .map(
        (item) =>
          item.trim()
      )
      .includes("noindex") ||
    /\bnoindex\b/i.test(
      robots
    )
  );
}


/* =========================================================
   ROUTE FROM FILE
   ========================================================= */

function getRouteFromFile(filePath) {
  const relativePath =
    relativeToProject(filePath);


  if (
    relativePath ===
    "index.html"
  ) {
    return "";
  }


  if (
    relativePath.endsWith(
      "/index.html"
    )
  ) {
    return relativePath.slice(
      0,
      -"index.html".length
    );
  }


  return relativePath;
}


/* =========================================================
   URL FROM ROUTE
   ========================================================= */

function buildUrlFromRoute(route) {
  if (!route) {
    return BASE_URL;
  }


  return new URL(
    route,
    BASE_URL
  ).href;
}


/* =========================================================
   CANONICAL URL
   ========================================================= */

function getCanonicalUrl(
  html,
  route
) {
  const canonical =
    getLinkHref(
      html,
      "canonical"
    );


  if (
    canonical &&
    canonical.startsWith(
      BASE_URL
    )
  ) {
    return canonical;
  }


  return buildUrlFromRoute(
    route
  );
}


/* =========================================================
   OPEN GRAPH IMAGE
   ========================================================= */

function extractImage(html) {
  const image =
    getMetaContent(
      html,
      "property",
      "og:image"
    );


  if (!image) {
    return "";
  }


  try {
    return new URL(
      image,
      BASE_URL
    ).href;
  } catch {
    return "";
  }
}


/* =========================================================
   CATEGORY
   ========================================================= */

function getCategory(route) {
  if (!route) {
    return "Main";
  }


  const parts =
    route
      .split("/")
      .filter(Boolean);


  if (!parts.length) {
    return "Main";
  }


  const first =
    parts[0];


  return (
    CATEGORY_MAP[first] ||
    "SalimGPT"
  );
}


/* =========================================================
   SUBCATEGORY
   ========================================================= */

function getSubcategory(route) {
  if (!route) {
    return "Home";
  }


  const parts =
    route
      .split("/")
      .filter(Boolean);


  if (!parts.length) {
    return "Home";
  }


  const key =
    parts.length > 1
      ? parts[parts.length - 1]
      : parts[0];


  if (
    SUBCATEGORY_MAP[key]
  ) {
    return SUBCATEGORY_MAP[key];
  }


  return key
    .split("-")
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}


/* =========================================================
   SEARCH ID
   ========================================================= */

function createSearchId(route) {
  if (!route) {
    return "home";
  }


  return route
    .replace(
      /\/+$/,
      ""
    )
    .replace(
      /\//g,
      "-"
    )
    .replace(
      /[^a-z0-9-]+/gi,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-|-$|/g,
      "")
    || "page";
}


/* =========================================================
   FIX EMPTY-ID EDGE CASE
   ========================================================= */

function normalizeSearchId(value) {
  const cleaned =
    String(value || "")
      .replace(
        /^-+|-+$/g,
        ""
      );


  return cleaned || "page";
}


/* =========================================================
   BUILD SEARCH ENTRY
   ========================================================= */

function buildSearchEntry(filePath) {
  const relativePath =
    relativeToProject(filePath);


  if (
    IGNORED_FILES.has(
      relativePath
    )
  ) {
    return null;
  }


  const stat =
    fs.statSync(filePath);


  if (
    !stat.isFile() ||
    stat.size === 0
  ) {
    return null;
  }


  const html =
    fs.readFileSync(
      filePath,
      "utf8"
    );


  if (isNoIndex(html)) {
    return null;
  }


  const route =
    getRouteFromFile(
      filePath
    );


  const mainHtml =
    extractMainHtml(
      html
    );


  const title =
    extractTitle(html) ||
    extractFirstTagText(
      mainHtml,
      "h1"
    );


  if (!title) {
    warning(
      `Skipped ${relativePath}: no usable title found.`
    );

    return null;
  }


  const h1 =
    extractFirstTagText(
      mainHtml,
      "h1"
    );


  const headings =
    extractHeadings(
      mainHtml
    );


  const description =
    extractDescription(html);


  const keywords =
    extractMetaKeywords(html);


  const searchText =
    extractSearchText(
      mainHtml
    );


  const url =
    getCanonicalUrl(
      html,
      route
    );


  const category =
    getCategory(route);


  const subcategory =
    getSubcategory(route);


  const rawId =
    createSearchId(route);


  return {
    id:
      normalizeSearchId(rawId),

    title,

    description,

    url,

    route:
      route || "/",

    category,

    subcategory,

    h1,

    headings,

    keywords,

    image:
      extractImage(html),

    text:
      searchText
  };
}


/* =========================================================
   REMOVE DUPLICATES
   ========================================================= */

function deduplicateEntries(entries) {
  const seenUrls =
    new Set();

  const seenIds =
    new Set();

  const result = [];


  for (const entry of entries) {
    if (
      seenUrls.has(entry.url)
    ) {
      warning(
        `Duplicate search URL skipped: ${entry.url}`
      );

      continue;
    }


    if (
      seenIds.has(entry.id)
    ) {
      let suffix = 2;
      let candidate =
        `${entry.id}-${suffix}`;


      while (
        seenIds.has(candidate)
      ) {
        suffix += 1;

        candidate =
          `${entry.id}-${suffix}`;
      }


      entry.id =
        candidate;
    }


    seenUrls.add(entry.url);
    seenIds.add(entry.id);

    result.push(entry);
  }


  return result;
}


/* =========================================================
   SORT SEARCH ENTRIES
   ========================================================= */

function sortEntries(entries) {
  return entries.sort(
    (a, b) => {
      /*
       * Home always comes first.
       */
      if (a.route === "/") {
        return -1;
      }

      if (b.route === "/") {
        return 1;
      }


      const categoryComparison =
        a.category.localeCompare(
          b.category,
          "en",
          {
            sensitivity: "base"
          }
        );


      if (
        categoryComparison !== 0
      ) {
        return categoryComparison;
      }


      return a.title.localeCompare(
        b.title,
        "en",
        {
          sensitivity: "base"
        }
      );
    }
  );
}


/* =========================================================
   SAFE JSON FOR JAVASCRIPT
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
    );
}


/* =========================================================
   OUTPUT JAVASCRIPT
   ========================================================= */

function createOutputSource(entries) {
  const serialized =
    stringifyForJavaScript(
      entries
    );


  return `"use strict";

/* =========================================================
   SalimGPT Global Search Index

   AUTO-GENERATED FILE.
   Source: scripts/build-search-index.js

   Do not edit this file manually.
   Rebuild with:

   npm run build:search
   ========================================================= */

(function (global) {

  const index = ${serialized};

  /*
   * Primary public search-index variable.
   */
  global.SALIMGPT_SEARCH_INDEX = index;


  /*
   * Compatibility alias for scripts that prefer
   * camelCase naming.
   */
  global.salimgptSearchIndex = index;


  /*
   * Optional metadata for search UI / diagnostics.
   */
  global.SALIMGPT_SEARCH_META = {
    version: 1,
    baseUrl: ${JSON.stringify(BASE_URL)},
    count: index.length
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
   VALIDATE GENERATED OUTPUT
   ========================================================= */

function validateGeneratedEntries(entries) {
  const errors = [];


  for (const entry of entries) {
    if (!entry.id) {
      errors.push(
        "Search entry is missing id."
      );
    }


    if (!entry.title) {
      errors.push(
        `Search entry "${entry.id}" is missing title.`
      );
    }


    if (!entry.url) {
      errors.push(
        `Search entry "${entry.id}" is missing URL.`
      );
    }


    if (
      entry.url &&
      !entry.url.startsWith(
        BASE_URL
      )
    ) {
      errors.push(
        `Search entry "${entry.id}" has an invalid external canonical URL: ${entry.url}`
      );
    }


    if (
      !Array.isArray(
        entry.headings
      )
    ) {
      errors.push(
        `Search entry "${entry.id}" has invalid headings.`
      );
    }


    if (
      !Array.isArray(
        entry.keywords
      )
    ) {
      errors.push(
        `Search entry "${entry.id}" has invalid keywords.`
      );
    }
  }


  if (errors.length) {
    throw new Error(
      errors.join("\n")
    );
  }
}


/* =========================================================
   BUILD
   ========================================================= */

function buildSearchIndex() {
  console.log(
    `${color.bold}\nSalimGPT Global — Search Index Builder${color.reset}`
  );

  console.log(
    `${color.gray}${PROJECT_ROOT}${color.reset}\n`
  );


  validateNodeVersion();


  const htmlFiles =
    walkDirectory(
      PROJECT_ROOT
    );


  info(
    `Found ${htmlFiles.length} HTML file(s).`
  );


  const entries = [];


  for (const filePath of htmlFiles) {
    const entry =
      buildSearchEntry(
        filePath
      );


    if (entry) {
      entries.push(entry);
    }
  }


  const finalEntries =
    sortEntries(
      deduplicateEntries(
        entries
      )
    );


  if (!finalEntries.length) {
    throw new Error(
      "No searchable pages were found. Search index was not generated."
    );
  }


  validateGeneratedEntries(
    finalEntries
  );


  ensureOutputDirectory();


  const output =
    createOutputSource(
      finalEntries
    );


  fs.writeFileSync(
    OUTPUT_FILE,
    output,
    "utf8"
  );


  const outputSize =
    fs.statSync(
      OUTPUT_FILE
    ).size;


  success(
    `Generated ${relativeToProject(OUTPUT_FILE)}`
  );


  success(
    `${finalEntries.length} searchable page(s) indexed.`
  );


  info(
    `Search index size: ${(outputSize / 1024).toFixed(1)} KB`
  );


  console.log(
    `\n${color.green}${color.bold}SEARCH INDEX BUILD PASSED${color.reset}\n`
  );
}


/* =========================================================
   RUN
   ========================================================= */

try {
  buildSearchIndex();
} catch (error) {
  fail(
    "Search index build failed."
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