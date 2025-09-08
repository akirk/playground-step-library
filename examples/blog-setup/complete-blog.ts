/**
 * Complete Blog Setup Example
 * Creates a full blog with posts, pages, and users
 */

import { runCLI, RunCLIServer } from '@wp-playground/cli';
import PlaygroundStepLibrary from '../../lib/src/index';

const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
    // Site configuration
    {
      step: 'setSiteName',
      sitename: 'The Playground Blog',
      tagline: 'Adventures in WordPress Development'
    },

    // Create users
    {
      step: 'createUser',
      username: 'editor',
      password: 'editor123',
      email: 'editor@blog.com',
      role: 'editor'
    },
    {
      step: 'createUser',
      username: 'author',
      password: 'author123',
      email: 'author@blog.com',
      role: 'author'
    },

    // Create some blog posts
    {
      step: 'addPost',
      postTitle: 'Welcome to Our Blog',
      postContent: '<p>This is our first post! We\'re excited to share our journey with you.</p><p>This blog was set up using custom WordPress Playground steps.</p>',
      postType: 'post',
      postStatus: 'publish'
    },
    {
      step: 'addPost',
      postTitle: 'Getting Started with WordPress Playground',
      postContent: '<p>WordPress Playground is an amazing tool for testing and development.</p><h3>Why Use Playground?</h3><ul><li>No server setup required</li><li>Instant WordPress installation</li><li>Perfect for testing</li></ul>',
      postType: 'post',
      postStatus: 'publish'
    },
    {
      step: 'addPost',
      postTitle: 'Draft: Upcoming Features',
      postContent: '<p>We have some exciting features coming soon...</p>',
      postType: 'post',
      postStatus: 'draft'
    },

    // Create pages
    {
      step: 'addPage',
      postTitle: 'About',
      postContent: '<h2>About Our Blog</h2><p>We are passionate developers sharing our experiences with WordPress and modern web development.</p>',
      homepage: false
    },
    {
      step: 'addPage',
      postTitle: 'Contact',
      postContent: '<h2>Get in Touch</h2><p>Have questions? We\'d love to hear from you!</p><p>Email: contact@blog.com</p>',
      homepage: false
    }
  ]
};

console.log('📚 Setting up a complete blog...');
console.log(`📝 Creating ${blueprint.steps.filter(s => s.step === 'addPost').length} posts`);
console.log(`📄 Creating ${blueprint.steps.filter(s => s.step === 'addPage').length} pages`);
console.log(`👥 Creating ${blueprint.steps.filter(s => s.step === 'createUser').length} users`);

const compiled = compiler.compile(blueprint);
console.log(`\n⚙️  Compiled ${blueprint.steps.length} custom steps to ${compiled.steps.length} native steps`);

// Start WordPress Playground
const cliServer: RunCLIServer = await runCLI({
  command: 'server',
  wp: 'latest',
  login: true,
  blueprint: compiled,
});

console.log('\n🎉 Blog setup complete! Your WordPress blog is ready with sample content.');