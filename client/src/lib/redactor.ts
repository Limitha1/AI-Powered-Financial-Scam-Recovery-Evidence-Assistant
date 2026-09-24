/**
 * Client-Side PII & Credential Sanitizer
 * Masks 16-digit PANs, CVVs, and PINs before sending over the wire or to LLM.
 */

export interface ClientRedactionResult {
  redactedText: string;
  hasSensitiveData: boolean;
  maskCount: number;
}

const PAN_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
const CVV_REGEX = /\b(?:cvv|cvc|security code|cvv2)[\s:]*([0-9]{3,4})\b/gi;
const PIN_REGEX = /\b(?:upi pin|pin|mpin|atm pin)[\s:]*([0-9]{4,6})\b/gi;
const OTP_REGEX = /\b(?:otp|one time password)[\s:is]+([0-9]{4,8})\b/gi;

export function clientRedact(rawText: string): ClientRedactionResult {
  if (!rawText) {
    return { redactedText: '', hasSensitiveData: false, maskCount: 0 };
  }

  let text = rawText;
  let maskCount = 0;

  // Mask PAN
  text = text.replace(PAN_REGEX, (match) => {
    maskCount++;
    const digitsOnly = match.replace(/[-\s]/g, '');
    const last4 = digitsOnly.slice(-4);
    return `XXXX-XXXX-XXXX-${last4}`;
  });

  // Mask CVV
  text = text.replace(CVV_REGEX, (match, cvv) => {
    maskCount++;
    return match.replace(cvv, '[REDACTED_CVV]');
  });

  // Mask PIN
  text = text.replace(PIN_REGEX, (match, pin) => {
    maskCount++;
    return match.replace(pin, '[REDACTED_PIN]');
  });

  // Mask OTP
  text = text.replace(OTP_REGEX, (match, otp) => {
    maskCount++;
    return match.replace(otp, '[REDACTED_OTP]');
  });

  return {
    redactedText: text,
    hasSensitiveData: maskCount > 0,
    maskCount
  };
}
