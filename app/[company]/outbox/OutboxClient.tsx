'use client'

import { useState, useMemo } from 'react'

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
  type: 'quote' | 'schedule'
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
}

interface Props {
  company: { id: number; name: string; slug: string; logo_url: string | null }
  projects: Project[]
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

function fmtMoney(n: number | undefined): string {
  return '$' + Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function buildEmailList(projects: Project[]): FlatEmail[] {
  const all: FlatEmail[] = []

  projects.forEach(p => {
    const qEmails = p.quote_emails || []
    const sEmails = p.schedule_emails || []

    const isDupInArray = <T extends { sent_at: string }>(arr: T[], keyFn: (e: T) => string, idx: number) => {
      const key = keyFn(arr[idx])
      const tThis = new Date(arr[idx].sent_at).getTime()
      return arr.some((o, j) => j !== idx && keyFn(o) === key && Math.abs(tThis - new Date(o.sent_at).getTime()) < 10 * 60 * 1000)
    }

    qEmails.forEach((q, i) => {
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
      })
    })

    sEmails.forEach((s, i) => {
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
      })
    })
  })

  return all.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function OutboxClient({ company, projects }: Props) {
  const [tab, setTab] = useState<'all' | 'quote' | 'schedule'>('all')
  const [search, setSearch] = useState('')
  const [sentBy, setSentBy] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [dupAlertDismissed, setDupAlertDismissed] = useState(false)

  const allEmails = useMemo(() => buildEmailList(projects), [projects])

  const senders = useMemo(() =>
    [...new Set(allEmails.map(e => e.sent_by_email))].sort(),
    [allEmails]
  )

  const filtered = useMemo(() => {
    const now = new Date()
    return allEmails.filter(e => {
      if (tab === 'quote' && e.type !== 'quote') return false
      if (tab === 'schedule' && e.type !== 'schedule') return false
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

  const toggleRow = (idx: number) => setExpandedIdx(prev => prev === idx ? null : idx)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0c10', color: '#e8eaf0', fontFamily: 'system-ui, sans-serif' }}>
      <main style={{ flex: 1 }}>
        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(10,12,16,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #232731', padding: '0 24px', display: 'flex', alignItems: 'center', height: 56, gap: 16 }}>
          <a
            href={`/${company.slug}/dashboard`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #232731', borderRadius: 6, padding: '6px 12px', color: '#6b7280', cursor: 'pointer', fontSize: 13, textDecoration: 'none', transition: 'color 0.12s' }}
          >
            ← Dashboard
          </a>
          <span style={{ fontSize: 13, color: '#3d4352' }}>›</span>
          <span style={{ fontSize: 13, color: '#e8eaf0' }}>Outbox</span>
        </div>

        <div style={{ padding: '28px 32px' }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.6px' }}>Outbox</h1>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>All customer-facing emails across every project</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total sent', value: allEmails.length, sub: 'across all projects', color: '#e8eaf0' },
              { label: 'Quote emails', value: allEmails.filter(e => e.type === 'quote').length, sub: fmtMoney(totalQuoteVal) + ' in quotes', color: '#f97316' },
              { label: 'Schedule emails', value: allEmails.filter(e => e.type === 'schedule').length, sub: 'confirmations sent', color: '#60a5fa' },
              { label: 'Possible duplicates', value: dupCount, sub: 'same content resent', color: dupCount > 0 ? '#f87171' : '#4ade80' },
            ].map(s => (
              <div key={s.label} style={{ background: '#111318', border: '1px solid #232731', borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 500, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1px', color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
                <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Duplicate alert */}
          {dupCount > 0 && !dupAlertDismissed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#fbbf24' }}>
              <span>⚠️</span>
              <span><strong>{dupCount} emails</strong> may be accidental duplicate sends — same content sent within 10 minutes.</span>
              <button onClick={() => setDupAlertDismissed(true)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', fontSize: 16, opacity: 0.7 }}>✕</button>
            </div>
          )}

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: '#111318', border: '1px solid #232731', borderRadius: 6, padding: 3, gap: 1 }}>
              {(['all', 'quote', 'schedule'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setExpandedIdx(null) }}
                  style={{ padding: '6px 14px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                    background: tab === t ? '#1c2029' : 'transparent',
                    color: tab === t ? '#e8eaf0' : '#6b7280' }}>
                  {t === 'all' ? 'All' : t === 'quote' ? 'Quotes' : 'Schedules'}
                  <span style={{ marginLeft: 6, fontFamily: 'monospace', fontSize: 10.5, padding: '1px 6px', borderRadius: 10,
                    background: tab === t ? 'rgba(249,115,22,0.1)' : '#1c2029',
                    color: tab === t ? '#f97316' : '#6b7280',
                    border: tab === t ? '1px solid rgba(249,115,22,0.25)' : '1px solid #232731' }}>
                    {t === 'all' ? allEmails.length : allEmails.filter(e => e.type === t).length}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ flex: 1 }} />

            <div style={{ position: 'relative', width: 240 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#3d4352', fontSize: 13, pointerEvents: 'none' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer…"
                style={{ width: '100%', padding: '7px 12px 7px 32px', background: '#111318', border: '1px solid #232731', borderRadius: 6, color: '#e8eaf0', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
            </div>

            <select value={sentBy} onChange={e => setSentBy(e.target.value)}
              style={{ padding: '7px 12px', background: '#111318', border: '1px solid #232731', borderRadius: 6, color: '#6b7280', fontSize: 12.5, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
              <option value="">All senders</option>
              {senders.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select value={dateRange} onChange={e => setDateRange(e.target.value)}
              style={{ padding: '7px 12px', background: '#111318', border: '1px solid #232731', borderRadius: 6, color: '#6b7280', fontSize: 12.5, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
              <option value="">All time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>

          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
            Showing <strong style={{ color: '#e8eaf0' }}>{filtered.length}</strong> of {allEmails.length} emails
          </div>

          {/* Email list */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6b7280' }}>
              <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.4 }}>📭</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No emails found</div>
              <div style={{ fontSize: 13, color: '#3d4352' }}>Try adjusting your search or filters</div>
            </div>
          ) : (
            grouped.map(group => (
              <div key={group.label} style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#3d4352', padding: '10px 2px 6px' }}>
                  {group.label}
                </div>
                {group.emails.map(email => {
                  const isExpanded = expandedIdx === email.globalIdx
                  const isQ = email.type === 'quote'
                  return (
                    <div key={`${email.project_id}-${email.type}-${email.sent_at}`}
                      style={{ background: '#111318', border: `1px solid ${isExpanded ? 'rgba(249,115,22,0.35)' : email.isDup ? 'rgba(251,191,36,0.25)' : '#232731'}`, borderRadius: 10, overflow: 'hidden', marginBottom: 3, transition: 'border-color 0.12s' }}>

                      <div onClick={() => toggleRow(email.globalIdx)}
                        style={{ display: 'grid', gridTemplateColumns: '42px 1fr auto', alignItems: 'center', gap: 14, padding: '13px 16px', cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                          background: isQ ? 'rgba(249,115,22,0.1)' : 'rgba(96,165,250,0.1)',
                          border: `1px solid ${isQ ? 'rgba(249,115,22,0.25)' : 'rgba(96,165,250,0.2)'}` }}>
                          {isQ ? '💰' : '📅'}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13.5, fontWeight: 500 }}>{email.customer_name}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
                              background: isQ ? 'rgba(249,115,22,0.1)' : 'rgba(96,165,250,0.1)',
                              color: isQ ? '#f97316' : '#60a5fa' }}>
                              {isQ ? 'Quote' : 'Schedule'}
                            </span>
                            {email.isDup && (
                              <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 10, background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                                ⚠ duplicate
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12.5, color: '#6b7280' }}>
                            {isQ
                              ? <>Quote sent to <strong style={{ color: '#e8eaf0' }}>{email.customer_email}</strong></>
                              : <>Schedule confirmation</>  
                            }
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                          {isQ
                            ? <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 500, color: '#f97316' }}>{fmtMoney(email.quote_total)}</span>
                            : email.scheduled_date
                              ? <span style={{ fontSize: 11, color: '#60a5fa', background: 'rgba(96,165,250,0.1)', padding: '2px 8px', borderRadius: 10 }}>{fmtDate(email.scheduled_date)}</span>
                              : null
                          }
                          <span style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#6b7280' }}>{timeAgo(email.sent_at)}</span>
                          <span style={{ color: '#3d4352', fontSize: 11, display: 'inline-block', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▾</span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ borderTop: '1px solid #232731', display: 'grid', gridTemplateColumns: '1fr 260px' }}>
                          <div style={{ padding: '20px 22px' }}>
                            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#3d4352', marginBottom: 12 }}>
                              {isQ ? 'Quote breakdown' : 'Schedule details'}
                            </div>
                            {isQ ? (
                              <>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr>
                                      {['Description', 'Qty', 'Unit price', 'Amount'].map(h => (
                                        <th key={h} style={{ fontSize: 10.5, color: '#3d4352', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: h === 'Amount' ? 'right' : 'left', padding: '0 0 8px', borderBottom: '1px solid #232731' }}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(email.quote_data || []).map((item, i) => (
                                      <tr key={i}>
                                        <td style={{ padding: '9px 0', fontSize: 13, borderBottom: '1px solid #232731' }}>{item.description || '—'}</td>
                                        <td style={{ padding: '9px 0', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #232731' }}>{item.quantity || 1}</td>
                                        <td style={{ padding: '9px 0', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #232731' }}>{fmtMoney(item.unitPrice ?? item.amount / (item.quantity || 1))}</td>
                                        <td style={{ padding: '9px 0', fontSize: 13, textAlign: 'right', fontFamily: 'monospace', borderBottom: '1px solid #232731' }}>{fmtMoney(item.amount)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #232731', marginTop: 2 }}>
                                  <span style={{ fontSize: 13, fontWeight: 600 }}>Total</span>
                                  <span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', fontFamily: 'monospace' }}>{fmtMoney(email.quote_total)}</span>
                                </div>
                              </>
                            ) : (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {[
                                  { label: 'Date', value: fmtDate(email.scheduled_date) || 'Not set', highlight: true },
                                  { label: 'Time', value: email.scheduled_time || 'Not set', highlight: true },
                                  { label: 'Customer', value: email.customer_name, highlight: false },
                                ].map(f => (
                                  <div key={f.label}>
                                    <div style={{ fontSize: 10.5, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500, marginBottom: 3 }}>{f.label}</div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: f.highlight ? '#60a5fa' : '#e8eaf0' }}>{f.value}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div style={{ padding: '20px', background: '#161921', borderLeft: '1px solid #232731' }}>
                            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#3d4352', marginBottom: 12 }}>Details</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                              {[
                                { k: 'Sent', v: `${fmtDate(email.sent_at)} ${fmtTime(email.sent_at)}` },
                                { k: 'From', v: email.sent_by_email },
                                { k: 'To', v: email.customer_email },
                              ].map(m => (
                                <div key={m.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <span style={{ fontSize: 11, color: '#3d4352', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>{m.k}</span>
                                  <span style={{ fontSize: 12.5, color: '#6b7280', textAlign: 'right', maxWidth: 160, wordBreak: 'break-all' }}>{m.v}</span>
                                </div>
                              ))}
                              {email.isDup && (
                                <>
                                  <hr style={{ border: 'none', borderTop: '1px solid #232731' }} />
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 11, color: '#3d4352', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>Note</span>
                                    <span style={{ fontSize: 12.5, color: '#fbbf24', textAlign: 'right' }}>Possible duplicate</span>
                                  </div>
                                </>
                              )}
                            </div>
                            <a href={`/${company.slug}/dashboard?project=${email.project_id}`}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', marginTop: 14, background: '#1c2029', border: '1px solid #2e3340', borderRadius: 6, fontSize: 12.5, color: '#6b7280', textDecoration: 'none' }}>
                              → Open Project #{email.project_id}
                            </a>
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
      </main>
    </div>
  )
}