// src/SmartTrafficDashboard.jsx - WITH INTEGRATED SECURITY
import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Activity,
  TrendingUp,
  MapPin,
  Clock,
  Zap,
  Settings,
  Play,
  Pause,
  Shield,
  Ban,
  Eye,
  AlertTriangle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001';

const SmartTrafficDashboard = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedJunction, setSelectedJunction] = useState('junction_1');
  const [anomalyData, setAnomalyData] = useState([]);
  const [trafficStats, setTrafficStats] = useState({
    totalLanes: 16,
    activeAlerts: 0,
    avgFlow: 0,
    efficiency: 0,
  });

  // Security state
  const [securityEnabled, setSecurityEnabled] = useState(true);
  const [securityStatus, setSecurityStatus] = useState({
    status: 'active',
    blocked_ips: 0,
    recent_attacks: 0,
    threat_level: 'low'
  });
  const [recentAttacks, setRecentAttacks] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);

  // Generate mock data as fallback
  const generateMockData = () => {
    const lanes = Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      name: `Lane ${i + 1}`,
      anomalyScore: Math.random() * 100,
      flow: Math.floor(Math.random() * 200),
      status: Math.random() > 0.8 ? 'warning' : 'normal'
    }));

    setAnomalyData(lanes);

    const activeAlerts = lanes.filter((l) => l.status === 'warning').length;
    const avgFlow = Math.floor(lanes.reduce((acc, l) => acc + l.flow, 0) / lanes.length);

    setTrafficStats({
      totalLanes: 16,
      activeAlerts,
      avgFlow,
      efficiency: Math.floor(85 + Math.random() * 10),
    });
  };

  // Fetch traffic data
  useEffect(() => {
    if (!isMonitoring) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/simulate?timesteps=72`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const json = await res.json();

        if (!json.lanes) {
          generateMockData();
          return;
        }

        const lanes = json.lanes.map((lane) => ({
          id: lane.lane_id,
          name: `Lane ${lane.lane_id}`,
          anomalyScore: lane.anomaly_score,
          flow: lane.flow,
          status: lane.status,
        }));

        setAnomalyData(lanes);

        const activeAlerts = lanes.filter((l) => l.status === 'warning').length;
        const avgFlow =
          lanes.length > 0
            ? Math.floor(lanes.reduce((acc, l) => acc + l.flow, 0) / lanes.length)
            : 0;

        setTrafficStats({
          totalLanes: lanes.length,
          activeAlerts,
          avgFlow,
          efficiency: Math.floor(85 + Math.random() * 10),
        });
      } catch (err) {
        console.error('Error fetching data from backend:', err);
        generateMockData();
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [isMonitoring, selectedJunction]);

  // Fetch security data
  useEffect(() => {
    if (!securityEnabled) return;

    const fetchSecurityData = async () => {
      try {
        const [statusRes, attacksRes, logsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/security/status`),
          fetch(`${API_BASE_URL}/api/security/attacks`),
          fetch(`${API_BASE_URL}/api/security/logs?limit=5`)
        ]);

        const status = await statusRes.json();
        const attacksData = await attacksRes.json();
        const logsData = await logsRes.json();

        setSecurityStatus(status);
        setRecentAttacks(attacksData.attacks || []);
        setSecurityLogs(logsData.logs || []);
      } catch (error) {
        console.error('Error fetching security data:', error);
      }
    };

    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 3000);
    return () => clearInterval(interval);
  }, [securityEnabled]);

  const simulateAttack = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/security/simulate-attack`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        console.log('✅ Attack simulated:', data.attack);
        // Immediately fetch updated security data without page reload
        const [statusRes, attacksRes, logsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/security/status`),
          fetch(`${API_BASE_URL}/api/security/attacks`),
          fetch(`${API_BASE_URL}/api/security/logs?limit=5`)
        ]);

        const status = await statusRes.json();
        const attacksData = await attacksRes.json();
        const logsData = await logsRes.json();

        setSecurityStatus(status);
        setRecentAttacks(attacksData.attacks || []);
        setSecurityLogs(logsData.logs || []);
        
        console.log('🛡️ Security updated:', {
          blocked_ips: status.blocked_ips,
          recent_attacks: status.recent_attacks,
          threat_level: status.threat_level
        });
      }
    } catch (error) {
      console.error('Error simulating attack:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score > 70) return '#ef4444';
    if (score > 40) return '#eab308';
    return '#10b981';
  };

  const getScoreTextColor = (score) => {
    if (score > 70) return '#dc2626';
    if (score > 40) return '#ca8a04';
    return '#059669';
  };

  const getThreatColor = (level) => {
    const colors = {
      low: '#10b981',
      medium: '#eab308',
      high: '#ef4444',
      critical: '#dc2626'
    };
    return colors[level] || colors.low;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#10b981',
      medium: '#eab308',
      high: '#f97316',
      critical: '#ef4444'
    };
    return colors[severity] || colors.low;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      color: 'white',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header with Security Toggle */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              marginBottom: '8px',
              background: 'linear-gradient(to right, #60a5fa, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Smart Traffic Junction Monitor
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Real-time anomaly detection using GMRT AI Model with Security Protection
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '16px',
                background: isMonitoring
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {isMonitoring ? <Pause size={20} /> : <Play size={20} />}
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
            <button
              onClick={simulateAttack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '16px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: 'white',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <Zap size={20} />
              Simulate Attack
            </button>
          </div>
        </div>

        {/* Junction Selector */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['junction_1', 'junction_2', 'junction_3'].map((j) => (
            <button
              key={j}
              onClick={() => setSelectedJunction(j)}
              style={{
                padding: '12px 20px',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s',
                background: selectedJunction === j
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  : '#334155',
                color: selectedJunction === j ? 'white' : '#cbd5e1'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {j.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Security Status Banner */}
      {securityEnabled && (
        <div style={{
          background: `linear-gradient(90deg, ${getThreatColor(securityStatus.threat_level)}22, transparent)`,
          border: `1px solid ${getThreatColor(securityStatus.threat_level)}`,
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Shield size={24} style={{ color: getThreatColor(securityStatus.threat_level) }} />
            <div>
              <div style={{ fontWeight: '600', fontSize: '15px' }}>
                Security Protection: {securityStatus.status.toUpperCase()}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                Threat Level: <span style={{ 
                  color: getThreatColor(securityStatus.threat_level), 
                  fontWeight: '600' 
                }}>
                  {securityStatus.threat_level.toUpperCase()}
                </span> | 
                Blocked IPs: {securityStatus.blocked_ips} | 
                Recent Attacks: {securityStatus.recent_attacks}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSecurityPanel(!showSecurityPanel)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            {showSecurityPanel ? 'Hide' : 'Show'} Security Details
          </button>
        </div>
      )}

      {/* Security Details Panel */}
      {showSecurityPanel && securityEnabled && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #475569'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Eye size={20} />
            Live Security Monitor
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* Recent Attacks */}
            <div style={{
              background: '#0f172a',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#ef4444' }}>
                <AlertTriangle size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Recent Attacks ({recentAttacks.length})
              </h4>
              {recentAttacks.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '16px' }}>
                  No attacks detected
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {recentAttacks.slice(0, 3).map((attack, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#1e293b',
                        borderRadius: '8px',
                        padding: '10px',
                        borderLeft: `3px solid ${getSeverityColor(attack.severity)}`
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                        {attack.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {attack.source_ip} - {new Date(attack.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security Logs */}
            <div style={{
              background: '#0f172a',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#3b82f6' }}>
                <Activity size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Security Logs ({securityLogs.length})
              </h4>
              {securityLogs.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '16px' }}>
                  No events logged
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {securityLogs.slice(0, 3).map((log, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#1e293b',
                        borderRadius: '8px',
                        padding: '10px',
                        borderLeft: `3px solid ${getSeverityColor(log.severity)}`
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                        {log.type.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {log.ip_address} - {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {[
          { icon: MapPin, color: '#60a5fa', value: trafficStats.totalLanes, label: 'Total Lanes' },
          { icon: AlertCircle, color: '#ef4444', value: trafficStats.activeAlerts, label: 'Active Alerts' },
          { icon: Activity, color: '#10b981', value: trafficStats.avgFlow, label: 'Avg Flow (vehicles/min)' },
          { icon: TrendingUp, color: '#22d3ee', value: `${trafficStats.efficiency}%`, label: 'System Efficiency' }
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              background: 'linear-gradient(135deg, #1e293b, #334155)',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid #475569',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <stat.icon size={32} style={{ color: stat.color, filter: `drop-shadow(0 0 8px ${stat.color})` }} />
              <span style={{ fontSize: '40px', fontWeight: '800' }}>{stat.value}</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content - Rest of your existing dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 1024 ? '2fr 1fr' : '1fr',
        gap: '24px'
      }}>
        {/* Lane Status Grid - Your existing code */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          borderRadius: '20px',
          padding: '28px',
          border: '1px solid #475569'
        }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '22px',
            fontWeight: '700',
            marginBottom: '24px'
          }}>
            <Zap size={24} style={{ color: '#eab308', filter: 'drop-shadow(0 0 10px #eab308)' }} />
            Lane Anomaly Scores
          </h2>

          {!isMonitoring ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94a3b8' }}>
              <Activity size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>Click "Start Monitoring" to begin real-time detection</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '16px'
            }}>
              {anomalyData.map((lane) => (
                <div
                  key={lane.id}
                  style={{
                    background: '#0f172a',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #334155',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#cbd5e1' }}>
                      {lane.name}
                    </span>
                    {lane.status === 'warning' && (
                      <AlertCircle size={18} style={{ color: '#ef4444' }} />
                    )}
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: '#94a3b8',
                      marginBottom: '8px'
                    }}>
                      <span>Score</span>
                      <span style={{
                        fontWeight: '700',
                        color: getScoreTextColor(lane.anomalyScore)
                      }}>
                        {lane.anomalyScore.toFixed(1)}
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '10px',
                      background: '#334155',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(lane.anomalyScore, 100)}%`,
                        background: `linear-gradient(90deg, ${getScoreColor(lane.anomalyScore)}, ${getScoreColor(lane.anomalyScore)})`,
                        borderRadius: '10px',
                        transition: 'width 0.6s',
                        boxShadow: `0 0 15px ${getScoreColor(lane.anomalyScore)}`
                      }} />
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                    Flow: <span style={{ color: 'white', fontWeight: '700' }}>{lane.flow}</span> v/min
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts Panel - Your existing code */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          borderRadius: '20px',
          padding: '28px',
          border: '1px solid #475569'
        }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '22px',
            fontWeight: '700',
            marginBottom: '24px'
          }}>
            <Clock size={24} style={{ color: '#fb923c', filter: 'drop-shadow(0 0 8px #fb923c)' }} />
            Recent Alerts
          </h2>

          <div>
            {isMonitoring && anomalyData.filter((l) => l.status === 'warning').length > 0 ? (
              anomalyData
                .filter((l) => l.status === 'warning')
                .slice(0, 5)
                .map((lane) => (
                  <div
                    key={lane.id}
                    style={{
                      background: '#0f172a',
                      borderRadius: '12px',
                      padding: '18px',
                      borderLeft: '4px solid #ef4444',
                      marginBottom: '12px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '15px' }}>
                          {lane.name} Anomaly
                        </p>
                        <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
                          Score: {lane.anomalyScore.toFixed(1)} | Flow: {lane.flow} v/min
                        </p>
                      </div>
                      <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>
                      Just now
                    </p>
                  </div>
                ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 24px', color: '#94a3b8' }}>
                <AlertCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: '14px' }}>No active alerts</p>
              </div>
            )}
          </div>

          {/* Model Info */}
          <div style={{
            marginTop: '28px',
            paddingTop: '28px',
            borderTop: '1px solid #334155'
          }}>
            <h3 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '15px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#cbd5e1'
            }}>
              <Settings size={16} />
              Model Configuration
            </h3>
            <div>
              {[
                { label: 'Model', value: 'GMRT' },
                { label: 'Layers', value: '2' },
                { label: 'Patch Sizes', value: '6, 12, 36' },
                { label: 'Window', value: '72 timesteps' },
                {
                  label: 'Status',
                  value: isMonitoring ? 'Active' : 'Inactive',
                  color: isMonitoring ? '#10b981' : '#ef4444'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    color: '#94a3b8',
                    marginBottom: '10px',
                    padding: '8px 0',
                    borderBottom: idx < 4 ? '1px solid rgba(100, 116, 139, 0.2)' : 'none'
                  }}
                >
                  <span>{item.label}:</span>
                  <span style={{
                    color: item.color || 'white',
                    fontWeight: '600',
                    textShadow: item.color ? `0 0 8px ${item.color}` : 'none'
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div style={{
        marginTop: '28px',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '16px',
        padding: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ color: '#bfdbfe', fontSize: '14px', lineHeight: '1.8' }}>
          <strong style={{ color: '#60a5fa' }}>System Status:</strong> Traffic monitoring with GMRT AI + Real-time security protection active. 
          Click "Simulate Attack" to test the security system's response to threats.
        </p>
      </div>
    </div>
  );
};

export default SmartTrafficDashboard;