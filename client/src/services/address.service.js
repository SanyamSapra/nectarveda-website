import api from "@/lib/api";

export const getAddresses = async () => {
    const response = await api.get('/api/addresses')
    return response.data
}

export const addAddress = async (addressData) => {
    const response = await api.post('/api/addresses', addressData)
    return response.data
}

export const deleteAddress = async (addressId) => {
    const response = await api.delete(`/api/addresses/${addressId}`)
    return response.data
}