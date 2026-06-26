'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { getCart } from "@/services/cart.service";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);  

    const refreshCart = async () => {
        try {
            const data = await getCart();
            setCart(data.cart);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);   
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refreshCart();
    }, []);

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
