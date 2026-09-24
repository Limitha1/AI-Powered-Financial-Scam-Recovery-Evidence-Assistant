/**
 * ShieldTrace AI - PII & Sensitive Credential Redaction Guard
 * Enforces Zero client/server leakage of raw unmasked payment pins or credit card PANs.
 * Sanitizes unstructured text evidence before storage or LLM ingestion.
 */

export interface RedactionResult {
  redactedText: string;
  redactionsCount: number;
  detectedTypes: string[];
}

// Regex patterns for sensitive financial artifacts
const PAN_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g; // 16 digit card PANs
const CVV_REGEX = /\b(?:cvv|cvc|security code|cvv2)[\s:]*([0-9]{3,4})\b/gi;
const UPI_PIN_REGEX = /\b(?:upi pin|pin|mpin|atm pin)[\s:]*([0-9]{4,6})\b/gi;
const PASSWORD_REGEX = /\b(?:password|pwd|passcode|token)[\s:=]+([^\s,;]+)/gi;
const OTP_REGEX = /\b(?:otp|one time password)[\s:is]+([0-9]{4,8})\b/gi;

/**
 * Mask 16-digit PAN leaving only the last 4 digits visible: XXXX-XXXX-XXXX-1234
 */
function maskPAN(panStr: string): string {
  const digitsOnly = panStr.replace(/[-\s]/g, "");
  if (digitsOnly.length !== 16) return panStr;
  const last4 = digitsOnly.slice(-4);
  return `XXXX-XXXX-XXXX-${last4}`;
}

/**
 * Redacts sensitive credentials from raw text snippets
 */
export function redactSensitiveText(rawText: string): RedactionResult {
  if (!rawText || typeof rawText !== "string") {
    return { redactedText: "", redactionsCount: 0, detectedTypes: [] };
  }

  let text = rawText;
  let redactionsCount = 0;
  const detectedTypes = new Set<string>();

  // 1. Mask 16-digit PANs
  text = text.replace(PAN_REGEX, (match) => {
    redactionsCount++;
    detectedTypes.add("CARD_PAN");
    return maskPAN(match);
  });

  // 2. Redact CVV / CVC
  text = text.replace(CVV_REGEX, (match, cvv) => {
    redactionsCount++;
    detectedTypes.add("CARD_CVV");
    return match.replace(cvv, "[REDACTED_CVV]");
  });

  // 3. Redact UPI PIN / MPIN
  text = text.replace(UPI_PIN_REGEX, (match, pin) => {
    redactionsCount++;
    detectedTypes.add("UPI_PIN");
    return match.replace(pin, "[REDACTED_PIN]");
  });

  // 4. Redact Passwords / Passcodes
  text = text.replace(PASSWORD_REGEX, (match, pwd) => {
    redactionsCount++;
    detectedTypes.add("PASSWORD_TOKEN");
    return match.replace(pwd, "[REDACTED_SECRET]");
  });

  // 5. Redact OTPs
  text = text.replace(OTP_REGEX, (match, otp) => {
    redactionsCount++;
    detectedTypes.add("AUTH_OTP");
    return match.replace(otp, "[REDACTED_OTP]");
  });

  return {
    redactedText: text,
    redactionsCount,
    detectedTypes: Array.from(detectedTypes)
  };
}

/**
 * Audit check if unmasked sensitive payment data exists
 */
export function containsUnmaskedSensitiveData(text: string): boolean {
  if (!text) return false;
  return (
    PAN_REGEX.test(text) ||
    CVV_REGEX.test(text) ||
    UPI_PIN_REGEX.test(text)
  );
}
