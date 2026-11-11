const express = require('express');
const CommentController = require('../controllers/commentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.put('/:id', requireAuth, CommentController.editComment);
router.delete('/:id', requireAuth, CommentController.deleteComment);

module.exports = router;

