const { Client } = require('pg');
require('dotenv').config(); // .env 파일에서 환경 변수 로드

// 데이터베이스 연결 설정
const client = new Client({
    user: process.env.DB_USER,       // .env 파일에서 로드
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// 연결하기
client.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Connection error', err.stack));

// 사용자 조회
const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    try {
        const res = await client.query(query, [email]);
        return res.rows[0]; // 첫 번째 사용자 반환
    } catch (err) {
        console.error('Error fetching user by email:', err);
        throw err; // 오류를 호출한 쪽으로 전달
    }
};

// 사용자 추가
const addUser = async (username, password, email) => {
    const query = 'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)';
    try {
        await client.query(query, [username, password, email]);
        console.log('User added successfully');
    } catch (err) {
        console.error('Error adding user:', err);
        throw err; // 오류를 호출한 쪽으로 전달
    }
};

module.exports = {
    getUserByEmail,
    addUser,
    client, // 데이터베이스 연결 객체를 다른 파일에서 사용할 수 있게 내보냄
};
