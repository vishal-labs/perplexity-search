const config = {
    // Use environment variable if available (Vite uses import.meta.env), otherwise fallback to localhost
    // Note: In Docker, you might need to adjust this depending on how the browser accesses the backend.
    // For local dev with separate ports, http://localhost:8000 is usually correct.
    API_BASE_URL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
};

export default config;
