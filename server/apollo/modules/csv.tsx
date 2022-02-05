import { gql } from '@apollo/client';
// import csv from 'csv';
// import fs from 'fs';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import { Record } from '../../generated/graphql-schema';
import { Resolvers } from '../../generated/graphql-resolvers';
// const csv = require('csv');
// const fs = require('fs');
// const path = require('path');

export const typeDefs = gql`
  type Query {
    getNthStepCsvByMonomerName(monomerName: MonomerName, step: Int): [Record]!
  }
  enum MonomerName {
    naphthalene
    anthracene
    tetracene
    pentacene
    BTBT
  }
  type Record {
    a: Float!
    b: Float!
    theta: Float!
    A1: Float
    A2: Float
    R3t: Float
    R3p: Float
    E: Float!
    E_p: Float
    E_t: Float
    E_t1: Float
    E_t2: Float
    machine_type: Int
    status: Status
    file_name: String
    }
  enum Status {
    Done
    NotYet
    InProgress
  }

`
export const resolvers: Resolvers = {
    Query: {
        getNthStepCsvByMonomerName: async (_, { monomerName, step}) => {
            if (!monomerName || !step) return [];
            const csvName = step2csvName(step)
            
            const data = fs.readFileSync(`data/${monomerName}/${csvName}.csv`);
            const results = parse(data, {columns: true});
            const records: Record[] = []
            for (const result of results) {
                records.push(result)
            }
            return records;
        },
    }
}
function step2csvName(step: number){
    switch (step){
        case 1:
            return 'step1'
        case 2:
            return 'step2-para'
        case 3:
            return 'step2-para' // step3の計算結果がcsvにまとまってないので。
            // return 'step3'
        default:
            throw new Error('Unsuported Step')

    }
}