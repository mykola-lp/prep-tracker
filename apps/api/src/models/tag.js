import { DataTypes, Model } from 'sequelize';

export class Tag extends Model {}

export function initTag(sequelize) {
  Tag.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'tags',
      underscored: true,
    }
  );

  return Tag;
}
