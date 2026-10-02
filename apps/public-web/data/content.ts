import type { ChapterItem, EventItem, NewsItem } from '~/types/content'
import { ad104Chapters, ad104Events, ad104News } from './ad104'

// AD105 (2026) preview entries remain intentionally provisional until the
// Association supplies the final programme and editorial copy.
const ad105News: NewsItem[] = [
  { slug: 'president-note', title: 'President’s mid-year note', date: '18 June 2026', category: 'AD105 preview · Association', excerpt: 'On reconnecting, supporting the school and carrying our shared purpose forward.', image: '/assets/samuel-tak-lee-building.jpg', body: ['Our association is strongest when every generation has a place at the table. This year, we are renewing the ways Old Boys meet, serve and stay informed.', 'This AD105 preview contains representative editorial copy only. Confirmed announcements will come from the future CMS and API.'] },
  { slug: 'annual-volunteers', title: 'Annual Dinner committee welcomes volunteers', date: '8 June 2026', category: 'AD105 preview · Annual Dinner', excerpt: 'Help shape this year’s landmark gathering and community showcase.', image: '/assets/chapter-dinner-event.jpeg', body: ['Volunteers will support guest experience, programme coordination and community storytelling.'] },
  { slug: 'dragonboat-win', title: 'Dragon Boat Team brings home an award', date: '23 May 2026', category: 'AD105 preview · Sports', excerpt: 'A brilliant result built on training, teamwork and alumni support.', image: '/assets/dragonboat-award.jpeg', body: ['The team celebrated a strong season together with supporters from across the alumni community.'] },
]

const ad105Events: EventItem[] = [
  { slug: 'annual-dinner', title: '105th Annual Dinner', date: '28 November 2026', category: 'AD105 preview · Annual Dinner', venue: 'Grand Ballroom, Hopewell Hotel', excerpt: 'Our landmark annual gathering, bringing generations together.', image: '/assets/annual-dinner-venue.jpg', status: 'Preview listing' },
  { slug: 'summer-happy-hour', title: 'Summer Alumni Happy Hour', date: '7 August 2026', category: 'AD105 preview · Social', venue: 'Central, Hong Kong', excerpt: 'An easy evening for alumni across years and professions.', image: '/assets/happy-hour-event.jpeg', status: 'Preview listing' },
  { slug: 'service-day', title: 'DSOBA Charity Service Day', date: '24 October 2026', category: 'AD105 preview · Community', venue: 'Kowloon Community Centre', excerpt: 'Alumni and families serving the community together.', image: '/assets/charity-service-event.jpeg', status: 'Preview listing' },
]

const ad105Chapters: ChapterItem[] = [
  { name: 'Overseas Chapters', type: 'AD105 preview · Around the world', description: 'Keep close to DSOBA while living and working abroad.' },
  { name: 'Music & Sports', type: 'AD105 preview · Shared interests', description: 'Meet through rehearsals, teams, competitions and family-friendly activities.' },
]

export const news: NewsItem[] = [...ad105News, ...ad104News]
export const events: EventItem[] = [...ad105Events, ...ad104Events]
export const chapters: ChapterItem[] = [...ad104Chapters, ...ad105Chapters]
export const whatsNew = [
  { date: '18 JUN', title: 'President’s mid-year note · AD105 preview', to: '/news/president-note' },
  { date: '08 JUN', title: 'Annual Dinner volunteers invited · AD105 preview', to: '/news/annual-volunteers' },
  { date: '28 NOV', title: '105th Annual Dinner · AD105 preview', to: '/events/annual-dinner' },
  { date: '29 NOV', title: 'AD104: The Global Assembly · 2025 archive', to: '/news/ad104-global-assembly' },
]
