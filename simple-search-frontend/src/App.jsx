import { useState, useEffect } from "react";
import { Menu, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchInput from "./components/SearchInput";
import ResultCard from "./components/ResultCard";
import HistoryDrawer from "./components/HistoryDrawer";
import "./App.css";

function App() {
  const [history, setHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/history/");
      const json = await res.json();
      setHistory(json.data || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleSearch = async (query) => {
    setLoading(true);
    setCurrentQuery(query);
    setHasSearched(true);
    setCurrentResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setCurrentResult(data);
      fetchHistory(); // Refresh history
    } catch (err) {
      console.error(err);
      setCurrentResult({
        answer: "Sorry, something went wrong while searching. Please try again.",
        sources: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/history/${id}`, { method: "DELETE" });
      setHistory(history.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const handleClearHistory = async () => {
    try {
      await fetch("http://127.0.0.1:8000/api/history", { method: "DELETE" });
      setHistory([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const handleHistorySelect = (item) => {
    setCurrentQuery(item.query);
    setCurrentResult(item.result);
    setHasSearched(true);
    setIsDrawerOpen(false);
  };

  const handleNewChat = () => {
    setHasSearched(false);
    setCurrentQuery("");
    setCurrentResult(null);
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-left">
          <button onClick={() => setIsDrawerOpen(true)} className="icon-btn">
            <Menu size={24} />
          </button>
          <span className="brand" onClick={handleNewChat}>Simple Search</span>
        </div>
        <div className="nav-right">
          {hasSearched && (
            <button onClick={handleNewChat} className="new-chat-btn">
              <Plus size={16} />
              <span>New Search</span>
            </button>
          )}
        </div>
      </nav>

      <main className={`main-content ${hasSearched ? 'results-mode' : 'hero-mode'}`}>
        <div className="content-wrapper">
          <motion.div
            layout
            className="search-section"
            initial={false}
            animate={hasSearched ? { y: 0 } : { y: 0 }}
          >
            {!hasSearched && (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hero-title"
              >
                Where knowledge begins
              </motion.h1>
            )}

            <SearchInput
              onSearch={handleSearch}
              isLoading={loading}
              initialQuery={currentQuery}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {hasSearched && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="results-container"
              >
                {loading ? (
                  <div className="loading-skeleton">
                    <div className="skeleton-line w-75"></div>
                    <div className="skeleton-line w-50"></div>
                    <div className="skeleton-line w-90"></div>
                  </div>
                ) : (
                  <ResultCard result={currentResult} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <HistoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        history={history}
        onSelect={handleHistorySelect}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearHistory}
      />
    </div>
  );
}

export default App;
