import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Gift, UserRound, WalletCards } from 'lucide-react';
import apiClient from '../api/client';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Transfer() {
    const { refreshBalance } = useAuth();
    const [banks, setBanks] = useState([]);
    const [bankCode, setBankCode] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [beneficiaryName, setBeneficiaryName] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    
    const [loadingLookup, setLoadingLookup] = useState(false);
    const [loadingTransfer, setLoadingTransfer] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const lastLookupKey = useRef('');

    // Step A: Load the live banking institutions list safely on component mount
    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const res = await apiClient.get('/wallet/banks');
                if (res.data.success) {
                    // Inject local custom switch tracking option first
                    const availableBanks = [
                        { code: 'INTERNAL_WALLET', name: 'OPay Wallet (in-app accounts)' },
                        ...(res.data.data || [])
                    ];
                    setBanks([...new Map(availableBanks.map((bank) => [bank.code, bank])).values()]);
                }
            } catch (err) {
                setMessage({ type: 'error', text: 'Could not load banking routing definitions.' });
            }
        };
        fetchBanks();
    }, []);

    // Step B: Trigger auto-lookup hook immediately when 10 digit parameters align completely
    useEffect(() => {
        if (accountNumber.length === 10 && bankCode) {
            const lookupKey = `${bankCode}:${accountNumber}`;
            if (lastLookupKey.current !== lookupKey) {
                lastLookupKey.current = lookupKey;
                const cachedName = localStorage.getItem(`beneficiary:${lookupKey}`);
                if (cachedName) {
                    setBeneficiaryName(cachedName);
                    setMessage({ type: '', text: '' });
                } else {
                    resolveBeneficiaryName();
                }
            }
        } else {
            lastLookupKey.current = '';
            setBeneficiaryName('');
        }
    }, [accountNumber, bankCode]);

    const resolveBeneficiaryName = async () => {
        setLoadingLookup(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await apiClient.post('/wallet/resolve-beneficiary', { accountNumber, bankCode });
            if (res.data.success) {
                setBeneficiaryName(res.data.accountName);
                localStorage.setItem(`beneficiary:${bankCode}:${accountNumber}`, res.data.accountName);
            }
        } catch (err) {
            setBeneficiaryName('');
            setMessage({ type: 'error', text: err.response?.data?.error || 'Account matching failed.' });
        } finally {
            setLoadingLookup(false);
        }
    };

    const handleTransferExecution = async (e) => {
        e.preventDefault();
        if (!beneficiaryName) return;

        setLoadingTransfer(true);
        setMessage({ type: '', text: '' });

        try {
            // Convert fractional inputs into whole ledger numbers (e.g. ₦1.50 turns directly into 150 kobo tokens)
            const amountInKobo = Math.round(parseFloat(amount) * 100);

            const res = await apiClient.post('/wallet/transfer', {
                receiverAccountNumber: accountNumber,
                amountInKobo,
                description
            });

            if (res.data.success) {
                setMessage({ type: 'success', text: `Transaction complete! Outbound cash routed successfully.` });
                setAccountNumber('');
                setAmount('');
                setDescription('');
                setBeneficiaryName('');
                refreshBalance();
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Transfer declined.' });
        } finally {
            setLoadingTransfer(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 md:flex">
            <div className="hidden md:block">
                <Sidebar />
            </div>
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="w-full max-w-2xl p-4 pb-24 md:p-8 md:pb-8">
                    <h2 className="mb-6 text-2xl font-bold text-slate-800">Send Money Remittance</h2>
                    
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        {message.text && (
                            <div className={`p-4 mb-4 rounded-lg text-sm font-medium ${
                                message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleTransferExecution} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Target Destination Bank</label>
                                <select 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
                                    value={bankCode} 
                                    onChange={(e) => setBankCode(e.target.value)}
                                    required
                                >
                                    <option value="">-- Click to search supported banks --</option>
                                    {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">10-Digit Account Number</label>
                                <input 
                                    type="text" 
                                    maxLength={10}
                                    placeholder="e.g. 9012345678"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500 font-mono tracking-widest"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                                    required
                                />
                            </div>

                            {/* Live Resolved Name Placeholder UI Box */}
                            {(loadingLookup || beneficiaryName) && (
                                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-4 transition-all">
                                    <span className="text-xs text-slate-400 block mb-1">Beneficiary Account Verification Name:</span>
                                    {loadingLookup ? (
                                        <span className="text-sm font-medium text-slate-500 animate-pulse">Querying active network endpoints...</span>
                                    ) : (
                                        <span className="text-sm font-bold text-emerald-600 tracking-wide uppercase">{beneficiaryName}</span>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Amount (₦)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Transaction Narrative Note</label>
                                <input 
                                    type="text" 
                                    placeholder="Add payment description details"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loadingTransfer || !beneficiaryName}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 p-4 rounded-lg font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer"
                            >
                                {loadingTransfer ? 'Executing ledger payment entries...' : 'Authorize Transaction Funds'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
            <nav className="fixed inset-x-0 bottom-0 z-20 flex h-[74px] items-center justify-around border-t border-[#eeeeee] bg-white px-3 md:hidden">
                {[['Home', '/dashboard', WalletCards], ['Rewards', '#', Gift], ['Finance', '#', ArrowUpRight], ['Cards', '#', WalletCards], ['Me', '#', UserRound]].map(([label, path, Icon], index) => (
                    <a key={label} href={path} className={`flex flex-col items-center gap-1 text-[11px] ${index === 2 ? 'text-[#00b978]' : 'text-[#aaa]'}`}>
                        <Icon size={23} strokeWidth={index === 2 ? 2.5 : 1.6} />
                        {label}
                    </a>
                ))}
            </nav>
        </div>
    );
}
