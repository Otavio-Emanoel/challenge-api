'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { apiService } from '@/services/api';
import { EventStatus, LocationType } from '@/types';
import {
  ArrowLeft,
  MapPin,
  Video,
  Users,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tecnologia');
  const [date, setDate] = useState('');
  const [locationType, setLocationType] = useState<LocationType>('presential');
  const [location, setLocation] = useState('');
  const [maxCapacity, setMaxCapacity] = useState<number>(50);
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<EventStatus>('published');
  const [attendeesCount, setAttendeesCount] = useState<number>(0);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      setIsLoading(true);
      setFormError(null);
      try {
        const event = await apiService.getEventById(id);
        setTitle(event.title);
        setDescription(event.description);
        setCategory(event.category);
        setLocationType(event.locationType);
        setLocation(event.location);
        setMaxCapacity(event.maxCapacity);
        setImageUrl(event.imageUrl || '');
        setStatus(event.status || 'published');
        setAttendeesCount(event.attendeesCount || 0);

        if (event.date) {
          const d = new Date(event.date);
          const formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setDate(formattedDate);
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Erro ao carregar dados do evento para edição.';
        setFormError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !description.trim() || !date || !location.trim()) {
      setFormError('Por favor, preencha todos os campos obrigatórios marcados com (*).');
      return;
    }

    if (maxCapacity < attendeesCount) {
      setFormError(
        `A capacidade máxima (${maxCapacity}) não pode ser inferior ao número de participantes já inscritos (${attendeesCount}).`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const isoDate = new Date(date).toISOString();

      await apiService.updateEvent(id, {
        title: title.trim(),
        description: description.trim(),
        category,
        date: isoDate,
        locationType,
        location: location.trim(),
        maxCapacity: Number(maxCapacity),
        imageUrl: imageUrl.trim() || undefined,
        status,
      });

      toast.success('Alterações salvas com sucesso!');
      router.push(`/events/${id}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível atualizar o evento.';
      setFormError(msg);
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-container" style={{ maxWidth: '840px', padding: '100px 0', textAlign: 'center' }}>
        <div className="skeleton" style={{ height: '480px', borderRadius: 'var(--radius-xl)' }} />
      </div>
    );
  }

  return (
    <div className="app-container" style={{ maxWidth: '840px' }}>
      <Link
        href={`/events/${id}`}
        className="btn btn-outline btn-sm"
        style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Cancelar e Voltar ao Evento</span>
      </Link>

      <div className="card" style={{ padding: '36px 40px', border: '1px solid var(--border-medium)' }}>
        <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
            Edição de Cadastro
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Editar Evento
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.96rem' }}>
            Atualize as informações do evento. Os {attendeesCount} participantes inscritos serão preservados.
          </p>
        </div>

        {formError && (
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fda4af',
              fontSize: '0.9rem',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <strong>Atenção:</strong> {formError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Seção 1: Informações Principais */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              1. Informações Básicas
            </h3>

            <div className="form-group">
              <label className="form-label">
                Título do Evento <span className="required">*</span>
              </label>
              <input
                type="text"
                required
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  Categoria <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Design">Design</option>
                  <option value="Negócios">Negócios</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Desenvolvimento Pessoal">Desenvolvimento Pessoal</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status de Publicação</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventStatus)}
                >
                  <option value="published">Publicado</option>
                  <option value="draft">Rascunho</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Data e Horário <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Descrição do Evento <span className="required">*</span>
              </label>
              <textarea
                required
                rows={4}
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Seção 2: Formato & Localização */}
          <div style={{ marginBottom: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              2. Formato & Localização
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  Modalidade <span className="required">*</span>
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setLocationType('presential')}
                    style={{
                      flex: 1,
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: locationType === 'presential' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-input)',
                      border: `1px solid ${
                        locationType === 'presential' ? 'var(--primary)' : 'var(--border-subtle)'
                      }`,
                      color: locationType === 'presential' ? '#fff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Presencial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocationType('online')}
                    style={{
                      flex: 1,
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: locationType === 'online' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
                      border: `1px solid ${
                        locationType === 'online' ? '#06b6d4' : 'var(--border-subtle)'
                      }`,
                      color: locationType === 'online' ? '#fff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Video className="w-4 h-4" />
                    <span>Online</span>
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">
                  {locationType === 'online' ? 'Link de Transmissão / Plataforma' : 'Endereço Completo'}{' '}
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Capacidade & Capa */}
          <div style={{ marginBottom: '32px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              3. Lotação & Capa
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  Capacidade Máxima <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Users
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
                    type="number"
                    required
                    min={attendeesCount || 1}
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <p className="form-helper">
                  {attendeesCount > 0
                    ? `Mínimo de ${attendeesCount} vagas devido aos inscritos atuais.`
                    : 'Defina a quantidade de participantes suportada.'}
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">URL da Imagem de Capa</label>
                <div style={{ position: 'relative' }}>
                  <ImageIcon
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
                    type="url"
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {imageUrl && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Pré-visualização da Imagem:
                </div>
                <div
                  style={{
                    height: '140px',
                    borderRadius: 'var(--radius-md)',
                    background: `url(${imageUrl}) center/cover no-repeat`,
                    border: '1px solid var(--border-medium)',
                  }}
                />
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '24px',
            }}
          >
            <Link href={`/events/${id}`} className="btn btn-secondary">
              Cancelar
            </Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
