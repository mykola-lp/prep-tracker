import { gql } from '@apollo/client';

export const UPDATE_TOPIC_MUTATION = gql`
  mutation UpdateTopic($id: ID!, $input: UpdateTopicInput!) {
    updateTopic(id: $id, input: $input) {
      id
      title
      description
      status
      deadline
    }
  }
`;
