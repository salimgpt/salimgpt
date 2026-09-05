/* =========================================================
   SalimGPT
   File: data/site.js
   Purpose: Central Site / Brand Configuration
   ========================================================= */

(function () {
  "use strict";


  /* =======================================================
     01. SITE CONFIGURATION
     ======================================================= */

  const site = {

    /* -----------------------------------------------------
       Brand
       ----------------------------------------------------- */

    brand: {
      name: "SalimGPT",
      nameFirst: "Salim",
      nameAccent: "GPT",

      tagline:
        "গবেষণা থেকে গল্প, গল্প থেকে জ্ঞান।",

      englishTagline:
        "Research-Based Documentary Media",

      type:
        "গবেষণাভিত্তিক বাংলা ডকুমেন্টারি মিডিয়া",

      shortDescription:
        "গবেষণা, তথ্য যাচাই, প্রেক্ষাপট এবং স্বতন্ত্র উপস্থাপনার মাধ্যমে নির্মিত বাংলা ডকুমেন্টারি মিডিয়া।",

      fullDescription:
        "SalimGPT একটি স্বাধীন গবেষণাভিত্তিক বাংলা ডকুমেন্টারি মিডিয়া উদ্যোগ, যেখানে ইতিহাস, সমাজ, বিজ্ঞান, প্রযুক্তি, মানবসভ্যতা, রহস্য এবং গুরুত্বপূর্ণ সমসাময়িক বিষয় গবেষণা, তথ্য যাচাই, নিজস্ব স্ক্রিপ্ট ও স্বতন্ত্র ভিজ্যুয়াল উপস্থাপনার মাধ্যমে ব্যাখ্যা করা হয়।"
    },


    /* -----------------------------------------------------
       Founder / Director
       ----------------------------------------------------- */

    founder: {
      name:
        "Mohammad Salim",

      role:
        "Founder & Director",

      roleBn:
        "প্রতিষ্ঠাতা ও পরিচালক",

      responsibilities: [
        "বিষয় নির্বাচন",
        "গবেষণা",
        "তথ্য যাচাই",
        "স্ক্রিপ্ট নির্মাণ",
        "সম্পাদকীয় ব্যাখ্যা",
        "ভিজ্যুয়াল পরিকল্পনা",
        "AI-assisted visual production",
        "ভিডিও সম্পাদনা",
        "চূড়ান্ত পর্যালোচনা",
        "প্রকাশনা"
      ]
    },


    /* -----------------------------------------------------
       Project / Launch
       ----------------------------------------------------- */

    project: {
      launchDate:
        "2025-12-02",

      launchDateBn:
        "২ ডিসেম্বর ২০২৫",

      language:
        "bn-BD",

      visibleLanguage:
        "বাংলা",

      country:
        "Bangladesh",

      projectSlug:
        "salimgpt",

      productionUrl:
        ""
    },


    /* -----------------------------------------------------
       Documentary Scope
       ----------------------------------------------------- */

    documentary: {
      primaryLanguage:
        "বাংলা",

      topics: [
        "ইতিহাস",
        "সমাজ",
        "বিজ্ঞান",
        "প্রযুক্তি",
        "মানবসভ্যতা",
        "রহস্য",
        "তদন্তধর্মী বিষয়",
        "ঐতিহাসিক ও সামাজিক ঘটনা"
      ],

      productionModel:
        "Human-led, AI-assisted",

      writtenArchive:
        true,

      youtubeEmbedByDefault:
        false,

      youtubeThumbnailFromVideoId:
        true
    },


    /* -----------------------------------------------------
       Research Principles
       ----------------------------------------------------- */

    research: {
      principles: [
        "গবেষণার আগে চূড়ান্ত বক্তব্য নির্ধারণ না করা",
        "গুরুত্বপূর্ণ তথ্য সম্ভব হলে একাধিক উৎসের সঙ্গে মিলিয়ে দেখা",
        "তথ্য সংগ্রহ এবং তথ্য যাচাইকে পৃথক ধাপ হিসেবে বিবেচনা করা",
        "তারিখ, সময়রেখা ও ঐতিহাসিক প্রেক্ষাপট যাচাই করা",
        "তথ্য এবং সম্পাদকীয় ব্যাখ্যার মধ্যে পার্থক্য বজায় রাখা",
        "নতুন ও শক্তিশালী প্রমাণ পাওয়া গেলে প্রয়োজন অনুযায়ী সংশোধন করা"
      ],

      possibleSourceTypes: [
        "বই",
        "গবেষণাপত্র",
        "সরকারি নথি",
        "প্রাতিষ্ঠানিক নথি",
        "আন্তর্জাতিক প্রতিবেদন",
        "ঐতিহাসিক আর্কাইভ",
        "বিশ্বস্ত সংবাদ প্রতিবেদন",
        "প্রাসঙ্গিক ওয়েব উৎস"
      ]
    },


    /* -----------------------------------------------------
       Originality
       ----------------------------------------------------- */

    originality: {
      statement:
        "SalimGPT অন্য নির্মাতার ভিডিও, অডিও, স্ক্রিপ্ট বা সম্পূর্ণ creative presentation হুবহু কপি করে নিজস্ব কাজ হিসেবে প্রকাশ করে না।",

      script:
        "গবেষণায় পাওয়া তথ্য বুঝে, তুলনা করে এবং প্রয়োজনীয় প্রেক্ষাপট নির্ধারণের পর নিজস্ব ভাষা ও narrative structure-এ স্ক্রিপ্ট তৈরি করা হয়।",

      video:
        "অন্য নির্মাতার সম্পূর্ণ ভিডিও বা দৃশ্যের ধারাবাহিকতা হুবহু পুনঃপ্রকাশ করা SalimGPT-এর production model নয়।",

      audio:
        "অন্যের narration বা voice recording সরাসরি SalimGPT-এর নিজস্ব narration হিসেবে ব্যবহার করা হয় না।",

      editing:
        "প্রতিটি documentary-এর pacing, scene progression, visual rhythm এবং overall presentation SalimGPT-এর নিজস্ব creative direction অনুযায়ী তৈরি করা হয়।"
    },


    /* -----------------------------------------------------
       AI Policy Summary
       ----------------------------------------------------- */

    ai: {
      model:
        "Human-led, AI-assisted",

      finalEditorialControl:
        "Human",

      visuals:
        true,

      syntheticVoice:
        true,

      researchAssistance:
        true,

      writingAssistance:
        true,

      finalReviewByHuman:
        true,

      visualStatement:
        "প্রয়োজন অনুযায়ী AI-generated বা AI-assisted image, illustrative scene এবং কাছাকাছি অর্থবোধক visual তৈরি, পরিবর্তন বা সম্পাদনা করা হতে পারে।",

      voiceStatement:
        "ডকুমেন্টারি narration-এ AI-generated বা synthetic voice ব্যবহার করা হতে পারে।",

      editorialStatement:
        "AI একটি production ও research-assistance tool; কোন তথ্য গ্রহণ করা হবে, কীভাবে ব্যাখ্যা করা হবে এবং কী প্রকাশিত হবে—সে বিষয়ে চূড়ান্ত সম্পাদকীয় সিদ্ধান্ত মানুষের।"
    },


    /* -----------------------------------------------------
       Visual / Footage Principles
       ----------------------------------------------------- */

    visualMedia: {
      possibleTypes: [
        "নিজস্বভাবে তৈরি visual",
        "AI-generated visual",
        "AI-assisted visual",
        "public-domain material",
        "licensed material",
        "আইনসম্মত archival material",
        "ব্যাখ্যামূলক graphics",
        "মানচিত্র",
        "illustrative reconstruction"
      ],

      transformation:
        "প্রয়োজন অনুযায়ী crop, framing, timing, composition, movement, visual treatment এবং editing-এর মাধ্যমে visual material-কে documentary narrative-এর সঙ্গে সামঞ্জস্যপূর্ণ করা হতে পারে।",

      illustrativeUse:
        "যেখানে সরাসরি বাস্তব footage নেই, সেখানে দর্শককে বিষয়টি বুঝতে সহায়ক illustrative বা conceptual visual ব্যবহার করা হতে পারে।",

      transparency:
        "AI-generated বা illustrative visual-কে অপ্রয়োজনীয়ভাবে সত্যিকারের archival camera footage হিসেবে বিভ্রান্তিকরভাবে উপস্থাপন না করার নীতি অনুসরণ করা হয়।"
    },


    /* -----------------------------------------------------
       Editorial Principles
       ----------------------------------------------------- */

    editorial: {
      principles: [
        "Evidence-led explanation",
        "Context before conclusion",
        "Independent editorial judgment",
        "Clear distinction between fact and interpretation",
        "Human final review",
        "Correction when necessary"
      ],

      neutralityStatement:
        "সম্পাদকীয় নিরপেক্ষতা বলতে প্রতিটি দাবিকে কৃত্রিমভাবে সমান গুরুত্ব দেওয়া নয়; বরং উপলভ্য প্রমাণ, উৎস ও প্রেক্ষাপটের ভিত্তিতে বিষয়টি উপস্থাপন করা।",

      editorialQuote:
        "প্রমাণ যেখানে নিয়ে যায়, তথ্যকে সেখানে যেতে দেওয়া।"
    },


    /* -----------------------------------------------------
       Trust / Correction
       ----------------------------------------------------- */

    trust: {
      infallibilityClaim:
        false,

      correctionPolicy:
        "SalimGPT নিজেকে ভুলের ঊর্ধ্বে দাবি করে না। কোনো গুরুত্বপূর্ণ তথ্য ভুল প্রমাণিত হলে প্রয়োজন অনুযায়ী সংশোধনের চেষ্টা করা হয়।",

      misinformationPolicy:
        "জেনেশুনে মিথ্যা বা বিভ্রান্তিকর তথ্য প্রকাশ করা SalimGPT-এর সম্পাদকীয় নীতির অংশ নয়।"
    },


    /* -----------------------------------------------------
       Brand Independence
       ----------------------------------------------------- */

    independence: {
      independent:
        true,

      openAIAffiliation:
        false,

      disclaimer:
        "SalimGPT একটি স্বাধীন documentary media উদ্যোগ। নামের মধ্যে “GPT” থাকলেও এটি OpenAI, ChatGPT বা OpenAI-এর কোনো official product, service, approved media organization বা সহযোগী প্রতিষ্ঠান নয়।"
    },


    /* -----------------------------------------------------
       Legal / Copyright Summary
       ----------------------------------------------------- */

    legal: {
      copyrightOwner:
        "SalimGPT",

      director:
        "Mohammad Salim",

      reuploadPermission:
        false,

      fullScriptCopyPermission:
        false,

      fullVideoCopyPermission:
        false,

      attributionRequiredWhenApplicable:
        true
    },


    /* -----------------------------------------------------
       Local Asset Paths
       Paths are relative to project root.
       ----------------------------------------------------- */

    assets: {
      logo:
        "assets/brand/logo.svg",

      wordmark:
        "assets/brand/wordmark.svg",

      banner:
        "assets/brand/banner.webp",

      defaultOg:
        "assets/brand/default-og.webp",

      favicon:
        "favicon.svg",

      manifest:
        "manifest.webmanifest"
    },


    /* -----------------------------------------------------
       Internal Page Paths
       Root-relative inside the project structure.
       Consumers should resolve these from the page depth.
       ----------------------------------------------------- */

    pages: {
      home:
        "",

      about:
        "about/",

      director:
        "director/",

      originality:
        "originality/",

      productionProcess:
        "production-process/",

      studio:
        "studio/",

      visualMedia:
        "visual-media/",

      factChecking:
        "fact-checking/",

      aiPolicy:
        "ai-policy/",

      editorialPolicy:
        "editorial-policy/",

      ownershipCopyright:
        "ownership-copyright/",

      contentUse:
        "content-use/",

      faq:
        "faq/",

      social:
        "social/",

      contact:
        "contact/",

      privacy:
        "legal/privacy/",

      terms:
        "legal/terms/",

      disclaimer:
        "legal/disclaimer/"
    },


    /* -----------------------------------------------------
       Social Platforms
       Actual profile URLs will be added only after
       official URLs are supplied.
       ----------------------------------------------------- */

    socialPlatforms: [
      {
        id: "youtube",
        name: "YouTube",
        url: ""
      },
      {
        id: "facebook",
        name: "Facebook",
        url: ""
      },
      {
        id: "instagram",
        name: "Instagram",
        url: ""
      },
      {
        id: "threads",
        name: "Threads",
        url: ""
      },
      {
        id: "tiktok",
        name: "TikTok",
        url: ""
      }
    ]

  };


  /* =======================================================
     02. FREEZE CONFIG
     ======================================================= */

  function deepFreeze(object) {
    if (
      !object ||
      typeof object !== "object" ||
      Object.isFrozen(object)
    ) {
      return object;
    }


    Object.keys(object).forEach(
      (key) => {
        deepFreeze(
          object[key]
        );
      }
    );


    return Object.freeze(object);
  }


  /* =======================================================
     03. GLOBAL EXPORT
     ======================================================= */

  window.SALIMGPT_SITE =
    deepFreeze(site);


  /*
    Lightweight alias for future scripts.
  */

  window.salimgptSite =
    window.SALIMGPT_SITE;


  /* =======================================================
     04. READY EVENT
     ======================================================= */

  document.dispatchEvent(
    new CustomEvent(
      "salimgpt:siteDataReady",
      {
        detail: {
          site:
            window.SALIMGPT_SITE
        }
      }
    )
  );

})();
