'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ShoppingBag, Users, Package, IndianRupee, TrendingUp, Star, Clock, ImageOff, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

const STATUS_COLORS = {
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    processing: 'bg-blue-50   text-blue-700   border-blue-200',
    shipped: 'bg-amber-50  text-amber-700  border-amber-400',
    pending: 'bg-amber-50  text-amber-700  border-amber-200',
    confirmed: 'bg-blue-50   text-blue-700   border-blue-200',
    cancelled: 'bg-red-50    text-red-600    border-red-200',
}

const STATUS_DOT = {
    delivered: 'bg-emerald-400',
    processing: 'bg-blue-400',
    shipped: 'bg-amber-400',
    pending: 'bg-amber-400',
    confirmed: 'bg-blue-400',
    cancelled: 'bg-red-400',
}

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, href }) => {
    const inner = (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3 shadow-sm transition-all duration-200 active:scale-[0.98] hover:shadow-md hover:border-slate-300 h-full">
            <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 ${iconBg} ${iconColor}`}>
                <Icon size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight tabular-nums">{value}</p>
            </div>
        </div>
    )
    return href ? <Link href={href} className="block h-full">{inner}</Link> : inner
}

function SectionHeader({ icon: Icon, iconColor = 'text-teal-700', title }) {
    return (
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Icon size={16} className={iconColor} />
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        </div>
    )
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/admin/dashboard')
                setStats(res.data.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse p-4 sm:p-6 max-w-5xl mx-auto">
                <div className="h-7 w-44 bg-slate-200 rounded-lg" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-200 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-72 bg-slate-200 rounded-2xl" />
                    <div className="h-72 bg-slate-200 rounded-2xl" />
                </div>
                <div className="h-64 bg-slate-200 rounded-2xl" />
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center h-64 m-4 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-900 font-semibold">Dashboard unavailable</p>
                <p className="text-slate-500 text-sm mt-1">Failed to load stats. Try refreshing.</p>
            </div>
        )
    }

    const orderChartData = Object.entries(stats.ordersByStatus).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
    }))
    const lowStockCount = stats.lowStockProducts?.length || 0

    return (
        <div className="space-y-4 p-4 sm:p-6 pb-10 max-w-5xl mx-auto w-full">

            {/* Greeting */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{greeting}, Admin 👋</h1>
                <p className="text-xs text-slate-500 mt-0.5">Here&apos;s what&apos;s happening with your store today.</p>
            </div>

            {/* Stat Cards — 2 col mobile, 4 col desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} icon={IndianRupee} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
                <StatCard label="Orders" value={stats.totalOrders} icon={ShoppingBag} iconBg="bg-teal-50" iconColor="text-teal-700" href="/admin/orders" />
                <StatCard label="Users" value={stats.totalUsers} icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600" href="/admin/users" />
                <StatCard label="Products" value={stats.totalProducts} icon={Package} iconBg="bg-amber-50" iconColor="text-amber-600" href="/admin/products" />
            </div>

            {/* Low Stock Alert */}
            {lowStockCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                            <h2 className="text-sm font-semibold text-slate-900">Low stock alert</h2>
                        </div>
                        <Link href="/admin/products" className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors whitespace-nowrap">
                            Manage →
                        </Link>
                    </div>
                    {/* 1 col mobile → 2 col sm → 4 col lg */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {stats.lowStockProducts.map((product) => (
                            <div key={product._id} className="bg-white border border-amber-100 rounded-xl p-3 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                    {product.images?.[0]
                                        ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center"><ImageOff size={13} className="text-slate-300" /></div>
                                    }
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                                    <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                                        {product.stock} left · threshold {stats.lowStockThreshold}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chart + Top Products — stack on mobile, side-by-side on lg */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Orders by Status Chart */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
                    <SectionHeader icon={TrendingUp} title="Orders by status" />
                    <div style={{ height: 230 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={orderChartData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="status"
                                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                                    axisLine={false} tickLine={false} dy={6}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    axisLine={false} tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc', radius: 6 }}
                                    contentStyle={{
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                                        fontSize: '12px', fontWeight: 500, color: '#0f172a', padding: '6px 12px',
                                    }}
                                />
                                <Bar dataKey="count" fill="#0f766e" radius={[5, 5, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
                    <SectionHeader icon={Star} iconColor="text-amber-500" title="Top selling products" />
                    <div className="space-y-1">
                        {stats.topProducts.map((product, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors">
                                <span className="text-xs font-bold text-slate-300 w-4 text-center shrink-0">{i + 1}</span>
                                <div className="w-10 h-10 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
                                    {product.image
                                        ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center"><ImageOff size={13} className="text-slate-300" /></div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                                    <p className="text-xs text-slate-400 mt-0.5 tabular-nums">₹{product.price.toLocaleString('en-IN')}</p>
                                </div>
                                <span className="shrink-0 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-lg tabular-nums">
                                    {product.totalSold} sold
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock size={15} className="text-teal-700" />
                        <h2 className="text-sm font-semibold text-slate-900">Recent orders</h2>
                    </div>
                    <Link href="/admin/orders" className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors">
                        View all →
                    </Link>
                </div>

                {stats.recentOrders.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-sm">No recent orders.</div>
                ) : (
                    <>
                        {/* Mobile card list */}
                        <div className="divide-y divide-slate-100 sm:hidden">
                            {stats.recentOrders.map((order) => {
                                const key = order.orderStatus?.toLowerCase()
                                const pill = STATUS_COLORS[key] || 'bg-slate-50 text-slate-600 border-slate-200'
                                const dot = STATUS_DOT[key] || 'bg-slate-400'
                                return (
                                    <div key={order._id} className="px-4 py-3 hover:bg-slate-50/60 transition-colors">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md tracking-wide">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </span>
                                            <span className="font-bold text-slate-900 text-sm tabular-nums">
                                                ₹{order.totalAmount.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">
                                                    {order.user?.name || order.customerSnapshot?.name || 'Deleted account'}
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${pill}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                                    <tr>
                                        <th className="px-5 py-3.5">Order</th>
                                        <th className="px-5 py-3.5">Customer</th>
                                        <th className="px-5 py-3.5">Amount</th>
                                        <th className="px-5 py-3.5">Status</th>
                                        <th className="px-5 py-3.5">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stats.recentOrders.map((order) => {
                                        const key = order.orderStatus?.toLowerCase()
                                        const pill = STATUS_COLORS[key] || 'bg-slate-50 text-slate-600 border-slate-200'
                                        const dot = STATUS_DOT[key] || 'bg-slate-400'
                                        return (
                                            <tr key={order._id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md tracking-wide">
                                                        #{order._id.slice(-6).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <p className="font-medium text-slate-900">{order.user?.name || order.customerSnapshot?.name || 'Deleted account'}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">{order.user?.email || order.customerSnapshot?.email || 'Account removed'}</p>
                                                </td>
                                                <td className="px-5 py-3.5 font-semibold text-slate-900 tabular-nums">
                                                    ₹{order.totalAmount.toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${pill}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                                                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}