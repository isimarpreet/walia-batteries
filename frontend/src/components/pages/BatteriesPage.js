'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../DashboardLayout';
import PageHeader from '../PageHeader';
import { batteryAPI, brandAPI, modelAPI, customerAPI } from '../../services/api';
import { Battery, Search, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

export default function BatteriesPage() {
  const [batteries, setBatteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterMode, setFilterMode] = useState('all');

  const [brands, setBrands] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState('');
  const [form, setForm] = useState({ brand_id: '', model_id: '', serial_number: '', date_of_sale: '', invoice_number: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    loadBrands();
    loadAllModels();
    loadBatteries(1);
  }, []);

  const loadBrands = async () => {
    try {
      const res = await brandAPI.getAll(1);
      if (res.data.success) setBrands(res.data.data || []);
    } catch {}
  };

  const loadAllModels = async () => {
    try {
      const res = await modelAPI.getAll(null, 1);
      if (res.data.success) setAllModels(res.data.data || []);
    } catch {}
  };

  const loadBatteries = async (p) => {
    setLoading(true);
    setFilterMode('all');
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
  };

  const loadCustomerBatteries = async (customer) => {
    setLoading(true);
    setFilterMode('customer');
    try {
      const res = await batteryAPI.getByCustomer(customer.id);
      if (res.data.success) {
        const items = res.data.data || [];
        setBatteries(items.map(item => ({
          ...item.battery,
          brand_name: item.brand?.name,
          model_name: item.model?.model_name,
        })));
        setTotalPages(1);
        setTotalCount(items.length);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const handleCustomerSearch = async (e) => {
    e.preventDefault();
    if (!customerPhone.trim()) return;
    setCustomerSearchError('');
    setSelectedCustomer(null);
    setCustomerSearchLoading(true);
    try {
      const res = await customerAPI.searchByPhone(customerPhone.trim());
      if (res.data.success) setSelectedCustomer(res.data.data);
      else setCustomerSearchError('Customer not found');
    } catch { setCustomerSearchError('Customer not found'); }
    finally { setCustomerSearchLoading(false); }
  };

  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    setForm(p => ({ ...p, brand_id: brandId, model_id: '' }));
    setFilteredModels(brandId ? allModels.filter(m => String(m.brand_id) === String(brandId)) : []);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) { setFormError('Find a customer first'); return; }
    setFormError('');
    setFormSuccess('');
    setSaving(true);
    try {
      const res = await batteryAPI.create({
        customer_id: selectedCustomer.id,
        brand_id: parseInt(form.brand_id),
        model_id: parseInt(form.model_id),
        serial_number: form.serial_number,
        date_of_sale: form.date_of_sale,
        invoice_number: form.invoice_number || null,
      });
      if (res.data.success) {
        setFormSuccess('Battery added!');
        setForm({ brand_id: '', model_id: '', serial_number: '', date_of_sale: '', invoice_number: '' });
        setFilteredModels([]);
        loadBatteries(1);
        setTimeout(() => { setShowModal(false); setFormSuccess(''); }, 1200);
      } else {
        setFormError(res.data.message || 'Failed to add battery');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add battery');
    } finally { setSaving(false); }
  };

  const brandsMap = Object.fromEntries(brands.map(b => [b.id, b.name]));
  const modelsMap = Object.fromEntries(allModels.map(m => [m.id, m.model_name]));

  return (
    <DashboardLayout>
      <PageHeader title="Batteries" icon={Battery} />
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {filterMode === 'customer' ? `Batteries — ${batteries.length} found` : `All Batteries (${totalCount})`}
              </h2>
              {filterMode === 'customer' && (
                <button onClick={() => loadBatteries(1)} className="text-xs text-blue-600 hover:underline mt-0.5">← Show all</button>
              )}
            </div>
            <button
              onClick={() => { setShowModal(true); setFormError(''); setFormSuccess(''); setSelectedCustomer(null); setCustomerPhone(''); setCustomerSearchError(''); }}
              className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={13} /> Add Battery
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {(filterMode === 'all' ? ['Customer', 'Brand', 'Model', 'Serial #', 'Sale Date', 'Invoice'] : ['Brand', 'Model', 'Serial #', 'Sale Date', 'Invoice']).map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">Loading...</td></tr>
                ) : batteries.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">No batteries found</td></tr>
                ) : batteries.map(b => (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    {filterMode === 'all' && <td className="px-6 py-3.5 text-sm text-slate-500">#{b.customer_id}</td>}
                    <td className="px-6 py-3.5 text-sm text-slate-700">{b.brand_name || brandsMap[b.brand_id] || '—'}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-700">{b.model_name || modelsMap[b.model_id] || '—'}</td>
                    <td className="px-6 py-3.5 text-sm font-mono text-slate-600">{b.serial_number}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">{b.date_of_sale}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-500">{b.invoice_number || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filterMode === 'all' && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">{totalCount} batteries total</p>
              <div className="flex items-center gap-1">
                <button onClick={() => loadBatteries(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={14} /></button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => loadBatteries(p)} className={`w-7 h-7 text-xs rounded-lg font-medium ${p === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{p}</button>
                ))}
                {totalPages > 7 && <span className="text-slate-400 text-xs px-1">…</span>}
                <button onClick={() => loadBatteries(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800">Add Battery</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            {/* Customer search */}
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <label className="block text-xs font-medium text-slate-700 mb-2">Find Customer</label>
              <form onSubmit={handleCustomerSearch} className="flex gap-2">
                <input
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" disabled={customerSearchLoading} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-900 disabled:opacity-60">
                  {customerSearchLoading ? '...' : 'Find'}
                </button>
              </form>
              {customerSearchError && <p className="mt-1 text-xs text-red-600">{customerSearchError}</p>}
              {selectedCustomer && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-xs font-medium text-emerald-700">{selectedCustomer.name} — {selectedCustomer.phone}</span>
                  <button
                    type="button"
                    onClick={() => loadCustomerBatteries(selectedCustomer)}
                    className="ml-auto text-xs text-blue-600 hover:underline"
                  >
                    View batteries
                  </button>
                </div>
              )}
            </div>

            {formError && <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{formError}</div>}
            {formSuccess && <div className="mb-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">{formSuccess}</div>}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Brand</label>
                <select value={form.brand_id} onChange={handleBrandChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Model</label>
                <select name="model_id" value={form.model_id} onChange={e => setForm(p => ({ ...p, model_id: e.target.value }))} required disabled={!form.brand_id} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400">
                  <option value="">Select model</option>
                  {filteredModels.map(m => <option key={m.id} value={m.id}>{m.model_name}{m.warranty_months ? ` (${m.warranty_months}mo)` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Serial Number</label>
                <input value={form.serial_number} onChange={e => setForm(p => ({ ...p, serial_number: e.target.value }))} required placeholder="Battery serial number" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date of Sale</label>
                <input type="date" value={form.date_of_sale} onChange={e => setForm(p => ({ ...p, date_of_sale: e.target.value }))} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Invoice # (optional)</label>
                <input value={form.invoice_number} onChange={e => setForm(p => ({ ...p, invoice_number: e.target.value }))} placeholder="Invoice number" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">{saving ? 'Saving...' : 'Add Battery'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
