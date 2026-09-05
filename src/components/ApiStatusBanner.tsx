'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { Button } from './ui/Button';

interface ApiStatusBannerProps {
  error?: string | null;
  onRetry?: () => void;
}

export function ApiStatusBanner({ error, onRetry }: ApiStatusBannerProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  if (!error) return null;

  const isConnectionError =
    error.includes('Não foi possível conectar') ||
    error.includes('Failed to fetch') ||
    error.includes('NetworkError');

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setIsRetrying(false), 500);
    }
  };

  return (
    <div
      className="card"
      style={{
        border: '1px solid rgba(245, 158, 11, 0.3)',
        background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(17, 23, 38, 0.95) 100%)',
        padding: '20px 24px',
        marginBottom: '28px',
        borderRadius: 'var(--radius-lg)',
      }}
      role="alert"
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <WifiOff className="w-5 h-5" />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fef3c7' }}>
              {isConnectionError ? 'Serviço temporariamente indisponível' : 'Aviso do Sistema'}
            </h4>
            {onRetry && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRetry}
                isLoading={isRetrying}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Atualizar dados
              </Button>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '6px', lineHeight: 1.5 }}>
            {isConnectionError
              ? 'Não conseguimos carregar os dados em tempo real. As informações serão atualizadas automaticamente assim que o serviço responder.'
              : error}
          </p>

          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0,
              }}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{showTechnicalDetails ? 'Ocultar detalhes' : 'Ver detalhes da conexão'}</span>
              {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <Link
              href="/docs"
              style={{
                fontSize: '0.8rem',
                color: 'var(--primary)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Consultar guia da API →
            </Link>
          </div>

          {showTechnicalDetails && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px 14px',
                background: 'rgba(0, 0, 0, 0.35)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: '#cbd5e1',
                wordBreak: 'break-all',
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
