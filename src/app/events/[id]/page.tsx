'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiStatusBanner } from '@/components/ApiStatusBanner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { apiService } from '@/services/api';
import { Attendee, Event } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Video,
  Edit,
  Trash2,
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  Mail,
  User,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [attendeeSearch, setAttendeeSearch] = useState<string>('');

  // Modal de inscrição
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [attendeeName, setAttendeeName] = useState<string>('');
  const [attendeeEmail, setAttendeeEmail] = useState<string>('');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState<boolean>(false);

  // Dialog de exclusão de evento
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Dialog de cancelamento de inscrição
  const [attendeeToCancel, setAttendeeToCancel] = useState<Attendee | null>(null);
  const [isCancellingAttendee, setIsCancellingAttendee] = useState<boolean>(false);

  const [reloadKey, setReloadKey] = useState<number>(0);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    let isCancelled = false;
    if (!id) return;

    Promise.all([
      apiService.getEventById(id),
      apiService.getEventAttendees(id).catch(() => [] as Attendee[]),
    ])
      .then(([eventData, attendeesData]) => {
        if (!isCancelled) {
          setEvent(eventData);
          setAttendees(attendeesData);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : 'Erro ao buscar detalhes do evento.';
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [id, reloadKey]);

  const handleRegisterAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      setRegisterError('Por favor, informe o nome e o e-mail do participante.');
      return;
    }

    setRegisterError(null);
    setIsSubmittingRegistration(true);

    try {
      const newAttendee = await apiService.registerAttendee(id, {
        name: attendeeName.trim(),
        email: attendeeEmail.trim(),
      });

      setAttendees((prev) => [newAttendee, ...prev]);
      setEvent((prev) => {
        if (!prev) return null;
        const newCount = (prev.attendeesCount || 0) + 1;
        return {
          ...prev,
          attendeesCount: newCount,
          availableSpots: Math.max(0, prev.maxCapacity - newCount),
          isSoldOut: newCount >= prev.maxCapacity,
        };
      });

      setAttendeeName('');
      setAttendeeEmail('');
      setIsRegisterModalOpen(false);
      toast.success('Participante inscrito com sucesso!');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível confirmar a inscrição.';
      setRegisterError(msg);
      toast.error(msg);
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  const handleConfirmCancelAttendee = async () => {
    if (!attendeeToCancel) return;

    setIsCancellingAttendee(true);
    try {
      await apiService.cancelAttendee(id, attendeeToCancel.id);
      setAttendees((prev) => prev.filter((a) => a.id !== attendeeToCancel.id));

      setEvent((prev) => {
        if (!prev) return null;
        const newCount = Math.max(0, (prev.attendeesCount || 1) - 1);
        return {
          ...prev,
          attendeesCount: newCount,
          availableSpots: prev.maxCapacity - newCount,
          isSoldOut: false,
        };
      });

      toast.success('Inscrição cancelada e vaga liberada com sucesso.');
      setAttendeeToCancel(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cancelar inscrição.';
      toast.error(msg);
    } finally {
      setIsCancellingAttendee(false);
    }
  };

  const handleDeleteEvent = async () => {
    setIsDeleting(true);
    try {
      await apiService.deleteEvent(id);
      toast.success('Evento excluído com sucesso.');
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir o evento.';
      toast.error(msg);
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link do evento copiado para a área de transferência!');
    }
  };

  if (isLoading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '120px 0' }}>
        <div
          className="skeleton"
          style={{ width: '100%', height: '360px', borderRadius: 'var(--radius-xl)', marginBottom: '32px' }}
        />
        <div
          className="skeleton"
          style={{ width: '100%', height: '240px', borderRadius: 'var(--radius-lg)' }}
        />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="app-container">
        <Link
          href="/"
          className="btn btn-outline btn-sm"
          style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Eventos</span>
        </Link>
        <ApiStatusBanner
          error={error || 'Evento não encontrado no sistema.'}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  const attendeesCount = attendees.length || event.attendeesCount || 0;
  const capacity = event.maxCapacity || 1;
  const isFull = event.isSoldOut || attendeesCount >= capacity;
  const percentage = Math.min(100, Math.round((attendeesCount / capacity) * 100));
  const spotsLeft = Math.max(0, capacity - attendeesCount);

  // Filtro de participantes em tela
  const filteredAttendees = attendees.filter(
    (a) =>
      a.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(attendeeSearch.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Barra de Navegação Superior / Breadcrumb */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <Link
          href="/"
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Todos os Eventos</span>
        </Link>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            icon={<Share2 className="w-4 h-4" />}
          >
            Compartilhar
          </Button>
          <Link href={`/events/${id}/edit`} className="btn btn-secondary btn-sm">
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Excluir
          </Button>
        </div>
      </div>

      {/* Hero do Evento */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          marginBottom: '32px',
          border: '1px solid var(--border-medium)',
        }}
      >
        {/* Banner Cover com Aspecto Cinematográfico */}
        <div
          style={{
            minHeight: '260px',
            width: '100%',
            background: event.imageUrl
              ? `url(${event.imageUrl}) center/cover no-repeat`
              : 'linear-gradient(135deg, #111726 0%, #1a233a 50%, #0f172a 100%)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '36px 32px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(11,15,23,0.98) 0%, rgba(11,15,23,0.6) 50%, rgba(11,15,23,0.2) 100%)',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <Badge variant="primary">{event.category}</Badge>
              <Badge variant="neutral">
                {event.locationType === 'online' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Video className="w-3.5 h-3.5" /> Online
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin className="w-3.5 h-3.5" /> Presencial
                  </span>
                )}
              </Badge>
              {isFull ? (
                <Badge variant="danger">Lotação Esgotada</Badge>
              ) : percentage >= 75 ? (
                <Badge variant="warning">Últimas Vagas</Badge>
              ) : (
                <Badge variant="success">Inscrições Abertas</Badge>
              )}
            </div>

            <h1
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
              }}
            >
              {event.title}
            </h1>
          </div>
        </div>

        {/* Informações detalhadas do Evento em Grid */}
        <div
          style={{
            padding: '36px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '36px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', color: '#fff' }}>
              Sobre o Evento
            </h3>
            <p
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                whiteSpace: 'pre-wrap',
                fontSize: '0.96rem',
                marginBottom: '28px',
              }}
            >
              {event.description}
            </p>

            {/* Metadados de Data e Local */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Data e Horário
                  </div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginTop: '2px' }}>
                    {formatDate(event.date)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background:
                      event.locationType === 'online'
                        ? 'rgba(6, 182, 212, 0.1)'
                        : 'rgba(16, 185, 129, 0.1)',
                    color: event.locationType === 'online' ? '#22d3ee' : '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {event.locationType === 'online' ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {event.locationType === 'online' ? 'Link de Transmissão' : 'Localização'}
                  </div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginTop: '2px' }}>
                    {event.location}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Lateral de Vagas e Inscrição */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(180deg, #131b2e 0%, #0d1322 100%)',
              border: '1px solid var(--border-medium)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 'fit-content',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users className="w-4 h-4 text-indigo-400" />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                    Controle de Lotação
                  </h4>
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    color: isFull ? '#f43f5e' : percentage >= 75 ? '#fbbf24' : '#34d399',
                  }}
                >
                  {percentage}%
                </span>
              </div>

              <ProgressBar value={percentage} size="lg" isSoldOut={isFull} />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.88rem',
                  marginTop: '14px',
                  color: 'var(--text-secondary)',
                }}
              >
                <span>
                  Inscritos: <strong style={{ color: '#fff' }}>{attendeesCount}</strong>
                </span>
                <span>
                  Capacidade: <strong style={{ color: '#fff' }}>{capacity}</strong>
                </span>
              </div>

              <div
                style={{
                  marginTop: '20px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: isFull
                    ? 'rgba(244, 63, 94, 0.1)'
                    : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${
                    isFull ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.25)'
                  }`,
                  color: isFull ? '#fda4af' : '#6ee7b7',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {isFull
                    ? 'Capacidade máxima atingida. Inscrições encerradas.'
                    : `${spotsLeft} vagas ainda disponíveis para novos participantes.`}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '28px' }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setRegisterError(null);
                  setIsRegisterModalOpen(true);
                }}
                disabled={isFull}
                style={{ width: '100%' }}
                icon={<UserPlus className="w-5 h-5" />}
              >
                {isFull ? 'Lotação Esgotada' : 'Inscrever Participante'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Participantes Inscritos */}
      <section className="card" style={{ padding: '32px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Participantes Inscritos
              </h3>
              <Badge variant="primary">{attendees.length}</Badge>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px' }}>
              Gerencie a presença dos participantes confirmados para este evento.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {attendees.length > 0 && (
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search
                  className="w-3.5 h-3.5"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '34px', paddingRight: '12px', fontSize: '0.86rem', padding: '8px 12px 8px 34px' }}
                  placeholder="Buscar participante..."
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                />
              </div>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setRegisterError(null);
                setIsRegisterModalOpen(true);
              }}
              disabled={isFull}
              icon={<UserPlus className="w-4 h-4" />}
            >
              Nova Inscrição
            </Button>
          </div>
        </div>

        {attendees.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.015)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Users className="w-6 h-6" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
              Nenhum participante inscrito ainda
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Comece a cadastrar os participantes ou compartilhe o evento para preencher as vagas.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsRegisterModalOpen(true)}
              disabled={isFull}
              icon={<UserPlus className="w-4 h-4" />}
            >
              Realizar Primeira Inscrição
            </Button>
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-secondary)' }}>
            Nenhum participante encontrado com o termo &ldquo;{attendeeSearch}&rdquo;.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <th style={{ padding: '14px 16px' }}>Participante</th>
                  <th style={{ padding: '14px 16px' }}>E-mail</th>
                  <th style={{ padding: '14px 16px' }}>Data de Registro</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map((attendee) => (
                  <tr
                    key={attendee.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: '#a5b4fc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                          }}
                        >
                          {attendee.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{attendee.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {attendee.email}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {attendee.registeredAt
                        ? new Date(attendee.registeredAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAttendeeToCancel(attendee)}
                        style={{ color: '#f87171' }}
                        title="Cancelar inscrição"
                      >
                        Cancelar Vaga
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de Inscrição de Participante */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Inscrever Participante"
        description="Preencha as informações para registrar uma nova vaga no evento."
      >
        <form onSubmit={handleRegisterAttendee}>
          <div className="modal-body">
            {registerError && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fda4af',
                  fontSize: '0.88rem',
                  marginBottom: '16px',
                }}
              >
                {registerError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Nome Completo <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  className="w-4 h-4"
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Silva"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                E-mail Profissional ou Pessoal <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  className="w-4 h-4"
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="email"
                  required
                  placeholder="carlos@exemplo.com"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                />
              </div>
              <p className="form-helper">
                Enviaremos a confirmação e as informações de acesso para este endereço.
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsRegisterModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingRegistration}
            >
              Confirmar Inscrição
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dialog de Confirmação para Cancelamento de Inscrição */}
      <ConfirmDialog
        isOpen={!!attendeeToCancel}
        onClose={() => setAttendeeToCancel(null)}
        onConfirm={handleConfirmCancelAttendee}
        title="Cancelar Inscrição?"
        description={`Deseja realmente remover a inscrição de "${attendeeToCancel?.name}"? A vaga será liberada imediatamente no evento.`}
        confirmText="Sim, Cancelar Vaga"
        cancelText="Voltar"
        variant="danger"
        isLoading={isCancellingAttendee}
      />

      {/* Dialog de Confirmação para Exclusão de Evento */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEvent}
        title="Excluir este Evento?"
        description={`Tem certeza que deseja excluir "${event.title}"? Todas as inscrições associadas serão canceladas e esta ação não poderá ser desfeita.`}
        confirmText="Excluir Evento"
        cancelText="Manter Evento"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
