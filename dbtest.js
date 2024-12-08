const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL 연결 풀 생성
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// 환경 변수 확인 (테스트용)
console.log('Environment variables loaded:', {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// 연결 테스트 및 간단한 쿼리 실행
async function testDatabase() {
    try {
        // 연결 확인
        const client = await pool.connect();
        console.log('Connected to PostgreSQL');

        // 테스트 쿼리 실행
        const result = await client.query('SELECT NOW() AS current_time');
        console.log('Current time from database:', result.rows[0].current_time);

        // 연결 반환
        client.release();
    } catch (err) {
        console.error('Database test failed:', err);
    } finally {
        // 연결 풀 닫기 (테스트 후 필요 시)
        // pool.end();
    }
}

// 테스트 실행
testDatabase();

