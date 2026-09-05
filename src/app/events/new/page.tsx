'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiService } from '@/services/api';
import { LocationType } from '@/types';
import { Button } from '@/components/ui/Button';
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
      setFormError('A capacidade do evento deve ser de no mínimo 1 vaga.');
      return;
    }

    setIsSubmitting(true);

    try {
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

      toast.success('Evento criado com sucesso!');
      router.push(`/events/${createdEvent.id}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Não foi possível cadastrar o evento. Tente novamente mais tarde.';
      setFormError(msg);
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: '840px' }}>
      {/* Voltar */}
      <Link
        href="/"
        className="btn btn-outline btn-sm"
        style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para Eventos</span>
      </Link>

      <div className="card" style={{ padding: '36px 40px', border: '1px solid var(--border-medium)' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
            Novo Cadastro
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Criar Novo Evento
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.96rem' }}>
            Preencha os detalhes para publicar seu evento e começar a gerenciar os participantes.
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
          {/* Seção 1: Dados Gerais */}
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
                placeholder="Ex: Summit de Inteligência Artificial & Computação em Nuvem"
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
            </div>

            <div className="form-group">
              <label className="form-label">
                Descrição do Evento <span className="required">*</span>
              </label>
              <textarea
                required
                rows={4}
                className="form-textarea"
                placeholder="Descreva a programação, palestrantes, objetivos e a quem o evento se destina..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Seção 2: Formato e Local */}
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

              <div className="form-group">
                <label className="form-label">
                  {locationType === 'online' ? 'Link de Transmissão / Plataforma' : 'Endereço Completo'}{' '}
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder={
                    locationType === 'online'
                      ? 'Ex: https://zoom.us/j/123456789'
                      : 'Ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP'
                  }
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Capacidade e Imagem */}
          <div style={{ marginBottom: '32px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              3. Capacidade & Imagem
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  Capacidade Máxima de Participantes <span className="required">*</span>
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
                    min="1"
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <p className="form-helper">
                  Ao atingir este número, novas inscrições serão bloqueadas automaticamente.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  URL da Imagem de Capa <span style={{ color: 'var(--text-muted)' }}>(Opcional)</span>
                </label>
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
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <p className="form-helper">
                  Uma boa imagem aumenta significativamente o interesse no evento.
                </p>
              </div>
            </div>

            {/* Pré-visualização da Capa se houver URL */}
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

          {/* Ações de Submissão */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '24px',
            }}
          >
            <Link href="/" className="btn btn-secondary">
              Cancelar
            </Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Publicar Evento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
