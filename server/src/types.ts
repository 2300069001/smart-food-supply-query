export type QueryStatusValue = 'pending' | 'in-progress' | 'resolved' | 'overdue';
export type WorkflowStatus = 'pending' | 'in-progress' | 'resolved';
export type QueryPriority = 'low' | 'medium' | 'high';

export type QueryCategory =
  | 'Allergen Information'
  | 'Certificate / Compliance'
  | 'Ingredient Safety'
  | 'Product Documentation'
  | 'Other';

export type CertificateStatus = 'valid' | 'expiring-soon' | 'expired' | 'none';

export type TimelineStageKey = 'raised' | 'sent' | 'responded' | 'review' | 'resolved';

export interface SupplierRow {
  id: string;
  name: string;
  category: string;
  contact_name: string;
  contact_email: string;
  certificate_name: string | null;
  certificate_expiry: string | null;
  created_at: string;
}

export interface QueryRow {
  id: string;
  supplier_id: string;
  category: string;
  priority: QueryPriority;
  subject: string;
  question: string;
  attachment_name: string | null;
  context_json: string | null;
  created_at: string;
  due_at: string;
}

export interface QueryEventRow {
  id: number;
  query_id: string;
  stage: TimelineStageKey;
  message: string | null;
  actor: string | null;
  created_at: string;
}
