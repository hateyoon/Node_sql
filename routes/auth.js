const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models/user');
const router = express.Router();
const crypto = require('crypto');
const mailer = require('../services/mailer');
require('dotenv').config(); // 환경변수 사용

// 비밀번호 복잡성 검사 정규식
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// 로그인 처리
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const user = await db.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        res.status(200).json({ message: `Welcome, ${user.username}!`, userId: user.id });
    } catch (err) {
        console.error('Error in login:', err);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// 회원가입 처리
router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: 'All fields (username, password, email) are required.' });
    }
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
        });
    }

    try {
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await db.addUser(username, hashedPassword, email);

        res.status(201).json({ message: 'User registered successfully.', userId });
    } catch (err) {
        console.error('Error in signup:', err);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// 비밀번호 재설정 요청
router.post('/reset-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    try {
        const user = await db.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Email not found.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = Date.now() + 3600000; // 1시간 유효

        await db.storeResetToken(email, resetToken, tokenExpiry);

        const resetLink = `http://localhost:3000/auth/reset-password/${resetToken}`;
        await mailer.sendEmail(email, 'Password Reset Request', `Click the link to reset your password: ${resetLink}`);

        res.status(200).json({ message: 'Reset link sent to your email.' });
    } catch (err) {
        console.error('Error in reset password:', err);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// 비밀번호 재설정 페이지 렌더링
router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const user = await db.getUserByResetToken(token);
        if (!user || user.token_expiry < Date.now()) {
            return res.status(400).send('Invalid or expired token.');
        }

        res.render('new_password', { email: user.email });
    } catch (err) {
        console.error('Error in token verification:', err);
        res.status(500).send('An error occurred.');
    }
});

// 새 비밀번호 저장
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
        });
    }

    try {
        const user = await db.getUserByResetToken(token);
        if (!user || user.token_expiry < Date.now()) {
            return res.status(400).send('Invalid or expired token.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.updatePassword(user.email, hashedPassword);
        await db.clearResetToken(user.email);

        res.status(200).send('Password reset successful.');
    } catch (err) {
        console.error('Error in password reset:', err);
        res.status(500).send('An error occurred.');
    }
});

// 비밀번호 재설정 요청 페이지 렌더링
router.get('/reset-password', (req, res) => {
    res.render('reset_password'); // views/reset_password.ejs 파일을 렌더링
});

module.exports = router;
