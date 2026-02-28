const db = require("../config/db");

// get all notifications for current user (newest first)
function getNotifications(req, res) {
    const user_id = req.user.id;

    const sql = `
        SELECT
            n.id,
            n.user_id,
            n.actor_id,
            n.type,
            n.ref_id,
            n.is_read,
            n.created_at,
            u.username AS actor_username,
            COALESCE(p.profile_image, 'default.png') AS actor_profile_image
        FROM notifications n
        JOIN users u ON n.actor_id = u.id
        LEFT JOIN profiles p ON p.user_id = u.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT 100
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.log("Get notifications error:", err);
            return res.status(500).json({ error: "Failed to load notifications" });
        }

        const notifications = (results || []).map((row) => ({
            id: row.id,
            type: row.type,
            ref_id: row.ref_id,
            actor_id: row.actor_id,
            actor_username: row.actor_username,
            actor_profile_image: row.actor_profile_image || "default.png",
            is_read: row.is_read,
            created_at: row.created_at
        }));

        res.json(notifications);
    });
}

// mark notification(s) as read
function markAsRead(req, res) {
    const user_id = req.user.id;
    const ids = req.body.ids;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.json({ ok: true });
    }

    const placeholders = ids.map(() => "?").join(",");
    const params = [...ids, user_id];

    const sql = `UPDATE notifications SET is_read = 1 WHERE id IN (${placeholders}) AND user_id = ?`;

    db.query(sql, params, (err) => {
        if (err) {
            console.log("Mark notifications read error:", err);
            return res.status(500).json({ error: "Failed to update" });
        }
        res.json({ ok: true });
    });
}

// get unread count for badge
function getUnreadCount(req, res) {
    const user_id = req.user.id;

    const sql = "SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = 0";

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ count: 0 });
        }
        const count = result && result[0] ? result[0].cnt : 0;
        res.json({ count });
    });
}

module.exports = {
    getNotifications,
    markAsRead,
    getUnreadCount
};
