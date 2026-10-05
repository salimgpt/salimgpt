"use strict";

/* =========================================================
   SalimGPT Global
   File: data/social.js

   Official social / distribution data.

   Purpose:
   - Centralize verified social-profile information
   - Support Official Social Profiles page
   - Support Where to Watch page
   - Support footer / menu / future social components
   - Distinguish confirmed links from unpublished links
   - Support language-specific profile records
   - Prevent guessed or fabricated social URLs
   - Provide a safe public API for social data

   Important:
   - Only explicitly confirmed external URLs belong here.
   - Empty URL means no verified public URL has been added.
   - Never construct usernames or social URLs automatically.
   - One main SalimGPT YouTube channel is the intended
     YouTube distribution model.
   - Multilingual audio may be available on that main
     YouTube channel where supported.
   ========================================================= */

(function (global) {

  /* =======================================================
     SITE CONFIG
     ======================================================= */

  const SITE = {

    name:
      "SalimGPT",

    baseUrl:
      "https://salimgpt.github.io/salimgpt/",

    officialProfilesPage:
      "https://salimgpt.github.io/salimgpt/global/official-social-profiles/",

    whereToWatchPage:
      "https://salimgpt.github.io/salimgpt/global/where-to-watch/",

    youtubeAudioPage:
      "https://salimgpt.github.io/salimgpt/global/youtube-multi-language-audio/"

  };


  /* =======================================================
     STATUS CONSTANTS
     ======================================================= */

  const STATUS = {

    CONFIRMED:
      "confirmed",

    UNPUBLISHED:
      "unpublished",

    UPCOMING:
      "upcoming",

    INACTIVE:
      "inactive"

  };


  /* =======================================================
     PLATFORM DEFINITIONS

     These records describe supported platform types.
     They do NOT assert that every platform currently has
     an active SalimGPT account.
     ======================================================= */

  const PLATFORMS = [

    {
      id:
        "youtube",

      name:
        "YouTube",

      type:
        "video",

      icon:
        "youtube",

      supportsLanguageProfiles:
        false,

      distributionModel:
        "single-main-channel",

      multiLanguageAudio:
        true
    },


    {
      id:
        "facebook",

      name:
        "Facebook",

      type:
        "social",

      icon:
        "facebook",

      supportsLanguageProfiles:
        true,

      distributionModel:
        "profile-or-page",

      multiLanguageAudio:
        false
    },


    {
      id:
        "instagram",

      name:
        "Instagram",

      type:
        "social",

      icon:
        "instagram",

      supportsLanguageProfiles:
        true,

      distributionModel:
        "profile",

      multiLanguageAudio:
        false
    },


    {
      id:
        "x",

      name:
        "X",

      type:
        "social",

      icon:
        "x",

      supportsLanguageProfiles:
        true,

      distributionModel:
        "profile",

      multiLanguageAudio:
        false
    },


    {
      id:
        "tiktok",

      name:
        "TikTok",

      type:
        "social-video",

      icon:
        "tiktok",

      supportsLanguageProfiles:
        true,

      distributionModel:
        "profile",

      multiLanguageAudio:
        false
    },


    {
      id:
        "linkedin",

      name:
        "LinkedIn",

      type:
        "professional",

      icon:
        "linkedin",

      supportsLanguageProfiles:
        false,

      distributionModel:
        "page-or-profile",

      multiLanguageAudio:
        false
    }

  ];


  /* =======================================================
     OFFICIAL PROFILE RECORDS

     Add an external URL only after it has been explicitly
     confirmed as an official SalimGPT property.

     Current verified external handles / URLs have not been
     supplied in this configuration, so they remain empty.

     Example of a future confirmed record:

     {
       id: "youtube-main",
       platform: "youtube",
       name: "SalimGPT",
       scope: "global",
       language: "",
       status: STATUS.CONFIRMED,
       url: "CONFIRMED_URL_HERE"
     }

     Do not guess the URL.
     ======================================================= */

  const PROFILES = [

    {
      id:
        "youtube-main",

      platform:
        "youtube",

      name:
        "SalimGPT",

      scope:
        "global",

      language:
        "",

      status:
        STATUS.UNPUBLISHED,

      url:
        "",

      handle:
        "",

      primary:
        true,

      description:
        "SalimGPT uses one main YouTube channel as its intended YouTube distribution model, with multi-language audio where supported.",

      multiLanguageAudio:
        true
    }

  ];


  /* =======================================================
     LANGUAGE EDITION REFERENCE

     These are website editions, not social-profile URLs.
     They help future language-specific social records remain
     aligned with the confirmed SalimGPT language structure.
     ======================================================= */

  const LANGUAGE_EDITIONS = [

    {
      code:
        "bn",

      name:
        "Bengali",

      nativeName:
        "বাংলা",

      status:
        "available",

      website:
        "https://salimgpt.github.io/salimgpt-bn/"
    },


    {
      code:
        "en",

      name:
        "English",

      nativeName:
        "English",

      status:
        "available",

      website:
        "https://salimgpt.github.io/salimgpt-en/"
    },


    {
      code:
        "hi",

      name:
        "Hindi",

      nativeName:
        "हिन्दी",

      status:
        "available",

      website:
        "https://salimgpt.github.io/salimgpt-hi/"
    },


    {
      code:
        "ur",

      name:
        "Urdu",

      nativeName:
        "اردو",

      status:
        "upcoming",

      website:
        ""
    },


    {
      code:
        "ar",

      name:
        "Arabic",

      nativeName:
        "العربية",

      status:
        "upcoming",

      website:
        ""
    },


    {
      code:
        "es",

      name:
        "Spanish",

      nativeName:
        "Español",

      status:
        "upcoming",

      website:
        ""
    },


    {
      code:
        "fr",

      name:
        "French",

      nativeName:
        "Français",

      status:
        "upcoming",

      website:
        ""
    },


    {
      code:
        "pt",

      name:
        "Portuguese",

      nativeName:
        "Português",

      status:
        "upcoming",

      website:
        ""
    },


    {
      code:
        "id",

      name:
        "Indonesian",

      nativeName:
        "Bahasa Indonesia",

      status:
        "upcoming",

      website:
        ""
    },


    {
      code:
        "tr",

      name:
        "Turkish",

      nativeName:
        "Türkçe",

      status:
        "upcoming",

      website:
        ""
    }

  ];


  /* =======================================================
     DISTRIBUTION MODEL
     ======================================================= */

  const DISTRIBUTION = {

    website: {

      name:
        "SalimGPT Global",

      type:
        "website",

      status:
        STATUS.CONFIRMED,

      url:
        SITE.baseUrl
    },


    youtube: {

      channelModel:
        "single-main-channel",

      multiLanguageAudio:
        true,

      channelUrl:
        "",

      channelUrlConfirmed:
        false,

      informationPage:
        SITE.youtubeAudioPage
    },


    social: {

      languageSpecificProfilesPossible:
        true,

      confirmedProfileCount:
        0,

      directory:
        SITE.officialProfilesPage
    },


    discovery: {

      officialProfiles:
        SITE.officialProfilesPage,

      whereToWatch:
        SITE.whereToWatchPage
    }

  };


  /* =======================================================
     NORMALIZE PLATFORM ID
     ======================================================= */

  const normalizePlatformId = (
    value
  ) => {
    return String(
      value || ""
    )
      .trim()
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      );
  };


  /* =======================================================
     NORMALIZE LANGUAGE CODE
     ======================================================= */

  const normalizeLanguageCode = (
    value
  ) => {
    return String(
      value || ""
    )
      .trim()
      .toLowerCase()
      .replace(
        /_/g,
        "-"
      )
      .split("-")[0];
  };


  /* =======================================================
     VALID EXTERNAL URL
     ======================================================= */

  const isValidExternalUrl = (
    value
  ) => {
    if (!value) {
      return false;
    }


    try {
      const parsed =
        new URL(value);


      return (
        parsed.protocol === "https:" ||
        parsed.protocol === "http:"
      );
    } catch {
      return false;
    }
  };


  /* =======================================================
     GET PLATFORM
     ======================================================= */

  const getPlatform = (
    platformId
  ) => {
    const wanted =
      normalizePlatformId(
        platformId
      );


    if (!wanted) {
      return null;
    }


    return (
      PLATFORMS.find(
        (platform) =>
          platform.id === wanted
      ) ||
      null
    );
  };


  /* =======================================================
     GET PROFILE
     ======================================================= */

  const getProfile = (
    profileId
  ) => {
    const wanted =
      String(
        profileId || ""
      )
        .trim()
        .toLowerCase();


    if (!wanted) {
      return null;
    }


    return (
      PROFILES.find(
        (profile) =>
          profile.id.toLowerCase() ===
          wanted
      ) ||
      null
    );
  };


  /* =======================================================
     GET PROFILES BY PLATFORM
     ======================================================= */

  const getProfilesByPlatform = (
    platformId
  ) => {
    const wanted =
      normalizePlatformId(
        platformId
      );


    return PROFILES.filter(
      (profile) =>
        profile.platform === wanted
    );
  };


  /* =======================================================
     GET PROFILES BY LANGUAGE
     ======================================================= */

  const getProfilesByLanguage = (
    languageCode
  ) => {
    const wanted =
      normalizeLanguageCode(
        languageCode
      );


    if (!wanted) {
      return [];
    }


    return PROFILES.filter(
      (profile) =>
        normalizeLanguageCode(
          profile.language
        ) === wanted
    );
  };


  /* =======================================================
     CONFIRMED PROFILES
     ======================================================= */

  const getConfirmedProfiles =
    () => {
      return PROFILES.filter(
        (profile) => {
          return (
            profile.status ===
              STATUS.CONFIRMED &&
            isValidExternalUrl(
              profile.url
            )
          );
        }
      );
    };


  /* =======================================================
     PUBLISHED PROFILES
     ======================================================= */

  const getPublishedProfiles =
    () => {
      return getConfirmedProfiles();
    };


  /* =======================================================
     UNPUBLISHED PROFILES
     ======================================================= */

  const getUnpublishedProfiles =
    () => {
      return PROFILES.filter(
        (profile) =>
          profile.status ===
            STATUS.UNPUBLISHED ||
          !isValidExternalUrl(
            profile.url
          )
      );
    };


  /* =======================================================
     PROFILE IS PUBLISHABLE
     ======================================================= */

  const isProfilePublishable = (
    profile
  ) => {
    if (
      !profile ||
      typeof profile !==
        "object"
    ) {
      return false;
    }


    return (
      profile.status ===
        STATUS.CONFIRMED &&
      isValidExternalUrl(
        profile.url
      )
    );
  };


  /* =======================================================
     GET OFFICIAL URL

     Returns an external URL only when a profile has both:
     - confirmed status
     - valid URL

     This prevents placeholder or guessed links from being
     exposed by other site scripts.
     ======================================================= */

  const getOfficialUrl = (
    platformId,
    languageCode = ""
  ) => {
    const platform =
      normalizePlatformId(
        platformId
      );


    const language =
      normalizeLanguageCode(
        languageCode
      );


    const matches =
      PROFILES.filter(
        (profile) => {
          if (
            profile.platform !==
            platform
          ) {
            return false;
          }


          if (
            language &&
            normalizeLanguageCode(
              profile.language
            ) !== language
          ) {
            return false;
          }


          return isProfilePublishable(
            profile
          );
        }
      );


    if (!matches.length) {
      return "";
    }


    const primary =
      matches.find(
        (profile) =>
          profile.primary
      );


    return (
      primary ||
      matches[0]
    ).url;
  };


  /* =======================================================
     LANGUAGE EDITION
     ======================================================= */

  const getLanguageEdition = (
    languageCode
  ) => {
    const wanted =
      normalizeLanguageCode(
        languageCode
      );


    return (
      LANGUAGE_EDITIONS.find(
        (language) =>
          language.code === wanted
      ) ||
      null
    );
  };


  /* =======================================================
     PROFILE COUNTS
     ======================================================= */

  const getCounts = () => {
    const confirmed =
      getConfirmedProfiles()
        .length;


    const unpublished =
      PROFILES.filter(
        (profile) =>
          profile.status ===
          STATUS.UNPUBLISHED
      ).length;


    const upcoming =
      PROFILES.filter(
        (profile) =>
          profile.status ===
          STATUS.UPCOMING
      ).length;


    const inactive =
      PROFILES.filter(
        (profile) =>
          profile.status ===
          STATUS.INACTIVE
      ).length;


    return {
      total:
        PROFILES.length,

      confirmed,

      unpublished,

      upcoming,

      inactive
    };
  };


  /* =======================================================
     SEARCH PROFILES
     ======================================================= */

  const normalizeSearchText = (
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


    text =
      text.replace(
        /[\u0300-\u036f]/g,
        ""
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


  const searchProfiles = (
    query
  ) => {
    const normalizedQuery =
      normalizeSearchText(
        query
      );


    if (!normalizedQuery) {
      return [
        ...PROFILES
      ];
    }


    const terms =
      normalizedQuery
        .split(" ")
        .filter(Boolean);


    return PROFILES.filter(
      (profile) => {
        const platform =
          getPlatform(
            profile.platform
          );


        const language =
          getLanguageEdition(
            profile.language
          );


        const searchable =
          normalizeSearchText(
            [
              profile.id,
              profile.name,
              profile.platform,
              platform
                ? platform.name
                : "",
              profile.scope,
              profile.language,
              language
                ? language.name
                : "",
              language
                ? language.nativeName
                : "",
              profile.handle,
              profile.description,
              profile.status
            ]
              .filter(Boolean)
              .join(" ")
          );


        return terms.every(
          (term) =>
            searchable.includes(
              term
            )
        );
      }
    );
  };


  /* =======================================================
     SAFE PUBLIC PROFILE COPY

     Makes it harder for page code to accidentally publish
     an unverified URL.
     ======================================================= */

  const toPublicProfile = (
    profile
  ) => {
    if (!profile) {
      return null;
    }


    const platform =
      getPlatform(
        profile.platform
      );


    const language =
      profile.language
        ? getLanguageEdition(
            profile.language
          )
        : null;


    const publishable =
      isProfilePublishable(
        profile
      );


    return {

      id:
        profile.id,

      platform:
        profile.platform,

      platformName:
        platform
          ? platform.name
          : profile.platform,

      name:
        profile.name,

      scope:
        profile.scope,

      language:
        profile.language,

      languageName:
        language
          ? language.name
          : "",

      nativeLanguageName:
        language
          ? language.nativeName
          : "",

      status:
        profile.status,

      primary:
        Boolean(
          profile.primary
        ),

      description:
        profile.description || "",

      multiLanguageAudio:
        Boolean(
          profile.multiLanguageAudio
        ),

      confirmed:
        publishable,

      url:
        publishable
          ? profile.url
          : "",

      handle:
        publishable
          ? profile.handle || ""
          : ""

    };
  };


  /* =======================================================
     DATA OBJECT
     ======================================================= */

  const SOCIAL_DATA = {

    version:
      1,

    site:
      SITE,

    status:
      STATUS,

    platforms:
      PLATFORMS,

    profiles:
      PROFILES,

    languageEditions:
      LANGUAGE_EDITIONS,

    distribution:
      DISTRIBUTION,

    policies: {

      requireConfirmedUrl:
        true,

      allowGuessedHandles:
        false,

      automaticSocialRedirect:
        false,

      youtubeChannelModel:
        "single-main-channel",

      multilingualYoutubeAudio:
        true
    }

  };


  /* =======================================================
     PRIMARY GLOBAL VARIABLES
     ======================================================= */

  global.SALIMGPT_SOCIAL =
    SOCIAL_DATA;


  global.SALIMGPT_SOCIAL_DATA =
    SOCIAL_DATA;


  global.SALIMGPT_SOCIAL_PLATFORMS =
    PLATFORMS;


  global.SALIMGPT_SOCIAL_PROFILES =
    PROFILES;


  /* =======================================================
     COMPATIBILITY ALIASES
     ======================================================= */

  global.salimgptSocial =
    SOCIAL_DATA;


  global.salimgptSocialProfiles =
    PROFILES;


  global.salimgptSocialPlatforms =
    PLATFORMS;


  /* =======================================================
     PUBLIC API
     ======================================================= */

  global.SalimGPTSocial = {

    version:
      SOCIAL_DATA.version,


    getData() {
      return SOCIAL_DATA;
    },


    getPlatforms() {
      return PLATFORMS.map(
        (platform) => ({
          ...platform
        })
      );
    },


    getPlatform(
      platformId
    ) {
      const platform =
        getPlatform(
          platformId
        );


      return platform
        ? {
            ...platform
          }
        : null;
    },


    getProfiles({
      confirmedOnly = false
    } = {}) {
      const source =
        confirmedOnly
          ? getConfirmedProfiles()
          : PROFILES;


      return source.map(
        toPublicProfile
      );
    },


    getConfirmedProfiles() {
      return getConfirmedProfiles()
        .map(
          toPublicProfile
        );
    },


    getPublishedProfiles() {
      return getPublishedProfiles()
        .map(
          toPublicProfile
        );
    },


    getUnpublishedProfiles() {
      return getUnpublishedProfiles()
        .map(
          toPublicProfile
        );
    },


    getProfile(
      profileId
    ) {
      return toPublicProfile(
        getProfile(
          profileId
        )
      );
    },


    getProfilesByPlatform(
      platformId,
      {
        confirmedOnly = false
      } = {}
    ) {
      let profiles =
        getProfilesByPlatform(
          platformId
        );


      if (confirmedOnly) {
        profiles =
          profiles.filter(
            isProfilePublishable
          );
      }


      return profiles.map(
        toPublicProfile
      );
    },


    getProfilesByLanguage(
      languageCode,
      {
        confirmedOnly = false
      } = {}
    ) {
      let profiles =
        getProfilesByLanguage(
          languageCode
        );


      if (confirmedOnly) {
        profiles =
          profiles.filter(
            isProfilePublishable
          );
      }


      return profiles.map(
        toPublicProfile
      );
    },


    getOfficialUrl(
      platformId,
      languageCode = ""
    ) {
      return getOfficialUrl(
        platformId,
        languageCode
      );
    },


    hasConfirmedProfile(
      platformId,
      languageCode = ""
    ) {
      return Boolean(
        getOfficialUrl(
          platformId,
          languageCode
        )
      );
    },


    isConfirmed(
      profileId
    ) {
      return isProfilePublishable(
        getProfile(
          profileId
        )
      );
    },


    getLanguageEditions() {
      return LANGUAGE_EDITIONS.map(
        (language) => ({
          ...language
        })
      );
    },


    getLanguageEdition(
      languageCode
    ) {
      const language =
        getLanguageEdition(
          languageCode
        );


      return language
        ? {
            ...language
          }
        : null;
    },


    getCounts() {
      return {
        ...getCounts()
      };
    },


    search(
      query
    ) {
      return searchProfiles(
        query
      ).map(
        toPublicProfile
      );
    },


    getDistribution() {
      return DISTRIBUTION;
    },


    getOfficialProfilesPage() {
      return SITE.officialProfilesPage;
    },


    getWhereToWatchPage() {
      return SITE.whereToWatchPage;
    },


    getYouTubeInformationPage() {
      return SITE.youtubeAudioPage;
    },


    /*
     * This explicitly prevents consumer code from assuming
     * that an unknown or empty social URL is safe to publish.
     */
    canPublishProfile(
      profileId
    ) {
      return isProfilePublishable(
        getProfile(
          profileId
        )
      );
    }

  };


  /* =======================================================
     DOCUMENT READY METADATA
     ======================================================= */

  if (
    typeof document !==
    "undefined"
  ) {
    const counts =
      getCounts();


    document.documentElement
      .dataset
      .socialDataReady =
        "true";


    document.documentElement
      .dataset
      .confirmedSocialProfiles =
        String(
          counts.confirmed
        );


    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:social-data-ready",
          {
            detail: {
              platformCount:
                PLATFORMS.length,

              profileCount:
                counts.total,

              confirmedProfileCount:
                counts.confirmed
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