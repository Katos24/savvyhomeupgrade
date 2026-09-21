import { useQuery } from '@tanstack/react-query';

async function fetchCurrentUser() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) throw new Error('Failed to fetch current user');
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Not authenticated');
  return data.user;
}

// The key ['currentUser'] is what React Query uses to dedupe and cache —
// any component calling this hook shares the SAME cached result, so
// Dashboard and Leads no longer each fire their own independent request
// for identical data.
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
  });
}