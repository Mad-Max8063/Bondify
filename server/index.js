const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const bondiRoutes = require('./routes/bondiRoutes');
app.use('/bondis', bondiRoutes); // Mount routes at /bondis

// Health Check
app.get('/', (req, res) => {
    res.send('Bondify Backend Online 🚌');
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Test Mode: Sending data to Firestore.`);
});
