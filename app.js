const express = require("express");
const connectDB = require('./config/db')
require('dotenv').config();
const userRoute = require('./routes/UserRoute');
const adminRoute = require('./routes/AdminRoute');

const app = express();

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
