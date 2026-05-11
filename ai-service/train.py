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
    print("Model training complete. Saved to ai-service/model/delay_model.pkl")


if __name__ == "__main__":
    main()
