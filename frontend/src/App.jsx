import { useEffect, useState } from "react";
import "./style.css";

const API_URL = "http://10.10.88.105:5000";

function App() {
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [priorityResult, setPriorityResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priorityLoading, setPriorityLoading] = useState(false);

  const [formData, setFormData] = useState({
    Transaction_Amount: "",
    Transaction_Type: "Online",
    Device_Used: "Mobile",
    Location: "New York",
    Previous_Fraudulent_Transactions: "",
    Account_Age: "",
    Number_of_Transactions_Last_24H: "",
    Payment_Method: "UPI",
    Time_of_Transaction: "",
  });

  // ================================
  // CHECK BACKEND STATUS
  // ================================

  useEffect(() => {
    fetch(`${API_URL}/status`)
      .then((response) => response.json())
      .then((data) => {
        setStatus(data);
      })
      .catch(() => {
        setStatus({
          status: "offline",
          service: "Fraud Detection API",
          model: "Unavailable",
        });
      });
  }, []);

  // ================================
  // HANDLE FORM INPUT
  // ================================

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // ================================
  // ANALYZE TRANSACTION
  // ================================

  const analyzeTransaction = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...formData,

          Transaction_Amount: Number(
            formData.Transaction_Amount
          ),

          Previous_Fraudulent_Transactions: Number(
            formData.Previous_Fraudulent_Transactions
          ),

          Account_Age: Number(
            formData.Account_Age
          ),

          Number_of_Transactions_Last_24H: Number(
            formData.Number_of_Transactions_Last_24H
          ),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Prediction failed"
        );
      }

      setResult(data);

    } catch (error) {
      setResult({
        error: error.message,
      });

    } finally {
      setLoading(false);
    }
  };

  // ================================
  // PRIORITIZE TRANSACTIONS
  // ================================

  const prioritizeTransactions = async () => {
    setPriorityLoading(true);
    setPriorityResult(null);

    try {
      const response = await fetch(
        `${API_URL}/prioritize`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify([
            {
              Transaction_Amount: 15000,
              Transaction_Type: "Online",
              Device_Used: "Unknown Device",
              Location: "New York",
              Previous_Fraudulent_Transactions: 4,
              Account_Age: 20,
              Number_of_Transactions_Last_24H: 15,
              Payment_Method: "Credit Card",
              Time_of_Transaction:
                "2026-09-06T02:30",
            },

            {
              Transaction_Amount: 500,
              Transaction_Type: "POS",
              Device_Used: "Mobile",
              Location: "Seattle",
              Previous_Fraudulent_Transactions: 0,
              Account_Age: 100,
              Number_of_Transactions_Last_24H: 2,
              Payment_Method: "UPI",
              Time_of_Transaction:
                "2026-09-06T14:00",
            },
          ]),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Prioritization failed"
        );
      }

      setPriorityResult(data);

    } catch (error) {
      setPriorityResult({
        error: error.message,
      });

    } finally {
      setPriorityLoading(false);
    }
  };

  // ================================
  // RISK CLASS
  // ================================

  const getRiskClass = (risk) => {
    if (!risk) return "";

    return `risk-${risk.toLowerCase()}`;
  };

  // ================================
  // UI
  // ================================

  return (
    <div className="app">

      {/* =========================
          ANIMATED BACKGROUND
      ========================= */}

      <div className="background">

        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>

        <div className="grid-background"></div>

      </div>

      {/* =========================
          CONTENT
      ========================= */}

      <div className="content">

        {/* HEADER */}

        <header className="hero">

          <div className="shield">
            🛡️
          </div>

          <div>

            <h1>
              FraudGuard AI
            </h1>

            <p>
              Intelligent Transaction Risk & Fraud Detection
            </p>

          </div>

        </header>


        {/* =========================
            STATUS CARDS
        ========================= */}

        <section className="status-container">

          <div className="glass-card status-card">

            <div className="status-icon">
              ⚡
            </div>

            <div>

              <span className="card-label">
                API STATUS
              </span>

              <h3>

                {status?.status === "online"
                  ? "🟢 Online"
                  : "🔴 Offline"}

              </h3>

            </div>

          </div>


          <div className="glass-card status-card">

            <div className="status-icon">
              🔗
            </div>

            <div>

              <span className="card-label">
                SERVICE
              </span>

              <h3>
                {status?.service ||
                  "Checking..."}
              </h3>

            </div>

          </div>


          <div className="glass-card status-card">

            <div className="status-icon">
              🤖
            </div>

            <div>

              <span className="card-label">
                ML MODEL
              </span>

              <h3>
                {status?.model ||
                  "Checking..."}
              </h3>

            </div>

          </div>

        </section>


        {/* =========================
            TRANSACTION ANALYSIS
        ========================= */}

        <section className="glass-card main-card">

          <div className="section-title">

            <div className="title-icon">
              🔍
            </div>

            <div>

              <h2>
                Transaction Analysis
              </h2>

              <p>
                Analyze a transaction and determine
                its fraud risk.
              </p>

            </div>

          </div>


          <div className="form-grid">

            {/* AMOUNT */}

            <div className="form-group">

              <label>
                Transaction Amount
              </label>

              <input
                type="number"
                name="Transaction_Amount"
                placeholder="₹ Enter amount"
                value={
                  formData.Transaction_Amount
                }
                onChange={handleChange}
              />

            </div>


            {/* TRANSACTION TYPE */}

            <div className="form-group">

              <label>
                Transaction Type
              </label>

              <select
                name="Transaction_Type"
                value={
                  formData.Transaction_Type
                }
                onChange={handleChange}
              >

                <option>
                  Online
                </option>

                <option>
                  POS
                </option>

                <option>
                  ATM
                </option>

              </select>

            </div>


            {/* DEVICE */}

            <div className="form-group">

              <label>
                Device Used
              </label>

              <select
                name="Device_Used"
                value={
                  formData.Device_Used
                }
                onChange={handleChange}
              >

                <option>
                  Mobile
                </option>

                <option>
                  Desktop
                </option>

                <option>
                  Tablet
                </option>

                <option>
                  Unknown Device
                </option>

              </select>

            </div>


            {/* LOCATION */}

            <div className="form-group">

              <label>
                Location
              </label>

              <select
                name="Location"
                value={
                  formData.Location
                }
                onChange={handleChange}
              >

                <option>
                  New York
                </option>

                <option>
                  Los Angeles
                </option>

                <option>
                  Houston
                </option>

                <option>
                  Miami
                </option>

                <option>
                  San Francisco
                </option>

                <option>
                  Seattle
                </option>

              </select>

            </div>


            {/* PREVIOUS FRAUD */}

            <div className="form-group">

              <label>
                Previous Fraudulent Transactions
              </label>

              <input
                type="number"
                name="Previous_Fraudulent_Transactions"
                placeholder="Enter count"
                value={
                  formData.Previous_Fraudulent_Transactions
                }
                onChange={handleChange}
              />

            </div>


            {/* ACCOUNT AGE */}

            <div className="form-group">

              <label>
                Account Age
              </label>

              <input
                type="number"
                name="Account_Age"
                placeholder="Enter age"
                value={
                  formData.Account_Age
                }
                onChange={handleChange}
              />

            </div>


            {/* 24 HOUR TRANSACTIONS */}

            <div className="form-group">

              <label>
                Transactions in Last 24H
              </label>

              <input
                type="number"
                name="Number_of_Transactions_Last_24H"
                placeholder="Enter count"
                value={
                  formData.Number_of_Transactions_Last_24H
                }
                onChange={handleChange}
              />

            </div>


            {/* PAYMENT */}

            <div className="form-group">

              <label>
                Payment Method
              </label>

              <select
                name="Payment_Method"
                value={
                  formData.Payment_Method
                }
                onChange={handleChange}
              >

                <option>
                  UPI
                </option>

                <option>
                  Credit Card
                </option>

                <option>
                  Debit Card
                </option>

                <option>
                  Net Banking
                </option>

                <option>
                  Invalid Method
                </option>

              </select>

            </div>


            {/* TIME */}

            <div className="form-group full-width">

              <label>
                Transaction Time
              </label>

              <input
                type="datetime-local"
                name="Time_of_Transaction"
                value={
                  formData.Time_of_Transaction
                }
                onChange={handleChange}
              />

            </div>

          </div>


          {/* ANALYZE */}

          <button
            className="primary-btn"
            onClick={analyzeTransaction}
            disabled={loading}
          >

            {loading
              ? "⏳ Analyzing..."
              : "🔍 Analyze Transaction"}

          </button>

        </section>


        {/* =========================
            RISK RESULT
        ========================= */}

        {result && (

          <section className="glass-card result-card">

            <div className="section-title">

              <div className="title-icon">
                📊
              </div>

              <div>

                <h2>
                  Risk Assessment
                </h2>

                <p>
                  AI-generated transaction analysis
                </p>

              </div>

            </div>


            {result.error ? (

              <div className="error-box">
                ❌ {result.error}
              </div>

            ) : (

              <div className="result-grid">

                <div className="result-box">

                  <span>
                    FRAUD PROBABILITY
                  </span>

                  <strong>
                    {result.fraud_probability_percent}%
                  </strong>

                </div>


                <div
                  className={`result-box ${getRiskClass(
                    result.risk_level
                  )}`}
                >

                  <span>
                    RISK LEVEL
                  </span>

                  <strong>
                    {result.risk_level}
                  </strong>

                </div>


                <div className="result-box">

                  <span>
                    RECOMMENDATION
                  </span>

                  <strong>
                    {result.recommendation}
                  </strong>

                </div>

              </div>

            )}

          </section>

        )}


        {/* =========================
            PRIORITY QUEUE
        ========================= */}

        <section className="glass-card priority-card">

          <div className="section-title">

            <div className="title-icon">
              🚨
            </div>

            <div>

              <h2>
                Analyst Priority Queue
              </h2>

              <p>
                Rank suspicious transactions
                for investigation.
              </p>

            </div>

          </div>


          <button
            className="secondary-btn"
            onClick={prioritizeTransactions}
            disabled={priorityLoading}
          >

            {priorityLoading
              ? "⏳ Prioritizing..."
              : "🚨 Prioritize Transactions"}

          </button>


          {priorityResult && (

            <div className="priority-list">

              {priorityResult.error ? (

                <div className="error-box">
                  ❌ {priorityResult.error}
                </div>

              ) : (

                priorityResult.map(
                  (transaction, index) => (

                    <div
                      className="priority-row"
                      key={index}
                    >

                      <div className="priority-number">
                        #{transaction.priority}
                      </div>


                      <div>

                        <span>
                          FRAUD PROBABILITY
                        </span>

                        <strong>
                          {
                            transaction.fraud_probability_percent
                          }%
                        </strong>

                      </div>


                      <div>

                        <span>
                          RISK
                        </span>

                        <strong>
                          {transaction.risk_level}
                        </strong>

                      </div>


                      <div>

                        <span>
                          ACTION
                        </span>

                        <strong>
                          {transaction.recommendation}
                        </strong>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          )}

        </section>


        {/* FOOTER */}

        <footer>

          <p>
            🛡️ FraudGuard AI • Intelligent Financial Security
          </p>

        </footer>

      </div>

    </div>
  );
}

export default App;