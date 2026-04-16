'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../DashboardLayout';
import PageHeader from '../PageHeader';
import { claimAPI } from '../../services/api';
import { FileText, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

const STOCK_LABELS = { new: 'New', foc: 'FOC', not_in_stock: 'Not in Stock' };

export default function ClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { loadClaims(1, ''); }, []);

  const loadClaims = async (p, status) => {
    setLoading(true);
    try {
      const res = await claimAPI.getAll(p, PAGE_SIZE, status || undefined);
      if (res.data.success) {
        setClaims(res.data.data.claims || []);
        setTotalPages(res.data.data.total_pages || 1);
        setTotalCount(res.data.data.total_count || 0);
        setPage(p);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    loadClaims(1, status);
  };

  return (
    <DashboardLayout>
      <PageHeader title="All Claims" icon={FileText} />
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-slate-800">All Claims</h2>
              <div className="flex items-center gap-1">
                {['', 'pending', 'resolved', 'rejected'].map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                      statusFilter === s
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => router.push('/claims/create')}
              className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={13} /> New Claim
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['Claim No.', 'Customer', 'Battery Serial', 'Stock', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">Loading...</td></tr>
                ) : claims.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">No claims found</td></tr>
                ) : claims.map(item => {
                  const c = item.claim;
                  const statusCls = STATUS_STYLES[c.status] || 'bg-slate-100 text-slate-600';
                  return (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3.5 text-sm font-mono font-semibold text-slate-800">C{String(c.claim_number).padStart(5, '0')}</td>
                      <td className="px-6 py-3.5">
                        <p className="text-sm font-medium text-slate-800">{item.customer_name}</p>
                        <p className="text-xs text-slate-400">{item.customer_phone}</p>
                      </td>
                      <td className="px-6 py-3.5 text-sm font-mono text-slate-500">{item.battery_serial || '—'}</td>
                      <td className="px-6 py-3.5 text-sm text-slate-600">{STOCK_LABELS[c.stock_status] || c.stock_status}</td>
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

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">{totalCount} claims total</p>
              <div className="flex items-center gap-1">
                <button onClick={() => loadClaims(page - 1, statusFilter)} disabled={page === 1} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={14} /></button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => loadClaims(p, statusFilter)} className={`w-7 h-7 text-xs rounded-lg font-medium ${p === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{p}</button>
                ))}
                {totalPages > 7 && <span className="text-slate-400 text-xs px-1">…</span>}
                <button onClick={() => loadClaims(page + 1, statusFilter)} disabled={page === totalPages} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
