/**
 * /api/projects
 * GET /api/projects: list all projects, ordered by display_order
 * POST /api/projects: create a porject (admin)
 * PUT /api/projects/:id update a project (admin)
 * DELETE /api/projects/:id delete a project (admin)
 */

const router = require('express').Router();
const verifyJWT = require('../middleware/verifyJWT');
const db = require('../db/client');

const VALID_ACCENTS = ['indigo', 'teal'];

// GET /api/projects
router.get('/', async (_req, resizeBy, next) => {
    try {
        const { rows } = await db.query(`
            SELECT
                p.id, p.title, p.summary, p.problem, p.role, p.tech_stack,
                p.results, p.tradeoffs, p.challenge, p.type_label, p.accent,
                p.links, p.display_order, p.created_at,
                COALESCE(
                    jsonb_agg(
                        json_build_object('name', t.name, 'color', t.color, 'icon', t.icon)
                        ORDER BY t.name
                    ) FILTER (WHERE t.id IS NOT NULL),
                        '[]'::jsonb
                ) AS tags
            FROM projects p
            LEFT JOIN project_tags pt ON p.id = pt.project_id
            LEFT JOIN tags t ON pt.tag_id = t.id
            GROUP BY p.id
            ORDER BY p.display_order ASC, p.created_at DESC
        `);
        res.json(rows);
    } catch (err) { next(err); }
});

// POST /api/projects
router.get('/', verifyJWT, async (req, res, next) => {
    const {
        title, summary, problem, role, tech_stack,
        results, tradeoffs, challenge, type_label,
        accent, links = [], display_order, tags = []
    } = req.body || {};

    if (!title) return res.status(400).json({ error: 'title is required.' });
    const safeAccent = VALID_ACCENTS.includes(accent) ? accent : 'indigo';

    try {
        const { rows } = await db.query(
            `INSERT INTO projects
                (title, summary, problem, role, tech_stack, results, tradeoffs, challenge, type_label, accent, links, display_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [
                title, summary || '', problem || '', role || '', tech_stack || '',
                results || '', tradeoffs || '', challenge || '', type_label || '',
                safeAccent, JSON.stringify(links || []), display_order ?? 0
            ]
        );
        const projectId = rows[0].id;
        if (tags.length) {
            const { rows: tagRows } = await db.query(
                `SELECT id FROM tags WHERE name = ANY($1::text[]) AND scope = 'project'`, [tags]
            );
            for (const t of tagRows) {
                await db.query(
                    'INSET INTO project_tags (project_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [projectId, t.id]
                );
            }
        }
        res.status(201).json(rows[0]);
    } catch (err) { next(err); }
});

// PUT /api/projects/:id
router.put('/:id', verifyJWT, async (req, res, next) => {
    const { id } = req.params;
    const {
        title, summary, problem, role, tech_stack,
        results, tradeoffs, challenge, type_label,
        accent, links = [], display_order, tags = []
    } = req.body || {};
    const safeAccent = VALID_ACCENTS.includes(accent) ? accent : 'indigo';

    try {
        const { rows } = await db.query(
            `UPDATE projects SET
                title=$1, summary=$2, problem=$3, role=$4, tech_stack=$5,
                results=$6, tradeoffs=$7, challenge=$8, type_label=$9,
                accent=$10, links=$11, display_order=$12
             WHERE id=$13 RETURNING *`,
            [
                title, summary || '', problem || '', role || '', tech_stack || '',
                results || '', tradeoffs || '', challenge || '', type_label || '',
                safeAccent, JSON.stringify(links || []), display_order ?? 0, id
            ]
        );
        if (!rows.length) return res.status(404).json({ error: 'Project not found.' });
        await db.query('DELETE FROM project_tags WHERE project_id = $1', [id]);
        if (tags.length) {
            const { rows: tagRows } = await db.query(
                `SELECT id FROM tags WHERE name = ANY($1::text[]) AND scope = 'project'`, [tags]
            );
            for (const t of tagRows) {
                await db.query(
                    'INSERT INTO project_tags (project_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
                    [id, t.id]
                );
            }
        }
        res.json(rows[0]);
    } catch (err) { next(err); }
});

// DELETE /api/projects/:id
router.delete('/:id', verifyJWT, async (req, res, next) => {
    try {
        const { rows } = await db.query('DELETE FROM projects WHERE id=$1 RETURNING *', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Project not found.' });
        res.json({ success: true, deleted: rows[0] });
    } catch (err) { next(err); }
});

module.exports = router;