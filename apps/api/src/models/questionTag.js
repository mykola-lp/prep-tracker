import { Model } from 'sequelize';

export class QuestionTag extends Model {}

export function initQuestionTag(sequelize) {
  QuestionTag.init(
    {},
    {
      sequelize,
      tableName: 'question_tags',
      timestamps: false,
      underscored: true,
    }
  );

  return QuestionTag;
}
