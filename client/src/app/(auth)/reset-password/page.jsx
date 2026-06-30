"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { buttonMotion, fadeUp, scaleFade } from "@/lib/animations";
import { getErrorMessage } from "@/lib/feedback";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/auth`;
const OTP_LENGTH = 6;
const subscribeToStorage = () => () => { };
const getPendingResetEmail = () => sessionStorage.getItem("pendingResetEmail") || "";
const getServerEmail = () => "";

const inputClass = `w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 bg-white text-slate-900
    placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
    disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition`;

export default function ResetPasswordPage() {
    const router = useRouter();
    const inputRefs = useRef([]);

    const email = useSyncExternalStore(subscribeToStorage, getPendingResetEmail, getServerEmail);
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isNavigatingAway, setIsNavigatingAway] = useState(false);

    const otpValue = otp.join("");

    useEffect(() => {
        if (!email && !isNavigatingAway) router.replace("/forgot-password");
    }, [email, isNavigatingAway, router]);

    const handleOtpChange = (index, value) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const nextOtp = [...otp];
        nextOtp[index] = digit;
        setOtp(nextOtp);
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, event) => {
        if (event.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (event) => {
        event.preventDefault();
        const pastedOtp = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, OTP_LENGTH)
            .split("");
        if (!pastedOtp.length) return;
        const nextOtp = Array(OTP_LENGTH).fill("");
        pastedOtp.forEach((digit, index) => { nextOtp[index] = digit; });
        setOtp(nextOtp);
        inputRefs.current[Math.min(pastedOtp.length, OTP_LENGTH) - 1]?.focus();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (otpValue.length !== OTP_LENGTH) {
            toast.error("Please enter the 6-digit OTP.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpValue, newPassword }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || data?.error || "Unable to reset password.");
            }
            setIsNavigatingAway(true);
            sessionStorage.removeItem("pendingResetEmail");
            toast.success("Password reset successfully.");
            router.replace("/login");
        } catch (error) {
            toast.error(getErrorMessage(error));
            setIsNavigatingAway(false);
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
                            <KeyRound size={20} className="text-teal-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Reset password
                        </h2>
                        <p className="text-slate-500 text-sm mt-1.5">
                            Enter the OTP sent to{' '}
                            <span className="font-medium text-slate-700">{email}</span>{' '}
                            and choose a new password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* OTP boxes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                One-time password
                            </label>
                            <div className="flex justify-between gap-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        onPaste={handleOtpPaste}
                                        disabled={loading}
                                        className={`h-12 w-full rounded-xl border text-center text-xl font-bold text-slate-900 outline-none transition
                                            ${digit
                                                ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
                                                : 'border-slate-300 bg-white'
                                            }
                                            focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20
                                            disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* New password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                New password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Create a new password"
                                    required
                                    disabled={loading}
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(s => !s)}
                                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-teal-700 transition-colors"
                                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Confirm password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your new password"
                                    required
                                    disabled={loading}
                                    className={`${inputClass} ${confirmPassword && newPassword !== confirmPassword
                                        ? 'border-red-400 focus:ring-red-400'
                                        : confirmPassword && newPassword === confirmPassword
                                            ? 'border-emerald-400 focus:ring-emerald-400'
                                            : ''
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(s => !s)}
                                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-teal-700 transition-colors"
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {/* Inline mismatch hint */}
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-xs text-red-500 mt-1.5">Passwords don&apos;t match</p>
                            )}
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
                            {loading ? "Resetting..." : "Reset password"}
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
