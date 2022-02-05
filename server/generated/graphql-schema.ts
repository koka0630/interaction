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

export enum MonomerName {
  Btbt = 'BTBT',
  Anthracene = 'anthracene',
  Naphthalene = 'naphthalene',
  Pentacene = 'pentacene',
  Tetracene = 'tetracene'
}

export type Query = {
  __typename?: 'Query';
  getNthStepCsvByMonomerName: Array<Maybe<Record>>;
};


export type QueryGetNthStepCsvByMonomerNameArgs = {
  monomerName?: Maybe<MonomerName>;
  step?: Maybe<Scalars['Int']>;
};

export type Record = {
  __typename?: 'Record';
  A1?: Maybe<Scalars['Float']>;
  A2?: Maybe<Scalars['Float']>;
  E: Scalars['Float'];
  E_p?: Maybe<Scalars['Float']>;
  E_t?: Maybe<Scalars['Float']>;
  E_t1?: Maybe<Scalars['Float']>;
  E_t2?: Maybe<Scalars['Float']>;
  R3p?: Maybe<Scalars['Float']>;
  R3t?: Maybe<Scalars['Float']>;
  a: Scalars['Float'];
  b: Scalars['Float'];
  file_name?: Maybe<Scalars['String']>;
  machine_type?: Maybe<Scalars['Int']>;
  status?: Maybe<Status>;
  theta: Scalars['Float'];
};

export enum Status {
  Done = 'Done',
  InProgress = 'InProgress',
  NotYet = 'NotYet'
}
