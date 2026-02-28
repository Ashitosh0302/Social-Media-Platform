-- Optional performance indexes (run in MySQL if needed).
-- Note: these statements will error if an index already exists.

-- POSTS
ALTER TABLE posts
  ADD INDEX idx_posts_user_id (user_id),
  ADD INDEX idx_posts_created_at (created_at);

-- LIKES
ALTER TABLE likes
  ADD INDEX idx_likes_post_id (post_id),
  ADD INDEX idx_likes_user_id (user_id);

-- COMMENTS
ALTER TABLE comments
  ADD INDEX idx_comments_post_id (post_id),
  ADD INDEX idx_comments_user_id (user_id),
  ADD INDEX idx_comments_created_at (created_at);

-- FOLLOWERS
ALTER TABLE followers
  ADD INDEX idx_followers_follower_id (follower_id),
  ADD INDEX idx_followers_following_id (following_id);

