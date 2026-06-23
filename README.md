# Ezverse - AI PDF Extractor SaaS

Ezverse is an end-to-end AI SaaS platform designed to ingest complex PDF documents and instantly extract structured, highly predictable technical and ethical insights through an automated serverless pipeline. 

The platform features a secure user-token economy that automatically handles authorization, credit deductions, and instant payment-driven top-ups.

## 🚀 Architecture Overview

- **Frontend UI & Deployment:** Responsive dashboard built using Lovable and deployed/synced seamlessly via **Antigravity** configuration layers.
- **Database & Auth Matrix:** **Supabase** managing secure user authentication, active sessions, and the central `profiles` credit/token ledger ledger.
- **Automation Engine:** **n8n** running as the orchestration backend, handling incoming webhooks, secure document streams, and database transactions.
- **AI Core Analytics:** Google Gemini LLM utilizing a strict XML system prompt structure to ensure predictable, schema-compliant JSON extraction without conversational fluff.
- **Payment Infrastructure:** **Stripe Payment Links** connected via secure event destinations to automate user credit top-ups using webhooks.

---

## 📂 Repository Structure

```text
├── .gitignore
├── README.md
├── frontend/             # Lovable UI exported workspace
│   ├── src/
│   └── package.json
├── backend/              # Core automation logic
│   ├── workflows/
│   │   └── pdf-extractor.json   # Exported n8n workflow pipeline
│   └── prompts/
│       └── system-prompt.xml    # Deterministic Gemini system prompt
└── supabase/             # Database architecture
    └── schema.sql        # Profiles ledger, tables, and trigger configurations
