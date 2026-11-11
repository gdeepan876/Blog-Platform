const express = require('express');
const PostController = require('../controllers/postController');
const CommentController = require('../controllers/commentController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const commentLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Comment limit reached. Please wait a minute before posting another comment.'
});

// REST Endpoints as per PRD
router.get('/', optionalAuth, PostController.getPosts);
router.get('/:id', optionalAuth, PostController.getPostById);
router.post('/', requireAuth, PostController.createPost);
router.put('/:id', requireAuth, PostController.updatePost);
router.delete('/:id', requireAuth, PostController.deletePost);

// Comments for post
router.post('/:id/comments', requireAuth, commentLimiter, CommentController.addComment);

module.exports = router;

