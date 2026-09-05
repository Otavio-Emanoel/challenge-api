'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API_BASE_URL, apiService } from '@/services/api';

export function Navbar() {
  const pathname = usePathname();
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    let isMounted = true;

    const ping = () => {
      apiService
        .checkHealth()
        .then(() => {
          if (isMounted) setApiStatus('online');
        })
        .catch(() => {
          if (isMounted) setApiStatus('offline');
        });
    };

    ping();
    const interval = setInterval(ping, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="navbar">
      <div className="app-container navbar-inner">
        <Link href="/" className="brand">
          <div className="brand-icon">⚡</div>
          <span>Event<span style={{ color: 'var(--primary)' }}>Pulse</span></span>
        </Link>

        <nav className="nav-links">
          <Link
            href="/"
            className={`nav-link ${pathname === '/' ? 'active' : ''}`}
          >
            Eventos
          </Link>
          <Link
            href="/events/new"
            className={`nav-link ${pathname === '/events/new' ? 'active' : ''}`}
          >
            + Criar Evento
          </Link>
          <Link
            href="/docs"
            className={`nav-link ${pathname === '/docs' ? 'active' : ''}`}
          >
            📖 Guia da API
          </Link>
        </nav>

        <div className="nav-actions">
          <div
            className={`api-status-pill ${apiStatus}`}
            title={`Conectado em: ${API_BASE_URL}`}
          >
            <span className="api-status-dot" />
            <span>
              {apiStatus === 'online'
                ? 'API Online'
                : apiStatus === 'offline'
                ? 'API Offline'
                : 'Checando API...'}
            </span>
          </div>

          <Link href="/events/new" className="btn btn-primary btn-sm">
            Novo Evento
          </Link>
        </div>
      </div>
    </header>
  );
}
