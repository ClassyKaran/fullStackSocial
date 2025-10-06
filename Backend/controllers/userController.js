exports.updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    req.user.profileImage = `/uploads/${req.file.filename}`;
    await req.user.save();
    res.json({ success: true, profileImage: req.user.profileImage });
  } catch (err) {
    next(err);
  }
};
const User = require('../models/User');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).populate('followers following');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const isFollowing = req.user ? user.followers.some(f => f._id.equals(req.user.id)) : false;
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      followers: user.followers,
      following: user.following,
      isFollowing,
    });
  } catch (err) {
    next(err);
  }
};

exports.followUser = async (req, res, next) => {
  try {
    const target = await User.findById(req.body.userId);
    const user = await User.findById(req.user.id);
    if (!target || !user) return res.status(404).json({ error: 'User not found' });
    if (!target.followers.includes(user._id)) {
      target.followers.push(user._id);
      await target.save();
    }
    if (!user.following.includes(target._id)) {
      user.following.push(target._id);
      await user.save();
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const target = await User.findById(req.body.userId);
    const user = await User.findById(req.user.id);
    if (!target || !user) return res.status(404).json({ error: 'User not found' });
    target.followers = target.followers.filter(f => !f.equals(user._id));
    await target.save();
    user.following = user.following.filter(f => !f.equals(target._id));
    await user.save();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};


// ...existing code...

// Get all users controller
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, 'username email followers following');
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// ...existing code...