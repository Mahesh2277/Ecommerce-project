from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})  # Enable CORS for frontend

# Load the trained model
with open("fraud_detection_model.pkl", "rb") as file:
    model = pickle.load(file)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json  # Expecting JSON input
        print("Received data:", data)

        # Convert string fields to numeric for ML model
        # Hash payer_id to get a numeric value
        payer_id_str = str(data.get("payer_id", "0"))
        payer_id_numeric = abs(hash(payer_id_str)) % 1000000  # Keep it within reasonable range
        
        # Extract numeric parts from IP address (handle both IPv4 and IPv6)
        ip_address = data.get("ip_address", "0.0.0.0")
        if ':' in ip_address:
            # IPv6 - use hash
            ip_numeric = abs(hash(ip_address)) % 1000000
        else:
            # IPv4 - convert to numeric
            ip_parts = ip_address.split('.')
            try:
                ip_numeric = sum(int(part) * (256 ** (3 - i)) for i, part in enumerate(ip_parts[:4])) if len(ip_parts) == 4 else 0
            except:
                ip_numeric = abs(hash(ip_address)) % 1000000
        
        # Encode state as numeric (simple hash)
        state_str = str(data.get("state", "Unknown"))
        state_numeric = abs(hash(state_str)) % 1000

        # Extracting input features with numeric conversions
        input_data = {
            "payer_id": [float(payer_id_numeric)],
            "amount": [float(data.get("amount", 0))],  # Convert to float
            "ip_address": [float(ip_numeric)],
            "state": [float(state_numeric)],
            "failed_attempt": [int(data.get("failed_attempt", 0))]  # Convert to int
        }

        # Convert to DataFrame with explicit dtypes
        input_df = pd.DataFrame(input_data)
        input_df = input_df.astype({
            'payer_id': 'float64',
            'amount': 'float64',
            'ip_address': 'float64',
            'state': 'float64',
            'failed_attempt': 'int64'
        })
        print("Input DataFrame:", input_df)
        print("Data types:", input_df.dtypes)

        # Make prediction
        try:
            prediction = model.predict(input_df)[0]
            print("Prediction:", prediction)
            return jsonify({"fraudulent": bool(prediction)})
        except Exception as model_error:
            print("Model prediction error:", str(model_error))
            # Fallback: use simple rule-based on amount
            amount = float(data.get("amount", 0))
            failed_attempt = int(data.get("failed_attempt", 0))
            # Simple heuristic: high amount or multiple failed attempts = fraud
            is_fraud = amount > 10000 or failed_attempt > 3
            print("Fallback prediction:", is_fraud)
            return jsonify({"fraudulent": is_fraud})

    except Exception as e:
        print("Error:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(port=5001, debug=True)