from flask import Flask, request, jsonify
import pandas as pd
import joblib

app = Flask(__name__)

# Load trained ML model
model = joblib.load("fraud_model.pkl")


# ==========================================
# HOME
# ==========================================
@app.route("/")
def home():
    return "Fraud Detection API is running"


# ==========================================
# SINGLE TRANSACTION PREDICTION
# ==========================================
@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No transaction data provided"
        }), 400

    transaction = pd.DataFrame([data])

    # Remove target column if provided
    transaction = transaction.drop(
        "Fraudulent",
        axis=1,
        errors="ignore"
    )

    # Remove ID columns
    transaction = transaction.drop(
        ["Transaction_ID", "User_ID"],
        axis=1,
        errors="ignore"
    )

    # Convert transaction time
    if "Time_of_Transaction" in transaction.columns:

        transaction["Time_of_Transaction"] = pd.to_datetime(
            transaction["Time_of_Transaction"],
            errors="coerce"
        )

        transaction["Transaction_Hour"] = (
            transaction["Time_of_Transaction"].dt.hour
        )

        transaction = transaction.drop(
            "Time_of_Transaction",
            axis=1
        )

    try:

        # Get fraud probability
        probability = model.predict_proba(
            transaction
        )[0][1]

    except Exception as e:

        return jsonify({
            "error": "Prediction failed",
            "details": str(e)
        }), 400

    # Risk classification
    if probability >= 0.80:

        risk_level = "CRITICAL"
        recommendation = "Investigate immediately"

    elif probability >= 0.60:

        risk_level = "HIGH"
        recommendation = "Investigate soon"

    elif probability >= 0.30:

        risk_level = "MEDIUM"
        recommendation = "Review if resources permit"

    else:

        risk_level = "LOW"
        recommendation = "No immediate investigation"

    return jsonify({

        "transaction_id": data.get(
            "Transaction_ID",
            "N/A"
        ),

        "fraud_probability": round(
            float(probability),
            4
        ),

        "fraud_probability_percent": round(
            float(probability) * 100,
            2
        ),

        "risk_level": risk_level,

        "recommendation": recommendation
    })


# ==========================================
# PRIORITIZE MULTIPLE TRANSACTIONS
# ==========================================
@app.route("/prioritize", methods=["POST"])
def prioritize():

    data = request.get_json()

    if not data or "transactions" not in data:

        return jsonify({
            "error": "Please provide a transactions list"
        }), 400

    transactions = data["transactions"]

    if not isinstance(transactions, list) or len(transactions) == 0:

        return jsonify({
            "error": "transactions must be a non-empty list"
        }), 400

    results = []

    for item in transactions:

        transaction = pd.DataFrame([item])

        # Remove target column
        transaction = transaction.drop(
            "Fraudulent",
            axis=1,
            errors="ignore"
        )

        # Remove ID columns
        transaction = transaction.drop(
            ["Transaction_ID", "User_ID"],
            axis=1,
            errors="ignore"
        )

        # Convert transaction time
        if "Time_of_Transaction" in transaction.columns:

            transaction["Time_of_Transaction"] = pd.to_datetime(
                transaction["Time_of_Transaction"],
                errors="coerce"
            )

            transaction["Transaction_Hour"] = (
                transaction["Time_of_Transaction"].dt.hour
            )

            transaction = transaction.drop(
                "Time_of_Transaction",
                axis=1
            )

        try:

            # Fraud probability
            probability = model.predict_proba(
                transaction
            )[0][1]

        except Exception as e:

            return jsonify({
                "error": "Prediction failed",
                "details": str(e),
                "transaction_id": item.get(
                    "Transaction_ID",
                    "N/A"
                )
            }), 400

        # Risk level
        if probability >= 0.80:

            risk_level = "CRITICAL"
            recommendation = "Investigate immediately"

        elif probability >= 0.60:

            risk_level = "HIGH"
            recommendation = "Investigate soon"

        elif probability >= 0.30:

            risk_level = "MEDIUM"
            recommendation = "Review if resources permit"

        else:

            risk_level = "LOW"
            recommendation = "No immediate investigation"

        results.append({

            "transaction_id": item.get(
                "Transaction_ID",
                "N/A"
            ),

            "fraud_probability": round(
                float(probability),
                4
            ),

            "fraud_probability_percent": round(
                float(probability) * 100,
                2
            ),

            "risk_level": risk_level,

            "recommendation": recommendation
        })

    # Sort highest fraud probability first
    results.sort(
        key=lambda x: x["fraud_probability"],
        reverse=True
    )

    # Assign priority
    for index, result in enumerate(results):

        result["priority"] = index + 1

    return jsonify({

        "total_transactions": len(results),

        "priority_queue": results
    })
# ==========================================
# API STATUS
# ==========================================
@app.route("/status", methods=["GET"])
def status():

    return jsonify({
        "status": "online",
        "service": "Fraud Detection API",
        "model": "Random Forest",
        "endpoints": [
            "/",
            "/status",
            "/predict",
            "/prioritize"
        ]
    })

# ==========================================
# START FLASK SERVER
# ==========================================
if __name__ == "__main__":

    app.run(
        debug=True
    )