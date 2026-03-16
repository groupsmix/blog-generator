#!/usr/bin/env node

const { schedulePost, unschedulePost, publishNow, runScheduled } = require('../src/scheduler');
const { listPostsByStatus, listAllPosts } = require('../src/store');

const [,, command, ...args] = process.argv;

function usage() {
  console.log(`
Usage: blog-cli <command> [options]

Commands:
  schedule <slug> <isoDatetime>   Schedule a post for future publishing
  unschedule <slug>               Revert a scheduled post to draft
  publish-now <slug>              Publish a post immediately
  list <status>                   List posts by status (draft|scheduled|published)
  list-upcoming                   List upcoming scheduled posts sorted by date
  run-scheduled                   Run scheduled publishing now
  help                            Show this help message
`);
}

function printPost(post) {
  console.log(`  ${post.slug} | status: ${post.status} | scheduledFor: ${post.scheduledFor || '-'} | publishedAt: ${post.publishedAt || '-'}`);
}

switch (command) {
  case 'schedule': {
    const [slug, datetime] = args;
    if (!slug || !datetime) {
      console.error('Usage: blog-cli schedule <slug> <isoDatetime>');
      process.exit(1);
    }
    const result = schedulePost(slug, datetime);
    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
    console.log(`Scheduled "${slug}" for ${result.post.scheduledFor}`);
    break;
  }

  case 'unschedule': {
    const [slug] = args;
    if (!slug) {
      console.error('Usage: blog-cli unschedule <slug>');
      process.exit(1);
    }
    const result = unschedulePost(slug);
    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
    console.log(`Unscheduled "${slug}" — reverted to draft.`);
    break;
  }

  case 'publish-now': {
    const [slug] = args;
    if (!slug) {
      console.error('Usage: blog-cli publish-now <slug>');
      process.exit(1);
    }
    const result = publishNow(slug);
    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
    console.log(`Published "${slug}" at ${result.post.publishedAt}`);
    break;
  }

  case 'list': {
    const [status] = args;
    if (!status || !['draft', 'scheduled', 'published'].includes(status)) {
      console.error('Usage: blog-cli list <draft|scheduled|published>');
      process.exit(1);
    }
    const posts = listPostsByStatus(status);
    if (posts.length === 0) {
      console.log(`No ${status} posts found.`);
    } else {
      console.log(`${status} posts (${posts.length}):`);
      posts.forEach(printPost);
    }
    break;
  }

  case 'list-upcoming': {
    const posts = listPostsByStatus('scheduled')
      .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
    if (posts.length === 0) {
      console.log('No upcoming scheduled posts.');
    } else {
      console.log(`Upcoming scheduled posts (${posts.length}):`);
      posts.forEach(printPost);
    }
    break;
  }

  case 'run-scheduled': {
    const run = runScheduled();
    console.log(`Run ${run.id}`);
    console.log(`  Status: ${run.status}`);
    console.log(`  Started: ${run.startedAt}`);
    console.log(`  Finished: ${run.finishedAt}`);
    console.log(`  Published: ${run.affectedSlugs.length} post(s)`);
    if (run.affectedSlugs.length > 0) {
      run.affectedSlugs.forEach(s => console.log(`    - ${s}`));
    }
    if (run.errors.length > 0) {
      console.log(`  Errors:`);
      run.errors.forEach(e => console.log(`    - ${e.slug}: ${e.message}`));
    }
    break;
  }

  case 'help':
  default:
    usage();
    break;
}
