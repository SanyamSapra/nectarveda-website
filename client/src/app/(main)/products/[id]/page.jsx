'use client';

import { useState, useEffect, use } from 'react';
import { getProductByID } from '@/services/product.service';

export default function ProductDetailPage({ params }) {
    const { id } = use(params);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);

    // useEffect mein kya likhoge?
    // hint: login page jaisa hi tha useEffect
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProductByID(id);
                setProduct(data.product);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <div className="pt-24 text-center">Loading...</div>
    if (!product) return <div className="pt-24 text-center">Product not found</div>

    return (<main className="min-h-screen bg-slate-50 pt-28 pb-20">

        ```
        <div className="max-w-7xl mx-auto px-6">

            <div className="grid lg:grid-cols-2 gap-16">

                {/* Product Images */}
                <div>

                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <img
                            src={product.images?.[selectedImage]}
                            alt={product.name}
                            className="w-full aspect-square object-cover"
                        />
                    </div>

                    {product.images?.length > 1 && (
                        <div className="flex gap-4 mt-5 flex-wrap">
                            {product.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`${product.name}-${index}`}
                                    onClick={() => setSelectedImage(index)}
                                    className={`w-24 h-24 object-cover rounded-2xl cursor-pointer border-2 transition-all duration-200 ${selectedImage === index
                                            ? 'border-teal-700'
                                            : 'border-slate-200 hover:border-teal-400'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                </div>

                {/* Product Details */}
                <div className="flex flex-col">

                    {/* Category */}
                    <div className="mb-4">
                        <span className="inline-flex items-center bg-teal-50 text-teal-700 border border-teal-200 px-4 py-2 rounded-full text-sm font-medium">
                            {product.category?.name}
                        </span>
                    </div>

                    {/* Product Name */}
                    <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div className="mt-6 flex items-center gap-4">

                        {product.salePrice ? (
                            <>
                                <span className="text-4xl font-bold text-teal-700">
                                    ₹{product.salePrice}
                                </span>

                                <span className="text-xl text-slate-400 line-through">
                                    ₹{product.price}
                                </span>
                            </>
                        ) : (
                            <span className="text-4xl font-bold text-teal-700">
                                ₹{product.price}
                            </span>
                        )}

                    </div>

                    {/* Stock */}
                    <div className="mt-5">
                        <span
                            className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${product.stock > 0
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-red-50 text-red-600'
                                }`}
                        >
                            {product.stock > 0
                                ? '✓ In Stock'
                                : '✕ Out of Stock'}
                        </span>
                    </div>

                    {/* Description */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">
                            Description
                        </h3>

                        <p className="text-slate-600 leading-8">
                            {product.description}
                        </p>
                    </div>

                    {/* Add To Cart */}
                    <div className="mt-10">
                        <button
                            disabled={product.stock === 0}
                            className="bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-10 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            Add to Cart
                        </button>
                    </div>

                </div>

            </div>

        </div>

    </main>

    )

}