const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const PYTHON_API =
  process.env.PYTHON_API || "http://localhost:5000";

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_API}/`, { timeout: 15000 });
    res.json({
      status: "StackPredict node orchestration gateway active.",
      ...response.data,
    });
  } catch {
    res.json({ status: "StackPredict node orchestration gateway active." });
  }
});

app.post("/predict", async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_API}/predict`, req.body, {
      timeout: 15000,
    });

    res.json(response.data);
  } catch (err) {
    if (err.response && err.response.data) {
      return res.status(err.response.status).json({
        status: "error",
        error:
          err.response.data.message ||
          err.response.data.error ||
          "Upstream data validation mismatch.",
      });
    }

    res.status(500).json({
      status: "error",
      error: "Core ML Matrix Server structural timeout.",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Node reverse proxy running on port ${PORT}`);
});