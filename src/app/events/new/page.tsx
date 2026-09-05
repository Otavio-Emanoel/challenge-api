'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiService } from '@/services/api';
import { LocationType } from '@/types';

export default function NewEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tecnologia');
  const [date, setDate] = useState('');
  const [locationType, setLocationType] = useState<LocationType>('presential');
  const [location, setLocation] = useState('');
  const [maxCapacity, setMaxCapacity] = useState<number>(50);
  const [imageUrl, setImageUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !description.trim() || !date || !location.trim()) {
      setFormError('Por favor, preencha todos os campos obrigatórios marcados com (*).');
      return;
    }

    if (maxCapacity < 1) {
      setFormError('A capacidade do evento deve ser de no mínimo 1 pessoa.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Converte a data para ISO 8601
      const isoDate = new Date(date).toISOString();

      const createdEvent = await apiService.createEvent({
        title: title.trim(),
        description: description.trim(),
        category,
        date: isoDate,
        locationType,
        location: location.trim(),
        maxCapacity: Number(maxCapacity),
        imageUrl: imageUrl.trim() || undefined,
      });

      router.push(`/events/${createdEvent.id}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Não foi possível cadastrar o evento. Verifique a API.';
      setFormError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: '800px' }}>
      <Link href="/" className="btn btn-outline btn-sm" style={{ marginBottom: '24px' }}>
        ← Voltar para Todos os Eventos
      </Link>

      <div className="card" style={{ padding: '36px' }}>
        <div style={{ marginBottom: '28px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
            POST /api/events
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            Criar Novo Evento
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Cadastre as informações do evento para disponibilizá-lo na plataforma.
          </p>
        </div>

        {formError && (
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontSize: '0.9rem',
              marginBottom: '24px',
              lineHeight: 1.5,
            }}
          >
            <strong>Erro ao criar evento:</strong> {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Título do Evento <span className="required">*</span>
            </label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Workshop de Microsserviços e Event-Driven Architecture"
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
                Capacidade Máxima de Vagas <span className="required">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                className="form-input"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 1)}
              />
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
                Modalidade do Evento <span className="required">*</span>
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
                placeholder={
                  locationType === 'online'
                    ? 'Ex: https://zoom.us/j/123456789'
                    : 'Ex: Av. Paulista, 1000 - Bela Vista, São Paulo'
                }
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              URL da Imagem de Capa <span style={{ color: 'var(--text-muted)' }}>(Opcional)</span>
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Descrição Completa do Evento <span className="required">*</span>
            </label>
            <textarea
              required
              rows={5}
              className="form-textarea"
              placeholder="Descreva os temas abordados, palestrantes, público-alvo e cronograma..."
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
            <Link href="/" className="btn btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ minWidth: '160px' }}
            >
              {isSubmitting ? 'Salvando na API...' : 'Publicar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
