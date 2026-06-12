'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/services/product.service';

export default function ProductsPage() {

    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();

                setProducts(data.products);

            } catch (error) {
                console.error(error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div>
            <h1>Products</h1>

            {products.map(product => (
                <div key={product._id}>
                    <h2>{product.name}</h2>
                    <p>₹{product.price}</p>
                </div>
            ))}
        </div>
    );
}