'use client';

import Link from 'next/link';
import { useState } from 'react';
import { API_BASE_URL } from '@/services/api';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowLeft,
  Copy,
  Check,
  ShieldAlert,
  Server,
} from 'lucide-react';
import { toast } from 'sonner';

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
    description: 'Atualiza propriedades do evento mantendo os inscritos atuais intactos.',
    statusSuccess: '200 OK',
    requestBody: JSON.stringify(
      {
        title: 'Masterclass de Design Tokens & UI (Edição Atualizada)',
        maxCapacity: 80,
      },
      null,
      2
    ),
    responseBody: JSON.stringify(
      {
        id: 'evt_2',
        title: 'Masterclass de Design Tokens & UI (Edição Atualizada)',
        maxCapacity: 80,
        availableSpots: 80,
      },
      null,
      2
    ),
    rules: [
      'Não é permitido reduzir maxCapacity para valor inferior ao número atual de participantes já cadastrados.',
    ],
    errors: ['404 Not Found se evento não existir.', '400 Bad Request se validação falhar.'],
  },
  {
    method: 'DELETE',
    path: '/api/events/:id',
    title: 'Remover Evento e Inscrições',
    description: 'Exclui o evento e remove participantes vinculados em cascata.',
    statusSuccess: '204 No Content',
    responseBody: '(Vazio)',
    errors: ['404 Not Found se o evento não existir.'],
  },
  {
    method: 'GET',
    path: '/api/events/:id/attendees',
    title: 'Listar Participantes de um Evento',
    description: 'Retorna array com todos os inscritos confirmados para o evento especificado.',
    statusSuccess: '200 OK',
    responseBody: JSON.stringify(
      [
        {
          id: 'att_1',
          eventId: 'evt_1',
          name: 'Mariana Duarte',
          email: 'mariana.duarte@empresa.com',
          registeredAt: '2026-09-02T14:20:00.000Z',
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
    title: 'Inscrever Novo Participante',
    description: 'Registra a inscrição de uma pessoa e decrementa as vagas do evento.',
    statusSuccess: '201 Created',
    requestBody: JSON.stringify(
      {
        name: 'Carlos Oliveira',
        email: 'carlos.oliveira@techcorp.com',
      },
      null,
      2
    ),
    responseBody: JSON.stringify(
      {
        id: 'att_2',
        eventId: 'evt_1',
        name: 'Carlos Oliveira',
        email: 'carlos.oliveira@techcorp.com',
        registeredAt: '2026-09-04T18:00:00.000Z',
      },
      null,
      2
    ),
    rules: [
      'Lotação: Retornar 400 Bad Request caso o evento já tenha atingido maxCapacity.',
      'Unicidade: Retornar 409 Conflict se o e-mail informado já estiver inscrito no mesmo evento.',
    ],
    errors: ['400 Bad Request (lotação esgotada ou campos inválidos)', '409 Conflict (e-mail duplicado)'],
  },
  {
    method: 'DELETE',
    path: '/api/events/:id/attendees/:attendeeId',
    title: 'Cancelar Inscrição de Participante',
    description: 'Remove o participante e incrementa automaticamente 1 vaga disponível.',
    statusSuccess: '204 No Content',
    responseBody: '(Vazio)',
    errors: ['404 Not Found se o participante ou evento não existirem.'],
  },
];

export default function DocsPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Conteúdo copiado para a área de transferência!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getMethodBadgeStyle = (method: string) => {
    switch (method) {
      case 'GET':
        return { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)', color: '#22d3ee' };
      case 'POST':
        return { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', color: '#34d399' };
      case 'PUT':
        return { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' };
      case 'DELETE':
        return { bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.3)', color: '#fb7185' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.1)', border: 'var(--border-subtle)', color: '#cbd5e1' };
    }
  };

  const filteredEndpoints =
    selectedMethod === 'ALL'
      ? ENDPOINTS
      : ENDPOINTS.filter((ep) => ep.method === selectedMethod);

  return (
    <div className="app-container" style={{ maxWidth: '960px' }}>
      {/* Retorno */}
      <Link
        href="/"
        className="btn btn-outline btn-sm"
        style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Painel</span>
      </Link>

      {/* Header Docs */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Badge variant="primary">Documentação Técnica</Badge>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>REST API Specs</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
          Guia de Integração da API
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px', lineHeight: 1.6 }}>
          Referência completa de endpoints, payloads JSON esperados, validações de negócio e códigos de status HTTP.
        </p>

        {/* Card de Configuração da URL Base */}
        <div
          className="card"
          style={{
            marginTop: '24px',
            padding: '20px 24px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(17, 23, 38, 0.95) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase' }}>
                URL Base Configurada
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {API_BASE_URL}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.5 }}>
            Para alterar o endereço da API, ajuste a variável <code>NEXT_PUBLIC_API_URL</code> no arquivo <code>.env.local</code>.
          </div>
        </div>
      </div>

      {/* Filtros por Método HTTP */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map((method) => (
          <button
            key={method}
            onClick={() => setSelectedMethod(method)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: selectedMethod === method ? 'var(--primary)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${selectedMethod === method ? 'var(--primary)' : 'var(--border-subtle)'}`,
              color: selectedMethod === method ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {method === 'ALL' ? 'Todos os Métodos' : method}
          </button>
        ))}
      </div>

      {/* Lista de Endpoints */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredEndpoints.map((ep, idx) => {
          const methodStyle = getMethodBadgeStyle(ep.method);

          return (
            <div
              key={idx}
              className="card"
              style={{
                padding: '28px',
                border: '1px solid var(--border-medium)',
              }}
            >
              {/* Cabeçalho da Rota */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: methodStyle.bg,
                      border: `1px solid ${methodStyle.border}`,
                      color: methodStyle.color,
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {ep.method}
                  </span>
                  <span
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: '#fff',
                    }}
                  >
                    {ep.path}
                  </span>
                </div>

                <Badge variant="neutral">Status: {ep.statusSuccess}</Badge>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                {ep.title}
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  marginBottom: '20px',
                }}
              >
                {ep.description}
              </p>

              {/* Regras de Negócio */}
              {ep.rules && ep.rules.length > 0 && (
                <div
                  style={{
                    padding: '16px 18px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#fcd34d',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Regras de Negócio Obrigatórias:</span>
                  </div>
                  <ul
                    style={{
                      paddingLeft: '20px',
                      color: '#fde68a',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {ep.rules.map((rule, rIdx) => (
                      <li key={rIdx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Request Payload */}
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
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Payload de Requisição (JSON)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(ep.requestBody!, `req-${idx}`)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      {copiedKey === `req-${idx}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre
                    style={{
                      background: 'rgba(0, 0, 0, 0.45)',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      color: '#93c5fd',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.84rem',
                      overflowX: 'auto',
                      lineHeight: 1.5,
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
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Resposta de Sucesso (JSON)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(ep.responseBody, `res-${idx}`)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    {copiedKey === `res-${idx}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <pre
                  style={{
                    background: 'rgba(0, 0, 0, 0.45)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    color: '#86efac',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.84rem',
                    overflowX: 'auto',
                    lineHeight: 1.5,
                  }}
                >
                  {ep.responseBody}
                </pre>
              </div>

              {/* Erros Esperados */}
              {ep.errors && ep.errors.length > 0 && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '10px 14px',
                    background: 'rgba(244, 63, 94, 0.06)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(244, 63, 94, 0.18)',
                    fontSize: '0.82rem',
                    color: '#fda4af',
                  }}
                >
                  <strong>Erros possíveis: </strong>
                  {ep.errors.join(' • ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
