// Placeholder data for the dashboard. In a real build this comes from the
// desktop app via opt-in cloud sync; here it's static sample content.

export interface TranscriptLine {
  speaker: 'You' | 'Them';
  text: string;
}

export interface Session {
  id: string;
  title: string;
  date: string; // ISO
  durationMin: number;
  app: string;
  questions: number;
  summary: string;
  transcript: TranscriptLine[];
}

export const account = {
  name: 'Harvey',
  email: 'harvey@arcube.com',
  plan: 'Open Source',
  provider: 'Claude (claude-opus-4-8)',
};

export const stats = {
  sessionsThisWeek: 12,
  minutesTranscribed: 318,
  questionsAsked: 47,
  stealthOn: true,
};

export const sessions: Session[] = [
  {
    id: 's1',
    title: 'Arcube — Investor update call',
    date: '2026-06-06T14:30:00Z',
    durationMin: 42,
    app: 'Google Meet',
    questions: 6,
    summary:
      'Walked through Q2 traction, runway, and the v2 roadmap. Action items: send the updated deck, follow up on the partnership intro.',
    transcript: [
      { speaker: 'Them', text: 'Thanks for hopping on — can you give us the headline numbers for the quarter?' },
      { speaker: 'You', text: 'Revenue is up 38% quarter over quarter, and we cut CAC by about a third.' },
      { speaker: 'Them', text: 'Nice. What does runway look like at the current burn?' },
      { speaker: 'You', text: 'About 16 months. We have room to accelerate hiring if the round closes.' },
    ],
  },
  {
    id: 's2',
    title: 'Design review — onboarding flow',
    date: '2026-06-05T10:00:00Z',
    durationMin: 28,
    app: 'Zoom',
    questions: 9,
    summary: 'Reviewed the new 3-step onboarding. Agreed to drop the email step and add a sample workspace.',
    transcript: [
      { speaker: 'Them', text: 'The drop-off is mostly on the second screen.' },
      { speaker: 'You', text: 'Let me pull up the funnel — yeah, 40% bounce on the email step.' },
    ],
  },
  {
    id: 's3',
    title: 'Customer interview — ACME Corp',
    date: '2026-06-03T16:15:00Z',
    durationMin: 51,
    app: 'Google Meet',
    questions: 4,
    summary: 'They want SSO and an audit log before rolling out org-wide. Pricing was not a blocker.',
    transcript: [
      { speaker: 'You', text: 'What would need to be true for you to roll this out to the whole team?' },
      { speaker: 'Them', text: 'Honestly, SSO and an audit log. Security review is the gate, not price.' },
    ],
  },
];
