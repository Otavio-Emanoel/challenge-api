'use client';

import Link from 'next/link';
import { Event } from '@/types';
import { formatDate } from '@/lib/utils';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { Calendar, MapPin, Video, ArrowRight, Users, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const attendees = event.attendeesCount || 0;
  const capacity = event.maxCapacity || 1;
  const percentage = Math.min(100, Math.round((attendees / capacity) * 100));
  const isFull = event.isSoldOut || attendees >= capacity;
  const spotsLeft = Math.max(0, capacity - attendees);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link do evento copiado para a área de transferência!');
  };

  return (
    <div
      className="card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: 0,
      }}
    >
      {/* Cover Image / Header Banner */}
      <div
        style={{
          height: '170px',
          width: '100%',
          position: 'relative',
          background: event.imageUrl
            ? `url(${event.imageUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, #162035 0%, #1e293b 50%, #0f172a 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(11,15,23,0.92) 100%)',
          }}
        />

        {/* Top Badges & Share button */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Badge variant="primary">{event.category}</Badge>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isFull ? (
              <Badge variant="danger">Esgotado</Badge>
            ) : percentage >= 75 ? (
              <Badge variant="warning">Últimas Vagas</Badge>
            ) : (
              <Badge variant="success">Inscrições Abertas</Badge>
            )}
            <button
              onClick={handleShare}
              title="Copiar link"
              aria-label="Compartilhar evento"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Time & Location info */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.8rem',
            color: '#cbd5e1',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            {event.locationType === 'online' ? (
              <Video className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{event.locationType === 'online' ? 'Online' : 'Presencial'}</span>
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(event.date)}</span>
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div
        style={{
          padding: '20px 22px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              lineHeight: 1.35,
              color: '#fff',
              marginBottom: '8px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
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
              marginBottom: '20px',
            }}
          >
            {event.description}
          </p>
        </div>

        {/* Capacity Section */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.82rem',
              marginBottom: '8px',
            }}
          >
            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Ocupação ({attendees}/{capacity})</span>
            </span>
            <span
              style={{
                fontWeight: 700,
                color: isFull ? '#f43f5e' : percentage >= 75 ? '#fbbf24' : '#34d399',
              }}
            >
              {percentage}%
            </span>
          </div>

          <ProgressBar value={percentage} isSoldOut={isFull} />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {isFull ? 'Lotação esgotada' : `${spotsLeft} vagas restantes`}
            </span>

            <Link
              href={`/events/${event.id}`}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <span>Gerenciar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
