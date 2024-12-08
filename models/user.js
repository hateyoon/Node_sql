

require('dotenv').config(); // .env 파일에서 환경 변수 로드
const { Pool } = require('pg'); // pg 모듈 로드

// 환경 변수 검증
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        console.error(`Missing required environment variable: ${key}`);
        process.exit(1);
    }
});

// PostgreSQL 연결 설정
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// 초기 연결 테스트
pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch((err) => {
        console.error('Error connecting to PostgreSQL:', err);
        process.exit(1); // 연결 실패 시 프로세스 종료
    });

// 테이블 생성
const createTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            reset_token VARCHAR(255), 
            token_expiry BIGINT
        )
    `;
    try {
        await pool.query(query);
        console.log('Users table created or already exists.');
    } catch (err) {
        console.error('Error creating users table:', err);
    }
};

// 이메일로 사용자 조회
const getUserByEmail = async (email) => {
    try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows[0]; // 첫 번째 결과 반환
    } catch (err) {
        console.error('Error fetching user by email:', err);
        return null;
    }
};

// 새로운 사용자 추가
const addUser = async (username, password, email) => {
    const query = `
        INSERT INTO users (username, password, email)
        VALUES ($1, $2, $3)
        RETURNING id
    `;
    try {
        const res = await pool.query(query, [username, password, email]);
        return res.rows[0].id; // 새로 추가된 사용자 ID 반환
    } catch (err) {
        console.error('Error adding user:', err);
        return null;
    }
};

// 비밀번호 재설정 토큰 저장
const storeResetToken = async (email, token, expiry) => {
    const query = `
        UPDATE users
        SET reset_token = $1, token_expiry = $2
        WHERE email = $3
    `;
    try {
        await pool.query(query, [token, expiry, email]);
    } catch (err) {
        console.error('Error storing reset token:', err);
    }
};

// 토큰으로 사용자 조회
const getUserByResetToken = async (token) => {
    const query = `SELECT * FROM users WHERE reset_token = $1`;
    try {
        const res = await pool.query(query, [token]);
        return res.rows[0];
    } catch (err) {
        console.error('Error fetching user by reset token:', err);
        return null;
    }
};

// 비밀번호 업데이트
const updatePassword = async (email, newPassword) => {
    const query = `
        UPDATE users
        SET password = $1, reset_token = NULL, token_expiry = NULL
        WHERE email = $2
    `;
    try {
        await pool.query(query, [newPassword, email]);
    } catch (err) {
        console.error('Error updating password:', err);
    }
};

// 토큰 삭제
const clearResetToken = async (email) => {
    const query = `
        UPDATE users
        SET reset_token = NULL, token_expiry = NULL
        WHERE email = $1
    `;
    try {
        await pool.query(query, [email]);
    } catch (err) {
        console.error('Error clearing reset token:', err);
    }
};

// DB 연결 종료
const closeConnection = async () => {
    try {
        await pool.end();
        console.log('Database connection closed.');
    } catch (err) {
        console.error('Error closing the database:', err);
    }
};

// 모듈 내보내기
module.exports = {
    createTable,
    getUserByEmail,
    addUser,
    storeResetToken,
    getUserByResetToken,
    updatePassword,
    clearResetToken,
    closeConnection,
};
