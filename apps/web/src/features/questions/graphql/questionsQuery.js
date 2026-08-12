import { gql } from '@apollo/client';

export const QUESTIONS_QUERY = gql`
  query Questions {
    questions {
      id
      topicId
      prompt
      answer
      status
      deadline
      notes {
        id
      }
    }
  }
`;
