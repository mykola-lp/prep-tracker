import { DataTypes, Model } from 'sequelize';

export class User extends Model {}

export function initUser(sequelize) {
  User.init(
    {
      email: {
        type: DataTypes.STRING(320),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      displayName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'users',
      underscored: true,
      timestamps: true,
    }
  );

  return User;
}
