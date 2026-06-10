import { useState } from "react";
import "./index.css";

const fields = [
  { name: "Administrative", label: "Admin pages visited", placeholder: "3" },
  {
    name: "Administrative_Duration",
    label: "Admin time (seconds)",
    placeholder: "120.5",
  },
  { name: "Informational", label: "Info pages visited", placeholder: "1" },
  {
    name: "Informational_Duration",
    label: "Info time (seconds)",
    placeholder: "45.0",
  },
  { name: "ProductRelated", label: "Product pages visited", placeholder: "15" },
  {
    name: "ProductRelated_Duration",
    label: "Product time (seconds)",
    placeholder: "800.0",
  },
  { name: "BounceRates", label: "Bounce rate (0 – 1)", placeholder: "0.02" },
  { name: "ExitRates", label: "Exit rate (0 – 1)", placeholder: "0.04" },
];

const emptyForm = Object.fromEntries(fields.map((f) => [f.name, ""]));

function Form() {
  const [formData, setFormData] = useState(emptyForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const filledCount = Object.values(formData).filter((v) => v !== "").length;
  const isComplete = filledCount === fields.length;

  const handleSubmit = async () => {
    if (!isComplete || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://localhost:3000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.predicted_page_value !== undefined) {
        setResult({
          type: "success",
          value: data.predicted_page_value.toFixed(4),
          note: data.model_info || null,
        });
      } else {
        setResult({
          type: "error",
          message:
            data.error ||
            "An evaluation exception occurred processing the dataset attributes.",
        });
      }
    } catch {
      setResult({
        type: "error",
        message:
          "Network core error. Verify your port 3000 Node express server instance is executing.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-section">
      <div>
        <span className="section-eyebrow">Prediction tool</span>
        <h2 className="section-title">Enter session data</h2>
        <p className="section-sub">
          Fill all eight metrics from your analytics dashboard and hit Generate.
        </p>
      </div>

      <div className="form-card">
        <div className="form-card-body">
          <div className="form-grid">
            {fields.map((field) => (
              <div key={field.name} className="input-group">
                <label htmlFor={field.name}>{field.label}</label>
                <input
                  id={field.name}
                  name={field.name}
                  type="number"
                  step="any"
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            ))}
          </div>
        </div>

        {result && (
          <div className={`result-panel ${result.type}`}>
            <div className="result-inner">
              <div className="result-icon-wrap">
                {result.type === "success" ? "✓" : "✕"}
              </div>
              {result.type === "success" ? (
                <div>
                  <div className="result-label">Predicted page value</div>
                  <div className="result-big">{result.value}</div>
                  {result.note && (
                    <div className="result-note">{result.note}</div>
                  )}
                </div>
              ) : (
                <div className="result-err-msg">{result.message}</div>
              )}
            </div>
          </div>
        )}

        <div className="form-footer">
          <div className="progress-area">
            <span className="progress-label">
              {filledCount} / {fields.length} fields
            </span>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(filledCount / fields.length) * 100}%` }}
              />
            </div>
          </div>
          <button
            className={`submit-btn ${loading ? "loading" : ""}`}
            onClick={handleSubmit}
            disabled={loading || !isComplete}
          >
            {loading ? (
              <>
                <span className="spinner" /> Predicting…
              </>
            ) : (
              "Generate prediction"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Form;
