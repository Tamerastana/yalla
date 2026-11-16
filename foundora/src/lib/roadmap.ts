import { BUDGETS, EMIRATE_INFO, TIMEFRAMES, type BudgetId, type Emirate, type TimeframeId } from './uae'

export interface Profile {
  name: string
  idea: string
  customer: string
  emirate: Emirate
  budget: BudgetId
  timeframe: TimeframeId
  stage: string
  createdAt: string
}

export type StageId = 'plan' | 'validate' | 'prepare' | 'launch' | 'grow'
export const STAGE_LABELS: Record<StageId, string> = {
  plan: 'Plan',
  validate: 'Validate',
  prepare: 'Prepare',
  launch: 'Launch',
  grow: 'Grow',
}
export const STAGE_ORDER: StageId[] = ['plan', 'validate', 'prepare', 'launch', 'grow']

export type StepIcon = 'users' | 'message' | 'flask' | 'calculator' | 'rocket' | 'target' | 'landmark' | 'megaphone' | 'chart'
export type ToolLink = { label: string; to: string }

export interface Step {
  id: string
  stage: StageId
  title: string
  summary: string
  icon: StepIcon
  tone: 'coral' | 'teal' | 'violet' | 'green' | 'amber'
  why: string
  tasks: { id: string; text: string }[]
  tip: string
  tool?: ToolLink
  weeks: number
}

const short = (s: string, n = 60) => (s.length > n ? s.slice(0, n).trimEnd() + '…' : s)

export function buildRoadmap(p: Profile): Step[] {
  const idea = short(p.idea || 'your idea')
  const customer = short(p.customer || 'your target customer', 50)
  const info = EMIRATE_INFO[p.emirate]
  const budget = BUDGETS.find((b) => b.id === p.budget)!
  const time = TIMEFRAMES.find((t) => t.id === p.timeframe)!
  const lean = budget.max <= 10_000
  const fast = time.weeks <= 12

  // Spread the available weeks across the 9 steps proportionally.
  const base = [1, 1, 2, 2, 1, 1, 2, 2, 2]
  const scale = time.weeks / 14
  const w = base.map((b) => Math.max(1, Math.round(b * scale)))

  return [
    {
      id: 'define-customer',
      stage: 'plan',
      title: 'Define your customer',
      summary: 'Understand who really needs your solution.',
      icon: 'users',
      tone: 'coral',
      why: `Most first-time startups fail because they build for "everyone". Narrowing "${customer}" into one specific, reachable group makes every later step — interviews, pricing, marketing — easier.`,
      tasks: [
        { id: 't1', text: `Write a one-sentence description of your ideal customer (e.g. age, emirate, situation).` },
        { id: 't2', text: `List the top 3 problems ${customer} face that "${idea}" solves.` },
        { id: 't3', text: 'Write down how they solve those problems today (current alternatives).' },
        { id: 't4', text: 'Identify 2 places (online or offline in the UAE) where you can find these people.' },
      ],
      tip: 'University clubs, LinkedIn groups, Instagram communities and Facebook expat groups are fast ways to reach UAE residents aged 18–35.',
      tool: { label: 'Ask the assistant', to: '/assistant?q=Who should my first customers be?' },
      weeks: w[0],
    },
    {
      id: 'value-prop',
      stage: 'plan',
      title: 'Sharpen your value proposition',
      summary: 'Say what you do and why it matters in one line.',
      icon: 'target',
      tone: 'amber',
      why: 'A crisp value proposition is the foundation of your landing page, pitch and interview script.',
      tasks: [
        { id: 't1', text: 'Fill in: "We help [customer] to [outcome] by [how], unlike [alternative]."' },
        { id: 't2', text: 'List 3 competitors or substitutes and one way you are different from each.' },
        { id: 't3', text: 'Pick the single riskiest assumption your idea depends on.' },
      ],
      tip: 'Add your riskiest assumption to the Evidence Tracker — the Validate stage is all about testing it.',
      tool: { label: 'Open Evidence Tracker', to: '/validate' },
      weeks: w[1],
    },
    {
      id: 'interviews',
      stage: 'validate',
      title: 'Interview 5 potential customers',
      summary: 'Get real feedback from your target audience.',
      icon: 'message',
      tone: 'teal',
      why: 'Five honest conversations reveal more than weeks of desk research. You are looking for pain, current spending and willingness to switch — not compliments.',
      tasks: [
        { id: 't1', text: 'Generate your interview script in the Validation Tools.' },
        { id: 't2', text: 'Book 5 short (15–20 min) conversations with people who match your customer profile.' },
        { id: 't3', text: 'Log every interview and its key quote in Foundora.' },
        { id: 't4', text: 'Update your Evidence Tracker: which assumptions were supported or refuted?' },
      ],
      tip: 'Ask about the past ("When did you last…?"), not the future ("Would you buy…?"). People are kind about hypotheticals and honest about history.',
      tool: { label: 'Open interview tools', to: '/validate' },
      weeks: w[2],
    },
    {
      id: 'test-offer',
      stage: 'validate',
      title: 'Test your offer',
      summary: 'Validate your idea with a simple test.',
      icon: 'flask',
      tone: 'violet',
      why: 'Interviews show interest; a test shows behaviour. Ask people to take a small real action — sign up, pre-order, or pay a deposit.',
      tasks: [
        { id: 't1', text: lean ? 'Create a free landing page or Instagram page describing your offer.' : 'Build a simple landing page with a clear price and a sign-up / pre-order button.' },
        { id: 't2', text: 'Share it with at least 50 people from your target group.' },
        { id: 't3', text: 'Set a success target before you start (e.g. 10% sign up).' },
        { id: 't4', text: 'Record the result as evidence and decide: persevere, pivot or stop.' },
      ],
      tip: 'A WhatsApp Business catalogue or an Instagram story with a "DM to pre-order" call-to-action is a zero-cost test that works well in the UAE.',
      tool: { label: 'Ask about testing', to: '/assistant?q=How can I test my offer cheaply?' },
      weeks: w[3],
    },
    {
      id: 'costs',
      stage: 'prepare',
      title: 'Estimate startup costs',
      summary: 'Plan your budget and resources.',
      icon: 'calculator',
      tone: 'green',
      why: `Your budget is ${budget.label} AED. Knowing your one-off and monthly costs tells you your runway and break-even point before you spend a dirham.`,
      tasks: [
        { id: 't1', text: 'Use the Cost Estimator to calculate licence, visa, office and launch costs.' },
        { id: 't2', text: 'Estimate your monthly running costs and how many months of runway you have.' },
        { id: 't3', text: 'Calculate your break-even point: fixed costs ÷ (price − variable cost).' },
      ],
      tip: lean
        ? 'With a smaller budget, a freelance permit or a low-cost free zone package can cut setup costs significantly.'
        : 'Keep at least 3 months of running costs in reserve before launch.',
      tool: { label: 'Open Cost Estimator', to: '/costs' },
      weeks: w[4],
    },
    {
      id: 'license',
      stage: 'prepare',
      title: `Choose your licence in ${p.emirate}`,
      summary: 'Pick a legal structure and licensing route.',
      icon: 'landmark',
      tone: 'amber',
      why: `In ${p.emirate}, mainland licences are issued by the ${info.authority}. Free zones such as ${info.freeZones.slice(0, 3).join(', ')} offer packaged licences, often with 100% foreign ownership and simpler setup.`,
      tasks: [
        { id: 't1', text: 'Decide mainland vs free zone vs freelance permit based on who you will sell to.' },
        { id: 't2', text: 'Shortlist 2–3 licence packages and compare their activities, fees and visa quotas.' },
        { id: 't3', text: 'Check your trade name availability and required business activity codes.' },
        { id: 't4', text: 'Open a business bank account plan (list the documents banks will need).' },
      ],
      tip: 'Free zone companies generally sell within the free zone or internationally; serving UAE mainland customers directly may need a mainland licence or a distributor — check with the authority.',
      tool: { label: 'Ask about licensing', to: `/assistant?q=Which licence should I get in ${p.emirate}?` },
      weeks: w[5],
    },
    {
      id: 'launch-plan',
      stage: 'launch',
      title: 'Draft your launch plan',
      summary: 'Prepare for a successful launch.',
      icon: 'rocket',
      tone: 'coral',
      why: fast
        ? 'Your timeline is under 3 months, so plan a focused soft launch with the smallest possible version of your product.'
        : 'A written launch plan keeps you focused on the few channels and metrics that matter.',
      tasks: [
        { id: 't1', text: 'Define your MVP: the smallest product that delivers your core promise.' },
        { id: 't2', text: 'Pick 2 launch channels where your customers already spend time.' },
        { id: 't3', text: 'Set a launch goal (e.g. first 10 paying customers in 30 days).' },
        { id: 't4', text: 'Prepare launch content in English and Arabic.' },
      ],
      tip: 'Your interviewees are your first launch list — invite them personally.',
      tool: { label: 'Ask about marketing', to: '/assistant?q=How should I market my launch in the UAE?' },
      weeks: w[6],
    },
    {
      id: 'first-customers',
      stage: 'launch',
      title: 'Win your first 10 customers',
      summary: 'Sell, deliver and learn from real buyers.',
      icon: 'megaphone',
      tone: 'teal',
      why: 'The first 10 customers teach you how to sell, what to charge and what to fix.',
      tasks: [
        { id: 't1', text: 'Personally reach out to everyone who signed up during your offer test.' },
        { id: 't2', text: 'Collect a testimonial or feedback from every customer.' },
        { id: 't3', text: 'Track acquisition cost and conversion for each channel.' },
      ],
      tip: 'Do things that do not scale at first — hand-delivered service builds word of mouth.',
      weeks: w[7],
    },
    {
      id: 'grow',
      stage: 'grow',
      title: 'Measure, improve and grow',
      summary: 'Double down on what works.',
      icon: 'chart',
      tone: 'green',
      why: `Once you have paying customers, programmes in ${p.emirate} such as ${info.ecosystem.map((e) => e.name).slice(0, 2).join(' and ')} can help you scale.`,
      tasks: [
        { id: 't1', text: 'Pick 3 metrics to review weekly (e.g. revenue, repeat customers, cost per customer).' },
        { id: 't2', text: 'Run one improvement experiment per month based on customer feedback.' },
        { id: 't3', text: 'Apply to at least one UAE accelerator, incubator or grant programme.' },
      ],
      tip: 'Premium members can book a specialist consultation for a business plan review before applying to programmes.',
      tool: { label: 'Browse resources', to: '/resources' },
      weeks: w[8],
    },
  ]
}
