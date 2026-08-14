export type SchedulingConfig = {
  showEndTime: boolean;
  bufferMinutes: number;
  // Rough estimate of staff a typical booking needs — used only to derive
  // public-form availability (total staff ÷ this number). Not exact; the
  // real, per-person guarantee happens later when an admin assigns actual
  // staff via SchedulingSection, which the buffer check already protects.
  staffPerBooking: number;
};

const DEFAULT_SCHEDULING_CONFIG: SchedulingConfig = {
  showEndTime: false,
  bufferMinutes: 0,
  staffPerBooking: 1,
};

export const SCHEDULING_CONFIG: Record<string, SchedulingConfig> = {
  hvac:               { showEndTime: false, bufferMinutes: 0, staffPerBooking: 1 },
  electrical:         { showEndTime: false, bufferMinutes: 0, staffPerBooking: 1 },
  plumbing:           { showEndTime: false, bufferMinutes: 0, staffPerBooking: 1 },
  roofing:            { showEndTime: false, bufferMinutes: 0, staffPerBooking: 1 },
  construction:       { showEndTime: false, bufferMinutes: 0, staffPerBooking: 1 },
  home_services:      { showEndTime: false, bufferMinutes: 0, staffPerBooking: 1 },
  cleaning_services:  { showEndTime: false, bufferMinutes: 0, staffPerBooking: 1 },
  auto_services:      { showEndTime: false, bufferMinutes: 0, staffPerBooking: 1 },
  tech_services:      { showEndTime: false, bufferMinutes: 0, staffPerBooking: 1 },
  staffing:           { showEndTime: true,  bufferMinutes: 60, staffPerBooking: 2 },
  general:            { showEndTime: false, bufferMinutes: 0, staffPerBooking: 1 },
  other:              { showEndTime: false, bufferMinutes: 0, staffPerBooking: 1 },
};

export function getSchedulingConfig(businessType: string | undefined | null): SchedulingConfig {
  if (!businessType) return DEFAULT_SCHEDULING_CONFIG;
  return SCHEDULING_CONFIG[businessType] || DEFAULT_SCHEDULING_CONFIG;
}