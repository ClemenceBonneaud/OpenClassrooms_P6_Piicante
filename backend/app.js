// Installations
const express = require('express');
const mongoose = require("mongoose");
const path = require('path');

// Routes
const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

// Connexion MongoDB
mongoose
  .connect(
    "mongodb+srv://clemencebd:586SpEnGo@cluster0.gk5uy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));
  db = mongoose.connection;

// Appel fonction express
const app = express();

// Application
// ----- Récupération des images
app.use('/images', express.static(path.join(__dirname, 'images')));

// ----- Headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(express.json());

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

// Export
module.exports = app;