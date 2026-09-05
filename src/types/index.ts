export type LocationType = 'presential' | 'online';

export type EventStatus = 'published' | 'draft' | 'cancelled' | 'completed';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string; // ISO 8601
  locationType: LocationType;
  location: string;
  maxCapacity: number;
  imageUrl?: string;
  status: EventStatus;
  attendeesCount: number;
  availableSpots: number;
  isSoldOut: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attendee {
  id: string;
  eventId: string;
  name: string;
  email: string;
  registeredAt: string;
}

export interface DashboardStats {
  totalEvents: number;
  activeRegistrations: number;
  soldOutEvents: number;
  upcomingEvents: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EventsResponse {
  events: Event[];
  pagination: Pagination;
}

export interface CreateEventInput {
  title: string;
  description: string;
  category: string;
  date: string;
  locationType: LocationType;
  location: string;
  maxCapacity: number;
  imageUrl?: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  status?: EventStatus;
}

export interface CreateAttendeeInput {
  name: string;
  email: string;
}

export interface ApiFieldError {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: ApiFieldError[];
}
