// import { gql } from 'apollo-server-micro';
// import { Resolvers } from '../../generated/graphql-resolvers';
// import { DimerTypeEnum } from '../../generated/graphql-schema';
import { UndefinedError } from '../errors'

// const csv = require('csv-parser')
// const fs = require('fs')
// import * as fs from "fs";
// import * as csv from "csv";

// export const typeDefs = gql'
//   enum DimerTypeEnum {
//     t
//     p
//   }
//   type getDimerVdwOrbitOutput {
//     distanceCollisionArray: [Float!]
//     phiArray: [Int!]
//   }

//   type Query {
//     getDimerVdwOrbit(A1: Int, A2: Int, theta: Int, monomerName: String): getDimerVdwOrbitOutput
//   }
//' ;
// export const resolvers: Resolvers = {
//   Query: {
//     getDimerVdwOrbit: (_, { A1, A2, theta, monomerName }) => {
//         if (!A1 || !A2 || !theta || !monomerName){
//             throw new UndefinedError('either of A1, A2, theta or monomerName is not defined')
//         }
//         const distanceCollisionArray: number[] = []
//         const phiArray: number[] = []
    
//         const distanceCollisionA= getDimerVdwDistance(A1,A2,theta,0.0,DimerTypeEnum.P,monomerName)
//         const distanceCollisionB= getDimerVdwDistance(A1,A2,theta,90.0,DimerTypeEnum.P,monomerName)
//         for (let phi = 0; phi < 90; phi++) {
//             const distanceCollision= getDimerVdwDistance(A1,A2,theta,phi,DimerTypeEnum.T,monomerName)
//             const tmpA=2*distanceCollision*Math.cos(Math.PI * phi / 180)
//             const tmpB=2*distanceCollision*Math.sin(Math.PI * phi / 180)
//             if ((distanceCollisionA > tmpA) || (distanceCollisionB > tmpB)) {
//                 continue
//             } else {
//                 distanceCollisionArray.push(distanceCollision)
//                 phiArray.push(phi)
//             }
//         }
//         return {distanceCollisionArray, phiArray}
//     }
// }
// }

enum DimerTypeEnum {
    T,
    P,
}

export function getDimerVdwOrbit(A1: number, A2: number, theta: number, monomerName: string){
    // if (!A1 || !A2 || !theta || !monomerName){
    //     throw new UndefinedError('either of A1, A2, theta or monomerName is not defined')
    // }
    const distanceCollisionArray: number[] = []
    const phiArray: number[] = []

    const distanceCollisionA= getDimerVdwDistance(A1,A2,theta,0.0,DimerTypeEnum.P,monomerName)
    const distanceCollisionB= getDimerVdwDistance(A1,A2,theta,90.0,DimerTypeEnum.P,monomerName)
    for (let phi = 0; phi < 90; phi++) {
        const distanceCollision= getDimerVdwDistance(A1,A2,theta,phi,DimerTypeEnum.T,monomerName)
        const tmpA=2*distanceCollision*Math.cos(Math.PI * phi / 180)
        const tmpB=2*distanceCollision*Math.sin(Math.PI * phi / 180)
        if ((distanceCollisionA > tmpA) || (distanceCollisionB > tmpB)) {
            continue
        } else {
            distanceCollisionArray.push(distanceCollision)
            phiArray.push(phi)
        }
    }
    return {distanceCollisionArray, phiArray}
}
//   }
//   }

function getDimerVdwDistance(A1: number, A2: number, A3: number, phi: number, dimerType: DimerTypeEnum, monomerName: string){
    const monomer1 = getMonomer(monomerName,0.,0.,0.,A1,A2,A3)
    const monomer2= dimerType===DimerTypeEnum.T 
    ? getMonomer(monomerName,0.,0.,0.,A1=-A1,A2=A2,A3=-A3)
    : getMonomer(monomerName,0.,0.,0.,A1=A1,A2=A2,A3=A3)
    
    let distanceCollision=0
    
    for (const [x1,y1,z1,rad1] of monomer1){
        for (const [x2,y2,z2,rad2] of monomer2){
            
            const eR = [ Math.cos(Math.PI * phi / 180), Math.sin(Math.PI * phi / 180), 0.0]
            const R1b = eR[0] * x1 + eR[1] * y1 + eR[2] * z1
            const R2b = eR[0] * x2+ eR[1] * y2 + eR[2] * z2
            const R12 = [x2-x1,y2-y1,z2-z1]
            const R12b = eR[0] * R12[0] + eR[1] * R12[1] + eR[2] * R12[2]
            const R12a = Math.sqrt((R12[0]-R12b*eR[0])**2 + (R12[1]-R12b*eR[1]) ** 2 + (R12[2]-R12b*eR[2]) ** 2)
            if (((rad1+rad2)**2-R12a**2)<0) continue;
            const currentDistanceCollision = R1b-R2b+Math.sqrt((rad1+rad2)**2-R12a**2)
            distanceCollision = Math.max(distanceCollision,currentDistanceCollision)
        }
    }
    return distanceCollision
}

function getMonomer(monomerName: string, Ta: number, Tb: number, Tc: number, A1: number, A2: number, A3: number ){
    const tvec = [Ta,Tb,Tc]
    const ex = [1.0,0.0,0.0]
    const ey = [0.0,1.0,0.0]
    const ez = [0.0,0.0,1.0]

    let xyzArray: number[][] = [];
    const rArray: number[] = [];

    // fs.createReadStream(`/Users/kanata.koyama/Working/interaction/${monomerName}/assets/monomer.csv`)
    // .pipe(csv())
    // .on('data', async (data: {
    //     X:number 
    //     Y:number 
    //     Z:number 
    //     R:number 
    //     atom: string
    // }) => {
    //     xyzArray.push([data.X,data.Y,data.Z])
    //     rArray.push(data.R)
    // })
    // console.log(xyzArray)
    // xyzArray = matmul(xyzArray,transpose(Rod(ez,A3)))
    // xyzArray = matmul(xyzArray,transpose(Rod([-ex[0],-ex[1],-ex[2]],A2)))
    // xyzArray = matmul(xyzArray,transpose(Rod(ey,A1)))
    // console.log(xyzArray)
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
    monomer.forEach(
        ([x,y,z,r]) => {
            xyzArray.push([x,y,z])
            rArray.push(r)
        }
    )
    xyzArray = matmul(xyzArray,transpose(Rod(ez,A3)))
    xyzArray = matmul(xyzArray,transpose(Rod([-ex[0],-ex[1],-ex[2]],A2)))
    xyzArray = matmul(xyzArray,transpose(Rod(ey,A1)))
    const xyzrArray: number[][] = xyzArray.map(
        (xyz,index) => {
            return [xyz[0]+tvec[0],xyz[1]+tvec[1],xyz[2]+tvec[2],rArray[index]]
        })
    
    return xyzrArray
}

export function makeGjf(monomerName: string, a: number, b: number, theta: number, A1: number, A2: number) {
    const monomerI = getMonomer(monomerName,0.,0.,0.,A1,A2,theta)
    const monomerT1=  getMonomer(monomerName,a/2,b/2,0.,-A1,A2,-theta)
    const monomerP1= a>b 
        ? getMonomer(monomerName,0.,b,0.,A1,A2,theta)
        : getMonomer(monomerName,a,0.,0.,A1,A2,theta)
    
    const jobDiscription = `a=${a} b=${b} theta=${theta} A1=${A1} A2=${A2}`
    const gjfT = makeOneGjf(monomerI,monomerT1,`${jobDiscription}_t`)
    const gjfP = makeOneGjf(monomerI,monomerP1,`${jobDiscription}_p`)
    const gjfArray = [gjfT,gjfP]
    const gjf = '$ RunGauss\n' + gjfArray.join('\n\n--Link1--\n')
    return gjf
}

function makeOneGjf(monomer1: number[][], monomer2: number[][], jobDiscription: string){
    const gjfLines=
    `%mem=15GB
%nproc=30
#P TEST b3lyp/6-311G** EmpiricalDispersion=GD3 counterpoise=2

${jobDiscription}

0 1 0 1 0 1

${monomer1.map((xyzr,index) => {
    const atom = R2Atom(xyzr[3])
    return `${atom}(Fragment=1) ${xyzr[0].toFixed(5)} ${xyzr[1].toFixed(5)} ${xyzr[2].toFixed(5)}`
}).join('\n')}
${monomer2.map((xyzr,index) => {
    const atom = R2Atom(xyzr[3])
    return `${atom}(Fragment=2) ${xyzr[0].toFixed(5)} ${xyzr[1].toFixed(5)} ${xyzr[2].toFixed(5)}`
}).join('\n')}


`
    return gjfLines
}

export function makeExe(machine_type: number, file_name: string){
    const gr_num = machine_type==1 ? 1 : 2
    const mp_num = machine_type==1 ? 40 : 52
    const fileName = 'test'
    const exeLines = `#!/bin/sh
#$ -S /bin/sh
#$ -cwd
#$ -V
#$ -q gr${gr_num}.q
#$ -pe OpenMP ${mp_num}

hostname

export g16root=/home/g03
source $g16root/g16/bsd/g16.profile

export GAUSS_SCRDIR=/home/scr/$JOB_ID
mkdir /home/scr/$JOB_ID

g16 < ${fileName}.inp > ${fileName}.log

rm -rf /home/scr/$JOB_ID

#sleep 5
`
    return exeLines
}

function R2Atom(r:number){
    switch (r) {
        case 1.8:
            return 'S'
        case 1.7:
            return 'C'
        case 1.2:
            return 'H'
        default:
            console.log('invalid atom radius')
            return 'X'
    }
}
function Rod(n: number[],thetaDeg:number) {
    const nx = n[0]
    const ny = n[1]
    const nz = n[2]
    const thetaRad = thetaDeg * Math.PI / 180
    const Rod: number[][] = [
        [
            Math.cos(thetaRad)+(nx**2)*(1-Math.cos(thetaRad)), nx*ny*(1-Math.cos(thetaRad))-nz*Math.sin(thetaRad), nx*nz*(1-Math.cos(thetaRad))+ny*Math.sin(thetaRad)
        ],
        [
            nx*ny*(1-Math.cos(thetaRad))+nz*Math.sin(thetaRad), Math.cos(thetaRad)+(ny**2)*(1-Math.cos(thetaRad)), ny*nz*(1-Math.cos(thetaRad))-nx*Math.sin(thetaRad)
        ],
        [
            nx*nz*(1-Math.cos(thetaRad))-ny*Math.sin(thetaRad), ny*nz*(1-Math.cos(thetaRad))+nx*Math.sin(thetaRad), Math.cos(thetaRad)+(nz**2)*(1-Math.cos(thetaRad))
        ]
    ]
    return Rod

}

function transpose(matrix: number[][]) {
    matrix[0].map((_, c) => matrix.map(r => r[c]))
    return matrix
};

function matmul(matrix1: number[][], matrix2: number[][] ) {
    const res: number[][] = [];
    const row1 = matrix1.length;
    const row2 = matrix2.length;
    const col1 = matrix1[0].length;
    const col2 = matrix2[0].length;
    if (col1!==row2){
        throw new Error(`row2=${row2} is not equal to col1=${col1}`)
    }
  
    for(let i1 = 0; i1 < row1; i1++){
        res.push([])
      for(let i2 = 0; i2 < col2; i2++){
          res[i1].push(0)
        for(var i3 = 0; i3 < col1; i3++){
            res[i1][i2] += matrix1[i1][i3] * matrix2[i3][i2];
        }
      }
    }
  
    return res;
  }