const db = require("../config/db");

async function dashboard(req, res)
{
    const user_id = req.user.id;

    const profileSql = `
        SELECT *
        FROM profiles
        WHERE user_id = ?
    `;

    db.query(profileSql, [user_id], (err, profileResult) =>
    {
        if (err)
        {
            console.log(err);
            return res.send("Failed to load dashboard");
        }

        const rawProfile = profileResult.length > 0 ? profileResult[0] : null;
        const profile = {
            profile_image: (rawProfile && rawProfile.profile_image) ? rawProfile.profile_image : "default.png",
            full_name: (rawProfile && rawProfile.full_name) ? rawProfile.full_name : ""
        };

        const user = {
            ...req.user,
            posts_count: (rawProfile && rawProfile.posts_count != null) ? rawProfile.posts_count : 0,
            followers_count: (rawProfile && rawProfile.followers_count != null) ? rawProfile.followers_count : 0,
            following_count: (rawProfile && rawProfile.following_count != null) ? rawProfile.following_count : 0
        };

        // load posts for dashboard feed:
        // - posts from current user
        // - posts from people they follow
        // - posts from all public accounts (instagram-like mixed feed)
        const postsSql = `
                SELECT
                    p.post_id,
                    p.user_id,
                    u.username,
                    MAX(pr.profile_image) AS user_profile_image,
                    p.content,
                    p.image,
                    p.created_at,
                    COUNT(DISTINCT l.id) AS likes_count,
                    MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) AS liked_by_me
                FROM posts p
                JOIN users u ON p.user_id = u.id
                LEFT JOIN profiles pr ON pr.user_id = p.user_id
                LEFT JOIN followers f
                    ON f.following_id = p.user_id
                    AND f.follower_id = ?
                LEFT JOIN likes l
                    ON l.post_id = p.post_id
                WHERE p.user_id = ?
                   OR f.id IS NOT NULL
                   OR u.account_type = 'public'
                GROUP BY
                    p.post_id,
                    p.user_id,
                    u.username,
                    p.content,
                    p.image,
                    p.created_at
                ORDER BY p.created_at DESC
            `;

        db.query(postsSql, [user_id, user_id, user_id], (err2, postsResult) =>
        {
            if (err2)
            {
                console.log("Load posts error:", err2);
                return res.send("Failed to load posts");
            }

            const posts = postsResult || [];

            // helper to also attach unread notification count for badge
            const renderWithNotifications = (finalPosts, commentsByPost) =>
            {
                const notifSql = `
                    SELECT COUNT(*) AS cnt
                    FROM notifications
                    WHERE user_id = ?
                      AND is_read = 0
                `;

                db.query(notifSql, [user_id], (notifErr, notifResult) =>
                {
                    if (notifErr)
                    {
                        console.log("Load unread notifications error:", notifErr);
                    }

                    const unreadNotifications =
                        notifResult && notifResult[0] && notifResult[0].cnt
                            ? notifResult[0].cnt
                            : 0;

                    res.render("dashboard", {
                        user,
                        profile,
                        posts: finalPosts,
                        commentsByPost,
                        unreadNotifications
                    });
                });
            };

            // no posts at all – still render badge + empty feed
            if (posts.length === 0)
            {
                return renderWithNotifications([], {});
            }

            const postIds = posts.map(p => p.post_id);
            const placeholders = postIds.map(() => "?").join(",");

            const commentsSql = `
                SELECT
                    c.id,
                    c.post_id,
                    c.comment_text,
                    c.created_at,
                    u.username,
                    pr.profile_image AS user_profile_image
                FROM comments c
                JOIN users u ON c.user_id = u.id
                LEFT JOIN profiles pr ON pr.user_id = c.user_id
                WHERE c.post_id IN (${placeholders})
                ORDER BY c.created_at ASC
            `;

            db.query(commentsSql, postIds, (err3, commentsResult) =>
            {
                if (err3)
                {
                    console.log("Load comments error:", err3);
                    return res.send("Failed to load comments");
                }

                const commentsByPost = {};
                (commentsResult || []).forEach(row =>
                {
                    if (!commentsByPost[row.post_id])
                    {
                        commentsByPost[row.post_id] = [];
                    }
                    commentsByPost[row.post_id].push(row);
                });

                renderWithNotifications(posts, commentsByPost);
            });
        });
    });
}

// view all public posts (from all users) in 3-column grid
async function publicPosts(req, res) {
    const user_id = req.user.id;

    const profileSql = `
        SELECT *
        FROM profiles
        WHERE user_id = ?
    `;

    db.query(profileSql, [user_id], (err, profileResult) => {
        if (err) {
            console.log("Public posts profile error:", err);
            return res.send("Failed to load");
        }

        const profile = profileResult.length > 0
            ? profileResult[0]
            : { profile_image: "default.png" };

        const postsSql = `
            SELECT
                p.post_id,
                p.user_id,
                u.username,
                p.content,
                p.image,
                p.created_at,
                COUNT(DISTINCT l.id) AS likes_count,
                MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) AS liked_by_me
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN likes l ON l.post_id = p.post_id
            WHERE u.account_type = 'public'
            GROUP BY
                p.post_id,
                p.user_id,
                u.username,
                p.content,
                p.image,
                p.created_at
            ORDER BY p.created_at DESC
        `;

        db.query(postsSql, [user_id], (err2, postsResult) => {
            if (err2) {
                console.log("Public posts load error:", err2);
                return res.send("Failed to load posts");
            }

            const posts = postsResult || [];

            if (posts.length === 0) {
                return res.render("public-posts", {
                    user: req.user,
                    profile,
                    posts: [],
                    commentsByPost: {}
                });
            }

            const postIds = posts.map(p => p.post_id);
            const placeholders = postIds.map(() => "?").join(",");

            const commentsSql = `
                SELECT
                    c.id,
                    c.post_id,
                    c.comment_text,
                    c.created_at,
                    u.username
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.post_id IN (${placeholders})
                ORDER BY c.created_at ASC
            `;

            db.query(commentsSql, postIds, (err3, commentsResult) => {
                if (err3) {
                    console.log("Public posts comments error:", err3);
                    return res.send("Failed to load comments");
                }

                const commentsByPost = {};
                (commentsResult || []).forEach(row => {
                    if (!commentsByPost[row.post_id]) {
                        commentsByPost[row.post_id] = [];
                    }
                    commentsByPost[row.post_id].push(row);
                });

                res.render("public-posts", {
                    user: req.user,
                    profile,
                    posts,
                    commentsByPost
                });
            });
        });
    });
}

module.exports =
{
    dashboard,
    publicPosts
};
