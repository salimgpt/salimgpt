/* =========================================================
   SalimGPT
   File: scripts/build.js
   Purpose: Automatic Documentary Publishing Engine
   ---------------------------------------------------------
   FUTURE WORKFLOW:

   1. Upload:
      content/new-documentary.md

   2. Upload:
      assets/documentaries/new-documentary/
      ├── new-documentary-1.jpg
      ├── new-documentary-2.jpg
      ├── new-documentary-3.jpg
      └── new-documentary-4.jpg

      Supported image formats:
      - .jpg
      - .jpeg
      - .png
      - .webp

   3. Push to GitHub.

   AUTOMATICALLY:
   - Documentary discovered
   - Metadata validated
   - Publication date validated
   - Slug validated
   - 4 real documentary images validated
   - JPG / JPEG / PNG / WebP supported
   - YouTube ID extracted
   - Real YouTube thumbnail used
   - Article HTML generated
   - 4 images distributed through article
   - TOC generated from real headings
   - Reading time calculated
   - Related documentaries generated
   - Homepage data generated
   - Newest-first sorting
   - sitemap.xml generated
   - robots.txt generated
   - _site/ generated
   ========================================================= */

"use strict";


/* =========================================================
   01. DEPENDENCIES
   ========================================================= */

const fs = require("fs");
const path = require("path");

const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");


/* =========================================================
   02. PATHS
   ========================================================= */

const ROOT =
  path.resolve(__dirname, "..");

const CONTENT_DIR =
  path.join(ROOT, "content");

const TEMPLATE_FILE =
  path.join(
    ROOT,
    "templates",
    "documentary.html"
  );

const ASSETS_DIR =
  path.join(ROOT, "assets");

const DOCUMENTARY_ASSETS_DIR =
  path.join(
    ASSETS_DIR,
    "documentaries"
  );

const OUTPUT_DIR =
  path.join(ROOT, "_site");

const OUTPUT_DOCUMENTARIES_DIR =
  path.join(
    OUTPUT_DIR,
    "documentaries"
  );

const OUTPUT_DATA_DIR =
  path.join(
    OUTPUT_DIR,
    "data"
  );


/* =========================================================
   03. CONSTANTS
   ========================================================= */

const IMAGE_COUNT = 4;

const MIN_IMAGE_SIZE = 32;

const SUPPORTED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp"
];

const YOUTUBE_IMAGE_BASE =
  "https://i.ytimg.com/vi/";

const YOUTUBE_WATCH_BASE =
  "https://www.youtube.com/watch?v=";

const YOUTUBE_EMBED_BASE =
  "https://www.youtube.com/embed/";

const DEFAULT_LANGUAGE =
  "bn-BD";

const WORDS_PER_MINUTE =
  220;


/* =========================================================
   04. TERMINAL HELPERS
   ========================================================= */

function log(message) {
  console.log(
    `[SalimGPT Build] ${message}`
  );
}


function warn(message) {
  console.warn(
    `[SalimGPT Build Warning] ${message}`
  );
}


function fail(message) {
  throw new Error(
    `[SalimGPT Build Error] ${message}`
  );
}


/* =========================================================
   05. BASIC HELPERS
   ========================================================= */

function cleanText(value) {

  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
}


function escapeHTML(value) {

  return cleanText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function escapeXML(value) {

  return cleanText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}


function ensureDir(directory) {

  fs.mkdirSync(
    directory,
    {
      recursive: true
    }
  );
}


function fileExists(filePath) {

  try {

    return fs
      .statSync(filePath)
      .isFile();

  } catch (error) {

    return false;
  }
}


function directoryExists(directory) {

  try {

    return fs
      .statSync(directory)
      .isDirectory();

  } catch (error) {

    return false;
  }
}


function normalizeSlashes(value) {

  return String(value)
    .replace(/\\/g, "/");
}


/* =========================================================
   06. BENGALI NUMBER
   ========================================================= */

const bengaliDigits = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯"
};


function toBengaliNumber(value) {

  return String(value).replace(
    /\d/g,
    (digit) => bengaliDigits[digit]
  );
}


/* =========================================================
   07. SITE URL
   ========================================================= */

function resolveSiteConfig() {

  /*
    Optional custom production URL:

    SITE_URL=https://example.com

    অথবা:

    SITE_URL=https://username.github.io/salimgpt
  */

  const explicitSiteUrl =
    cleanText(
      process.env.SITE_URL
    )
      .replace(/\/+$/, "");


  if (explicitSiteUrl) {

    let parsedUrl;


    try {

      parsedUrl =
        new URL(explicitSiteUrl);

    } catch (error) {

      fail(
        `Invalid SITE_URL: ${explicitSiteUrl}`
      );
    }


    if (
      !["http:", "https:"].includes(
        parsedUrl.protocol
      )
    ) {

      fail(
        "SITE_URL must use http:// or https://"
      );
    }


    return {

      siteUrl:
        explicitSiteUrl,

      basePath:
        parsedUrl.pathname
          .replace(/\/+$/, "")

    };
  }


  /*
    GitHub Actions:
    GITHUB_REPOSITORY = owner/repository
  */

  const githubRepository =
    cleanText(
      process.env.GITHUB_REPOSITORY
    );


  if (githubRepository) {

    const parts =
      githubRepository.split("/");


    if (
      parts.length === 2
    ) {

      const owner =
        cleanText(parts[0]);

      const repository =
        cleanText(parts[1]);


      if (
        owner &&
        repository
      ) {

        /*
          User/organization Pages repository.
        */

        if (
          repository.toLowerCase() ===
          `${owner.toLowerCase()}.github.io`
        ) {

          return {

            siteUrl:
              `https://${owner}.github.io`,

            basePath:
              ""

          };
        }


        /*
          Project Pages.
        */

        return {

          siteUrl:
            `https://${owner}.github.io/${repository}`,

          basePath:
            `/${repository}`

        };
      }
    }
  }


  /*
    Local build only.
  */

  warn(
    "Production SITE_URL পাওয়া যায়নি। Local URL ব্যবহার করা হচ্ছে."
  );


  return {

    siteUrl:
      "http://localhost:8080",

    basePath:
      ""

  };
}


const SITE =
  resolveSiteConfig();


/* =========================================================
   08. STRICT DATE VALIDATION
   ========================================================= */

function isRealCalendarDate(
  year,
  month,
  day
) {

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );


  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}


function normalizeDate(value) {

  if (!value) {
    return "";
  }


  /*
    YAML parser কখনো date-কে Date object বানাতে পারে।
  */

  if (
    value instanceof Date
  ) {

    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return "";
    }


    return value
      .toISOString()
      .slice(0, 10);
  }


  const input =
    cleanText(value);


  /*
    Ambiguous date accepted হবে না।

    Required:
    YYYY-MM-DD
  */

  const match =
    input.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );


  if (!match) {
    return "";
  }


  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);


  if (
    !isRealCalendarDate(
      year,
      month,
      day
    )
  ) {
    return "";
  }


  return input;
}


function parseDateTimestamp(value) {

  const normalized =
    normalizeDate(value);


  if (!normalized) {
    return 0;
  }


  return Date.parse(
    `${normalized}T00:00:00Z`
  );
}


function formatBengaliDate(value) {

  const normalized =
    normalizeDate(value);


  if (!normalized) {
    return "";
  }


  const date =
    new Date(
      `${normalized}T00:00:00Z`
    );


  try {

    return new Intl.DateTimeFormat(
      DEFAULT_LANGUAGE,
      {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
      }
    ).format(date);

  } catch (error) {

    return normalized;
  }
}


/* =========================================================
   09. SLUG
   ========================================================= */

function normalizeSlug(value) {

  return cleanText(value)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}


function validateSlug(
  slug,
  sourceName
) {

  if (!slug) {

    fail(
      `Slug পাওয়া যায়নি: ${sourceName}`
    );
  }


  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      slug
    )
  ) {

    fail(
      `${sourceName}: invalid slug "${slug}". ` +
      `শুধু lowercase English letters, numbers এবং hyphen ব্যবহার করুন.`
    );
  }
}


/* =========================================================
   10. MARKDOWN TEXT HELPERS
   ========================================================= */

function stripInlineMarkdown(value) {

  return cleanText(value)
    .replace(
      /!\[([^\]]*)\]\([^)]+\)/g,
      "$1"
    )
    .replace(
      /\[([^\]]+)\]\([^)]+\)/g,
      "$1"
    )
    .replace(
      /[`*_~>#]/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}


function extractFirstH1(markdown) {

  const match =
    String(markdown).match(
      /^\s*#\s+(.+?)\s*$/m
    );


  if (!match) {
    return "";
  }


  return stripInlineMarkdown(
    match[1]
  );
}


function markdownToPlainText(markdown) {

  return String(markdown)

    .replace(
      /<!--\s*image\s*:\s*[1-4]\s*-->/gi,
      " "
    )

    .replace(
      /```[\s\S]*?```/g,
      " "
    )

    .replace(
      /<!--[\s\S]*?-->/g,
      " "
    )

    .replace(
      /<[^>]*>/g,
      " "
    )

    .replace(
      /!\[[^\]]*\]\([^)]+\)/g,
      " "
    )

    .replace(
      /\[([^\]]+)\]\([^)]+\)/g,
      "$1"
    )

    .replace(
      /^[#>*+-]+\s*/gm,
      ""
    )

    .replace(
      /[`*_~]/g,
      ""
    )

    .replace(
      /\s+/g,
      " "
    )

    .trim();
}


function generateDescription(
  markdown,
  maximumLength = 190
) {

  const text =
    markdownToPlainText(
      markdown
    );


  if (
    text.length <= maximumLength
  ) {
    return text;
  }


  const shortened =
    text.slice(
      0,
      maximumLength
    );


  const lastSpace =
    shortened.lastIndexOf(" ");


  const safeText =
    lastSpace > 100
      ? shortened.slice(
          0,
          lastSpace
        )
      : shortened;


  return `${safeText.trim()}…`;
}


/* =========================================================
   11. READING TIME
   ========================================================= */

function calculateReadingTime(
  markdown
) {

  const text =
    markdownToPlainText(
      markdown
    );


  if (!text) {
    return 1;
  }


  const words =
    text
      .split(/\s+/)
      .filter(Boolean);


  return Math.max(
    1,
    Math.ceil(
      words.length /
      WORDS_PER_MINUTE
    )
  );
}


/* =========================================================
   12. YOUTUBE
   ========================================================= */

function extractYouTubeId(value) {

  const input =
    cleanText(value);


  if (!input) {
    return "";
  }


  if (
    /^[A-Za-z0-9_-]{11}$/.test(
      input
    )
  ) {
    return input;
  }


  try {

    const url =
      new URL(input);


    const hostname =
      url.hostname
        .replace(/^www\./, "")
        .toLowerCase();


    if (
      hostname === "youtu.be"
    ) {

      const id =
        url.pathname
          .split("/")
          .filter(Boolean)[0] || "";


      return /^[A-Za-z0-9_-]{11}$/.test(id)
        ? id
        : "";
    }


    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com"
    ) {

      const watchId =
        url.searchParams.get("v");


      if (
        watchId &&
        /^[A-Za-z0-9_-]{11}$/.test(
          watchId
        )
      ) {
        return watchId;
      }


      const parts =
        url.pathname
          .split("/")
          .filter(Boolean);


      const type =
        parts[0];

      const id =
        parts[1];


      if (
        ["shorts", "embed", "live"]
          .includes(type) &&
        id &&
        /^[A-Za-z0-9_-]{11}$/.test(id)
      ) {
        return id;
      }
    }

  } catch (error) {

    const match =
      input.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/))([A-Za-z0-9_-]{11})/
      );


    if (
      match &&
      match[1]
    ) {
      return match[1];
    }
  }


  return "";
}


function normalizeYouTubeUrl(value) {

  const id =
    extractYouTubeId(value);


  if (!id) {
    return "";
  }


  return (
    `${YOUTUBE_WATCH_BASE}${id}`
  );
}


function youtubeMaxres(id) {

  if (!id) {
    return "";
  }


  return (
    `${YOUTUBE_IMAGE_BASE}` +
    `${id}/maxresdefault.jpg`
  );
}


function youtubeHQ(id) {

  if (!id) {
    return "";
  }


  return (
    `${YOUTUBE_IMAGE_BASE}` +
    `${id}/hqdefault.jpg`
  );
}


function youtubeEmbed(id) {

  if (!id) {
    return "";
  }


  return (
    `${YOUTUBE_EMBED_BASE}${id}`
  );
}


/* =========================================================
   13. TOPICS
   ========================================================= */

function normalizeTopics(value) {

  if (
    Array.isArray(value)
  ) {

    return value
      .map(cleanText)
      .filter(Boolean);
  }


  const input =
    cleanText(value);


  if (!input) {
    return [];
  }


  return input
    .split(",")
    .map(cleanText)
    .filter(Boolean);
}


/* =========================================================
   14. IMAGE CAPTIONS
   ========================================================= */

function normalizeImageCaptions(value) {

  if (
    !Array.isArray(value)
  ) {
    return [];
  }


  return value.map(
    (caption) =>
      cleanText(caption)
  );
}


/* =========================================================
   15. DOCUMENTARY IMAGE PATHS
   ========================================================= */

function getDocumentaryImageInfo(
  slug,
  imageNumber
) {

  const imageDirectory =
    path.join(
      DOCUMENTARY_ASSETS_DIR,
      slug
    );


  const matches =
    SUPPORTED_IMAGE_EXTENSIONS

      .map(
        (extension) => {

          const fileName =
            `${slug}-${imageNumber}${extension}`;


          return {

            extension,

            fileName,

            filePath:
              path.join(
                imageDirectory,
                fileName
              )

          };
        }
      )

      .filter(
        (image) =>
          fileExists(
            image.filePath
          )
      );


  if (
    !matches.length
  ) {

    fail(
      `Image missing: assets/documentaries/${slug}/` +
      `${slug}-${imageNumber}.{jpg,jpeg,png,webp}`
    );
  }


  if (
    matches.length > 1
  ) {

    warn(
      `Multiple image formats found for ${slug}-${imageNumber}. ` +
      `Using ${matches[0].fileName}`
    );
  }


  return matches[0];
}


function getImageSourcePath(
  slug,
  imageNumber
) {

  return getDocumentaryImageInfo(
    slug,
    imageNumber
  ).filePath;
}


function getArticleImageUrl(
  slug,
  imageNumber
) {

  const image =
    getDocumentaryImageInfo(
      slug,
      imageNumber
    );


  return (
    "../../assets/documentaries/" +
    `${encodeURIComponent(slug)}/` +
    `${encodeURIComponent(image.fileName)}`
  );
}


function getHomepageImageUrl(
  slug,
  imageNumber = 1
) {

  const image =
    getDocumentaryImageInfo(
      slug,
      imageNumber
    );


  return (
    "assets/documentaries/" +
    `${encodeURIComponent(slug)}/` +
    `${encodeURIComponent(image.fileName)}`
  );
}


function getAbsoluteImageUrl(
  slug,
  imageNumber = 1
) {

  const image =
    getDocumentaryImageInfo(
      slug,
      imageNumber
    );


  return (
    `${SITE.siteUrl}/assets/documentaries/` +
    `${encodeURIComponent(slug)}/` +
    `${encodeURIComponent(image.fileName)}`
  );
}


/* =========================================================
   16. REAL IMAGE VALIDATION
   ========================================================= */

function validateImageFile(
  filePath,
  publicPath
) {

  if (
    !fileExists(filePath)
  ) {

    fail(
      `Image missing: ${publicPath}`
    );
  }


  const stats =
    fs.statSync(filePath);


  if (
    stats.size < MIN_IMAGE_SIZE
  ) {

    fail(
      `Invalid/empty image: ${publicPath} ` +
      `(${stats.size} bytes)`
    );
  }


  const extension =
    path
      .extname(filePath)
      .toLowerCase();


  if (
    !SUPPORTED_IMAGE_EXTENSIONS
      .includes(extension)
  ) {

    fail(
      `Unsupported image format: ${publicPath}`
    );
  }


  const fileDescriptor =
    fs.openSync(
      filePath,
      "r"
    );


  const header =
    Buffer.alloc(16);

  const tail =
    Buffer.alloc(2);


  try {

    fs.readSync(
      fileDescriptor,
      header,
      0,
      header.length,
      0
    );


    if (
      extension === ".jpg" ||
      extension === ".jpeg"
    ) {

      fs.readSync(
        fileDescriptor,
        tail,
        0,
        tail.length,
        stats.size - 2
      );
    }

  } finally {

    fs.closeSync(
      fileDescriptor
    );
  }


  /*
    JPEG
  */

  if (
    extension === ".jpg" ||
    extension === ".jpeg"
  ) {

    const validStart =
      header[0] === 0xff &&
      header[1] === 0xd8 &&
      header[2] === 0xff;


    const validEnd =
      tail[0] === 0xff &&
      tail[1] === 0xd9;


    if (
      !validStart ||
      !validEnd
    ) {

      fail(
        `File is not a valid JPEG image: ${publicPath}`
      );
    }


    return;
  }


  /*
    PNG
  */

  if (
    extension === ".png"
  ) {

    const pngSignature =
      Buffer.from([
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a
      ]);


    if (
      !header
        .subarray(0, 8)
        .equals(
          pngSignature
        )
    ) {

      fail(
        `File is not a valid PNG image: ${publicPath}`
      );
    }


    return;
  }


  /*
    WebP
  */

  if (
    extension === ".webp"
  ) {

    const riff =
      header
        .subarray(0, 4)
        .toString("ascii");

    const webp =
      header
        .subarray(8, 12)
        .toString("ascii");

    const chunk =
      header
        .subarray(12, 16)
        .toString("ascii");


    if (
      riff !== "RIFF" ||
      webp !== "WEBP" ||
      !["VP8 ", "VP8L", "VP8X"]
        .includes(chunk)
    ) {

      fail(
        `File is not a valid WebP image: ${publicPath}`
      );
    }


    const declaredRiffSize =
      header.readUInt32LE(4) + 8;


    if (
      declaredRiffSize >
      stats.size
    ) {

      fail(
        `Corrupted WebP image: ${publicPath}`
      );
    }


    return;
  }
}


/* =========================================================
   17. VALIDATE FOUR DOCUMENTARY IMAGES
   ========================================================= */

function validateDocumentaryImages(
  documentary
) {

  const imageDirectory =
    path.join(
      DOCUMENTARY_ASSETS_DIR,
      documentary.slug
    );


  if (
    !directoryExists(
      imageDirectory
    )
  ) {

    fail(
      `${documentary.sourceFile}: documentary image directory missing — ` +
      `assets/documentaries/${documentary.slug}/`
    );
  }


  for (
    let imageNumber = 1;
    imageNumber <= IMAGE_COUNT;
    imageNumber += 1
  ) {

    const image =
      getDocumentaryImageInfo(
        documentary.slug,
        imageNumber
      );


    const publicPath =
      (
        `assets/documentaries/${documentary.slug}/` +
        `${image.fileName}`
      );


    validateImageFile(
      image.filePath,
      publicPath
    );
  }
}


/* =========================================================
   18. CONTENT FILE DISCOVERY
   ========================================================= */

function getContentFiles() {

  if (
    !directoryExists(
      CONTENT_DIR
    )
  ) {

    warn(
      "content/ directory পাওয়া যায়নি. কোনো documentary publish হবে না."
    );

    return [];
  }


  return fs
    .readdirSync(
      CONTENT_DIR,
      {
        withFileTypes: true
      }
    )

    .filter(
      (entry) =>
        entry.isFile() &&
        /\.(md|markdown)$/i.test(
          entry.name
        )
    )

    .map(
      (entry) =>
        path.join(
          CONTENT_DIR,
          entry.name
        )
    )

    .sort(
      (a, b) =>
        a.localeCompare(b)
    );
}


/* =========================================================
   19. READ ONE DOCUMENTARY
   ========================================================= */

function readDocumentary(filePath) {

  const sourceFile =
    path.basename(filePath);


  const filenameSlug =
    path.basename(
      filePath,
      path.extname(filePath)
    );


  const raw =
    fs.readFileSync(
      filePath,
      "utf8"
    );


  const parsed =
    matter(raw);


  const frontmatter =
    parsed.data || {};


  const markdown =
    String(
      parsed.content || ""
    ).trim();


  const plainBody =
    markdownToPlainText(
      markdown
    );


  if (!plainBody) {

    fail(
      `${sourceFile}: documentary body খালি।`
    );
  }


  const titleFromMarkdown =
    extractFirstH1(
      markdown
    );


  const title =
    cleanText(
      frontmatter.title ||
      titleFromMarkdown
    );


  if (!title) {

    fail(
      `${sourceFile}: title পাওয়া যায়নি.`
    );
  }


  const slug =
    normalizeSlug(
      frontmatter.slug ||
      filenameSlug
    );


  validateSlug(
    slug,
    sourceFile
  );


  const status =
    cleanText(
      frontmatter.status ||
      "published"
    )
      .toLowerCase();


  if (
    !["published", "draft"]
      .includes(status)
  ) {

    fail(
      `${sourceFile}: status must be "published" or "draft".`
    );
  }


  const published =
    frontmatter.published === false
      ? false
      : status === "published";


  const rawDate =
    (
      frontmatter.date ||
      frontmatter.publishedAt ||
      frontmatter.publishDate ||
      ""
    );


  const date =
    normalizeDate(
      rawDate
    );


  if (
    published &&
    !date
  ) {

    fail(
      `${sourceFile}: published documentary-এর জন্য ` +
      `সঠিক date প্রয়োজন. Format: YYYY-MM-DD`
    );
  }


  if (
    rawDate &&
    !date
  ) {

    fail(
      `${sourceFile}: invalid date. ` +
      `Use a real calendar date in YYYY-MM-DD format.`
    );
  }


  const rawModifiedDate =
    (
      frontmatter.updated ||
      frontmatter.dateModified ||
      ""
    );


  const modifiedDate =
    rawModifiedDate
      ? normalizeDate(
          rawModifiedDate
        )
      : date;


  if (
    rawModifiedDate &&
    !modifiedDate
  ) {

    fail(
      `${sourceFile}: invalid updated/dateModified value. ` +
      `Use YYYY-MM-DD.`
    );
  }


  const description =
    (
      cleanText(
        frontmatter.description ||
        frontmatter.excerpt ||
        frontmatter.summary
      ) ||
      generateDescription(
        markdown
      )
    );


  if (
    published &&
    !description
  ) {

    fail(
      `${sourceFile}: description পাওয়া যায়নি.`
    );
  }


  const youtubeInput =
    cleanText(
      frontmatter.youtube ||
      frontmatter.youtubeUrl ||
      frontmatter.videoUrl ||
      frontmatter.video ||
      ""
    );


  const youtubeId =
    extractYouTubeId(
      youtubeInput
    );


  if (
    youtubeInput &&
    !youtubeId
  ) {

    fail(
      `${sourceFile}: invalid YouTube URL/ID — ${youtubeInput}`
    );
  }


  const youtubeUrl =
    normalizeYouTubeUrl(
      youtubeInput
    );


  const rawVideoDate =
    (
      frontmatter.videoDate ||
      frontmatter.videoUploadDate ||
      ""
    );


  const videoDate =
    rawVideoDate
      ? normalizeDate(
          rawVideoDate
        )
      : "";


  if (
    rawVideoDate &&
    !videoDate
  ) {

    fail(
      `${sourceFile}: invalid videoDate. Use YYYY-MM-DD.`
    );
  }


  const topics =
    normalizeTopics(
      frontmatter.topics ||
      frontmatter.tags
    );


  const imageCaptions =
    normalizeImageCaptions(
      frontmatter.imageCaptions
    );


  const order =
    Number(
      frontmatter.order || 0
    ) || 0;


  const readingMinutes =
    calculateReadingTime(
      markdown
    );


  const documentary = {

    sourceFile,

    sourcePath:
      filePath,

    title,

    slug,

    date,

    modifiedDate,

    description,

    status,

    published,

    youtubeId,

    youtubeUrl,

    videoDate,

    topics,

    imageCaptions,

    order,

    readingMinutes,

    markdown,

    frontmatter

  };


  /*
    Draft document images are not mandatory.

    Published documentary:
    exactly required 4 valid image files.

    Supported:
    JPG / JPEG / PNG / WebP
  */

  if (published) {

    validateDocumentaryImages(
      documentary
    );
  }


  return documentary;
}


/* =========================================================
   20. DUPLICATE SLUG VALIDATION
   ========================================================= */

function validateDuplicateSlugs(
  documentaries
) {

  const seen =
    new Map();


  documentaries.forEach(
    (documentary) => {

      if (
        seen.has(
          documentary.slug
        )
      ) {

        fail(
          `Duplicate slug "${documentary.slug}" found in ` +
          `${seen.get(documentary.slug)} and ${documentary.sourceFile}`
        );
      }


      seen.set(
        documentary.slug,
        documentary.sourceFile
      );
    }
  );
}


/* =========================================================
   21. SORT — NEWEST FIRST
   ========================================================= */

function sortDocumentaries(
  documentaries
) {

  return [...documentaries]
    .sort(
      (a, b) => {

        const dateA =
          parseDateTimestamp(
            a.date
          );

        const dateB =
          parseDateTimestamp(
            b.date
          );


        if (
          dateA !== dateB
        ) {
          return dateB - dateA;
        }


        if (
          a.order !== b.order
        ) {
          return b.order - a.order;
        }


        return a.title.localeCompare(
          b.title,
          "bn"
        );
      }
    );
}


/* =========================================================
   22. MARKDOWN ENGINE
   ========================================================= */

function createMarkdownEngine() {

  const md =
    new MarkdownIt({

      html:
        true,

      linkify:
        true,

      breaks:
        false,

      typographer:
        false

    });


  const defaultLinkOpen =
    md.renderer.rules.link_open ||
    function (
      tokens,
      index,
      options,
      env,
      self
    ) {

      return self.renderToken(
        tokens,
        index,
        options
      );
    };


  md.renderer.rules.link_open =
    function (
      tokens,
      index,
      options,
      env,
      self
    ) {

      const token =
        tokens[index];


      const hrefIndex =
        token.attrIndex("href");


      if (
        hrefIndex >= 0
      ) {

        const href =
          token.attrs[hrefIndex][1];


        if (
          /^https?:\/\//i.test(
            href
          )
        ) {

          token.attrSet(
            "target",
            "_blank"
          );

          token.attrSet(
            "rel",
            "noopener noreferrer"
          );
        }
      }


      return defaultLinkOpen(
        tokens,
        index,
        options,
        env,
        self
      );
    };


  return md;
}


/* =========================================================
   23. HEADING ID
   ========================================================= */

function headingSlug(value) {

  const clean =
    stripInlineMarkdown(
      value
    )
      .toLowerCase()
      .normalize("NFC")
      .replace(
        /[^\p{L}\p{N}\s-]/gu,
        ""
      )
      .replace(
        /\s+/g,
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


  return clean || "section";
}


function uniqueHeadingId(
  base,
  used
) {

  let candidate =
    base;

  let count =
    2;


  while (
    used.has(candidate)
  ) {

    candidate =
      `${base}-${count}`;

    count += 1;
  }


  used.add(candidate);


  return candidate;
}


/* =========================================================
   24. RENDER MARKDOWN + TOC
   ========================================================= */

function renderMarkdown(
  documentary
) {

  const md =
    createMarkdownEngine();


  const environment =
    {};


  let tokens =
    md.parse(
      documentary.markdown,
      environment
    );


  if (
    tokens.length >= 3 &&
    tokens[0].type === "heading_open" &&
    tokens[0].tag === "h1" &&
    tokens[1].type === "inline" &&
    tokens[2].type === "heading_close"
  ) {

    tokens =
      tokens.slice(3);
  }


  const toc =
    [];

  const usedHeadingIds =
    new Set();


  for (
    let index = 0;
    index < tokens.length;
    index += 1
  ) {

    const token =
      tokens[index];


    if (
      token.type !== "heading_open"
    ) {
      continue;
    }


    if (
      !["h2", "h3"]
        .includes(token.tag)
    ) {
      continue;
    }


    const inlineToken =
      tokens[index + 1];


    if (
      !inlineToken ||
      inlineToken.type !== "inline"
    ) {
      continue;
    }


    const headingText =
      stripInlineMarkdown(
        inlineToken.content
      );


    if (!headingText) {
      continue;
    }


    const headingId =
      uniqueHeadingId(
        headingSlug(
          headingText
        ),
        usedHeadingIds
      );


    token.attrSet(
      "id",
      headingId
    );


    toc.push({

      id:
        headingId,

      text:
        headingText,

      level:
        token.tag === "h3"
          ? 3
          : 2

    });
  }


  return {

    html:
      md.renderer.render(
        tokens,
        md.options,
        environment
      ),

    toc

  };
}


/* =========================================================
   25. ARTICLE IMAGE
   ========================================================= */

function createArticleImageFigure(
  documentary,
  imageNumber
) {

  const customCaption =
    documentary.imageCaptions[
      imageNumber - 1
    ] || "";


  const caption =
    customCaption ||
    `${documentary.title} ডকুমেন্টারির প্রতিনিধিত্বমূলক চিত্র ${toBengaliNumber(imageNumber)}`;


  const imageUrl =
    getArticleImageUrl(
      documentary.slug,
      imageNumber
    );


  return `
<figure
  class="article-image"
  data-documentary-image="${imageNumber}"
>

  <div class="article-image-frame">

    <img
      src="${escapeHTML(imageUrl)}"
      alt="${escapeHTML(documentary.title)} — চিত্র ${toBengaliNumber(imageNumber)}"
      width="1200"
      height="675"
      loading="lazy"
      decoding="async"
    >

  </div>

  <figcaption>
    <strong>
      চিত্র ${toBengaliNumber(imageNumber)}:
    </strong>

    ${escapeHTML(caption)}
  </figcaption>

</figure>
`.trim();
}


/* =========================================================
   26. EXPLICIT IMAGE MARKERS
   ========================================================= */

function replaceExplicitImageMarkers(
  html,
  documentary
) {

  const usedImages =
    new Set();


  const output =
    html.replace(
      /<!--\s*image\s*:\s*([1-4])\s*-->/gi,
      (
        fullMatch,
        numberText
      ) => {

        const imageNumber =
          Number(
            numberText
          );


        if (
          usedImages.has(
            imageNumber
          )
        ) {

          warn(
            `${documentary.sourceFile}: image:${imageNumber} marker duplicated.`
          );

          return "";
        }


        usedImages.add(
          imageNumber
        );


        return createArticleImageFigure(
          documentary,
          imageNumber
        );
      }
    );


  return {

    html:
      output,

    usedImages

  };
}


/* =========================================================
   27. AUTOMATIC IMAGE DISTRIBUTION
   ========================================================= */

function insertMissingImagesAutomatically(
  html,
  documentary,
  usedImages
) {

  const missingImages =
    [];


  for (
    let imageNumber = 1;
    imageNumber <= IMAGE_COUNT;
    imageNumber += 1
  ) {

    if (
      !usedImages.has(
        imageNumber
      )
    ) {

      missingImages.push(
        imageNumber
      );
    }
  }


  if (
    !missingImages.length
  ) {
    return html;
  }


  const paragraphCount =
    (
      html.match(
        /<\/p>/gi
      ) || []
    ).length;


  if (
    paragraphCount < 2
  ) {

    return (
      html +
      "\n" +
      missingImages
        .map(
          (imageNumber) =>
            createArticleImageFigure(
              documentary,
              imageNumber
            )
        )
        .join("\n")
    );
  }


  const targets =
    new Map();


  missingImages.forEach(
    (imageNumber) => {

      const fraction =
        imageNumber /
        (IMAGE_COUNT + 1);


      let paragraph =
        Math.round(
          paragraphCount *
          fraction
        );


      paragraph =
        Math.max(
          1,
          Math.min(
            paragraphCount,
            paragraph
          )
        );


      while (
        targets.has(paragraph) &&
        paragraph < paragraphCount
      ) {

        paragraph += 1;
      }


      while (
        targets.has(paragraph) &&
        paragraph > 1
      ) {

        paragraph -= 1;
      }


      if (
        targets.has(paragraph)
      ) {

        return;
      }


      targets.set(
        paragraph,
        imageNumber
      );
    }
  );


  let paragraphIndex =
    0;


  let output =
    html.replace(
      /<\/p>/gi,
      (closingTag) => {

        paragraphIndex += 1;


        const imageNumber =
          targets.get(
            paragraphIndex
          );


        if (!imageNumber) {
          return closingTag;
        }


        return (
          closingTag +
          "\n" +
          createArticleImageFigure(
            documentary,
            imageNumber
          )
        );
      }
    );


  missingImages.forEach(
    (imageNumber) => {

      const marker =
        `data-documentary-image="${imageNumber}"`;


      if (
        !output.includes(marker)
      ) {

        output +=
          "\n" +
          createArticleImageFigure(
            documentary,
            imageNumber
          );
      }
    }
  );


  return output;
}


/* =========================================================
   28. BUILD ARTICLE CONTENT
   ========================================================= */

function buildArticleContent(
  documentary
) {

  const rendered =
    renderMarkdown(
      documentary
    );


  const explicitImages =
    replaceExplicitImageMarkers(
      rendered.html,
      documentary
    );


  const finalHtml =
    insertMissingImagesAutomatically(
      explicitImages.html,
      documentary,
      explicitImages.usedImages
    );


  return {

    html:
      finalHtml,

    toc:
      rendered.toc

  };
}


/* =========================================================
   29. TOC HTML
   ========================================================= */

function buildTocHtml(toc) {

  if (
    !toc.length
  ) {

    return `
<li class="toc-empty">
  <span>
    এই ডকুমেন্টারিতে আলাদা অধ্যায় শিরোনাম নেই
  </span>
</li>
`.trim();
  }


  return toc
    .map(
      (item) => {

        const levelClass =
          item.level === 3
            ? " toc-level-3"
            : "";


        return `
<li class="toc-item${levelClass}">

  <a href="#${escapeHTML(item.id)}">
    ${escapeHTML(item.text)}
  </a>

</li>
`.trim();
      }
    )
    .join("\n");
}


/* =========================================================
   30. HERO MEDIA
   ========================================================= */

function buildHeroMediaHtml(
  documentary
) {

  const localImage =
    getArticleImageUrl(
      documentary.slug,
      1
    );


  if (
    documentary.youtubeId &&
    documentary.youtubeUrl
  ) {

    const maxres =
      youtubeMaxres(
        documentary.youtubeId
      );


    const hq =
      youtubeHQ(
        documentary.youtubeId
      );


    return `
<figure class="documentary-cover">

  <div class="video-preview">

    <img
      class="documentary-main-thumbnail"
      src="${escapeHTML(maxres)}"
      alt="${escapeHTML(documentary.title)} ডকুমেন্টারির YouTube thumbnail"
      width="1280"
      height="720"
      loading="eager"
      decoding="async"
      data-youtube-fallback="${escapeHTML(hq)}"
      data-local-fallback="${escapeHTML(localImage)}"
    >

    <a
      class="video-preview-link"
      href="${escapeHTML(documentary.youtubeUrl)}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="YouTube-এ ${escapeHTML(documentary.title)} দেখুন"
    >

      <span
        class="video-play-button"
        aria-hidden="true"
      >

        <svg viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"></path>
        </svg>

      </span>

    </a>

  </div>

  <figcaption>
    SalimGPT-এর প্রকাশিত documentary video।
    Thumbnail-এ ক্লিক করলে YouTube-এ ভিডিওটি খুলবে।
  </figcaption>

</figure>
`.trim();
  }


  return `
<figure class="documentary-cover">

  <div class="documentary-cover-frame">

    <img
      src="${escapeHTML(localImage)}"
      alt="${escapeHTML(documentary.title)} ডকুমেন্টারির প্রধান চিত্র"
      width="1200"
      height="675"
      loading="eager"
      decoding="async"
    >

  </div>

</figure>
`.trim();
}


/* =========================================================
   31. YOUTUBE BUTTON
   ========================================================= */

function buildYouTubeActionHtml(
  documentary
) {

  if (
    !documentary.youtubeUrl
  ) {
    return "";
  }


  return `
<a
  class="article-action youtube-button"
  href="${escapeHTML(documentary.youtubeUrl)}"
  target="_blank"
  rel="noopener noreferrer"
>

  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="4"
    ></rect>

    <path d="m10 9 5 3-5 3Z"></path>
  </svg>

  <span>
    YouTube-এ দেখুন
  </span>

</a>
`.trim();
}


/* =========================================================
   32. RELATED DOCUMENTARY
   ========================================================= */

function getRelatedDocumentaries(
  current,
  allDocumentaries,
  limit = 3
) {

  const currentTopics =
    new Set(
      current.topics.map(
        (topic) =>
          topic.toLowerCase()
      )
    );


  return allDocumentaries

    .filter(
      (item) =>
        item.slug !==
        current.slug
    )

    .map(
      (item) => {

        let score =
          0;


        item.topics.forEach(
          (topic) => {

            if (
              currentTopics.has(
                topic.toLowerCase()
              )
            ) {

              score += 10;
            }
          }
        );


        return {

          documentary:
            item,

          score

        };
      }
    )

    .sort(
      (a, b) => {

        if (
          a.score !== b.score
        ) {

          return (
            b.score -
            a.score
          );
        }


        return (
          parseDateTimestamp(
            b.documentary.date
          ) -
          parseDateTimestamp(
            a.documentary.date
          )
        );
      }
    )

    .slice(
      0,
      limit
    )

    .map(
      (entry) =>
        entry.documentary
    );
}


/* =========================================================
   33. RELATED HTML
   ========================================================= */

function buildRelatedHtml(
  documentary,
  allDocumentaries
) {

  const related =
    getRelatedDocumentaries(
      documentary,
      allDocumentaries,
      3
    );


  if (
    !related.length
  ) {

    return `
<div class="documentary-data-empty">
  <strong>
    আরও ডকুমেন্টারি প্রকাশ হলে এখানে দেখা যাবে
  </strong>
</div>
`.trim();
  }


  return related
    .map(
      (item) => {

        const localFallback =
          getArticleImageUrl(
            item.slug,
            1
          );


        const thumbnail =
          item.youtubeId
            ? youtubeMaxres(
                item.youtubeId
              )
            : localFallback;


        const youtubeFallback =
          item.youtubeId
            ? youtubeHQ(
                item.youtubeId
              )
            : "";


        return `
<a
  class="related-card"
  href="../${encodeURIComponent(item.slug)}/"
>

  <img
    src="${escapeHTML(thumbnail)}"
    alt="${escapeHTML(item.title)} ডকুমেন্টারির thumbnail"
    width="640"
    height="360"
    loading="lazy"
    decoding="async"
    ${
      youtubeFallback
        ? `data-youtube-fallback="${escapeHTML(youtubeFallback)}"`
        : ""
    }
    data-local-fallback="${escapeHTML(localFallback)}"
  >

  <div class="related-card-content">

    <span>
      DOCUMENTARY
    </span>

    <h3>
      ${escapeHTML(item.title)}
    </h3>

    <p>
      ${escapeHTML(item.description)}
    </p>

  </div>

</a>
`.trim();
      }
    )
    .join("\n");
}


/* =========================================================
   34. SAFE JSON-LD
   ========================================================= */

function safeJsonLd(value) {

  return JSON.stringify(
    value,
    null,
    2
  )
    .replace(
      /</g,
      "\\u003c"
    );
}


/* =========================================================
   35. STRUCTURED DATA
   ========================================================= */

function buildStructuredData(
  documentary
) {

  const pageUrl =
    (
      `${SITE.siteUrl}/documentaries/` +
      `${encodeURIComponent(documentary.slug)}/`
    );


  const localImages =
    Array.from(
      {
        length:
          IMAGE_COUNT
      },
      (_, index) =>
        getAbsoluteImageUrl(
          documentary.slug,
          index + 1
        )
    );


  const mainImage =
    documentary.youtubeId
      ? youtubeMaxres(
          documentary.youtubeId
        )
      : localImages[0];


  const articleImages =
    [
      mainImage,
      ...localImages
    ]
      .filter(
        (
          value,
          index,
          values
        ) =>
          values.indexOf(value) ===
          index
      );


  const graph =
    [];


  graph.push({

    "@type":
      "Article",

    "@id":
      `${pageUrl}#article`,

    headline:
      documentary.title,

    description:
      documentary.description,

    inLanguage:
      DEFAULT_LANGUAGE,

    datePublished:
      documentary.date,

    dateModified:
      documentary.modifiedDate ||
      documentary.date,

    mainEntityOfPage: {

      "@type":
        "WebPage",

      "@id":
        pageUrl

    },

    author: {

      "@type":
        "Person",

      name:
        "Mohammad Salim"

    },

    publisher: {

      "@type":
        "Organization",

      name:
        "SalimGPT",

      logo: {

        "@type":
          "ImageObject",

        url:
          `${SITE.siteUrl}/assets/brand/logo.svg`

      }

    },

    image:
      articleImages,

    about:
      documentary.topics.length
        ? documentary.topics
        : [documentary.title]

  });


  if (
    documentary.youtubeId &&
    documentary.youtubeUrl
  ) {

    const videoObject = {

      "@type":
        "VideoObject",

      "@id":
        `${pageUrl}#video`,

      name:
        documentary.title,

      description:
        documentary.description,

      thumbnailUrl: [
        youtubeMaxres(
          documentary.youtubeId
        )
      ],

      url:
        documentary.youtubeUrl,

      embedUrl:
        youtubeEmbed(
          documentary.youtubeId
        ),

      inLanguage:
        DEFAULT_LANGUAGE

    };


    if (
      documentary.videoDate
    ) {

      videoObject.uploadDate =
        documentary.videoDate;
    }


    graph.push(
      videoObject
    );
  }


  graph.push({

    "@type":
      "BreadcrumbList",

    itemListElement: [

      {

        "@type":
          "ListItem",

        position:
          1,

        name:
          "হোম",

        item:
          `${SITE.siteUrl}/`

      },

      {

        "@type":
          "ListItem",

        position:
          2,

        name:
          "ডকুমেন্টারি",

        item:
          `${SITE.siteUrl}/#documentaries`

      },

      {

        "@type":
          "ListItem",

        position:
          3,

        name:
          documentary.title,

        item:
          pageUrl

      }

    ]

  });


  return safeJsonLd({

    "@context":
      "https://schema.org",

    "@graph":
      graph

  });
}


/* =========================================================
   36. LOAD TEMPLATE
   ========================================================= */

function loadDocumentaryTemplate() {

  if (
    !fileExists(
      TEMPLATE_FILE
    )
  ) {

    fail(
      "templates/documentary.html পাওয়া যায়নি."
    );
  }


  const template =
    fs.readFileSync(
      TEMPLATE_FILE,
      "utf8"
    );


  if (
    !template.trim()
  ) {

    fail(
      "templates/documentary.html খালি."
    );
  }


  return template;
}


/* =========================================================
   37. APPLY TEMPLATE
   ========================================================= */

function applyTemplate(
  template,
  replacements
) {

  let output =
    template;


  Object.entries(
    replacements
  ).forEach(
    ([key, value]) => {

      output =
        output
          .split(
            `{{${key}}}`
          )
          .join(
            value === undefined ||
            value === null
              ? ""
              : String(value)
          );
    }
  );


  const unresolved =
    output.match(
      /\{\{[A-Z0-9_]+\}\}/g
    );


  if (
    unresolved &&
    unresolved.length
  ) {

    fail(
      "Unresolved template token(s): " +
      [...new Set(unresolved)]
        .join(", ")
    );
  }


  return output;
}


/* =========================================================
   38. BUILD ONE DOCUMENTARY PAGE
   ========================================================= */

function buildDocumentaryPage(
  documentary,
  allDocumentaries,
  template
) {

  const article =
    buildArticleContent(
      documentary
    );


  const tocHtml =
    buildTocHtml(
      article.toc
    );


  const pageUrl =
    (
      `${SITE.siteUrl}/documentaries/` +
      `${encodeURIComponent(documentary.slug)}/`
    );


  const ogImageUrl =
    documentary.youtubeId
      ? youtubeMaxres(
          documentary.youtubeId
        )
      : getAbsoluteImageUrl(
          documentary.slug,
          1
        );


  const replacements = {

    TITLE:
      escapeHTML(
        documentary.title
      ),

    DESCRIPTION:
      escapeHTML(
        documentary.description
      ),

    SLUG:
      escapeHTML(
        documentary.slug
      ),

    DATE_ISO:
      escapeHTML(
        documentary.date
      ),

    DATE_BN:
      escapeHTML(
        formatBengaliDate(
          documentary.date
        )
      ),

    READING_TIME:
      toBengaliNumber(
        documentary.readingMinutes
      ),

    ARTICLE_HTML:
      article.html,

    TOC_HTML:
      tocHtml,

    MOBILE_TOC_HTML:
      tocHtml,

    HERO_MEDIA_HTML:
      buildHeroMediaHtml(
        documentary
      ),

    YOUTUBE_ACTION_HTML:
      buildYouTubeActionHtml(
        documentary
      ),

    RELATED_HTML:
      buildRelatedHtml(
        documentary,
        allDocumentaries
      ),

    PAGE_URL:
      escapeHTML(
        pageUrl
      ),

    OG_IMAGE_URL:
      escapeHTML(
        ogImageUrl
      ),

    SITE_URL:
      escapeHTML(
        SITE.siteUrl
      ),

    STRUCTURED_DATA:
      buildStructuredData(
        documentary
      ),

    SOURCE_FILE:
      escapeHTML(
        documentary.sourceFile
      )

  };


  const generatedHtml =
    applyTemplate(
      template,
      replacements
    );


  const outputDirectory =
    path.join(
      OUTPUT_DOCUMENTARIES_DIR,
      documentary.slug
    );


  ensureDir(
    outputDirectory
  );


  fs.writeFileSync(
    path.join(
      outputDirectory,
      "index.html"
    ),
    generatedHtml,
    "utf8"
  );


  log(
    `Generated: /documentaries/${documentary.slug}/`
  );
}


/* =========================================================
   39. HOMEPAGE DATA
   ========================================================= */

function createHomepageData(
  documentary,
  index
) {

  const thumbnail =
    documentary.youtubeId
      ? youtubeMaxres(
          documentary.youtubeId
        )
      : getHomepageImageUrl(
          documentary.slug,
          1
        );


  return {

    title:
      documentary.title,

    slug:
      documentary.slug,

    date:
      documentary.date,

    description:
      documentary.description,

    topics:
      documentary.topics,

    youtubeId:
      documentary.youtubeId,

    youtubeUrl:
      documentary.youtubeUrl,

    thumbnail,

    articleUrl:
      `documentaries/${documentary.slug}/`,

    published:
      true,

    status:
      "published",

    order:
      documentary.order ||
      (
        100000 -
        index
      )

  };
}


/* =========================================================
   40. GENERATE documentaries.js
   ========================================================= */

function generateDocumentaryData(
  documentaries
) {

  ensureDir(
    OUTPUT_DATA_DIR
  );


  const data =
    documentaries.map(
      createHomepageData
    );


  const contents =
`/* =========================================================
   SalimGPT
   AUTO-GENERATED FILE
   DO NOT EDIT MANUALLY

   Source:
   content/*.md

   Generated:
   scripts/build.js
   ========================================================= */

window.SALIMGPT_DOCUMENTARIES = ${JSON.stringify(
  data,
  null,
  2
)};
`;


  fs.writeFileSync(
    path.join(
      OUTPUT_DATA_DIR,
      "documentaries.js"
    ),
    contents,
    "utf8"
  );


  log(
    `Generated data/documentaries.js (${data.length})`
  );
}


/* =========================================================
   41. GENERATE documentaries.json
   ========================================================= */

function generateDocumentaryJson(
  documentaries
) {

  ensureDir(
    OUTPUT_DATA_DIR
  );


  const data =
    documentaries.map(
      createHomepageData
    );


  fs.writeFileSync(
    path.join(
      OUTPUT_DATA_DIR,
      "documentaries.json"
    ),
    JSON.stringify(
      data,
      null,
      2
    ),
    "utf8"
  );
}


/* =========================================================
   42. STATIC COPY EXCLUSIONS
   ========================================================= */

const ROOT_EXCLUDED_NAMES =
  new Set([
    ".git",
    ".github",
    "_site",
    "node_modules",
    "content",
    "templates",
    "scripts",
    "documentaries",
    "package.json",
    "package-lock.json",
    ".gitignore",
    "sitemap.xml",
    "robots.txt"
  ]);


function shouldSkipRelativePath(
  relativePath
) {

  const normalized =
    normalizeSlashes(
      relativePath
    );


  return (
    normalized ===
      "data/documentaries.js" ||
    normalized ===
      "data/documentaries.json"
  );
}


/* =========================================================
   43. RECURSIVE STATIC COPY
   ========================================================= */

function copyDirectoryContents(
  sourceDirectory,
  destinationDirectory,
  relativeBase = ""
) {

  ensureDir(
    destinationDirectory
  );


  const entries =
    fs.readdirSync(
      sourceDirectory,
      {
        withFileTypes: true
      }
    );


  entries.forEach(
    (entry) => {

      const relativePath =
        relativeBase
          ? `${relativeBase}/${entry.name}`
          : entry.name;


      if (
        shouldSkipRelativePath(
          relativePath
        )
      ) {
        return;
      }


      const sourcePath =
        path.join(
          sourceDirectory,
          entry.name
        );


      const destinationPath =
        path.join(
          destinationDirectory,
          entry.name
        );


      if (
        entry.isDirectory()
      ) {

        copyDirectoryContents(
          sourcePath,
          destinationPath,
          relativePath
        );

        return;
      }


      if (
        entry.isFile()
      ) {

        ensureDir(
          path.dirname(
            destinationPath
          )
        );


        fs.copyFileSync(
          sourcePath,
          destinationPath
        );
      }
    }
  );
}


/* =========================================================
   44. COPY STATIC SITE
   ========================================================= */

function copyStaticSite() {

  const entries =
    fs.readdirSync(
      ROOT,
      {
        withFileTypes: true
      }
    );


  entries.forEach(
    (entry) => {

      if (
        ROOT_EXCLUDED_NAMES.has(
          entry.name
        )
      ) {
        return;
      }


      const sourcePath =
        path.join(
          ROOT,
          entry.name
        );


      const destinationPath =
        path.join(
          OUTPUT_DIR,
          entry.name
        );


      if (
        entry.isDirectory()
      ) {

        copyDirectoryContents(
          sourcePath,
          destinationPath,
          entry.name
        );

        return;
      }


      if (
        entry.isFile()
      ) {

        fs.copyFileSync(
          sourcePath,
          destinationPath
        );
      }
    }
  );


  log(
    "Static site files copied."
  );
}


/* =========================================================
   45. COLLECT HTML FILES
   ========================================================= */

function collectHtmlFiles(
  directory,
  output = []
) {

  if (
    !directoryExists(
      directory
    )
  ) {
    return output;
  }


  const entries =
    fs.readdirSync(
      directory,
      {
        withFileTypes: true
      }
    );


  entries.forEach(
    (entry) => {

      const fullPath =
        path.join(
          directory,
          entry.name
        );


      if (
        entry.isDirectory()
      ) {

        collectHtmlFiles(
          fullPath,
          output
        );

        return;
      }


      if (
        entry.isFile() &&
        entry.name
          .toLowerCase()
          .endsWith(".html")
      ) {

        output.push(
          fullPath
        );
      }
    }
  );


  return output;
}


/* =========================================================
   46. HTML FILE -> ROUTE
   ========================================================= */

function htmlFileToRoute(
  htmlFile
) {

  const relative =
    normalizeSlashes(
      path.relative(
        OUTPUT_DIR,
        htmlFile
      )
    );


  if (
    relative === "404.html"
  ) {
    return "";
  }


  if (
    relative === "index.html"
  ) {
    return "/";
  }


  if (
    relative.endsWith(
      "/index.html"
    )
  ) {

    return (
      "/" +
      relative.slice(
        0,
        -"/index.html".length
      ) +
      "/"
    );
  }


  return `/${relative}`;
}


/* =========================================================
   47. ROUTE -> ABSOLUTE URL
   ========================================================= */

function routeToAbsoluteUrl(
  route
) {

  if (
    route === "/"
  ) {

    return (
      `${SITE.siteUrl}/`
    );
  }


  return (
    `${SITE.siteUrl}${route}`
  );
}


/* =========================================================
   48. DOCUMENTARY LASTMOD MAP
   ========================================================= */

function documentaryDateMap(
  documentaries
) {

  const map =
    new Map();


  documentaries.forEach(
    (documentary) => {

      map.set(
        `/documentaries/${documentary.slug}/`,
        documentary.modifiedDate ||
        documentary.date
      );
    }
  );


  return map;
}


/* =========================================================
   49. GENERATE SITEMAP
   ========================================================= */

function generateSitemap(
  documentaries
) {

  const routes =
    [
      ...new Set(
        collectHtmlFiles(
          OUTPUT_DIR
        )
          .map(
            htmlFileToRoute
          )
          .filter(Boolean)
      )
    ];


  routes.sort(
    (a, b) => {

      if (
        a === "/"
      ) {
        return -1;
      }


      if (
        b === "/"
      ) {
        return 1;
      }


      return a.localeCompare(
        b
      );
    }
  );


  const dateMap =
    documentaryDateMap(
      documentaries
    );


  const entries =
    routes
      .map(
        (route) => {

          const absoluteUrl =
            routeToAbsoluteUrl(
              route
            );


          const lastModified =
            dateMap.get(
              route
            );


          if (
            lastModified
          ) {

            return (
`  <url>
    <loc>${escapeXML(absoluteUrl)}</loc>
    <lastmod>${escapeXML(lastModified)}</lastmod>
  </url>`
            );
          }


          return (
`  <url>
    <loc>${escapeXML(absoluteUrl)}</loc>
  </url>`
          );
        }
      )
      .join("\n");


  const sitemap =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;


  fs.writeFileSync(
    path.join(
      OUTPUT_DIR,
      "sitemap.xml"
    ),
    sitemap,
    "utf8"
  );


  log(
    `Generated sitemap.xml (${routes.length} URLs)`
  );
}


/* =========================================================
   50. GENERATE ROBOTS.TXT
   ========================================================= */

function generateRobotsTxt() {

  const robots =
`User-agent: *
Allow: /

Sitemap: ${SITE.siteUrl}/sitemap.xml
`;


  fs.writeFileSync(
    path.join(
      OUTPUT_DIR,
      "robots.txt"
    ),
    robots,
    "utf8"
  );


  log(
    "Generated robots.txt"
  );
}


/* =========================================================
   51. GENERATE .NOJEKYLL
   ========================================================= */

function generateNoJekyll() {

  fs.writeFileSync(
    path.join(
      OUTPUT_DIR,
      ".nojekyll"
    ),
    "",
    "utf8"
  );
}


/* =========================================================
   52. CLEAN OUTPUT
   ========================================================= */

function cleanOutput() {

  if (
    directoryExists(
      OUTPUT_DIR
    )
  ) {

    fs.rmSync(
      OUTPUT_DIR,
      {
        recursive: true,
        force: true
      }
    );
  }


  ensureDir(
    OUTPUT_DIR
  );


  ensureDir(
    OUTPUT_DOCUMENTARIES_DIR
  );


  log(
    "Cleaned _site/"
  );
}


/* =========================================================
   53. LOAD DOCUMENTARIES
   ========================================================= */

function loadAllDocumentaries() {

  const files =
    getContentFiles();


  const documentaries =
    files.map(
      readDocumentary
    );


  validateDuplicateSlugs(
    documentaries
  );


  const published =
    documentaries.filter(
      (documentary) =>
        documentary.published
    );


  return sortDocumentaries(
    published
  );
}


/* =========================================================
   54. BUILD DOCUMENTARY PAGES
   ========================================================= */

function buildAllDocumentaries(
  documentaries
) {

  if (
    !documentaries.length
  ) {

    log(
      "No published documentaries found."
    );

    return;
  }


  const template =
    loadDocumentaryTemplate();


  documentaries.forEach(
    (documentary) => {

      buildDocumentaryPage(
        documentary,
        documentaries,
        template
      );
    }
  );
}


/* =========================================================
   55. BUILD SUMMARY
   ========================================================= */

function printBuildSummary(
  documentaries
) {

  console.log("");
  console.log(
    "==============================================="
  );

  console.log(
    " SalimGPT Build Complete"
  );

  console.log(
    "==============================================="
  );

  console.log(
    ` Site URL      : ${SITE.siteUrl}`
  );

  console.log(
    ` Documentaries : ${documentaries.length}`
  );

  console.log(
    ` Output        : ${OUTPUT_DIR}`
  );

  console.log(
    "==============================================="
  );


  documentaries.forEach(
    (
      documentary,
      index
    ) => {

      console.log(
        `${index + 1}. ${documentary.title}`
      );

      console.log(
        `   /documentaries/${documentary.slug}/`
      );
    }
  );


  console.log("");
}


/* =========================================================
   56. MAIN BUILD
   ========================================================= */

function build() {

  log(
    "Starting SalimGPT automatic build..."
  );


  /*
    IMPORTANT:
    Validate source FIRST.

    Invalid documentary/image হলে old deployed site
    replace করার আগেই build fail করবে.
  */

  const documentaries =
    loadAllDocumentaries();


  cleanOutput();


  copyStaticSite();


  buildAllDocumentaries(
    documentaries
  );


  generateDocumentaryData(
    documentaries
  );


  generateDocumentaryJson(
    documentaries
  );


  generateSitemap(
    documentaries
  );


  generateRobotsTxt();


  generateNoJekyll();


  printBuildSummary(
    documentaries
  );
}


/* =========================================================
   57. RUN
   ========================================================= */

try {

  build();

} catch (error) {

  console.error("");


  console.error(
    error &&
    error.stack
      ? error.stack
      : error
  );


  console.error("");


  process.exitCode =
    1;
}
