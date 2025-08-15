// src/app.js
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocumentJson = require("../swagger.json");

const courtRoutes = require("./routes/courtRoutes.js");
const reservationRoutes = require("./routes/reservationRoutes.js");
const errorHandler = require("./middlewares/errorHandler.js");

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// CORS
const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.get("/", (req, res) => {
    res.json({ message: "API funcionando 🚀 en Render" });
});

// Health
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/courts", courtRoutes);
app.use("/api/reservations", reservationRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocumentJson));

// 404
app.use((req, res) => res.status(404).json({ message: "Not Found" }));

// Error handler
app.use(errorHandler);

module.exports = app;
