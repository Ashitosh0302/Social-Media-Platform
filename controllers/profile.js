const db = require("../config/db");

// load all posts for a given user with like and comment counts
function getUserPosts(userId, cb) {
    const sql = `
        SELECT
            p.post_id,
            p.content,
            p.image,
            p.created_at,
            COALESCE(l.likes_count, 0) AS likes_count,
            COALESCE(c.comments_count, 0) AS comments_count
        FROM posts p
        LEFT JOIN (
            SELECT post_id, COUNT(*) AS likes_count
            FROM likes
            GROUP BY post_id
        ) l ON l.post_id = p.post_id
        LEFT JOIN (
            SELECT post_id, COUNT(*) AS comments_count
            FROM comments
            GROUP BY post_id
        ) c ON c.post_id = p.post_id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) return cb(err);
        cb(null, results || []);
    });
}

// render own profile page
async function profilePage(req, res) {
    const user_id = req.user.id;

    const sql = `
        SELECT users.username, profiles.*
        FROM users
        LEFT JOIN profiles ON users.id = profiles.user_id
        WHERE users.id = ?
    `;

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.log("Profile page query error:", err);
            return res.send("Failed to load profile");
        }

        const row = result.length > 0 ? result[0] : null;

        getUserPosts(user_id, (postsErr, userPosts) => {
            if (postsErr) {
                console.log("Profile posts load error:", postsErr);
                return res.send("Failed to load profile");
            }

            // live follower/following counts so they always match the followers table
            const statsSql = `
                SELECT
                    (SELECT COUNT(*) FROM followers WHERE following_id = ?) AS followers_count,
                    (SELECT COUNT(*) FROM followers WHERE follower_id = ?) AS following_count
            `;

            db.query(statsSql, [user_id, user_id], (statsErr, statsResult) => {
                if (statsErr) {
                    console.log("Profile stats query error:", statsErr);
                    return res.send("Failed to load profile");
                }

                const statsRow = (statsResult && statsResult[0]) || {};

                const profile = row
                    ? {
                        profile_image: row.profile_image || "default.png",
                        full_name: row.full_name || "",
                        posts_count: userPosts.length,
                        followers_count: statsRow.followers_count != null ? statsRow.followers_count : 0,
                        following_count: statsRow.following_count != null ? statsRow.following_count : 0
                    }
                    : {
                        profile_image: "default.png",
                        full_name: "",
                        posts_count: userPosts.length,
                        followers_count: statsRow.followers_count != null ? statsRow.followers_count : 0,
                        following_count: statsRow.following_count != null ? statsRow.following_count : 0
                    };

                const profileUser = {
                    id: req.user.id,
                    username: row && row.username ? row.username : req.user.username
                };

                res.render("profile", {
                    user: req.user,
                    profile,
                    profileUser,
                    isOwner: true,
                    isFollowing: false,
                    userPosts
                });
            });
        });
    });
}

// view another user's profile by id
async function viewUserProfile(req, res) {
    const targetUserId = req.params.id;

    const sql = `
        SELECT users.id, users.username, profiles.*
        FROM users
        LEFT JOIN profiles ON users.id = profiles.user_id
        WHERE users.id = ?
    `;

    db.query(sql, [targetUserId], (err, result) => {
        if (err) {
            console.log("View user profile query error:", err);
            return res.send("Failed to load user profile");
        }

        if (result.length === 0) {
            return res.status(404).send("User not found");
        }

        const row = result[0];

        const profileUser = {
            id: row.id,
            username: row.username
        };

        const isOwner = req.user && String(req.user.id) === String(row.id);

        // follow status for viewer -> target
        const followingSql = "SELECT id FROM followers WHERE follower_id = ? AND following_id = ? LIMIT 1";
        db.query(followingSql, [req.user.id, row.id], (fErr, fRes) => {
            if (fErr) {
                console.log("Follow status error:", fErr);
                return res.send("Failed to load user profile");
            }

            const isFollowing = (fRes || []).length > 0;

            getUserPosts(row.id, (postsErr, userPosts) => {
                if (postsErr) {
                    console.log("Profile posts load error:", postsErr);
                    return res.send("Failed to load user profile");
                }

                const statsSql = `
                    SELECT
                        (SELECT COUNT(*) FROM followers WHERE following_id = ?) AS followers_count,
                        (SELECT COUNT(*) FROM followers WHERE follower_id = ?) AS following_count
                `;

                db.query(statsSql, [row.id, row.id], (statsErr, statsResult) => {
                    if (statsErr) {
                        console.log("Profile stats query error:", statsErr);
                        return res.send("Failed to load user profile");
                    }

                    const statsRow = (statsResult && statsResult[0]) || {};

                    const profile = {
                        profile_image: row.profile_image || "default.png",
                        full_name: row.full_name || "",
                        posts_count: userPosts.length,
                        followers_count: statsRow.followers_count != null ? statsRow.followers_count : 0,
                        following_count: statsRow.following_count != null ? statsRow.following_count : 0
                    };

                    res.render("profile", {
                        user: req.user,
                        profile,
                        profileUser,
                        isOwner,
                        isFollowing,
                        userPosts
                    });
                });
            });
        });
    });
}

// follow/unfollow (toggle)
async function toggleFollow(req, res) {
    const follower_id = req.user.id;
    const following_id = req.params.id;

    if (String(follower_id) === String(following_id)) {
        return res.redirect("/profile/" + follower_id);
    }

    const checkSql = "SELECT id FROM followers WHERE follower_id = ? AND following_id = ? LIMIT 1";
    db.query(checkSql, [follower_id, following_id], (err, result) => {
        if (err) {
            console.log("Toggle follow check error:", err);
            return res.redirect("/profile/" + following_id);
        }

        if ((result || []).length > 0) {
            const delSql = "DELETE FROM followers WHERE follower_id = ? AND following_id = ?";
            db.query(delSql, [follower_id, following_id], (err2) => {
                if (err2) console.log("Unfollow error:", err2);
                res.redirect("/profile/" + following_id);
            });
        } else {
            const insSql = "INSERT INTO followers (follower_id, following_id) VALUES (?, ?)";
            db.query(insSql, [follower_id, following_id], (err2) => {
                if (err2) console.log("Follow insert error:", err2);
                else {
                    // notify the followed user that someone followed them
                    const notifSql = "INSERT INTO notifications (user_id, actor_id, type) VALUES (?, ?, 'new_follower')";
                    db.query(notifSql, [following_id, follower_id]);
                }
                res.redirect("/profile/" + following_id);
            });
        }
    });
}

// search users by username (for suggestions)
async function searchUsers(req, res) {
    let query = (req.query.q || req.query.query || "").trim();

    if (query.length > 50) {
        query = query.slice(0, 50);
    }

    if (!query) {
        return res.json([]);
    }

    const sql = `
        SELECT users.id,
               users.username,
               COALESCE(profiles.profile_image, 'default.png') AS profile_image
        FROM users
        LEFT JOIN profiles ON users.id = profiles.user_id
        WHERE users.username LIKE ?
        ORDER BY users.username
        LIMIT 10
    `;

    db.query(sql, [`%${query}%`], (err, results) => {
        if (err) {
            console.log("Search users query error:", err);
            return res.status(500).json({ error: "Failed to search users" });
        }

        const formatted = results.map((row) => ({
            id: row.id,
            username: row.username,
            profile_image: row.profile_image || "default.png"
        }));

        res.json(formatted);
    });
}

// view list of followers for a user
async function viewFollowers(req, res) {
    const targetUserId = req.params.id;

    const userSql = `
        SELECT users.id, users.username
        FROM users
        WHERE users.id = ?
    `;

    db.query(userSql, [targetUserId], (err, userResult) => {
        if (err) {
            console.log("View followers user query error:", err);
            return res.send("Failed to load");
        }

        if (!userResult || userResult.length === 0) {
            return res.status(404).send("User not found");
        }

        const profileUser = {
            id: userResult[0].id,
            username: userResult[0].username
        };

        const followersSql = `
            SELECT
                u.id,
                u.username,
                COALESCE(p.profile_image, 'default.png') AS profile_image
            FROM followers f
            JOIN users u ON f.follower_id = u.id
            LEFT JOIN profiles p ON p.user_id = u.id
            WHERE f.following_id = ?
            ORDER BY u.username
        `;

        db.query(followersSql, [targetUserId], (fErr, followersResult) => {
            if (fErr) {
                console.log("View followers query error:", fErr);
                return res.send("Failed to load followers");
            }

            const people = (followersResult || []).map((row) => ({
                id: row.id,
                username: row.username,
                profile_image: row.profile_image || "default.png"
            }));

            res.render("followers", {
                user: req.user,
                profileUser,
                listType: "followers",
                people
            });
        });
    });
}

// view list of users that this user is following
async function viewFollowing(req, res) {
    const targetUserId = req.params.id;

    const userSql = `
        SELECT users.id, users.username
        FROM users
        WHERE users.id = ?
    `;

    db.query(userSql, [targetUserId], (err, userResult) => {
        if (err) {
            console.log("View following user query error:", err);
            return res.send("Failed to load");
        }

        if (!userResult || userResult.length === 0) {
            return res.status(404).send("User not found");
        }

        const profileUser = {
            id: userResult[0].id,
            username: userResult[0].username
        };

        const followingSql = `
            SELECT
                u.id,
                u.username,
                COALESCE(p.profile_image, 'default.png') AS profile_image
            FROM followers f
            JOIN users u ON f.following_id = u.id
            LEFT JOIN profiles p ON p.user_id = u.id
            WHERE f.follower_id = ?
            ORDER BY u.username
        `;

        db.query(followingSql, [targetUserId], (fErr, followingResult) => {
            if (fErr) {
                console.log("View following query error:", fErr);
                return res.send("Failed to load following");
            }

            const people = (followingResult || []).map((row) => ({
                id: row.id,
                username: row.username,
                profile_image: row.profile_image || "default.png"
            }));

            res.render("followers", {
                user: req.user,
                profileUser,
                listType: "following",
                people
            });
        });
    });
}

// update or insert profile image safely
async function updateProfileImage(req, res) {

    console.log("req.user.id:", req.user?.id);

    const user_id = req.user.id;
    const image = req.file && req.file.filename;

    if (!image) {
        return res.send("No image uploaded");
    }

    // Step 1: Check if user exists
    const checkUserSql = "SELECT id FROM users WHERE id = ?";
    db.query(checkUserSql, [user_id], (err, result) => {
        if (err) {
            console.log("Check user error:", err);
            return res.send("DB error");
        }

        if (result.length === 0) {
            return res.send("User does not exist");
        }

        // Step 2: UPSERT profile image
        const sql = `
            INSERT INTO profiles (user_id, profile_image)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE profile_image = VALUES(profile_image);
        `;

        db.query(sql, [user_id, image], (err) => {
            if (err) {
                console.log("Profile image save error:", err);
                return res.send("Failed to save profile image");
            }

            res.redirect("/profile");
        });
    });
}

module.exports =
{
    profilePage,
    viewUserProfile,
    toggleFollow,
    searchUsers,
    updateProfileImage,
    viewFollowers,
    viewFollowing
};
