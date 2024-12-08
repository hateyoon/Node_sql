require('dotenv').config(); // .env 파일에서 환경 변수 로드
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const authRoutes = require('./routes/auth');
const dotenv = require('dotenv')
const mongoose require('mongoose')
const session = require('express');






// 환경 변수 확인 (디버그용, 운영환경에서는 제거)
console.log(process.env);

// EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', './views'); // views 폴더에 템플릿 파일 저장

// Middleware 설정
app.use(express.json());  // JSON 본문을 자동으로 파싱
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET || 'your_secret_key', resave: false, saveUninitialized: true }));

// 라우트 설정
app.use('/auth', authRoutes);

// 루트 경로
app.get('/', (req, res) => {
    res.send('Welcome to the homepage!');
});

// 회원가입 페이지 (EJS 사용)
app.get('/signup', (req, res) => {
    res.render('signup'); // views/signup.ejs 파일을 렌더링
});

// 로그인 페이지 (EJS 사용)
app.get('/login', (req, res) => {
    res.render('login'); // views/login.ejs 파일을 렌더링
});

// 프로필 페이지 (EJS 사용)
app.get('/profile', (req, res) => {
    res.render('profile'); // views/profile.ejs 파일을 렌더링
});

// 서버 실행
const PORT = process.env.PORT || 3000; // .env 파일에서 포트 설정 가능
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// PostgreSQL 연결 설정
const { pool } = require('pg');
const pool = new Pool ({
    user: process.env.DB_User,








})