import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationToast from './components/NotificationToast';
import Welcome from './pages/Welcome';
import AdminDashboard from './admin/AdminDashboard';
import ProtectedAdminRoute from './admin/ProtectedAdminRoute';

// Lazy load modules
const SocialModule = lazy(() => import('./social/SocialModule'));
const ShopModule = lazy(() => import('./shop/ShopModule'));
const FoodModule = lazy(() => import('./food/FoodModule'));
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const OAuthCallback = lazy(() => import('./components/Auth/OAuthCallback'));
const UniversalSearch = lazy(() => import('./pages/Search'));
const HybridFeed = lazy(() => import('./pages/Feed'));
const UserProfile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const VirtualCinema = lazy(() => import('./pages/Cinema'));
const BlackHoleEvents = lazy(() => import('./pages/Events'));
const PortalKronos = lazy(() => import('./pages/Portal'));
const MiniAppDashboard = lazy(() => import('./pages/MiniApps'));
const KronosMockups = lazy(() => import('./pages/KronosMockups'));
const Pricing = lazy(() => import('./pages/Pricing'));
const SubscriptionSuccess = lazy(() => import('./pages/SubscriptionSuccess'));
const SubscriptionCancel = lazy(() => import('./pages/SubscriptionCancel'));

function App() {
  return (
    <Router>
      <NotificationToast />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(15, 15, 26, 0.95)',
            color: '#fff',
            border: '1px solid rgba(179, 68, 255, 0.3)',
            backdropFilter: 'blur(20px)'
          }
        }}
      />
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <Routes>
          {/* Welcome Page */}
          <Route path="/" element={<Welcome />} />

          {/* Design System Preview */}
          <Route path="/mockups" element={<KronosMockups />} />

          {/* Kronos Pro / Suscripciones */}
          <Route path="/pricing" element={<Pricing />} />
          <Route
            path="/subscription/success"
            element={
              <ProtectedRoute>
                <SubscriptionSuccess />
              </ProtectedRoute>
            }
          />
          <Route path="/subscription/cancel" element={<SubscriptionCancel />} />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/login" element={<Navigate to="/auth/login" />} />
          <Route path="/register" element={<Navigate to="/auth/register" />} />

          {/* Protected Routes */}
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Navbar />
                <UniversalSearch />
              </ProtectedRoute>
            }
          />

          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Navbar />
                <HybridFeed />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <Navbar />
                <UserProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/social/*"
            element={
              <ProtectedRoute>
                <Navbar />
                <SocialModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/*"
            element={
              <ProtectedRoute>
                <Navbar />
                <ShopModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/food/*"
            element={
              <ProtectedRoute>
                <Navbar />
                <FoodModule />
              </ProtectedRoute>
            }
          />

          {/* Settings (2FA + Sessions) */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Navbar />
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/:tab"
            element={
              <ProtectedRoute>
                <Navbar />
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Virtual Cinema Sync */}
          <Route
            path="/cinema"
            element={
              <ProtectedRoute>
                <Navbar />
                <div
                  className="min-h-screen p-6"
                  style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0528 50%, #0d1117 100%)' }}
                >
                  <VirtualCinema />
                </div>
              </ProtectedRoute>
            }
          />

          {/* BlackHole Events */}
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Navbar />
                <div
                  className="min-h-screen p-6"
                  style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0528 50%, #0d1117 100%)' }}
                >
                  <BlackHoleEvents />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Portal Kronos (Audio Rooms) */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <Navbar />
                <div
                  className="min-h-screen"
                  style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0528 50%, #0d1117 100%)' }}
                >
                  <PortalKronos />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Mini-Apps */}
          <Route
            path="/miniapps"
            element={
              <ProtectedRoute>
                <Navbar />
                <div
                  className="min-h-screen p-6"
                  style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0528 50%, #0d1117 100%)' }}
                >
                  <MiniAppDashboard />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Admin Panel */}
          <Route
            path="/admin/*"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
