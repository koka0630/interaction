import os
import sys
import numpy as np
import math
import pandas as pd
import re
import shutil
import itertools
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import time
import copy
import matplotlib.animation as animation
import subprocess
from src.utils import Rod, get_rot_axis_from_A2, R2atom
import scipy.spatial.distance as distance
import random

#utils
#分子を配列 --> view
def arrangeITP(atom_list,a_,b_,A1,A2,A3,glide_mode):

    atom_list_i=[];atom_list_p=[];atom_list_t=[]

    #映進面によって回転角変える
    glide=180.0 if glide_mode=='a' else 0.0

    #回転軸
    ez = np.array([0.,0.,1.])
    rot_axis_i, rot_axis_t = get_rot_axis_from_A2(A2,glide_mode)

    #alkyl回転・分子1作成
    for ind,(x,y,z,R) in enumerate(atom_list):
        x1=x;y1=y;z1=z
        x2=x;y2=y;z2=z

        #heri/2回転 i,t作成
        x1,y1,z1=np.matmul(Rod(ez,A3 + A2),np.array([x1,y1,z1]).T)
        x1,y1,z1=np.matmul(Rod(rot_axis_i,A1),np.array([x1,y1,z1]).T)
        
        x2,y2,z2=np.matmul(Rod(ez,-A3 - A2 +glide),np.array([x2,y2,z2]).T)
        x2,y2,z2=np.matmul(Rod(rot_axis_t,A1),np.array([x2,y2,z2]).T)
        
        xi=x1;yi=y1;zi=z1
        xt=a_/2+x2;yt=b_/2+y2;zt=z2
        xp=x1;yp=b_+y1;zp=z1
        
        #iを不変にする=tを逆変換
        xi,yi,zi=np.matmul(Rod(rot_axis_i,-A1),np.array([xi,yi,zi]).T)
        xi,yi,zi=np.matmul(Rod(ez,-(A3 + A2)),np.array([xi,yi,zi]).T)
        xt,yt,zt=np.matmul(Rod(rot_axis_i,-A1),np.array([xt,yt,zt]).T)
        xt,yt,zt=np.matmul(Rod(ez,-(A3 + A2)),np.array([xt,yt,zt]).T)
        xp,yp,zp=np.matmul(Rod(rot_axis_i,-A1),np.array([xp,yp,zp]).T)
        xp,yp,zp=np.matmul(Rod(ez,-(A3 + A2)),np.array([xp,yp,zp]).T)

        atom_list_i.append([xi,yi,zi,R])
        atom_list_t.append([xt,yt,zt,R]) 
        atom_list_p.append([xp,yp,zp,R])
        if ind==0:
            a = np.array([a_,0.,0.])
            b = np.array([0.,b_,0.])
            a=np.matmul(Rod(rot_axis_i,-A1),a.T)
            a=np.matmul(Rod(ez,-(A3 + A2)),a.T)
            b=np.matmul(Rod(rot_axis_i,-A1),b.T)
            b=np.matmul(Rod(ez,-(A3 + A2)),b.T)
            
    xyz_ITP=np.array(atom_list_i+atom_list_p+atom_list_t)
    
    return xyz_ITP,a,b

#分子を配列 --> gaussian
def arrange_dimer(atom_list,a_,b_,A1,A2,A3,glide_mode):

    atom_list_i=[];atom_list_p=[];atom_list_t=[]

    #映進面によって回転角変える
    glide=180.0 if glide_mode=='a' else 0.0

    #回転軸
    ez = np.array([0.,0.,1.])
    rot_axis_i, rot_axis_t = get_rot_axis_from_A2(A2,glide_mode)

    #alkyl回転・分子1作成
    for ind,(x,y,z,R) in enumerate(atom_list):
        x1=x;y1=y;z1=z
        x2=x;y2=y;z2=z

        #heri/2回転 i,t作成
        x1,y1,z1=np.matmul(Rod(ez,A3 + A2),np.array([x1,y1,z1]).T)
        x1,y1,z1=np.matmul(Rod(rot_axis_i,A1),np.array([x1,y1,z1]).T)
        
        x2,y2,z2=np.matmul(Rod(ez,-A3 - A2 +glide),np.array([x2,y2,z2]).T)
        x2,y2,z2=np.matmul(Rod(rot_axis_t,A1),np.array([x2,y2,z2]).T)
        
        xi=x1;yi=y1;zi=z1
        xt=a_/2+x2;yt=b_/2+y2;zt=z2
        xp=x1;yp=b_+y1;zp=z1
        
        #iを不変にする=tを逆変換
        xi,yi,zi=np.matmul(Rod(rot_axis_i,-A1),np.array([xi,yi,zi]).T)
        xi,yi,zi=np.matmul(Rod(ez,-(A3 + A2)),np.array([xi,yi,zi]).T)
        xt,yt,zt=np.matmul(Rod(rot_axis_i,-A1),np.array([xt,yt,zt]).T)
        xt,yt,zt=np.matmul(Rod(ez,-(A3 + A2)),np.array([xt,yt,zt]).T)
        xp,yp,zp=np.matmul(Rod(rot_axis_i,-A1),np.array([xp,yp,zp]).T)
        xp,yp,zp=np.matmul(Rod(ez,-(A3 + A2)),np.array([xp,yp,zp]).T)

        atom_list_i.append([xi,yi,zi,R])
        atom_list_t.append([xt,yt,zt,R]) 
        atom_list_p.append([xp,yp,zp,R])
        if ind==0:
            a = np.array([a_,0.,0.])
            b = np.array([0.,b_,0.])
            a=np.matmul(Rod(rot_axis_i,-A1),a.T)
            a=np.matmul(Rod(ez,-(A3 + A2)),a.T)
            b=np.matmul(Rod(rot_axis_i,-A1),b.T)
            b=np.matmul(Rod(ez,-(A3 + A2)),b.T)
    
    return atom_list_i,atom_list_p,atom_list_t

# file作成
def make_arr_xyz(xyz_list,a,b,file_description):
    lines = [
        '%mem=15GB\n',
        '%nprocshared=20\n',
        '#p pbepbe/6-311g(d,p)/auto counterpoise=2 empiricaldispersion=gd3 test\n',
        '\n',
        file_description+'\n',
        '\n',
        '0 1 0 1 0 1\n'
    ]
    mol_len = len(xyz_list)//3
    atom_index = 0
    mol_index = 0
    for x,y,z,R in xyz_list:
        atom = R2atom(R)
        mol_index = atom_index//mol_len
        line = '{}(Fragment={}) {} {} {}\n'.format(atom,mol_index,x,y,z)     
        lines.append(line)
        atom_index += 1
        
    lines.append('Tv {} {} {}\n'.format(a[0],a[1],a[2]))
    lines.append('Tv {} {} {}\n\n\n'.format(b[0],b[1],b[2]))
    
    return lines

def get_gjf_xyz(a_,b_,A1,A2,A3,glide):
    
    df_mono=pd.read_csv('/home/koyama/Working/interaction/BTBT/BTBT.csv')
    monomer=df_mono[['X','Y','Z','R']].values
    atom_list_i,atom_list_p,atom_list_t=arrange_dimer(monomer,a_,b_,A1,A2,A3,glide)
    file_description = 'A1={}_A2={}_A3={}'.format(int(A1),int(A2),int(A3))
    
    lines_dimer_t = make_arr_dimer_Z(atom_list_i+atom_list_t,file_description+'_t')
    lines_dimer_p = make_arr_dimer_Z(atom_list_i+atom_list_p,file_description+'_p')
    gij_xyz_lines = ['$ RunGauss\n'] + lines_dimer_t + ['--Link1--\n'] + lines_dimer_p
    
    return gij_xyz_lines

#ファイル作成 (書き込み前まで)
def make_arr_dimer_Z(xyz_list,file_description):
    lines = [     
        '%mem=15GB\n',
        '%nproc=30\n',
        '#P TEST b3lyp/6-311G** EmpiricalDispersion=GD3 counterpoise=2\n',
        '\n',
        file_description+'\n',
        '\n',
        '0 1 0 1 0 1\n'
    ]
    mol_len = len(xyz_list)//2
    atom_index = 0
    mol_index = 0
    for x,y,z,R in xyz_list:
        atom = R2atom(R)
        mol_index = atom_index//mol_len + 1
        line = '{}(Fragment={}) {} {} {}\n'.format(atom,mol_index,x,y,z)     
        lines.append(line)
        atom_index += 1
        
    lines.append('\n\n')
    
    return lines

#ファイル作成（書き込むところまで）
def make_gaussview_xyz(auto_dir, a_,b_,A1,A2,A3,glide):
    df_mono=pd.read_csv('/home/koyama/Working/interaction/BTBT/BTBT.csv')
    monomer=df_mono[['X','Y','Z','R']].values
    xyz_ITP,a,b=arrangeITP(monomer,a_,b_,A1,A2,A3,glide)
    file_description = 'A1={}_A2={}_A3={}'.format(round(A1),round(A2),round(A3))
    lines = make_arr_xyz(xyz_ITP,a,b,file_description)
    
    output_path = os.path.join(
        auto_dir,
        'gaussview/BTBT_A1={}_A2={}_A3={}_a={}_b={}.gjf'.format(round(A1),round(A2),round(A3),np.round(a_,2),np.round(b_,2))
    )
    
    with open(output_path,'w') as f:
        f.writelines(lines)

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

# 実行ファイル実行
def exec_gjf(auto_dir, params, machine_type):
    inp_dir = os.path.join(auto_dir,'gaussian')
    print(params)
    A1,A2,A3,a_,b_,glide = params
    file_name = 'BTBT_A1={}_A2={}_A3={}_a={}_b={}.inp'.format(round(A1),round(A2),round(A3),np.round(a_,2),np.round(b_,2))
    gij_xyz_lines = get_gjf_xyz(a_,b_,A1,A2,A3,glide=glide)
    gij_xyz_path = os.path.join(inp_dir,file_name)
    with open(gij_xyz_path,'w') as f:
        f.writelines(gij_xyz_lines)
    cc_list = get_one_exe(file_name,machine_type)
    sh_filename = os.path.splitext(file_name)[0]+'.r1'
    sh_path = os.path.join(inp_dir,sh_filename)
    with open(sh_path,'w') as f:
        f.writelines(cc_list)
    subprocess.run(['qsub',sh_path])
