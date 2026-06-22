'use client'

import { getOrderById } from "@/services/order.service"
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MapPin, Package, ImageOff, AlertCircle, ArrowRight, ShoppingBag } from "lucide-react";

const STATUS_MAP = {
    pending: { label: 'Order placed', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    processing: { label: 'Processing', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    shipped: { label: 'Shipped', color: 'bg-violet-50 text-violet-700 border-violet-200' },
    delivered: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-200' },
};

export default function OrderConfirmationPage({ params }) {
    const { id } = use(params);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [imageErrors, setImageErrors] = useState({});

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await getOrderById(id);
                if (!data?.order) { setLoadError(true); return; }
                setOrder(data.order);
            } catch (err) {
                console.log(err);
                setLoadError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 pt-10 pb-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
                    {/* Success header skeleton */}
                    <div className="flex flex-col items-center gap-3 py-8">
                        <div className="w-20 h-20 rounded-full bg-slate-200 animate-pulse" />
                        <div className="h-7 w-52 bg-slate-200 rounded-lg animate-pulse" />
                        <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
                    </div>
                    {[0, 1, 2].map(i => (
                        <div key={i} className="h-36 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                    ))}
                </div>
            </main>
        );
    }   

    if (loadError || !order) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
                        <AlertCircle className="text-red-500" size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Order not found</h2>
                    <p className="text-slate-500 mt-2">We couldn't find this order. It may have been removed or the link is incorrect.</p>
                    <Link
                        href="/orders"
                        className="inline-block mt-6 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                        View all orders
                    </Link>
                </div>
            </main>
        );
    }

    const orderId = order._id?.length >= 8 ? order._id.slice(-8).toUpperCase() : order._id?.toUpperCase() ?? '—';
    const status = STATUS_MAP[order.orderStatus] ?? { label: order.orderStatus, color: 'bg-slate-100 text-slate-600 border-slate-200' };
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

    return (
        <main className="min-h-screen bg-slate-50 pt-10 pb-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">

                {/* Success hero */}
                <div className="text-center mb-8">
                    <div className="relative w-20 h-20 mx-auto mb-5">
                        {/* Outer glow ring */}
                        <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <CheckCircle2 size={36} className="text-white" strokeWidth={2} />
                        </div>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Order confirmed!
                    </h1>
                    <p className="text-slate-500 mt-1.5">
                        Thank you for your purchase. We'll get it to you soon.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                        <span className="bg-slate-100 text-slate-600 text-sm font-medium px-3 py-1 rounded-full tabular-nums">
                            #{orderId}
                        </span>
                        {orderDate && (
                            <span className="text-slate-400 text-sm">{orderDate}</span>
                        )}
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                </div>

                {/* Delivering to */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                        <MapPin size={14} className="text-teal-700" />
                        Delivering to
                    </h2>
                    <p className="text-slate-900 font-medium">{order.shippingAddress.street}</p>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                    </p>
                    <p className="text-slate-500 text-sm mt-0.5">
                        +91 {order.shippingAddress.phone}
                    </p>
                </div>

                {/* Items ordered */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                        <Package size={14} className="text-teal-700" />
                        Items ordered
                    </h2>

                    <div className="space-y-4">
                        {order.items.map((item) => {
                            const hasImageError = !!imageErrors[item.product._id];
                            return (
                                <div key={item.product._id} className="flex items-center gap-4">
                                    {!hasImageError && item.product.images?.[0] ? (
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            onError={() => setImageErrors(prev => ({ ...prev, [item.product._id]: true }))}
                                            className="w-14 h-14 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
                                            <ImageOff size={16} className="text-slate-300" />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-900 font-medium line-clamp-1">{item.product.name}</p>
                                        <p className="text-slate-400 text-sm mt-0.5">Qty {item.quantity}</p>
                                    </div>

                                    <p className="font-semibold text-slate-900 tabular-nums shrink-0">
                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Payment & Total */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-8">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                        <ShoppingBag size={14} className="text-teal-700" />
                        Payment details
                    </h2>

                    <div className="space-y-2.5">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Shipping</span>
                            <span className="text-teal-700 font-medium">Free</span>
                        </div>
                        <div className="border-t border-slate-100 pt-2.5 flex justify-between items-baseline">
                            <span className="font-semibold text-slate-900">Total paid</span>
                            <span className="font-bold text-xl text-slate-900 tabular-nums">
                                ₹{order.totalAmount?.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                        <span className="text-slate-500 text-sm">Payment method</span>
                        <span className="ml-auto text-sm font-semibold text-slate-800">Cash on delivery</span>
                    </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/products"
                        className="flex-1 flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white py-3.5 rounded-xl font-semibold shadow-sm hover:shadow transition-all"
                    >
                        Continue shopping
                        <ArrowRight size={17} />
                    </Link>
                    <Link
                        href="/orders"
                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 py-3.5 rounded-xl font-semibold transition-all"
                    >
                        View all orders
                    </Link>
                </div>

            </div>
        </main>
    );
}