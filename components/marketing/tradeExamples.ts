export type TradeQuestion = {
  label: string;
  options: string[];
  selected: number;
};

export type TradeLead = {
  id: number;
  name: string;
  phone: string;
  email: string;
  category: string;
  status: string;
  quote_total: string;
  file_urls: string;
  assigned_to: string;
  project_quote_sent_at: string;
  scheduled_date: string;
  payment_status: string;
  payment_amount: string;
  created_at: string;
  lead_source: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  zip_code: string;
};

export type TradeExample = {
  trade: string;
  color: string;
  logo: string;
  questions: TradeQuestion[];
  uploadPreview: string;
  uploadFileName: string;
  company: {
    name: string;
    logo_url: string;
    slug: string;
  };
  stats: {
    total_leads: number;
    active_jobs: number;
    revenue: number;
    pending: number;
  };
  leads: TradeLead[];
};

// Single source of truth for every trade example used across the marketing
// site — the hero (compact form + live dashboard swap) and
// CustomizeFormSection (full form, deeper dive) both read from this so they
// never drift out of sync with each other.
export const TRADE_EXAMPLES: TradeExample[] = [
  {
    trade: 'Roofing',
    color: '#f97316',
    logo: '/images/ridgelinelogo.webp',
    questions: [
      {
        label: 'Service Needed',
        options: ['Roof Repair', 'Roof Replacement', 'Leak Detection', 'Inspection', 'Gutter Work'],
        selected: 1,
      },
      {
        label: 'How old is your roof?',
        options: ['Under 10 yrs', '10-20 yrs', '20+ yrs', 'Not sure'],
        selected: 1,
      },
    ],
    uploadPreview: '/images/roof-damage.webp',
    uploadFileName: 'roof-damage.webp',
    company: {
      name: 'Ridge Line Roofing',
      logo_url: '/images/ridgelinelogo.webp',
      slug: 'ridge-line-roofing',
    },
    stats: { total_leads: 39, active_jobs: 37, revenue: 55000, pending: 101250 },
    leads: [
      {
        id: 3,
        name: 'Jennifer L.',
        phone: '5553829102',
        email: 'jennifer@example.com',
        category: 'roof_repair',
        status: 'new',
        quote_total: '1250',
        file_urls: JSON.stringify([]),
        assigned_to: 'Unassigned',
        project_quote_sent_at: '',
        scheduled_date: '',
        payment_status: '',
        payment_amount: '',
        created_at: new Date().toISOString(),
        lead_source: 'qr_scan',
        address_line_1: '29 Birchwood Ln',
        address_line_2: '',
        city: 'Holbrook',
        zip_code: '11741',
      },
      {
        id: 1,
        name: 'Chris Williams',
        phone: '5551234567',
        email: 'chris@example.com',
        category: 'roof_repair',
        status: 'in-progress',
        quote_total: '2768',
        file_urls: JSON.stringify([{ url: '/images/roof-damage.webp', name: 'roof-damage.webp', type: 'image/webp' }]),
        assigned_to: 'Will',
        project_quote_sent_at: '2026-06-20',
        scheduled_date: '2026-07-13T00:00:00Z',
        payment_status: 'partial',
        payment_amount: '1384',
        created_at: '2026-06-15T10:00:00Z',
        lead_source: 'website',
        address_line_1: '482 Ridgewood Ave',
        address_line_2: '',
        city: 'Holbrook',
        zip_code: '11741',
      },
    ],
  },
  {
    trade: 'HVAC',
    color: '#0ea5e9',
    logo: '/images/arctic-air-logo.webp',
    questions: [
      {
        label: 'System Type',
        options: ['Central AC', 'Heat Pump', 'Mini Split', 'Furnace', 'Full HVAC'],
        selected: 0,
      },
      {
        label: "What's the issue?",
        options: ['Blowing warm', 'No airflow', 'Strange noise', 'Routine maintenance'],
        selected: 3,
      },
    ],
    uploadPreview: '',
    uploadFileName: '',
    company: {
      name: 'Arctic Air HVAC',
      logo_url: '/images/arctic-air-logo.webp',
      slug: 'arctic-air-hvac',
    },
    stats: { total_leads: 52, active_jobs: 44, revenue: 68000, pending: 87500 },
    leads: [
      {
        id: 103,
        name: 'Derek Hall',
        phone: '5557741234',
        email: 'derek@example.com',
        category: 'ac_repair',
        status: 'new',
        quote_total: '890',
        file_urls: JSON.stringify([]),
        assigned_to: 'Unassigned',
        project_quote_sent_at: '',
        scheduled_date: '',
        payment_status: '',
        payment_amount: '',
        created_at: new Date().toISOString(),
        lead_source: 'qr_scan',
        address_line_1: '14 Cypress Ct',
        address_line_2: '',
        city: 'Bohemia',
        zip_code: '11716',
      },
      {
        id: 101,
        name: 'Maria Gomez',
        phone: '5556652233',
        email: 'maria@example.com',
        category: 'furnace_install',
        status: 'in-progress',
        quote_total: '4200',
        file_urls: JSON.stringify([{ url: '/images/roof-damage.webp', name: 'unit-photo.webp', type: 'image/webp' }]),
        assigned_to: 'Sam',
        project_quote_sent_at: '2026-06-22',
        scheduled_date: '2026-07-15T00:00:00Z',
        payment_status: 'partial',
        payment_amount: '2100',
        created_at: '2026-06-16T10:00:00Z',
        lead_source: 'website',
        address_line_1: '77 Birchwood Ln',
        address_line_2: '',
        city: 'Holbrook',
        zip_code: '11741',
      },
    ],
  },
  {
    trade: 'Plumbing',
    color: '#10b981',
    logo: '/images/rapid-flow-logo.webp',
    questions: [
      {
        label: 'Service Type',
        options: ['Leak Repair', 'Drain Cleaning', 'Water Heater', 'Pipe Burst', 'Remodel'],
        selected: 0,
      },
      {
        label: 'How urgent is this?',
        options: ['Emergency', 'This week', 'Flexible', 'Just a quote'],
        selected: 0,
      },
    ],
    uploadPreview: '',
    uploadFileName: '',
    company: {
      name: 'Rapid Flow Plumbing',
      logo_url: '/images/rapid-flow-logo.webp',
      slug: 'rapid-flow-plumbing',
    },
    stats: { total_leads: 61, active_jobs: 49, revenue: 42000, pending: 63500 },
    leads: [
      {
        id: 203,
        name: 'Angela Cruz',
        phone: '5553321987',
        email: 'angela@example.com',
        category: 'drain_cleaning',
        status: 'new',
        quote_total: '320',
        file_urls: JSON.stringify([]),
        assigned_to: 'Unassigned',
        project_quote_sent_at: '',
        scheduled_date: '',
        payment_status: '',
        payment_amount: '',
        created_at: new Date().toISOString(),
        lead_source: 'qr_scan',
        address_line_1: '9 Larkspur Dr',
        address_line_2: '',
        city: 'Sayville',
        zip_code: '11782',
      },
      {
        id: 201,
        name: 'Tom Reyes',
        phone: '5559983321',
        email: 'tom@example.com',
        category: 'water_heater',
        status: 'in-progress',
        quote_total: '1850',
        file_urls: JSON.stringify([{ url: '/images/roof-damage.webp', name: 'leak-photo.webp', type: 'image/webp' }]),
        assigned_to: 'Nate',
        project_quote_sent_at: '2026-06-19',
        scheduled_date: '2026-07-14T00:00:00Z',
        payment_status: 'partial',
        payment_amount: '900',
        created_at: '2026-06-14T09:00:00Z',
        lead_source: 'website',
        address_line_1: '212 Maple Hollow Rd',
        address_line_2: '',
        city: 'Sayville',
        zip_code: '11782',
      },
    ],
  },
  {
    trade: 'Solar',
    color: '#eab308',
    logo: '/images/sun-peak-logo.webp',
    questions: [
      {
        label: 'Interested In',
        options: ['Solar Panels', 'Battery Storage', 'EV Charger', 'Full System', 'Maintenance'],
        selected: 3,
      },
      {
        label: 'Monthly electric bill?',
        options: ['Under $100', '$100-$200', '$200-$300', 'Over $300'],
        selected: 2,
      },
    ],
    uploadPreview: '',
    uploadFileName: '',
    company: {
      name: 'Sun Peak Solar',
      logo_url: '/images/sun-peak-logo.webp',
      slug: 'sun-peak-solar',
    },
    stats: { total_leads: 24, active_jobs: 19, revenue: 210000, pending: 340000 },
    leads: [
      {
        id: 303,
        name: 'Priya Shah',
        phone: '5557765432',
        email: 'priya@example.com',
        category: 'solar_panels',
        status: 'new',
        quote_total: '18500',
        file_urls: JSON.stringify([]),
        assigned_to: 'Unassigned',
        project_quote_sent_at: '',
        scheduled_date: '',
        payment_status: '',
        payment_amount: '',
        created_at: new Date().toISOString(),
        lead_source: 'qr_scan',
        address_line_1: '5 Sunview Ter',
        address_line_2: '',
        city: 'Islip',
        zip_code: '11751',
      },
      {
        id: 301,
        name: 'Kevin Brooks',
        phone: '5552214567',
        email: 'kevin@example.com',
        category: 'battery_storage',
        status: 'in-progress',
        quote_total: '9200',
        file_urls: JSON.stringify([{ url: '/images/roof-damage.webp', name: 'panel-layout.webp', type: 'image/webp' }]),
        assigned_to: 'Ray',
        project_quote_sent_at: '2026-06-21',
        scheduled_date: '2026-07-18T00:00:00Z',
        payment_status: 'partial',
        payment_amount: '4600',
        created_at: '2026-06-17T10:00:00Z',
        lead_source: 'website',
        address_line_1: '61 Ridgewood Ave',
        address_line_2: '',
        city: 'Holbrook',
        zip_code: '11741',
      },
    ],
  },
  {
    trade: 'Electrical',
    color: '#a855f7',
    logo: '/images/voltline-logo.webp',
    questions: [
      {
        label: 'Service Needed',
        options: ['Panel Upgrade', 'Rewiring', 'Outlet Install', 'Lighting', 'Inspection'],
        selected: 2,
      },
      {
        label: 'How urgent is this?',
        options: ['Emergency', 'This week', 'Flexible', 'Just a quote'],
        selected: 1,
      },
    ],
    uploadPreview: '',
    uploadFileName: '',
    company: {
      name: 'Volt Line Electrical',
      logo_url: '/images/voltline-logo.webp',
      slug: 'volt-line-electrical',
    },
    stats: { total_leads: 45, active_jobs: 38, revenue: 51000, pending: 72300 },
    leads: [
      {
        id: 403,
        name: 'Sam Patel',
        phone: '5556681234',
        email: 'sam@example.com',
        category: 'panel_upgrade',
        status: 'new',
        quote_total: '2100',
        file_urls: JSON.stringify([]),
        assigned_to: 'Unassigned',
        project_quote_sent_at: '',
        scheduled_date: '',
        payment_status: '',
        payment_amount: '',
        created_at: new Date().toISOString(),
        lead_source: 'qr_scan',
        address_line_1: '18 Cedar Ct',
        address_line_2: '',
        city: 'Bay Shore',
        zip_code: '11706',
      },
      {
        id: 401,
        name: 'Laura Bennett',
        phone: '5559984321',
        email: 'laura@example.com',
        category: 'rewiring',
        status: 'in-progress',
        quote_total: '3800',
        file_urls: JSON.stringify([{ url: '/images/roof-damage.webp', name: 'panel-photo.webp', type: 'image/webp' }]),
        assigned_to: 'Eddie',
        project_quote_sent_at: '2026-06-20',
        scheduled_date: '2026-07-16T00:00:00Z',
        payment_status: 'partial',
        payment_amount: '1900',
        created_at: '2026-06-15T10:00:00Z',
        lead_source: 'website',
        address_line_1: '340 Oakdale Ave',
        address_line_2: '',
        city: 'Bay Shore',
        zip_code: '11706',
      },
    ],
  },
  {
    trade: 'Construction',
    color: '#3b82f6',
    logo: '/images/cornerstone-logo.webp',
    questions: [
      {
        label: 'Project Type',
        options: ['Addition', 'Remodel', 'New Build', 'Deck/Patio', 'Repair'],
        selected: 0,
      },
      {
        label: 'Project Size',
        options: ['Small (<$10k)', 'Medium ($10k-$50k)', 'Large ($50k+)', 'Not sure'],
        selected: 1,
      },
    ],
    uploadPreview: '',
    uploadFileName: '',
    company: {
      name: 'Cornerstone Construction',
      logo_url: '/images/cornerstone-logo.webp',
      slug: 'cornerstone-construction',
    },
    stats: { total_leads: 18, active_jobs: 15, revenue: 185000, pending: 260000 },
    leads: [
      {
        id: 503,
        name: 'Nicole Ward',
        phone: '5557712345',
        email: 'nicole@example.com',
        category: 'home_addition',
        status: 'new',
        quote_total: '42000',
        file_urls: JSON.stringify([]),
        assigned_to: 'Unassigned',
        project_quote_sent_at: '',
        scheduled_date: '',
        payment_status: '',
        payment_amount: '',
        created_at: new Date().toISOString(),
        lead_source: 'qr_scan',
        address_line_1: '8 Timberline Rd',
        address_line_2: '',
        city: 'Smithtown',
        zip_code: '11787',
      },
      {
        id: 501,
        name: 'Greg Sanders',
        phone: '5553349876',
        email: 'greg@example.com',
        category: 'remodel',
        status: 'in-progress',
        quote_total: '68000',
        file_urls: JSON.stringify([{ url: '/images/roof-damage.webp', name: 'jobsite-photo.webp', type: 'image/webp' }]),
        assigned_to: 'Mike',
        project_quote_sent_at: '2026-06-18',
        scheduled_date: '2026-07-20T00:00:00Z',
        payment_status: 'partial',
        payment_amount: '30000',
        created_at: '2026-06-12T09:00:00Z',
        lead_source: 'website',
        address_line_1: '112 Hollow Brook Dr',
        address_line_2: '',
        city: 'Smithtown',
        zip_code: '11787',
      },
    ],
  },
];