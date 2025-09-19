"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Customer {
  id: string;
  name: string;
  phone: string;
  joinDate: string;
}

interface DiscountCode {
  id: string;
  code: string;
  expiresAt: string;
  isUsed: boolean;
}

interface Discount {
  id: string;
  name: string;
  value: number;
  type: string;
}

export default function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [newCodeExpiry, setNewCodeExpiry] = useState('');
  const [codeError, setCodeError] = useState('');
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchDiscounts();
  }, []);

  const fetchCustomers = async (q?: string) => {
    setLoading(true);
    const res = q
      ? await axios.get(`/api/customers/search?q=${encodeURIComponent(q)}`)
      : await axios.get('/api/customers');
    setCustomers(res.data);
    setLoading(false);
  };

  const fetchDiscounts = async () => {
    const res = await axios.get('/api/discounts');
    setDiscounts(res.data);
    if (res.data.length > 0) setSelectedDiscountId(res.data[0].id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/api/customers', { name, phone });
    setName('');
    setPhone('');
    fetchCustomers();
  };

  const fetchCodes = async (customerId: string) => {
    setCodesLoading(true);
    setCodeError('');
    try {
      const res = await axios.get(`/api/customers/${customerId}/discount-codes`);
      setCodes(res.data);
      setShowCodes(true);
    } catch (e) {
      setCodeError('Failed to fetch codes');
    }
    setCodesLoading(false);
  };

  const handleGenerateCode = async () => {
    setCodeError('');
    try {
      await axios.post(`/api/customers/${selectedCustomer?.id}/discount-codes`, {
        expiresAt: newCodeExpiry,
        discountId: selectedDiscountId,
        customerId: selectedCustomer?.id,
      });
      fetchCodes(selectedCustomer!.id);
      setNewCodeExpiry('');
    } catch (e) {
      setCodeError('Failed to generate code');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          className="border px-2 py-1 rounded"
          placeholder="Search by name or phone"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">Search</button>
      </form>
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          className="border px-2 py-1 rounded"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className="border px-2 py-1 rounded"
          placeholder="09123456789"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
        />
        <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded">Add Customer</button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Phone</th>
              <th className="border px-2 py-1">Join Date</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td className="border px-2 py-1">{c.name}</td>
                <td className="border px-2 py-1">{c.phone}</td>
                <td className="border px-2 py-1">{new Date(c.joinDate).toLocaleDateString()}</td>
                <td className="border px-2 py-1">
                  <button className="text-blue-600 underline" onClick={() => { setSelectedCustomer(c); fetchCodes(c.id); }}>View Codes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showCodes && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowCodes(false)}>✕</button>
            <h2 className="text-xl font-bold mb-2">Discount Codes for {selectedCustomer.name}</h2>
            {codesLoading ? <div>Loading...</div> : (
              <ul className="mb-4">
                {codes.map(code => (
                  <li key={code.id} className="mb-1 flex justify-between items-center">
                    <span>{code.code}</span>
                    <span className={code.isUsed ? 'text-red-600' : 'text-green-700'}>
                      {code.isUsed ? 'Used' : 'Active'}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">Expires: {new Date(code.expiresAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mb-2 flex gap-2 items-center">
              <input
                type="date"
                value={newCodeExpiry}
                onChange={e => setNewCodeExpiry(e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <select
                value={selectedDiscountId}
                onChange={e => setSelectedDiscountId(e.target.value)}
                className="border px-2 py-1 rounded"
              >
                {discounts.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.type === 'PERCENTAGE' ? d.value + '%' : d.value})
                  </option>
                ))}
              </select>
              <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={handleGenerateCode} disabled={!newCodeExpiry || !selectedDiscountId}>Generate Code</button>
            </div>
            {codeError && <div className="text-red-600 mb-2">{codeError}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
