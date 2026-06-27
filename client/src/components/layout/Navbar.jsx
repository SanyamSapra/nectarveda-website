'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, LogOut, Search, Home, Store, Info, LogIn, X } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { logoutUser } from '@/services/auth.service';
import { buttonMotion, scaleFade } from '@/lib/animations';
import { notify } from '@/lib/feedback';
const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/about', label: 'About' },
];

// Bottom tab bar config (mobile only). Cart and Profile/Sign in are handled
// separately below since they depend on auth state and cart count.
const tabLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Shop', icon: Store },
    { href: '/about', label: 'About', icon: Info },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    const { cartCount } = useCart();

    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearchQuery(pathname === '/products' ? params.get('search') || '' : '')
    }, [pathname])

    const isActive = (href) => pathname === href;

    const handleLogout = async () => {
        try {
            await logoutUser();
            notify.info('Logged out successfully.');
        } catch (error) {
            notify.error(error);
        } finally {
            logout();
            setProfileMenuOpen(false);
        }
    };

    const submitSearch = (e) => {
        e.preventDefault()
        const query = searchQuery.trim()
        router.push(query ? `/products?search=${encodeURIComponent(query)}` : '/products')
    }

    const updateSearch = (value) => {
        setSearchQuery(value)

        if (pathname === '/products') {
            const query = value.trim()
            router.replace(query ? `/products?search=${encodeURIComponent(query)}` : '/products', { scroll: false })
        }
    }

    const clearSearch = () => {
        setSearchQuery('')
        if (pathname === '/products') router.push('/products')
    }

    const searchInput = (className) => (
        <form onSubmit={submitSearch} className={`relative group ${className}`}>
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-teal-600 transition-colors" />
            <input
                type="text"
                placeholder="Search wellness..."
                value={searchQuery}
                onChange={e => updateSearch(e.target.value)}
                className="w-full rounded-full border border-stone-200 bg-stone-50 pl-10 pr-10 py-2 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all lg:py-2.5"
            />
            {searchQuery && (
                <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                >
                    <X size={14} />
                </button>
            )}
        </form>
    )

    return (
        <>
            {/* Top header */}
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
                        {searchInput('flex-1 min-w-0 md:hidden')}

                        {/* Center Nav (desktop) */}
                        <nav className="hidden md:flex items-center gap-1 bg-stone-50 border border-stone-200/80 rounded-full p-1.5 shadow-sm">
                            {navLinks.map((link) => {
                                const active = isActive(link.href);
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
                            {searchInput('hidden lg:block mr-2 w-64')}

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
                                            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-sm border-2 border-white">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>

                                    <div className="relative" ref={profileMenuRef}>
                                        <button
                                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                            aria-label="Profile"
                                            className={`p-2.5 rounded-full transition-all duration-200
                                                ${pathname === '/profile'
                                                    ? 'bg-emerald-50 text-emerald-900'
                                                    : 'text-stone-600 hover:bg-stone-100 hover:text-emerald-800'
                                                }`}
                                        >
                                            <User size={20} strokeWidth={2.2} />
                                        </button>

                                        <AnimatePresence>
                                            {profileMenuOpen && (
                                                <motion.div
                                                    className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg py-2 z-50"
                                                    {...scaleFade}
                                                >
                                                    <Link
                                                        href="/profile"
                                                        onClick={() => setProfileMenuOpen(false)}
                                                        className="block px-4 py-2 hover:bg-stone-100"
                                                    >
                                                        My Profile
                                                    </Link>

                                                    <Link
                                                        href="/orders"
                                                        onClick={() => setProfileMenuOpen(false)}
                                                        className="block px-4 py-2 hover:bg-stone-100"
                                                    >
                                                        My Orders
                                                    </Link>

                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                                                    >
                                                        <div className="flex items-center gap-2">Logout <LogOut size={18} strokeWidth={2.2} /></div>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            ) : (
                                <motion.div {...buttonMotion}>
                                    <Link
                                        href="/login"
                                        className="ml-2 px-6 py-2.5 rounded-full bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 shadow-md hover:shadow-lg transition-all duration-300"
                                    >
                                        Sign in
                                    </Link>
                                </motion.div>
                            )}
                        </div>

                        {/* Mobile: just a notification/placeholder slot — nav now lives in the bottom tab bar */}
                        <div className="flex md:hidden items-center">
                            {/* Intentionally minimal: search takes priority, cart + nav live in the bottom bar */}
                        </div>
                    </div>
                </div>
            </header>

            {/* Bottom tab bar — mobile only */}
            <nav
                aria-label="Primary"
                className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-stone-200 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]"
            >
                <div className="grid grid-cols-5">
                    {tabLinks.map((link) => {
                        const active = isActive(link.href);
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex flex-col items-center justify-center gap-1 py-2.5"
                            >
                                <Icon
                                    size={21}
                                    strokeWidth={active ? 2.4 : 2}
                                    className={active ? 'text-teal-700' : 'text-stone-400'}
                                />
                                <span className={`text-[10px] leading-none ${active ? 'text-teal-700 font-semibold' : 'text-stone-500 font-medium'}`}>
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}

                    {/* Cart tab */}
                    <Link
                        href="/cart"
                        className="flex flex-col items-center justify-center gap-1 py-2.5"
                    >
                        <div className="relative">
                            <ShoppingCart
                                size={21}
                                strokeWidth={isActive('/cart') ? 2.4 : 2}
                                className={isActive('/cart') ? 'text-teal-700' : 'text-stone-400'}
                            />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-teal-700 px-1 text-[9px] font-bold text-white border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className={`text-[10px] leading-none ${isActive('/cart') ? 'text-teal-700 font-semibold' : 'text-stone-500 font-medium'}`}>
                            Cart
                        </span>
                    </Link>

                    {/* Profile / Sign in tab */}
                    {user ? (
                        <Link
                            href="/profile"
                            className="flex flex-col items-center justify-center gap-1 py-2.5"
                        >
                            <User
                                size={21}
                                strokeWidth={isActive('/profile') ? 2.4 : 2}
                                className={isActive('/profile') ? 'text-teal-700' : 'text-stone-400'}
                            />
                            <span className={`text-[10px] leading-none ${isActive('/profile') ? 'text-teal-700 font-semibold' : 'text-stone-500 font-medium'}`}>
                                Profile
                            </span>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="flex flex-col items-center justify-center gap-1 py-2.5"
                        >
                            <LogIn
                                size={21}
                                strokeWidth={isActive('/login') ? 2.4 : 2}
                                className={isActive('/login') ? 'text-teal-700' : 'text-stone-400'}
                            />
                            <span className={`text-[10px] leading-none ${isActive('/login') ? 'text-teal-700 font-semibold' : 'text-stone-500 font-medium'}`}>
                                Sign in
                            </span>
                        </Link>
                    )}
                </div>
            </nav>
        </>
    );
}
