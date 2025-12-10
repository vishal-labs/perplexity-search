import React, { useState, useEffect } from 'react';
import { Search, Mic, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SearchInput = ({ onSearch, isLoading, initialQuery = '' }) => {
    const [query, setQuery] = useState(initialQuery);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    const handleVoiceInput = () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setQuery(transcript);
                onSearch(transcript);
            };

            recognition.start();
        } else {
            alert('Voice input is not supported in this browser.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="search-form">
            <div className={`search-input-container ${isListening ? 'listening' : ''}`}>
                <Search className="search-icon" size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask anything..."
                    className="search-input"
                    disabled={isLoading}
                />
                <div className="search-actions">
                    <button
                        type="button"
                        className={`action-btn voice-btn ${isListening ? 'active' : ''}`}
                        onClick={handleVoiceInput}
                        title="Voice Search"
                    >
                        <Mic size={20} />
                    </button>
                    <button
                        type="submit"
                        className="action-btn submit-btn"
                        disabled={!query.trim() || isLoading}
                    >
                        {isLoading ? (
                            <div className="spinner-small"></div>
                        ) : (
                            <ArrowRight size={20} />
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default SearchInput;
