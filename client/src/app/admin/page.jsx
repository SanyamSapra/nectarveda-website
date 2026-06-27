'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ShoppingBag, Users, Package, IndianRupee, TrendingUp, Star, Clock, ImageOff } from 'lucide-react'
import Link from 'next/link'

const STATUS_COLORS = {
    delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    processing: 'bg-blue-50   text-blue-700   border-blue-200',
    shipped:    'bg-violet-50 text-violet-700 border-violet-200',
    pending:    'bg-amber-50  text-amber-700  border-amber-200',
    confirmed:  'bg-blue-50   text-blue-700   border-blue-200',
    cancelled:  'bg-red-50    text-red-600    border-red-200',
}

const STATUS_DOT = {
    delivered:  'bg-emerald-400',
    processing: 'bg-blue-400',
    shipped:    'bg-violet-500',
    pending:    'bg-amber-400',
    confirmed:  'bg-blue-400',
    cancelled:  'bg-red-400',
}

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, href }) => {
    const inner = (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 group">
            <div className={`p-3 rounded-xl shrink-0 ${iconBg} ${iconColor}`}>
                <Icon size={22} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">{label}</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{value}</p>
            </div>
        </div>
    )

    return href ? <Link href={href}>{inner}</Link> : inner
}

function SectionHeader({ icon: Icon, iconColor = 'text-teal-700', title }) {
    return (
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
            <Icon size={18} className={iconColor} />
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
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
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-52 bg-slate-200 rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="h-80 bg-slate-200 rounded-2xl" />
                    <div className="h-80 bg-slate-200 rounded-2xl" />
                </div>
                <div className="h-72 bg-slate-200 rounded-2xl" />
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-900 font-semibold">Dashboard unavailable</p>
                <p className="text-slate-500 text-sm mt-1">Failed to load stats. Try refreshing.</p>
            </div>
        )
    }

    const orderChartData = Object.entries(stats.ordersByStatus).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
    }))

    return (
        <div className="space-y-6">

            {/* Greeting */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{greeting}, Admin</h1>
                <p className="text-sm text-slate-500 mt-0.5">Here's what's happening with your store today.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Revenue"  value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} icon={IndianRupee} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
                <StatCard label="Total Orders"   value={stats.totalOrders}   icon={ShoppingBag} iconBg="bg-teal-50"    iconColor="text-teal-700"   href="/admin/orders" />
                <StatCard label="Total Users"    value={stats.totalUsers}    icon={Users}       iconBg="bg-blue-50"    iconColor="text-blue-600"   href="/admin/users" />
                <StatCard label="Total Products" value={stats.totalProducts} icon={Package}     iconBg="bg-amber-50"   iconColor="text-amber-600"  href="/admin/products" />
            </div>

            {/* Chart + Top Products */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Orders by Status Chart */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
                    <SectionHeader icon={TrendingUp} title="Orders by status" />
                    <div className="flex-1 min-h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={orderChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="status"
                                    tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={8}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc', radius: 6 }}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        color: '#0f172a',
                                        padding: '8px 14px',
                                    }}
                                />
                                <Bar dataKey="count" fill="#0f766e" radius={[6, 6, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <SectionHeader icon={Star} iconColor="text-amber-500" title="Top selling products" />
                    <div className="space-y-2">
                        {stats.topProducts.map((product, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                <span className="text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                                    {i + 1}
                                </span>
                                <div className="w-11 h-11 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
                                    {product.image
                                        ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center"><ImageOff size={14} className="text-slate-300" /></div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                                    <p className="text-xs text-slate-400 mt-0.5 tabular-nums">₹{product.price.toLocaleString('en-IN')}</p>
                                </div>
                                <span className="shrink-0 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg tabular-nums">
                                    {product.totalSold} sold
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-teal-700" />
                        <h2 className="text-base font-semibold text-slate-900">Recent orders</h2>
                    </div>
                    <Link href="/admin/orders" className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors">
                        View all →
                    </Link>
                </div>

                {stats.recentOrders.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm">No recent orders.</div>
                ) : (
                    <div className="overflow-x-auto">
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
                                    const dot  = STATUS_DOT[key]   || 'bg-slate-400'
                                    return (
                                        <tr key={order._id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md tracking-wide">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="font-medium text-slate-900">{order.user?.name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{order.user?.email}</p>
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
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}