'use client';

import { useState, useEffect, use } from 'react';
import { getProductByID } from '@/services/product.service';
import { Plus, Minus, ChevronLeft, ChevronRight, ShoppingCart, Tag, Check, AlertCircle, ImageOff } from 'lucide-react';
import { addToCart } from '@/services/cart.service';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function ProductDetailPage({ params }) {
    const { id } = use(params);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartSuccess, setCartSuccess] = useState(false);
    const [cartError, setCartError] = useState('');
    const [imageError, setImageError] = useState(false);
    const { refreshCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setNotFound(false);
            try {
                const data = await getProductByID(id);
                if (!data?.product) {
                    setNotFound(true);
                } else {
                    setProduct(data.product);
                }
            } catch (error) {
                console.log(error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        setQuantity(1);
        setSelectedImage(0);
        setImageError(false);
    }, [product?._id]);

    const decrease = () => setQuantity(prev => Math.max(1, prev - 1));
    const increase = () => setQuantity(prev => Math.min(product.stock, prev + 1));

    const prevImage = () =>
        setSelectedImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
    const nextImage = () =>
        setSelectedImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1));

    const discountPercent =
        product?.salePrice &&
            product?.price > 0 ? Math.round(((product.price - product.salePrice) / product.price) * 100) : null;

    const handleAddToCart = async () => {
        setAddingToCart(true);
        setCartError('');
        try {
            await addToCart({ product: product._id, quantity });
            await refreshCart();
            setCartSuccess(true);
            setTimeout(() => setCartSuccess(false), 2000);
        } catch (error) {
            setCartError('Failed to add to cart. Please try again.');
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 pt-10 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-8" />
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
                        <div>
                            <div className="bg-slate-200 rounded-2xl animate-pulse aspect-square" />
                            <div className="flex gap-3 mt-4">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-16 h-16 bg-slate-200 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="h-6 w-28 bg-slate-200 rounded-full animate-pulse" />
                            <div className="h-10 w-3/4 bg-slate-200 rounded animate-pulse" />
                            <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
                            <div className="h-24 w-full bg-slate-200 rounded animate-pulse mt-4" />
                            <div className="h-12 w-44 bg-slate-200 rounded-2xl animate-pulse mt-4" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (notFound || !product) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                        <AlertCircle className="text-slate-400" size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Product not found
                    </h2>
                    <p className="text-slate-500 mt-2">
                        This product may have been removed or the link is incorrect.
                    </p>
                    <Link
                        href="/products"
                        className="inline-block mt-6 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                        Back to shop
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-700 transition-colors mb-6"
                >
                    <ChevronLeft size={15} />
                    Back to shop
                </Link>

                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

                    {/* Product Images */}
                    <div>
                        <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm aspect-square">
                            {product.images?.[selectedImage] && !imageError ? (
                                <img
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    onError={() => setImageError(true)}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300 bg-slate-50">
                                    <ImageOff size={32} />
                                    <span className="text-sm text-slate-400">No image available</span>
                                </div>
                            )}

                            {/* Sale badge on image */}
                            {discountPercent && (
                                <div className="absolute top-3 left-3 bg-teal-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                    {discountPercent}% off
                                </div>
                            )}

                            {product.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-slate-200 rounded-full w-9 h-9 flex items-center justify-center shadow-sm transition-all"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-slate-200 rounded-full w-9 h-9 flex items-center justify-center shadow-sm transition-all"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Dot indicators */}
                        {product.images?.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {product.images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`h-2 rounded-full transition-all duration-200 ${selectedImage === index
                                            ? 'w-5 bg-teal-700'
                                            : 'w-2 bg-slate-300'
                                            }`}
                                        aria-label={`Image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Thumbnails */}
                        {product.images?.length > 1 && (
                            <div className="flex gap-3 mt-4 flex-wrap">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 ${selectedImage === index
                                            ? 'border-teal-700'
                                            : 'border-slate-200 hover:border-teal-400'
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">

                        {/* Category */}
                        {product.category?.name && (
                            <div className="mb-3">
                                <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                    <Tag size={12} />
                                    {product.category.name}
                                </span>
                            </div>
                        )}

                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="mt-4 flex items-center gap-3">
                            {product.salePrice ? (
                                <>
                                    <span className="text-3xl font-bold text-slate-900 tabular-nums">
                                        ₹{product.salePrice.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-lg text-slate-400 line-through tabular-nums">
                                        ₹{product.price.toLocaleString('en-IN')}
                                    </span>
                                </>
                            ) : (
                                <span className="text-3xl font-bold text-slate-900 tabular-nums">
                                    ₹{product.price.toLocaleString('en-IN')}
                                </span>
                            )}
                        </div>

                        {/* Stock */}
                        <div className="mt-4 flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${product.stock > 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-600'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {product.stock > 0 ? 'In stock' : 'Out of stock'}
                            </span>
                            {product.stock > 0 && product.stock <= 10 && (
                                <span className="text-xs text-amber-600 font-medium">
                                    Only {product.stock} left
                                </span>
                            )}
                        </div>

                        <hr className="my-6 border-slate-200" />

                        {/* Description */}
                        <div>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                                Description
                            </h3>
                            <p className="text-slate-600 leading-7">
                                {product.description}
                            </p>
                        </div>

                        <hr className="my-6 border-slate-200" />

                        {/* Quantity */}
                        <div className="flex items-center gap-4">
                            <span className="text-slate-600 text-sm font-medium">Quantity</span>
                            <div className={`flex items-center border border-slate-200 rounded-xl overflow-hidden ${product.stock === 0 ? 'opacity-50' : ''}`}>
                                <button
                                    disabled={product.stock === 0 || quantity <= 1}
                                    onClick={decrease}
                                    aria-label="Decrease quantity"
                                    className="px-3.5 py-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 transition-colors disabled:cursor-not-allowed disabled:hover:bg-slate-50 disabled:hover:text-inherit"
                                >
                                    <Minus size={15} />
                                </button>
                                <span className="px-5 py-2 text-slate-900 font-semibold min-w-[3rem] text-center tabular-nums">
                                    {quantity}
                                </span>
                                <button
                                    disabled={product.stock === 0 || quantity >= product.stock}
                                    onClick={increase}
                                    aria-label="Increase quantity"
                                    className="px-3.5 py-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 transition-colors disabled:cursor-not-allowed disabled:hover:bg-slate-50 disabled:hover:text-inherit"
                                >
                                    <Plus size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <div className="mt-8 flex flex-col gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || addingToCart}
                                className={`flex items-center justify-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 w-full sm:w-fit ${cartSuccess
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white'
                                    }`}
                            >
                                {cartSuccess ? (
                                    <>
                                        <Check size={18} />
                                        Added to cart
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={18} />
                                        {addingToCart ? 'Adding...' : 'Add to cart'}
                                    </>
                                )}
                            </button>

                            {cartError && (
                                <p className="flex items-center gap-1.5 text-sm text-red-600">
                                    <AlertCircle size={14} />
                                    {cartError}
                                </p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}