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
from src.utils import Rod, heri_to_A3, get_ab_from_params
import scipy.spatial.distance as distance
import random

def get_init_para_csv(auto_dir,R1,R2,heri,glide):
    init_params_csv = os.path.join(auto_dir, 'step2B_init_params.csv')
    
    init_para_list = []
    a, b = get_ab_from_params(R1,R2,heri)
    a = round(a,1); b = round(b,1)
    
    A1_list = [-5,0,5,10,-10]
    A2_list = [-30,-25,-20,-15,-10,-5,0,5,10,15,20,25,30]#[-15,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,5]
    for A1 in A1_list:
        for A2 in A2_list:
            A3 = heri_to_A3(A1,A2,heri)
            init_para_list.append([A1,A2,A3,a,b,glide,'NotYet'])
    df_init_params = pd.DataFrame(np.array(init_para_list),columns = ['A1','A2','A3','a','b','glide','status'])
    df_init_params.to_csv(init_params_csv,index=False)

def get_ab_init(df_cur):
    groupby_A = df_cur[df_cur['status']=='Done'].groupby(['A1','A2'])
    df_A = df_cur.loc[groupby_A['E'].idxmin(),:]
    a_min_pred, b_min_pred = df_A[['a','b']].mean()#分散が小さいのでとりあえず平均
    a_init = np.round(a_min_pred,1);b_init = np.round(b_min_pred,1)
    return a_init, b_init

# used in main process
def get_ab(df_val):
    a_min, b_min= df_val.iloc[df_val['E'].idxmin()][['a','b']]
    a_min = np.round(a_min,1);b_min = np.round(b_min,1)
    E_list = []; ab_done_list = []; ab_yet_list = []; ab_inProgress_list = []
    isDone = True
    for a in [a_min-0.1,a_min,a_min+0.1]:
        for b in [b_min-0.1,b_min,b_min+0.1]:
            a = np.round(a,1);b = np.round(b,1)
            df_val_ab = df_val[(df_val['a']==a)&(df_val['b']==b)]
            if len(df_val_ab)==0:
                isDone = False
                ab_yet_list.append([a,b])
            else:
                status = df_val_ab['status'].values[0]
                if status=='Done':
                    E_list.append(df_val_ab['E'].values[0])
                    ab_done_list.append([a,b])
                elif status=='InProgress':
                    isDone = False
                    ab_inProgress_list.append([a,b])
    if isDone:
        return isDone, a_min, b_min
    else:
        if len(ab_done_list)==0:#一点目なら
            a,b = random.choice(ab_yet_list)#np.arange(len(ab_yet_list)))
            return isDone, a, b
        if len(ab_yet_list)==0:#計算すべきものが全てInProgressなら
            a,b = random.choice(ab_inProgress_list) #正味abはなんでもいい
            return isDone, a, b
#              = ab_yet_list[random_index]
        E_array = np.array(E_list);E_array /= np.sum(E_array);E_weight = np.abs(E_array)
        ab_done_array = np.array(ab_done_list);ab_yet_array = np.array(ab_yet_list)
        ab_done_avg = np.average(ab_done_array, axis=0, weights=E_weight).reshape(1,2)
        dist = distance.cdist(ab_yet_array,ab_done_avg)
        a,b=ab_yet_array[np.argmin(dist)]
        return isDone,a,b

# used in main process
def get_params(auto_dir,df_cur,step):
    init_params_csv=os.path.join(auto_dir, 'step2B_init_params.csv')
    df_init_params = pd.read_csv(init_params_csv)
    
    #stepが最後まで行ったら。
    if len(df_init_params)<=step:
        for A1,A2,A3 in df_init_params.loc[df_init_params['status']=='InProgress',['A1','A2','A3']].values:
            isDone, a, b = get_ab(
                df_cur[
                    (df_cur['A1']==A1) & (df_cur['A2']==A2)
                ].reset_index(drop=True)
            )
            if isDone:
                df_init_params.loc[(df_init_params['A1']==A1) & (df_init_params['A2']==A2),'status']='Done'
                df_init_params.to_csv(init_params_csv,index=False)
                continue
            else:
                if len(df_cur[
                    (df_cur['A1']==A1)&
                    (df_cur['A2']==A2)&
                    (df_cur['status']=='InProgress')
                ])==1:#「job投入済みならば」
                    print('continue')
                    continue
                return step,A1,A2,A3,a,b
        return step,float('inf'),float('inf'),float('inf'),float('inf'),float('inf')
    
    #最初の立ち上がり時
    if len(df_init_params[df_init_params['status']=='InProgress']) < 6:
        A1,A2,A3,a,b = df_init_params.loc[step,['A1','A2','A3','a','b']]
        df_init_params.loc[step,'status']='InProgress'
        df_init_params.to_csv(init_params_csv,index=False)
        step+=1
        return step,A1,A2,A3,a,b
    
    #探索中
    for A1,A2,A3 in df_init_params.loc[df_init_params['status']=='InProgress',['A1','A2','A3']].values:
        isDone, a, b = get_ab(
            df_cur[
                (df_cur['A1']==A1) & (df_cur['A2']==A2)
            ].reset_index(drop=True)
        )
        if isDone:#コマを一つ進める
            df_init_params.loc[(df_init_params['A1']==A1) & (df_init_params['A2']==A2),'status']='Done'
            
            #次のparameterをget
            A1,A2,A3,a,b,status = df_init_params.loc[step,['A1','A2','A3','a','b','status']]
            assert status=='NotYet'
                   
            #status更新
            df_init_params.loc[step,'status'] = 'InProgress'
            df_init_params.to_csv(init_params_csv,index=False)
            step+=1
            return step,A1,A2,A3,a,b
        else:
            if len(df_cur[
                (df_cur['A1']==A1)&
                (df_cur['A2']==A2)&
                (df_cur['status']=='InProgress')
            ])==1:#「job投入済みならば」
                continue
            return step,A1,A2,A3,a,b
