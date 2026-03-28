import validator from "validator";

const verificationCache = new Map();
const DELIVERY_SAFE_STATUSES = new Set(["valid", "catch-all", "catchall"]);

const isStrictVerificationEnabled = () =>
  String(process.env.EMAIL_VERIFICATION_REQUIRED || "").toLowerCase() === "true";

const buildFallbackWarning = (reason) =>
  `ZeroBounce verification is unavailable (${reason}). Falling back to email format validation only.`;

const normalizeEmail = (rawEmail) => String(rawEmail ?? "").trim();

const isEmailFormatValid = (email) => validator.isEmail(email);

export const verifyEmail = async (email) => {
  if (verificationCache.has(email)) {
    return verificationCache.get(email);
  }

  const apiKey = process.env.EMAIL_VERIFY_API_KEY || process.env.ZEROBOUNCE_API_KEY;
  if (!apiKey) {
    return {
      status: "verification_unavailable",
      error: "ZeroBounce API key is not configured",
      warning: buildFallbackWarning("ZeroBounce API key is not configured"),
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const url = new URL("https://api.zerobounce.net/v2/validate");
    url.searchParams.append("api_key", apiKey);
    url.searchParams.append("email", email);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.error) {
      const serviceError = data?.error || `HTTP ${response.status}`;
      console.error(`ZeroBounce API error for ${email}:`, serviceError);
      return {
        status: "verification_unavailable",
        error: serviceError,
        warning: buildFallbackWarning(serviceError),
      };
    }

    verificationCache.set(email, data);
    return data;
  } catch (error) {
    const serviceError =
      error.name === "AbortError" ? "request timed out" : error.message;
    console.error(`Verification API error for ${email}:`, serviceError);
    return {
      status: "verification_unavailable",
      error: serviceError,
      warning: buildFallbackWarning(serviceError),
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const validateEmailList = async (emaillist = []) => {
  const invalidEmails = [];
  const validEmails = [];
  const strictVerification = isStrictVerificationEnabled();
  let verificationError = null;
  let verificationWarning = null;
  let verificationMode = "zerobounce";

  for (const rawEmail of emaillist) {
    const email = normalizeEmail(rawEmail);

    if (!email || !isEmailFormatValid(email)) {
      invalidEmails.push(email || String(rawEmail ?? ""));
      continue;
    }

    const result = await verifyEmail(email);
    const status = String(result?.status || "").toLowerCase();

    console.log("Email verification result:", { email, status, subStatus: result?.sub_status });

    if (status === "verification_unavailable") {
      verificationMode = "format_only";

      if (strictVerification) {
        verificationError = result.error || "ZeroBounce validation failed";
        break;
      }

      verificationWarning = verificationWarning || result.warning;
      validEmails.push(email);
      continue;
    }

    if (DELIVERY_SAFE_STATUSES.has(status)) {
      validEmails.push(email);
      continue;
    }

    if (status === "unknown" && !strictVerification) {
      verificationWarning =
        verificationWarning ||
        "Some emails could not be fully verified by ZeroBounce. Delivery is continuing with format-only validation for those addresses.";
      validEmails.push(email);
      continue;
    }

    invalidEmails.push(email);
  }

  console.log("Invalid emails after validation:", invalidEmails);

  return {
    validEmails,
    invalidEmails,
    verificationError,
    verificationWarning,
    verificationMode,
  };
};
