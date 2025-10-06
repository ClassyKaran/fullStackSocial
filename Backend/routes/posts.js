const express = require('express');
const router = express.Router();
const { getPosts, getPostsByUser, createPost, likePost, commentPost, deletePost } = require('../controllers/postController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', getPosts);
router.get('/user/:userId', getPostsByUser);
router.post('/', authMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createPost);
router.post('/:id/like', authMiddleware, likePost);
router.post('/:id/unlike', authMiddleware, require('../controllers/postController').unlikePost);
router.post('/:id/comment', authMiddleware, commentPost);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
