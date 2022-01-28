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
const anthraceneMonomer: [x: number, y: number, z: number,r:number][] = [
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

const tetraceneMonomer: [x: number, y: number, z: number,r:number][] = [
  [0,-0.7265024,0,1.7],
  [0,-1.4087696,-1.2317956,1.7],
  [0,-0.723656,-2.4490002,1.7],
  [0,-1.4089784,-3.7025333,1.7],
  [0,-0.712429,-4.8857534,1.7],
  [0,0.7265024,0,1.7],
  [0,1.4087696,-1.2317956,1.7],
  [0,0.723656,-2.4490002,1.7],
  [0,1.4089784,-3.7025333,1.7],
  [0,0.712429,-4.8857534,1.7],
  [0,-1.4087696,1.2317956,1.7],
  [0,-0.723656,2.4490002,1.7],
  [0,-1.4089784,3.7025333,1.7],
  [0,-0.712429,4.8857534,1.7],
  [0,1.4087696,1.2317956,1.7],
  [0,0.723656,2.4490002,1.7],
  [0,1.4089784,3.7025333,1.7],
  [0,0.712429,4.8857534,1.7],
  [0,-2.4999206,-1.2335398,1.2],
  [0,-2.4982515,-3.7033008,1.2],
  [0,-1.2492124,-5.8317454,1.2],
  [0,2.4999206,-1.2335398,1.2],
  [0,2.4982515,-3.7033008,1.2],
  [0,1.2492124,-5.8317454,1.2],
  [0,-2.4999206,1.2335398,1.2],
  [0,-2.4982515,3.7033008,1.2],
  [0,-1.2492124,5.8317454,1.2],
  [0,2.4999206,1.2335398,1.2],
  [0,2.4982515,3.7033008,1.2],
  [0,1.2492124,5.8317454,1.2],
]

export interface MoleculeProps {
  x: number;
  y: number;
  z: number;
  angleX: number;
  angleY: number;
  angleZ: number;
  monomerName: string;
}

export interface CrystalProps {
  a: number;
  b: number;
  theta: number;
  R3t: number;
  R3p: number;
  A1: number;
  A2: number;
}

function r2Color(r: number){
  switch (r) {
    case 1.2:
      return "rgb(212, 212, 212)" 
    case 1.7:
      return "rgb(128, 128, 128)" 
    case 1.8:
      return "rgb(255, 215, 0)" 
    default:
      return "rgb(0, 0, 0)" 
  }
}

const Molecule: React.FC<MoleculeProps> = (props) => {
  const { x: _x, y: _y, z: _z, angleX: _angleX, angleY: _angleY, angleZ: _angleZ, monomerName } = props;
  let monomer: [x: number, y: number, z: number, r: number][]
  switch (monomerName){
    case "anthracene":
      monomer = anthraceneMonomer
      break
    case "tetracene":
      monomer = tetraceneMonomer
      break
    default:
      monomer = []
      break
  }
  // カメラの制約から回転が不自由な方向を向いてしまうので、positionを決めるときはYとZを入れ替える
  const angleX = _angleX
  const angleY = _angleZ
  const angleZ = -_angleY
  const x = _x
  const y = _z
  const z = -_y
  
  return (
    <group position={[x,y,z]} rotation={[ angleX*(Math.PI/180), angleY*(Math.PI/180), angleZ*(Math.PI/180)]}>
      {monomer.map((xyzr)=>{
        const x = xyzr[0]
        const y = xyzr[2]
        const z = -xyzr[1]
        const r = xyzr[3]
        const color = r2Color(r)
        return (
          <mesh position={[x, y, z]}>
            <sphereGeometry args={[r, 32, 32]}/>
            <meshStandardMaterial color={color} roughness={0} metalness={0}/>
          </mesh>
        )
      })}
    </group>
  );
};

export const Crystal: React.FC<CrystalProps> = (props) => {
  const { a, b, theta, A1=0, A2=0, R3t=0, R3p=0 } = props;
  const monomerName="tetracene"
  return (
    <group>
      <Molecule x={0} y={0} z={0} angleX={-A2} angleY={A1} angleZ={theta} monomerName={monomerName}/>
      <Molecule x={a} y={0} z={2*R3t-R3p} angleX={-A2} angleY={A1} angleZ={theta} monomerName={monomerName}/>
      <Molecule x={-a} y={0} z={-2*R3t+R3p} angleX={-A2} angleY={A1} angleZ={theta} monomerName={monomerName}/>
      <Molecule x={0} y={b} z={R3p} angleX={-A2} angleY={A1} angleZ={theta} monomerName={monomerName}/>
      <Molecule x={0} y={-b} z={-R3p} angleX={-A2} angleY={A1} angleZ={theta} monomerName={monomerName}/>
      <Molecule x={a/2} y={b/2} z={R3t} angleX={-A2} angleY={A1} angleZ={-theta} monomerName={monomerName}/>
      <Molecule x={a/2} y={-b/2} z={R3t-R3p} angleX={-A2} angleY={A1} angleZ={-theta} monomerName={monomerName}/> 
      <Molecule x={-a/2} y={-b/2} z={-R3t} angleX={-A2} angleY={A1} angleZ={-theta} monomerName={monomerName}/>
      <Molecule x={-a/2} y={b/2} z={R3p-R3t} angleX={-A2} angleY={A1} angleZ={-theta} monomerName={monomerName}/>
    </group>
  )
}
export default Crystal
