import React from 'react';
import ReactPlayer from 'react-player';
import { ExternalLink, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

const LinkPreview = ({ url }) => {
    const [videoError, setVideoError] = React.useState(false);

    if (!url) return null;

    // Helper to check for problematic domains
    const isSocialMedia = (url) => {
        return /instagram\.com|facebook\.com|twitter\.com|x\.com|linkedin\.com/i.test(url);
    };

    // 1. Check if it's a playable video (and NOT a problematic social media link)
    // We skip social media here because they often block embedding or look bad in the player
    if (ReactPlayer.canPlay(url) && !isSocialMedia(url) && !videoError) {
        return (
            <div className="preview-container video-preview">
                <div className="player-wrapper">
                    <ReactPlayer
                        url={url}
                        width="100%"
                        height="100%"
                        controls
                        light
                        className="react-player"
                        onError={() => setVideoError(true)}
                    />
                </div>
            </div>
        );
    }

    // 2. Check if it's an image
    const isImage = /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
    if (isImage) {
        return (
            <div className="preview-container image-preview">
                <img src={url} alt="Preview" loading="lazy" onError={(e) => e.target.style.display = 'none'} />
            </div>
        );
    }

    // 3. Fallback: Generic Link Card
    let hostname = '';
    try {
        hostname = new URL(url).hostname;
    } catch (e) {
        hostname = url;
    }

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;

    return (
        <a href={url} target="_blank" rel="noreferrer" className="preview-card">
            <div className="preview-icon">
                <img
                    src={faviconUrl}
                    alt=""
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                />
                <LinkIcon size={24} style={{ display: 'none' }} />
            </div>
            <div className="preview-info">
                <span className="preview-domain">{hostname}</span>
                <span className="preview-cta">
                    Visit Website <ExternalLink size={12} />
                </span>
            </div>
        </a>
    );
};

export default LinkPreview;
