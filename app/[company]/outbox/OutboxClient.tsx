'use client'

import { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, Search, Mail, Calendar, DollarSign, AlertTriangle, ChevronDown, Bell, X, FileText } from 'lucide-react'



// ── Types ─────────────────────────────────────────────────────────────────────
interface QuoteLineItem {
  id: number
  description: string
  amount: number
  quantity?: number
  unitPrice?: number
}

interface QuoteEmail {
  sent_at: string
  quote_data: QuoteLineItem[]
  quote_total: number
  sent_by_name: string
  sent_by_email: string
}

interface ScheduleEmail {
  sent_at: string
  scheduled_date: string | null
  scheduled_time: string | null
  assigned_to: string | null
  sent_by_name: string
  sent_by_email: string
}

interface Project {
  id: number
  lead_id: number
  customer_name: string
  customer_email: string
  quote_emails: QuoteEmail[]
  schedule_emails: ScheduleEmail[]
}

interface FlatEmail {
  type: 'quote' | 'schedule' | 'payment_reminder' | string
  sent_at: string
  customer_name: string
  customer_email: string
  project_id: number
  sent_by_email: string
  isDup: boolean
  quote_data?: QuoteLineItem[]
  quote_total?: number
  scheduled_date?: string | null
  scheduled_time?: string | null
  assigned_to?: string | null
  source: 'outbox' | 'legacy'
  status?: 'sent' | 'failed'
  error_message?: string | null
  subject?: string | null
  html_body?: string | null
  outbox_id?: number
  amount_due?: number | null
  days_overdue?: number | null
  due_date?: string | null
  lead_id?: number | null
}

interface OutboxEmail {
  id: number
  type: string
  to_email: string
  to_name: string
  subject: string | null
  html_body: string | null
  status: string
  error_message: string | null
  sent_by_email: string
  sent_by_name: string | null
  metadata: any
  project_id: number | null
  lead_id: number | null
  created_at: string
  sent_at: string | null
}

interface Props {
  company: { id: number; name: string; slug: string; logo_url: string | null }
  projects: Project[]
  outboxEmails?: OutboxEmail[]
  totalEmails?: number
  totalStats?: {
    sent: number
    revenue: number
    reminders: number
    failed: number
  }
  typeCountMap?: Record<string, number>
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d: string | null | undefined): string {
  if (!d) return '—'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return '—'
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtTime(d: string | null | undefined): string {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function fmtScheduleTime(t: string | null | undefined): string {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${m} ${ampm}`
}

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 7 * 86400000) return `${Math.floor(diff / 86400000)}d ago`
  return fmtDate(d)
}

function groupLabel(d: string): string {
  const dt = new Date(d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const day = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
  const diff = today.getTime() - day.getTime()
  if (diff === 0) return 'Today'
  if (diff === 86400000) return 'Yesterday'
  if (diff < 7 * 86400000) return dt.toLocaleDateString('en-US', { weekday: 'long' })
  return dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function fmtMoney(n: number | undefined | null): string {
  return '$' + Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Email type config ─────────────────────────────────────────────────────────
function getTypeConfig(type: string) {
  switch (type) {
    case 'quote':
      return { label: 'Quote', icon: <DollarSign className="w-5 h-5" />, color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)' }
    case 'schedule':
      return { label: 'Schedule', icon: <Calendar className="w-5 h-5" />, color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' }
    case 'payment_reminder':
      return { label: 'Payment Reminder', icon: <Bell className="w-5 h-5" />, color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.2)' }
    default:
      return { label: type, icon: <Mail className="w-5 h-5" />, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' }
  }
}

function buildEmailList(projects: Project[], outboxEmails: OutboxEmail[] = []): FlatEmail[] {
  const all: FlatEmail[] = []

  outboxEmails.forEach(e => {
    const metadata = typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata || {}
    all.push({
      type: e.type,
      sent_at: e.created_at,
      customer_name: e.to_name || '',
      customer_email: e.to_email,
      project_id: e.project_id || 0,
      lead_id: e.lead_id || null,
      sent_by_email: e.sent_by_email,
      isDup: false,
      quote_data: metadata.quote_data || [],
      quote_total: metadata.quote_total ? parseFloat(metadata.quote_total) : undefined,
      scheduled_date: metadata.scheduled_date || null,
      scheduled_time: metadata.scheduled_time || null,
      assigned_to: metadata.assigned_to || null,
      amount_due: metadata.amount_due ? parseFloat(metadata.amount_due) : null,
      due_date: metadata.due_date || null,
      source: 'outbox',
      status: e.status as 'sent' | 'failed',
      error_message: e.error_message,
      subject: e.subject,
      html_body: e.html_body,
      outbox_id: e.id,
    })
  })

  projects.forEach(p => {
    const qEmails = p.quote_emails || []
    const sEmails = p.schedule_emails || []

    const isInOutbox = (sentAt: string, projectId: number) => {
      const t = new Date(sentAt).getTime()
      return outboxEmails.some(oe =>
        oe.project_id === projectId &&
        Math.abs(new Date(oe.created_at).getTime() - t) < 5000
      )
    }

    const isDupInArray = <T extends { sent_at: string }>(arr: T[], keyFn: (e: T) => string, idx: number) => {
      const tThis = new Date(arr[idx].sent_at).getTime()
      return arr.some((o, j) => j !== idx && keyFn(o) === keyFn(arr[idx]) && Math.abs(tThis - new Date(o.sent_at).getTime()) < 10 * 60 * 1000)
    }

    qEmails.forEach((q, i) => {
      if (isInOutbox(q.sent_at, p.id)) return
      all.push({
        type: 'quote',
        sent_at: q.sent_at,
        customer_name: p.customer_name,
        customer_email: p.customer_email,
        project_id: p.id,
        lead_id: p.lead_id || null,
        sent_by_email: q.sent_by_email,
        isDup: isDupInArray(qEmails, e => String(e.quote_total), i),
        quote_data: q.quote_data || [],
        quote_total: q.quote_total,
        source: 'legacy',
        status: 'sent',
      })
    })

    sEmails.forEach((s, i) => {
      if (isInOutbox(s.sent_at, p.id)) return
      all.push({
        type: 'schedule',
        sent_at: s.sent_at,
        customer_name: p.customer_name,
        customer_email: p.customer_email,
        project_id: p.id,
        lead_id: p.lead_id || null,
        sent_by_email: s.sent_by_email,
        isDup: isDupInArray(sEmails, e => `${e.scheduled_date}|${e.scheduled_time}`, i),
        scheduled_date: s.scheduled_date,
        scheduled_time: s.scheduled_time,
        assigned_to: s.assigned_to,
        source: 'legacy',
        status: 'sent',
      })
    })
  })

  return all.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function OutboxClient({ company, projects, outboxEmails = [], totalEmails, totalStats, typeCountMap = {} }: Props) {
    console.log('totalStats:', totalStats) // ← add this

    const [tab, setTab] = useState<'all' | 'quote' | 'schedule' | 'payment_reminder'>('all')
  const [outboxPage, setOutboxPage] = useState(1)
  const [allOutboxEmails, setAllOutboxEmails] = useState<OutboxEmail[]>(outboxEmails)
  const [loadingMore, setLoadingMore] = useState(false)
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
useEffect(() => {
    // When tab changes reset to first page and reload with type filter
    const fetchFiltered = async () => {
      setLoadingMore(true)
      try {
        const typeParam = tab !== 'all' ? `&type=${tab}` : ''
        const res = await fetch(`/api/company/${company.slug}/outbox?page=1${typeParam}`)
        const data = await res.json()
        if (data.success) {
          setAllOutboxEmails(data.emails)
          setOutboxPage(1)
        }
      } catch {
        // silent
      } finally {
        setLoadingMore(false)
      }
    }
    // Only refetch if not the initial load
    if (mounted) fetchFiltered()
  }, [tab])
const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [dupAlertDismissed, setDupAlertDismissed] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)

  // Only show load more if filters are clear and there are more server-side emails
const hasActiveFilters = !!(search || dateRange)
const tabTotal = tab === 'all' ? (totalEmails ?? 0) : (typeCountMap[tab] ?? 0)
const hasMore = allOutboxEmails.length < tabTotal

   const loadMore = async () => {
    setLoadingMore(true)
    try {
      const nextPage = outboxPage + 1
      const typeParam = tab !== 'all' ? `&type=${tab}` : ''
      const res = await fetch(`/api/company/${company.slug}/outbox?page=${nextPage}${typeParam}`)
      const data = await res.json()
      if (data.success) {
        setAllOutboxEmails(prev => [...prev, ...data.emails])
        setOutboxPage(nextPage)
      }
    } catch {
      // silent
    } finally {
      setLoadingMore(false)
    }
  }
  const allEmails = useMemo(() => buildEmailList(projects, allOutboxEmails), [projects, allOutboxEmails])

  const senders = useMemo(() =>
    [...new Set(allEmails.map(e => e.sent_by_email))].sort(),
    [allEmails]
  )

  const filtered = useMemo(() => {
    const now = new Date()
    return allEmails.filter(e => {
      if (tab !== 'all' && e.type !== tab) return false
      if (search && !e.customer_name.toLowerCase().includes(search.toLowerCase()) &&
          !e.customer_email.toLowerCase().includes(search.toLowerCase())) return false
      if (dateRange) {
        const d = new Date(e.sent_at)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        if (dateRange === 'today' && d < today) return false
        if (dateRange === 'week' && d < new Date(now.getTime() - 7 * 86400000)) return false
        if (dateRange === 'month' && d < new Date(now.getTime() - 30 * 86400000)) return false
      }
      return true
    })
  }, [allEmails, tab, search, dateRange])

  const grouped = useMemo(() => {
    const groups: { label: string; emails: (FlatEmail & { globalIdx: number })[] }[] = []
    const seen: Record<string, number> = {}
    filtered.forEach(email => {
      const globalIdx = allEmails.indexOf(email)
      const label = groupLabel(email.sent_at)
      if (seen[label] === undefined) {
        seen[label] = groups.length
        groups.push({ label, emails: [] })
      }
      groups[seen[label]].emails.push({ ...email, globalIdx })
    })
    return groups
  }, [filtered, allEmails])

  const dupCount = allEmails.filter(e => e.isDup).length
  const totalQuoteVal = allEmails.filter(e => e.type === 'quote').reduce((s, e) => s + (e.quote_total ?? 0), 0)
  const reminderCount = allEmails.filter(e => e.type === 'payment_reminder').length
  const failedCount = allEmails.filter(e => e.status === 'failed').length

  const tabs = [
    { key: 'all',              label: 'All',       count: totalEmails ?? allEmails.length },
    { key: 'quote',            label: 'Quotes',    count: typeCountMap['quote'] ?? allEmails.filter(e => e.type === 'quote').length },
    { key: 'schedule',         label: 'Schedules', count: typeCountMap['schedule'] ?? allEmails.filter(e => e.type === 'schedule').length },
    { key: 'payment_reminder', label: 'Reminders', count: typeCountMap['payment_reminder'] ?? reminderCount },
  ] as const

  const toggleRow = (idx: number) => setExpandedIdx(prev => prev === idx ? null : idx)

  const clearFilters = () => {
  setSearch('')
  setDateRange('')
  setTab('all')
}

  return (
    <div className="min-h-screen text-[#e8eaf0] selection:bg-blue-500/30" style={{ background: '#06080F', colorScheme: 'dark' }}>

      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-white/[0.03] px-4 sm:px-6 flex items-center h-14 justify-between" style={{ background: 'rgba(6,8,15,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <a href={`/${company.slug}/dashboard`} className="p-2 hover:bg-white/5 rounded-xl transition-colors group">
            <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-white" />
          </a>
          <div className="h-4 w-[1px] bg-white/10" />
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">Outbox</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hidden sm:inline">Mail Server Live</span>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-8 sm:py-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Communications Audit</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white">Transmission Log.</h2>
            <p className="text-gray-600 text-sm mt-1">All customer-facing emails across every project</p>
          </div>
          <div className="flex flex-col sm:items-end">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total volume</p>
            <div className="text-3xl font-black font-mono text-white">{totalStats?.sent ?? allEmails.length}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {[
            { label: 'Sent',      value: totalStats?.sent ?? allEmails.length,               sub: 'All transmissions',  color: 'text-white',                                                                                        border: 'rgba(255,255,255,0.1)',    icon: <Mail className="w-4 h-4" /> },
            { label: 'Revenue',   value: fmtMoney(totalStats?.revenue ?? totalQuoteVal),     sub: 'In active quotes',   color: 'text-orange-500',                                                                                   border: 'rgba(249,115,22,0.2)',     icon: <DollarSign className="w-4 h-4" /> },
            { label: 'Reminders', value: totalStats?.reminders ?? reminderCount,             sub: 'Late pay notices',   color: 'text-blue-400',                                                                                     border: 'rgba(96,165,250,0.2)',     icon: <Bell className="w-4 h-4" /> },
            { label: 'Failed',    value: totalStats?.failed ?? failedCount,                  sub: 'Delivery errors',    color: (totalStats?.failed ?? failedCount) > 0 ? 'text-red-400' : 'text-emerald-400',                      border: (totalStats?.failed ?? failedCount) > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', icon: <AlertTriangle className="w-4 h-4" /> },
          ].map((s, i) => (
  <div key={i} className="rounded-[1.5rem] p-4 sm:p-6 transition-all duration-300 cursor-default"
              style={{ background: 'rgba(17,19,24,0.8)', border: `1px solid ${s.border}` }}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 rounded-lg ${s.color}`} style={{ background: 'rgba(255,255,255,0.05)' }}>{s.icon}</div>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{s.label}</span>
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tighter ${s.color}`}>{s.value}</div>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Duplicate alert */}
        {dupCount > 0 && !dupAlertDismissed && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-6"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-xs sm:text-sm font-medium"><strong>{dupCount} emails</strong> may be accidental duplicate sends.</span>
            <button onClick={() => setDupAlertDismissed(true)} className="text-amber-400 hover:text-amber-300 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Tabs — full width scrollable */}
          <div className="flex p-1 rounded-2xl overflow-x-auto"
            style={{ scrollbarWidth: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setExpandedIdx(null); }}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap flex-1 sm:flex-none ${
                  tab === t.key ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-gray-300'
                }`}>
                {t.label}
                <span className="ml-1.5 opacity-40 font-mono text-[9px]">{t.count}</span>
              </button>
            ))}
          </div>

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
                className="w-full rounded-xl pl-11 pr-4 py-3 text-xs font-bold outline-none transition-all text-white placeholder-gray-600"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
           
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}
  className="rounded-xl px-3 py-3 text-xs font-bold text-gray-400 outline-none cursor-pointer"
  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
  <option key="all" value="">All time</option>
  <option key="today" value="today">Today</option>
  <option key="week" value="week">This week</option>
  <option key="month" value="month">This month</option>
</select>
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-black text-red-400 transition-all"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Count */}
        <div className="text-xs text-gray-600 font-bold mb-4">
          Showing <span className="text-white font-black">{filtered.length}</span> of <span className="text-white font-black">{allEmails.length}</span> transmissions
          {hasActiveFilters && <span className="text-blue-400 ml-2">· filtered</span>}
        </div>

        {/* Email feed */}
        <div className="space-y-6">
          {filtered.length === 0 ? (
            <div className="py-24 sm:py-32 text-center rounded-[2.5rem]"
              style={{ border: '2px dashed rgba(255,255,255,0.05)' }}>
              <Mail className="w-12 h-12 text-gray-800 mx-auto mb-4" />
              <p className="text-gray-500 font-black uppercase tracking-[.2em] text-xs mb-2">No matching transmissions</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-blue-400 text-xs font-bold hover:text-blue-300 underline mt-2">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            grouped.map(group => (
              <div key={group.label} className="space-y-2">
                <div className="flex items-center gap-4 px-2 py-1">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] shrink-0">{group.label}</span>
                  <div className="h-[1px] flex-1" style={{ background: 'rgba(255,255,255,0.03)' }} />
                  <span className="text-[10px] font-black text-gray-700 shrink-0">{group.emails.length}</span>
                </div>

                {group.emails.map(email => {
                  const isExpanded = expandedIdx === email.globalIdx
                  const cfg = getTypeConfig(email.type)
                  const isQ = email.type === 'quote'
                  const isSched = email.type === 'schedule'
                  const isReminder = email.type === 'payment_reminder'

                  return (
                    <div key={`${email.project_id}-${email.type}-${email.sent_at}-${email.globalIdx}`}
                      className="relative overflow-hidden rounded-[1.5rem] transition-all duration-300"
                      style={{
                        background: isExpanded ? '#161921' : '#0B0F1A',
                        border: `1px solid ${isExpanded ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}`,
                      }}>

                      {/* Left accent */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[1.5rem]"
                        style={{ background: email.status === 'failed' ? '#ef4444' : isExpanded ? '#6366f1' : 'rgba(99,102,241,0.2)' }} />

                      {/* Row */}
                      <div onClick={() => toggleRow(email.globalIdx)}
                        className="flex items-center gap-3 sm:gap-5 pl-4 sm:pl-5 pr-3 sm:pr-5 py-4 cursor-pointer">

                        {/* Icon */}
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all"
                          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                          {cfg.icon}
                        </div>

                        {/* Name + type */}
                        <div className="min-w-0 shrink-0" style={{ width: '30%', maxWidth: 180 }}>
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest shrink-0" style={{ color: cfg.color }}>{cfg.label}</p>
                            {email.status === 'failed' && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>Failed</span>
                            )}
                            {email.isDup && email.status !== 'failed' && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0"
                                style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>Dup</span>
                            )}
                          </div>
                          <h4 className="text-white font-black text-sm tracking-tight truncate">{email.customer_name}</h4>
                        </div>

                        {/* Middle details — hidden on small mobile */}
                        <div className="hidden sm:flex flex-1 items-center gap-6 min-w-0">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-0.5">To</span>
                            <span className="text-xs font-bold text-gray-400 truncate">{email.customer_email}</span>
                          </div>
                          {isQ && (email.quote_total ?? 0) > 0 && (
                            <div className="flex flex-col shrink-0">
                              <span className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: cfg.color }}>Amount</span>
                              <span className="text-sm font-black font-mono text-white">{fmtMoney(email.quote_total)}</span>
                            </div>
                          )}
                          {isSched && email.scheduled_date && (
                            <div className="flex flex-col shrink-0">
                              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Date</span>
                              <span className="text-xs font-bold text-white">{fmtDate(email.scheduled_date)}</span>
                            </div>
                          )}
                          {isReminder && (email.amount_due ?? 0) > 0 && (
                            <div className="flex flex-col shrink-0">
                              <span className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: cfg.color }}>Due</span>
                              <span className="text-sm font-black font-mono text-white">{fmtMoney(email.amount_due)}</span>
                            </div>
                          )}
                        </div>

                        {/* Time + chevron */}
                        <div className="flex items-center gap-3 shrink-0 ml-auto">
                         <div className="text-right hidden xs:block">
  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{mounted ? timeAgo(email.sent_at) : fmtDate(email.sent_at)}</p>
  <p className="text-[9px] font-bold text-gray-700">{fmtTime(email.sent_at)}</p>
</div>
<p className="text-[10px] font-black text-gray-500 xs:hidden">{mounted ? timeAgo(email.sent_at) : fmtDate(email.sent_at)}</p>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 shrink-0"
                            style={{
                              border: '1px solid rgba(255,255,255,0.05)',
                              background: isExpanded ? 'rgba(255,255,255,0.1)' : 'transparent',
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}>
                            <ChevronDown size={14} className="text-gray-500" />
                          </div>
                        </div>
                      </div>

                      {/* Expanded */}
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(6,8,15,0.5)' }}>
                          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">

                            {/* Content */}
                            <div className="lg:col-span-2">
                              <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">
                                {isQ ? 'Quote breakdown' : isSched ? 'Schedule details' : isReminder ? 'Reminder details' : 'Details'}
                              </h5>
                              <div className="rounded-2xl p-4 sm:p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                {isQ && (
                                  <>
                                    <div className="space-y-3">
                                      {(email.quote_data || []).length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">No line items available.</p>
                                      ) : (email.quote_data || []).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start gap-4 pb-3 last:pb-0"
                                          style={{ borderBottom: idx < (email.quote_data?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                          <div className="min-w-0">
                                            <p className="text-sm font-bold text-white">{item.description || '—'}</p>
                                            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mt-0.5">
                                              Qty: {item.quantity || 1} · {fmtMoney(item.unitPrice ?? (item.amount / (item.quantity || 1)))} each
                                            </p>
                                          </div>
                                          <span className="font-mono text-sm text-white shrink-0">{fmtMoney(item.amount)}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex justify-between items-center pt-4 mt-3"
                                      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                      <span className="text-sm font-black text-white uppercase tracking-widest">Total</span>
                                      <span className="text-xl font-black font-mono text-orange-400">{fmtMoney(email.quote_total)}</span>
                                    </div>
                                  </>
                                )}
                                {isSched && (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                                    {[
                                      { label: 'Date',     value: fmtDate(email.scheduled_date) || 'Not set',                              color: '#60a5fa' },
                                      { label: 'Time',     value: email.scheduled_time ? fmtScheduleTime(email.scheduled_time) : 'Not set', color: '#60a5fa' },
                                      { label: 'Customer', value: email.customer_name,                                                      color: '#e8eaf0' },
                                    ].map(f => (
                                      <div key={f.label}>
                                        <p className="text-[9px] text-gray-600 uppercase tracking-widest font-black mb-1">{f.label}</p>
                                        <p className="text-sm font-bold" style={{ color: f.color }}>{f.value}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {isReminder && (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                                    {[
                                      { label: 'Amount Due', value: fmtMoney(email.amount_due), color: '#fb923c' },
                                      { label: 'Due Date',   value: fmtDate(email.due_date),    color: '#e8eaf0' },
                                      { label: 'Customer',   value: email.customer_name,         color: '#e8eaf0' },
                                    ].map(f => (
                                      <div key={f.label}>
                                        <p className="text-[9px] text-gray-600 uppercase tracking-widest font-black mb-1">{f.label}</p>
                                        <p className="text-sm font-bold" style={{ color: f.color }}>{f.value}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {!isQ && !isSched && !isReminder && (
                                  <p className="text-sm text-gray-500 italic">{email.subject || 'No additional details.'}</p>
                                )}
                              </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Metadata</h5>
                                <div className="space-y-3 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                  {[
                                    { k: 'Sent',   v: `${fmtDate(email.sent_at)} ${fmtTime(email.sent_at)}` },
                                    { k: 'From',   v: email.sent_by_email },
                                    { k: 'To',     v: email.customer_email },
                                    { k: 'Status', v: email.status || 'sent', color: email.status === 'failed' ? '#f87171' : '#4ade80' },
                                  ].map(m => (
                                    <div key={m.k} className="flex justify-between items-start gap-2">
                                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest shrink-0">{m.k}</span>
                                      <span className="text-[10px] font-bold text-right break-all" style={{ color: m.color || '#6b7280' }}>{m.v}</span>
                                    </div>
                                  ))}
                                  {email.isDup && (
                                    <div className="flex justify-between items-start gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Note</span>
                                      <span className="text-[10px] font-bold text-amber-400">Possible duplicate</span>
                                    </div>
                                  )}
                                  {email.error_message && (
                                    <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                      <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Error</p>
                                      <p className="text-[10px] text-red-300">{email.error_message}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {email.subject && (
                                <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Subject</p>
                                  <p className="text-xs text-gray-400">{email.subject}</p>
                                </div>
                              )}
                              <div className="flex flex-col gap-3">
                                {email.html_body && (
                                  <button onClick={(e) => { e.stopPropagation(); setPreviewHtml(email.html_body ?? null); }}
                                    className="w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all text-gray-400 hover:text-white flex items-center justify-center gap-2"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <FileText className="w-3.5 h-3.5" /> Preview Email
                                  </button>
                                )}
                                <a href={`/${company.slug}/dashboard?lead=${email.lead_id}`}
                                  className="w-full py-3 rounded-xl text-center text-[11px] font-black uppercase tracking-widest transition-all no-underline block text-white"
                                  style={{ background: '#4f46e5' }}>
                                  Jump to Project
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Load more — only shown when no filters active and more exist server-side */}
        {hasMore && (
          <div className="flex justify-center pt-8 pb-2">
            <button onClick={loadMore} disabled={loadingMore}
              className="px-8 py-3 rounded-2xl text-sm font-black text-gray-400 hover:text-white transition-all disabled:opacity-40 uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
{loadingMore ? 'Loading...' : `Load More (${tabTotal - allOutboxEmails.length} remaining)`}
            </button>
          </div>
        )}
      </div>

      {/* Email preview modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => setPreviewHtml(null)}>
          <div className="relative w-full sm:max-w-3xl flex flex-col"
            style={{ background: '#111318', border: '1px solid #232731', borderRadius: '16px 16px 0 0', maxHeight: '92dvh', height: '92dvh' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid #232731' }}>
              <span className="text-sm font-black text-white uppercase tracking-widest">Email Preview</span>
              <button onClick={() => setPreviewHtml(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white transition"
                style={{ background: '#1c2029' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
              <div style={{ background: '#ffffff', borderRadius: '8px', pointerEvents: 'none', color: '#111' }}>
                <style>{`.email-preview-body * { max-width: 100% !important; box-sizing: border-box !important; } .email-preview-body table { width: 100% !important; table-layout: fixed !important; } .email-preview-body img { height: auto !important; }`}</style>
                <div className="email-preview-body" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}