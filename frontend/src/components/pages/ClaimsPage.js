'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../DashboardLayout';
import { claimAPI } from '../../services/api';
import { Plus, Search, Calendar } from 'lucide-react';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusPill({ status }) {
  const map = {
    pending:  { cls: 'warn', label: 'Pending' },
    resolved: { cls: 'ok',   label: 'Resolved' },
    rejected: { cls: 'bad',  label: 'Rejected' },
  };
  const m = map[status] || { cls: '', label: status };
  return <span className={'pill ' + m.cls}><span className="dot" />{m.label}</span>;
}

const STOCK_LABELS = { new: 'New unit', foc: 'FOC', not_in_stock: 'Awaiting' };
const STOCK_PILL_CLS = { new: 'info', foc: 'ok', not_in_stock: '' };

const PAGE_SIZE = 10;

export default function ClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [q, setQ] = useState('');

  const loadClaims = useCallback(async (p, status) => {
    setLoading(true);
    try {
      const res = await claimAPI.getAll(p, PAGE_SIZE, status === 'all' ? undefined : status);
      if (res.data.success) {
        setClaims(res.data.data.claims || []);
        setTotalPages(res.data.data.total_pages || 1);
        setTotalCount(res.data.data.total_count || 0);
        setPage(p);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadClaims(1, 'all'); }, [loadClaims]);

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    loadClaims(1, status);
  };

  const displayed = q.trim()
    ? claims.filter(item => {
        const c = item.claim;
        const s = q.toLowerCase();
        return String(c.claim_number).includes(s)
          || (item.customer_name || '').toLowerCase().includes(s)
          || (item.new_model_name || '').toLowerCase().includes(s);
      })
    : claims;

  return (
    <DashboardLayout>
      <div className="page fade-in">
        <div className="page-head">
          <div>
            <h1 className="page-title">Claims</h1>
            <p className="page-sub">Every warranty filing, across all customers and brands.</p>
          </div>
          <div className="page-actions">
            <button className="btn primary" onClick={() => router.push('/claims/create')}>
              <Plus size={14} strokeWidth={1.75} />File a claim
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-head" style={{ gap: 12, flexWrap: 'wrap' }}>
            <div className="chips">
              {['all', 'pending', 'resolved', 'rejected'].map(s => (
                <button
                  key={s}
                  className={'chip' + (statusFilter === s ? ' active' : '')}
                  onClick={() => handleStatusChange(s)}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  {s === 'all' && <span style={{ opacity: 0.55, marginLeft: 5 }}>{totalCount}</span>}
                </button>
              ))}
            </div>
            <div className="topbar-search" style={{ width: 260, margin: '0 0 0 auto', position: 'relative' }}>
              <Search size={14} className="ts-icon" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search claim #, customer…" style={{ paddingRight: 12 }} />
            </div>
          </div>

          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Claim</th><th>Customer</th><th>Model</th>
                  <th>CO #</th><th>Status</th><th>Stock</th>
                  <th className="num">Filed</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="empty">Loading…</td></tr>
                ) : displayed.length === 0 ? (
                  <tr><td colSpan={7} className="empty">No claims match.</td></tr>
                ) : displayed.map(item => {
                  const c = item.claim;
                  const cls = STOCK_PILL_CLS[c.stock_status] || '';
                  return (
                    <tr key={c.id}>
                      <td>
                        <span className="ff-mono" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                          C{String(c.claim_number).padStart(5, '0')}
                        </span>
                      </td>
                      <td className="strong">{item.customer_name}</td>
                      <td style={{ color: 'var(--muted)' }}>{item.new_model_name || item.battery_serial || '—'}</td>
                      <td><span className="ff-mono" style={{ color: 'var(--muted)' }}>{c.co_number || '—'}</span></td>
                      <td><StatusPill status={c.status} /></td>
                      <td>
                        <span className={'pill ' + cls}>
                          <span className="dot" />
                          {STOCK_LABELS[c.stock_status] || c.stock_status}
                        </span>
                      </td>
                      <td className="num">{fmtDate(c.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <div>Page <strong>{page}</strong> of {totalPages} · {totalCount} total</div>
              <div className="pg-btns">
                <button className="btn sm" onClick={() => loadClaims(page - 1, statusFilter)} disabled={page === 1}>Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={'btn sm' + (p === page ? ' primary' : '')} onClick={() => loadClaims(p, statusFilter)}>{p}</button>
                ))}
                {totalPages > 5 && <span style={{ padding: '0 4px', color: 'var(--muted)' }}>…</span>}
                <button className="btn sm" onClick={() => loadClaims(page + 1, statusFilter)} disabled={page === totalPages}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
