import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Bell,
    ChevronRight,
    Eye,
    Gift,
    Headphones,
    Landmark,
    MoreHorizontal,
    ScanLine,
    Send,
    ShieldCheck,
    Smartphone,
    Tv,
    UserRound,
    WalletCards,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import Sidebar from '../components/Sidebar';

const quickActions = [
    { label: 'To OPay', icon: Send, path: '/transfer' },
    { label: 'To Bank', icon: Landmark, path: '/transfer' },
    { label: 'Withdraw', icon: ArrowDownLeft, path: '/transfer' },
];

const services = [
    { label: 'Airtime', icon: Smartphone },
    { label: 'Data', icon: WalletCards },
    { label: 'Betting', icon: Gift },
    { label: 'TV', icon: Tv },
    { label: 'SafeBox', icon: ShieldCheck },
    { label: 'Loan', icon: ArrowUpRight, badge: 'Hot' },
    { label: 'Invitation', icon: UserRound },
    { label: 'More', icon: MoreHorizontal },
];

export default function Dashboard() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [balanceVisible, setBalanceVisible] = useState(false);

    const formatBalanceToNaira = (balanceInKobo) => {
        if (!balanceInKobo) return '0.00';
        return (balanceInKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                const response = await apiClient.get('/wallet/transactions');
                setTransactions(response.data.data?.slice(0, 2) || []);
            } catch {
                setTransactions([]);
            }
        };

        loadTransactions();
    }, []);

    const formatTransactionDate = (date) => new Date(date).toLocaleString('en-NG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="min-h-screen bg-[#f7f8fa] text-[#252525] md:flex">
            <div className="hidden md:block">
                <Sidebar />
            </div>

            <main className="mx-auto w-full max-w-[620px] px-4 pb-28 md:max-w-5xl md:px-10 md:pb-10">
                <header className="flex items-center justify-between py-5 md:py-7">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#dcebe8] text-sm font-bold text-[#00b875]">
                            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="text-xs text-[#8a8a8a]">Good day</p>
                            <p className="text-lg font-semibold">Hi, {user?.fullName?.split(' ')[0] || 'there'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-[#202020]">
                        <button type="button" aria-label="Get help" className="relative">
                            <Headphones size={22} strokeWidth={1.8} />
                            <span className="absolute -right-3 -top-3 rounded-md bg-[#ffd9e7] px-1 text-[9px] font-bold text-[#ef4d84]">HELP</span>
                        </button>
                        <button type="button" aria-label="Scan code"><ScanLine size={24} strokeWidth={1.8} /></button>
                        <button type="button" aria-label="Notifications" className="relative">
                            <Bell size={23} strokeWidth={1.8} />
                            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#f25b70]" />
                        </button>
                    </div>
                </header>

                <section className="rounded-[20px] bg-[#00b978] px-5 py-5 text-white shadow-[0_8px_20px_rgba(0,185,120,0.16)] md:px-8 md:py-7">
                    <div className="flex items-center justify-between text-sm">
                        <button type="button" className="flex items-center gap-2" onClick={() => setBalanceVisible((visible) => !visible)}>
                            <ShieldCheck size={19} fill="white" strokeWidth={1.6} />
                            <span>Available Balance</span>
                            <Eye size={19} strokeWidth={1.7} />
                        </button>
                        <Link to="/transfer" className="flex items-center gap-1 text-sm">Transaction History <ChevronRight size={18} /></Link>
                    </div>
                    <div className="mt-5 flex items-end justify-between">
                        <p className="text-3xl font-bold tracking-wide">{balanceVisible ? `₦${formatBalanceToNaira(user?.balance)}` : '****'}</p>
                        <Link to="/transfer" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#00a96f] shadow-sm">+ Add Money</Link>
                    </div>
                </section>

                <section className="mt-3 overflow-hidden rounded-[20px] bg-white px-5 md:px-7">
                    {transactions.length ? transactions.map((transaction) => {
                        const isIncoming = String(transaction.receiver?._id) === String(user?._id);
                        return (
                            <div key={transaction._id} className="flex items-center justify-between border-b border-[#f2f2f2] py-4 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eafaf5] text-[#00b978]"><ArrowUpRight size={22} /></span>
                                    <div>
                                        <p className="text-sm font-medium">{isIncoming ? 'Money received' : 'Money sent'}</p>
                                        <p className="mt-1 text-xs text-[#a0a0a0]">{formatTransactionDate(transaction.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold">{isIncoming ? '+' : '-'}₦{formatBalanceToNaira(transaction.amount)}</p>
                                    <span className="mt-1 inline-block rounded bg-[#e5f8ef] px-2 py-0.5 text-[10px] text-[#17a66f]">Successful</span>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="py-6 text-center text-sm text-[#999]">Your recent transactions will appear here</div>
                    )}
                </section>

                <section className="mt-5 grid grid-cols-3 gap-3 rounded-[20px] bg-white px-4 py-5 md:gap-8 md:px-10">
                    {quickActions.map(({ label, icon: Icon, path }) => (
                        <Link key={label} to={path} className="flex flex-col items-center gap-3 text-sm text-[#555]">
                            <span className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#eafaf5] text-[#00b978]"><Icon size={26} strokeWidth={2} /></span>
                            {label}
                        </Link>
                    ))}
                </section>

                <section className="mt-5 grid grid-cols-4 gap-y-6 rounded-[20px] bg-white px-3 py-6 md:px-8">
                    {services.map(({ label, icon: Icon, badge }) => (
                        <button key={label} type="button" className="relative flex flex-col items-center gap-2 text-xs text-[#666]">
                            <Icon size={27} strokeWidth={2} className="text-[#00b978]" />
                            {badge && <span className="absolute left-1/2 top-[-10px] rounded-full bg-[#f26381] px-2 py-0.5 text-[10px] font-bold text-white">{badge}</span>}
                            {label}
                        </button>
                    ))}
                </section>

                <section className="mt-5 rounded-[20px] bg-gradient-to-r from-[#dff9eb] via-[#e4f9ed] to-[#fff8d9] p-5 md:p-7">
                    <div className="flex items-center justify-between border-b border-dashed border-[#cce9d9] pb-4">
                        <p className="font-semibold">Grow your savings</p>
                        <ChevronRight size={21} />
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-5">
                        <div>
                            <p className="font-semibold">Effortless saving</p>
                            <p className="text-xs text-[#7f948a]">Stay disciplined &amp; grow your wealth easily</p>
                        </div>
                        <button type="button" className="rounded-full bg-[#00b978] px-7 py-3 font-semibold text-white">Save</button>
                    </div>
                </section>

                <section className="mt-5 flex items-center justify-between gap-3 rounded-[20px] bg-white px-5 py-5 md:px-7">
                    <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0d9] text-[#00b978]"><Gift size={25} /></span>
                        <div>
                            <p className="font-semibold">Share OPay with Others</p>
                            <p className="text-xs text-[#999]">Help a loved one get their own account in minutes</p>
                        </div>
                    </div>
                    <button type="button" className="rounded-full bg-[#00b978] px-7 py-3 font-semibold text-white">Go</button>
                </section>
            </main>

            <nav className="fixed inset-x-0 bottom-0 z-20 flex h-[74px] items-center justify-around border-t border-[#eeeeee] bg-white px-3 md:hidden">
                {[['Home', '/dashboard', WalletCards], ['Rewards', '#', Gift], ['Finance', '#', ArrowUpRight], ['Cards', '#', WalletCards], ['Me', '#', UserRound]].map(([label, path, Icon], index) => (
                    <Link key={label} to={path} className={`flex flex-col items-center gap-1 text-[11px] ${index === 0 ? 'text-[#00b978]' : 'text-[#aaa]'}`}>
                        <Icon size={23} strokeWidth={index === 0 ? 2.5 : 1.6} />
                        {label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
