'use client';

import { useState } from 'react';
import { loginUser } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { buttonMotion, fadeUp, scaleFade } from '@/lib/animations';
import { notify } from '@/lib/feedback';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await loginUser(formData);
            login(data);
            notify.info('Welcome back!');
            if (data.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error(error);
            notify.error(error);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4">

            <motion.div className="w-full max-w-md" {...fadeUp}>

                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-teal-800">
                        NectarVeda
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Ayurveda for Better Living
                    </p>
                </div>

                {/* Card */}
                <motion.div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8" {...scaleFade}>

                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-slate-900">
                            Welcome Back
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Login to continue your wellness journey
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
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
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                            />
                        </div>

                        <motion.button
                            type="submit"
                            className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                            {...buttonMotion}
                        >
                            Login
                        </motion.button>

                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Don&apos;t have an account?{" "}
                        <a
                            href="/register"
                            className="text-teal-700 font-semibold hover:text-teal-800"
                        >
                            Create Account
                        </a>
                    </div>

                </motion.div>

            </motion.div>

        </div>
    )
}
