'use client'

import { useState, useEffect, useRef } from 'react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, X, Check, Loader2, ImageOff, PackageSearch, Tag, Upload, Search } from 'lucide-react'

// ─── Tag Input ───────────────────────────────────────────────
function TagInput({ label, values, onChange, placeholder }) {
    const [input, setInput] = useState('')

    const add = () => {
        const val = input.trim()
        if (val && !values.includes(val)) onChange([...values, val])
        setInput('')
    }

    const remove = (i) => onChange(values.filter((_, idx) => idx !== i))

    return (
        <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
                {values.map((v, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium px-2.5 py-1 rounded-full border border-teal-100">
                        {v}
                        <button onClick={() => remove(i)} className="hover:text-red-500 transition-colors"><X size={11} /></button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
                <button onClick={add} type="button" className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700 text-sm font-medium transition-colors">
                    Add
                </button>
            </div>
        </div>
    )
}

// ─── Product Form Modal ───────────────────────────────────────
function ProductModal({ product, categories, onClose, onSave }) {
    const [form, setForm] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price ?? '',
        salePrice: product?.salePrice ?? '',
        stock: product?.stock ?? '',
        sku: product?.sku || '',
        category: product?.category?._id || product?.category || '',
        isFeatured: product?.isFeatured || false,
        ingredients: product?.ingredients || [],
        benefits: product?.benefits || [],
        conditions: product?.conditions || [],
    })
    const [images, setImages] = useState([])
    const [previews, setPreviews] = useState(product?.images || [])
    const [saving, setSaving] = useState(false)
    const fileRef = useRef()

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

    const handleFiles = (e) => {
        const files = Array.from(e.target.files)
        setImages(files)
        setPreviews(files.map(f => URL.createObjectURL(f)))
    }

    const handleSubmit = async () => {
        if (!form.name.trim()) return toast.error('Name is required')
        if (!form.description.trim()) return toast.error('Description is required')
        if (!form.price) return toast.error('Price is required')
        if (!form.category) return toast.error('Category is required')

        setSaving(true)
        try {
            const fd = new FormData()
            Object.entries(form).forEach(([k, v]) => {
                if (Array.isArray(v)) {
                    v.forEach(item => fd.append(k, item))
                } else {
                    fd.append(k, v)
                }
            })
            images.forEach(img => fd.append('images', img))

            if (product) {
                await api.put(`/api/products/${product._id}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                toast.success('Product updated')
            } else {
                await api.post('/api/products', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                toast.success('Product created')
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <h2 className="text-base font-semibold text-slate-900">
                        {product ? 'Edit Product' : 'New Product'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Name *</label>
                        <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                            placeholder="e.g. Bhringraj Hair Oil"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Description *</label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)}
                            rows={3} placeholder="Product description..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Price (₹) *', key: 'price', placeholder: '299' },
                            { label: 'Sale Price (₹)', key: 'salePrice', placeholder: 'Optional' },
                            { label: 'Stock *', key: 'stock', placeholder: '50' },
                        ].map(({ label, key, placeholder }) => (
                            <div key={key}>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
                                <input type="number" value={form[key]} onChange={e => set(key, e.target.value)}
                                    placeholder={placeholder} min={0}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition" />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">SKU</label>
                            <input type="text" value={form.sku} onChange={e => set('sku', e.target.value)}
                                placeholder="e.g. NV-HAIR-001"
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Category *</label>
                            <select value={form.category} onChange={e => set('category', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white">
                                <option value="">Select category</option>
                                {categories.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <TagInput label="Ingredients" values={form.ingredients} onChange={v => set('ingredients', v)} placeholder="e.g. Bhringraj oil — press Enter" />
                    <TagInput label="Benefits" values={form.benefits} onChange={v => set('benefits', v)} placeholder="e.g. Reduces hair fall — press Enter" />
                    <TagInput label="Conditions" values={form.conditions} onChange={v => set('conditions', v)} placeholder="e.g. Dandruff — press Enter" />

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Images</label>
                        <div onClick={() => fileRef.current.click()}
                            className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors">
                            <Upload size={20} className="mx-auto text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500">Click to upload images</p>
                            <p className="text-xs text-slate-400 mt-0.5">Max 5 images</p>
                        </div>
                        <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
                        {previews.length > 0 && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                                {previews.map((src, i) => (
                                    <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div onClick={() => set('isFeatured', !form.isFeatured)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${form.isFeatured ? 'bg-teal-600' : 'bg-slate-200'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFeatured ? 'translate-x-5' : ''}`} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">Featured product</span>
                    </label>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-60 transition-colors">
                        {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Check size={14} /> {product ? 'Update' : 'Create'}</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Delete Confirm ───────────────────────────────────────────
function DeleteConfirmModal({ product, onClose, onConfirm, deleting }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6 space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto">
                    <Trash2 size={20} className="text-red-500" />
                </div>
                <div className="text-center">
                    <h2 className="text-base font-semibold text-slate-900">Delete product?</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        <span className="font-medium text-slate-700">&quot;{product.name}&quot;</span> will be permanently deleted.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={deleting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-colors">
                        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminProductsPage() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [search, setSearch] = useState('')

    const fetchData = async () => {
        try {
            setLoading(true)
            const [pRes, cRes] = await Promise.all([
                api.get('/api/products'),
                api.get('/api/categories')
            ])
            setProducts(pRes.data.products)
            setCategories(cRes.data.categories)
        } catch {
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchData() }, [])

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await api.delete(`/api/products/${modal.product._id}`)
            toast.success('Product deleted')
            setModal(null)
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete')
        } finally {
            setDeleting(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.name.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-72 bg-slate-200 rounded-2xl" />)}
            </div>
        )
    }

    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900">Products</h1>
                        <p className="text-sm text-slate-500 mt-0.5">{products.length} total product{products.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition w-52"
                            />
                        </div>
                        <button
                            onClick={() => setModal({ type: 'create' })}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            New Product
                        </button>
                    </div>
                </div>

                {/* Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 py-20 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <PackageSearch size={22} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                            {search ? `No products matching "${search}"` : 'No products yet'}
                        </p>
                        {!search && (
                            <button onClick={() => setModal({ type: 'create' })} className="text-xs text-teal-700 font-medium hover:underline">
                                Add your first product
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <div key={product._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col">
                                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageOff size={28} className="text-slate-300" />
                                        </div>
                                    )}
                                    {product.isFeatured && (
                                        <span className="absolute top-2 left-2 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>
                                    )}
                                    {product.salePrice && (
                                        <span className="absolute top-2 right-2 bg-teal-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Sale</span>
                                    )}
                                </div>

                                <div className="p-4 flex flex-col flex-1 gap-2">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{product.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Tag size={11} className="text-slate-400" />
                                            <span className="text-xs text-slate-400">{product.category?.name}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-bold text-slate-900 text-sm">₹{product.salePrice || product.price}</span>
                                            {product.salePrice && (
                                                <span className="text-xs text-slate-400 line-through ml-1.5">₹{product.price}</span>
                                            )}
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                                        </span>
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                                        <button onClick={() => setModal({ type: 'edit', product })}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors">
                                            <Pencil size={13} /> Edit
                                        </button>
                                        <button onClick={() => setModal({ type: 'delete', product })}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                                            <Trash2 size={13} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {(modal?.type === 'create' || modal?.type === 'edit') && (
                <ProductModal
                    product={modal.type === 'edit' ? modal.product : null}
                    categories={categories}
                    onClose={() => setModal(null)}
                    onSave={() => { setModal(null); fetchData() }}
                />
            )}

            {modal?.type === 'delete' && (
                <DeleteConfirmModal
                    product={modal.product}
                    onClose={() => setModal(null)}
                    onConfirm={handleDelete}
                    deleting={deleting}
                />
            )}
        </>
    )
}
