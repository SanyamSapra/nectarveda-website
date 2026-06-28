'use client';

import { useState } from 'react';
import { loginUser } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { buttonMotion, fadeUp, scaleFade } from '@/lib/animations';
import { notify } from '@/lib/feedback';
import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await loginUser(formData);
            login(data);
            notify.loginSuccess();
            router.push(data.role === 'admin' ? '/admin' : '/');
        } catch (error) {
            console.error(error);
            notify.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">

            <motion.div className="w-full max-w-md" {...fadeUp}>

                {/* Card */}
                <motion.div
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 sm:p-8"
                    {...scaleFade}
                >
                    {/* Branding inside card */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                        <img src="/logo.png" alt="NectarVeda" className="h-10 w-10 object-contain" />
                        <div>
                            <h1 className="text-xl font-bold text-teal-800 leading-tight">NectarVeda</h1>
                            <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest">Ayurveda & Wellness</p>
                        </div>
                    </div>
                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Welcome back
                        </h2>
                        <p className="text-slate-500 text-sm mt-1.5">
                            Log in to continue your wellness journey.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-teal-700 font-semibold hover:text-teal-800 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition"
                            />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2"
                            {...buttonMotion}
                        >
                            {loading && (
                                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                            )}
                            {loading ? 'Logging in...' : 'Log in'}
                        </motion.button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/register"
                            className="text-teal-700 font-semibold hover:text-teal-800 transition-colors"
                        >
                            Create account
                        </Link>
                    </p>
                </motion.div>

            </motion.div>
        </div>
    );
}
