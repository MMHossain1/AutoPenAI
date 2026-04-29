# AutoPenAI

----- this repo only contains the frontend portion of the project to which i contributed the most in -----

AI-assisted automated penetration testing platform.

## About

AutoPenAI helps security teams and developers find vulnerabilities in web applications faster. It orchestrates OWASP ZAP to run automated scans, then applies a local LLM (via Ollama) to deduplicate findings, prioritise by severity, and generate plain-English summaries — no data leaves your infrastructure.

**Key features:**
- 🔍 **Automated scanning** — spider, AJAX spider, and active scan via ZAP
- 🤖 **AI triage** — LLM-powered deduplication, prioritisation, and summaries (technical or non-technical)
- 🔐 **User accounts** — JWT-authenticated scan history per user
- 🏠 **Fully local** — Ollama runs the model on your own hardware

## Quick Start


### 🐳 Docker (Recommended)

> Requires Docker with the Compose plugin ([install guide](https://docs.docker.com/compose/install/)).

```bash
git clone <repo-url> && cd autopenai
cp .env.example .env
docker compose up -d          # Start all services
```

| Service    | URL                        |
|------------|----------------------------|
| Frontend   | http://localhost:3000      |
| Backend    | http://localhost:8000      |
| ZAP        | http://localhost:8080      |
| Ollama     | http://localhost:11434     |
| PostgreSQL | http://localhost:5432      |

> [!TIP]
> **After any code change** (or switching branches), containers must be rebuilt to pick up new code:
> ```bash
> docker compose up -d --build
> ```
> This rebuilds only the affected images (backend/frontend) and restarts them. The database, ZAP, and Ollama containers are unaffected.

Monitor startup: `docker compose logs -f backend`

The backend will automatically pull the Ollama model on first launch (may take a few minutes).

#### GPU Acceleration (optional)

By default Ollama runs on CPU. Uncomment the relevant section in `docker-compose.yml` to enable GPU acceleration.

**NVIDIA**

Requires the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html). Uncomment the `deploy` block under the `ollama` service:

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: all
          capabilities: [gpu]
```

**AMD (ROCm)**

Requires ROCm drivers on the host. Install via your distro's package manager (e.g. `amdgpu-install` on Ubuntu/Fedora) and add your user to the `render` and `video` groups:

```bash
sudo usermod -aG render,video $USER
# then log out and back in (or reboot)
```

Then in `docker-compose.yml`, switch the image and uncomment the `devices` block:

```yaml
image: ollama/ollama:rocm   # replace ollama/ollama:latest

devices:
  - /dev/kfd
  - /dev/dri
```

> [!NOTE]
> ROCm support is best on RDNA2+ cards (RX 6000 series and newer). Older GCN cards may require setting `HSA_OVERRIDE_GFX_VERSION` — see the [Ollama ROCm docs](https://ollama.com/blog/amd-preview) for details.

---

### 💻 Local Development

Prerequisites: **Python 3.11**, **Node.js 22**, **PostgreSQL 16**, **Ollama**

#### 1. Database

```bash
docker run -d --name autopenai-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=testpassword \
  -e POSTGRES_DB=sweng-11 \
  -p 5432:5432 postgres:16
```

Or install PostgreSQL locally and create a database named `sweng-11`.

#### 2. ZAP

Download and run [OWASP ZAP](https://www.zaproxy.org/download/) in daemon mode:

```bash
zap.sh -daemon -host 0.0.0.0 -port 8080 -config api.disablekey=true
```

#### 3. Ollama

Install from [ollama.com/download](https://ollama.com/download), then:

```bash
ollama serve
```

#### 4. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create .env (defaults work if you used the docker run command above)
echo "LLM_PROFILE=fast" > .env

python -m app
```

Backend available at http://localhost:8000

#### 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at http://localhost:5173

---

## Environment Variables

| Variable        | Default                                                    | Description            |
|-----------------|------------------------------------------------------------|------------------------|
| `DATABASE_URL`  | `postgresql://postgres:testpassword@localhost:5432/sweng-11` | PostgreSQL connection  |
| `ZAP_BASE_URL`  | `http://localhost:8080`                                    | ZAP daemon URL         |
| `OLLAMA_BASE_URL` | `http://localhost:11434`                                 | Ollama API URL         |
| `LLM_PROFILE`   | `fast`                                                     | Model size (see below) |
| `CORS_ORIGINS`  | `http://localhost:5173,http://localhost:3000`               | Allowed frontend origins |

**LLM Profiles:**

| Profile  | Model           | Size   |
|----------|-----------------|--------|
| `fast`   | qwen3.5:0.8b    | ~1 GB  |
| `small`  | qwen3.5:2b      | ~3 GB  |
| `medium` | qwen3.5:9b      | ~7 GB  |
| `large`  | qwen3.5:27b     | ~17 GB |

---

## Project Structure

```
autopenai/
├── docker-compose.yml    # Full stack orchestration
├── .env.example          # Environment variable template
├── backend/              # FastAPI application (Python 3.11)
│   ├── app/
│   │   ├── AI/           # Ollama LLM integration
│   │   ├── db/           # SQLAlchemy models & database
│   │   ├── service/      # ZAP scan client, user auth
│   │   └── main.py       # API routes
│   └── requirements.txt
└── frontend/             # Next.js 15 + TypeScript + Tailwind
    └── src/
```

---

## Contributing

Branching strategy:
- `main` — production-ready code
- `dev` — integration branch
- Feature branches should be created from `dev` and merged back to `dev`

### Contributors

- Seamus O Ciosain
- Mohammed Hossain
- Maria Matei
- Dylan Groome
- Lukas Anderson
- Sophie Bell
- Pavlo Kostianov
- Kush Voorakkara
