'use client';

import { useState } from 'react';
import AdminRoute from '@/components/admin/AdminRoute';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Tag, Users, LogOut, ShieldCheck, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { notify } from '@/lib/feedback';
import Image from 'next/image';

const navItems = [
    { label: 'Dashboard',  href: '/admin',            icon: LayoutDashboard },
    { label: 'Products',   href: '/admin/products',   icon: Package },
    { label: 'Orders',     href: '/admin/orders',     icon: ShoppingBag },
    { label: 'Categories', href: '/admin/categories', icon: Tag },
    { label: 'Users',      href: '/admin/users',      icon: Users },
];

const pageMeta = {
    '/admin':            'Dashboard',
    '/admin/products':   'Products',
    '/admin/orders':     'Orders',
    '/admin/categories': 'Categories',
    '/admin/users':      'Users',
};

function Sidebar({ onClose }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const adminName    = user?.name  || 'Admin';
    const adminEmail   = user?.email || 'admin@nectarveda.com';
    const adminInitial = adminName.charAt(0).toUpperCase();

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout');
            notify.logoutSuccess();
        } catch (error) {
            notify.error(error);
        } finally {
            logout();
            onClose();
            router.replace('/');
        }
    };

    return (
        // w-72 on desktop, but cap at 80vw on mobile so it never overflows
        <aside className="w-[min(288px,80vw)] bg-white border-r border-slate-200 flex flex-col h-full">

            {/* Logo */}
            <div className="h-16 px-4 sm:px-6 border-b border-slate-200 flex items-center justify-between shrink-0">
                <Link href="/admin" onClick={onClose} className="flex items-center gap-3 group">
                    <div className="relative w-9 h-9 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-teal-50 to-emerald-50">
                        <Image src="/logo.png" alt="NectarVeda" fill priority className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div>
                        <span className="text-base font-extrabold tracking-tight text-teal-700 leading-none">NECTARVEDA</span>
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
                            <ShieldCheck size={10} />
                            Admin Panel
                        </div>
                    </div>
                </Link>

                <button
                    onClick={onClose}
                    className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onClose}
                            aria-current={active ? 'page' : undefined}
                            className={`flex items-center gap-3 h-11 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                                active
                                    ? 'bg-teal-700 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-teal-700'
                            }`}
                        >
                            <Icon size={18} className="shrink-0" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Profile + Logout */}
            <div className="border-t border-slate-200 p-3 space-y-1 shrink-0">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                        {adminInitial}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{adminName}</p>
                        <p className="truncate text-xs text-slate-500">{adminEmail}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="group flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                    <LogOut size={17} className="shrink-0 group-hover:-translate-x-0.5 transition-transform duration-200" />
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const pageTitle = pageMeta[pathname] ?? 'Admin';
    const isSubPage = pathname !== '/admin';

    return (
        <AdminRoute>
            <div className="min-h-screen bg-slate-50 flex">

                {/* Desktop Sidebar — fixed */}
                <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-72">
                    <Sidebar onClose={() => {}} />
                </div>

                {/* Mobile Backdrop */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                        onClick={() => setMobileOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Mobile Sidebar — slide in from left */}
                <div className={`fixed inset-y-0 left-0 z-50 flex lg:hidden transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar onClose={() => setMobileOpen(false)} />
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-h-screen lg:ml-72 min-w-0">

                    {/* Top Bar */}
                    <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm px-4 flex items-center gap-3 shrink-0">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="p-2 -ml-1 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden transition-colors shrink-0"
                            aria-label="Open menu"
                        >
                            <Menu size={20} />
                        </button>

                        <nav className="flex items-center gap-1.5 text-sm min-w-0">
                            <span className="text-slate-400 font-medium shrink-0">Admin</span>
                            <ChevronRight size={14} className="text-slate-300 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">
                                {isSubPage ? pageTitle : 'Dashboard'}
                            </span>
                        </nav>
                    </header>

                    {/* Page content — NO padding here; each page manages its own */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </AdminRoute>
    );
}
