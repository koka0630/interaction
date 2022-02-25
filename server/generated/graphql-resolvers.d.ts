import { GraphQLResolveInfo } from 'graphql';
import { Context } from '../apollo/context';
import * as Types from './graphql-schema';
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Types.Maybe<TTypes> | Promise<Types.Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Types.Scalars['Boolean']>;
  Float: ResolverTypeWrapper<Types.Scalars['Float']>;
  Int: ResolverTypeWrapper<Types.Scalars['Int']>;
  MonomerName: Types.MonomerName;
  Query: ResolverTypeWrapper<{}>;
  Record: ResolverTypeWrapper<Types.Record>;
  Status: Types.Status;
  String: ResolverTypeWrapper<Types.Scalars['String']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Types.Scalars['Boolean'];
  Float: Types.Scalars['Float'];
  Int: Types.Scalars['Int'];
  Query: {};
  Record: Types.Record;
  String: Types.Scalars['String'];
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  getNthStepCsvByMonomerName?: Resolver<Array<Types.Maybe<ResolversTypes['Record']>>, ParentType, ContextType, RequireFields<Types.QueryGetNthStepCsvByMonomerNameArgs, 'monomerName' | 'step'>>;
}>;

export type RecordResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Record'] = ResolversParentTypes['Record']> = ResolversObject<{
  A1?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  A2?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  E?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  E_p?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  E_t?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  E_t1?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  E_t2?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  R3p?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  R3t?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  a?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  b?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  file_name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  machine_type?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['Status']>, ParentType, ContextType>;
  theta?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  Query?: QueryResolvers<ContextType>;
  Record?: RecordResolvers<ContextType>;
}>;

