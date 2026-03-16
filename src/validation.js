const { readPost } = require('./store');

/**
 * Validate that a slug exists.
 * Returns { valid: true, post } or { valid: false, error }.
 */
function validateSlugExists(slug) {
  const post = readPost(slug);
  if (!post) {
    return { valid: false, error: `Post with slug "${slug}" does not exist.` };
  }
  return { valid: true, post };
}

/**
 * Validate that a post can be scheduled.
 */
function validateCanSchedule(slug, scheduledFor) {
  const result = validateSlugExists(slug);
  if (!result.valid) return result;

  const post = result.post;
  if (post.status === 'published') {
    return { valid: false, error: `Post "${slug}" is already published and cannot be scheduled.` };
  }

  if (!scheduledFor) {
    return { valid: false, error: 'scheduledFor is required.' };
  }

  const date = new Date(scheduledFor);
  if (isNaN(date.getTime())) {
    return { valid: false, error: `"${scheduledFor}" is not a valid ISO datetime.` };
  }

  if (date <= new Date()) {
    return { valid: false, error: `scheduledFor must be a future datetime. Got: ${scheduledFor}` };
  }

  return { valid: true, post };
}

/**
 * Validate that a post can be published immediately.
 */
function validateCanPublishNow(slug) {
  const result = validateSlugExists(slug);
  if (!result.valid) return result;

  const post = result.post;
  if (post.status === 'published') {
    return { valid: false, error: `Post "${slug}" is already published.` };
  }

  return { valid: true, post };
}

/**
 * Validate that a post can be unscheduled.
 */
function validateCanUnschedule(slug) {
  const result = validateSlugExists(slug);
  if (!result.valid) return result;

  const post = result.post;
  if (post.status !== 'scheduled') {
    return { valid: false, error: `Post "${slug}" is not scheduled (status: ${post.status}).` };
  }

  return { valid: true, post };
}

module.exports = {
  validateSlugExists,
  validateCanSchedule,
  validateCanPublishNow,
  validateCanUnschedule,
};
