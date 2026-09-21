import { useQuery } from '@tanstack/react-query';

// Defined locally rather than imported from CompanyDashboardClient — a
// cross-file import through the dynamic [company] route segment was
// failing to resolve, which silently fell back to `any` and caused a
// cascade of implicit-any errors on every .map()/.filter() touching
// stats. A local copy has no path to get wrong. If CompanyDashboardClient
// also exports a DashboardStats type, the two should be kept in sync by
// hand until they're properly unified in one shared types file.
export type DashboardStats = {
  leads: { new_this_week: number };
  estimates: { open: number; accepted: number };
  jobs: { active: number; active_value: number };
  invoices: { awaiting_payment: number; draft: number; past_due: number };
  todays_schedule: Array<{
    lead_id: number;
    project_id: number;
    customer_name: string;
    category: string | null;
    scheduled_time: string | null;
    scheduled_end_time: string | null;
    job_status: string;
    quote_total: string | number | null;
  }>;
  revenue_this_month: number;
  expenses_this_month?: number;
  ready_to_invoice: { count: number; value: number };
  recent_payments: Array<{
    id: number;
    amount: string | number;
    kind: string;
    method: string;
    paid_on: string;
    customer_name: string;
    payment_status: string | null;
    lead_id: number;
  }>;
};

async function fetchDashboardStats(companySlug: string): Promise<DashboardStats> {
  const res = await fetch(`/api/company/${companySlug}/dashboard-stats`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to load');
  if (!data.leads) throw new Error('Dashboard data is incomplete');
  return data;
}

export function useDashboardStats(companySlug: string) {
  return useQuery({
    queryKey: ['dashboardStats', companySlug],
    queryFn: () => fetchDashboardStats(companySlug),
    enabled: !!companySlug,
  });
}