# SalimGPT

**Research-Based Bangla Documentary Media**

SalimGPT একটি research-based Bangla documentary media platform, যেখানে ইতিহাস, বিজ্ঞান, রহস্য, প্রযুক্তি, সমাজ, জনস্বাস্থ্য, lifestyle, education এবং গুরুত্বপূর্ণ বৈশ্বিক বিষয় নিয়ে documentary ও research-based content প্রকাশ করা হয়।

SalimGPT-এর documentary script, editorial direction এবং project management পরিচালনা করেন **Mohammad Salim**।

---

# 1. Project Overview

SalimGPT website একটি lightweight static website যা GitHub Pages-এ deploy করার জন্য তৈরি।

এই project-এর সবচেয়ে গুরুত্বপূর্ণ feature হলো **Automatic Documentary Publishing System**।

নতুন documentary publish করার জন্য manually নতুন HTML page তৈরি করতে হয় না।

শুধু:

1. একটি Markdown file তৈরি করতে হবে।
2. Documentary-এর ৪টি image upload করতে হবে।
3. GitHub-এর `main` branch-এ push করতে হবে।

এরপর GitHub Actions automatically:

- documentary detect করবে
- metadata validate করবে
- images validate করবে
- article HTML তৈরি করবে
- homepage update করবে
- sitemap তৈরি করবে
- robots.txt তৈরি করবে
- `_site/` generate করবে
- GitHub Pages-এ deploy করবে

---

# 2. Main Features

SalimGPT website-এর প্রধান features:

- Research-based Bangla documentary platform
- Static website architecture
- GitHub Pages hosting
- GitHub Actions deployment
- Markdown-based documentary publishing
- Automatic documentary discovery
- Automatic documentary page generation
- Automatic homepage documentary listing
- Newest documentary first
- YouTube integration
- Real YouTube thumbnail support
- YouTube thumbnail fallback system
- Local documentary image fallback
- JPG image support
- JPEG image support
- PNG image support
- WebP image support
- Automatic article image distribution
- Manual image placement support
- Automatic reading-time calculation
- Automatic Table of Contents generation
- Related documentary generation
- Automatic sitemap.xml generation
- Automatic robots.txt generation
- JSON-LD structured data
- Article structured data
- VideoObject structured data
- Breadcrumb structured data
- Responsive mobile design
- Responsive desktop design
- Search support
- Side navigation menu
- SEO-friendly documentary URLs
- No fake YouTube URL generation
- No fake thumbnail generation

---

# 3. Project Structure

বর্তমান project structure:

```text
SalimGPT/
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── assets/
│   ├── brand/
│   ├── documentaries/
│   │   └── fentanyl/
│   │       ├── fentanyl-1.jpg
│   │       ├── fentanyl-2.jpg
│   │       ├── fentanyl-3.jpg
│   │       └── fentanyl-4.jpg
│   │
│   ├── social/
│   └── ...
│
├── content/
│   └── fentanyl.md
│
├── css/
│   └── ...
│
├── data/
│   ├── site.js
│   ├── social.js
│   └── ...
│
├── js/
│   ├── documentary-list.js
│   ├── documentary.js
│   ├── home.js
│   ├── menu.js
│   ├── search.js
│   └── ...
│
├── scripts/
│   └── build.js
│
├── templates/
│   └── documentary.html
│
├── index.html
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

# 4. Important Project Files

## 4.1 `scripts/build.js`

এটি SalimGPT-এর মূল **Automatic Documentary Publishing Engine**।

এর কাজ:

- `content/` folder scan করা
- Markdown documentary detect করা
- Front Matter পড়া
- documentary metadata validate করা
- publication date validate করা
- slug validate করা
- image folder validate করা
- documentary-এর ৪টি image validate করা
- JPG/JPEG/PNG/WebP support করা
- YouTube ID extract করা
- YouTube canonical URL তৈরি করা
- Markdown HTML-এ convert করা
- heading থেকে TOC তৈরি করা
- reading time calculate করা
- article-এর মধ্যে images বসানো
- related documentary নির্ধারণ করা
- documentary page generate করা
- homepage documentary data generate করা
- newest-first sorting করা
- sitemap.xml generate করা
- robots.txt generate করা
- `.nojekyll` generate করা
- final `_site/` deployment folder তৈরি করা

---

## 4.2 `templates/documentary.html`

সব automatically generated documentary page-এর HTML template।

নতুন documentary publish করার সময় আলাদা HTML file manually তৈরি করতে হয় না।

Build system এই template ব্যবহার করে final page তৈরি করে।

উদাহরণ:

```text
content/fentanyl.md
        ↓
templates/documentary.html
        ↓
scripts/build.js
        ↓
_site/documentaries/fentanyl/index.html
```

---

## 4.3 `content/`

সব documentary-এর source Markdown file এখানে থাকবে।

বর্তমান example:

```text
content/fentanyl.md
```

Future example:

```text
content/artificial-intelligence.md
content/bermuda-triangle.md
content/black-hole.md
```

---

## 4.4 `assets/documentaries/`

প্রতিটি documentary-এর images এখানে থাকবে।

Folder name documentary slug-এর সঙ্গে match করতে হবে।

Example:

```text
assets/documentaries/fentanyl/
```

এর ভিতরে:

```text
fentanyl-1.jpg
fentanyl-2.jpg
fentanyl-3.jpg
fentanyl-4.jpg
```

---

## 4.5 `js/documentary-list.js`

Homepage-এর automatic documentary listing system।

এর কাজ:

- generated documentary data পড়া
- published documentary filter করা
- newest-first sort করা
- homepage documentary cards তৈরি করা
- documentary count দেখানো
- article link তৈরি করা
- YouTube button তৈরি করা
- thumbnail fallback পরিচালনা করা

Thumbnail fallback:

```text
YouTube maxresdefault.jpg
        ↓
YouTube hqdefault.jpg
        ↓
Local .jpg
        ↓
Local .jpeg
        ↓
Local .png
        ↓
Local .webp
```

---

## 4.6 `.github/workflows/deploy.yml`

GitHub Actions deployment workflow।

Main branch-এ push হলে:

```text
Push to main
      ↓
npm ci
      ↓
npm run build
      ↓
_site/ generated
      ↓
GitHub Pages artifact upload
      ↓
GitHub Pages deployment
```

---

# 5. Automatic Documentary Workflow

সম্পূর্ণ workflow:

```text
New Markdown File
        +
4 Documentary Images
        ↓
Push to GitHub
        ↓
GitHub Actions Starts
        ↓
npm ci
        ↓
npm run build
        ↓
scripts/build.js
        ↓
Documentary Discovery
        ↓
Metadata Validation
        ↓
Date Validation
        ↓
Slug Validation
        ↓
Image Validation
        ↓
YouTube ID Extraction
        ↓
Markdown Rendering
        ↓
TOC Generation
    ↓
Reading Time Calculation
        ↓
Image Distribution
        ↓
Related Documentary Generation
        ↓
Documentary Page Generation
        ↓
Homepage Data Generation
        ↓
Newest-First Sorting
        ↓
Sitemap Generation
        ↓
Robots.txt Generation
        ↓
_site/
        ↓
GitHub Pages
```

---

# 6. How to Publish a New Documentary

ধরা যাক নতুন documentary-এর slug:

```text
new-documentary
```

প্রথমে তৈরি করুন:

```text
content/new-documentary.md
```

এরপর তৈরি করুন:

```text
assets/documentaries/new-documentary/
```

তার ভিতরে ৪টি image রাখুন:

```text
new-documentary-1.jpg
new-documentary-2.jpg
new-documentary-3.jpg
new-documentary-4.jpg
```

তারপর GitHub-এর `main` branch-এ push করুন।

Build system বাকিটা automatically করবে।

---

# 7. Supported Documentary Image Formats

Documentary images-এর জন্য supported formats:

```text
.jpg
.jpeg
.png
.webp
```

Recommended:

```text
.jpg
```

একই image number-এর একাধিক format একসঙ্গে না রাখাই ভালো।

ভালো:

```text
documentary-1.jpg
```

Avoid:

```text
documentary-1.jpg
documentary-1.png
documentary-1.webp
```

---

# 8. Image Naming Rule

Image naming অবশ্যই slug অনুযায়ী হবে।

যদি slug হয়:

```text
fentanyl
```

তাহলে:

```text
fentanyl-1.jpg
fentanyl-2.jpg
fentanyl-3.jpg
fentanyl-4.jpg
```

যদি slug হয়:

```text
artificial-intelligence
```

তাহলে:

```text
artificial-intelligence-1.jpg
artificial-intelligence-2.jpg
artificial-intelligence-3.jpg
artificial-intelligence-4.jpg
```

---

# 9. Documentary Markdown Format

প্রতিটি documentary Markdown file-এর শুরুতে YAML Front Matter থাকবে।

Example:

```yaml
---
title: "Documentary Title"
slug: "documentary-title"
date: "2026-09-05"
youtube: "https://youtu.be/VIDEO_ID"
description: "Documentary-এর সংক্ষিপ্ত description."
topics:
  - Topic One
  - Topic Two
  - Topic Three
status: "published"
---
```

এর নিচে documentary-এর পুরো লেখা থাকবে।

Example:

```md
এখানে documentary-এর introduction থাকবে।

এরপর documentary-এর মূল research-based content থাকবে।
```


---

# 10. Current Fentanyl Documentary

Current source file:

```text
content/fentanyl.md
```

Current images:

```text
assets/documentaries/fentanyl/
├── fentanyl-1.jpg
├── fentanyl-2.jpg
├── fentanyl-3.jpg
└── fentanyl-4.jpg
```

Current slug:

```text
fentanyl
```

Generated page:

```text
/documentaries/fentanyl/
```

Expected generated file:

```text
_site/documentaries/fentanyl/index.html
```

---

# 11. Fentanyl Front Matter Example

```yaml
---
title: "Fentanyl — মানব ইতিহাসের সবচেয়ে রহস্যময় ব্যথানাশক"
slug: "fentanyl"
date: "2026-09-02"
youtube: "https://youtu.be/ls0oDPKPkIY?si=xhok5xEzy5vdI28z"
description: "Fentanyl-এর ইতিহাস, চিকিৎসায় ব্যবহার, opioid crisis, আন্তর্জাতিক পাচার নেটওয়ার্ক এবং Mexico-কেন্দ্রিক illicit production system নিয়ে SalimGPT-এর পূর্ণ ডকুমেন্টারি।"
topics:
  - Fentanyl
  - Opioid
  - Synthetic Opioid
  - Drug Trafficking
  - Public Health
status: "published"
---
```

---

# 12. Required Front Matter Fields

Published documentary-এর জন্য গুরুত্বপূর্ণ fields:

```text
title
slug
date
description
status
```

Optional কিন্তু recommended:

```text
youtube
topics
imageCaptions
updated
videoDate
```

---

# 13. Documentary Status

Published documentary:

```yaml
status: "published"
```

Draft documentary:

```yaml
status: "draft"
```

Draft documentary public homepage listing-এ দেখানো হবে না।

---

# 14. Date Format

Date অবশ্যই:

```text
YYYY-MM-DD
```

Valid:

```yaml
date: "2026-09-05"
```

Invalid:

```text
05-09-2026
09/05/2026
September 5 2026
```

---

# 15. Slug Rules

Slug ব্যবহার করতে পারবেন:

- lowercase English letters
- numbers
- hyphen

Valid:

```text
fentanyl
opioid-crisis
history-of-ai
documentary-2026
```

Invalid:

```text
Fentanyl
fentanyl_article
fentanyl article
FENTANYL
```

Recommended:

```text
lowercase-hyphen-slug
```

---

# 16. Automatic Image Distribution

Markdown-এর মধ্যে image marker না দিলেও build system ৪টি image automatically article-এর বিভিন্ন অংশে বসাবে।

Approximate distribution:

```text
Image 1 → প্রায় 20%
Image 2 → প্রায় 40%
Image 3 → প্রায় 60%
Image 4 → প্রায় 80%
```

---

# 17. Manual Image Placement

নির্দিষ্ট জায়গায় image বসাতে চাইলে Markdown-এর মধ্যে ব্যবহার করুন:

```html
<!-- image:1 -->
```

```html
<!-- image:2 -->
```

```html
<!-- image:3 -->
```

```html
<!-- image:4 -->
```

Example:

```md
প্রথম অংশের লেখা।

<!-- image:1 -->

পরবর্তী অংশের লেখা।

<!-- image:2 -->
```

একই image marker একাধিকবার ব্যবহার করা উচিত নয়।

---

# 18. Image Captions

Optional custom image captions Front Matter-এ ব্যবহার করা যাবে।

Example:

```yaml
imageCaptions:
  - "Fentanyl গবেষণার laboratory environment."
  - "Synthetic opioid supply-chain investigation."
  - "Opioid crisis response environment."
  - "Clinical fentanyl administration."
```

Caption না দিলে build system documentary title ব্যবহার করে default caption তৈরি করবে।

---

# 19. Table of Contents

Markdown-এর:

```md
## Heading
```

এবং:

```md
### Subheading
```

থেকে Table of Contents automatically তৈরি হবে।

Example:

```md
## Fentanyl-এর ইতিহাস

Content...

## Opioid Crisis

Content...

### Prescription Opioids

Content...

## Mexico Supply Chain

Content...
```

Heading না থাকলেও build fail করবে না।

সেক্ষেত্রে TOC-এ chapter না থাকার message দেখানো হবে।

---

# 20. Reading Time

Documentary article-এর text automatically analyse করে reading time calculate করা হয়।

Default reading speed:

```text
220 words per minute
```

---

# 21. YouTube Integration

Front Matter:

```yaml
youtube: "https://youtu.be/VIDEO_ID"
```

Supported common formats:

```text
https://youtu.be/VIDEO_ID
https://www.youtube.com/watch?v=VIDEO_ID
https://youtube.com/shorts/VIDEO_ID
https://youtube.com/embed/VIDEO_ID
https://youtube.com/live/VIDEO_ID
```

Direct 11-character YouTube video ID-ও support করা হয়।

Fake YouTube ID generate করা হয় না।

---

# 22. YouTube Thumbnail System

Documentary homepage thumbnail priority:

```text
Generated explicit thumbnail
        ↓
YouTube maxresdefault.jpg
        ↓
YouTube hqdefault.jpg
        ↓
Uploaded local image
```

Local image fallback:

```text
.jpg
.jpeg
.png
.webp
```

---

# 23. Hero Media

YouTube video থাকলে documentary page-এর hero section-এ real YouTube thumbnail ব্যবহার করা হবে।

যদি max-resolution thumbnail fail করে:

```text
maxresdefault.jpg
        ↓
hqdefault.jpg
        ↓
local documentary image
```

YouTube না থাকলে uploaded documentary image ব্যবহার করা হবে।

---

# 24. Homepage Automation

Build system automatically তৈরি করে:

```text
_site/data/documentaries.js
```

এবং:

```text
_site/data/documentaries.json
```

Homepage generated data ব্যবহার করে documentary cards render করে।

নতুন documentary যোগ করলে `index.html` manually edit করার প্রয়োজন নেই।

---

# 25. Newest-First Sorting

Documentary publication date অনুযায়ী newest-first order-এ দেখানো হয়।

Example:

```text
2026-09-05
2026-09-02
2026-08-20
2026-08-10
```

সবচেয়ে নতুন documentary সবার আগে থাকবে।

---

# 26. Related Documentaries

Related documentary selection মূলত topics-এর similarity দেখে করা হয়।

Example:

```yaml
topics:
  - Fentanyl
  - Opioid
  - Public Health
```

অন্য documentary-তে একই topic থাকলে সেটি related section-এ বেশি priority পাবে।

---

# 27. SEO System

Build system automatically:

```text
sitemap.xml
robots.txt
```

generate করে।

Documentary pages structured data ব্যবহার করে।

Possible structured-data types:

```text
Article
VideoObject
BreadcrumbList
Organization
Person
ImageObject
```

---

# 28. Sitemap

Build-এর সময় `_site/`-এর HTML routes scan করে sitemap তৈরি হয়।

Generated:

```text
_site/sitemap.xml
```

Documentary page-এর publication/update date থাকলে `<lastmod>` যোগ হয়।

---

# 29. Robots.txt

Generated file:

```text
_site/robots.txt
```

Basic structure:

```text
User-agent: *
Allow: /

Sitemap: https://YOUR-SITE/sitemap.xml
```

---

# 30. Generated Output

Build-এর পর final deployment-ready website থাকবে:

```text
_site/
```

Example:

```text
_site/
├── assets/
├── css/
├── data/
├── js/
├── documentaries/
├── index.html
├── sitemap.xml
├── robots.txt
└── .nojekyll
```

---

# 31. Important Rule About `_site/`

`_site/` manually edit করবেন না।

কারণ এটি generated output।

Source files edit করুন:

```text
content/
assets/
css/
js/
templates/
scripts/
```

তারপর আবার build করুন।

---

# 32. Local Build

Node.js এবং npm installed থাকলে প্রথমে:

```bash
npm ci
```

তারপর:

```bash
npm run build
```

Successful build হলে:

```text
_site/
```

তৈরি হবে।

---

# 33. GitHub Actions Deployment

Workflow file:

```text
.github/workflows/deploy.yml
```

Main branch-এ push করলে deployment শুরু হবে।

Flow:

```text
Push to main
        ↓
GitHub Actions
        ↓
npm ci
        ↓
npm run build
        ↓
Generate _site/
        ↓
Upload Pages Artifact
        ↓
Deploy GitHub Pages
```

---

# 34. GitHub Pages Configuration

Repository-এর:

```text
Settings
→ Pages
→ Build and deployment
→ Source
→ GitHub Actions
```

এ `GitHub Actions` select করুন।

---

# 35. Repository Root Structure

Project files সরাসরি repository root-এ থাকবে।

Correct:

```text
repository/
├── .github/
├── assets/
├── content/
├── css/
├── data/
├── js/
├── scripts/
├── templates/
├── index.html
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

Incorrect:

```text
repository/
└── SalimGPT/
    ├── index.html
    ├── package.json
    └── ...
```

অর্থাৎ unnecessary extra parent folder ব্যবহার করবেন না।

---

# 36. Future Documentary Example

ধরা যাক নতুন documentary:

```text
Artificial Intelligence
```

Slug:

```text
artificial-intelligence
```

Markdown:

```text
content/artificial-intelligence.md
```

Images:

```text
assets/documentaries/artificial-intelligence/
├── artificial-intelligence-1.jpg
├── artificial-intelligence-2.jpg
├── artificial-intelligence-3.jpg
└── artificial-intelligence-4.jpg
```

Push করার পর build system automatically তৈরি করবে:

```text
/documentaries/artificial-intelligence/
```

---

# 37. Example Future Markdown

```yaml
---
title: "Artificial Intelligence — ভবিষ্যতের প্রযুক্তি"
slug: "artificial-intelligence"
date: "2026-10-01"
youtube: "https://youtu.be/VIDEO_ID"
description: "Artificial Intelligence-এর ইতিহাস, প্রযুক্তি ও ভবিষ্যৎ নিয়ে SalimGPT documentary."
topics:
  - Artificial Intelligence
  - Technology
  - Machine Learning
status: "published"
---
```

তারপর নিচে documentary content লিখতে হবে।

---

# 38. Build Validation Rules

Build system published documentary-এর ক্ষেত্রে পরীক্ষা করে:

- documentary body আছে কি না
- title আছে কি না
- slug valid কি না
- status valid কি না
- date valid কি না
- description আছে কি না
- YouTube URL valid কি না
- image directory আছে কি না
- required ৪টি image আছে কি না
- image file valid কি না
- duplicate slug আছে কি না

Invalid source থাকলে deployment build fail করবে।

এটি intentional safety system।

---

# 39. Supported Publication Status

Only:

```text
published
draft
```

Allowed।

অন্য status build error তৈরি করতে পারে।

---

# 40. Duplicate Slug

একই slug দুই documentary-তে ব্যবহার করা যাবে না।

Wrong:

```text
content/fentanyl.md
slug: fentanyl
```

এবং:

```text
content/fentanyl-history.md
slug: fentanyl
```

এতে build fail করবে।

---

# 41. Search

Homepage documentary cards search system-এর সঙ্গে কাজ করার জন্য title এবং description search metadata হিসেবে ব্যবহার করে।

নতুন documentary publish হলে search system-এ manually entry যোগ করার প্রয়োজন নেই।

---

# 42. Responsive Design

Website mobile এবং desktop উভয় device-এর জন্য responsive।

Key interface components:

- Header
- Brand logo
- Menu button
- Side drawer
- Documentary cards
- Search
- Footer
- Documentary article
- Table of Contents
- Related documentary section

---

# 43. Header and Navigation

Site header SalimGPT branding এবং navigation-এর জন্য ব্যবহৃত হয়।

Current sponsor advertisement system project-এ active নয়।

Future sponsor integration প্রয়োজন হলে আলাদা implementation করা যাবে।

---

# 44. Sponsor Status

বর্তমানে:

```text
Sponsor banner: Disabled / Not integrated
```

অর্থাৎ project deploy করার জন্য sponsor-related কোনো asset বা code প্রয়োজন নেই।

---

# 45. Branding

Brand:

```text
SalimGPT
```

Primary visual identity:

```text
Red
Black
Blue accent
```

Website documentation ও documentary pages SalimGPT-এর research-based media identity অনুসরণ করে।

---

# 46. Founder / Director

SalimGPT-এর founder, director এবং editorial lead:

**Mohammad Salim**

---

# 47. Editorial Scope

SalimGPT-এর content categories-এর মধ্যে থাকতে পারে:

- History
- Science
- Mystery
- Technology
- Public Health
- Society
- Education
- Lifestyle
- Global Affairs
- Research-based explanatory documentary

---

# 48. Research Method

SalimGPT documentary তৈরিতে বিভিন্ন source ব্যবহার করা হতে পারে:

- Public reports
- Research papers
- Government publications
- International organizations
- News reports
- Public databases
- Historical archives
- Reference books
- Online research tools
- AI-assisted research tools

তথ্য প্রকাশের আগে যথাসম্ভব যাচাই করা SalimGPT-এর editorial লক্ষ্য।

---

# 49. AI Policy

AI tools ব্যবহার করা হতে পারে:

- Research assistance
- Information organization
- Language improvement
- Technical assistance
- Website development
- Content structure
- Production workflow

Final editorial responsibility SalimGPT-এর।

---

# 50. Original Scripts

SalimGPT documentary script-এর final editorial ownership এবং responsibility:

**Mohammad Salim**

---

# 51. Copyright

SalimGPT-এর original:

- Scripts
- Articles
- Website content
- Branding
- Original visual assets
- Documentary production material

অনুমতি ছাড়া commercial reuse করা উচিত নয়।

Third-party material সংশ্লিষ্ট copyright owner-এর অধীন।

---

# 52. External Sources

Documentary research-এর ক্ষেত্রে external source ব্যবহার হলে source-এর তথ্য contextualভাবে উপস্থাপন করা হতে পারে।

SalimGPT কোনো external website বা third-party organization-এর ownership দাবি করে না।

---

# 53. Security

Repository-তে কখনো sensitive information commit করবেন না।

যেমন:

```text
API keys
Passwords
Private tokens
Secret credentials
Private account information
Recovery codes
```

---

# 54. GitHub Secrets

Future workflow-এ secret প্রয়োজন হলে:

```text
GitHub Repository
→ Settings
→ Secrets and variables
→ Actions
```

ব্যবহার করুন।

Secret code-এর মধ্যে hardcode করবেন না।

---

# 55. Development Rules

Project update করার সময়:

1. `_site/` manually edit করবেন না।
2. Documentary Markdown source edit করুন।
3. Documentary images correct folder-এ রাখুন।
4. Slug naming consistent রাখুন।
5. Date `YYYY-MM-DD` format-এ রাখুন।
6. Duplicate slug ব্যবহার করবেন না।
7. Broken YouTube URL ব্যবহার করবেন না।
8. Required ৪টি documentary image রাখুন।
9. Build automation unnecessarily modify করবেন না।
10. GitHub Actions failure হলে logs পরীক্ষা করুন।

---

# 56. Recommended Documentary Workflow

প্রতিটি নতুন documentary-এর জন্য:

```text
Step 1
Choose slug

Step 2
Create content/<slug>.md

Step 3
Create assets/documentaries/<slug>/

Step 4
Add 4 images

Step 5
Check Front Matter

Step 6
Push to main

Step 7
Check GitHub Actions

Step 8
Open deployed documentary page
```

---

# 57. Example Final Documentary Structure

```text
content/
├── fentanyl.md
├── artificial-intelligence.md
└── black-hole.md
```

```text
assets/documentaries/
├── fentanyl/
│   ├── fentanyl-1.jpg
│   ├── fentanyl-2.jpg
│   ├── fentanyl-3.jpg
│   └── fentanyl-4.jpg
│
├── artificial-intelligence/
│   ├── artificial-intelligence-1.jpg
│   ├── artificial-intelligence-2.jpg
│   ├── artificial-intelligence-3.jpg
│   └── artificial-intelligence-4.jpg
│
└── black-hole/
    ├── black-hole-1.jpg
    ├── black-hole-2.jpg
    ├── black-hole-3.jpg
    └── black-hole-4.jpg
```

---

# 58. Generated Routes Example

Source:

```text
content/fentanyl.md
```

Generated:

```text
/documentaries/fentanyl/
```

Source:

```text
content/artificial-intelligence.md
```

Generated:

```text
/documentaries/artificial-intelligence/
```

---

# 59. Generated Data Files

Build automatically তৈরি করে:

```text
_site/data/documentaries.js
```

এবং:

```text
_site/data/documentaries.json
```

এই files manually maintain করার প্রয়োজন নেই।

---

# 60. Files That Should Not Be Manually Edited

Normally manually edit করবেন না:

```text
_site/
_site/data/documentaries.js
_site/data/documentaries.json
_site/sitemap.xml
_site/robots.txt
```

---

# 61. Source Files That Can Be Edited

Project development-এর জন্য edit করা যাবে:

```text
content/*.md
assets/
css/
js/
templates/
scripts/build.js
index.html
data/
```

তবে build system change করার আগে automation impact পরীক্ষা করা উচিত।

---

# 62. Current Image System

Current Fentanyl documentary images:

```text
fentanyl-1.jpg
fentanyl-2.jpg
fentanyl-3.jpg
fentanyl-4.jpg
```

Build system বর্তমানে support করে:

```text
.jpg
.jpeg
.png
.webp
```

Homepage fallback system-ও একই supported formats handle করতে পারে।

---

# 63. Current Deployment Readiness

Current project architecture GitHub Pages + GitHub Actions deployment-এর জন্য তৈরি।

Deployment-এর আগে নিশ্চিত করুন:

```text
scripts/build.js
```

updated image-format version।

এবং:

```text
js/documentary-list.js
```

updated local-thumbnail fallback version।

---

# 64. Pre-Deployment Checklist

GitHub-এ push করার আগে:

```text
[ ] README.md root-এ আছে

[ ] .github/workflows/deploy.yml আছে

[ ] package.json আছে

[ ] package-lock.json আছে

[ ] scripts/build.js আছে

[ ] templates/documentary.html আছে

[ ] content/fentanyl.md আছে

[ ] assets/documentaries/fentanyl/fentanyl-1.jpg আছে

[ ] assets/documentaries/fentanyl/fentanyl-2.jpg আছে

[ ] assets/documentaries/fentanyl/fentanyl-3.jpg আছে

[ ] assets/documentaries/fentanyl/fentanyl-4.jpg আছে

[ ] js/documentary-list.js updated

[ ] repository root structure সঠিক

[ ] GitHub Pages Source = GitHub Actions
```

---

# 65. After Uploading to GitHub

Upload/push করার পর:

```text
GitHub Repository
→ Actions
```

এ যান।

Workflow run দেখুন।

Successful হলে সবুজ check mark দেখাবে।

Expected build sequence:

```text
Checkout
↓
Setup Node
↓
npm ci
↓
npm run build
↓
Upload Pages Artifact
↓
Deploy GitHub Pages
```

---

# 66. If GitHub Actions Fails

GitHub Actions-এ red error হলে:

1. Failed workflow খুলুন।
2. Failed step খুলুন।
3. Error message দেখুন।
4. Exact file/path/line identify করুন।
5. Source fix করে আবার push করুন।

Build validation intentionally strict রাখা হয়েছে যাতে broken documentary production site-এ deploy না হয়।

---

# 67. GitHub Pages

GitHub Pages configuration:

```text
Settings
→ Pages
→ Build and deployment
→ Source
→ GitHub Actions
```

---

# 68. `.nojekyll`

Build system automatically:

```text
.nojekyll
```

generate করে।

এটি GitHub Pages-এর Jekyll processing disable করতে সাহায্য করে।

---

# 69. SITE_URL

Production site URL প্রয়োজন হলে environment variable:

```text
SITE_URL
```

ব্যবহার করা যেতে পারে।

Example:

```text
SITE_URL=https://example.com
```

অথবা:

```text
SITE_URL=https://username.github.io/repository
```

GitHub Actions environment-এ repository information পাওয়া গেলে build system project Pages URL resolve করতে পারে।

---

# 70. GitHub Project Pages

Repository যদি হয়:

```text
username/repository
```

তাহলে expected Pages URL:

```text
https://username.github.io/repository/
```

---

# 71. GitHub User Pages

Repository যদি হয়:

```text
username/username.github.io
```

তাহলে expected URL:

```text
https://username.github.io/
```

---

# 72. Documentary URL Design

Documentary URL:

```text
/documentaries/<slug>/
```

Example:

```text
/documentaries/fentanyl/
```

এটি clean এবং SEO-friendly route structure।

---

# 73. Content Language

Primary language:

```text
Bangla / bn-BD
```

Technical এবং documentary context অনুযায়ী English terminology ব্যবহার করা হতে পারে।

---

# 74. Documentary Writing Style

SalimGPT documentary content-এর লক্ষ্য:

- Research-based
- Narrative
- Informative
- Contextual
- Accessible
- Documentary-style
- Evidence-oriented
- Bangla audience friendly

---

# 75. Project Philosophy

SalimGPT-এর উদ্দেশ্য হলো complex বিষয়কে documentary storytelling-এর মাধ্যমে সহজ ও তথ্যসমৃদ্ধভাবে উপস্থাপন করা।

Technology এবং automation ব্যবহার করা হয় যাতে website maintenance সহজ হয় এবং নতুন documentary publish করতে repeated manual HTML coding প্রয়োজন না হয়।

---

# 76. Automation Philosophy

Automation-এর মূল ধারণা:

```text
Content First
Code Once
Publish Repeatedly
```

নতুন documentary-এর জন্য নতুন HTML coding নয়।

শুধু:

```text
Markdown
+
Images
+
Git Push
```

---

# 77. Current Publishing Model

Current documentary publishing model:

```text
Markdown Source
        ↓
Build Engine
        ↓
HTML Page
        ↓
Homepage Listing
        ↓
SEO Data
        ↓
GitHub Pages
```

---

# 78. Current Fentanyl Workflow

```text
content/fentanyl.md
        +
assets/documentaries/fentanyl/
        ↓
scripts/build.js
        ↓
Metadata Validation
        ↓
Image Validation
        ↓
YouTube Integration
        ↓
Article Generation
        ↓
Homepage Data
        ↓
Sitemap
        ↓
_site/documentaries/fentanyl/index.html
        ↓
GitHub Pages
```

---

# 79. Maintenance

Website maintain করার সময় মূলত update হবে:

```text
content/
assets/documentaries/
```

Design update হলে:

```text
css/
js/
templates/
```

Build engine প্রয়োজন ছাড়া পরিবর্তন না করাই ভালো।

---

# 80. README Location

এই `README.md` file project root-এ থাকবে।

Correct:

```text
SALIMGPT/
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── .github/
├── assets/
├── content/
├── css/
├── data/
├── js/
├── scripts/
└── templates/
```

README `.github/` folder-এর ভিতরে রাখবেন না।

---

# 81. Repository Documentation

GitHub repository open করলে README automatically repository-এর নিচে render হবে।

README project-এর:

- purpose
- structure
- workflow
- deployment process
- documentary publishing process
- maintenance rules

বোঝাতে সাহায্য করবে।

---

# 82. Production Notes

Production-এ:

- fake data ব্যবহার করবেন না
- fake YouTube ID ব্যবহার করবেন না
- broken image path রাখবেন না
- sensitive credential commit করবেন না
- duplicate slug রাখবেন না
- invalid date রাখবেন না

---

# 83. Future Improvements

Future development-এর সম্ভাব্য areas:

- Documentary categories
- Tag archive
- Advanced search
- Author archive
- Source/reference section
- Documentary pagination
- RSS feed
- Social sharing improvements
- Analytics
- Sponsor system
- Newsletter integration
- Advanced SEO
- Structured source citations

এসব current core automation-এর বাইরে future enhancement হিসেবে যোগ করা যেতে পারে।

---

# 84. Sponsor System

বর্তমানে sponsor advertisement integration active নয়।

Future sponsor system যোগ করলে advertisement clearly labeled হওয়া উচিত।

Current deployment-এর জন্য sponsor code প্রয়োজন নেই।

---

# 85. Contact and Social

Contact এবং social network information website-এর existing pages/data files থেকে পরিচালিত হবে।

Sensitive private contact information README-তে রাখা recommended নয়।

---

# 86. License / Usage

SalimGPT-এর original website design, scripts, documentary text, branding এবং original production content SalimGPT-এর নিজস্ব intellectual property হতে পারে।

Third-party open-source dependencies তাদের নিজস্ব license অনুযায়ী ব্যবহৃত হয়।

---

# 87. Dependencies

Project Node.js build dependencies `package.json` এবং `package-lock.json` দ্বারা পরিচালিত হয়।

Dependencies install:

```bash
npm ci
```

Build:

```bash
npm run build
```

---

# 88. Do Not Delete

Automatic deployment-এর জন্য নিচের files/folders গুরুত্বপূর্ণ:

```text
.github/workflows/deploy.yml
scripts/build.js
templates/documentary.html
content/
package.json
package-lock.json
```

এগুলো প্রয়োজন ছাড়া delete করবেন না।

---

# 89. Basic Troubleshooting

## Documentary homepage-এ দেখাচ্ছে না

Check:

```text
status: "published"
```

Check:

```text
slug
```

Check:

```text
date
```

Check generated data।

---

## Documentary build fail করছে

Check:

- Markdown body
- Front Matter
- date
- slug
- images
- YouTube URL
- duplicate slug

---

## Image দেখাচ্ছে না

Check:

```text
assets/documentaries/<slug>/
```

এবং naming:

```text
<slug>-1.jpg
<slug>-2.jpg
<slug>-3.jpg
<slug>-4.jpg
```

---

## YouTube thumbnail দেখাচ্ছে না

System fallback করবে:

```text
maxresdefault
↓
hqdefault
↓
local documentary image
```

---

# 90. Final Deployment Checklist

Final GitHub upload-এর আগে:

```text
1. Project root ঠিক
2. README.md root-এ
3. deploy.yml আছে
4. package files আছে
5. build.js updated
6. documentary-list.js updated
7. fentanyl.md আছে
8. 4 JPG images আছে
9. GitHub Pages = GitHub Actions
10. main branch-এ push
11. Actions status check
```

---

# SalimGPT

**Research-Based Bangla Documentary Media**

Founder / Director / Editorial Lead:

**Mohammad Salim**

Website architecture:

**Static Site + Markdown Automation + Node.js Build + GitHub Actions + GitHub Pages**

---

© SalimGPT. All rights reserved.
