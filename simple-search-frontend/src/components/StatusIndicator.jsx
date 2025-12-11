import { useState, useEffect } from "react";
import { Activity, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import config from "../config";
import { motion, AnimatePresence } from "framer-motion";

const StatusIndicator = () => {
    const [status, setStatus] = useState("checking"); // checking, online, partial, offline
    const [details, setDetails] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const checkHealth = async () => {
        try {
            const res = await fetch(`${config.API_BASE_URL}/api/health`);
            if (!res.ok) throw new Error("Backend unreachable");
            const data = await res.json();

            setDetails(data);
            if (data.db_status === "connected") {
                setStatus("online");
            } else {
                setStatus("partial");
            }
        } catch (err) {
            console.error("Health check failed:", err);
            setStatus("offline");
            setDetails({ error: err.message });
        }
    };

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        switch (status) {
            case "online": return "#10B981"; // Emerald 500
            case "partial": return "#F59E0B"; // Amber 500
            case "offline": return "#EF4444"; // Red 500
            default: return "#6B7280"; // Gray 500
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case "online": return <CheckCircle2 size={16} />;
            case "partial": return <Database size={16} />;
            case "offline": return <AlertCircle size={16} />;
            default: return <Activity size={16} />;
        }
    };

    return (
        <div className="status-indicator-container" style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${getStatusColor()}40`,
                    color: getStatusColor(),
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
                className="status-button"
            >
                {getStatusIcon()}
                <span style={{ fontSize: '12px' }}>
                    {status === 'online' ? 'System Normal' :
                        status === 'partial' ? 'DB Issue' :
                            status === 'offline' ? 'Offline' : 'Checking...'}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 10px)',
                            right: 0,
                            width: '280px',
                            background: '#1a1b26',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            zIndex: 1000,
                        }}
                    >
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#fff' }}>System Status</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* API Status */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Backend API</span>
                                <span style={{
                                    color: status === 'offline' ? '#EF4444' : '#10B981',
                                    fontSize: '12px',
                                    display: 'flex', alignItems: 'center', gap: '4px'
                                }}>
                                    {status === 'offline' ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                                    {status === 'offline' ? 'Unreachable' : 'Connected'}
                                </span>
                            </div>

                            {/* DB Status */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Database</span>
                                <span style={{
                                    color: status === 'online' ? '#10B981' : '#EF4444',
                                    fontSize: '12px',
                                    display: 'flex', alignItems: 'center', gap: '4px'
                                }}>
                                    {status === 'online' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                    {details?.db_status === 'connected' ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>

                            {/* Endpoint */}
                            <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                                    Endpoint: {config.API_BASE_URL}
                                </p>
                                <button
                                    onClick={checkHealth}
                                    style={{
                                        marginTop: '8px',
                                        width: '100%',
                                        padding: '6px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Refresh Status
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StatusIndicator;
