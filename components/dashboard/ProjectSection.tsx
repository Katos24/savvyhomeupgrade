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

const JOB_STATUSES = [
  { value: 'not_started', label: 'Not Started', color: 'gray', emoji: '⏸️' },
  { value: 'scheduled', label: 'Scheduled', color: 'blue', emoji: '📅' },
  { value: 'in_progress', label: 'In Progress', color: 'orange', emoji: '🔨' },
  { value: 'completed', label: 'Completed', color: 'green', emoji: '✅' },
  { value: 'cancelled', label: 'Cancelled', color: 'red', emoji: '❌' },
];

export default function ProjectSection({ lead, currentUser, onRefresh, statusOptions, onUpdateStatus }: ProjectSectionProps) {
  const [saving, setSaving] = useState(false);
  
  // STATUS STATE (using lead status, not job_status)
  const [status, setStatus] = useState(lead.status || statusOptions[0]?.value || 'new');
  
  // PROJECT STATE
  const [scheduledDate, setScheduledDate] = useState(
    lead.scheduled_date ? new Date(lead.scheduled_date).toISOString().split('T')[0] : ''
  );
  const [scheduledTime, setScheduledTime] = useState(lead.scheduled_time || '');
  const [assignedTo, setAssignedTo] = useState(lead.assigned_to || '');
  const [estimatedHours, setEstimatedHours] = useState(lead.estimated_hours || '');
  const [actualHours, setActualHours] = useState(lead.actual_hours || '');
  
  // QUOTE STATE
  const [quoteData, setQuoteData] = useState(lead.quote_data || []);
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [newLineItem, setNewLineItem] = useState({ description: '', amount: '' });
  
  // PAYMENT STATE
  const [paymentStatus, setPaymentStatus] = useState(lead.payment_status || 'unpaid');
  const [paymentAmount, setPaymentAmount] = useState(lead.payment_amount || '');

  // Helper to get status config
  const getStatusConfig = (statusValue: string) => {
    return statusOptions.find((s: any) => s.value === statusValue) || statusOptions[0];
  };

  const currentStatusConfig = getStatusConfig(lead.status || statusOptions[0].value);

  // Determine if we should show project fields based on status
  const showProjectFields = ['quoted', 'in-progress', 'completed'].includes(status);

  // ============================================
  // STATUS HANDLER
  // ============================================
  
  const handleStatusChange = async () => {
    const oldStatus = lead.status || statusOptions[0].value;
    
    if (status === oldStatus) return;
    
    setSaving(true);
    const success = await onUpdateStatus(lead.id, status, oldStatus);
    setSaving(false);
    
    if (success) {
      toast.success('Status updated!');
    } else {
      toast.error('Failed to update status');
    }
  };

  // ============================================
  // PROJECT HANDLERS
  // ============================================
  
  const handleUpdateProject = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_project',
          job_status: status, // Using lead status now
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
        toast.error('Failed to update project');
      }
    } catch (error) {
      toast.error('Failed to update project');
    }
    setSaving(false);
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
        toast.error('Failed to save quote');
      }
    } catch (error) {
      toast.error('Failed to save quote');
    }
    setSaving(false);
  };

  const handleSendQuote = async () => {
    if (!lead.quote_data || lead.quote_data.length === 0) {
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
        toast.error('Failed to send quote');
      }
    } catch (error) {
      toast.error('Failed to send quote');
    }
    setSaving(false);
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
        toast.error('Failed to update payment');
      }
    } catch (error) {
      toast.error('Failed to update payment');
    }
    setSaving(false);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="border-t-4 border-blue-200 mt-8 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-2xl font-bold text-gray-900">📊 Status & Project Management</h3>
      </div>

      {/* STATUS SECTION - ALWAYS VISIBLE */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Current Status</h4>
        
        <div className="space-y-4">
          {/* Current Status Display */}
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Current</span>
            <div className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold bg-${currentStatusConfig.color}-100 text-${currentStatusConfig.color}-800`}>
              {currentStatusConfig.emoji && `${currentStatusConfig.emoji} `}{currentStatusConfig.label}
            </div>
          </div>

          {/* Update Status */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Change to
            </label>
            <div className="flex gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-white text-gray-900 font-medium transition-all"
              >
                {statusOptions.map((statusOption: any) => (
                  <option key={statusOption.value} value={statusOption.value}>
                    {statusOption.emoji && `${statusOption.emoji} `}{statusOption.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleStatusChange}
                disabled={saving || status === (lead.status || statusOptions[0].value)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:shadow-none"
              >
                {saving ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PROJECT FIELDS - SHOW IF STATUS IS QUOTED/IN-PROGRESS/COMPLETED */}
      {showProjectFields && (
        <div className="space-y-6">
          
          {/* ==================== JOB DETAILS ==================== */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📅 Job Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Scheduled Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scheduled Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
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
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Actual Hours (if job completed) */}
              {status === 'completed' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Actual Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={actualHours}
                    onChange={(e) => setActualHours(e.target.value)}
                    placeholder="e.g., 3.0"
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleUpdateProject}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {saving ? '💾 Saving...' : '💾 Save Job Details'}
            </button>
          </div>

          {/* ==================== QUOTE SECTION ==================== */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                💰 Quote
              </h4>
              {!showQuoteBuilder && quoteData.length === 0 && (
                <button
                  onClick={() => setShowQuoteBuilder(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                >
                  ➕ Create Quote
                </button>
              )}
            </div>

            {/* EXISTING QUOTE DISPLAY */}
            {quoteData.length > 0 && !showQuoteBuilder && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {quoteData.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <span className="text-gray-700">{item.description}</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300">
                    <span className="text-lg font-bold text-gray-900">TOTAL</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(calculateQuoteTotal())}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowQuoteBuilder(true)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
                  >
                    ✏️ Edit Quote
                  </button>
                  <button
                    onClick={handleSendQuote}
                    disabled={saving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
                  >
                    {saving ? '📤 Sending...' : '📤 Send Quote to Customer'}
                  </button>
                </div>

                {lead.quote_sent_at && (
                  <p className="text-sm text-green-600 font-semibold">
                    ✅ Quote sent on {new Date(lead.quote_sent_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* QUOTE BUILDER */}
            {showQuoteBuilder && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h5 className="font-semibold text-gray-900 mb-3">Line Items</h5>
                  
                  {/* Existing Items */}
                  {quoteData.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-2 mb-2 bg-white rounded px-3">
                      <span className="text-gray-700">{item.description}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                        <button
                          onClick={() => handleRemoveQuoteItem(item.id)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add New Item */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                    <input
                      type="text"
                      value={newLineItem.description}
                      onChange={(e) => setNewLineItem({...newLineItem, description: e.target.value})}
                      placeholder="Description (e.g., Labor, Parts)"
                      className="md:col-span-2 px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={newLineItem.amount}
                      onChange={(e) => setNewLineItem({...newLineItem, amount: e.target.value})}
                      placeholder="Amount"
                      className="px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleAddQuoteItem}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
                  >
                    ➕ Add Line Item
                  </button>

                  {/* Total */}
                  {quoteData.length > 0 && (
                    <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300">
                      <span className="text-lg font-bold text-gray-900">TOTAL</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(calculateQuoteTotal())}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowQuoteBuilder(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveQuote}
                    disabled={saving || quoteData.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
                  >
                    {saving ? '💾 Saving...' : '💾 Save Quote'}
                  </button>
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {quoteData.length === 0 && !showQuoteBuilder && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>No quote created yet</p>
              </div>
            )}
          </div>

          {/* ==================== PAYMENT SECTION ==================== */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              💳 Payment & Invoice
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Payment Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                >
                  <option value="unpaid">💰 Unpaid</option>
                  <option value="partial">⏳ Partial Payment</option>
                  <option value="paid">✅ Paid in Full</option>
                </select>
              </div>

              {/* Payment Amount */}
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
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleUpdatePayment}
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {saving ? '💾 Saving...' : '💾 Update Payment Status'}
            </button>

            {lead.paid_at && (
              <p className="text-sm text-green-600 font-semibold mt-3">
                ✅ Payment received on {new Date(lead.paid_at).toLocaleDateString()}
              </p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}