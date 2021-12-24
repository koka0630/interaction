import React, { useCallback, useRef, useMemo,useState } from "react";
// import { gql, useQuery } from '@apollo/client';
import { getDimerVdwOrbit } from '../apollo/modules/vdw'
import { GetDimerVdwOrbitOutput } from '../generated/graphql-schema';

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

const Crystal: React.FC<CrystalProps> = (props) => {
  const { theta, A1=0, A2=0 } = props;
  const [a,setA]=useState<number>(8.0)
  const [b,setB]=useState<number>(6.0)
  const monomerName = 'anthracene'
  // const pointCount = 20
  

  const [positions, colors] = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    // const { loading, error, data } = useQuery<{getDimerVdwOrbit: GetDimerVdwOrbitOutput}>(QUERY, {
    //   variables: {A1: A1, A2: A2, theta: theta, monomerName: monomerName},
    // });
    // if ( !data?.getDimerVdwOrbit?.distanceCollisionArray || !data?.getDimerVdwOrbit?.phiArray ) return [[],[]]
    // else {
    const { distanceCollisionArray, phiArray } = getDimerVdwOrbit(A1,A2,theta,monomerName)
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
    console.log(theta)
    return [ new Float32Array(positions), new Float32Array(colors)]
  }, [theta])
  const attrib = useRef()
  const rearrange = useCallback(e => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error    
    setA(2 * attrib.current.array[e.index * 3])
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error    
    setB(2 * attrib.current.array[e.index * 3 + 1])
  }, [])
  console.log('positions[0]')
  console.log(positions[0])
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
      <points onClick={rearrange}>
        <bufferGeometry attach="geometry">
          <bufferAttribute ref={attrib} attachObject={["attributes", "position"]} count={positions.length / 3} array={positions} itemSize={3} needsUpdate={true}/>
          <bufferAttribute attachObject={["attributes", "color"]} count={colors.length / 3} array={colors} itemSize={3} needsUpdate={true}/>
        </bufferGeometry>
        <pointsMaterial attach="material" vertexColors size={7} sizeAttenuation={false} />
      </points>
    </group>
  )
}

export default Crystal
