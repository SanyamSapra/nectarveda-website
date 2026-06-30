'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Users, Mail, Phone, MapPin, ShoppingBag, IndianRupee, X, Loader2, Search, Calendar, ChevronRight } from 'lucide-react'

function UserDetailModal({ userId, onClose }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/api/admin/users/${userId}`)
                setData(res.data)
            } catch {
                toast.error('Failed to load user details')
                onClose()
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [userId])

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            {/* Bottom sheet on mobile, centered modal on sm+ */}
            <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col">
                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                    <div className="w-10 h-1 rounded-full bg-slate-200" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                    <h2 className="text-base font-semibold text-slate-900">User Details</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-16">
                        <Loader2 size={24} className="animate-spin text-teal-600" />
                    </div>
                ) : (
                    <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
                        {/* Profile */}
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-teal-700 flex items-center justify-center text-white text-xl font-bold shrink-0">
                                {data.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-slate-900 text-base truncate">{data.user.name}</p>
                                <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                                    <Mail size={13} className="shrink-0" />
                                    <span className="truncate">{data.user.email}</span>
                                </div>
                                {data.user.phone && (
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                                        <Phone size={13} className="shrink-0" />
                                        {data.user.phone}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                                <ShoppingBag size={18} className="text-teal-700 shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500">Total Orders</p>
                                    <p className="text-lg font-bold text-slate-900">{data.totalOrders}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                                <IndianRupee size={18} className="text-emerald-600 shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500">Total Spent</p>
                                    <p className="text-lg font-bold text-slate-900">₹{data.totalSpent.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        {data.orders.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Recent Orders</p>
                                <div className="space-y-2">
                                    {data.orders.slice(0, 5).map(order => (
                                        <div key={order._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div>
                                                <span className="font-mono text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                </span>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-slate-900 text-sm">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                                    order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                                                    order.orderStatus === 'processing' ? 'bg-blue-50 text-blue-700' :
                                                    order.orderStatus === 'shipped' ? 'bg-amber-50 text-amber-700' :
                                                    'bg-red-50 text-red-600'
                                                }`}>
                                                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Addresses */}
                        {data.user.addresses?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Saved Addresses</p>
                                <div className="space-y-2">
                                    {data.user.addresses.map((addr, i) => (
                                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                {addr.street}, {addr.city}, {addr.state} — {addr.pincode}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/api/admin/users')
                setUsers(res.data.users)
            } catch {
                toast.error('Failed to fetch users')
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    const searchTerm = search.trim().toLowerCase()
    const filteredUsers = searchTerm
        ? users.filter(user => {
            const addressText = user.addresses?.map(addr =>
                [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(' ')
            ).join(' ').toLowerCase() || ''

            return [
                user.name?.toLowerCase() || '',
                user.email?.toLowerCase() || '',
                user.phone?.toLowerCase() || '',
                user._id?.toLowerCase() || '',
                addressText
            ].some(value => value.includes(searchTerm))
        })
        : users

    if (loading) {
        return (
            <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-3 animate-pulse">
                <div className="h-8 w-32 bg-slate-200 rounded-xl" />
                <div className="h-11 bg-slate-200 rounded-xl" />
                {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-200 rounded-2xl" />)}
            </div>
        )
    }

    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-4 pb-8">

                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Users</h1>
                    <p className="text-xs text-slate-500 mt-0.5">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Search — full width on mobile */}
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Empty state */}
                {filteredUsers.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 py-16 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Users size={22} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                            {search ? `No users matching "${search}"` : 'No users yet'}
                        </p>
                        {search && (
                            <button onClick={() => setSearch('')} className="text-xs text-teal-700 font-medium hover:underline">
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Mobile card list (default) — hidden on lg+ */}
                        <div className="space-y-2 lg:hidden">
                            {filteredUsers.map(user => (
                                <button
                                    key={user._id}
                                    onClick={() => setSelectedUserId(user._id)}
                                    className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 text-left active:bg-slate-50 transition-colors"
                                >
                                    {/* Avatar */}
                                    <div className="w-11 h-11 rounded-full bg-teal-700 flex items-center justify-center text-white text-base font-bold shrink-0">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm truncate">{user.name}</p>
                                        <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                            {user.phone && (
                                                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                                    <Phone size={11} className="shrink-0" />
                                                    {user.phone}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                                <Calendar size={11} className="shrink-0" />
                                                {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            {(user.addresses?.length > 0) && (
                                                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                                    <MapPin size={11} className="shrink-0" />
                                                    {user.addresses.length} address{user.addresses.length !== 1 ? 'es' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <ChevronRight size={16} className="text-slate-300 shrink-0" />
                                </button>
                            ))}
                        </div>

                        {/* Desktop table — shown on lg+ */}
                        <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                                        <tr>
                                            <th className="px-5 py-3.5">User</th>
                                            <th className="px-5 py-3.5">Phone</th>
                                            <th className="px-5 py-3.5">Joined</th>
                                            <th className="px-5 py-3.5">Addresses</th>
                                            <th className="px-5 py-3.5"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredUsers.map(user => (
                                            <tr key={user._id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900">{user.name}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-600">
                                                    {user.phone || <span className="text-slate-300">—</span>}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                                                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                                                        {user.addresses?.length || 0}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <button
                                                        onClick={() => setSelectedUserId(user._id)}
                                                        className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline transition-colors"
                                                    >
                                                        View details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {selectedUserId && (
                <UserDetailModal
                    userId={selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}
        </>
    )
}