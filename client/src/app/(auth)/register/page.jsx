'use client'

import { useState } from "react"
import { registerUser } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const { login } = useAuth()
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await registerUser(formData);
            login(data)
            router.push('/')
        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-teal-800">
                        NectarVeda
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Ayurveda for Better Living
                    </p>
                </div>

                {/* Register Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900">
                            Create Account
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Join NectarVeda and start your wellness journey
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Email */}
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

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            Create Account
                        </button>

                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <a
                            href="/login"
                            className="text-teal-700 font-semibold hover:text-teal-800"
                        >
                            Login
                        </a>
                    </div>

                </div>

            </div>

        </div>
    )
}