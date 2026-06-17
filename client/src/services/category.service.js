import api from "@/lib/api";

export const getCategories = async () => {
    const response = await api.get('/api/categories');
    return response.data;
}