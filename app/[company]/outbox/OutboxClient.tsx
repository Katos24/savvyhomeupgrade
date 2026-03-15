'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, Search, Mail, Calendar, DollarSign, AlertTriangle, ChevronDown, ExternalLink, Bell } from 'lucide-react'

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
  // outbox fields
  source: 'outbox' | 'legacy'
  status?: 'sent' | 'failed'
  error_message?: string | null
  subject?: string | null
  html_body?: string | null
  outbox_id?: number
  // payment reminder fields
  amount_due?: number | null
  days_overdue?: number | null
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
      return { label: 'Quote', emoji: '💰', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)' }
    case 'schedule':
      return { label: 'Schedule', emoji: '📅', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' }
    case 'payment_reminder':
      return { label: 'Payment Reminder', emoji: '🔔', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)' }
    default:
      return { label: type, emoji: '📧', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' }
  }
}

function buildEmailList(projects: Project[], outboxEmails: OutboxEmail[] = []): FlatEmail[] {
  const all: FlatEmail[] = []

  // 1. Add all outbox emails (richer data, includes payment_reminder)
  outboxEmails.forEach(e => {
    const metadata = typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata || {}
    all.push({
      type: e.type,
      sent_at: e.created_at,
      customer_name: e.to_name || '',
      customer_email: e.to_email,
      project_id: e.project_id || 0,
      sent_by_email: e.sent_by_email,
      isDup: false,
      quote_data: metadata.quote_data || [],
      quote_total: metadata.quote_total ? parseFloat(metadata.quote_total) : undefined,
      scheduled_date: metadata.scheduled_date || null,
      scheduled_time: metadata.scheduled_time || null,
      assigned_to: metadata.assigned_to || null,
      amount_due: metadata.amount_due ? parseFloat(metadata.amount_due) : null,
      days_overdue: metadata.days_overdue ? parseInt(metadata.days_overdue) : null,
      source: 'outbox',
      status: e.status as 'sent' | 'failed',
      error_message: e.error_message,
      subject: e.subject,
      html_body: e.html_body,
      outbox_id: e.id,
    })
  })

  // 2. Add legacy project emails (skip if already in outbox by close timestamp)
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
export default function OutboxClient({ company, projects, outboxEmails = [] }: Props) {
  const [tab, setTab] = useState<'all' | 'quote' | 'schedule' | 'payment_reminder'>('all')
  const [search, setSearch] = useState('')
  const [sentBy, setSentBy] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [dupAlertDismissed, setDupAlertDismissed] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)

  const allEmails = useMemo(() => buildEmailList(projects, outboxEmails), [projects, outboxEmails])

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
      if (sentBy && e.sent_by_email !== sentBy) return false
      if (dateRange) {
        const d = new Date(e.sent_at)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        if (dateRange === 'today' && d < today) return false
        if (dateRange === 'week' && d < new Date(now.getTime() - 7 * 86400000)) return false
        if (dateRange === 'month' && d < new Date(now.getTime() - 30 * 86400000)) return false
      }
      return true
    })
  }, [allEmails, tab, search, sentBy, dateRange])

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
    { key: 'all',              label: 'All',              count: allEmails.length },
    { key: 'quote',            label: 'Quotes',           count: allEmails.filter(e => e.type === 'quote').length },
    { key: 'schedule',         label: 'Schedules',        count: allEmails.filter(e => e.type === 'schedule').length },
    { key: 'payment_reminder', label: 'Pay Reminders',    count: reminderCount },
  ] as const

  const toggleRow = (idx: number) => setExpandedIdx(prev => prev === idx ? null : idx)

  return (
    <div className="min-h-screen" style={{ background: '#0a0c10', color: '#e8eaf0' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-white/10 px-4 sm:px-6 flex items-center h-14 gap-3"
        style={{ background: 'rgba(10,12,16,0.9)', backdropFilter: 'blur(12px)' }}>
        <a href={`/${company.slug}/dashboard`}
          className="flex items-center gap-1.5 px-2.5 py-1.5 border border-white/10 rounded-md text-gray-500 hover:text-white text-xs transition no-underline">
          <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Dashboard</span>
        </a>
        <span className="text-gray-700 text-xs hidden sm:inline">›</span>
        <span className="text-sm font-semibold text-white">Outbox</span>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Outbox</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">All customer-facing emails across every project</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total sent',        value: allEmails.length,                                     sub: 'across all projects',      color: '#e8eaf0', icon: <Mail className="w-4 h-4" /> },
            { label: 'Quote emails',      value: allEmails.filter(e => e.type === 'quote').length,      sub: fmtMoney(totalQuoteVal) + ' in quotes', color: '#f97316', icon: <DollarSign className="w-4 h-4" /> },
            { label: 'Pay reminders',     value: reminderCount,                                         sub: reminderCount === 1 ? '1 sent' : `${reminderCount} sent`, color: '#fb923c', icon: <Bell className="w-4 h-4" /> },
            { label: 'Failed',            value: failedCount,                                           sub: 'delivery errors',          color: failedCount > 0 ? '#f87171' : '#4ade80', icon: <AlertTriangle className="w-4 h-4" /> },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: '#111318', border: '1px solid #232731' }}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: s.color }} className="opacity-60">{s.icon}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{s.label}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-600 mt-1 truncate">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Duplicate alert */}
        {dupCount > 0 && !dupAlertDismissed && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
            <span>⚠️</span>
            <span className="flex-1 text-xs sm:text-sm"><strong>{dupCount} emails</strong> may be accidental duplicate sends.</span>
            <button onClick={() => setDupAlertDismissed(true)} className="text-amber-400 hover:text-amber-300 text-lg opacity-70">✕</button>
          </div>
        )}

        {/* Toolbar */}
        <div className="space-y-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Tabs */}
            <div className="flex rounded-lg p-1 gap-0.5 flex-shrink-0 overflow-x-auto"
              style={{ background: '#111318', border: '1px solid #232731' }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => { setTab(t.key); setExpandedIdx(null) }}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${tab === t.key ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  style={tab === t.key ? { background: '#1c2029' } : {}}>
                  {t.label}
                  <span className="ml-1.5 font-mono text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background: tab === t.key ? 'rgba(249,115,22,0.1)' : '#1c2029',
                      color: tab === t.key ? '#f97316' : '#6b7280',
                      border: `1px solid ${tab === t.key ? 'rgba(249,115,22,0.25)' : '#232731'}`,
                    }}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer…"
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#111318', border: '1px solid #232731', color: '#e8eaf0' }} />
            </div>

            {/* Filter toggle (mobile) */}
            <button onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden px-3 py-2 rounded-lg text-xs font-medium text-gray-500 flex items-center gap-1.5"
              style={{ background: '#111318', border: '1px solid #232731' }}>
              Filters <ChevronDown className={`w-3.5 h-3.5 transition ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Filters desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <select value={sentBy} onChange={e => setSentBy(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs outline-none cursor-pointer"
                style={{ background: '#111318', border: '1px solid #232731', color: '#6b7280' }}>
                <option value="">All senders</option>
                {senders.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs outline-none cursor-pointer"
                style={{ background: '#111318', border: '1px solid #232731', color: '#6b7280' }}>
                <option value="">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>
          </div>

          {/* Mobile filters */}
          {showFilters && (
            <div className="flex gap-2 sm:hidden">
              <select value={sentBy} onChange={e => setSentBy(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: '#111318', border: '1px solid #232731', color: '#6b7280' }}>
                <option value="">All senders</option>
                {senders.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: '#111318', border: '1px solid #232731', color: '#6b7280' }}>
                <option value="">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-600 mb-3">
          Showing <strong className="text-white">{filtered.length}</strong> of {allEmails.length} emails
        </div>

        {/* Email list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-4xl mb-3 opacity-40">📭</div>
            <div className="text-sm font-semibold mb-1">No emails found</div>
            <div className="text-xs text-gray-700">Try adjusting your search or filters</div>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.label} className="mb-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-700 py-2.5 px-1">
                {group.label}
              </div>
              {group.emails.map(email => {
                const isExpanded = expandedIdx === email.globalIdx
                const cfg = getTypeConfig(email.type)
                const isReminder = email.type === 'payment_reminder'
                const isQ = email.type === 'quote'
                const isSched = email.type === 'schedule'

                return (
                  <div key={`${email.project_id}-${email.type}-${email.sent_at}`}
                    className="rounded-xl overflow-hidden mb-1 transition-colors"
                    style={{
                      background: '#111318',
                      border: `1px solid ${isExpanded ? cfg.border : email.isDup ? 'rgba(251,191,36,0.25)' : '#232731'}`,
                    }}>

                    {/* Row header */}
                    <div onClick={() => toggleRow(email.globalIdx)}
                      className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-3.5 cursor-pointer select-none">
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                        {cfg.emoji}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-medium text-white truncate">{email.customer_name}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                          </span>
                          {email.status === 'failed' && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                              ✗ Failed
                            </span>
                          )}
                          {email.isDup && email.status !== 'failed' && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                              ⚠ dup
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {isQ && <>Quote → <span className="text-gray-400">{email.customer_email}</span></>}
                          {isSched && 'Schedule confirmation'}
                          {isReminder && (
                            <span>
                              Payment reminder
                              {email.amount_due && <span className="text-orange-400 font-semibold ml-1">{fmtMoney(email.amount_due)} due</span>}
                              {email.days_overdue && <span className="text-red-400 ml-1">· {email.days_overdue}d overdue</span>}
                            </span>
                          )}
                          {!isQ && !isSched && !isReminder && <span className="text-gray-400">{email.customer_email}</span>}
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {isQ && <span className="font-mono text-sm font-medium text-orange-400">{fmtMoney(email.quote_total)}</span>}
                        {isSched && email.scheduled_date && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: '#60a5fa', background: 'rgba(96,165,250,0.1)' }}>
                            {fmtDate(email.scheduled_date)}
                          </span>
                        )}
                        {isReminder && email.amount_due && (
                          <span className="font-mono text-sm font-medium text-orange-400">{fmtMoney(email.amount_due)}</span>
                        )}
                        <span className="font-mono text-xs text-gray-600">{timeAgo(email.sent_at)}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t" style={{ borderColor: '#232731' }}>
                        <div className="flex flex-col lg:flex-row">
                          {/* Main content */}
                          <div className="flex-1 p-4 sm:p-5">
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3">
                              {isQ ? 'Quote breakdown' : isSched ? 'Schedule details' : isReminder ? 'Reminder details' : 'Details'}
                            </div>

                            {isQ && (
                              <>
                                {/* Mobile: stacked cards */}
                                <div className="sm:hidden space-y-2.5">
                                  {(email.quote_data || []).map((item, i) => (
                                    <div key={i} className="rounded-lg p-3" style={{ background: '#0a0c10', border: '1px solid #232731' }}>
                                      <p className="text-sm text-white mb-2">{item.description || '—'}</p>
                                      <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Qty: {item.quantity || 1}</span>
                                        <span>@ {fmtMoney(item.unitPrice ?? item.amount / (item.quantity || 1))}</span>
                                        <span className="font-mono font-semibold text-white">{fmtMoney(item.amount)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {/* Desktop: table */}
                                <table className="hidden sm:table w-full" style={{ borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr>
                                      {['Description', 'Qty', 'Unit price', 'Amount'].map(h => (
                                        <th key={h} className="text-left text-xs text-gray-700 font-medium uppercase tracking-wider pb-2 border-b"
                                          style={{ borderColor: '#232731', textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(email.quote_data || []).map((item, i) => (
                                      <tr key={i}>
                                        <td className="py-2.5 text-sm border-b" style={{ borderColor: '#232731' }}>{item.description || '—'}</td>
                                        <td className="py-2.5 text-sm text-gray-500 border-b" style={{ borderColor: '#232731' }}>{item.quantity || 1}</td>
                                        <td className="py-2.5 text-sm text-gray-500 border-b" style={{ borderColor: '#232731' }}>{fmtMoney(item.unitPrice ?? item.amount / (item.quantity || 1))}</td>
                                        <td className="py-2.5 text-sm text-right font-mono border-b" style={{ borderColor: '#232731' }}>{fmtMoney(item.amount)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div className="flex justify-between items-center pt-3 mt-1 border-t" style={{ borderColor: '#232731' }}>
                                  <span className="text-sm font-semibold text-white">Total</span>
                                  <span className="text-xl font-bold font-mono text-orange-400">{fmtMoney(email.quote_total)}</span>
                                </div>
                              </>
                            )}

                            {isSched && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[
                                  { label: 'Date',     value: fmtDate(email.scheduled_date) || 'Not set',                           highlight: true  },
                                  { label: 'Time',     value: email.scheduled_time ? fmtScheduleTime(email.scheduled_time) : 'Not set', highlight: true  },
                                  { label: 'Customer', value: email.customer_name,                                                   highlight: false },
                                ].map(f => (
                                  <div key={f.label}>
                                    <div className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-1">{f.label}</div>
                                    <div className="text-sm font-medium" style={{ color: f.highlight ? '#60a5fa' : '#e8eaf0' }}>{f.value}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {isReminder && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[
                                  { label: 'Amount Due',   value: email.amount_due ? fmtMoney(email.amount_due) : '—',              color: '#fb923c' },
                                  { label: 'Days Overdue', value: email.days_overdue ? `${email.days_overdue} days` : '—',          color: '#f87171' },
                                  { label: 'Customer',     value: email.customer_name,                                              color: '#e8eaf0' },
                                ].map(f => (
                                  <div key={f.label}>
                                    <div className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-1">{f.label}</div>
                                    <div className="text-sm font-semibold" style={{ color: f.color }}>{f.value}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {!isQ && !isSched && !isReminder && (
                              <p className="text-sm text-gray-500">No additional details available.</p>
                            )}
                          </div>

                          {/* Sidebar */}
                          <div className="p-4 sm:p-5 border-t lg:border-t-0 lg:border-l lg:w-64"
                            style={{ background: '#161921', borderColor: '#232731' }}>
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3">Details</div>
                            <div className="space-y-3">
                              {[
                                { k: 'Sent', v: `${fmtDate(email.sent_at)} ${fmtTime(email.sent_at)}` },
                                { k: 'From', v: email.sent_by_email },
                                { k: 'To',   v: email.customer_email },
                              ].map(m => (
                                <div key={m.k} className="flex justify-between items-start gap-2">
                                  <span className="text-xs text-gray-700 uppercase tracking-wider font-medium flex-shrink-0">{m.k}</span>
                                  <span className="text-xs text-gray-500 text-right break-all">{m.v}</span>
                                </div>
                              ))}
                              {email.isDup && (
                                <>
                                  <hr style={{ border: 'none', borderTop: '1px solid #232731' }} />
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-700 uppercase tracking-wider font-medium">Note</span>
                                    <span className="text-xs text-amber-400">Possible duplicate</span>
                                  </div>
                                </>
                              )}
                            </div>
                            <a href={`/${company.slug}/dashboard?project=${email.project_id}`}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 mt-4 rounded-lg text-xs text-gray-500 hover:text-white no-underline transition"
                              style={{ background: '#1c2029', border: '1px solid #2e3340' }}>
                              <ExternalLink className="w-3.5 h-3.5" /> Open Project #{email.project_id}
                            </a>
                            {email.subject && (
                              <div className="mt-3 pt-3 border-t" style={{ borderColor: '#232731' }}>
                                <div className="text-xs text-gray-700 uppercase tracking-wider font-medium mb-1">Subject</div>
                                <div className="text-xs text-gray-400">{email.subject}</div>
                              </div>
                            )}
                            {email.html_body && (
  <button
    onClick={(e) => { 
      e.stopPropagation(); 
      setPreviewHtml(email.html_body ?? null) 
    }}
    className="flex items-center justify-center gap-1.5 px-3 py-2 mt-4 rounded-lg text-xs text-gray-500 hover:text-white no-underline transition"
    style={{ background: '#1c2029', border: '1px solid #2e3340' }}>
    Preview Email
  </button>
)}
                            {email.error_message && (
                              <div className="mt-3 pt-3 border-t" style={{ borderColor: '#232731' }}>
                                <div className="text-xs text-red-400 uppercase tracking-wider font-medium mb-1">Error</div>
                                <div className="text-xs text-red-300">{email.error_message}</div>
                              </div>
                            )}
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

      {/* Email Preview Modal */}
    {previewHtml && (
  <div
    className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
    onClick={() => setPreviewHtml(null)} // click outside closes
  >
    <div
      className="bg-[#111318] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-auto p-4 relative"
      onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
    >
      {/* Close button */}
      <button
        onClick={() => setPreviewHtml(null)}
        className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg"
      >
        ✕
      </button>

      {/* Email content */}
      <div
        className="w-full overflow-auto border rounded p-2"
        style={{
          background: '#111318',
          color: '#e8eaf0',
          pointerEvents: 'none', // disables links/buttons
        }}
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
    </div>
  </div>
)}
    </div>
  )
}