import api from "@/lib/api";

export const createOrder = async (orderData) => {
    const response = await api.post(`/api/orders`, orderData)
    return response.data
}

export const getMyOrders = async () => {
    const response = await api.get(`/api/orders/my`)
    return response.data
}

export const getOrderById = async (id) => {
    const response = await api.get(`/api/orders/${id}`)
    return response.data
}

export const getAllOrders = async () => {
    const response = await api.get(`/api/orders`)
    return response.data
}

export const updateOrderStatus = async (id, status) => {
    const response = await api.put(`/api/orders/${id}/status`, {status})
    return response.data
}