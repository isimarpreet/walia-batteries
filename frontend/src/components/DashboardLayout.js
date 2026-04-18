'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { Search, Bell, Plus, Menu } from 'lucide-react';

const CRUMBS = {
  '/':              ['Workspace', 'Dashboard'],
  '/customers':     ['Workspace', 'Customers'],
  '/batteries':     ['Workspace', 'Batteries'],
  '/claims':        ['Workspace', 'Claims'],
  '/claims/create': ['Workspace', 'Claims', 'New'],
  '/brands':        ['System', 'Brands & models'],
};

function Topbar({ onMenuClick }) {
  const pathname = usePathname();
  const router   = useRouter();
  const crumb    = CRUMBS[pathname] || ['Workspace'];

  return (
    <div className="topbar">
      {/* Hamburger — only visible on mobile via CSS */}
      <button
        className="hamburger icon-btn"
        onClick={onMenuClick}
        aria-label="Open navigation"
        style={{ flexShrink: 0 }}
      >
        <Menu size={18} strokeWidth={1.75} />
      </button>

      <nav className="crumb" aria-label="Breadcrumb">
        {crumb.map((seg, i) => (
          <span key={i}>
            {i > 0 && <span style={{ margin: '0 8px', color: 'var(--muted-2)' }}>/</span>}
            {i === crumb.length - 1 ? <strong>{seg}</strong> : seg}
          </span>
        ))}
      </nav>

      {/* Search — hidden on mobile via CSS */}
      <div className="topbar-search">
        <Search size={14} className="ts-icon" />
        <input placeholder="Search customers, batteries, serial…" />
        <span className="kbd">⌘ K</span>
      </div>

      <button className="icon-btn" title="Notifications">
        <Bell size={15} strokeWidth={1.75} />
      </button>
      <button className="icon-btn" title="File a claim" onClick={() => router.push('/claims/create')}>
        <Plus size={15} strokeWidth={1.75} />
      </button>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app">
      {/* Sidebar */}
      <Sidebar mobileOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Mobile scrim — clicking outside closes the sidebar */}
      <div
        className={'sidebar-mobile-scrim' + (sidebarOpen ? ' open' : '')}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </div>
    </div>
  );
}
