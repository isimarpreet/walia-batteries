'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Battery, FileText, FilePlus, Tag, LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',     path: '/',              icon: LayoutDashboard },
  { id: 'customers',   label: 'Customers',     path: '/customers',     icon: Users },
  { id: 'batteries',   label: 'Batteries',     path: '/batteries',     icon: Battery },
  { id: 'claims',      label: 'Claims',        path: '/claims',        icon: FileText },
  { id: 'createclaim', label: 'File a claim',  path: '/claims/create', icon: FilePlus },
];

const SECONDARY = [
  { id: 'brands', label: 'Brands & models', path: '/brands', icon: Tag },
];

function Monogram() {
  return (
    <div className="monogram">
      <svg viewBox="0 0 32 32" width={20} height={20} aria-hidden="true">
        <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" fill="none">
          <path d="M5 8 L10 24" />
          <path d="M14 8 L11 24" />
          <path d="M14 8 L19 24" />
          <path d="M23 8 L20 24" />
        </g>
      </svg>
    </div>
  );
}

export default function Sidebar({ mobileOpen = false, onClose }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const navigate = (path) => {
    router.push(path);
    onClose?.();   // auto-close on mobile after tapping a nav item
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    onClose?.();
  };

  return (
    <aside className={'sidebar' + (mobileOpen ? ' mobile-open' : '')}>
      {/* Brand */}
      <div className="brand">
        <Monogram />
        <div>
          <div className="brand-name">Walia</div>
          <div className="brand-sub">Batteries · Admin</div>
        </div>
      </div>

      {/* Primary nav */}
      <div className="nav-label">Workspace</div>
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const active = pathname === item.path;
        return (
          <button
            key={item.id}
            className={'nav-item' + (active ? ' active' : '')}
            onClick={() => navigate(item.path)}
          >
            <Icon size={16} strokeWidth={1.75} className="nav-icon" />
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* Secondary nav */}
      <div className="nav-label">System</div>
      {SECONDARY.map(item => {
        const Icon = item.icon;
        const active = pathname === item.path;
        return (
          <button
            key={item.id}
            className={'nav-item' + (active ? ' active' : '')}
            onClick={() => navigate(item.path)}
          >
            <Icon size={16} strokeWidth={1.75} className="nav-icon" />
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="avatar" style={{ width: 30, height: 30 }}>AR</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name">Admin</div>
          <div className="user-role">Walia HQ</div>
        </div>
        <button className="icon-btn" title="Sign out" onClick={handleLogout}>
          <LogOut size={15} strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  );
}
