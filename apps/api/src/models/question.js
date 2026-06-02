import { DataTypes, Model } from 'sequelize';

export class Question extends Model {}

export function initQuestion(sequelize) {
  Question.init(
    {
      topicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      prompt: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'new',
      },
      deadline: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'questions',
      underscored: true,
    }
  );

  return Question;
}
