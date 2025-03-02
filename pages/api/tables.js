import db from '../../utils/db';

export default async function handler(req, res) {
    try {
        const [tables] = await db.query('SHOW TABLES');
        const tableNames = tables.map(table => Object.values(table)[0]);
        res.status(200).json(tableNames);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tables' });
    }
}