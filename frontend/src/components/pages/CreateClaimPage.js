'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../DashboardLayout';
import { claimAPI, customerAPI, batteryAPI, modelAPI } from '../../services/api';
import { Search, Battery, ChevronRight, ChevronLeft, Check } from 'lucide-react';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CreateClaimPage() {
  const router = useRouter();

  /* Step state */
  const [step, setStep] = useState(1);

  /* Step 1 — find customer */
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [searchErr, setSearchErr] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  /* Step 2 — pick battery */
  const [batteries, setBatteries] = useState([]);
  const [batteryId, setBatteryId] = useState(null);

  /* Step 3 — details */
  const [models, setModels] = useState([]);
  const [form, setForm] = useState({
    actual_dos: '', co_number: '', stock_status: 'not_in_stock',
    new_battery_model_id: '', new_battery_serial_number: '', remarks: '',
  });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  /* Success */
  const [submitted, setSubmitted] = useState(null); // claim number

  useEffect(() => {
    modelAPI.getAll(null, 1).then(r => { if (r.data.success) setModels(r.data.data || []); }).catch(() => {});
  }, []);

  /* Step 1 submit */
  const doSearch = async (e) => {
    e.preventDefault();
    setSearchErr(''); setCustomer(null);
    setSearchLoading(true);
    try {
      const res = await customerAPI.searchByPhone(phone.trim());
      if (!res.data.success) { setSearchErr('No customer found for that phone number.'); return; }
      const cust = res.data.data;
      setCustomer(cust);
      // load their batteries
      const bRes = await batteryAPI.getByCustomer(cust.id);
      if (bRes.data.success) {
        setBatteries((bRes.data.data || []).map(i => ({
          ...i.battery, brand_name: i.brand?.name, model_name: i.model?.model_name,
        })));
      }
      setStep(2);
    } catch { setSearchErr('No customer found for that phone number.'); }
    finally { setSearchLoading(false); }
  };

  /* Step 3 submit */
  const doSubmit = async (e) => {
    e.preventDefault();
    setFormErr(''); setSaving(true);
    try {
      const res = await claimAPI.create({
        customer_id: customer.id,
        faulty_battery_id: batteryId,
        co_number: form.co_number || null,
        actual_dos: form.actual_dos || null,
        stock_status: form.stock_status,
        new_battery_model_id: form.new_battery_model_id ? parseInt(form.new_battery_model_id) : null,
        new_battery_serial_number: form.new_battery_serial_number || null,
        remarks: form.remarks || null,
      });
      if (res.data.success) {
        setSubmitted(res.data.data.claim_number);
      } else {
        setFormErr(res.data.message || 'Failed to file claim');
      }
    } catch (err) {
      setFormErr(err.response?.data?.message || 'Failed to file claim');
    } finally { setSaving(false); }
  };

  /* ── Success screen ── */
  if (submitted !== null) {
    return (
      <DashboardLayout>
        <div className="page fade-in" style={{ maxWidth: 640 }}>
          <div className="card card-pad" style={{ textAlign: 'center', padding: '56px 40px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--ok-soft)', color: 'var(--ok)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
              <Check size={28} strokeWidth={2} />
            </div>
            <div className="page-title" style={{ fontSize: 28 }}>Claim filed</div>
            <p className="page-sub" style={{ margin: '10px auto 24px' }}>
              Claim <span className="ff-mono" style={{ color: 'var(--ink)' }}>C{String(submitted).padStart(5, '0')}</span>{' '}
              has been logged for <strong>{customer?.name}</strong>.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn" onClick={() => { setSubmitted(null); setStep(1); setCustomer(null); setPhone(''); setBatteryId(null); setBatteries([]); setForm({ actual_dos: '', co_number: '', stock_status: 'not_in_stock', new_battery_model_id: '', new_battery_serial_number: '', remarks: '' }); }}>
                File another
              </button>
              <button className="btn primary" onClick={() => router.push('/claims')}>
                View claims
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const selectedBattery = batteries.find(b => b.id === batteryId);

  return (
    <DashboardLayout>
      <div className="page fade-in" style={{ maxWidth: 860 }}>
        <div className="page-head">
          <div>
            <h1 className="page-title">File a claim</h1>
            <p className="page-sub">Find the customer, pick the faulty unit, log the details.</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="stepline">
          <div className={'step' + (step === 1 ? ' active' : step > 1 ? ' done' : '')}>
            <div className="step-num">{step > 1 ? '✓' : '1'}</div>
            <span>Find customer</span>
          </div>
          <div className="step-sep" />
          <div className={'step' + (step === 2 ? ' active' : step > 2 ? ' done' : '')}>
            <div className="step-num">{step > 2 ? '✓' : '2'}</div>
            <span>Faulty unit</span>
          </div>
          <div className="step-sep" />
          <div className={'step' + (step === 3 ? ' active' : '')}>
            <div className="step-num">3</div>
            <span>Details</span>
          </div>
        </div>

        <div className="card card-pad">
          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <div className="card-title" style={{ marginBottom: 4 }}>Locate the customer</div>
              <div className="card-sub" style={{ marginBottom: 18 }}>Search by their registered phone number.</div>
              <form onSubmit={doSearch} style={{ display: 'flex', gap: 8 }}>
                <input className="input" style={{ flex: 1 }} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" required />
                <button type="submit" className="btn primary" disabled={searchLoading}>
                  <Search size={14} strokeWidth={1.75} />{searchLoading ? 'Searching…' : 'Find'}
                </button>
              </form>
              {searchErr && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bad-soft)', color: 'var(--bad)', borderRadius: 8, fontSize: 13 }}>
                  {searchErr}
                </div>
              )}
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && customer && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <div className="card-title">Select the faulty battery</div>
                  <div className="card-sub" style={{ marginTop: 3 }}>
                    {customer.name} · {customer.phone} · {batteries.length} battery{batteries.length !== 1 ? 'ies' : 'y'} on file
                  </div>
                </div>
                <button className="btn sm ghost" onClick={() => { setStep(1); setCustomer(null); setBatteries([]); }}>
                  <ChevronLeft size={12} />Change
                </button>
              </div>
              {batteries.length === 0 ? (
                <div className="empty">This customer has no batteries on file.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {batteries.map(b => (
                    <button
                      key={b.id}
                      onClick={() => { setBatteryId(b.id); setStep(3); }}
                      style={{ border: '1px solid var(--hair)', borderRadius: 10, padding: '14px 16px', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', width: '100%', cursor: 'pointer', transition: 'border-color 120ms, background 120ms' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hair)'; e.currentTarget.style.background = 'var(--surface)'; }}
                    >
                      <div style={{ width: 36, height: 36, background: 'var(--surface-2)', borderRadius: 8, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <Battery size={18} strokeWidth={1.75} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{b.brand_name} · {b.model_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                          <span className="ff-mono">{b.serial_number}</span> · Sold {fmtDate(b.date_of_sale)}
                        </div>
                      </div>
                      <ChevronRight size={16} strokeWidth={1.75} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && customer && selectedBattery && (
            <form onSubmit={doSubmit}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <div>
                  <div className="card-title">Claim details</div>
                  <div className="card-sub" style={{ marginTop: 3 }}>
                    {customer.name} · <span className="ff-mono">{selectedBattery.serial_number}</span>
                  </div>
                </div>
                <button type="button" className="btn sm ghost" onClick={() => setStep(2)}>
                  <ChevronLeft size={12} />Back
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="field">
                  <label>Actual date of sale</label>
                  <input type="date" className="input" value={form.actual_dos} onChange={e => setForm(p => ({ ...p, actual_dos: e.target.value }))} />
                </div>
                <div className="field">
                  <label>CO number <span style={{ color: 'var(--muted-2)', fontWeight: 400 }}>(optional)</span></label>
                  <input className="input" value={form.co_number} onChange={e => setForm(p => ({ ...p, co_number: e.target.value }))} placeholder="CO-4413" />
                </div>
              </div>

              <div className="field" style={{ marginBottom: 14 }}>
                <label>Replacement stock status</label>
                <select className="ds-select input" value={form.stock_status} onChange={e => setForm(p => ({ ...p, stock_status: e.target.value }))}>
                  <option value="not_in_stock">Awaiting stock</option>
                  <option value="new">New unit provided</option>
                  <option value="foc">Free of cost (FOC)</option>
                </select>
              </div>

              {form.stock_status !== 'not_in_stock' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 14, background: 'var(--surface-2)', borderRadius: 10, marginBottom: 14 }}>
                  <div className="field">
                    <label>Replacement model</label>
                    <select className="ds-select input" value={form.new_battery_model_id} onChange={e => setForm(p => ({ ...p, new_battery_model_id: e.target.value }))}>
                      <option value="">Select…</option>
                      {models.map(m => <option key={m.id} value={m.id}>{m.model_name}{m.warranty_months ? ` (${m.warranty_months} mo)` : ''}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Replacement serial</label>
                    <input className="input" value={form.new_battery_serial_number} onChange={e => setForm(p => ({ ...p, new_battery_serial_number: e.target.value }))} placeholder="Serial #" />
                  </div>
                </div>
              )}

              <div className="field" style={{ marginBottom: 22 }}>
                <label>Remarks</label>
                <textarea className="input ds-textarea" rows={3} value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} placeholder="Condition of the unit, reason for claim…" style={{ resize: 'vertical', minHeight: 80 }} />
              </div>

              {formErr && (
                <div style={{ marginBottom: 14, padding: '10px 14px', background: 'var(--bad-soft)', color: 'var(--bad)', borderRadius: 8, fontSize: 13 }}>{formErr}</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 14, borderTop: '1px solid var(--hair)' }}>
                <button type="button" className="btn" onClick={() => router.push('/claims')}>Cancel</button>
                <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Filing…' : 'Submit claim'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
