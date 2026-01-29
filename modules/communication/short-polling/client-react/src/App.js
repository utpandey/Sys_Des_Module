import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// Custom hook for short polling
function useShortPolling(intervalMs, enabled) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/data');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Only update if component is still mounted
      if (isMountedRef.current) {
        setData(result);
        setError(null);
        setRequestCount(prev => prev + 1);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      // Fetch immediately when enabled
      fetchData();

      // Then set up interval
      intervalRef.current = setInterval(() => {
        fetchData();
      }, intervalMs);
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMs, fetchData]);

  return { data, error, requestCount };
}

function App() {
  const [intervalMs, setIntervalMs] = useState(2000);
  const [isPolling, setIsPolling] = useState(false);
  const [dataHistory, setDataHistory] = useState([]);
  const { data, error, requestCount } = useShortPolling(intervalMs, isPolling);

  // Track data history when new data arrives
  useEffect(() => {
    if (data) {
      setDataHistory(prev => {
        const newHistory = [data, ...prev];
        // Keep only last 10 items
        return newHistory.slice(0, 10);
      });
    }
  }, [data]);

  const handleStart = () => {
    setIsPolling(true);
    setDataHistory([]);
  };

  const handleStop = () => {
    setIsPolling(false);
  };

  const formatTime = (timestamp) => {
    const timeDiff = Date.now() - timestamp;
    if (timeDiff < 1000) return 'just now';
    return `${Math.floor(timeDiff / 1000)}s ago`;
  };

  return (
    <div className="container">
      <h1>Short Polling Demo</h1>
      <p className="subtitle">Client repeatedly requests data at fixed intervals</p>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="interval">Polling Interval (milliseconds):</label>
          <input
            type="number"
            id="interval"
            value={intervalMs}
            onChange={(e) => {
              const newInterval = parseInt(e.target.value);
              if (newInterval >= 500 && newInterval <= 10000) {
                setIntervalMs(newInterval);
              }
            }}
            min="500"
            max="10000"
            step="500"
            disabled={isPolling}
          />
        </div>
        <button onClick={handleStart} disabled={isPolling}>
          Start Polling
        </button>
        <button onClick={handleStop} disabled={!isPolling}>
          Stop Polling
        </button>
      </div>

      <div className="status">
        <div className="status-item">
          <span className="status-label">Status:</span>
          <span className={`status-value ${isPolling ? 'active' : ''}`}>
            {isPolling ? (
              <>
                <span className="poll-indicator"></span>
                Polling...
              </>
            ) : (
              'Stopped'
            )}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Last Request:</span>
          <span className="status-value">
            {data ? new Date().toLocaleTimeString() : 'Never'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Request Count:</span>
          <span className="status-value">{requestCount}</span>
        </div>
        {error && (
          <div className="status-item">
            <span className="status-label">Error:</span>
            <span className="status-value error">{error}</span>
          </div>
        )}
      </div>

      <div className="data-display">
        <h2>Received Data</h2>
        {dataHistory.length === 0 ? (
          <p className="no-data">No data received yet. Start polling to see updates.</p>
        ) : (
          <div className="data-list">
            {dataHistory.map((item, index) => (
              <div key={`${item.version}-${item.timestamp}-${index}`} className="data-item">
                <div className="data-version">Version {item.version}</div>
                <div className="data-message">{item.message}</div>
                <div className="data-timestamp">
                  Server time: {new Date(item.timestamp).toLocaleTimeString()} ({formatTime(item.timestamp)})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
