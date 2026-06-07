const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const upload = require('../middlewares/upload');
const loginController = require('../controllers/login.controller');

router.post('/register', authController.register);
router.post('/login', upload.none(), loginController.login);

module.exports = router
