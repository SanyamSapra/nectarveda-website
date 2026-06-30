import api from "@/lib/api";

export const registerUser = async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data
}   

export const loginUser = async (userData) => {
    const response = await api.post('/api/auth/login', userData)
    return response.data
}

export const verifyOtp = async (verificationData) => {
    const response = await api.post('/api/auth/verify-otp', verificationData)
    return response.data
}

export const resendOtp = async (email) => {
    const response = await api.post('/api/auth/resend-otp', { email })
    return response.data
}

export const logoutUser = async () => {
    const response = await api.post('/api/auth/logout')
    return response.data
}
