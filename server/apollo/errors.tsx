import { ApolloError } from 'apollo-server-errors';

export class UndefinedError extends ApolloError {
  constructor(message: string) {
    super(message, 'UNDEFINED');

    Object.defineProperty(this, 'name', { value: 'UndefinedError' });
  }
}
