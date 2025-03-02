import db from '../../utils/db';

export default async function handler(req, res) {
    const { table } = req.query;

    if (!table) {
        return res.status(400).json({ error: 'Table name is required' });
    }

    try {
        const [rows] = await db.query(`SELECT * FROM ??`, [table]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
}