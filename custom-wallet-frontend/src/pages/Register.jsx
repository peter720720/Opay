import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function Register() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await apiClient.post('/auth/register', { fullName, email, password });
            if (res.data.success) {
                login(res.data);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-md max-w-md w-full">
                <div className="flex justify-center mb-4">
                    <img src="/logo.png" alt="OPay" className="w-16 h-16 object-contain" />
                </div>
                <h2 className="text-3xl font-extrabold text-emerald-600 text-center tracking-tight mb-2">Open your OPay account</h2>
                <p className="text-slate-400 text-center text-sm mb-6">Create your secure wallet</p>

                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm mb-4 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Legal Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                        <input 
                            type="email" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                        <input 
                            type="password" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
                            placeholder="Minimum 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg font-bold text-sm tracking-wide shadow transition-all cursor-pointer disabled:bg-slate-200 disabled:text-slate-400"
                    >
                        {loading ? 'Creating secure profile...' : 'Register'}
                    </button>
                </form>

                <p className="text-sm text-center text-slate-500 mt-6">
                    Already registered? <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Log in here</Link>
                </p>
            </div>
        </div>
    );
}
