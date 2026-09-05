/* =========================================================
   SalimGPT
   File: data/social.js
   Purpose: Official Social Platform Configuration
   ---------------------------------------------------------
   IMPORTANT:
   - Real profile URLs are intentionally left blank.
   - Add only verified official SalimGPT profile URLs.
   - Do not invent usernames or links.
   ========================================================= */

(function () {
  "use strict";


  /* =======================================================
     01. SOCIAL DATA
     ======================================================= */

  const socialPlatforms = [


    /* =====================================================
       YOUTUBE
       ===================================================== */

    {
      id: "youtube",

      name:
        "YouTube",

      label:
        "SalimGPT on YouTube",

      description:
        "SalimGPT-এর মূল গবেষণাভিত্তিক বাংলা ডকুমেন্টারি, নতুন প্রকাশনা এবং পূর্ণাঙ্গ ভিডিও দেখুন।",

      url: "",

      username: "",

      icon:
        "../assets/social/youtube.svg",

      brandColor:
        "#ff0000",

      type:
        "video",

      primary:
        true,

      order:
        1,

      status:
        "active"
    },


    /* =====================================================
       FACEBOOK
       ===================================================== */

    {
      id: "facebook",

      name:
        "Facebook",

      label:
        "SalimGPT on Facebook",

      description:
        "SalimGPT-এর ডকুমেন্টারি আপডেট, নির্বাচিত ভিডিও, ভিজ্যুয়াল পোস্ট এবং নতুন প্রকাশনার তথ্য অনুসরণ করুন।",

      url: "",

      username: "",

      icon:
        "../assets/social/facebook.svg",

      brandColor:
        "#1877f2",

      type:
        "social",

      primary:
        true,

      order:
        2,

      status:
        "active"
    },


    /* =====================================================
       INSTAGRAM
       ===================================================== */

    {
      id: "instagram",

      name:
        "Instagram",

      label:
        "SalimGPT on Instagram",

      description:
        "SalimGPT-এর visual storytelling, documentary highlights, short-form content এবং সৃজনশীল আপডেট দেখুন।",

      url: "",

      username: "",

      icon:
        "../assets/social/instagram.svg",

      brandColor:
        "#e4405f",

      type:
        "social",

      primary:
        true,

      order:
        3,

      status:
        "active"
    },


    /* =====================================================
       THREADS
       ===================================================== */

    {
      id: "threads",

      name:
        "Threads",

      label:
        "SalimGPT on Threads",

      description:
        "গবেষণা, ডকুমেন্টারি বিষয়, নতুন কাজ এবং SalimGPT-এর সংক্ষিপ্ত আপডেট অনুসরণ করুন।",

      url: "",

      username: "",

      icon:
        "../assets/social/threads.svg",

      brandColor:
        "#111111",

      type:
        "social",

      primary:
        false,

      order:
        4,

      status:
        "active"
    },


    /* =====================================================
       TIKTOK
       ===================================================== */

    {
      id: "tiktok",

      name:
        "TikTok",

      label:
        "SalimGPT on TikTok",

      description:
        "SalimGPT-এর short documentary clips, সংক্ষিপ্ত ব্যাখ্যা এবং নির্বাচিত visual content দেখুন।",

      url: "",

      username: "",

      icon:
        "../assets/social/tiktok.svg",

      brandColor:
        "#111111",

      type:
        "short-video",

      primary:
        true,

      order:
        5,

      status:
        "active"
    }

  ];


  /* =======================================================
     02. SOCIAL PAGE CONFIGURATION
     ======================================================= */

  const socialConfig = {

    title:
      "সোশ্যাল নেটওয়ার্ক",

    subtitle:
      "SalimGPT-এর অফিসিয়াল প্ল্যাটফর্মগুলো",

    description:
      "SalimGPT-এর গবেষণাভিত্তিক ডকুমেন্টারি, নতুন প্রকাশনা, visual storytelling এবং গুরুত্বপূর্ণ আপডেট বিভিন্ন সামাজিক প্ল্যাটফর্মে অনুসরণ করা যাবে।",

    banner:
      "../assets/social/social-banner.webp",

    warning:
      "শুধুমাত্র SalimGPT-এর নিশ্চিত করা অফিসিয়াল প্রোফাইল ও লিংক অনুসরণ করুন।",

    verificationNote:
      "কোনো লিংক এখানে যুক্ত করার আগে সেটি SalimGPT-এর অফিসিয়াল অ্যাকাউন্ট কি না যাচাই করা উচিত।",

    externalLinkTarget:
      "_blank",

    externalLinkRel:
      "noopener noreferrer"
  };


  /* =======================================================
     03. HELPERS
     ======================================================= */

  function cleanText(value) {
    if (
      value === undefined ||
      value === null
    ) {
      return "";
    }

    return String(value).trim();
  }


  function hasValidUrl(value) {
    const url =
      cleanText(value);


    if (!url) {
      return false;
    }


    try {
      const parsed =
        new URL(url);


      return (
        parsed.protocol === "https:" ||
        parsed.protocol === "http:"
      );

    } catch (error) {
      return false;
    }
  }


  function getPlatformById(id) {
    const normalizedId =
      cleanText(id)
        .toLowerCase();


    return (
      socialPlatforms.find(
        (platform) =>
          platform.id === normalizedId
      ) || null
    );
  }


  function getActivePlatforms() {
    return socialPlatforms
      .filter(
        (platform) =>
          platform.status === "active"
      )
      .sort(
        (a, b) =>
          a.order - b.order
      );
  }


  function getLinkedPlatforms() {
    return getActivePlatforms()
      .filter(
        (platform) =>
          hasValidUrl(platform.url)
      );
  }


  function getPrimaryPlatforms() {
    return getActivePlatforms()
      .filter(
        (platform) =>
          platform.primary === true
      );
  }


  /* =======================================================
     04. FREEZE DATA
     ======================================================= */

  function deepFreeze(value) {
    if (
      !value ||
      typeof value !== "object" ||
      Object.isFrozen(value)
    ) {
      return value;
    }


    Object.keys(value).forEach(
      (key) => {
        deepFreeze(
          value[key]
        );
      }
    );


    return Object.freeze(value);
  }


  /* =======================================================
     05. GLOBAL EXPORT
     ======================================================= */

  window.SALIMGPT_SOCIAL =
    deepFreeze({
      config:
        socialConfig,

      platforms:
        socialPlatforms
    });


  /*
    Compatibility alias.
  */

  window.salimgptSocial =
    window.SALIMGPT_SOCIAL;


  /* =======================================================
     06. PUBLIC HELPERS
     ======================================================= */

  window.SALIMGPT_SOCIAL_HELPERS =
    Object.freeze({

      getPlatformById,

      getActivePlatforms,

      getLinkedPlatforms,

      getPrimaryPlatforms,

      hasValidUrl

    });


  /* =======================================================
     07. READY EVENT
     ======================================================= */

  document.dispatchEvent(
    new CustomEvent(
      "salimgpt:socialDataReady",
      {
        detail: {
          social:
            window.SALIMGPT_SOCIAL,

          activeCount:
            getActivePlatforms().length,

          linkedCount:
            getLinkedPlatforms().length
        }
      }
    )
  );

})();