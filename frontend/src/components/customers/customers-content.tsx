"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toEnglishDigits } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  phone: string;
  sex?: 'MALE' | 'FEMALE' | 'OTHER';
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
  const [sex, setSex] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
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
      ? await api.get(`/customers/search?q=${encodeURIComponent(q)}`)
      : await api.get('/customers');
    setCustomers(res.data);
    setLoading(false);
  };

  const [addError, setAddError] = useState('');

  const fetchDiscounts = async () => {
    const res = await api.get('/discounts');
    setDiscounts(res.data);
    if (res.data.length > 0) setSelectedDiscountId(res.data[0].id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    try {
      await api.post('/customers', { 
        name, 
        phone: toEnglishDigits(phone),
        ...(sex && { sex })
      });
      setName('');
      setPhone('');
      setSex('');
      fetchCustomers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      if (Array.isArray(errorMessage)) {
        setAddError(errorMessage.join(' | '));
      } else if (errorMessage) {
        setAddError(errorMessage);
      } else {
        setAddError('خطا در افزودن مشتری');
      }
    }
  };

  const fetchCodes = async (customerId: string) => {
    setCodesLoading(true);
    setCodeError('');
    try {
      const res = await api.get(`/customers/${customerId}/discount-codes`);
      setCodes(res.data);
      setShowCodes(true);
    } catch (e) {
      setCodeError('خطا در دریافت کدها');
    }
    setCodesLoading(false);
  };

  const handleGenerateCode = async () => {
    setCodeError('');
    try {
      await api.post(`/customers/${selectedCustomer?.id}/discount-codes`, {
        expiresAt: newCodeExpiry,
        discountId: selectedDiscountId,
        customerId: selectedCustomer?.id,
      });
      fetchCodes(selectedCustomer!.id);
      setNewCodeExpiry('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      if (Array.isArray(errorMessage)) {
        setCodeError(errorMessage.join(' | '));
      } else if (errorMessage) {
        setCodeError(errorMessage);
      } else {
        setCodeError('خطا در ایجاد کد');
      }
    }
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-cyan-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">مشتریان</h1>
          <p className="text-gray-500">مدیریت مشتریان و کدهای تخفیف</p>
        </div>
      </div>

      {/* Search and Add Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Form */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 border-0">
          <h3 className="text-lg font-bold text-gray-800 mb-4">جستجوی مشتری</h3>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              className="flex-1 border-0 px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all"
              placeholder="جستجو بر اساس نام یا تلفن"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all">جستجو</button>
          </form>
        </div>

        {/* Add Customer Form */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 border-0">
          <h3 className="text-lg font-bold text-gray-800 mb-4">افزودن مشتری جدید</h3>
          <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
            <input
              className="flex-1 min-w-[120px] border-0 px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
              placeholder="نام"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              className="flex-1 min-w-[120px] border-0 px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
              placeholder="09123456789"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
            <select
              className="border-0 px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all text-gray-700"
              value={sex}
              onChange={e => setSex(e.target.value as 'MALE' | 'FEMALE' | 'OTHER' | '')}
            >
              <option value="">جنسیت</option>
              <option value="MALE">مرد</option>
              <option value="FEMALE">زن</option>
              <option value="OTHER">دیگر</option>
            </select>
            <button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all">افزودن</button>
          </form>
          {addError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {addError}
            </div>
          )}
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-lg text-gray-500">در حال بارگذاری...</div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-12 text-center border-0">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">مشتری‌ای یافت نشد</h3>
          <p className="text-gray-500">با افزودن اولین مشتری خود شروع کنید</p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl overflow-hidden border-0">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
              <tr>
                <th className="px-6 py-4 text-right font-medium">نام</th>
                <th className="px-6 py-4 text-right font-medium">تلفن</th>
                <th className="px-6 py-4 text-right font-medium">تاریخ عضویت</th>
                <th className="px-6 py-4 text-right font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{c.name}</td>
                  <td className="px-6 py-4 text-gray-600" dir="ltr">{c.phone}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(c.joinDate).toLocaleDateString('fa-IR')}</td>
                  <td className="px-6 py-4">
                    <button 
                      className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
                      onClick={() => { setSelectedCustomer(c); fetchCodes(c.id); }}
                    >
                      مشاهده کدها
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Discount Codes Modal */}
      {showCodes && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative mx-4">
            <button className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors" onClick={() => setShowCodes(false)}>✕</button>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-6">کدهای تخفیف {selectedCustomer.name}</h2>
            {codesLoading ? (
              <div className="text-center py-8 text-gray-500">در حال بارگذاری...</div>
            ) : codes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">کد تخفیفی وجود ندارد</div>
            ) : (
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {codes.map(code => (
                  <div key={code.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-mono font-bold text-gray-800">{code.code}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${code.isUsed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {code.isUsed ? 'استفاده شده' : 'فعال'}
                    </span>
                    <span className="text-xs text-gray-500">انقضا: {new Date(code.expiresAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">ایجاد کد جدید</h3>
              <div className="flex gap-3 items-center flex-wrap">
                <input
                  type="date"
                  value={newCodeExpiry}
                  onChange={e => setNewCodeExpiry(e.target.value)}
                  className="border-0 px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
                <select
                  value={selectedDiscountId}
                  onChange={e => setSelectedDiscountId(e.target.value)}
                  className="border-0 px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                >
                  {discounts.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.type === 'PERCENTAGE' ? d.value + '%' : d.value})
                    </option>
                  ))}
                </select>
                <button 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
                  onClick={handleGenerateCode} 
                  disabled={!newCodeExpiry || !selectedDiscountId}
                >
                  ایجاد کد
                </button>
              </div>
              {codeError && <div className="text-red-600 mt-3 text-sm">{codeError}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
