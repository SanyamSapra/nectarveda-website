'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { getAddresses, addAddress } from '@/services/address.service';
import { createOrder } from '@/services/order.service';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Check, AlertCircle, Loader2, ShoppingBag, ImageOff, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { buttonMotion, fadeUp, scaleFade, staggerContainer, staggerItem } from '@/lib/animations';
import { notify } from '@/lib/feedback';

const LABEL_OPTIONS = ['Home', 'Work', 'Other'];

const emptyForm = { label: 'Home', street: '', city: '', state: '', pincode: '', phone: '' };

export default function CheckoutPage() {
    const { cart, refreshCart } = useCart();
    const router = useRouter();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAddress, setNewAddress] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [savingAddress, setSavingAddress] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState('');

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const data = await getAddresses();
                setAddresses(data.addresses ?? []);
                const defaultAddr = data.addresses?.find(a => a.isDefault);
                if (defaultAddr) setSelectedAddressId(defaultAddr._id);
            } catch (err) {
                console.log(err);
                notify.error(err);
            } finally {
                setLoadingAddresses(false);
            }
        };
        fetchAddresses();
    }, []);

    const handleFormChange = (e) => {
        setNewAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setFormError('');
    };

    const validateForm = () => {
        if (!newAddress.street.trim()) return 'Street address is required';
        if (!newAddress.city.trim()) return 'City is required';
        if (!newAddress.state.trim()) return 'State is required';
        if (!/^\d{6}$/.test(newAddress.pincode)) return 'Pincode must be exactly 6 digits';
        if (!/^\d{10}$/.test(newAddress.phone)) return 'Phone must be exactly 10 digits';
        return '';
    };

    const handleAddNewAddress = async () => {
        const err = validateForm();
        if (err) {
            setFormError(err);
            notify.info(err);
            return;
        }

        setSavingAddress(true);
        setFormError('');
        try {
            const data = await addAddress(newAddress);
            setAddresses(data.addresses);
            setSelectedAddressId(data.addresses.at(-1)._id);
            setShowAddForm(false);
            setNewAddress(emptyForm);
            notify.addressSaved();
        } catch (err) {
            console.log(err);
            setFormError('Failed to save address. Please try again.');
            notify.error(err);
        } finally {
            setSavingAddress(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            setOrderError('Please select a delivery address.');
            notify.info('Please select a delivery address.');
            return;
        }
        const selectedAddress = addresses.find(a => a._id === selectedAddressId);
        setPlacingOrder(true);
        setOrderError('');
        try {
            const data = await createOrder({
                shippingAddress: {
                    street: selectedAddress.street,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    pincode: selectedAddress.pincode,
                    phone: selectedAddress.phone,
                }
            });
            await refreshCart();
            notify.orderPlaced();
            router.push(`/orders/${data.order._id}`);
        } catch (err) {
            setOrderError('Failed to place order. Please try again.');
            notify.error(err);
        } finally {
            setPlacingOrder(false);
        }
    };

    const subtotal = cart?.items?.reduce((sum, item) => {
        const price = item.product.salePrice || item.product.price;
        return sum + price * item.quantity;
    }, 0) ?? 0;

    const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    if (loadingAddresses) {
        return (
            <main className="min-h-screen bg-slate-50 pt-10 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-3 w-20 bg-slate-200 rounded-full animate-pulse mb-3" />
                    <div className="h-9 w-40 bg-slate-200 rounded-lg animate-pulse mb-8" />
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {[0, 1].map(i => (
                                <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                            ))}
                        </div>
                        <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                    </div>
                </div>
            </main>
        );
    }

    if (!cart?.items?.length) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <motion.div className="text-center max-w-sm" {...fadeUp}>
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-5">
                        <ShoppingBag className="text-teal-700" size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Nothing to checkout</h2>
                    <p className="text-slate-500 mt-2">Your cart is empty. Add some products first.</p>
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
            <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" {...fadeUp}>

                {/* Header */}
                <div className="mb-8 pb-5 border-b border-slate-200">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-teal-700 uppercase mb-1.5">
                        <ShoppingBag size={13} strokeWidth={2.5} />
                        Verify Order
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                        Checkout
                    </h1>
                </div>

                <motion.div className="grid lg:grid-cols-3 gap-6 lg:gap-8" variants={staggerContainer} initial="initial" animate="animate">

                    {/* Left — Delivery Address */}
                    <div className="lg:col-span-2 space-y-4">

                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <MapPin size={18} className="text-teal-700" />
                                Delivery address
                            </h2>
                        </div>

                        {/* Saved addresses */}
                        {addresses.length === 0 && !showAddForm && (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                                <MapPin size={28} className="text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm">No saved addresses yet.</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="mt-4 text-teal-700 font-semibold text-sm hover:text-teal-800 transition-colors"
                                >
                                    + Add your first address
                                </button>
                            </div>
                        )}

                        {addresses.map((addr) => {
                            const isSelected = selectedAddressId === addr._id;
                            return (
                                <motion.div
                                    key={addr._id}
                                    onClick={() => { setSelectedAddressId(addr._id); setOrderError(''); }}
                                    className={`relative flex gap-4 bg-white p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isSelected
                                            ? 'border-teal-600 shadow-sm shadow-teal-100'
                                            : 'border-slate-200 hover:border-teal-300'
                                        }`}
                                    variants={staggerItem}
                                    whileHover={{ y: -2 }}
                                >
                                    {/* Selection indicator */}
                                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-teal-600 bg-teal-600' : 'border-slate-300'
                                        }`}>
                                        {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isSelected ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {addr.label}
                                            </span>
                                            {addr.isDefault && (
                                                <span className="text-xs text-emerald-600 font-medium">Default</span>
                                            )}
                                        </div>
                                        <p className="text-slate-800 font-medium">{addr.street}</p>
                                        <p className="text-slate-500 text-sm">{addr.city}, {addr.state} — {addr.pincode}</p>
                                        <p className="text-slate-500 text-sm">+91 {addr.phone}</p>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Add new address */}
                        {showAddForm ? (
                            <motion.div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6" {...scaleFade}>
                                <h3 className="font-semibold text-slate-900 mb-5">New address</h3>

                                {formError && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                                        <AlertCircle size={15} className="shrink-0" />
                                        {formError}
                                    </div>
                                )}

                                {/* Label tabs */}
                                <div className="flex gap-2 mb-4">
                                    {LABEL_OPTIONS.map(opt => (
                                        <motion.button
                                            key={opt}
                                            type="button"
                                            onClick={() => setNewAddress(prev => ({ ...prev, label: opt }))}
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${newAddress.label === opt
                                                    ? 'bg-teal-700 text-white border-teal-700'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
                                                }`}
                                            {...buttonMotion}
                                        >
                                            {opt}
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3">
                                    {[
                                        { name: 'street', label: 'Street address', colSpan: 'sm:col-span-2', placeholder: '123 MG Road, Apartment 4B' },
                                        { name: 'city', label: 'City', placeholder: 'Dehradun' },
                                        { name: 'state', label: 'State', placeholder: 'Uttarakhand' },
                                        { name: 'pincode', label: 'Pincode', placeholder: '248001', inputMode: 'numeric' },
                                        { name: 'phone', label: 'Phone number', placeholder: '9876543210', inputMode: 'numeric' },
                                    ].map(field => (
                                        <div key={field.name} className={field.colSpan ?? ''}>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                                {field.label}
                                            </label>
                                            <input
                                                name={field.name}
                                                value={newAddress[field.name]}
                                                onChange={handleFormChange}
                                                placeholder={field.placeholder}
                                                inputMode={field.inputMode}
                                                disabled={savingAddress}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition disabled:bg-slate-50 disabled:text-slate-400"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 mt-5">
                                    <motion.button
                                        onClick={handleAddNewAddress}
                                        disabled={savingAddress}
                                        className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                                        {...buttonMotion}
                                    >
                                        {savingAddress ? (
                                            <><Loader2 size={15} className="animate-spin" /> Saving...</>
                                        ) : (
                                            'Save address'
                                        )}
                                    </motion.button>
                                    <motion.button
                                        onClick={() => { setShowAddForm(false); setFormError(''); setNewAddress(emptyForm); }}
                                        disabled={savingAddress}
                                        className="border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                                        {...buttonMotion}
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center gap-2 w-full bg-white border-2 border-dashed border-slate-300 hover:border-teal-400 hover:bg-teal-50 text-slate-600 hover:text-teal-700 px-5 py-4 rounded-2xl text-sm font-medium transition-all"
                                {...buttonMotion}
                            >
                                <Plus size={17} />
                                Add new address
                            </motion.button>
                        )}
                    </div>

                    {/* Right — Order Summary */}
                    <motion.div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit lg:sticky lg:top-24" variants={staggerItem}>
                        <h2 className="text-lg font-bold text-slate-900 mb-5">
                            Order summary
                        </h2>

                        {/* Cart items list */}
                        <div className="space-y-3 mb-5">
                            {cart.items.map((item) => {
                                const price = item.product.salePrice || item.product.price;
                                return (
                                    <motion.div key={item.product._id} className="flex items-center gap-3" variants={staggerItem}>
                                        {item.product.images?.[0] ? (
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                className="w-12 h-12 rounded-lg object-cover border border-slate-100 bg-slate-50 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
                                                <ImageOff size={14} className="text-slate-300" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.product.name}</p>
                                            <p className="text-xs text-slate-400">Qty {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900 tabular-nums shrink-0">
                                            ₹{(price * item.quantity).toLocaleString('en-IN')}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Totals */}
                        <div className="border-t border-slate-100 pt-4 space-y-2.5">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                                <span className="tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Shipping</span>
                                <span className="text-teal-700 font-medium">Free</span>
                            </div>
                            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                                <span className="font-semibold text-slate-900">Total</span>
                                <span className="font-bold text-xl text-slate-900 tabular-nums">
                                    ₹{subtotal.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>

                        {orderError && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mt-4">
                                <AlertCircle size={15} className="shrink-0" />
                                {orderError}
                            </div>
                        )}

                        <motion.button
                            onClick={handlePlaceOrder}
                            disabled={placingOrder || !selectedAddressId}
                            className="w-full mt-5 flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold shadow-sm hover:shadow transition-all"
                            {...buttonMotion}
                        >
                            {placingOrder ? (
                                <><Loader2 size={17} className="animate-spin" /> Placing order...</>
                            ) : (
                                <>Place order <ChevronRight size={17} /></>
                            )}
                        </motion.button>

                        <Link
                            href="/cart"
                            className="block text-center mt-3 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            ← Back to cart
                        </Link>
                    </motion.div>
                </motion.div>
            </motion.div>
        </main>
    );
}
