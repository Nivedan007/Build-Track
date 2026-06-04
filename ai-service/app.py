from datetime import datetime, timedelta
from pathlib import Path

import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="BuildTrack AI Service", version="1.0.0")

MODEL_PATH = Path(__file__).resolve().parent / "model" / "delay_model.pkl"
EFFICIENCY_MODEL_PATH = Path(__file__).resolve().parent / "model" / "efficiency_model.pkl"

model = None
if MODEL_PATH.exists():
    model = joblib.load(MODEL_PATH)

efficiency_model = None
if EFFICIENCY_MODEL_PATH.exists():
    efficiency_model = joblib.load(EFFICIENCY_MODEL_PATH)


class DelayInput(BaseModel):
    weatherRisk: float = Field(..., ge=0, le=1)
    pastDelays: int = Field(..., ge=0)
    attendanceRate: float = Field(..., ge=0, le=1)
    materialShortages: int = Field(..., ge=0)
    currentProgress: float = Field(..., ge=0, le=100)


class EfficiencyInput(BaseModel):
    weatherRisk: float = Field(..., ge=0, le=1)
    crewUtilization: float = Field(..., ge=0, le=1)
    materialReadiness: float = Field(..., ge=0, le=1)
    taskBacklog: int = Field(..., ge=0)
    overtimeHours: float = Field(..., ge=0, le=24)
    currentProgress: float = Field(..., ge=0, le=100)
    skillMatch: float = Field(..., ge=0, le=1)


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


@app.post("/optimize-workflow")
def optimize_workflow(payload: EfficiencyInput) -> dict:
    values = np.array(
        [[
            payload.weatherRisk,
            payload.crewUtilization,
            payload.materialReadiness,
            payload.taskBacklog,
            payload.overtimeHours,
            payload.currentProgress,
            payload.skillMatch,
        ]]
    )

    if efficiency_model is not None:
        raw_score = float(efficiency_model.predict(values)[0])
    else:
        raw_score = (
            payload.crewUtilization * 28
            + payload.materialReadiness * 22
            + payload.skillMatch * 16
            + (1 - payload.weatherRisk) * 14
            + (1 - min(payload.taskBacklog, 25) / 25) * 10
            + (1 - min(payload.overtimeHours, 24) / 24) * 6
            + (payload.currentProgress / 100) * 4
        )

    efficiency_score = max(0.0, min(100.0, raw_score))
    target_crew = int(round(4 + (payload.taskBacklog / 8) + (payload.weatherRisk * 2)))
    target_overtime = max(0, min(12, int(round((100 - efficiency_score) / 14))))

    actions = []
    if payload.materialReadiness < 0.7:
        actions.append("Lock supplier deliveries for critical materials")
    if payload.crewUtilization < 0.75:
        actions.append("Rebalance site crew assignments to reduce idle time")
    if payload.taskBacklog > 10:
        actions.append("Split backlog into smaller work packets and prioritize blockers")
    if payload.weatherRisk > 0.55:
        actions.append("Move weather-sensitive tasks earlier in the shift")
    if payload.skillMatch < 0.7:
        actions.append("Assign a senior lead or coach to the lowest-match crew")
    if payload.overtimeHours > 8:
        actions.append("Cap overtime and shift to better-rested crews")

    if not actions:
        actions.append("Keep the current plan and monitor the next 48 hours")

    return {
        "efficiencyScore": round(efficiency_score, 2),
        "efficiencyBand": "HIGH" if efficiency_score >= 80 else "MEDIUM" if efficiency_score >= 60 else "LOW",
        "recommendedCrewSize": max(2, target_crew),
        "recommendedOvertimeHours": target_overtime,
        "expectedProductivityGain": round(min(18.0, max(0.0, 100 - efficiency_score) * 0.18), 2),
        "priorityActions": actions[:5],
        "bottlenecks": [
            {
                "label": "Materials",
                "risk": round((1 - payload.materialReadiness) * 100, 2)
            },
            {
                "label": "Crew",
                "risk": round((1 - payload.crewUtilization) * 100, 2)
            },
            {
                "label": "Weather",
                "risk": round(payload.weatherRisk * 100, 2)
            }
        ]
    }
