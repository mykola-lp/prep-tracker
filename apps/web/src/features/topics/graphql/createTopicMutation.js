import { gql } from '@apollo/client';

export const CREATE_TOPIC_MUTATION = gql`
  mutation CreateTopic($input: CreateTopicInput!) {
    createTopic(input: $input) {
      id
      title
      description
      status
      deadline
    }
  }
`;
