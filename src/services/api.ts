import {
  Attendee,
  CreateAttendeeInput,
  CreateEventInput,
  DashboardStats,
  Event,
  EventsResponse,
  UpdateEventInput,
} from '@/types';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  errors?: { field?: string; message: string }[];

  constructor(message: string, status: number, errors?: { field?: string; message: string }[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new ApiError(
      `Não foi possível conectar ao backend em "${API_BASE_URL}". Verifique se a sua API está em execução e se o CORS está configurado para aceitar requisições do frontend. (Detalhe: ${errorMsg})`,
      0
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorBody = data as { message?: string; errors?: { field?: string; message: string }[] } | null;
    const message =
      errorBody?.message ||
      (response.status === 404
        ? 'Recurso não encontrado no backend.'
        : response.status === 409
        ? 'Conflito de dados: este registro já existe.'
        : response.status === 400
        ? 'Requisição inválida. Verifique os campos enviados.'
        : `Erro na resposta do backend (HTTP ${response.status}).`);

    throw new ApiError(message, response.status, errorBody?.errors);
  }

  return data as T;
}

export const apiService = {
  // Checagem de status da API
  async checkHealth(): Promise<{ status: string; timestamp: string; uptime?: number }> {
    return request<{ status: string; timestamp: string; uptime?: number }>('/api/health');
  },

  // Métricas do Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return request<DashboardStats>('/api/dashboard/stats');
  },

  // Categorias cadastradas
  async getCategories(): Promise<string[]> {
    return request<string[]>('/api/categories');
  },

  // Listagem de eventos com filtros
  async getEvents(params: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<EventsResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = queryString ? `/api/events?${queryString}` : '/api/events';

    return request<EventsResponse>(endpoint);
  },

  // Detalhe de um evento
  async getEventById(id: string): Promise<Event> {
    return request<Event>(`/api/events/${id}`);
  },

  // Criação de evento
  async createEvent(data: CreateEventInput): Promise<Event> {
    return request<Event>('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualização de evento
  async updateEvent(id: string, data: UpdateEventInput): Promise<Event> {
    return request<Event>(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Exclusão de evento
  async deleteEvent(id: string): Promise<void> {
    return request<void>(`/api/events/${id}`, {
      method: 'DELETE',
    });
  },

  // Listagem de participantes de um evento
  async getEventAttendees(eventId: string): Promise<Attendee[]> {
    return request<Attendee[]>(`/api/events/${eventId}/attendees`);
  },

  // Inscrição de participante no evento
  async registerAttendee(eventId: string, data: CreateAttendeeInput): Promise<Attendee> {
    return request<Attendee>(`/api/events/${eventId}/attendees`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Cancelamento de inscrição
  async cancelAttendee(eventId: string, attendeeId: string): Promise<void> {
    return request<void>(`/api/events/${eventId}/attendees/${attendeeId}`, {
      method: 'DELETE',
    });
  },
};
