import { gql } from '@apollo/client';

export const UPDATE_QUESTION_MUTATION = gql`
  mutation UpdateQuestion($id: ID!, $input: UpdateQuestionInput!) {
    updateQuestion(id: $id, input: $input) {
      id
      topicId
      prompt
      answer
      status
      deadline
    }
  }
`;
