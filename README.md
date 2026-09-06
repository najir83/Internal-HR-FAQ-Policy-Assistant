# Internal HR FAQ & Policy Assistant

An AI-powered HR FAQ and Policy Assistant that answers questions using internal HR and policy documents.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **LLM:** Google Gemini API — `gemini-3.6-flash`
- **Embeddings:** Google Gemini API — `gemini-embedding-2`
- **Vector Database:** Qdrant Cloud

---

## Run Locally

### Prerequisites

- Node.js 20+
- npm
- Gemini API key
- Qdrant Cloud API key and cluster endpoint

### 1. Clone the repository

```bash
git clone https://github.com/najir83/Internal-HR-FAQ-Policy-Assistant.git
cd Internal-HR-FAQ-Policy-Assistant
```

### 2. Start the backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_CLUSTER_ENDPOINT=your_qdrant_cluster_endpoint
```

Start the server:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, typically:

```text
http://localhost:5173
```

The application is now ready to use.

---

## Environment Variables

All environment variables are required by the backend.

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `GEMINI_API_KEY` | Google Gemini API key for LLM and embedding requests |
| `QDRANT_API_KEY` | Qdrant Cloud API key |
| `QDRANT_CLUSTER_ENDPOINT` | Qdrant Cloud cluster endpoint |


---

## Models & AI Path

This project uses **cloud APIs**, not locally hosted models.

| Purpose | Provider | Model |
|---|---|---|
| Answer generation | Google Gemini API | `gemini-3.6-flash` |
| Text embeddings | Google Gemini API | `gemini-embedding-2` |
| Vector storage/search | Qdrant Cloud | — |

## Development Commands

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

For a production frontend build:

```bash
npm run build
```

---

## Troubleshooting

### Gemini API errors

Check that `GEMINI_API_KEY` is correctly configured in `server/.env`.

### Qdrant connection errors

Check that both `QDRANT_API_KEY` and `QDRANT_CLUSTER_ENDPOINT` are correct and that the Qdrant cluster is available.

### Frontend cannot reach backend

Make sure the backend is running on:

```text
http://localhost:3000
```

and the frontend is running through Vite, typically on:

```text
http://localhost:5173
```

### Environment file / server startup

If the usual server start command does not load `.env` correctly, use:

```bash
node --env-file=.env --watch server.js