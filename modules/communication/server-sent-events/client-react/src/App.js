import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// Custom hook for Server-Sent Events
function useServerSentEvents(url, enabled) {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [lastEventId, setLastEventId] = useState(null);
  const eventSourceRef = useRef(null);
  const isMountedRef = useRef(true);

  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    try {
      setConnectionState('connecting');
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        if (!isMountedRef.current) return;
        setConnectionState('connected');
        setError(null);
      };

      eventSource.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          setLastEventId(event.lastEventId || event.id || null);
          setEvents(prev => [{
            type: 'message',
            id: event.lastEventId,
            data: data,
            timestamp: data.timestamp || Date.now()
          }, ...prev].slice(0, 50));
        } catch (err) {
          console.error('Error parsing event data:', err);
        }
      };

      // Handle specific event types
      const handleEvent = (eventType) => (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          setLastEventId(event.lastEventId || event.id || null);
          setEvents(prev => [{
            type: eventType,
            id: event.lastEventId,
            data: data,
            timestamp: data.timestamp || Date.now()
          }, ...prev].slice(0, 50));
        } catch (err) {
          console.error('Error parsing event data:', err);
        }
      };

      eventSource.addEventListener('connection', handleEvent('connection'));
      eventSource.addEventListener('update', handleEvent('update'));
      eventSource.addEventListener('heartbeat', handleEvent('heartbeat'));

      eventSource.onerror = (err) => {
        if (!isMountedRef.current) return;
        console.error('SSE error:', err);
        
        if (eventSource.readyState === EventSource.CLOSED) {
          setConnectionState('disconnected');
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          setConnectionState('connecting');
        }
      };

    } catch (err) {
      if (!isMountedRef.current) return;
      setError('Failed to create EventSource connection');
      setConnectionState('error');
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnectionState('disconnected');
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    connectionState,
    events,
    error,
    lastEventId,
    connect,
    disconnect
  };
}

function App() {
  const [url] = useState('/events');
  const [isConnected, setIsConnected] = useState(false);
  const { connectionState, events, error, lastEventId } = useServerSentEvents(url, isConnected);

  const handleConnect = () => {
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const formatEventContent = (event) => {
    if (event.type === 'connection') {
      return event.data.message || 'Connected to SSE stream';
    } else if (event.type === 'update') {
      return `${event.data.message || 'Update'}: ${JSON.stringify(event.data)}`;
    } else if (event.type === 'heartbeat') {
      return 'Heartbeat (connection alive)';
    } else {
      return JSON.stringify(event.data);
    }
  };

  return (
    <div className="container">
      <h1>Server-Sent Events Demo</h1>
      <p className="subtitle">Server pushes events to client over HTTP</p>

      <div className="controls">
        <button onClick={handleConnect} disabled={isConnected}>
          Connect to SSE Stream
        </button>
        <button onClick={handleDisconnect} disabled={!isConnected}>
          Disconnect
        </button>
      </div>

      <div className="status">
        <div className="status-item">
          <span className="status-label">Connection Status:</span>
          <span className={`status-value ${connectionState}`}>
            <span className={`connection-indicator ${connectionState}`}></span>
            {connectionState.charAt(0).toUpperCase() + connectionState.slice(1)}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Events Received:</span>
          <span className="status-value">{events.length}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Last Event ID:</span>
          <span className="status-value">{lastEventId || '-'}</span>
        </div>
        {error && (
          <div className="status-item">
            <span className="status-label">Error:</span>
            <span className="status-value error">{error}</span>
          </div>
        )}
      </div>

      <div className="events">
        <h2>Events</h2>
        {events.length === 0 ? (
          <p className="no-events">No events yet. Connect to start receiving events.</p>
        ) : (
          <div className="event-list">
            {events.map((event, index) => (
              <div key={`${event.id || event.timestamp}-${index}`} className={`event event-${event.type}`}>
                <div className="event-type">
                  {event.type} {event.id ? `(ID: ${event.id})` : ''}
                </div>
                <div className="event-content">{formatEventContent(event)}</div>
                <div className="event-timestamp">
                  {new Date(event.timestamp).toLocaleTimeString()}
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
