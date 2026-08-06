import { 
  Wrench, 
  Zap, 
  Flame, 
  Hammer, 
  Home, 
  Car, 
  Brush, 
  Laptop, 
  FileText,
  PlusCircle,
  Phone,
  DollarSign,
  Clock,
  CheckCircle2,
  LucideIcon 
} from 'lucide-react';

export type Category = {
  value: string;
  label: string;
  emoji?: string;
};

export type BusinessType = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export type StatusOption = {
  value: string;
  label: string;
  color: string;
};

/**
 * SLIMMED BUSINESS TYPES
 */
export const BUSINESS_TYPES: BusinessType[] = [
  { value: 'hvac', label: 'HVAC', icon: Flame },
  { value: 'electrical', label: 'Electrical', icon: Zap },
  { value: 'plumbing', label: 'Plumbing', icon: Wrench },
  { value: 'roofing', label: 'Roofing', icon: Home },
  { value: 'construction', label: 'Construction', icon: Hammer },
  { value: 'home_services', label: 'Home Services', icon: Home },
  { value: 'cleaning_services', label: 'Cleaning Services', icon: Brush },
  { value: 'auto_services', label: 'Auto Services', icon: Car },
  { value: 'tech_services', label: 'Tech Services', icon: Laptop },
  { value: 'general', label: 'General Services', icon: FileText },
  { value: 'other', label: 'Other', icon: PlusCircle },
];

/* One definition of the pipeline. It was previously duplicated in the
   dashboard and in PipelineTab's fallback, which is why 33 companies hold a
   stage list that predates the automation and none of the triggers could
   find a target. Signup no longer writes it — a NULL column means new
   companies always inherit whatever this says today. */
export const DEFAULT_STATUSES = [
  { value: 'new',         label: 'New',         color: 'pink'   },
  { value: 'active',      label: 'Active',      color: 'indigo' },
  { value: 'quoted',      label: 'Quoted',      color: 'yellow' },
  { value: 'approved',    label: 'Approved',    color: 'purple' },
  { value: 'scheduled',   label: 'Scheduled',   color: 'blue'   },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed',   label: 'Completed',   color: 'green'  },
];

/** Stages with behaviour attached. Renameable, not removable. */
export const LOCKED_STAGES = DEFAULT_STATUSES.map((s) => s.value);

/** Shown in plain words on each row rather than offered as a setting. */
export const STAGE_TRIGGERS: Record<string, string> = {
  new: 'Where every new lead starts',
  active: 'Moves here when you convert a lead to a project',
  quoted: 'Moves here when you email a quote',
  approved: 'Moves here when the quote is accepted',
  scheduled: 'Moves here when you set a job date',
  'in-progress': 'You move jobs here when work starts',
  completed: 'You move jobs here when work is done',
};

export const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'gray', label: 'Gray', class: 'bg-gray-500' },
];

/**
 * ADDRESS CONFIGURATION
 */
export const ADDRESS_CONFIG: Record<string, { show: boolean; required: boolean }> = {
  hvac: { show: true, required: true },
  electrical: { show: true, required: true },
  plumbing: { show: true, required: true },
  roofing: { show: true, required: true },
  construction: { show: true, required: true },
  home_services: { show: true, required: true },
  cleaning_services: { show: true, required: true },
  auto_services: { show: true, required: false },
  tech_services: { show: false, required: false },
  general: { show: false, required: false },
  other: { show: false, required: false },
};

/**
 * CATEGORY MAP
 */
export const CATEGORY_MAP: Record<string, Category[]> = {
  hvac: [
    { value: 'ac_repair', label: 'AC Repair' },
    { value: 'ac_installation', label: 'AC Installation' },
    { value: 'furnace_repair', label: 'Furnace Repair' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Other' },
  ],
  electrical: [
    { value: 'wiring', label: 'Wiring' },
    { value: 'panel_upgrade', label: 'Panel Upgrade' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'troubleshooting', label: 'Troubleshooting' },
    { value: 'other', label: 'Other' },
  ],
  plumbing: [
    { value: 'leak_repair', label: 'Leak Repair' },
    { value: 'drain_cleaning', label: 'Drain Cleaning' },
    { value: 'water_heater', label: 'Water Heater' },
    { value: 'pipe_repair', label: 'Pipe Repair' },
    { value: 'other', label: 'Other' },
  ],
  roofing: [
    { value: 'roof_repair', label: 'Roof Repair' },
    { value: 'roof_replacement', label: 'Roof Replacement' },
    { value: 'leak_detection', label: 'Leak Detection' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'gutter_work', label: 'Gutter Work' },
    { value: 'other', label: 'Other' },
  ],
  construction: [
    { value: 'renovation', label: 'Renovation' },
    { value: 'new_build', label: 'New Construction' },
    { value: 'framing', label: 'Framing' },
    { value: 'drywall', label: 'Drywall' },
    { value: 'other', label: 'Other' },
  ],
  home_services: [
    { value: 'painting', label: 'Painting' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'pest_control', label: 'Pest Control' },
    { value: 'other', label: 'Other' },
  ],
  cleaning_services: [
    { value: 'house_cleaning', label: 'House Cleaning' },
    { value: 'deep_cleaning', label: 'Deep Cleaning' },
    { value: 'office_cleaning', label: 'Office Cleaning' },
    { value: 'other', label: 'Other' },
  ],
  auto_services: [
    { value: 'oil_change', label: 'Oil Change' },
    { value: 'brake_repair', label: 'Brake Repair' },
    { value: 'engine_repair', label: 'Engine Repair' },
    { value: 'other', label: 'Other' },
  ],
  tech_services: [
    { value: 'it_support', label: 'IT Support' },
    { value: 'web_design', label: 'Web Design' },
    { value: 'repair', label: 'Hardware Repair' },
    { value: 'other', label: 'Other' },
  ],
  general: [
    { value: 'consultation', label: 'Consultation' },
    { value: 'repair', label: 'General Repair' },
    { value: 'other', label: 'Other' },
  ],
  other: [
    { value: 'other', label: 'Other' },
  ],
};

export const DESCRIPTION_PLACEHOLDERS: Record<string, string> = {
  hvac: "e.g. AC unit stopped blowing cold air yesterday...",
  electrical: "e.g. Need a panel upgrade...",
  plumbing: "e.g. Slow drain in master bathroom...",
  roofing: "e.g. Missing shingles after storm, possible leak in attic, roof is ~15 years old and needs inspection or repair...",
  construction: "e.g. Looking to finish the basement...",
  home_services: "e.g. Full exterior repaint...",
  cleaning_services: "e.g. Deep clean of a 3BR/2BA home...",
  auto_services: "e.g. 2018 Honda Accord brake issue...",
  tech_services: "e.g. Laptop won't turn on...",
  general: "e.g. Describe what you need done...",
  other: "e.g. Describe what you need done...",
};