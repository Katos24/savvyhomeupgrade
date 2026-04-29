// lib/serviceDetails.ts

export const serviceDetails: Record<
  string,
  {
    jobs: string[];
    pain: string;
    searchTerms: string[];
  }
> = {
  hvac: {
    jobs: [
      'AC installs',
      'heating repairs',
      'duct cleaning',
      'furnace maintenance',
      'mini split installs',
    ],
    pain: 'seasonal demand spikes and emergency calls at all hours',
    searchTerms: [
      'hvac software',
      'hvac scheduling app',
      'hvac business management',
      'hvac crm',
      'ac repair scheduling',
    ],
  },

  electrical: {
    jobs: [
      'panel upgrades',
      'wiring repairs',
      'lighting installs',
      'outlet work',
      'ceiling fan wiring',
    ],
    pain: 'emergency calls and back-to-back appointments across town',
    searchTerms: [
      'electrician software',
      'electrical contractor app',
      'electrician scheduling',
      'electrical business management',
    ],
  },

  plumbing: {
    jobs: [
      'pipe repairs',
      'drain cleaning',
      'water heater installs',
      'toilet replacements',
      'sewer line work',
    ],
    pain: 'urgent calls at all hours and jobs that run longer than expected',
    searchTerms: [
      'plumbing software',
      'plumber scheduling app',
      'plumbing business management',
      'plumber crm',
    ],
  },

  roofing: {
    jobs: [
      'roof replacements',
      'leak repairs',
      'inspections',
      'gutter installs',
      'storm damage repair',
    ],
    pain: 'weather delays and managing multiple crews on big jobs',
    searchTerms: [
      'roofing software',
      'roofing crm',
      'roofing contractor app',
      'roofing lead management',
    ],
  },

  painting: {
    jobs: [
      'interior painting',
      'exterior painting',
      'cabinet refinishing',
      'deck staining',
      'commercial painting',
    ],
    pain: 'multi-day jobs and coordinating estimates with walkthroughs',
    searchTerms: [
      'painting contractor software',
      'painting business app',
      'painter scheduling',
      'painting estimate software',
    ],
  },

  handyman: {
    jobs: [
      'home repairs',
      'furniture assembly',
      'drywall patching',
      'door installs',
      'odd jobs',
    ],
    pain: 'a huge variety of job types and customers who want you there yesterday',
    searchTerms: [
      'handyman software',
      'handyman scheduling app',
      'handyman business management',
      'handyman crm',
    ],
  },

  landscaping: {
    jobs: [
      'lawn care',
      'tree trimming',
      'garden design',
      'mulching',
      'seasonal cleanups',
    ],
    pain: 'weather cancellations and managing recurring weekly clients',
    searchTerms: [
      'landscaping software',
      'lawn care app',
      'landscaping business management',
      'lawn care scheduling',
    ],
  },

  cleaning: {
    jobs: [
      'house cleaning',
      'deep cleaning',
      'move-out cleaning',
      'office cleaning',
      'post-construction cleaning',
    ],
    pain: 'high volume of bookings and keeping track of recurring appointments',
    searchTerms: [
      'cleaning business software',
      'maid service app',
      'cleaning company scheduling',
      'cleaning service crm',
    ],
  },

  moving: {
    jobs: [
      'residential moves',
      'apartment moves',
      'packing services',
      'furniture delivery',
      'junk hauling',
    ],
    pain: 'tight scheduling windows and last-minute bookings',
    searchTerms: [
      'moving company software',
      'mover scheduling app',
      'moving business management',
      'moving crm',
    ],
  },

  locksmith: {
    jobs: [
      'lock changes',
      'car lockouts',
      'rekeying',
      'deadbolt installs',
      'smart lock setup',
    ],
    pain: 'emergency calls that need immediate response',
    searchTerms: [
      'locksmith software',
      'locksmith scheduling',
      'locksmith business app',
      'locksmith crm',
    ],
  },

  fencing: {
    jobs: [
      'wood fences',
      'vinyl fences',
      'chain link',
      'gate installs',
      'fence repairs',
    ],
    pain: 'big material orders and multi-day installs that need coordination',
    searchTerms: [
      'fencing contractor software',
      'fence company app',
      'fencing business management',
    ],
  },

  concrete: {
    jobs: [
      'driveways',
      'patios',
      'sidewalks',
      'foundation work',
      'stamped concrete',
    ],
    pain: 'weather-dependent pours and scheduling around cure times',
    searchTerms: [
      'concrete contractor software',
      'concrete business app',
      'concrete scheduling',
    ],
  },

  flooring: {
    jobs: [
      'hardwood installs',
      'tile work',
      'vinyl plank',
      'carpet installs',
      'floor refinishing',
    ],
    pain: 'managing material deliveries and multi-room projects',
    searchTerms: [
      'flooring contractor software',
      'flooring business app',
      'flooring company crm',
    ],
  },

  siding: {
    jobs: [
      'vinyl siding',
      'fiber cement',
      'wood siding',
      'siding repairs',
      'trim work',
    ],
    pain: 'weather delays and coordinating with other trades on remodels',
    searchTerms: [
      'siding contractor software',
      'siding company app',
      'siding business management',
    ],
  },

  gutters: {
    jobs: [
      'gutter installs',
      'gutter cleaning',
      'gutter guards',
      'downspout extensions',
      'gutter repairs',
    ],
    pain: 'seasonal rushes in spring and fall and lots of small jobs to keep track of',
    searchTerms: [
      'gutter company software',
      'gutter business app',
      'gutter cleaning scheduling',
    ],
  },

  'pressure-washing': {
    jobs: [
      'house washing',
      'driveway cleaning',
      'deck washing',
      'commercial pressure washing',
      'roof soft washing',
    ],
    pain: 'weather cancellations and managing a packed daily schedule',
    searchTerms: [
      'pressure washing software',
      'power washing app',
      'pressure washing business management',
    ],
  },

  'tree-service': {
    jobs: [
      'tree removal',
      'tree trimming',
      'stump grinding',
      'emergency storm cleanup',
      'lot clearing',
    ],
    pain: 'emergency storm calls flooding in and big jobs that tie up your crew for days',
    searchTerms: [
      'tree service software',
      'arborist app',
      'tree company scheduling',
      'tree service crm',
    ],
  },

  'pest-control': {
    jobs: [
      'termite treatment',
      'rodent removal',
      'ant treatment',
      'mosquito control',
      'wildlife removal',
    ],
    pain: 'recurring service schedules and customers who need you there fast',
    searchTerms: [
      'pest control software',
      'exterminator app',
      'pest control scheduling',
      'pest control crm',
    ],
  },

  'garage-door': {
    jobs: [
      'garage door installs',
      'spring replacement',
      'opener installs',
      'panel replacement',
      'garage door tune-ups',
    ],
    pain: 'emergency calls when someone is stuck and parts ordering for different brands',
    searchTerms: [
      'garage door software',
      'garage door company app',
      'garage door business management',
    ],
  },

  'window-installation': {
    jobs: [
      'window replacement',
      'new construction windows',
      'storm windows',
      'bay windows',
      'skylight installs',
    ],
    pain: 'long lead times on custom orders and scheduling around delivery dates',
    searchTerms: [
      'window installer software',
      'window company app',
      'window installation scheduling',
    ],
  },

  drywall: {
    jobs: [
      'drywall hanging',
      'taping and mudding',
      'texture matching',
      'ceiling repairs',
      'water damage repair',
    ],
    pain: 'coordinating with other trades on new builds and remodels',
    searchTerms: [
      'drywall contractor software',
      'drywall business app',
      'drywall company management',
    ],
  },

  demolition: {
    jobs: [
      'interior demo',
      'deck removal',
      'shed teardown',
      'pool demolition',
      'site clearing',
    ],
    pain: 'permit coordination and disposal logistics',
    searchTerms: [
      'demolition contractor software',
      'demo company app',
      'demolition business management',
    ],
  },

  excavation: {
    jobs: [
      'site grading',
      'trenching',
      'foundation digging',
      'land clearing',
      'drainage work',
    ],
    pain: 'weather delays and equipment scheduling across multiple job sites',
    searchTerms: [
      'excavation contractor software',
      'excavating company app',
      'excavation business management',
    ],
  },

  septic: {
    jobs: [
      'septic installs',
      'tank pumping',
      'drain field repair',
      'septic inspections',
      'line cleaning',
    ],
    pain: 'emergency backups that need same-day service and health department scheduling',
    searchTerms: [
      'septic company software',
      'septic business app',
      'septic service scheduling',
    ],
  },

  paving: {
    jobs: [
      'driveway paving',
      'parking lot paving',
      'asphalt repair',
      'sealcoating',
      'striping',
    ],
    pain: 'weather windows for laying asphalt and coordinating with material suppliers',
    searchTerms: [
      'paving contractor software',
      'asphalt company app',
      'paving business management',
    ],
  },

  masonry: {
    jobs: [
      'brick work',
      'stone walls',
      'chimney repair',
      'retaining walls',
      'tuck pointing',
    ],
    pain: 'weather-dependent work and long multi-day projects',
    searchTerms: [
      'masonry contractor software',
      'mason business app',
      'masonry company management',
    ],
  },

  welding: {
    jobs: [
      'structural welding',
      'railing fabrication',
      'gate fabrication',
      'trailer repair',
      'custom metalwork',
    ],
    pain: 'custom job quoting and managing shop time vs field work',
    searchTerms: [
      'welding business software',
      'welder scheduling app',
      'welding shop management',
    ],
  },

  insulation: {
    jobs: [
      'attic insulation',
      'spray foam',
      'blown-in insulation',
      'crawl space insulation',
      'soundproofing',
    ],
    pain: 'coordinating with builders on new construction timelines',
    searchTerms: [
      'insulation contractor software',
      'insulation company app',
      'insulation business management',
    ],
  },

  solar: {
    jobs: [
      'panel installs',
      'system design',
      'battery storage',
      'panel cleaning',
      'inverter replacement',
    ],
    pain: 'long sales cycles and permit and inspection scheduling',
    searchTerms: [
      'solar installer software',
      'solar company app',
      'solar business management',
      'solar crm',
    ],
  },

  'pool-service': {
    jobs: [
      'pool cleaning',
      'equipment repair',
      'pool opening and closing',
      'liner replacement',
      'chemical balancing',
    ],
    pain: 'managing weekly recurring routes and seasonal ramp-up',
    searchTerms: [
      'pool service software',
      'pool company app',
      'pool business management',
      'pool service crm',
    ],
  },

  irrigation: {
    jobs: [
      'sprinkler installs',
      'system repairs',
      'winterization',
      'spring startups',
      'drip irrigation',
    ],
    pain: 'seasonal rush periods and managing recurring maintenance clients',
    searchTerms: [
      'irrigation company software',
      'sprinkler business app',
      'irrigation scheduling',
    ],
  },

  'appliance-repair': {
    jobs: [
      'washer repair',
      'dryer repair',
      'fridge repair',
      'dishwasher repair',
      'oven repair',
    ],
    pain: 'parts ordering and fitting emergency repairs into a packed schedule',
    searchTerms: [
      'appliance repair software',
      'appliance business app',
      'appliance repair scheduling',
    ],
  },

  chimney: {
    jobs: [
      'chimney sweeping',
      'chimney inspections',
      'liner installs',
      'cap installs',
      'masonry repair',
    ],
    pain: 'seasonal demand in fall and winter and scheduling around customer availability',
    searchTerms: [
      'chimney sweep software',
      'chimney business app',
      'chimney company management',
    ],
  },

  waterproofing: {
    jobs: [
      'basement waterproofing',
      'french drains',
      'sump pump installs',
      'crack injection',
      'exterior waterproofing',
    ],
    pain: 'emergency flood calls and long multi-step projects',
    searchTerms: [
      'waterproofing contractor software',
      'waterproofing company app',
      'waterproofing business management',
    ],
  },

  'foundation-repair': {
    jobs: [
      'crack repair',
      'pier installs',
      'leveling',
      'bowing wall repair',
      'crawl space encapsulation',
    ],
    pain: 'complex assessments that need detailed documentation and follow-ups',
    searchTerms: [
      'foundation repair software',
      'foundation company app',
      'foundation repair crm',
    ],
  },

  'junk-removal': {
    jobs: [
      'household junk removal',
      'construction debris',
      'estate cleanouts',
      'appliance hauling',
      'yard waste removal',
    ],
    pain: 'last-minute bookings and routing multiple pickups in a day',
    searchTerms: [
      'junk removal software',
      'hauling company app',
      'junk removal scheduling',
    ],
  },

  'carpet-cleaning': {
    jobs: [
      'carpet cleaning',
      'upholstery cleaning',
      'rug cleaning',
      'stain removal',
      'commercial carpet cleaning',
    ],
    pain: 'fitting multiple jobs into a day and managing repeat customers',
    searchTerms: [
      'carpet cleaning software',
      'carpet cleaner app',
      'carpet cleaning business management',
    ],
  },

  'auto-detailing': {
    jobs: [
      'full details',
      'interior cleaning',
      'paint correction',
      'ceramic coating',
      'mobile detailing',
    ],
    pain: 'managing mobile appointments and keeping track of add-on services',
    searchTerms: [
      'auto detailing software',
      'detailing business app',
      'car detailing scheduling',
      'detailing crm',
    ],
  },

  towing: {
    jobs: [
      'roadside assistance',
      'accident towing',
      'long-distance towing',
      'motorcycle towing',
      'flatbed service',
    ],
    pain: 'emergency dispatch and keeping track of which trucks are available',
    searchTerms: [
      'towing company software',
      'towing business app',
      'towing dispatch software',
      'towing crm',
    ],
  },
};