const crypto = require('crypto');
const { readPost, writePost, listPostsByStatus, writeRun } = require('./store');
const {
  validateCanSchedule,
  validateCanPublishNow,
  validateCanUnschedule,
} = require('./validation');

/**
 * Schedule a post by slug for a future datetime.
 */
function schedulePost(slug, scheduledFor) {
  const result = validateCanSchedule(slug, scheduledFor);
  if (!result.valid) return { success: false, error: result.error };

  const post = result.post;
  post.status = 'scheduled';
  post.scheduledFor = new Date(scheduledFor).toISOString();
  writePost(post);

  return { success: true, post };
}

/**
 * Unschedule a post — revert it to draft.
 */
function unschedulePost(slug) {
  const result = validateCanUnschedule(slug);
  if (!result.valid) return { success: false, error: result.error };

  const post = result.post;
  post.status = 'draft';
  post.scheduledFor = null;
  writePost(post);

  return { success: true, post };
}

/**
 * Publish a post immediately (from draft or scheduled).
 */
function publishNow(slug) {
  const result = validateCanPublishNow(slug);
  if (!result.valid) return { success: false, error: result.error };

  const post = result.post;
  post.status = 'published';
  post.scheduledFor = null;
  post.publishedAt = new Date().toISOString();
  writePost(post);

  return { success: true, post };
}

/**
 * Run scheduled publishing — find all scheduled posts whose scheduledFor <= now,
 * publish them, and create a run log.
 */
function runScheduled() {
  const runId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const now = new Date();
  const affectedSlugs = [];
  const errors = [];

  const scheduledPosts = listPostsByStatus('scheduled');

  for (const post of scheduledPosts) {
    try {
      const scheduledDate = new Date(post.scheduledFor);
      if (scheduledDate <= now) {
        post.status = 'published';
        post.scheduledFor = null;
        post.publishedAt = now.toISOString();
        writePost(post);
        affectedSlugs.push(post.slug);
      }
    } catch (err) {
      errors.push({ slug: post.slug, message: err.message });
    }
  }

  const finishedAt = new Date().toISOString();
  const run = {
    id: runId,
    type: 'scheduled-publish',
    startedAt,
    finishedAt,
    affectedSlugs,
    status: errors.length > 0 ? 'completed-with-errors' : 'success',
    errors,
  };

  writeRun(run);

  return run;
}

module.exports = {
  schedulePost,
  unschedulePost,
  publishNow,
  runScheduled,
};
