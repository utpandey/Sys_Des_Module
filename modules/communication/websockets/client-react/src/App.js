import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// Custom hook for WebSocket connection
function useWebSocket(url, enabled) {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionState('connecting');
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        setConnectionState('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [data, ...prev].slice(0, 50));
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.onerror = (err) => {
        if (!isMountedRef.current) return;
        console.error('WebSocket error:', err);
        setError('Connection error');
        setConnectionState('error');
      };

      ws.onclose = (event) => {
        if (!isMountedRef.current) return;
        setConnectionState('disconnected');
        
        // Attempt reconnection if enabled and not manually closed
        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (enabled && isMountedRef.current) {
              connect();
            }
          }, delay);
        }
      };

    } catch (err) {
      if (!isMountedRef.current) return;
      setError('Failed to create WebSocket connection');
      setConnectionState('error');
    }
  }, [url, enabled]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent reconnection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
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
    messages,
    error,
    sendMessage,
    connect,
    disconnect
  };
}

function App() {
  const [url] = useState('ws://localhost:3003/ws');
  const [isConnected, setIsConnected] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sentCount, setSentCount] = useState(0);
  const { connectionState, messages, error, sendMessage, connect, disconnect } = useWebSocket(url, isConnected);

  const handleConnect = () => {
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    try {
      // Try to parse as JSON, if fails create chat message
      let message;
      try {
        message = JSON.parse(messageInput);
      } catch (e) {
        message = {
          type: 'chat',
          message: messageInput
        };
      }

      if (sendMessage(message)) {
        setSentCount(prev => prev + 1);
        setMessageInput('');
      } else {
        alert('Not connected to WebSocket server');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    }
  };

  const formatMessage = (data) => {
    const type = data.type || 'unknown';
    const timestamp = new Date(data.timestamp || Date.now()).toLocaleTimeString();

    switch (type) {
      case 'connection':
        return {
          content: `Connected! Client ID: ${data.clientId || 'unknown'}`,
          type: 'system'
        };
      case 'echo':
        return {
          content: `Echo: ${JSON.stringify(data.originalMessage)}`,
          type: 'echo'
        };
      case 'broadcast':
        return {
          content: `Broadcast from ${data.from}: ${data.message}`,
          type: 'broadcast'
        };
      case 'update':
        return {
          content: `Update: ${JSON.stringify(data.data)}`,
          type: 'update'
        };
      default:
        return {
          content: JSON.stringify(data),
          type: 'unknown'
        };
    }
  };

  return (
    <div className="container">
      <h1>WebSocket Demo</h1>
      <p className="subtitle">Full-duplex bidirectional communication</p>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="url">WebSocket URL:</label>
          <input
            type="text"
            id="url"
            value={url}
            disabled
            className="url-input"
          />
        </div>
        <button onClick={handleConnect} disabled={isConnected}>
          Connect
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
          <span className="status-label">Messages Received:</span>
          <span className="status-value">{messages.length}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Messages Sent:</span>
          <span className="status-value">{sentCount}</span>
        </div>
        {error && (
          <div className="status-item">
            <span className="status-label">Error:</span>
            <span className="status-value error">{error}</span>
          </div>
        )}
      </div>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="message">Send Message:</label>
          <textarea
            id="message"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder='{"type": "chat", "message": "Hello!"}'
            disabled={!isConnected}
          />
        </div>
        <button onClick={handleSendMessage} disabled={!isConnected}>
          Send Message
        </button>
      </div>

      <div className="messages">
        <h2>Messages</h2>
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Connect to start receiving messages.</p>
        ) : (
          <div className="message-list">
            {messages.map((msg, index) => {
              const formatted = formatMessage(msg);
              return (
                <div key={`${msg.timestamp || Date.now()}-${index}`} className={`message message-${formatted.type}`}>
                  <div className="message-type">{formatted.type}</div>
                  <div className="message-content">{formatted.content}</div>
                  <div className="message-timestamp">
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
