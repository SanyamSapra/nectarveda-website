'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, LogOut, Menu, X, Search, } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';


const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/about', label: 'About' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const menuRef = useRef(null);

    const { cartCount } = useCart();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Lock body scroll while mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-stone-100 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 sm:h-20 lg:h-[88px] flex items-center justify-between gap-2">

                    {/* Logo Section */}
                    <Link href="/" aria-label="NectarVeda home" className="flex items-center gap-3 shrink-0 group">
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-50 to-emerald-50 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="NectarVeda Logo"
                                fill
                                priority
                                sizes="(max-width: 768px) 40px, 64px"
                                className="object-cover"
                            />
                        </div>

                        {/* Wordmark hidden until desktop nav appears, so search has room on mobile/tablet */}
                        <div className="hidden md:flex flex-col justify-center min-w-0">
                            <span className="text-xl md:text-2xl font-extrabold tracking-tight text-teal-700 leading-none truncate">
                                NECTARVEDA
                            </span>
                            <span className="text-[10px] md:text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-widest truncate">
                                Ayurveda & Wellness
                            </span>
                        </div>
                    </Link>

                    {/* Inline search — mobile only; tablet/desktop use the search next to account icons */}
                    <label className="relative flex-1 min-w-0 md:hidden group">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-teal-600 transition-colors" />
                        <input
                            type="search"
                            placeholder="Search wellness..."
                            className="w-full rounded-full border border-stone-200 bg-stone-50 pl-10 pr-3 py-2 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </label>

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

                    {/* Right side (mobile): cart + hamburger */}
                    <div className="flex md:hidden items-center gap-1">
                        {user && (
                            <Link
                                href="/cart"
                                aria-label="Cart"
                                onClick={() => setMobileOpen(false)}
                                className={`relative p-2 rounded-full transition-all duration-200
                                ${pathname === '/cart'
                                        ? 'bg-emerald-50 text-emerald-900'
                                        : 'text-stone-600 hover:bg-stone-100'
                                    }`}
                            >
                                <ShoppingCart size={20} strokeWidth={2.2} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-sm border-2 border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        <button
                            onClick={() => setMobileOpen((open) => !open)}
                            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={mobileOpen}
                            className="p-2 rounded-full text-stone-600 hover:bg-stone-100 transition-colors"
                        >
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu backdrop */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                    className="md:hidden fixed inset-0 top-16 sm:top-20 bg-stone-900/30 z-40"
                />
            )}

            {/* Mobile menu panel */}
            {mobileOpen && (
                <div
                    ref={menuRef}
                    className="md:hidden fixed inset-x-0 top-16 sm:top-20 z-50 bg-white border-t border-stone-100 shadow-xl max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 py-4"
                >
                    <nav className="flex flex-col gap-1.5 mb-5">
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

                    <div className="flex flex-col gap-1.5 border-t border-stone-100 pt-5 pb-2">
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
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                                className="w-full px-5 py-3.5 rounded-2xl bg-teal-700 text-white text-sm font-semibold text-center hover:bg-teal-800 transition-colors shadow-sm"
                            >
                                Sign in / Register
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}