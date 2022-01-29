import { tetraceneMonomer, anthraceneMonomer, btbtMonomer } from '@components/Crystal'
import * as THREE from 'three'
type GetVdwMonomerConfig = {
    monomerName: string
    A1: number
    A2: number
    A3: number
    Ta: number
    Tb: number
    Tc: number
    name?: string
}

export function getInterlayerVdwMap(a: number, b: number, theta: number, R3t: number, R3p: number, monomerName: string, isParallel: boolean, A1?: number, A2?: number){
    const vdwArray: {Ria: number, Rib: number, Ric: number, V: number}[] = []
    const monomerConfigO: GetVdwMonomerConfig = {
        A1: A1 ?? 0, A2: A2 ?? 0, A3: theta, monomerName: monomerName, Ta: 0., Tb: 0., Tc: 0., name: 'O'
    }
    const monomerConfigT1: GetVdwMonomerConfig = {
        A1: isParallel ? (A1 ?? 0) : -(A1 ?? 0), A2: isParallel ? (A2 ?? 0) : -(A2 ?? 0),
        A3: -theta, monomerName: monomerName, Ta: a/2, Tb: b/2, Tc: R3t, name: 'T1'
    }
    const monomerConfigT2: GetVdwMonomerConfig = {
        ...monomerConfigT1, Ta: a/2, Tb: -b/2, Tc: R3t - R3p, name: 'T2'
    }
    const monomerConfigP1: GetVdwMonomerConfig = {
        ...monomerConfigO, Ta: 0., Tb: b, Tc: R3p, name: 'P1'
    }
    const monomerConfigT3: GetVdwMonomerConfig = {
        ...monomerConfigT1, Ta: -a/2, Tb: -b/2, Tc: -R3t, name: 'T3'
    }
    const monomerConfigT4: GetVdwMonomerConfig = {
        ...monomerConfigT1, Ta: -a/2, Tb: b/2, Tc: R3p-R3t, name: 'T4'
    }
    const monomerConfigP2: GetVdwMonomerConfig = {
        ...monomerConfigO, Ta: 0., Tb: -b, Tc: -R3p, name: 'P2'
    }
    const eZ: [number, number, number] = [0,0,1]
    const layer1ConfigArray = [
        monomerConfigO,
         monomerConfigT1, monomerConfigT2, monomerConfigP1, monomerConfigT3, monomerConfigT4, monomerConfigP2, 
    ]
    for (let Ria = Number((-a/2).toFixed(1)); Ria <= Number((a/2).toFixed(1)); Ria = Ria + 0.1){
        Ria = Number(Ria.toFixed(1))
        for (let Rib = Number((-b/2).toFixed(1)); Rib <= Number((b/2).toFixed(1)); Rib = Rib + 0.1){
            Rib = Number(Rib.toFixed(1))
            const monomerConfigI: GetVdwMonomerConfig = {
                ...monomerConfigO, Ta: Ria, Tb: Rib, Tc: 0., name: 'I'
            }
            const [Ta,Tb,Tc] = RitIntoCell(a,b,Ria,Rib,R3t,R3p)
            const monomerConfigIT: GetVdwMonomerConfig = {
                ...monomerConfigT1, Ta: Ta, Tb: Tb, Tc: Tc, name: 'IT'
            }
            const layer2ConfigArray = [
                monomerConfigI,
                monomerConfigIT
            ]
            const RicArray = []
            for (const layer1Config of layer1ConfigArray){
                for (const layer2Config of layer2ConfigArray){
                    const vdwZ = getDimerVdwDistance(layer1Config, layer2Config, eZ) // ベクトルを返すようにしたい
                    const Ric = layer1Config.Tc + vdwZ - layer2Config.Tc
                    RicArray.push(Ric)
                }
            }
            const Ric = Math.max(...RicArray)
            const vOA = new THREE.Vector3(a, 0, 2*R3t-R3p);
            const vOB = new THREE.Vector3(0, b, R3p);
            const vOC = new THREE.Vector3(Ria, Rib, Ric);
            const V = vOA.cross(vOB).dot(vOC);
            const vdwR = { Ria: Ria, Rib: Rib, Ric: Ric, V: V }
            vdwArray.push(vdwR)
        }
    }
    return vdwArray
}

function RitIntoCell(a: number, b: number, Ria: number, Rib: number, R3t: number, R3p: number ){
    if (Ria >= 0 && Rib >= 0){
        return [Ria-a/2,Rib-b/2,-R3t]
    } else if (Ria >= 0 && Rib < 0) {
        return [Ria-a/2,Rib+b/2,R3p-R3t]
    } else if (Ria < 0 && Rib >= 0) {
        return [Ria+a/2,Rib-b/2,R3t]
    } else {
        return [Ria+a/2,Rib-b/2,R3t-R3p]
    }
}

export function getDimerVdwOrbit(A1: number, A2: number, theta: number, monomerName: string){
    // if (!A1 || !A2 || !theta || !monomerName){
    //     throw new UndefinedError('either of A1, A2, theta or monomerName is not defined')
    // }
    const distanceCollisionArray: number[] = []
    const phiArray: number[] = []

    const monomerConfigP: GetVdwMonomerConfig = {
        A1: A1,
        A2: A2,
        A3: theta,
        monomerName: monomerName,
        Ta: 0.,
        Tb: 0.,
        Tc: 0.
    }
    const distanceCollisionA= getDimerVdwDistance(monomerConfigP, monomerConfigP,[1,0,0])// A1,A2,theta,0.0,DimerTypeEnum.P,monomerName, true)
    const distanceCollisionB= getDimerVdwDistance(monomerConfigP, monomerConfigP,[0,1,0])
    for (let phi = 0; phi < 90; phi++) {
        const monomerConfigT: GetVdwMonomerConfig = {
            A1: -A1,
            A2: A2,
            A3: -theta,
            monomerName: monomerName,
            Ta: 0.,
            Tb: 0.,
            Tc: 0.,
        }
        const eR: [number, number, number] = [ Math.cos(Math.PI * phi / 180), Math.sin(Math.PI * phi / 180), 0.0]
        const distanceCollision= getDimerVdwDistance(monomerConfigP, monomerConfigT, eR)
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

// monomer1Config, monomer2Config, eR(近づける方向ベクトル)という感じにする dimerType===DimerTypeEnum.T とかisParallelとかでif文発生させるのは関数の外にする
function getDimerVdwDistance(monomer1Config: GetVdwMonomerConfig, monomer2Config: GetVdwMonomerConfig, eR: [number, number, number]){
    // 接近させるベクトル方向の重心のずれをキャンセルする
    const Gx1 = monomer1Config.Ta - monomer1Config.Ta * eR[0]
    const Gy1 = monomer1Config.Tb - monomer1Config.Tb * eR[1]
    const Gz1 = monomer1Config.Tc - monomer1Config.Tc * eR[2]
    const Gx2 = monomer2Config.Ta - monomer2Config.Ta * eR[0]
    const Gy2 = monomer2Config.Tb - monomer2Config.Tb * eR[1]
    const Gz2 = monomer2Config.Tc - monomer2Config.Tc * eR[2]
    const monomer1 = getMonomer(
        monomer1Config.monomerName, 
        Gx1,Gy1,Gz1,
        monomer1Config.A1,monomer1Config.A2,monomer1Config.A3
    )
    const monomer2 = getMonomer(
        monomer2Config.monomerName, 
        Gx2,Gy2,Gz2,
        monomer2Config.A1,monomer2Config.A2,monomer2Config.A3
    )
    
    const distanceCollisionArray: number[] = []
    
    for (const [x1,y1,z1,rad1] of monomer1){
        for (const [x2,y2,z2,rad2] of monomer2){
            const R1b = eR[0] * x1 + eR[1] * y1 + eR[2] * z1
            const R2b = eR[0] * x2 + eR[1] * y2 + eR[2] * z2
            const R12 = [x2-x1,y2-y1,z2-z1]
            const R12b = eR[0] * R12[0] + eR[1] * R12[1] + eR[2] * R12[2]
            const R12a = Math.sqrt((R12[0]-R12b*eR[0])**2 + (R12[1]-R12b*eR[1]) ** 2 + (R12[2]-R12b*eR[2]) ** 2)
            if (((rad1+rad2)**2-R12a**2)<0) continue;
            const distanceCollision = R1b-R2b+Math.sqrt((rad1+rad2)**2-R12a**2)
            distanceCollisionArray.push(distanceCollision)
        }
    }
    return Math.max(...distanceCollisionArray)
}

function getMonomer(monomerName: string, Ta: number, Tb: number, Tc: number, A1: number, A2: number, A3: number ){
    const tvec = [Ta,Tb,Tc]
    const ex = [1.0,0.0,0.0]
    const ey = [0.0,1.0,0.0]
    const ez = [0.0,0.0,1.0]

    let xyzArray: number[][] = [];
    const rArray: number[] = [];

    let monomer: [x: number, y: number, z: number,r:number][] = []
    switch (monomerName){
        case "tetracene":
            monomer = tetraceneMonomer
            break;
        case "anthracene":
            monomer = anthraceneMonomer
            break;
        case "BTBT":
            monomer = btbtMonomer
            break
    }
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