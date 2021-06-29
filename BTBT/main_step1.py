import os
import pandas as pd
import time
from src.make import exec_gjf
from src.utils import check_calc_status, get_ab_from_params, heri_to_A3
from src.optimize import get_params, get_init_para_csv
from src.listen import get_E
import argparse
import numpy as np
import scipy.spatial.distance as distance
import random

def init_process(args):
    # 数理モデル的に自然な定義の元のparams initリスト: not yet
    # 結晶学的に自然なパラメータへ変換: not yet
    # a_init,b_init,thetaのリスト: todo
    # thetaでgroupbyした計算progress用のdf_progress.to_csv: todo
    # calc用のdf.to_csv: todo
    auto_dir = args.auto_dir
    glide = args.glide
    
    os.makedirs(os.path.join(auto_dir,'gaussian'), exist_ok=True)
    os.makedirs(os.path.join(auto_dir,'gaussview'), exist_ok=True)

    def get_init_para_csv(auto_dir,glide):
        init_params_csv = os.path.join(auto_dir, 'step1_init_params.csv')
        
        init_para_list = []
        init_para_list.append([0,0,theta,a,b,glide,'NotYet'])
        df_init_params = pd.DataFrame(np.array(init_para_list),columns = ['A1','A2','A3','a','b','glide','status'])
        df_init_params.to_csv(init_params_csv,index=False)
    
    get_init_para_csv(auto_dir, glide)
    
    auto_csv_path = os.path.join(auto_dir,'step1_auto.csv')
    if not os.path.exists(auto_csv_path):        
        df_E_init = pd.DataFrame(columns = ['A1','A2','A3','E','E_p','E_t','a','b','cx','cy','cz','glide','machine_type','status'])
        df_E_init.to_csv(auto_csv_path,index=False)

    df_init=pd.read_csv(os.path.join(auto_dir,'step1_init_params.csv'))
    df_init['status']='NotYet'
    df_init.to_csv(os.path.join(auto_dir,'step1_init_params.csv'),index=False)
    return 

def main_process(args):
    isOver = False
    while not(isOver):
        #check
        isOver = listen(args.auto_dir)
        time.sleep(1)

def listen(auto_dir):
    auto_csv = os.path.join(auto_dir,'step1.csv')
    df_E = pd.read_csv(auto_csv)
    df_queue = df_E[df_E['status']=='InProgress']
    machine_type_list = df_queue['machine_type'].values.tolist()
    len_queue = len(df_queue)
    
    for idx,row in zip(df_queue.index,df_queue.values):
        machine_type,file_name = row
        log_filepath = os.path.join(auto_dir,file_name)
        if not(os.path.exists(log_filepath)):#logファイルが生成される直前だとまずいので
            continue
        E_list=get_E(log_filepath)
        if len(E_list)!=2:
            continue
        else:
            len_queue-=1;machine_type_list.remove(machine_type)
            Et=float(E_list[0]);Ep=float(E_list[1])
            E = 4*Et+2*Ep
            df_E.loc[idx, ['E_t','E_p','E','status']] = [Et,Ep,E,'Done']
            df_E.to_csv(auto_csv,index=False)
            break#2つ同時に計算終わったりしたらまずいので一個で切る
    isAvailable = len_queue < 6 
    machine2IsFull = machine_type_list.count(2) >= 3
    machine_type = 1 if machine2IsFull else 2

    if isAvailable:
        params_dict = get_params_dict(auto_dir)
        file_name = exec_gjf(auto_dir, params_dict, machine_type,isInterlayer=False)
        df_newline = pd.Series(params_dict)
        df_E=df_E.append(df_newline,ignore_index=True)
        df_E.to_csv(auto_csv,index=False)
    
    init_params_csv=os.path.join(auto_dir, 'step1_init_params.csv')
    df_init_params = pd.read_csv(init_params_csv)
    df_init_params_done = filter_df(df_init_params,{'status':'Done'})
    isOver = True if len(df_init_params_done)==len(df_init_params) else False
    return isOver

def get_params_dict(auto_dir):
    """
    前提:
        step1_init_params.csvとstep1.csvがauto_dirの下にある
    """
    init_params_csv=os.path.join(auto_dir, 'step1_init_params.csv')
    df_init_params = pd.read_csv(init_params_csv)
    df_cur = pd.read_csv(os.path.join(auto_dir, 'step1.csv'))
    df_init_params_inprogress = df_init_params[df_init_params['status']=='InProgress']
    fixed_param_keys = ['theta','A1','A2']
    opt_param_keys = ['a','b']

    #最初の立ち上がり時
    if len(df_init_params[df_init_params['status']=='InProgress']) < 6:
        df_init_params_notyet = df_init_params[df_init_params['status']=='NotYet']
        for index in df_init_params_notyet.index:
            df_init_params = update_value_in_df(df_init_params,index,'status','InProgress')
            df_init_params.to_csv(init_params_csv,index=False)
            params_dict = df_init_params.loc[index,fixed_param_keys+opt_param_keys].to_dict()
            return params_dict

    for index in df_init_params_inprogress.index:
        fixed_params_dict = df_init_params.loc[index,fixed_param_keys].to_dict()
        isDone, opt_params_dict = get_opt_params_dict(df_cur, fixed_params_dict, opt_param_keys)
        if isDone:
            # df_init_paramsのstatusをupdate
            df_init_params = update_value_in_df(df_init_params,index,'status','Done')
            status = get_values_from_df(df_init_params,index+1,'status')
            
            if status=='NotYet':                
                opt_params_dict = get_values_from_df(df_init_params,index+1,opt_param_keys)
                df_init_params = update_value_in_df(df_init_params,index+1,'status','InProgress')
                df_init_params.to_csv(init_params_csv,index=False)
                return {**fixed_params_dict,**opt_params_dict}
            else:
                continue

        else:
            df_inprogress = filter_df(df_cur, {**fixed_params_dict,'status':'InProgress'})
            if len(df_inprogress)==1:
                continue
            return {**fixed_params_dict,**opt_params_dict}

def get_opt_params_dict(df_cur, fixed_params_dict, opt_param_keys):
    df_val = filter_df(df_cur, fixed_params_dict)
    a_min,b_min = df_val.iloc[df_val['E'].idxmin()][opt_param_keys].values

    #以下同じ
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
        return isDone, {'a':a_min, 'b':b_min}
    else:
        if len(ab_done_list)==0:#一点目なら
            a,b = random.choice(ab_yet_list)#np.arange(len(ab_yet_list)))
            return isDone, {'a':a, 'b':b}
        if len(ab_yet_list)==0:#計算すべきものが全てInProgressなら
            a,b = random.choice(ab_inProgress_list) #正味abはなんでもいい
            return isDone, {'a':a, 'b':b}
        E_array = np.array(E_list);E_array /= np.sum(E_array);E_weight = np.abs(E_array)
        ab_done_array = np.array(ab_done_list);ab_yet_array = np.array(ab_yet_list)
        ab_done_avg = np.average(ab_done_array, axis=0, weights=E_weight).reshape(1,2)
        dist = distance.cdist(ab_yet_array,ab_done_avg)
        a,b=ab_yet_array[np.argmin(dist)]
        return isDone, {'a':a, 'b':b}
        
def get_values_from_df(df,index,key):
    return df.loc[index,key]

def update_value_in_df(df,index,key,value):
    df.loc[index,key]=value
    return df

def filter_df(df, dict_filter):
    query = []
    for k, v in dict_filter.items():
        if type(v)==str:
            query.append('{} == "{}"'.format(k,v))
        else:
            query.append('{} == {}'.format(k,v))
    df_filtered = df.query(' and '.join(query))
    return df_filtered

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    
    parser.add_argument('--init',action='store_true')
    parser.add_argument('--auto-dir',type=str,help='path to dir which includes gaussian, gaussview and csv')
    parser.add_argument('--glide-mode', type=str, default='a')
    
    args = parser.parse_args()

    if args.init:
        print("----initial process----")
        init_process(args)
    
    print("----main process----")
    main_process(args)
    print("----finish process----")
    