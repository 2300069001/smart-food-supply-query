import { apiRequest } from './client';
import type { Supplier } from '../types';

export function fetchSuppliers(): Promise<Supplier[]> {
  return apiRequest<Supplier[]>('/api/suppliers');
}

export function fetchSupplier(id: string): Promise<Supplier> {
  return apiRequest<Supplier>(`/api/suppliers/${encodeURIComponent(id)}`);
}
