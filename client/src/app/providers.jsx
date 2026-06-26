'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }) {
    return (
        <AuthProvider>
            <CartProvider>
                {children}
                <Toaster
                    position="top-right"
                    closeButton
                    duration={3000}
                />
            </CartProvider>
        </AuthProvider>
    );
}
