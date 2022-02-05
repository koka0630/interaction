import { makeExecutableSchema } from 'apollo-server-micro';
import { merge } from 'lodash';
import { typeDefs as Csv, resolvers as csvResolvers } from './modules/csv';
export const schema = makeExecutableSchema({
    typeDefs: [
        Csv,
    ],
    resolvers: merge(
        csvResolvers,
    ),
  });
  