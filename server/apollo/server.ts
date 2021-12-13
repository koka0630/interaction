import { ApolloServer, Config } from 'apollo-server-micro';
import { schema } from './schema';

export interface CreateServerConfig {
  context: Config['context'];
}

export function createServer(config?: CreateServerConfig): ApolloServer {
  const server = new ApolloServer({
    schema,
  });

  return server;
}
