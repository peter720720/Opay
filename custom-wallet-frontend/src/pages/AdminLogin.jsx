import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function AdminLogin() {
    const { login, logout } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiClient.post('/auth/login', { email, password });
            if (response.data.role !== 'admin') {
                logout();
                setError('This account does not have administrator access.');
                return;
            }

            login(response.data);
            navigate('/admin');
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Invalid administrator credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-md">
                <div className="mb-4 flex justify-center">
                    <img src="/logo.png" alt="OPay" className="h-16 w-16 object-contain" />
                </div>
                <h1 className="mb-2 text-center text-3xl font-extrabold tracking-tight text-emerald-600">Admin sign in</h1>
                <p className="mb-6 text-center text-sm text-slate-400">Access the OPay operations panel</p>

                {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="admin-email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Email address</label>
                        <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:border-emerald-500 focus:outline-none" required />
                    </div>
                    <div>
                        <label htmlFor="admin-password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                        <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:border-emerald-500 focus:outline-none" required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full rounded-lg bg-emerald-600 p-3 text-sm font-bold tracking-wide text-white shadow transition hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400">
                        {loading ? 'Signing in...' : 'Sign in as admin'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    <Link to="/login" className="font-semibold text-emerald-600 hover:underline">Return to user login</Link>
                </p>
            </div>
        </div>
    );
}
