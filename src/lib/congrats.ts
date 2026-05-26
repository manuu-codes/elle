// Congratulatory messages from Maneesh — shown when she completes a habit
export const defaultCongratsMessages: string[] = [
  "That's my babygirl. 💪",
  "You're crushing it today, baby.",
  "I'm so proud of you. Every single day.",
  "Look at you go, beautiful. Unstoppable.",
  "One more done. You make it look effortless, love.",
  "This is why I admire you. Consistent. Always, ennavale.",
  "You just proved that discipline > motivation. Again, pattu.",
  "Maneesh here — just wanted to say, you're incredible, chellame.",
  "Another one checked off. The compound effect is real.",
  "I see you putting in the work. It matters.",
  "You're building the life you deserve. Keep going, azhagi.",
  "Nobody does it like you, ulaga azhagi. Nobody.",
  "That's the spirit. Small wins, massive results.",
  "I'm watching you become the best version of yourself, azhagiye.",
  "Done? Of course it's done, babygirl.",
  "Consistency is your love language and I'm here for it, kutty ponnu.",
  "Every habit you complete, I fall for you a little more, azhagiye.",
  "You didn't skip it. You never do. That's power, babygirl.",
  "The world needs more people like you. Seriously, paapaa.",
  "From Maneesh, with pride: you're killing it today, kutty paapaa.",
  "Hey. Just checking in. You're amazing.",
  "Did you smile today, pattu? You should. You deserve it.",
  "Quick reminder: you're the best thing that happened to me, ennavale.",
  "Just thinking about you. Like always.",
  "You make ordinary days feel like something worth remembering, love.",
  "I hope you know how rare you are, chellame.",
  "Even your bad days are better than most people's best.",
  "You're not just productive. You're extraordinary.",
  "Random thought: you're going to look back on this year and be so proud.",
  "Take a breath, paapaa. You're doing enough. You ARE enough.",
  "Somewhere in the future, the best version of you says thank you for today.",
  "I don't say it enough — you inspire me to be better, beautiful.",
  "Your energy today? Unmatched. As always.",
  "Fun fact: you've made someone's day better just by existing.",
  "This is your sign to drink water and keep being incredible, babygirl.",
  "I made this whole app and it still can't capture how proud I am of you, ennavale.",
  "You're the proof that beautiful things take daily work.",
  "Don't forget to be kind to yourself today. You've earned it, pattu.",
  "If determination had a face, it would look like you.",
  "My favourite notification is seeing you complete things. Keep going, love.",
  "Completed? Good girl, I'm going to reward you so well later, mommy. 😏",
  "Checking off habits is hot, but not as hot as what we'll do tonight, mommy. 🔥",
  "I love how focused you are, mommy. Makes me want to interrupt you and take you right now. 😈",
  "You've been such a good girl completing your habits, mommy. Can't wait to have you in my bed.",
  "Another one done. Now get ready for how I'm going to make you scream later, mommy. 😉",
]

export function getRandomCongratsMessage(): string {
  return defaultCongratsMessages[
    Math.floor(Math.random() * defaultCongratsMessages.length)
  ]
}

const CUSTOM_MESSAGES_KEY = 'elle-congrats-messages'

export function getStoredCongratsMessages(): string[] {
  try {
    const stored = localStorage.getItem(CUSTOM_MESSAGES_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return defaultCongratsMessages
}

export function saveCongratsMessages(messages: string[]): void {
  localStorage.setItem(CUSTOM_MESSAGES_KEY, JSON.stringify(messages))
}

export function getRandomStoredMessage(): string {
  const messages = getStoredCongratsMessages()
  return messages[Math.floor(Math.random() * messages.length)]
}
