const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'Request failed.');
  }

  return payload?.data;
}

export function fetchSamples() {
  return request('/api/samples');
}

export function fetchReports(query = '') {
  const params = new URLSearchParams();
  if (query) {
    params.set('q', query);
  }
  params.set('limit', '8');
  return request(`/api/reports?${params.toString()}`);
}

export function analyzePayload({ mode, content, notes, file }) {
  if (mode === 'image') {
    const form = new FormData();
    form.append('kind', mode);
    form.append('notes', notes ?? '');
    if (content) {
      form.append('content', content);
    }
    if (file) {
      form.append('image', file);
    }
    return request('/api/analyze', { method: 'POST', body: form });
  }

  return request('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind: mode,
      content,
      notes
    })
  });
}

export function submitCommunityReport(report) {
  return request('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  });
}

