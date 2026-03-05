"use client";

import React, { useEffect, useState } from "react";

// Define what a Customer looks like so TypeScript is happy
interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export default function DataTable() {
  // State to hold our data and loading status
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from FastAPI when the component loads
  useEffect(() => {
    // Note: 127.0.0.1:8000 is the default FastAPI port
    fetch("http://localhost:8000/api/customers")
      .then((response) => response.json())
      .then((result) => {
        // Our FastAPI app wraps the list inside a "data" key
        setCustomers(result.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="w-full flex flex-col">
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Phone</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Address</th>
              <th className="px-6 py-4 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            
            {/* Show a loading message while waiting for the Python server */}
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Loading data from FastAPI...
                </td>
              </tr>
            )}

            {/* Render the actual data from the backend */}
            {!isLoading && customers.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                <td className="px-6 py-4">{row.phone}</td>
                <td className="px-6 py-4">{row.email}</td>
                <td className="px-6 py-4">{row.address}</td>
                <td className="px-6 py-4 text-center">
                  <button className="rounded bg-[#f4f7fe] px-4 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors">
                    View
                  </button>
                </td>
              </tr>
            ))}
            
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
        <button className="px-3 py-1 hover:text-gray-900 transition-colors">&lt; Previous</button>
        <button className="rounded bg-blue-600 px-3 py-1 text-white">1</button>
        <button className="px-3 py-1 hover:bg-gray-100 rounded transition-colors">Next &gt;</button>
      </div>
    </div>
  );
}