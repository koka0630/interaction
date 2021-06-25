import os
import pandas as pd
import numpy as np
from src.make import make_gaussview_xyz
from src.utils import invert_A, heri_to_A3

def init_step(init_params_csv):
    df_init_params = pd.read_csv(init_params_csv)
    try:
        step = df_init_params[df_init_params['status']=='InProgress'].index[-1] + 1
        return step
    except IndexError:
        return 0
    
def get_E(path_file):
    with open(path_file,'r') as f:
        lines=f.readlines()
    lines_E=[]
    for line in lines:
        if line.find('E(RB3LYP)')>-1:
            lines_E.append(float(line.split()[4])*627.510)
    E_list=[lines_E[5*i]-lines_E[5*i+1]-lines_E[5*i+2] for i in range(int(len(lines_E)/5))]
    return E_list

def listen(auto_dir, heri,glide,isInterlayer=False):
    auto_csv = os.path.join(auto_dir,'step2B_auto.csv')
    df_E = pd.read_csv(auto_csv)
    df_queue = df_E[df_E['status']=='InProgress']
    machine_type_list = df_queue['machine_type'].values.tolist()
    len_queue = len(df_queue)
    
    for values in df_queue[['a','b','cx','cy','cz','A1','A2','machine_type']].values:
        a,b,cx,cy,cz,A1,A2,machine_type = values
        c = np.array([cx,cy,cz])
        A1_old, A2_old = invert_A(A1,A2)
        A3_old = heri_to_A3(A1_old,A2_old,heri)
        log_filepath = os.path.join(auto_dir,'gaussian/BTBT_A1={}_A2={}_A3={}_a={}_b={}_glide={}.log'.format(round(A1_old),round(A2_old),round(A3_old),a,b,glide))
        if not(os.path.exists(log_filepath)):#logファイルが生成される直前だとまずいので
            continue
        E_list=get_E(log_filepath)
        if len(E_list)!=2:
            continue
        else:
            #Doneが増えたのでパラメータ更新可能
            len_queue-=1;machine_type_list.remove(machine_type)
            make_gaussview_xyz(auto_dir,a,b,c,A1_old,A2_old,A3_old,glide,isInterlayer)
            Et=float(E_list[0]);Ep=float(E_list[1])
            E = 4*Et+2*Ep
            df_E.loc[(df_E['A1']==A1) & (df_E['A2']==A2) & (df_E['a']==a) & (df_E['b']==b), ['E_t','E_p','E','status']] = [Et,Ep,E,'Done']
            df_E.to_csv(auto_csv,index=False)
            break#2つ同時に計算終わったりしたらまずいので一個で切る
    isAvailable = len_queue < 6 
    machine2IsFull = machine_type_list.count(2) >= 3
    machine_type = 1 if machine2IsFull else 2
    return isAvailable, machine_type
