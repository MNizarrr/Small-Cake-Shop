const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

// hanya admin yang bisa export
router.get('/orders/excel', authMiddleware, adminMiddleware, exportController.exportExcel);
router.get('/orders/pdf', authMiddleware, adminMiddleware, exportController.exportPdf);

module.exports = router;