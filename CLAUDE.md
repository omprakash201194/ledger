# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Ledger is a self-hosted **Family Financial Digital Legacy Register** — a personal finance webapp for tracking accounts, assets, debts, insurance policies, and digital credentials so that everything is documented in one place. It lives at `/home/ogautam/HomeLab/webapps/ledger/` and follows the same conventions as SpendStack and Kin-Keeper:

- **Backend:** Spring Boot 3.x, Java 21, Maven, `application.yml`
- **Frontend:** React 18, Vite, Tailwind CSS
- **Database:** shared homelab PostgreSQL (`postgres.homelab.svc.cluster.local:5432`)
- **Deployment:** k3s in `homelab` namespace, exposed via `https://ledger.homelab.local` (internal) and `https://ledger.onelifestack.com` (public, Cloudflare Tunnel)

A sample data file (`Family_Financial_Digital_Legacy_Register_SAMPLE.xlsx`) in the repo root illustrates the intended domain model and field structure.

## Current status

**v1.4.0 live — mobile dark theme redesign complete.**

- Internal: `https://ledger.homelab.local`
- Public: `https://ledger.onelifestack.com` (Cloudflare Tunnel)
- Auth: email/password + Google OAuth2 + forgot-password email flow, all working
- Mobile: React Native (Expo 51) app with dark theme, EAS build for Android APK distribution
- CI/CD: GitHub Actions deploys on every push to `main` (uses `github.sha` image tags)
- v1.2.0: New asset types (NPS/BANK_LOCKER), maturity date field, 4 new alert types
- v1.3.0: Toast notifications, skeleton loading, progressive disclosure forms, dashboard improvements, BottomNav More drawer, asset grouping/sort/filter, relative timestamps, empty-state CTAs, discard-changes confirm, Enter-to-submit
- v1.4.0: Mobile dark theme redesign (theme.ts tokens, TypeBadge, CardWrap), section intro notes on all pages, Google OAuth2 deep link fix

**v1.2.0 additions (commit `f972f88`):**
- Asset types: CURRENT_ACCOUNT, RECURRING_DEPOSIT, NPS, BANK_LOCKER added
- Asset dropdown grouped into categories with human-friendly labels
- `maturity_date` field on Asset entity (Liquibase migration 011); shown in form for FD/RD/NPS
- "Document Location" label renamed to "Location of original documents" across Assets + Insurance
- Will page shows "Why a Will matters" CTA card when `hasWill=false`
- 4 new nightly alert types: WILL_NO_REVIEW, NOMINEE_MISSING, FD_MATURITY_DUE, EMI_ENDING_SOON

**OAuth2 gotchas learned during deployment** (already fixed in code):
- Google rejects `.local` TLDs — use the public domain for OAuth2 credentials
- Cloudflare Tunnel terminates TLS so `{baseUrl}` in Spring resolves to `http://` — hardcode the full `redirect-uri` in `application.yml`
- Cloudflare Tunnel → point to `http://ledger-frontend.homelab.svc.cluster.local:80` (HTTP, not the ingress hostname)
- `OAuth2SuccessHandler` must include `userId`, `email`, `name` in the callback redirect — the frontend needs all four params

**Gmail SMTP gotchas** (already fixed in code):
- `management.health.mail.enabled: false` — mail health check makes readiness probe fail if SMTP is slow; disable it
- Gmail App Password must be 16 chars with spaces stripped; verify with a direct `smtplib` test before resealing
- SealedSecret controller syncs asynchronously — always wait for sync before restarting the pod

See [PLAN.md](PLAN.md) for the full implementation plan with phase completion status.

## Post-commit process

After every commit:
1. Update PLAN.md — mark completed phases/steps, adjust upcoming steps if plans changed
2. Update CLAUDE.md — reflect current status
3. Update relevant wiki pages if architecture or APIs changed
4. Save memory for any non-obvious decisions made during implementation
5. Create a GitHub issue on `omprakash201194/ledger` summarising what was implemented and add it to the Life Ledger project board (#6)

## Build & run commands

### Backend
```bash
cd backend
./mvnw spring-boot:run                        # Run locally
./mvnw test                                   # All tests
./mvnw test -Dtest=MyServiceTest              # Single test class
./mvnw verify                                 # Tests + integration tests
./mvnw package -DskipTests                    # Build JAR only
```

### Frontend
```bash
cd frontend
npm install
npm run dev                                   # Dev server (Vite)
npm run build                                 # Production build
npm run lint                                  # ESLint
```

### Docker & deploy
```bash
docker build -t localhost:30500/homelab/ledger:1.0.0 .
docker push localhost:30500/homelab/ledger:1.0.0
kubectl apply -f k8s/ -n homelab
kubectl rollout restart deployment/ledger -n homelab
```

## Directory layout

```
ledger/
├── CLAUDE.md
├── Family_Financial_Digital_Legacy_Register_SAMPLE.xlsx  # domain model reference
├── backend/               # Spring Boot app
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
├── frontend/              # React + Vite app
│   ├── package.json
│   └── src/
└── k8s/                   # Kubernetes manifests
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml
    ├── configmap.yaml
    └── sealed-secret.yaml  # Never commit secret.yaml — use kubeseal
```

## Coding conventions (inherited from homelab)

- Constructor injection only, never field `@Autowired`
- `@Slf4j` for logging, never `System.out.println`
- `ResponseEntity<?>` on REST controllers; thin controllers, logic in `@Service`
- All config via `@ConfigurationProperties`, nothing hardcoded
- Secrets: create plaintext `secret.yaml`, seal with `kubeseal --cert ~/HomeLab/sealed-secrets-cert.pem --format yaml < secret.yaml > sealed-secret.yaml`, then delete the plaintext file

## Kubernetes manifest conventions

- Namespace: `homelab`
- CPU request: `50m` (measure with `kubectl top pod` and adjust); limit: `500m`
- Memory request: `256Mi`; limit: `512Mi`
- Always include `livenessProbe` and `readinessProbe` → `/actuator/health`
- Security context: `runAsNonRoot: true`, `runAsUser: 1001`
- Image tag: never `latest` — always a specific version like `1.0.0`
