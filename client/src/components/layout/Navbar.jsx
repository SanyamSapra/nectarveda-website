'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ShoppingCart,
    User,
    LogOut,
    Menu,
    X,
    Search,
} from 'lucide-react';
import Image from 'next/image';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/about', label: 'About' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const cartCount = user?.cart?.length ?? 0;

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-stone-100 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-[88px] flex items-center justify-between">

                    {/* 1. UPGRADED LOGO SECTION */}
                    <Link href="/" className="flex items-center gap-3 shrink-0 group">
                        {/* Logo Icon Container - Increased size to w-16 h-16 for desktop */}
                        <div className="relative w-12 h-12 md:w-16 md:h-16 flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-50 to-emerald-50 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="NectarVeda Logo"
                                fill
                                priority
                                sizes="(max-width: 768px) 48px, 64px"
                                /* Removed p-1.5 and used object-cover to perfectly fill the space */
                                className="object-cover"
                            />
                        </div>

                        {/* Brand Typography */}
                        <div className="flex flex-col justify-center">
                            <span className="text-xl md:text-2xl font-extrabold tracking-tight text-teal-700 leading-none">
                                NECTARVEDA
                            </span>
                            <span className="text-[10px] md:text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-widest">
                                Ayurveda & Wellness
                            </span>
                        </div>
                    </Link>

                    {/* Center Nav (desktop) */}
                    <nav className="hidden md:flex items-center gap-1 bg-stone-50 border border-stone-200/80 rounded-full p-1.5 shadow-sm">
                        {navLinks.map((link) => {
                            const active = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
                                    ${active
                                            ? 'bg-white text-teal-700 shadow-sm ring-1 ring-stone-200/50'
                                            : 'text-stone-500 hover:text-teal-800 hover:bg-stone-100/50'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right side (desktop) */}
                    <div className="hidden md:flex items-center gap-2">

                        {/* Search */}
                        <label className="relative hidden lg:block mr-2 group">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-teal-600 transition-colors" />
                            <input
                                type="search"
                                placeholder="Search wellness..."
                                className="w-64 rounded-full border border-stone-200 bg-stone-50 pl-10 pr-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                        </label>

                        {user ? (
                            <>
                                <Link
                                    href="/cart"
                                    aria-label="Cart"
                                    className={`relative p-2.5 rounded-full transition-all duration-200
                                    ${pathname === '/cart'
                                            ? 'bg-emerald-50 text-emerald-900'
                                            : 'text-stone-600 hover:bg-stone-100 hover:text-emerald-800'
                                        }`}
                                >
                                    <ShoppingCart size={20} strokeWidth={2.2} />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-sm border-2 border-white">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                <Link
                                    href="/profile"
                                    aria-label="Profile"
                                    className={`p-2.5 rounded-full transition-all duration-200
                                    ${pathname === '/profile'
                                            ? 'bg-emerald-50 text-emerald-900'
                                            : 'text-stone-600 hover:bg-stone-100 hover:text-emerald-800'
                                        }`}
                                >
                                    <User size={20} strokeWidth={2.2} />
                                </Link>

                                <button
                                    onClick={logout}
                                    aria-label="Log out"
                                    className="p-2.5 ml-1 rounded-full text-stone-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                                >
                                    <LogOut size={18} strokeWidth={2.2} />
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="ml-2 px-6 py-2.5 rounded-full bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                Sign in
                            </Link>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setMobileOpen((open) => !open)}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        className="md:hidden p-2 -mr-2 rounded-full text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu panel */}
            {mobileOpen && (
                <div className="md:hidden border-t border-stone-100 bg-white px-4 py-4 shadow-xl absolute w-full">
                    <label className="relative block mb-6">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="search"
                            placeholder="Search wellness products..."
                            className="w-full rounded-2xl border border-stone-200 bg-stone-50 pl-11 pr-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-400 transition-all"
                        />
                    </label>

                    <nav className="flex flex-col gap-1.5 mb-6">
                        {navLinks.map((link) => {
                            const active = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`px-5 py-3.5 rounded-2xl text-sm font-semibold transition-colors duration-200
                                    ${active
                                            ? 'bg-emerald-50 text-emerald-900'
                                            : 'text-stone-600 hover:bg-stone-50'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex flex-col gap-1.5 border-t border-stone-100 pt-6 pb-2">
                        {user ? (
                            <>
                                <Link
                                    href="/cart"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-semibold text-stone-700 hover:bg-stone-50"
                                >
                                    <ShoppingCart size={20} className="text-stone-400" />
                                    Cart {cartCount > 0 && <span className="ml-auto bg-emerald-100 text-emerald-800 py-0.5 px-2.5 rounded-full text-xs">{cartCount} items</span>}
                                </Link>
                                <Link
                                    href="/profile"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-semibold text-stone-700 hover:bg-stone-50"
                                >
                                    <User size={20} className="text-stone-400" />
                                    My Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        logout();
                                        setMobileOpen(false);
                                    }}
                                    className="flex items-center gap-4 px-5 py-3.5 mt-2 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 text-left"
                                >
                                    <LogOut size={20} className="text-red-400" />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                                className="w-full px-5 py-3.5 rounded-2xl bg-teal-700 text-white text-sm font-semibold text-center hover:bg-teal-800 transition-colors shadow-sm"
                            >
                                Sign In / Register
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}