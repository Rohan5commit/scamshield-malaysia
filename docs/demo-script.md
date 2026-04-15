# Demo Script

## Demo Length

Target: 4 minutes

## Opening Line

"ScamShield Malaysia is an AI-powered trust-and-safety layer that helps Malaysians judge scam risk before they click, reply, or transfer."

## Live Flow

### 1. Problem framing — 25 seconds

Say:

"Malaysians are being hit by parcel fee scams, fake bank alerts, wallet verification traps, job scams, and impersonation calls. Most people do not just need detection. They need clear red flags, immediate next steps, and confidence that the pattern is already known."

### 2. Text analysis — 45 seconds

- Paste the parcel-fee SMS demo
- Highlight:
  - risk score
  - verdict
  - red flags
  - Malaysia-specific context
  - recommended actions

Say:

"This is not a chatbot answer. The UI is rendering strict structured output from an agentic backend."

### 3. URL analysis — 35 seconds

- Switch to URL mode and paste the fake bank URL
- Call out spoofed hostname logic and phishing-specific scoring

Say:

"The system combines retrieval and heuristics with model output, so it can explain why the domain looks dangerous instead of only labeling it."

### 4. Screenshot analysis — 40 seconds

- Switch to image mode and load the sample wallet suspension screenshot
- Explain that the product works today in mock mode and can switch to live Gemini later through env vars

Say:

"This makes the demo resilient. We can show the full product flow even without cloud setup, while the live Gemini path is already wired in."

### 5. Community intelligence — 45 seconds

- Search for an existing scam pattern
- Use the latest analysis to prefill a sanitized community report
- Submit it and show the updated feed

Say:

"We are not only scoring one message. We are building a privacy-safe community intelligence layer that can surface repeat scam campaigns."

### 6. Architecture and scalability — 35 seconds

- Point to the architecture / trust section
- Explain the Genkit agent workflow
- Mention Docker, CI, public GitHub, and Cloud Run deployment readiness

Say:

"This is built as a real product foundation: public GitHub repo, CI, Docker verification on GitHub Actions, provider abstraction, and a clean path to Cloud Run when deployment credentials are available."

## Judge Talking Points

- AI is central, not decorative
- Malaysia-specific relevance is built into prompts, seed data, and explanations
- The product is demo-stable even without secrets
- Privacy is treated as a feature, not an afterthought
- The repo is public and production-minded, not local-only scaffolding
