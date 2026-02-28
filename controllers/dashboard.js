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

        const profile = profileResult.length > 0
            ? profileResult[0]
            : {
                profile_image: "default.png"
            };

        // load posts from current user + people they follow
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
            LEFT JOIN followers f
                ON f.following_id = p.user_id
                AND f.follower_id = ?
            LEFT JOIN likes l
                ON l.post_id = p.post_id
            WHERE p.user_id = ?
               OR f.id IS NOT NULL
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

            if (posts.length === 0)
            {
                return res.render("dashboard", {
                    user: req.user,
                    profile: profile,
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

                res.render("dashboard", {
                    user: req.user,
                    profile: profile,
                    posts: posts,
                    commentsByPost: commentsByPost
                });
            });
        });
    });
}

module.exports =
{
    dashboard
};
