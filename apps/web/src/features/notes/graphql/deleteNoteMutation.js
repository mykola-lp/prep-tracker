import { gql } from '@apollo/client';

export const DELETE_NOTE_MUTATION = gql`
  mutation DeleteNote($id: ID!) {
    deleteNote(id: $id)
  }
`;
