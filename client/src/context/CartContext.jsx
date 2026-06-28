'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { getCart } from "@/services/cart.service";
import { useAuth } from "@/context/AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user, loading: authLoading } = useAuth();
    const userId = user?._id;
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    const refreshCart = async () => {
        if (!user) {
            setCart(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await getCart();
            setCart(data.cart);
        } catch (error) {
            console.log(error);
            setCart(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;

        const loadCart = async () => {
            if (authLoading) return;

            if (!userId) {
                setCart(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const data = await getCart();
                if (active) setCart(data.cart);
            } catch (error) {
                console.log(error);
                if (active) setCart(null);
            } finally {
                if (active) setLoading(false);
            }
        };

        loadCart();

        return () => {
            active = false;
        };
    }, [authLoading, userId]);

    const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
        <CartContext.Provider value={{ cart, setCart, cartCount, refreshCart, loading }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
