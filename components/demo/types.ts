export type Task = { id: string; label: string; done: boolean };
export type QuoteItem = { id: string; description: string; quantity: number; unitPrice: number; amount: number };
export type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  category: string;
  status: string;
  created_at: string;
  address_line_1: string;
  city: string;
  zip_code: string;
  description: string;
  quote_total: string | null;
  payment_status: string;
  file_urls: string[];
  scheduled_date?: string;
  scheduled_time?: string;
  assigned_to?: string;
  ai_brief?: any;
  tasks?: Task[];
  quote_items?: QuoteItem[];
};

export const STATUS_OPTIONS = [
  { value: 'new',         label: 'New',         hex: '#3b82f6' },
  { value: 'contacted',   label: 'Contacted',   hex: '#eab308' },
  { value: 'quoted',      label: 'Quoted',      hex: '#a855f7' },
  { value: 'scheduled',   label: 'Scheduled',   hex: '#10b981' },
  { value: 'in-progress', label: 'In Progress', hex: '#f97316' },
  { value: 'completed',   label: 'Completed',   hex: '#22c55e' },
  { value: 'cancelled',   label: 'Cancelled',   hex: '#ef4444' },
];

export const fmt = (n: string | number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Number(n));

export const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};