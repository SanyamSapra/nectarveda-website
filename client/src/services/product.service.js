import api from "@/lib/api";

export const getProducts = async (search = '', category = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const response = await api.get(`/api/products?${params.toString()}`);
    return response.data;
};

export const getProductByID = async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data
}

export const createProduct = async (productData) => {
    const response = await api.post('/api/products', productData)
    return response.data
}

export const updateProduct = async (id, productData) => {
    const response = await api.put(`/api/products/${id}`, productData)
    return response.data
}

export const deleteProduct = async (id) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data
}