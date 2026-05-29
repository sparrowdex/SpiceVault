const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const auth = require('../middleware/auth');

// Follow System (Requires Login)
router.post('/follow/:userId', auth, socialController.followUser);
router.delete('/unfollow/:userId', auth, socialController.unfollowUser);
router.get('/follow-status/:userId', auth, socialController.getFollowingStatus);
router.get('/recommended-users', auth, socialController.getRecommendedUsers);
router.get('/profile/:userId', socialController.getPublicProfile);

// Culinary Feed (Requires Login)
router.post('/stories', auth, socialController.createStory);
router.get('/stories/feed', auth, socialController.getFeedStories);
router.delete('/stories/:storyId', auth, socialController.deleteStory);

// Feed Posts
router.post('/feed', auth, socialController.createFeedPost);
router.get('/feed', auth, socialController.getFeed);
router.delete('/feed/:postId', auth, socialController.deleteFeedPost);
router.put('/feed/:postId', auth, socialController.updateFeedPost);
router.post('/feed/:postId/like', auth, socialController.toggleLikePost);
router.post('/feed/:postId/reply', auth, socialController.replyToPost);

// Articles
router.post('/articles', auth, socialController.createArticle);
router.get('/articles/featured', socialController.getFeaturedArticles); // Public route!

module.exports = router;