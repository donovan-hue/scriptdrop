import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaTimes, FaUser, FaFileAlt, FaShoppingBag } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function UniversalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Obtener sugerencias
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(`${API_URL}/search/suggestions`, {
          params: { query: searchQuery }
        });
        setSuggestions(response.data.suggestions);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Buscar globalmente
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setShowDropdown(false);

    try {
      const response = await axios.get(`${API_URL}/search/global`, {
        params: {
          query: searchQuery,
          category: selectedCategory === 'all' ? undefined : selectedCategory
        }
      });
      setResults(response.data.results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cerrar dropdown cuando clickea afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'user') {
      navigate(`/social/profile/${suggestion._id}`);
    } else if (suggestion.type === 'product') {
      navigate(`/shop/product/${suggestion._id}`);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div ref={searchRef} className="relative">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios, posts, ropa, comida..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setResults(null);
                }}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Buscar
          </button>
        </form>

        {/* Category Filter */}
        <div className="flex space-x-2 mb-4">
          {[
            { value: 'all', label: 'Todo' },
            { value: 'users', label: 'Usuarios' },
            { value: 'posts', label: 'Posts' },
            { value: 'products', label: 'Ropa' }
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0 flex items-center space-x-2"
              >
                {suggestion.type === 'user' && <FaUser className="text-blue-500" />}
                {suggestion.type === 'product' && <FaShoppingBag className="text-green-500" />}
                <span className="font-semibold">{suggestion.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Results */}
      {results && (
        <div className="mt-8 space-y-8">
          {/* Users Results */}
          {results.users.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                <FaUser /> <span>Usuarios ({results.users.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => navigate(`/social/profile/${user._id}`)}
                    className="bg-white rounded-lg shadow p-4 text-left hover:shadow-lg transition"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-600">{user._id}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Posts Results */}
          {results.posts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                <FaFileAlt /> <span>Posts ({results.posts.length})</span>
              </h2>
              <div className="space-y-4">
                {results.posts.map((post) => (
                  <div key={post._id} className="bg-white rounded-lg shadow p-4">
                    <p className="font-semibold text-gray-900 mb-2">{post.author?.username}</p>
                    <p className="text-gray-700 line-clamp-3">{post.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Results */}
          {results.products.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                <FaShoppingBag /> <span>Ropa ({results.products.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.products.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => navigate(`/shop/product/${product._id}`)}
                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                  >
                    {product.images && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-3">
                      <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                      <p className="text-lg font-bold text-blue-600">${product.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {results.users.length === 0 &&
            results.posts.length === 0 &&
            results.products.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-600 text-lg">No se encontraron resultados para "{searchQuery}"</p>
              </div>
            )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <p className="text-gray-600">Buscando...</p>
        </div>
      )}
    </div>
  );
}

export default UniversalSearch;
