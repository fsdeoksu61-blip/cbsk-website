const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// 데이터베이스 테이블 초기화
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        image_url TEXT,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 기존 테이블에 새 컬럼 추가 (이미 있으면 에러 무시)
    try {
      await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS content TEXT;`);
      await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;`);
    } catch (alterError) {
      // 컬럼이 이미 존재하면 무시
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

module.exports = { pool, initDB };
