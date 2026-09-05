'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiStatusBanner } from '@/components/ApiStatusBanner';
import { apiService } from '@/services/api';
import { EventStatus, LocationType } from '@/types';

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

        // Formata data ISO para string compatível com input datetime-local (YYYY-MM-DDTHH:mm)
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

      router.push(`/events/${id}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível atualizar o evento.';
      setFormError(msg);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '120px 0' }}>
        <div className="spinner spinner-lg" />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
          Carregando dados para edição...
        </p>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ maxWidth: '800px' }}>
      <Link href={`/events/${id}`} className="btn btn-outline btn-sm" style={{ marginBottom: '24px' }}>
        ← Cancelar e Voltar ao Evento
      </Link>

      <div className="card" style={{ padding: '36px' }}>
        <div style={{ marginBottom: '28px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
            PUT /api/events/:id
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            Editar Evento
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Atualize as informações do evento. Participantes já inscritos serão preservados.
          </p>
        </div>

        {formError && <ApiStatusBanner error={formError} />}

        <form onSubmit={handleSubmit}>
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

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
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
              <label className="form-label">
                Status do Evento
              </label>
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
                Data e Horário de Início <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                required
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Capacidade Máxima <span className="required">*</span>
              </label>
              <input
                type="number"
                required
                min={attendeesCount || 1}
                className="form-input"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 1)}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Mínimo: {attendeesCount} (participantes atuais)
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="form-group">
              <label className="form-label">
                Modalidade <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as LocationType)}
              >
                <option value="presential">📍 Presencial</option>
                <option value="online">💻 Online</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">
                {locationType === 'online' ? 'Link de Transmissão' : 'Endereço / Local'}{' '}
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

          <div className="form-group">
            <label className="form-label">URL da Imagem de Capa</label>
            <input
              type="url"
              className="form-input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Descrição Completa <span className="required">*</span>
            </label>
            <textarea
              required
              rows={5}
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '32px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '24px',
            }}
          >
            <Link href={`/events/${id}`} className="btn btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ minWidth: '160px' }}
            >
              {isSubmitting ? 'Salvando Alterações...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
