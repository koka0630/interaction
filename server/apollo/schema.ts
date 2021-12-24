import { makeExecutableSchema } from 'apollo-server-micro';
import { merge } from 'lodash';
import { typeDefs as Vdw, resolvers as vdwResolvers } from './modules/vdw';
export const schema = makeExecutableSchema({
    typeDefs: [
        Vdw,
    ],
    resolvers: merge(
        vdwResolvers,
    ),
  });
  