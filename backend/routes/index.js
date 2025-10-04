// backend/routes/index.js
const express = require('express');
const router = express.Router();

// Import the route file for our returns feature
const returnsRoutes = require('./returnsRoutes');

// This line tells the router: "For any URL that starts with '/returns',
// let the `returnsRoutes` file handle it."
// Example: A request to /api/returns/lookup will be passed to returnsRoutes.
router.use('/returns', returnsRoutes);

// In the future, if you add a 'products' feature, you could add:
// router.use('/products', require('./productRoutes'));

module.exports = router;

