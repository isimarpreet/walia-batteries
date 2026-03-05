import { UserCircle } from "lucide-react";

export default function Header() {
  return (
    <div className="flex h-full w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded bg-blue-500/20 grid place-items-center">
          <div className="h-3 w-3 rounded-sm bg-blue-600"></div>
        </div>
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Welcome back, Admin!</span>
        <div className="flex items-center gap-2 cursor-pointer">
          <UserCircle className="h-8 w-8 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </div>
      </div>
    </div>
  );
}