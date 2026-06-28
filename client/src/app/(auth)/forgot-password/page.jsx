"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { buttonMotion, fadeUp, scaleFade } from "@/lib/animations";
import { Leaf, ArrowLeft, Mail } from "lucide-react";

const API_URL = "http://localhost:5000/api/auth";

function getErrorMessage(error) {
    return error?.message || "Something went wrong. Please try again.";
}

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || data?.error || "Unable to send reset OTP.");
            }
            sessionStorage.setItem("pendingResetEmail", email);
            toast.success("Reset OTP sent to your email.");
            router.push("/reset-password");
        } catch (error) {
            toast.error(getErrorMessage(error));
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
                    {/* Header */}
                    <div className="mb-7">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                            <Mail size={20} className="text-teal-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Forgot password?
                        </h2>
                        <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                            Enter your email and we&apos;ll send you a one-time password to reset your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 transition"
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
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </motion.button>
                    </form>

                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-1.5 mt-6 text-sm text-slate-500 hover:text-teal-700 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to login
                    </Link>
                </motion.div>

            </motion.div>
        </div>
    );
}
