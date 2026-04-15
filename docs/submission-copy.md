# Submission Copy

## One-Line Pitch

ScamShield Malaysia is an AI-powered multimodal scam detection and community intelligence platform built to help Malaysians identify threats before they click, reply, or transfer.

## Short Description

ScamShield Malaysia analyzes suspicious messages, URLs, phone numbers, and screenshots, then returns a structured risk score, clear red flags, recommended actions, and Malaysia-specific context. It also turns anonymized user reports into a searchable community intelligence feed.

## 100-Word Submission Summary

ScamShield Malaysia is a trust-and-safety layer for Malaysian scam prevention. Users can paste suspicious messages, links, phone numbers, or upload screenshots, and receive a structured AI risk analysis with red flags, verdict, confidence, and practical next steps. The product uses a real agentic workflow through Firebase Genkit: intake, analysis, retrieval, risk scoring, report generation, and community intelligence normalization. It is grounded in seeded Malaysian scam patterns such as parcel fee scams, bank phishing, wallet verification traps, authority impersonation, and job scams. The app also supports privacy-safe community reporting, mock mode without credentials, Docker, CI, and Cloud Run readiness.

## Problem

Malaysians are exposed to scam attempts across SMS, WhatsApp, Telegram, spoofed websites, fake parcel notices, investment pitches, wallet suspension pages, and impersonation calls. Victims often need help with:

- determining whether the threat is credible
- understanding which red flags matter
- knowing what action to take immediately
- checking whether the same scam pattern is already circulating

## Solution

ScamShield Malaysia combines multimodal intake, structured AI reasoning, Malaysian scam retrieval, and privacy-safe community intelligence in one interface. Instead of just answering like a chatbot, it produces a calibrated JSON-backed risk assessment that is easy to display, explain, and operationalize.

## Why This Is Innovative

- AI is the product core, not a wrapper
- the workflow is explicitly agentic and explainable
- the scoring is composite, combining heuristics, retrieval, community similarity, and provider output
- the platform is localized for Malaysian scam narratives
- community intelligence is privacy-safe by design

## Why This Matters In Malaysia

- scams often impersonate trusted local institutions such as Maybank, CIMB, Touch 'n Go eWallet, KWSP, LHDN, Bank Negara, PDRM, and local courier brands
- scam losses escalate quickly once a user clicks or transfers funds
- the platform can evolve into a trust-and-safety layer for banks, telcos, public agencies, and digital literacy programs

## Track Fit

Track 5 — Secure Digital (FinTech & Security)

ScamShield Malaysia fits the track because it directly addresses fraud prevention, phishing detection, consumer protection, digital trust, and security-focused community intelligence.

## Technical Highlights

- React + Vite frontend with polished mobile-first UX
- Node + Express backend with Zod validation and modular services
- Firebase Genkit orchestration for the agent workflow
- Gemini provider integration with retry logic and mock fallback
- seeded Malaysian scam dataset in-repo
- local JSON storage by default with optional Firestore adapter
- GitHub Actions CI
- GitHub Actions Docker verification on hosted runners
- Cloud Run deployment template ready for later activation

## Demo Highlights

1. Paste a fake parcel-fee message
2. Analyze a spoofed banking URL
3. Check a suspicious phone number
4. Upload a fake wallet or phishing screenshot
5. Submit an anonymized community report
6. Search related scam patterns in the feed

## Impact Story

ScamShield Malaysia can scale from a hackathon demo into a national trust-and-safety layer supporting:

- consumer scam prevention
- fraud awareness campaigns
- digital literacy
- scam campaign monitoring
- integrations with financial institutions and telcos

## AI Usage Disclosure

AI coding tools were used during development. All code has been reviewed and can be explained.

## Public Repo

https://github.com/Rohan5commit/scamshield-malaysia

