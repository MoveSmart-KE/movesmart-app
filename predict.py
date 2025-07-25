import pandas as pd
import numpy as np
import joblib
from datetime import datetime

def make_predictions(data):
    """
    Predicts congestion and speed using the chained XGBoost model pipeline.

    Args:
        data (dict): A dictionary containing the raw input features.
                     Example: {
                         'timestamp': '2025-07-30T17:30:00',
                         'latitude': -1.125,
                         'longitude': 37.018,
                         'road_class': 'FRC4',
                         'free_flow_speed': 70,
                         'congestion_lag_1': 0.4, # Congestion from 10 mins ago
                         'speed_lag_1': 45       # Speed from 10 mins ago
                     }
                     Note: For a single prediction, lag features can be estimated
                     or set to a neutral value like 0 if unknown.

    Returns:
        dict: A dictionary containing the predicted congestion and speed.
              Example: {'predicted_congestion': 0.65, 'predicted_speed': 25.5}
    """
    # 1. Load all necessary artifacts from our glorious vault
    try:
        # General components
        label_encoder = joblib.load("saved_models/label_encoder.joblib")
        
        # Congestion model components
        congestion_model = joblib.load("saved_models/xgb_congestion_regressor.joblib")
        congestion_features = joblib.load("saved_models/xgb_congestion_features.joblib")

        # Speed model components
        speed_model = joblib.load("saved_models/xgb_speed_regressor.joblib")
        speed_features = joblib.load("saved_models/xgb_speed_features.joblib")

    except FileNotFoundError as e:
        print(f"Error: A required model file was not found. Did you run the training script? Details: {e}")
        return None

    # 2. Preprocess the input data into a DataFrame
    df = pd.DataFrame([data])
    
    # --- Perform the exact same feature engineering as in the training script ---
    # Basic time features
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['is_weekend'] = (df['timestamp'].dt.dayofweek >= 5).astype(int)
    df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 23.0)
    df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 23.0)
    
    # Categorical encoding
    df['road_class_encoded'] = label_encoder.transform(df['road_class'])

    # Interaction features
    df['lat_x_lon'] = df['latitude'] * df['longitude']
    df['lat_x_hour_sin'] = df['latitude'] * df['hour_sin']
    df['lon_x_hour_cos'] = df['longitude'] * df['hour_cos']

    # 3. --- STAGE 1: Predict Congestion ---
    # Ensure columns are in the correct order for the congestion model
    X_c = df[congestion_features]
    predicted_congestion = congestion_model.predict(X_c)[0]

    # 4. --- STAGE 2: Predict Speed ---
    # Add the output of stage 1 as a new feature for the speed model
    df['predicted_congestion'] = predicted_congestion
    
    # Ensure columns are in the correct order for the speed model
    X_s = df[speed_features]
    predicted_speed = speed_model.predict(X_s)[0]

    return {
        "predicted_congestion": round(predicted_congestion, 2),
        "predicted_speed": round(predicted_speed, 2)
    }

if __name__ == '__main__':
    # Example usage with new data for a simulated rush hour
    new_traffic_data = {
        'timestamp': '2025-07-30T17:45:00', # Evening rush hour
        'latitude': -1.125,
        'longitude': 37.018,
        'road_class': 'FRC4',
        'free_flow_speed': 70,
        'congestion_lag_1': 0.5, # Assuming we know it was congested 10 mins ago
        'speed_lag_1': 35      # Assuming we know speed was low 10 mins ago
    }

    predictions = make_predictions(new_traffic_data)

    if predictions:
        print("--- Model Predictions ---")
        print(f"Predicted Congestion Level: {predictions['predicted_congestion']}")
        print(f"Predicted Speed: {predictions['predicted_speed']} km/h")

    # Example for a non-rush hour prediction
    new_traffic_data_free_flow = {
        'timestamp': '2025-07-30T03:00:00', # Middle of the night
        'latitude': -1.107,
        'longitude': 37.015,
        'road_class': 'FRC2',
        'free_flow_speed': 90,
        'congestion_lag_1': 0.0, # Assuming no congestion 10 mins ago
        'speed_lag_1': 90      # Assuming free flow speed 10 mins ago
    }
    
    predictions_ff = make_predictions(new_traffic_data_free_flow)

    if predictions_ff:
        print("\n--- Non-Rush Hour Example ---")
        print(f"Predicted Congestion Level: {predictions_ff['predicted_congestion']}")
        print(f"Predicted Speed: {predictions_ff['predicted_speed']} km/h")