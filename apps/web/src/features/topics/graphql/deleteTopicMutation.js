import { gql } from '@apollo/client';

export const DELETE_TOPIC_MUTATION = gql`
  mutation DeleteTopic($id: ID!) {
    deleteTopic(id: $id)
  }
`;
