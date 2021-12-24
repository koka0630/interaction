export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export enum DimerTypeEnum {
  P = 'p',
  T = 't'
}

export type Query = {
  __typename?: 'Query';
  getDimerVdwOrbit?: Maybe<GetDimerVdwOrbitOutput>;
};


export type QueryGetDimerVdwOrbitArgs = {
  A1?: Maybe<Scalars['Int']>;
  A2?: Maybe<Scalars['Int']>;
  monomerName?: Maybe<Scalars['String']>;
  theta?: Maybe<Scalars['Int']>;
};

export type GetDimerVdwOrbitOutput = {
  __typename?: 'getDimerVdwOrbitOutput';
  distanceCollisionArray?: Maybe<Array<Scalars['Float']>>;
  phiArray?: Maybe<Array<Scalars['Int']>>;
};
