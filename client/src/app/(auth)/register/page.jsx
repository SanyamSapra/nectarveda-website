'use client'

import { useState } from "react"
import { registerUser } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { buttonMotion, fadeUp, scaleFade } from "@/lib/animations";
import { notify } from "@/lib/feedback";
import Link from "next/link";
import { Leaf, UserPlus } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await registerUser(formData);
            sessionStorage.setItem("pendingVerifyEmail", data.email || formData.email);
            notify.info('OTP sent to your email. Please verify your account.');
            router.push('/verify-otp');
        } catch (error) {
            console.log(error);
            notify.error(error);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = `w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400
        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
        disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition`;

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
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                            <UserPlus size={20} className="text-teal-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Create account
                        </h2>
                        <p className="text-slate-500 text-sm mt-1.5">
                            Join NectarVeda and start your wellness journey.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Full name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Jane Doe"
                                required
                                disabled={loading}
                                className={inputClass}
                            />
                        </div>

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
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a strong password"
                                required
                                disabled={loading}
                                className={inputClass}
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
                            {loading ? 'Creating account...' : 'Create account'}
                        </motion.button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-teal-700 font-semibold hover:text-teal-800 transition-colors"
                        >
                            Log in
                        </Link>
                    </p>
                </motion.div>

            </motion.div>
        </div>
    );
}