    import api from "@/lib/api";

    export const getProfile = async () => {
        const response = await api.get('/api/users/profile')
        return response.data
    }

    export const updateProfile = async (profileData) => {
        const response = await api.put('/api/users/profile', profileData)
        return response.data
    }