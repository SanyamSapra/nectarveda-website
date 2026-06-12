import api from "@/lib/api";

export const getCart = async () => {
    const response = await api.get(`/api/cart`)
    return response.data;
}

export const removeFromCart  = async (productId) => {
    const response = await api.delete(`/api/cart/${productId}`)
    return response.data;
}

export const addToCart = async (cartData) => {
    const response = await api.post(`/api/cart`, cartData)
    return response.data;
}

export const updateCart = async (productId, cartData) => {
    const response = await api.put(`/api/cart/${productId}`, cartData)
    return response.data;
}