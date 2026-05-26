export const secretMessages: string[] = [
  "You're doing better than you think, baby.",
  "The version of you from last year would be proud, beautiful.",
  "Keep going. Not for anyone. Just for you, love.",
  "You are the most disciplined person I know, chellame.",
  "I built this for you, pattu. Every pixel.",
  "The quiet work you do when nobody's watching — that's the real you, babygirl.",
  "You don't need to prove anything, azhagi. You already have.",
  "Some days are for conquering. Some are for resting. Both count, ulaga azhagi.",
  "Your consistency is your superpower, ennavale. Don't forget that.",
  "This system runs because you do, azhagiye. Never the other way around.",
  "You've handled harder days than this, kutty ponnu. And you made them look easy.",
  "The world doesn't see your 5am mornings, paapaa. But I do.",
  "Not everything needs to be perfect, kutty paapaa. But you make it look like it is.",
  "You're building something nobody else can, babygirl — yourself.",
  "When you doubt yourself, remember: you've never given up. Not once, baby.",
  "Every habit you complete is a vote for the person you're becoming, beautiful.",
  "The books, the investing, the movement — it's all compounding, love. Trust the process.",
  "You don't need motivation, love. You have discipline. That's rarer.",
  "I hope this app makes you feel seen, chellame. Because you are.",
  "Rest isn't weakness, pattu. It's strategy. Take what you need.",
  "You're not behind, babygirl. You're exactly where you need to be.",
  "The fact that you opened this today means you haven't stopped caring, azhagi.",
  "You inspire more people than you know, ulaga azhagi. Starting with me.",
  "One day you'll look back and realize this was the chapter everything changed, ennavale.",
  "Your future self is grateful for what you did today, azhagiye.",
  "Growth is quiet, kutty ponnu. But I see it in you every single day.",
  "This isn't just a tracker, paapaa. It's proof that you showed up.",
  "You carry so much grace under pressure, kutty paapaa. Don't forget to breathe.",
  "Nobody builds themselves like you do, pattu — with this much intention.",
  "Even on your worst days, you're still someone's best example, baby.",
  "The small things you do daily are the big things in disguise, beautiful.",
  "I can't stop thinking about what I want to do to you later, mommy. 🔥",
  "All this discipline is sexy, but wait until you see how I treat you tonight, mommy. 😈",
  "You're doing so good today, mommy. I want to hold you tight and kiss you until you forget about everything else.",
  "I'm craving you so bad, mommy. My mind is filled with naughty thoughts of you.",
  "You're mine, mommy. I can't wait to make you make those sweet noises later. 😉",
]

export function getTodaysMessage(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)
  return secretMessages[dayOfYear % secretMessages.length]
}
