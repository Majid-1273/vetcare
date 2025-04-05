require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
connectDB();

const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "VetCare API",
      description: "API documentation for the VetCare website",
      version: "1.0.0",
      contact: {
        name: "Faizan Cheema",
        email: "faizananjum567@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000", // Backend URL (fixing the empty string issue)
        description: "Local server",
      },
    ],
  },
  apis: ["./routes/*.js"], 
};

// Serve Swagger API docs
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/api/auth", authRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
