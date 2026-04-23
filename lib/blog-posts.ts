export type BlogPost = {
  slug: string;
  title: string;
  description: string;       // meta description for SEO
  excerpt: string;            // short preview for blog index
  category: string;
  publishedAt: string;        // ISO date
  updatedAt?: string;
  readTime: number;           // minutes
  keywords: string[];
  ogImage?: string;
  content: string;            // HTML content
};

export const BLOG_CATEGORIES = [
  { value: 'growth', label: 'Growth', color: '#3b82f6' },
  { value: 'operations', label: 'Operations', color: '#22c55e' },
  { value: 'guides', label: 'Guides', color: '#f59e0b' },
  { value: 'tips', label: 'Tips & Tricks', color: '#8b5cf6' },
];

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-get-more-leads-home-service-business',
    title: 'How to Get More Leads for Your Home Service Business in 2026',
    description: 'Proven strategies for contractors, landscapers, and home service pros to generate more leads and grow their business without expensive marketing agencies.',
    excerpt: 'Stop relying on word of mouth alone. Here are the strategies that actually work for small home service businesses in 2026.',
    category: 'growth',
    publishedAt: '2026-04-23',
    readTime: 8,
    keywords: ['contractor leads', 'home service marketing', 'get more customers', 'landscaping leads', 'contractor marketing'],
    content: `
<p>If you're running a home service business — landscaping, pressure washing, painting, roofing, cleaning, or anything in between — you already know that the work itself isn't the hard part. <strong>Finding enough customers to keep your crew busy</strong> is what keeps you up at night.</p>

<p>Most contractors start the same way: word of mouth, maybe a Facebook page, and hoping the phone rings. That works until it doesn't. Here's what actually moves the needle in 2026.</p>

<h2>1. Get a Booking Page, Not a Website</h2>

<p>Here's a controversial take: <strong>most contractors don't need a website.</strong> They need a booking page.</p>

<p>A website costs $2,000–$10,000 to build, takes weeks, and sits there looking pretty while doing nothing. A booking page does one thing: turns visitors into leads. Customers fill out what they need, upload photos of the job, and you get an instant notification.</p>

<p>The difference? A website is a brochure. A booking page is a lead machine. You can share it on your truck, your yard signs, your business cards, and your social media. One link, and customers can reach you 24/7 — even when you're on a job site.</p>

<h2>2. Put a QR Code on Everything</h2>

<p>Your truck is a billboard that drives around town every single day. Are you using it?</p>

<p>Print a QR code that links to your booking page and slap it on your truck, your trailer, your yard signs, and your business cards. When someone sees your crew doing great work on their neighbor's lawn, they scan the code and submit a request on the spot.</p>

<p>This works because it captures leads at the <strong>moment of highest intent</strong>. They're literally looking at your work and thinking "I want that." Don't make them remember a phone number — give them a QR code.</p>

<h2>3. Show Up on Google (Without Paying for Ads)</h2>

<p>When someone Googles "landscaper near me" or "pressure washing [your city]," you want to show up. Here's how, without spending a dime on ads:</p>

<p><strong>Google Business Profile:</strong> This is non-negotiable. Claim it, fill out every field, add photos of your work weekly, and ask every happy customer to leave a review. Businesses with 20+ reviews and recent photos consistently outrank those without.</p>

<p><strong>Post on social media with location tags:</strong> Every time you finish a job, post a before-and-after photo on Instagram and Facebook. Tag the city. Use hashtags like #[YourCity]Landscaping. Google indexes social media posts, and this builds your local presence over time.</p>

<h2>4. Ask for Reviews Like Your Business Depends on It</h2>

<p>Because it does. 87% of consumers read online reviews for local businesses. A contractor with 50 five-star reviews will beat a contractor with zero reviews every single time, regardless of who does better work.</p>

<p>The best time to ask for a review is <strong>right after you finish the job</strong>, while the customer is standing in their freshly transformed yard looking happy. Send them a direct link to your Google review page via text. Don't wait — the longer you wait, the less likely they are to do it.</p>

<h2>5. Follow Up on Every Single Lead</h2>

<p>Here's the stat that should scare you: <strong>78% of customers go with the first contractor who responds.</strong> Not the cheapest. Not the best. The first one who picks up the phone or sends a quote.</p>

<p>If a lead comes in and you don't respond for two days, they've already hired someone else. You need a system that captures leads, notifies you instantly, and lets you send a quote in minutes — not days.</p>

<p>This is where most small contractors lose thousands of dollars every month. The leads are coming in, but they're leaking out because there's no system to catch them.</p>

<h2>6. Build Repeat Business</h2>

<p>Your best source of new revenue isn't new customers — it's your existing ones. A landscaping customer who hired you for spring cleanup probably needs fall cleanup too. A painting customer might need their deck stained next year.</p>

<p>Keep a record of every job you've done, and reach out when the season changes. A simple text saying "Hey, it's almost spring — want us to get your lawn ready?" converts at an insane rate because they already trust you.</p>

<h2>The Bottom Line</h2>

<p>You don't need a marketing agency. You don't need to spend $5,000 on ads. You need three things: a way for customers to find you and request service, a system to respond fast and send quotes, and the discipline to follow up and ask for reviews.</p>

<p>Most of this is free. The rest costs less than a single job. And once the system is running, leads come in while you sleep.</p>
`,
  },

  {
    slug: 'best-way-to-send-quotes-to-customers-contractor',
    title: 'The Best Way to Send Quotes to Customers as a Contractor',
    description: 'Learn how to create and send professional quotes that win more jobs. Stop losing customers to slow, messy estimates.',
    excerpt: 'Your quote is your first impression. Here\'s how to send ones that actually close.',
    category: 'operations',
    publishedAt: '2026-04-23',
    readTime: 6,
    keywords: ['contractor quotes', 'send estimates', 'quote builder', 'contractor estimate template', 'how to send quotes'],
    content: `
<p>You drive to the job site, walk around, do the math in your head, and text the customer: <em>"It'll be about $2,400."</em></p>

<p>Then you wonder why they ghosted you. Here's the problem: that's not a quote. That's a guess sent via text message. And it looks like one.</p>

<h2>Why Your Quotes Are Losing You Jobs</h2>

<p>Most contractors send quotes the same way: a text message, a scribbled number, or if they're fancy, a PDF they made in Word. The customer receives it, compares it to the other contractor who sent a clean, itemized breakdown, and goes with the one that looks more professional.</p>

<p>It's not about being the cheapest. It's about <strong>looking like you know what you're doing</strong>.</p>

<h2>What a Winning Quote Looks Like</h2>

<p>A quote that closes has four things:</p>

<p><strong>Line items, not lump sums.</strong> Instead of "$2,400 for landscaping," break it down: sod removal ($400), grading ($300), new sod installation ($1,200), cleanup ($200), materials ($300). Customers want to see where their money goes. It builds trust and makes the price feel justified.</p>

<p><strong>Your company branding.</strong> Your name, logo, phone number, and a professional layout. It takes 30 seconds of the customer's attention to form an impression. Make it count.</p>

<p><strong>Speed.</strong> The contractor who sends a quote within 2 hours of the site visit wins the job. Not tomorrow. Not next week. Today. Speed signals that you're organized and reliable.</p>

<p><strong>One-click acceptance.</strong> Don't make them call you back to say yes. Include a way for them to accept the quote instantly — a button, a link, a reply. Remove every obstacle between "I like this" and "You're hired."</p>

<h2>How to Send Quotes in Minutes</h2>

<p>The fastest approach is a quote builder that lets you add line items, calculates the total, and emails it to the customer with your branding — all from your phone while you're still on the job site.</p>

<p>You finish the walkthrough, build the quote in 5 minutes, hit send, and the customer gets a professional email before you've even driven away. That's how you win jobs.</p>

<h2>Following Up on Quotes</h2>

<p>Sent a quote and haven't heard back? Don't just wait. Follow up after 48 hours with a short, friendly message. Something like: "Hey [name], just checking in on that quote I sent over. Happy to answer any questions."</p>

<p>Most contractors never follow up. The ones who do close 40% more jobs. It's not pushy — it's professional.</p>

<h2>Track Everything</h2>

<p>If you can't tell me right now how many quotes you sent this month and how many were accepted, you're flying blind. Track your quotes, your close rate, and your outstanding payments. This is how you spot problems before they become emergencies.</p>
`,
  },

  {
    slug: 'why-contractors-need-booking-page-not-website',
    title: 'Why Every Contractor Needs a Booking Page (Not a Website)',
    description: 'A traditional website costs thousands and generates zero leads. Here\'s why a booking page is the smarter move for contractors.',
    excerpt: 'Your $5,000 website looks great. But is it actually getting you customers?',
    category: 'growth',
    publishedAt: '2026-04-23',
    readTime: 5,
    keywords: ['contractor booking page', 'contractor website', 'online booking for contractors', 'lead capture page', 'contractor landing page'],
    content: `
<p>Every contractor has been told the same thing: "You need a website." So they pay a web designer $3,000–$10,000, wait 6 weeks, and end up with a beautiful site that gets 12 visitors a month. Sound familiar?</p>

<h2>The Problem With Contractor Websites</h2>

<p>Traditional websites are built to <strong>look impressive</strong>, not to <strong>generate leads</strong>. They have a homepage, an about page, a services page, a gallery, and a contact form buried three clicks deep.</p>

<p>Here's what happens: a potential customer lands on your site, scrolls around, thinks "nice work," and then… leaves. They didn't fill out the contact form. They didn't call. They just left. And you'll never know they were there.</p>

<p>The conversion rate on a typical contractor website is <strong>under 2%</strong>. That means for every 100 visitors, 98 leave without contacting you.</p>

<h2>What a Booking Page Does Differently</h2>

<p>A booking page has one job: <strong>turn a visitor into a lead.</strong> No distractions, no navigation maze, no "about our history since 1987." Just a clean form that asks what they need, lets them upload photos, and captures their contact info.</p>

<p>The conversion rate on a focused booking page? <strong>15–30%.</strong> That's 10x better than a traditional website.</p>

<p>Why? Because it removes friction. The customer doesn't have to hunt for a phone number, wonder if you're available, or compose an email. They fill out one form and they're done. You get notified instantly.</p>

<h2>One Link That Works Everywhere</h2>

<p>The beauty of a booking page is that it's just a URL. You can put it anywhere:</p>

<p><strong>On your truck:</strong> A QR code or short URL on your vehicle wrap. Someone sees your truck at a job site, scans the code, and submits a request while you're still working.</p>

<p><strong>On yard signs:</strong> "Like this work? Scan here for a free estimate." The sign does your selling for you.</p>

<p><strong>On business cards:</strong> Replace your website URL with your booking link. Now every card is a direct line to a new lead.</p>

<p><strong>On social media:</strong> Your Instagram bio, your Facebook page, your Google Business Profile — one link everywhere.</p>

<h2>But What About Credibility?</h2>

<p>"Won't people think I'm not legit without a real website?" No. People care about three things: your reviews, your photos, and how easy it is to contact you. A booking page with your branding, your work photos, and a simple form checks all three boxes.</p>

<p>In fact, a booking page that works perfectly on mobile (where 70%+ of your traffic comes from) builds more credibility than a clunky desktop website that looks terrible on a phone.</p>

<h2>The Cost Difference</h2>

<p>A professional website: $3,000–$10,000 upfront + $50–$200/month hosting and maintenance.</p>

<p>A booking page with lead management: Under $80/month, ready in minutes, works on every device, and actually generates leads.</p>

<p>One costs more than a week's revenue. The other pays for itself with a single job.</p>
`,
  },

  {
    slug: 'how-to-track-jobs-get-paid-faster-contractor',
    title: 'How to Track Jobs and Get Paid Faster as a Small Contractor',
    description: 'Stop chasing payments and losing track of jobs. Simple systems for contractors to stay organized and get paid on time.',
    excerpt: 'If you\'re tracking jobs in your head and chasing payments via text, you\'re leaving money on the table.',
    category: 'operations',
    publishedAt: '2026-04-23',
    readTime: 7,
    keywords: ['contractor job tracking', 'get paid faster contractor', 'contractor payment tracking', 'job management contractor', 'contractor CRM'],
    content: `
<p>Be honest: do you know exactly how many jobs are in progress right now? How much money is owed to you? Which customers haven't paid yet?</p>

<p>If you had to think about it for more than two seconds, you need a better system.</p>

<h2>The Shoebox Problem</h2>

<p>Most small contractors run their business out of their head, their text messages, and maybe a crumpled notepad in the truck. It works when you're doing 3 jobs a week. It falls apart at 10.</p>

<p>Here's what happens: you finish a job, move on to the next one, forget to send the invoice, remember a week later, send a text saying "hey, can you Venmo me?", and then chase them for another two weeks. Meanwhile, you've done $15,000 in work this month and only collected $8,000.</p>

<p>That's not a revenue problem. It's an <strong>organization problem.</strong></p>

<h2>What "Tracking Jobs" Actually Means</h2>

<p>You need to know five things about every job at any given moment:</p>

<p><strong>Status:</strong> Is it a new lead, quoted, scheduled, in progress, or completed?</p>

<p><strong>Who's assigned:</strong> Which crew member is handling this job?</p>

<p><strong>When it's happening:</strong> What's the scheduled date and time?</p>

<p><strong>How much it's worth:</strong> What did you quote, and has the customer accepted?</p>

<p><strong>Payment status:</strong> Have they paid? How much? What's outstanding?</p>

<p>If you can pull up this information for any job in under 10 seconds, you're organized. If you can't, you're losing money.</p>

<h2>Getting Paid Faster: The Three Rules</h2>

<p><strong>Rule 1: Send the quote before you leave the property.</strong> The longer you wait, the colder the lead gets. Build your quote on your phone during the walkthrough and email it before you drive away. Customers are most likely to accept when the conversation is fresh.</p>

<p><strong>Rule 2: Mark the job complete and follow up on payment the same day.</strong> Don't wait until Friday to check on payments. The moment the job is done, confirm the total with the customer. "Hey, job's all done! Your total is $1,800 — let me know how you'd like to handle payment." Same day. Every time.</p>

<p><strong>Rule 3: Follow up on unpaid jobs within 48 hours.</strong> Not next week. Not "when you get around to it." 48 hours. A friendly reminder: "Hey [name], just following up on the payment for the [job]. Let me know if you have any questions!" Most people aren't avoiding you — they just forgot.</p>

<h2>The Tools You Need</h2>

<p>You don't need enterprise software. You need something that lets you see all your jobs in one place, move them through stages (new → quoted → scheduled → completed → paid), and flag which ones are overdue on payment.</p>

<p>A visual board where you can see every job at a glance — what's coming up, what's in progress, what's waiting on payment — transforms how you run your business. You go from reactive ("who hasn't paid me?") to proactive ("I have three jobs completing this week, I'll follow up on payment right away").</p>

<h2>The Payoff</h2>

<p>Contractors who track every job and follow the three rules above typically collect payment <strong>2–3 weeks faster</strong> and reduce unpaid invoices by over 60%. That's not a small improvement — that's the difference between cash flow stress and financial confidence.</p>
`,
  },

  {
    slug: 'ways-contractors-lose-money-without-crm',
    title: '5 Ways Contractors Lose Money Without a CRM',
    description: 'Most contractors don\'t realize how much money they\'re losing to missed leads, slow quotes, and forgotten follow-ups. Here are the 5 biggest leaks.',
    excerpt: 'You\'re probably losing $5,000+ per month and don\'t even know it. Here\'s where the money goes.',
    category: 'tips',
    publishedAt: '2026-04-23',
    readTime: 6,
    keywords: ['contractor CRM', 'CRM for small business', 'contractor software', 'lead management contractor', 'contractor business tips'],
    content: `
<p>You don't need a CRM. You've been doing fine without one. Business is good enough.</p>

<p>Right?</p>

<p>Let's do the math on what "fine" is actually costing you.</p>

<h2>1. Missed Leads: $2,000–$5,000/month</h2>

<p>A customer calls while you're on a roof. You miss the call. You forget to call back. They call someone else.</p>

<p>This happens more than you think. Studies show that <strong>62% of calls to small businesses go unanswered</strong>. If your average job is worth $1,500 and you miss just 2–3 leads per month, that's $3,000–$4,500 walking out the door.</p>

<p>A booking page catches these leads even when you can't answer the phone. The customer submits their request, you get notified, and you follow up when you're free. No missed calls. No lost leads.</p>

<h2>2. Slow Quotes: $1,500–$3,000/month</h2>

<p>You visit the job site on Monday. You send the quote on Thursday. The customer hired someone else on Tuesday.</p>

<p><strong>78% of customers hire the first contractor who sends a quote.</strong> Not the cheapest — the fastest. Every day you wait to send a quote, your close rate drops by roughly 10%.</p>

<p>If you're losing 1–2 jobs per month because someone else quoted faster, that's $1,500–$3,000 gone.</p>

<h2>3. No Follow-Up: $1,000–$2,000/month</h2>

<p>You sent a quote last week. Haven't heard back. So you assume they're not interested and move on.</p>

<p>Wrong. Most customers who don't respond to a quote are still deciding. They're busy. They forgot. They're comparing. A simple follow-up message 48 hours later — "Hey, just checking in on that estimate" — closes <strong>35–40% of otherwise-lost deals</strong>.</p>

<p>If you're not following up systematically, you're leaving at least 1 job per month on the table.</p>

<h2>4. Unpaid Invoices: $2,000–$4,000/month (Cash Flow)</h2>

<p>The job's done. The customer is happy. But you didn't send an invoice right away, and now it's been three weeks. The customer has moved on mentally, and getting them to pay feels awkward.</p>

<p>This isn't lost revenue — it's <strong>delayed revenue that damages your cash flow</strong>. When you have $8,000 in outstanding payments and $5,000 in expenses due this week, you're borrowing from your own future. Late payments create a cascade of stress that affects every part of your business.</p>

<h2>5. No Repeat Business System: $3,000–$5,000/month</h2>

<p>Your best customers — the ones who already trust you — are your most valuable asset. But if you don't have a record of past jobs and no system to follow up, you're starting from zero every season.</p>

<p>A landscaping customer worth $2,000/year becomes worth $10,000 over five years — but only if you stay in touch. A simple system that tracks past customers and reminds you to follow up seasonally can add $3,000–$5,000/month in repeat business.</p>

<h2>Add It Up</h2>

<p>Missed leads: $3,000. Slow quotes: $2,000. No follow-up: $1,500. Late payments: $3,000 in delayed cash flow. No repeat system: $4,000.</p>

<p>That's <strong>$13,500/month</strong> — conservatively. And the solution? A simple system that costs less than one job per month.</p>

<p>The question isn't whether you can afford a CRM. It's whether you can afford not to have one.</p>
`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter(p => p.category === category);
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(currentSlug);
  if (!current) return getAllPosts().slice(0, limit);
  return getAllPosts()
    .filter(p => p.slug !== currentSlug)
    .sort((a, b) => (a.category === current.category ? -1 : 1))
    .slice(0, limit);
}