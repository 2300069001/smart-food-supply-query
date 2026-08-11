export type QueryStatusValue =
  | 'pending'
  | 'in-progress'
  | 'resolved'
  | 'overdue';

export type QueryPriority = 'low' | 'medium' | 'high';

export type QueryCategory =
  | 'Allergen Information'
  | 'Certificate / Compliance'
  | 'Ingredient Safety'
  | 'Product Documentation'
  | 'Other';

export type SupplierCategory =
  | 'Fresh Produce'
  | 'Bakery Ingredients'
  | 'Dairy'
  | 'Packaged Ingredients'
  | 'Nutritional Ingredients';

export type CertificateStatus = 'valid' | 'expiring-soon' | 'expired' | 'none';

export interface SupplierCertificate {
  name: string | null;
  expiryDate: string | null;
  status: CertificateStatus;
  daysUntilExpiry: number | null;
}

export interface Supplier {
  id: string;
  name: string;
  category: SupplierCategory;
  contactName: string;
  contactEmail: string;
  lastQueryDate: string | null;
  openQueryCount: number;
  worstStatus: QueryStatusValue | null;
  certificate: SupplierCertificate;
  mostUrgentQueryId: string | null;
  overdueDays: number | null;
}

export type TimelineStageKey =
  | 'raised'
  | 'sent'
  | 'responded'
  | 'review'
  | 'resolved';

export interface TimelineStage {
  key: TimelineStageKey;
  label: string;
  timestamp: string | null;
  state: 'complete' | 'current' | 'upcoming';
}

export interface QueryQuery {
  id: string;
  supplierId: string;
  category: QueryCategory;
  subject: string;
  message: string;
  priority: QueryPriority;
  status: QueryStatusValue;
  createdDate: string;
  dueDate: string;
  attachmentName?: string;
  context?: Record<string, string> | null;
  supplierResponse?: {
    message: string;
    respondedDate: string;
    respondedBy: string;
  } | null;
  timeline: TimelineStage[];
}

export type WorkflowStage = 'sent' | 'responded' | 'review' | 'resolved';
