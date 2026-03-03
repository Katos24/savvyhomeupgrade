export type TaskTemplate = { id: string; label: string; order: number };
export type Category = { value: string; label: string; emoji?: string; task_templates?: TaskTemplate[] };
export type StatusOption = { value: string; label: string; color: string };
export type CustomQuestion = { id: string; label: string; type: 'text' | 'select' | 'checkbox'; required: boolean; options?: string[] };
export type LineItem = { id: string; description: string; quantity: number; unitPrice: number; amount: number };
export type QuoteTemplate = { id: string; name: string; category: string; items: LineItem[]; total: number; notes?: string; created_at?: string; updated_at?: string };

export const LOCKED_STATUSES = ['new', 'completed'];

export const DEFAULT_STATUSES: StatusOption[] = [
  { value: 'new', label: 'New', color: 'pink' },
  { value: 'contacted', label: 'Contacted', color: 'blue' },
  { value: 'quoted', label: 'Quoted', color: 'yellow' },
  { value: 'scheduled', label: 'Scheduled', color: 'purple' },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'green' },
];

export const COLOR_OPTIONS = [
  { value: 'blue', hex: '#3b82f6' }, { value: 'yellow', hex: '#eab308' },
  { value: 'purple', hex: '#a855f7' }, { value: 'orange', hex: '#f97316' },
  { value: 'green', hex: '#22c55e' }, { value: 'red', hex: '#ef4444' },
  { value: 'gray', hex: '#6b7280' }, { value: 'indigo', hex: '#6366f1' },
  { value: 'pink', hex: '#ec4899' },
];

export const COLOR_PRESETS = [
  { name: 'Purple', c1: '#667eea', c2: '#764ba2' },
  { name: 'Blue', c1: '#2196F3', c2: '#1976D2' },
  { name: 'Green', c1: '#10b981', c2: '#059669' },
  { name: 'Orange', c1: '#f97316', c2: '#ea580c' },
  { name: 'Pink', c1: '#ec4899', c2: '#db2777' },
  { name: 'Red', c1: '#ef4444', c2: '#dc2626' },
];

export const getColorHex = (name: string) => COLOR_OPTIONS.find(c => c.value === name)?.hex || '#3b82f6';
export const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
export const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
};

export const STEPS = [
  { id: 'company', label: 'Company', icon: '🏢', desc: 'Basic info & branding' },
  { id: 'categories', label: 'Categories', icon: '🏷️', desc: 'Service types & tasks' },
  { id: 'pipeline', label: 'Pipeline', icon: '📊', desc: 'Workflow stages' },
  { id: 'form', label: 'Form', icon: '📝', desc: 'Customer questions' },
  { id: 'quotes', label: 'Quotes', icon: '💰', desc: 'Quote templates' },
  { id: 'done', label: 'Done', icon: '🎉', desc: "You're all set" },
];