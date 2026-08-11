import type { QueryCategory } from '../../types';

export interface ContextualFieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'date';
}

export function getContextFieldLabel(category: QueryCategory, key: string): string {
  const field = CONTEXTUAL_FIELDS[category]?.find((f) => f.key === key);
  return field?.label ?? key;
}

export const CONTEXTUAL_FIELDS: Partial<Record<QueryCategory, ContextualFieldConfig[]>> = {
  'Allergen Information': [
    { key: 'product', label: 'Product / Ingredient', placeholder: 'e.g. Frozen mixed berries — Batch #A2291' },
    { key: 'allergenConcern', label: 'Allergen Concern', placeholder: 'e.g. Tree nuts' },
  ],
  'Certificate / Compliance': [
    { key: 'certificateType', label: 'Certificate Type', placeholder: 'e.g. GlobalG.A.P., ISO 22000, FSSC 22000' },
    { key: 'certificateNumber', label: 'Certificate Number', placeholder: 'e.g. GG-88213' },
    { key: 'expiryDate', label: 'Expiry Date on File', placeholder: '', type: 'date' },
  ],
  'Ingredient Safety': [
    { key: 'ingredient', label: 'Ingredient / Product', placeholder: 'e.g. Palm oil — SKU PB-4410' },
    { key: 'safetyConcern', label: 'Safety Concern', placeholder: 'e.g. RSPO sustainable sourcing' },
  ],
};
