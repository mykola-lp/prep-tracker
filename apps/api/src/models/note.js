import { DataTypes, Model } from 'sequelize';

export class Note extends Model {}

export function initNote(sequelize) {
  Note.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      topicId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      questionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'notes',
      underscored: true,
    }
  );

  return Note;
}
