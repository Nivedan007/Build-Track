from datetime import datetime, timedelta
from pathlib import Path

import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="BuildTrack AI Service", version="1.0.0")

MODEL_PATH = Path(__file__).resolve().parent / "model" / "delay_model.pkl"

model = None
if MODEL_PATH.exists():
    model = joblib.load(MODEL_PATH)


class DelayInput(BaseModel):
    weatherRisk: float = Field(..., ge=0, le=1)
    pastDelays: int = Field(..., ge=0)
    attendanceRate: float = Field(..., ge=0, le=1)
    materialShortages: int = Field(..., ge=0)
    currentProgress: float = Field(..., ge=0, le=100)


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "modelLoaded": model is not None,
        "service": "buildtrack-ai"
    }


@app.post("/predict-delay")
def predict_delay(payload: DelayInput) -> dict:
    if model is None:
        return {
            "message": "Model not loaded. Run train.py first.",
            "delayProbability": 0.0,
            "estimatedCompletionDate": datetime.utcnow().date().isoformat()
        }

    values = np.array(
        [
            [
                payload.weatherRisk,
                payload.pastDelays,
                payload.attendanceRate,
                payload.materialShortages,
                payload.currentProgress,
            ]
        ]
    )

    raw_prediction = float(model.predict(values)[0])
    delay_probability = max(0.0, min(1.0, raw_prediction))

    delay_days = int(round(delay_probability * 45))
    estimated_completion = datetime.utcnow().date() + timedelta(days=delay_days)

    return {
        "delayProbability": round(delay_probability, 4),
        "estimatedCompletionDate": estimated_completion.isoformat(),
        "riskBand": "HIGH" if delay_probability > 0.65 else "MEDIUM" if delay_probability > 0.35 else "LOW"
    }
