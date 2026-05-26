// Daily quotes — rotates by day of year
export const dailyQuotes: string[] = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "Small daily improvements over time lead to stunning results. — Robin Sharma",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle",
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Your future is created by what you do today, not tomorrow. — Robert Kiyosaki",
  "Don't count the days, make the days count. — Muhammad Ali",
  "She believed she could, so she did.",
  "Be the energy you want to attract.",
  "Progress, not perfection.",
  "You don't have to be extreme, just consistent.",
  "The woman who moves a mountain begins by carrying away small stones. — Confucius",
  "A year from now, you'll wish you had started today. — Karen Lamb",
  "Success is the sum of small efforts, repeated day in and day out. — Robert Collier",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Discipline is choosing between what you want now and what you want most.",
  "You are never too old to set another goal or to dream a new dream. — C.S. Lewis",
  "The only impossible journey is the one you never begin. — Tony Robbins",
  "Hard days are the best because those are the days champions are made. — Gabby Douglas",
  "One small positive thought in the morning can change your whole day.",
  "Invest in yourself. It pays the best interest. — Benjamin Franklin",
  "What you do today can improve all your tomorrows. — Ralph Marston",
  "Start where you are. Use what you have. Do what you can. — Arthur Ashe",
  "She remembered who she was and the game changed.",
  "The comeback is always stronger than the setback.",
  "Be so good they can't ignore you. — Steve Martin",
  "You're allowed to be both a masterpiece and a work in progress.",
  "Action is the foundational key to all success. — Pablo Picasso",
  "A smooth sea never made a skilled sailor.",
  "If it doesn't challenge you, it won't change you.",
  "The only limit to our realization of tomorrow will be our doubts of today. — FDR",
  "Don't wish it were easier. Wish you were better. — Jim Rohn",
  "Every morning brings new potential, but if you dwell on the misfortunes of the day before, you tend to overlook tremendous opportunities.",
  "The difference between who you are and who you want to be is what you do.",
  "Believe you can and you're halfway there. — Theodore Roosevelt",
  "It's not about being the best. It's about being better than you were yesterday.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Your only competition is who you were yesterday.",
  "Dream big, start small, act now.",
  "She turned her can'ts into cans and her dreams into plans.",
  "The woman who follows the crowd will usually go no further than the crowd. The woman who walks alone is likely to find herself in places no one has ever been.",
  "Create the life you can't wait to wake up to.",
  "Growth is uncomfortable because you've never been here before.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Success isn't overnight. It's when every day you get a little better.",
  "Be fearless in the pursuit of what sets your soul on fire.",
  "Today is a good day to have a good day.",
  "Don't stop until you're proud.",
  "Strive for progress, not perfection.",
  "Your habits today are shaping who you become tomorrow.",
  "She was powerful not because she wasn't scared but because she went on so strongly, despite the fear.",
  "The energy you bring determines the energy you attract.",
  "A strong woman looks a challenge in the eye and gives it a wink.",
  "You have been assigned this mountain to show others it can be moved.",
  "Stars can't shine without darkness.",
  "Life begins at the end of your comfort zone. — Neale Donald Walsch",
  "Be stubborn about your goals and flexible about your methods.",
  "Courage doesn't always roar. Sometimes it's the quiet voice that says I'll try again tomorrow.",
  "Your life is your story. Write well. Edit often.",
  "Inhale confidence, exhale doubt.",
  "The best project you'll ever work on is you.",
]

// AI learning topics — rotates daily
export const aiTopics: string[] = [
  "How neural networks learn (gradient descent basics)",
  "What are Large Language Models and how they work",
  "Understanding Transformer architecture",
  "How RAG pipelines improve AI answers",
  "Fine-tuning vs prompt engineering — when to use which",
  "Computer vision basics: how AI sees images",
  "Reinforcement learning: how AI learns from rewards",
  "AI ethics: bias, fairness, and responsible AI",
  "How embeddings represent meaning as numbers",
  "Generative AI: diffusion models (how DALL-E / Midjourney work)",
  "Natural Language Processing fundamentals",
  "How attention mechanisms work in Transformers",
  "Transfer learning: standing on the shoulders of giants",
  "AI agents: autonomous systems that take actions",
  "Vector databases and semantic search",
  "How ChatGPT was trained (RLHF explained)",
  "Convolutional Neural Networks for image recognition",
  "Tokenization: how AI reads text",
  "AI in healthcare: diagnosis, drug discovery, imaging",
  "Prompt engineering techniques (few-shot, chain-of-thought)",
  "How recommendation systems work (Netflix, Spotify)",
  "GANs: AI that creates realistic fake content",
  "Edge AI: running models on phones and IoT devices",
  "AI safety and alignment research",
  "How self-driving cars use AI",
  "Multi-modal AI: combining text, images, and audio",
  "Knowledge distillation: making AI models smaller",
  "AI in finance: algorithmic trading, fraud detection",
  "Federated learning: training AI without sharing data",
  "The history of AI: from Turing to GPT",
]

// Alternating greetings — cycles every 20 minutes
const morningGreetings = [
  "Good morning",
  "Rise and shine",
  "A fresh start today",
  "Another beautiful morning",
  "Let's make today count",
]

const afternoonGreetings = [
  "Good afternoon",
  "Keep going strong",
  "Halfway through, still shining",
  "The afternoon is yours",
  "You're doing beautifully",
]

const eveningGreetings = [
  "Good evening",
  "What a day you've had",
  "Time to wind down",
  "You showed up today",
  "Rest well tonight",
]

export function getAlternatingGreeting(): string {
  const now = new Date()
  const hours = now.getHours()
  const minuteBlock = Math.floor((hours * 60 + now.getMinutes()) / 20)

  let pool: string[]
  if (hours < 12) pool = morningGreetings
  else if (hours < 17) pool = afternoonGreetings
  else pool = eveningGreetings

  return pool[minuteBlock % pool.length]
}

export function getTodaysQuote(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return dailyQuotes[dayOfYear % dailyQuotes.length]
}

export function getTodaysAITopic(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return aiTopics[dayOfYear % aiTopics.length]
}
