export interface Decision {
  id: number;
  category: string;
  scenario: string;
  options: string[];
  timeLimit: number; // seconds
  difficulty: 'easy' | 'medium' | 'hard';
}

export const decisions: Decision[] = [
  // Time Management
  {
    id: 1,
    category: "Time Management",
    scenario: "You have 30 minutes before a meeting. A colleague asks for 20 minutes of your time for a non-urgent question.",
    options: ["Help them now", "Schedule for later"],
    timeLimit: 5,
    difficulty: "easy"
  },
  {
    id: 2,
    category: "Time Management",
    scenario: "Your morning routine is interrupted. You can either skip breakfast or skip your usual workout.",
    options: ["Skip breakfast", "Skip workout"],
    timeLimit: 5,
    difficulty: "easy"
  },
  {
    id: 3,
    category: "Time Management",
    scenario: "Two deadlines are approaching. One is for your boss (due tomorrow), one is for a client (due today, but flexible).",
    options: ["Client first", "Boss first", "Split time equally"],
    timeLimit: 7,
    difficulty: "medium"
  },

  // Financial
  {
    id: 4,
    category: "Financial",
    scenario: "An item you want is on 40% sale. You don't need it now, but might in 6 months.",
    options: ["Buy now", "Wait"],
    timeLimit: 5,
    difficulty: "easy"
  },
  {
    id: 5,
    category: "Financial",
    scenario: "You receive an unexpected $500. Your car needs minor repairs ($200) and you have credit card debt.",
    options: ["Fix car first", "Pay down debt", "Save it all"],
    timeLimit: 7,
    difficulty: "medium"
  },
  {
    id: 6,
    category: "Financial",
    scenario: "A friend invites you to an expensive dinner. You're saving for a vacation but haven't socialized in weeks.",
    options: ["Go to dinner", "Suggest cheaper alternative", "Decline politely"],
    timeLimit: 7,
    difficulty: "medium"
  },

  // Work & Career
  {
    id: 7,
    category: "Work & Career",
    scenario: "You spot an error in a presentation right before it starts. Fixing it means a 5-minute delay.",
    options: ["Fix it now", "Present as-is", "Mention it verbally"],
    timeLimit: 5,
    difficulty: "easy"
  },
  {
    id: 8,
    category: "Work & Career",
    scenario: "A recruiter reaches out about a position with 15% higher pay but longer commute.",
    options: ["Explore the opportunity", "Politely decline", "Ask for remote options"],
    timeLimit: 7,
    difficulty: "medium"
  },
  {
    id: 9,
    category: "Work & Career",
    scenario: "You disagree with your team's approach in a meeting. Speaking up might create tension.",
    options: ["Voice concern now", "Discuss privately after", "Go with the flow"],
    timeLimit: 6,
    difficulty: "medium"
  },

  // Social & Relationships
  {
    id: 10,
    category: "Social",
    scenario: "A friend cancels plans last minute for the third time. They seem stressed but it's affecting you.",
    options: ["Express frustration", "Offer support first", "Distance yourself"],
    timeLimit: 7,
    difficulty: "medium"
  },
  {
    id: 11,
    category: "Social",
    scenario: "Someone you just met asks a personal question you're uncomfortable answering.",
    options: ["Answer honestly", "Deflect with humor", "Politely decline"],
    timeLimit: 5,
    difficulty: "easy"
  },
  {
    id: 12,
    category: "Social",
    scenario: "You witness a stranger being rude to a service worker. The worker seems upset.",
    options: ["Intervene directly", "Support worker after", "Stay out of it"],
    timeLimit: 6,
    difficulty: "medium"
  },

  // Health & Wellness
  {
    id: 13,
    category: "Health",
    scenario: "You feel a mild cold coming. You have an important work event tomorrow.",
    options: ["Rest today, risk missing event", "Power through", "Attend virtually if possible"],
    timeLimit: 6,
    difficulty: "easy"
  },
  {
    id: 14,
    category: "Health",
    scenario: "It's 10 PM and you're tired but haven't exercised today. You planned a morning workout tomorrow.",
    options: ["Exercise now", "Sleep and do morning workout", "Skip and reset tomorrow"],
    timeLimit: 5,
    difficulty: "easy"
  },
  {
    id: 15,
    category: "Health",
    scenario: "Your doctor recommends a specialist visit. Insurance covers 50% but you feel fine now.",
    options: ["Schedule the visit", "Wait and monitor", "Get a second opinion first"],
    timeLimit: 7,
    difficulty: "medium"
  },

  // Quick Reactions
  {
    id: 16,
    category: "Quick Decision",
    scenario: "You're about to leave and notice rain clouds. Umbrella adds weight to your bag.",
    options: ["Take umbrella", "Risk it"],
    timeLimit: 3,
    difficulty: "easy"
  },
  {
    id: 17,
    category: "Quick Decision",
    scenario: "Two equally good parking spots: closer but tight, farther but easy to exit.",
    options: ["Closer spot", "Farther spot"],
    timeLimit: 3,
    difficulty: "easy"
  },
  {
    id: 18,
    category: "Quick Decision",
    scenario: "Elevator door closing. You could make it if you run, but people are watching.",
    options: ["Run for it", "Wait for next one"],
    timeLimit: 2,
    difficulty: "easy"
  },

  // Priority Calls
  {
    id: 19,
    category: "Priorities",
    scenario: "Your phone buzzes during family dinner. It could be work or spam.",
    options: ["Check immediately", "Check after dinner", "Ignore completely"],
    timeLimit: 4,
    difficulty: "easy"
  },
  {
    id: 20,
    category: "Priorities",
    scenario: "You have energy for one task: cleaning your space or preparing tomorrow's meals.",
    options: ["Clean now", "Prep meals", "Do neither, rest"],
    timeLimit: 5,
    difficulty: "easy"
  },

  // Hard Decisions
  {
    id: 21,
    category: "Ethical",
    scenario: "You find a wallet with $200 and an ID. Returning it is inconvenient.",
    options: ["Return in person", "Mail it back", "Turn in to police", "Keep money, return wallet"],
    timeLimit: 8,
    difficulty: "hard"
  },
  {
    id: 22,
    category: "Ethical",
    scenario: "A coworker takes credit for your idea in a meeting with leadership present.",
    options: ["Correct them publicly", "Address privately after", "Let it go this time", "CC leadership on follow-up"],
    timeLimit: 8,
    difficulty: "hard"
  },
  {
    id: 23,
    category: "Life Choices",
    scenario: "You're offered a dream job in another city. Your partner can't relocate for a year.",
    options: ["Take job, long distance", "Decline and wait", "Negotiate delayed start", "Ask for remote first year"],
    timeLimit: 10,
    difficulty: "hard"
  },
  {
    id: 24,
    category: "Life Choices",
    scenario: "Your aging parent needs more care. You can move them nearby, move to them, or hire help.",
    options: ["Move parent nearby", "Relocate to parent", "Hire professional care", "Share duty with siblings"],
    timeLimit: 10,
    difficulty: "hard"
  }
];
