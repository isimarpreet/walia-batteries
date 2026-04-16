'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Battery, FilePlus, FileText, Tag, LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Batteries', path: '/batteries', icon: Battery },
  { label: 'Create Claim', path: '/claims/create', icon: FilePlus },
  { label: 'Claims', path: '/claims', icon: FileText },
  { label: 'Brands & Models', path: '/brands', icon: Tag },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-[#1a2035] flex flex-col flex-shrink-0">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Battery size={15} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-white font-bold text-base">WaliaBat</span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <span className="text-xs text-slate-300 flex-1 truncate">Admin</span>
          <button
            onClick={logout}
            title="Logout"
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
