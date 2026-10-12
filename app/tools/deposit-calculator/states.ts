// State deposit and sales tax info shown by the calculator.
// Only add a state after checking its rules against the official source.
// General information, not legal or tax advice.

export type Source = { label: string; url: string };

export type StateRule = { text: string; source: Source };

export type FAQ = { q: string; a: string; source?: Source };

export type TaxPreset = { label: string; rate: string };

export type StateTax =
  // Tax depends on the kind of job (e.g. NY capital improvement vs repair).
  | {
      kind: 'by_job_type';
      taxableLabel: string; // e.g. "Repair or maintenance"
      exemptLabel: string; // e.g. "Capital improvement"
      exemptNote: string;
      taxableNote: string;
      presets: TaxPreset[];
      source: Source;
    }
  // Contractor pays tax on materials; nothing is added to the customer's bill.
  | { kind: 'contractor_pays'; note: string; source: Source };

export type StateInfo = {
  slug: string;
  name: string;
  // SEO / page copy
  title: string;
  description: string;
  heading: string;
  intro: string;
  rules: StateRule[];
  tax?: StateTax;
  faq: FAQ[];
  // Optional live check against the deposit entered. Returns a warning or null.
  check?: (args: { deposit: number; total: number }) => string | null;
};

const NY_AG: Source = { label: 'NY Attorney General: home improvement', url: 'https://ag.ny.gov/home-improvement-fact-sheet' };
const NY_TAX_CAP: Source = {
  label: 'NY Tax Dept: capital improvements',
  url: 'https://tax.ny.gov/pubs_and_bulls/tg_bulletins/st/capital_improvements.htm',
};
const NY_ST124: Source = { label: 'Form ST-124', url: 'https://www.tax.ny.gov/pdf/current_forms/st/st124_fill_in.pdf' };
const CA_7159: Source = {
  label: 'Cal. Bus. & Prof. Code § 7159.5',
  url: 'https://law.justia.com/codes/california/code-bpc/division-3/chapter-9/article-10/section-7159-5',
};
const CA_CDTFA: Source = {
  label: 'CDTFA: construction contractors',
  url: 'https://cdtfa.ca.gov/industry/construction-contractors/specific-jobs.htm',
};

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export const STATES: Record<string, StateInfo> = {
  'new-york': {
    slug: 'new-york',
    name: 'New York',
    title: 'New York Contractor Deposit Calculator (Free) | Lead2Project',
    description:
      'Work out the deposit and balance for a New York home improvement job, with the right sales tax for capital improvements vs repairs. Includes NY deposit rules. Free, no sign-up.',
    heading: 'New York contractor deposit calculator',
    intro:
      'Enter the job price and your deposit. See what to collect up front, what’s left when the job is done, and the New York rules to keep in mind.',
    rules: [
      {
        text:
          'Payments received before a home improvement job is substantially complete must go into an escrow account at a New York bank within five business days, or the contractor must give the customer a bond or contract of indemnity instead.',
        source: NY_AG,
      },
      { text: 'Home improvement contracts must be in writing.', source: NY_AG },
    ],
    tax: {
      kind: 'by_job_type',
      exemptLabel: 'Capital improvement',
      taxableLabel: 'Repair or maintenance',
      exemptNote:
        'Capital improvements (like a new roof, deck, or remodel) generally have no sales tax charged to the customer. The customer gives you Form ST-124. You still pay tax on materials you buy.',
      taxableNote: 'Repairs and maintenance are taxable at the local rate where the work is done.',
      presets: [
        { label: 'Nassau 8.625%', rate: '8.625' },
        // VERIFY: Suffolk combined rate (believed 8.625%) on tax.ny.gov before relying on it.
        { label: 'Suffolk 8.625%', rate: '8.625' },
        { label: 'NYC 8.875%', rate: '8.875' },
      ],
      source: NY_TAX_CAP,
    },
    faq: [
      {
        q: 'Do I charge sales tax on home improvement work in New York?',
        a:
          'It depends on the job. Capital improvements, work that permanently adds to or improves the property, generally have no sales tax charged to the customer. Repairs and maintenance, like fixing a step or replacing a thermostat, are taxable. Either way, you pay sales tax on the materials you buy.',
        source: NY_TAX_CAP,
      },
      {
        q: 'What is Form ST-124?',
        a:
          'It’s the Certificate of Capital Improvement. The property owner fills it out and gives it to you, and you keep it on file to show why you didn’t charge sales tax. You aren’t required to accept it.',
        source: NY_ST124,
      },
      {
        q: 'What do I have to do with a deposit in New York?',
        a:
          'For home improvement work, money you receive before the job is substantially complete must go into an escrow account at a New York bank within five business days, or you must give the customer a bond or contract of indemnity instead.',
        source: NY_AG,
      },
      {
        q: 'Does a home improvement contract have to be in writing in New York?',
        a: 'Yes. The New York Attorney General says home improvement contracts must be in writing.',
        source: NY_AG,
      },
    ],
  },

  california: {
    slug: 'california',
    name: 'California',
    title: 'California Contractor Deposit Calculator (Free) | Lead2Project',
    description:
      'Work out the down payment and balance for a California home improvement job. Flags deposits over California’s $1,000 or 10% limit. Free, no sign-up.',
    heading: 'California contractor deposit calculator',
    intro:
      'Enter the job price and your deposit. See what to collect up front and what’s left, with a check against California’s down payment limit.',
    rules: [
      {
        text:
          'On home improvement contracts, the down payment can’t be more than $1,000 or 10% of the contract price, whichever is less, with exceptions for some bonded contractors.',
        source: CA_7159,
      },
    ],
    tax: {
      kind: 'contractor_pays',
      note:
        'On lump-sum construction contracts, California contractors usually pay tax on materials when they buy them and don’t add sales tax to the customer’s bill.',
      source: CA_CDTFA,
    },
    faq: [
      {
        q: 'How big a deposit can I take in California?',
        a:
          'On home improvement contracts, the down payment can’t be more than $1,000 or 10% of the contract price, whichever is less. Some bonded contractors are exempt.',
        source: CA_7159,
      },
      {
        q: 'Do California contractors add sales tax to the bill?',
        a:
          'On lump-sum contracts to improve real property, the contractor generally pays sales or use tax on materials when buying them and does not separately bill the customer for sales tax.',
        source: CA_CDTFA,
      },
    ],
    check: ({ deposit, total }) => {
      if (total <= 0 || deposit <= 0) return null;
      const limit = Math.min(1000, Math.round(total * 10) / 100);
      return deposit > limit + 0.005
        ? `This is above California’s usual limit of ${fmt(limit)} for this job ($1,000 or 10%, whichever is less). Some bonded contractors are exempt.`
        : null;
    },
  },
};

export const STATE_LIST = Object.values(STATES);

export const OTHER_STATE = 'other';

export const GENERAL = {
  title: 'Contractor Deposit Calculator (Free) | Lead2Project',
  heading: 'Contractor deposit calculator',
  intro: 'Enter the job price and your deposit. See what to collect up front and what’s left when the job is done.',
  faq: [
    {
      q: 'How much deposit should a contractor charge?',
      a:
        'There’s no single right number. Cover what you have to spend before work starts, like materials and special orders, and check your state’s rules, since some states cap deposits or control where the money is held.',
    },
    {
      q: 'Is the deposit figured before or after sales tax?',
      a:
        'This calculator takes the deposit from the total including tax, so the deposit and balance add up exactly to what the customer pays.',
    },
  ] as FAQ[],
};