import { initNote, Note } from './note.js';
import { initNoteTag, NoteTag } from './noteTag.js';
import { initQuestion, Question } from './question.js';
import { initQuestionTag, QuestionTag } from './questionTag.js';
import { initTag, Tag } from './tag.js';
import { initTopic, Topic } from './topic.js';
import { initTopicTag, TopicTag } from './topicTag.js';
import { initUser, User } from './user.js';

import { defineAssociations } from './associations.js';

export function initModels(sequelize) {
  const models = {
    User: initUser(sequelize),
    Topic: initTopic(sequelize),
    Question: initQuestion(sequelize),
    Note: initNote(sequelize),
    Tag: initTag(sequelize),
    TopicTag: initTopicTag(sequelize),
    QuestionTag: initQuestionTag(sequelize),
    NoteTag: initNoteTag(sequelize),
  };

  defineAssociations(models);

  return models;
}

// sync models with database (auto-create/update tables) - done by migrations

export { Note, NoteTag, Question, QuestionTag, Tag, Topic, TopicTag, User };
