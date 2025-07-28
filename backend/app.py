from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import make_predictions
import joblib
import os

app = Flask(__name__)
CORS(app)

# --- MODEL LOADING ---
# Load all models and artifacts once into memory when the app starts.
# This is far more efficient than loading them on every request.
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
    # In a real app, you might exit or have a fallback.
    # For now, we'll print the error and the app will fail on prediction.
    label_encoder = None 

@app.route('/predict', methods=['POST'])
def predict_endpoint():
    if not label_encoder:
        return jsonify({"error": "Models are not loaded. Check server logs."}), 500
        
    if not request.json:
        return jsonify({"error": "Invalid input: no JSON payload"}), 400

    data = request.json
    
    required_fields = ['timestamp', 'start_coords', 'end_coords', 'name', 'free_flow_speed', 'congestion_lag_1', 'speed_lag_1']
    if not all(field in data for field in required_fields):
        return jsonify({"error": f"Missing one or more required fields: {required_fields}"}), 400

    try:
        # Pass the pre-loaded models to the prediction function
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port)