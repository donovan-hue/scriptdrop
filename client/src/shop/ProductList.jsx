import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaStar } from 'react-icons/fa';

function ProductList({ products, addToCart }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ropa Collection</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
          >
            {/* Product Image */}
            <img
              src={product.images?.[0] || product.image || product.imageUrl || ''}
              alt={product.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='192' viewBox='0 0 300 192'%3E%3Crect width='300' height='192' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3ENo image available%3C/text%3E%3C/svg%3E`;
              }}
            />

            {/* Product Info */}
            <div className="p-4">
              <Link
                to={`/shop/product/${product._id}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 truncate block"
              >
                {product.name}
              </Link>

              <div className="flex items-center mt-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < Math.round(product.rating) ? '' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-gray-600 text-sm ml-2">({product.reviews?.length || 0})</span>
              </div>

              <p className="text-gray-600 text-sm mt-2 line-clamp-2">{product.description}</p>

              <div className="flex justify-between items-center mt-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">${product.price}</p>
                  {product.originalPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      ${product.originalPrice}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition"
                  title="Add to cart"
                >
                  <FaShoppingCart />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
