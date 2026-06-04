from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split


def generate_dataset(n: int = 1200) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    weather_risk = rng.uniform(0, 1, n)
    past_delays = rng.integers(0, 10, n)
    attendance_rate = rng.uniform(0.55, 1.0, n)
    material_shortages = rng.integers(0, 8, n)
    current_progress = rng.uniform(5, 95, n)

    delay_probability = (
        0.30 * weather_risk
        + 0.20 * (past_delays / 10)
        + 0.25 * (1 - attendance_rate)
        + 0.15 * (material_shortages / 8)
        + 0.10 * (1 - (current_progress / 100))
    )

    delay_probability = np.clip(delay_probability + rng.normal(0, 0.03, n), 0, 1)

    return pd.DataFrame(
        {
            "weatherRisk": weather_risk,
            "pastDelays": past_delays,
            "attendanceRate": attendance_rate,
            "materialShortages": material_shortages,
            "currentProgress": current_progress,
            "delayProbability": delay_probability,
        }
    )


def generate_efficiency_dataset(n: int = 1200) -> pd.DataFrame:
    rng = np.random.default_rng(84)
    weather_risk = rng.uniform(0, 1, n)
    crew_utilization = rng.uniform(0.45, 1.0, n)
    material_readiness = rng.uniform(0.35, 1.0, n)
    task_backlog = rng.integers(0, 25, n)
    overtime_hours = rng.uniform(0, 16, n)
    current_progress = rng.uniform(5, 95, n)
    skill_match = rng.uniform(0.45, 1.0, n)

    efficiency_score = (
        0.28 * crew_utilization
        + 0.22 * material_readiness
        + 0.16 * skill_match
        + 0.14 * (1 - weather_risk)
        + 0.10 * (1 - (task_backlog / 25))
        + 0.06 * (1 - (overtime_hours / 16))
        + 0.04 * (current_progress / 100)
    )

    efficiency_score = np.clip((efficiency_score + rng.normal(0, 0.03, n)) * 100, 0, 100)

    return pd.DataFrame(
        {
            "weatherRisk": weather_risk,
            "crewUtilization": crew_utilization,
            "materialReadiness": material_readiness,
            "taskBacklog": task_backlog,
            "overtimeHours": overtime_hours,
            "currentProgress": current_progress,
            "skillMatch": skill_match,
            "efficiencyScore": efficiency_score,
        }
    )


def generate_cost_risk_dataset(n: int = 1200) -> pd.DataFrame:
    rng = np.random.default_rng(168)
    project_budget = rng.uniform(100000, 10000000, n)
    duration_days = rng.integers(30, 365, n)
    task_count = rng.integers(5, 100, n)
    high_priority_task_count = np.array([rng.integers(0, max(1, tc // 4), 1)[0] for tc in task_count])
    average_attendance_rate = rng.uniform(0.5, 1.0, n)
    weather_risk = rng.uniform(0, 1, n)
    material_shortages = rng.integers(0, 10, n)

    priority_ratio = high_priority_task_count / np.maximum(1, task_count)
    cost_risk = (
        0.15 * (1 - average_attendance_rate)
        + 0.20 * weather_risk
        + 0.25 * (material_shortages / 10)
        + 0.20 * priority_ratio
        + 0.10 * (np.minimum(duration_days, 180) / 180)
        + 0.10 * (1 - np.minimum(project_budget, 1000000) / 1000000)
    )

    cost_risk = np.clip(cost_risk + rng.normal(0, 0.03, n), 0, 1)

    return pd.DataFrame(
        {
            "projectBudget": project_budget,
            "durationDays": duration_days,
            "taskCount": task_count,
            "highPriorityTaskCount": high_priority_task_count,
            "averageAttendanceRate": average_attendance_rate,
            "weatherRisk": weather_risk,
            "materialShortages": material_shortages,
            "costOverrunProbability": cost_risk,
        }
    )


def generate_safety_risk_dataset(n: int = 1200) -> pd.DataFrame:
    rng = np.random.default_rng(210)
    worker_count = rng.integers(10, 300, n)
    overtime_hours_average = rng.uniform(0, 12, n)
    safety_cert_rate = rng.uniform(0.4, 1.0, n)
    weather_severity = rng.uniform(0.0, 1.0, n)
    scaffolding_activity = rng.choice([0.0, 1.0], size=n, p=[0.6, 0.4])
    heavy_machinery_count = rng.integers(0, 10, n)
    last_safety_audit_days = rng.integers(0, 30, n)

    safety_risk = (
        0.20 * (worker_count / 300)
        + 0.18 * (overtime_hours_average / 12)
        + 0.22 * (1 - safety_cert_rate)
        + 0.15 * weather_severity
        + 0.12 * scaffolding_activity
        + 0.08 * (heavy_machinery_count / 10)
        + 0.05 * (last_safety_audit_days / 30)
    )

    safety_risk = np.clip(safety_risk + rng.normal(0, 0.03, n), 0, 1)

    return pd.DataFrame(
        {
            "workerCount": worker_count,
            "overtimeHoursAverage": overtime_hours_average,
            "safetyCertRate": safety_cert_rate,
            "weatherSeverity": weather_severity,
            "scaffoldingActivity": scaffolding_activity,
            "heavyMachineryCount": heavy_machinery_count,
            "lastSafetyAuditDays": last_safety_audit_days,
            "safetyIncidentProbability": safety_risk,
        }
    )


def generate_equipment_dataset(n: int = 1200) -> pd.DataFrame:
    rng = np.random.default_rng(256)
    operating_hours = rng.integers(100, 10000, n)
    vibration_level = rng.uniform(0.5, 12.0, n)
    oil_quality = rng.uniform(0.0, 1.0, n)
    engine_temp = rng.uniform(55.0, 115.0, n)
    equipment_age = rng.integers(0, 12, n)
    days_since_maintenance = rng.integers(0, 150, n)
    overload_events = rng.integers(0, 15, n)

    failure_risk = (
        0.15 * (operating_hours / 10000)
        + 0.20 * (vibration_level / 12.0)
        + 0.15 * oil_quality
        + 0.20 * ((engine_temp - 55) / 60.0)
        + 0.10 * (equipment_age / 12.0)
        + 0.10 * (days_since_maintenance / 150.0)
        + 0.10 * (overload_events / 15.0)
    )
    failure_risk = np.clip(failure_risk + rng.normal(0, 0.02, n), 0, 1)
    failure = (failure_risk > 0.55).astype(int)

    return pd.DataFrame({
        "operatingHours": operating_hours,
        "vibrationLevel": vibration_level,
        "oilQuality": oil_quality,
        "engineTemperature": engine_temp,
        "equipmentAge": equipment_age,
        "daysSinceLastMaintenance": days_since_maintenance,
        "overloadEvents": overload_events,
        "failure": failure
    })


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    model_dir = base_dir / "model"
    dataset_dir = base_dir / "dataset"
    model_dir.mkdir(parents=True, exist_ok=True)
    dataset_dir.mkdir(parents=True, exist_ok=True)

    data = generate_dataset()
    data.to_csv(dataset_dir / "construction_delays.csv", index=False)

    features = [
        "weatherRisk",
        "pastDelays",
        "attendanceRate",
        "materialShortages",
        "currentProgress",
    ]

    X = data[features]
    y = data["delayProbability"]

    X_train, X_test, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=220, random_state=42)
    model.fit(X_train, y_train)

    joblib.dump(model, model_dir / "delay_model.pkl")

    efficiency_data = generate_efficiency_dataset()
    efficiency_features = [
        "weatherRisk",
        "crewUtilization",
        "materialReadiness",
        "taskBacklog",
        "overtimeHours",
        "currentProgress",
        "skillMatch",
    ]

    X_eff = efficiency_data[efficiency_features]
    y_eff = efficiency_data["efficiencyScore"]
    X_eff_train, _, y_eff_train, _ = train_test_split(X_eff, y_eff, test_size=0.2, random_state=84)

    efficiency_model = RandomForestRegressor(n_estimators=260, random_state=84)
    efficiency_model.fit(X_eff_train, y_eff_train)

    joblib.dump(efficiency_model, model_dir / "efficiency_model.pkl")

    cost_data = generate_cost_risk_dataset()
    cost_data.to_csv(dataset_dir / "construction_costs.csv", index=False)

    cost_features = [
        "projectBudget",
        "durationDays",
        "taskCount",
        "highPriorityTaskCount",
        "averageAttendanceRate",
        "weatherRisk",
        "materialShortages",
    ]

    X_cost = cost_data[cost_features]
    y_cost = cost_data["costOverrunProbability"]
    X_cost_train, _, y_cost_train, _ = train_test_split(X_cost, y_cost, test_size=0.2, random_state=168)

    cost_model = RandomForestRegressor(n_estimators=240, random_state=168)
    cost_model.fit(X_cost_train, y_cost_train)

    joblib.dump(cost_model, model_dir / "cost_risk_model.pkl")

    safety_data = generate_safety_risk_dataset()
    safety_data.to_csv(dataset_dir / "construction_safety.csv", index=False)

    safety_features = [
        "workerCount",
        "overtimeHoursAverage",
        "safetyCertRate",
        "weatherSeverity",
        "scaffoldingActivity",
        "heavyMachineryCount",
        "lastSafetyAuditDays",
    ]

    X_safety = safety_data[safety_features]
    y_safety = safety_data["safetyIncidentProbability"]
    X_safety_train, _, y_safety_train, _ = train_test_split(X_safety, y_safety, test_size=0.2, random_state=210)

    safety_model = RandomForestRegressor(n_estimators=250, random_state=210)
    safety_model.fit(X_safety_train, y_safety_train)

    joblib.dump(safety_model, model_dir / "safety_risk_model.pkl")

    # Equipment predictive maintenance model
    equipment_data = generate_equipment_dataset()
    equipment_data.to_csv(dataset_dir / "equipment_telemetry.csv", index=False)

    equipment_features = [
        "operatingHours",
        "vibrationLevel",
        "oilQuality",
        "engineTemperature",
        "equipmentAge",
        "daysSinceLastMaintenance",
        "overloadEvents",
    ]

    X_eq = equipment_data[equipment_features]
    y_eq = equipment_data["failure"]
    X_eq_train, _, y_eq_train, _ = train_test_split(X_eq, y_eq, test_size=0.2, random_state=256)

    equipment_model = GradientBoostingClassifier(n_estimators=200, random_state=256)
    equipment_model.fit(X_eq_train, y_eq_train)

    joblib.dump(equipment_model, model_dir / "equipment_model.pkl")

    print("Model training complete. Saved to ai-service/model/delay_model.pkl")
    print("Efficiency optimizer complete. Saved to ai-service/model/efficiency_model.pkl")
    print("Cost risk model complete. Saved to ai-service/model/cost_risk_model.pkl")
    print("Safety incident risk model complete. Saved to ai-service/model/safety_risk_model.pkl")
    print("Equipment predictive maintenance model complete. Saved to ai-service/model/equipment_model.pkl")


if __name__ == "__main__":
    main()
