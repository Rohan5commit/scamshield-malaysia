# Architecture

## System View

```mermaid
flowchart TD
  User --> Frontend
  Frontend -->|REST| Backend
  Backend --> Genkit
  Genkit --> Intake
  Genkit --> Analysis
  Genkit --> Retrieval
  Genkit --> Scoring
  Genkit --> Community
  Retrieval --> SeedData[(Malaysian Scam Seed Data)]
  Community --> Storage
  Storage --> LocalJSON[(Local JSON Adapter)]
  Storage --> Firestore[(Firestore Adapter)]
```

## Design Goals

- Demo reliably with zero cloud credentials
- Make AI visibly central, explainable, and structured
- Keep storage privacy-safe and easy to swap later
- Stay Cloud Run friendly from day one

