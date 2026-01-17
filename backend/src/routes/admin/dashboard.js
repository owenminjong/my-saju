const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboardController');

// GET /api/admin/dashboard
router.get('/', dashboardController.getDashboardStats);

module.exports = router;