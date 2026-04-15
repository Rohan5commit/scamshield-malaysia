import clsx from 'clsx';

export const MODE_OPTIONS = [
  { id: 'text', label: 'Text message', hint: 'SMS, WhatsApp, Telegram, email copy' },
  { id: 'url', label: 'Suspicious URL', hint: 'Phishing links and spoofed domains' },
  { id: 'phone', label: 'Phone number', hint: 'Authority or bank impersonation calls' },
  { id: 'image', label: 'Screenshot', hint: 'Chat captures and fake payment pages' }
];

export const IMAGE_SAMPLE_ASSETS = {
  'demo-image-wallet': {
    assetPath: '/demo/wallet-suspension.svg',
    filename: 'wallet-suspension.svg'
  },
  'demo-image-parcel': {
    assetPath: '/demo/parcel-chat.svg',
    filename: 'parcel-chat.svg'
  }
};

export function cn(...inputs) {
  return clsx(inputs);
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-MY', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

export function riskTone(score = 0) {
  if (score >= 85) {
    return {
      label: 'Critical',
      accent: 'var(--critical)',
      soft: 'var(--critical-soft)'
    };
  }

  if (score >= 65) {
    return {
      label: 'High',
      accent: 'var(--warning)',
      soft: 'var(--warning-soft)'
    };
  }

  if (score >= 40) {
    return {
      label: 'Medium',
      accent: 'var(--caution)',
      soft: 'var(--caution-soft)'
    };
  }

  return {
    label: 'Low',
    accent: 'var(--success)',
    soft: 'var(--success-soft)'
  };
}

export async function loadDemoAsset(sampleId) {
  const asset = IMAGE_SAMPLE_ASSETS[sampleId];
  if (!asset) {
    return null;
  }

  const response = await fetch(asset.assetPath);
  const blob = await response.blob();
  return new File([blob], asset.filename, { type: blob.type });
}

