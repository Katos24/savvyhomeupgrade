'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type ConvertToProjectButtonProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
};

export default function ConvertToProjectButton({ 
  lead, 
  currentUser, 
  onRefresh 
}: ConvertToProjectButtonProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Don't show button if already converted
  if (lead.project_id) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h3 className="font-bold text-green-900">Active Project</h3>
            <p className="text-sm text-green-700">
              This lead has been converted to Project #{lead.project_id}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleConvert = async () => {
    setIsConverting(true);
    
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'create_project',
          user_name: currentUser?.name || 'Unknown User',
          user_email: currentUser?.email || ''
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`✅ Project #${result.project_id} created!`, {
          description: 'You can now schedule work, create quotes, and track payments.'
        });
        setShowConfirm(false);
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Failed to create project');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 mb-6">
      {!showConfirm ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🚀</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ready to start work?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Convert this lead to an active project to schedule work, create quotes, and track payments.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full sm:w-auto flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            🎯 Convert to Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Conversion</h3>
              <p className="text-sm text-gray-600 mt-1">
                This will create an active project for <strong>{lead.name}</strong>. You'll be able to:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
                <li>✅ Schedule work and assign technicians</li>
                <li>✅ Create and send official quotes</li>
                <li>✅ Track payments and invoices</li>
                <li>✅ Upload before/after photos</li>
                <li>✅ Mark job as complete</li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition text-sm sm:text-base"
            >
              {isConverting ? '⏳ Creating Project...' : '✅ Yes, Create Project'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isConverting}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold py-3 px-6 rounded-lg transition text-sm sm:text-base"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}