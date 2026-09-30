# Hospify

Hospify is a standalone React PWA served by an Express API. It does not require Netlify and can run on any machine or container host that supports Node.js 22.

## Run with Node.js

Install dependencies, create the production bundle, and start the server:

```sh
npm install
npm run build
npm start
```

The app listens on `http://localhost:3000` by default. Copy `.env.example` to `.env` to configure the port, bind address, persistent data directory, or optional Gemini integration.

## Run with Docker

Build the image and run it with a persistent volume for hospital data:

```sh
docker build -t hospify .
docker run --name hospify -p 3000:3000 -v hospify-data:/app/data hospify
```

Open `http://localhost:3000`. Place a reverse proxy such as Caddy, Nginx, or a cloud load balancer in front of the container when serving the application over HTTPS.

To enable the clinical assistant, pass `GEMINI_API_KEY` from a secret store at runtime. Do not put the key in the image or commit it to the repository.

## Runtime configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port exposed by the server |
| `HOST` | `0.0.0.0` | Network interface used by the server |
| `DATA_DIR` | `./data` | Directory containing the persisted database file |
| `GEMINI_API_KEY` | unset | Optional server-side Gemini access |

The frontend uses same-origin `/api` routes, so no provider-specific URL configuration is needed. The `/api/health` endpoint can be used by a container platform for health checks.

## Publish on Google Cloud Run

Install and authenticate the Google Cloud CLI, select a billing-enabled project, then run:

```sh
./scripts/deploy-cloud-run.sh YOUR_PROJECT_ID
```

An optional second argument selects a region, for example `asia-south1`. The script enables the required Google Cloud services, creates a private storage bucket for the application data, deploys the service with public access, and prints its separate public URL. It limits the service to one instance because Hospify currently uses a single file-backed database.
