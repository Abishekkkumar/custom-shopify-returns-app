// backend/server.js

// This must be the very first line to ensure all secret keys
// from your .env file are loaded before any other code runs.
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db'); // Our database connection logic
const cors = require('cors'); // Middleware for security
const path = require('path'); // Node.js module for working with file paths

// Call the function to connect to our MongoDB database
connectDB();

// Create an instance of our Express server application
const app = express();

// --- Middleware ---
// This section sets up tools that will run on every request.
app.use(cors()); // Allows our frontend to communicate with this backend
app.use(express.json()); // Allows the server to understand JSON data

// This makes our 'uploads' folder publicly accessible.
// It allows the browser to request and display images stored on our server.
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));


// --- Routes ---
// Import our main routing file.
const routes = require('./routes');

// --- Use Routes ---
// This tells our server: "For any URL that starts with '/api',
// let our main 'routes' file handle it."
app.use('/api', routes);


// A simple test route to confirm the server is running.
app.get('/', (req, res) => res.send('Custom Returns App API is running...'));

// Get the port number from our .env file, with a default of 5002
const PORT = process.env.PORT || 5002;

// This is the command that starts the server and makes it listen for requests.
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);