import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import Checkout from './Checkout';
import MyOrders from './MyOrders';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function ShopModule() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products`);
        setProducts(response.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.productId === product._id);

    if (existingItem) {
      const updatedCart = cart.map((item) =>
        item.productId === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      saveCart(updatedCart);
    } else {
      saveCart([
        ...cart,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          quantity: 1
        }
      ]);
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<ProductList products={products} addToCart={addToCart} />}
      />
      <Route
        path="/product/:id"
        element={<ProductDetail products={products} addToCart={addToCart} />}
      />
      <Route
        path="/cart"
        element={<Cart cart={cart} setCart={saveCart} />}
      />
      <Route
        path="/checkout"
        element={<Checkout cart={cart} />}
      />
      <Route
        path="/my-orders"
        element={<MyOrders />}
      />
    </Routes>
  );
}

export default ShopModule;
