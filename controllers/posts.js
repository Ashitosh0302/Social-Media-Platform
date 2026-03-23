const db = require("../config/db");

const MAX_POST_LENGTH = 1000;
const MAX_COMMENT_LENGTH = 500;

// create a new post (text + optional image)
async function createPost(req, res) {
    const user_id = req.user.id;
    let content = (req.body.content || "").trim();
    const image = req.file
        ? (req.file.imageUrl || (req.file.filename ? req.file.filename : null))
        : null;

    if (content.length > MAX_POST_LENGTH) {
        content = content.slice(0, MAX_POST_LENGTH);
    }

    if (!content && !image) {
        return res.redirect("/dashboard");
    }

    const sql = `
        INSERT INTO posts (user_id, content, image)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [user_id, content, image], (err, result) => {
        if (err) {
            console.error("Create post error:", err.code, err.sqlMessage);
            if (err.code === "ER_NO_SUCH_TABLE") {
                return res.status(500).send("Database not configured. Please run the SQL scripts in the db/ folder.");
            }
            return res.status(500).send("Failed to create post. Please try again.");
        }

        const post_id = result && result.insertId;

        // notify all followers that this user posted
        if (post_id) {
            const followersSql = "SELECT follower_id FROM followers WHERE following_id = ?";
            db.query(followersSql, [user_id], (fErr, followers) => {
                if (!fErr && followers && followers.length > 0) {
                    const notifSql = "INSERT INTO notifications (user_id, actor_id, type, ref_id) VALUES (?, ?, 'new_post', ?)";
                    followers.forEach((row) => {
                        db.query(notifSql, [row.follower_id, user_id, post_id]);
                    });
                }
                res.redirect("/dashboard");
            });
        } else {
            res.redirect("/dashboard");
        }
    });
}

// like/unlike a post (toggle)
async function toggleLike(req, res) {
    const user_id = req.user.id;
    const post_id = parseInt(req.params.id, 10);

    if (!Number.isInteger(post_id) || post_id <= 0) {
        return res.redirect("/dashboard");
    }

    const checkSql = "SELECT id FROM likes WHERE user_id = ? AND post_id = ?";

    db.query(checkSql, [user_id, post_id], (err, result) => {
        if (err) {
            console.log("Check like error:", err);
            return res.redirect("/dashboard");
        }

        if (result.length > 0) {
            // already liked -> unlike
            const deleteSql = "DELETE FROM likes WHERE user_id = ? AND post_id = ?";
            db.query(deleteSql, [user_id, post_id], (err2) => {
                if (err2) {
                    console.log("Unlike error:", err2);
                }
                res.redirect("/dashboard");
            });
        } else {
            // not liked -> like
            const insertSql = "INSERT INTO likes (user_id, post_id) VALUES (?, ?)";
            db.query(insertSql, [user_id, post_id], (err2) => {
                if (err2) {
                    console.log("Like insert error:", err2);
                }
                res.redirect("/dashboard");
            });
        }
    });
}

// add a comment to a post
async function addComment(req, res) {
    const user_id = req.user.id;
    const post_id = parseInt(req.params.id, 10);
    let comment_text = (req.body.comment_text || "").trim();

    if (!Number.isInteger(post_id) || post_id <= 0) {
        return res.redirect("/dashboard");
    }

    if (comment_text.length > MAX_COMMENT_LENGTH) {
        comment_text = comment_text.slice(0, MAX_COMMENT_LENGTH);
    }

    if (!comment_text) {
        return res.redirect("/dashboard");
    }

    const sql = `
        INSERT INTO comments (post_id, user_id, comment_text)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [post_id, user_id, comment_text], (err) => {
        if (err) {
            console.log("Add comment error:", err);
            return res.send("Failed to add comment");
        }

        res.redirect("/dashboard");
    });
}

// delete a post
async function deletePost(req, res) {
    const user_id = req.user.id;
    const post_id = parseInt(req.params.id, 10);

    if (!Number.isInteger(post_id) || post_id <= 0) {
        return res.redirect(req.get('Referer') || '/dashboard');
    }

    // Verify ownership
    const checkSql = "SELECT post_id FROM posts WHERE post_id = ? AND user_id = ?";
    db.query(checkSql, [post_id, user_id], (err, results) => {
        if (err || results.length === 0) {
            return res.redirect(req.get('Referer') || '/dashboard');
        }

        // Sequential deletes to ensure no orphaned relational rows
        db.query("DELETE FROM comments WHERE post_id = ?", [post_id], () => {
            db.query("DELETE FROM likes WHERE post_id = ?", [post_id], () => {
                db.query("DELETE FROM notifications WHERE type = 'new_post' AND ref_id = ?", [post_id], () => {
                    db.query("DELETE FROM posts WHERE post_id = ?", [post_id], () => {
                        res.redirect(req.get('Referer') || '/dashboard');
                    });
                });
            });
        });
    });
}

module.exports = {
    createPost,
    toggleLike,
    addComment,
    deletePost
};

