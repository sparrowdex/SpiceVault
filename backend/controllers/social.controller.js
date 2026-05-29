const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==========================================
// FOLLOW SYSTEM
// ==========================================

exports.followUser = async (req, res) => {
  try {
    const follower_id = req.user.userId;
    const following_id = parseInt(req.params.userId);

    if (follower_id === following_id) {
      return res.status(400).json({ success: false, error: 'You cannot follow yourself.' });
    }

    const follow = await prisma.follow.create({
      data: { follower_id, following_id }
    });
    res.status(201).json({ success: true, message: 'Followed successfully', follow });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ success: false, error: 'Already following this chef.' });
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const follower_id = req.user.userId;
    const following_id = parseInt(req.params.userId);

    await prisma.follow.delete({
      where: { follower_id_following_id: { follower_id, following_id } }
    });
    res.status(200).json({ success: true, message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFollowingStatus = async (req, res) => {
  try {
    const follower_id = req.user.userId;
    const following_id = parseInt(req.params.userId);

    const follow = await prisma.follow.findUnique({
      where: { follower_id_following_id: { follower_id, following_id } }
    });
    res.status(200).json({ success: true, isFollowing: !!follow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// CULINARY FEED (STORIES / THREADS)
// ==========================================

exports.createStory = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { user_id: req.user.userId } });
    if (user.user_type !== 'chef') return res.status(403).json({ success: false, error: 'Only chefs can post updates.' });

    const { image_url, content } = req.body;
    // Stories automatically expire 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await prisma.story.create({
      data: { image_url, content, expiresAt, user_id: req.user.userId }
    });
    res.status(201).json({ success: true, message: 'Story published successfully', story });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFeedStories = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Get all chefs this user is following
    const following = await prisma.follow.findMany({
      where: { follower_id: userId },
      select: { following_id: true }
    });

    // 2. Add the user's own ID so they can see their own stories
    const followingIds = following.map(f => f.following_id);
    followingIds.push(userId);

    // 3. Fetch all unexpired stories from those users
    const stories = await prisma.story.findMany({
      where: {
        user_id: { in: followingIds },
        expiresAt: { gt: new Date() } // EXPIRES MAGIC: Only get stories where expiration is in the future!
      },
      include: {
        user: { select: { f_name: true, l_name: true, user_type: true, profile_picture: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, stories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const storyId = parseInt(req.params.storyId);
    const story = await prisma.story.findUnique({ where: { story_id: storyId } });
    
    if (!story) return res.status(404).json({ success: false, error: 'Story not found' });
    if (story.user_id !== req.user.userId) return res.status(403).json({ success: false, error: 'Not authorized to delete this story' });

    await prisma.story.delete({ where: { story_id: storyId } });
    res.status(200).json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createFeedPost = async (req, res) => {
  try {
    const { content, media_url, media_type, recipe_id, review_id } = req.body;
    const post = await prisma.feedPost.create({
      data: {
        content,
        media_url,
        media_type,
        recipe_id,
        review_id,
        user_id: req.user.userId
      }
    });
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const userId = req.user.userId;
    const following = await prisma.follow.findMany({
      where: { follower_id: userId },
      select: { following_id: true }
    });
    const followingIds = following.map(f => f.following_id);
    followingIds.push(userId); // include own posts

    const posts = await prisma.feedPost.findMany({
      where: { user_id: { in: followingIds } },
      include: {
        user: { select: { f_name: true, l_name: true, user_type: true, profile_picture: true } },
        recipe: { select: { title: true, image_url: true } },
        review: { select: { rating: true, review_text: true, recipe: { select: { title: true, image_url: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// FEATURED ARTICLES
// ==========================================

exports.createArticle = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { user_id: req.user.userId } });
    if (user.user_type !== 'chef') return res.status(403).json({ success: false, error: 'Only chefs can write articles.' });

    const { title, category, image_url, content, read_time } = req.body;

    const article = await prisma.article.create({
      data: { title, category, image_url, content, read_time: read_time || "5 min read", author_id: req.user.userId }
    });
    res.status(201).json({ success: true, message: 'Article published successfully', article });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFeaturedArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const articles = await prisma.article.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { f_name: true, l_name: true, profile_picture: true } } }
    });
    res.status(200).json({ success: true, articles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};