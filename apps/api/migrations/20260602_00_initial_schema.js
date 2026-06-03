import { DataTypes, Sequelize } from 'sequelize';

function timestampColumns() {
  return {
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  };
}

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'users',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        email: {
          allowNull: false,
          type: DataTypes.STRING(320),
          unique: true,
        },
        password_hash: {
          allowNull: false,
          type: DataTypes.STRING(255),
        },
        display_name: {
          allowNull: true,
          type: DataTypes.STRING(255),
        },
        ...timestampColumns(),
      },
      { transaction }
    );

    await queryInterface.createTable(
      'topics',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        user_id: {
          allowNull: false,
          type: DataTypes.INTEGER,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        title: {
          allowNull: false,
          type: DataTypes.STRING(255),
        },
        description: {
          allowNull: true,
          type: DataTypes.TEXT,
        },
        status: {
          allowNull: false,
          defaultValue: 'new',
          type: DataTypes.STRING(32),
        },
        deadline: {
          allowNull: true,
          type: DataTypes.DATEONLY,
        },
        ...timestampColumns(),
      },
      { transaction }
    );

    await queryInterface.createTable(
      'questions',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        topic_id: {
          allowNull: false,
          type: DataTypes.INTEGER,
          references: {
            model: 'topics',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        prompt: {
          allowNull: false,
          type: DataTypes.TEXT,
        },
        answer: {
          allowNull: true,
          type: DataTypes.TEXT,
        },
        status: {
          allowNull: false,
          defaultValue: 'new',
          type: DataTypes.STRING(32),
        },
        deadline: {
          allowNull: true,
          type: DataTypes.DATEONLY,
        },
        ...timestampColumns(),
      },
      { transaction }
    );

    await queryInterface.createTable(
      'notes',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        user_id: {
          allowNull: false,
          type: DataTypes.INTEGER,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        topic_id: {
          allowNull: true,
          type: DataTypes.INTEGER,
          references: {
            model: 'topics',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        question_id: {
          allowNull: true,
          type: DataTypes.INTEGER,
          references: {
            model: 'questions',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        body: {
          allowNull: false,
          type: DataTypes.TEXT,
        },
        ...timestampColumns(),
      },
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
        ALTER TABLE notes
        ADD CONSTRAINT notes_parent_check
        CHECK (
          (topic_id IS NOT NULL AND question_id IS NULL)
          OR (topic_id IS NULL AND question_id IS NOT NULL)
        )
      `,
      { transaction }
    );

    await queryInterface.createTable(
      'tags',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        user_id: {
          allowNull: false,
          type: DataTypes.INTEGER,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        name: {
          allowNull: false,
          type: DataTypes.STRING(120),
        },
        ...timestampColumns(),
      },
      { transaction }
    );

    await queryInterface.addConstraint('tags', {
      fields: ['user_id', 'name'],
      type: 'unique',
      name: 'tags_user_id_name_unique',
      transaction,
    });

    await queryInterface.createTable(
      'topic_tags',
      {
        topic_id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.INTEGER,
          references: {
            model: 'topics',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        tag_id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.INTEGER,
          references: {
            model: 'tags',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
      { transaction }
    );

    await queryInterface.createTable(
      'question_tags',
      {
        question_id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.INTEGER,
          references: {
            model: 'questions',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        tag_id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.INTEGER,
          references: {
            model: 'tags',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
      { transaction }
    );

    await queryInterface.createTable(
      'note_tags',
      {
        note_id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.INTEGER,
          references: {
            model: 'notes',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        tag_id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.INTEGER,
          references: {
            model: 'tags',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
      { transaction }
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('note_tags', { transaction });
    await queryInterface.dropTable('question_tags', { transaction });
    await queryInterface.dropTable('topic_tags', { transaction });
    await queryInterface.dropTable('tags', { transaction });
    await queryInterface.dropTable('notes', { transaction });
    await queryInterface.dropTable('questions', { transaction });
    await queryInterface.dropTable('topics', { transaction });
    await queryInterface.dropTable('users', { transaction });
  });
}
