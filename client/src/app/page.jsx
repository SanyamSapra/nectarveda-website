'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '@/services/product.service';
import Link from 'next/link';
import { Leaf, ArrowRight, ImageOff, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { buttonMotion, cardHover, fadeIn, fadeUp, staggerContainer, staggerItem } from '@/lib/animations';

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const data = await getProducts();
                setProducts((data.products ?? []).slice(0, 4));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-emerald-50">
                <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center" {...fadeUp}>

                    <motion.span className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-800 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-7" {...fadeIn}>
                        <Leaf size={13} strokeWidth={2.5} />
                        100% natural Ayurvedic products
                    </motion.span>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                        Pure Ayurveda for
                        <span className="block text-teal-700">
                            better living
                        </span>
                    </h1>

                    <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-7 sm:leading-8">
                        Discover trusted Ayurvedic remedies crafted with natural ingredients
                        to support your health, wellness, and everyday lifestyle.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <motion.div {...buttonMotion} className="w-full sm:w-auto">
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-7 py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto justify-center"
                            >
                                Explore products
                                <ArrowRight size={17} />
                            </Link>
                        </motion.div>
                    </div>

                    {/* Trust strip */}
                    {/* <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-slate-500">
                        <span className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-teal-700" />
                            Lab-tested formulas
                        </span>
                        <span className="flex items-center gap-2">
                            <Sparkles size={16} className="text-teal-700" />
                            No synthetic additives
                        </span>
                        <span className="flex items-center gap-2">
                            <Truck size={16} className="text-teal-700" />
                            Free shipping over ₹999
                        </span>
                    </div> */}
                </motion.div>
            </section>

            {/* Featured Products */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">

                <div className="flex items-end justify-between gap-4 mb-8 sm:mb-10 pb-5 border-b border-slate-200">
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-teal-700 uppercase mb-1.5">
                            <Sparkles size={13} strokeWidth={2.5} />
                            Customer favorites
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            Featured products
                        </h2>
                    </div>

                    <Link
                        href="/products"
                        className="hidden sm:flex items-center gap-1 text-teal-700 font-medium text-sm hover:text-teal-800 transition-colors shrink-0"
                    >
                        View all
                        <ArrowRight size={15} />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <div className="aspect-square bg-slate-100 animate-pulse" />
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                                    <div className="h-3 bg-slate-100 rounded animate-pulse w-full" />
                                    <div className="h-6 bg-slate-100 rounded animate-pulse w-1/3 mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                        <p className="text-slate-500">
                            No featured products available right now — check back soon.
                        </p>
                        <Link
                            href="/products"
                            className="inline-block mt-4 text-teal-700 font-medium hover:text-teal-800 transition-colors"
                        >
                            Browse all products
                        </Link>
                    </div>
                ) : (
                    <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" variants={staggerContainer} initial="initial" animate="animate">
                        {products.map((product) => {
                            const hasDiscount = product.salePrice && product.salePrice < product.price;
                            const displayPrice = product.salePrice || product.price;

                            return (
                                <motion.div
                                    key={product._id}
                                    variants={staggerItem}
                                    whileHover={cardHover}
                                    className="h-full"
                                >
                                <Link
                                    href={`/products/${product._id}`}
                                    className="group isolate block h-full bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-200/80 hover:shadow-lg hover:ring-teal-200 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                                >
                                    <div className="relative bg-slate-100 aspect-square overflow-hidden">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                loading="lazy"
                                                className="block h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-300">
                                                <ImageOff size={26} />
                                                <span className="text-xs text-slate-400">No image</span>
                                            </div>
                                        )}

                                        {hasDiscount && (
                                            <span className="absolute top-3 left-3 bg-teal-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                                Sale
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4 sm:p-5">
                                        <h3 className="font-semibold text-slate-900 leading-snug line-clamp-1">
                                            {product.name}
                                        </h3>

                                        <p className="text-slate-500 text-sm mt-1.5 line-clamp-2 min-h-[2.5rem]">
                                            {product.description}
                                        </p>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xl font-bold text-slate-900 tabular-nums">
                                                    ₹{displayPrice.toLocaleString('en-IN')}
                                                </span>
                                                {hasDiscount && (
                                                    <span className="text-sm text-slate-400 line-through tabular-nums">
                                                        ₹{product.price.toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                            </div>

                                            <span className="text-sm text-teal-700 font-medium flex items-center gap-1 group-hover:gap-1.5 transition-all">
                                                View
                                                <ArrowRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                <div className="mt-10 text-center sm:hidden">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-1 text-teal-700 font-semibold"
                    >
                        View all products
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </main>
    );
}
