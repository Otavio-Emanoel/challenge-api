'use client';

import Link from 'next/link';
import { useState } from 'react';
import { API_BASE_URL } from '@/services/api';

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  title: string;
  description: string;
  statusSuccess: string;
  requestBody?: string;
  responseBody: string;
  errors?: string[];
  rules?: string[];
}

const ENDPOINTS: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/api/health',
    title: 'Status e Healthcheck da API',
    description: 'Endpoint rápido para verificar se a API está online e respondendo.',
    statusSuccess: '200 OK',
    responseBody: JSON.stringify(
      {
        status: 'ok',
        timestamp: '2026-09-04T22:30:00.000Z',
        uptime: 3600,
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/dashboard/stats',
    title: 'Métricas Agregadas do Dashboard',
    description: 'Retorna contadores para alimentar os cards da página inicial.',
    statusSuccess: '200 OK',
    responseBody: JSON.stringify(
      {
        totalEvents: 12,
        activeRegistrations: 284,
        soldOutEvents: 3,
        upcomingEvents: 7,
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/categories',
    title: 'Listar Categorias de Eventos',
    description: 'Retorna array com os nomes das categorias cadastradas.',
    statusSuccess: '200 OK',
    responseBody: JSON.stringify(
      ['Tecnologia', 'Design', 'Negócios', 'Marketing', 'Desenvolvimento Pessoal', 'Outros'],
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/events',
    title: 'Listar Eventos (com Filtros e Paginação)',
    description:
      'Retorna lista paginada de eventos. Suporta query params: `search`, `category`, `status` (all, available, soldout), `page` e `limit`.',
    statusSuccess: '200 OK',
    responseBody: JSON.stringify(
      {
        events: [
          {
            id: 'evt_1',
            title: 'Summit de Inteligência Artificial & Cloud 2026',
            description:
              'Imersão técnica em LLMs, orquestração de agentes e arquiteturas distribuídas.',
            category: 'Tecnologia',
            date: '2026-11-20T14:00:00.000Z',
            locationType: 'presential',
            location: 'Centro de Convenções Tech, São Paulo - SP',
            maxCapacity: 100,
            imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
            status: 'published',
            attendeesCount: 88,
            availableSpots: 12,
            isSoldOut: false,
            createdAt: '2026-09-01T10:00:00.000Z',
            updatedAt: '2026-09-04T12:00:00.000Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 12,
          total: 1,
          totalPages: 1,
        },
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/events/:id',
    title: 'Obter Detalhes do Evento por ID',
    description: 'Retorna o objeto completo do evento informado na rota.',
    statusSuccess: '200 OK',
    errors: ['404 Not Found se o ID não existir no banco.'],
    responseBody: JSON.stringify(
      {
        id: 'evt_1',
        title: 'Summit de Inteligência Artificial & Cloud 2026',
        description:
          'Imersão técnica em LLMs, orquestração de agentes e arquiteturas distribuídas.',
        category: 'Tecnologia',
        date: '2026-11-20T14:00:00.000Z',
        locationType: 'presential',
        location: 'Centro de Convenções Tech, São Paulo - SP',
        maxCapacity: 100,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        status: 'published',
        attendeesCount: 88,
        availableSpots: 12,
        isSoldOut: false,
        createdAt: '2026-09-01T10:00:00.000Z',
        updatedAt: '2026-09-04T12:00:00.000Z',
      },
      null,
      2
    ),
  },
  {
    method: 'POST',
    path: '/api/events',
    title: 'Criar Novo Evento',
    description: 'Recebe os dados do evento e salva no banco de dados.',
    statusSuccess: '201 Created',
    requestBody: JSON.stringify(
      {
        title: 'Masterclass de Design Tokens',
        description: 'Construção de bibliotecas escaláveis de estilos.',
        category: 'Design',
        date: '2026-12-05T19:00:00.000Z',
        locationType: 'online',
        location: 'https://meet.google.com/xyz-123',
        maxCapacity: 60,
        imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12',
      },
      null,
      2
    ),
    responseBody: JSON.stringify(
      {
        id: 'evt_2',
        title: 'Masterclass de Design Tokens',
        description: 'Construção de bibliotecas escaláveis de estilos.',
        category: 'Design',
        date: '2026-12-05T19:00:00.000Z',
        locationType: 'online',
        location: 'https://meet.google.com/xyz-123',
        maxCapacity: 60,
        imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12',
        status: 'published',
        attendeesCount: 0,
        availableSpots: 60,
        isSoldOut: false,
        createdAt: '2026-09-04T22:30:00.000Z',
        updatedAt: '2026-09-04T22:30:00.000Z',
      },
      null,
      2
    ),
    rules: [
      'Campos obrigatórios: title, description, category, date, locationType, location, maxCapacity.',
      'maxCapacity deve ser um número inteiro positivo (>= 1).',
    ],
    errors: ['400 Bad Request se validação de campos falhar.'],
  },
  {
    method: 'PUT',
    path: '/api/events/:id',
    title: 'Atualizar Evento Existente',
    description: 'Modifica os dados de um evento existente.',
    statusSuccess: '200 OK',
    requestBody: JSON.stringify(
      {
        title: 'Masterclass Avançada de Design Tokens',
        maxCapacity: 75,
        status: 'published',
      },
      null,
      2
    ),
    responseBody: JSON.stringify(
      {
        id: 'evt_2',
        title: 'Masterclass Avançada de Design Tokens',
        maxCapacity: 75,
        status: 'published',
        attendeesCount: 0,
        availableSpots: 75,
        isSoldOut: false,
      },
      null,
      2
    ),
    rules: [
      'Não permitir reduzir maxCapacity para um valor menor que a quantidade atual de participantes inscritos.',
    ],
    errors: [
      '400 Bad Request se a nova capacidade for menor que os inscritos atuais.',
      '404 Not Found se o ID não existir.',
    ],
  },
  {
    method: 'DELETE',
    path: '/api/events/:id',
    title: 'Excluir Evento',
    description: 'Remove o evento e todas as inscrições vinculadas em cascata.',
    statusSuccess: '204 No Content',
    responseBody: '// Retorno com corpo vazio (status 204)',
    errors: ['404 Not Found se o evento não existir.'],
  },
  {
    method: 'GET',
    path: '/api/events/:id/attendees',
    title: 'Listar Participantes do Evento',
    description: 'Retorna a lista de pessoas confirmadas/inscritas no evento.',
    statusSuccess: '200 OK',
    responseBody: JSON.stringify(
      [
        {
          id: 'att_101',
          eventId: 'evt_1',
          name: 'Ana Carolina Moura',
          email: 'ana.moura@tech.com',
          registeredAt: '2026-09-02T15:30:00.000Z',
        },
      ],
      null,
      2
    ),
    errors: ['404 Not Found se o evento não for encontrado.'],
  },
  {
    method: 'POST',
    path: '/api/events/:id/attendees',
    title: 'Inscrever Participante (Regra de Vagas)',
    description: 'Registra a inscrição de um participante em um determinado evento.',
    statusSuccess: '201 Created',
    requestBody: JSON.stringify(
      {
        name: 'Roberto Viana',
        email: 'roberto.viana@email.com',
      },
      null,
      2
    ),
    responseBody: JSON.stringify(
      {
        id: 'att_102',
        eventId: 'evt_1',
        name: 'Roberto Viana',
        email: 'roberto.viana@email.com',
        registeredAt: '2026-09-04T22:35:00.000Z',
      },
      null,
      2
    ),
    rules: [
      'REGRA 1: Se o evento já estiver com capacidade cheia (attendeesCount >= maxCapacity), retornar 400 Bad Request com a mensagem "Este evento já atingiu sua capacidade máxima de vagas."',
      'REGRA 2: Se o mesmo e-mail já estiver cadastrado no evento, retornar 409 Conflict com mensagem "Este e-mail já está inscrito neste evento."',
    ],
    errors: [
      '400 Bad Request se lotado ou nome/email inválidos.',
      '409 Conflict se e-mail duplicado no mesmo evento.',
      '404 Not Found se evento inexistente.',
    ],
  },
  {
    method: 'DELETE',
    path: '/api/events/:id/attendees/:attendeeId',
    title: 'Cancelar Inscrição de Participante',
    description: 'Remove a inscrição do participante, liberando automaticamente uma vaga no evento.',
    statusSuccess: '204 No Content',
    responseBody: '// Retorno com corpo vazio (status 204)',
    rules: ['Ao excluir, a vaga deve ser liberada imediatamente para novos participantes.'],
    errors: ['404 Not Found se o participante ou evento não existirem.'],
  },
];

export default function ApiDocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET':
        return 'badge-success';
      case 'POST':
        return 'badge-primary';
      case 'PUT':
        return 'badge-warning';
      case 'DELETE':
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: '980px' }}>
      <div style={{ marginBottom: '36px' }}>
        <Link href="/" className="btn btn-outline btn-sm" style={{ marginBottom: '20px' }}>
          ← Voltar para o Dashboard
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span className="badge badge-primary">Guia de Implementação</span>
          <span className="badge badge-neutral">RESTful API</span>
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
          Especificação Completa da API
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '8px', lineHeight: 1.6 }}>
          Este guia lista todos os contratos esperados pelo frontend. Construa a sua API em Node.js,
          Python, Java, Go ou qualquer tecnologia de sua preferência seguindo as especificações abaixo.
        </p>

        <div
          className="card"
          style={{
            marginTop: '20px',
            background: 'rgba(99, 102, 241, 0.08)',
            borderColor: 'rgba(99, 102, 241, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.82rem', color: '#a5b4fc', fontWeight: 600 }}>
              URL BASE CONFIGURADA NO FRONTEND:
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              <code>{API_BASE_URL}</code>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#c7d2fe', maxWidth: '380px' }}>
            Para alterar a porta, modifique a variável <code>NEXT_PUBLIC_API_URL</code> no arquivo <code>.env.local</code>.
          </div>
        </div>
      </div>

      {/* Lista de Endpoints */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {ENDPOINTS.map((ep, idx) => (
          <div key={idx} className="card" style={{ padding: '28px' }}>
            {/* Header da Rota */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`badge ${getMethodBadgeClass(ep.method)}`} style={{ fontSize: '0.85rem' }}>
                  {ep.method}
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'monospace', color: '#fff' }}>
                  {ep.path}
                </span>
              </div>

              <span className="badge badge-neutral">Status: {ep.statusSuccess}</span>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              {ep.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '20px' }}>
              {ep.description}
            </p>

            {/* Regras de negócio */}
            {ep.rules && ep.rules.length > 0 && (
              <div
                style={{
                  padding: '14px 18px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fcd34d', marginBottom: '6px' }}>
                  ⚡ Regras de Negócio Obrigatórias:
                </div>
                <ul style={{ paddingLeft: '20px', color: '#fde68a', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {ep.rules.map((rule, rIdx) => (
                    <li key={rIdx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Request Body se houver */}
            {ep.requestBody && (
              <div style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    PAYLOAD DE REQUISIÇÃO (JSON):
                  </span>
                  <button
                    onClick={() => handleCopy(ep.requestBody!, idx * 10)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                  >
                    {copiedIndex === idx * 10 ? '✓ Copiado!' : 'Copiar JSON'}
                  </button>
                </div>
                <pre
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    color: '#93c5fd',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    overflowX: 'auto',
                  }}
                >
                  {ep.requestBody}
                </pre>
              </div>
            )}

            {/* Response Body */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  RESPOSTA DE SUCESSO (JSON):
                </span>
                <button
                  onClick={() => handleCopy(ep.responseBody, idx * 10 + 1)}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                >
                  {copiedIndex === idx * 10 + 1 ? '✓ Copiado!' : 'Copiar JSON'}
                </button>
              </div>
              <pre
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  color: '#86efac',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  overflowX: 'auto',
                }}
              >
                {ep.responseBody}
              </pre>
            </div>

            {/* Erros possíveis */}
            {ep.errors && ep.errors.length > 0 && (
              <div style={{ marginTop: '16px', fontSize: '0.82rem', color: '#fca5a5' }}>
                <strong>Erros esperados: </strong>
                {ep.errors.join(' | ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
