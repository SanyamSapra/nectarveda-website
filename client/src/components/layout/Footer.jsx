'use client'

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const InstagramIcon = ({ size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const FacebookIcon = ({ size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const TwitterIcon = ({ size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
);

const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/cart', label: 'Cart' },
    { href: '/profile', label: 'Profile' },
];

const socialLinks = [
    { href: 'https://instagram.com', label: 'Instagram', icon: InstagramIcon },
    { href: 'https://facebook.com', label: 'Facebook', icon: FacebookIcon },
    { href: 'https://twitter.com', label: 'Twitter', icon: TwitterIcon },
];

export default function Footer() {
    const [categories, setCategories] = useState([]);
    const [loadingCats, setLoadingCats] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
                const data = await res.json();
                setCategories((data.categories ?? []).slice(0, 5));
            } catch {
                setCategories([]);
            } finally {
                setLoadingCats(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <footer className="bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">

                {/* Top Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-x-8 gap-y-10">

                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="inline-flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
                                <Image
                                    src="/logo.png"
                                    width={36}
                                    height={36}
                                    alt="NectarVeda Logo"
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-white">
                                NECTARVEDA
                            </span>
                        </Link>

                        <p className="mt-4 text-slate-400 leading-7 max-w-sm">
                            Premium Ayurvedic products crafted with nature&apos;s finest ingredients
                            for your wellness journey.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-5">
                            Quick links
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-400 hover:text-teal-300 transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    {(loadingCats || categories.length > 0) && (
                        <div>
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-5">
                                Categories
                            </h3>
                            <ul className="space-y-3">
                                {loadingCats ? (
                                    // Skeleton loader
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <li key={i}>
                                            <div className="h-3 bg-slate-700 rounded animate-pulse w-3/4" />
                                        </li>
                                    ))
                                ) : (
                                    categories.map((cat) => (
                                        <li key={cat._id}>
                                            <Link
                                                href={`/products?category=${cat._id}`}
                                                className="text-slate-400 hover:text-teal-300 transition-colors text-sm"
                                            >
                                                {cat.name}
                                            </Link>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-5">
                            Contact us
                        </h3>
                        <div className="space-y-3.5">
                            <a
                                href="mailto:support@nectarveda.com"
                                className="flex items-start gap-3 text-slate-400 hover:text-teal-300 transition-colors text-sm group"
                            >
                                <Mail size={16} className="mt-0.5 text-teal-400 group-hover:text-teal-300 transition-colors shrink-0" />
                                <span className="break-all">support@nectarveda.com</span>
                            </a>

                            <a
                                href="tel:+919876543210"
                                className="flex items-start gap-3 text-slate-400 hover:text-teal-300 transition-colors text-sm group"
                            >
                                <Phone size={16} className="mt-0.5 text-teal-400 group-hover:text-teal-300 transition-colors shrink-0" />
                                <span>+91 98765 43210</span>
                            </a>

                            <div className="flex items-start gap-3 text-slate-400 text-sm">
                                <MapPin size={16} className="mt-0.5 text-teal-400 shrink-0" />
                                <span>Dehradun, Uttarakhand</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 mt-12 pt-7 flex flex-col-reverse sm:flex-row items-center justify-between gap-5">
                    <p className="text-slate-500 text-sm text-center sm:text-left">
                        © 2026 NectarVeda. All rights reserved.
                    </p>

                    <div className="flex gap-2">
                        {socialLinks.map(({ href, label, icon: Icon }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Visit our ${label} page`}
                                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-teal-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                            >
                                <Icon size={16} />
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </footer>
    );
}