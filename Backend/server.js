const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();


const cors = require('cors');
const authRoutes = require('./routes/auth');
const chickenRoutes = require('./routes/chicken');
const vaccinationRoutes = require('./routes/vaccination');
const feedRoutes = require('./routes/feed');
const eggProductionRoutes = require('./routes/eggProduction');
const mortalityRoutes = require('./routes/mortality');
const farm = require('./routes/farms');
const financialRoutes = require('./routes/financial');
const { verifyToken } = require('./middlewares/auth');

// Import the database connection
const connectDB = require('./config/db');
const farmAnalysisRoute = require('./routes/farmAnalysis');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chickens', verifyToken, chickenRoutes);
app.use('/api/vaccinations', verifyToken, vaccinationRoutes);
app.use('/api/feeds', verifyToken, feedRoutes);
app.use('/api/egg-production', verifyToken, eggProductionRoutes);
app.use('/api/mortality', verifyToken, mortalityRoutes);
app.use('/api/farm', verifyToken, farm);
app.use('/api/financial', verifyToken, financialRoutes);
app.use('/api/farm-analysis', farmAnalysisRoute);

// Default route
app.get('/', (req, res) => {
  res.send('VetCare API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
