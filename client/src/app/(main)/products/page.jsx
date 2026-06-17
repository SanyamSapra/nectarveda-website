'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/services/product.service';
import { getCategories } from '@/services/category.service';
import Link from 'next/link';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    getProducts(),
                    getCategories()
                ]);
                setProducts(productsData.products);
                setCategories(categoriesData.categories);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category?._id === selectedCategory);

    if (loading) return (
        <div className="pt-24 text-center text-stone-400">Loading products...</div>
    );

    return (<main className="min-h-screen bg-slate-50 pt-28 pb-20">

        <div className="max-w-7xl mx-auto px-6">

            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                    Our Products
                </h1>

                <p className="mt-3 text-slate-500 text-lg">
                    Discover natural Ayurvedic solutions for your wellness journey.
                </p>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 mb-12">

                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === 'all'
                        ? 'bg-teal-700 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-700'
                        }`}
                >
                    All Products
                </button>

                {categories.map((cat) => (
                    <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat._id)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === cat._id
                            ? 'bg-teal-700 text-white shadow-md'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-700'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}

            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

                {filteredProducts.map((product) => (
                    <Link
                        key={product._id}
                        href={`/products/${product._id}`}
                        className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >

                        {/* Product Image */}
                        <div className="bg-slate-100 h-64 overflow-hidden">

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

                        {/* Product Content */}
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

                                <span className="text-sm text-teal-700 font-medium group-hover:translate-x-1 transition-transform">
                                    View →
                                </span>

                            </div>

                        </div>

                    </Link>
                ))}

            </div>

        </div>

    </main>


    );

}