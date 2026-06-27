'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Tag, X, Check, Loader2 } from 'lucide-react'

function CategoryModal({ category, onClose, onSave }) {
    const [name, setName] = useState(category?.name || '')
    const [description, setDescription] = useState(category?.description || '')
    const [saving, setSaving] = useState(false)

    const handleSubmit = async () => {
        if (!name.trim()) return toast.error('Category name is required')
        setSaving(true)
        try {
            if (category) {
                await api.put(`/api/categories/${category._id}`, { name, description })
                toast.success('Category updated')
            } else {
                await api.post('/api/categories', { name, description })
                toast.success('Category created')
            }
            onSave()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-900">
                        {category ? 'Edit Category' : 'New Category'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Hair Care"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Optional description..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-60 transition-colors"
                    >
                        {saving
                            ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                            : <><Check size={14} /> {category ? 'Update' : 'Create'}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

function DeleteConfirmModal({ category, onClose, onConfirm, deleting }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6 space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto">
                    <Trash2 size={20} className="text-red-500" />
                </div>
                <div className="text-center">
                    <h2 className="text-base font-semibold text-slate-900">Delete category?</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        <span className="font-medium text-slate-700">"{category.name}"</span> will be permanently deleted. This cannot be undone.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
                    >
                        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(null) // null | { type: 'create' | 'edit' | 'delete', category? }
    const [deleting, setDeleting] = useState(false)

    useEffect(() => { fetchCategories() }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const res = await api.get('/api/categories')
            setCategories(res.data.categories)
        } catch {
            toast.error('Failed to fetch categories')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await api.delete(`/api/categories/${modal.category._id}`)
            toast.success('Category deleted')
            setModal(null)
            fetchCategories()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete')
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-3 animate-pulse">
                <div className="h-10 w-36 bg-slate-200 rounded-xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900">Categories</h1>
                        <p className="text-sm text-slate-500 mt-0.5">{categories.length} total</p>
                    </div>
                    <button
                        onClick={() => setModal({ type: 'create' })}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors shadow-sm"
                    >
                        <Plus size={16} />
                        New Category
                    </button>
                </div>

                {/* Grid */}
                {categories.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 py-20 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Tag size={22} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">No categories yet</p>
                        <button
                            onClick={() => setModal({ type: 'create' })}
                            className="text-xs text-teal-700 font-medium hover:underline"
                        >
                            Create your first category
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(cat => (
                            <div key={cat._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-slate-300 transition-all duration-200">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                                            <Tag size={16} className="text-teal-700" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 text-sm leading-snug">{cat.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => setModal({ type: 'edit', category: cat })}
                                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-teal-700 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => setModal({ type: 'delete', category: cat })}
                                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                                {cat.description && (
                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{cat.description}</p>
                                )}
                                <div className="mt-auto pt-2 border-t border-slate-100">
                                    <span className="text-[11px] font-mono text-slate-400">{cat._id.slice(-8)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {(modal?.type === 'create' || modal?.type === 'edit') && (
                <CategoryModal
                    category={modal.type === 'edit' ? modal.category : null}
                    onClose={() => setModal(null)}
                    onSave={() => { setModal(null); fetchCategories() }}
                />
            )}

            {modal?.type === 'delete' && (
                <DeleteConfirmModal
                    category={modal.category}
                    onClose={() => setModal(null)}
                    onConfirm={handleDelete}
                    deleting={deleting}
                />
            )}
        </>
    )
}