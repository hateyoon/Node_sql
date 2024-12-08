const { Pool } = require('pg'); // PostgreSQL 모듈 임포트
const pool = new Pool({
    user: 'sqlogin',       // PostgreSQL 사용자 이름
    host: 'localhost',
    database: 'sqlogin_db', // PostgreSQL 데이터베이스 이름
    password: 'mslove10',    // PostgreSQL 비밀번호
    port: 5432,             // PostgreSQL 포트 (기본값 5432)
});

// DB 연결 확인
pool.connect((err, client, done) => {
    if (err) {
        console.error('Error connecting to the PostgreSQL database:', err.stack);
    } else {
        console.log('Connected to the PostgreSQL database.');
        done(); // 연결 종료
    }
});

// 쿼리 실행 예시 (사용자 정보 가져오기)
const getUserByEmail = (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = $1'; // PostgreSQL 쿼리 문법에 맞게 수정
    pool.query(query, [email], (err, res) => {
        if (err) {
            console.error('Error fetching user by email:', err);
            callback(err, null);
        } else {
            callback(null, res.rows[0]); // PostgreSQL 결과는 `res.rows`에 있음
        }
    });
};

// 쿼리 실행 예시 (사용자 등록)
const addUser = (username, password, email, callback) => {
    const query = 'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)';
    pool.query(query, [username, password, email], (err) => {
        if (err) {
            console.error('Error adding user:', err);
            callback(err);
        } else {
            callback(null);
        }
    });
};

module.exports = {
    getUserByEmail,
    addUser
};
