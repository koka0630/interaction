import { NextApiResponse, NextApiRequest } from 'next';
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  NormalizedCacheObject,
  ApolloLink,
} from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { host2url } from '../lib/validation/host';
import { createServer } from '../apollo/server';
import { ApolloServer } from 'apollo-server-micro';

export type NextApiRequestWithApollo = NextApiRequest & {
  apollo?: Client; // Depricate: apolloServerに統一する
  apolloSerevr?: ApolloServer;
};

export type NextApiHandlerWithApollo = (
  req: NextApiRequestWithApollo,
  res: NextApiResponse
) => Promise<void>;

type Client = {
  client: ApolloClient<NormalizedCacheObject>;
};

const server = createServer();

// requestに apollo clientを追加する
export const withApolloClient = (handler: NextApiHandlerWithApollo) => {
  return async (req: NextApiRequestWithApollo, res: NextApiResponse) => {
    const { host = '' } = req.headers;
    const hostUrl = host2url({ host });

    const httpLink = createHttpLink({
      uri: `${hostUrl}/api/v1/graphql`,
    });

    // https://babel-jp.atlassian.net/browse/AILEADBUG-13 のエラーハンドリングとしてのretry
    const retryLink = new RetryLink({
      delay: {
        initial: 100,
        max: 1000,
        jitter: true,
      },
      attempts: {
        max: 5,
        retryIf: (error) => {
          return !!error && error.statusCode >= 500 && error.statusCode <= 599;
        },
      },
    });

    const client = new ApolloClient({
      link: ApolloLink.from([retryLink, httpLink]),
      cache: new InMemoryCache(),
    });

    req.apollo = {
      client,
    };

    req.apolloSerevr = server;

    return handler(req, res);
  };
};
