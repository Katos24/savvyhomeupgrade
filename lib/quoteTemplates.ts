export type QuoteLineItem = {
  description: string;
  amount: number;
  quantity?: number;
};

export type QuoteTemplate = {
  id: string;
  name: string;
  category: string;
  items: QuoteLineItem[];
  total: number;
  notes?: string;
    tax_rate?: number; // defaults from company.default_tax_rate when created, editable/removable per template
};

export const QUOTE_TEMPLATES: Record<string, QuoteTemplate[]> = {
  hvac: [
    {
      id: 'hvac-tune-up',
      name: 'AC Tune-Up & Maintenance',
      category: 'hvac',
      items: [
        { description: 'System Inspection', amount: 100 },
        { description: 'Filter Replacement', amount: 50 },
        { description: 'Coolant Level Check', amount: 75 }
      ],
      total: 225,
      notes: 'Standard seasonal maintenance'
    },
    {
      id: 'hvac-repair',
      name: 'AC Repair (Basic)',
      category: 'hvac',
      items: [
        { description: 'Diagnostic Fee', amount: 150 },
        { description: 'Labor (2-3 hours)', amount: 300 },
        { description: 'Parts & Materials', amount: 250 }
      ],
      total: 700
    },
    {
      id: 'hvac-install',
      name: 'AC System Installation',
      category: 'hvac',
      items: [
        { description: 'New 3-Ton AC Unit', amount: 3500 },
        { description: 'Installation Labor (8 hours)', amount: 1200 },
        { description: 'Removal of Old Unit', amount: 300 },
        { description: 'Permits & Fees', amount: 200 }
      ],
      total: 5200
    }
  ],

  roofing: [
    {
      id: 'roof-inspection',
      name: 'Roof Inspection',
      category: 'roofing',
      items: [
        { description: 'Complete Roof Inspection', amount: 200 },
        { description: 'Photo Documentation', amount: 50 },
        { description: 'Written Report', amount: 50 }
      ],
      total: 300
    },
    {
      id: 'roof-repair',
      name: 'Roof Repair (Small)',
      category: 'roofing',
      items: [
        { description: 'Labor (4 hours)', amount: 400 },
        { description: 'Shingles & Materials', amount: 300 },
        { description: 'Sealant & Flashing', amount: 150 }
      ],
      total: 850
    },
    {
      id: 'roof-replacement',
      name: 'Full Roof Replacement',
      category: 'roofing',
      items: [
        { description: 'Tear-off Old Roof', amount: 1500 },
        { description: 'New Shingles (2000 sqft)', amount: 4000 },
        { description: 'Labor (3 days)', amount: 3000 },
        { description: 'Disposal & Cleanup', amount: 500 }
      ],
      total: 9000
    }
  ],

  plumbing: [
    {
      id: 'plumbing-service',
      name: 'Plumbing Service Call',
      category: 'plumbing',
      items: [
        { description: 'Service Call Fee', amount: 125 },
        { description: 'Labor (1 hour)', amount: 150 },
        { description: 'Basic Parts', amount: 75 }
      ],
      total: 350
    },
    {
      id: 'water-heater',
      name: 'Water Heater Installation',
      category: 'plumbing',
      items: [
        { description: '50-Gallon Water Heater', amount: 800 },
        { description: 'Installation Labor', amount: 600 },
        { description: 'Removal of Old Unit', amount: 150 },
        { description: 'Permits', amount: 100 }
      ],
      total: 1650
    }
  ],

  electrical: [
    {
      id: 'electrical-service',
      name: 'Electrical Service Call',
      category: 'electrical',
      items: [
        { description: 'Service Call Fee', amount: 125 },
        { description: 'Labor (1 hour)', amount: 150 },
        { description: 'Materials', amount: 75 }
      ],
      total: 350
    },
    {
      id: 'panel-upgrade',
      name: 'Electrical Panel Upgrade',
      category: 'electrical',
      items: [
        { description: '200-Amp Panel', amount: 1200 },
        { description: 'Installation Labor (6 hours)', amount: 900 },
        { description: 'Permits & Inspection', amount: 300 }
      ],
      total: 2400
    }
  ],

  general: [
    {
      id: 'general-small',
      name: 'Small Job (1-2 hours)',
      category: 'general',
      items: [
        { description: 'Labor', amount: 200 },
        { description: 'Materials', amount: 100 }
      ],
      total: 300
    },
    {
      id: 'general-medium',
      name: 'Medium Job (Half Day)',
      category: 'general',
      items: [
        { description: 'Labor (4 hours)', amount: 500 },
        { description: 'Materials', amount: 300 }
      ],
      total: 800
    },
    {
      id: 'general-large',
      name: 'Large Job (Full Day)',
      category: 'general',
      items: [
        { description: 'Labor (8 hours)', amount: 1000 },
        { description: 'Materials', amount: 600 },
        { description: 'Equipment Rental', amount: 200 }
      ],
      total: 1800
    }
  ]
};

// Helper function to get templates by category
export function getTemplatesByCategory(category: string): QuoteTemplate[] {
  const normalized = category?.toLowerCase() || 'general';
  return QUOTE_TEMPLATES[normalized] || QUOTE_TEMPLATES.general || [];
}

// Helper to get all templates
export function getAllTemplates(): QuoteTemplate[] {
  return Object.values(QUOTE_TEMPLATES).flat();
}