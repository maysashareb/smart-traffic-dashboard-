// src/App.js
import React, { useState } from 'react';
import SmartTrafficDashboard from './SmartTrafficDashboard';
import SecurityDashboard from './SecurityDashboard';
import { Shield, Activity } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState('traffic');

  return (
    <div>
      {/* Navigation Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)',
        padding: '16px 24px',
        borderBottom: '2px solid #475569',
        display: 'flex',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        <button
          onClick={() => setActiveView('traffic')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '15px',
            background: activeView === 'traffic'
              ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
              : 'transparent',
            color: 'white',
            transition: 'all 0.3s',
            boxShadow: activeView === 'traffic' ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none'
          }}
        >
          <Activity size={20} />
          Traffic Monitor
        </button>
        <button
          onClick={() => setActiveView('security')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '15px',
            background: activeView === 'security'
              ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
              : 'transparent',
            color: 'white',
            transition: 'all 0.3s',
            boxShadow: activeView === 'security' ? '0 4px 15px rgba(239, 68, 68, 0.4)' : 'none'
          }}
        >
          <Shield size={20} />
          Security Center
        </button>
      </div>

      {/* Active Dashboard */}
      {activeView === 'traffic' ? <SmartTrafficDashboard /> : <SecurityDashboard />}
    </div>
  );
}

export default App;