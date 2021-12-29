import React, { FC, Component } from 'react'

import { CSVReader } from 'react-papaparse'

import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

export type Record = {
  a: number
  b: number
  theta: number
  A1?: number
  A2?: number
  E: number
  E_p: number
  E_t: number
  machine_type?: 1 | 2
  status?: 'Done' | 'NotYet' | 'InProgress'
  file_name?: string
}

interface CsvReaderProps {
  setRecords: (Records: Record[]) => void;
}

const CsvReader: FC<CsvReaderProps> = ({setRecords}) => {
  
  // https://www.webdevqa.jp.net/ja/javascript/papa-parse%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%A6csv%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%8B%E3%82%89react%E7%8A%B6%E6%85%8B%E3%81%AB%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E6%8A%BD%E5%87%BA%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95%E3%81%AF%EF%BC%9F/835619745/
  const records: Record[] = []
  return (
    <>
      <CSVReader
        config={{
          header:true,
          complete: (results, file) => {
            const records: Record[]=[]
            for (const result of results.data) {
              const record: Record = {
                a: Number(result.a),
                b: Number(result.b),
                theta: Number(result.theta),
                A1: Number(result?.A1 ?? 0),
                A2: Number(result.A2 ?? 0),
                E: Number(result.E),
                E_t: Number(result.E_t),
                E_p: Number(result.E_p),
                machine_type: result.machine_type,
                status: result.status,
                file_name: result.file_name,
              }
              records.push(record)
            }
            setRecords(records);
            console.log("Parsing complete:", results, file)
          }
        }}
        addRemoveButton
      >
        <span>Drop CSV file here or click to upload.</span>
      </CSVReader>
    </>
  )
}

export default CsvReader