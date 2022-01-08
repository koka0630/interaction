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

// export const ChartStep1: React.FC<ChartStep1Props> = (props) => {
  
//   const recordsFilteredByTheta: Record[] = props.records.filter((value:Record) => {value.theta===props.currentTheta})
//   const plot2 = {
//     labels: recordsFilteredByTheta.map((record: Record) => {return record.E}),
//     datasets: [
//       {
//         label: "格子に対するエネルギーマップ",
//         data: recordsFilteredByTheta.map((record: Record) => {return [record.a,record.b]}),
//         backgroundColor: "rgba(0, 0, 255, 0.5)",
//         pointRadius: 8,
//       },
//     ],
//   };
//   return <Scatter data={plot2} />
// }

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
    
    // const hychartOptions = {
    //   chart: {
    //     renderTo: "container",
    //     margin: 100,
    //     type: "scatter3d",
    //     animation: false,
    //     options3d: {
    //       enabled: true,
    //       alpha: 10,
    //       beta: 30,
    //       depth: 250,
    //       viewDistance: 5,
    //       fitToPlot: false,
    //       frame: {
    //         bottom: { size: 1, color: "rgba(0,0,0,0.02)" },
    //         back: { size: 1, color: "rgba(0,0,0,0.04)" },
    //         side: { size: 1, color: "rgba(0,0,0,0.06)" }
    //       }
    //     }
    //   },
    //   title: {
    //     text: "Draggable box"
    //   },
    //   subtitle: {
    //     text: "Click and drag the plot area to rotate in space"
    //   },
    //   plotOptions: {
    //     scatter: {
    //       width: 10,
    //       height: 10,
    //       depth: 10
    //     }
    //   },
    //   yAxis: {
    //     min: 0,
    //     max: 10,
    //     title: null
    //   },
    //   xAxis: {
    //     min: 0,
    //     max: 10,
    //     gridLineWidth: 1
    //   },
    //   zAxis: {
    //     min: 0,
    //     max: 10,
    //     showFirstLabel: false
    //   },
    //   legend: {
    //     enabled: false
    //   },
    //   series: [
    //     {
    //       name: "Reading",
    //       colorByPoint: true,
    //       data: [
    //         [1, 6, 5],
    //         [8, 7, 9],
    //         [1, 3, 4],
    //         [4, 6, 8],
    //         [5, 7, 7],
    //         [6, 9, 6],
    //         [7, 0, 5],
    //         [2, 3, 3],
    //         [3, 9, 8],
    //         [3, 6, 5],
    //         [4, 9, 4],
    //         [2, 3, 3],
    //         [6, 9, 9],
    //         [0, 7, 0],
    //         [7, 7, 9],
    //         [7, 2, 9],
    //         [0, 6, 2],
    //         [4, 6, 7],
    //         [3, 7, 7],
    //         [0, 1, 7],
    //         [2, 8, 6],
    //         [2, 3, 7],
    //         [6, 4, 8],
    //         [3, 5, 9],
    //         [7, 9, 5],
    //         [3, 1, 7],
    //         [4, 4, 2],
    //         [3, 6, 2],
    //         [3, 1, 6],
    //         [6, 8, 5],
    //         [6, 6, 7],
    //         [4, 1, 1],
    //         [7, 2, 7],
    //         [7, 7, 0],
    //         [8, 8, 9],
    //         [9, 4, 1],
    //         [8, 3, 4],
    //         [9, 8, 9],
    //         [3, 5, 3],
    //         [0, 2, 4],
    //         [6, 0, 2],
    //         [2, 1, 3],
    //         [5, 8, 9],
    //         [2, 1, 1],
    //         [9, 7, 6],
    //         [3, 0, 2],
    //         [9, 9, 0],
    //         [3, 4, 8],
    //         [2, 6, 1],
    //         [8, 9, 2],
    //         [7, 6, 5],
    //         [6, 3, 1],
    //         [9, 3, 1],
    //         [8, 9, 3],
    //         [9, 1, 0],
    //         [3, 8, 7],
    //         [8, 0, 0],
    //         [4, 9, 7],
    //         [8, 6, 2],
    //         [4, 3, 0],
    //         [2, 3, 5],
    //         [9, 1, 4],
    //         [1, 1, 4],
    //         [6, 0, 2],
    //         [6, 1, 6],
    //         [3, 8, 8],
    //         [8, 8, 7],
    //         [5, 5, 0],
    //         [3, 9, 6],
    //         [5, 4, 3],
    //         [6, 8, 3],
    //         [0, 1, 5],
    //         [6, 7, 3],
    //         [8, 3, 2],
    //         [3, 8, 3],
    //         [2, 1, 6],
    //         [4, 6, 7],
    //         [8, 9, 9],
    //         [5, 4, 2],
    //         [6, 1, 3],
    //         [6, 9, 5],
    //         [4, 8, 2],
    //         [9, 7, 4],
    //         [5, 4, 2],
    //         [9, 6, 1],
    //         [2, 7, 3],
    //         [4, 5, 4],
    //         [6, 8, 1],
    //         [3, 4, 0],
    //         [2, 2, 6],
    //         [5, 1, 2],
    //         [9, 9, 7],
    //         [6, 9, 9],
    //         [8, 4, 3],
    //         [4, 1, 7],
    //         [6, 2, 5],
    //         [0, 4, 9],
    //         [3, 5, 9],
    //         [6, 9, 1],
    //         [1, 9, 2]
    //       ]
    //     }
    //   ]
    // }
    // const plot2 = {
    //   labels: records.map((record: Record) => {return record.E}),
    //   datasets: [
    //     {
    //       label: "格子に対するエネルギーマップ",
    //       data: records.map((record: Record) => {return [record.a,record.b]}),
    //       backgroundColor: records.map((record: Record) => {return `rgba(${255-255*record.E/(-45)}, 0, ${255*record.E/(-45)}, 0.5)`}),
    //       pointRadius: 8,
    //     },
    //   ],
    // };
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
          {/* TODO 元データをtheta順にsort */}
          {/* TODO thetaごとにabマップを変換 */}
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
