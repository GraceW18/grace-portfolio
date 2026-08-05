const router = require("express").Router();
const db = require("../db/client");
const verifyJWT = require("../middleware/verifyJWT");
/*
GET /api/tags
Returns every tag alphabetically.
*/
router.get("/", async (req, res, next) => {
    try {
        const scope = req.query.scope;
        const { rows } = await db.query(
            scope
                ? `SELECT * FROM tags WHERE scope = $1 ORDER BY name`
                : `SELECT * FROM tags ORDER BY name`,
            scope ? [scope] : []
        );
        res.json(rows);
    } catch (err) { next(err); }
});

/*
POST /api/tags
Create a new tag.
(Admin only)
*/
router.post("/", verifyJWT, async (req, res, next) => {
    let { name, color, icon, scope } = req.body || {};
    name = (name || "").trim();
    if (!name) {
        return res.status(400).json({
            error: "Tag name is required."
        });
    }
    try {
        // Don't allow duplicate names
        const existing = await db.query(
            `SELECT id FROM tags WHERE LOWER(name)=LOWER($1)`,
            [name]
        );
        if (existing.rows.length) {
            return res.status(409).json({
                error: "That tag already exists."
            });
        }

        const { rows } = await db.query(
            `
            INSERT INTO tags(name, color, icon, scope)
            VALUES($1, $2, $3, $4)
            RETURNING *;
            `,
            [name, color || "#2563eb", icon || "tag", scope || "post"]
        );
        res.status(201).json(rows[0]);
    }
    catch (err) {
        next(err);
    }
});

/*
PUT /api/tags/:id
Update an existing tag's name and/or color.
(Admin only)
*/
router.put("/:id", verifyJWT, async (req, res, next) => {
    const { id } = req.params;
    let { name, color, icon, scope } = req.body || {};
    name = (name || "").trim();
    if (!name) {
        return res.status(400).json({
            error: "Tag name is required."
        });
    }
    try {
        // Don't allow the new name to collide with another tag
        const clash = await db.query(
            `
            SELECT id
            FROM tags
            WHERE LOWER(name) = LOWER($1)
              AND id <> $2
            `,
            [name, id]
        );
        if (clash.rows.length) {
            return res.status(409).json({
                error: "Another tag already uses that name."
            });
        }
        const { rows } = await db.query(
            `
            UPDATE tags
            SET name = $1,
                color = COALESCE($2, color),
                icon = COALESCE($3, icon),
                scope = COALESCE($4, scope)
            WHERE id = $5
            RETURNING *;
            `,
            [ name, color || null, icon || null, scope || null, id]
        );
        if (!rows.length) {
            return res.status(404).json({
                error: "Tag not found."
            });
        }
        res.json(rows[0]);
    }
    catch (err) {
        next(err);
    }
});

/*
DELETE /api/tags/:id
Remove a tag.
Cascades through post_tags via the FK ON DELETE CASCADE.
(Admin only)
*/
router.delete("/:id", verifyJWT, async (req, res, next) => {
    try {
        const { rows } = await db.query(
            `
            DELETE FROM tags
            WHERE id = $1
            RETURNING *;
            `,
            [req.params.id]
        );
        if (!rows.length) {
            return res.status(404).json({
                error: "Tag not found."
            });
        }
        res.json({ success: true, deleted: rows[0] });
    }
    catch (err) {
        next(err);
    }
});

module.exports = router;