// Foundora's built-in startup advisor. It matches the question to a topic and
// composes advice personalised with the founder's profile (idea, customer,
// emirate, budget, timeline). Each reply can suggest an assumption/evidence
// pair for the Evidence Tracker and a concrete next step on the roadmap.

import type { Profile } from './roadmap'
import { BUDGETS, EMIRATE_INFO, TIMEFRAMES, fmtAED } from './uae'

export interface Reply {
  text: string
  evidence?: { assumption: string; evidence: string }
  next?: { text: string; to: string }
}

type Topic = {
  id: string
  keys: string[]
  answer: (p: Profile | null, q: string) => Reply
}

const ideaOf = (p: Profile | null) => p?.idea?.trim() || 'your idea'
const custOf = (p: Profile | null) => p?.customer?.trim() || 'your target customers'
const emOf = (p: Profile | null) => p?.emirate ?? 'Dubai'

const TOPICS: Topic[] = [
  {
    id: 'demand',
    keys: ['demand', 'market', 'trend', 'popular', 'need', 'size', 'growing', 'opportunity', 'will people'],
    answer: (p, q) => {
      const subject = q.match(/demand for (an? )?(.+?)(\?|$| in the uae)/i)?.[2] ?? ideaOf(p)
      return {
        text:
          `Great question! The UAE is one of the most attractive markets in the region for new ideas — a young, digitally-connected, high-spending population with over 85% expatriates and strong government support for SMEs.\n\n` +
          `For **${subject}**, desk research can only tell you so much. To judge real demand:\n` +
          `1. **Search signals** — check Google Trends (region: UAE) and Instagram hashtags for your category.\n` +
          `2. **Competitor signals** — if similar businesses exist and are busy, demand is proven; your job is to differentiate.\n` +
          `3. **Customer signals** — the strongest evidence is ${custOf(p)} telling you how they solve this today and what they spend.\n\n` +
          `I'd treat "there is demand" as an assumption until you have customer evidence. Would you like an interview script to test it?`,
        evidence: { assumption: `There is strong demand for ${subject} in the UAE`, evidence: 'To test: 5 customer interviews + landing-page sign-up rate' },
        next: { text: 'Interview at least 5 potential customers to validate your product concept.', to: '/validate' },
      }
    },
  },
  {
    id: 'customer',
    keys: ['customer', 'audience', 'target', 'who should', 'persona', 'niche', 'segment', 'first customers'],
    answer: (p) => ({
      text:
        `Start narrow. "${custOf(p)}" is a good starting point — now make it specific enough that you could find 20 of them this week.\n\n` +
        `A useful template: **[who] in [emirate/area] who [situation] and currently [workaround]**.\n` +
        `For example: "University students in ${emOf(p)} who buy fashion online monthly and care about sustainability but find eco brands too expensive."\n\n` +
        `Signs you've found the right first segment:\n• They feel the problem often and painfully\n• They already spend money or time on a workaround\n• You can reach them cheaply (campus, community groups, social media)`,
      evidence: { assumption: `${custOf(p)} actively feel the problem ${ideaOf(p)} solves`, evidence: 'To test: ask about the last time they experienced it' },
      next: { text: 'Complete "Define your customer" on your roadmap.', to: '/roadmap/define-customer' },
    }),
  },
  {
    id: 'license',
    keys: ['licen', 'legal', 'register', 'trade', 'free zone', 'freezone', 'mainland', 'company setup', 'permit', 'visa', 'freelance'],
    answer: (p) => {
      const em = emOf(p)
      const info = EMIRATE_INFO[em]
      return {
        text:
          `In ${em} you have three main routes:\n\n` +
          `**1. Mainland licence** — issued by the ${info.authority}. Lets you trade anywhere in the UAE mainland; typical setup is roughly ${fmtAED(info.mainlineFee[0])}–${fmtAED(info.mainlineFee[1])} depending on activity and office.\n\n` +
          `**2. Free zone licence** — e.g. ${info.freeZones.join(', ')}. Packages often bundle licence + visa + flexi-desk, roughly ${fmtAED(info.freeZoneFee[0])}–${fmtAED(info.freeZoneFee[1])}. Great for online, service and international businesses.\n\n` +
          `**3. Freelance permit** — the cheapest way to start if you're a solo service provider (design, consulting, content).\n\n` +
          `Rule of thumb: if most customers are UAE consumers buying in person, look at mainland; if you sell online, B2B or abroad, a free zone is usually simpler. Fees change often — always confirm with the authority before paying.`,
        next: { text: 'Compare setup costs in the Cost Estimator.', to: '/costs' },
      }
    },
  },
  {
    id: 'costs',
    keys: ['cost', 'budget', 'expens', 'how much', 'money need', 'spend', 'cheap', 'afford', 'runway', 'break even', 'break-even'],
    answer: (p) => {
      const b = BUDGETS.find((x) => x.id === p?.budget)
      return {
        text:
          `${b ? `With a budget of **AED ${b.label}**, ` : ''}split your costs into two buckets:\n\n` +
          `**One-off:** licence & registration, visa (if needed), website/branding, initial stock or equipment, launch marketing.\n` +
          `**Monthly:** workspace, software, marketing, salaries, licence renewal set-aside.\n\n` +
          `Then calculate:\n• **Runway** = cash after one-off costs ÷ monthly costs\n• **Break-even** = monthly fixed costs ÷ (price − variable cost per sale)\n\n` +
          `Example: AED 9,000 fixed costs, AED 59 price and AED 14 variable cost → 9,000 ÷ 45 = **200 sales/month** to break even.\n\n` +
          `Keep at least 3 months of runway in reserve. The Cost Estimator does this maths for you.`,
        next: { text: 'Open the Cost Estimator and build your budget.', to: '/costs' },
      }
    },
  },
  {
    id: 'pricing',
    keys: ['price', 'pricing', 'charge', 'how much should', 'subscription', 'margin'],
    answer: (p) => ({
      text:
        `Pricing for ${ideaOf(p)} should come from three anchors:\n\n` +
        `1. **Cost floor** — your variable cost per unit plus a share of fixed costs.\n` +
        `2. **Competitor range** — what ${custOf(p)} pay today for alternatives.\n` +
        `3. **Value ceiling** — what the problem costs them in time or money.\n\n` +
        `Test before you commit: show two price points on your landing page (or in interviews ask "what would make this too expensive?"). In the UAE, consider VAT (5%) — if you expect to pass AED 375,000 in taxable annual turnover you must register.`,
      evidence: { assumption: `${custOf(p)} will pay my target price`, evidence: 'To test: pre-orders or deposits at that price' },
      next: { text: 'Run a pricing test as part of "Test your offer".', to: '/roadmap/test-offer' },
    }),
  },
  {
    id: 'validate',
    keys: ['validat', 'test', 'interview', 'survey', 'feedback', 'mvp', 'prototype', 'experiment', 'prove'],
    answer: (p) => ({
      text:
        `Validation is about collecting **evidence**, not opinions. A simple sequence for ${ideaOf(p)}:\n\n` +
        `1. **Interviews (week 1–2)** — 5+ conversations with ${custOf(p)}. Ask about past behaviour: "Tell me about the last time…"\n` +
        `2. **Smoke test (week 2–3)** — a landing page, Instagram page or WhatsApp catalogue with a clear offer and call-to-action.\n` +
        `3. **Commitment test** — pre-orders, deposits or a waitlist. Set a success threshold *before* you start.\n\n` +
        `Log every result in the Evidence Tracker so you can make a clear persevere / pivot decision.`,
      evidence: { assumption: `${custOf(p)} will take action (sign up / pre-order) for ${ideaOf(p)}`, evidence: 'To test: smoke-test landing page, target 10% conversion' },
      next: { text: 'Generate your interview script in Validation Tools.', to: '/validate' },
    }),
  },
  {
    id: 'funding',
    keys: ['fund', 'invest', 'grant', 'loan', 'capital', 'raise', 'angel', 'vc', 'accelerat', 'incubat'],
    answer: (p) => {
      const info = EMIRATE_INFO[emOf(p)]
      return {
        text:
          `Most first-time founders should **validate first, raise later** — evidence of paying customers makes every funding conversation easier.\n\n` +
          `Options to explore in ${emOf(p)}:\n` +
          info.ecosystem.map((e) => `• **${e.name}** — ${e.note}`).join('\n') +
          `\n\nAcross the UAE also look at university entrepreneurship centres, startup competitions, and angel networks. Bootstrapping with pre-sales is often the fastest route for small budgets.`,
        next: { text: 'Browse funding & ecosystem resources.', to: '/resources' },
      }
    },
  },
  {
    id: 'marketing',
    keys: ['market', 'promot', 'advert', 'instagram', 'tiktok', 'social', 'brand', 'launch', 'grow', 'reach', 'sell'],
    answer: (p) => ({
      text:
        `For ${custOf(p)} in the UAE, the highest-leverage early channels are usually:\n\n` +
        `• **Instagram & TikTok** — short videos showing the problem and your solution.\n` +
        `• **Communities** — university clubs, WhatsApp/Facebook community groups, local events and pop-up markets.\n` +
        `• **Micro-influencers** — 5–50k followers, often paid in product.\n` +
        `• **Bilingual content** — Arabic + English widens your reach and builds trust.\n\n` +
        `Pick two channels, measure cost per customer, and double down on the winner. Remember: advertising in the UAE may need a permit for paid influencer promotion — check current rules.`,
      next: { text: 'Draft your launch plan.', to: '/roadmap/launch-plan' },
    }),
  },
  {
    id: 'competitors',
    keys: ['competit', 'rival', 'differen', 'unique', 'usp', 'alternative'],
    answer: (p) => ({
      text:
        `Competition is a good sign — it proves demand. To stand out with ${ideaOf(p)}:\n\n` +
        `1. List 3–5 direct competitors and 2–3 substitutes (what people do instead).\n` +
        `2. For each, note price, target customer, strengths and the most common complaint in their reviews.\n` +
        `3. Find the gap: a segment they ignore, a pain they create, or a UAE-specific need (language, delivery, culture, price).\n\n` +
        `Your USP should be something customers care about *and* is hard to copy quickly.`,
      evidence: { assumption: `${custOf(p)} are unhappy enough with current alternatives to switch`, evidence: 'To test: ask interviewees what frustrates them about current options' },
      next: { text: 'Sharpen your value proposition.', to: '/roadmap/value-prop' },
    }),
  },
  {
    id: 'time',
    keys: ['time', 'how long', 'timeline', 'part time', 'part-time', 'study', 'job', 'weeks', 'months'],
    answer: (p) => {
      const t = TIMEFRAMES.find((x) => x.id === p?.timeframe)
      return {
        text:
          `${t ? `You've told me you have **${t.label.toLowerCase()}**. ` : ''}Your roadmap spreads the steps over that window. Practical tips if you're studying or working:\n\n` +
          `• Block 2 focused sessions per week (e.g. 2 hours each) and one task per session.\n` +
          `• Batch interviews into one or two days.\n` +
          `• Use no-code tools (Instagram, Linktree, Google Forms, Shopify, Carrd) instead of custom builds.\n` +
          `• Check your employment contract and visa terms before starting a side business.`,
        next: { text: 'View your roadmap and timeline.', to: '/dashboard' },
      }
    },
  },
  {
    id: 'arabic',
    keys: ['arabic', 'language', 'translat', 'local', 'culture', 'ramadan'],
    answer: () => ({
      text:
        `Localisation matters in the UAE. Consider:\n\n` +
        `• **Bilingual branding** — Arabic + English on your site, packaging and social media.\n` +
        `• **Seasonality** — Ramadan, Eid, National Day (2 December), back-to-school and summer all change buying behaviour.\n` +
        `• **Weekend** — the UAE weekend is Saturday–Sunday (Friday half-day for government).\n` +
        `• **Payment** — Apple Pay, cards and cash-on-delivery are all common; BNPL like Tabby and Tamara is popular with 18–35s.`,
    }),
  },
]

const GREETING = /^(hi|hello|hey|salam|marhaba|good (morning|evening|afternoon))\b/i

export function answer(question: string, profile: Profile | null): Reply {
  const q = question.toLowerCase()
  if (GREETING.test(q.trim()) && q.length < 30) {
    return {
      text: `Hello${profile?.name ? ` ${profile.name}` : ''}! 👋 I'm your Foundora assistant. Ask me about demand, customers, pricing, licensing in ${emOf(profile)}, costs, funding or marketing for ${ideaOf(profile)}.`,
    }
  }
  let best: Topic | null = null
  let bestScore = 0
  for (const t of TOPICS) {
    const score = t.keys.reduce((s, k) => s + (q.includes(k) ? k.length : 0), 0)
    if (score > bestScore) {
      best = t
      bestScore = score
    }
  }
  if (best) return best.answer(profile, question)
  return {
    text:
      `Good question. I don't have a specific playbook for that yet, but here's how I'd approach it for ${ideaOf(profile)}:\n\n` +
      `1. Turn the question into an assumption you can test.\n2. Decide what evidence would prove or disprove it.\n3. Run the cheapest test that produces that evidence.\n\n` +
      `You can also ask me about **demand, customers, pricing, licensing, costs, funding, competitors, marketing or timelines** — or book a specialist consultation for in-depth help.`,
    next: { text: 'See specialist consultation options.', to: '/pricing' },
  }
}

export const SUGGESTIONS = [
  'Is there demand for my idea in the UAE?',
  'Which licence should I get?',
  'How much will it cost to start?',
  'How should I price my product?',
  'How do I validate my idea?',
  'Where can I find funding?',
]
