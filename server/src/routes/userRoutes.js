const express = require('express');
const PostController = require('../controllers/postController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:id/posts', optionalAuth, PostController.getUserPosts);

module.exports = router;

