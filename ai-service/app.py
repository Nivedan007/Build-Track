from datetime import datetime, timedelta
from pathlib import Path

import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="BuildTrack AI Service", version="1.0.0")

MODEL_PATH = Path(__file__).resolve().parent / "model" / "delay_model.pkl"
EFFICIENCY_MODEL_PATH = Path(__file__).resolve().parent / "model" / "efficiency_model.pkl"
COST_MODEL_PATH = Path(__file__).resolve().parent / "model" / "cost_risk_model.pkl"
SAFETY_MODEL_PATH = Path(__file__).resolve().parent / "model" / "safety_risk_model.pkl"
EQUIPMENT_MODEL_PATH = Path(__file__).resolve().parent / "model" / "equipment_model.pkl"

model = None
if MODEL_PATH.exists():
    model = joblib.load(MODEL_PATH)

efficiency_model = None
if EFFICIENCY_MODEL_PATH.exists():
    efficiency_model = joblib.load(EFFICIENCY_MODEL_PATH)

cost_model = None
if COST_MODEL_PATH.exists():
    cost_model = joblib.load(COST_MODEL_PATH)

safety_model = None
if SAFETY_MODEL_PATH.exists():
    safety_model = joblib.load(SAFETY_MODEL_PATH)

equipment_model = None
if EQUIPMENT_MODEL_PATH.exists():
    equipment_model = joblib.load(EQUIPMENT_MODEL_PATH)


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


class CostRiskInput(BaseModel):
    projectBudget: float = Field(..., ge=1000)
    durationDays: int = Field(..., ge=1)
    taskCount: int = Field(..., ge=1)
    highPriorityTaskCount: int = Field(..., ge=0)
    averageAttendanceRate: float = Field(..., ge=0, le=1)
    weatherRisk: float = Field(..., ge=0, le=1)
    materialShortages: int = Field(..., ge=0)


class SafetyRiskInput(BaseModel):
    workerCount: int = Field(..., ge=1)
    overtimeHoursAverage: float = Field(..., ge=0, le=24)
    safetyCertRate: float = Field(..., ge=0, le=1)
    weatherSeverity: float = Field(..., ge=0, le=1)
    scaffoldingActivity: float = Field(..., ge=0, le=1)
    heavyMachineryCount: int = Field(..., ge=0)
    lastSafetyAuditDays: int = Field(..., ge=0)


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "modelLoaded": model is not None,
        "efficiencyModelLoaded": efficiency_model is not None,
        "costModelLoaded": cost_model is not None,
        "safetyModelLoaded": safety_model is not None,
        "equipmentModelLoaded": equipment_model is not None,
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


@app.post("/predict-cost-overrun")
def predict_cost_overrun(payload: CostRiskInput) -> dict:
    if cost_model is None:
        return {
            "message": "Model not loaded. Run train.py first.",
            "costOverrunProbability": 0.0,
            "expectedOverrunPercent": 0.0,
            "riskBand": "LOW",
            "mitigationActions": ["Run train.py to initialize AI capabilities."]
        }

    values = np.array(
        [[
            payload.projectBudget,
            payload.durationDays,
            payload.taskCount,
            payload.highPriorityTaskCount,
            payload.averageAttendanceRate,
            payload.weatherRisk,
            payload.materialShortages,
        ]]
    )

    raw_prediction = float(cost_model.predict(values)[0])
    cost_overrun_prob = max(0.0, min(1.0, raw_prediction))

    expected_overrun_pct = round(cost_overrun_prob * 35.0, 2)
    
    actions = []
    priority_ratio = payload.highPriorityTaskCount / max(1, payload.taskCount)
    
    if payload.materialShortages > 3:
        actions.append("Audit vendor supply chains and source alternative suppliers")
    if payload.averageAttendanceRate < 0.75:
        actions.append("Implement automated attendance tracking and daily labor incentives")
    if payload.weatherRisk > 0.6:
        actions.append("Schedule weather-contingent buffer periods in the project plan")
    if priority_ratio > 0.2:
        actions.append("De-escalate non-critical tasks to reallocate budget to key blockers")
    if payload.durationDays < 60 and cost_overrun_prob > 0.4:
        actions.append("Extend the project timeline slightly to avoid fast-tracking penalties")
    
    if not actions:
        actions.append("Maintain existing cost control monitors and audit bi-weekly")

    return {
        "costOverrunProbability": round(cost_overrun_prob, 4),
        "expectedOverrunPercent": expected_overrun_pct,
        "riskBand": "HIGH" if cost_overrun_prob > 0.6 else "MEDIUM" if cost_overrun_prob > 0.3 else "LOW",
        "mitigationActions": actions[:4]
    }


@app.post("/predict-safety-risk")
def predict_safety_risk(payload: SafetyRiskInput) -> dict:
    if safety_model is None:
        return {
            "message": "Model not loaded. Run train.py first.",
            "safetyIncidentProbability": 0.0,
            "riskBand": "LOW",
            "preventativeRecommendations": ["Run train.py to initialize AI compliance checks."]
        }

    values = np.array(
        [[
            payload.workerCount,
            payload.overtimeHoursAverage,
            payload.safetyCertRate,
            payload.weatherSeverity,
            payload.scaffoldingActivity,
            payload.heavyMachineryCount,
            payload.lastSafetyAuditDays,
        ]]
    )

    raw_prediction = float(safety_model.predict(values)[0])
    safety_prob = max(0.0, min(1.0, raw_prediction))

    recommendations = []
    if payload.safetyCertRate < 0.8:
        recommendations.append("Mandate emergency safety refresher briefing for uncertified workers")
    if payload.overtimeHoursAverage > 6.0:
        recommendations.append("Enforce shift duration caps and fatigue management rest breaks")
    if payload.weatherSeverity > 0.6:
        recommendations.append("Suspend outdoor heavy lifts and high-altitude scaffolding activities")
    if payload.scaffoldingActivity > 0.5 and payload.safetyCertRate < 0.9:
        recommendations.append("Double-check all fall-arrest harnesses and scaffold certifications")
    if payload.lastSafetyAuditDays > 14:
        recommendations.append("Conduct a site-wide safety walkabout immediately (audit overdue)")
    if payload.heavyMachineryCount > 5:
        recommendations.append("Establish dedicated exclusion zones and spotters for heavy plant operations")

    if not recommendations:
        recommendations.append("Continue regular safety audits and standard tool-box talks")

    return {
        "safetyIncidentProbability": round(safety_prob, 4),
        "riskBand": "HIGH" if safety_prob > 0.45 else "MEDIUM" if safety_prob > 0.20 else "LOW",
        "preventativeRecommendations": recommendations[:4]
    }


class EquipmentFailureInput(BaseModel):
    operatingHours: int = Field(..., ge=0)
    vibrationLevel: float = Field(..., ge=0)
    oilQuality: float = Field(..., ge=0, le=1)
    engineTemperature: float = Field(..., ge=0)
    equipmentAge: int = Field(..., ge=0)
    daysSinceLastMaintenance: int = Field(..., ge=0)
    overloadEvents: int = Field(..., ge=0)


@app.post("/predict-equipment-failure")
def predict_equipment_failure(payload: EquipmentFailureInput) -> dict:
    if equipment_model is None:
        return {
            "message": "Equipment model not loaded. Run train.py first.",
            "failureProbability": 0.0,
            "riskBand": "LOW",
            "recommendedAction": "Status normal.",
            "criticalComponent": "None"
        }

    values = np.array(
        [[
            payload.operatingHours,
            payload.vibrationLevel,
            payload.oilQuality,
            payload.engineTemperature,
            payload.equipmentAge,
            payload.daysSinceLastMaintenance,
            payload.overloadEvents,
        ]]
    )

    raw_prediction = equipment_model.predict_proba(values)[0][1]
    failure_prob = max(0.0, min(1.0, float(raw_prediction)))

    actions = []
    component = "None"
    
    if failure_prob > 0.70:
        if payload.vibrationLevel > 8.0:
            component = "Hydraulics & Bearings"
            actions.append("HALT OPERATION: Extreme vibration detected. Inspect bearings and hydraulic pistons immediately.")
        elif payload.engineTemperature > 105.0:
            component = "Engine Cooling System"
            actions.append("HALT OPERATION: Overheating danger. Inspect coolant levels, radiator fan, and engine oil.")
        else:
            component = "System Core"
            actions.append("CRITICAL: Schedule emergency comprehensive mechanic teardown and testing.")
    elif failure_prob > 0.35:
        if payload.oilQuality > 0.75:
            component = "Lubrication Circuit"
            actions.append("URGENT: Change oil filter, flush lines, and renew engine oil before next shift.")
        elif payload.daysSinceLastMaintenance > 120:
            component = "Scheduled Maintenance"
            actions.append("URGENT: General maintenance window is overdue. Schedule service within 48 operating hours.")
        elif payload.overloadEvents > 8:
            component = "Structural joints"
            actions.append("WARNING: Excessive stress cycles. Conduct ultrasonic crack check on structural joints.")
        else:
            component = "System Ancillaries"
            actions.append("WARNING: Degraded performance. Schedule standard inspection within 3 operational days.")
    else:
        actions.append("CONTINUE OPERATION: All diagnostic metrics within acceptable tolerances. Maintain standard daily inspection log.")

    return {
        "failureProbability": round(failure_prob, 4),
        "riskBand": "HIGH" if failure_prob > 0.65 else "MEDIUM" if failure_prob > 0.30 else "LOW",
        "recommendedAction": actions[0],
        "criticalComponent": component
    }

