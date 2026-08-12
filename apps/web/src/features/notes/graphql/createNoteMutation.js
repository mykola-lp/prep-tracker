import { gql } from '@apollo/client';

export const CREATE_NOTE_MUTATION = gql`
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      topicId
      questionId
      body
    }
  }
`;
