'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../DashboardLayout';
import { batteryAPI, brandAPI, modelAPI, customerAPI } from '../../services/api';
import { Search, Plus, X } from 'lucide-react';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Add Battery Drawer ─────────────────────────────────────────── */
function AddBatteryDrawer({ brands, allModels, onClose, onCreated }) {
  const [customerPhone, setCustomerPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [searchErr, setSearchErr] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [form, setForm] = useState({ brand_id: '', model_id: '', serial_number: '', date_of_sale: '', invoice_number: '' });
  const [filteredModels, setFilteredModels] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const searchCustomer = async (e) => {
    e.preventDefault();
    if (!customerPhone.trim()) return;
    setSearchErr(''); setCustomer(null); setSearchLoading(true);
    try {
      const res = await customerAPI.searchByPhone(customerPhone.trim());
      if (res.data.success) setCustomer(res.data.data);
      else setSearchErr('Customer not found');
    } catch { setSearchErr('Customer not found'); }
    finally { setSearchLoading(false); }
  };

  const handleBrandChange = (e) => {
    const id = e.target.value;
    setForm(p => ({ ...p, brand_id: id, model_id: '' }));
    setFilteredModels(id ? allModels.filter(m => String(m.brand_id) === String(id)) : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer) { setError('Find a customer first'); return; }
    setError(''); setSaving(true);
    try {
      const res = await batteryAPI.create({
        customer_id: customer.id,
        brand_id: parseInt(form.brand_id),
        model_id: parseInt(form.model_id),
        serial_number: form.serial_number,
        date_of_sale: form.date_of_sale,
        invoice_number: form.invoice_number || null,
      });
      if (res.data.success) { onCreated(); onClose(); }
      else setError(res.data.message || 'Failed to register battery');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register battery');
    } finally { setSaving(false); }
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="drawer-scrim open" onClick={onClose} />
      <div className="drawer open" role="dialog">
        <div className="drawer-head">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>New record</div>
            <div className="drawer-title">Register battery</div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} strokeWidth={1.75} /></button>
        </div>
        <div className="drawer-body">
          {/* Customer search */}
          <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 8 }}>Find customer</div>
            <form onSubmit={searchCustomer} style={{ display: 'flex', gap: 8 }}>
              <input className="input" style={{ flex: 1 }} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone number" />
              <button type="submit" className="btn primary sm" disabled={searchLoading}>{searchLoading ? '…' : 'Find'}</button>
            </form>
            {searchErr && <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--bad)' }}>{searchErr}</div>}
            {customer && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ok)' }}>{customer.name} — {customer.phone}</span>
              </div>
            )}
          </div>

          {error && <div style={{ marginBottom: 14, padding: '10px 14px', background: 'var(--bad-soft)', color: 'var(--bad)', borderRadius: 8, fontSize: 13 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label>Brand</label>
              <select className="ds-select input" value={form.brand_id} onChange={handleBrandChange} required>
                <option value="">Select brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Model</label>
              <select className="ds-select input" value={form.model_id} onChange={e => setForm(p => ({ ...p, model_id: e.target.value }))} required disabled={!form.brand_id} style={{ opacity: !form.brand_id ? 0.5 : 1 }}>
                <option value="">Select model</option>
                {filteredModels.map(m => <option key={m.id} value={m.id}>{m.model_name}{m.warranty_months ? ` (${m.warranty_months} mo)` : ''}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Serial number</label>
              <input className="input" value={form.serial_number} onChange={e => setForm(p => ({ ...p, serial_number: e.target.value }))} required placeholder="Battery serial number" />
            </div>
            <div className="field">
              <label>Date of sale</label>
              <input type="date" className="input" value={form.date_of_sale} onChange={e => setForm(p => ({ ...p, date_of_sale: e.target.value }))} required />
            </div>
            <div className="field">
              <label>Invoice # <span style={{ color: 'var(--muted-2)', fontWeight: 400 }}>(optional)</span></label>
              <input className="input" value={form.invoice_number} onChange={e => setForm(p => ({ ...p, invoice_number: e.target.value }))} placeholder="Invoice number" />
            </div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid var(--hair)', justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Register battery'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/* ── Main page ──────────────────────────────────────────────────── */
const PAGE_SIZE = 10;

export default function BatteriesPage() {
  const [batteries, setBatteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [brands, setBrands] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [brandFilter, setBrandFilter] = useState(0);
  const [q, setQ] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const loadBatteries = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await batteryAPI.getAll(p, PAGE_SIZE);
      if (res.data.success) {
        setBatteries(res.data.data.batteries || []);
        setTotalPages(res.data.data.total_pages || 1);
        setTotalCount(res.data.data.total_count || 0);
        setPage(p);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadBatteries(1);
    brandAPI.getAll(1).then(r => { if (r.data.success) setBrands(r.data.data || []); }).catch(() => {});
    modelAPI.getAll(null, 1).then(r => { if (r.data.success) setAllModels(r.data.data || []); }).catch(() => {});
  }, [loadBatteries]);

  const brandsMap  = Object.fromEntries(brands.map(b => [b.id, b.name]));
  const modelsMap  = Object.fromEntries(allModels.map(m => [m.id, m.model_name]));

  const displayed = batteries.filter(b => {
    if (brandFilter && b.brand_id !== brandFilter) return false;
    if (q.trim()) {
      const s = q.toLowerCase();
      return b.serial_number?.toLowerCase().includes(s) || (b.invoice_number || '').toLowerCase().includes(s);
    }
    return true;
  });

  /* warranty helper (client-side estimate using today's date) */
  const warrantyPill = (b) => {
    const model = allModels.find(m => m.id === b.model_id);
    if (!model || !b.date_of_sale) return null;
    const sold = new Date(b.date_of_sale);
    const mths = Math.floor((new Date() - sold) / (1000 * 60 * 60 * 24 * 30));
    const wm   = model.warranty_months || 24;
    const rem  = Math.max(0, wm - mths);
    return rem > 0
      ? <span className="pill ok"><span className="dot" />{rem} mo left</span>
      : <span className="pill bad"><span className="dot" />Expired</span>;
  };

  return (
    <DashboardLayout>
      <div className="page fade-in">
        <div className="page-head">
          <div>
            <h1 className="page-title">Battery inventory</h1>
            <p className="page-sub">{totalCount} units sold and registered under warranty.</p>
          </div>
          <div className="page-actions">
            <button className="btn primary" onClick={() => setShowAdd(true)}>
              <Plus size={14} strokeWidth={1.75} />Register battery
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-head" style={{ gap: 12 }}>
            <div className="topbar-search" style={{ width: 260, margin: 0, position: 'relative' }}>
              <Search size={14} className="ts-icon" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search serial or invoice…" style={{ paddingRight: 12 }} />
            </div>
            <select
              className="ds-select input"
              style={{ width: 160, padding: '7px 12px', fontSize: 13 }}
              value={brandFilter}
              onChange={e => setBrandFilter(parseInt(e.target.value))}
            >
              <option value={0}>All brands</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <div style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--muted)' }}>{displayed.length} results</div>
          </div>

          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Serial</th><th>Brand · Model</th><th>Customer</th>
                  <th className="num">Date of sale</th><th>Invoice</th><th>Warranty</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="empty">Loading…</td></tr>
                ) : displayed.length === 0 ? (
                  <tr><td colSpan={6} className="empty">No batteries match.</td></tr>
                ) : displayed.map(b => (
                  <tr key={b.id}>
                    <td><span className="ff-mono" style={{ color: 'var(--ink)', fontWeight: 500 }}>{b.serial_number}</span></td>
                    <td>
                      <div className="strong">{b.brand_name || brandsMap[b.brand_id] || '—'}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{b.model_name || modelsMap[b.model_id] || '—'}</div>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>#{b.customer_id}</td>
                    <td className="num">{fmtDate(b.date_of_sale)}</td>
                    <td><span className="ff-mono">{b.invoice_number || '—'}</span></td>
                    <td>{warrantyPill(b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <div>Page <strong>{page}</strong> of {totalPages}</div>
              <div className="pg-btns">
                <button className="btn sm" onClick={() => loadBatteries(page - 1)} disabled={page === 1}>Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={'btn sm' + (p === page ? ' primary' : '')} onClick={() => loadBatteries(p)}>{p}</button>
                ))}
                {totalPages > 5 && <span style={{ padding: '0 4px', color: 'var(--muted)' }}>…</span>}
                <button className="btn sm" onClick={() => loadBatteries(page + 1)} disabled={page === totalPages}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <AddBatteryDrawer
          brands={brands}
          allModels={allModels}
          onClose={() => setShowAdd(false)}
          onCreated={() => loadBatteries(1)}
        />
      )}
    </DashboardLayout>
  );
}
