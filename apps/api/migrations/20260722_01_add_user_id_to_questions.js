import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.addColumn(
      'questions',
      'user_id',
      {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
        UPDATE questions AS q
        SET user_id = t.user_id
        FROM topics AS t
        WHERE q.topic_id = t.id
      `,
      { transaction }
    );

    await queryInterface.changeColumn(
      'questions',
      'user_id',
      {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      { transaction }
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.removeColumn('questions', 'user_id', { transaction });
  });
}
