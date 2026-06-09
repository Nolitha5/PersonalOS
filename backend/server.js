const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors({
  origin: "http://localhost:5174"
}));

app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend connected successfully 🚀" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});