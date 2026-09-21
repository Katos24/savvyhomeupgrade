import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// deposit_type matches the specific DepositType union already defined in
// CategoriesTaskEditorModal.tsx ('percent' | 'fixed'), not a loose
// string — this hook is consumed by Services, which relies on that
// exact type throughout CategoriesServiceCard, CategoriesPricingModal,
// etc. A generic string here would need a cast at every one of those
// call sites; matching it here needs one shared type, defined once.
export type DepositType = 'percent' | 'fixed';

export type QuoteTemplate = {
  id: string;
  category: string;
  items: any[];
  tax_rate: number;
  total: number;
  deposit_type: DepositType | null;
  deposit_value: number | null;
};

async function fetchQuoteTemplates(companySlug: string): Promise<QuoteTemplate[]> {
  const res = await fetch(`/api/company/${companySlug}/quote-templates`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to load templates');
  return data.templates;
}

// Shared by CategoriesTab.tsx (Services) and QuoteSection.tsx's "Browse
// Templates" — same company-wide list, two different screens. Both now
// read from one cache entry instead of two independent fetches.
export function useQuoteTemplates(companySlug: string) {
  return useQuery({
    queryKey: ['quoteTemplates', companySlug],
    queryFn: () => fetchQuoteTemplates(companySlug),
    enabled: !!companySlug,
  });
}

type MutationAction =
  | { action: 'create'; template: Partial<QuoteTemplate> & { id: string; category: string } }
  | { action: 'update'; template: Partial<QuoteTemplate> & { id: string } }
  | { action: 'update-many'; templates: Array<Partial<QuoteTemplate> & { id: string }> }
  | { action: 'delete'; templateId: string };

// Returns the FULL response body, not just .templates — update-many's
// caller needs .updated/.requested to detect a partial failure, which
// would be lost if this only returned the template array.
async function mutateQuoteTemplates(companySlug: string, body: MutationAction) {
  const res = await fetch(`/api/company/${companySlug}/quote-templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Request failed');
  return data;
}

// Single hook covers all four write actions — every one of them already
// returns the complete, fresh template list in its response, so success
// writes that list directly into the cache (setQueryData) instead of
// triggering a second round-trip refetch. Any component calling either
// useQuoteTemplates or this mutation for the same companySlug sees the
// update immediately, without needing its own local state.
export function useQuoteTemplateMutation(companySlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: MutationAction) => mutateQuoteTemplates(companySlug, body),
    onSuccess: (data) => {
      queryClient.setQueryData(['quoteTemplates', companySlug], data.templates);
    },
  });
}