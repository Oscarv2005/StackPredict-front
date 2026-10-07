const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const PYTHON_API = (
  process.env.PYTHON_API || "https://stackpredict-front-py-4foh.vercel.app"
).replace(/\/+$/, "");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_API}/`, { timeout: 15000 });
    res.json({
      status: "StackPredict node orchestration gateway active.",
      ...response.data,
    });
  } catch (error) {
    res.json({ status: "StackPredict node orchestration gateway active." });
  }
});

router.post("/predict", async (req, res) => {
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
    if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
      return res.status(504).json({
        status: "error",
        error: "The ML server is waking up or took too long. Please retry in a few seconds.",
      });
    }
    res.status(500).json({
      status: "error",
      error: "Core ML Matrix Server structural timeout.",
    });
  }
});

app.use("/api", router);
app.use("/", router);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Node reverse proxy running on port ${PORT}`));
}

module.exports = app;
