# HomeschoolAI Scheduler

An AI-powered homeschool pacing guide generator built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**.

Input your children's grades, curricula, schedule constraints, and date range — and get a personalized week-by-week pacing guide instantly.

---

## Features

- **Landing page** — clear product description, feature highlights, how-it-works section, and CTA
- **Schedule form** — multi-child, multi-subject input with grade selector, curriculum autocomplete, lesson counts, and date/time constraints
- **Results page** — expandable week-by-week pacing guide with lesson assignments and teaching notes; print/PDF support
- **AI scaffold** — `/api/generate-schedule` route wired to a mock pacing-guide generator, ready to swap for real OpenAI calls
- **Responsive UI** — mobile-friendly, clean amber/white design system

---

## Project Structure

```
homeschool-ai-scheduler/
├── app/
│   ├── page.tsx                     # Landing page
│   ├── layout.tsx                   # Root layout + metadata
│   ├── globals.css                  # Tailwind base styles
│   ├── schedule/
│   │   └── page.tsx                 # Schedule input form (client component)
│   ├── results/
│   │   └── page.tsx                 # Pacing guide results (client component)
│   └── api/
│       └── generate-schedule/
│           └── route.ts             # POST /api/generate-schedule
├── lib/
│   ├── types.ts                     # Shared TypeScript types
│   └── mockPacingGuide.ts           # Mock pacing guide generator
├── .env.example                     # Environment variable template
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or pnpm / yarn / bun)

### 1. Install dependencies

```bash
cd homeschool-ai-scheduler
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and add your OpenAI API key if you want real AI generation (optional — the mock generator works without it):

```env
OPENAI_API_KEY=sk-...your-key-here...
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | No (for mock) | OpenAI API key for real AI generation |
| `OPENAI_MODEL` | No | Override the model (default: `gpt-4o-mini`) |

---

## Enabling Real AI Generation

The API route at `app/api/generate-schedule/route.ts` includes a commented-out OpenAI integration scaffold. To activate it:

1. Add your `OPENAI_API_KEY` to `.env.local`
2. Open `app/api/generate-schedule/route.ts`
3. Uncomment the OpenAI client and `generateWithAI` function
4. Replace `generateMockPacingGuide(body)` with `await generateWithAI(body)` in the POST handler

The prompt sent to OpenAI asks for a structured JSON pacing guide matching the `PacingGuide` type defined in `lib/types.ts`.

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set `OPENAI_API_KEY` in your Vercel project's environment variables dashboard.

### Other platforms

This is a standard Next.js app and deploys to any platform that supports Node.js:

```bash
npm run build
npm start
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| AI SDK | `ai` + `openai` (Vercel AI SDK) |
| Deployment | Vercel-ready |

---

## Roadmap

- [ ] Real OpenAI integration with structured output
- [ ] Export to PDF / CSV / Google Calendar
- [ ] Printable daily schedule view
- [ ] User accounts and saved schedules (database)
- [ ] Curriculum library with pre-filled lesson counts
- [ ] Drag-and-drop schedule reordering
