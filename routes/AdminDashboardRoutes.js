const express = require('express');
const router = express.Router();

const { verifyAccessToken } = require('./../helpers/jwtHelper');

const { permissions } = require('./../middlewares/permissionsMiddleware');

const AdminJobController = require('./../controllers/adminController/AdminJobController');

router.get('/',  verifyAccessToken, permissions(["admin"]), AdminJobController.jobs);

module.exports = router;