'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type ProjectSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  statusOptions: any[];
  onUpdateStatus: (id: number, status: string, oldStatus: string) => Promise<boolean>;
};

// Helper function to get full Tailwind classes
const getStatusClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  return colorMap[color] || 'bg-gray-100 text-gray-800';
};

export default function ProjectSection({ lead, currentUser, onRefresh, statusOptions, onUpdateStatus }: ProjectSectionProps) {
  const [saving, setSaving] = useState(false);
  
  // 🔥 Check if project exists
  const hasProject = !!lead?.project_id;
  
  // EXPANDABLE SECTION STATE
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  // PROJECT STATE (no more job_status - we use lead.status)
  const [scheduledDate, setScheduledDate] = useState(
    lead?.scheduled_date ? new Date(lead.scheduled_date).toISOString().split('T')[0] : ''
  );
  const [scheduledTime, setScheduledTime] = useState(lead?.scheduled_time || '');
  const [assignedTo, setAssignedTo] = useState(lead?.assigned_to || '');
  const [estimatedHours, setEstimatedHours] = useState(lead?.estimated_hours || '');
  const [actualHours, setActualHours] = useState(lead?.actual_hours || '');
  
  // QUOTE STATE
  const [quoteData, setQuoteData] = useState(lead?.quote_data || []);
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [newLineItem, setNewLineItem] = useState({ description: '', amount: '' });
  
  // PAYMENT STATE
  const [paymentStatus, setPaymentStatus] = useState(lead?.payment_status || 'unpaid');
  const [paymentAmount, setPaymentAmount] = useState(lead?.payment_amount || '');

  // ============================================
  // PROJECT HANDLERS
  // ============================================
  
  const handleUpdateProject = async () => {
    if (!hasProject) {
      toast.error('Please convert to project first');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_project',
          scheduled_date: scheduledDate || null,
          scheduled_time: scheduledTime || null,
          assigned_to: assignedTo || null,
          estimated_hours: estimatedHours || null,
          actual_hours: actualHours || null,
          user_name: currentUser?.name || 'Unknown User',
          user_email: currentUser?.email || ''
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('✅ Project updated!');
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Project update error:', error);
      toast.error('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // QUOTE HANDLERS
  // ============================================

  const handleAddQuoteItem = () => {
    if (!newLineItem.description || !newLineItem.amount) {
      toast.error('Please fill in description and amount');
      return;
    }
    
    setQuoteData([...quoteData, {
      id: Date.now(),
      description: newLineItem.description,
      amount: parseFloat(newLineItem.amount)
    }]);
    setNewLineItem({ description: '', amount: '' });
  };

  const handleRemoveQuoteItem = (itemId: number) => {
    setQuoteData(quoteData.filter((item: any) => item.id !== itemId));
  };

  const handleSaveQuote = async () => {
    if (!hasProject) {
      toast.error('Please convert to project first');
      return;
    }

    if (quoteData.length === 0) {
      toast.error('Add at least one line item');
      return;
    }

    const total = quoteData.reduce((sum: number, item: any) => sum + item.amount, 0);

    setSaving(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'save_quote',
          quote_data: quoteData,
          quote_total: total,
          user_name: currentUser?.name || 'Unknown User',
          user_email: currentUser?.email || ''
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('✅ Quote saved!');
        setShowQuoteBuilder(false);
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to save quote');
      }
    } catch (error) {
      console.error('Save quote error:', error);
      toast.error('Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  const handleSendQuote = async () => {
    if (!hasProject) {
      toast.error('Please convert to project first');
      return;
    }

    if (!lead?.quote_data || lead.quote_data.length === 0) {
      toast.error('Create a quote first');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'send_quote',
          user_name: currentUser?.name || 'Unknown User',
          user_email: currentUser?.email || ''
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('✅ Quote sent to customer!');
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to send quote');
      }
    } catch (error) {
      console.error('Send quote error:', error);
      toast.error('Failed to send quote');
    } finally {
      setSaving(false);
    }
  };

  const calculateQuoteTotal = () => {
    return quoteData.reduce((sum: number, item: any) => sum + item.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // ============================================
  // PAYMENT HANDLERS
  // ============================================

  const handleUpdatePayment = async () => {
    if (!hasProject) {
      toast.error('Please convert to project first');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_payment',
          payment_status: paymentStatus,
          payment_amount: paymentAmount || null,
          user_name: currentUser?.name || 'Unknown User',
          user_email: currentUser?.email || ''
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('✅ Payment updated!');
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to update payment');
      }
    } catch (error) {
      console.error('Payment update error:', error);
      toast.error('Failed to update payment');
    } finally {
      setSaving(false);
    }
  };

  if (!lead) {
    return (
      <div className="border-t-4 border-blue-200 mt-8 pt-6">
        <p className="text-gray-500">Loading project information...</p>
      </div>
    );
  }

  // ============================================
  // RENDER - PROJECT TOOLS ONLY
  // ============================================

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* 🔥 WARNING if no project exists */}
      {!hasProject && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-center">
          <p className="text-yellow-800 font-semibold">
            ⚠️ Convert to Project first to use scheduling, quotes, and payments
          </p>
        </div>
      )}

      {/* ==================== JOB DETAILS (EXPANDABLE) - NO MORE JOB STATUS ==================== */}
      <div className={`bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 overflow-visible ${!hasProject ? 'opacity-50 pointer-events-none' : ''}`}>
        <button
          onClick={() => setShowJobDetails(!showJobDetails)}
          disabled={!hasProject}
          className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-purple-50/50 transition rounded-xl"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <h4 className="text-base sm:text-lg font-bold text-gray-900">📅 Scheduling & Assignment</h4>
            {(scheduledDate || assignedTo) && !showJobDetails && (
              <span className="text-xs sm:text-sm text-gray-600">
                ({scheduledDate && new Date(scheduledDate).toLocaleDateString()}{scheduledDate && assignedTo ? ', ' : ''}{assignedTo})
              </span>
            )}
          </div>
          <span className={`text-2xl transition-transform flex-shrink-0 ${showJobDetails ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {showJobDetails && hasProject && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assigned To */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g., Mike (Plumber)"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-sm sm:text-base"
                />
              </div>

              {/* Scheduled Date */}
              <div className="relative z-20">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-sm sm:text-base"
                />
              </div>

              {/* Scheduled Time */}
              <div className="relative z-20">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scheduled Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-sm sm:text-base"
                />
              </div>

              {/* Estimated Hours */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  placeholder="e.g., 2.5"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-sm sm:text-base"
                />
              </div>

              {/* Actual Hours */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Actual Hours (when completed)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={actualHours}
                  onChange={(e) => setActualHours(e.target.value)}
                  placeholder="e.g., 3.0"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateProject}
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition text-sm sm:text-base"
            >
              {saving ? '💾 Saving...' : '💾 Save Scheduling'}
            </button>
          </div>
        )}
      </div>

      {/* ==================== QUOTE (unchanged, keeping for brevity) ==================== */}
      <div className={`bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 ${!hasProject ? 'opacity-50 pointer-events-none' : ''}`}>
        <button
          onClick={() => setShowQuote(!showQuote)}
          disabled={!hasProject}
          className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-emerald-50/50 transition rounded-xl"
        >
          <div className="flex items-center gap-3">
            <h4 className="text-base sm:text-lg font-bold text-gray-900">💰 Quote</h4>
            {quoteData.length > 0 && !showQuote && (
              <span className="text-xs sm:text-sm font-semibold text-green-600">
                {formatCurrency(calculateQuoteTotal())}
              </span>
            )}
          </div>
          <span className={`text-2xl transition-transform ${showQuote ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {showQuote && hasProject && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
            
            {/* Quote display/builder - keeping existing code */}
            {quoteData.length > 0 && !showQuoteBuilder ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                  {quoteData.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0 gap-2">
                      <span className="text-gray-700 text-sm sm:text-base">{item.description}</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base whitespace-nowrap">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300">
                    <span className="text-base sm:text-lg font-bold text-gray-900">TOTAL</span>
                    <span className="text-lg sm:text-xl font-bold text-emerald-600">
                      {formatCurrency(calculateQuoteTotal())}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowQuoteBuilder(true)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition text-sm sm:text-base"
                  >
                    ✏️ Edit Quote
                  </button>
                  <button
                    onClick={handleSendQuote}
                    disabled={saving}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition text-sm sm:text-base"
                  >
                    {saving ? '📤 Sending...' : '📤 Send to Customer'}
                  </button>
                </div>
              </div>
            ) : showQuoteBuilder ? (
              <div className="space-y-4">
                {/* Quote builder UI - keeping existing */}
                <div className="bg-emerald-50 rounded-lg p-3 sm:p-4 border border-emerald-200">
                  <h5 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Line Items</h5>
                  
                  {quoteData.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-2 mb-2 bg-white rounded px-3 gap-2">
                      <span className="text-gray-700 text-sm sm:text-base flex-1">{item.description}</span>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(item.amount)}</span>
                        <button
                          onClick={() => handleRemoveQuoteItem(item.id)}
                          className="text-red-600 hover:text-red-800 font-bold text-lg"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                    <input
                      type="text"
                      value={newLineItem.description}
                      onChange={(e) => setNewLineItem({...newLineItem, description: e.target.value})}
                      placeholder="Description"
                      className="sm:col-span-2 px-3 py-2 rounded border border-gray-300 focus:border-emerald-500 focus:outline-none text-sm sm:text-base"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={newLineItem.amount}
                      onChange={(e) => setNewLineItem({...newLineItem, amount: e.target.value})}
                      placeholder="Amount"
                      className="px-3 py-2 rounded border border-gray-300 focus:border-emerald-500 focus:outline-none text-sm sm:text-base"
                    />
                  </div>
                  <button
                    onClick={handleAddQuoteItem}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition text-sm sm:text-base"
                  >
                    ➕ Add Line Item
                  </button>

                  {quoteData.length > 0 && (
                    <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300">
                      <span className="text-base sm:text-lg font-bold text-gray-900">TOTAL</span>
                      <span className="text-lg sm:text-xl font-bold text-emerald-600">
                        {formatCurrency(calculateQuoteTotal())}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowQuoteBuilder(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveQuote}
                    disabled={saving || quoteData.length === 0}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition text-sm sm:text-base"
                  >
                    {saving ? '💾 Saving...' : '💾 Save Quote'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="text-3xl sm:text-4xl mb-2">📝</div>
                <p className="text-gray-500 mb-4 text-sm sm:text-base">No quote created yet</p>
                <button
                  onClick={() => setShowQuoteBuilder(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 sm:px-6 py-2 rounded-lg transition text-sm sm:text-base"
                >
                  ➕ Create Quote
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================== PAYMENT (unchanged) ==================== */}
      <div className={`bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 ${!hasProject ? 'opacity-50 pointer-events-none' : ''}`}>
        <button
          onClick={() => setShowPayment(!showPayment)}
          disabled={!hasProject}
          className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-orange-50/50 transition rounded-xl"
        >
          <div className="flex items-center gap-3">
            <h4 className="text-base sm:text-lg font-bold text-gray-900">💳 Payment</h4>
            {paymentStatus && !showPayment && (
              <span className={`text-xs sm:text-sm font-semibold ${paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                {paymentStatus === 'paid' ? '✅ Paid' : paymentStatus === 'partial' ? '⏳ Partial' : '💰 Unpaid'}
              </span>
            )}
          </div>
          <span className={`text-2xl transition-transform ${showPayment ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {showPayment && hasProject && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:outline-none bg-white text-gray-900 text-sm sm:text-base"
                >
                  <option value="unpaid">💰 Unpaid</option>
                  <option value="partial">⏳ Partial Payment</option>
                  <option value="paid">✅ Paid in Full</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            <button
              onClick={handleUpdatePayment}
              disabled={saving}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition text-sm sm:text-base"
            >
              {saving ? '💾 Saving...' : '💾 Update Payment'}
            </button>

            {lead?.paid_at && (
              <p className="text-xs sm:text-sm text-green-600 font-semibold">
                ✅ Payment received on {new Date(lead.paid_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}