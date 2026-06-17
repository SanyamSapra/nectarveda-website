import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (<footer className="bg-slate-900 text-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

            {/* Top Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                {/* Brand */}
                <div>
                    <h2 className="text-3xl font-bold text-teal-400">
                        NectarVeda
                    </h2>

                    <p className="mt-4 text-slate-400 leading-7">
                        Premium Ayurvedic products crafted with nature's finest ingredients
                        for your wellness journey.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold mb-5">
                        Quick Links
                    </h3>

                    <ul className="space-y-3">

                        <li>
                            <Link
                                href="/"
                                className="text-slate-400 hover:text-teal-400 transition"
                            >
                                Home
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/products"
                                className="text-slate-400 hover:text-teal-400 transition"
                            >
                                Products
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/cart"
                                className="text-slate-400 hover:text-teal-400 transition"
                            >
                                Cart
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/profile"
                                className="text-slate-400 hover:text-teal-400 transition"
                            >
                                Profile
                            </Link>
                        </li>

                    </ul>
                </div>

                {/* Categories */}
                <div>
                    <h3 className="text-lg font-semibold mb-5">
                        Categories
                    </h3>

                    <ul className="space-y-3">

                        <li className="text-slate-400">
                            Hair Care
                        </li>

                        <li className="text-slate-400">
                            Skin Care
                        </li>

                        <li className="text-slate-400">
                            Health & Wellness
                        </li>

                        <li className="text-slate-400">
                            Herbal Supplements
                        </li>

                    </ul>
                </div>

                {/* Contact */}
                <div>

                    <h3 className="text-lg font-semibold mb-5">
                        Contact Us
                    </h3>

                    <div className="space-y-4">

                        <div className="flex items-start gap-3 text-slate-400">
                            <Mail size={18} className="mt-1 text-teal-400" />
                            <span>support@nectarveda.com</span>
                        </div>

                        <div className="flex items-start gap-3 text-slate-400">
                            <Phone size={18} className="mt-1 text-teal-400" />
                            <span>+91 98765 43210</span>
                        </div>

                        <div className="flex items-start gap-3 text-slate-400">
                            <MapPin size={18} className="mt-1 text-teal-400" />
                            <span>Dehradun, Uttarakhand</span>
                        </div>

                    </div>

                </div>

            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">

                <div className="flex gap-6">

                    <a
                        href="#"
                        className="text-slate-400 hover:text-teal-400 transition"
                    >
                        Instagram
                    </a>

                    <a
                        href="#"
                        className="text-slate-400 hover:text-teal-400 transition"
                    >
                        Facebook
                    </a>

                    <a
                        href="#"
                        className="text-slate-400 hover:text-teal-400 transition"
                    >
                        Twitter
                    </a>

                </div>

                <p className="text-slate-500 text-sm">
                    © 2026 NectarVeda. All rights reserved.
                </p>

            </div>

        </div>

    </footer>
    );

}
