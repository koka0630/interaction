import React, { useState, useMemo, useRef } from 'react';
import { Canvas } from "react-three-fiber";
import Slider, { Mark } from '@material-ui/core/Slider';
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

import { Scatter } from 'react-chartjs-2';

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
  const [axisA,setAxisA]=useState<number>(8.0)
  const [axisB,setAxisB]=useState<number>(6.0)
  const onChangeAxisA = (event: object, value: number | number[]) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    setAxisA(normalizedValue)
  };
  
  const onChangeAxisB = (event: object, value: number | number[]) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    setAxisB(normalizedValue)
  };
  
  const onChangeTheta = (event: object, value: number | number[]) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    setTheta(normalizedValue)
    setAxisA(theta2Emin[normalizedValue].a)
    setAxisB(theta2Emin[normalizedValue].b)
  };
  
  const [records, setRecords] = useState<Record[]>([{a:8.0,b:6.0,theta:25,E:0.0,E_t:0.0,E_p:0.0}])
  
  // これはフロント定義
  const monomerName = 'anthracene'

  // 探索するパラメータと軌跡の定義
  const [theta2Emin, plot1, plot2] = useMemo(() => {
    // setTheta(records[step].theta)
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
    
    const theta2Emin: { [theta: number]: {
      a: number;
      b: number;
      Emin: number;
    } } = {}
    for (const record of records){
      if (record.theta in theta2Emin){
        if (record.E < theta2Emin[record.theta].Emin){
          theta2Emin[record.theta]={
            a: record.a,
            b: record.b,
            Emin: record.E
          }
        }
      } else {
        theta2Emin[record.theta]={
          a: record.a,
          b: record.b,
          Emin: record.E
        }
      }
    }
    
    const data1: number[][] = []
    for (const theta in theta2Emin){
      data1.push([Number(theta), theta2Emin[theta].Emin])
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
          data: [[theta,theta2Emin[theta].Emin]],
          backgroundColor: "rgba(255, 0, 0, 1)",
          pointRadius: 16,
        },
      ],
    };

    const recordsFilteredByTheta: Record[] = []
    records.forEach( value => {
      if (value.theta===theta){
        recordsFilteredByTheta.push(value)
      }})
    const plot2 = {
      labels: recordsFilteredByTheta.map((record: Record) => {return record.E}),
      datasets: [
        {
          label: "格子に対するエネルギーマップ",
          data: recordsFilteredByTheta.map((record: Record) => {return [record.a,record.b]}),
          backgroundColor: "rgba(0, 0, 255, 0.5)",
          pointRadius: 2,
        },
        {
          label: "現在の構造",
          data: [[axisA,axisB]],
          backgroundColor: "rgba(255, 0, 0, 1)",
          pointRadius: 16,
        },
      ],
    };
    
  return [ theta2Emin, plot1, plot2]
  }, [records, axisA, axisB, theta])

  const marks = Object.keys(theta2Emin).map(
    (theta)=>{
      const mark = 
      {
        value: parseFloat(theta)
      }
      return mark
    }
  )
  const options = {
    scales: {
      x:  {min: 3, max: 15} ,
      yAxes: {min: 3, max: 15},
    }
  }

  return (
    <div className="overflow-hidden h-full min-height:0">
      <div className="flex flex-row justify-between h-full min-width:0">
        <div className="flex flex-col overflow-y-hidden w-full mx-5 lg:mx-10">
          <Canvas camera={{ fov: 45, position: [0, 0, 30] }}>
            <CameraControls />
            <ambientLight intensity={0.75} />
            <spotLight position={[30, 30, 30]} penumbra={1} angle={0.2} color="white" castShadow shadow-mapSize={[512, 512]} />
            <directionalLight position={[0, 5, -4]} intensity={1} />
            <Crystal a={axisA} b={axisB} theta={theta} A1={0} A2={0}/>
          </Canvas>
          <Slider value={theta} aria-label="Default" valueLabelDisplay="on" marks={marks} step={null} onChange={onChangeTheta}/>
          <Slider value={axisA} aria-label="Default" valueLabelDisplay="on" step={0.1} min={3} max={15} onChange={onChangeAxisA}/>
          <Slider value={axisB} aria-label="Default" valueLabelDisplay="on" step={0.1} min={3} max={15} onChange={onChangeAxisB}/>
        </div>
        <div className="relative flex flex-col overflow-hidden w-full max-w-6xl h-full min-height:0 mr-5 lg:mr-10">
          <Scatter data={plot1} />
          <Scatter data={plot2} options={options}/>
          <CsvReader setRecords={setRecords}/>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
