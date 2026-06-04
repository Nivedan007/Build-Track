from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
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

    print("Model training complete. Saved to ai-service/model/delay_model.pkl")
    print("Efficiency optimizer complete. Saved to ai-service/model/efficiency_model.pkl")
    print("Cost risk model complete. Saved to ai-service/model/cost_risk_model.pkl")


if __name__ == "__main__":
    main()
