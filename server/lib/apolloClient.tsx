import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { RetryLink } from '@apollo/client/link/retry';

const httpLink = createHttpLink({
  uri: '/api/v1/graphql',
});

const retryLink = new RetryLink({
  delay: {
    initial: 100,
    max: 2000,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf: (error) => {
      return !!error;
    },
  },
});

const authLink = setContext(async (_, { headers }) => {
  return { headers: headers };
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, retryLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;

export async function setToken(token: string) {
  if (localStorage.getItem('token') !== token) {
    localStorage.setItem('token', token);
  }
}
