'use client';

import Link from 'next/link';
import { Event } from '@/types';
import { formatDate } from '@/lib/utils';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { ArrowRight, MapPin, Video } from 'lucide-react';

export interface EventTableViewProps {
  events: Event[];
}

export function EventTableView({ events }: EventTableViewProps) {
  return (
    <div
      className="card"
      style={{
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.02)',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <th style={{ padding: '14px 20px' }}>Evento</th>
              <th style={{ padding: '14px 20px' }}>Categoria</th>
              <th style={{ padding: '14px 20px' }}>Data e Horário</th>
              <th style={{ padding: '14px 20px' }}>Formato</th>
              <th style={{ padding: '14px 20px', width: '220px' }}>Lotação</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const attendees = event.attendeesCount || 0;
              const capacity = event.maxCapacity || 1;
              const percentage = Math.min(100, Math.round((attendees / capacity) * 100));
              const isFull = event.isSoldOut || attendees >= capacity;

              return (
                <tr
                  key={event.id}
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
                  <td style={{ padding: '16px 20px' }}>
                    <Link
                      href={`/events/${event.id}`}
                      style={{
                        fontWeight: 600,
                        color: '#fff',
                        fontSize: '0.94rem',
                        display: 'block',
                      }}
                    >
                      {event.title}
                    </Link>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginTop: '2px',
                        maxWidth: '380px',
                      }}
                    >
                      {event.description}
                    </span>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <Badge variant="primary">{event.category}</Badge>
                  </td>

                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    {formatDate(event.date)}
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.84rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {event.locationType === 'online' ? (
                        <Video className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span>{event.locationType === 'online' ? 'Online' : 'Presencial'}</span>
                    </span>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {attendees} / {capacity}
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
                    <ProgressBar value={percentage} size="sm" isSoldOut={isFull} />
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <Link
                      href={`/events/${event.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '4px' }}
                    >
                      <span>Gerenciar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
