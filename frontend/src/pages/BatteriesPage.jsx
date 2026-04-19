import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { batteryAPI, brandAPI, modelAPI, customerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BatteriesPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Brand Management
  const [brandForm, setBrandForm] = useState({ name: '' });
  const [brands, setBrands] = useState([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandError, setBrandError] = useState('');
  const [brandSuccess, setBrandSuccess] = useState('');

  // Model Management
  const [modelForm, setModelForm] = useState({
    brand_id: '',
    model_name: '',
    warranty_months: '',
  });
  const [models, setModels] = useState([]);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState('');
  const [modelSuccess, setModelSuccess] = useState('');

  // Battery Management
  const [batteryForm, setBatteryForm] = useState({
    customer_id: '',
    brand_id: '',
    model_id: '',
    serial_number: '',
    date_of_sale: '',
    invoice_number: '',
  });
  const [batteryLoading, setBatteryLoading] = useState(false);
  const [batteryError, setBatteryError] = useState('');
  const [batterySuccess, setBatterySuccess] = useState('');

  // Customer Search
  const [searchPhone, setSearchPhone] = useState('');
  const [searchedCustomer, setSearchedCustomer] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Filtered models based on selected brand
  const [filteredModels, setFilteredModels] = useState([]);

  // Load brands and models on mount
  useEffect(() => {
    loadBrands();
    loadModels();
  }, []);

  // Filter models when battery brand changes
  useEffect(() => {
    if (batteryForm.brand_id) {
      const filtered = models.filter(
        (m) => m.brand_id === parseInt(batteryForm.brand_id)
      );
      setFilteredModels(filtered);
      setBatteryForm((prev) => ({ ...prev, model_id: '' }));
    } else {
      setFilteredModels([]);
    }
  }, [batteryForm.brand_id, models]);

  const loadBrands = async () => {
    try {
      const res = await brandAPI.getAll(1);
      if (res.data.success) {
        setBrands(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading brands:', err);
    }
  };

  const loadModels = async () => {
    try {
      const res = await modelAPI.getAll(null, 1);
      if (res.data.success) {
        setModels(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading models:', err);
    }
  };

  // Brand CRUD
  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    setBrandError('');
    setBrandSuccess('');
    setBrandLoading(true);

    try {
      const res = await brandAPI.create(brandForm);
      if (!res.data.success) {
        setBrandError(res.data.message || 'Failed to create brand');
      } else {
        setBrandSuccess('Brand created successfully');
        setBrandForm({ name: '' });
        loadBrands();
      }
    } catch (err) {
      setBrandError(err.response?.data?.message || 'Failed to create brand');
    } finally {
      setBrandLoading(false);
    }
  };

  // Model CRUD
  const handleModelSubmit = async (e) => {
    e.preventDefault();
    setModelError('');
    setModelSuccess('');
    setModelLoading(true);

    try {
      const res = await modelAPI.create({
        ...modelForm,
        warranty_months: modelForm.warranty_months
          ? parseInt(modelForm.warranty_months)
          : null,
      });
      if (!res.data.success) {
        setModelError(res.data.message || 'Failed to create model');
      } else {
        setModelSuccess('Model created successfully');
        setModelForm({
          brand_id: '',
          model_name: '',
          warranty_months: '',
        });
        loadModels();
      }
    } catch (err) {
      setModelError(err.response?.data?.message || 'Failed to create model');
    } finally {
      setModelLoading(false);
    }
  };

  // Search Customer
  const handleCustomerSearch = async (e) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    setSearchLoading(true);

    try {
      const res = await customerAPI.searchByPhone(searchPhone.trim());
      if (res.data.success) {
        setSearchedCustomer(res.data.data);
        setBatteryForm((prev) => ({
          ...prev,
          customer_id: res.data.data.id,
        }));
        setBatteryError('');
      } else {
        setBatteryError(res.data.message || 'Customer not found');
        setSearchedCustomer(null);
      }
    } catch (err) {
      setBatteryError(err.response?.data?.message || 'Error searching customer');
      setSearchedCustomer(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // Battery CRUD
  const handleBatterySubmit = async (e) => {
    e.preventDefault();
    setBatteryError('');
    setBatterySuccess('');
    setBatteryLoading(true);

    try {
      const res = await batteryAPI.create(batteryForm);
      if (!res.data.success) {
        setBatteryError(res.data.message || 'Failed to add battery');
      } else {
        setBatterySuccess('Battery added successfully');
        setBatteryForm({
          customer_id: '',
          brand_id: '',
          model_id: '',
          serial_number: '',
          date_of_sale: '',
          invoice_number: '',
        });
        setSearchedCustomer(null);
        setSearchPhone('');
      }
    } catch (err) {
      setBatteryError(err.response?.data?.message || 'Failed to add battery');
    } finally {
      setBatteryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="w-full bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              Battery Management
            </h1>
            <p className="text-xs text-slate-500">
              Manage brands, models, and battery sales
            </p>
          </div>
          <nav className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-100"
            >
              Customers
            </button>
            <button
              className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md"
            >
              Batteries
            </button>
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

      {/* Content */}
      <main className="flex-1 px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Brand & Model Creation */}
          <section className="space-y-6">
            {/* Create Brand */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800 mb-1">
                Add Battery Brand
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Create a new battery brand.
              </p>

              {brandError && (
                <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {brandError}
                </div>
              )}
              {brandSuccess && (
                <div className="mb-3 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
                  {brandSuccess}
                </div>
              )}

              <form onSubmit={handleBrandSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Brand Name
                  </label>
                  <input
                    value={brandForm.name}
                    onChange={(e) =>
                      setBrandForm({ name: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Exide, Amaron"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={brandLoading}
                  className="w-full inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {brandLoading ? 'Creating...' : 'Create Brand'}
                </button>
              </form>

              {/* Brands List */}
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-700 mb-2">
                  Existing Brands ({brands.length})
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {brands.map((b) => (
                    <div
                      key={b.id}
                      className="text-xs px-2 py-1.5 bg-slate-50 rounded border border-slate-200"
                    >
                      {b.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Create Model */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800 mb-1">
                Add Battery Model
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Create a new model for a brand.
              </p>

              {modelError && (
                <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {modelError}
                </div>
              )}
              {modelSuccess && (
                <div className="mb-3 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
                  {modelSuccess}
                </div>
              )}

              <form onSubmit={handleModelSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Brand
                  </label>
                  <select
                    value={modelForm.brand_id}
                    onChange={(e) =>
                      setModelForm((prev) => ({
                        ...prev,
                        brand_id: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Model Name
                  </label>
                  <input
                    value={modelForm.model_name}
                    onChange={(e) =>
                      setModelForm((prev) => ({
                        ...prev,
                        model_name: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., FLO-DIN44LH"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Warranty (months)
                  </label>
                  <input
                    type="number"
                    value={modelForm.warranty_months}
                    onChange={(e) =>
                      setModelForm((prev) => ({
                        ...prev,
                        warranty_months: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 36"
                  />
                </div>

                <button
                  type="submit"
                  disabled={modelLoading}
                  className="w-full inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {modelLoading ? 'Creating...' : 'Create Model'}
                </button>
              </form>
            </div>
          </section>

          {/* Right Column - Add Battery */}
          <section className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">
              Add New Battery
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Record a new battery sale for a customer.
            </p>

            {batteryError && (
              <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                {batteryError}
              </div>
            )}
            {batterySuccess && (
              <div className="mb-3 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
                {batterySuccess}
              </div>
            )}

            {/* Customer Search */}
            <div className="mb-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-medium text-slate-700 mb-2">
                Step 1: Find Customer
              </p>
              <form
                onSubmit={handleCustomerSearch}
                className="flex gap-2 items-end"
              >
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Customer Phone
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
                  className="inline-flex justify-center rounded-md bg-slate-800 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-900 disabled:opacity-60"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </form>

              {searchedCustomer && (
                <div className="mt-3 p-3 bg-white rounded border border-slate-300">
                  <p className="text-xs font-semibold text-emerald-700">
                    ✓ Customer Found
                  </p>
                  <p className="text-xs text-slate-700 mt-1">
                    <span className="font-medium">Name:</span>{' '}
                    {searchedCustomer.name}
                  </p>
                  <p className="text-xs text-slate-700">
                    <span className="font-medium">Phone:</span>{' '}
                    {searchedCustomer.phone}
                  </p>
                </div>
              )}
            </div>

            {/* Battery Form */}
            <form onSubmit={handleBatterySubmit} className="space-y-4">
              <p className="text-xs font-medium text-slate-700 mb-2">
                Step 2: Battery Details
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Brand *
                  </label>
                  <select
                    value={batteryForm.brand_id}
                    onChange={(e) =>
                      setBatteryForm((prev) => ({
                        ...prev,
                        brand_id: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!searchedCustomer}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Model *
                  </label>
                  <select
                    value={batteryForm.model_id}
                    onChange={(e) =>
                      setBatteryForm((prev) => ({
                        ...prev,
                        model_id: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!batteryForm.brand_id || !searchedCustomer}
                  >
                    <option value="">Select Model</option>
                    {filteredModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.model_name}
                        {m.warranty_months && ` (${m.warranty_months}m warranty)`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Serial Number *
                  </label>
                  <input
                    value={batteryForm.serial_number}
                    onChange={(e) =>
                      setBatteryForm((prev) => ({
                        ...prev,
                        serial_number: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Battery serial number"
                    required
                    disabled={!searchedCustomer}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Date of Sale *
                  </label>
                  <input
                    type="date"
                    value={batteryForm.date_of_sale}
                    onChange={(e) =>
                      setBatteryForm((prev) => ({
                        ...prev,
                        date_of_sale: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!searchedCustomer}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Invoice Number (optional)
                </label>
                <input
                  value={batteryForm.invoice_number}
                  onChange={(e) =>
                    setBatteryForm((prev) => ({
                      ...prev,
                      invoice_number: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Invoice/Bill number"
                  disabled={!searchedCustomer}
                />
              </div>

              <button
                type="submit"
                disabled={batteryLoading || !searchedCustomer}
                className="w-full inline-flex justify-center rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {batteryLoading ? 'Adding Battery...' : 'Add Battery'}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BatteriesPage;
