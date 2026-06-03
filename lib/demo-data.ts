import { EmailMessage } from '@/types/email'

export interface DemoContact {
  name: string
  email: string
  role: string
  emailCount: number
  lastContact: Date
}

export interface ToneProfile {
  formality: string
  greetingStyle: string
  closingStyle: string
  avgLength: string
  keyPatterns: string[]
  overallTone: string
  overallScore: number
}

export const DEMO_CONTACTS: DemoContact[] = [
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@techcorp.com',
    role: 'Colleague',
    emailCount: 6,
    lastContact: new Date('2024-11-20'),
  },
  {
    name: 'Marcus Klein',
    email: 'm.klein@consulting.de',
    role: 'Manager',
    emailCount: 5,
    lastContact: new Date('2024-11-18'),
  },
  {
    name: 'Lisa Brennan',
    email: 'l.brennan@startup.io',
    role: 'Client',
    emailCount: 6,
    lastContact: new Date('2024-11-15'),
  },
  {
    name: 'Tom Hoffmann',
    email: 't.hoffmann@gmail.com',
    role: 'Network',
    emailCount: 5,
    lastContact: new Date('2024-11-10'),
  },
]

export const DEMO_EMAILS: Record<string, EmailMessage[]> = {
  'sarah.chen@techcorp.com': [
    {
      id: 'sc1', threadId: 'tsc1',
      subject: 'Quick sync on the dashboard project?',
      from: 'sarah.chen@techcorp.com', to: 'me@example.com',
      date: new Date('2024-11-20'),
      body: "Hey! Are you free for a quick 15-min call tomorrow? Want to run some ideas by you before the sprint planning.",
      snippet: "Hey! Are you free for a quick 15-min call tomorrow?",
    },
    {
      id: 'sc2', threadId: 'tsc1',
      subject: 'Quick sync on the dashboard project?',
      from: 'me@example.com', to: 'sarah.chen@techcorp.com',
      date: new Date('2024-11-20'),
      body: "Hey Sarah, totally! How about 10am? I've got some thoughts on the data viz side too.",
      snippet: "Hey Sarah, totally! How about 10am?",
    },
    {
      id: 'sc3', threadId: 'tsc2',
      subject: 'Loved your talk at the all-hands!',
      from: 'me@example.com', to: 'sarah.chen@techcorp.com',
      date: new Date('2024-11-14'),
      body: "Hey Sarah, just wanted to say your presentation today was great — the way you broke down the API migration was super clear. Team's been talking about it.",
      snippet: "Just wanted to say your presentation today was great",
    },
    {
      id: 'sc4', threadId: 'tsc3',
      subject: 'Re: PR review — auth module',
      from: 'sarah.chen@techcorp.com', to: 'me@example.com',
      date: new Date('2024-11-08'),
      body: "Thanks for the thorough review! Left a couple of replies on the inline comments. The token refresh logic was a bit tricky — happy to pair on it if it'd help.",
      snippet: "Thanks for the thorough review!",
    },
    {
      id: 'sc5', threadId: 'tsc4',
      subject: 'Lunch Thursday?',
      from: 'sarah.chen@techcorp.com', to: 'me@example.com',
      date: new Date('2024-10-30'),
      body: "Hey! A few of us are hitting that new ramen place on Thursday — want to join? Around 12:30.",
      snippet: "A few of us are hitting that new ramen place on Thursday",
    },
    {
      id: 'sc6', threadId: 'tsc5',
      subject: "Sharing this article - thought you'd find it interesting",
      from: 'me@example.com', to: 'sarah.chen@techcorp.com',
      date: new Date('2024-10-22'),
      body: "Hey Sarah, saw this piece on edge caching strategies and immediately thought of our conversation last week. Worth a read!",
      snippet: "Saw this piece on edge caching strategies",
    },
  ],
  'm.klein@consulting.de': [
    {
      id: 'mk1', threadId: 'tmk1',
      subject: 'Q4 deliverables — status update required',
      from: 'm.klein@consulting.de', to: 'me@example.com',
      date: new Date('2024-11-18'),
      body: "Please provide an updated status on the Q4 deliverables by EOD Friday. The board review is scheduled for Monday and I need consolidated figures.",
      snippet: "Please provide an updated status on the Q4 deliverables by EOD Friday.",
    },
    {
      id: 'mk2', threadId: 'tmk1',
      subject: 'Q4 deliverables — status update required',
      from: 'me@example.com', to: 'm.klein@consulting.de',
      date: new Date('2024-11-18'),
      body: "Dear Marcus, understood. I'll have the consolidated report on your desk by Thursday afternoon to give you time to review before the board meeting.",
      snippet: "I'll have the consolidated report on your desk by Thursday afternoon.",
    },
    {
      id: 'mk3', threadId: 'tmk2',
      subject: 'Re: Resource allocation — Nov/Dec',
      from: 'me@example.com', to: 'm.klein@consulting.de',
      date: new Date('2024-11-11'),
      body: "Dear Marcus, I've reviewed the proposed allocation. My concern is that pulling two engineers before the Nov 29 release creates meaningful delivery risk. Happy to walk through the tradeoffs at your convenience.",
      snippet: "My concern is that pulling two engineers creates delivery risk.",
    },
    {
      id: 'mk4', threadId: 'tmk3',
      subject: 'Excellent outcome on the Brandt account',
      from: 'm.klein@consulting.de', to: 'me@example.com',
      date: new Date('2024-11-04'),
      body: "Well done on closing the Brandt account. The preparation was evident and the client feedback has been positive. Keep up the standard.",
      snippet: "Well done on closing the Brandt account.",
    },
    {
      id: 'mk5', threadId: 'tmk4',
      subject: 'Annual review — scheduling',
      from: 'm.klein@consulting.de', to: 'me@example.com',
      date: new Date('2024-10-28'),
      body: "Please confirm your availability for the annual review during the week of November 11. Preferred slots are Tuesday or Wednesday, 9–11am.",
      snippet: "Please confirm your availability for the annual review.",
    },
  ],
  'l.brennan@startup.io': [
    {
      id: 'lb1', threadId: 'tlb1',
      subject: 'Feedback on the new onboarding flow',
      from: 'l.brennan@startup.io', to: 'me@example.com',
      date: new Date('2024-11-15'),
      body: "Hi! Just went through the updated onboarding with our team and the consensus is really positive. The reduced step count made a noticeable difference. One thing came up though — could we revisit the permissions screen? A couple of people found it confusing.",
      snippet: "Just went through the updated onboarding with our team — really positive!",
    },
    {
      id: 'lb2', threadId: 'tlb1',
      subject: 'Feedback on the new onboarding flow',
      from: 'me@example.com', to: 'l.brennan@startup.io',
      date: new Date('2024-11-15'),
      body: "Hi Lisa, really glad to hear the team's reaction! Great point on the permissions screen — I've flagged it for the next sprint. Would it help to schedule a short session so I can walk through the proposed changes with you before we ship?",
      snippet: "Really glad to hear the team's reaction!",
    },
    {
      id: 'lb3', threadId: 'tlb2',
      subject: 'Proposal for Phase 2 — extended integration',
      from: 'me@example.com', to: 'l.brennan@startup.io',
      date: new Date('2024-11-07'),
      body: "Hi Lisa, following up on last week's call — I've put together a detailed proposal for Phase 2. It covers the CRM integration, reporting module, and a revised timeline. Would love your thoughts before we finalize scope.",
      snippet: "I've put together a detailed proposal for Phase 2.",
    },
    {
      id: 'lb4', threadId: 'tlb3',
      subject: 'Re: SLA question — response times',
      from: 'l.brennan@startup.io', to: 'me@example.com',
      date: new Date('2024-10-31'),
      body: "Hi, thanks for the quick clarification! That makes sense. For context, we're planning a bigger rollout in January so reliability at scale is top of mind for us. Your confidence in the architecture is reassuring.",
      snippet: "Thanks for the quick clarification! That makes sense.",
    },
    {
      id: 'lb5', threadId: 'tlb4',
      subject: 'Connecting you with our Head of Ops',
      from: 'l.brennan@startup.io', to: 'me@example.com',
      date: new Date('2024-10-24'),
      body: "Hi! I'd like to loop in Jordan, our Head of Ops, who'll be the main stakeholder for the integration. I think a three-way call would be a great next step — does that work for you?",
      snippet: "I'd like to loop in Jordan, our Head of Ops.",
    },
    {
      id: 'lb6', threadId: 'tlb5',
      subject: 'Quick thank you',
      from: 'l.brennan@startup.io', to: 'me@example.com',
      date: new Date('2024-10-17'),
      body: "Hi, just wanted to say the launch went really smoothly — no major issues and the team is happy. Really appreciate all the prep work that went into this. Looking forward to continuing to work together!",
      snippet: "Just wanted to say the launch went really smoothly.",
    },
  ],
  't.hoffmann@gmail.com': [
    {
      id: 'th1', threadId: 'tth1',
      subject: 'conference next month?',
      from: 't.hoffmann@gmail.com', to: 'me@example.com',
      date: new Date('2024-11-10'),
      body: "hey, you going to the Berlin tech thing in December? could be fun, last year was actually decent",
      snippet: "hey, you going to the Berlin tech thing in December?",
    },
    {
      id: 'th2', threadId: 'tth1',
      subject: 'conference next month?',
      from: 'me@example.com', to: 't.hoffmann@gmail.com',
      date: new Date('2024-11-10'),
      body: "Tom, yeah I was thinking about it! Haven't registered yet. Want to go together and split an Airbnb?",
      snippet: "Yeah I was thinking about it! Want to go together?",
    },
    {
      id: 'th3', threadId: 'tth2',
      subject: 'Re: that freelance gig',
      from: 't.hoffmann@gmail.com', to: 'me@example.com',
      date: new Date('2024-11-01'),
      body: "honestly just go for it, the client sounds reasonable and the rate is solid. worst case you bail after 3 months",
      snippet: "honestly just go for it, the rate is solid",
    },
    {
      id: 'th4', threadId: 'tth3',
      subject: 'check this out',
      from: 't.hoffmann@gmail.com', to: 'me@example.com',
      date: new Date('2024-10-19'),
      body: "found this thing you'd probably like — basically does what you were trying to build last year but open source https://github.com/...",
      snippet: "found this thing you'd probably like",
    },
    {
      id: 'th5', threadId: 'tth4',
      subject: 'beers friday?',
      from: 'me@example.com', to: 't.hoffmann@gmail.com',
      date: new Date('2024-10-11'),
      body: "Tom, you around Friday evening? thinking about heading to that new place on Torstraße",
      snippet: "you around Friday evening?",
    },
  ],
}

export const DEMO_PROFILES: Record<string, ToneProfile> = {
  'sarah.chen@techcorp.com': {
    formality: 'Casual-professional',
    greetingStyle: 'Hey Sarah,',
    closingStyle: '(no formal closing)',
    avgLength: 'Short to medium (2–4 sentences)',
    keyPatterns: ['Positive reinforcement', 'Collaborative check-ins', 'Sharing useful resources'],
    overallTone: 'positive',
    overallScore: 72,
  },
  'm.klein@consulting.de': {
    formality: 'Formal',
    greetingStyle: 'Dear Marcus,',
    closingStyle: 'Best regards,',
    avgLength: 'Concise (1–3 sentences)',
    keyPatterns: ['Status updates with deadlines', 'Risk flagging', 'Action-oriented requests'],
    overallTone: 'professional',
    overallScore: 15,
  },
  'l.brennan@startup.io': {
    formality: 'Warm-professional',
    greetingStyle: 'Hi Lisa,',
    closingStyle: 'Looking forward to it,',
    avgLength: 'Medium to long (3–6 sentences)',
    keyPatterns: ['Detailed follow-ups', 'Inviting feedback', 'Building rapport alongside business'],
    overallTone: 'positive',
    overallScore: 68,
  },
  't.hoffmann@gmail.com': {
    formality: 'Very casual',
    greetingStyle: 'Tom,',
    closingStyle: '(no closing)',
    avgLength: 'Very short (1–2 sentences)',
    keyPatterns: ['Direct / no pleasantries', 'Shared interests & events', 'Quick opinions'],
    overallTone: 'neutral',
    overallScore: 30,
  },
}

export function searchDemoContact(query: string): DemoContact | null {
  const q = query.toLowerCase().trim()
  return DEMO_CONTACTS.find(
    c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  ) ?? null
}
