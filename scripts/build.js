"use strict";

/* =========================================================
   SalimGPT Global
   File: scripts/build.js

   Final static-site build / validation script.

   Responsibilities:
   - Verify Node.js version
   - Verify required project structure
   - Verify all canonical SalimGPT routes
   - Protect canonical brand assets from accidental changes
   - Validate HTML fundamentals
   - Validate canonical URLs
   - Detect duplicate HTML IDs
   - Validate local href/src references
   - Validate CSS url(...) references
   - Warn about empty referenced assets
   - Create .nojekyll for GitHub Pages
   - Print a clear build summary

   No external npm dependencies required.
   Node.js: >= 18
   ========================================================= */


const fs = require("fs");
const path = require("path");
const crypto = require("crypto");


/* =========================================================
   PROJECT CONFIG
   ========================================================= */

const PROJECT_ROOT =
  path.resolve(__dirname, "..");

const BASE_URL =
  "https://salimgpt.github.io/salimgpt/";

const GITHUB_PAGES_PREFIX =
  "/salimgpt/";

const MINIMUM_NODE_MAJOR = 18;


/*
 * Strict mode:
 *
 * SALIMGPT_STRICT_BUILD=1 npm run build
 *
 * In strict mode warnings also cause the build to fail.
 */
const STRICT_MODE =
  process.env.SALIMGPT_STRICT_BUILD === "1";


/*
 * Optional JSON report:
 *
 * SALIMGPT_WRITE_REPORT=1 npm run build
 */
const WRITE_REPORT =
  process.env.SALIMGPT_WRITE_REPORT === "1";


/* =========================================================
   CANONICAL SITE ROUTES
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
   REQUIRED PROJECT FILES
   ========================================================= */

const REQUIRED_FILES = [
  "index.html",
  "404.html",
  "favicon.svg",
  "manifest.webmanifest",
  "robots.txt",
  "package.json",

  "assets/brand/logo.svg",
  "assets/brand/wordmark.svg",

  "css/global.css",
  "css/header.css",
  "css/menu.css",
  "css/footer.css",

  "js/menu.js",
  "js/site.js",
  "js/global-search.js",

  "data/site.js",
  "data/search-index.js",

  "scripts/build.js",
  "scripts/build-search-index.js",
  "scripts/build-faq-index.js",
  "scripts/build-sitemap.js"
];


/* =========================================================
   REQUIRED DIRECTORIES
   ========================================================= */

const REQUIRED_DIRECTORIES = [
  "assets",
  "assets/brand",
  "assets/pages",
  "css",
  "data",
  "js",
  "scripts",
  "topics",
  "global",
  "about",
  "how-we-work",
  "trust",
  "help",
  "legal"
];


/* =========================================================
   CANONICAL BRAND FILE HASHES

   These hashes protect the exact canonical brand files.

   If the canonical logo or wordmark is intentionally replaced,
   update the corresponding SHA-256 here only after approving
   the new canonical asset.
   ========================================================= */

const PROTECTED_BRAND_ASSETS = {
  "assets/brand/logo.svg":
    "c3205ee1456421ad5945c4a6bd9bfb6ee257cc267933d74aaa43954c35c420db",

  "assets/brand/wordmark.svg":
    "c940c65873898b9f0024fd92fea4c4e812edb60903d00f53d9ddba8566c9ad92"
};


/* =========================================================
   SCAN CONFIG
   ========================================================= */

const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".github",
  "node_modules",
  ".build",
  "dist",
  "coverage"
]);


const REFERENCE_EXTENSIONS_TO_WARN_IF_EMPTY =
  new Set([
    ".html",
    ".css",
    ".js",
    ".json",
    ".svg",
    ".webp",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".avif"
  ]);


/* =========================================================
   BUILD STATE
   ========================================================= */

const errors = [];
const warnings = [];
const notices = [];

const checkedFiles = new Set();
const emptyReferenceWarnings = new Set();


/* =========================================================
   TERMINAL HELPERS
   ========================================================= */

const supportsColor =
  Boolean(process.stdout.isTTY) &&
  process.env.NO_COLOR === undefined;


const color = {
  reset: supportsColor ? "\x1b[0m" : "",
  bold: supportsColor ? "\x1b[1m" : "",
  red: supportsColor ? "\x1b[31m" : "",
  green: supportsColor ? "\x1b[32m" : "",
  yellow: supportsColor ? "\x1b[33m" : "",
  blue: supportsColor ? "\x1b[34m" : "",
  gray: supportsColor ? "\x1b[90m" : ""
};


function logTitle(text) {
  console.log(
    `\n${color.bold}${color.blue}${text}${color.reset}`
  );
}


function logSuccess(text) {
  console.log(
    `${color.green}✓${color.reset} ${text}`
  );
}


function logInfo(text) {
  console.log(
    `${color.blue}•${color.reset} ${text}`
  );
}


/* =========================================================
   PATH HELPERS
   ========================================================= */

function absolutePath(relativePath) {
  return path.join(
    PROJECT_ROOT,
    relativePath
  );
}


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


function exists(relativePath) {
  return fs.existsSync(
    absolutePath(relativePath)
  );
}


function isFile(relativePath) {
  const target =
    absolutePath(relativePath);

  return (
    fs.existsSync(target) &&
    fs.statSync(target).isFile()
  );
}


function isDirectory(relativePath) {
  const target =
    absolutePath(relativePath);

  return (
    fs.existsSync(target) &&
    fs.statSync(target).isDirectory()
  );
}


function fileSize(relativePath) {
  const target =
    absolutePath(relativePath);

  if (!fs.existsSync(target)) {
    return -1;
  }

  return fs.statSync(target).size;
}


/* =========================================================
   ISSUE HELPERS
   ========================================================= */

function addError(message) {
  errors.push(message);
}


function addWarning(message) {
  warnings.push(message);
}


function addNotice(message) {
  notices.push(message);
}


/* =========================================================
   SHA-256
   ========================================================= */

function sha256(filePath) {
  const buffer =
    fs.readFileSync(filePath);

  return crypto
    .createHash("sha256")
    .update(buffer)
    .digest("hex");
}


/* =========================================================
   RECURSIVE FILE WALKER
   ========================================================= */

function walkDirectory(
  directory,
  predicate = () => true
) {
  const found = [];

  if (!fs.existsSync(directory)) {
    return found;
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
      found.push(
        ...walkDirectory(
          fullPath,
          predicate
        )
      );

      continue;
    }

    if (
      entry.isFile() &&
      predicate(fullPath)
    ) {
      found.push(fullPath);
    }
  }

  return found;
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
    addError(
      `Node.js ${MINIMUM_NODE_MAJOR}+ is required. Current version: ${process.versions.node}`
    );

    return;
  }

  logSuccess(
    `Node.js ${process.versions.node}`
  );
}


/* =========================================================
   REQUIRED STRUCTURE
   ========================================================= */

function validateRequiredStructure() {
  logTitle("Project structure");

  for (
    const directory
    of REQUIRED_DIRECTORIES
  ) {
    if (!isDirectory(directory)) {
      addError(
        `Missing required directory: ${directory}/`
      );
    }
  }

  for (
    const file
    of REQUIRED_FILES
  ) {
    if (!isFile(file)) {
      addError(
        `Missing required file: ${file}`
      );
    }
  }

  if (
    REQUIRED_DIRECTORIES.every(
      isDirectory
    ) &&
    REQUIRED_FILES.every(
      isFile
    )
  ) {
    logSuccess(
      "Required project files and directories are present."
    );
  }
}


/* =========================================================
   CANONICAL ROUTES
   ========================================================= */

function routeToIndexFile(route) {
  if (!route) {
    return "index.html";
  }

  return `${route}index.html`;
}


function routeToCanonicalUrl(route) {
  if (!route) {
    return BASE_URL;
  }

  return `${BASE_URL}${route}`;
}


function validateExpectedRoutes() {
  logTitle("Canonical routes");

  let validCount = 0;

  for (
    const route
    of EXPECTED_ROUTES
  ) {
    const htmlFile =
      routeToIndexFile(route);

    if (!isFile(htmlFile)) {
      addError(
        `Missing canonical page: ${htmlFile}`
      );

      continue;
    }

    const size =
      fileSize(htmlFile);

    if (size === 0) {
      addError(
        `Canonical page is empty: ${htmlFile}`
      );

      continue;
    }

    validCount += 1;
  }

  if (
    validCount ===
    EXPECTED_ROUTES.length
  ) {
    logSuccess(
      `${validCount} canonical pages found and non-empty.`
    );
  } else {
    logInfo(
      `${validCount}/${EXPECTED_ROUTES.length} canonical pages are currently ready.`
    );
  }
}


/* =========================================================
   BRAND ASSET PROTECTION
   ========================================================= */

function validateProtectedBrandAssets() {
  logTitle("Canonical brand assets");

  for (
    const [
      relativePath,
      expectedHash
    ]
    of Object.entries(
      PROTECTED_BRAND_ASSETS
    )
  ) {
    const fullPath =
      absolutePath(relativePath);

    if (!fs.existsSync(fullPath)) {
      addError(
        `Protected brand asset is missing: ${relativePath}`
      );

      continue;
    }

    const actualHash =
      sha256(fullPath);

    if (
      actualHash !==
      expectedHash
    ) {
      addError(
        `Canonical brand asset has changed: ${relativePath}`
      );

      continue;
    }

    logSuccess(
      `${relativePath} matches the approved canonical file.`
    );
  }
}


/* =========================================================
   HTML HELPERS
   ========================================================= */

function getAttribute(
  html,
  pattern
) {
  const match =
    html.match(pattern);

  return match
    ? match[1].trim()
    : null;
}


function getTitle(html) {
  return getAttribute(
    html,
    /<title[^>]*>([\s\S]*?)<\/title>/i
  );
}


function getDescription(html) {
  const match =
    html.match(
      /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
    ) ||
    html.match(
      /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i
    );

  return match
    ? match[1].trim()
    : null;
}


function getCanonical(html) {
  const tagMatch =
    html.match(
      /<link\b[^>]*rel=["'][^"']*\bcanonical\b[^"']*["'][^>]*>/i
    ) ||
    html.match(
      /<link\b[^>]*href=["'][^"']+["'][^>]*rel=["'][^"']*\bcanonical\b[^"']*["'][^>]*>/i
    );

  if (!tagMatch) {
    return null;
  }

  const hrefMatch =
    tagMatch[0].match(
      /\bhref=["']([^"']+)["']/i
    );

  return hrefMatch
    ? hrefMatch[1].trim()
    : null;
}


/* =========================================================
   DUPLICATE HTML IDS
   ========================================================= */

function validateDuplicateIds(
  html,
  relativePath
) {
  const ids = new Map();

  const regex =
    /\bid=["']([^"']+)["']/gi;

  let match;

  while (
    (match = regex.exec(html))
  ) {
    const id =
      match[1].trim();

    if (!id) {
      continue;
    }

    ids.set(
      id,
      (ids.get(id) || 0) + 1
    );
  }

  for (
    const [id, count]
    of ids.entries()
  ) {
    if (count > 1) {
      addError(
        `${relativePath}: duplicate id="${id}" appears ${count} times.`
      );
    }
  }
}


/* =========================================================
   HTML FUNDAMENTALS
   ========================================================= */

function validateHtmlFundamentals(
  html,
  relativePath
) {
  if (
    !/<!doctype\s+html>/i.test(html)
  ) {
    addError(
      `${relativePath}: missing <!DOCTYPE html>.`
    );
  }


  if (
    !/<html\b[^>]*\blang=["'][^"']+["']/i.test(
      html
    )
  ) {
    addError(
      `${relativePath}: missing html lang attribute.`
    );
  }


  if (
    !/<meta\b[^>]*name=["']viewport["']/i.test(
      html
    )
  ) {
    addError(
      `${relativePath}: missing viewport meta tag.`
    );
  }


  const title =
    getTitle(html);

  if (!title) {
    addError(
      `${relativePath}: missing page title.`
    );
  }


  const description =
    getDescription(html);

  if (!description) {
    addWarning(
      `${relativePath}: missing meta description.`
    );
  }


  if (
    relativePath !== "404.html" &&
    !getCanonical(html)
  ) {
    addWarning(
      `${relativePath}: missing canonical URL.`
    );
  }


  if (
    !/<main\b/i.test(html)
  ) {
    addWarning(
      `${relativePath}: missing <main> element.`
    );
  }


  if (
    !/id=["']main-content["']/i.test(
      html
    )
  ) {
    addWarning(
      `${relativePath}: missing id="main-content".`
    );
  }


  if (
    !/<h1\b/i.test(html) &&
    relativePath !== "404.html"
  ) {
    addWarning(
      `${relativePath}: no <h1> found.`
    );
  }


  if (
    !/assets\/brand\/logo\.svg/i.test(
      html
    )
  ) {
    addWarning(
      `${relativePath}: canonical logo.svg is not referenced.`
    );
  }
}


/* =========================================================
   CANONICAL URL VALIDATION
   ========================================================= */

function validateCanonicalUrl(
  html,
  relativePath
) {
  if (
    relativePath === "404.html"
  ) {
    return;
  }

  const canonical =
    getCanonical(html);

  if (!canonical) {
    return;
  }


  let expectedCanonical = null;

  if (
    relativePath === "index.html"
  ) {
    expectedCanonical =
      BASE_URL;
  } else if (
    relativePath.endsWith(
      "/index.html"
    )
  ) {
    const route =
      relativePath.slice(
        0,
        -"index.html".length
      );

    expectedCanonical =
      routeToCanonicalUrl(route);
  }


  if (
    expectedCanonical &&
    canonical !== expectedCanonical
  ) {
    addWarning(
      `${relativePath}: canonical URL is "${canonical}" but expected "${expectedCanonical}".`
    );
  }


  if (
    !canonical.startsWith(
      BASE_URL
    )
  ) {
    addWarning(
      `${relativePath}: canonical URL is outside the SalimGPT global base URL.`
    );
  }
}


/* =========================================================
   LOCAL REFERENCE HELPERS
   ========================================================= */

function shouldIgnoreReference(value) {
  if (!value) {
    return true;
  }

  const reference =
    value.trim();

  return (
    reference === "" ||
    reference.startsWith("#") ||
    reference.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(
      reference
    )
  );
}


function removeQueryAndFragment(value) {
  return value
    .split("#")[0]
    .split("?")[0];
}


function resolveReference(
  sourceFile,
  rawReference
) {
  let reference =
    removeQueryAndFragment(
      rawReference.trim()
    );

  if (!reference) {
    return null;
  }


  try {
    reference =
      decodeURIComponent(reference);
  } catch {
    /*
     * Keep the original reference if it
     * contains malformed URI encoding.
     */
  }


  if (
    reference.startsWith(
      GITHUB_PAGES_PREFIX
    )
  ) {
    reference =
      reference.slice(
        GITHUB_PAGES_PREFIX.length
      );

    return path.resolve(
      PROJECT_ROOT,
      reference
    );
  }


  if (
    reference.startsWith("/")
  ) {
    addWarning(
      `${relativeToProject(sourceFile)}: root-relative reference "${rawReference}" may break under the GitHub Pages /salimgpt/ base path.`
    );

    reference =
      reference.replace(
        /^\/+/,
        ""
      );

    return path.resolve(
      PROJECT_ROOT,
      reference
    );
  }


  return path.resolve(
    path.dirname(sourceFile),
    reference
  );
}


/* =========================================================
   TARGET NORMALIZATION
   ========================================================= */

function normalizeReferenceTarget(
  targetPath,
  rawReference
) {
  if (
    fs.existsSync(targetPath)
  ) {
    const stat =
      fs.statSync(targetPath);

    if (stat.isDirectory()) {
      return path.join(
        targetPath,
        "index.html"
      );
    }

    return targetPath;
  }


  const cleanReference =
    removeQueryAndFragment(
      rawReference
    );


  /*
   * A URL such as:
   * ../about
   *
   * may point to:
   * ../about/index.html
   */
  if (
    !path.extname(cleanReference)
  ) {
    const directoryIndex =
      path.join(
        targetPath,
        "index.html"
      );

    if (
      fs.existsSync(
        directoryIndex
      )
    ) {
      return directoryIndex;
    }
  }


  return targetPath;
}


/* =========================================================
   EMPTY REFERENCED FILE WARNING
   ========================================================= */

function warnIfReferencedFileIsEmpty(
  targetPath,
  sourceRelativePath
) {
  if (
    !fs.existsSync(targetPath)
  ) {
    return;
  }


  const stat =
    fs.statSync(targetPath);

  if (
    !stat.isFile() ||
    stat.size !== 0
  ) {
    return;
  }


  const extension =
    path
      .extname(targetPath)
      .toLowerCase();


  if (
    !REFERENCE_EXTENSIONS_TO_WARN_IF_EMPTY.has(
      extension
    )
  ) {
    return;
  }


  const targetRelative =
    relativeToProject(targetPath);

  const key =
    `${sourceRelativePath}=>${targetRelative}`;


  if (
    emptyReferenceWarnings.has(key)
  ) {
    return;
  }


  emptyReferenceWarnings.add(key);


  addWarning(
    `${sourceRelativePath}: referenced file is empty: ${targetRelative}`
  );
}


/* =========================================================
   LOCAL REFERENCE VALIDATION
   ========================================================= */

function validateLocalReference(
  sourceFile,
  rawReference
) {
  if (
    shouldIgnoreReference(
      rawReference
    )
  ) {
    return;
  }


  const sourceRelative =
    relativeToProject(
      sourceFile
    );


  const resolved =
    resolveReference(
      sourceFile,
      rawReference
    );


  if (!resolved) {
    return;
  }


  const target =
    normalizeReferenceTarget(
      resolved,
      rawReference
    );


  /*
   * Prevent references accidentally escaping
   * the SalimGPT project root.
   */
  const relativeTarget =
    path.relative(
      PROJECT_ROOT,
      target
    );


  if (
    relativeTarget.startsWith("..") ||
    path.isAbsolute(relativeTarget) &&
    !target.startsWith(PROJECT_ROOT)
  ) {
    addError(
      `${sourceRelative}: reference escapes project root: "${rawReference}"`
    );

    return;
  }


  if (
    !fs.existsSync(target)
  ) {
    addError(
      `${sourceRelative}: broken local reference "${rawReference}" → ${normalizeSlashes(relativeTarget)}`
    );

    return;
  }


  warnIfReferencedFileIsEmpty(
    target,
    sourceRelative
  );
}


/* =========================================================
   HTML REFERENCES
   ========================================================= */

function validateHtmlReferences(
  html,
  filePath
) {
  const referenceRegex =
    /\b(?:href|src)=["']([^"']+)["']/gi;

  let match;

  while (
    (match =
      referenceRegex.exec(html))
  ) {
    validateLocalReference(
      filePath,
      match[1]
    );
  }
}


/* =========================================================
   CSS REFERENCES
   ========================================================= */

function validateCssReferences(
  css,
  filePath
) {
  const urlRegex =
    /url\(\s*(['"]?)(.*?)\1\s*\)/gi;

  let match;

  while (
    (match =
      urlRegex.exec(css))
  ) {
    const reference =
      match[2].trim();

    if (
      !reference ||
      reference.startsWith("data:")
    ) {
      continue;
    }

    validateLocalReference(
      filePath,
      reference
    );
  }
}


/* =========================================================
   HTML VALIDATION
   ========================================================= */

function validateHtmlFiles() {
  logTitle("HTML validation");

  const htmlFiles =
    walkDirectory(
      PROJECT_ROOT,
      (filePath) =>
        path
          .extname(filePath)
          .toLowerCase() === ".html"
    ).filter(
      (filePath) =>
        path.basename(filePath) !==
        "googlecd711d3906daa66c.html"
    );


  let nonEmptyCount = 0;


  for (
    const filePath
    of htmlFiles
  ) {
    const relativePath =
      relativeToProject(
        filePath
      );


    checkedFiles.add(
      relativePath
    );


    const stat =
      fs.statSync(filePath);


    if (stat.size === 0) {
      addError(
        `HTML file is empty: ${relativePath}`
      );

      continue;
    }


    nonEmptyCount += 1;


    const html =
      fs.readFileSync(
        filePath,
        "utf8"
      );


    validateHtmlFundamentals(
      html,
      relativePath
    );


    validateCanonicalUrl(
      html,
      relativePath
    );


    validateDuplicateIds(
      html,
      relativePath
    );


    validateHtmlReferences(
      html,
      filePath
    );
  }


  logInfo(
    `${nonEmptyCount}/${htmlFiles.length} HTML files are non-empty.`
  );
}


/* =========================================================
   CSS VALIDATION
   ========================================================= */

function validateCssFiles() {
  logTitle("CSS validation");

  const cssDirectory =
    absolutePath("css");


  const cssFiles =
    walkDirectory(
      cssDirectory,
      (filePath) =>
        path
          .extname(filePath)
          .toLowerCase() === ".css"
    );


  let nonEmptyCount = 0;


  for (
    const filePath
    of cssFiles
  ) {
    const relativePath =
      relativeToProject(
        filePath
      );


    const stat =
      fs.statSync(filePath);


    if (stat.size === 0) {
      addWarning(
        `CSS file is empty: ${relativePath}`
      );

      continue;
    }


    nonEmptyCount += 1;


    const css =
      fs.readFileSync(
        filePath,
        "utf8"
      );


    validateCssReferences(
      css,
      filePath
    );
  }


  logInfo(
    `${nonEmptyCount}/${cssFiles.length} CSS files are non-empty.`
  );
}


/* =========================================================
   JAVASCRIPT FILE CHECK
   ========================================================= */

function validateJavaScriptFiles() {
  logTitle("JavaScript validation");

  const directories = [
    absolutePath("js"),
    absolutePath("data"),
    absolutePath("scripts")
  ];


  const jsFiles = [];


  for (
    const directory
    of directories
  ) {
    jsFiles.push(
      ...walkDirectory(
        directory,
        (filePath) =>
          path
            .extname(filePath)
            .toLowerCase() === ".js"
      )
    );
  }


  let nonEmptyCount = 0;


  for (
    const filePath
    of jsFiles
  ) {
    const relativePath =
      relativeToProject(
        filePath
      );


    const stat =
      fs.statSync(filePath);


    if (stat.size === 0) {
      addWarning(
        `JavaScript file is empty: ${relativePath}`
      );

      continue;
    }


    nonEmptyCount += 1;
  }


  logInfo(
    `${nonEmptyCount}/${jsFiles.length} JavaScript files are non-empty.`
  );
}


/* =========================================================
   PAGE IMAGE CHECK
   ========================================================= */

function validatePageImages() {
  logTitle("Page images");

  const pagesDirectory =
    absolutePath(
      "assets/pages"
    );


  if (
    !fs.existsSync(
      pagesDirectory
    )
  ) {
    return;
  }


  const pageImages =
    walkDirectory(
      pagesDirectory,
      (filePath) => {
        return [
          ".webp",
          ".png",
          ".jpg",
          ".jpeg",
          ".avif"
        ].includes(
          path
            .extname(filePath)
            .toLowerCase()
        );
      }
    );


  let nonEmptyCount = 0;
  let emptyCount = 0;


  for (
    const imagePath
    of pageImages
  ) {
    const stat =
      fs.statSync(imagePath);

    if (stat.size === 0) {
      emptyCount += 1;
    } else {
      nonEmptyCount += 1;
    }
  }


  logInfo(
    `${nonEmptyCount}/${pageImages.length} page images contain data.`
  );


  if (emptyCount > 0) {
    addWarning(
      `${emptyCount} predefined page image asset(s) are still empty placeholders.`
    );
  }
}


/* =========================================================
   MANIFEST CHECK
   ========================================================= */

function validateManifest() {
  logTitle("Manifest");

  const relativePath =
    "manifest.webmanifest";

  const fullPath =
    absolutePath(relativePath);


  if (
    !fs.existsSync(fullPath)
  ) {
    return;
  }


  try {
    const manifest =
      JSON.parse(
        fs.readFileSync(
          fullPath,
          "utf8"
        )
      );


    if (!manifest.name) {
      addWarning(
        `${relativePath}: missing "name".`
      );
    }


    if (!manifest.short_name) {
      addWarning(
        `${relativePath}: missing "short_name".`
      );
    }


    if (!manifest.start_url) {
      addWarning(
        `${relativePath}: missing "start_url".`
      );
    }


    if (!manifest.icons) {
      addWarning(
        `${relativePath}: missing "icons".`
      );
    }


    logSuccess(
      "manifest.webmanifest contains valid JSON."
    );
  } catch (error) {
    addError(
      `${relativePath}: invalid JSON — ${error.message}`
    );
  }
}


/* =========================================================
   ROBOTS CHECK
   ========================================================= */

function validateRobots() {
  logTitle("Robots & sitemap");

  const robotsPath =
    absolutePath("robots.txt");


  if (
    fs.existsSync(robotsPath)
  ) {
    const robots =
      fs.readFileSync(
        robotsPath,
        "utf8"
      );


    const expectedSitemap =
      `${BASE_URL}sitemap.xml`;


    if (
      !robots.includes(
        expectedSitemap
      )
    ) {
      addWarning(
        `robots.txt does not reference ${expectedSitemap}`
      );
    }
  }


  const sitemapPath =
    absolutePath("sitemap.xml");


  if (
    !fs.existsSync(sitemapPath)
  ) {
    addWarning(
      "sitemap.xml is missing. Run npm run build:sitemap."
    );
  } else if (
    fs.statSync(sitemapPath).size === 0
  ) {
    addWarning(
      "sitemap.xml is empty. Run npm run build:sitemap."
    );
  } else {
    logSuccess(
      "sitemap.xml is present and non-empty."
    );
  }
}


/* =========================================================
   GITHUB PAGES SUPPORT
   ========================================================= */

function ensureNoJekyll() {
  logTitle("GitHub Pages");

  const noJekyllPath =
    absolutePath(".nojekyll");


  if (
    !fs.existsSync(noJekyllPath)
  ) {
    fs.writeFileSync(
      noJekyllPath,
      "",
      "utf8"
    );

    addNotice(
      "Created .nojekyll for GitHub Pages."
    );

    return;
  }


  logSuccess(
    ".nojekyll is present."
  );
}


/* =========================================================
   OPTIONAL BUILD REPORT
   ========================================================= */

function writeBuildReport() {
  if (!WRITE_REPORT) {
    return;
  }


  const reportDirectory =
    absolutePath(".build");


  fs.mkdirSync(
    reportDirectory,
    {
      recursive: true
    }
  );


  const report = {
    project: "SalimGPT Global",
    baseUrl: BASE_URL,
    generatedAt:
      new Date().toISOString(),

    node:
      process.versions.node,

    strictMode:
      STRICT_MODE,

    canonicalRouteCount:
      EXPECTED_ROUTES.length,

    checkedHtmlFiles:
      Array.from(
        checkedFiles
      ).sort(),

    errors,
    warnings,
    notices,

    passed:
      errors.length === 0 &&
      (
        !STRICT_MODE ||
        warnings.length === 0
      )
  };


  const outputPath =
    path.join(
      reportDirectory,
      "build-report.json"
    );


  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(
      report,
      null,
      2
    )}\n`,
    "utf8"
  );


  addNotice(
    "Wrote .build/build-report.json."
  );
}


/* =========================================================
   PRINT ISSUES
   ========================================================= */

function printIssues() {
  if (notices.length) {
    logTitle("Build notices");

    for (
      const notice
      of notices
    ) {
      console.log(
        `${color.blue}•${color.reset} ${notice}`
      );
    }
  }


  if (warnings.length) {
    logTitle(
      `Warnings (${warnings.length})`
    );

    for (
      const warning
      of warnings
    ) {
      console.log(
        `${color.yellow}⚠${color.reset} ${warning}`
      );
    }
  }


  if (errors.length) {
    logTitle(
      `Errors (${errors.length})`
    );

    for (
      const error
      of errors
    ) {
      console.log(
        `${color.red}✗${color.reset} ${error}`
      );
    }
  }
}


/* =========================================================
   BUILD SUMMARY
   ========================================================= */

function printSummary() {
  const strictFailure =
    STRICT_MODE &&
    warnings.length > 0;


  console.log(
    "\n" +
    color.bold +
    "========================================================="
  );

  console.log(
    "SalimGPT Global Build Summary"
  );

  console.log(
    "=========================================================" +
    color.reset
  );


  console.log(
    `Project root : ${PROJECT_ROOT}`
  );

  console.log(
    `Base URL     : ${BASE_URL}`
  );

  console.log(
    `Routes       : ${EXPECTED_ROUTES.length}`
  );

  console.log(
    `Errors       : ${errors.length}`
  );

  console.log(
    `Warnings     : ${warnings.length}`
  );

  console.log(
    `Strict mode  : ${STRICT_MODE ? "ON" : "OFF"}`
  );


  if (
    errors.length === 0 &&
    !strictFailure
  ) {
    console.log(
      `\n${color.green}${color.bold}BUILD PASSED${color.reset}`
    );

    return true;
  }


  if (
    errors.length === 0 &&
    strictFailure
  ) {
    console.log(
      `\n${color.red}${color.bold}BUILD FAILED${color.reset}`
    );

    console.log(
      `${color.yellow}Strict mode treats warnings as build failures.${color.reset}`
    );

    return false;
  }


  console.log(
    `\n${color.red}${color.bold}BUILD FAILED${color.reset}`
  );

  return false;
}


/* =========================================================
   BUILD
   ========================================================= */

function build() {
  console.log(
    `${color.bold}\nSalimGPT Global — Build Validation${color.reset}`
  );

  console.log(
    `${color.gray}${BASE_URL}${color.reset}`
  );


  validateNodeVersion();

  validateRequiredStructure();

  validateExpectedRoutes();

  validateProtectedBrandAssets();

  validateManifest();

  validateRobots();

  validateHtmlFiles();

  validateCssFiles();

  validateJavaScriptFiles();

  validatePageImages();

  ensureNoJekyll();

  writeBuildReport();

  printIssues();


  const passed =
    printSummary();


  if (!passed) {
    process.exitCode = 1;
  }
}


/* =========================================================
   FATAL ERROR HANDLER
   ========================================================= */

try {
  build();
} catch (error) {
  console.error(
    `\n${color.red}${color.bold}Fatal build error:${color.reset}`
  );

  console.error(
    error &&
    error.stack
      ? error.stack
      : error
  );

  process.exitCode = 1;
}
