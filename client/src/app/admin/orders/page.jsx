'use client'

import { useState, useEffect, useRef } from 'react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { RefreshCw, PackageSearch, ChevronDown, Check, Search } from 'lucide-react'

const STATUS_OPTIONS = ['processing', 'shipped', 'delivered', 'cancelled']
const FILTERS = ['all', ...STATUS_OPTIONS]

const statusConfig = {
    delivered: { pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200', border: 'border-l-emerald-400', dot: 'bg-emerald-400' },
    processing: { pill: 'bg-blue-50   text-blue-700   ring-blue-200', border: 'border-l-blue-400', dot: 'bg-blue-400' },
    shipped: { pill: 'bg-amber-50  text-amber-700  ring-amber-200', border: 'border-l-amber-400', dot: 'bg-amber-400' },
    cancelled: { pill: 'bg-red-50    text-red-700    ring-red-200', border: 'border-l-red-400', dot: 'bg-red-400' },
}

function StatusDropdown({ value, onChange, disabled }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const cfg = statusConfig[value] ?? statusConfig.processing

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div className="relative inline-block text-left" ref={ref}>
            <button
                onClick={() => !disabled && setOpen(o => !o)}
                disabled={disabled}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ring-1 ring-inset transition-opacity ${cfg.pill} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
            >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                {value.charAt(0).toUpperCase() + value.slice(1)}
                {disabled
                    ? <RefreshCw size={10} className="animate-spin ml-0.5 opacity-60" />
                    : <ChevronDown size={10} className={`ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
                }
            </button>

            {open && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl border border-slate-200 shadow-lg z-20 overflow-hidden py-1">
                    {STATUS_OPTIONS.map(s => {
                        const c = statusConfig[s]
                        return (
                            <button
                                key={s}
                                onClick={() => { onChange(s); setOpen(false) }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                                <span className="capitalize flex-1 text-left">{s}</span>
                                {s === value && <Check size={11} className="text-teal-600" />}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [updating, setUpdating] = useState(null)

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const res = await api.get('/api/orders')
            setOrders(res.data.orders)
        } catch {
            toast.error('Failed to fetch orders')
        } finally {
            setLoading(false)
        }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchOrders() }, [])

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdating(orderId)
        try {
            await api.put(`/api/orders/${orderId}/status`, { orderStatus: newStatus })
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o))
            toast.success('Status updated')
        } catch {
            toast.error('Failed to update status')
        } finally {
            setUpdating(null)
        }
    }

    const countFor = (f) => f === 'all' ? orders.length : orders.filter(o => o.orderStatus === f).length
    const searchTerm = search.trim().toLowerCase()
    const statusFiltered = filter === 'all' ? orders : orders.filter(o => o.orderStatus === filter)
    const filtered = searchTerm
        ? statusFiltered.filter(order => {
            const orderId = order._id?.toLowerCase() || ''
            const shortId = order._id?.slice(-6).toLowerCase() || ''
            const customerName = (order.user?.name || order.customerSnapshot?.name || '').toLowerCase()
            const customerEmail = (order.user?.email || order.customerSnapshot?.email || '').toLowerCase()
            const status = order.orderStatus?.toLowerCase() || ''
            const amount = String(order.totalAmount || '')
            const items = order.items?.map(item => item.product?.name || '').join(' ').toLowerCase() || ''

            return [orderId, shortId, customerName, customerEmail, status, amount, items]
                .some(value => value.includes(searchTerm))
        })
        : statusFiltered

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-9 w-24 bg-slate-200 rounded-xl" />)}
                </div>
                <div className="h-96 bg-slate-200 rounded-2xl" />
            </div>
        )
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900">Orders</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition w-52"
                        />
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-500 hover:text-teal-700 hover:border-teal-300 transition-colors"
                    >
                        <RefreshCw size={14} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
                {FILTERS.map(f => {
                    const count = countFor(f)
                    const isActive = filter === f
                    return (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all flex items-center gap-1.5 ${isActive
                                    ? 'bg-teal-700 text-white shadow-sm'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-teal-700'
                                }`}
                        >
                            {f !== 'all' && (
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/60' : statusConfig[f]?.dot}`} />
                            )}
                            {f}
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Orders — Table on md+, Cards on mobile */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 py-20 flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <PackageSearch size={22} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                        {search ? `No orders matching "${search}"` : `No ${filter === 'all' ? '' : filter} orders`}
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs">
                        {search
                            ? 'Try another customer, order ID, product, amount, or status.'
                            : filter === 'all'
                            ? 'Orders will appear here once customers start placing them.'
                            : `No orders are currently marked as ${filter}. Try a different filter.`}
                    </p>
                    {search ? (
                        <button
                            onClick={() => setSearch('')}
                            className="mt-1 text-xs text-teal-700 font-medium hover:underline"
                        >
                            Clear search
                        </button>
                    ) : filter !== 'all' && (
                        <button
                            onClick={() => setFilter('all')}
                            className="mt-1 text-xs text-teal-700 font-medium hover:underline"
                        >
                            View all orders
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                                    <tr>
                                        <th className="px-5 py-3.5">Order</th>
                                        <th className="px-5 py-3.5">Customer</th>
                                        <th className="px-5 py-3.5">Items</th>
                                        <th className="px-5 py-3.5">Amount</th>
                                        <th className="px-5 py-3.5">Date</th>
                                        <th className="px-5 py-3.5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((order) => {
                                        const cfg = statusConfig[order.orderStatus] ?? statusConfig.processing
                                        return (
                                            <tr
                                                key={order._id}
                                                className={`hover:bg-slate-50/60 transition-colors border-l-2 ${cfg.border}`}
                                            >
                                                <td className="px-5 py-3.5">
                                                    <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md tracking-wide">
                                                        #{order._id.slice(-6).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <p className="font-medium text-slate-900 text-sm leading-snug">{order.user?.name || order.customerSnapshot?.name || 'Deleted account'}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">{order.user?.email || order.customerSnapshot?.email || 'Account removed'}</p>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="space-y-0.5">
                                                        {order.items.map((item, i) => (
                                                            <p key={i} className="text-xs text-slate-600">
                                                                {item.product?.name} <span className="text-slate-400">× {item.quantity}</span>
                                                            </p>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 font-semibold text-slate-900">
                                                    ₹{order.totalAmount.toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <StatusDropdown
                                                        value={order.orderStatus}
                                                        onChange={(s) => handleStatusUpdate(order._id, s)}
                                                        disabled={updating === order._id}
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                        {filtered.map((order) => {
                            const cfg = statusConfig[order.orderStatus] ?? statusConfig.processing
                            return (
                                <div
                                    key={order._id}
                                    className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-l-4 ${cfg.border}`}
                                >
                                    <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                                        <div>
                                            <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </span>
                                            <p className="font-semibold text-slate-900 text-sm mt-1.5">{order.user?.name || order.customerSnapshot?.name || 'Deleted account'}</p>
                                            <p className="text-xs text-slate-400">{order.user?.email || order.customerSnapshot?.email || 'Account removed'}</p>
                                        </div>
                                        <StatusDropdown
                                            value={order.orderStatus}
                                            onChange={(s) => handleStatusUpdate(order._id, s)}
                                            disabled={updating === order._id}
                                        />
                                    </div>

                                    <div className="px-4 pb-4 border-t border-slate-100 pt-3 flex items-end justify-between gap-3">
                                        <div className="space-y-0.5">
                                            {order.items.map((item, i) => (
                                                <p key={i} className="text-xs text-slate-600">
                                                    {item.product?.name} <span className="text-slate-400">× {item.quantity}</span>
                                                </p>
                                            ))}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-semibold text-slate-900 text-sm">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}
