import { gql } from '@apollo/client';

export const CREATE_QUESTION_MUTATION = gql`
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      id
      topicId
      prompt
      answer
      status
      deadline
    }
  }
`;
