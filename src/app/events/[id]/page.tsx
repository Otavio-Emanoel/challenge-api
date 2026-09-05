'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ApiStatusBanner } from '@/components/ApiStatusBanner';
import { apiService } from '@/services/api';
import { Attendee, Event } from '@/types';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de inscrição
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [attendeeName, setAttendeeName] = useState<string>('');
  const [attendeeEmail, setAttendeeEmail] = useState<string>('');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState<boolean>(false);

  // Modal de exclusão de evento
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Estado para exclusão de participante
  const [deletingAttendeeId, setDeletingAttendeeId] = useState<string | null>(null);

  const loadEventData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      const [eventData, attendeesData] = await Promise.all([
        apiService.getEventById(id),
        apiService.getEventAttendees(id).catch(() => [] as Attendee[]),
      ]);

      setEvent(eventData);
      setAttendees(attendeesData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar detalhes do evento.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEventData();
  }, [loadEventData]);

  const handleRegisterAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      setRegisterError('Preencha o nome e o e-mail do participante.');
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
      // Atualiza os dados do evento para recalcular vagas
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Não foi possível inscrever o participante.';
      setRegisterError(msg);
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  const handleCancelAttendee = async (attendeeId: string) => {
    if (!confirm('Deseja realmente cancelar esta inscrição? A vaga será liberada no evento.')) {
      return;
    }

    setDeletingAttendeeId(attendeeId);
    try {
      await apiService.cancelAttendee(id, attendeeId);
      setAttendees((prev) => prev.filter((a) => a.id !== attendeeId));

      // Atualiza vagas no evento
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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao cancelar inscrição.');
    } finally {
      setDeletingAttendeeId(null);
    }
  };

  const handleDeleteEvent = async () => {
    setIsDeleting(true);
    try {
      await apiService.deleteEvent(id);
      router.push('/');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir evento.');
      setIsDeleting(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '120px 0' }}>
        <div className="spinner spinner-lg" />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
          Carregando informações do evento...
        </p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="app-container">
        <Link href="/" className="btn btn-outline btn-sm" style={{ marginBottom: '24px' }}>
          ← Voltar para Eventos
        </Link>
        <ApiStatusBanner error={error || 'Evento não encontrado no backend.'} onRetry={loadEventData} />
      </div>
    );
  }

  const attendeesCount = attendees.length || event.attendeesCount || 0;
  const capacity = event.maxCapacity || 1;
  const isFull = event.isSoldOut || attendeesCount >= capacity;
  const percentage = Math.min(100, Math.round((attendeesCount / capacity) * 100));

  return (
    <div className="app-container">
      {/* Navegação de retorno e ações */}
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
        <Link href="/" className="btn btn-outline btn-sm">
          ← Voltar para Todos os Eventos
        </Link>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href={`/events/${id}/edit`} className="btn btn-secondary btn-sm">
            ✏️ Editar Evento
          </Link>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn btn-danger btn-sm"
          >
            🗑️ Excluir
          </button>
        </div>
      </div>

      {/* Header do Evento */}
      <div
        className="card"
        style={{
          padding: '0',
          overflow: 'hidden',
          marginBottom: '32px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Banner de Imagem */}
        <div
          style={{
            height: '240px',
            width: '100%',
            background: event.imageUrl
              ? `url(${event.imageUrl}) center/cover no-repeat`
              : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '32px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15,23,42,1) 0%, rgba(15,23,42,0.4) 100%)',
            }}
          />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{event.category}</span>
              <span className="badge badge-neutral">
                {event.locationType === 'online' ? '💻 Online' : '📍 Presencial'}
              </span>
              {isFull ? (
                <span className="badge badge-danger">LOTADO</span>
              ) : (
                <span className="badge badge-success">INSCRIÇÕES ABERTAS</span>
              )}
            </div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {event.title}
            </h1>
          </div>
        </div>

        {/* Informações detalhadas */}
        <div
          style={{
            padding: '32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: '#fff' }}>
              Sobre o Evento
            </h3>
            <p
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                marginBottom: '24px',
              }}
            >
              {event.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>🕒</span>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DATA E HORA</div>
                  <div style={{ fontWeight: 600 }}>{formatDate(event.date)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>
                  {event.locationType === 'online' ? '🌐' : '📍'}
                </span>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {event.locationType === 'online' ? 'LINK DE TRANSMISSÃO' : 'LOCALIZAÇÃO'}
                  </div>
                  <div style={{ fontWeight: 600 }}>{event.location}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Lateral de Vagas & Ação de Inscrição */}
          <div
            className="card"
            style={{
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
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
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                  Status das Inscrições
                </h4>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    color: isFull ? '#f87171' : '#34d399',
                  }}
                >
                  {percentage}%
                </span>
              </div>

              <div className="progress-container" style={{ height: '10px' }}>
                <div
                  className={`progress-fill ${isFull ? 'full' : percentage > 75 ? 'warning' : ''}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.88rem',
                  marginTop: '12px',
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
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: isFull ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${
                    isFull ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'
                  }`,
                  color: isFull ? '#fca5a5' : '#6ee7b7',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                }}
              >
                {isFull
                  ? '⚠️ Vagas esgotadas! Não é possível cadastrar novos inscritos.'
                  : `🎉 ${Math.max(0, capacity - attendeesCount)} vagas ainda disponíveis!`}
              </div>
            </div>

            <button
              onClick={() => {
                setRegisterError(null);
                setIsRegisterModalOpen(true);
              }}
              disabled={isFull}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '24px' }}
            >
              {isFull ? 'Evento Esgotado' : '+ Inscrever Participante'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Participantes Confirmados */}
      <section className="card" style={{ padding: '28px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              Participantes Inscritos ({attendees.length})
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Lista sincronizada com os endpoints `GET /api/events/:id/attendees` e `POST/DELETE`.
            </p>
          </div>

          <button
            onClick={() => {
              setRegisterError(null);
              setIsRegisterModalOpen(true);
            }}
            disabled={isFull}
            className="btn btn-secondary btn-sm"
          >
            + Nova Inscrição
          </button>
        </div>

        {attendees.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Nenhum participante inscrito até o momento.
            </p>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              disabled={isFull}
              className="btn btn-primary btn-sm"
            >
              Fazer Primeira Inscrição
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                  }}
                >
                  <th style={{ padding: '12px 16px' }}>Nome</th>
                  <th style={{ padding: '12px 16px' }}>E-mail</th>
                  <th style={{ padding: '12px 16px' }}>Data de Inscrição</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee) => (
                  <tr
                    key={attendee.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#fff' }}>
                      {attendee.name}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {attendee.email}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {attendee.registeredAt
                        ? new Date(attendee.registeredAt).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleCancelAttendee(attendee.id)}
                        disabled={deletingAttendeeId === attendee.id}
                        className="btn btn-danger btn-sm"
                        title="Cancelar inscrição e liberar vaga"
                      >
                        {deletingAttendeeId === attendee.id ? 'Cancelando...' : 'Cancelar Vaga'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de Inscrição de Participante */}
      {isRegisterModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Inscrever Participante</h3>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterAttendee}>
              <div className="modal-body">
                {registerError && (
                  <div
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f87171',
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
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Oliveira"
                    className="form-input"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    E-mail <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="carlos@empresa.com"
                    className="form-input"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    O backend retornará erro 409 se este e-mail já estiver cadastrado no evento.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRegistration}
                  className="btn btn-primary"
                >
                  {isSubmittingRegistration ? 'Confirmando...' : 'Confirmar Inscrição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão de Evento */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Excluir Evento</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Tem certeza que deseja excluir o evento <strong>"{event.title}"</strong>? Esta
                ação removerá todas as inscrições associadas e não pode ser desfeita.
              </p>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={isDeleting}
                className="btn btn-danger"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, Excluir Evento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
