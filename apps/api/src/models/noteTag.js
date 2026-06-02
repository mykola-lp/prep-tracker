import { Model } from 'sequelize';

export class NoteTag extends Model {}

export function initNoteTag(sequelize) {
  NoteTag.init(
    {},
    {
      sequelize,
      tableName: 'note_tags',
      timestamps: false,
      underscored: true,
    }
  );

  return NoteTag;
}
