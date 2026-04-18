'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../DashboardLayout';
import { brandAPI, modelAPI } from '../../services/api';
import { Plus } from 'lucide-react';

export default function BrandsPage() {
  const [tab, setTab] = useState('brands');
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(true);

  /* Brand form */
  const [brandName, setBrandName] = useState('');
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandErr, setBrandErr] = useState('');
  const [brandOk, setBrandOk] = useState('');

  /* Model form */
  const [modelForm, setModelForm] = useState({ brand_id: '', model_name: '', warranty_months: '' });
  const [modelSaving, setModelSaving] = useState(false);
  const [modelErr, setModelErr] = useState('');
  const [modelOk, setModelOk] = useState('');

  const loadBrands = async () => {
    setBrandsLoading(true);
    try {
      const res = await brandAPI.getAll();
      if (res.data.success) setBrands(res.data.data || []);
    } catch {}
    finally { setBrandsLoading(false); }
  };

  const loadModels = async () => {
    setModelsLoading(true);
    try {
      const res = await modelAPI.getAll();
      if (res.data.success) setModels(res.data.data || []);
    } catch {}
    finally { setModelsLoading(false); }
  };

  useEffect(() => { loadBrands(); loadModels(); }, []);

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    setBrandErr(''); setBrandOk(''); setBrandSaving(true);
    try {
      const res = await brandAPI.create({ name: brandName });
      if (res.data.success) { setBrandOk('Brand added.'); setBrandName(''); loadBrands(); }
      else setBrandErr(res.data.message || 'Failed to add brand');
    } catch (err) { setBrandErr(err.response?.data?.message || 'Failed to add brand'); }
    finally { setBrandSaving(false); }
  };

  const handleModelSubmit = async (e) => {
    e.preventDefault();
    setModelErr(''); setModelOk(''); setModelSaving(true);
    try {
      const res = await modelAPI.create({
        brand_id: parseInt(modelForm.brand_id),
        model_name: modelForm.model_name,
        warranty_months: modelForm.warranty_months ? parseInt(modelForm.warranty_months) : null,
      });
      if (res.data.success) { setModelOk('Model added.'); setModelForm({ brand_id: '', model_name: '', warranty_months: '' }); loadModels(); }
      else setModelErr(res.data.message || 'Failed to add model');
    } catch (err) { setModelErr(err.response?.data?.message || 'Failed to add model'); }
    finally { setModelSaving(false); }
  };

  const brandsMap = Object.fromEntries(brands.map(b => [b.id, b.name]));

  return (
    <DashboardLayout>
      <div className="page fade-in">
        <div className="page-head">
          <div>
            <h1 className="page-title">Brands & models</h1>
            <p className="page-sub">Catalogue of brands you stock and the models under each, with warranty periods.</p>
          </div>
        </div>

        {/* Tab chips */}
        <div className="chips" style={{ marginBottom: 20 }}>
          <button className={'chip' + (tab === 'brands' ? ' active' : '')} onClick={() => setTab('brands')}>
            Brands <span style={{ opacity: 0.55, marginLeft: 4 }}>{brands.length}</span>
          </button>
          <button className={'chip' + (tab === 'models' ? ' active' : '')} onClick={() => setTab('models')}>
            Models <span style={{ opacity: 0.55, marginLeft: 4 }}>{models.length}</span>
          </button>
        </div>

        <div className="brands-grid" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
          {tab === 'brands' ? (
            <>
              {/* Add brand form */}
              <div className="card card-pad">
                <div className="card-title" style={{ marginBottom: 4 }}>Add a brand</div>
                <div className="card-sub" style={{ marginBottom: 16 }}>New manufacturer in the catalogue.</div>
                {brandErr && <div style={{ marginBottom: 12, padding: '9px 12px', background: 'var(--bad-soft)', color: 'var(--bad)', borderRadius: 8, fontSize: 13 }}>{brandErr}</div>}
                {brandOk  && <div style={{ marginBottom: 12, padding: '9px 12px', background: 'var(--ok-soft)',  color: 'var(--ok)',  borderRadius: 8, fontSize: 13 }}>{brandOk}</div>}
                <form onSubmit={handleBrandSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="field">
                    <label>Brand name</label>
                    <input className="input" value={brandName} onChange={e => setBrandName(e.target.value)} required placeholder="e.g. Tata Green" />
                  </div>
                  <button className="btn primary" type="submit" disabled={brandSaving} style={{ justifyContent: 'center' }}>
                    <Plus size={13} strokeWidth={1.75} />{brandSaving ? 'Adding…' : 'Add brand'}
                  </button>
                </form>
              </div>

              {/* Brands table */}
              <div className="card">
                <div className="card-head"><div className="card-title">All brands</div></div>
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Brand</th>
                        <th className="num">Models</th>
                        <th className="num">Units sold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brandsLoading ? (
                        <tr><td colSpan={3} className="empty">Loading…</td></tr>
                      ) : brands.length === 0 ? (
                        <tr><td colSpan={3} className="empty">No brands yet.</td></tr>
                      ) : brands.map(b => {
                        const mc = models.filter(m => m.brand_id === b.id).length;
                        return (
                          <tr key={b.id}>
                            <td className="strong">{b.name}</td>
                            <td className="num">{mc}</td>
                            <td className="num">—</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Add model form */}
              <div className="card card-pad">
                <div className="card-title" style={{ marginBottom: 4 }}>Add a model</div>
                <div className="card-sub" style={{ marginBottom: 16 }}>Link it to a brand and set warranty.</div>
                {modelErr && <div style={{ marginBottom: 12, padding: '9px 12px', background: 'var(--bad-soft)', color: 'var(--bad)', borderRadius: 8, fontSize: 13 }}>{modelErr}</div>}
                {modelOk  && <div style={{ marginBottom: 12, padding: '9px 12px', background: 'var(--ok-soft)',  color: 'var(--ok)',  borderRadius: 8, fontSize: 13 }}>{modelOk}</div>}
                <form onSubmit={handleModelSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="field">
                    <label>Brand</label>
                    <select className="ds-select input" value={modelForm.brand_id} onChange={e => setModelForm(p => ({ ...p, brand_id: e.target.value }))} required>
                      <option value="">Select brand</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Model name</label>
                    <input className="input" value={modelForm.model_name} onChange={e => setModelForm(p => ({ ...p, model_name: e.target.value }))} required placeholder="e.g. FEW0-TZ0" />
                  </div>
                  <div className="field">
                    <label>Warranty (months)</label>
                    <input type="number" className="input" value={modelForm.warranty_months} onChange={e => setModelForm(p => ({ ...p, warranty_months: e.target.value }))} placeholder="24" min="1" />
                  </div>
                  <button className="btn primary" type="submit" disabled={modelSaving} style={{ justifyContent: 'center' }}>
                    <Plus size={13} strokeWidth={1.75} />{modelSaving ? 'Adding…' : 'Add model'}
                  </button>
                </form>
              </div>

              {/* Models table */}
              <div className="card">
                <div className="card-head"><div className="card-title">All models</div></div>
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Model</th><th>Brand</th><th>Warranty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelsLoading ? (
                        <tr><td colSpan={3} className="empty">Loading…</td></tr>
                      ) : models.length === 0 ? (
                        <tr><td colSpan={3} className="empty">No models yet.</td></tr>
                      ) : models.map(m => (
                        <tr key={m.id}>
                          <td className="strong">{m.model_name}</td>
                          <td style={{ color: 'var(--muted)' }}>{brandsMap[m.brand_id] || '—'}</td>
                          <td>{m.warranty_months ? `${m.warranty_months} months` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
