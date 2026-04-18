'use client';

import { ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PageHeader({ title, icon: Icon }) {
  const { user } = useAuth();
  return (
    <div className="bg-white border-b border-slate-200 px-8 h-16 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-blue-500" />}
        <h1 className="font-semibold text-slate-800">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
          {user?.email?.[0]?.toUpperCase() || 'A'}
        </div>
        <span className="text-sm text-slate-600">Admin</span>
        <ChevronDown size={14} className="text-slate-400" />
      </div>
    </div>
  );
}
