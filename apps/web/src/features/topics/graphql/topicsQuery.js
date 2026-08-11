import { gql } from '@apollo/client';

export const TOPICS_QUERY = gql`
  query Topics {
    topics {
      id
      title
      description
      status
      deadline
    }
  }
`;
