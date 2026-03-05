import { Users, Battery, FileText, AlertCircle } from "lucide-react";
import DataTable from "./components/DataTable";

export default function Home() {
  return (
    <div className="space-y-6">
      
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1 */}
        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Customers</p>
            <p className="mt-2 text-3xl font-bold text-gray-800">152</p>
          </div>
          <div className="rounded-full bg-red-100 p-3 text-red-500">
            <Users size={24} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Batteries Sold</p>
            <p className="mt-2 text-3xl font-bold text-gray-800">389</p>
          </div>
          <div className="rounded-full bg-green-100 p-3 text-green-500">
            <Battery size={24} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Claims</p>
            <p className="mt-2 text-3xl font-bold text-gray-800">87</p>
          </div>
          <div className="rounded-full bg-blue-100 p-3 text-blue-500">
            <FileText size={24} />
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Claims</p>
            <p className="mt-2 text-3xl font-bold text-gray-800">15</p>
          </div>
          <div className="rounded-full bg-indigo-100 p-3 text-indigo-500">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* Recent Claims Table Area */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Recent Claims</h2>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            Add Customer
          </button>
        </div>
        
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 border border-gray-100 mb-4">
          <span className="text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search by phone number" 
            className="bg-transparent outline-none flex-1 text-sm text-gray-700"
          />
        </div>

        <DataTable />
      </div>
    </div>
  );
}