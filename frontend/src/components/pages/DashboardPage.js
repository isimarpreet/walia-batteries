'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../DashboardLayout';
import { customerAPI, batteryAPI, claimAPI } from '../../services/api';
import { Plus, TrendingUp } from 'lucide-react';

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

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ customers: null, batteries: null, claims: null, pending: null });
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cRes, bRes, clRes, pRes, rcRes] = await Promise.allSettled([
        customerAPI.getAll(1, 1),
        batteryAPI.getAll(1, 1),
        claimAPI.getAll(1, 1),
        claimAPI.getAll(1, 1, 'pending'),
        claimAPI.getAll(1, 6),
      ]);
      if (cRes.status === 'fulfilled' && cRes.value.data.success)
        setStats(s => ({ ...s, customers: cRes.value.data.data?.total_count ?? 0 }));
      if (bRes.status === 'fulfilled' && bRes.value.data.success)
        setStats(s => ({ ...s, batteries: bRes.value.data.data?.total_count ?? 0 }));
      if (clRes.status === 'fulfilled' && clRes.value.data.success)
        setStats(s => ({ ...s, claims: clRes.value.data.data?.total_count ?? 0 }));
      if (pRes.status === 'fulfilled' && pRes.value.data.success)
        setStats(s => ({ ...s, pending: pRes.value.data.data?.total_count ?? 0 }));
      if (rcRes.status === 'fulfilled' && rcRes.value.data.success)
        setRecentClaims(rcRes.value.data.data?.claims || []);
    } catch {}
    finally { setLoading(false); }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <DashboardLayout>
      <div className="page fade-in">
        <div className="page-head">
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 500 }}>
              {today}
            </div>
            <h1 className="page-title">Good morning, Admin.</h1>
            <p className="page-sub">Here's a quick look at your workshop today.</p>
          </div>
          <div className="page-actions">
            <button className="btn primary" onClick={() => router.push('/claims/create')}>
              <Plus size={14} strokeWidth={1.75} />File a claim
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          <div className="stat">
            <div className="k"><span className="stat-dot" />Total customers</div>
            <div className="v">{stats.customers ?? '—'}</div>
            <div className="delta" style={{ color: 'var(--muted)' }}>All time</div>
          </div>
          <div className="stat">
            <div className="k"><span className="stat-dot a" />Batteries sold</div>
            <div className="v">{stats.batteries ?? '—'}</div>
            <div className="delta up"><TrendingUp size={12} /> Registered under warranty</div>
          </div>
          <div className="stat">
            <div className="k"><span className="stat-dot b" />Total claims</div>
            <div className="v">{stats.claims ?? '—'}</div>
            <div className="delta" style={{ color: 'var(--muted)' }}>— Lifetime</div>
          </div>
          <div className="stat">
            <div className="k"><span className="stat-dot c" />Pending claims</div>
            <div className="v">{stats.pending ?? '—'}</div>
            <div className="delta down">Awaiting stock or review</div>
          </div>
        </div>

        {/* Recent claims table */}
        <div className="card">
          <div className="card-head">
            <div style={{ flex: 1 }}>
              <div className="card-title">Recent claims</div>
              <div className="card-sub">Most recent warranty filings</div>
            </div>
            <button className="btn sm ghost" onClick={() => router.push('/claims')}>
              View all →
            </button>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Claim</th><th>Customer</th><th>Model</th><th>Status</th><th className="num">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="empty" style={{ padding: '40px 20px' }}>Loading…</td></tr>
                ) : recentClaims.length === 0 ? (
                  <tr><td colSpan={5} className="empty" style={{ padding: '40px 20px' }}>No claims yet.</td></tr>
                ) : recentClaims.map(item => {
                  const c = item.claim;
                  return (
                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push('/claims')}>
                      <td>
                        <span className="ff-mono" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                          C{String(c.claim_number).padStart(5, '0')}
                        </span>
                      </td>
                      <td className="strong">{item.customer_name}</td>
                      <td style={{ color: 'var(--muted)' }}>{item.new_model_name || item.battery_serial || '—'}</td>
                      <td><StatusPill status={c.status} /></td>
                      <td className="num">{fmtDate(c.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
