export type IndustryContent = {
  slug: string;
  name: string;
  emoji: string;
  badge: string;
  color: string; // accent color hex
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
    icon: string;
    title: string;
    description: string;
  }[];
  howItWorks: {
    step: string;
    title: string;
    description: string;
  }[];
  testimonial: {
    quote: string;
    name: string;
    trade: string;
    location: string;
    initials: string;
    color: string;
  };
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
    emoji: '🏠',
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
        'Customer sends you a blurry photo in a text thread you can\'t find later',
        'You show up to an estimate not knowing if it\'s 2 squares or 20',
        'You wrote the lead on a napkin. The napkin is gone.',
      ],
    },
    features: [
      { icon: '📸', title: 'Photo Submissions', description: 'Customers attach damage photos directly to their lead. You see everything before you ever leave the truck.' },
      { icon: '⚡', title: 'Instant Lead Board', description: 'Every new submission hits your board in real time. No more checking your email, texts, and voicemail separately.' },
      { icon: '🤖', title: 'AI Job Brief', description: 'One tap generates a scope summary from the customer\'s description and photos. Show up to every estimate prepared.' },
      { icon: '📋', title: 'Quote & Track', description: 'Build quotes, collect deposits, track job status — all from the same place the lead came in.' },
      { icon: '📅', title: 'Schedule Crew', description: 'Assign jobs to crew members with dates and times. Everyone knows what\'s next.' },
      { icon: '✉️', title: 'Branded Emails', description: 'Customers get professional confirmation emails with your logo. Looks like you have a full office.' },
    ],
    howItWorks: [
      { step: '01', title: 'You share one link', description: 'Add it to your truck wrap, Instagram bio, or Google Business profile. Takes 60 seconds to set up.' },
      { step: '02', title: 'Customer submits their job', description: 'They fill out name, address, description — and attach photos of the damage. All in one place.' },
      { step: '03', title: 'It lands on your board', description: 'You see the full lead instantly. Run an AI brief, assign it, schedule it, and quote it — all from your phone.' },
    ],
    testimonial: {
      quote: 'They show up to the job already knowing the scope. No surprises on-site, no back-and-forth. My crew stopped asking me what we\'re walking into.',
      name: 'Jake R.',
      trade: 'Roofing',
      location: 'Phoenix, AZ',
      initials: 'JR',
      color: '#f97316',
    },
    emailPreview: {
      subject: 'Torres Roofing — We received your request',
      bodyLines: [
        'Hi Mike,',
        'Thanks for reaching out to Torres Roofing. We\'ve received your job request and will be in touch shortly to schedule your estimate.',
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

  // ── DOG GROOMING ─────────────────────────────────────────────
  'dog-grooming': {
    slug: 'dog-grooming',
    name: 'Dog Grooming',
    emoji: '🐾',
    badge: 'Built for Groomers',
    color: '#ec4899',
    hero: {
      headline: 'One link. Every new client, organized.',
      sub: 'New clients submit their dog\'s breed, coat condition, and photos before they even book. You arrive knowing exactly what you\'re grooming.',
      cta: 'Get Your Free Booking Link',
      demoLabel: 'See how a new client books in',
    },
    stats: [
      { value: '< 60s', label: 'To set up your booking link', note: 'no tech skills needed' },
      { value: '100%', label: 'Of client info upfront', note: 'breed, coat, special needs' },
      { value: '$0', label: 'Extra software needed', note: 'replaces the DMs and texts' },
      { value: '2x', label: 'Faster client intake', note: 'vs. back-and-forth messaging' },
    ],
    formFields: [
      { label: 'Your Name', placeholder: 'Sarah Johnson', type: 'text' },
      { label: 'Email', placeholder: 'sarah@example.com', type: 'email' },
      { label: 'Phone', placeholder: '(555) 000-0000', type: 'tel' },
      { label: 'Dog\'s Name & Breed', placeholder: 'Biscuit — Golden Doodle, 3 years old', type: 'text' },
      { label: 'Tell us about your dog', placeholder: 'He\'s a bit nervous around clippers but loves baths. Last groomed about 3 months ago, coat is quite matted...', type: 'textarea' },
    ],
    pain: {
      headline: 'Every groomer knows this feeling.',
      points: [
        'New client slides into your DMs, you forget to reply for 2 days',
        'You ask for breed and coat condition over 4 back-and-forth texts',
        'Client shows up with a severely matted dog and you had no idea',
        'Your bookings are spread across Instagram DMs, texts, and a notes app',
      ],
    },
    features: [
      { icon: '🐾', title: 'Pet Profile Submissions', description: 'Clients submit breed, age, coat condition, and photos before they book. No surprises on appointment day.' },
      { icon: '⚡', title: 'Instant Booking Board', description: 'Every new client request lands on your board the moment they submit. Organized, not buried in DMs.' },
      { icon: '🤖', title: 'AI Client Brief', description: 'One tap and you get a summary of the dog\'s condition, special needs, and what the appointment will involve.' },
      { icon: '📋', title: 'Quote & Invoice', description: 'Build a service quote, collect payment, and track what each pet needs — all in one place.' },
      { icon: '🔁', title: 'Repeat Client Tracking', description: 'See a client\'s full history at a glance. Know their dog\'s last cut, coat notes, and preferences every time.' },
      { icon: '✉️', title: 'Branded Confirmations', description: 'Clients get a professional booking confirmation with your business name. Builds trust from the first message.' },
    ],
    howItWorks: [
      { step: '01', title: 'Share your booking link', description: 'Put it in your Instagram bio, Facebook page, or Google listing. New clients click and submit in 2 minutes.' },
      { step: '02', title: 'Client fills out their pet\'s info', description: 'Name, breed, coat condition, special needs — and photos if they want. You get the full picture before they arrive.' },
      { step: '03', title: 'You see it on your board', description: 'Review the submission, run an AI brief, confirm the appointment, and send a professional confirmation — all from your phone.' },
    ],
    testimonial: {
      quote: 'I used to spend 20 minutes texting new clients back and forth just to get basic info. Now they submit everything upfront and I just confirm. It\'s made my whole intake process feel professional.',
      name: 'Carla M.',
      trade: 'Dog Grooming',
      location: 'Austin, TX',
      initials: 'CM',
      color: '#ec4899',
    },
    emailPreview: {
      subject: 'Paws & Polish — We received your booking request',
      bodyLines: [
        'Hi Sarah,',
        'Thanks for reaching out to Paws & Polish. We\'ve received your request for Biscuit and will confirm your appointment shortly.',
        'Pet: Biscuit — Golden Doodle',
        'Submitted: Today at 11:32 AM',
      ],
    },
    pricing: {
      headline: 'Simple pricing for grooming businesses.',
      sub: 'No per-client fees. No setup costs. Cancel anytime.',
    },
    seo: {
      title: 'Lead2Project for Dog Groomers — Booking Links & Client Management',
      description: 'Dog groomers use Lead2Project to collect new client info with photos, track appointments, and send professional confirmations — all from one link.',
    },
  },

  // ── CLEANING SERVICES ─────────────────────────────────────────
  cleaning: {
    slug: 'cleaning',
    name: 'Cleaning Services',
    emoji: '🧹',
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
        'You quoted wrong because you didn\'t know about the cats until you arrived',
      ],
    },
    features: [
      { icon: '📸', title: 'Space Photo Submissions', description: 'Clients attach photos of the rooms they need cleaned. You see the actual condition before you quote.' },
      { icon: '⚡', title: 'Instant Lead Board', description: 'Every new request lands on your board immediately. No more chasing down leads from three different channels.' },
      { icon: '🤖', title: 'AI Job Brief', description: 'Get an instant summary of the job scope, special considerations, and suggested pricing range based on what the client submitted.' },
      { icon: '📋', title: 'Quote & Track', description: 'Send a professional quote, collect a deposit, and track recurring jobs — all from the same place.' },
      { icon: '🔁', title: 'Recurring Client Profiles', description: 'See every client\'s cleaning history, notes, and preferences in one place. Never ask the same question twice.' },
      { icon: '✉️', title: 'Branded Confirmations', description: 'Clients receive a professional email with your business name. You look established from day one.' },
    ],
    howItWorks: [
      { step: '01', title: 'Share your booking link', description: 'Add it to your website, Nextdoor profile, or Google Business listing. Ready in under 60 seconds.' },
      { step: '02', title: 'Client submits their space details', description: 'Square footage, number of rooms, condition, special requests — and photos. Everything you need to quote accurately.' },
      { step: '03', title: 'You see it on your board', description: 'Review the submission, generate an AI brief, send a quote, and confirm the job — all from your phone.' },
    ],
    testimonial: {
      quote: 'I was quoting blind before. Clients would say "just a quick clean" and I\'d show up to a disaster. Now I see photos before I even respond. My quotes are accurate and my clients trust me more.',
      name: 'Maria C.',
      trade: 'Cleaning Services',
      location: 'Dallas, TX',
      initials: 'MC',
      color: '#06b6d4',
    },
    emailPreview: {
      subject: 'Spotless Home Co — We received your cleaning request',
      bodyLines: [
        'Hi Diana,',
        'Thanks for reaching out to Spotless Home Co. We\'ve received your request and will be in touch shortly with a quote.',
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
};

export function getIndustryContent(slug: string): IndustryContent | null {
  return industryContent[slug] ?? null;
}

export const industryList = Object.values(industryContent).map(i => ({
  slug: i.slug,
  name: i.name,
  emoji: i.emoji,
  badge: i.badge,
  color: i.color,
}));