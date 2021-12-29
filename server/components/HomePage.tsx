import React, { useState, useMemo, useRef } from 'react';
import { Canvas } from "react-three-fiber";
import Slider from '@material-ui/core/Slider';
import { CameraControls } from "./CameraControls";
import AnimatedCrystal, { CrystalProps } from './Crystal'
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


function HomePage() {
  // TODO こちらもフロント定義ではなく、バックエンドで出力されるようにする
  const [theta,setTheta]=useState<number>(25)
  const [initStep,setInitStep]=useState<number>(0)
  const onChangeTheta = (event: object, value: number | number[]) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    setTheta(normalizedValue)
    setInitStep(0)
  };
  const [records, setRecords] = useState<Record[]>([{a:8.0,b:6.0,theta:25,E:0.0,E_t:0.0,E_p:0.0}])
  
  // これはフロント定義
  const monomerName = 'anthracene'

  // 探索するパラメータと軌跡の定義
  const [parameters, positions, colors] = useMemo(() => {
    const parameters: CrystalProps[] = [] 
    const positions: number[] = []
    const colors: number[] = []
    for (const record of records) {
      const parameter = {
        a: record.a,
        b: record.b,
        theta: record.theta,
        A1: record?.A1 ?? 0,
        A2: record?.A2 ?? 0,
      }
      parameters.push(parameter)
      positions.push(record.a/2)
      positions.push(record.b/2)
      positions.push(0)
      colors.push(1)
      colors.push(0)
      colors.push(0)
    }
    return [ parameters, new Float32Array(positions), new Float32Array(colors)]
  }, [records])
  console.log('parameters.length')
  console.log(parameters.length)

  // グラフ定義
  const step1Array = records.map((record: Record) => {return [record.a,record.b]});
    const data = {
      labels: records.map((record: Record) => {return record.E}),
      datasets: [
        {
          label: "Iris-virginica",
          data: step1Array,
          borderColor: "rgba(0, 0, 255, 1)",
          backgroundColor: "rgba(0, 0, 255, 0.5)",
          pointRadius: 8,
        },
      ],
    };
  
  const attrib = useRef()

  return (
    <div className="overflow-hidden h-full min-height:0">
      <div className="flex flex-row justify-between h-full min-width:0">
        <div className="flex flex-col overflow-y-hidden w-full mx-5 lg:mx-10">
          <Canvas camera={{ fov: 45, position: [0, 0, 30] }}>
            <CameraControls />
            <ambientLight intensity={0.75} />
            <spotLight position={[30, 30, 30]} penumbra={1} angle={0.2} color="white" castShadow shadow-mapSize={[512, 512]} />
            <directionalLight position={[0, 5, -4]} intensity={1} />
            <AnimatedCrystal parameters={parameters} monomerName={monomerName} initStep={initStep}/>
            <points>
              <bufferGeometry attach="geometry">
                <bufferAttribute ref={attrib} attachObject={["attributes", "position"]} count={positions.length / 3} array={positions} itemSize={3} needsUpdate={true}/>
                <bufferAttribute attachObject={["attributes", "color"]} count={colors.length / 3} array={colors} itemSize={3} needsUpdate={true}/>
              </bufferGeometry>
              <pointsMaterial attach="material" vertexColors size={7} sizeAttenuation={false} />
            </points>
          </Canvas>
          {/* TODO スライダーをthetaでなく、stepにする */}
          {/* TODO その時のstepと構造の対応 */}
          <Slider 
            value={theta}
            aria-label="Default"
            valueLabelDisplay="on"
            step={1}
            // marks={thetaArray.map((theta) => {return {value: theta}})}
            min={0}
            max={90}
            onChange={onChangeTheta}
            />
        </div>
        <div className="relative flex flex-col overflow-hidden w-full max-w-6xl h-full min-height:0 mr-5 lg:mr-10">
          {/* <Line options={options} data={data} onClick={function() {}}/>
          <Line options={options} data={data} onClick={function() {}}/> */}
          {/* TODO 元データをtheta順にsort */}
          <CsvReader setRecords={setRecords}/>
          {/* TODO thetaごとにabマップを変換 */}
          {/* TODO theta-Eプロット */}
          <Scatter data={data} />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
