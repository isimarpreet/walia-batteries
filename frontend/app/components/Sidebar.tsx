"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Battery, FilePlus2, ClipboardList, UserCircle } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Batteries", href: "/batteries", icon: Battery },
    { name: "Create Claim", href: "/claims/create", icon: FilePlus2 },
    { name: "Claims", href: "/claims", icon: ClipboardList },
  ];

  return (
    <div className="flex h-full flex-col bg-[#1e2235] text-gray-300">
      {/* Logo Area */}
      <div className="flex h-20 items-center px-6 text-2xl font-bold text-white">
        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-sm">
          W
        </div>
        Logo
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 px-4 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#2a2f45] text-white border-l-4 border-blue-500"
                  : "hover:bg-[#2a2f45] hover:text-white"
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Admin Profile Area (Bottom) */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center cursor-pointer rounded-lg px-2 py-2 hover:bg-[#2a2f45]">
          <UserCircle className="mr-3 h-8 w-8 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}