'use client'

import { useEffect, useState } from "react";
import { deleteAccount, getProfile, updateProfile } from "@/services/user.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, AlertCircle, Loader2, Package, Mail, Phone as PhoneIcon, Trash2, User as UserIcon, X } from "lucide-react";
import { motion } from "motion/react";
import { buttonMotion, fadeUp, scaleFade, staggerContainer, staggerItem } from "@/lib/animations";
import { notify } from "@/lib/feedback";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
    const router = useRouter();
    const { logout } = useAuth();
    const [error, setError] = useState('');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setLoadError(false);
            try {
                const data = await getProfile();
                setProfile(data.user);
            } catch (error) {
                console.log(error);
                setLoadError(true);
                notify.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleEditClick = () => {
        setFormData({
            name: profile.name,
            email: profile.email,
            phone: profile.phone || ''
        });
        setError('');
        setIsEditing(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError('Name cannot be empty');
            notify.info('Name cannot be empty');
            return;
        }
        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            setError('Phone number must be exactly 10 digits');
            notify.info('Phone number must be exactly 10 digits');
            return;
        }

        setSaving(true);
        try {
            const data = await updateProfile(formData);
            setProfile(data.user);
            setIsEditing(false);
            notify.profileSaved();
        } catch (error) {
            console.log(error);
            setError('Could not save changes. Please try again.');
            notify.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setError('');
        setIsEditing(false);
    };

    const openDeleteConfirm = () => {
        setDeleteConfirmText('');
        setShowDeleteConfirm(true);
    };

    const closeDeleteConfirm = () => {
        if (deleting) return;
        setDeleteConfirmText('');
        setShowDeleteConfirm(false);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText.trim().toLowerCase() !== profile.email.toLowerCase()) {
            notify.info('Type your email address to confirm account deletion');
            return;
        }

        setDeleting(true);
        try {
            await deleteAccount();
            logout();
            notify.accountDeleted();
            router.push('/');
        } catch (error) {
            console.log(error);
            notify.error(error);
        } finally {
            setDeleting(false);
        }
    };

    const initials = profile?.name
        ? profile.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
        : '?';

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 pt-10 pb-20">
                <div className="max-w-2xl mx-auto px-4 sm:px-6">
                    <div className="h-3 w-20 bg-slate-200 rounded-full animate-pulse mb-3" />
                    <div className="h-9 w-44 bg-slate-200 rounded-lg animate-pulse mb-8" />
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse shrink-0" />
                            <div className="space-y-2 flex-1">
                                <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
                                <div className="h-4 w-52 bg-slate-200 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-5">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="space-y-2">
                                    <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                                    <div className="h-5 w-48 bg-slate-100 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (loadError || !profile) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <motion.div className="text-center max-w-sm" {...fadeUp}>
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
                        <AlertCircle className="text-red-500" size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Couldn&apos;t load your profile
                    </h2>
                    <p className="text-slate-500 mt-2">
                        Something went wrong. Please try again.
                    </p>
                    <motion.button
                        onClick={() => window.location.reload()}
                        className="inline-block mt-6 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                        {...buttonMotion}
                    >
                        Try again
                    </motion.button>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pt-10 pb-20">
            <motion.div className="max-w-2xl mx-auto px-4 sm:px-6" {...fadeUp}>

                <div className="mb-8 pb-5 border-b border-slate-200">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-teal-700 uppercase mb-1.5">
                        <Package size={13} strokeWidth={2.5} />
                        Account
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                        My profile
                    </h1>
                </div>

                <motion.div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" {...scaleFade}>

                    {/* Gradient header band with avatar */}
                    <div className="relative bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-700 px-6 sm:px-8 py-7 sm:py-8">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
                        <div className="relative flex items-center gap-4">
                            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-white text-xl font-bold shrink-0">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-white text-lg sm:text-xl truncate">
                                    {profile.name}
                                </p>
                                <p className="text-teal-50/90 text-sm truncate">
                                    {profile.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">

                        {isEditing ? (
                            <motion.div className="space-y-5" {...fadeUp}>
                                {error && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                                        <AlertCircle size={16} className="shrink-0" />
                                        {error}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Full name
                                    </label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={saving}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition disabled:bg-slate-50 disabled:text-slate-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email address
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={saving}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition disabled:bg-slate-50 disabled:text-slate-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Phone number
                                    </label>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={saving}
                                        placeholder="Add phone number"
                                        inputMode="numeric"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition disabled:bg-slate-50 disabled:text-slate-400"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <motion.button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-colors min-w-[140px]"
                                        {...buttonMotion}
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save changes'
                                        )}
                                    </motion.button>
                                    <motion.button
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold transition-colors"
                                        {...buttonMotion}
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div variants={staggerContainer} initial="initial" animate="animate">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <motion.div className="bg-slate-50 rounded-xl px-4 py-3.5 border border-slate-100" variants={staggerItem}>
                                        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                                            <UserIcon size={12} />
                                            Full name
                                        </p>
                                        <p className="text-slate-900 font-medium">{profile.name}</p>
                                    </motion.div>

                                    <motion.div className="bg-slate-50 rounded-xl px-4 py-3.5 border border-slate-100" variants={staggerItem}>
                                        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                                            <PhoneIcon size={12} />
                                            Phone number
                                        </p>
                                        <p className="text-slate-900 font-medium">
                                            {profile.phone || <span className="text-slate-400 italic font-normal">Not added</span>}
                                        </p>
                                    </motion.div>

                                    <motion.div className="bg-slate-50 rounded-xl px-4 py-3.5 border border-slate-100 sm:col-span-2" variants={staggerItem}>
                                        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                                            <Mail size={12} />
                                            Email address
                                        </p>
                                        <p className="text-slate-900 font-medium truncate">{profile.email}</p>
                                    </motion.div>
                                </div>

                                <motion.button
                                    onClick={handleEditClick}
                                    className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors mt-6"
                                    {...buttonMotion}
                                >
                                    <Pencil size={15} />
                                    Edit profile
                                </motion.button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* My Orders card */}
                <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.22 }}>
                    <Link
                        href="/orders"
                        className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mt-5 hover:shadow-md hover:border-teal-200 transition-all group"
                    >
                        <span className="flex items-center gap-3 font-semibold text-slate-900">
                            <span className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 group-hover:bg-teal-100 transition-colors">
                                <Package size={17} />
                            </span>
                            My orders
                        </span>
                        <span className="text-teal-700">→</span>
                    </Link>
                </motion.div>

                <motion.div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 mt-5" {...scaleFade}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="flex items-center gap-2 font-semibold text-slate-900">
                                <span className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                                    <Trash2 size={17} />
                                </span>
                                Delete account
                            </p>
                            <p className="text-sm text-slate-500 mt-2 sm:ml-11">
                                Permanently remove your account and saved profile details.
                            </p>
                        </div>
                        <motion.button
                            onClick={openDeleteConfirm}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                            {...buttonMotion}
                        >
                            <Trash2 size={15} />
                            Delete
                        </motion.button>
                    </div>
                </motion.div>

            </motion.div>

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden"
                        {...scaleFade}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                                    <Trash2 size={18} />
                                </span>
                                <div>
                                    <h2 className="font-semibold text-slate-900">Delete account?</h2>
                                    <p className="text-xs text-slate-500">This action cannot be undone.</p>
                                </div>
                            </div>
                            <button
                                onClick={closeDeleteConfirm}
                                disabled={deleting}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 transition-colors"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            <p className="text-sm text-slate-600 leading-6">
                                Your account login, profile details, saved addresses, and cart will be removed.
                                Existing order records may remain for store records.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Type your email to confirm
                                </label>
                                <input
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    disabled={deleting}
                                    placeholder={profile.email}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition disabled:bg-slate-50 disabled:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                onClick={closeDeleteConfirm}
                                disabled={deleting}
                                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                                Keep account
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleting || deleteConfirmText.trim().toLowerCase() !== profile.email.toLowerCase()}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={15} />
                                        Delete account
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </main>
    );
}
