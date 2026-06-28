"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { buttonMotion, fadeUp, scaleFade } from "@/lib/animations";
import { Leaf, MailCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { resendOtp, verifyOtp } from "@/services/auth.service";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

const subscribeToStorage = () => () => { };
const getPendingVerifyEmail = () => sessionStorage.getItem("pendingVerifyEmail") || "";
const getServerEmail = () => "";

function maskEmail(email) {
    if (!email || !email.includes("@")) return "";
    const [name, domain] = email.split("@");
    return `${name.charAt(0)}***@${domain}`;
}

export default function VerifyOtpPage() {
    const router = useRouter();
    const { login } = useAuth();
    const inputRefs = useRef([]);

    const email = useSyncExternalStore(subscribeToStorage, getPendingVerifyEmail, getServerEmail);
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
    const [isNavigatingAway, setIsNavigatingAway] = useState(false);

    const otpValue = otp.join("");
    const maskedEmail = useMemo(() => maskEmail(email), [email]);
    const filledCount = otp.filter(Boolean).length;

    useEffect(() => {
        if (!email && !isNavigatingAway) router.replace("/register");
    }, [email, isNavigatingAway, router]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((s) => Math.max(s - 1, 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

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
        pastedOtp.forEach((digit, i) => { nextOtp[i] = digit; });
        setOtp(nextOtp);
        inputRefs.current[Math.min(pastedOtp.length, OTP_LENGTH) - 1]?.focus();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (otpValue.length !== OTP_LENGTH) {
            toast.error("Please enter the 6-digit OTP.");
            return;
        }
        setLoading(true);
        try {
            const data = await verifyOtp({ email, otp: otpValue });
            setIsNavigatingAway(true);
            const verifiedUser = data.user || data;
            sessionStorage.removeItem("pendingVerifyEmail");
            localStorage.setItem("user", JSON.stringify(verifiedUser));
            login(verifiedUser);
            toast.success("Account verified successfully.");
            router.replace("/");
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.response?.data?.error || error?.message || "OTP verification failed.");
            setIsNavigatingAway(false);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || resending) return;
        setResending(true);
        try {
            await resendOtp(email);
            toast.success("OTP sent again.");
            setCooldown(RESEND_COOLDOWN);
            setOtp(Array(OTP_LENGTH).fill(""));
            inputRefs.current[0]?.focus();
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.response?.data?.error || error?.message || "Unable to resend OTP.");
        } finally {
            setResending(false);
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
                            <MailCheck size={20} className="text-teal-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Verify your email
                        </h2>
                        <p className="text-slate-500 text-sm mt-1.5">
                            We sent a 6-digit OTP to{' '}
                            <span className="font-semibold text-slate-700">{maskedEmail}</span>.
                            Enter it below to activate your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* OTP inputs */}
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

                            {/* Progress indicator */}
                            <div className="flex gap-1 mt-3">
                                {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-0.5 flex-1 rounded-full transition-colors duration-200 ${i < filledCount ? 'bg-teal-500' : 'bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading || filledCount < OTP_LENGTH}
                            className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2"
                            {...buttonMotion}
                        >
                            {loading && (
                                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                            )}
                            {loading ? "Verifying..." : "Verify account"}
                        </motion.button>
                    </form>

                    {/* Resend */}
                    <div className="mt-5 text-center">
                        <p className="text-sm text-slate-500">
                            Didn&apos;t receive it?{' '}
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={cooldown > 0 || resending}
                                className="font-semibold text-teal-700 hover:text-teal-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {resending
                                    ? "Sending..."
                                    : cooldown > 0
                                        ? `Resend in ${cooldown}s`
                                        : "Resend OTP"}
                            </button>
                        </p>
                    </div>

                    <Link
                        href="/register"
                        className="flex items-center justify-center gap-1.5 mt-4 text-sm text-slate-500 hover:text-teal-700 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to register
                    </Link>
                </motion.div>

            </motion.div>

        </div>
    );
}
