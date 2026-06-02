import { Sequelize } from 'sequelize';
import { describe, expect, test } from 'vitest';

import { createSequelize } from '../utils/db.js';
import { initModels } from '../models/index.js';

describe('database foundation', () => {
  test('returns null when no database url is configured', () => {
    expect(createSequelize()).toBeNull();
  });

  test('defines the core models and relationships', async () => {
    const sequelize = new Sequelize('postgres://user:password@localhost:5432/prep_tracker', {
      dialect: 'postgres',
      logging: false,
    });

    try {
      const models = initModels(sequelize);

      expect(models.User.tableName).toBe('users');
      expect(models.Topic.tableName).toBe('topics');
      expect(models.Question.tableName).toBe('questions');
      expect(models.Note.tableName).toBe('notes');
      expect(models.Tag.tableName).toBe('tags');
      expect(models.Topic.associations.tags).toBeDefined();
      expect(models.Question.associations.tags).toBeDefined();
      expect(models.Note.associations.tags).toBeDefined();
      expect(models.Topic.associations.questions).toBeDefined();
      expect(models.Note.associations.question).toBeDefined();
    } finally {
      await sequelize.close();
    }
  });
});
