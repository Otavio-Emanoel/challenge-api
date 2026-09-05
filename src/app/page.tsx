'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ApiStatusBanner } from '@/components/ApiStatusBanner';
import { apiService } from '@/services/api';
import { DashboardStats, Event } from '@/types';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      // Carrega eventos, estatísticas e categorias em paralelo
      const [eventsRes, statsRes, categoriesRes] = await Promise.allSettled([
        apiService.getEvents({
          search: searchQuery.trim() || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        }),
        apiService.getDashboardStats(),
        apiService.getCategories(),
      ]);

      // Trata retorno dos eventos
      if (eventsRes.status === 'fulfilled') {
        setEvents(eventsRes.value.events || []);
      } else {
        const message =
          eventsRes.reason instanceof Error
            ? eventsRes.reason.message
            : 'Erro ao carregar eventos da API.';
        setApiError(message);
        setEvents([]);
      }

      // Trata retorno das estatísticas
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }

      // Trata retorno das categorias
      if (categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value)) {
        setCategories(categoriesRes.value);
      } else {
        setCategories(['Tecnologia', 'Design', 'Negócios', 'Marketing', 'Geral']);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao comunicar com a API.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadData]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="app-container">
      {/* Hero Section */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ maxWidth: '720px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
            Desafio Técnico • Backend & Frontend
          </span>
          <h1
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.025em',
              marginBottom: '12px',
            }}
          >
            Gestão de Eventos e Controle de Inscrições
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Este painel consome diretamente os endpoints da API backend em desenvolvimento.
            Acompanhe lotações, gerencie participantes e filtre eventos em tempo real.
          </p>
        </div>
      </section>

      {/* Banner caso a API esteja offline ou com erro */}
      <ApiStatusBanner error={apiError} onRetry={loadData} />

      {/* Cards de Métricas */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '36px',
        }}
      >
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>TOTAL DE EVENTOS</span>
            <span>📅</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>
            {stats ? stats.totalEvents : events.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Eventos cadastrados
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>INSCRIÇÕES ATIVAS</span>
            <span>👥</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#818cf8' }}>
            {stats
              ? stats.activeRegistrations
              : events.reduce((acc, e) => acc + (e.attendeesCount || 0), 0)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Participantes confirmados
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>EVENTOS ESGOTADOS</span>
            <span>🔥</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#f87171' }}>
            {stats
              ? stats.soldOutEvents
              : events.filter((e) => e.isSoldOut || (e.attendeesCount >= e.maxCapacity)).length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            100% de capacidade
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>PRÓXIMOS EVENTOS</span>
            <span>🚀</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#34d399' }}>
            {stats ? stats.upcomingEvents : events.filter((e) => !e.isSoldOut).length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Com vagas disponíveis
          </div>
        </div>
      </section>

      {/* Barra de Filtros */}
      <section
        className="card"
        style={{
          padding: '20px',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Buscar evento por título ou tema..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '160px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '170px' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value="available">Vagas Disponíveis</option>
            <option value="soldout">Esgotados</option>
          </select>

          <button
            onClick={loadData}
            className="btn btn-secondary"
            title="Recarregar dados da API"
            style={{ padding: '10px 14px' }}
          >
            🔄
          </button>
        </div>
      </section>

      {/* Grid de Eventos */}
      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="card"
              style={{
                height: '340px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="spinner" style={{ marginBottom: '12px' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Consultando API...
              </span>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            maxWidth: '640px',
            margin: '0 auto',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎪</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
            {apiError ? 'Aguardando inicialização da API' : 'Nenhum evento encontrado'}
          </h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              marginBottom: '24px',
              lineHeight: 1.6,
            }}
          >
            {apiError
              ? 'Inicie o backend para que os eventos cadastrados sejam exibidos aqui automaticamente.'
              : 'Não há eventos correspondentes aos filtros aplicados, ou ainda não foi cadastrado nenhum evento no banco de dados da API.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/events/new" className="btn btn-primary">
              + Cadastrar Primeiro Evento
            </Link>
            <Link href="/docs" className="btn btn-outline">
              Ver Guia de Endpoints
            </Link>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {events.map((event) => {
            const attendees = event.attendeesCount || 0;
            const capacity = event.maxCapacity || 1;
            const percentage = Math.min(100, Math.round((attendees / capacity) * 100));
            const isFull = event.isSoldOut || attendees >= capacity;

            return (
              <div
                key={event.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  padding: '0',
                }}
              >
                {/* Imagem de Capa do Evento */}
                <div
                  style={{
                    height: '160px',
                    width: '100%',
                    background: event.imageUrl
                      ? `url(${event.imageUrl}) center/cover no-repeat`
                      : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
                    position: 'relative',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(15,23,42,0.95) 100%)',
                    }}
                  />

                  <div
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <span className="badge badge-primary">{event.category}</span>
                    {isFull ? (
                      <span className="badge badge-danger">ESGOTADO</span>
                    ) : (
                      <span className="badge badge-success">VAGAS ABERTAS</span>
                    )}
                  </div>

                  <div
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.82rem',
                      color: '#cbd5e1',
                    }}
                  >
                    <span>{event.locationType === 'online' ? '💻 Online' : '📍 Presencial'}</span>
                    <span>•</span>
                    <span>{formatDate(event.date)}</span>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        marginBottom: '8px',
                        color: '#fff',
                      }}
                    >
                      {event.title}
                    </h3>
                    <p
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '16px',
                      }}
                    >
                      {event.description}
                    </p>
                  </div>

                  {/* Controle de Lotação */}
                  <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.82rem',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Ocupação ({attendees}/{capacity})
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: isFull ? '#f87171' : percentage > 75 ? '#fbbf24' : '#34d399',
                        }}
                      >
                        {percentage}%
                      </span>
                    </div>

                    <div className="progress-container">
                      <div
                        className={`progress-fill ${
                          isFull ? 'full' : percentage > 75 ? 'warning' : ''
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '16px',
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {isFull
                          ? 'Vagas encerradas'
                          : `${Math.max(0, capacity - attendees)} vagas restantes`}
                      </span>

                      <Link
                        href={`/events/${event.id}`}
                        className="btn btn-primary btn-sm"
                        style={{ borderRadius: 'var(--radius-md)' }}
                      >
                        Gerenciar →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
