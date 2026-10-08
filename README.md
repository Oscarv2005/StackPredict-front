# StackPredict

StackPredict predicts the **page value** of a shopping session from browsing behaviour: pages visited, time spent, bounce rate and exit rate. Page value is the average revenue a page contributes before a purchase, so a higher prediction means stronger buying intent.

The project has three parts: a React dashboard, a Node.js gateway and a Flask machine-learning API.

```
Browser (React + Vite)  →  Node/Express gateway  →  Flask ML API (scikit-learn)
      frontend/                  backend/                    py/
```

## Features

- Landing page with an interactive chart of monthly conversion rate and average page value from the dataset
- Prediction form with eight inputs, input validation, a "Fill sample" shortcut and a progress indicator
- Result card with a predicted value, an intent tier (high, moderate or low), a gauge against the dataset average and short improvement tips
- Light and dark themes, remembered between visits
- Node gateway that proxies requests, with CORS enabled and timeout handling
- Flask API that loads a saved model and retrains from the CSV if the saved file is missing

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, plain CSS, canvas chart |
| Gateway | Node.js, Express 5, Axios, CORS |
| ML API | Python, Flask, pandas, scikit-learn, joblib |
| Hosting | Vercel |

## Project structure

```
StackPredict-front/
├── frontend/     React app (Vite)
├── backend/      Express gateway (app.js)
├── py/           Flask API
│   ├── app.py
│   ├── requirements.txt
│   ├── model_bundle.pkl
│   └── online_shoppers_intention.csv
└── vercel.json
```

## Dataset and model

- **Dataset:** Online Shoppers Purchasing Intention (`online_shoppers_intention.csv`)
- **Target:** `PageValues`
- **Features:** `Administrative`, `Administrative_Duration`, `Informational`, `Informational_Duration`, `ProductRelated`, `ProductRelated_Duration`, `BounceRates`, `ExitRates`
- **Model:** scikit-learn `LinearRegression`, trained on an 80/20 split with `random_state=42`
- **Accuracy:** R² of about 4% on the test set

The R² is low, which means page value depends on factors this model does not capture. Treat predictions as a rough indicator and not as a precise forecast. Trying tree-based models or adding more features would be the natural next step.

## API reference

Base URL examples: the Flask API directly, or the Node gateway under `/api`.

### `GET /`

Health check. Returns the model accuracy.

```json
{ "r2_percentage": "4.02%" }
```

Through the gateway, the response also includes a status message.

### `POST /predict`

Request body (all values numeric):

```json
{
  "Administrative": 3,
  "Administrative_Duration": 120.5,
  "Informational": 1,
  "Informational_Duration": 45,
  "ProductRelated": 15,
  "ProductRelated_Duration": 800,
  "BounceRates": 0.02,
  "ExitRates": 0.04
}
```

Response:

```json
{ "predicted_page_value": 1.2345, "r2_percentage": "4.02%" }
```

Errors return a JSON body with an `error` field. `BounceRates` and `ExitRates` must be between 0 and 1. Predictions are clamped to 0 or above.

## Run locally

You need Node.js 18 or newer and Python 3.10 or newer. Start the three parts in separate terminals.

**1. Flask API** (port 5000)

```bash
cd py
pip install -r requirements.txt
python app.py
```

**2. Node gateway** (port 3000)

```bash
cd backend
npm install
PYTHON_API=http://localhost:5000 npm run dev
```

**3. Frontend** (port 5173)

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:3000/api npm run dev
```

On Windows PowerShell, set variables with `$env:PYTHON_API="http://localhost:5000"` before the command.

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `PYTHON_API` | `backend` | Base URL of the Flask API (no trailing slash) |
| `VITE_API_URL` | `frontend` | Base URL the browser calls, normally the gateway URL ending in `/api` |
| `PORT` | `backend` | Local port, defaults to 3000 |

`VITE_API_URL` is read at build time, so redeploy the frontend after changing it.

## Deploy on Vercel

Deploy the repo as **three separate Vercel projects**, each with its own Root Directory.

| Project | Root Directory | Environment variable |
|---|---|---|
| Flask API | `py` | none |
| Node gateway | `backend` | `PYTHON_API=https://<flask-project>.vercel.app` |
| Frontend | `frontend` | `VITE_API_URL=https://<gateway-project>.vercel.app/api` |

Deploy in that order, then check these URLs:

1. `https://<flask-project>.vercel.app/` returns `r2_percentage`
2. `https://<gateway-project>.vercel.app/api/` returns the gateway status plus `r2_percentage`
3. The frontend Form page returns a prediction after "Fill sample"

The repo also contains a root `vercel.json` for Vercel's multi-service mode. Use it only if you want a single project on one domain. In that mode the frontend calls `/api` on the same domain and `VITE_API_URL` is not needed.

Notes:

- Keep `model_bundle.pkl` and the CSV inside `py/`, and pin `scikit-learn` in `requirements.txt` to the version that created the pickle.
- The first request after a period of inactivity can be slow while the Python function starts.

## Possible improvements

- Improve model quality with tree-based models and feature engineering
- Add tests for the API and form validation
- Add the remaining dataset features, such as month and visitor type

## License

Add a license of your choice, for example MIT.
