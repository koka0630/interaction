import os
import numpy as np
import pandas as pd
import subprocess
from src.utils import Rod, R2atom
from src.vdw import get_c_vec_vdw

############################汎用関数###########################
def get_monomer_xyzR(Ta,Tb,Tc,A1,A2,A3):
    T_vec = np.array([Ta,Tb,Tc])
    df_mono=pd.read_csv('~/Working/interaction/BTBT/assets/monomer.csv')
    atoms_array_xyzR=df_mono[['X','Y','Z','R']].values
    
    ez = np.array([0.,0.,1.])
    rot_axis = np.array([-np.sin(np.radians(A2)),np.cos(np.radians(A2)),0.])

    xyz_array = atoms_array_xyzR[:,:3]
    xyz_array = np.matmul(xyz_array,Rod(ez,A3 + A2).T)
    xyz_array = np.matmul(xyz_array,Rod(rot_axis,A1).T)
    xyz_array = xyz_array + T_vec
    R_array = atoms_array_xyzR[:,3].reshape((-1,1))
    return np.concatenate([xyz_array,R_array],axis=1)
        
def get_xyzR_lines(xyzR_array,file_description):
    lines = [     
        '%mem=15GB\n',
        '%nproc=30\n',
        '#P TEST b3lyp/6-311G** EmpiricalDispersion=GD3 counterpoise=2\n',
        '\n',
        file_description+'\n',
        '\n',
        '0 1 0 1 0 1\n'
    ]
    mol_len = len(xyzR_array)//2
    atom_index = 0
    mol_index = 0
    for x,y,z,R in xyzR_array:
        atom = R2atom(R)
        mol_index = atom_index//mol_len + 1
        line = '{}(Fragment={}) {} {} {}\n'.format(atom,mol_index,x,y,z)     
        lines.append(line)
        atom_index += 1
    return lines

# 実行ファイル作成
def get_one_exe(file_name,machine_type=2):
    file_basename = os.path.splitext(file_name)[0]
    #mkdir
    if machine_type==1:
        gr_num = 1; mp_num = 40
    elif machine_type==2:
        gr_num = 2; mp_num = 52
    cc_list=[
        '#!/bin/sh \n',
         '#$ -S /bin/sh \n',
         '#$ -cwd \n',
         '#$ -V \n',
         '#$ -q gr{}.q \n'.format(gr_num),
         '#$ -pe OpenMP {} \n'.format(mp_num),
         '\n',
         'hostname \n',
         '\n',
         'export g16root=/home/g03 \n',
         'source $g16root/g16/bsd/g16.profile \n',
         '\n',
         'export GAUSS_SCRDIR=/home/scr/$JOB_ID \n',
         'mkdir /home/scr/$JOB_ID \n',
         '\n',
         'g16 < {}.inp > {}.log \n'.format(file_basename,file_basename),
         '\n',
         'rm -rf /home/scr/$JOB_ID \n',
         '\n',
         '\n',
         '#sleep 5 \n'
#          '#sleep 500 \n'
            ]

    return cc_list

######################################## 特化関数 ########################################

##################gaussview##################
def make_gaussview_xyz(auto_dir, a_,b_,c,A1,A2,A3,glide_mode,isTest=True):
    a =np.array([a_,0,0])
    b =np.array([0,b_,0])
    
    assert glide_mode=='a' or glide_mode=='b'
    
    monomer_array_i = get_monomer_xyzR(0,0,0,A1,A2,A3)
    monomer_array_p = get_monomer_xyzR(0,b_,0,A1,A2,A3)
    monomer_array_i0 = get_monomer_xyzR(c[0],c[1],c[2],A1,A2,A3)
    monomer_array_ip1 = get_monomer_xyzR(c[0],c[1]+b_,c[2],A1,A2,A3)
    if glide_mode=='a':
        monomer_array_t = get_monomer_xyzR(a_/2,b_/2,0,A1,-A2,-A3+180.0)
        monomer_array_it1 = get_monomer_xyzR(c[0]+a_/2,c[1]+b_/2,c[2],A1,-A2,-A3+180.0)
    else:
        monomer_array_t = get_monomer_xyzR(a_/2,b_/2,0,A1,-A2+180.0,-A3+180.0)
        monomer_array_it1 = get_monomer_xyzR(c[0]+a_/2,c[1]+b_/2,c[2],A1,-A2+180.0,-A3+180.0)

    monomers_array = np.concatenate([monomer_array_i,monomer_array_t,monomer_array_p,monomer_array_i0,monomer_array_ip1,monomer_array_it1],axis=0)
    
    file_description = 'A1={}_A2={}_A3={}'.format(round(A1),round(A2),round(A3))
    lines = get_xyzR_lines(monomers_array,a,b,file_description)
    lines.append('Tv {} {} {}\n'.format(a[0],a[1],a[2]))
    lines.append('Tv {} {} {}\n\n\n'.format(b[0],b[1],b[2]))
    
    os.makedirs(os.path.join(auto_dir,'gaussview'),exist_ok=True)
    output_path = os.path.join(
        auto_dir,
        'gaussview/BTBT_A1={}_A2={}_A3={}_a={}_b={}_glide={}.gjf'.format(round(A1),round(A2),round(A3),np.round(a_,2),np.round(b_,2),glide_mode)
    )
            
    with open(output_path,'w') as f:
        f.writelines(lines)
    if isTest:
        subprocess.run(['open',output_path])

def get_gjf_xyz(a_,b_,A1,A2,A3,glide_mode,isInterlayer=False):
    
    c = get_c_vec_vdw(A1,A2,A3,a_,b_,glide_mode)
    monomer_array_i = get_monomer_xyzR(0,0,0,A1,A2,A3)
    monomer_array_p = get_monomer_xyzR(0,b_,0,A1,A2,A3)
    monomer_array_i0 = get_monomer_xyzR(c[0],c[1],c[2],A1,A2,A3)
    monomer_array_ip1 = get_monomer_xyzR(c[0],c[1]+b_,c[2],A1,A2,A3)
    if glide_mode=='a':
        monomer_array_t = get_monomer_xyzR(a_/2,b_/2,0,A1,-A2,-A3+180.0)
        monomer_array_it1 = get_monomer_xyzR(c[0]+a_/2,c[1]+b_/2,c[2],A1,-A2,-A3+180.0)
    else:
        monomer_array_t = get_monomer_xyzR(a_/2,b_/2,0,A1,-A2+180.0,-A3+180.0)
        monomer_array_it1 = get_monomer_xyzR(c[0]+a_/2,c[1]+b_/2,c[2],A1,-A2+180.0,-A3+180.0)

    dimer_array_t = np.concatenate([monomer_array_i,monomer_array_t])
    dimer_array_p = np.concatenate([monomer_array_i,monomer_array_p])
    dimer_array_i0 = np.concatenate([monomer_array_i,monomer_array_i0])
    dimer_array_it1 = np.concatenate([monomer_array_i,monomer_array_it1])
    dimer_array_ip1 = np.concatenate([monomer_array_i,monomer_array_ip1])
    
    file_description = 'A1={}_A2={}_A3={}_glide={}'.format(int(A1),int(A2),int(A3),glide_mode)
    line_list_dimer_t = get_xyzR_lines(dimer_array_t,file_description+'_t')
    line_list_dimer_p = get_xyzR_lines(dimer_array_p,file_description+'_p')
    line_list_dimer_i0 = get_xyzR_lines(dimer_array_i0,file_description+'_i0')
    line_list_dimer_ip1 = get_xyzR_lines(dimer_array_ip1,file_description+'_ip1')
    line_list_dimer_it1 = get_xyzR_lines(dimer_array_it1,file_description+'_it1')

    if isInterlayer:
        gij_xyz_lines = ['$ RunGauss\n'] + line_list_dimer_t + ['\n\n--Link1--\n'] + line_list_dimer_p
    else:
        gij_xyz_lines = ['$ RunGauss\n'] + line_list_dimer_t + ['\n\n--Link1--\n'] + line_list_dimer_p \
            + ['\n\n--Link1--\n'] + line_list_dimer_i0 + ['\n\n--Link1--\n'] + line_list_dimer_ip1+ ['\n\n--Link1--\n'] + line_list_dimer_it1
    
    return gij_xyz_lines

def exec_gjf(auto_dir, params, machine_type):
    inp_dir = os.path.join(auto_dir,'gaussian')
    print(params)
    A1,A2,A3,a_,b_ = params
    file_name = 'BTBT_A1={}_A2={}_A3={}_a={}_b={}.inp'.format(round(A1),round(A2),round(A3),np.round(a_,2),np.round(b_,2))
    gij_xyz_lines = get_gjf_xyz(a_,b_,A1,A2,A3,glide='a')
    gij_xyz_path = os.path.join(inp_dir,file_name)
    with open(gij_xyz_path,'w') as f:
        f.writelines(gij_xyz_lines)
    cc_list = get_one_exe(file_name,machine_type)
    sh_filename = os.path.splitext(file_name)[0]+'.r1'
    sh_path = os.path.join(inp_dir,sh_filename)
    with open(sh_path,'w') as f:
        f.writelines(cc_list)
    subprocess.run(['qsub',sh_path])
    
############################################################################################