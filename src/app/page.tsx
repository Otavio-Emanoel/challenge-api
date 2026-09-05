'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ApiStatusBanner } from '@/components/ApiStatusBanner';
import { StatCard } from '@/components/StatCard';
import { EventCard } from '@/components/EventCard';
import { EventTableView } from '@/components/EventTableView';
import { Button } from '@/components/ui/Button';
import { apiService } from '@/services/api';
import { DashboardStats, Event } from '@/types';
import {
  Calendar,
  Users,
  AlertCircle,
  Sparkles,
  Search,
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setApiError(null);

    try {
      const [eventsRes, statsRes, categoriesRes] = await Promise.allSettled([
        apiService.getEvents({
          search: searchQuery.trim() || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        }),
        apiService.getDashboardStats(),
        apiService.getCategories(),
      ]);

      if (eventsRes.status === 'fulfilled') {
        setEvents(eventsRes.value.events || []);
      } else {
        const message =
          eventsRes.reason instanceof Error
            ? eventsRes.reason.message
            : 'Erro ao carregar eventos do servidor.';
        setApiError(message);
        setEvents([]);
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }

      if (categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value)) {
        setCategories(categoriesRes.value);
      } else {
        setCategories(['Tecnologia', 'Design', 'Negócios', 'Marketing', 'Geral']);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao comunicar com o servidor.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadData]);

  // Contadores computados de fallback caso endpoint de stats não esteja pronto
  const totalEventsCount = stats ? stats.totalEvents : events.length;
  const activeRegistrationsCount = stats
    ? stats.activeRegistrations
    : events.reduce((acc, e) => acc + (e.attendeesCount || 0), 0);
  const soldOutEventsCount = stats
    ? stats.soldOutEvents
    : events.filter((e) => e.isSoldOut || (e.attendeesCount >= e.maxCapacity)).length;
  const upcomingEventsCount = stats
    ? stats.upcomingEvents
    : events.filter((e) => !e.isSoldOut).length;

  return (
    <div className="app-container">
      {/* Hero / Header Section */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="badge badge-primary">Painel de Gestão</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Controle em tempo real
              </span>
            </div>
            <h1
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                color: '#fff',
                marginBottom: '10px',
              }}
            >
              Eventos & Inscrições
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
              Acompanhe a lotação em tempo real, gerencie listas de participantes e crie novas
              experiências com controle completo de vagas.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/events/new" className="btn btn-primary">
              <Plus className="w-4 h-4" />
              <span>Criar Novo Evento</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Banner de status em caso de indisponibilidade */}
      <ApiStatusBanner error={apiError} onRetry={() => loadData(true)} />

      {/* Grid de Métricas Principais */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '36px',
        }}
      >
        <StatCard
          title="Total de Eventos"
          value={totalEventsCount}
          description="Cadastrados na plataforma"
          icon={<Calendar className="w-5 h-5" />}
          variant="indigo"
        />

        <StatCard
          title="Inscrições Ativas"
          value={activeRegistrationsCount}
          description="Participantes confirmados"
          icon={<Users className="w-5 h-5" />}
          variant="emerald"
        />

        <StatCard
          title="Eventos Esgotados"
          value={soldOutEventsCount}
          description="100% de capacidade atingida"
          icon={<AlertCircle className="w-5 h-5" />}
          variant="rose"
        />

        <StatCard
          title="Vagas Abertas"
          value={upcomingEventsCount}
          description="Eventos disponíveis para inscrição"
          icon={<Sparkles className="w-5 h-5" />}
          variant="amber"
        />
      </section>

      {/* Barra de Filtros & Controles de Visualização */}
      <section
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Campo de Busca com ícone */}
        <div style={{ flex: '1 1 320px', position: 'relative' }}>
          <Search
            className="w-4 h-4"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px', paddingRight: searchQuery ? '36px' : '14px' }}
            placeholder="Buscar por título, tema ou palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros e Ações */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '170px' }}>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filtrar por categoria"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '170px' }}>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filtrar por status"
            >
              <option value="all">Todos os Status</option>
              <option value="available">Vagas Disponíveis</option>
              <option value="soldout">Esgotados</option>
            </select>
          </div>

          {/* Toggle de Visualização (Grid / Tabela) */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'grid' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s ease',
              }}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'table' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s ease',
              }}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Botão Atualizar */}
          <Button
            variant="secondary"
            onClick={() => loadData(true)}
            isLoading={isRefreshing}
            title="Recarregar eventos"
            style={{ padding: '10px 14px' }}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </section>

      {/* Conteúdo de Eventos: Loading Skeleton, Empty State ou Lista */}
      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px',
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="card skeleton"
              style={{
                height: '380px',
                borderRadius: 'var(--radius-lg)',
              }}
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '72px 24px',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-xl)',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}
          >
            <Calendar className="w-8 h-8" />
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            Nenhum evento encontrado
          </h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.94rem',
              lineHeight: 1.6,
              marginBottom: '28px',
            }}
          >
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Nenhum resultado corresponde aos filtros aplicados. Tente ajustar os termos de pesquisa ou redefinir os filtros.'
              : 'Você ainda não possui eventos cadastrados na plataforma. Crie o primeiro evento para começar a receber inscrições.'}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
              >
                Limpar Filtros
              </Button>
            )}
            <Link href="/events/new" className="btn btn-primary">
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Evento</span>
            </Link>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px',
          }}
        >
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EventTableView events={events} />
      )}
    </div>
  );
}
