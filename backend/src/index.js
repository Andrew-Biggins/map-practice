import express from "express";
import { poisRoute } from "./routes/poisRoute.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/pois", poisRoute);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
