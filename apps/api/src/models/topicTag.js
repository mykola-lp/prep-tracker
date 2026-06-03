import { Model } from 'sequelize';

export class TopicTag extends Model {}

export function initTopicTag(sequelize) {
  TopicTag.init(
    {},
    {
      sequelize,
      tableName: 'topic_tags',
      timestamps: false,
      underscored: true,
    }
  );

  return TopicTag;
}
