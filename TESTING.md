# FormRelay — QA Testing Guide

**Plain English. Works for humans and LLM testers alike.**

---

## Quick start

- **App URL:** `http://localhost:3000`
- **Demo account:** `demo@formrelay.local` / `demo12345`
- **Start the app:** `npm run dev` (requires Docker running for the database)
- **Start the database:** `docker-compose up -d postgres`

---

## Table of contents

1. [Auth — Sign up, Log in, Forgot password](#1-auth)
2. [Marketing pages](#2-marketing-pages)
3. [Onboarding flow](#3-onboarding-flow)
4. [Dashboard overview](#4-dashboard-overview)
5. [Websites — create and manage](#5-websites)
6. [Forms — create and manage](#6-forms)
7. [Form detail — Connect tab & AI prompt](#7-form-detail--connect-tab)
8. [Form submissions — receiving real data](#8-receiving-a-real-submission)
9. [Submissions inbox — viewing and managing](#9-submissions-inbox)
10. [Spam — review and recovery](#10-spam)
11. [Security — blocked events](#11-security)
12. [Settings — account](#12-settings)
13. [Billing page](#13-billing)
14. [Responsiveness — mobile & tablet](#14-responsiveness)
15. [Edge cases and error states](#15-edge-cases-and-error-states)
16. [API — form endpoint directly](#16-api--form-endpoint-directly)

---

## 1. Auth

### Sign up

| Step | What to do | What should happen |
|------|------------|-------------------|
| 1 | Go to `/signup` | Page shows "Create your account" with email + password + name fields |
| 2 | Leave all fields blank and click "Create account" | Error message appears — do not proceed |
| 3 | Enter an invalid email (e.g. `notanemail`) | Error about invalid email format |
| 4 | Enter a password shorter than 8 characters | Error about password length |
| 5 | Fill in valid name, email, strong password and submit | Redirects to `/dashboard` and sidebar shows the workspace name |
| 6 | Try signing up again with the same email | Error: "Email already registered" or similar |

### Log in

| Step | What to do | What should happen |
|------|------------|-------------------|
| 1 | Go to `/login` | Clean centered login form |
| 2 | Submit empty form | Validation errors appear |
| 3 | Enter wrong password | Error: "Invalid credentials" or similar |
| 4 | Enter `demo@formrelay.local` / `demo12345` | Redirects to `/dashboard` |
| 5 | While logged in, visit `/login` | Should redirect to `/dashboard` |

### Forgot password

| Step | What to do | What should happen |
|------|------------|-------------------|
| 1 | Go to `/forgot-password` | Shows email field + "Send reset link" button |
| 2 | Submit with empty field | Validation error |
| 3 | Submit with a valid email | Success message: "Check your inbox" (email sends in production; in dev it may log to console) |
| 4 | Click "Sign in" link at bottom | Goes to `/login` |

### Log out

| Step | What to do | What should happen |
|------|------------|-------------------|
| 1 | In sidebar, click "Sign out" | Redirects to `/login` |
| 2 | Try visiting `/dashboard` after logout | Redirected back to `/login` |

---

## 2. Marketing pages

### Homepage (`/`)

| What to check | Expected |
|--------------|----------|
| Header shows logo, "How it works", "Pricing", "Docs" links | ✓ |
| "Start free" button in header goes to `/signup` | ✓ |
| Hero headline is big and bold | ✓ |
| Both CTA buttons are clickable: "Start free — no credit card" → `/signup`, "See how it works" → scrolls to the how it works section | ✓ |
| Three trust bullets appear under the CTAs | ✓ |
| Product UI mockup renders below the hero | ✓ |
| Builders bar shows platform names (Webflow, Framer, etc.) | ✓ |
| "How it works" section shows 3 numbered steps | ✓ |
| Features section shows 6 cards | ✓ |
| Testimonials section shows 3 quote cards with star ratings | ✓ |
| Pricing preview shows 3 plan cards — Pro card is dark | ✓ |
| "View full pricing" link goes to `/pricing` | ✓ |
| Final CTA dark banner has "Get started free" and "View pricing" buttons | ✓ |
| Footer shows 4 columns with links | ✓ |

### Pricing page (`/pricing`)

| What to check | Expected |
|--------------|----------|
| Page loads at `/pricing` | ✓ |
| Three plan cards: Starter (Free), Pro ($29), Agency ($99) | ✓ |
| Pro card has dark background and "Most popular" badge | ✓ |
| Each plan shows its included features with green checkmarks | ✓ |
| Missing features shown with grey X marks | ✓ |
| "Start free", "Start Pro", "Start Agency" buttons go to `/signup` | ✓ |
| Feature comparison table renders with all rows | ✓ |
| FAQ section shows 6 questions with answers | ✓ |
| Final CTA banner at the bottom | ✓ |

### Docs page (`/docs`)

| What to check | Expected |
|--------------|----------|
| Page loads at `/docs` | ✓ |
| Shows 3 documentation cards | ✓ |

---

## 3. Onboarding flow

The onboarding page tracks 3 steps: adding a website, creating a form, and receiving a submission.

| Step | What to do | What should happen |
|------|------------|-------------------|
| 1 | Log in with a fresh account (no data) | Sidebar shows a blue "Complete setup" pill at the top |
| 2 | Click "Complete setup" in sidebar | Goes to `/dashboard/onboarding` |
| 3 | Check the progress bar | Shows 0/3 or X/3 depending on what's done |
| 4 | Click each step card | Links to the relevant page (add website, create form, etc.) |
| 5 | Complete all 3 steps | Progress bar shows 3/3, green "You're all set!" banner appears, step cards show green checkmarks and strikethrough titles |
| 6 | Once all 3 done | The blue "Complete setup" nudge disappears from sidebar |

---

## 4. Dashboard overview

Go to `/dashboard`.

| What to check | Expected |
|--------------|----------|
| Greeting shows "Welcome back, [Name]" | ✓ |
| 4 stat cards: Websites, Forms, Submissions, Spam Blocked — show real counts | ✓ |
| "Websites" card lists websites with form counts and submission counts | ✓ |
| "Recent submissions" card shows latest entries | ✓ |
| If account has no websites yet, an empty state with a CTA to add one appears | ✓ |

---

## 5. Websites

### Creating a website

| Step | What to do | What should happen |
|------|------------|-------------------|
| 1 | In sidebar click "Websites", then "+ Add website" | Goes to `/dashboard/websites/new` |
| 2 | Leave name blank, click "Create website" | Error: "Website name is required" |
| 3 | Enter invalid URL (e.g. `notaurl`) | Error about invalid URL |
| 4 | Leave recipient email blank | Error about required email |
| 5 | Fill in: Name = "My Test Site", URL = `https://mytestsite.com`, Email = your email | Form submits |
| 6 | After submit | Redirected to the website detail page |

**Note:** `successRedirectUrl` (the redirect after a form submission) is optional — confirm the label shows "(optional)" and the form submits fine if left empty.

### Viewing websites

| Step | What to do | What should happen |
|------|------------|-------------------|
| 1 | Go to `/dashboard/websites` | Cards show each website with globe icon, form count, submission count |
| 2 | Click a website card | Goes to the website detail page showing its form inboxes and recent submissions |
| 3 | Click "Add form" on the website detail page | Goes to new form page with the website pre-selected |

---

## 6. Forms

### Creating a form

| Step | What to do | What should happen |
|------|------------|-------------------|
| 1 | In sidebar click "Forms", then "+ New form" | Goes to `/dashboard/forms/new` |
| 2 | If you have no websites | Empty state shows with "Add a website first" button |
| 3 | Select a website from the dropdown | ✓ |
| 4 | Enter form name (e.g. "Contact Form") | ✓ |
| 5 | Enter recipient email(s) — can be comma-separated | ✓ |
| 6 | Leave "Success redirect URL" blank | Field shows "(optional)" label — should work fine without it |
| 7 | Leave spam protection and form type as defaults | ✓ |
| 8 | Click "Create form inbox" | Redirected to the form detail page |

### Viewing forms list

| Step | What to do | What should happen |
|------|------------|-------------------|
| 1 | Go to `/dashboard/forms` | List of all form inboxes with website name, endpoint path, submission count, ACTIVE badge |
| 2 | Click a form name | Goes to that form's detail page |

---

## 7. Form detail — Connect tab

Go to any form detail page (e.g. from the forms list).

### Endpoint hero card

| What to check | Expected |
|--------------|----------|
| Blue card at the top shows the endpoint URL | ✓ |
| "Copy" button copies the URL to clipboard | Click it, paste somewhere — should be the full `https://...` URL |
| Shows recipient email(s), spam protection level, submission count | ✓ |

### Connect tab — AI prompt

| What to check | Expected |
|--------------|----------|
| Blue gradient "Connect with AI" card is the first thing on the Connect tab | ✓ |
| Dark code block shows the prompt with the real endpoint URL embedded | ✓ |
| "Copy" button on the code block copies the full prompt text | ✓ |
| Prompt text mentions `action="[endpoint URL]"` with the actual URL | ✓ |

### Connect tab — Manual setup tabs

| What to check | Expected |
|--------------|----------|
| "HTML" tab is selected by default | ✓ |
| HTML snippet includes the form tag, input fields, honeypot, and load-time script | ✓ |
| Clicking "React" tab shows a React component with the endpoint URL | ✓ |
| Clicking "Other" tab shows a curl example | ✓ |
| Copy button on each snippet copies the code | ✓ |

### Other tabs

| Tab | What to check |
|-----|--------------|
| **Protection** | Shows spam level dropdown, website protection mode, form type, honeypot name, notification toggles. Changing settings and clicking "Save" shows a green success message |
| **Field mapping** | If no submissions yet, shows "No submissions yet" message. After a submission, shows dropdowns to map name/email/phone/message fields |
| **Submissions** | Lists the form's submissions with sender name, email, message preview, and spam badge (CLEAN / SUSPICIOUS / SPAM) |

---

## 8. Receiving a real submission

This tests the actual form endpoint that accepts data from websites.

### Using curl

Open a terminal and run this (replace `fm_XXXX` with the real public form ID from your form's endpoint URL):

```bash
curl -X POST http://localhost:3000/f/fm_XXXX \
  -F "name=Jane Tester" \
  -F "email=jane@test.com" \
  -F "message=This is a test submission from curl"
```

**Expected response:**
```json
{"success": true, "message": "Submission received."}
```

**Expected in dashboard:**
- Go to the form detail page → Submissions tab — Jane Tester should appear
- Go to `/dashboard/submissions` — should appear in the list
- Recipient email should receive an alert (in dev this may be skipped/logged)

### Spam submission test

Send a suspicious submission to trigger spam detection:

```bash
curl -X POST http://localhost:3000/f/fm_XXXX \
  -F "name=Buy cheap meds online" \
  -F "email=spam@spam.com" \
  -F "message=Click here to buy viagra cialis http://spamlink.com http://spamlink2.com"
```

**Expected:** Response is `success: true` (spam is not rejected, just scored). In the dashboard, the submission appears with a SPAM or SUSPICIOUS badge instead of CLEAN.

### Honeypot test (bot simulation)

If your form has a honeypot field named `_hp_abc123` (visible on the Protection tab), fill it in:

```bash
curl -X POST http://localhost:3000/f/fm_XXXX \
  -F "name=Bot Name" \
  -F "email=bot@bot.com" \
  -F "_hp_abc123=gotcha" \
  -F "message=I am a bot"
```

**Expected:** Submission appears with a high spam score and SUSPICIOUS classification.

---

## 9. Submissions inbox

### List view (`/dashboard/submissions`)

| What to check | Expected |
|--------------|----------|
| Shows all submissions across all forms | ✓ |
| Each row shows sender name, email, message preview, form name, date, spam badge | ✓ |
| CLEAN badge is green, SUSPICIOUS is yellow/orange, SPAM is red | ✓ |
| Clicking a submission row | Opens the submission detail page |

### Submission detail page

| What to check | Expected |
|--------------|----------|
| Left column shows all submitted field values in grey boxes | ✓ |
| Right column shows sender info card (name, email, phone if mapped) | ✓ |
| Source URL and page title shown if submitted | ✓ |
| "Lead status" dropdown allows selecting NEW / CONTACTED / WON / LOST / ARCHIVED | ✓ |
| Changing status and clicking "Update status" shows success message | ✓ |
| Spam classification section shows the spam score and reason tags | ✓ |
| "Mark as spam" button moves submission to spam | ✓ |

---

## 10. Spam

### Spam list (`/dashboard/spam`)

| What to check | Expected |
|--------------|----------|
| Lists submissions classified as SPAM | ✓ |
| Each entry shows spam signal tags (reason chips) | ✓ |
| Clicking an entry | Goes to spam detail page |

### Spam detail page

| What to check | Expected |
|--------------|----------|
| Shows which spam signals were triggered (table of reasons + scores) | ✓ |
| "Mark as not spam" button visible | ✓ |
| Click "Mark as not spam" | Submission moves out of spam, success message appears |
| Optional checkbox "Send notification now" | If checked and submitted, triggers the email notification for that submission |

---

## 11. Security

Go to `/dashboard/security`.

| What to check | Expected |
|--------------|----------|
| Page shows blocked events (requests that were hard-blocked before even being saved) | ✓ |
| Shows reason for each block (e.g. RATE_LIMIT_BLOCKED, PAYLOAD_TOO_LARGE) | ✓ |
| Email suppressions section shows emails that were suppressed | ✓ |
| Delivery events section shows email send attempts and their status | ✓ |

---

## 12. Settings

Go to `/dashboard/settings`.

| What to check | Expected |
|--------------|----------|
| Shows current name and email in a card | ✓ |
| Email field is disabled (cannot be changed) | ✓ |
| Change name and click "Save changes" | Success message appears, name updates |

---

## 13. Billing

Go to `/dashboard/billing`.

| What to check | Expected |
|--------------|----------|
| Shows current plan badge | ✓ |
| Shows usage stats (submissions, websites, forms, spam blocked) | ✓ |
| "Upgrade" card shows "Coming soon" | ✓ |

---

## 14. Responsiveness

Test these screen sizes. You can use browser DevTools (F12 → toggle device toolbar).

### Mobile (375px wide — iPhone size)

| Page | What to check |
|------|--------------|
| Homepage `/` | Hamburger menu appears at top right. Nav links are hidden. CTA buttons stack vertically. Hero text still readable. |
| Pricing `/pricing` | Plan cards stack vertically (one per row) |
| Dashboard `/dashboard` | Dark mobile top bar with FormRelay logo + hamburger replaces the sidebar |
| Dashboard — tap hamburger | Dark sidebar drawer slides in from left with all nav links |
| Dashboard — tap backdrop | Drawer closes |
| Dashboard — tap a nav link | Drawer closes and navigates to that page |
| Forms list | Full width list, no horizontal overflow |
| Form detail | Tabs scroll horizontally if needed, code blocks scroll |
| Submission detail | Two columns stack into one |

### Tablet (768px wide)

| Page | What to check |
|------|--------------|
| Homepage | Nav still shows as hamburger, but content has more breathing room |
| Dashboard | Sidebar is visible, content sits to the right |
| Stat cards | 2×2 grid |

### Desktop (1280px+)

| Page | What to check |
|------|--------------|
| Dashboard | Full sidebar visible, content centered with max-width |
| Homepage | Full 2-column hero, 3-column features, 3-column testimonials |
| Pricing | 3-column plan cards side by side |

---

## 15. Edge cases and error states

### Auth protection

| What to do | Expected |
|-----------|----------|
| Visit `/dashboard` without being logged in | Redirected to `/login` |
| Visit `/dashboard/forms/fake-id-that-doesnt-exist` | 404 page (Next.js not found) |

### Form submission edge cases

| What to send | Expected |
|-------------|----------|
| POST to a non-existent form ID `/f/fm_doesnotexist` | `{"success": false, "message": "This form endpoint is not active."}` with HTTP 404 |
| POST with an extremely long field value (> 10000 chars) | HTTP 422 with `success: false` — blocked |
| POST with more than 50 fields | HTTP 422 — too many fields |
| POST with a file upload (multipart with actual file) | HTTP 422 — files not allowed |
| POST the same data twice within 2 minutes from same IP | Second submission gets a high spam score (duplicate detection) |
| POST with no content-type header and a large payload | HTTP 413 — payload too large |

### Dashboard edge cases

| Scenario | Expected |
|---------|----------|
| Try to create a form when there are no websites | New form page shows an empty state with "Add a website first" CTA |
| Account has no submissions yet | Dashboard and submission pages show empty states with helpful prompts |
| Form has no submissions yet | Field mapping tab says "No submissions yet — submit the form first" |

---

## 16. API — form endpoint directly

The form endpoint is `POST /f/{publicFormId}`.

### Accepted content types

All three of these should work and return `{"success": true}`:

```bash
# 1. HTML form submission (most common)
curl -X POST http://localhost:3000/f/fm_XXXX \
  -F "name=Test" -F "email=test@test.com" -F "message=Hello"

# 2. URL-encoded (also common)
curl -X POST http://localhost:3000/f/fm_XXXX \
  -d "name=Test&email=test@test.com&message=Hello"

# 3. JSON
curl -X POST http://localhost:3000/f/fm_XXXX \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Hello"}'
```

### Special fields FormRelay reads

These are optional but improve data quality in the dashboard:

| Field name | What it does |
|-----------|-------------|
| `_fr_loaded_at` | Millisecond timestamp when page loaded — helps detect bots who submit instantly |
| `source_url` | Page URL the form was on — shown in submission detail |
| `page_title` | Title of the page — shown in submission detail |
| `form_name` | Name of the form (overrides the inbox name in the email subject) |
| `_hp_XXXX` (honeypot) | Must be left empty by real users — if it has a value, submission is flagged as bot |

### Success response

```json
{
  "success": true,
  "message": "Submission received."
}
```

### Error responses

| HTTP code | Meaning |
|-----------|---------|
| 400 | Malformed JSON body |
| 404 | Form ID doesn't exist or form is not active |
| 413 | Payload too large |
| 415 | Unsupported content type |
| 422 | Too many fields, file upload detected, field value too long, JSON too deep |
| 429 | Rate limit hit — too many submissions from same IP in a short time |

---

## Checklist for a full regression run

Copy this and tick each item off:

```
[ ] Can sign up with a new account
[ ] Can log in with existing account
[ ] Can log out
[ ] Homepage loads with all sections
[ ] Pricing page loads with 3 plan cards + comparison table + FAQ
[ ] Can create a website
[ ] Can create a form inbox
[ ] Form detail page shows endpoint URL
[ ] AI prompt block shows with real endpoint URL
[ ] HTML, React, Other tabs all show snippets
[ ] Can send a real submission via curl
[ ] Submission appears in submissions list
[ ] Submission detail shows field values
[ ] Can change lead status on a submission
[ ] Can mark a submission as spam
[ ] Can recover a spam submission back to inbox
[ ] Spam list shows spam submissions
[ ] Security page loads without errors
[ ] Settings page shows name + disabled email
[ ] Can update name in settings
[ ] Billing page loads
[ ] Mobile: hamburger opens sidebar drawer
[ ] Mobile: drawer closes on nav link tap
[ ] Mobile: homepage CTAs stack vertically
[ ] Sending to a fake form ID returns 404
[ ] Honeypot submission gets flagged as spam
```

---

*Last updated: June 2026*
