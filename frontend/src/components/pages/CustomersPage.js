'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../DashboardLayout';
import { customerAPI, batteryAPI, claimAPI } from '../../services/api';
import { Search, Plus, Download, Eye, X } from 'lucide-react';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initials(name = '') {
  return name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function StatusPill({ status }) {
  const map = { pending: { cls: 'warn', label: 'Pending' }, resolved: { cls: 'ok', label: 'Resolved' }, rejected: { cls: 'bad', label: 'Rejected' } };
  const m = map[status] || { cls: '', label: status };
  return <span className={'pill ' + m.cls}><span className="dot" />{m.label}</span>;
}

/* ── Customer detail drawer ─────────────────────────────────────── */
function CustomerDrawer({ customerId, onClose }) {
  const [customer, setCustomer] = useState(null);
  const [batteries, setBatteries] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    Promise.allSettled([
      customerAPI.getById(customerId),
      batteryAPI.getByCustomer(customerId),
      claimAPI.getByCustomer(customerId),
    ]).then(([cRes, bRes, clRes]) => {
      if (cRes.status === 'fulfilled' && cRes.value.data.success)
        setCustomer(cRes.value.data.data);
      if (bRes.status === 'fulfilled' && bRes.value.data.success)
        setBatteries((bRes.value.data.data || []).map(i => ({
          ...i.battery, brand_name: i.brand?.name, model_name: i.model?.model_name,
        })));
      if (clRes.status === 'fulfilled' && clRes.value.data.success)
        setClaims(clRes.value.data.data || []);
    }).finally(() => setLoading(false));
  }, [customerId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const open = !!customerId;

  return (
    <>
      <div className={'drawer-scrim' + (open ? ' open' : '')} onClick={onClose} />
      <div className={'drawer' + (open ? ' open' : '')} role="dialog" aria-hidden={!open}>
        <div className="drawer-head">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Detail view</div>
            <div className="drawer-title">{customer?.name || 'Customer'}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} strokeWidth={1.75} /></button>
        </div>
        <div className="drawer-body">
          {loading ? (
            <div className="empty">Loading…</div>
          ) : !customer ? (
            <div className="empty">Not found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="avatar" style={{ width: 52, height: 52, fontSize: 18 }}>{initials(customer.name)}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{customer.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Customer ID #{customer.id}</div>
                </div>
              </div>
              {/* Contact cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: '12px 14px', border: '1px solid var(--hair)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontWeight: 500 }}>Phone</div>
                  <div className="ff-mono" style={{ fontSize: 13 }}>{customer.phone}</div>
                </div>
                <div style={{ padding: '12px 14px', border: '1px solid var(--hair)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontWeight: 500 }}>Email</div>
                  <div style={{ fontSize: 13 }}>{customer.email || '—'}</div>
                </div>
              </div>
              {customer.address && (
                <div style={{ padding: '12px 14px', border: '1px solid var(--hair)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontWeight: 500 }}>Address</div>
                  <div style={{ fontSize: 13 }}>{customer.address}</div>
                </div>
              )}
              {/* Batteries */}
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 600 }}>
                  Batteries ({batteries.length})
                </div>
                {batteries.length === 0 ? <div className="empty" style={{ padding: 24 }}>None on file.</div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {batteries.map(b => (
                      <div key={b.id} style={{ border: '1px solid var(--hair)', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{b.brand_name} · {b.model_name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                          <span className="ff-mono">{b.serial_number}</span> · Sold {fmtDate(b.date_of_sale)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Claims */}
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 600 }}>
                  Claims ({claims.length})
                </div>
                {claims.length === 0 ? <div className="empty" style={{ padding: 24 }}>No claims filed.</div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {claims.map(item => {
                      const c = item.claim || item;
                      return (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--hair)' }}>
                          <span className="ff-mono" style={{ color: 'var(--ink)', fontWeight: 500 }}>C{String(c.claim_number).padStart(5, '0')}</span>
                          <div style={{ fontSize: 12.5, color: 'var(--muted)', flex: 1 }}>{item.new_model_name || item.battery_serial || '—'}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(c.created_at)}</div>
                          <StatusPill status={c.status} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Add customer modal ─────────────────────────────────────────── */
function AddCustomerModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await customerAPI.create(form);
      if (res.data.success) { onCreated(); onClose(); }
      else setError(res.data.message || 'Failed to create customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally { setSaving(false); }
  };

  return (
    <>
      <div className="drawer-scrim open" onClick={onClose} />
      <div className="drawer open" role="dialog">
        <div className="drawer-head">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>New record</div>
            <div className="drawer-title">Add customer</div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} strokeWidth={1.75} /></button>
        </div>
        <div className="drawer-body">
          {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--bad-soft)', color: 'var(--bad)', borderRadius: 8, fontSize: 13 }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field"><label>Name</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Customer name" /></div>
            <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required placeholder="Phone number" /></div>
            <div className="field"><label>Email <span style={{ color: 'var(--muted-2)', fontWeight: 400 }}>(optional)</span></label><input type="email" className="input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" /></div>
            <div className="field"><label>Address <span style={{ color: 'var(--muted-2)', fontWeight: 400 }}>(optional)</span></label><textarea className="ds-textarea input" rows={3} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Address" style={{ resize: 'vertical', minHeight: 80 }} /></div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid var(--hair)', justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save customer'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/* ── Main page ──────────────────────────────────────────────────── */
const PAGE_SIZE = 10;

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [q, setQ] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [drawerCustomerId, setDrawerCustomerId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const loadCustomers = useCallback(async (p) => {
    setLoading(true);
    setIsSearching(false);
    try {
      const res = await customerAPI.getAll(p, PAGE_SIZE);
      if (res.data.success) {
        setCustomers(res.data.data.customers || []);
        setTotalPages(res.data.data.total_pages || 1);
        setTotalCount(res.data.data.total_count || 0);
        setPage(p);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCustomers(1); }, [loadCustomers]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!q.trim()) { loadCustomers(1); return; }
    setLoading(true);
    setIsSearching(true);
    try {
      const res = await customerAPI.searchByPhone(q.trim());
      setCustomers(res.data.success ? [res.data.data] : []);
      setTotalPages(1);
      setTotalCount(res.data.success ? 1 : 0);
    } catch { setCustomers([]); setTotalCount(0); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="page fade-in">
        <div className="page-head">
          <div>
            <h1 className="page-title">Customers</h1>
            <p className="page-sub">{totalCount} records · Directory of every customer on file.</p>
          </div>
          <div className="page-actions">
            <button className="btn primary" onClick={() => setShowAdd(true)}>
              <Plus size={14} strokeWidth={1.75} />New customer
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-head" style={{ gap: 12 }}>
            <form onSubmit={handleSearch} className="topbar-search" style={{ width: 300, margin: 0, position: 'relative' }}>
              <Search size={14} className="ts-icon" />
              <input
                value={q}
                onChange={e => { setQ(e.target.value); if (!e.target.value) loadCustomers(1); }}
                placeholder="Search name, phone…"
                style={{ paddingRight: 12 }}
              />
            </form>
            {isSearching && (
              <button className="btn sm ghost" onClick={() => { setQ(''); loadCustomers(1); }}>
                <X size={12} /> Clear
              </button>
            )}
          </div>

          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th><th>Phone</th><th>Email</th><th>Address</th><th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="empty">Loading…</td></tr>
                ) : customers.length === 0 ? (
                  <tr><td colSpan={5} className="empty">No customers found.</td></tr>
                ) : customers.map(c => (
                  <tr key={c.id} onClick={() => setDrawerCustomerId(c.id)} style={{ cursor: 'pointer' }}>
                    <td className="strong">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 26, height: 26, fontSize: 10.5 }}>{initials(c.name)}</div>
                        <div>
                          <div>{c.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 400 }}>ID #{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="ff-mono">{c.phone}</span></td>
                    <td style={{ color: 'var(--muted)' }}>{c.email || '—'}</td>
                    <td style={{ color: 'var(--muted)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || '—'}</td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" title="View details" onClick={e => { e.stopPropagation(); setDrawerCustomerId(c.id); }}>
                          <Eye size={14} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isSearching && totalPages > 1 && (
            <div className="pagination">
              <div>Page <strong>{page}</strong> of {totalPages} · {totalCount} total</div>
              <div className="pg-btns">
                <button className="btn sm" onClick={() => loadCustomers(page - 1)} disabled={page === 1}>Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={'btn sm' + (p === page ? ' primary' : '')} onClick={() => loadCustomers(p)}>{p}</button>
                ))}
                {totalPages > 5 && <span style={{ padding: '0 4px', color: 'var(--muted)' }}>…</span>}
                <button className="btn sm" onClick={() => loadCustomers(page + 1)} disabled={page === totalPages}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CustomerDrawer
        customerId={drawerCustomerId}
        onClose={() => setDrawerCustomerId(null)}
      />

      {showAdd && (
        <AddCustomerModal
          onClose={() => setShowAdd(false)}
          onCreated={() => loadCustomers(1)}
        />
      )}
    </DashboardLayout>
  );
}
