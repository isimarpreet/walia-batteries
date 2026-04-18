'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { label: 'Customers', path: '/' },
  { label: 'Batteries', path: '/batteries' },
  { label: 'Claims', path: '/claims' },
  { label: 'Brands & Models', path: '/brands' },
];

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              Battery Claim Management
            </h1>
            <p className="text-xs text-slate-500">
              Manage customers and their batteries
            </p>
          </div>
          <nav className="flex gap-2">
            {NAV.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`text-xs font-medium px-3 py-1.5 rounded-md ${
                  pathname === item.path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">{user.email}</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          )}
          <button
            onClick={logout}
            className="text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-md px-3 py-1.5"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 px-6 py-6">{children}</main>
    </div>
  );
};

export default AppLayout;
