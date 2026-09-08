import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Send, ShieldAlert, LogOut } from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: Wallet, roles: ['user', 'admin'] },
        { name: 'Transfer Funds', path: '/transfer', icon: Send, roles: ['user'] },
        { name: 'Admin Management', path: '/admin', icon: ShieldAlert, roles: ['admin'] },
    ];

    return (
        <aside className="sticky top-0 h-screen w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between shadow-sm">
            <div className="p-6">
                <Link to="/dashboard" className="flex items-center gap-3 mb-8" aria-label="OPay dashboard">
                    <img src="/logo.png" alt="OPay" className="w-10 h-10 object-contain" />
                    <span className="text-2xl font-bold text-emerald-600 tracking-tight">OPay</span>
                </Link>
                <nav className="space-y-1">
                    {links.map((link) => {
                        if (!link.roles.includes(user?.role)) return null;
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                                    isActive(link.path)
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <Icon size={18} />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-6 border-t border-slate-100">
                <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                    <LogOut size={18} />
                    Logout Session
                </button>
            </div>
        </aside>
    );
}
