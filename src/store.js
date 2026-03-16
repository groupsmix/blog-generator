const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const POSTS_DIR = path.join(DATA_DIR, 'posts');
const RUNS_DIR = path.join(DATA_DIR, 'runs');

function ensureDirs() {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.mkdirSync(RUNS_DIR, { recursive: true });
}

// --- Post helpers ---

function postPath(slug) {
  return path.join(POSTS_DIR, `${slug}.json`);
}

function readPost(slug) {
  const p = postPath(slug);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function writePost(post) {
  ensureDirs();
  fs.writeFileSync(postPath(post.slug), JSON.stringify(post, null, 2) + '\n', 'utf-8');
}

function listAllPosts() {
  ensureDirs();
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => JSON.parse(fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8')));
}

function listPostsByStatus(status) {
  return listAllPosts().filter(p => p.status === status);
}

// --- Run log helpers ---

function runPath(runId) {
  return path.join(RUNS_DIR, `${runId}.json`);
}

function writeRun(run) {
  ensureDirs();
  fs.writeFileSync(runPath(run.id), JSON.stringify(run, null, 2) + '\n', 'utf-8');
}

function readRun(runId) {
  const p = runPath(runId);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

module.exports = {
  POSTS_DIR,
  RUNS_DIR,
  ensureDirs,
  readPost,
  writePost,
  listAllPosts,
  listPostsByStatus,
  writeRun,
  readRun,
};
