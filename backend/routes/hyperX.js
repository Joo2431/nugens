const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuid } = require('uuid');
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/database');

// ── CLOUDFLARE R2 CLIENT ──
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || 'nugens-hyperx-videos';

// Multer memory storage for small files; for large videos use presigned URLs
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid video format. Allowed: mp4, webm, mov'));
  }
});

// ── COURSES ──────────────────────────────────

// GET /api/hyperx/courses
router.get('/courses', authenticate, async (req, res) => {
  const { category, difficulty, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;
  try {
    let query = `
      SELECT c.*,
        COALESCE(e.progress_pct, 0) as user_progress,
        e.completed as is_completed,
        COUNT(DISTINCT cl.id) as lesson_count
      FROM courses c
      LEFT JOIN course_enrollments e ON e.course_id = c.id AND e.user_id = $1
      LEFT JOIN course_lessons cl ON cl.course_id = c.id
      WHERE c.is_published = TRUE
    `;
    const params = [req.user.userId];
    let i = 2;
    if (category) { query += ` AND c.category = $${i++}`; params.push(category); }
    if (difficulty) { query += ` AND c.difficulty = $${i++}`; params.push(difficulty); }
    query += ` GROUP BY c.id, e.progress_pct, e.completed ORDER BY c.created_at DESC LIMIT $${i++} OFFSET $${i}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ success: true, courses: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load courses' });
  }
});

// GET /api/hyperx/courses/:id
router.get('/courses/:id', authenticate, async (req, res) => {
  try {
    const [course, lessons, enrollment] = await Promise.all([
      pool.query('SELECT * FROM courses WHERE id = $1 AND is_published = TRUE', [req.params.id]),
      pool.query('SELECT cl.*, lp.completed as is_watched, lp.watched_sec FROM course_lessons cl LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.user_id = $1 WHERE cl.course_id = $2 ORDER BY cl.sort_order', [req.user.userId, req.params.id]),
      pool.query('SELECT * FROM course_enrollments WHERE user_id = $1 AND course_id = $2', [req.user.userId, req.params.id])
    ]);
    if (!course.rows.length) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course: course.rows[0], lessons: lessons.rows, enrollment: enrollment.rows[0] || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load course' });
  }
});

// POST /api/hyperx/courses/:id/enroll
router.post('/courses/:id/enroll', authenticate, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO course_enrollments (user_id, course_id) VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [req.user.userId, req.params.id]
    );
    await pool.query(
      `INSERT INTO interactions (user_id, product_id, interaction_type, metadata)
       VALUES ($1, 'hyperx', 'course_enroll', $2)`,
      [req.user.userId, JSON.stringify({ course_id: req.params.id })]
    );
    res.json({ success: true, message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Enrollment failed' });
  }
});

// ── VIDEO UPLOAD ──────────────────────────────

// POST /api/hyperx/upload/presign  — Get presigned URL for direct R2 upload (admin/instructor)
router.post('/upload/presign', authenticate, async (req, res) => {
  const { filename, content_type, course_id, lesson_title } = req.body;
  if (!filename || !content_type) {
    return res.status(400).json({ success: false, message: 'filename and content_type required' });
  }
  const ext = filename.split('.').pop();
  const key = `videos/${course_id || 'uncategorized'}/${uuid()}.${ext}`;

  try {
    const cmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: content_type,
      Metadata: { lesson_title: lesson_title || '', uploaded_by: req.user.userId }
    });
    const url = await getSignedUrl(r2, cmd, { expiresIn: 3600 }); // 1-hour window
    res.json({ success: true, upload_url: url, key, expires_in: 3600 });
  } catch (err) {
    console.error('R2 presign error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate upload URL' });
  }
});

// POST /api/hyperx/upload/confirm — After upload, register in DB
router.post('/upload/confirm', authenticate, async (req, res) => {
  const { course_id, key, title, duration_sec, sort_order = 0 } = req.body;
  const video_url = `https://${process.env.CF_R2_PUBLIC_DOMAIN}/${key}`;
  try {
    const result = await pool.query(
      `INSERT INTO course_lessons (course_id, title, video_url, duration_sec, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [course_id, title, video_url, duration_sec, sort_order]
    );
    // Update course video count
    await pool.query(
      `UPDATE courses SET video_count = (SELECT COUNT(*) FROM course_lessons WHERE course_id = $1) WHERE id = $1`,
      [course_id]
    );
    res.json({ success: true, lesson: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save lesson' });
  }
});

// GET /api/hyperx/lessons/:id/stream — Get signed streaming URL
router.get('/lessons/:id/stream', authenticate, async (req, res) => {
  try {
    const lesson = await pool.query(
      'SELECT cl.*, ce.user_id FROM course_lessons cl JOIN course_enrollments ce ON ce.course_id = cl.course_id WHERE cl.id = $1 AND ce.user_id = $2',
      [req.params.id, req.user.userId]
    );
    if (!lesson.rows.length) return res.status(403).json({ success: false, message: 'Not enrolled' });

    const key = lesson.rows[0].video_url.replace(`https://${process.env.CF_R2_PUBLIC_DOMAIN}/`, '');
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const streamUrl = await getSignedUrl(r2, cmd, { expiresIn: 7200 });
    res.json({ success: true, stream_url: streamUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get stream URL' });
  }
});

// PATCH /api/hyperx/lessons/:id/progress
router.patch('/lessons/:id/progress', authenticate, async (req, res) => {
  const { watched_sec, completed } = req.body;
  try {
    await pool.query(
      `INSERT INTO lesson_progress (user_id, lesson_id, watched_sec, completed)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET watched_sec = $3, completed = $4`,
      [req.user.userId, req.params.id, watched_sec, completed]
    );
    // Update enrollment progress
    if (completed) {
      await pool.query(
        `UPDATE course_enrollments SET progress_pct = (
           SELECT ROUND(100.0 * COUNT(lp.id) FILTER (WHERE lp.completed) / NULLIF(COUNT(cl.id), 0))
           FROM course_lessons cl
           LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.user_id = $1
           WHERE cl.course_id = (SELECT course_id FROM course_lessons WHERE id = $2)
         )
         WHERE user_id = $1 AND course_id = (SELECT course_id FROM course_lessons WHERE id = $2)`,
        [req.user.userId, req.params.id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update progress' });
  }
});

module.exports = router;
