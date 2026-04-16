'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../DashboardLayout';
import PageHeader from '../PageHeader';
import { brandAPI, modelAPI } from '../../services/api';
import { Tag, Plus } from 'lucide-react';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);

  const [brandName, setBrandName] = useState('');
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandError, setBrandError] = useState('');
  const [brandSuccess, setBrandSuccess] = useState('');

  const [modelForm, setModelForm] = useState({ brand_id: '', model_name: '', warranty_months: '' });
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState('');
  const [modelSuccess, setModelSuccess] = useState('');

  useEffect(() => {
    loadBrands();
    loadModels();
  }, []);

  const loadBrands = async () => {
    try {
      const res = await brandAPI.getAll();
      if (res.data.success) setBrands(res.data.data || []);
    } catch {}
  };

  const loadModels = async () => {
    try {
      const res = await modelAPI.getAll();
      if (res.data.success) setModels(res.data.data || []);
    } catch {}
  };

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    setBrandError('');
    setBrandSuccess('');
    setBrandLoading(true);
    try {
      const res = await brandAPI.create({ name: brandName });
      if (res.data.success) {
        setBrandSuccess('Brand created successfully');
        setBrandName('');
        loadBrands();
      } else {
        setBrandError(res.data.message || 'Failed to create brand');
      }
    } catch (err) {
      setBrandError(err.response?.data?.message || 'Failed to create brand');
    } finally { setBrandLoading(false); }
  };

  const handleModelSubmit = async (e) => {
    e.preventDefault();
    setModelError('');
    setModelSuccess('');
    setModelLoading(true);
    try {
      const res = await modelAPI.create({
        brand_id: parseInt(modelForm.brand_id),
        model_name: modelForm.model_name,
        warranty_months: modelForm.warranty_months ? parseInt(modelForm.warranty_months) : null,
      });
      if (res.data.success) {
        setModelSuccess('Model created successfully');
        setModelForm({ brand_id: '', model_name: '', warranty_months: '' });
        loadModels();
      } else {
        setModelError(res.data.message || 'Failed to create model');
      }
    } catch (err) {
      setModelError(err.response?.data?.message || 'Failed to create model');
    } finally { setModelLoading(false); }
  };

  const brandsMap = Object.fromEntries(brands.map(b => [b.id, b.name]));

  return (
    <DashboardLayout>
      <PageHeader title="Brands & Models" icon={Tag} />
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brands column */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-1">Add Brand</h2>
              <p className="text-xs text-slate-500 mb-4">Add a new battery brand.</p>
              {brandError && <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{brandError}</div>}
              {brandSuccess && <div className="mb-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">{brandSuccess}</div>}
              <form onSubmit={handleBrandSubmit} className="flex gap-2">
                <input
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  required
                  placeholder="Brand name (e.g. Exide)"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" disabled={brandLoading} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                  <Plus size={14} />{brandLoading ? 'Adding...' : 'Add'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">All Brands</h3>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{brands.length}</span>
              </div>
              {brands.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-slate-400">No brands yet.</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {brands.map(b => (
                    <div key={b.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-medium text-slate-700">{b.name}</span>
                      <span className="text-xs text-slate-400 font-mono">#{b.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Models column */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-1">Add Model</h2>
              <p className="text-xs text-slate-500 mb-4">Add a new battery model under a brand.</p>
              {modelError && <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{modelError}</div>}
              {modelSuccess && <div className="mb-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">{modelSuccess}</div>}
              <form onSubmit={handleModelSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Brand</label>
                  <select value={modelForm.brand_id} onChange={e => setModelForm(p => ({ ...p, brand_id: e.target.value }))} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Model Name</label>
                  <input value={modelForm.model_name} onChange={e => setModelForm(p => ({ ...p, model_name: e.target.value }))} required placeholder="e.g. FEW0-TZ0" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Warranty (months, optional)</label>
                  <input type="number" value={modelForm.warranty_months} onChange={e => setModelForm(p => ({ ...p, warranty_months: e.target.value }))} min="1" placeholder="e.g. 24" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="submit" disabled={modelLoading} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
                  {modelLoading ? 'Adding...' : 'Add Model'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">All Models</h3>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{models.length}</span>
              </div>
              {models.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-slate-400">No models yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        {['Brand', 'Model', 'Warranty'].map(h => (
                          <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {models.map(m => (
                        <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 text-sm text-slate-600">{brandsMap[m.brand_id] || '—'}</td>
                          <td className="px-6 py-3 text-sm font-medium text-slate-800">{m.model_name}</td>
                          <td className="px-6 py-3 text-sm text-slate-500">{m.warranty_months ? `${m.warranty_months} mo` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
