import logging
import os
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from sklearn.model_selection import train_test_split

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Bulletproof CORS for Vercel Serverless
# This ensures CORS headers are attached to EVERY response, even 500 errors.
@app.after_request
def add_cors_headers(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response

BASE_DIR = Path(__file__).parent
ARTIFACT_DIR = Path("/tmp") if os.environ.get("VERCEL") else BASE_DIR
CSV_PATH = BASE_DIR / "online_shoppers_intention.csv"
BUNDLE_PATH = ARTIFACT_DIR / "model_bundle.pkl"

FEATURES = [
    "Administrative", "Administrative_Duration",
    "Informational", "Informational_Duration",
    "ProductRelated", "ProductRelated_Duration",
    "BounceRates", "ExitRates",
]
TARGET = "PageValues"
RATE_FIELDS = ("BounceRates", "ExitRates")

_bundle = None  # {"model": LinearRegression, "r2_pct": float}


def train_bundle():
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"Dataset missing: {CSV_PATH}")

    df = pd.read_csv(CSV_PATH, usecols=FEATURES + [TARGET])
    X_train, X_test, y_train, y_test = train_test_split(
        df[FEATURES], df[TARGET], test_size=0.2, random_state=42
    )

    model = LinearRegression().fit(X_train, y_train)
    r2_pct = round(float(r2_score(y_test, model.predict(X_test))) * 100, 2)

    bundle = {"model": model, "r2_pct": r2_pct}
    joblib.dump(bundle, BUNDLE_PATH)
    return bundle


def get_bundle():
    """Lazy-load once; train only if no saved artifact exists."""
    global _bundle
    if _bundle is None:
        _bundle = joblib.load(BUNDLE_PATH) if BUNDLE_PATH.exists() else train_bundle()
        logger.info("Model ready (R² = %.2f%%)", _bundle["r2_pct"])
    return _bundle


@app.route("/", methods=["GET", "OPTIONS"])
def health():
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    try:
        return jsonify(r2_percentage=f"{get_bundle()['r2_pct']}%"), 200
    except Exception as e:
        logger.exception("Model initialization failed")
        return jsonify(error=str(e)), 500


@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    try:
        bundle = get_bundle()
    except Exception as e:
        logger.exception("Model initialization failed")
        # Returning the actual exception string helps debug if Vercel failed to load the CSV
        return jsonify(error=str(e)), 500

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify(error="Invalid or missing JSON body"), 400

    try:
        row = [float(data.get(f, 0)) for f in FEATURES]
    except (ValueError, TypeError):
        return jsonify(error="All fields must be numeric"), 400

    values = dict(zip(FEATURES, row))
    for field in RATE_FIELDS:
        if not 0 <= values[field] <= 1:
            return jsonify(error=f"{field} must be between 0 and 1"), 400

    pred = bundle["model"].predict(pd.DataFrame([row], columns=FEATURES))[0]
    return jsonify(
        predicted_page_value=round(max(0.0, float(pred)), 4),
        r2_percentage=f"{bundle['r2_pct']}%",
    ), 200


app_obj = app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
