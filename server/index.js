require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const CandidateRoutes = require("./routes/candidates");
const positionsRoutes = require('./routes/positions');
const s3Routes = require('./routes/s3');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/", CandidateRoutes); // or '/api' if you want all routes under /api
app.use('/', positionsRoutes);
app.use('/', s3Routes);

// Health check route (optional)
app.get("/health", (req, res) => res.send("Server is healthy!"));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
