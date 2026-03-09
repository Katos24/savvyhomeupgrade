export interface AIAnalysisData {
  // AI Brief format
  headline?: string;
  summary?: string;
  next_steps?: string[];
  critical_info?: string[];
  urgency?: string;
  customer_name?: string;
  customer_score?: string;
  is_project?: boolean;
  has_photos?: boolean;
  photo_observations?: string | null; // ← NEW
  scheduled?: {
    date: string;
    time?: string;
  };
  
  // Simple format
  complexity?: string;
  damage_assessment?: string;
  estimated_scope?: string;
  recommended_action?: string;
  safety_concerns?: string;
  estimated_time?: string;
  
  // Detailed format (photo analysis)
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

interface AIAnalysisProps {
  analysis: AIAnalysisData | null;
}

export default function AIAnalysis({ analysis }: AIAnalysisProps) {
  if (!analysis) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <p className="text-gray-500 text-center">No AI analysis available</p>
      </div>
    );
  }

  if (analysis.status === 'Processing photos and analyzing...') {
    return (
      <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
        <p className="text-yellow-800 text-center flex items-center justify-center gap-2">
          <span className="animate-spin inline-block">⏳</span>
          Processing photos and analyzing...
        </p>
      </div>
    );
  }

  const isBriefFormat = !!(analysis.next_steps && Array.isArray(analysis.next_steps));
  const isDetailedFormat = !!(analysis.whatYouSee || analysis.scope || analysis.costBreakdown);
  const isSimpleFormat = !!(analysis.damage_assessment || analysis.estimated_scope);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Emergency':    return 'bg-red-500 text-white';
      case 'High Priority': return 'bg-orange-500 text-white';
      case 'Normal':       return 'bg-blue-500 text-white';
      case 'Low Priority': return 'bg-gray-400 text-white';
      default:             return 'bg-gray-300 text-gray-800';
    }
  };

  const getCustomerScoreColor = (score: string) => {
    switch (score) {
      case 'VIP':   return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Good':  return 'bg-green-100 text-green-800 border-green-300';
      case 'New':   return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Risky': return 'bg-red-100 text-red-800 border-red-300';
      default:      return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple':   return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Complex':  return 'bg-red-100 text-red-800 border-red-200';
      default:         return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'Good':      return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Fair':      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Poor':      return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Critical':  return 'bg-red-100 text-red-800 border-red-200';
      default:          return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          ✦ {isBriefFormat ? 'AI Brief' : 'AI Analysis Report'}
        </h3>
        {/* Photo badge */}
        {analysis.has_photos && analysis.photo_observations && (
          <span className="text-xs font-semibold px-2 py-1 bg-white/20 text-white rounded-full flex items-center gap-1">
            📸 Photos analyzed
          </span>
        )}
      </div>

      <div className="p-6 space-y-4">

        {/* ── AI BRIEF FORMAT ── */}
        {isBriefFormat && (
          <>
            {/* Headline */}
            {analysis.headline && (
              <div className="text-base font-bold text-gray-900 leading-snug border-l-4 border-purple-400 pl-3">
                {analysis.headline}
              </div>
            )}

            {/* Quick Stats Bar */}
            {(analysis.urgency || analysis.customer_score || analysis.scheduled || analysis.is_project) && (
              <div className="flex gap-3 flex-wrap">
                {analysis.urgency && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Urgency</p>
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${getUrgencyColor(analysis.urgency)}`}>
                      {analysis.urgency}
                    </span>
                  </div>
                )}
                {analysis.customer_score && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border ${getCustomerScoreColor(analysis.customer_score)}`}>
                      {analysis.customer_score}
                    </span>
                  </div>
                )}
                {analysis.scheduled && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Scheduled</p>
                    <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                      {new Date(analysis.scheduled.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {analysis.scheduled.time && ` · ${analysis.scheduled.time}`}
                    </span>
                  </div>
                )}
                {analysis.is_project && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Type</p>
                    <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      Active Project
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            {analysis.summary && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Summary</h4>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-100 leading-relaxed text-sm">
                  {analysis.summary}
                </p>
              </div>
            )}

            {/* ── PHOTO OBSERVATIONS (NEW) ── */}
            {analysis.photo_observations && analysis.photo_observations !== 'null' && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>📸</span> Photo Analysis
                </h4>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-indigo-900 text-sm leading-relaxed">
                    {analysis.photo_observations}
                  </p>
                </div>
              </div>
            )}

            {/* Next Steps */}
            {analysis.next_steps && analysis.next_steps.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Next Steps</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <ul className="space-y-2">
                    {analysis.next_steps.map((step: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-800 text-sm">
                        <span className="text-green-600 font-bold min-w-[1.25rem]">{idx + 1}.</span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Critical Info */}
            {analysis.critical_info && analysis.critical_info.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2">⚠ Critical Info</h4>
                <ul className="space-y-1">
                  {analysis.critical_info.map((info: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-yellow-800 text-sm">
                      <span className="font-bold">•</span>
                      <span className="leading-relaxed">{info}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Raw response fallback */}
            {analysis.raw_response && !analysis.summary && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Response</h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                  {analysis.raw_response}
                </p>
              </div>
            )}
          </>
        )}

        {/* ── DETAILED FORMAT (Photo Analysis) ── */}
        {isDetailedFormat && !isBriefFormat && (
          <>
            {analysis.summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">Executive Summary</h4>
                <p className="text-blue-800 text-sm">{analysis.summary}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analysis.condition && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-2">Condition</p>
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${getConditionColor(analysis.condition)}`}>
                    {analysis.condition}
                  </span>
                </div>
              )}
              {analysis.urgency && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-2">Urgency</p>
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${getUrgencyColor(analysis.urgency)}`}>
                    {analysis.urgency}
                  </span>
                </div>
              )}
              {analysis.complexity && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-2">Complexity</p>
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${getComplexityColor(analysis.complexity)}`}>
                    {analysis.complexity}
                  </span>
                </div>
              )}
              {analysis.costBreakdown?.totalMid && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-2">Est. Cost</p>
                  <p className="text-sm font-bold text-gray-900">{analysis.costBreakdown.totalMid}</p>
                </div>
              )}
            </div>

            {analysis.whatYouSee && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Visual Assessment</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm">{analysis.whatYouSee}</p>
              </div>
            )}

            {analysis.costBreakdown && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Cost Breakdown</h4>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
                  <div className="space-y-2">
                    {analysis.costBreakdown.materials !== 'N/A' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Materials:</span>
                        <span className="font-semibold">{analysis.costBreakdown.materials}</span>
                      </div>
                    )}
                    {analysis.costBreakdown.labor !== 'N/A' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Labor:</span>
                        <span className="font-semibold">{analysis.costBreakdown.labor}</span>
                      </div>
                    )}
                  </div>
                  {(analysis.costBreakdown.totalLow || analysis.costBreakdown.totalMid || analysis.costBreakdown.totalHigh) && (
                    <div className="border-t-2 border-green-300 pt-3 mt-3">
                      <p className="text-xs text-gray-600 mb-2">Total Project Cost:</p>
                      {analysis.costBreakdown.totalLow && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Low:</span>
                          <span className="font-bold">{analysis.costBreakdown.totalLow}</span>
                        </div>
                      )}
                      {analysis.costBreakdown.totalMid && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Mid:</span>
                          <span className="font-bold text-lg text-green-700">{analysis.costBreakdown.totalMid}</span>
                        </div>
                      )}
                      {analysis.costBreakdown.totalHigh && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">High:</span>
                          <span className="font-bold">{analysis.costBreakdown.totalHigh}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {analysis.safetyConsiderations && analysis.safetyConsiderations.length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2 text-sm">⚠ Safety Considerations</h4>
                <ul className="space-y-1">
                  {analysis.safetyConsiderations.map((safety: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-red-800 text-sm">
                      <span>•</span>
                      <span>{safety}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* ── SIMPLE FORMAT ── */}
        {isSimpleFormat && !isBriefFormat && !isDetailedFormat && (
          <>
            {(analysis.urgency || analysis.complexity || analysis.estimated_time) && (
              <div className="flex gap-3 flex-wrap">
                {analysis.urgency && analysis.urgency !== 'N/A' && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Urgency</p>
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${getUrgencyColor(analysis.urgency)}`}>
                      {analysis.urgency}
                    </span>
                  </div>
                )}
                {analysis.complexity && analysis.complexity !== 'N/A' && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Complexity</p>
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${getComplexityColor(analysis.complexity)}`}>
                      {analysis.complexity}
                    </span>
                  </div>
                )}
                {analysis.estimated_time && analysis.estimated_time !== 'N/A' && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Est. Time</p>
                    <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      {analysis.estimated_time}
                    </span>
                  </div>
                )}
              </div>
            )}

            {analysis.damage_assessment && analysis.damage_assessment !== 'N/A' && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Damage Assessment</h4>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
                  {analysis.damage_assessment}
                </p>
              </div>
            )}

            {analysis.estimated_scope && analysis.estimated_scope !== 'N/A' && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Estimated Scope</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm">
                  {analysis.estimated_scope}
                </p>
              </div>
            )}

            {analysis.recommended_action && analysis.recommended_action !== 'N/A' && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Recommended Action</h4>
                <p className="text-gray-700 bg-green-50 p-4 rounded-lg border border-green-100 text-sm">
                  {analysis.recommended_action}
                </p>
              </div>
            )}

            {analysis.safety_concerns &&
              analysis.safety_concerns !== 'N/A' &&
              analysis.safety_concerns !== 'Unable to assess without relevant HVAC imagery' && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2 text-sm">⚠ Safety Concerns</h4>
                <p className="text-red-800 text-sm">{analysis.safety_concerns}</p>
              </div>
            )}
          </>
        )}

        {/* Error */}
        {analysis.error && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2 text-sm">⚠ Analysis Issue</h4>
            <p className="text-yellow-800 text-sm">{analysis.error}</p>
            {analysis.details && (
              <p className="text-xs text-yellow-700 mt-2">{analysis.details}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}