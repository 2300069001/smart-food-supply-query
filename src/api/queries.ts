import { apiRequest } from './client';
import type { QueryQuery, QueryCategory, QueryPriority, WorkflowStage } from '../types';

export function fetchQueries(): Promise<QueryQuery[]> {
  return apiRequest<QueryQuery[]>('/api/queries');
}

export function fetchQuery(id: string): Promise<QueryQuery> {
  return apiRequest<QueryQuery>(`/api/queries/${encodeURIComponent(id)}`);
}

export interface CreateQueryInput {
  supplierId: string;
  category: QueryCategory;
  subject: string;
  message: string;
  priority: QueryPriority;
  attachmentName?: string;
  context?: Record<string, string> | null;
}

export function createQuery(input: CreateQueryInput): Promise<QueryQuery> {
  return apiRequest<QueryQuery>('/api/queries', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export interface UpdateQueryStatusInput {
  stage: WorkflowStage;
  message?: string;
  actor?: string;
}

export function updateQueryStatus(
  id: string,
  input: UpdateQueryStatusInput,
): Promise<QueryQuery> {
  return apiRequest<QueryQuery>(`/api/queries/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
