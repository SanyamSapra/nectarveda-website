import api from "@/lib/api";

export const getProducts = async (search = '', category = '', options = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (options.featured !== undefined) params.append('featured', String(options.featured));
    
    const response = await api.get(`/api/products?${params.toString()}`);
    return response.data;
};

export const getProductByID = async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data
}

export const getTopSellingProducts = async () => {
    const response = await api.get('/api/products/top-selling');
    return response.data;
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
