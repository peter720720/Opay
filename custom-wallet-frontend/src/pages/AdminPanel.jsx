import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import apiClient from '../api/client';

export default function AdminPanel() {
    const [targetAccountNumber, setTargetAccountNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleAdminAdjustment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Ensure inputs scale uniformly to whole numbers (Kobo/Cents tracking formatting rules) before hitting databases
            const amountInKobo = Math.round(parseFloat(amount) * 100);

            const res = await apiClient.post('/admin/fund-user', {
                targetAccountNumber,
                amountInKobo,
                reason
            });

            if (res.data.success) {
                setMessage({
                    type: 'success',
                    text: `Credit execution successful! Account balance adjusted accurately.`
                });
                setTargetAccountNumber('');
                setAmount('');
                setReason('');
            }
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.error || 'Administrative allocation entry was rejected.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="p-8 max-w-2xl">
                    <h2 className="text-2xl font-bold text-rose-600 mb-2">Administrative Control Node</h2>
                    <p className="text-slate-400 text-sm mb-6">Authorize double-entry ledger adjustment balances below.</p>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        {message.text && (
                            <div className={`p-4 mb-4 rounded-lg text-sm font-medium ${
                                message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleAdminAdjustment} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Target Account Identification Number</label>
                                <input 
                                    type="text" 
                                    maxLength={10}
                                    placeholder="Enter 10-digit wallet number"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-rose-500 font-mono tracking-wider"
                                    value={targetAccountNumber}
                                    onChange={(e) => setTargetAccountNumber(e.target.value.replace(/\D/g, ''))}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Allocation Amount (₦)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-rose-500 font-medium"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Operational Justification / Reason</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Failed transaction settlement reversal"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-rose-500"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white p-4 rounded-lg font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer disabled:bg-slate-200 disabled:text-slate-400"
                            >
                                {loading ? 'Committing formal ledger entries...' : 'Authorize Administrative Ledger Credit'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
