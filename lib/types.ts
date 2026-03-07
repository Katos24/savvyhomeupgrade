// lib/types.ts
export type StatusOption = {
  value: string;
  label: string;
  color: string;
  emoji?: string;
};



// lib/types.ts

export interface AIAnalysisData {
  summary?: string;
  next_steps?: string[];
  critical_info?: string[];
  urgency?: string;
  customer_name?: string;
  is_project?: boolean;
  scheduled?: {
    date: string;
    time?: string;
  };
  complexity?: string;
  damage_assessment?: string;
  estimated_scope?: string;
  recommended_action?: string;
  safety_concerns?: string;
  estimated_time?: string;
  whatYouSee?: string;
  condition?: string;
  scope?: any;
  materials?: any;
  laborAndTime?: any;
  costBreakdown?: any;
  skillLevelRequired?: string;
  safetyConsiderations?: string[];
  recommendations?: any;
  observations?: string[];
  relatedSystems?: string[];
  codeCompliance?: string;
  seasonalTiming?: string;
  status?: string;
  error?: string;
  details?: string;
  raw_response?: string;
  [key: string]: any;
}