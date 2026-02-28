-- Create notifications table for new post and follow notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT 'recipient (who receives the notification)',
  actor_id INT NOT NULL COMMENT 'who did the action (poster or follower)',
  type VARCHAR(20) NOT NULL COMMENT 'new_post | new_follower',
  ref_id INT NULL COMMENT 'post_id for new_post, NULL for new_follower',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_created_at (created_at)
);
