const PostModel = require('../models/postModel');
const UserModel = require('../models/userModel');
const CommentModel = require('../models/commentModel');

class PostController {
  static getPosts(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const search = req.query.search || '';
      const authorId = req.query.authorId ? parseInt(req.query.authorId, 10) : null;

      // By default, public feed only shows published posts
      let status = 'published';
      if (req.user && authorId && req.user.id === authorId) {
        // Author can view all their posts (both drafts and published)
        status = req.query.status || null;
      } else if (req.user && req.user.role === 'admin' && req.query.status) {
        status = req.query.status;
      }

      const result = PostModel.list({
        page,
        limit,
        search,
        status,
        authorId
      });

      return res.status(200).json({
        success: true,
        data: {
          posts: result.posts,
          pagination: {
            page: result.page,
            limit: result.limit,
            totalPosts: result.total,
            totalPages: result.totalPages
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static getPostById(req, res, next) {
    try {
      const { id } = req.params;
      let post;

      if (!isNaN(id)) {
        post = PostModel.findById(Number(id));
      } else {
        post = PostModel.findBySlug(id);
      }

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Draft privacy check: only author or admin can view draft
      if (post.status === 'draft') {
        const isAuthor = req.user && req.user.id === post.authorId;
        const isAdmin = req.user && req.user.role === 'admin';
        if (!isAuthor && !isAdmin) {
          return res.status(404).json({
            success: false,
            message: 'Post not found'
          });
        }
      }

      const comments = CommentModel.findByPostId(post.id);

      return res.status(200).json({
        success: true,
        data: {
          post,
          comments
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static createPost(req, res, next) {
    try {
      const { title, content, coverImageUrl, status } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Post title is required'
        });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Post content is required'
        });
      }

      const postStatus = status === 'draft' ? 'draft' : 'published';

      const post = PostModel.create({
        authorId: req.user.id,
        title,
        content,
        coverImageUrl: coverImageUrl ? coverImageUrl.trim() : null,
        status: postStatus
      });

      return res.status(201).json({
        success: true,
        data: {
          post
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static updatePost(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const post = PostModel.findById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Check ownership or admin
      const isOwner = req.user.id === post.authorId;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to edit this post'
        });
      }

      const { title, content, coverImageUrl, status } = req.body;

      if (title !== undefined && !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty'
        });
      }

      if (content !== undefined && !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Content cannot be empty'
        });
      }

      const updatedPost = PostModel.update(id, {
        title,
        content,
        coverImageUrl,
        status
      });

      return res.status(200).json({
        success: true,
        data: {
          post: updatedPost
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static deletePost(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const post = PostModel.findById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Check ownership or admin
      const isOwner = req.user.id === post.authorId;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this post'
        });
      }

      PostModel.delete(id);

      return res.status(200).json({
        success: true,
        data: {
          message: 'Post deleted successfully'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static getUserPosts(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Author not found'
        });
      }

      const isSameUser = req.user && req.user.id === userId;
      const isAdmin = req.user && req.user.role === 'admin';
      const status = isSameUser || isAdmin ? null : 'published';

      const result = PostModel.list({
        page: 1,
        limit: 100,
        authorId: userId,
        status
      });

      return res.status(200).json({
        success: true,
        data: {
          author: UserModel.sanitize(user),
          posts: result.posts
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PostController;

