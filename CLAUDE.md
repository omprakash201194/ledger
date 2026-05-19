# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Ledger is a self-hosted **Family Financial Digital Legacy Register** — a personal finance webapp for tracking accounts, assets, debts, insurance policies, and digital credentials so that everything is documented in one place. It lives at `/home/ogautam/HomeLab/webapps/ledger/` and follows the same conventions as SpendStack and Kin-Keeper:

- **Backend:** Spring Boot 3.x, Java 21, Maven, `application.yml`
- **Frontend:** React 18, Vite, Tailwind CSS
- **Database:** shared homelab PostgreSQL (`postgres.homelab.svc.cluster.local:5432`)
- **Deployment:** k3s in `homelab` namespace, exposed via `https://ledger.homelab.local`

A sample data file (`Family_Financial_Digital_Legacy_Register_SAMPLE.xlsx`) in the repo root illustrates the intended domain model and field structure.

## Current status

Pre-scaffolding — no backend or frontend code exists yet. The directory layout described below is the intended target.

See [PLAN.md](PLAN.md) for the full implementation plan: domain model, entity definitions, REST API, k8s manifests, Cloudflare tunnel setup, and build sequence.

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
