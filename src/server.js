const express = require('express');
const { schedulePost, unschedulePost, publishNow, runScheduled } = require('./scheduler');
const { listPostsByStatus } = require('./store');

const app = express();
app.use(express.json());

// POST /api/schedule — schedule a post
app.post('/api/schedule', (req, res) => {
  const { slug, scheduledFor } = req.body;
  if (!slug || !scheduledFor) {
    return res.status(400).json({ error: 'slug and scheduledFor are required.' });
  }
  const result = schedulePost(slug, scheduledFor);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({ message: `Scheduled "${slug}" for ${result.post.scheduledFor}`, post: result.post });
});

// POST /api/unschedule — unschedule a post
app.post('/api/unschedule', (req, res) => {
  const { slug } = req.body;
  if (!slug) {
    return res.status(400).json({ error: 'slug is required.' });
  }
  const result = unschedulePost(slug);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({ message: `Unscheduled "${slug}" — reverted to draft.`, post: result.post });
});

// POST /api/publish-now — publish a post immediately
app.post('/api/publish-now', (req, res) => {
  const { slug } = req.body;
  if (!slug) {
    return res.status(400).json({ error: 'slug is required.' });
  }
  const result = publishNow(slug);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({ message: `Published "${slug}" at ${result.post.publishedAt}`, post: result.post });
});

// POST /api/run-scheduled — run scheduled publishing
app.post('/api/run-scheduled', (_req, res) => {
  const run = runScheduled();
  return res.json({ run });
});

// GET /api/scheduled — list all scheduled posts
app.get('/api/scheduled', (_req, res) => {
  const posts = listPostsByStatus('scheduled')
    .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
  return res.json({ count: posts.length, posts });
});

// GET /api/published — list all published posts
app.get('/api/published', (_req, res) => {
  const posts = listPostsByStatus('published')
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return res.json({ count: posts.length, posts });
});

const PORT = process.env.PORT || 3000;

function start() {
  app.listen(PORT, () => {
    console.log(`Blog API server running on http://localhost:${PORT}`);
  });
}

module.exports = { app, start };
