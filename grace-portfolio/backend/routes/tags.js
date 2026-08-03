const router = require('express').Router();
const db = require('../db/client');
const verifyJWT = require('../middleware/verifyJWT');

/*
GET /api/tags
Returns every tag alphabetically
*/
router.get('/', async (_req, res, next) => {
    try {
        const { rows } = await db.query(
            `
            SELECT *
            FROM tags
            ORDER BY name;
            `
        );

        res.json(rows);
    } catch (err) {
        next(err);
    }
});

/*
POST /api/tags
Create a new tag (admin only)
*/
router.post('/', verifyJWT, async (req, res, next) => {

    const { name, color } = req.body;

    if (!name) {
        return res.status(400).json({
            error: "Tag name required."
        });
    }

    try {

        const { rows } = await db.query(
            `
            INSERT INTO tags(name,color)
            VALUES($1,$2)
            RETURNING *;
            `,
            [
                name,
                color || "#2563eb"
            ]
        );

        res.status(201).json(rows[0]);

    } catch (err) {

        next(err);

    }

});

module.exports = router;