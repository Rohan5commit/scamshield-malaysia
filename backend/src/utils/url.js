const SUSPICIOUS_SHORTENERS = new Set(['bit.ly', 'tinyurl.com', 't.co', 'rebrand.ly', 'cutt.ly', 'shorturl.at']);

const BRAND_HOST_ALLOWLIST = {
  maybank: ['maybank2u.com.my', 'maybank.com'],
  cimb: ['cimb.com.my', 'cimbclicks.com.my'],
  'public bank': ['publicbank.com.my'],
  rhb: ['rhbgroup.com'],
  bsn: ['mybsn.com.my', 'bsn.com.my'],
  kwsp: ['kwsp.gov.my'],
  epf: ['kwsp.gov.my'],
  'touch n go': ['tngdigital.com.my', 'touchngo.com.my'],
  tng: ['tngdigital.com.my', 'touchngo.com.my'],
  pos: ['pos.com.my'],
  kastam: ['customs.gov.my']
};

export function looksLikeUrl(value = '') {
  if (!value || value.includes(' ')) {
    return false;
  }

  try {
    new URL(withProtocol(value));
    return value.includes('.') || value.startsWith('http');
  } catch {
    return false;
  }
}

export function withProtocol(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function normalizeUrl(value = '') {
  const url = new URL(withProtocol(value.trim()));
  url.hash = '';

  const hostname = url.hostname.toLowerCase();
  const pathname = url.pathname.replace(/\/{2,}/g, '/');

  return {
    normalized: `${url.protocol}//${hostname}${pathname}${url.search}`,
    hostname,
    pathname,
    protocol: url.protocol.replace(':', ''),
    flags: {
      shortener: SUSPICIOUS_SHORTENERS.has(hostname),
      punycode: hostname.includes('xn--'),
      ipHost: /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname),
      nonHttps: url.protocol !== 'https:',
      brandSpoof: detectBrandSpoof(hostname)
    }
  };
}

function detectBrandSpoof(hostname) {
  const matchedBrands = Object.keys(BRAND_HOST_ALLOWLIST).filter((brand) => hostname.includes(brand.replace(/\s+/g, '')));

  if (matchedBrands.length === 0) {
    return null;
  }

  const spoofedBrand = matchedBrands.find((brand) => {
    const allowlist = BRAND_HOST_ALLOWLIST[brand];
    return !allowlist.some((allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`));
  });

  return spoofedBrand ?? null;
}

