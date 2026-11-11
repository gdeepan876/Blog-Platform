const CommentModel = require('../models/commentModel');
const PostModel = require('../models/postModel');

class CommentController {
  static addComment(req, res, next) {
    try {
      const postId = parseInt(req.params.id, 10);
      const post = PostModel.findById(postId);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Comment content cannot be empty'
        });
      }

      const comment = CommentModel.create({
        postId,
        authorId: req.user.id,
        content: content.trim()
      });

      return res.status(201).json({
        success: true,
        data: {
          comment
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static editComment(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const comment = CommentModel.findById(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      const isAuthor = req.user.id === comment.authorId;
      const isAdmin = req.user.role === 'admin';

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to edit this comment'
        });
      }

      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Comment content cannot be empty'
        });
      }

      const updated = CommentModel.update(id, content.trim());

      return res.status(200).json({
        success: true,
        data: {
          comment: updated
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static deleteComment(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const comment = CommentModel.findById(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      const isAuthor = req.user.id === comment.authorId;
      const isAdmin = req.user.role === 'admin';

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this comment'
        });
      }

      CommentModel.delete(id);

      return res.status(200).json({
        success: true,
        data: {
          message: 'Comment deleted successfully'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static getAdminModerationList(req, res, next) {
    try {
      const posts = PostModel.listAllForAdmin();
      const comments = CommentModel.listAllForAdmin();

      return res.status(200).json({
        success: true,
        data: {
          posts,
          comments
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CommentController;

