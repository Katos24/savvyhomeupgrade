'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getTemplatesByCategory, type QuoteTemplate } from '@/lib/quoteTemplates';

type ProjectSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  statusOptions: any[];
  onUpdateStatus: (id: number, status: string, oldStatus: string) => Promise<boolean>;
};

export default function ProjectSection({ lead, currentUser, onRefresh, statusOptions, onUpdateStatus }: ProjectSectionProps) {
  const [saving, setSaving] = useState(false);
  
  const hasProject = !!lead?.project_id;
  
  // EXPANDABLE SECTION STATE
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showQuoteAndPayment, setShowQuoteAndPayment] = useState(false); // 🔥 Combined
  
  // PROJECT STATE
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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const availableTemplates = getTemplatesByCategory(lead?.category || 'general');
  
  // PAYMENT STATE
  const [paymentAmount, setPaymentAmount] = useState(lead?.payment_amount || '');

  // 🔥 Auto-calculate payment status based on amount
  const calculatePaymentStatus = () => {
    if (!lead?.quote_total || !paymentAmount) return 'unpaid';
    
    const total = parseFloat(lead.quote_total);
    const paid = parseFloat(paymentAmount);
    
    if (paid >= total) return 'paid';
    if (paid > 0) return 'partial';
    return 'unpaid';
  };

  const paymentStatus = calculatePaymentStatus();

  // 🔥 Auto-fill payment amount from quote total
  useEffect(() => {
    if (lead?.quote_total && !lead?.payment_amount) {
      setPaymentAmount(lead.quote_total);
    }
  }, [lead?.quote_total, lead?.payment_amount]);

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

  // 🔥 Template selection handler
  const handleTemplateSelect = (templateId: string) => {
    if (!templateId || templateId === '') {
      return;
    }
    
    const template = availableTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    const templateItems = template.items.map((item, index) => ({
      id: Date.now() + index,
      description: item.description,
      amount: item.amount
    }));
    
    setQuoteData(templateItems);
    setSelectedTemplate('');
    toast.success(`✅ Template "${template.name}" loaded!`);
  };

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

  const calculateQuoteTotal = () => {
    return quoteData.reduce((sum: number, item: any) => sum + item.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!lead) {
    return (
      <div className="border-t-4 border-blue-200 mt-8 pt-6">
        <p className="text-gray-500">Loading project information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {!hasProject && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-center">
          <p className="text-yellow-800 font-semibold">
            ⚠️ Convert to Project first to use scheduling, quotes, and payments
          </p>
        </div>
      )}

      {/* ==================== SCHEDULING & ASSIGNMENT ==================== */}
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned To</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g., Mike (Plumber)"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-sm sm:text-base"
                />
              </div>

              <div className="relative z-20">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-sm sm:text-base"
                />
              </div>

              <div className="relative z-20">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  placeholder="e.g., 2.5"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-sm sm:text-base"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Actual Hours (when completed)</label>
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

      {/* ==================== COMBINED QUOTE & PAYMENT 🔥 ==================== */}
      <div className={`bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 ${!hasProject ? 'opacity-50 pointer-events-none' : ''}`}>
        <button
          onClick={() => setShowQuoteAndPayment(!showQuoteAndPayment)}
          disabled={!hasProject}
          className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-emerald-50/50 transition rounded-xl"
        >
          <div className="flex items-center gap-3">
            <h4 className="text-base sm:text-lg font-bold text-gray-900">💰 Quote & Payment</h4>
            {quoteData.length > 0 && !showQuoteAndPayment && (
              <span className="text-xs sm:text-sm font-semibold text-green-600">
                {formatCurrency(calculateQuoteTotal())}
                {paymentStatus && paymentStatus !== 'unpaid' && (
                  <span className="ml-2">
                    {paymentStatus === 'paid' ? '✅' : '⏳'}
                  </span>
                )}
              </span>
            )}
          </div>
          <span className={`text-2xl transition-transform ${showQuoteAndPayment ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {showQuoteAndPayment && hasProject && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-6">
            
            {/* ═══════════ QUOTE SECTION ═══════════ */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-emerald-300">
                <span className="text-lg font-bold text-gray-900">📝 Quote</span>
              </div>

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
                  {availableTemplates.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">📋 Quick Start with Template</label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => handleTemplateSelect(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border-2 border-blue-300 focus:border-emerald-500 focus:outline-none bg-white text-gray-900 text-sm sm:text-base"
                      >
                        <option value="">Choose a template...</option>
                        {availableTemplates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name} - {formatCurrency(template.total)}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-600 mt-2">💡 Select a template to auto-fill line items, then customize as needed</p>
                    </div>
                  )}

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
                <div className="text-center py-4">
                  <div className="text-3xl sm:text-4xl mb-2">📝</div>
                  <p className="text-gray-500 mb-3 text-sm sm:text-base">No quote created yet</p>
                  <button
                    onClick={() => setShowQuoteBuilder(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 sm:px-6 py-2 rounded-lg transition text-sm sm:text-base"
                  >
                    ➕ Create Quote
                  </button>
                </div>
              )}
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="border-t-2 border-emerald-300"></div>

            {/* ═══════════ PAYMENT SECTION ═══════════ */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <span className="text-lg font-bold text-gray-900">💳 Payment</span>
              </div>

              {lead?.quote_total && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">📋 Quote Total:</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency(parseFloat(lead.quote_total))}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={lead?.quote_total || "0.00"}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Status</label>
                  <div className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-sm sm:text-base flex items-center">
                    <span className={`font-semibold ${
                      paymentStatus === 'paid' ? 'text-green-600' : 
                      paymentStatus === 'partial' ? 'text-orange-600' : 
                      'text-gray-600'
                    }`}>
                      {paymentStatus === 'paid' ? '✅ Paid in Full' : 
                       paymentStatus === 'partial' ? '⏳ Partial Payment' : 
                       '💰 Unpaid'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-calculated based on amount paid
                  </p>
                </div>
              </div>

              {lead?.quote_total && paymentAmount && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">
                      {parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0 ? '✅ Status:' : '📊 Remaining Balance:'}
                    </span>
                    <span className={`text-lg font-bold ${
                      parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0 
                        ? 'text-green-600' 
                        : 'text-orange-600'
                    }`}>
                      {parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0
                        ? 'Paid in Full'
                        : formatCurrency(parseFloat(lead.quote_total) - parseFloat(paymentAmount))
                      }
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleUpdatePayment}
                disabled={saving}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition text-sm sm:text-base"
              >
                {saving ? '💾 Saving...' : '💾 Update Payment'}
              </button>

              {lead?.paid_at && (
                <p className="text-xs sm:text-sm text-green-600 font-semibold text-center">
                  ✅ Payment received on {new Date(lead.paid_at).toLocaleDateString()}
                </p>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}