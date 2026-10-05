// Copy for /solutions/[industry]. Keep every claim true to lib/permissions.ts
// and the app today: no AI briefs, no arrival windows, no "60 seconds", no
// invented stats. Plan-gated features say which plan.

export type IndustryContent = {
  slug: string;
  name: string;
  badge: string;
  color: string;
  hero: {
    headline: string;
    sub: string;
    cta: string;
  };
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
    title: string;
    description: string;
  }[];
  emailPreview: {
    business: string;
    subject: string;
    bodyLines: string[];
  };
  seo: {
    title: string;
    description: string;
  };
};

// Shared feature cards. Each industry adds its own first card.
const QUOTE = {
  title: 'Quote, deposit, invoice',
  description: 'Build the quote from your saved services, take a deposit, then invoice the balance. Card payments through Stripe on Basic.',
};
const BOARD = {
  title: 'Every lead on one board',
  description: 'Requests from your link land as new leads. Move them from New to Completed so nothing sits forgotten.',
};
const CREW = {
  title: 'Schedule your crew',
  description: 'Give each job a date, a time and a crew member, then see the week on your calendar. Scheduling is on Basic.',
};
const PROFIT = {
  title: 'Know what you made',
  description: 'Log expenses on each job and see what you kept after materials and labor.',
};
const REVIEWS = {
  title: 'Ask for the review',
  description: 'When the job is done, send the customer your Google review link in one click. On Basic.',
};

export const industryContent: Record<string, IndustryContent> = {
  // ── ROOFING ──────────────────────────────────────────────────
  roofing: {
    slug: 'roofing',
    name: 'Roofing',
    badge: 'Built for roofers',
    color: '#00828A',
    hero: {
      headline: 'Every roof job starts here.',
      sub: 'Customers send their address and what’s wrong through one link, so you show up to the estimate knowing what you’re dealing with.',
      cta: 'Get your free booking link',
    },
    formFields: [
      { label: 'Full name', placeholder: 'Mike Torres', type: 'text' },
      { label: 'Email', placeholder: 'mike@example.com', type: 'email' },
      { label: 'Phone', placeholder: '(555) 000-0000', type: 'tel' },
      { label: 'Property address', placeholder: '123 Oak St, Holbrook NY', type: 'text' },
      { label: 'Describe the issue', placeholder: 'Storm damage on the south side, several shingles missing, small leak in the corner bedroom…', type: 'textarea' },
    ],
    pain: {
      headline: 'Sound familiar?',
      points: [
        'You’re up on a roof and miss three calls about a new storm job',
        'The customer’s photo is buried in a text thread you can’t find',
        'You show up to an estimate not knowing if it’s 2 squares or 20',
        'You wrote the lead on a napkin. The napkin is gone.',
      ],
    },
    features: [
      { title: 'See the damage first', description: 'Address and a description of the damage come with every request. On Basic, customers can attach photos and video, and you see them on the lead card.' },
      BOARD,
      QUOTE,
      CREW,
      PROFIT,
      REVIEWS,
    ],
    howItWorks: [
      { title: 'Share one link', description: 'Put it on your truck, your Google Business profile, or a yard sign with the QR code.' },
      { title: 'The customer sends the job', description: 'Name, address and what’s wrong, all in one request.' },
      { title: 'It lands on your board', description: 'Quote it, schedule it and collect the deposit from the same place, on your phone.' },
    ],
    emailPreview: {
      business: 'Torres Roofing',
      subject: 'We received your request',
      bodyLines: ['Hi Mike,', 'Thanks for reaching out to Torres Roofing. We got your request and will be in touch soon.'],
    },
    seo: {
      title: 'Lead2Project for Roofers | Booking Link, Quotes & Deposits',
      description: 'Roofing contractors use Lead2Project to take job requests through one link, send quotes, collect deposits and track every job.',
    },
  },

  // ── CLEANING ─────────────────────────────────────────────────
  cleaning: {
    slug: 'cleaning',
    name: 'Cleaning Services',
    badge: 'Built for cleaners',
    color: '#00828A',
    hero: {
      headline: 'New cleaning clients. Less back-and-forth.',
      sub: 'Clients send their address, the size of the place and what they need before you ever call back. Quote faster and book more.',
      cta: 'Get your free booking link',
    },
    formFields: [
      { label: 'Full name', placeholder: 'Diana Chen', type: 'text' },
      { label: 'Email', placeholder: 'diana@example.com', type: 'email' },
      { label: 'Phone', placeholder: '(555) 000-0000', type: 'tel' },
      { label: 'Property address', placeholder: '456 Maple Ave, Sayville NY', type: 'text' },
      { label: 'Tell us about your space', placeholder: '3 bed / 2 bath, about 1,400 sq ft. Kitchen needs a deep clean, two cats…', type: 'textarea' },
    ],
    pain: {
      headline: 'Sound familiar?',
      points: [
        'A client asks for a quote and you play phone tag for three days',
        'The “small apartment” turns out to be 2,000 sq ft',
        'Client details are scattered across texts and a spreadsheet',
        'You found out about the pets when you walked in',
      ],
    },
    features: [
      { title: 'See the space first', description: 'Size, condition and special requests come with every request. On Basic, add your own questions and let clients attach photos of the rooms.' },
      BOARD,
      QUOTE,
      CREW,
      PROFIT,
      REVIEWS,
    ],
    howItWorks: [
      { title: 'Share your booking link', description: 'Add it to your website, Nextdoor or Google Business listing.' },
      { title: 'The client sends their details', description: 'Address, size of the space and what they need cleaned.' },
      { title: 'It lands on your board', description: 'Send the quote, take a deposit and put it on the calendar, all from your phone.' },
    ],
    emailPreview: {
      business: 'Spotless Home Co',
      subject: 'We received your request',
      bodyLines: ['Hi Diana,', 'Thanks for reaching out to Spotless Home Co. We got your request and will be in touch soon with a quote.'],
    },
    seo: {
      title: 'Lead2Project for Cleaning Businesses | Booking Link, Quotes & Payments',
      description: 'Cleaning businesses use Lead2Project to take client requests through one link, send quotes, collect deposits and track every job.',
    },
  },

  // ── HVAC ─────────────────────────────────────────────────────
  hvac: {
    slug: 'hvac',
    name: 'HVAC',
    badge: 'Built for HVAC contractors',
    color: '#00828A',
    hero: {
      headline: 'Every service call starts here.',
      sub: 'Customers send their address and what the system is doing before you roll the truck, so you know what you’re walking into.',
      cta: 'Get your free booking link',
    },
    formFields: [
      { label: 'Full name', placeholder: 'James Rivera', type: 'text' },
      { label: 'Email', placeholder: 'james@example.com', type: 'email' },
      { label: 'Phone', placeholder: '(555) 000-0000', type: 'tel' },
      { label: 'Property address', placeholder: '789 Elm St, Ronkonkoma NY', type: 'text' },
      { label: 'Describe the issue', placeholder: 'AC stopped cooling yesterday, unit is about 8 years old, rattles when it runs…', type: 'textarea' },
    ],
    pain: {
      headline: 'Sound familiar?',
      points: [
        'A customer calls while you’re on a job, and the lead goes to someone else',
        'You roll the truck and the unit is older than they said',
        'Quotes live on invoices, texts and sticky notes',
        'You can’t tell which jobs are paid and which still owe you',
      ],
    },
    features: [
      { title: 'Know before you roll', description: 'Address and a description of the problem come with every request. On Basic, customers can attach photos of the unit and the data plate.' },
      BOARD,
      QUOTE,
      { title: 'Schedule your techs', description: 'Give each call a date, a time and a tech, then see the week on your calendar. Scheduling is on Basic.' },
      { title: 'See who still owes you', description: 'Deposits, balances and what’s outstanding on every job, so nothing goes unpaid.' },
      REVIEWS,
    ],
    howItWorks: [
      { title: 'Share your booking link', description: 'Add it to your Google Business profile, truck or website.' },
      { title: 'The customer sends the issue', description: 'Address, what the system is doing and how old it is.' },
      { title: 'It lands on your board', description: 'Assign a tech, schedule it and quote it, all from your phone.' },
    ],
    emailPreview: {
      business: 'Arctic Air HVAC',
      subject: 'We received your service request',
      bodyLines: ['Hi James,', 'Thanks for reaching out to Arctic Air HVAC. We got your request and will be in touch soon.'],
    },
    seo: {
      title: 'Lead2Project for HVAC Contractors | Service Requests, Quotes & Payments',
      description: 'HVAC contractors use Lead2Project to take service requests through one link, schedule techs, send quotes and collect payment.',
    },
  },

  // ── PLUMBING ──────────────────────────────────────────────────
  plumbing: {
    slug: 'plumbing',
    name: 'Plumbing',
    badge: 'Built for plumbers',
    color: '#00828A',
    hero: {
      headline: 'Stop missing calls. Catch every job.',
      sub: 'Customers send their issue while you’re under someone else’s sink. Every request lands on your board, ready when you are.',
      cta: 'Get your free booking link',
    },
    formFields: [
      { label: 'Full name', placeholder: 'Karen White', type: 'text' },
      { label: 'Email', placeholder: 'karen@example.com', type: 'email' },
      { label: 'Phone', placeholder: '(555) 000-0000', type: 'tel' },
      { label: 'Property address', placeholder: '321 Pine Rd, Bohemia NY', type: 'text' },
      { label: 'Describe the issue', placeholder: 'Kitchen sink draining slowly for a week, now fully blocked and backing up…', type: 'textarea' },
    ],
    pain: {
      headline: 'Every plumber knows this.',
      points: [
        'You’re under a sink and miss three calls about a new job',
        'The “small leak” turns out to be a burst pipe',
        'Invoices are in your phone, your truck and maybe a notebook',
        'You forgot to follow up on a quote from two weeks ago',
      ],
    },
    features: [
      { title: 'See the problem first', description: 'Address and a description of the problem come with every request. On Basic, customers can attach photos and video of the leak or clog.' },
      BOARD,
      QUOTE,
      CREW,
      PROFIT,
      REVIEWS,
    ],
    howItWorks: [
      { title: 'Share your booking link', description: 'Add it to your Google Business profile, Nextdoor or website.' },
      { title: 'The customer sends the issue', description: 'Where it is and what’s going on, without a phone call.' },
      { title: 'It lands on your board', description: 'Quote it, schedule it and get paid from the same place.' },
    ],
    emailPreview: {
      business: 'Dave’s Plumbing',
      subject: 'We received your service request',
      bodyLines: ['Hi Karen,', 'Thanks for reaching out to Dave’s Plumbing. We got your request and will be in touch soon.'],
    },
    seo: {
      title: 'Lead2Project for Plumbers | Booking Link, Quotes & Invoices',
      description: 'Plumbers use Lead2Project to take service requests through one link, send quotes and invoices, and collect payment.',
    },
  },

  // ── ELECTRICAL ────────────────────────────────────────────────
  electrical: {
    slug: 'electrical',
    name: 'Electrical',
    badge: 'Built for electricians',
    color: '#00828A',
    hero: {
      headline: 'Every electrical job. One place.',
      sub: 'Customers describe the problem before you call back, so you show up knowing the scope instead of guessing it.',
      cta: 'Get your free booking link',
    },
    formFields: [
      { label: 'Full name', placeholder: 'Robert Kim', type: 'text' },
      { label: 'Email', placeholder: 'robert@example.com', type: 'email' },
      { label: 'Phone', placeholder: '(555) 000-0000', type: 'tel' },
      { label: 'Property address', placeholder: '654 Oak Ave, Patchogue NY', type: 'text' },
      { label: 'Describe the issue', placeholder: 'Two outlets in the master bedroom stopped working, breaker trips when I reset it…', type: 'textarea' },
    ],
    pain: {
      headline: 'Sound familiar?',
      points: [
        'A customer calls while you’re in a panel and you miss it',
        'You expect an outlet swap and find aluminum wiring',
        'Quotes go out by text from your personal number with no record',
        'You have no idea which jobs from last month are still unpaid',
      ],
    },
    features: [
      { title: 'See the panel first', description: 'Address and a description of the problem come with every request. On Basic, customers can attach photos of the panel, outlet or wiring.' },
      BOARD,
      QUOTE,
      CREW,
      { title: 'See who still owes you', description: 'Deposits, balances and what’s outstanding on every job, so nothing goes unpaid.' },
      REVIEWS,
    ],
    howItWorks: [
      { title: 'Share your booking link', description: 'Add it to your Google Business profile or website.' },
      { title: 'The customer sends the job', description: 'What’s wrong and where, all in one request.' },
      { title: 'It lands on your board', description: 'Quote it, schedule it and collect payment, all from your phone.' },
    ],
    emailPreview: {
      business: 'Bright Wire Electric',
      subject: 'We received your service request',
      bodyLines: ['Hi Robert,', 'Thanks for reaching out to Bright Wire Electric. We got your request and will be in touch soon.'],
    },
    seo: {
      title: 'Lead2Project for Electricians | Booking Link, Quotes & Invoices',
      description: 'Electricians use Lead2Project to take job requests through one link, send quotes and invoices, and track payment.',
    },
  },
};

export function getIndustryContent(slug: string): IndustryContent | null {
  return industryContent[slug] ?? null;
}

export const industryList = Object.values(industryContent).map((i) => ({
  slug: i.slug,
  name: i.name,
  badge: i.badge,
  color: i.color,
}));