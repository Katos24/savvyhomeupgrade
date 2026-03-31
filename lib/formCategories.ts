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
  icon: LucideIcon;
};

/**
 * SLIMMED BUSINESS TYPES
 * Removed niche categories (Legal, Medical, etc.) to focus on core services.
 */
export const BUSINESS_TYPES: BusinessType[] = [
  { value: 'hvac', label: 'HVAC', icon: Flame },
  { value: 'electrical', label: 'Electrical', icon: Zap },
  { value: 'plumbing', label: 'Plumbing', icon: Wrench },
  { value: 'construction', label: 'Construction', icon: Hammer },
  { value: 'home_services', label: 'Home Services', icon: Home },
  { value: 'cleaning_services', label: 'Cleaning Services', icon: Brush },
  { value: 'auto_services', label: 'Auto Services', icon: Car },
  { value: 'tech_services', label: 'Tech Services', icon: Laptop },
  { value: 'general', label: 'General Services', icon: FileText },
];

export const DEFAULT_STATUSES: StatusOption[] = [
  { value: 'new', label: 'New', color: 'blue', icon: PlusCircle },
  { value: 'contacted', label: 'Contacted', color: 'yellow', icon: Phone },
  { value: 'quoted', label: 'Quoted', color: 'purple', icon: DollarSign },
  { value: 'in-progress', label: 'In Progress', color: 'orange', icon: Clock },
  { value: 'completed', label: 'Completed', color: 'green', icon: CheckCircle2 },
];

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
 * Maps to the slimmed list above.
 */
export const ADDRESS_CONFIG: Record<string, { show: boolean; required: boolean }> = {
  hvac: { show: true, required: true },
  electrical: { show: true, required: true },
  plumbing: { show: true, required: true },
  construction: { show: true, required: true },
  home_services: { show: true, required: true },
  cleaning_services: { show: true, required: true },
  auto_services: { show: true, required: false },
  tech_services: { show: false, required: false },
  general: { show: false, required: false },
};

/**
 * CATEGORY MAP (SLIMMED)
 * Default sub-categories for each business type.
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
};

export const DESCRIPTION_PLACEHOLDERS: Record<string, string> = {
  hvac:              "e.g. AC unit stopped blowing cold air yesterday, house is 2,400 sq ft, unit is about 8 years old. Need someone out ASAP.",
  electrical:        "e.g. Need a panel upgrade from 100A to 200A, also want to add 4 recessed lights in the living room. House built in 1987.",
  plumbing:          "e.g. Slow drain in master bathroom and a dripping faucet in the kitchen. Also interested in a water heater replacement — current one is 12 years old.",
  construction:      "e.g. Looking to finish the basement — roughly 800 sq ft. Need framing, drywall, and electrical rough-in. Want to start within 30 days.",
  home_services:     "e.g. Full exterior repaint, 2-story colonial, ~2,800 sq ft. Current color is beige, want to go gray with white trim. Prefer low-VOC paint.",
  cleaning_services: "e.g. Deep clean of a 3BR/2BA home before listing it for sale. About 1,800 sq ft. Needs inside oven, windows, and baseboards done.",
  auto_services:     "e.g. 2018 Honda Accord, ~85k miles. Brakes feel spongy and there's a grinding noise when stopping. Also due for an oil change.",
  tech_services:     "e.g. Laptop won't turn on after a spill — need a diagnosis and repair estimate. Also interested in setting up a NAS for home backups.",
  general:           "e.g. Describe what you need done, any important details, timeline, or budget constraints.",
};