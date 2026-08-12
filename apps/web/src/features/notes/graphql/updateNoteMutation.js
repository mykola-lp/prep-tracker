import { gql } from '@apollo/client';

export const UPDATE_NOTE_MUTATION = gql`
  mutation UpdateNote($id: ID!, $input: UpdateNoteInput!) {
    updateNote(id: $id, input: $input) {
      id
      topicId
      questionId
      body
    }
  }
`;
