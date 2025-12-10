import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ExternalLink, Globe, Play, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';

const ResultCard = ({ result }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewType, setPreviewType] = useState(null); // 'video' or 'web'

    if (!result) return null;

    const { answer, sources } = result;

    const handleSourceClick = (e, url) => {
        e.preventDefault();
        if (ReactPlayer.canPlay(url)) {
            setPreviewType('video');
        } else {
            setPreviewType('web');
        }
        setPreviewUrl(url);
    };

    const closePreview = () => {
        setPreviewUrl(null);
        setPreviewType(null);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="result-card"
            >
                <div className="answer-section">
                    <h2 className="section-title">AI Answer</h2>
                    <div className="markdown-content">
                        <ReactMarkdown>{answer}</ReactMarkdown>
                    </div>
                </div>

                {sources && sources.length > 0 && (
                    <div className="sources-section">
                        <h3 className="section-title">Sources</h3>
                        <div className="sources-grid">
                            {sources.map((source, index) => {
                                const isVideo = ReactPlayer.canPlay(source.url);
                                return (
                                    <a
                                        key={index}
                                        href={source.url}
                                        onClick={(e) => handleSourceClick(e, source.url)}
                                        className="source-card"
                                    >
                                        <div className="source-icon">
                                            <img
                                                src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=32`}
                                                alt=""
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
                                            />
                                            <Globe size={16} style={{ display: 'none' }} />
                                        </div>
                                        <div className="source-info">
                                            <div className="source-title">{source.title || source.url}</div>
                                            <div className="source-domain">{new URL(source.url).hostname}</div>
                                        </div>
                                        {isVideo ? (
                                            <Play size={14} className="external-icon" />
                                        ) : (
                                            <Maximize2 size={14} className="external-icon" />
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="preview-modal-overlay"
                        onClick={closePreview}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="preview-modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="preview-header">
                                <div className="preview-title">
                                    {previewType === 'video' ? 'Video Player' : 'Website Preview'}
                                    <span className="preview-url">{previewUrl}</span>
                                </div>
                                <div className="preview-actions">
                                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="open-new-tab-btn" title="Open in new tab">
                                        <ExternalLink size={18} />
                                    </a>
                                    <button onClick={closePreview} className="close-preview-btn">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="preview-body">
                                {previewType === 'video' ? (
                                    <div className="video-wrapper">
                                        <ReactPlayer
                                            url={previewUrl}
                                            width="100%"
                                            height="100%"
                                            controls
                                            playing
                                        />
                                    </div>
                                ) : (
                                    <div className="iframe-wrapper">
                                        <iframe
                                            src={previewUrl}
                                            title="Preview"
                                            className="preview-iframe"
                                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                        />
                                        <div className="iframe-fallback">
                                            <p>If the content doesn't load, it might be blocked by the website.</p>
                                            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="fallback-btn">
                                                Open in New Tab
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ResultCard;
