const Post = require('../models/Post');
const User = require('../models/User');

exports.unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    const idx = post.likes.indexOf(req.user.id);
    if (idx !== -1) {
      post.likes.splice(idx, 1);
      await post.save();
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate('author likes comments.user').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

exports.getPostsByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ author: userId }).populate('author likes comments.user').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, description, content } = req.body;
    let imagePath = '';
    let videoPath = '';
    if (req.files && req.files.image && req.files.image[0]) {
      imagePath = `/uploads/${req.files.image[0].filename}`;
    }
    if (req.files && req.files.video && req.files.video[0]) {
      videoPath = `/uploads/${req.files.video[0].filename}`;
    }
    const post = await Post.create({
      author: req.user.id,
      title,
      description,
      image: imagePath,
      video: videoPath,
      content
    });
    res.json(post);
  } catch (err) {
    next(err);
  }
};

exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      await post.save();
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
};

exports.commentPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ user: req.user.id, text: req.body.text });
    await post.save();
    // Re-fetch and populate comments.user
    const populatedPost = await Post.findById(req.params.id).populate('author likes comments.user');
    res.json(populatedPost);
  } catch (err) {
    next(err);
  }
};

// New deletePost controller
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }
    await post.remove();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
};
