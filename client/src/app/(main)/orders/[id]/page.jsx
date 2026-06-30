'use client'

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cancelOrder, getOrderById } from "@/services/order.service";
import {
    CheckCircle2, MapPin, Package, ImageOff,
    AlertCircle, ArrowRight, ShoppingBag, XCircle, Clock, Loader2
} from "lucide-react";
import { motion } from "motion/react";
import { buttonMotion, fadeUp, scaleFade, staggerContainer, staggerItem } from "@/lib/animations";
import { notify } from "@/lib/feedback";

// --- CONFIGURATION CONSTANTS ---
// Keeping these outside the component is good practice. It prevents them from being recreated on every render.
const STATUS_MAP = {
    pending: { label: 'Order placed', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, iconColor: 'text-amber-500' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2, iconColor: 'text-blue-500' },
    processing: { label: 'Processing', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock, iconColor: 'text-blue-500' },
    shipped: { label: 'Shipped', color: 'bg-violet-50 text-violet-700 border-violet-200', icon: Package, iconColor: 'text-violet-500' },
    delivered: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, iconColor: 'text-emerald-500' },
    cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle, iconColor: 'text-red-500' },
};

const HERO_CONFIG = {
    pending: { bg: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200', title: 'Order placed!', subtitle: "We've received your order and will confirm it shortly." },
    confirmed: { bg: 'from-blue-400 to-teal-600', shadow: 'shadow-blue-200', title: 'Order confirmed!', subtitle: "Your order is confirmed. We'll start preparing it soon." },
    processing: { bg: 'from-teal-400 to-emerald-600', shadow: 'shadow-teal-200', title: 'Order confirmed!', subtitle: "Thank you for your purchase. We'll get it to you soon." },
    shipped: { bg: 'from-violet-400 to-indigo-600', shadow: 'shadow-violet-200', title: 'On the way!', subtitle: 'Your order has been shipped and is on its way to you.' },
    delivered: { bg: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-200', title: 'Delivered!', subtitle: 'Your order has been delivered. Hope you love it!' },
    cancelled: { bg: 'from-slate-400 to-slate-600', shadow: 'shadow-slate-200', title: 'Order cancelled', subtitle: 'This order has been cancelled. Any charges will be refunded.' },
};

const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'processing'];


// --- MAIN COMPONENT ---
export default function OrderDetailPage() {
    const { id } = useParams(); // Simpler and more standard than use(params)

    // Core state
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    // Cancellation state
    const [cancelling, setCancelling] = useState(false);
    const [cancelConfirm, setCancelConfirm] = useState(false);

    // Fetch order data on mount
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await getOrderById(id);
                if (!data?.order) {
                    setLoadError(true);
                    return;
                }
                setOrder(data.order);
            } catch (err) {
                console.error("Failed to fetch order:", err);
                setLoadError(true);
                notify.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrder();
    }, [id]);

    const handleCancel = async () => {
        if (!cancelConfirm) {
            setCancelConfirm(true);
            return;
        }

        setCancelling(true);
        try {
            const data = await cancelOrder(id);
            if (data?.order) setOrder(data.order);
            notify.orderCancelled();
        } catch (err) {
            console.error("Failed to cancel order:", err);
            notify.error(err);
        } finally {
            setCancelling(false);
            setCancelConfirm(false);
        }
    };

    // Early returns for loading and error states keep the main UI tree clean
    if (loading) return <LoadingSkeleton />;
    if (loadError || !order) return <OrderNotFound />;

    // Derived variables for the UI
    const orderId = order._id?.slice(-8).toUpperCase() || '—';
    const statusKey = order.orderStatus || 'pending';
    const status = STATUS_MAP[statusKey] || STATUS_MAP.pending;
    const hero = HERO_CONFIG[statusKey] || HERO_CONFIG.pending;
    const StatusIcon = status.icon;

    const orderDate = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    const isCancellable = CANCELLABLE_STATUSES.includes(statusKey);
    const isCancelled = statusKey === 'cancelled';

    return (
        <main className="min-h-screen bg-slate-50 pt-10 pb-20">
            <motion.div className="max-w-3xl mx-auto px-4 sm:px-6" {...fadeUp}>

                {/* Status Hero Section */}
                <motion.div className="text-center mb-8" {...scaleFade}>
                    <div className="relative w-20 h-20 mx-auto mb-5">
                        {!isCancelled && (
                            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-[ping_1s_ease-out_1] opacity-30" />
                        )}
                        <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${hero.bg} flex items-center justify-center shadow-lg ${hero.shadow}`}>
                            <StatusIcon size={36} className="text-white" strokeWidth={1.8} />
                        </div>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{hero.title}</h1>
                    <p className="text-slate-500 mt-1.5 max-w-sm mx-auto">{hero.subtitle}</p>

                    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                        <span className="bg-slate-100 text-slate-600 text-sm font-medium px-3 py-1 rounded-full tabular-nums">
                            #{orderId}
                        </span>
                        {orderDate && <span className="text-slate-400 text-sm">{orderDate}</span>}
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                </motion.div>

                <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
                    {/* Shipping Address */}
                    <motion.div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" variants={staggerItem}>
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                            <MapPin size={14} className="text-teal-700" />
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Delivering to</h2>
                        </div>
                        <div className="px-5 py-4">
                            <p className="text-slate-900 font-medium">{order.shippingAddress.street}</p>
                            {order.shippingAddress.landmark && (
                                <p className="text-slate-500 text-sm mt-0.5">Landmark: {order.shippingAddress.landmark}</p>
                            )}
                            <p className="text-slate-500 text-sm mt-0.5">
                                {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                            </p>
                            <p className="text-slate-500 text-sm mt-0.5">+91 {order.shippingAddress.phone}</p>
                        </div>
                    </motion.div>

                    {/* Order Items */}
                    <motion.div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" variants={staggerItem}>
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                            <Package size={14} className="text-teal-700" />
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Items ordered</h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {order.items.map((item, index) => (
                                <motion.div key={item._id || item.product?._id || index} className="flex items-center gap-4 px-5 py-4" variants={staggerItem}>
                                    <ProductImage src={item.product.images?.[0]} alt={item.product.name} />

                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-900 font-medium line-clamp-1">{item.product.name}</p>
                                        <p className="text-slate-400 text-sm mt-0.5">Qty {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-slate-900 tabular-nums shrink-0">
                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Payment Summary */}
                    <motion.div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" variants={staggerItem}>
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                            <ShoppingBag size={14} className="text-teal-700" />
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment details</h2>
                        </div>
                        <div className="px-5 py-4 space-y-3">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Shipping</span>
                                <span className="text-teal-700 font-medium">Free</span>
                            </div>
                            <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                                <span className="font-semibold text-slate-900">Total paid</span>
                                <span className="font-bold text-xl text-slate-900 tabular-nums">
                                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 mt-1">
                                <span className="text-slate-500 text-sm">Payment method</span>
                                <span className="ml-auto text-sm font-semibold text-slate-800">Cash on delivery</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <motion.div className="flex-1" {...buttonMotion}>
                        <Link href="/products" className="flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white py-3.5 rounded-xl font-semibold shadow-sm hover:shadow transition-all">
                            Continue shopping <ArrowRight size={17} />
                        </Link>
                    </motion.div>
                    <motion.div className="flex-1" {...buttonMotion}>
                        <Link href="/orders" className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 py-3.5 rounded-xl font-semibold transition-all">
                            View all orders
                        </Link>
                    </motion.div>
                </div>

                {/* Cancel Order Block */}
                {isCancellable && (
                    <div className="mt-4">
                        {cancelConfirm ? (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                                <p className="text-sm text-red-700 font-medium text-center mb-3">
                                    Are you sure? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <motion.button
                                        onClick={handleCancel}
                                        disabled={cancelling}
                                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
                                        {...buttonMotion}
                                    >
                                        {cancelling ? <><Loader2 size={15} className="animate-spin" /> Cancelling...</> : 'Yes, cancel order'}
                                    </motion.button>
                                    <motion.button
                                        onClick={() => setCancelConfirm(false)}
                                        disabled={cancelling}
                                        className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                                        {...buttonMotion}
                                    >
                                        Keep order
                                    </motion.button>
                                </div>
                            </div>
                        ) : (
                            <motion.button
                                onClick={handleCancel}
                                className="w-full py-3 rounded-xl bg-white border border-slate-200 text-red-600 font-medium hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all duration-200 shadow-sm hover:shadow"
                                {...buttonMotion}
                            >
                                Cancel this order
                            </motion.button>
                        )}
                    </div>
                )}

            </motion.div>
        </main>
    );
}

// --- HELPER COMPONENTS ---
// Extracting these keeps the main logic clean and makes them highly reusable.

function ProductImage({ src, alt }) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div className="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
                <ImageOff size={16} className="text-slate-300" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="w-14 h-14 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
        />
    );
}

function LoadingSkeleton() {
    return (
        <main className="min-h-screen bg-slate-50 pt-10 pb-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
                <div className="flex flex-col items-center gap-3 py-8">
                    <div className="w-20 h-20 rounded-full bg-slate-200 animate-pulse" />
                    <div className="h-7 w-52 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
                </div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-36 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                ))}
            </div>
        </main>
    );
}

function OrderNotFound() {
    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
                    <AlertCircle className="text-red-500" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Order not found</h2>
                <p className="text-slate-500 mt-2">We couldn&apos;t find this order. It may have been removed or the link is incorrect.</p>
                <Link href="/orders" className="inline-block mt-6 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                    View all orders
                </Link>
            </div>
        </main>
    );
}
