// UAE reference data used to personalise roadmaps, advice and cost estimates.
// Figures are indicative ranges for planning only — always confirm current fees
// with the relevant authority before committing money.

export const EMIRATES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
] as const
export type Emirate = (typeof EMIRATES)[number]

export const BUDGETS = [
  { id: 'lt10', label: 'Under 10,000', min: 0, max: 10_000 },
  { id: '10-50', label: '10,000 – 50,000', min: 10_000, max: 50_000 },
  { id: '50-150', label: '50,000 – 150,000', min: 50_000, max: 150_000 },
  { id: 'gt150', label: 'Over 150,000', min: 150_000, max: 400_000 },
] as const
export type BudgetId = (typeof BUDGETS)[number]['id']

export const TIMEFRAMES = [
  { id: 'lt3', label: 'Less than 3 months', weeks: 12 },
  { id: '3-6', label: '3 – 6 months', weeks: 24 },
  { id: '6-12', label: '6 – 12 months', weeks: 48 },
  { id: 'gt12', label: 'More than a year', weeks: 60 },
] as const
export type TimeframeId = (typeof TIMEFRAMES)[number]['id']

export const STAGES = [
  { id: 'student', label: 'Student' },
  { id: 'graduate', label: 'Recent graduate' },
  { id: 'professional', label: 'Working professional' },
  { id: 'other', label: 'Other' },
] as const

export interface EmirateInfo {
  authority: string
  freeZones: string[]
  ecosystem: { name: string; note: string }[]
  mainlineFee: [number, number]
  freeZoneFee: [number, number]
}

export const EMIRATE_INFO: Record<Emirate, EmirateInfo> = {
  Dubai: {
    authority: 'Dubai Department of Economy and Tourism (DET)',
    freeZones: ['IFZA', 'DMCC', 'Dubai South', 'Meydan Free Zone', 'DIFC (fintech)'],
    ecosystem: [
      { name: 'Dubai Founders HQ', note: 'Founder community, events and support programmes' },
      { name: 'Dtec (Dubai Technology Entrepreneur Campus)', note: 'Co-working and startup programmes in Dubai Silicon Oasis' },
      { name: 'Mohammed Bin Rashid Establishment for SMEs', note: 'Support and incentives for UAE national founders' },
    ],
    mainlineFee: [15_000, 30_000],
    freeZoneFee: [12_000, 25_000],
  },
  'Abu Dhabi': {
    authority: 'Abu Dhabi Department of Economic Development (ADDED)',
    freeZones: ['ADGM', 'KEZAD', 'twofour54 (media)', 'Masdar City Free Zone'],
    ecosystem: [
      { name: 'Hub71', note: 'Tech ecosystem with incentive packages for startups' },
      { name: 'Khalifa Fund', note: 'Funding and training for Emirati entrepreneurs' },
      { name: 'ADGM Tech Startup licence', note: 'Subsidised licence route for tech startups' },
    ],
    mainlineFee: [12_000, 25_000],
    freeZoneFee: [10_000, 25_000],
  },
  Sharjah: {
    authority: 'Sharjah Economic Development Department (SEDD)',
    freeZones: ['Shams (Sharjah Media City)', 'SRTIP', 'SAIF Zone', 'Sharjah Publishing City'],
    ecosystem: [
      { name: 'Sheraa', note: 'Sharjah Entrepreneurship Center — accelerator and community' },
      { name: 'Ruwad', note: 'Support for Emirati-owned SMEs in Sharjah' },
    ],
    mainlineFee: [10_000, 20_000],
    freeZoneFee: [6_000, 15_000],
  },
  Ajman: {
    authority: 'Ajman Department of Economic Development',
    freeZones: ['Ajman Free Zone', 'Ajman Media City'],
    ecosystem: [{ name: 'Ajman Chamber SME services', note: 'Guidance and networking for small businesses' }],
    mainlineFee: [9_000, 18_000],
    freeZoneFee: [6_000, 14_000],
  },
  'Ras Al Khaimah': {
    authority: 'RAK Department of Economic Development',
    freeZones: ['RAKEZ', 'RAK Digital Assets Oasis'],
    ecosystem: [{ name: 'RAKEZ startup packages', note: 'Low-cost licences aimed at small founders' }],
    mainlineFee: [9_000, 18_000],
    freeZoneFee: [6_000, 15_000],
  },
  Fujairah: {
    authority: 'Fujairah Department of Industry and Economy',
    freeZones: ['Fujairah Creative City', 'Fujairah Free Zone'],
    ecosystem: [{ name: 'Fujairah Creative City', note: 'Media and creative licences with remote setup' }],
    mainlineFee: [9_000, 18_000],
    freeZoneFee: [7_000, 15_000],
  },
  'Umm Al Quwain': {
    authority: 'UAQ Department of Economic Development',
    freeZones: ['UAQ Free Trade Zone'],
    ecosystem: [{ name: 'UAQ FTZ starter packages', note: 'Among the most affordable licence options' }],
    mainlineFee: [8_000, 16_000],
    freeZoneFee: [5_500, 13_000],
  },
}

export const fmtAED = (n: number) => `AED ${Math.round(n).toLocaleString('en-US')}`
