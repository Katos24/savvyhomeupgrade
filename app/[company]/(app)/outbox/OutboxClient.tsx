'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Mail,
  Calendar,
  DollarSign,
  AlertTriangle,
  ChevronDown,
  Bell,
  X,
  FileText,
  ExternalLink,
  AlertCircle,
  Receipt,
} from 'lucide-react'

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
  invoice_kind?: string | null
  invoice_amount?: number | null
  invoice_project_total?: number | null
  has_body?: boolean
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
  /** The list API leaves out html_body (too heavy) and sends this flag instead. */
  has_body?: boolean
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
  if (!Number.isFinite(hour)) return t
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
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

// One label + icon per email type. No per-type colors.
function typeInfo(type: string, kind?: string | null) {
  if (type === 'invoice') {
    if (kind === 'deposit') return { label: 'Deposit request', Icon: DollarSign }
    if (kind === 'balance') return { label: 'Balance invoice', Icon: Receipt }
    return { label: 'Invoice', Icon: Receipt }
  }
  switch (type) {
    case 'quote':
      return { label: 'Quote', Icon: FileText }
    case 'schedule':
      return { label: 'Schedule', Icon: Calendar }
    case 'payment_reminder':
      return { label: 'Payment reminder', Icon: Bell }
    default:
      return { label: type.replace(/_/g, ' '), Icon: Mail }
  }
}

// The money (or date) that matters for each email, shown on the row.
function headline(e: FlatEmail): string | null {
  if (e.type === 'quote' && (e.quote_total ?? 0) > 0) return fmtMoney(e.quote_total)
  if (e.type === 'invoice' && (e.invoice_amount ?? 0) > 0) return fmtMoney(e.invoice_amount)
  if (e.type === 'payment_reminder' && (e.amount_due ?? 0) > 0) return fmtMoney(e.amount_due)
  if (e.type === 'schedule' && e.scheduled_date) {
    return `${fmtDate(e.scheduled_date)}${e.scheduled_time ? ` · ${fmtScheduleTime(e.scheduled_time)}` : ''}`
  }
  return null
}

// Preview is look-only: the frame is fully sandboxed (no scripts, forms or
// navigation) and every clickable thing has clicks turned off, so a Pay or
// Accept button inside the email can't be pressed. Scrolling still works.
const READ_ONLY_CSS =
  '<style>a,button,input,select,textarea,label,form,area,summary,[role="button"],[onclick]{pointer-events:none!important;cursor:default!important}</style>'

function readOnlyDoc(html: string): string {
  return `${html}${READ_ONLY_CSS}`
}

function buildEmailList(projects: Project[], outboxEmails: OutboxEmail[] = []): FlatEmail[] {
  const all: FlatEmail[] = []

  outboxEmails.forEach((e) => {
    let metadata: any = {}
    try {
      metadata = typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata || {}
    } catch {
      metadata = {}
    }
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
      invoice_kind: metadata.kind || null,
      invoice_amount: metadata.amount != null ? parseFloat(metadata.amount) : null,
      invoice_project_total: metadata.invoice_total != null ? parseFloat(metadata.invoice_total) : null,
      source: 'outbox',
      status: e.status as 'sent' | 'failed',
      error_message: e.error_message,
      subject: e.subject,
      html_body: e.html_body,
      has_body: !!e.html_body || !!e.has_body,
      outbox_id: e.id,
    })
  })

  projects.forEach((p) => {
    const qEmails = p.quote_emails || []
    const sEmails = p.schedule_emails || []

    const isInOutbox = (sentAt: string, projectId: number) => {
      const t = new Date(sentAt).getTime()
      return outboxEmails.some((oe) => oe.project_id === projectId && Math.abs(new Date(oe.created_at).getTime() - t) < 5000)
    }

    const isDupInArray = <T extends { sent_at: string }>(arr: T[], keyFn: (e: T) => string, idx: number) => {
      const tThis = new Date(arr[idx].sent_at).getTime()
      return arr.some(
        (o, j) => j !== idx && keyFn(o) === keyFn(arr[idx]) && Math.abs(tThis - new Date(o.sent_at).getTime()) < 10 * 60 * 1000
      )
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
        isDup: isDupInArray(qEmails, (e) => String(e.quote_total), i),
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
        isDup: isDupInArray(sEmails, (e) => `${e.scheduled_date}|${e.scheduled_time}`, i),
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

// Same light/dark choice as the dashboard (key + event from CompanyDashboardClient).
function useDashboardTheme() {
  const [isDark, setIsDark] = useState(true)
  useEffect(() => {
    const read = () => {
      try {
        setIsDark(localStorage.getItem('dashboard-theme') !== 'light')
      } catch {}
    }
    read()
    window.addEventListener('theme-changed', read)
    window.addEventListener('storage', read)
    return () => {
      window.removeEventListener('theme-changed', read)
      window.removeEventListener('storage', read)
    }
  }, [])
  return isDark
}

function tokens(isDark: boolean) {
  return isDark
    ? {
        page: 'bg-[#0b0f17]',
        card: 'bg-[#0f1420] border border-white/10',
        text: 'text-white',
        sub: 'text-slate-400',
        faint: 'text-slate-500',
        border: 'border-white/10',
        divide: 'divide-white/10',
        hover: 'hover:bg-white/[0.04]',
        inset: 'bg-white/[0.03]',
        input: 'bg-[#0f1420] border-white/10 text-white placeholder-slate-500 focus:border-white/30',
        icon: 'bg-white/[0.06] text-slate-300',
        segment: 'bg-white/[0.04] border-white/10',
        segOn: 'bg-white text-slate-900',
        segOff: 'text-slate-400 hover:text-white',
        primary: 'bg-white text-slate-900 hover:bg-slate-100',
        secondary: 'border-white/10 text-slate-200 hover:bg-white/[0.06]',
      }
    : {
        page: 'bg-slate-50',
        card: 'bg-white border border-slate-200',
        text: 'text-slate-900',
        sub: 'text-slate-500',
        faint: 'text-slate-400',
        border: 'border-slate-200',
        divide: 'divide-slate-100',
        hover: 'hover:bg-slate-50',
        inset: 'bg-slate-50',
        input: 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400',
        icon: 'bg-slate-100 text-slate-600',
        segment: 'bg-white border-slate-200',
        segOn: 'bg-slate-900 text-white',
        segOff: 'text-slate-500 hover:text-slate-900',
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        secondary: 'border-slate-200 text-slate-700 hover:bg-slate-50',
      }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function OutboxClient({ company, projects, outboxEmails = [], totalEmails, totalStats, typeCountMap = {} }: Props) {
  const isDark = useDashboardTheme()
  const t = tokens(isDark)

  const [tab, setTab] = useState<'all' | 'quote' | 'schedule' | 'payment_reminder' | 'invoice'>('all')
  const [outboxPage, setOutboxPage] = useState(1)
  const [allOutboxEmails, setAllOutboxEmails] = useState<OutboxEmail[]>(outboxEmails)
  const [loadingMore, setLoadingMore] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    let alive = true
    const fetchFiltered = async () => {
      setLoadingMore(true)
      try {
        const typeParam = tab !== 'all' ? `&type=${tab}` : ''
        const res = await fetch(`/api/company/${company.slug}/outbox?page=1${typeParam}`)
        const data = await res.json()
        if (alive && data.success) {
          setAllOutboxEmails(data.emails)
          setOutboxPage(1)
        }
      } catch {
        // keep what's on screen
      } finally {
        if (alive) setLoadingMore(false)
      }
    }
    fetchFiltered()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [dupAlertDismissed, setDupAlertDismissed] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)

  const hasActiveFilters = !!(search || dateRange)
  const tabTotal = tab === 'all' ? totalEmails ?? 0 : typeCountMap[tab] ?? 0
  const hasMore = allOutboxEmails.length < tabTotal

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const nextPage = outboxPage + 1
      const typeParam = tab !== 'all' ? `&type=${tab}` : ''
      const res = await fetch(`/api/company/${company.slug}/outbox?page=${nextPage}${typeParam}`)
      const data = await res.json()
      if (data.success) {
        setAllOutboxEmails((prev) => [...prev, ...data.emails])
        setOutboxPage(nextPage)
      }
    } catch {
      // keep what's on screen
    } finally {
      setLoadingMore(false)
    }
  }

  const allEmails = useMemo(() => buildEmailList(projects, allOutboxEmails), [projects, allOutboxEmails])

  const filtered = useMemo(() => {
    const now = new Date()
    const q = search.trim().toLowerCase()
    return allEmails.filter((e) => {
      if (tab !== 'all' && e.type !== tab) return false
      if (q && !e.customer_name.toLowerCase().includes(q) && !e.customer_email.toLowerCase().includes(q)) return false
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
    filtered.forEach((email) => {
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

  const dupCount = allEmails.filter((e) => e.isDup).length
  const failedCount = totalStats?.failed ?? allEmails.filter((e) => e.status === 'failed').length
  const sentCount = totalStats?.sent ?? allEmails.length

  const tabs = [
    { key: 'all', label: 'All', count: totalEmails ?? allEmails.length },
    { key: 'quote', label: 'Quotes', count: typeCountMap['quote'] ?? allEmails.filter((e) => e.type === 'quote').length },
    { key: 'invoice', label: 'Invoices', count: typeCountMap['invoice'] ?? allEmails.filter((e) => e.type === 'invoice').length },
    { key: 'schedule', label: 'Schedules', count: typeCountMap['schedule'] ?? allEmails.filter((e) => e.type === 'schedule').length },
    {
      key: 'payment_reminder',
      label: 'Reminders',
      count: typeCountMap['payment_reminder'] ?? allEmails.filter((e) => e.type === 'payment_reminder').length,
    },
  ] as const

  const toggleRow = (idx: number) => setExpandedIdx((prev) => (prev === idx ? null : idx))

  const clearFilters = () => {
    setSearch('')
    setDateRange('')
    setTab('all')
  }

  const msg = (text: string) => `<p style="padding:32px;font-family:sans-serif;color:#64748b">${text}</p>`

  // The list doesn't carry email bodies; load the one clicked.
  const openPreview = async (email: FlatEmail) => {
    if (email.html_body) {
      setPreviewHtml(email.html_body)
      return
    }
    if (!email.outbox_id || !email.lead_id) {
      setPreviewHtml(msg('Preview unavailable for this email.'))
      return
    }
    setPreviewHtml(msg('Loading preview…'))
    try {
      const res = await fetch(
        `/api/company/${company.slug}/outbox-preview?lead_id=${email.lead_id}&body=1&entry_id=${email.outbox_id}`
      )
      const data = await res.json()
      setPreviewHtml(data?.entry?.html_body || msg('Preview unavailable for this email.'))
    } catch {
      setPreviewHtml(msg('Could not load the preview. Try again.'))
    }
  }

  return (
    <div className={`min-h-screen transition-colors ${t.page}`}>
      <main className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <header>
          <Link href={`/${company.slug}/dashboard`} className={`inline-flex items-center gap-1 text-xs font-semibold ${t.sub} hover:opacity-80`}>
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h1 className={`text-2xl font-semibold tracking-tight sm:text-3xl ${t.text}`}>Outbox</h1>
              <p className={`mt-0.5 text-sm ${t.sub}`}>Every email sent to your customers.</p>
            </div>
            <p className={`text-sm ${t.sub}`}>
              <span className={`font-semibold tabular-nums ${t.text}`}>{sentCount.toLocaleString()}</span> sent
              {failedCount > 0 && (
                <>
                  {' · '}
                  <span className="font-semibold text-red-500">{failedCount} failed</span>
                </>
              )}
            </p>
          </div>
        </header>

        {/* Duplicate notice */}
        {dupCount > 0 && !dupAlertDismissed && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <p className={`flex items-center gap-2 text-sm ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
              {dupCount} possible duplicate {dupCount === 1 ? 'email' : 'emails'}: the same thing sent twice within a few minutes.
            </p>
            <button
              onClick={() => setDupAlertDismissed(true)}
              aria-label="Dismiss"
              className={`shrink-0 rounded-lg p-1 ${isDark ? 'text-amber-300 hover:bg-amber-500/20' : 'text-amber-700 hover:bg-amber-500/20'}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className={`flex gap-1 overflow-x-auto rounded-xl border p-1 ${t.segment}`}>
          {tabs.map((tb) => {
            const on = tab === tb.key
            return (
              <button
                key={tb.key}
                onClick={() => {
                  setTab(tb.key)
                  setExpandedIdx(null)
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${on ? t.segOn : t.segOff}`}
              >
                {tb.label}
                <span className={`text-xs tabular-nums ${on ? 'opacity-70' : t.faint}`}>{tb.count}</span>
              </button>
            )
          })}
        </div>

        {/* Search + date */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${t.faint}`} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name or email"
              className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none transition ${t.input}`}
            />
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={`rounded-xl border px-3 py-2.5 text-sm outline-none ${t.input}`}
          >
            <option value="">All time</option>
            <option value="today">Today</option>
            <option value="week">Past 7 days</option>
            <option value="month">Past 30 days</option>
          </select>
          {hasActiveFilters && (
            <button onClick={clearFilters} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${t.secondary}`}>
              Clear
            </button>
          )}
        </div>

        {/* Feed */}
        {filtered.length === 0 ? (
          <div className={`rounded-2xl px-6 py-14 text-center ${t.card}`}>
            <Mail className={`mx-auto h-8 w-8 ${t.faint}`} />
            <p className={`mt-3 text-sm font-semibold ${t.text}`}>
              {allEmails.length === 0 ? 'No emails sent yet' : 'No emails match'}
            </p>
            <p className={`mt-1 text-xs ${t.sub}`}>
              {allEmails.length === 0
                ? 'Quotes, invoices, schedules and reminders you send will show up here.'
                : 'Try a different search or tab.'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className={`mt-3 text-xs font-semibold underline-offset-4 hover:underline ${t.text}`}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map((group) => (
              <section key={group.label}>
                <p className={`mb-2 px-1 text-xs font-semibold ${t.sub}`}>
                  {group.label} <span className={t.faint}>· {group.emails.length}</span>
                </p>
                <div className={`overflow-hidden rounded-2xl divide-y ${t.card} ${t.divide}`}>
                  {group.emails.map((email) => {
                    const isExpanded = expandedIdx === email.globalIdx
                    const { label, Icon } = typeInfo(email.type, email.invoice_kind)
                    const head = headline(email)
                    const failed = email.status === 'failed'
                    const isQ = email.type === 'quote'
                    const isSched = email.type === 'schedule'
                    const isReminder = email.type === 'payment_reminder'
                    const isInvoice = email.type === 'invoice'

                    return (
                      <div key={`${email.project_id}-${email.type}-${email.sent_at}-${email.globalIdx}`}>
                        {/* Row */}
                        <button
                          type="button"
                          onClick={() => toggleRow(email.globalIdx)}
                          aria-expanded={isExpanded}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${t.hover}`}
                        >
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${failed ? 'bg-red-500/10 text-red-500' : t.icon}`}>
                            {failed ? <AlertCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block truncate text-sm font-semibold ${t.text}`}>{email.customer_name || 'Unnamed customer'}</span>
                            <span className={`block truncate text-xs ${t.sub}`}>
                              {label}
                              {head ? ` · ${head}` : ''}
                              {failed && <span className="font-semibold text-red-500"> · Failed</span>}
                              {email.isDup && !failed && <span className="font-semibold text-amber-500"> · Possible duplicate</span>}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className={`block text-xs font-medium ${t.sub}`}>{mounted ? timeAgo(email.sent_at) : fmtDate(email.sent_at)}</span>
                            <span className={`block text-[11px] ${t.faint}`}>{fmtTime(email.sent_at)}</span>
                          </span>
                          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${t.faint} ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Details */}
                        {isExpanded && (
                          <div className={`space-y-4 border-t px-4 py-4 ${t.border} ${t.inset}`}>
                            {isQ && (
                              <div>
                                {(email.quote_data || []).length === 0 ? (
                                  <p className={`text-sm ${t.sub}`}>No line items saved for this quote.</p>
                                ) : (
                                  <div className={`divide-y text-sm ${t.divide}`}>
                                    {(email.quote_data || []).map((item, idx) => (
                                      <div key={idx} className="flex items-start justify-between gap-4 py-2">
                                        <span className="min-w-0">
                                          <span className={`block ${t.text}`}>{item.description || 'Item'}</span>
                                          <span className={`block text-xs ${t.sub}`}>
                                            {item.quantity || 1} × {fmtMoney(item.unitPrice ?? item.amount / (item.quantity || 1))}
                                          </span>
                                        </span>
                                        <span className={`shrink-0 font-semibold tabular-nums ${t.text}`}>{fmtMoney(item.amount)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className={`mt-1 flex justify-between border-t pt-2 text-sm ${t.border}`}>
                                  <span className={`font-semibold ${t.text}`}>Total</span>
                                  <span className={`font-semibold tabular-nums ${t.text}`}>{fmtMoney(email.quote_total)}</span>
                                </div>
                              </div>
                            )}

                            {(isSched || isReminder || isInvoice || (!isQ && !isSched && !isReminder && !isInvoice)) && (
                              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                                {isSched && (
                                  <>
                                    <div>
                                      <dt className={`text-xs ${t.sub}`}>Date</dt>
                                      <dd className={`font-semibold ${t.text}`}>{fmtDate(email.scheduled_date)}</dd>
                                    </div>
                                    <div>
                                      <dt className={`text-xs ${t.sub}`}>Time</dt>
                                      <dd className={`font-semibold ${t.text}`}>{email.scheduled_time ? fmtScheduleTime(email.scheduled_time) : 'Not set'}</dd>
                                    </div>
                                    <div>
                                      <dt className={`text-xs ${t.sub}`}>Crew</dt>
                                      <dd className={`font-semibold ${t.text}`}>{email.assigned_to || 'Unassigned'}</dd>
                                    </div>
                                  </>
                                )}
                                {isReminder && (
                                  <>
                                    <div>
                                      <dt className={`text-xs ${t.sub}`}>Amount due</dt>
                                      <dd className={`font-semibold tabular-nums ${t.text}`}>{fmtMoney(email.amount_due)}</dd>
                                    </div>
                                    <div>
                                      <dt className={`text-xs ${t.sub}`}>Due date</dt>
                                      <dd className={`font-semibold ${t.text}`}>{fmtDate(email.due_date)}</dd>
                                    </div>
                                  </>
                                )}
                                {isInvoice && (
                                  <>
                                    <div>
                                      <dt className={`text-xs ${t.sub}`}>
                                        {email.invoice_kind === 'deposit' ? 'Deposit' : email.invoice_kind === 'balance' ? 'Balance due' : 'Amount'}
                                      </dt>
                                      <dd className={`font-semibold tabular-nums ${t.text}`}>{fmtMoney(email.invoice_amount)}</dd>
                                    </div>
                                    {email.invoice_project_total ? (
                                      <div>
                                        <dt className={`text-xs ${t.sub}`}>Job total</dt>
                                        <dd className={`font-semibold tabular-nums ${t.text}`}>{fmtMoney(email.invoice_project_total)}</dd>
                                      </div>
                                    ) : null}
                                  </>
                                )}
                                <div>
                                  <dt className={`text-xs ${t.sub}`}>To</dt>
                                  <dd className={`truncate font-semibold ${t.text}`}>{email.customer_email || '—'}</dd>
                                </div>
                                <div>
                                  <dt className={`text-xs ${t.sub}`}>Sent by</dt>
                                  <dd className={`truncate font-semibold ${t.text}`}>{email.sent_by_email || 'Automatic'}</dd>
                                </div>
                                <div>
                                  <dt className={`text-xs ${t.sub}`}>Sent</dt>
                                  <dd className={`font-semibold ${t.text}`}>
                                    {fmtDate(email.sent_at)} {fmtTime(email.sent_at)}
                                  </dd>
                                </div>
                              </dl>
                            )}

                            {isQ && (
                              <p className={`text-xs ${t.sub}`}>
                                To {email.customer_email || '—'} · by {email.sent_by_email || 'Automatic'} · {fmtDate(email.sent_at)}{' '}
                                {fmtTime(email.sent_at)}
                              </p>
                            )}

                            {email.subject && (
                              <p className={`text-xs ${t.sub}`}>
                                Subject: <span className={t.text}>{email.subject}</span>
                              </p>
                            )}

                            {email.error_message && (
                              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
                                <span className="font-semibold">Why it failed:</span> {email.error_message}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {(email.html_body || (email.has_body && email.outbox_id && email.lead_id)) && (
                                <button
                                  type="button"
                                  onClick={() => openPreview(email)}
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${t.secondary}`}
                                >
                                  <Mail className="h-3.5 w-3.5" /> View email
                                </button>
                              )}
                              {email.lead_id ? (
                                <Link
                                  href={`/${company.slug}/dashboard?lead=${email.lead_id}`}
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${t.primary}`}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" /> Open job
                                </Link>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center pt-2">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${t.secondary}`}
            >
              {loadingMore ? 'Loading…' : `Load more (${tabTotal - allOutboxEmails.length} left)`}
            </button>
          </div>
        )}
      </main>

      {/* Email preview */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setPreviewHtml(null)}>
          <div
            className={`flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl shadow-2xl ${t.card}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between border-b px-5 py-3 ${t.border}`}>
              <span className={`text-sm font-semibold ${t.text}`}>Email as the customer saw it</span>
              <button onClick={() => setPreviewHtml(null)} aria-label="Close" className={`rounded-lg p-1.5 ${t.sub} ${t.hover}`}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-white">
              <iframe
                title="Email preview"
                srcDoc={readOnlyDoc(previewHtml)}
                className="h-full w-full border-0 bg-white"
                sandbox=""
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}