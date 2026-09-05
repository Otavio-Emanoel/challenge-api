'use client';

import Link from 'next/link';
import { API_BASE_URL } from '@/services/api';

interface ApiStatusBannerProps {
  error?: string | null;
  onRetry?: () => void;
}

export function ApiStatusBanner({ error, onRetry }: ApiStatusBannerProps) {
  if (!error) return null;

  const isConnectionError =
    error.includes('Não foi possível conectar') ||
    error.includes('Failed to fetch') ||
    error.includes('NetworkError');

  return (
    <div className="alert-banner" role="alert">
      <div className="alert-icon">⚠️</div>
      <div className="alert-content">
        <h4 className="alert-title">
          {isConnectionError ? 'API Backend Desconectada' : 'Aviso do Backend'}
        </h4>
        <p className="alert-desc" style={{ marginBottom: isConnectionError ? '10px' : '0' }}>
          {error}
        </p>

        {isConnectionError && (
          <div style={{ marginTop: '8px', fontSize: '0.88rem' }}>
            <p>
              O frontend espera a API rodando em <span className="alert-code">{API_BASE_URL}</span>.
              Certifique-se de que seu backend está ativo e configurado com CORS liberado.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'center' }}>
              {onRetry && (
                <button onClick={onRetry} className="btn btn-secondary btn-sm">
                  🔄 Tentar Novamente
                </button>
              )}
              <Link href="/docs" className="btn btn-outline btn-sm">
                Consulte o Guia de Endpoints →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
