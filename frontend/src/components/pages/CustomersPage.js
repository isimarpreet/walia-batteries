'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../DashboardLayout';
import PageHeader from '../PageHeader';
import { customerAPI } from '../../services/api';
import { Users, Search, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchPhone, setSearchPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => { loadCustomers(1); }, []);

  const loadCustomers = async (p) => {
    setLoading(true);
    setIsSearching(false);
    setSearchPhone('');
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
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchPhone.trim()) { loadCustomers(1); return; }
    setLoading(true);
    setIsSearching(true);
    try {
      const res = await customerAPI.searchByPhone(searchPhone.trim());
      setCustomers(res.data.success ? [res.data.data] : []);
      setTotalPages(1);
      setTotalCount(res.data.success ? 1 : 0);
    } catch { setCustomers([]); setTotalCount(0); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSaving(true);
    try {
      const res = await customerAPI.create(form);
      if (res.data.success) {
        setFormSuccess('Customer created!');
        setForm({ name: '', phone: '', email: '', address: '' });
        loadCustomers(1);
        setTimeout(() => { setShowModal(false); setFormSuccess(''); }, 1200);
      } else {
        setFormError(res.data.message || 'Failed to create customer');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create customer');
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Customers" icon={Users} />
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800 mb-3">Customers</h2>
            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
                <Search size={13} className="text-slate-400 flex-shrink-0" />
                <input
                  value={searchPhone}
                  onChange={e => setSearchPhone(e.target.value)}
                  className="flex-1 bg-transparent text-xs outline-none text-slate-700 placeholder-slate-400"
                  placeholder="Search by phone number"
                />
                <button type="submit" className="text-xs text-blue-600 font-semibold hover:text-blue-700">Search</button>
              </form>
              {isSearching && (
                <button onClick={() => { setSearchPhone(''); loadCustomers(1); }} className="text-xs text-slate-500 hover:text-slate-700">Clear</button>
              )}
              <button
                onClick={() => { setShowModal(true); setFormError(''); setFormSuccess(''); }}
                className="ml-auto flex items-center gap-1.5 bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={13} /> Add Customer
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['Name', 'Phone', 'Email', 'Address', 'Action'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">Loading...</td></tr>
                ) : customers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">No customers found</td></tr>
                ) : customers.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-medium text-slate-800">{c.name}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">{c.phone}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-500">{c.email || '—'}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-500 max-w-[200px] truncate">{c.address || '—'}</td>
                    <td className="px-6 py-3.5">
                      <button className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isSearching && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">{totalCount} total</p>
              <div className="flex items-center gap-1">
                <button onClick={() => loadCustomers(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => loadCustomers(p)} className={`w-7 h-7 text-xs rounded-lg font-medium ${p === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{p}</button>
                ))}
                {totalPages > 7 && <span className="text-slate-400 text-xs px-1">…</span>}
                <button onClick={() => loadCustomers(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800">Add New Customer</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            {formError && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{formError}</div>}
            {formSuccess && <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">{formSuccess}</div>}
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Customer name" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required placeholder="Phone number" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email (optional)</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Address (optional)</label>
                <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} placeholder="Address" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">{saving ? 'Saving...' : 'Save Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
