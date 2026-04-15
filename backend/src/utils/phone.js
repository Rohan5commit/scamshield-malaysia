import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function digitsOnly(value = '') {
  return value.replace(/\D+/g, '');
}

export function looksLikePhoneNumber(value = '') {
  const digits = digitsOnly(value);
  return digits.length >= 8 && digits.length <= 15 && /[+\d]/.test(value);
}

export function normalizePhoneNumber(value = '') {
  const digits = digitsOnly(value);
  const parsed = parsePhoneNumberFromString(value, 'MY');

  if (parsed) {
    return {
      original: value,
      formatted: parsed.formatInternational(),
      normalizedDigits: digits,
      countryCode: parsed.country ?? null,
      looksMalaysian: parsed.country === 'MY' || digits.startsWith('60') || digits.startsWith('0'),
      isValid: parsed.isValid()
    };
  }

  return {
    original: value,
    formatted: value,
    normalizedDigits: digits,
    countryCode: null,
    looksMalaysian: digits.startsWith('60') || digits.startsWith('0'),
    isValid: false
  };
}

