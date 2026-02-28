const db = require("../config/db");

// Helper to get user counts (posts, followers, following)
function getCounts(userId, cb) {
    const postsCountSql = "SELECT COUNT(*) AS posts_count FROM posts WHERE user_id = ?";
    const followersCountSql = "SELECT COUNT(*) AS followers_count FROM followers WHERE following_id = ?";
    const followingCountSql = "SELECT COUNT(*) AS following_count FROM followers WHERE follower_id = ?";

    db.query(postsCountSql, [userId], (err1, r1) => {
        if (err1) return cb(err1);
        const posts_count = r1 && r1[0] ? r1[0].posts_count : 0;

        db.query(followersCountSql, [userId], (err2, r2) => {
            if (err2) return cb(err2);
            const followers_count = r2 && r2[0] ? r2[0].followers_count : 0;

            db.query(followingCountSql, [userId], (err3, r3) => {
                if (err3) return cb(err3);
                const following_count = r3 && r3[0] ? r3[0].following_count : 0;
                cb(null, { posts_count, followers_count, following_count });
            });
        });
    });
}

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
            profile_image: (rawProfile && rawProfile.profile_image) ? rawProfile.profile_image : "default.png"
        };

        getCounts(user_id, (countErr, counts) => {
            if (countErr) {
                console.log("Dashboard counts error:", countErr);
                return res.send("Failed to load dashboard");
            }

            const user = {
                ...req.user,
                posts_count: counts.posts_count,
                followers_count: counts.followers_count,
                following_count: counts.following_count
            };

            // load posts from current user + people they follow
            const postsSql = `
                SELECT
                    p.post_id,
                    p.user_id,
                    u.username,
                    pr.profile_image AS user_profile_image,
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
                GROUP BY
                    p.post_id,
                    p.user_id,
                    u.username,
                    pr.profile_image,
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
                    user,
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

                res.render("dashboard", {
                    user,
                    profile,
                    posts,
                    commentsByPost
                });
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
