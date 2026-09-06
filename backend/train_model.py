import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score


# ==========================================
# 1. LOAD DATA
# ==========================================

data = pd.read_csv("transactions.csv")

print("Dataset loaded successfully!")
print("Dataset shape:", data.shape)

print("\nColumns:")
print(data.columns.tolist())


# ==========================================
# 2. CLEAN COLUMN NAMES
# ==========================================

data.columns = data.columns.str.strip()


# ==========================================
# 3. CONVERT TIME
# ==========================================

data["Time_of_Transaction"] = pd.to_datetime(
    data["Time_of_Transaction"],
    errors="coerce"
)

data["Transaction_Hour"] = (
    data["Time_of_Transaction"].dt.hour
)


# ==========================================
# 4. REMOVE ORIGINAL TIME COLUMN
# ==========================================

data = data.drop(
    "Time_of_Transaction",
    axis=1
)


# ==========================================
# 5. SEPARATE FEATURES AND TARGET
# ==========================================

X = data.drop(
    [
        "Fraudulent",
        "Transaction_ID",
        "User_ID"
    ],
    axis=1
)

y = data["Fraudulent"]


# ==========================================
# 6. CONVERT TARGET TO NUMERIC
# ==========================================

if y.dtype == "object":

    y = (
        y.astype(str)
        .str.strip()
        .str.lower()
        .map({
            "true": 1,
            "false": 0,
            "yes": 1,
            "no": 0,
            "fraud": 1,
            "legitimate": 0,
            "1": 1,
            "0": 0
        })
    )

y = pd.to_numeric(y, errors="coerce")

valid_rows = y.notna()

X = X.loc[valid_rows]
y = y.loc[valid_rows].astype(int)


# ==========================================
# 7. IDENTIFY DATA TYPES
# ==========================================

numeric_features = X.select_dtypes(
    include=["int64", "float64", "int32", "float32"]
).columns.tolist()

categorical_features = X.select_dtypes(
    include=["object", "category", "bool"]
).columns.tolist()


print("\nNumeric features:")
print(numeric_features)

print("\nCategorical features:")
print(categorical_features)


# ==========================================
# 8. NUMERIC PREPROCESSING
# ==========================================

numeric_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="median")
        )
    ]
)


# ==========================================
# 9. CATEGORICAL PREPROCESSING
# ==========================================

categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="most_frequent")
        ),
        (
            "encoder",
            OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=False
            )
        )
    ]
)


# ==========================================
# 10. COMBINE PREPROCESSING
# ==========================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "numeric",
            numeric_pipeline,
            numeric_features
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features
        )
    ]
)


# ==========================================
# 11. CREATE MODEL
# ==========================================

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1
)


# ==========================================
# 12. COMPLETE PIPELINE
# ==========================================

pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "model",
            model
        )
    ]
)


# ==========================================
# 13. TRAIN / TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ==========================================
# 14. TRAIN
# ==========================================

print("\nTraining model...")

pipeline.fit(
    X_train,
    y_train
)

print("Model trained successfully!")


# ==========================================
# 15. PREDICTION
# ==========================================

predictions = pipeline.predict(X_test)

probabilities = pipeline.predict_proba(
    X_test
)[:, 1]


# ==========================================
# 16. EVALUATION
# ==========================================

print("\n========== CLASSIFICATION REPORT ==========")

print(
    classification_report(
        y_test,
        predictions,
        digits=4
    )
)


# ==========================================
# 17. ROC-AUC
# ==========================================

if len(y_test.unique()) == 2:

    auc = roc_auc_score(
        y_test,
        probabilities
    )

    print("\nROC-AUC:", round(auc, 4))


# ==========================================
# 18. SAVE MODEL
# ==========================================

joblib.dump(
    pipeline,
    "fraud_model.pkl"
)

print("\nModel saved as:")
print("fraud_model.pkl")