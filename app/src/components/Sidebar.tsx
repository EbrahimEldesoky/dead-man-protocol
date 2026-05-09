'use client';

import TypewriterText from './TypewriterText';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const NAV_ITEMS = [
  { id: 'pulse', label: 'THE_PULSE', icon: '◉' },
  { id: 'heartbeat', label: 'HEARTBEAT', icon: '♥' },
  { id: 'heirs', label: 'HEIR_MGMT', icon: '⧉' },
  { id: 'secret', label: 'SECRET_VAULT', icon: '⚿' },
  { id: 'deposit', label: 'DEPOSIT', icon: '◈' },
];

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="star">✳</span> DMB
        </div>
        <div className="sidebar-tagline">
          Trustless Digital Inheritance
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-prefix">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="network-badge">
          <span className="network-dot" />
          <span>DEVNET</span>
        </div>
      </div>
    </aside>
  );
}
