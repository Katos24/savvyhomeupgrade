export interface AIAnalysisData {
  // New simple format
  urgency?: string;
  complexity?: string;
  damage_assessment?: string;
  estimated_scope?: string;
  recommended_action?: string;
  safety_concerns?: string;
  estimated_time?: string;
  
  // Old detailed format
  summary?: string;
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

  // Handle "processing" status
  if (analysis.status === 'Processing photos and analyzing...') {
    return (
      <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
        <p className="text-yellow-800 text-center flex items-center justify-center gap-2">
          <span className="animate-spin">⏳</span>
          Processing photos and analyzing...
        </p>
      </div>
    );
  }

  // Detect which format we have
  const isDetailedFormat = !!(analysis.summary || analysis.whatYouSee || analysis.scope);
  const isSimpleFormat = !!(analysis.damage_assessment || analysis.estimated_scope);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Emergency': return 'bg-red-500 text-white';
      case 'High Priority': return 'bg-orange-500 text-white';
      case 'Normal': return 'bg-blue-500 text-white';
      case 'Low Priority': return 'bg-gray-400 text-white';
      default: return 'bg-gray-300 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Complex': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'Good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Poor': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🤖 AI Analysis Report
        </h3>
      </div>

      <div className="p-6 space-y-4">
        {/* DETAILED FORMAT (Old) */}
        {isDetailedFormat && (
          <>
            {/* Executive Summary */}
            {analysis.summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Executive Summary</h4>
                <p className="text-blue-800">{analysis.summary}</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analysis.condition && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Condition</p>
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold border-2 ${getConditionColor(analysis.condition)}`}>
                    {analysis.condition}
                  </span>
                </div>
              )}
              {analysis.urgency && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Urgency</p>
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${getUrgencyColor(analysis.urgency)}`}>
                    {analysis.urgency}
                  </span>
                </div>
              )}
              {analysis.complexity && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Complexity</p>
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold border-2 ${getComplexityColor(analysis.complexity)}`}>
                    {analysis.complexity}
                  </span>
                </div>
              )}
              {analysis.costBreakdown?.totalMid && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Est. Cost</p>
                  <p className="text-sm font-bold text-gray-900">{analysis.costBreakdown.totalMid}</p>
                </div>
              )}
            </div>

            {/* Visual Assessment */}
            {analysis.whatYouSee && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">👁️ Visual Assessment</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{analysis.whatYouSee}</p>
              </div>
            )}

            {/* Cost Breakdown */}
            {analysis.costBreakdown && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">💰 Cost Breakdown</h4>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
                  <div className="space-y-2">
                    {analysis.costBreakdown.materials !== 'N/A' && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Materials:</span>
                        <span className="font-semibold">{analysis.costBreakdown.materials}</span>
                      </div>
                    )}
                    {analysis.costBreakdown.labor !== 'N/A' && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Labor:</span>
                        <span className="font-semibold">{analysis.costBreakdown.labor}</span>
                      </div>
                    )}
                  </div>
                  {(analysis.costBreakdown.totalLow || analysis.costBreakdown.totalMid || analysis.costBreakdown.totalHigh) && (
                    <div className="border-t-2 border-green-300 pt-3 mt-3">
                      <p className="text-sm text-gray-600 mb-2">Total Project Cost:</p>
                      {analysis.costBreakdown.totalLow && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Low:</span>
                          <span className="font-bold text-lg">{analysis.costBreakdown.totalLow}</span>
                        </div>
                      )}
                      {analysis.costBreakdown.totalMid && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Mid:</span>
                          <span className="font-bold text-xl text-green-700">{analysis.costBreakdown.totalMid}</span>
                        </div>
                      )}
                      {analysis.costBreakdown.totalHigh && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">High:</span>
                          <span className="font-bold text-lg">{analysis.costBreakdown.totalHigh}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Safety */}
            {analysis.safetyConsiderations && analysis.safetyConsiderations.length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">⚠️ Safety Considerations</h4>
                <ul className="space-y-1">
                  {analysis.safetyConsiderations.map((safety: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-red-800">
                      <span>⚠️</span>
                      <span>{safety}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* SIMPLE FORMAT (New) */}
        {isSimpleFormat && (
          <>
            {/* Quick Stats */}
            {(analysis.urgency || analysis.complexity || analysis.estimated_time) && (
              <div className="flex gap-3 flex-wrap">
                {analysis.urgency && analysis.urgency !== 'N/A' && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Urgency</p>
                    <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${getUrgencyColor(analysis.urgency)}`}>
                      {analysis.urgency}
                    </span>
                  </div>
                )}
                {analysis.complexity && analysis.complexity !== 'N/A' && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Complexity</p>
                    <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold border-2 ${getComplexityColor(analysis.complexity)}`}>
                      {analysis.complexity}
                    </span>
                  </div>
                )}
                {analysis.estimated_time && analysis.estimated_time !== 'N/A' && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Estimated Time</p>
                    <span className="inline-block px-4 py-2 rounded-lg text-sm font-bold bg-purple-100 text-purple-800 border-2 border-purple-200">
                      {analysis.estimated_time}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Damage Assessment */}
            {analysis.damage_assessment && analysis.damage_assessment !== 'N/A' && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">🔍 Damage Assessment</h4>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  {analysis.damage_assessment}
                </p>
              </div>
            )}

            {/* Estimated Scope */}
            {analysis.estimated_scope && analysis.estimated_scope !== 'N/A' && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📐 Estimated Scope</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {analysis.estimated_scope}
                </p>
              </div>
            )}

            {/* Recommended Action */}
            {analysis.recommended_action && analysis.recommended_action !== 'N/A' && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">💡 Recommended Action</h4>
                <p className="text-gray-700 bg-green-50 p-4 rounded-lg border border-green-200">
                  {analysis.recommended_action}
                </p>
              </div>
            )}

            {/* Safety Concerns */}
            {analysis.safety_concerns && analysis.safety_concerns !== 'N/A' && analysis.safety_concerns !== 'Unable to assess without relevant HVAC imagery' && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">⚠️ Safety Concerns</h4>
                <p className="text-red-800">{analysis.safety_concerns}</p>
              </div>
            )}
          </>
        )}

        {/* Error Handling */}
        {analysis.error && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Analysis Issue</h4>
            <p className="text-yellow-800">{analysis.error}</p>
            {analysis.details && (
              <p className="text-xs text-yellow-700 mt-2">{analysis.details}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
