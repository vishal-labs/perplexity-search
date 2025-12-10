import React from 'react';
import { X, Trash2, Clock, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HistoryDrawer = ({ isOpen, onClose, history, onSelect, onDelete, onClearAll }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="drawer-overlay"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="history-drawer"
                    >
                        <div className="drawer-header">
                            <div className="drawer-title">
                                <Clock size={20} />
                                <h2>History</h2>
                            </div>
                            <button onClick={onClose} className="close-btn">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="drawer-content">
                            {history.length === 0 ? (
                                <div className="empty-history">
                                    <Clock size={48} style={{ opacity: 0.2 }} />
                                    <p>No search history yet</p>
                                </div>
                            ) : (
                                <div className="history-list">
                                    {history.map((item) => (
                                        <div key={item.id} className="history-item">
                                            <div
                                                className="history-item-content"
                                                onClick={() => onSelect(item)}
                                            >
                                                <MessageSquare size={16} className="history-icon" />
                                                <span className="history-query">{item.query}</span>
                                            </div>
                                            <button
                                                className="delete-item-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(item.id);
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {history.length > 0 && (
                            <div className="drawer-footer">
                                <button onClick={onClearAll} className="clear-all-btn">
                                    <Trash2 size={16} />
                                    Clear All History
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default HistoryDrawer;
