import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user } = useAuth();

    return (
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
            <div className="flex items-center gap-3">
                <img src="/logo.png" alt="OPay" className="w-8 h-8 object-contain md:hidden" />
                <h1 className="text-lg font-semibold text-slate-800">OPay</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">{user?.fullName}</p>
                    <p className="text-xs text-slate-400 capitalize">{user?.role} Profile</p>
                </div>
                <div className="w-10 h-10 bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center shadow-inner">
                    {user?.fullName?.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
}
