import {
  Profile,
  ProfileAnalyzeResponse,
  DiscoveryRunRequest,
  DiscoveryRunResponse,
  SavedProfileItem,
  AnalyticsOverview
} from '../types';

const BASE_URL = '';

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchProfiles(params?: { search?: string; category?: string; location?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.category) query.append('category', params.category);
  if (params?.location) query.append('location', params.location);
  if (params?.limit) query.append('limit', params.limit.toString());
  
  const res = await fetch(`${BASE_URL}/api/profiles?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch profiles');
  return (await res.json()) as Profile[];
}

export async function fetchProfileById(id: string) {
  const res = await fetch(`${BASE_URL}/api/profiles/${id}`);
  if (!res.ok) throw new Error(`Profile ${id} not found`);
  return (await res.json()) as Profile;
}

export async function analyzeProfileText(rawText: string, profileUrl?: string) {
  const res = await fetch(`${BASE_URL}/api/profiles/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_text: rawText, profile_url: profileUrl })
  });
  if (!res.ok) throw new Error('Analysis failed');
  return (await res.json()) as ProfileAnalyzeResponse;
}

export async function runDiscovery(request: DiscoveryRunRequest) {
  const res = await fetch(`${BASE_URL}/api/discovery/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!res.ok) throw new Error('Discovery failed');
  return (await res.json()) as DiscoveryRunResponse;
}

export async function fetchDiscoveryRun(runId: string) {
  const res = await fetch(`${BASE_URL}/api/discovery/${runId}`);
  if (!res.ok) throw new Error('Failed to fetch run');
  return (await res.json()) as DiscoveryRunResponse;
}

export async function fetchRecentDiscoveryRuns() {
  const res = await fetch(`${BASE_URL}/api/discovery/runs/recent`);
  if (!res.ok) throw new Error('Failed to fetch recent discovery runs');
  return (await res.json()) as Array<{
    run_id: string;
    reference_name: string;
    reference_query: string;
    status: string;
    created_at: string;
    candidates_count: number;
  }>;
}

export async function saveProfileToShortlist(profileId: string, notes: string = '') {
  const res = await fetch(`${BASE_URL}/api/profiles/${profileId}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile_id: profileId, notes })
  });
  if (!res.ok) throw new Error('Failed to save profile');
  return res.json();
}

export async function fetchSavedProfiles() {
  const res = await fetch(`${BASE_URL}/api/saved`);
  if (!res.ok) throw new Error('Failed to fetch saved profiles');
  return (await res.json()) as SavedProfileItem[];
}

export async function removeSavedProfile(profileId: string) {
  const res = await fetch(`${BASE_URL}/api/saved/${profileId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to remove saved profile');
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${BASE_URL}/api/analytics/overview`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return (await res.json()) as AnalyticsOverview;
}

export async function uploadProfilesCSV(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/api/profiles/import`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'CSV Import failed');
  }
  return res.json();
}

