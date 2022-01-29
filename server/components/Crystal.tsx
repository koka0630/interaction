import React, { useEffect, useRef, useMemo,useState } from "react";
import {MonomerName} from './HomePage'

export const anthraceneMonomer: [x: number, y: number, z: number,r:number][] = [
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

export const tetraceneMonomer: [x: number, y: number, z: number,r:number][] = [
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

export const btbtMonomer: [x: number, y: number, z: number,r:number][] = [
  [0,0.5866781,-0.3573833,1.7],
  [0,2.0029401,0.6778631,1.8],
  [0,0.964008,2.1103675,1.7],
  [0,1.3889404,3.4378337,1.7],
  [0,0.4289764,4.4426342,1.7],
  [0,-0.9391502,4.1307305,1.7],
  [0,-1.3650533,2.8115804,1.7],
  [0,-0.4153283,1.7800538,1.7],
  [0,2.4448408,3.681408,1.2],
  [0,0.7434964,5.47971,1.2],
  [0,-1.6696783,4.9311894,1.2],
  [0,-2.4220977,2.5708491,1.2],
  [0,-0.5866199,0.3573483,1.7],
  [0,-2.0028825,-0.6778975,1.8],
  [0,-0.963951,-2.1104023,1.7],
  [0,-1.3888841,-3.4378684,1.7],
  [0,-0.4289205,-4.4426693,1.7],
  [0,0.9392063,-4.1307663,1.7],
  [0,1.3651099,-2.8116164,1.7],
  [0,0.4153855,-1.7800893,1.7],
  [0,-2.4447845,-3.6814421,1.2],
  [0,-0.743441,-5.479745,1.2],
  [0,1.6697339,-4.9312256,1.2],
  [0,2.4221545,-2.5708856,1.2],
]


export interface MoleculeProps {
  x: number;
  y: number;
  z: number;
  angleX: number;
  angleY: number;
  angleZ: number;
  monomerName: string;
  type: "box" | "VdW" | null
}

export interface CrystalProps {
  monomerName: MonomerName
  a: number;
  b: number;
  theta: number;
  R3t: number;
  R3p: number;
  A1: number;
  A2: number;
  Ria: number;
  Rib: number;
  Ric: number;
  interlayerType: "box" | "VdW" | null
}

function r2Color(r: number){
  switch (r) {
    case 1.2:
      return "rgb(212, 212, 212)" 
    case 1.7:
      return "rgb(128, 128, 128)" 
    case 1.8:
      return "rgb(255, 180, 0)"
    default:
      return "rgb(0, 0, 0)" 
  }
}

const Molecule: React.FC<MoleculeProps> = (props) => {
  const { x: _x, y: _y, z: _z, angleX: _angleX, angleY: _angleY, angleZ: _angleZ, monomerName, type } = props;
  let monomer: [x: number, y: number, z: number, r: number][]
  let monomerLength: number
  switch (monomerName){
    case "anthracene":
      monomer = anthraceneMonomer
      monomerLength = 11 // TODO fix
      break
    case "tetracene":
      monomer = tetraceneMonomer
      monomerLength = 14 // TODO fix
      break
    case "BTBT":
      monomer = btbtMonomer
      monomerLength = 11 // TODO fix
      break
    default:
      monomer = []
      monomerLength = 0
      break
  }
  // カメラの制約から回転が不自由な方向を向いてしまうので、positionを決めるときはYとZを入れ替える
  const angleX = _angleX
  const angleY = _angleZ
  const angleZ = -_angleY
  const x = _x
  const y = _z
  const z = -_y

  if ( type==="box" ){
    return (
      <group position={[x,y-3*monomerLength/8,z]} rotation={[ angleX*(Math.PI/180), angleY*(Math.PI/180), angleZ*(Math.PI/180)]}>
        <mesh>
          <boxBufferGeometry args={[0.5, monomerLength/4, 5]} />
          <meshStandardMaterial color={"rgb(0,128,212)"} roughness={0} metalness={0}/>
        </mesh>
      </group>
    )
  }
  
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
  const { monomerName, a, b, theta, A1=0, A2=0, R3t=0, R3p=0, Ria, Rib, Ric, interlayerType } = props;
  return (
    <group>
      <Molecule x={0} y={0} z={0} angleX={-A2} angleY={A1} angleZ={theta} monomerName={monomerName} type={"VdW"}/>
      <Molecule x={a} y={0} z={2*R3t-R3p} angleX={-A2} angleY={A1} angleZ={theta} monomerName={monomerName} type={"VdW"}/>
      <Molecule x={-a} y={0} z={-2*R3t+R3p} angleX={-A2} angleY={A1} angleZ={theta} monomerName={monomerName} type={"VdW"}/>
      <Molecule x={0} y={b} z={R3p} angleX={-A2} angleY={A1} angleZ={theta} monomerName={monomerName} type={"VdW"}/>
      <Molecule x={0} y={-b} z={-R3p} angleX={-A2} angleY={A1} angleZ={theta} monomerName={monomerName} type={"VdW"}/>
      <Molecule x={a/2} y={b/2} z={R3t} angleX={-A2} angleY={A1} angleZ={-theta} monomerName={monomerName} type={"VdW"}/>
      <Molecule x={a/2} y={-b/2} z={R3t-R3p} angleX={-A2} angleY={A1} angleZ={-theta} monomerName={monomerName} type={"VdW"}/> 
      <Molecule x={-a/2} y={-b/2} z={-R3t} angleX={-A2} angleY={A1} angleZ={-theta} monomerName={monomerName} type={"VdW"}/>
      <Molecule x={-a/2} y={b/2} z={R3p-R3t} angleX={-A2} angleY={A1} angleZ={-theta} monomerName={monomerName} type={"VdW"}/>
      {interlayerType && <Molecule x={Ria} y={Rib} z={Ric} angleX={-A2} angleY={A1} angleZ={theta} monomerName={monomerName} type={interlayerType}/>}
      {/* <Molecule x={Ria} y={Rib+b} z={Ric + R3p} angleX={-A2} angleY={A1} angleZ={theta} monomerName={monomerName} type={interlayerType}/>
      <Molecule x={Ria} y={Rib-b} z={Ric - R3p} angleX={-A2} angleY={A1} angleZ={theta} monomerName={monomerName} type={interlayerType}/> */}
      {/* <Molecule x={Ria+a/2} y={Rib+b/2} z={Ric + R3t} angleX={-A2} angleY={A1} angleZ={-theta} monomerName={monomerName} type={interlayerType}/> */}
      {/* <Molecule x={Ria+a/2} y={Rib-b/2} z={Ric + R3t - R3p} angleX={-A2} angleY={A1} angleZ={-theta} monomerName={monomerName} type={interlayerType}/> */}
      {/* <Molecule x={Ria-a/2} y={Rib+b/2} z={Ric + R3p - R3t} angleX={-A2} angleY={A1} angleZ={-theta} monomerName={monomerName} type={interlayerType}/> */}
      {interlayerType && <Molecule x={Ria-a/2} y={Rib-b/2} z={Ric - R3t} angleX={-A2} angleY={A1} angleZ={-theta} monomerName={monomerName} type={interlayerType}/>}
    </group>
  )
}
export default Crystal
