'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { Calendar, Plus, BookOpen, Layers } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const ping = () => {
      apiService
        .checkHealth()
        .then(() => {
          if (isMounted) setIsOnline(true);
        })
        .catch(() => {
          if (isMounted) setIsOnline(false);
        });
    };

    ping();
    const interval = setInterval(ping, 20000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="navbar">
      <div className="app-container navbar-inner">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link href="/" className="brand">
            <div className="brand-icon-box">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                Event<span style={{ color: 'var(--primary)' }}>Pulse</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="nav-links">
            <Link
              href="/"
              className={`nav-link ${pathname === '/' ? 'active' : ''}`}
            >
              <Calendar className="w-4 h-4" />
              <span>Painel de Eventos</span>
            </Link>
            <Link
              href="/events/new"
              className={`nav-link ${pathname === '/events/new' ? 'active' : ''}`}
            >
              <Plus className="w-4 h-4" />
              <span>Novo Evento</span>
            </Link>
          </nav>
        </div>

        {/* Action Buttons & Status */}
        <div className="nav-actions">
          {/* Subtle System Status */}
          <div
            className="system-status-indicator"
            title={
              isOnline === true
                ? 'Conexão ativa e sincronizada'
                : isOnline === false
                ? 'Tentando reconectar aos serviços...'
                : 'Verificando conexão...'
            }
          >
            <span
              className={`status-dot ${
                isOnline === true ? 'online' : isOnline === false ? 'offline' : ''
              }`}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
              {isOnline === true
                ? 'Sincronizado'
                : isOnline === false
                ? 'Desconectado'
                : 'Conectando...'}
            </span>
          </div>

          <Link
            href="/docs"
            className={`nav-link ${pathname === '/docs' ? 'active' : ''}`}
            title="Especificações de Integração"
          >
            <BookOpen className="w-4 h-4" />
            <span>Guia da API</span>
          </Link>

          <Link href="/events/new" className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            <span>Criar Evento</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
