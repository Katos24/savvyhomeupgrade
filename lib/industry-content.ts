export type IndustryContent = {
  slug: string;
  name: string;
  badge: string;
  color: string;
  hero: {
    headline: string;
    sub: string;
    cta: string;
    demoLabel: string;
  };
  stats: {
    value: string;
    label: string;
    note?: string;
  }[];
  formFields: {
    label: string;
    placeholder: string;
    type: string;
  }[];
  pain: {
    headline: string;
    points: string[];
  };
  features: {
    title: string;
    description: string;
  }[];
  howItWorks: {
    step: string;
    title: string;
    description: string;
  }[];
  emailPreview: {
    subject: string;
    bodyLines: string[];
  };
  pricing: {
    headline: string;
    sub: string;
  };
  seo: {
    title: string;
    description: string;
  };
};

export const industryContent: Record<string, IndustryContent> = {

  // ── ROOFING ──────────────────────────────────────────────────
  roofing: {
    slug: 'roofing',
    name: 'Roofing',
    badge: 'Built for Roofers',
    color: '#f97316',
    hero: {
      headline: 'Every roof job starts with a photo.',
      sub: 'Customers submit damage photos, scope, and job details — all in one link. You show up to the estimate already knowing what you\'re dealing with.',
      cta: 'Get Your Free Booking Link',
      demoLabel: 'See how a storm lead comes in',
    },
    stats: [
      { value: '< 60s', label: 'To set up your booking link', note: 'no tech skills needed' },
      { value: '4x', label: 'More info per lead', note: 'vs. a phone call' },
      { value: '$0', label: 'Extra software needed', note: 'replaces the spreadsheet' },
      { value: '30s', label: 'AI job brief', note: 'before you even call them back' },
    ],
    formFields: [
      { label: 'Full Name', placeholder: 'Mike Torres', type: 'text' },
      { label: 'Email', placeholder: 'mike@example.com', type: 'email' },
      { label: 'Phone', placeholder: '(555) 000-0000', type: 'tel' },
      { label: 'Property Address', placeholder: '123 Oak St, Phoenix AZ', type: 'text' },
      { label: 'Describe the issue', placeholder: 'Storm damage on the south side, several shingles missing, small leak in the corner bedroom...', type: 'textarea' },
    ],
    pain: {
      headline: 'Sound familiar?',
      points: [
        'You\'re up on a ladder and miss three calls about a new storm job',
        'Customer sends a blurry photo in a text thread you can\'t find later',
        'You show up to an estimate not knowing if it\'s 2 squares or 20',
        'You wrote the lead on a napkin. The napkin is gone.',
      ],
    },
    features: [
      { title: 'Photo Submissions', description: 'Customers attach damage photos directly to their lead. You see everything before you ever leave the truck.' },
      { title: 'Instant Lead Board', description: 'Every new submission hits your board in real time. No more checking email, texts, and voicemail separately.' },
      { title: 'AI Job Brief', description: 'One tap generates a scope summary from the customer description and photos. Show up to every estimate prepared.' },
      { title: 'Quote and Track', description: 'Build quotes, collect deposits, track job status — all from the same place the lead came in.' },
      { title: 'Schedule Crew', description: 'Assign jobs to crew members with dates and times. Everyone knows what\'s next.' },
      { title: 'Branded Emails', description: 'Customers get professional confirmation emails with your logo. Looks like you have a full office.' },
    ],
    howItWorks: [
      { step: '01', title: 'Share one link', description: 'Add it to your truck wrap, Instagram bio, or Google Business profile. Takes 60 seconds to set up.' },
      { step: '02', title: 'Customer submits their job', description: 'They fill out name, address, description — and attach photos of the damage. All in one place.' },
      { step: '03', title: 'It lands on your board', description: 'You see the full lead instantly. Run an AI brief, assign it, schedule it, and quote it — all from your phone.' },
    ],
    emailPreview: {
      subject: 'Torres Roofing — We received your request',
      bodyLines: [
        'Hi Mike,',
        'Thanks for reaching out to Torres Roofing. We received your job request and will be in touch shortly to schedule your estimate.',
        'Job Category: Roof Damage / Storm',
        'Submitted: Today at 2:14 PM',
      ],
    },
    pricing: {
      headline: 'Simple pricing for roofing contractors.',
      sub: 'No per-user fees. No setup costs. Cancel anytime.',
    },
    seo: {
      title: 'Lead2Project for Roofers — Booking Links & Job Tracking',
      description: 'Roofing contractors use Lead2Project to collect leads with photos, track jobs, and send professional quotes — all from one link.',
    },
  },

  // ── CLEANING ─────────────────────────────────────────────────
  cleaning: {
    slug: 'cleaning',
    name: 'Cleaning Services',
    badge: 'Built for Cleaners',
    color: '#06b6d4',
    hero: {
      headline: 'New cleaning clients. Zero back-and-forth.',
      sub: 'Clients submit their home details, photos of the space, and what they need — before you ever show up. Quote faster. Book more.',
      cta: 'Get Your Free Booking Link',
      demoLabel: 'See how a new client request comes in',
    },
    stats: [
      { value: '< 60s', label: 'To set up your booking link', note: 'no tech skills needed' },
      { value: '3x', label: 'Faster quoting', note: 'with photos and details upfront' },
      { value: '$0', label: 'Extra software needed', note: 'replaces the phone tag' },
      { value: '30s', label: 'AI job brief', note: 'scope and quote guidance instantly' },
    ],
    formFields: [
      { label: 'Full Name', placeholder: 'Diana Chen', type: 'text' },
      { label: 'Email', placeholder: 'diana@example.com', type: 'email' },
      { label: 'Phone', placeholder: '(555) 000-0000', type: 'tel' },
      { label: 'Property Address', placeholder: '456 Maple Ave, Dallas TX', type: 'text' },
      { label: 'Tell us about your space', placeholder: '3 bed / 2 bath, ~1,400 sqft. Kitchen needs deep clean, last cleaned 6 months ago, two cats...', type: 'textarea' },
    ],
    pain: {
      headline: 'Running a cleaning business is already hard enough.',
      points: [
        'Client calls for a quote, you play phone tag for three days',
        'You show up to estimate a "small apartment" that\'s actually 2,000 sqft',
        'Recurring client details are scattered across texts and a Google Sheet',
        'You quoted wrong because you didn\'t know about the pets until you arrived',
      ],
    },
    features: [
      { title: 'Space Photo Submissions', description: 'Clients attach photos of the rooms they need cleaned. You see the actual condition before you quote.' },
      { title: 'Instant Lead Board', description: 'Every new request lands on your board immediately. No more chasing leads from three different channels.' },
      { title: 'AI Job Brief', description: 'Get an instant summary of the job scope, special considerations, and suggested pricing range.' },
      { title: 'Quote and Track', description: 'Send a professional quote, collect a deposit, and track recurring jobs — all from the same place.' },
      { title: 'Recurring Client Profiles', description: 'See every client\'s cleaning history, notes, and preferences in one place. Never ask the same question twice.' },
      { title: 'Branded Confirmations', description: 'Clients receive a professional email with your business name. You look established from day one.' },
    ],
    howItWorks: [
      { step: '01', title: 'Share your booking link', description: 'Add it to your website, Nextdoor profile, or Google Business listing. Ready in under 60 seconds.' },
      { step: '02', title: 'Client submits their space details', description: 'Square footage, number of rooms, condition, special requests — and photos. Everything you need to quote accurately.' },
      { step: '03', title: 'You see it on your board', description: 'Review the submission, generate an AI brief, send a quote, and confirm the job — all from your phone.' },
    ],
    emailPreview: {
      subject: 'Spotless Home Co — We received your cleaning request',
      bodyLines: [
        'Hi Diana,',
        'Thanks for reaching out to Spotless Home Co. We received your request and will be in touch shortly with a quote.',
        'Service: Deep Clean — 3 bed / 2 bath',
        'Submitted: Today at 9:47 AM',
      ],
    },
    pricing: {
      headline: 'Simple pricing for cleaning businesses.',
      sub: 'No per-client fees. No setup costs. Cancel anytime.',
    },
    seo: {
      title: 'Lead2Project for Cleaning Services — Booking Links & Client Management',
      description: 'Cleaning businesses use Lead2Project to collect client details with photos, send accurate quotes, and track recurring jobs — all from one link.',
    },
  },

  // ── HVAC ─────────────────────────────────────────────────────
  hvac: {
    slug: 'hvac',
    name: 'HVAC',
    badge: 'Built for HVAC Contractors',
    color: '#3b82f6',
    hero: {
      headline: 'Every service call starts here.',
      sub: 'Customers submit their system details, photos, and issue description before you roll the truck. You show up knowing exactly what you\'re walking into.',
      cta: 'Get Your Free Booking Link',
      demoLabel: 'See how a service call comes in',
    },
    stats: [
      { value: '< 60s', label: 'To set up your booking link', note: 'no tech skills needed' },
      { value: '4x', label: 'More info per call', note: 'vs. a phone call' },
      { value: '$0', label: 'Extra software needed', note: 'replaces the spreadsheet' },
      { value: '30s', label: 'AI job brief', note: 'before you even call them back' },
    ],
    formFields: [
      { label: 'Full Name', placeholder: 'James Rivera', type: 'text' },
      { label: 'Email', placeholder: 'james@example.com', type: 'email' },
      { label: 'Phone', placeholder: '(555) 000-0000', type: 'tel' },
      { label: 'Property Address', placeholder: '789 Elm St, Houston TX', type: 'text' },
      { label: 'Describe the issue', placeholder: 'AC unit stopped cooling yesterday, unit is 8 years old, making a rattling noise when it runs...', type: 'textarea' },
    ],
    pain: {
      headline: 'Sound familiar?',
      points: [
        'Customer calls during a job and you miss it — lead goes to your competitor',
        'You roll the truck and the unit is older than they said',
        'Quotes are written on invoices, texts, and sticky notes',
        'No way to track which jobs are paid and which are still outstanding',
      ],
    },
    features: [
      { title: 'System Photo Submissions', description: 'Customers attach photos of their unit, thermostat, and any visible damage. You know what you\'re dealing with before you leave.' },
      { title: 'Instant Lead Board', description: 'Every new service request hits your board in real time. No more juggling calls, texts, and voicemails.' },
      { title: 'AI Job Brief', description: 'One tap generates a scope summary from the customer description and photos. Show up to every call prepared.' },
      { title: 'Quote and Invoice', description: 'Build quotes, send invoices, and track payment status — all tied to the original service request.' },
      { title: 'Schedule Techs', description: 'Assign calls to technicians with dates and arrival windows. Everyone knows their schedule.' },
      { title: 'Branded Confirmations', description: 'Customers get professional confirmation emails with your logo. Looks like you run a tight operation.' },
    ],
    howItWorks: [
      { step: '01', title: 'Share your booking link', description: 'Add it to your Google Business profile, truck wrap, or website. Ready in under 60 seconds.' },
      { step: '02', title: 'Customer submits their issue', description: 'System details, age of unit, description of the problem, and photos. Everything you need before the call.' },
      { step: '03', title: 'It lands on your board', description: 'Review the submission, run an AI brief, assign it to a tech, and send a confirmation — all from your phone.' },
    ],
    emailPreview: {
      subject: 'Arctic Air HVAC — We received your service request',
      bodyLines: [
        'Hi James,',
        'Thanks for reaching out to Arctic Air HVAC. We received your service request and will be in touch shortly to confirm your appointment.',
        'Issue: AC not cooling — possible compressor issue',
        'Submitted: Today at 1:22 PM',
      ],
    },
    pricing: {
      headline: 'Simple pricing for HVAC contractors.',
      sub: 'No per-tech fees. No setup costs. Cancel anytime.',
    },
    seo: {
      title: 'Lead2Project for HVAC Contractors — Booking Links & Job Tracking',
      description: 'HVAC contractors use Lead2Project to collect service requests with photos, track jobs, and send professional quotes — all from one link.',
    },
  },

  // ── PLUMBING ──────────────────────────────────────────────────
  plumbing: {
    slug: 'plumbing',
    name: 'Plumbing',
    badge: 'Built for Plumbers',
    color: '#0ea5e9',
    hero: {
      headline: 'Stop missing calls. Start capturing every job.',
      sub: 'Customers submit their issue with photos while you\'re on another job. You see every lead the moment it comes in — no missed calls, no lost work.',
      cta: 'Get Your Free Booking Link',
      demoLabel: 'See how a service request comes in',
    },
    stats: [
      { value: '< 60s', label: 'To set up your booking link', note: 'no tech skills needed' },
      { value: '4x', label: 'More info per lead', note: 'vs. a phone call' },
      { value: '$0', label: 'Extra software needed', note: 'replaces the notes app' },
      { value: '30s', label: 'AI job brief', note: 'scope summary before you call back' },
    ],
    formFields: [
      { label: 'Full Name', placeholder: 'Karen White', type: 'text' },
      { label: 'Email', placeholder: 'karen@example.com', type: 'email' },
      { label: 'Phone', placeholder: '(555) 000-0000', type: 'tel' },
      { label: 'Property Address', placeholder: '321 Pine Rd, Chicago IL', type: 'text' },
      { label: 'Describe the issue', placeholder: 'Kitchen sink has been draining slowly for a week, now fully blocked. Water backing up...', type: 'textarea' },
    ],
    pain: {
      headline: 'Every plumber knows this.',
      points: [
        'You\'re under a sink and miss three calls about a new job',
        'Customer says "small leak" and it turns out to be a burst pipe',
        'Invoices are in your phone, your truck, and maybe a notebook',
        'You forgot to follow up on a quote from two weeks ago',
      ],
    },
    features: [
      { title: 'Issue Photo Submissions', description: 'Customers attach photos of the problem area. You see the actual issue before you respond.' },
      { title: 'Instant Lead Board', description: 'Every new request lands on your board the moment it\'s submitted. Nothing gets lost.' },
      { title: 'AI Job Brief', description: 'Tap once and get a scope summary based on the customer description and photos. Know what parts to bring.' },
      { title: 'Quote and Invoice', description: 'Build a quote, send it to the customer, collect payment — all tied to the original request.' },
      { title: 'Schedule Jobs', description: 'Set dates and arrival windows for every job. No more double-booking.' },
      { title: 'Branded Confirmations', description: 'Every customer gets a professional confirmation with your business name. Builds trust immediately.' },
    ],
    howItWorks: [
      { step: '01', title: 'Share your booking link', description: 'Add it to your Google Business profile, Nextdoor, or website. Set up in 60 seconds.' },
      { step: '02', title: 'Customer submits their issue', description: 'Location, description, and photos of the problem. You get everything you need without a single phone call.' },
      { step: '03', title: 'It lands on your board', description: 'Review the lead, run an AI brief, schedule the job, and send a confirmation — all from your phone.' },
    ],
    emailPreview: {
      subject: 'Dave\'s Plumbing — We received your service request',
      bodyLines: [
        'Hi Karen,',
        'Thanks for reaching out to Dave\'s Plumbing. We received your request and will confirm your appointment shortly.',
        'Issue: Blocked kitchen drain',
        'Submitted: Today at 3:05 PM',
      ],
    },
    pricing: {
      headline: 'Simple pricing for plumbers.',
      sub: 'No per-job fees. No setup costs. Cancel anytime.',
    },
    seo: {
      title: 'Lead2Project for Plumbers — Booking Links & Job Tracking',
      description: 'Plumbers use Lead2Project to capture service requests with photos, track jobs, and send invoices — all from one link.',
    },
  },

  // ── ELECTRICAL ────────────────────────────────────────────────
  electrical: {
    slug: 'electrical',
    name: 'Electrical',
    badge: 'Built for Electricians',
    color: '#eab308',
    hero: {
      headline: 'Every electrical job. One place.',
      sub: 'Customers describe the issue and attach photos of the panel, outlet, or wiring before you respond. You show up knowing the scope — not guessing it.',
      cta: 'Get Your Free Booking Link',
      demoLabel: 'See how a job request comes in',
    },
    stats: [
      { value: '< 60s', label: 'To set up your booking link', note: 'no tech skills needed' },
      { value: '4x', label: 'More info per lead', note: 'vs. a phone call' },
      { value: '$0', label: 'Extra software needed', note: 'replaces the sticky notes' },
      { value: '30s', label: 'AI job brief', note: 'scope summary in one tap' },
    ],
    formFields: [
      { label: 'Full Name', placeholder: 'Robert Kim', type: 'text' },
      { label: 'Email', placeholder: 'robert@example.com', type: 'email' },
      { label: 'Phone', placeholder: '(555) 000-0000', type: 'tel' },
      { label: 'Property Address', placeholder: '654 Oak Ave, Atlanta GA', type: 'text' },
      { label: 'Describe the issue', placeholder: 'Two outlets in the master bedroom stopped working, breaker keeps tripping when I reset it...', type: 'textarea' },
    ],
    pain: {
      headline: 'Sound familiar?',
      points: [
        'Customer calls while you\'re in a panel and you miss it completely',
        'You show up expecting a simple outlet swap and find aluminum wiring',
        'Quotes are texted from your personal number with no record',
        'You have no idea which jobs from last month are still unpaid',
      ],
    },
    features: [
      { title: 'Panel and Wiring Photos', description: 'Customers attach photos of the panel, outlet, or issue area. You know what you\'re walking into before you leave.' },
      { title: 'Instant Lead Board', description: 'Every new job request hits your board immediately. No missed calls, no lost leads.' },
      { title: 'AI Job Brief', description: 'One tap and you get a scope summary from the customer description and photos. Know what materials to bring.' },
      { title: 'Quote and Invoice', description: 'Build quotes, send invoices, and track payment — all tied to the original job request.' },
      { title: 'Schedule Jobs', description: 'Set dates and arrival windows. Your whole schedule in one place.' },
      { title: 'Branded Confirmations', description: 'Professional confirmation emails with your business name go out automatically.' },
    ],
    howItWorks: [
      { step: '01', title: 'Share your booking link', description: 'Add it to your Google Business profile or website. Ready in 60 seconds.' },
      { step: '02', title: 'Customer submits their job', description: 'Issue description, location, and photos of the panel or problem area. Everything upfront.' },
      { step: '03', title: 'It lands on your board', description: 'Review the submission, run an AI brief, schedule the job, send a confirmation — all from your phone.' },
    ],
    emailPreview: {
      subject: 'Bright Wire Electric — We received your service request',
      bodyLines: [
        'Hi Robert,',
        'Thanks for reaching out to Bright Wire Electric. We received your request and will confirm your appointment shortly.',
        'Issue: Tripping breaker — master bedroom outlets',
        'Submitted: Today at 10:18 AM',
      ],
    },
    pricing: {
      headline: 'Simple pricing for electricians.',
      sub: 'No per-job fees. No setup costs. Cancel anytime.',
    },
    seo: {
      title: 'Lead2Project for Electricians — Booking Links & Job Tracking',
      description: 'Electricians use Lead2Project to capture job requests with photos, track work, and send invoices — all from one link.',
    },
  },

};

export function getIndustryContent(slug: string): IndustryContent | null {
  return industryContent[slug] ?? null;
}

export const industryList = Object.values(industryContent).map(i => ({
  slug: i.slug,
  name: i.name,
  badge: i.badge,
  color: i.color,
}));