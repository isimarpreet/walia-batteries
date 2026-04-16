'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../DashboardLayout';
import PageHeader from '../PageHeader';
import { claimAPI, customerAPI, batteryAPI, modelAPI } from '../../services/api';
import { FilePlus } from 'lucide-react';

const STOCK_STYLES = { new: 'bg-emerald-100 text-emerald-700', foc: 'bg-blue-100 text-blue-700', not_in_stock: 'bg-slate-100 text-slate-600' };
const STATUS_STYLES = { pending: 'bg-amber-100 text-amber-700', resolved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700' };

export default function CreateClaimPage() {
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBatteries, setCustomerBatteries] = useState([]);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState('');

  const [models, setModels] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);

  const [form, setForm] = useState({
    faulty_battery_id: '',
    co_number: '',
    actual_dos: '',
    stock_status: 'new',
    new_battery_model_id: '',
    new_battery_serial_number: '',
    remarks: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    loadModels();
    loadRecentClaims();
  }, []);

  const loadModels = async () => {
    try {
      const res = await modelAPI.getAll(null, 1);
      if (res.data.success) setModels(res.data.data || []);
    } catch {}
  };

  const loadRecentClaims = async () => {
    setClaimsLoading(true);
    try {
      const res = await claimAPI.getAll(1, 5);
      if (res.data.success) setRecentClaims(res.data.data.claims || []);
    } catch {}
    finally { setClaimsLoading(false); }
  };

  const handleCustomerSearch = async (e) => {
    e.preventDefault();
    if (!customerPhone.trim()) return;
    setCustomerSearchError('');
    setSelectedCustomer(null);
    setCustomerBatteries([]);
    setCustomerSearchLoading(true);
    try {
      const res = await customerAPI.searchByPhone(customerPhone.trim());
      if (res.data.success) {
        const cust = res.data.data;
        setSelectedCustomer(cust);
        const batRes = await batteryAPI.getByCustomer(cust.id);
        if (batRes.data.success) {
          setCustomerBatteries((batRes.data.data || []).map(item => ({
            ...item.battery,
            brand_name: item.brand?.name,
            model_name: item.model?.model_name,
          })));
        }
      } else {
        setCustomerSearchError('Customer not found');
      }
    } catch { setCustomerSearchError('Customer not found'); }
    finally { setCustomerSearchLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) { setFormError('Find a customer first'); return; }
    setFormError('');
    setFormSuccess('');
    setSaving(true);
    try {
      const res = await claimAPI.create({
        customer_id: selectedCustomer.id,
        faulty_battery_id: parseInt(form.faulty_battery_id),
        co_number: form.co_number || null,
        actual_dos: form.actual_dos || null,
        stock_status: form.stock_status,
        new_battery_model_id: form.new_battery_model_id ? parseInt(form.new_battery_model_id) : null,
        new_battery_serial_number: form.new_battery_serial_number || null,
        remarks: form.remarks || null,
      });
      if (res.data.success) {
        setFormSuccess(`Claim #${res.data.data.claim_number} filed successfully`);
        setForm({ faulty_battery_id: '', co_number: '', actual_dos: '', stock_status: 'new', new_battery_model_id: '', new_battery_serial_number: '', remarks: '' });
        setSelectedCustomer(null);
        setCustomerPhone('');
        setCustomerBatteries([]);
        loadRecentClaims();
      } else {
        setFormError(res.data.message || 'Failed to create claim');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create claim');
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Create Claim" icon={FilePlus} />
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-1">New Warranty Claim</h2>
            <p className="text-xs text-slate-500 mb-5">File a claim for a faulty battery.</p>

            {/* Customer search */}
            <div className="mb-5 p-3 bg-slate-50 rounded-lg">
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
              {customerSearchError && <p className="mt-1.5 text-xs text-red-600">{customerSearchError}</p>}
              {selectedCustomer && (
                <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                  <p className="text-xs font-semibold text-emerald-800">{selectedCustomer.name}</p>
                  <p className="text-xs text-emerald-600">{selectedCustomer.phone} · {customerBatteries.length} batteries</p>
                </div>
              )}
            </div>

            {formError && <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{formError}</div>}
            {formSuccess && <div className="mb-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 font-medium">{formSuccess}</div>}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Faulty Battery</label>
                <select
                  value={form.faulty_battery_id}
                  onChange={e => setForm(p => ({ ...p, faulty_battery_id: e.target.value }))}
                  required
                  disabled={customerBatteries.length === 0}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">{selectedCustomer ? (customerBatteries.length === 0 ? 'No batteries on record' : 'Select battery') : 'Find customer first'}</option>
                  {customerBatteries.map(b => (
                    <option key={b.id} value={b.id}>{b.brand_name} {b.model_name} — {b.serial_number}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">CO Number (optional)</label>
                <input value={form.co_number} onChange={e => setForm(p => ({ ...p, co_number: e.target.value }))} placeholder="CO number" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Actual Date of Sale (optional)</label>
                <input type="date" value={form.actual_dos} onChange={e => setForm(p => ({ ...p, actual_dos: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Stock Status</label>
                <select value={form.stock_status} onChange={e => setForm(p => ({ ...p, stock_status: e.target.value }))} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="new">New</option>
                  <option value="foc">FOC</option>
                  <option value="not_in_stock">Not in Stock</option>
                </select>
              </div>

              {form.stock_status !== 'not_in_stock' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">New Battery Model (optional)</label>
                    <select value={form.new_battery_model_id} onChange={e => setForm(p => ({ ...p, new_battery_model_id: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select model</option>
                      {models.map(m => <option key={m.id} value={m.id}>{m.model_name}{m.warranty_months ? ` (${m.warranty_months}mo)` : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">New Battery Serial # (optional)</label>
                    <input value={form.new_battery_serial_number} onChange={e => setForm(p => ({ ...p, new_battery_serial_number: e.target.value }))} placeholder="New serial number" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Remarks (optional)</label>
                <textarea value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} rows={2} placeholder="Additional remarks..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <button type="submit" disabled={saving} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {saving ? 'Filing Claim...' : 'File Claim'}
              </button>
            </form>
          </div>

          {/* Recent claims */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Recent Claims</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {['Claim No.', 'Customer', 'Model', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {claimsLoading ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">Loading...</td></tr>
                  ) : recentClaims.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">No claims yet</td></tr>
                  ) : recentClaims.map(item => {
                    const c = item.claim;
                    const statusCls = STATUS_STYLES[c.status] || 'bg-slate-100 text-slate-600';
                    return (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3.5 text-sm font-mono font-semibold text-slate-800">C{String(c.claim_number).padStart(5, '0')}</td>
                        <td className="px-6 py-3.5">
                          <p className="text-sm font-medium text-slate-800">{item.customer_name}</p>
                          <p className="text-xs text-slate-400">{item.customer_phone}</p>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-slate-600">{item.new_model_name || item.battery_serial || '—'}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusCls}`}>{c.status}</span>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
