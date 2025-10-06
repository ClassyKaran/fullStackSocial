const express = require('express');
const router = express.Router();
const { getProfile, followUser, unfollowUser, getAllUsers, updateProfileImage } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');


router.get('/getalluser', getAllUsers);
router.get('/:userId', authMiddleware, getProfile);
router.post('/follow', authMiddleware, followUser);
router.post('/unfollow', authMiddleware, unfollowUser);

// Profile image upload
router.post('/profile-image', authMiddleware, upload.single('profileImage'), updateProfileImage);


module.exports = router;


