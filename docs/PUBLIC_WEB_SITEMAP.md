# DSOBA Public Web — Content Preparation Sitemap

Status: Content-planning baseline  
Default language: English  
Secondary language: zh-HK  
Content source for initial build: structured local content; CMS/API integration follows later.

Editorial source note: AD104 is the 2025 archive/review booklet supplied by the Association. Its
condensed annual-dinner, chapter, function and sports summaries are included in the local Public
Web data. AD105 is the 2026 edition and remains a clearly labelled provisional/dummy preview until
the Association supplies its content; it does not replace the AD104 archive.

Editorial decisions confirmed 2 October 2026: booklet images may be reused on the site; the
Matthias Der, Ronnie HM and Dr Daphne Ho articles are excluded from the Public Web copy; AD104 is
published as “AD104 104th Anniversary Dinner” on 29 November 2025.

## Global content

- Association name, logo, crest and favicon
- English and zh-HK navigation labels
- Footer description and copyright line
- Social links
- Contact email, phone and office address
- Privacy policy URL and terms URL
- Cookie/analytics statement, if required
- 404 and generic error copy

## Primary sitemap

| Route | Page | Content to prepare | Current status |
| --- | --- | --- | --- |
| `/` | Home | Hero, mission, latest news, featured event, membership CTA, chapters CTA, principal message | Built with structured content |
| `/about` | About DSOBA | History, mission, values, president/chair message, governance, school relationship, milestones | Built; copy is representative |
| `/about/history` | History | Timeline, archival photographs, milestone descriptions | Local structure built; archive copy pending |
| `/about/governance` | Governance | Office bearers, committee structure, role descriptions, term dates | Local structure built; names pending |
| `/news` | News listing | Categories, dates, summaries, cover images, filters and pagination | Built with local content |
| `/news/:slug` | News detail | Title, date, author, category, hero image, body, gallery, related articles | Built with local content |
| `/events` | Events listing | Upcoming/past filters, category, date, venue, registration status | Built with local content |
| `/events/:slug` | Event detail | Description, schedule, venue, fee, capacity, organiser, registration CTA, FAQs | Built with local content; registration pending |
| `/events/:slug/register` | Public event registration | Registration fields, consent, confirmation and cancellation information | Local staging form built; API pending |
| `/chapters` | Chapters listing | Professional, overseas, interests, contact/lead information | Built with local content |
| `/chapters/:slug` | Chapter detail | Description, committee/contact, activities, joining instructions, upcoming events | Local structure built; convenor content pending |
| `/membership` | Membership overview | Youth, Trial, Life, Life (Youth), fees, voting record, eligibility and lifecycle | Built; requires final approved copy |
| `/membership/eligibility` | Eligibility | DBS/DPS attendance, manual GenCom review, age rules, required documents | Local structure built; final policy copy pending |
| `/membership/fees` | Fees | Life fee, payment explanation, refund/verification notes | Local structure built; final policy copy pending |
| `/membership/apply` | Application | Four-step application, photo rules, consent, membership type recommendation | Built and locally tested |
| `/membership/resume` | Resume application | Secure resume-link landing and status guidance | Implemented through application query flow; dedicated page optional |
| `/contact` | Contact | Office details, enquiry categories, response expectations, map/link | Built; copy is representative |
| `/privacy` | Privacy policy | Data collected, purpose, directory privacy, retention, rights, contact | Staging structure built; legal review required |
| `/terms` | Terms and conditions | Site use, membership application, events, acceptable use and disclaimers | Staging structure built; legal review required |
| `/accessibility` | Accessibility statement | Supported browsers, keyboard access, contact route, known limitations | Local structure built; final statement pending |

## Content package per page

Prepare these fields for every page:

- Page title and SEO title
- Meta description
- English body copy
- zh-HK translation
- Hero/thumbnail image and alt text
- Related links
- Publication status and date
- Content owner and approver
- Review/expiry date where applicable

## Media package

- Logo and crest in SVG/PNG
- Hero images with licences/credits (AD104 booklet images approved for reuse; retain source credit)
- News and event images with alt text
- Historical/archive images with captions and dates
- Author headshots and biographies
- Chapter or venue images
- Recommended desktop, tablet and mobile crops

## Approval checklist

- English copy approved
- zh-HK translation approved
- Names, dates and fees verified
- Image rights and credits recorded
- Personal data and directory content reviewed
- Legal pages approved by the Association
- CTA destination confirmed
- Content owner assigned
