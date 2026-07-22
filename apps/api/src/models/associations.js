export function defineAssociations({
  User,
  Topic,
  Question,
  Note,
  Tag,
  TopicTag,
  QuestionTag,
  NoteTag,
}) {
  User.hasMany(Topic, {
    as: 'topics',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });

  Topic.belongsTo(User, {
    as: 'owner',
    foreignKey: 'userId',
  });

  Topic.hasMany(Question, {
    as: 'questions',
    foreignKey: 'topicId',
    onDelete: 'CASCADE',
  });

  Question.belongsTo(Topic, {
    as: 'topic',
    foreignKey: 'topicId',
  });

  User.hasMany(Question, {
    as: 'questions',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });

  Question.belongsTo(User, {
    as: 'owner',
    foreignKey: 'userId',
  });

  User.hasMany(Note, {
    as: 'notes',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });

  Note.belongsTo(User, {
    as: 'author',
    foreignKey: 'userId',
  });

  Topic.hasMany(Note, {
    as: 'topicNotes',
    foreignKey: 'topicId',
    onDelete: 'CASCADE',
  });

  Question.hasMany(Note, {
    as: 'questionNotes',
    foreignKey: 'questionId',
    onDelete: 'CASCADE',
  });

  Note.belongsTo(Topic, {
    as: 'topic',
    foreignKey: 'topicId',
  });

  Note.belongsTo(Question, {
    as: 'question',
    foreignKey: 'questionId',
  });

  User.hasMany(Tag, {
    as: 'tags',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });

  Tag.belongsTo(User, {
    as: 'owner',
    foreignKey: 'userId',
  });

  Topic.belongsToMany(Tag, {
    as: 'tags',
    through: TopicTag,
    foreignKey: 'topicId',
    otherKey: 'tagId',
  });

  Tag.belongsToMany(Topic, {
    as: 'topics',
    through: TopicTag,
    foreignKey: 'tagId',
    otherKey: 'topicId',
  });

  Question.belongsToMany(Tag, {
    as: 'tags',
    through: QuestionTag,
    foreignKey: 'questionId',
    otherKey: 'tagId',
  });

  Tag.belongsToMany(Question, {
    as: 'questions',
    through: QuestionTag,
    foreignKey: 'tagId',
    otherKey: 'questionId',
  });

  Note.belongsToMany(Tag, {
    as: 'tags',
    through: NoteTag,
    foreignKey: 'noteId',
    otherKey: 'tagId',
  });

  Tag.belongsToMany(Note, {
    as: 'notes',
    through: NoteTag,
    foreignKey: 'tagId',
    otherKey: 'noteId',
  });
}
