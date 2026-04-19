import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimAPI, customerAPI, batteryAPI, modelAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ClaimsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Search customer
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Customer batteries
  const [customerBatteries, setCustomerBatteries] = useState([]);
  const [batteriesLoading, setBatteriesLoading] = useState(false);

  // Claim form
  const [claimForm, setClaimForm] = useState({
    customer_id: '',
    faulty_battery_id: '',
    actual_dos: '',
    co_number: '',
    new_battery_model_id: '',
    new_battery_serial_number: '',
    stock_status: 'not_in_stock',
    remarks: '',
  });
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');

  // All models for replacement
  const [allModels, setAllModels] = useState([]);

  // Claims list
  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);

  useEffect(() => {
    loadAllModels();
    loadClaims();
  }, []);

  const loadAllModels = async () => {
    try {
      const res = await modelAPI.getAll(null, 1);
      if (res.data.success) {
        setAllModels(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading models:', err);
    }
  };

  const loadClaims = async () => {
    setClaimsLoading(true);
    try {
      const res = await claimAPI.getAll(1, 20, null);
      if (res.data.success) {
        setClaims(res.data.data.claims || []);
      }
    } catch (err) {
      console.error('Error loading claims:', err);
    } finally {
      setClaimsLoading(false);
    }
  };

  const handleSearchCustomer = async (e) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;

    setSearchError('');
    setSelectedCustomer(null);
    setCustomerBatteries([]);
    setSearchLoading(true);

    try {
      const res = await customerAPI.searchByPhone(searchPhone.trim());
      if (!res.data.success) {
        setSearchError(res.data.message || 'Customer not found');
      } else {
        setSelectedCustomer(res.data.data);
        setClaimForm((prev) => ({
          ...prev,
          customer_id: res.data.data.id,
          faulty_battery_id: '',
        }));
        loadCustomerBatteries(res.data.data.id);
      }
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Error searching customer');
    } finally {
      setSearchLoading(false);
    }
  };

  const loadCustomerBatteries = async (customerId) => {
    setBatteriesLoading(true);
    try {
      const res = await batteryAPI.getByCustomer(customerId);
      if (res.data.success) {
        setCustomerBatteries(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading batteries:', err);
    } finally {
      setBatteriesLoading(false);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimError('');
    setClaimSuccess('');
    setClaimLoading(true);

    // Prepare data
    const data = {
      ...claimForm,
      actual_dos: claimForm.actual_dos || null,
      co_number: claimForm.co_number || null,
      new_battery_model_id: claimForm.new_battery_model_id
        ? parseInt(claimForm.new_battery_model_id)
        : null,
      new_battery_serial_number: claimForm.new_battery_serial_number || null,
      remarks: claimForm.remarks || null,
    };

    try {
      const res = await claimAPI.create(data);
      if (!res.data.success) {
        setClaimError(res.data.message || 'Failed to create claim');
      } else {
        setClaimSuccess(
          `Claim created successfully! Claim Number: ${res.data.data.claim_number}`
        );
        // Reset form
        setClaimForm({
          customer_id: '',
          faulty_battery_id: '',
          actual_dos: '',
          co_number: '',
          new_battery_model_id: '',
          new_battery_serial_number: '',
          stock_status: 'not_in_stock',
          remarks: '',
        });
        setSelectedCustomer(null);
        setCustomerBatteries([]);
        setSearchPhone('');
        loadClaims();
      }
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Failed to create claim');
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="w-full bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              Claims Management
            </h1>
            <p className="text-xs text-slate-500">Create and manage warranty claims</p>
          </div>
          <nav className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-100"
            >
              Customers
            </button>
            <button
              onClick={() => navigate('/batteries')}
              className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-100"
            >
              Batteries
            </button>
            <button className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md">
              Claims
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
          {/* Create Claim Form */}
          <section className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">
              Create New Claim
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              File a warranty claim for a customer's faulty battery.
            </p>

            {claimError && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                {claimError}
              </div>
            )}
            {claimSuccess && (
              <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
                {claimSuccess}
              </div>
            )}

            {/* Step 1: Search Customer */}
            <div className="mb-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-medium text-slate-700 mb-2">
                Step 1: Find Customer
              </p>
              <form onSubmit={handleSearchCustomer} className="flex gap-2 items-end">
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

              {searchError && (
                <div className="mt-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {searchError}
                </div>
              )}

              {selectedCustomer && (
                <div className="mt-3 p-3 bg-white rounded border border-slate-300">
                  <p className="text-xs font-semibold text-emerald-700">
                    ✓ Customer Found
                  </p>
                  <p className="text-xs text-slate-700 mt-1">
                    <span className="font-medium">Name:</span> {selectedCustomer.name}
                  </p>
                  <p className="text-xs text-slate-700">
                    <span className="font-medium">Phone:</span> {selectedCustomer.phone}
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Select Faulty Battery */}
            {selectedCustomer && (
              <div className="mb-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-medium text-slate-700 mb-2">
                  Step 2: Select Faulty Battery
                </p>

                {batteriesLoading ? (
                  <p className="text-xs text-slate-500">Loading batteries...</p>
                ) : customerBatteries.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No batteries found for this customer.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customerBatteries.map((item) => (
                      <label
                        key={item.battery.id}
                        className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition ${
                          claimForm.faulty_battery_id === item.battery.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-300 bg-white hover:border-slate-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="faulty_battery"
                          value={item.battery.id}
                          checked={claimForm.faulty_battery_id === item.battery.id}
                          onChange={(e) =>
                            setClaimForm((prev) => ({
                              ...prev,
                              faulty_battery_id: parseInt(e.target.value),
                            }))
                          }
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-800">
                            {item.brand?.name} - {item.model?.model_name}
                          </p>
                          <p className="text-xs text-slate-600">
                            Serial: {item.battery.serial_number}
                          </p>
                          <p className="text-xs text-slate-500">
                            Sold: {new Date(item.battery.date_of_sale).toLocaleDateString()}
                            {item.model?.warranty_months &&
                              ` | Warranty: ${item.model.warranty_months} months`}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Claim Details */}
            {selectedCustomer && claimForm.faulty_battery_id && (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <p className="text-xs font-medium text-slate-700 mb-2">
                  Step 3: Claim Details
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Actual Date of Sale (Optional)
                    </label>
                    <input
                      type="date"
                      value={claimForm.actual_dos}
                      onChange={(e) =>
                        setClaimForm((prev) => ({
                          ...prev,
                          actual_dos: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      CO Number (Optional)
                    </label>
                    <input
                      value={claimForm.co_number}
                      onChange={(e) =>
                        setClaimForm((prev) => ({
                          ...prev,
                          co_number: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Company Order Number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Stock Status *
                  </label>
                  <select
                    value={claimForm.stock_status}
                    onChange={(e) =>
                      setClaimForm((prev) => ({
                        ...prev,
                        stock_status: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="not_in_stock">Not in Stock</option>
                    <option value="new">New Battery</option>
                    <option value="foc">FOC (Free of Cost)</option>
                  </select>
                </div>

                {(claimForm.stock_status === 'new' ||
                  claimForm.stock_status === 'foc') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        New Battery Model *
                      </label>
                      <select
                        value={claimForm.new_battery_model_id}
                        onChange={(e) =>
                          setClaimForm((prev) => ({
                            ...prev,
                            new_battery_model_id: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Model</option>
                        {allModels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.model_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        New Battery Serial *
                      </label>
                      <input
                        value={claimForm.new_battery_serial_number}
                        onChange={(e) =>
                          setClaimForm((prev) => ({
                            ...prev,
                            new_battery_serial_number: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Serial number"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={claimForm.remarks}
                    onChange={(e) =>
                      setClaimForm((prev) => ({
                        ...prev,
                        remarks: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Additional notes or comments..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={claimLoading}
                  className="w-full inline-flex justify-center rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                >
                  {claimLoading ? 'Creating Claim...' : 'Create Claim'}
                </button>
              </form>
            )}
          </section>

          {/* Claims List */}
          <section className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">
              Recent Claims
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {claims.length} total claims
            </p>

            {claimsLoading ? (
              <p className="text-xs text-slate-500">Loading claims...</p>
            ) : claims.length === 0 ? (
              <p className="text-xs text-slate-500">No claims found.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {claims.map((item) => (
                  <div
                    key={item.claim.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-800">
                        Claim #{item.claim.claim_number}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          item.claim.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {item.claim.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">
                      <span className="font-medium">Customer:</span>{' '}
                      {item.customer_name}
                    </p>
                    <p className="text-xs text-slate-600">
                      Phone: {item.customer_phone}
                    </p>
                    <p className="text-xs text-slate-600">
                      Battery: {item.battery_serial}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(item.claim.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default ClaimsPage;
