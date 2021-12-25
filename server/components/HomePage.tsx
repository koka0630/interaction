import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStopwatch } from "react-timer-hook";
import { getDimerVdwOrbit } from '../apollo/modules/vdw'
import { Canvas } from "react-three-fiber";
import Slider from '@material-ui/core/Slider';
import { CameraControls } from "./CameraControls";
import Crystal, {CrystalProps } from "./Crystal";
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
import { Line } from 'react-chartjs-2';
import faker from 'faker';

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

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Dataset 2',
      data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

function AnimatedCrystal(props: {theta: number, monomerName: string}) {
  const [a,setA]=useState<number>(8.0)
  const [b,setB]=useState<number>(6.0)
  const [A1,setA1]=useState<number>(0)
  const [A2,setA2]=useState<number>(0)
  
  const [step, setStep] = useState(0);

  const [positions, colors] = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const { distanceCollisionArray, phiArray } = getDimerVdwOrbit(A1,A2,props.theta,props.monomerName)
    console.log('phiArray')
    console.log(phiArray[phiArray.length-1])
    distanceCollisionArray.map(
      (distanceCollision, index) => {
        const phi = phiArray[index]
        positions.push(distanceCollision * Math.cos(Math.PI*phi/180))
        positions.push(distanceCollision * Math.sin(Math.PI*phi/180))
        positions.push(0)
        colors.push(1)
        colors.push(0)
        colors.push(0)
        if (index===0){
          console.log('positions')
          console.log(positions[0])
        }
    });
    return [ new Float32Array(positions), new Float32Array(colors)]
  }, [props.theta])

  const attrib = useRef()
  useMemo(() => {
    return []
  }, [step])

  useEffect(function() {
    const intervalId = setInterval(function() {
      setStep(step + 1);
      setA(2 * positions[3 * step])
      setB(2 * positions[3 * step + 1])
    }, 50);
    return function(){clearInterval(intervalId)};
  }, [step]);

  return ( 
        <group>
          <Crystal a={a} b={b} theta={props.theta} A1={A1} A2={A2}/>
          <points>
            <bufferGeometry attach="geometry">
              <bufferAttribute ref={attrib} attachObject={["attributes", "position"]} count={positions.length / 3} array={positions} itemSize={3} needsUpdate={true}/>
              <bufferAttribute attachObject={["attributes", "color"]} count={colors.length / 3} array={colors} itemSize={3} needsUpdate={true}/>
            </bufferGeometry>
            <pointsMaterial attach="material" vertexColors size={7} sizeAttenuation={false} />
          </points>
        </group>
        )
}

function HomePage() {
  const { seconds, isRunning, start, pause, reset } = useStopwatch({ autoStart: true });
  const [theta,setTheta]=useState<number>(25)
  const monomerName = 'anthracene'
  const onChangeTheta = (event: object, value: number | number[]) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    setTheta(normalizedValue)
  };

  // const [positions, colors] = useMemo(() => {
  //   const positions: number[] = []
  //   const colors: number[] = []
  //   const { distanceCollisionArray, phiArray } = getDimerVdwOrbit(A1,A2,theta,monomerName)
  //   console.log('phiArray')
  //   console.log(phiArray[phiArray.length-1])
  //   distanceCollisionArray.map(
  //     (distanceCollision, index) => {
  //       const phi = phiArray[index]
  //       positions.push(distanceCollision * Math.cos(Math.PI*phi/180))
  //       positions.push(distanceCollision * Math.sin(Math.PI*phi/180))
  //       positions.push(0)
  //       colors.push(1)
  //       colors.push(0)
  //       colors.push(0)
  //       if (index===0){
  //         console.log('positions')
  //         console.log(positions[0])
  //       }
  //   });
  //   return [ new Float32Array(positions), new Float32Array(colors)]
  // }, [theta])
  // const attrib = useRef()
  
  // const [ step ] = useMemo(() => {
  //   return [ Math.floor(seconds/10) ]
  // }, [seconds])

  // useMemo(() => {
  //   setA(2 * positions[3 * step])
  //   setB(2 * positions[3 * step] + 1)
  //   return []
  // }, [step])

  // console.log(a,b,step,seconds)
 
  return (
    <div className="overflow-hidden h-full min-height:0">
      <div className="flex flex-row justify-between h-full min-width:0">
        <div className="flex flex-col overflow-y-hidden w-full mx-5 lg:mx-10">
          <Canvas camera={{ fov: 45, position: [0, 0, 30] }}>
            <CameraControls />
            <ambientLight intensity={0.75} />
            <spotLight position={[30, 30, 30]} penumbra={1} angle={0.2} color="white" castShadow shadow-mapSize={[512, 512]} />
            <directionalLight position={[0, 5, -4]} intensity={1} />
            <AnimatedCrystal theta={theta} monomerName={monomerName}/>
          </Canvas>
          <button onClick={start}>Start</button>
          <button onClick={pause}>Pause</button>
          <button
            onClick={reset as unknown as React.MouseEventHandler<HTMLButtonElement>}
          >
            Reset
          </button>
          <Slider 
            value={theta}
            aria-label="Default"
            valueLabelDisplay="on"
            step={1}
            // marks
            min={0}
            max={90}
            onChange={onChangeTheta}
          />
        </div>
        <div className="relative flex flex-col overflow-hidden w-full max-w-6xl h-full min-height:0 mr-5 lg:mr-10">
          <Line options={options} data={data} onClick={function() {}}/>
          <Line options={options} data={data} onClick={function() {}}/>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
