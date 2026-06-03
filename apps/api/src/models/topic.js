import { DataTypes, Model } from 'sequelize';

export class Topic extends Model {}

export function initTopic(sequelize) {
  Topic.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
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
      tableName: 'topics',
      underscored: true,
    }
  );

  return Topic;
}
