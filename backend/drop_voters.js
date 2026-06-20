const mysql = require('mysql2/promise');

async function dropAndSync() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'election-manager'
    });

    await connection.execute('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.execute('DROP TABLE IF EXISTS voters;');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('Dropped voters table.');
    connection.end();
}

dropAndSync().catch(console.error);
