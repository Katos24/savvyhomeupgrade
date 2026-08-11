export type SchedulingConfig = {
  showEndTime: boolean;
  bufferMinutes: number;
};

const DEFAULT_SCHEDULING_CONFIG: SchedulingConfig = {
  showEndTime: false,
  bufferMinutes: 0,
};

export const SCHEDULING_CONFIG: Record<string, SchedulingConfig> = {
  hvac:               { showEndTime: false, bufferMinutes: 0 },
  electrical:         { showEndTime: false, bufferMinutes: 0 },
  plumbing:           { showEndTime: false, bufferMinutes: 0 },
  roofing:            { showEndTime: false, bufferMinutes: 0 },
  construction:       { showEndTime: false, bufferMinutes: 0 },
  home_services:      { showEndTime: false, bufferMinutes: 0 },
  cleaning_services:  { showEndTime: false, bufferMinutes: 0 },
  auto_services:      { showEndTime: false, bufferMinutes: 0 },
  tech_services:      { showEndTime: false, bufferMinutes: 0 },
  staffing:           { showEndTime: true,  bufferMinutes: 60 },
  general:            { showEndTime: false, bufferMinutes: 0 },
  other:              { showEndTime: false, bufferMinutes: 0 },
};

export function getSchedulingConfig(businessType: string | undefined | null): SchedulingConfig {
  if (!businessType) return DEFAULT_SCHEDULING_CONFIG;
  return SCHEDULING_CONFIG[businessType] || DEFAULT_SCHEDULING_CONFIG;
}