import React, { useState, useMemo, useRef } from 'react';
import { Canvas } from "react-three-fiber";
import Slider from '@material-ui/core/Slider';
import { CameraControls } from "./CameraControls";
import Crystal, { CrystalProps } from './Crystal'
import CsvReader, { Record } from "./CsvReader";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import Highcharts from "highcharts/highstock";
import Hc3D from "highcharts/highcharts-3d";
//import HighchartsReact from "./HighchartsReact.js";
import HighchartsReact from "highcharts-react-official";

import { Line, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Chart.js Line Chart',
    },
  },
};

// https://www.google.com/search?q=hc3d(highcharts)+typescript&oq=Hc3D(Highcharts)%3B+typesc&aqs=chrome.2.69i57j33i10i160l2.3266j0j7&sourceid=chrome&ie=UTF-8
export interface ChartStep1Props {
  records: Record[];
  currentTheta: number;
}

function HomePage() {
  // TODO こちらもフロント定義ではなく、バックエンドで出力されるようにする
  const [theta,setTheta]=useState<number>(25)
  const [step,setStep]=useState<number>(0)
  const onChangeStep = (event: object, value: number | number[]) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    setStep(normalizedValue)
  };
  const [records, setRecords] = useState<Record[]>([{a:8.0,b:6.0,theta:25,E:0.0,E_t:0.0,E_p:0.0}])
  
  // これはフロント定義
  const monomerName = 'anthracene'

  // 探索するパラメータと軌跡の定義
  const [parameters, plot1, plot2] = useMemo(() => {
    setTheta(records[step].theta)
    const parameters: CrystalProps[] = [] 
    for (const record of records) {
      const parameter = {
        a: record.a,
        b: record.b,
        theta: record.theta,
        A1: record?.A1 ?? 0,
        A2: record?.A2 ?? 0,
      }
      parameters.push(parameter)
    }
    
    const theta2Emin: { [theta: number]: number } = {}
    for (const record of records){
      if (record.theta in theta2Emin){
        theta2Emin[record.theta]=Math.min(record.E,theta2Emin[record.theta])
      } else {
        theta2Emin[record.theta]=record.E
      }
    }
    
    const data1: number[][] = []
    for (const theta in theta2Emin){
      data1.push([Number(theta), theta2Emin[theta]])
    }

    const plot1 = {
      datasets: [
        {
          label: "相互作用エネルギーのヘリンボーン角依存性",
          data: data1,
          backgroundColor: "rgba(0, 0, 255, 0.5)",
          pointRadius: 8,
        },
        {
          label: "現在の構造",
          data: [[records[step].theta,theta2Emin[records[step].theta]]],
          backgroundColor: "rgba(255, 0, 0, 1)",
          pointRadius: 16,
        },
      ],
    };

    const recordsFilteredByTheta: Record[] = []
    records.forEach( value => {
      if (value.theta===records[step].theta){
        recordsFilteredByTheta.push(value)
      }})
    const plot2 = {
      labels: recordsFilteredByTheta.map((record: Record) => {return record.E}),
      datasets: [
        {
          label: "格子に対するエネルギーマップ",
          data: recordsFilteredByTheta.map((record: Record) => {return [record.a,record.b]}),
          backgroundColor: "rgba(0, 0, 255, 0.5)",
          pointRadius: 8,
        },
        {
          label: "現在の構造",
          data: [[records[step].a,records[step].b]],
          backgroundColor: "rgba(255, 0, 0, 1)",
          pointRadius: 16,
        },
      ],
    };
    
  return [ parameters, plot1, plot2]
  }, [records, step])

  return (
    <div className="overflow-hidden h-full min-height:0">
      <div className="flex flex-row justify-between h-full min-width:0">
        <div className="flex flex-col overflow-y-hidden w-full mx-5 lg:mx-10">
          <Canvas camera={{ fov: 45, position: [0, 0, 30] }}>
            <CameraControls />
            <ambientLight intensity={0.75} />
            <spotLight position={[30, 30, 30]} penumbra={1} angle={0.2} color="white" castShadow shadow-mapSize={[512, 512]} />
            <directionalLight position={[0, 5, -4]} intensity={1} />
            <Crystal a={records[step].a} b={records[step].b} theta={records[step].theta} A1={records[step]?.A1 ?? 0} A2={records[step]?.A2 ?? 0}/>
            {/* <AnimatedCrystal parameters={parameters} monomerName={monomerName} initStep={initStep}/> */}
          </Canvas>
          <Slider 
            value={step}
            aria-label="Default"
            valueLabelDisplay="on"
            step={1}
            // marks={thetaArray.map((theta) => {return {value: theta}})}
            min={0}
            max={records.length}
            onChange={onChangeStep}
            />
        </div>
        <div className="relative flex flex-col overflow-hidden w-full max-w-6xl h-full min-height:0 mr-5 lg:mr-10">
          {/* <Line options={options} data={data} onClick={function() {}}/>
          <Line options={options} data={data} onClick={function() {}}/> */}
          <Scatter data={plot1} />
          <Scatter data={plot2} />
          {/* <ChartStep1 currentTheta={records[step].theta} records={records}/> */}
          <CsvReader setRecords={setRecords}/>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
