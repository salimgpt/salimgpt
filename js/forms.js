"use strict";

/* =========================================================
   SalimGPT Global
   File: js/forms.js

   Shared Form Controller

   Intended for:
   - Contact
   - Correction Request
   - Copyright Request
   - Other SalimGPT forms marked with data attributes

   Features:
   - Accessible client-side validation
   - Required field validation
   - Email / URL validation
   - Min / max length validation
   - Radio / checkbox validation
   - File type / file-size validation
   - Inline error messages
   - Form-level status messages
   - Character counters
   - Input trimming
   - Error summary support
   - Submit-state handling
   - Reset handling
   - Browser autofill friendly
   - IME friendly
   - Prevents fake submission when no real endpoint exists
   - Does not invent or assume a backend
   - Public SalimGPTForms API

   No external dependencies.
   ========================================================= */

(() => {

  /* =======================================================
     CONFIG
     ======================================================= */

  const FORM_SELECTOR = [
    "form[data-salimgpt-form]",
    "form[data-form-type]",
    ".contact-form",
    ".correction-form",
    ".copyright-form",
    "#contactForm",
    "#correctionForm",
    "#copyrightForm"
  ].join(",");


  const FIELD_SELECTOR = [
    "input",
    "textarea",
    "select"
  ].join(",");


  const DEFAULT_MAX_FILE_SIZE =
    10 * 1024 * 1024;


  const EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  /* =======================================================
     STATE
     ======================================================= */

  const controllers = [];


  let initialized =
    false;


  /* =======================================================
     DOCUMENT
     ======================================================= */

  const html =
    document.documentElement;


  /* =======================================================
     HELPERS
     ======================================================= */

  const normalizeWhitespace = (
    value
  ) => {
    return String(
      value || ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  };


  const escapeSelector = (
    value
  ) => {
    if (
      window.CSS &&
      typeof window.CSS.escape ===
        "function"
    ) {
      return window.CSS.escape(
        String(value)
      );
    }


    return String(value)
      .replace(
        /(["'\\.#:[\](){}+~*>^$|=])/g,
        "\\$1"
      );
  };


  const createId = (
    prefix = "field"
  ) => {
    createId.counter += 1;


    return (
      `${prefix}-${createId.counter}`
    );
  };


  createId.counter = 0;


  /* =======================================================
     FIND FORM STATUS
     ======================================================= */

  const findStatusElement = (
    form
  ) => {
    const explicitId =
      form.getAttribute(
        "data-status-id"
      );


    if (explicitId) {
      const explicit =
        document.getElementById(
          explicitId
        );


      if (explicit) {
        return explicit;
      }
    }


    return (
      form.querySelector(
        [
          "[data-form-status]",
          ".form-status",
          ".contact-form-status",
          ".correction-form-status",
          ".copyright-form-status"
        ].join(",")
      ) ||
      null
    );
  };


  /* =======================================================
     FIND ERROR SUMMARY
     ======================================================= */

  const findErrorSummary = (
    form
  ) => {
    return (
      form.querySelector(
        [
          "[data-form-errors]",
          ".form-error-summary"
        ].join(",")
      ) ||
      null
    );
  };


  /* =======================================================
     FIELD LABEL
     ======================================================= */

  const getFieldLabel = (
    field
  ) => {
    if (!field) {
      return "This field";
    }


    const ariaLabel =
      normalizeWhitespace(
        field.getAttribute(
          "aria-label"
        )
      );


    if (ariaLabel) {
      return ariaLabel;
    }


    const labelledBy =
      field.getAttribute(
        "aria-labelledby"
      );


    if (labelledBy) {
      const text =
        labelledBy
          .split(/\s+/)
          .map(
            (id) => {
              const element =
                document.getElementById(
                  id
                );


              return element
                ? element.textContent
                : "";
            }
          )
          .filter(Boolean)
          .join(" ");


      if (
        normalizeWhitespace(
          text
        )
      ) {
        return normalizeWhitespace(
          text
        );
      }
    }


    if (field.id) {
      const label =
        document.querySelector(
          `label[for="${escapeSelector(field.id)}"]`
        );


      if (label) {
        const clone =
          label.cloneNode(
            true
          );


        clone
          .querySelectorAll(
            [
              ".required-mark",
              ".optional-label",
              "[aria-hidden='true']"
            ].join(",")
          )
          .forEach(
            (element) => {
              element.remove();
            }
          );


        const labelText =
          normalizeWhitespace(
            clone.textContent
          );


        if (labelText) {
          return labelText;
        }
      }
    }


    const wrappingLabel =
      field.closest(
        "label"
      );


    if (wrappingLabel) {
      const labelText =
        normalizeWhitespace(
          wrappingLabel.textContent
        );


      if (labelText) {
        return labelText;
      }
    }


    const placeholder =
      normalizeWhitespace(
        field.getAttribute(
          "placeholder"
        )
      );


    if (placeholder) {
      return placeholder;
    }


    const name =
      normalizeWhitespace(
        field.name
      );


    if (name) {
      return name
        .replace(
          /[_-]+/g,
          " "
        )
        .replace(
          /\b\w/g,
          (character) =>
            character.toUpperCase()
        );
    }


    return "This field";
  };


  /* =======================================================
     FIELD WRAPPER
     ======================================================= */

  const getFieldWrapper = (
    field
  ) => {
    return (
      field.closest(
        [
          ".form-field",
          ".field",
          ".input-group",
          ".form-group",
          ".contact-field",
          ".correction-field",
          ".copyright-field"
        ].join(",")
      ) ||
      field.parentElement
    );
  };


  /* =======================================================
     FIELD ERROR ELEMENT
     ======================================================= */

  const getErrorElement = (
    field,
    create = true
  ) => {
    if (!field.id) {
      field.id =
        createId(
          "salimgpt-field"
        );
    }


    const existingId =
      field.getAttribute(
        "data-error-id"
      );


    if (existingId) {
      const existing =
        document.getElementById(
          existingId
        );


      if (existing) {
        return existing;
      }
    }


    const wrapper =
      getFieldWrapper(
        field
      );


    if (wrapper) {
      const existing =
        wrapper.querySelector(
          [
            "[data-field-error]",
            ".field-error",
            ".form-field-error"
          ].join(",")
        );


      if (existing) {
        if (!existing.id) {
          existing.id =
            `${field.id}-error`;
        }


        field.setAttribute(
          "data-error-id",
          existing.id
        );


        return existing;
      }
    }


    if (!create) {
      return null;
    }


    const error =
      document.createElement(
        "p"
      );


    error.id =
      `${field.id}-error`;


    error.className =
      "form-field-error";


    error.setAttribute(
      "data-field-error",
      ""
    );


    error.setAttribute(
      "role",
      "alert"
    );


    error.hidden =
      true;


    if (wrapper) {
      wrapper.appendChild(
        error
      );
    } else {
      field.insertAdjacentElement(
        "afterend",
        error
      );
    }


    field.setAttribute(
      "data-error-id",
      error.id
    );


    return error;
  };


  /* =======================================================
     ADD DESCRIBEDBY
     ======================================================= */

  const addDescribedBy = (
    field,
    id
  ) => {
    if (
      !field ||
      !id
    ) {
      return;
    }


    const ids =
      (
        field.getAttribute(
          "aria-describedby"
        ) || ""
      )
        .split(/\s+/)
        .filter(Boolean);


    if (
      !ids.includes(id)
    ) {
      ids.push(id);
    }


    field.setAttribute(
      "aria-describedby",
      ids.join(" ")
    );
  };


  /* =======================================================
     REMOVE DESCRIBEDBY
     ======================================================= */

  const removeDescribedBy = (
    field,
    id
  ) => {
    if (
      !field ||
      !id
    ) {
      return;
    }


    const ids =
      (
        field.getAttribute(
          "aria-describedby"
        ) || ""
      )
        .split(/\s+/)
        .filter(
          (value) =>
            value &&
            value !== id
        );


    if (ids.length) {
      field.setAttribute(
        "aria-describedby",
        ids.join(" ")
      );
    } else {
      field.removeAttribute(
        "aria-describedby"
      );
    }
  };


  /* =======================================================
     SHOW FIELD ERROR
     ======================================================= */

  const showFieldError = (
    field,
    message
  ) => {
    const error =
      getErrorElement(
        field,
        true
      );


    error.textContent =
      message;


    error.hidden =
      false;


    field.setAttribute(
      "aria-invalid",
      "true"
    );


    field.classList.add(
      "has-error"
    );


    field.classList.remove(
      "is-valid"
    );


    const wrapper =
      getFieldWrapper(
        field
      );


    if (wrapper) {
      wrapper.classList.add(
        "has-error"
      );


      wrapper.classList.remove(
        "is-valid"
      );
    }


    addDescribedBy(
      field,
      error.id
    );
  };


  /* =======================================================
     CLEAR FIELD ERROR
     ======================================================= */

  const clearFieldError = (
    field
  ) => {
    const error =
      getErrorElement(
        field,
        false
      );


    if (error) {
      error.textContent =
        "";


      error.hidden =
        true;


      removeDescribedBy(
        field,
        error.id
      );
    }


    field.removeAttribute(
      "aria-invalid"
    );


    field.classList.remove(
      "has-error"
    );


    const wrapper =
      getFieldWrapper(
        field
      );


    if (wrapper) {
      wrapper.classList.remove(
        "has-error"
      );
    }
  };


  /* =======================================================
     MARK FIELD VALID
     ======================================================= */

  const markFieldValid = (
    field
  ) => {
    clearFieldError(
      field
    );


    if (
      field.value &&
      String(
        field.value
      ).trim()
    ) {
      field.classList.add(
        "is-valid"
      );


      const wrapper =
        getFieldWrapper(
          field
        );


      if (wrapper) {
        wrapper.classList.add(
          "is-valid"
        );
      }
    }
  };


  /* =======================================================
     FIELD VALUE
     ======================================================= */

  const getFieldValue = (
    field
  ) => {
    if (
      field.type ===
      "checkbox"
    ) {
      return field.checked
        ? field.value || "checked"
        : "";
    }


    if (
      field.type ===
      "radio"
    ) {
      if (!field.name) {
        return field.checked
          ? field.value
          : "";
      }


      const form =
        field.form;


      if (!form) {
        return "";
      }


      const checked =
        form.querySelector(
          `input[type="radio"][name="${escapeSelector(field.name)}"]:checked`
        );


      return checked
        ? checked.value
        : "";
    }


    if (
      field.type ===
      "file"
    ) {
      return field.files &&
        field.files.length
        ? "file"
        : "";
    }


    return String(
      field.value || ""
    );
  };


  /* =======================================================
     EMPTY FIELD
     ======================================================= */

  const isFieldEmpty = (
    field
  ) => {
    if (
      field.type ===
      "checkbox"
    ) {
      return !field.checked;
    }


    if (
      field.type ===
      "radio"
    ) {
      if (!field.name) {
        return !field.checked;
      }


      const form =
        field.form;


      if (!form) {
        return true;
      }


      return !form.querySelector(
        `input[type="radio"][name="${escapeSelector(field.name)}"]:checked`
      );
    }


    if (
      field.type ===
      "file"
    ) {
      return !(
        field.files &&
        field.files.length
      );
    }


    return (
      String(
        field.value || ""
      ).trim() === ""
    );
  };


  /* =======================================================
     REQUIRED
     ======================================================= */

  const isRequired = (
    field
  ) => {
    return (
      field.required ||
      field.getAttribute(
        "aria-required"
      ) === "true" ||
      field.hasAttribute(
        "data-required"
      )
    );
  };


  /* =======================================================
     URL VALIDATION
     ======================================================= */

  const isValidUrl = (
    value
  ) => {
    try {
      const parsed =
        new URL(
          value
        );


      return [
        "http:",
        "https:"
      ].includes(
        parsed.protocol
      );
    } catch {
      return false;
    }
  };


  /* =======================================================
     ACCEPT ATTRIBUTE
     ======================================================= */

  const fileMatchesAccept = (
    file,
    accept
  ) => {
    if (
      !accept ||
      !file
    ) {
      return true;
    }


    const accepted =
      accept
        .split(",")
        .map(
          (value) =>
            value
              .trim()
              .toLowerCase()
        )
        .filter(Boolean);


    if (!accepted.length) {
      return true;
    }


    const fileName =
      file.name
        .toLowerCase();


    const mimeType =
      (
        file.type || ""
      )
        .toLowerCase();


    return accepted.some(
      (rule) => {

        if (
          rule.startsWith(".")
        ) {
          return fileName.endsWith(
            rule
          );
        }


        if (
          rule.endsWith("/*")
        ) {
          return mimeType.startsWith(
            rule.slice(
              0,
              -1
            )
          );
        }


        return (
          mimeType === rule
        );
      }
    );
  };


  /* =======================================================
     MAX FILE SIZE
     ======================================================= */

  const getMaxFileSize = (
    field
  ) => {
    const explicit =
      Number(
        field.getAttribute(
          "data-max-file-size"
        )
      );


    if (
      Number.isFinite(explicit) &&
      explicit > 0
    ) {
      return explicit;
    }


    const megabytes =
      Number(
        field.getAttribute(
          "data-max-file-size-mb"
        )
      );


    if (
      Number.isFinite(megabytes) &&
      megabytes > 0
    ) {
      return (
        megabytes *
        1024 *
        1024
      );
    }


    return DEFAULT_MAX_FILE_SIZE;
  };


  /* =======================================================
     FORMAT FILE SIZE
     ======================================================= */

  const formatBytes = (
    bytes
  ) => {
    if (
      !Number.isFinite(bytes) ||
      bytes <= 0
    ) {
      return "0 MB";
    }


    const megabytes =
      bytes /
      1024 /
      1024;


    if (megabytes >= 1) {
      return (
        `${megabytes.toFixed(
          megabytes >= 10
            ? 0
            : 1
        )} MB`
      );
    }


    return (
      `${Math.ceil(
        bytes / 1024
      )} KB`
    );
  };


  /* =======================================================
     CUSTOM ERROR MESSAGE
     ======================================================= */

  const getCustomMessage = (
    field,
    type
  ) => {
    const attributeMap = {
      required:
        "data-error-required",

      email:
        "data-error-email",

      url:
        "data-error-url",

      minLength:
        "data-error-minlength",

      maxLength:
        "data-error-maxlength",

      pattern:
        "data-error-pattern",

      fileType:
        "data-error-file-type",

      fileSize:
        "data-error-file-size",

      mismatch:
        "data-error-mismatch"
    };


    const attribute =
      attributeMap[type];


    if (!attribute) {
      return "";
    }


    return normalizeWhitespace(
      field.getAttribute(
        attribute
      )
    );
  };


  /* =======================================================
     VALIDATE FILE
     ======================================================= */

  const validateFileField = (
    field
  ) => {
    if (
      !field.files ||
      !field.files.length
    ) {
      return "";
    }


    const accept =
      field.getAttribute(
        "accept"
      ) || "";


    const maxSize =
      getMaxFileSize(
        field
      );


    for (
      const file
      of Array.from(
        field.files
      )
    ) {
      if (
        accept &&
        !fileMatchesAccept(
          file,
          accept
        )
      ) {
        return (
          getCustomMessage(
            field,
            "fileType"
          ) ||
          `Please choose a supported file type for ${getFieldLabel(field)}.`
        );
      }


      if (
        file.size >
        maxSize
      ) {
        return (
          getCustomMessage(
            field,
            "fileSize"
          ) ||
          `Each file must be ${formatBytes(maxSize)} or smaller.`
        );
      }
    }


    return "";
  };


  /* =======================================================
     MATCH FIELD VALIDATION
     ======================================================= */

  const validateMatchingField = (
    field
  ) => {
    const targetName =
      field.getAttribute(
        "data-match-field"
      );


    if (!targetName) {
      return "";
    }


    const form =
      field.form;


    if (!form) {
      return "";
    }


    const target =
      form.querySelector(
        `[name="${escapeSelector(targetName)}"]`
      );


    if (!target) {
      return "";
    }


    if (
      String(
        field.value || ""
      ) !==
      String(
        target.value || ""
      )
    ) {
      return (
        getCustomMessage(
          field,
          "mismatch"
        ) ||
        `${getFieldLabel(field)} does not match.`
      );
    }


    return "";
  };


  /* =======================================================
     VALIDATE FIELD
     ======================================================= */

  const validateField = (
    field,
    {
      showError = true
    } = {}
  ) => {
    if (
      !field ||
      field.disabled ||
      field.type === "hidden" ||
      field.hasAttribute(
        "data-skip-validation"
      )
    ) {
      return {
        valid: true,
        message: ""
      };
    }


    const label =
      getFieldLabel(
        field
      );


    const value =
      getFieldValue(
        field
      );


    const trimmedValue =
      typeof value === "string"
        ? value.trim()
        : value;


    let message =
      "";


    /* -----------------------------------------------------
       Required
       ----------------------------------------------------- */

    if (
      isRequired(field) &&
      isFieldEmpty(field)
    ) {
      message =
        getCustomMessage(
          field,
          "required"
        ) ||
        `${label} is required.`;
    }


    /* -----------------------------------------------------
       Email
       ----------------------------------------------------- */

    if (
      !message &&
      trimmedValue &&
      field.type ===
        "email" &&
      !EMAIL_PATTERN.test(
        trimmedValue
      )
    ) {
      message =
        getCustomMessage(
          field,
          "email"
        ) ||
        "Enter a valid email address.";
    }


    /* -----------------------------------------------------
       URL
       ----------------------------------------------------- */

    if (
      !message &&
      trimmedValue &&
      field.type ===
        "url" &&
      !isValidUrl(
        trimmedValue
      )
    ) {
      message =
        getCustomMessage(
          field,
          "url"
        ) ||
        "Enter a valid web address.";
    }


    /* -----------------------------------------------------
       Minimum length
       ----------------------------------------------------- */

    if (
      !message &&
      trimmedValue &&
      field.minLength > 0 &&
      trimmedValue.length <
        field.minLength
    ) {
      message =
        getCustomMessage(
          field,
          "minLength"
        ) ||
        `${label} must contain at least ${field.minLength} characters.`;
    }


    /* -----------------------------------------------------
       Maximum length
       ----------------------------------------------------- */

    if (
      !message &&
      typeof field.maxLength ===
        "number" &&
      field.maxLength > 0 &&
      trimmedValue &&
      trimmedValue.length >
        field.maxLength
    ) {
      message =
        getCustomMessage(
          field,
          "maxLength"
        ) ||
        `${label} must not exceed ${field.maxLength} characters.`;
    }


    /* -----------------------------------------------------
       Pattern
       ----------------------------------------------------- */

    if (
      !message &&
      trimmedValue &&
      field.pattern
    ) {
      try {
        const pattern =
          new RegExp(
            `^(?:${field.pattern})$`
          );


        if (
          !pattern.test(
            trimmedValue
          )
        ) {
          message =
            getCustomMessage(
              field,
              "pattern"
            ) ||
            `${label} is not in the expected format.`;
        }
      } catch {
        /*
         * Invalid HTML pattern syntax is ignored here.
         */
      }
    }


    /* -----------------------------------------------------
       Number constraints
       ----------------------------------------------------- */

    if (
      !message &&
      trimmedValue &&
      [
        "number",
        "range"
      ].includes(
        field.type
      )
    ) {
      const numeric =
        Number(
          trimmedValue
        );


      if (
        Number.isFinite(numeric)
      ) {
        if (
          field.min !== "" &&
          numeric <
            Number(field.min)
        ) {
          message =
            `${label} must be at least ${field.min}.`;
        }


        if (
          !message &&
          field.max !== "" &&
          numeric >
            Number(field.max)
        ) {
          message =
            `${label} must be no more than ${field.max}.`;
        }
      }
    }


    /* -----------------------------------------------------
       File
       ----------------------------------------------------- */

    if (
      !message &&
      field.type ===
        "file"
    ) {
      message =
        validateFileField(
          field
        );
    }


    /* -----------------------------------------------------
       Match another field
       ----------------------------------------------------- */

    if (!message) {
      message =
        validateMatchingField(
          field
        );
    }


    const valid =
      !message;


    if (showError) {
      if (valid) {
        markFieldValid(
          field
        );
      } else {
        showFieldError(
          field,
          message
        );
      }
    }


    return {
      valid,
      message
    };
  };


  /* =======================================================
     UNIQUE RADIO GROUPS
     ======================================================= */

  const getValidationFields = (
    form
  ) => {
    const rawFields =
      Array.from(
        form.querySelectorAll(
          FIELD_SELECTOR
        )
      );


    const seenRadioNames =
      new Set();


    return rawFields.filter(
      (field) => {
        if (
          field.type !==
          "radio"
        ) {
          return true;
        }


        if (!field.name) {
          return true;
        }


        if (
          seenRadioNames.has(
            field.name
          )
        ) {
          return false;
        }


        seenRadioNames.add(
          field.name
        );


        return true;
      }
    );
  };


  /* =======================================================
     VALIDATE FORM
     ======================================================= */

  const validateForm = (
    controller,
    {
      focusFirstError = true
    } = {}
  ) => {
    const fields =
      getValidationFields(
        controller.form
      );


    const errors = [];


    fields.forEach(
      (field) => {
        const result =
          validateField(
            field
          );


        if (!result.valid) {
          errors.push({
            field,
            message:
              result.message
          });
        }
      }
    );


    updateErrorSummary(
      controller,
      errors
    );


    if (
      errors.length &&
      focusFirstError
    ) {
      const first =
        errors[0].field;


      try {
        first.focus({
          preventScroll: false
        });
      } catch {
        first.focus();
      }
    }


    return {
      valid:
        errors.length === 0,

      errors
    };
  };


  /* =======================================================
     ERROR SUMMARY
     ======================================================= */

  const updateErrorSummary = (
    controller,
    errors
  ) => {
    const summary =
      controller.errorSummary;


    if (!summary) {
      return;
    }


    summary.innerHTML =
      "";


    if (!errors.length) {
      summary.hidden =
        true;


      summary.setAttribute(
        "aria-hidden",
        "true"
      );


      return;
    }


    const title =
      document.createElement(
        "p"
      );


    title.className =
      "form-error-summary-title";


    title.textContent =
      errors.length === 1
        ? "Please correct the following field:"
        : "Please correct the following fields:";


    const list =
      document.createElement(
        "ul"
      );


    errors.forEach(
      ({
        field,
        message
      }) => {
        const item =
          document.createElement(
            "li"
          );


        const link =
          document.createElement(
            "a"
          );


        if (!field.id) {
          field.id =
            createId(
              "salimgpt-field"
            );
        }


        link.href =
          `#${field.id}`;


        link.textContent =
          message;


        link.addEventListener(
          "click",
          (event) => {
            event.preventDefault();


            field.focus();


            field.scrollIntoView({
              behavior:
                prefersReducedMotion()
                  ? "auto"
                  : "smooth",

              block:
                "center"
            });
          }
        );


        item.appendChild(
          link
        );


        list.appendChild(
          item
        );
      }
    );


    summary.appendChild(
      title
    );


    summary.appendChild(
      list
    );


    summary.hidden =
      false;


    summary.setAttribute(
      "aria-hidden",
      "false"
    );
  };


  /* =======================================================
     REDUCED MOTION
     ======================================================= */

  const prefersReducedMotion =
    () => {
      return Boolean(
        window.matchMedia &&
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
      );
    };


  /* =======================================================
     STATUS
     ======================================================= */

  const setFormStatus = (
    controller,
    {
      type = "info",
      message = ""
    } = {}
  ) => {
    const status =
      controller.status;


    if (!status) {
      return;
    }


    status.textContent =
      message;


    status.dataset.status =
      type;


    status.classList.remove(
      "is-info",
      "is-success",
      "is-error",
      "is-warning"
    );


    if (message) {
      status.classList.add(
        `is-${type}`
      );


      status.hidden =
        false;


      status.setAttribute(
        "aria-hidden",
        "false"
      );
    } else {
      status.hidden =
        true;


      status.setAttribute(
        "aria-hidden",
        "true"
      );
    }
  };


  /* =======================================================
     REAL SUBMISSION TARGET
     ======================================================= */

  const getFormAction = (
    form
  ) => {
    const rawAction =
      normalizeWhitespace(
        form.getAttribute(
          "action"
        )
      );


    if (
      !rawAction ||
      rawAction === "#" ||
      rawAction.toLowerCase() ===
        "javascript:void(0)" ||
      rawAction.toLowerCase() ===
        "javascript:void(0);"
    ) {
      return "";
    }


    return rawAction;
  };


  /* =======================================================
     FORM SUBMISSION MODE
     ======================================================= */

  const getSubmissionMode = (
    form
  ) => {
    const explicit =
      normalizeWhitespace(
        form.getAttribute(
          "data-submit-mode"
        )
      )
        .toLowerCase();


    if (
      [
        "native",
        "disabled",
        "none"
      ].includes(
        explicit
      )
    ) {
      return explicit;
    }


    const action =
      getFormAction(
        form
      );


    return action
      ? "native"
      : "disabled";
  };


  /* =======================================================
     SUBMIT BUTTONS
     ======================================================= */

  const getSubmitButtons = (
    form
  ) => {
    return Array.from(
      form.querySelectorAll(
        [
          'button[type="submit"]',
          'input[type="submit"]'
        ].join(",")
      )
    );
  };


  /* =======================================================
     SET SUBMITTING STATE
     ======================================================= */

  const setSubmitting = (
    controller,
    submitting
  ) => {
    controller.submitting =
      Boolean(
        submitting
      );


    controller.form.classList.toggle(
      "is-submitting",
      controller.submitting
    );


    controller.form.setAttribute(
      "aria-busy",
      controller.submitting
        ? "true"
        : "false"
    );


    controller.submitButtons.forEach(
      (button) => {
        button.disabled =
          controller.submitting;


        if (
          controller.submitting
        ) {
          if (
            !button.dataset.originalText
          ) {
            button.dataset.originalText =
              button.tagName === "INPUT"
                ? button.value
                : button.textContent;
          }


          const submittingText =
            button.getAttribute(
              "data-submitting-text"
            );


          if (submittingText) {
            if (
              button.tagName ===
              "INPUT"
            ) {
              button.value =
                submittingText;
            } else {
              button.textContent =
                submittingText;
            }
          }
        } else if (
          button.dataset.originalText
        ) {
          if (
            button.tagName ===
            "INPUT"
          ) {
            button.value =
              button.dataset.originalText;
          } else {
            button.textContent =
              button.dataset.originalText;
          }
        }
      }
    );
  };


  /* =======================================================
     TRIM TEXT FIELDS
     ======================================================= */

  const trimField = (
    field
  ) => {
    if (
      !field ||
      ![
        "text",
        "email",
        "url",
        "tel",
        "search"
      ].includes(
        field.type
      )
    ) {
      return;
    }


    field.value =
      String(
        field.value || ""
      ).trim();
  };


  /* =======================================================
     CHARACTER COUNTER
     ======================================================= */

  const findCounter = (
    field
  ) => {
    const counterId =
      field.getAttribute(
        "data-character-counter"
      );


    if (counterId) {
      return document.getElementById(
        counterId
      );
    }


    const wrapper =
      getFieldWrapper(
        field
      );


    if (!wrapper) {
      return null;
    }


    return wrapper.querySelector(
      [
        "[data-character-count]",
        ".character-count",
        ".form-character-count"
      ].join(",")
    );
  };


  /* =======================================================
     UPDATE CHARACTER COUNTER
     ======================================================= */

  const updateCharacterCounter = (
    field
  ) => {
    const counter =
      findCounter(
        field
      );


    if (!counter) {
      return;
    }


    const current =
      String(
        field.value || ""
      ).length;


    const max =
      field.maxLength > 0
        ? field.maxLength
        : Number(
            field.getAttribute(
              "data-maxlength"
            )
          );


    if (
      Number.isFinite(max) &&
      max > 0
    ) {
      counter.textContent =
        `${current} / ${max}`;


      counter.setAttribute(
        "aria-label",
        `${current} of ${max} characters used`
      );


      counter.classList.toggle(
        "is-near-limit",
        current >=
          max * 0.9
      );


      counter.classList.toggle(
        "is-at-limit",
        current >= max
      );
    } else {
      counter.textContent =
        `${current}`;


      counter.setAttribute(
        "aria-label",
        `${current} characters`
      );
    }
  };


  /* =======================================================
     FILE NAME DISPLAY
     ======================================================= */

  const updateFileDisplay = (
    field
  ) => {
    if (
      field.type !==
      "file"
    ) {
      return;
    }


    const wrapper =
      getFieldWrapper(
        field
      );


    if (!wrapper) {
      return;
    }


    const display =
      wrapper.querySelector(
        [
          "[data-file-name]",
          ".file-name",
          ".selected-file-name"
        ].join(",")
      );


    if (!display) {
      return;
    }


    const files =
      Array.from(
        field.files || []
      );


    if (!files.length) {
      display.textContent =
        field.getAttribute(
          "data-empty-file-text"
        ) ||
        "No file selected";


      return;
    }


    if (
      files.length === 1
    ) {
      display.textContent =
        files[0].name;


      return;
    }


    display.textContent =
      `${files.length} files selected`;
  };


  /* =======================================================
     FIELD INPUT
     ======================================================= */

  const handleFieldInput = (
    field
  ) => {
    updateCharacterCounter(
      field
    );


    /*
     * Once a field has already shown an error,
     * validate live while the user corrects it.
     */
    if (
      field.classList.contains(
        "has-error"
      ) ||
      field.getAttribute(
        "aria-invalid"
      ) === "true"
    ) {
      validateField(
        field
      );
    }
  };


  /* =======================================================
     FIELD CHANGE
     ======================================================= */

  const handleFieldChange = (
    field
  ) => {
    updateFileDisplay(
      field
    );


    validateField(
      field
    );


    /*
     * Radio buttons share validation by name.
     */
    if (
      field.type ===
        "radio" &&
      field.name &&
      field.form
    ) {
      const radios =
        field.form.querySelectorAll(
          `input[type="radio"][name="${escapeSelector(field.name)}"]`
        );


      radios.forEach(
        (radio) => {
          if (
            radio !== field
          ) {
            clearFieldError(
              radio
            );
          }
        }
      );
    }
  };


  /* =======================================================
     FIELD BLUR
     ======================================================= */

  const handleFieldBlur = (
    field
  ) => {
    trimField(
      field
    );


    validateField(
      field
    );


    updateCharacterCounter(
      field
    );
  };


  /* =======================================================
     CLEAR FORM ERRORS
     ======================================================= */

  const clearFormErrors = (
    controller
  ) => {
    getValidationFields(
      controller.form
    )
      .forEach(
        (field) => {
          clearFieldError(
            field
          );


          field.classList.remove(
            "is-valid"
          );


          const wrapper =
            getFieldWrapper(
              field
            );


          if (wrapper) {
            wrapper.classList.remove(
              "is-valid"
            );
          }
        }
      );


    updateErrorSummary(
      controller,
      []
    );
  };


  /* =======================================================
     SUBMIT
     ======================================================= */

  const handleSubmit = (
    event,
    controller
  ) => {
    if (
      controller.submitting
    ) {
      event.preventDefault();

      return;
    }


    const validation =
      validateForm(
        controller
      );


    if (!validation.valid) {
      event.preventDefault();


      setFormStatus(
        controller,
        {
          type:
            "error",

          message:
            validation.errors.length === 1
              ? "Please correct the highlighted field before continuing."
              : `Please correct the ${validation.errors.length} highlighted fields before continuing.`
        }
      );


      controller.form.classList.add(
        "has-validation-errors"
      );


      return;
    }


    controller.form.classList.remove(
      "has-validation-errors"
    );


    const mode =
      getSubmissionMode(
        controller.form
      );


    if (
      mode === "disabled" ||
      mode === "none"
    ) {
      event.preventDefault();


      setSubmitting(
        controller,
        false
      );


      setFormStatus(
        controller,
        {
          type:
            "warning",

          message:
            controller.form.getAttribute(
              "data-unavailable-message"
            ) ||
            "Online submission is not connected for this form yet. Please use the published SalimGPT contact or request method when one is available."
        }
      );


      try {
        document.dispatchEvent(
          new CustomEvent(
            "salimgpt:form-unavailable",
            {
              detail: {
                form:
                  controller.form,

                type:
                  controller.type
              }
            }
          )
        );
      } catch {
        /* No action required. */
      }


      return;
    }


    /*
     * A real action is configured.
     *
     * Do not replace it with a fabricated API request.
     * Allow the browser's native form submission.
     */
    setSubmitting(
      controller,
      true
    );


    setFormStatus(
      controller,
      {
        type:
          "info",

        message:
          controller.form.getAttribute(
            "data-submitting-message"
          ) ||
          "Preparing your submission…"
      }
    );


    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:form-submit",
          {
            detail: {
              form:
                controller.form,

              type:
                controller.type
            }
          }
        )
      );
    } catch {
      /* No action required. */
    }
  };


  /* =======================================================
     RESET
     ======================================================= */

  const handleReset = (
    controller
  ) => {
    window.setTimeout(
      () => {
        clearFormErrors(
          controller
        );


        setFormStatus(
          controller,
          {
            message: ""
          }
        );


        setSubmitting(
          controller,
          false
        );


        controller.fields.forEach(
          (field) => {
            updateCharacterCounter(
              field
            );


            updateFileDisplay(
              field
            );
          }
        );


        controller.form.classList.remove(
          "has-validation-errors"
        );
      },
      0
    );
  };


  /* =======================================================
     DETERMINE FORM TYPE
     ======================================================= */

  const getFormType = (
    form
  ) => {
    const explicit =
      normalizeWhitespace(
        form.getAttribute(
          "data-form-type"
        )
      );


    if (explicit) {
      return explicit;
    }


    if (
      form.matches(
        "#contactForm, .contact-form"
      )
    ) {
      return "contact";
    }


    if (
      form.matches(
        "#correctionForm, .correction-form"
      )
    ) {
      return "correction";
    }


    if (
      form.matches(
        "#copyrightForm, .copyright-form"
      )
    ) {
      return "copyright";
    }


    return "general";
  };


  /* =======================================================
     PREPARE FIELD
     ======================================================= */

  const prepareField = (
    field
  ) => {
    if (
      !field.id &&
      field.type !== "hidden"
    ) {
      field.id =
        createId(
          "salimgpt-field"
        );
    }


    if (
      isRequired(
        field
      )
    ) {
      field.setAttribute(
        "aria-required",
        "true"
      );
    }


    if (
      field.type ===
      "email"
    ) {
      field.setAttribute(
        "autocomplete",
        field.getAttribute(
          "autocomplete"
        ) ||
        "email"
      );


      field.setAttribute(
        "inputmode",
        "email"
      );
    }


    if (
      field.type ===
      "url"
    ) {
      field.setAttribute(
        "inputmode",
        "url"
      );
    }


    if (
      field.type ===
      "tel"
    ) {
      field.setAttribute(
        "inputmode",
        "tel"
      );
    }


    updateCharacterCounter(
      field
    );


    updateFileDisplay(
      field
    );
  };


  /* =======================================================
     CREATE CONTROLLER
     ======================================================= */

  const createController = (
    form,
    index
  ) => {
    const fields =
      Array.from(
        form.querySelectorAll(
          FIELD_SELECTOR
        )
      );


    return {
      id:
        form.id ||
        `salimgpt-form-${index + 1}`,

      form,

      type:
        getFormType(
          form
        ),

      fields,

      status:
        findStatusElement(
          form
        ),

      errorSummary:
        findErrorSummary(
          form
        ),

      submitButtons:
        getSubmitButtons(
          form
        ),

      submitting:
        false
    };
  };


  /* =======================================================
     INITIALIZE CONTROLLER
     ======================================================= */

  const initializeController = (
    controller
  ) => {
    const {
      form,
      fields
    } =
      controller;


    if (!form.id) {
      form.id =
        controller.id;
    }


    /*
     * Disable native browser bubbles because this script
     * provides accessible inline messages instead.
     */
    form.setAttribute(
      "novalidate",
      ""
    );


    form.dataset.formReady =
      "true";


    form.dataset.formType =
      controller.type;


    form.dataset.submitMode =
      getSubmissionMode(
        form
      );


    fields.forEach(
      (field) => {
        prepareField(
          field
        );


        field.addEventListener(
          "input",
          () => {
            handleFieldInput(
              field
            );
          }
        );


        field.addEventListener(
          "change",
          () => {
            handleFieldChange(
              field
            );
          }
        );


        field.addEventListener(
          "blur",
          () => {
            handleFieldBlur(
              field
            );
          }
        );
      }
    );


    form.addEventListener(
      "submit",
      (event) => {
        handleSubmit(
          event,
          controller
        );
      }
    );


    form.addEventListener(
      "reset",
      () => {
        handleReset(
          controller
        );
      }
    );


    if (
      controller.status
    ) {
      controller.status.setAttribute(
        "aria-live",
        controller.status.getAttribute(
          "aria-live"
        ) ||
        "polite"
      );


      controller.status.setAttribute(
        "aria-atomic",
        "true"
      );
    }


    if (
      controller.errorSummary
    ) {
      controller.errorSummary.setAttribute(
        "role",
        "alert"
      );


      controller.errorSummary.setAttribute(
        "aria-live",
        "assertive"
      );


      controller.errorSummary.setAttribute(
        "aria-atomic",
        "true"
      );


      if (
        !controller.errorSummary.textContent.trim()
      ) {
        controller.errorSummary.hidden =
          true;
      }
    }
  };


  /* =======================================================
     DISCOVER FORMS
     ======================================================= */

  const discoverForms = () => {
    return Array.from(
      document.querySelectorAll(
        FORM_SELECTOR
      )
    );
  };


  /* =======================================================
     FIND CONTROLLER
     ======================================================= */

  const getController = (
    formOrId
  ) => {
    let form =
      formOrId;


    if (
      typeof formOrId ===
      "string"
    ) {
      form =
        document.getElementById(
          formOrId
        );
    }


    return (
      controllers.find(
        (controller) =>
          controller.form === form
      ) ||
      null
    );
  };


  /* =======================================================
     REFRESH
     ======================================================= */

  const refresh = () => {
    const forms =
      discoverForms();


    forms.forEach(
      (
        form,
        index
      ) => {
        const existing =
          getController(
            form
          );


        if (existing) {
          existing.fields =
            Array.from(
              form.querySelectorAll(
                FIELD_SELECTOR
              )
            );


          existing.fields.forEach(
            prepareField
          );


          return;
        }


        const controller =
          createController(
            form,
            controllers.length + index
          );


        controllers.push(
          controller
        );


        initializeController(
          controller
        );
      }
    );


    html.dataset.formsReady =
      "true";


    html.dataset.formsCount =
      String(
        controllers.length
      );


    return controllers;
  };


  /* =======================================================
     READY EVENT
     ======================================================= */

  const dispatchReadyEvent = () => {
    try {
      document.dispatchEvent(
        new CustomEvent(
          "salimgpt:forms-ready",
          {
            detail: {
              count:
                controllers.length,

              types:
                controllers.map(
                  (controller) =>
                    controller.type
                )
            }
          }
        )
      );
    } catch {
      /* No action required. */
    }
  };


  /* =======================================================
     INITIALIZE
     ======================================================= */

  const initialize = () => {
    if (initialized) {
      refresh();

      return;
    }


    initialized =
      true;


    refresh();


    dispatchReadyEvent();
  };


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.SalimGPTForms = {

    initialize() {
      initialize();
    },


    refresh() {
      return refresh();
    },


    getForms() {
      return controllers.map(
        (controller) =>
          controller.form
      );
    },


    getController(
      formOrId
    ) {
      return getController(
        formOrId
      );
    },


    validate(
      formOrId,
      options = {}
    ) {
      const controller =
        getController(
          formOrId
        );


      if (!controller) {
        return {
          valid: false,
          errors: []
        };
      }


      return validateForm(
        controller,
        options
      );
    },


    validateField(
      field,
      options = {}
    ) {
      return validateField(
        field,
        options
      );
    },


    clearErrors(
      formOrId
    ) {
      const controller =
        getController(
          formOrId
        );


      if (!controller) {
        return false;
      }


      clearFormErrors(
        controller
      );


      return true;
    },


    reset(
      formOrId
    ) {
      const controller =
        getController(
          formOrId
        );


      if (!controller) {
        return false;
      }


      controller.form.reset();


      return true;
    },


    setStatus(
      formOrId,
      options
    ) {
      const controller =
        getController(
          formOrId
        );


      if (!controller) {
        return false;
      }


      setFormStatus(
        controller,
        options
      );


      return true;
    },


    getSubmissionMode(
      formOrId
    ) {
      const controller =
        getController(
          formOrId
        );


      if (!controller) {
        return "";
      }


      return getSubmissionMode(
        controller.form
      );
    },


    isConnected(
      formOrId
    ) {
      const controller =
        getController(
          formOrId
        );


      if (!controller) {
        return false;
      }


      return (
        getSubmissionMode(
          controller.form
        ) === "native"
      );
    }

  };


  /* =======================================================
     RUN
     ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      {
        once: true
      }
    );
  } else {
    initialize();
  }

})();