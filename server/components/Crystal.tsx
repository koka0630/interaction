import React, { useEffect, useRef, useMemo,useState } from "react";
// import { gql, useQuery } from '@apollo/client';
// import { GetDimerVdwOrbitOutput } from '../generated/graphql-schema';

// const QUERY = gql`
//   query getDimerVdwOrbit($A1: Int, $A2: Int, $theta: Int, $monomerName: String) {
//     getDimerVdwOrbit(A1: $A1 A2: $A2 theta: $theta monomerName: $monomerName ) {
//       distanceCollisionArray
//       phiArray
//     }
//   }
// `;

// 一旦アントラセン固定
const monomer: [x: number, y: number, z: number,r:number][] = [
  [0,1.401938,0,1.7],
  [0,0.721584,-1.221313,1.7],
  [0,1.405121,-2.475773,1.7],
  [0,0.712395,-3.653842,1.7],
  [0,-1.401938,0,1.7],
  [0,-0.721584,-1.221313,1.7],
  [0,-1.405121,-2.475773,1.7],
  [0,-0.712395,-3.653842,1.7],
  [0,0.721584,1.221313,1.7],
  [0,1.405121,2.475773,1.7],
  [0,0.712395,3.653842,1.7],
  [0,-0.721584,1.221313,1.7],
  [0,-1.405121,2.475773,1.7],
  [0,-0.712395,3.653842,1.7],
  [0,2.487825,0,1.2],
  [0,2.490185,-2.47464,1.2],
  [0,1.244162,-4.598637,1.2],
  [0,-2.487825,0,1.2],
  [0,-2.490185,-2.47464,1.2],
  [0,-1.244162,-4.598637,1.2],
  [0,2.490185,2.47464,1.2],
  [0,1.244162,4.598637,1.2],
  [0,-2.490185,2.47464,1.2],
  [0,-1.244162,4.598637,1.2]
]

export interface MoluculeProps {
  x: number;
  y: number;
  z: number;
  angleX: number;
  angleY: number;
  angleZ: number;
}

export interface CrystalProps {
  a: number;
  b: number;
  theta: number;
  A1: number;
  A2: number;
}

const Molucule: React.FC<MoluculeProps> = (props) => {
  const { x,y,z, angleX=0, angleY=0, angleZ } = props;
  return (
    <group position={[x,y,z]} rotation={[ angleX*(Math.PI/180), angleY*(Math.PI/180), angleZ*(Math.PI/180)]}>
      {monomer.map((xyzr)=>{
        return (
          <mesh position={[xyzr[0], xyzr[1], xyzr[2]]}>
            <sphereGeometry args={[xyzr[3], 32, 32]}/>
            <meshStandardMaterial color={"rgb(0, 158, 255)"} roughness={0} metalness={0}/>
          </mesh>
        )
      })}
    </group>
  );
};

export const Crystal: React.FC<CrystalProps> = (props) => {
  const { a, b, theta, A1=0, A2=0 } = props;
  return (
    <group>
      <Molucule x={0} y={0} z={0} angleX={A1} angleY={A2} angleZ={theta}/>
      <Molucule x={a} y={0} z={0} angleX={A1} angleY={A2} angleZ={theta}/>
      <Molucule x={0} y={b} z={0} angleX={A1} angleY={A2} angleZ={theta}/>
      <Molucule x={a/2} y={b/2} z={0} angleX={A1} angleY={A2} angleZ={-theta}/>
      <Molucule x={a/2} y={-b/2} z={0} angleX={A1} angleY={A2} angleZ={-theta}/>
      <Molucule x={-a} y={0} z={0} angleX={A1} angleY={A2} angleZ={theta}/>
      <Molucule x={0} y={-b} z={0} angleX={A1} angleY={A2} angleZ={theta}/>
      <Molucule x={-a/2} y={-b/2} z={0} angleX={A1} angleY={A2} angleZ={-theta}/>
      <Molucule x={-a/2} y={b/2} z={0} angleX={A1} angleY={A2} angleZ={-theta}/>
    </group>
  )
}

export function AnimatedCrystal(props: {parameters: CrystalProps[], monomerName: string, initStep: number}) {
  const [a,setA]=useState<number>(8.0)
  const [b,setB]=useState<number>(6.0)
  const [theta,setTheta]=useState<number>(25)
  const [A1,setA1]=useState<number>(0)
  const [A2,setA2]=useState<number>(0)
  const [step, setStep] = useState(props.initStep);

  useEffect(function() {
    const intervalId = setInterval(function() {
      if (step < props.parameters.length - 1) {
        setStep(step + 1);
        setA(props.parameters[step].a)
        setB(props.parameters[step].b)
        setTheta(props.parameters[step].theta)
        setA1(props.parameters[step].A1)
        setA2(props.parameters[step].A2)
      } else {
        setStep(props.initStep);
      }
    }, 50);
    return function(){clearInterval(intervalId)};
  }, [step]);

  return ( 
    <group>
      <Crystal a={a} b={b} theta={theta} A1={A1} A2={A2}/>
    </group>
    )
}
export default Crystal
