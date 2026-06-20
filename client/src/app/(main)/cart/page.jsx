'use client'

import { useState } from "react"
import { removeFromCart, updateCart } from "@/services/cart.service"
import { Plus, Minus, Trash2, ShoppingBag, ImageOff, Loader2 } from "lucide-react"
import Link from "next/link";
import { useCart } from '@/context/CartContext';

export default function CartPage() {
    const { cart, setCart, loading } = useCart();
    const [pendingItems, setPendingItems] = useState({});
    const [imageErrors, setImageErrors] = useState({});

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-teal-700" size={28} />
                    <p className="text-slate-500">
                        Loading your cart...
                    </p>
                </div>
            </div>
        )
    }

    if (!cart?.items?.length) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-5">
                        <ShoppingBag className="text-teal-700" size={28} />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        Your cart is empty
                    </h2>

                    <p className="text-slate-500 mt-2">
                        Looks like you haven't added any products yet.
                    </p>

                    <Link
                        href="/products"
                        className="inline-block mt-6 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                        Continue shopping
                    </Link>
                </div>
            </div>
        )
    }

    const subTotal = cart.items.reduce((sum, item) => {
        const price = item.product.salePrice || item.product.price;
        return sum + price * item.quantity;
    }, 0)

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    const setItemPending = (productId, value) => {
        setPendingItems((prev) => ({ ...prev, [productId]: value }));
    };

    const handleUpdateQuantity = async (productID, newQuantity) => {
        if (newQuantity < 1 || pendingItems[productID]) return;

        setItemPending(productID, true);
        try {
            const data = await updateCart(productID, {
                quantity: newQuantity,
            });
            setCart(data.cart);
        } catch (error) {
            console.error(error);
        } finally {
            setItemPending(productID, false);
        }
    };

    const handleRemove = async (productId) => {
        if (pendingItems[productId]) return;

        setItemPending(productId, true);
        try {
            const data = await removeFromCart(productId);
            setCart(data.cart);
        } catch (error) {
            console.error(error);
            setItemPending(productId, false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8 flex items-end justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-teal-700 uppercase mb-1.5">
                            <ShoppingBag size={13} strokeWidth={2.5} />
                            Checkout
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                            Your cart
                        </h1>
                    </div>
                    <p className="text-slate-500 text-sm pb-1">
                        {totalItems} {totalItems === 1 ? "item" : "items"}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left - Cart Items */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        {cart.items.map((item) => {
                            const isPending = !!pendingItems[item.product._id];
                            const hasImageError = !!imageErrors[item.product._id];
                            const price = item.product.salePrice || item.product.price;
                            const lineTotal = price * item.quantity;

                            return (
                                <div
                                    key={item.product._id}
                                    className={`flex flex-col sm:flex-row gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${isPending ? "opacity-60" : ""}`}
                                >
                                    <div className="flex gap-4 sm:contents">
                                        {!hasImageError && item.product.images?.[0] ? (
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                onError={() =>
                                                    setImageErrors((prev) => ({ ...prev, [item.product._id]: true }))
                                                }
                                                className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 object-cover rounded-xl border border-slate-100 bg-slate-50"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center">
                                                <ImageOff className="text-slate-300" size={22} />
                                            </div>
                                        )}

                                        {/* Mobile-only: remove button beside image */}
                                        <button
                                            onClick={() => handleRemove(item.product._id)}
                                            disabled={isPending}
                                            aria-label={`Remove ${item.product.name} from cart`}
                                            className="sm:hidden ml-auto self-start p-2 -mt-1 -mr-1 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-semibold text-slate-900 leading-snug pr-2">
                                                {item.product.name}
                                            </h3>

                                            {/* Desktop-only: remove button top-right */}
                                            <button
                                                onClick={() => handleRemove(item.product._id)}
                                                disabled={isPending}
                                                aria-label={`Remove ${item.product.name} from cart`}
                                                className="hidden sm:inline-flex shrink-0 p-2 -mt-1 -mr-1 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="flex items-end justify-between gap-3 mt-3">
                                            <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1">
                                                <button
                                                    disabled={item.quantity <= 1 || isPending}
                                                    onClick={() =>
                                                        handleUpdateQuantity(item.product._id, item.quantity - 1)
                                                    }
                                                    aria-label="Decrease quantity"
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                                                >
                                                    <Minus size={14} />
                                                </button>

                                                <span className="w-7 text-center text-sm font-medium tabular-nums">
                                                    {isPending ? (
                                                        <Loader2 className="animate-spin mx-auto text-slate-400" size={14} />
                                                    ) : (
                                                        item.quantity
                                                    )}
                                                </span>

                                                <button
                                                    disabled={item.quantity >= item.product.stock || isPending}
                                                    onClick={() =>
                                                        handleUpdateQuantity(item.product._id, item.quantity + 1)
                                                    }
                                                    aria-label="Increase quantity"
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-semibold text-slate-900 tabular-nums">
                                                    ₹{lineTotal.toLocaleString("en-IN")}
                                                </p>
                                                {item.quantity > 1 && (
                                                    <p className="text-xs text-slate-400 tabular-nums">
                                                        ₹{price.toLocaleString("en-IN")} each
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right - Order Summary */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit lg:sticky lg:top-24">

                        <h2 className="text-lg font-bold text-slate-900 mb-5">
                            Order summary
                        </h2>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                                <span className="tabular-nums">₹{subTotal.toLocaleString("en-IN")}</span>
                            </div>

                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Shipping</span>
                                <span className="text-teal-700 font-medium">Free</span>
                            </div>

                            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                                <span className="font-semibold text-slate-900">Total</span>
                                <span className="font-bold text-xl text-slate-900 tabular-nums">
                                    ₹{subTotal.toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => {/* TODO: wire up checkout navigation */}}
                            className="w-full mt-6 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow transition-all"
                        >
                            Proceed to checkout
                        </button>

                        <Link
                            href="/products"
                            className="block text-center mt-3 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Continue shopping
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}