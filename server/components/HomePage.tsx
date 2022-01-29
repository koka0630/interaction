import React, { useState, useMemo, useRef } from 'react';
import { Canvas } from "react-three-fiber";
import { OrbitControls }  from "@react-three/drei";
import Slider, { Mark } from '@material-ui/core/Slider';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

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
import { getInterlayerVdwMap, getDimerVdwOrbit, makeGjf } from '../apollo/modules/vdw'
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

function getR3(A1: number, A2: number, a: number, b: number){
  const A1rad = Math.PI * A1 / 180
  const A2rad = Math.PI * A2 / 180
  const R3p = b * Math.cos(A1rad) * Math.sin(A2rad)
  const R3t = (a * Math.sin(A1rad) + R3p) / 2
  return { R3t: R3t, R3p: R3p }
}

function getA1A2(R3t: number, R3p: number, a_step1: number, b_step1: number){
  const a = Math.sqrt( a_step1**2 + (2*R3t-R3p)**2 )
  const b = Math.sqrt( b_step1**2 + R3p**2 )

  const A1rad = Math.asin((2*R3t-R3p)/a)
  const A2rad = Math.asin(R3p/(b*Math.cos(A1rad)))

  return { A1: A1rad * 180 / Math.PI, A2: A2rad * 180 / Math.PI }
}

export type MonomerName = 'anthracene' | 'tetracene' | 'pentacene' | 'BTBT'

function HomePage() {
  // TODO こちらもフロント定義ではなく、バックエンドで出力されるようにする
  const [theta,setTheta]=useState<number>(25.5)
  const [axisA,setAxisA]=useState<number>(7.3)
  const [axisB,setAxisB]=useState<number>(5.9)
  const [A1,setA1]=useState<number>(0)
  const [A2,setA2]=useState<number>(0)
  const [R3t,setR3t]=useState<number>(0)
  const [R3p,setR3p]=useState<number>(0)
  const [Ria,setRia]=useState<number>(0)
  const [Rib,setRib]=useState<number>(0)
  const [Ric,setRic]=useState<number>(0)
  const [interlayerType, setInterlayerType] = useState<'box' | 'VdW' | null>(null)
  const [enabled, setEnabled] = useState<boolean>(false)
  const [step, setStep] = useState<number>(1)
  const [monomerName, setMonomerName] = useState<MonomerName>('tetracene')

  const handleChangeStep = (event: SelectChangeEvent) => {
    setStep(Number(event.target.value));
    switch (Number(event.target.value)){
      case 1:
        setInterlayerType(null)
        setR3t(0)
        setR3p(0)
        break;
      case 2:
        setInterlayerType(null)
        break;
      case 3:
        setInterlayerType('VdW')
        setEnabled(false)
        break;
    }
  };

  const handleChangeMonomerName = (event: SelectChangeEvent) => {
    setMonomerName(event.target.value as MonomerName);
  }

  const onChangeAxisA = (event: object, value: number | number[]) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    setAxisA(normalizedValue)
    const nearestVdwAxisA = vdwAxisArray.map(([_a,_b]) => _a).reduce(function(prev, curr) {
      return (Math.abs(curr - normalizedValue) < Math.abs(prev - normalizedValue) ? curr : prev);
    })
    const nearestVdwAxis = vdwAxisArray.filter(([_a,_b]) => nearestVdwAxisA===_a)
    const nearestVdwAxisB = nearestVdwAxis[0][1]
    setAxisB(parseFloat(nearestVdwAxisB.toFixed(1)))
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
  const onChangeR3t = (event: object, value: number | number[]) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    setR3t(normalizedValue)
    setR3p(normalizedValue)
    const {A1: currentA1, A2: currentA2} = getA1A2(R3t, R3p, axisA, axisB)
    setA1(currentA1)
    setA2(currentA2)
  };
  const onChangeR3p = (event: object, value: number | number[]) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    setR3p(normalizedValue)
    const {A1: currentA1, A2: currentA2} = getA1A2(R3t, R3p, axisA, axisB)
    setA1(currentA1)
    setA2(currentA2)
  };
  const onChangeRia = (event: object, value: number | number[]) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    setRia(normalizedValue)
    const filteredStep3VdwRArray = step3VdwRArray.filter((VdwR) => Ria===VdwR.Ria && Rib===VdwR.Rib)
    if (filteredStep3VdwRArray.length > 0){
      setRic(filteredStep3VdwRArray[0].Ric)
    }
  };
  const onChangeRib = (event: object, value: number | number[]) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    setRib(normalizedValue)
    const filteredStep3VdwRArray = step3VdwRArray.filter((VdwR) => Ria===VdwR.Ria && Rib===VdwR.Rib)
    if (filteredStep3VdwRArray.length > 0){
      setRic(filteredStep3VdwRArray[0].Ric)
    }
  };

  

  const handleSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(event.target.checked)
    setInterlayerType(
      event.target.checked
      ? 'box'
      : 'VdW'
      );
  };

  
  const [records, setRecords] = useState<Record[]>([{a:8.0,b:6.0,theta:25,E:0.0,E_t:0.0,E_p:0.0}])
  

  // 探索するパラメータと軌跡の定義
  const [vdwAxisArray, theta2Emin, plot1, plot2, step2AllData] = useMemo(() => {
    const theta2Emin: { [theta: number]: {
      a: number;
      b: number;
      Emin: number;
    } } = {}
    const thetaFilterArray: number[] = [10.0, 15.0, 20.0, 22.5, 25.0, 25.5, 27.5, 30.0, 35.0, 40.0, 45.0]
    for (const record of records){
      if (!thetaFilterArray.includes(record.theta)) continue;
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
          data: [[theta,theta2Emin[theta]?.Emin]],
          backgroundColor: "rgba(255, 0, 0, 1)",
          pointRadius: 16,
        },
      ],
    };

    const { distanceCollisionArray, phiArray } = getDimerVdwOrbit(0,0,theta,monomerName)
    const vdwAxisArray: number[][] = []
    distanceCollisionArray.map(
      (distanceCollision, index) => {
        const phi = phiArray[index]
        vdwAxisArray.push(
          [
          2 * distanceCollision * Math.cos(Math.PI*phi/180),
          2 * distanceCollision * Math.sin(Math.PI*phi/180)
        ]
      )
    });

    const nearestVdwAxisA = vdwAxisArray.map(([_a,_b]) => _a).reduce(function(prev, curr) {
      return (Math.abs(curr - axisA) < Math.abs(prev - axisA) ? curr : prev);
    })
    const plot2 = {
      datasets: [
        {
          label: "a - 面積",
          data: vdwAxisArray.map(([_a,_b]) => {return [_a, _a * _b]}),
          backgroundColor: "rgba(0, 0, 255, 0.5)",
          pointRadius: 8,
        },
        {
          label: "現在の構造",
          data: vdwAxisArray.filter(([_a,_b]) => nearestVdwAxisA===_a).map(([_a,_b]) => {return [_a, _a * _b]}),
          backgroundColor: "rgba(255, 0, 0, 1)",
          pointRadius: 16,
        },
      ],
    };

    function records2PlotData (records: Record[]) {
      const plotData: {
        colors: string[],
        data: [number,number][]
      } = {
        colors: [],
        data: [],
      }
      const Emin = Math.min(...records.map((record) => record.E))
      const Emax = Math.max(...records.map((record) => record.E))
      for (const record of records){
        const A1Rad = Math.PI * (record?.A1 ?? 0) / 180 
        const A2Rad = Math.PI * (record?.A2 ?? 0) / 180 
        const normalizedE = (record.E - Emin) / (Emax - Emin)
        plotData.colors.push(`rgba(${ 255 * normalizedE }, 0, ${ 255 * ( 1 - normalizedE ) }, 1.0)`)
        // x = sin theta * cos phi = sin A1
        // y = sin theta * sin phi = cos A1 * sin A2
        // z = cos theta           = cos A1 * cos A2
        const x = Math.sin(A1Rad)
        const y = Math.cos(A1Rad) * Math.sin(A2Rad)
        plotData.data.push([x,y])
      }
      return plotData
    }

    // const colors = ["rgba(0, 0, 255, 0.5)"]
    const plotData = records2PlotData(records)
    const step2AllData = {
          label: "θ, φに対するE",
          data: plotData.data,
          // backgroundColor: "rgba(0, 0, 255, 0.5)",
          pointBackgroundColor: plotData.colors,
          pointRadius: 6,
    };
    
  return [ vdwAxisArray, theta2Emin, plot1, plot2, step2AllData]
  }, [monomerName, records, axisA, axisB, theta])

  const [ step2CurrentPointData ] = useMemo(() => {
    const A1Rad = Math.PI * (A1 ?? 0) / 180 
    const A2Rad = Math.PI * (A2 ?? 0) / 180 
    const x = Math.sin(A1Rad)
    const y = Math.cos(A1Rad) * Math.sin(A2Rad)
    
    const data = {
          label: "現在の構造",
          data: [[x,y]],
          pointBackgroundColor: ["rgba(255, 0, 0, 1)"],
          pointRadius: 16,
        }
    return [data]
  }, [A1, A2])

  const step2Plot = {
    datasets: [
      step2CurrentPointData,
      step2AllData,
    ]
  }

  const [ step3AllData, step3VdwRArray ] = useMemo(() => {
    if (step !== 3) {
      const emptyData = {
        label: "VdW体積",
        data: [],
        pointBackgroundColor: [],
        pointRadius: 8,
      }
      return [emptyData,[]]
    }
    const vdwRArray = getInterlayerVdwMap(axisA, axisB, theta, R3t, R3p, monomerName, true)
    const plotData: {
      colors: string[],
      data: [number,number][]
    } = {
      colors: [],
      data: [],
    }
    const Vmin = Math.min(...vdwRArray.map((vdwR)=>vdwR.V))
    const Vmax = Math.max(...vdwRArray.map((vdwR)=>vdwR.V))
    for (const vdwR of vdwRArray){
      const normalizedV = (vdwR.V - Vmin) / (Vmax - Vmin)
      plotData.data.push([vdwR.Ria, vdwR.Rib])
      plotData.colors.push(`rgba(${ 255 * normalizedV }, 0, ${ 255 * ( 1 - normalizedV ) }, 1.0)`)
    }
    const data = {
          label: "VdW体積",
          data: plotData.data,
          pointBackgroundColor: plotData.colors,
          pointRadius: 8,
        }
    return [data, vdwRArray]
  }, [ monomerName, axisA, axisB, theta, R3t, R3p ])

  const step3CurrentPointData = {
      label: "現在の構造",
      data: [[Ria, Rib]],
      pointBackgroundColor: ["rgba(255, 255, 0, 1)"],
      pointRadius: 16,
  }

  const step3Plot = {
    datasets: [
      step3CurrentPointData,
      step3AllData,
    ]
  }

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
      x:  {min: 3, max: 15},
      y: {min: 40, max: 60},
    }
  }
  const makeGjfHanlder = () => {
    const gjf = makeGjf(monomerName, axisA,axisB,theta,A1,A2)
    const fileName = `${monomerName}_a=${axisA}_b=${axisB}_theta=${theta}_A1=${A1}_A2=${A2}.gjf`
    const blob = new Blob([gjf], { type: 'text/plain' });
    const aTag = document.createElement('a');
    aTag.href = URL.createObjectURL(blob);
    aTag.target = '_blank';
    aTag.download = fileName;
    aTag.click();
    URL.revokeObjectURL(aTag.href);
  }

  return (
    <div className="overflow-hidden h-full min-height:0">
      <div className="flex flex-row justify-between h-full min-width:0">
        <div className="flex flex-col overflow-y-hidden w-full mx-5 lg:mx-10">
          <Canvas camera={{ fov: 45, position: [0, 0, 30] }}>
            <OrbitControls attach="camera"/>
            <ambientLight intensity={0.50} />
            <spotLight position={[30, 30, 30]} penumbra={1} angle={0.2} color="white" castShadow shadow-mapSize={[512, 512]} />
            <directionalLight position={[0, 5, -4]} intensity={1} />
            <Crystal monomerName={monomerName} a={axisA} b={axisB} theta={theta} R3t={R3t} R3p={R3p} A1={0} A2={0} Ria={Ria} Rib={Rib} Ric={Ric} interlayerType={interlayerType}/>
          </Canvas>
          <div className="self-end flex flex-row" >
            { step === 3 && <Switch checked={enabled} onChange={handleSwitch}/>}
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={monomerName}
              onChange={handleChangeMonomerName}
            >
              <MenuItem value={'anthracene'}>anthracene</MenuItem>
              <MenuItem value={'tetracene'}>tetracene</MenuItem>
              <MenuItem value={'pentacene'}>pentacene</MenuItem>
              <MenuItem value={'BTBT'}>BTBT</MenuItem>
            </Select>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={String(step)}
              onChange={handleChangeStep}
            >
              <MenuItem value={1}>step1</MenuItem>
              <MenuItem value={2}>step2</MenuItem>
              <MenuItem value={3}>step3</MenuItem>
            </Select>
            <CsvReader setRecords={setRecords}/>
            <Button variant="contained" onClick={makeGjfHanlder}>make gaussian job file</Button>
          </div>
        </div>
        <div className="relative justify-center flex flex-col overflow-hidden w-full max-w-6xl h-full min-height:0 mr-5 lg:mr-10">
          { step === 1 && 
            <div>
              <Scatter data={plot1} /> 
              <Slider value={theta} aria-label="Default" valueLabelDisplay="auto" marks={marks} step={null} onChange={onChangeTheta}/>
              <Scatter data={plot2} options={options}/>
              <Slider value={axisA} aria-label="Default" valueLabelDisplay="auto" step={0.1} min={3} max={15} onChange={onChangeAxisA}/>
              <Slider value={axisB} aria-label="Default" valueLabelDisplay="auto" step={0.1} min={3} max={15} onChange={onChangeAxisB}/>
            </div>
          }
          { step === 3 && 
            <div>
              <Scatter data={step3Plot} /> 
              <Slider value={Ria} aria-label="Default" valueLabelDisplay="auto" step={0.1} min={-Number((axisA/2).toFixed(1))} max={Number((axisA/2).toFixed(1))} onChange={onChangeRia}/>
              <Slider value={Rib} aria-label="Default" valueLabelDisplay="auto" step={0.1} min={-Number((axisB/2).toFixed(1))} max={Number((axisB/2).toFixed(1))} onChange={onChangeRib}/>
            </div>
          }
          { (step === 2 || step === 3) && 
          <div>
            <Scatter data={step2Plot} /> 
            <Slider value={R3t} aria-label="Default" valueLabelDisplay="auto" step={0.1} min={-4} max={4} onChange={onChangeR3t}/>
            <Slider value={R3p} aria-label="Default" valueLabelDisplay="auto" step={0.1} min={-4} max={4} onChange={onChangeR3p}/>
          </div>
          }
        </div>
      </div>
    </div>
  );
}

export default HomePage;
