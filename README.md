# Tik.lk — Real-Time Event Ticketing & Dynamic Gate Pass Engine

Tik.lk is an enterprise-grade event ticketing platform and cryptographic entry-verification system engineered for concerts, academic conferences, sports events, and corporate summits. 

The system mitigates ticket scalping, screenshot forgery, and illicit gate access by replacing static QR codes with dynamic, time-based HMAC-SHA256 TOTP passes verified synchronously at turnstile checkpoints.

---

## Technical Features

- **Dynamic Cryptographic Passes:** Generates auto-rotating HMAC-SHA256 TOTP QR tokens (`@open-ticket/crypto`) bound to attendee identity, invalidating screenshots and static image captures.
- **Turnstile Gate Scanner Portal:** Dedicated `/committee` web interface utilizing camera-based optical scanning for event operators to execute sub-second pass validation.
- **Atomic Database State Enforcement:** Enforces single-use check-in constraints at the database transaction layer to eliminate duplicate access attempts.
- **Next.js 15 Server Infrastructure:** Built on the Next.js 15 App Router utilizing Server Actions, `force-dynamic` route segments, and programmatic `revalidatePath` cache purging.
- **Neon Serverless PostgreSQL Integration:** Managed database layer using Prisma ORM to maintain throughput during high-concurrency ticketing operations.
- **Bandwidth-Optimized Client Runtime:** Designed with minimal client-side asset overhead to maintain low latency across variable cellular network conditions.

```

## System Architecture & Sequence Flow

[ Attendee Client / Wallet ]           [ Gate Scanner Portal ]               [ Neon PostgreSQL ]
             │                                   │                                    │
             ├─ Dynamic HMAC-SHA256 TOTP ────────>│                                    │
             │  Generation (30s Window)          │                                    │
             │                                   ├─ Optical Scan & Payload Decode    │
             │                                   ├─ Verify HMAC Signature & Expiry    │
             │                                   │                                    │
             │                                   ├─ Validate Ticket Record ID ───────>│
             │                                   │  (Atomic CHECKED_IN update)        │
             │                                   │<───────────────────────────────────┤
             │                                   │                                    │
             │                                   └─ Response: ACCESS GRANTED          │

```

## Tech Stack

- **Framework:** Next.js 15 (App Router & Server Actions)
- **Language:** TypeScript
- **Database:** Neon PostgreSQL
- **ORM:** Prisma ORM
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Cryptography:** Node.js `crypto` (HMAC-SHA256 TOTP Tokens via `@open-ticket/crypto`)

---

## Getting Started

### Prerequisites

- **Node.js:** Version `20.x` or higher
- **Package Manager:** `pnpm` (recommended) or `npm`
- **Database:** Active Neon PostgreSQL database instance

### 1. Installation

Clone the repository and install project dependencies:
```
git clone https://github.com/avinashperera-ops/tik-lk.git
cd tik-lk
pnpm install
```
### 2. Environment Configuration

Create a `.env` file in the project root directory:
```
DATABASE_URL="postgresql://neondb_owner:npg_YPhD0gs3RqNf@ep-quiet-brook-b5mugpj3-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="openticket_super_secret_key_2026_production"
TOTP_SECRET="openticket_super_secret_key_2026_production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
### 3. Database Migration

Synchronize the Prisma schema with your target database:
```
npx prisma db push
npx prisma generate
```
### 4. Application Execution

Start the development server:
```
pnpm dev
```
Access the application interface at `http://localhost:3000`.



## Repository Structure
```
tik-lk/
├── apps/
│   └── web/                   # Next.js 15 Web Application
│       ├── src/
│       │   ├── app/
│       │   │   ├── (buyer)/   # Attendee ticket management (/dashboard)
│       │   │   ├── committee/ # Turnstile validation portal (/committee)
│       │   │   └── actions/   # Server actions for issuance & validation
│       │   └── components/    # Reusable UI component library
├── packages/
│   ├── crypto/                # Dynamic HMAC-SHA256 signing module
│   └── database/              # Prisma schema definitions & DB client
├── .gitignore
├── README.md
└── package.json

```

## Security Specifications

1. **Pass Signature Generation:** Upon rendering the `/dashboard` view, `generateDynamicQRToken(ticket.id)` constructs a signed payload using the configured `TOTP_SECRET`.
2. **Synchronous Validation:** The `validateGateScan(payload)` server action validates the HMAC-SHA256 signature against a 30-second sliding time window.
3. **Replay Attack Prevention:** If a verified signature is resubmitted, the system evaluates the database record state. If `TicketStatus` reflects `CHECKED_IN`, access is denied immediately.

---

## License

Distributed under the MIT License. See `LICENSE` for complete terms.
