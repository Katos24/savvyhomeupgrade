export interface AIAnalysisData {
  summary: string;
  whatYouSee: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical' | 'Unknown';
  urgency: 'Emergency' | 'High Priority' | 'Normal' | 'Low Priority';
  scope?: {
    description: string;
    squareFootage?: string;
    quantity?: string;
    accessibilityNotes?: string;
  };
  materials?: {
    required: string[];
    specialty: string[];
    alternatives: string;
  };
  laborAndTime?: {
    estimatedHours: string;
    workers: string;
    timeline: string;
    permits: string;
  };
  costBreakdown?: {
    materials: string;
    labor: string;
    equipment: string;
    permits: string;
    totalLow: string;
    totalMid: string;
    totalHigh: string;
  };
  complexity: 'Simple' | 'Moderate' | 'Complex';
  skillLevelRequired?: string;
  safetyConsiderations?: string[];
  recommendations?: {
    primaryApproach: string;
    alternatives: string[];
    preventiveMeasures: string[];
    redFlags: string[];
  };
  observations: string[];
  relatedSystems?: string[];
  codeCompliance?: string;
  seasonalTiming?: string;
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'High Priority': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low Priority': return 'bg-gray-100 text-gray-800 border-gray-200';
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

      <div className="p-6 space-y-6">
        {/* Executive Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            📋 Executive Summary
          </h4>
          <p className="text-blue-800">{analysis.summary}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Condition</p>
            <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold border-2 ${getConditionColor(analysis.condition)}`}>
              {analysis.condition}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Urgency</p>
            <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold border-2 ${getUrgencyColor(analysis.urgency)}`}>
              {analysis.urgency}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Complexity</p>
            <span className="inline-block px-4 py-2 rounded-lg text-sm font-bold bg-purple-100 text-purple-800 border-2 border-purple-200">
              {analysis.complexity}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Est. Cost</p>
            <p className="text-sm font-bold text-gray-900">
              {analysis.costBreakdown?.totalMid || 'TBD'}
            </p>
          </div>
        </div>

        {/* What We See */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            👁️ Visual Assessment
          </h4>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{analysis.whatYouSee}</p>
        </div>

        {/* Scope of Work */}
        {analysis.scope && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              📐 Scope of Work
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700"><strong>Description:</strong> {analysis.scope.description}</p>
              {analysis.scope.squareFootage && (
                <p className="text-gray-700"><strong>Area:</strong> {analysis.scope.squareFootage}</p>
              )}
              {analysis.scope.quantity && (
                <p className="text-gray-700"><strong>Quantity:</strong> {analysis.scope.quantity}</p>
              )}
              {analysis.scope.accessibilityNotes && (
                <p className="text-gray-700"><strong>Access:</strong> {analysis.scope.accessibilityNotes}</p>
              )}
            </div>
          </div>
        )}

        {/* Materials */}
        {analysis.materials && analysis.materials.required.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🔧 Materials Needed
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Required Materials:</p>
                <ul className="space-y-1">
                  {analysis.materials.required.map((material, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-blue-600">•</span>
                      <span>{material}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {analysis.materials.specialty.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Specialty Items:</p>
                  <ul className="space-y-1">
                    {analysis.materials.specialty.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-orange-600">⭐</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.materials.alternatives && analysis.materials.alternatives !== 'N/A' && (
                <p className="text-sm text-gray-600 italic">💡 {analysis.materials.alternatives}</p>
              )}
            </div>
          </div>
        )}

        {/* Labor & Time */}
        {analysis.laborAndTime && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              ⏱️ Labor & Timeline
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Estimated Hours</p>
                <p className="text-lg font-bold text-gray-900">{analysis.laborAndTime.estimatedHours}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Workers Needed</p>
                <p className="text-lg font-bold text-gray-900">{analysis.laborAndTime.workers}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Timeline</p>
                <p className="text-lg font-bold text-gray-900">{analysis.laborAndTime.timeline}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Permits</p>
                <p className="text-lg font-bold text-gray-900">{analysis.laborAndTime.permits}</p>
              </div>
            </div>
            {analysis.skillLevelRequired && (
              <p className="mt-3 text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded p-3">
                <strong>Skill Level Required:</strong> {analysis.skillLevelRequired}
              </p>
            )}
          </div>
        )}

        {/* Cost Breakdown */}
        {analysis.costBreakdown && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              💰 Cost Breakdown
            </h4>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-700">Materials:</span>
                  <span className="font-semibold">{analysis.costBreakdown.materials}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Labor:</span>
                  <span className="font-semibold">{analysis.costBreakdown.labor}</span>
                </div>
                {analysis.costBreakdown.equipment !== 'N/A' && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Equipment:</span>
                    <span className="font-semibold">{analysis.costBreakdown.equipment}</span>
                  </div>
                )}
                {analysis.costBreakdown.permits !== 'N/A' && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Permits:</span>
                    <span className="font-semibold">{analysis.costBreakdown.permits}</span>
                  </div>
                )}
              </div>
              <div className="border-t-2 border-green-300 pt-3 mt-3">
                <p className="text-sm text-gray-600 mb-2">Total Project Cost:</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Low:</span>
                  <span className="font-bold text-lg">{analysis.costBreakdown.totalLow}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mid:</span>
                  <span className="font-bold text-xl text-green-700">{analysis.costBreakdown.totalMid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High:</span>
                  <span className="font-bold text-lg">{analysis.costBreakdown.totalHigh}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Safety Considerations */}
        {analysis.safetyConsiderations && analysis.safetyConsiderations.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              ⚠️ Safety Considerations
            </h4>
            <ul className="space-y-1">
              {analysis.safetyConsiderations.map((safety, idx) => (
                <li key={idx} className="flex items-start gap-2 text-red-800">
                  <span>⚠️</span>
                  <span>{safety}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              💡 Recommendations
            </h4>
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">Primary Approach:</p>
                <p className="text-blue-800">{analysis.recommendations.primaryApproach}</p>
              </div>
              
              {analysis.recommendations.alternatives.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-purple-900 mb-2">Alternative Options:</p>
                  <ul className="space-y-1">
                    {analysis.recommendations.alternatives.map((alt, idx) => (
                      <li key={idx} className="text-purple-800 flex items-start gap-2">
                        <span>→</span>
                        <span>{alt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.recommendations.preventiveMeasures.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-900 mb-2">Preventive Measures:</p>
                  <ul className="space-y-1">
                    {analysis.recommendations.preventiveMeasures.map((prev, idx) => (
                      <li key={idx} className="text-green-800 flex items-start gap-2">
                        <span>✓</span>
                        <span>{prev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.recommendations.redFlags.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Red Flags to Investigate:</p>
                  <ul className="space-y-1">
                    {analysis.recommendations.redFlags.map((flag, idx) => (
                      <li key={idx} className="text-yellow-800 flex items-start gap-2">
                        <span>🚩</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Observations */}
        {analysis.observations && analysis.observations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              🔍 Key Observations
            </h4>
            <ul className="space-y-2 bg-gray-50 rounded-lg p-4">
              {analysis.observations.map((obs, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span className="text-gray-700">{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional Info */}
        {(analysis.relatedSystems?.length || analysis.codeCompliance || analysis.seasonalTiming) && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {analysis.relatedSystems && analysis.relatedSystems.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Related Systems:</p>
                <p className="text-gray-600 text-sm">{analysis.relatedSystems.join(', ')}</p>
              </div>
            )}
            {analysis.codeCompliance && analysis.codeCompliance !== 'N/A' && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Code Compliance:</p>
                <p className="text-gray-600 text-sm">{analysis.codeCompliance}</p>
              </div>
            )}
            {analysis.seasonalTiming && analysis.seasonalTiming !== 'N/A' && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Best Timing:</p>
                <p className="text-gray-600 text-sm">{analysis.seasonalTiming}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
