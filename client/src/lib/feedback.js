import { toast } from 'sonner';

export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
    if (error?.code === 'ERR_NETWORK' || !error?.response) {
        return 'Network error. Please check your connection.';
    }

    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    );
}

export const notify = {
    loginSuccess: () => toast.success('Welcome back', { description: 'You are signed in to NectarVeda.' }),
    logoutSuccess: () => toast.success('Logged out', { description: 'You have been returned to the home page.' }),
    cartAdd: (name) => toast.success('Added to cart', { description: name }),
    cartRemove: () => toast.success('Removed from cart'),
    cartUpdate: () => toast.success('Cart updated'),
    orderPlaced: () => toast.success('Order placed', { description: 'Check your orders for details' }),
    orderCancelled: () => toast.success('Order cancelled', { description: 'Refund will be processed shortly' }),
    profileSaved: () => toast.success('Profile updated', { description: 'Your changes have been saved' }),
    addressSaved: () => toast.success('Address saved'),
    error: (err) => toast.error(getErrorMessage(err)),
    info: (msg) => toast.info(msg),
};
