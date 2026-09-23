'use client'

import { useState, useMemo, useEffect } from 'react'
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
  CheckCircle2,
  AlertCircle
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
function getTypeConfig(type: string, kind?: string | null) {
  if (type === 'invoice') {
    if (kind === 'deposit') {
      return { 
        label: 'Deposit Request', 
        icon: <DollarSign className="w-4 h-4" />, 
        badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
        iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
      }
    }
    if (kind === 'balance') {
      return { 
        label: 'Balance Request', 
        icon: <DollarSign className="w-4 h-4" />, 
        badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
        iconBg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400'
      }
    }
    return { 
      label: 'Invoice', 
      icon: <FileText className="w-4 h-4" />, 
      badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
    }
  }
  switch (type) {
    case 'quote':
      return { 
        label: 'Quote', 
        icon: <DollarSign className="w-4 h-4" />, 
        badgeBg: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30',
        iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400'
      }
    case 'schedule':
      return { 
        label: 'Schedule', 
        icon: <Calendar className="w-4 h-4" />, 
        badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
        iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
      }
    case 'payment_reminder':
      return { 
        label: 'Payment Reminder', 
        icon: <Bell className="w-4 h-4" />, 
        badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
        iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'
      }
    default:
      return { 
        label: type, 
        icon: <Mail className="w-4 h-4" />, 
        badgeBg: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30',
        iconBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
      }
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
      invoice_kind: metadata.kind || null,
      invoice_amount: metadata.amount != null ? parseFloat(metadata.amount) : null,
      invoice_project_total: metadata.invoice_total != null ? parseFloat(metadata.invoice_total) : null,
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
  // Initialize dark mode state safely
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem('outbox-theme')
    if (saved !== null) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Sync dark class directly onto root <html> tag for Tailwind dark variant support
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('outbox-theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('outbox-theme', 'light')
    }
  }, [isDark])

  const [tab, setTab] = useState<'all' | 'quote' | 'schedule' | 'payment_reminder' | 'invoice'>('all')
  const [outboxPage, setOutboxPage] = useState(1)
  const [allOutboxEmails, setAllOutboxEmails] = useState<OutboxEmail[]>(outboxEmails)
  const [loadingMore, setLoadingMore] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
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
    if (mounted) fetchFiltered()
  }, [tab])

  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [dupAlertDismissed, setDupAlertDismissed] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)

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
    { key: 'invoice',          label: 'Invoices',  count: typeCountMap['invoice'] ?? allEmails.filter(e => e.type === 'invoice').length },
  ] as const

  const toggleRow = (idx: number) => setExpandedIdx(prev => prev === idx ? null : idx)

  const clearFilters = () => {
    setSearch('')
    setDateRange('')
    setTab('all')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a 
            href={`/${company.slug}/dashboard`} 
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800" />
          <div>
            <h1 className="text-base font-semibold text-slate-900 dark:text-white">Outbox</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{company.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(v => !v)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hidden sm:inline">Connected</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* Header & Main Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">Communication Logs</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">Outbox Delivery History</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-xl">
              Track, verify, and review every customer email dispatched across all company projects.
            </p>
          </div>

          {/* Total Metric Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm min-w-[180px]">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total System Emails</span>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {totalStats?.sent ?? allEmails.length}
            </div>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Sent</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalStats?.sent ?? allEmails.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Quoted Value</span>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">{fmtMoney(totalStats?.revenue ?? totalQuoteVal)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Reminders Sent</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">{totalStats?.reminders ?? reminderCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Delivery Errors</span>
            <p className={`text-2xl font-bold mt-2 ${(totalStats?.failed ?? failedCount) > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {totalStats?.failed ?? failedCount}
            </p>
          </div>
        </div>

        {/* Duplicate Alert Banner */}
        {dupCount > 0 && !dupAlertDismissed && (
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-sm font-medium">
                <strong>{dupCount} potential duplicate emails</strong> detected (multiple sends within short intervals).
              </span>
            </div>
            <button 
              onClick={() => setDupAlertDismissed(true)} 
              className="p-1 rounded-lg hover:bg-amber-500/20 transition-colors text-amber-700 dark:text-amber-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Controls: Navigation Tabs & Search/Filters */}
        <div className="space-y-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-300/50 dark:border-slate-800 overflow-x-auto">
            {tabs.map(t => {
              const isActive = tab === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setExpandedIdx(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{t.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-slate-100 dark:bg-blue-700 text-slate-800 dark:text-white' 
                      : 'bg-slate-300/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {t.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Filter Controls Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by customer name or email address..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>

            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 hover:bg-red-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count Banner */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filtered.length}</strong> of {allEmails.length} messages
          </span>
          {hasActiveFilters && <span className="text-blue-600 dark:text-blue-400 font-semibold">• Filters Active</span>}
        </div>

        {/* Email Feed */}
        <div className="space-y-6">
          {filtered.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <Mail className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No emails match your filter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search criteria or switching tabs.</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  Clear current filters
                </button>
              )}
            </div>
          ) : (
            grouped.map(group => (
              <div key={group.label} className="space-y-3">
                
                {/* Group Section Header */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{group.label}</span>
                  <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{group.emails.length}</span>
                </div>

                {/* List of Email Cards */}
                <div className="space-y-2.5">
                  {group.emails.map(email => {
                    const isExpanded = expandedIdx === email.globalIdx
                    const cfg = getTypeConfig(email.type, email.invoice_kind)
                    const isQ = email.type === 'quote'
                    const isSched = email.type === 'schedule'
                    const isReminder = email.type === 'payment_reminder'
                    const isInvoice = email.type === 'invoice'

                    return (
                      <div
                        key={`${email.project_id}-${email.type}-${email.sent_at}-${email.globalIdx}`}
                        className={`rounded-xl border transition-all duration-150 overflow-hidden ${
                          isExpanded 
                            ? 'bg-white dark:bg-slate-900 border-blue-500 dark:border-blue-500 shadow-md ring-1 ring-blue-500/20' 
                            : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                        }`}
                      >
                        {/* Row Summary Bar */}
                        <div
                          onClick={() => toggleRow(email.globalIdx)}
                          className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            
                            {/* Type Icon */}
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-medium ${cfg.iconBg}`}>
                              {cfg.icon}
                            </div>

                            {/* Customer & Type Badges */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${cfg.badgeBg}`}>
                                  {cfg.label}
                                </span>

                                {email.status === 'failed' && (
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Failed
                                  </span>
                                )}

                                {email.isDup && email.status !== 'failed' && (
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                    Duplicate
                                  </span>
                                )}
                              </div>

                              <div className="flex items-baseline gap-2">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {email.customer_name || 'Unnamed Client'}
                                </h4>
                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate hidden md:inline">
                                  • {email.customer_email}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Middle Key Metrics */}
                          <div className="hidden lg:flex items-center gap-6 shrink-0 px-4">
                            {isQ && (email.quote_total ?? 0) > 0 && (
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quote Total</span>
                                <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400">{fmtMoney(email.quote_total)}</span>
                              </div>
                            )}
                            {isSched && email.scheduled_date && (
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scheduled</span>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{fmtDate(email.scheduled_date)}</span>
                              </div>
                            )}
                            {isReminder && (email.amount_due ?? 0) > 0 && (
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Amount Due</span>
                                <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">{fmtMoney(email.amount_due)}</span>
                              </div>
                            )}
                            {isInvoice && (email.invoice_amount ?? 0) > 0 && (
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invoice Amount</span>
                                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{fmtMoney(email.invoice_amount)}</span>
                              </div>
                            )}
                          </div>

                          {/* Timestamp & Accordion Chevron */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {mounted ? timeAgo(email.sent_at) : fmtDate(email.sent_at)}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500">{fmtTime(email.sent_at)}</p>
                            </div>
                            <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details Body */}
                        {isExpanded && (
                          <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Left Columns: Main Item Content */}
                            <div className="lg:col-span-2 space-y-4">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {isQ ? 'Quote Items' : isSched ? 'Schedule Specification' : isReminder ? 'Payment Due Info' : isInvoice ? 'Invoice Details' : 'Message Context'}
                              </h5>

                              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                {isQ && (
                                  <>
                                    <div className="space-y-3">
                                      {(email.quote_data || []).length === 0 ? (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">No line items available.</p>
                                      ) : (
                                        (email.quote_data || []).map((item, idx) => (
                                          <div key={idx} className="flex justify-between items-start gap-4 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                                            <div>
                                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.description || 'Custom Item'}</p>
                                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                Qty: {item.quantity || 1} • {fmtMoney(item.unitPrice ?? (item.amount / (item.quantity || 1)))} each
                                              </p>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{fmtMoney(item.amount)}</span>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Quoted</span>
                                      <span className="text-lg font-extrabold text-orange-600 dark:text-orange-400">{fmtMoney(email.quote_total)}</span>
                                    </div>
                                  </>
                                )}

                                {isSched && (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <div>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Date</span>
                                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{fmtDate(email.scheduled_date)}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Time</span>
                                      <span className="text-sm font-bold text-slate-900 dark:text-white">{email.scheduled_time ? fmtScheduleTime(email.scheduled_time) : 'Not specified'}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Assigned To</span>
                                      <span className="text-sm font-bold text-slate-900 dark:text-white">{email.assigned_to || 'Unassigned'}</span>
                                    </div>
                                  </div>
                                )}

                                {isReminder && (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <div>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Amount Due</span>
                                      <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">{fmtMoney(email.amount_due)}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Due Date</span>
                                      <span className="text-sm font-bold text-slate-900 dark:text-white">{fmtDate(email.due_date)}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Client</span>
                                      <span className="text-sm font-bold text-slate-900 dark:text-white">{email.customer_name}</span>
                                    </div>
                                  </div>
                                )}

                                {isInvoice && (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <div>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                                        {email.invoice_kind === 'deposit' ? 'Deposit Required' : email.invoice_kind === 'balance' ? 'Balance Due' : 'Invoice Amount'}
                                      </span>
                                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{fmtMoney(email.invoice_amount)}</span>
                                    </div>
                                    {email.invoice_project_total && (
                                      <div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 block">Project Total</span>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{fmtMoney(email.invoice_project_total)}</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Recipient</span>
                                      <span className="text-sm font-bold text-slate-900 dark:text-white">{email.customer_name}</span>
                                    </div>
                                  </div>
                                )}

                                {!isQ && !isSched && !isReminder && !isInvoice && (
                                  <p className="text-sm text-slate-700 dark:text-slate-300">{email.subject || 'No details provided.'}</p>
                                )}
                              </div>
                            </div>

                            {/* Right Column: Metadata & Quick Actions */}
                            <div className="space-y-4">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Metadata</h5>
                              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 text-xs">
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-slate-400">Sent At:</span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{fmtDate(email.sent_at)} {fmtTime(email.sent_at)}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-slate-400">Sender:</span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{email.sent_by_email}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-slate-400">Recipient:</span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{email.customer_email}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-slate-400">Status:</span>
                                  <span className={`font-bold ${email.status === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {email.status || 'sent'}
                                  </span>
                                </div>

                                {email.error_message && (
                                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-red-600 dark:text-red-400">
                                    <p className="font-bold">Error Log:</p>
                                    <p className="mt-0.5">{email.error_message}</p>
                                  </div>
                                )}
                              </div>

                              {email.subject && (
                                <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm">
                                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wide block mb-0.5">Subject</span>
                                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{email.subject}</p>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="space-y-2 pt-1">
                                {email.html_body && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setPreviewHtml(email.html_body ?? null); }}
                                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5" /> Preview HTML Content
                                  </button>
                                )}
                                <a
                                  href={`/${company.slug}/dashboard?lead=${email.lead_id}`}
                                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" /> Open Project Dashboard
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center pt-6">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {loadingMore ? 'Fetching Emails...' : `Load More Messages (${tabTotal - allOutboxEmails.length} remaining)`}
            </button>
          </div>
        )}
      </main>
      {/* Fullscreen Email Preview Modal */}
      {previewHtml && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6"
          onClick={() => setPreviewHtml(null)}
        >
          <div
            className="relative w-full max-w-3xl h-[90vh] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">Rendered HTML Email Preview</span>
              </div>
              <button
                onClick={() => setPreviewHtml(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-slate-100 dark:bg-slate-950">
              <iframe
                title="Email preview"
                srcDoc={`${previewHtml}<style>a,button{pointer-events:none!important;}*{user-select:none!important;}</style>`}
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