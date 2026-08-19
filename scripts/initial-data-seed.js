import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

import { createSequelize } from '../apps/api/src/utils/db.js';
import { initModels } from '../apps/api/src/models/index.js';

loadEnvironment();

const connectionString = buildDatabaseUrl();

if (!connectionString) {
  throw new Error('Database configuration is missing');
}

if (process.env.SEED_ALLOW_DESTRUCTIVE !== 'true') {
  throw new Error('Destructive seed is disabled. Set SEED_ALLOW_DESTRUCTIVE=true to continue.');
}

const sequelize = createSequelize(connectionString);

if (!sequelize) {
  throw new Error('Failed to initialize database connection');
}

const models = initModels(sequelize);

function loadEnvironment() {
  const envFile = process.env.ENV_FILE;

  if (!envFile) {
    return;
  }

  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

  const envPath = path.isAbsolute(envFile) ? envFile : path.join(projectRoot, envFile);

  if (!fs.existsSync(envPath)) {
    throw new Error(`ENV_FILE not found: ${envFile}`);
  }

  dotenv.config({ path: envPath });
}

function buildDatabaseUrl() {
  const {
    DB_LOCAL_HOST = 'localhost',
    DB_PORT = '5432',
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_SSLMODE,
  } = process.env;

  if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
    return undefined;
  }

  const host = DB_LOCAL_HOST;
  const credentials = `${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}`;
  const database = `/${DB_NAME}`;
  const sslMode = DB_SSLMODE ? `?sslmode=${DB_SSLMODE}` : '';

  return `postgresql://${credentials}@${host}:${DB_PORT}${database}${sslMode}`;
}

const rng = createSeededRandom(41);

const firstNames = ['Marta', 'Ivan', 'Olha', 'Dmytro', 'Sofia', 'Andrii', 'Ira', 'Taras'];

const lastNames = ['Koval', 'Shevchenko', 'Bondar', 'Melnyk', 'Tkachenko', 'Marchenko', 'Petryk'];

const topicPrefixes = [
  'JavaScript',
  'React',
  'Node.js',
  'Databases',
  'System Design',
  'TypeScript',
  'GraphQL',
  'Testing',
  'CSS',
  'Networking',
];

const questionTemplates = [
  'Explain how %s works',
  'What are the main tradeoffs of %s?',
  'When would you use %s?',
  'How would you debug %s?',
  'What are common pitfalls in %s?',
];

const noteTemplates = [
  'Review core concepts and write a short summary.',
  'Focus on examples that can be explained out loud.',
  'Collect one strong answer draft and one backup answer.',
  'Revisit after one day and once more before the deadline.',
  'Add a small practical exercise to reinforce the topic.',
];

const tagPool = [
  'frontend',
  'backend',
  'interview',
  'important',
  'revision',
  'system-design',
  'javascript',
  'react',
  'databases',
  'testing',
];

const statusPool = ['new', 'learning', 'reviewing', 'done'];

const deadlineOffsets = [3, 5, 7, 10, 14, 18, 21, 28, 35, 42];

const usedDisplayNames = new Set();

async function clearDatabase() {
  console.log('Clearing database...');

  await sequelize.query(`
    TRUNCATE TABLE
      note_tags,
      question_tags,
      topic_tags,
      notes,
      questions,
      tags,
      topics,
      users
    RESTART IDENTITY CASCADE;
  `);

  console.log('Database cleared');
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = Array.from({ length: 5 }, (_, index) => ({
    email: `user${index + 1}@prep-tracker.dev`,
    passwordHash,
    displayName: uniqueDisplayName(),
  }));

  const insertedUsers = await models.User.bulkCreate(users, {
    returning: true,
  });

  console.log('= Users seeded');

  return insertedUsers;
}

async function seedTopics(users) {
  const topics = [];

  for (const user of users) {
    const count = randomInt(4, 9);

    for (let index = 0; index < count; index += 1) {
      const prefix = pick(topicPrefixes);
      const status = weightedStatus();
      const deadline = chance(0.75) ? randomDeadline() : null;

      topics.push({
        userId: user.id,
        title: `${prefix} ${index + 1}`,
        description: buildTopicDescription(prefix, user.displayName),
        status,
        deadline,
      });
    }
  }

  const insertedTopics = await models.Topic.bulkCreate(topics, {
    returning: true,
  });

  console.log('= Topics seeded');

  return insertedTopics;
}

async function seedQuestions(users, topics) {
  const questions = [];

  for (const topic of topics) {
    const count = randomInt(2, 4);

    for (let index = 0; index < count; index += 1) {
      const template = pick(questionTemplates);
      const status = weightedStatus();
      const deadline = chance(0.7) ? randomDeadline() : null;

      questions.push({
        userId: topic.userId,
        topicId: topic.id,
        prompt: template.replace('%s', topic.title),
        answer: chance(0.45) ? `Short answer draft for ${topic.title.toLowerCase()}.` : null,
        status,
        deadline,
      });
    }
  }

  const insertedQuestions = await models.Question.bulkCreate(questions, {
    returning: true,
  });

  console.log('= Questions seeded');

  return insertedQuestions;
}

async function seedNotes(users, topics, questions) {
  const notes = [];

  for (const user of users) {
    const userTopics = topics.filter((topic) => topic.userId === user.id);
    const userQuestions = questions.filter((question) => question.userId === user.id);
    const count = randomInt(4, 9);

    for (let index = 0; index < count; index += 1) {
      const attachToQuestion = userQuestions.length > 0 && chance(0.55);

      if (attachToQuestion) {
        const question = pick(userQuestions);

        notes.push({
          userId: user.id,
          questionId: question.id,
          topicId: null,
          body: `${pick(noteTemplates)} ${question.prompt}.`,
        });

        continue;
      }

      const topic = pick(userTopics);

      notes.push({
        userId: user.id,
        topicId: topic.id,
        questionId: null,
        body: `${pick(noteTemplates)} ${topic.title}.`,
      });
    }
  }

  const insertedNotes = await models.Note.bulkCreate(notes, {
    returning: true,
  });

  console.log('= Notes seeded');

  return insertedNotes;
}

async function seedTags(users) {
  const tags = [];

  for (const user of users) {
    const userTagCount = randomInt(3, 5);
    const shuffledTags = shuffle(tagPool);

    for (let index = 0; index < userTagCount; index += 1) {
      tags.push({
        userId: user.id,
        name: `${shuffledTags[index]}-${user.id}`,
      });
    }
  }

  const insertedTags = await models.Tag.bulkCreate(tags, {
    returning: true,
  });

  console.log('= Tags seeded');

  return insertedTags;
}

async function seedTopicTags(topics, tags) {
  const rows = [];

  for (const topic of topics) {
    const topicTags = tags.filter((tag) => tag.userId === topic.userId);
    const selectedTags = sampleMany(topicTags, randomInt(1, 2));

    for (const tag of selectedTags) {
      rows.push({
        topicId: topic.id,
        tagId: tag.id,
      });
    }
  }

  if (rows.length > 0) {
    await models.TopicTag.bulkCreate(rows);
  }

  console.log('= Topic tags seeded');
}

async function seedQuestionTags(questions, tags) {
  const rows = [];

  for (const question of questions) {
    const questionTags = tags.filter((tag) => tag.userId === question.userId);
    const selectedTags = sampleMany(questionTags, randomInt(1, 3));

    for (const tag of selectedTags) {
      rows.push({
        questionId: question.id,
        tagId: tag.id,
      });
    }
  }

  if (rows.length > 0) {
    await models.QuestionTag.bulkCreate(rows);
  }

  console.log('= Question tags seeded');
}

async function seedNoteTags(notes, tags) {
  const rows = [];

  for (const note of notes) {
    const noteTags = tags.filter((tag) => tag.userId === note.userId);
    const selectedTags = sampleMany(noteTags, randomInt(0, 2));

    for (const tag of selectedTags) {
      rows.push({
        noteId: note.id,
        tagId: tag.id,
      });
    }
  }

  if (rows.length > 0) {
    await models.NoteTag.bulkCreate(rows);
  }

  console.log('= Note tags seeded');
}

async function seed() {
  await clearDatabase();

  const users = await seedUsers();
  const topics = await seedTopics(users);
  const questions = await seedQuestions(users, topics);
  const notes = await seedNotes(users, topics, questions);
  const tags = await seedTags(users);

  await seedTopicTags(topics, tags);
  await seedQuestionTags(questions, tags);
  await seedNoteTags(notes, tags);

  await sequelize.close();

  console.log('✅ Seed completed');
}

function uniqueDisplayName() {
  let name;

  do {
    name = `${pick(firstNames)} ${pick(lastNames)}`;
  } while (usedDisplayNames.has(name));

  usedDisplayNames.add(name);

  return name;
}

function createSeededRandom(seed) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function randomInt(min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function chance(probability) {
  return rng() < probability;
}

function pick(items) {
  return items[randomInt(0, items.length - 1)];
}

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function sampleMany(items, count) {
  if (count <= 0) {
    return [];
  }

  return shuffle(items).slice(0, Math.min(count, items.length));
}

function weightedStatus() {
  const roll = rng();

  if (roll < 0.35) return 'new';
  if (roll < 0.65) return 'learning';
  if (roll < 0.9) return 'reviewing';
  return 'done';
}

function randomDeadline() {
  const days = pick(deadlineOffsets);
  const date = new Date();

  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
}

function buildTopicDescription(prefix, displayName) {
  return `${displayName} is revising ${prefix.toLowerCase()} with short sessions and repeated recall.`;
}

seed().catch(async (error) => {
  console.error(error);

  await sequelize.close();
  process.exit(1);
});
