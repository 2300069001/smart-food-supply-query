import { db } from './db.js';

interface SupplierSeed {
  id: string;
  name: string;
  category: string;
  contact_name: string;
  contact_email: string;
  certificate_name: string | null;
  certificate_expiry: string | null;
}

const suppliers: SupplierSeed[] = [
  {
    id: 'sup-001',
    name: 'FreshHarvest Foods',
    category: 'Fresh Produce',
    contact_name: 'Meera Krishnan',
    contact_email: 'meera.k@freshharvest.com',
    certificate_name: 'GlobalG.A.P.',
    certificate_expiry: '2026-08-29',
  },
  {
    id: 'sup-002',
    name: 'GreenFields Ingredients',
    category: 'Fresh Produce',
    contact_name: 'Daniel Osei',
    contact_email: 'd.osei@greenfields-ing.com',
    certificate_name: 'GlobalG.A.P.',
    certificate_expiry: '2026-07-15',
  },
  {
    id: 'sup-003',
    name: 'PureBake Supplies',
    category: 'Bakery Ingredients',
    contact_name: 'Laura Bianchi',
    contact_email: 'laura.bianchi@purebake.com',
    certificate_name: 'BRCGS Food Safety',
    certificate_expiry: '2027-02-10',
  },
  {
    id: 'sup-004',
    name: 'DairyFresh Co.',
    category: 'Dairy',
    contact_name: 'Tom Richards',
    contact_email: 'tom.richards@dairyfresh.co',
    certificate_name: 'ISO 22000:2018',
    certificate_expiry: '2027-07-16',
  },
  {
    id: 'sup-005',
    name: 'NutriSource Ingredients',
    category: 'Nutritional Ingredients',
    contact_name: 'Aisha Patel',
    contact_email: 'aisha.patel@nutrisource.com',
    certificate_name: 'FSSC 22000',
    certificate_expiry: '2026-09-05',
  },
  {
    id: 'sup-006',
    name: 'OceanCatch Seafoods',
    category: 'Packaged Ingredients',
    contact_name: 'Ben Whitfield',
    contact_email: 'ben.whitfield@oceancatch.com',
    certificate_name: 'HACCP Certification',
    certificate_expiry: '2027-01-20',
  },
  {
    id: 'sup-007',
    name: 'GoldenGrain Milling',
    category: 'Bakery Ingredients',
    contact_name: 'Priya Nair',
    contact_email: 'priya.nair@goldengrain.com',
    certificate_name: 'BRCGS Food Safety',
    certificate_expiry: '2026-12-01',
  },
];

interface QuerySeed {
  id: string;
  supplier_id: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  subject: string;
  question: string;
  context: Record<string, string> | null;
  created_at: string;
  due_at: string;
  events: { stage: string; message: string | null; actor: string | null; created_at: string }[];
}

const queries: QuerySeed[] = [
  {
    id: 'QRY-1042',
    supplier_id: 'sup-001',
    category: 'Allergen Information',
    priority: 'high',
    subject: 'Confirm tree nut cross-contact controls for Batch #A2291',
    question:
      'We need written confirmation of the tree nut cross-contact prevention controls used at your Kanpur facility for Batch #A2291 (frozen mixed berries). Please include your current allergen segregation SOP and the last internal audit date.',
    context: { product: 'Frozen mixed berries — Batch #A2291', allergenConcern: 'Tree nuts' },
    created_at: '2026-07-28T09:00:00.000Z',
    due_at: '2026-08-04T09:00:00.000Z',
    events: [
      { stage: 'raised', message: null, actor: 'Ganesh', created_at: '2026-07-28T09:00:00.000Z' },
      { stage: 'sent', message: null, actor: 'System', created_at: '2026-07-28T09:05:00.000Z' },
    ],
  },
  {
    id: 'QRY-1058',
    supplier_id: 'sup-002',
    category: 'Certificate / Compliance',
    priority: 'high',
    subject: 'GlobalG.A.P. certificate renewal required',
    question:
      'Our records show your GlobalG.A.P. certificate expired on 2026-07-15. Please share the renewed certificate before we can approve the next shipment of leafy greens.',
    context: { certificateType: 'GlobalG.A.P.', certificateNumber: 'GG-88213', expiryDate: '2026-07-15' },
    created_at: '2026-08-02T10:00:00.000Z',
    due_at: '2026-08-09T10:00:00.000Z',
    events: [
      { stage: 'raised', message: null, actor: 'Ganesh', created_at: '2026-08-02T10:00:00.000Z' },
      { stage: 'sent', message: null, actor: 'System', created_at: '2026-08-02T10:05:00.000Z' },
      {
        stage: 'responded',
        message:
          'Thank you for flagging this. Our renewal audit is scheduled for 2026-08-14 and the certification body has confirmed a 5-business-day turnaround. We will upload the new certificate as soon as it is issued.',
        actor: 'Daniel Osei',
        created_at: '2026-08-04T14:30:00.000Z',
      },
      { stage: 'review', message: null, actor: 'Ganesh', created_at: '2026-08-04T16:00:00.000Z' },
    ],
  },
  {
    id: 'QRY-1061',
    supplier_id: 'sup-003',
    category: 'Ingredient Safety',
    priority: 'medium',
    subject: 'Source verification for palm oil in croissant dough mix',
    question:
      'Could you confirm whether the palm oil used in the croissant dough mix (SKU PB-4410) is RSPO-certified sustainable palm oil, and provide the traceability reference for the current lot?',
    context: { ingredient: 'Palm oil — SKU PB-4410', safetyConcern: 'RSPO sustainable sourcing' },
    created_at: '2026-08-08T11:00:00.000Z',
    due_at: '2026-08-15T11:00:00.000Z',
    events: [
      { stage: 'raised', message: null, actor: 'Ganesh', created_at: '2026-08-08T11:00:00.000Z' },
      { stage: 'sent', message: null, actor: 'System', created_at: '2026-08-08T11:05:00.000Z' },
    ],
  },
  {
    id: 'QRY-1035',
    supplier_id: 'sup-004',
    category: 'Certificate / Compliance',
    priority: 'medium',
    subject: 'ISO 22000 certificate — annual renewal',
    question:
      'As part of our annual supplier review, please share your updated ISO 22000:2018 certificate for the Reading production site.',
    context: { certificateType: 'ISO 22000:2018', certificateNumber: 'ISO-22K-5510', expiryDate: '2026-07-17' },
    created_at: '2026-07-10T09:00:00.000Z',
    due_at: '2026-07-17T09:00:00.000Z',
    events: [
      { stage: 'raised', message: null, actor: 'Ganesh', created_at: '2026-07-10T09:00:00.000Z' },
      { stage: 'sent', message: null, actor: 'System', created_at: '2026-07-10T09:05:00.000Z' },
      {
        stage: 'responded',
        message:
          'Please find the renewed ISO 22000:2018 certificate attached, valid through July 2027. Let us know if you need the underlying audit report as well.',
        actor: 'Tom Richards',
        created_at: '2026-07-14T13:00:00.000Z',
      },
      { stage: 'review', message: null, actor: 'Ganesh', created_at: '2026-07-15T09:00:00.000Z' },
      { stage: 'resolved', message: 'Certificate verified and filed.', actor: 'Ganesh', created_at: '2026-07-16T10:00:00.000Z' },
    ],
  },
  {
    id: 'QRY-1070',
    supplier_id: 'sup-005',
    category: 'Product Documentation',
    priority: 'high',
    subject: 'Missing Certificate of Analysis for whey protein isolate lot WP-2291',
    question:
      'We have not received the Certificate of Analysis for lot WP-2291 of whey protein isolate, received on 2026-08-01. This is required before the lot can be released for production use.',
    context: null,
    created_at: '2026-08-01T08:30:00.000Z',
    due_at: '2026-08-06T08:30:00.000Z',
    events: [
      { stage: 'raised', message: null, actor: 'Ganesh', created_at: '2026-08-01T08:30:00.000Z' },
      { stage: 'sent', message: null, actor: 'System', created_at: '2026-08-01T08:35:00.000Z' },
    ],
  },
  {
    id: 'QRY-1073',
    supplier_id: 'sup-005',
    category: 'Allergen Information',
    priority: 'low',
    subject: 'Confirm soy lecithin usage in nutrient premix NP-118',
    question:
      'Please confirm whether soy lecithin is used as a processing aid in nutrient premix NP-118, and whether this is declared on your current allergen statement.',
    context: { product: 'Nutrient premix NP-118', allergenConcern: 'Soy lecithin' },
    created_at: '2026-08-09T15:00:00.000Z',
    due_at: '2026-08-19T15:00:00.000Z',
    events: [
      { stage: 'raised', message: null, actor: 'Ganesh', created_at: '2026-08-09T15:00:00.000Z' },
      { stage: 'sent', message: null, actor: 'System', created_at: '2026-08-09T15:05:00.000Z' },
    ],
  },
  {
    id: 'QRY-1066',
    supplier_id: 'sup-006',
    category: 'Ingredient Safety',
    priority: 'medium',
    subject: 'Heavy metal testing results for shrimp lot SC-7743',
    question:
      'Please share the most recent heavy metal (cadmium, mercury, lead) testing results for shrimp lot SC-7743 ahead of the incoming quality check.',
    context: { ingredient: 'Shrimp — lot SC-7743', safetyConcern: 'Heavy metal contamination (Cd, Hg, Pb)' },
    created_at: '2026-08-05T09:00:00.000Z',
    due_at: '2026-08-12T09:00:00.000Z',
    events: [
      { stage: 'raised', message: null, actor: 'Ganesh', created_at: '2026-08-05T09:00:00.000Z' },
      { stage: 'sent', message: null, actor: 'System', created_at: '2026-08-05T09:05:00.000Z' },
      {
        stage: 'responded',
        message:
          'Lab results are back from our accredited third-party testing partner and all values are within acceptable limits. Compiling the formal report now — will share by tomorrow.',
        actor: 'Ben Whitfield',
        created_at: '2026-08-10T11:00:00.000Z',
      },
      { stage: 'review', message: null, actor: 'Ganesh', created_at: '2026-08-10T13:00:00.000Z' },
    ],
  },
  {
    id: 'QRY-1020',
    supplier_id: 'sup-007',
    category: 'Product Documentation',
    priority: 'low',
    subject: 'Spec sheet update for stone-ground wheat flour',
    question:
      'Please send the updated product specification sheet for stone-ground wheat flour (SKU GG-1102) reflecting the revised protein content range.',
    context: null,
    created_at: '2026-06-20T09:00:00.000Z',
    due_at: '2026-06-27T09:00:00.000Z',
    events: [
      { stage: 'raised', message: null, actor: 'Ganesh', created_at: '2026-06-20T09:00:00.000Z' },
      { stage: 'sent', message: null, actor: 'System', created_at: '2026-06-20T09:05:00.000Z' },
      {
        stage: 'responded',
        message:
          'Updated spec sheet attached with the revised protein content range (11.5–13.0%) effective from this production run.',
        actor: 'Priya Nair',
        created_at: '2026-06-23T10:00:00.000Z',
      },
      { stage: 'review', message: null, actor: 'Ganesh', created_at: '2026-06-24T09:00:00.000Z' },
      { stage: 'resolved', message: 'Spec sheet verified and filed.', actor: 'Ganesh', created_at: '2026-06-25T09:00:00.000Z' },
    ],
  },
];

function seed() {
  const tx = db.transaction(() => {
    db.exec('DELETE FROM query_events; DELETE FROM queries; DELETE FROM suppliers;');

    const insertSupplier = db.prepare(
      `INSERT INTO suppliers (id, name, category, contact_name, contact_email, certificate_name, certificate_expiry, created_at)
       VALUES (@id, @name, @category, @contact_name, @contact_email, @certificate_name, @certificate_expiry, @created_at)`,
    );
    for (const s of suppliers) {
      insertSupplier.run({ ...s, created_at: '2025-01-15T00:00:00.000Z' });
    }

    const insertQuery = db.prepare(
      `INSERT INTO queries (id, supplier_id, category, priority, subject, question, attachment_name, context_json, created_at, due_at)
       VALUES (@id, @supplier_id, @category, @priority, @subject, @question, NULL, @context_json, @created_at, @due_at)`,
    );
    const insertEvent = db.prepare(
      `INSERT INTO query_events (query_id, stage, message, actor, created_at)
       VALUES (@query_id, @stage, @message, @actor, @created_at)`,
    );

    for (const q of queries) {
      insertQuery.run({
        id: q.id,
        supplier_id: q.supplier_id,
        category: q.category,
        priority: q.priority,
        subject: q.subject,
        question: q.question,
        context_json: q.context ? JSON.stringify(q.context) : null,
        created_at: q.created_at,
        due_at: q.due_at,
      });
      for (const e of q.events) {
        insertEvent.run({ query_id: q.id, ...e });
      }
    }
  });

  tx();
  console.log(`Seeded ${suppliers.length} suppliers and ${queries.length} queries.`);
}

seed();
