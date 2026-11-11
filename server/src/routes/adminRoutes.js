const express = require('express');
const CommentController = require('../controllers/commentController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/moderation', requireAuth, requireAdmin, CommentController.getAdminModerationList);

module.exports = router;

