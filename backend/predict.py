import pandas as pd
import numpy as np
import joblib
from datetime import datetime

def handle_unknown_labels(encoder, labels):
    """
    Transforms labels using the encoder, handling previously unseen labels.
    Unseen labels are assigned a default value of -1.
    """
    known_labels = set(encoder.classes_)
    return np.array([encoder.transform([l])[0] if l in known_labels else -1 for l in labels])

def make_predictions(data, label_encoder, congestion_model, congestion_features, speed_model, speed_features):
    """
    Predicts congestion and speed using pre-loaded models.
    """
    # 1. Preprocess the input data into a DataFrame
    df = pd.DataFrame([data])
    
    # --- Feature Engineering ---
    start_coords = df['start_coords'].str.split(',', expand=True).astype(float)
    end_coords = df['end_coords'].str.split(',', expand=True).astype(float)
    df['latitude'] = (start_coords[0] + end_coords[0]) / 2
    df['longitude'] = (start_coords[1] + end_coords[1]) / 2

    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['is_weekend'] = (df['timestamp'].dt.dayofweek >= 5).astype(int)
    df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 23.0)
    df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 23.0)
    
    df['segment_encoded'] = handle_unknown_labels(label_encoder, df['name'])

    df['lat_x_lon'] = df['latitude'] * df['longitude']
    df['lat_x_hour_sin'] = df['latitude'] * df['hour_sin']
    df['lon_x_hour_cos'] = df['longitude'] * df['hour_cos']

    # 2. --- STAGE 1: Predict Congestion ---
    X_c = df[congestion_features]
    predicted_congestion = congestion_model.predict(X_c)[0]

    # 3. --- STAGE 2: Predict Speed ---
    df['predicted_congestion'] = predicted_congestion
    X_s = df[speed_features]
    predicted_speed = speed_model.predict(X_s)[0]

    return {
        "predicted_congestion": round(float(predicted_congestion), 2),
        "predicted_speed": round(float(predicted_speed), 2)
    }