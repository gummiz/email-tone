# Demo Mode — Email Tone Analyzer

**Date:** 2026-06-03  
**Status:** Approved

## Problem

The deployed app authenticates with hardcoded personal Gmail tokens, meaning any visitor can read the owner's email history. The fix is to replace all live Gmail access with curated demo data, removing credentials entirely from the deployment.

## Goal

A publicly shareable portfolio demo where visitors can explore 4 fictional contacts, see realistic tone analysis, and use the email composer — with zero real data exposure.

## Architecture

### New file: `lib/demo-data.ts`

Single source of truth. Exports:
- `DEMO_CONTACTS`: array of 4 contacts (name, email, role label)
- `DEMO_EMAILS`: map of contact email → array of `EmailMessage`
- `DEMO_PROFILES`: map of contact email → tone profile object

### Modified API routes

**`/api/gmail/search/route.ts`**  
Matches the incoming `contact` string (name or email, case-insensitive substring) against `DEMO_CONTACTS`. Returns the first match or a 404 if no match. No Gmail calls.

**`/api/gmail/analyze/route.ts`**  
Looks up `DEMO_PROFILES[contact.email]` and returns it directly. No Gmail calls.

**`/api/auth/callback/google/route.ts`**  
Deleted — OAuth flow no longer needed.

### Deleted lib files

`gmail-service.ts`, `gmail-service-fixed.ts`, `gmail-client.ts`, `gmail-direct.ts`, `google-auth-wrapper.ts`, `mcp-client.ts` — all Gmail/Google auth code. `utils.ts` kept (used by UI components).

### Modified components

**`ContactSearch.tsx`**  
Adds a "Try these demo contacts" section below the info box. Four clickable chips (name + role badge). Clicking a chip fills the input and submits the search immediately.

**`ToneAnalysis.tsx`**  
Step labels updated: "Connecting to Gmail..." → "Loading email history...", "Fetching email conversations..." → "Processing email threads...". No functional change.

**`app/page.tsx`**  
Adds a small "Demo Mode" badge in the header area so visitors understand the context.

## Demo Contacts

| Name | Email | Role | Tone Profile |
|------|-------|------|-------------|
| Sarah Chen | sarah.chen@techcorp.com | Colleague | Casual-professional, "Hey Sarah", medium length |
| Marcus Klein | m.klein@consulting.de | Manager | Formal, "Dear Marcus", concise & structured |
| Lisa Brennan | l.brennan@startup.io | Client | Warm-professional, "Hi Lisa", detailed |
| Tom Hoffmann | t.hoffmann@gmail.com | Network | Very casual, "Tom,", short |

Each contact has 5–6 `EmailMessage` objects covering different subjects and dates, varied enough that the tone analysis looks meaningful.

## Tone Profile Shape

```ts
{
  formality: string          // e.g. "Professional", "Casual"
  greetingStyle: string      // e.g. "Hey Sarah,"
  closingStyle: string       // e.g. "Best regards,"
  avgLength: string          // e.g. "Medium (3–5 sentences)"
  keyPatterns: string[]      // 3 short phrases from email subjects
  overallTone: string        // "positive" | "neutral" | "professional"
}
```

## Vercel Cleanup

- Remove `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` from Vercel project env vars
- Redeploy after changes

## Out of Scope

- The "Send Email" button stays disabled (existing behavior, appropriate for demo)
- The "Generate Email" button keeps its current template logic (unchanged)
- No authentication layer added
