'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CustomersPage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const loadCustomers = async () => {
    setListLoading(true);
    try {
      const res = await customerAPI.getAll(1, 20);
      if (res.data.success) {
        setCustomers(res.data.data.customers || []);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreateLoading(true);

    try {
      const res = await customerAPI.create(createForm);
      if (!res.data.success) {
        setCreateError(res.data.message || 'Failed to create customer');
      } else {
        setCreateSuccess('Customer created successfully');
        setCreateForm({
          name: '',
          phone: '',
          email: '',
          address: '',
        });
        loadCustomers();
      }
    } catch (err) {
      setCreateError(
        err.response?.data?.message || 'Failed to create customer'
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    setSearchError('');
    setSearchResult(null);
    setSearchLoading(true);

    try {
      const res = await customerAPI.searchByPhone(searchPhone.trim());
      if (!res.data.success) {
        setSearchError(res.data.message || 'Customer not found');
      } else {
        setSearchResult(res.data.data);
      }
    } catch (err) {
      setSearchError(
        err.response?.data?.message || 'Error searching customer'
      );
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
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
            <button className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md">
              Customers
            </button>
            <button
              onClick={() => router.push('/batteries')}
              className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-100"
            >
              Batteries
            </button>
            <button
              onClick={() => router.push('/claims')}
              className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-100"
            >
              Claims
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">
                {user.email}
              </p>
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

      {/* Content */}
      <main className="flex-1 px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Create customer */}
          <section className="lg:col-span-1 bg-white rounded-xl shadow-sm p-5 border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">
              Add New Customer
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Register a new customer when a battery is sold.
            </p>

            {createError && (
              <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                {createError}
              </div>
            )}
            {createSuccess && (
              <div className="mb-3 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
                {createSuccess}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Customer name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  value={createForm.phone}
                  onChange={handleCreateChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10+ digit phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={createForm.email}
                  onChange={handleCreateChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Address (optional)
                </label>
                <textarea
                  name="address"
                  value={createForm.address}
                  onChange={handleCreateChange}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Address"
                />
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {createLoading ? 'Saving...' : 'Save Customer'}
              </button>
            </form>
          </section>

          {/* Right: Search + list */}
          <section className="lg:col-span-2 space-y-5">
            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800 mb-1">
                Search Customer
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                Find existing customer using phone number.
              </p>

              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end"
              >
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="sm:w-auto w-full inline-flex justify-center rounded-md bg-slate-800 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-900 disabled:opacity-60 mt-2 sm:mt-0"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </form>

              {searchError && (
                <div className="mt-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {searchError}
                </div>
              )}

              {searchResult && (
                <div className="mt-4 border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-700">
                    {searchResult.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Phone: {searchResult.phone}
                  </p>
                  {searchResult.email && (
                    <p className="text-xs text-slate-500">
                      Email: {searchResult.email}
                    </p>
                  )}
                  {searchResult.address && (
                    <p className="text-xs text-slate-500 mt-1">
                      {searchResult.address}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-800">
                  Recent Customers
                </h2>
                <span className="text-[11px] text-slate-400">
                  {customers.length} total
                </span>
              </div>

              {listLoading ? (
                <p className="text-xs text-slate-500">Loading customers...</p>
              ) : customers.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No customers found. Add your first customer.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border border-slate-100 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-slate-600 border-b border-slate-100">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-slate-600 border-b border-slate-100">
                          Phone
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-slate-600 border-b border-slate-100">
                          Email
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-slate-600 border-b border-slate-100">
                          Address
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 border-b border-slate-100">
                            {c.name}
                          </td>
                          <td className="px-3 py-2 border-b border-slate-100">
                            {c.phone}
                          </td>
                          <td className="px-3 py-2 border-b border-slate-100">
                            {c.email || '-'}
                          </td>
                          <td className="px-3 py-2 border-b border-slate-100">
                            {c.address || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CustomersPage;
