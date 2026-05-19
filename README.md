# Life Ledger

A self-hosted **Family Financial & Digital Legacy Register** — a private webapp that documents your complete financial picture (assets, liabilities, insurance, digital accounts, recurring obligations, and will details) so your trusted persons can act immediately without a frantic search.

Built for the homelab. Runs entirely on your own infrastructure.

---

## What it does

- **Assets** — bank accounts, fixed deposits, PPF/EPF, mutual funds, equity, gold, property
- **Liabilities** — home loans, car loans, credit cards and other debts
- **Insurance** — term life, health, vehicle and general policies with premium due-date alerts
- **Digital accounts** — records *where* credentials are stored, never the credentials themselves
- **Recurring obligations** — EMIs, SIPs, subscriptions with action-on-death notes
- **Will & succession** — stores the location and metadata of your Will, never the text
- **Trusted persons** — family members, advisors, and executors to contact in an emergency
- **Net worth dashboard** — live snapshot of total assets minus liabilities
- **In-app alerts** — upcoming premium due dates, EMI reviews, stale asset valuations

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.4.x, Java 21, Maven |
| Frontend | React 18, Vite, Tailwind CSS |
| Database | PostgreSQL (shared homelab instance) |
| Migrations | Liquibase |
| Auth | Spring Security OAuth2 (Google) + JWT |
| Container | Docker (multi-stage), nginx |
| Orchestration | k3s (single-node Kubernetes) |
| Public access | Cloudflare Tunnel |

---

## Running locally

### Prerequisites
- Java 21 (via SDKMAN: `sdk use java 21`)
- Node 20+
- PostgreSQL running locally or via Docker

### Backend
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend dev server proxies `/api/` to `http://localhost:8080`.

---

## Deployment

Deployed as two containers in the `homelab` k3s namespace:

```bash
# Build and push
docker build -t localhost:30500/homelab/ledger-backend:1.0.0 backend/
docker push localhost:30500/homelab/ledger-backend:1.0.0

docker build -t localhost:30500/homelab/ledger-frontend:1.0.0 frontend/
docker push localhost:30500/homelab/ledger-frontend:1.0.0

# Deploy
kubectl apply -f k8s/ -n homelab
```

Exposed internally at `https://ledger.homelab.local` and publicly via Cloudflare Tunnel.

See the [wiki](https://github.com/omprakash201194/ledger/wiki) for the full architecture, domain model, API reference, and deployment guide.

---

## Status

> Active development — pre-release. See the [project board](https://github.com/users/omprakash201194/projects/6) for progress.
