'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '@/services/product.service';
import Link from 'next/link';

export default function HomePage() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data.products.slice(0, 4));
            } catch (error) {
                console.error(error);
            }
        };
        fetchProducts();
    }, []);

    return (<main className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-emerald-50">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">

                <span className="inline-flex items-center bg-teal-100 text-teal-700 px-5 py-2 rounded-full text-sm font-medium mb-8">
                    🌿 100% Natural Ayurvedic Products
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                    Pure Ayurveda for
                    <span className="block text-teal-700">
                        Better Living
                    </span>
                </h1>

                <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-8">
                    Discover trusted Ayurvedic remedies crafted with natural ingredients
                    to support your health, wellness, and everyday lifestyle.
                </p>

                <div className="mt-10 flex justify-center">
                    <Link
                        href="/products"
                        className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-4 rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        Explore Products
                    </Link>
                </div>

            </div>

        </section>

        {/* Featured Products */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

            <div className="flex items-center justify-between mb-10">

                <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                        Featured Products
                    </h2>

                    <p className="text-slate-500 mt-2">
                        Handpicked Ayurvedic products loved by our customers.
                    </p>
                </div>

                <Link
                    href="/products"
                    className="hidden sm:block text-teal-700 font-semibold hover:text-teal-800"
                >
                    View All →
                </Link>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                {products.map((product) => (
                    <Link
                        href={`/products/${product._id}`}
                        key={product._id}
                        className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >

                        <div className="bg-slate-100 h-56 overflow-hidden">

                            {product.images?.[0] ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    No Image
                                </div>
                            )}

                        </div>

                        <div className="p-5">

                            <h3 className="font-semibold text-slate-900 text-lg line-clamp-1">
                                {product.name}
                            </h3>

                            <p className="text-slate-500 text-sm mt-2 line-clamp-2">
                                {product.description}
                            </p>

                            <div className="mt-4 flex items-center justify-between">

                                <span className="text-2xl font-bold text-teal-700">
                                    ₹{product.price}
                                </span>

                                <span className="text-teal-700 font-medium text-sm group-hover:translate-x-1 transition-transform">
                                    View →
                                </span>

                            </div>

                        </div>

                    </Link>
                ))}

            </div>

            <div className="mt-10 text-center sm:hidden">
                <Link
                    href="/products"
                    className="text-teal-700 font-semibold"
                >
                    View All Products →
                </Link>
            </div>

        </section>

    </main>

)

}