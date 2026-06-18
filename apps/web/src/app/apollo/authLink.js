import { SetContextLink } from '@apollo/client/link/context';

export const authLink = new SetContextLink((prevContext, operation) => {
  const token = localStorage.getItem('token');

  return {
    headers: {
      ...operation.headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});
