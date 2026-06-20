# StackPredict

StackPredict is a three-tier web application that predicts **online shopper purchasing intention** using a machine learning model. The project is split across three repositories, each handling a different layer of the stack.

| Layer | Repository | Stack | Live URL |
|---|---|---|---|
| Frontend | [StackPredict-front](https://github.com/Oscarv2005/StackPredict-front) | React + Vite | [stack-predict-front.vercel.app](https://stack-predict-front.vercel.app) |
| Backend (API gateway) | [StackPredict-back](https://github.com/Oscarv2005/StackPredict-back) | Node.js + Express | [stack-predict-back.vercel.app](https://stack-predict-back.vercel.app) |
| Machine Learning service | [StackPredict-py](https://github.com/Oscarv2005/StackPredict-py) | Python + Flask + scikit-learn | [stack-predict-py.vercel.app](https://stack-predict-py.vercel.app) |

## How it fits together

```
User → StackPredict-front (React UI)
          │
          ▼
     StackPredict-back (Express API)
          │  forwards requests via axios
          ▼
     StackPredict-py (Flask ML API)
          │  loads model.pkl / features.pkl
          ▼
      Prediction result → back → front → User
```

- **StackPredict-front** is the user-facing single-page app built with React and Vite. It collects shopper session data and displays the prediction result.
- **StackPredict-back** is a lightweight Express server that sits between the frontend and the ML service, handling routing, CORS, and environment configuration before forwarding requests to the Python API with `axios`.
- **StackPredict-py** is the prediction engine. It uses a scikit-learn model trained on the [Online Shoppers Purchasing Intention dataset](https://github.com/Oscarv2005/StackPredict-py/blob/main/online_shoppers_intention.csv) to predict whether a session will end in a purchase, and exposes the model through a Flask API.

## Repositories

### 🖥️ [StackPredict-front](https://github.com/Oscarv2005/StackPredict-front)
React + Vite frontend.
- `src/` – application source code
- `public/` – static assets
- Built and deployed on Vercel

### ⚙️ [StackPredict-back](https://github.com/Oscarv2005/StackPredict-back)
Node.js / Express backend that acts as the API gateway between the frontend and the ML service.
- `app.js` – Express server entry point
- Key dependencies: `express`, `cors`, `axios`, `dotenv`, `nodemon`
- Deployed on Vercel via `vercel.json`

### 🧠 [StackPredict-py](https://github.com/Oscarv2005/StackPredict-py)
Python service that trains and serves the purchasing-intention prediction model.
- `app.py` – Flask API entry point
- `model.pkl` / `features.pkl` – serialized trained model and feature list
- `online_shoppers_intention.csv` – training dataset
- `eda_special_day.png` – exploratory data analysis output
- Key dependencies: `flask`, `flask-cors`, `pandas`, `numpy`, `scikit-learn`, `seaborn`, `matplotlib`, `joblib`
- Deployed on Vercel via `vercel.json`

## Getting started locally

Clone all three repositories:

```bash
git clone https://github.com/Oscarv2005/StackPredict-front.git
git clone https://github.com/Oscarv2005/StackPredict-back.git
git clone https://github.com/Oscarv2005/StackPredict-py.git
```

**1. ML service (StackPredict-py)**
```bash
cd StackPredict-py
pip install -r requirements.txt
python app.py
```

**2. Backend (StackPredict-back)**
```bash
cd StackPredict-back
npm install
npm start
```

**3. Frontend (StackPredict-front)**
```bash
cd StackPredict-front
npm install
npm run dev
```

> Make sure the backend's environment variables (e.g. the ML service URL) are configured in a `.env` file so it can reach the Flask API.

## Author

Created by [Oscarv2005](https://github.com/Oscarv2005).
