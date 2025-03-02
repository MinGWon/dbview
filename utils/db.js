import mysql from 'mysql2/promise';

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'qqq',
});

export default db;