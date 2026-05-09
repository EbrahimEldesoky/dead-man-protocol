'use client';

import { useRef, useEffect } from 'react';

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface TerminalLogProps {
  logs: LogEntry[];
  showCursor?: boolean;
}

export default function TerminalLog({ logs, showCursor = true }: TerminalLogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="terminal-log" ref={logRef}>
      {logs.length === 0 && (
        <div className="log-line">
          <span className="log-info">{'>'} Awaiting commands...</span>
        </div>
      )}
      {logs.map((log, i) => (
        <div key={i} className="log-line">
          <span className="log-timestamp">[{log.timestamp}]</span>{' '}
          <span className={`log-${log.type}`}>{log.message}</span>
        </div>
      ))}
      {showCursor && (
        <div className="log-line">
          <span className="log-info">{'>'}</span>
          <span className="log-cursor" />
        </div>
      )}
    </div>
  );
}
