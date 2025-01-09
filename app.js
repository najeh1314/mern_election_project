const express = require("express");
const connectDB = require('./config/db');
const cors = require('cors');

require('dotenv').config();
const userRoute = require('./routes/UserRoute');
const adminRoute = require('./routes/AdminRoute');

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));

// Middleware pour analyser les requêtes JSON
app.use(express.json());

connectDB();

// Définir la route utilisateur
app.use("/users", userRoute);
app.use("/admin", adminRoute);

const port = process.env.port;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
