# Demo Script

## Demo Length

Target: 3.5 to 4.5 minutes

## Opening

ScamShield Malaysia is an AI-powered trust-and-safety layer for scam prevention, fraud awareness, and community intelligence built for Malaysian scam realities.

## Live Flow

### 1. Problem framing

- Mention parcel scams, fake bank alerts, wallet verification traps, job scams, and Macau-scam style impersonation
- Explain that users need both detection and action guidance

### 2. Text analysis

- Paste the parcel-fee SMS demo
- Highlight:
  - risk score
  - verdict
  - red flags
  - Malaysia-specific context
  - recommended actions

### 3. URL analysis

- Switch to URL mode and paste the fake bank URL
- Call out spoofed hostname logic and phishing-specific scoring

### 4. Screenshot analysis

- Switch to image mode and load the sample wallet suspension screenshot
- Explain that the product works today in mock mode and can switch to live Gemini later through env vars

### 5. Community intelligence

- Search for an existing scam pattern
- Use the latest analysis to prefill a sanitized community report
- Submit it and show the updated feed

### 6. Architecture and scalability

- Point to the architecture / trust section
- Explain the Genkit agent workflow
- Mention Docker, CI, public GitHub, and Cloud Run deployment readiness

## Judge Talking Points

- AI is central, not decorative
- Malaysia-specific relevance is built into prompts, seed data, and explanations
- The product is demo-stable even without secrets
- Privacy is treated as a feature, not an afterthought

