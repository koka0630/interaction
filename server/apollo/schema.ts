import { makeExecutableSchema } from 'apollo-server-micro';
import { merge } from 'lodash';
// import { typeDefs as Step1, resolvers as step1Resolvers } from './modules/step1';
export const schema = makeExecutableSchema({
    typeDefs: [
        // Step1,
    ],
    // resolvers: merge(
    //     step1Resolvers,
    // ),
  });
  