export interface AIAnalysisData {
  summary: string;
  whatYouSee: string;
  scope: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical' | 'Unknown';
  urgency: 'Emergency' | 'High Priority' | 'Normal' | 'Low Priority';
  observations: string[];
  complexity: 'Simple' | 'Moderate' | 'Complex';
  estimatedCostRange: string;
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
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Fair': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Emergency': return 'bg-red-100 text-red-800';
      case 'High Priority': return 'bg-orange-100 text-orange-800';
      case 'Normal': return 'bg-blue-100 text-blue-800';
      case 'Low Priority': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🤖 AI Analysis
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
          <p className="text-gray-700">{analysis.summary}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Condition</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(analysis.condition)}`}>
              {analysis.condition}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Urgency</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(analysis.urgency)}`}>
              {analysis.urgency}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Complexity</p>
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              {analysis.complexity}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Est. Cost</p>
            <p className="text-sm font-semibold text-gray-900">{analysis.estimatedCostRange}</p>
          </div>
        </div>

        {/* What Claude Sees */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">What We See</h4>
          <p className="text-gray-700">{analysis.whatYouSee}</p>
        </div>

        {/* Scope */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Estimated Scope</h4>
          <p className="text-gray-700">{analysis.scope}</p>
        </div>

        {/* Key Observations */}
        {analysis.observations && analysis.observations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Key Observations</h4>
            <ul className="space-y-2">
              {analysis.observations.map((obs, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700">{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
