import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// Custom hook for long polling
function useLongPolling(timeoutMs, enabled) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const [currentVersion, setCurrentVersion] = useState(-1);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  const longPoll = useCallback(async (version) => {
    if (!enabled || !isMountedRef.current) return;

    try {
      // Create new AbortController for this request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const url = `/api/data?version=${version}&timeout=${timeoutMs}`;
      const response = await fetch(url, {
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!isMountedRef.current) return;

      // Update version if new
      if (result.version > version) {
        setCurrentVersion(result.version);
      }

      setData(result);
      setError(null);
      setRequestCount(prev => prev + 1);

      // Immediately make another request (sequential long polling)
      if (enabled && isMountedRef.current) {
        longPoll(result.version);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      // Don't count abort errors
      if (err.name === 'AbortError') {
        return;
      }

      setError(err.message);

      // Retry after delay
      if (enabled && isMountedRef.current) {
        setTimeout(() => {
          if (enabled && isMountedRef.current) {
            longPoll(version);
          }
        }, 2000);
      }
    }
  }, [enabled, timeoutMs]);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      longPoll(currentVersion);
    }

    return () => {
      isMountedRef.current = false;
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [enabled, longPoll, currentVersion]);

  return { data, error, requestCount, currentVersion };
}

function App() {
  const [timeoutMs, setTimeoutMs] = useState(30000);
  const [isPolling, setIsPolling] = useState(false);
  const [dataHistory, setDataHistory] = useState([]);
  const { data, error, requestCount, currentVersion } = useLongPolling(timeoutMs, isPolling);

  // Track data history when new data arrives
  useEffect(() => {
    if (data && data.version > (dataHistory[0]?.version || -1)) {
      setDataHistory(prev => {
        const newHistory = [data, ...prev];
        return newHistory.slice(0, 10);
      });
    }
  }, [data, dataHistory]);

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

  const getStatusText = () => {
    if (!isPolling) return 'Stopped';
    if (error) return `Error: ${error}`;
    if (data?.timeout) return 'Timeout (reconnecting...)';
    return 'Waiting for update...';
  };

  return (
    <div className="container">
      <h1>Long Polling Demo</h1>
      <p className="subtitle">Server holds connection open until data changes or timeout</p>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="timeout">Timeout (milliseconds):</label>
          <input
            type="number"
            id="timeout"
            value={timeoutMs}
            onChange={(e) => {
              const newTimeout = parseInt(e.target.value);
              if (newTimeout >= 5000 && newTimeout <= 60000) {
                setTimeoutMs(newTimeout);
              }
            }}
            min="5000"
            max="60000"
            step="5000"
            disabled={isPolling}
          />
        </div>
        <button onClick={handleStart} disabled={isPolling}>
          Start Long Polling
        </button>
        <button onClick={handleStop} disabled={!isPolling}>
          Stop Long Polling
        </button>
      </div>

      <div className="status">
        <div className="status-item">
          <span className="status-label">Status:</span>
          <span className={`status-value ${isPolling ? (error ? 'error' : 'waiting') : ''}`}>
            {isPolling && !error && (
              <span className="poll-indicator waiting"></span>
            )}
            {getStatusText()}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Current Version:</span>
          <span className="status-value">
            {currentVersion >= 0 ? currentVersion : '-'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Request Count:</span>
          <span className="status-value">{requestCount}</span>
        </div>
      </div>

      <div className="data-display">
        <h2>Received Data</h2>
        {dataHistory.length === 0 ? (
          <p className="no-data">No data received yet. Start long polling to see updates.</p>
        ) : (
          <div className="data-list">
            {dataHistory.map((item, index) => (
              <div key={`${item.version}-${item.timestamp}-${index}`} className="data-item">
                <div className="data-version">
                  Version {item.version}
                  {item.timeout && ' (Timeout)'}
                </div>
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
