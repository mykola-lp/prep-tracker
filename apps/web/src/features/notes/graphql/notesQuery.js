import { gql } from '@apollo/client';

export const NOTES_QUERY = gql`
  query Notes {
    notes {
      id
      topicId
      questionId
      body
    }
  }
`;
