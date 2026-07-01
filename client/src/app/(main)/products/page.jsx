'use client';

import { Suspense, useEffect, useState } from 'react';
import { getProducts } from '@/services/product.service';
import { getCategories } from '@/services/category.service';
import Link from 'next/link';
import { Leaf, ImageOff, AlertCircle, SearchX } from 'lucide-react';
import { motion } from 'motion/react';
import { buttonMotion, cardHover, fadeUp, staggerContainer, staggerItem } from '@/lib/animations';
import { notify } from '@/lib/feedback';
import { useRouter, useSearchParams } from 'next/navigation'

function ProductsPageContent() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter()
    const searchParams = useSearchParams()
    const searchFromURL = searchParams.get('search') || ''

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [productsData, categoriesData] = await Promise.all([
                    getProducts('', '', { featured: true }),
                    getCategories()
                ]);
                setProducts(productsData.products ?? []);
                setCategories(categoriesData.categories ?? []);
            } catch (err) {
                console.error(err);
                setError('We couldn\'t load the products right now.');
                notify.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const searchTerm = searchFromURL.trim().toLowerCase()
    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.category?._id === selectedCategory
        if (!matchesCategory) return false

        if (!searchTerm) return true

        const searchableText = [
            product.name,
            product.description,
            product.category?.name,
            product.sku,
            ...(product.ingredients || []),
            ...(product.benefits || []),
            ...(product.conditions || []),
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

        return searchableText.includes(searchTerm)
    });

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 pt-10 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="mb-8 pb-5 border-b border-slate-200">
                        <div className="h-3 w-20 bg-slate-200 rounded-full animate-pulse mb-3" />
                        <div className="h-9 w-56 bg-slate-200 rounded-lg animate-pulse" />
                    </div>
                    <div className="-mx-4 mb-10 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:mb-12 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
                        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap sm:gap-3">
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="h-10 w-28 shrink-0 bg-white border border-slate-200 rounded-full animate-pulse" />
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <div className="aspect-square bg-slate-100 animate-pulse" />
                                <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                                    <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                                    <div className="h-3 bg-slate-100 rounded animate-pulse w-full" />
                                    <div className="h-6 bg-slate-100 rounded animate-pulse w-1/3 mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
                        <AlertCircle className="text-red-500" size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Something went wrong
                    </h2>
                    <p className="text-slate-500 mt-2">
                        {error}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-block mt-6 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pt-10 pb-20">
            <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" {...fadeUp}>

                {/* Header */}
                <div className="mb-8 pb-5 border-b border-slate-200">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-teal-700 uppercase mb-1.5">
                        <Leaf size={13} strokeWidth={2.5} />
                        Shop the range
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                        Our products
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-slate-500">
                        Featured Ayurvedic solutions for your wellness journey.
                    </p>
                </div>

                {/* Category Filters */}
                <div className="-mx-4 mb-8 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:mb-10 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
                    <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap sm:gap-3">
                        <motion.button
                            onClick={() => setSelectedCategory('all')}
                            className={`shrink-0 whitespace-nowrap px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${selectedCategory === 'all'
                                ? 'bg-teal-700 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-700'
                                }`}
                            {...buttonMotion}
                        >
                            Featured products
                        </motion.button>

                        {categories.map((cat) => (
                            <motion.button
                                key={cat._id}
                                onClick={() => setSelectedCategory(cat._id)}
                                className={`shrink-0 whitespace-nowrap px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${selectedCategory === cat._id
                                    ? 'bg-teal-700 text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-700'
                                    }`}
                                {...buttonMotion}
                            >
                                {cat.name}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Empty state */}
                {filteredProducts.length === 0 ? (
                    <motion.div className="text-center py-20" {...fadeUp}>
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                            <SearchX className="text-slate-400" size={28} />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">
                            {searchFromURL ? `No featured products matching "${searchFromURL}"` : 'No featured products here yet'}
                        </h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                            {searchFromURL
                                ? 'Try a different product name, category, ingredient, or benefit.'
                                : 'Try a different category or check back soon.'}
                        </p>
                        {(selectedCategory !== 'all' || searchFromURL) && (
                            <motion.button
                                onClick={() => {
                                    setSelectedCategory('all')
                                    if (searchFromURL) router.push('/products')
                                }}
                                className="inline-block mt-5 text-teal-700 font-medium hover:text-teal-800 transition-colors"
                                {...buttonMotion}
                            >
                                View all products
                            </motion.button>
                        )}
                    </motion.div>
                ) : (
                    /* Products Grid */
                    <motion.div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8" variants={staggerContainer} initial="initial" animate="animate">
                        {filteredProducts.map((product) => {
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
                                        {/* Product Image */}
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
                                                    <ImageOff size={28} />
                                                    <span className="text-xs text-slate-400">No image</span>
                                                </div>
                                            )}

                                            {hasDiscount && (
                                                <span className="absolute top-3 left-3 bg-teal-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                                    Sale
                                                </span>
                                            )}

                                            {product.stock === 0 && (
                                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                                    <span className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                                        Out of stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Content */}
                                        <div className="p-3 sm:p-5">
                                            <h3 className="font-semibold text-slate-900 leading-snug line-clamp-1 text-sm sm:text-base">
                                                {product.name}
                                            </h3>

                                            <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-1.5 line-clamp-2 min-h-8 sm:min-h-10">
                                                {product.description}
                                            </p>

                                            <div className="mt-2.5 sm:mt-4 flex items-center justify-between">
                                                <div className="flex items-baseline gap-1.5 sm:gap-2">
                                                    <span className="text-base sm:text-xl font-bold text-slate-900 tabular-nums">
                                                        ₹{displayPrice.toLocaleString('en-IN')}
                                                    </span>
                                                    {hasDiscount && (
                                                        <span className="text-xs sm:text-sm text-slate-400 line-through tabular-nums">
                                                            ₹{product.price.toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>

                                                <span className="text-xs sm:text-sm text-teal-700 font-medium flex items-center gap-1 group-hover:gap-1.5 transition-all">
                                                    View
                                                    <span className="group-hover:translate-x-0.5 transition-transform hidden sm:inline">→</span>
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </motion.div>
        </main>
    );
}
export default function ProductsPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-slate-50 pt-10 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="h-9 w-56 bg-slate-200 rounded-lg animate-pulse" />
                </div>
            </main>
        }>
            <ProductsPageContent />
        </Suspense>
    )
}
