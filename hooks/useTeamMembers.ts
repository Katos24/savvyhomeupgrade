import { useQuery } from '@tanstack/react-query';

async function fetchTeamMembers() {
  const res = await fetch('/api/team/members');
  if (!res.ok) throw new Error('Failed to fetch team members');
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch team members');
  // allAssignees is the deduplicated combination of real users + manually
  // saved assignee names (people without logins) — the original
  // component code specifically used this list, not the plain `members`
  // array, since it's the more complete set for an "assign to" picker.
  return (data.allAssignees || []).map((name: string) => ({ id: name, name }));
}

// No companySlug needed — this endpoint derives companyId from the JWT
// cookie itself, not a query param. Company is still accepted as a
// param here only to distinguish cache entries if this hook is ever
// used across multiple companies in one session; otherwise it's unused.
export function useTeamMembers(companySlug?: string) {
  return useQuery({
    queryKey: ['teamMembers', companySlug],
    queryFn: fetchTeamMembers,
  });
}