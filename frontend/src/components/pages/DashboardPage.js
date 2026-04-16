'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../DashboardLayout';
import PageHeader from '../PageHeader';
import { customerAPI, batteryAPI, claimAPI } from '../../services/api';
import {
  Users, Battery, FileText, AlertCircle, Search, LayoutDashboard,
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-5 flex items-center justify-between shadow-sm border border-slate-100">
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value ?? '—'}</p>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
  </div>
);

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ customers: null, batteries: null, claims: null, pending: null });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cRes, bRes, clRes, pRes, custRes] = await Promise.allSettled([
        customerAPI.getAll(1, 1),
        batteryAPI.getAll(1, 1),
        claimAPI.getAll(1, 1),
        claimAPI.getAll(1, 1, 'pending'),
        customerAPI.getAll(1, 8),
      ]);
      if (cRes.status === 'fulfilled' && cRes.value.data.success)
        setStats(s => ({ ...s, customers: cRes.value.data.data?.total_count ?? 0 }));
      if (bRes.status === 'fulfilled' && bRes.value.data.success)
        setStats(s => ({ ...s, batteries: bRes.value.data.data?.total_count ?? 0 }));
      if (clRes.status === 'fulfilled' && clRes.value.data.success)
        setStats(s => ({ ...s, claims: clRes.value.data.data?.total_count ?? 0 }));
      if (pRes.status === 'fulfilled' && pRes.value.data.success)
        setStats(s => ({ ...s, pending: pRes.value.data.data?.total_count ?? 0 }));
      if (custRes.status === 'fulfilled' && custRes.value.data.success)
        setCustomers(custRes.value.data.data?.customers || []);
    } catch {}
    finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchPhone.trim()) { loadAll(); return; }
    setLoading(true);
    try {
      const res = await customerAPI.searchByPhone(searchPhone.trim());
      setCustomers(res.data.success ? [res.data.data] : []);
    } catch { setCustomers([]); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Dashboard" icon={LayoutDashboard} />

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-sm text-slate-500">Welcome back, Admin! 👋</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Customers" value={stats.customers} icon={Users} color="bg-blue-500" />
          <StatCard label="Total Batteries Sold" value={stats.batteries} icon={Battery} color="bg-emerald-500" />
          <StatCard label="Total Claims" value={stats.claims} icon={FileText} color="bg-violet-500" />
          <StatCard label="Pending Claims" value={stats.pending} icon={AlertCircle} color="bg-amber-500" />
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Recent Customers</h3>
            <button
              onClick={() => router.push('/customers')}
              className="bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Customer
            </button>
          </div>

          <div className="px-6 py-3 border-b border-slate-100">
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 max-w-sm">
              <Search size={13} className="text-slate-400 flex-shrink-0" />
              <input
                value={searchPhone}
                onChange={e => setSearchPhone(e.target.value)}
                className="flex-1 bg-transparent text-xs outline-none text-slate-700 placeholder-slate-400"
                placeholder="Search by phone number"
              />
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['Name', 'Phone', 'Email', 'Address', 'Action'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
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
                    <td className="px-6 py-3.5 text-sm text-slate-500 max-w-[180px] truncate">{c.address || '—'}</td>
                    <td className="px-6 py-3.5">
                      <button
                        onClick={() => router.push('/customers')}
                        className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
