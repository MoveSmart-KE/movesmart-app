from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import make_predictions
import joblib
import os
import json
from datetime import datetime, timezone
import pandas as pd

app = Flask(__name__)
CORS(app)

# --- MODEL LOADING ---
print("Loading models into memory...")
try:
    label_encoder = joblib.load("saved_models/label_encoder.joblib")
    congestion_model = joblib.load("saved_models/xgb_congestion_regressor.joblib")
    congestion_features = joblib.load("saved_models/xgb_congestion_features.joblib")
    speed_model = joblib.load("saved_models/xgb_speed_regressor.joblib")
    speed_features = joblib.load("saved_models/xgb_speed_features.joblib")
    print("Models loaded successfully.")
except FileNotFoundError as e:
    print(f"FATAL ERROR: Could not load model files. {e}")
    label_encoder = None 

@app.route('/predict', methods=['POST'])
def predict_endpoint():
    """
    This is the core prediction endpoint. It was previously broken.
    """
    if not label_encoder:
        return jsonify({"error": "Models are not loaded. Check server logs."}),
        
    if not request.json:
        return jsonify({"error": "Invalid input: no JSON payload"}), 400

    data = request.json
    
    required_fields = ['timestamp', 'start_coords', 'end_coords', 'name', 'free_flow_speed', 'congestion_lag_1', 'speed_lag_1']
    if not all(field in data for field in required_fields):
        return jsonify({"error": f"Missing one or more required fields: {required_fields}"}), 400

    try:
        predictions = make_predictions(
            data,
            label_encoder,
            congestion_model,
            congestion_features,
            speed_model,
            speed_features
        )
        return jsonify(predictions)
    except Exception as e:
        print(f"An error occurred during prediction: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500

@app.route('/log_trip', methods=['POST'])
def log_trip_endpoint():
    """
    Logs trip data. This endpoint is working correctly.
    """
    data = request.json
    if not data:
        return jsonify({"error": "Invalid input: no JSON payload"}), 400
    
    data['server_timestamp'] = datetime.now(timezone.utc).isoformat()
    
    try:
        with open("trip_logs.jsonl", "a") as f:
            f.write(json.dumps(data) + "\n")
        return jsonify({"status": "success"}), 200
    except Exception as e:
        print(f"CRITICAL: Could not write to log file: {e}")
        return jsonify({"error": "Failed to log trip data on the server."}), 500

@app.route('/urban_analytics', methods=['GET'])
def urban_analytics_endpoint():
    """
    Calculates and returns aggregate statistics. This version fixes the JSON serialization bug.
    """
    try:
        valid_logs = []
        with open("trip_logs.jsonl", "r") as f:
            for line in f:
                try:
                    valid_logs.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        
        if not valid_logs:
            raise FileNotFoundError

        df = pd.DataFrame(valid_logs)

        # --- Aggregate Metrics (Safely) ---
        total_time_saved = df['timeSavedMinutes'].sum()
        total_fuel_saved = df['fuelSavedLiters'].sum()
        valid_congestion = df[df['predictedCongestion'].notna()]
        avg_congestion = valid_congestion['predictedCongestion'].mean() if not valid_congestion.empty else 0
        total_trips = len(df)

        # --- Top Routes Analysis (Safely) ---
        top_routes_list = []
        if 'routeName' in df.columns:
            df['routeName'] = df['routeName'].astype(str)
            route_savings = df.groupby('routeName')['timeSavedMinutes'].sum().sort_values(ascending=False)
            top_routes = route_savings.head(5).reset_index()
            top_routes.rename(columns={'routeName': 'name', 'timeSavedMinutes': 'value'}, inplace=True)
            top_routes['value'] = top_routes['value'].round().astype(int)
            top_routes_list = top_routes.to_dict('records')

        # FIX: Cast all numpy types to standard Python types for JSON serialization
        return jsonify({
            "aggregate_time_saved_minutes": int(total_time_saved),
            "aggregate_fuel_saved_liters": float(total_fuel_saved),
            "average_congestion_index": float(round(avg_congestion * 100, 1)),
            "total_logged_trips": int(total_trips),
            "top_routes_by_saving": top_routes_list
        })

    except FileNotFoundError:
        return jsonify({
            "aggregate_time_saved_minutes": 0,
            "aggregate_fuel_saved_liters": 0,
            "average_congestion_index": 0,
            "total_logged_trips": 0,
            "top_routes_by_saving": []
        })
    except Exception as e:
        print(f"CRITICAL: Could not process analytics data: {e}")
        return jsonify({"error": "An unexpected error occurred during analysis."}),

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port)
