import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TwoFactorSetup from '../components/security/TwoFactorSetup';
import ActiveSessions from '../components/security/ActiveSessions';

const TABS = [
  { id: '2fa', label: '2FA', icon: '🔐', desc: 'Autenticacion en dos pasos' },
  { id: 'sessions', label: 'Sesiones', icon: '📱', desc: 'Dispositivos activos' }
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('2fa');

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0d1117 100%)'
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Configuracion</h1>
          <p className="text-white/40 text-sm">Seguridad y privacidad de tu cuenta</p>
        </div>

        {/* Tab bar */}
        <div
          className="flex gap-2 mb-8 p-1.5 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)'
          }}
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-200 text-sm font-medium"
              style={
                activeTab === tab.id
                  ? {
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))',
                      border: '1px solid rgba(139,92,246,0.4)',
                      color: '#c4b5fd'
                    }
                  : { color: 'rgba(255,255,255,0.4)', border: '1px solid transparent' }
              }
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === '2fa' && <TwoFactorSetup />}
            {activeTab === 'sessions' && <ActiveSessions />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
