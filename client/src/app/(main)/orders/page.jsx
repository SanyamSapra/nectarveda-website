'use client'

import { getMyOrders } from "@/services/order.service";
import { useEffect, useState } from "react"
import Link from "next/link";
import { Package, AlertCircle, ShoppingBag, ChevronRight, ImageOff } from "lucide-react";
import { motion } from "motion/react";
import { buttonMotion, fadeUp, staggerContainer, staggerItem, cardHover } from "@/lib/animations";
import { notify } from "@/lib/feedback";

const STATUS_MAP = {
    pending:    { label: 'Order placed',   color: 'bg-amber-50 text-amber-700 border-amber-200' },
    confirmed:  { label: 'Confirmed',      color: 'bg-blue-50 text-blue-700 border-blue-200' },
    processing: { label: 'Processing',     color: 'bg-blue-50 text-blue-700 border-blue-200' },
    shipped:    { label: 'Shipped',        color: 'bg-violet-50 text-violet-700 border-violet-200' },
    delivered:  { label: 'Delivered',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled:  { label: 'Cancelled',      color: 'bg-red-50 text-red-600 border-red-200' },
};

export default function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getMyOrders();
                setOrders(data.orders ?? []);
            } catch (err) {
                console.log(err);
                setLoadError(true);
                notify.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 pt-10 pb-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="h-3 w-20 bg-slate-200 rounded-full animate-pulse mb-3" />
                    <div className="h-9 w-40 bg-slate-200 rounded-lg animate-pulse mb-8" />
                    <div className="space-y-4">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
                                <div className="flex justify-between mb-4">
                                    <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                                    <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                                </div>
                                <div className="flex gap-2 mb-4">
                                    {[0, 1, 2].map(j => (
                                        <div key={j} className="w-12 h-12 rounded-lg bg-slate-100 animate-pulse" />
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
                                    <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    if (loadError) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <motion.div className="text-center max-w-sm" {...fadeUp}>
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
                        <AlertCircle className="text-red-500" size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Couldn&apos;t load orders</h2>
                    <p className="text-slate-500 mt-2">Something went wrong fetching your orders.</p>
                    <motion.button
                        onClick={() => window.location.reload()}
                        className="inline-block mt-6 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                        {...buttonMotion}
                    >
                        Try again
                    </motion.button>
                </motion.div>
            </main>
        );
    }

    if (!orders.length) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <motion.div className="text-center max-w-sm" {...fadeUp}>
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-5">
                        <ShoppingBag className="text-teal-700" size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">No orders yet</h2>
                    <p className="text-slate-500 mt-2">
                        You haven&apos;t placed any orders. Start shopping to see them here.
                    </p>
                    <motion.div {...buttonMotion}>
                        <Link
                            href="/products"
                            className="inline-block mt-6 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                        >
                            Browse products
                        </Link>
                    </motion.div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pt-10 pb-20">
            <motion.div className="max-w-3xl mx-auto px-4 sm:px-6" {...fadeUp}>

                {/* Header */}
                <div className="mb-8 pb-5 border-b border-slate-200">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-teal-700 uppercase mb-1.5">
                        <Package size={13} strokeWidth={2.5} />
                        Account
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                        My orders
                    </h1>
                </div>

                <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
                    {orders.map((order) => {
                        const orderId = order._id?.length >= 8
                            ? order._id.slice(-8).toUpperCase()
                            : order._id?.toUpperCase() ?? '—';

                        const status = STATUS_MAP[order.orderStatus] ?? {
                            label: order.orderStatus,
                            color: 'bg-slate-100 text-slate-600 border-slate-200'
                        };

                        const orderDate = order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })
                            : null;

                        // Show up to 2 product rows; remainder shown as "+N more"
                        const itemCount = order.items.length;

                        return (
                            <motion.div
                                key={order._id}
                                variants={staggerItem}
                                whileHover={cardHover}
                            >
                            <Link
                                href={`/orders/${order._id}`}
                                className="group block bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-200 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                            >
                                <div className="flex">
                                    {/* Left status strip */}
                                    <div className={`w-1.5 shrink-0 ${
                                        order.orderStatus === 'delivered' ? 'bg-emerald-500' :
                                        order.orderStatus === 'cancelled' ? 'bg-red-400' :
                                        order.orderStatus === 'shipped'   ? 'bg-violet-500' :
                                        'bg-teal-500'
                                    }`} />

                                    <div className="flex-1 min-w-0 p-5">
                                        {/* Header: ID + status badge + date */}
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div>
                                                <p className="font-bold text-slate-900 tabular-nums text-sm">
                                                    #{orderId}
                                                </p>
                                                {orderDate && (
                                                    <p className="text-xs text-slate-400 mt-0.5">{orderDate}</p>
                                                )}
                                            </div>
                                            <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        {/* Product rows — show up to 2, with overflow indicator */}
                                        <div className="space-y-2.5 mb-4">
                                            {order.items.slice(0, 2).map((item) => (
                                                <div key={item.product._id} className="flex items-center gap-3">
                                                    {item.product.images?.[0] ? (
                                                        <img
                                                            src={item.product.images[0]}
                                                            alt={item.product.name}
                                                            className="w-10 h-10 rounded-lg object-cover border border-slate-100 bg-slate-50 shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
                                                            <ImageOff size={13} className="text-slate-300" />
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-slate-700 font-medium line-clamp-1 flex-1 min-w-0">
                                                        {item.product.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400 shrink-0">
                                                        ×{item.quantity}
                                                    </p>
                                                </div>
                                            ))}
                                            {itemCount > 2 && (
                                                <p className="text-xs text-slate-400 pl-[52px]">
                                                    +{itemCount - 2} more {itemCount - 2 === 1 ? 'item' : 'items'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Footer: total + arrow */}
                                        <div className="flex items-center justify-between border-t border-slate-100 pt-3.5">
                                            <p className="text-xs text-slate-400">
                                                {itemCount} {itemCount === 1 ? 'item' : 'items'} · Free shipping
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 tabular-nums">
                                                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                                                </span>
                                                <ChevronRight
                                                    size={16}
                                                    className="text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </motion.div>
        </main>
    );
}
