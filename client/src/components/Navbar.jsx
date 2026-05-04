import React from 'react';
import { FaHome, FaShoppingBag, FaUtensils, FaUser, FaSignOutAlt, FaSearch, FaFire, FaUserShield, FaFilm, FaBolt, FaCog, FaHeadphones, FaTh } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import TierBadge from './TierBadge';
import useSubscription from '../hooks/useSubscription';

function Navbar() {
  const { user, logout } = useAuth();
  const { tier } = useSubscription();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/feed" className="flex items-center space-x-2 text-2xl font-bold">
            <span className="text-3xl">⭐</span>
            <span>Super-App</span>
          </Link>

          {/* Menu Central */}
          <div className="flex items-center space-x-8">
            <Link
              to="/feed"
              className="flex items-center space-x-2 hover:text-blue-200 transition"
              title="Hybrid Feed"
            >
              <FaHome /> <span>Home</span>
            </Link>
            <Link
              to="/search"
              className="flex items-center space-x-2 hover:text-blue-200 transition"
              title="Universal Search"
            >
              <FaSearch /> <span>Buscar</span>
            </Link>
            <Link
              to="/social"
              className="flex items-center space-x-2 hover:text-blue-200 transition"
            >
              <FaFire /> <span>Social</span>
            </Link>
            <Link
              to="/shop"
              className="flex items-center space-x-2 hover:text-blue-200 transition"
            >
              <FaShoppingBag /> <span>Shop</span>
            </Link>
            <Link
              to="/food"
              className="flex items-center space-x-2 hover:text-blue-200 transition"
            >
              <FaUtensils /> <span>Food</span>
            </Link>
            <Link
              to="/cinema"
              className="flex items-center space-x-2 hover:text-blue-200 transition"
              title="Cine Virtual"
            >
              <FaFilm /> <span>Cine</span>
            </Link>
            <Link
              to="/events"
              className="flex items-center space-x-2 hover:text-blue-200 transition"
              title="Eventos Agujero Negro"
            >
              <FaBolt /> <span>Eventos</span>
            </Link>
            <Link
              to="/portal"
              className="flex items-center space-x-2 hover:text-blue-200 transition"
              title="Portal Kronos - Salas de Audio"
            >
              <FaHeadphones /> <span>Portal</span>
            </Link>
            <Link
              to="/miniapps"
              className="flex items-center space-x-2 hover:text-blue-200 transition"
              title="Mini-Apps"
            >
              <FaTh /> <span>Apps</span>
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center space-x-2 transition"
                style={{
                  background: 'linear-gradient(135deg, rgba(179,68,255,0.35), rgba(0,212,255,0.35))',
                  border: '1px solid rgba(179,68,255,0.5)',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  color: '#e4b0ff',
                  fontWeight: '700',
                  fontSize: '13px',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                <FaUserShield /> <span>Admin Panel</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4 border-l border-blue-400 pl-8">
            {user && (
              <>
                {/* Centro de notificaciones */}
                <NotificationCenter />

                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center space-x-2 hover:text-blue-200 transition"
                >
                  <img
                    src={user.avatar || 'https://via.placeholder.com/32'}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm">{user.username}</span>
                  <TierBadge tier={tier} />
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center space-x-1 hover:text-blue-200 transition"
                  title="Configuracion"
                >
                  <FaCog />
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
                >
                  <FaSignOutAlt /> <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
