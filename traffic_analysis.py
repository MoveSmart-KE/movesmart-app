import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import lightgbm as lgb
import xgboost as xgb
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.preprocessing import LabelEncoder
import joblib
import os
import json

def generate_traffic_data(filename="traffic_log.csv", num_rows=1000):
    """Generates a synthetic traffic log CSV file with rush hour simulation."""
    with open(filename, "w") as f:
        f.write("timestamp,latitude,longitude,road_class,current_speed,free_flow_speed,congestion,confidence\n")
        
        start_time = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        lat, lon = -1.107, 37.0151
        road_classes = ["FRC2", "FRC3", "FRC4", "FRC5"]
        
        for i in range(num_rows):
            timestamp = start_time + timedelta(minutes=i*10)
            hour_of_day = timestamp.hour
            
            lat += np.random.uniform(-0.001, 0.001)
            lon += np.random.uniform(-0.001, 0.001)
            
            road_class = np.random.choice(road_classes)
            free_flow_speed = np.random.randint(60, 100)
            
            is_rush_hour = (7 <= hour_of_day <= 9) or (16 <= hour_of_day <= 18)
            
            if is_rush_hour:
                p = [0.1, 0.2, 0.3, 0.3, 0.1]
            else:
                p = [0.6, 0.3, 0.05, 0.05, 0.0]
            
            congestion_type = np.random.choice(['none', 'light', 'moderate', 'heavy', 'standstill'], p=p)

            if congestion_type == 'standstill':
                congestion = 1.0
                current_speed = np.random.randint(0, 5)
            elif congestion_type == 'heavy':
                congestion = np.random.uniform(0.6, 0.9)
                current_speed = np.random.randint(5, free_flow_speed * 0.4)
            elif congestion_type == 'moderate':
                congestion = np.random.uniform(0.3, 0.6)
                current_speed = np.random.randint(free_flow_speed * 0.4, free_flow_speed * 0.7)
            elif congestion_type == 'light':
                congestion = np.random.uniform(0.1, 0.3)
                current_speed = np.random.randint(free_flow_speed * 0.7, free_flow_speed * 0.9)
            else: # 'none'
                congestion = 0.0
                current_speed = free_flow_speed - np.random.randint(0, 10)

            current_speed = max(0, min(current_speed, free_flow_speed))
            
            confidence = 1

            f.write(f"{timestamp.isoformat()},{lat},{lon},{road_class},{current_speed},{free_flow_speed},{congestion:.2f},{confidence}\n")
    print(f"Generated {num_rows} rows of realistic synthetic data in '{filename}'")

def log_results(model_name, task, r2, mse, mae, rmse, notes):
    """Appends model performance metrics to the log file."""
    with open("model_performance_log.md", "a") as f:
        f.write(f"| {model_name} | {task} | {r2:.2f} | {mse:.2f} | {mae:.2f} | {rmse:.2f} | {notes} |\n")

def run_analysis():
    """Loads, preprocesses, trains, and evaluates traffic models."""
    
    # Create a directory to save the models
    os.makedirs("saved_models", exist_ok=True)

    # Load the dataset
    try:
        df = pd.read_csv("traffic_log.csv")
    except FileNotFoundError:
        print("Error: traffic_log.csv not found. Please generate the data first.")
        return

    # --- Preprocessing ---
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['is_weekend'] = (df['timestamp'].dt.dayofweek >= 5).astype(int)
    df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 23.0)
    df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 23.0)
    le = LabelEncoder()
    df['road_class_encoded'] = le.fit_transform(df['road_class'])
    joblib.dump(le, "saved_models/label_encoder.joblib")

    # --- Feature Engineering ---
    print("Brewing new interaction and lag features...")
    df['lat_x_lon'] = df['latitude'] * df['longitude']
    df['lat_x_hour_sin'] = df['latitude'] * df['hour_sin']
    df['lon_x_hour_cos'] = df['longitude'] * df['hour_cos']
    df['congestion_lag_1'] = df['congestion'].shift(1).fillna(0)
    df['speed_lag_1'] = df['current_speed'].shift(1).fillna(0)
    
    # --- STAGE 1: TRAIN CONGESTION MODEL ---
    print("\n--- STAGE 1: Training Congestion Model ---")
    congestion_features = [
        'latitude', 'longitude', 'road_class_encoded', 'free_flow_speed', 
        'day_of_week', 'is_weekend', 'hour_sin', 'hour_cos',
        'lat_x_lon', 'lat_x_hour_sin', 'lon_x_hour_cos',
        'congestion_lag_1', 'speed_lag_1'
    ]
    
    X_c = df[congestion_features]
    y_c = df['congestion']
    
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_c, y_c, test_size=0.2, random_state=42)
    
    xgb_param_grid = {
        'n_estimators': [100, 200, 300, 500],
        'max_depth': [3, 5, 7, 9],
        'learning_rate': [0.01, 0.05, 0.1],
        'subsample': [0.7, 0.8, 0.9, 1.0],
        'colsample_bytree': [0.7, 0.8, 0.9, 1.0],
        'gamma': [0, 0.1, 0.2]
    }

    congestion_model = train_and_save_model(
        xgb.XGBRegressor(random_state=42), xgb_param_grid, "xgb", "congestion", 
        X_train_c, y_train_c, X_test_c, y_test_c, n_iter=100
    )

    # --- STAGE 2: ENRICH DATA AND TRAIN SPEED MODEL ---
    print("\n--- STAGE 2: Training Speed Model with Predicted Congestion ---")
    
    # Create the magic feature!
    df['predicted_congestion'] = congestion_model.predict(X_c)

    speed_features = [
        'latitude', 'longitude', 'road_class_encoded', 'free_flow_speed', 
        'day_of_week', 'is_weekend', 'hour_sin', 'hour_cos',
        'lat_x_lon', 'lat_x_hour_sin', 'lon_x_hour_cos',
        'congestion_lag_1', 'speed_lag_1',
        'predicted_congestion'  # The new, powerful feature!
    ]

    X_s = df[speed_features]
    y_s = df['current_speed']

    X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(X_s, y_s, test_size=0.2, random_state=42)

    train_and_save_model(
        xgb.XGBRegressor(random_state=42), xgb_param_grid, "xgb", "speed", 
        X_train_s, y_train_s, X_test_s, y_test_s, n_iter=100
    )


def train_and_save_model(estimator, param_grid, model_prefix, task_name, X_train, y_train, X_test, y_test, n_iter=20):
    """
    Performs RandomizedSearchCV, evaluates, saves a model, and returns the best model.
    """
    print(f"\n--- Tuning {model_prefix.upper()} for {task_name.capitalize()} ---")
    
    random_search = RandomizedSearchCV(estimator=estimator, param_distributions=param_grid, n_iter=n_iter, cv=3, verbose=1, random_state=42, n_jobs=-1)
    random_search.fit(X_train, y_train)

    print(f"Best parameters found: {random_search.best_params_}")
    best_model = random_search.best_estimator_
    y_pred = best_model.predict(X_test)

    # Calculate metrics
    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mse)

    print(f"R-squared: {r2:.2f}")
    print(f"Mean Squared Error: {mse:.2f}")
    print(f"Mean Absolute Error: {mae:.2f}")
    print(f"Root Mean Squared Error: {rmse:.2f}")
    
    # Log and Save everything
    model_name = f"Tuned {model_prefix.upper()} ({task_name})"
    notes = "Chained model with lag/interaction features"
    log_results(model_name, task_name.capitalize(), r2, mse, mae, rmse, notes)
    
    base_filename = f"saved_models/{model_prefix}_{task_name}"
    
    joblib.dump(best_model, f"{base_filename}_regressor.joblib")
    joblib.dump(X_train.columns.tolist(), f"{base_filename}_features.joblib") # Save the specific features for this model
    with open(f"{base_filename}_best_params.json", "w") as f:
        params = {k: (v.item() if isinstance(v, np.generic) else v) for k, v in random_search.best_params_.items()}
        json.dump(params, f)
    with open(f"{base_filename}_metrics.json", "w") as f:
        json.dump({"r2": r2, "mse": mse, "mae": mae, "rmse": rmse}, f)
    
    print(f"Successfully saved {model_prefix.upper()} model and artifacts for {task_name.capitalize()}.")
    
    return best_model


if __name__ == "__main__":
    generate_traffic_data(filename="/home/pseudo/Documents/exp/traffic_log.csv")
    run_analysis()


