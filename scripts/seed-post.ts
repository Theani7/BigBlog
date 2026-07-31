import { User, Story } from '../src/db/schema';
import { createDatabase } from '../src/db';

import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is not set in the environment');
  process.exit(1);
}

async function seed() {
  console.log('Connecting to database...');
  await createDatabase({ MONGO_URI });

  console.log('Fetching a user...');
  const user = await User.findOne({});

  if (!user) {
    console.error('No users found in the database. Please sign up first.');
    process.exit(1);
  }

  const title = 'The Art of Writing Clean Code in 2026';
  const slug = 'the-art-of-writing-clean-code-in-2026';

  const content = `
    <h1>Why Clean Code Still Matters</h1>
    <p>In an era where AI can generate boilerplate in seconds, the definition of a "developer" has shifted. We are no longer just typists translating requirements into syntax. We are <strong>architects and editors</strong>.</p>
    <p>Writing clean code is no longer about impressing your colleagues with clever one-liners. It is about creating sustainable, readable systems that can be maintained by both humans and LLMs.</p>
    <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Coding on a laptop" />
    <h2>1. Readability is the New Scalability</h2>
    <p>If your code cannot be read quickly, it cannot be maintained safely. When we talk about <em>clean code</em>, we mean code that communicates its intent without requiring the reader to hold massive amounts of context in their short-term memory.</p>
    <blockquote>"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler</blockquote>
    <h3>Examples of intent-driven naming:</h3>
    <ul>
      <li><span style="color: red;">Bad:</span> <code>let d; // elapsed time in days</code></li>
      <li><span style="color: green;">Good:</span> <code>let elapsedTimeInDays;</code></li>
    </ul>
    <h2>2. Functions Should Do One Thing</h2>
    <p>A function should do one thing. It should do it well. It should do it only. If a function is doing more than one thing, it becomes difficult to test, difficult to name, and difficult to reason about.</p>
    <p>Consider extracting logic into smaller, composable units. This not only makes your codebase more resilient but drastically improves your test coverage potential.</p>
    <p><strong>Conclusion:</strong> Keep your code clean, keep your architecture simple, and always design for the reader.</p>
  `;

  // Delete if exists
  await Story.deleteOne({ slug });

  console.log('Creating story...');
  const story = new Story({
    title,
    content,
    slug,
    authorId: user._id,
    status: 'PUBLISHED',
    views: 4200,
    reads: 3150,
    publishedAt: new Date(),
  });

  await story.save();
  console.log('Success! Story created with slug:', slug);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
