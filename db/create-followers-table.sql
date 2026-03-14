-- Create followers table (run this in MySQL if it doesn't exist)
-- follower_id = who is following, following_id = who is being followed
CREATE TABLE IF NOT EXISTS followers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  follower_id INT NOT NULL,
  following_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_follower_following (follower_id, following_id),
  INDEX idx_followers_follower_id (follower_id),
  INDEX idx_followers_following_id (following_id)
);
