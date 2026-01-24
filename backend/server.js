const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
require('dotenv').config();

const { pool, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 환경변수 디버깅
console.log('===== Environment Variables =====');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NODE_ENV === "production":', process.env.NODE_ENV === 'production');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('PORT:', PORT);
console.log('Cookie domain will be:', process.env.NODE_ENV === 'production' ? '.cbsk.kr' : 'undefined');
console.log('Cookie sameSite will be:', process.env.NODE_ENV === 'production' ? 'none' : 'lax');
console.log('=================================');

// 미들웨어
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.cbsk.kr' : undefined,
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

// 인증 미들웨어
const requireAuth = (req, res, next) => {
  console.log('[REQUIRE-AUTH]', {
    sessionID: req.sessionID,
    isAdmin: req.session?.isAdmin,
    hasSession: !!req.session
  });

  if (req.session && req.session.isAdmin) {
    next();
  } else {
    console.log('[REQUIRE-AUTH] Unauthorized - session missing or not admin');
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// ===== API 엔드포인트 =====

// 로그인
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  console.log('[LOGIN] Attempt:', { username, sessionID: req.sessionID });

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    req.session.save((err) => {
      if (err) {
        console.error('[LOGIN] Session save error:', err);
        return res.status(500).json({ error: 'Session save failed' });
      }
      console.log('[LOGIN] Success! Session saved:', { sessionID: req.sessionID, isAdmin: req.session.isAdmin });
      res.json({ success: true, message: 'Login successful' });
    });
  } else {
    console.log('[LOGIN] Failed: Invalid credentials');
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// 로그아웃
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logout successful' });
});

// 인증 확인
app.get('/api/check-auth', (req, res) => {
  console.log('[CHECK-AUTH]', {
    sessionID: req.sessionID,
    isAdmin: req.session?.isAdmin,
    session: req.session
  });

  if (req.session && req.session.isAdmin) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

// 게시글 목록 조회 (모든 사용자)
app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, date FROM posts ORDER BY date DESC, id DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 게시글 상세 조회 (모든 사용자)
app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, title, content, image_url, date FROM posts WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 게시글 작성 (관리자만)
app.post('/api/posts', requireAuth, async (req, res) => {
  const { title, content, image_url, date } = req.body;

  console.log('[CREATE POST]', {
    sessionID: req.sessionID,
    isAdmin: req.session?.isAdmin,
    title
  });

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO posts (title, content, image_url, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content || null, image_url || null, date || new Date().toISOString().split('T')[0]]
    );
    console.log('[CREATE POST] Success:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[CREATE POST] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 게시글 수정 (관리자만)
app.put('/api/posts/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, content, image_url, date } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE posts SET title = $1, content = $2, image_url = $3, date = $4 WHERE id = $5 RETURNING *',
      [title, content || null, image_url || null, date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 게시글 삭제 (관리자만)
app.delete('/api/posts/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 서버 시작
const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
