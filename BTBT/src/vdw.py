import sys
sys.path.append('/Users/jigenji/opt/anaconda3/lib/python3.8/site-packages')
sys.path.append('/Users/jigenji/Working/interaction/BTBT/')
import os
import numpy as np
import pandas as pd
from tqdm import tqdm
from src.utils import Rod

vdw_path='/Users/jigenji/Working/interaction/BTBT/vdw/'
A1_list=[round(A1) for A1 in np.linspace(0,45,46)]
A2_list=[round(A2) for A2 in np.linspace(0,45,46)]
A3_list=[round(A3) for A3 in np.linspace(0,45,46)]
theta_list=np.linspace(0,90,91)

def convertor(atom_list,A1,A2,A3):
    n=np.array([np.sin(np.radians(A1))*np.cos(np.radians(A2)),
                     np.sin(np.radians(A1))*np.sin(np.radians(A2)),
                     np.cos(np.radians(A1))])
    atom_list_rt=[]
    for x,y,z,R in atom_list:
        x1,y1,z1=np.matmul(Rod(np.array([0,1,0]),A1),np.array([x,y,z]).T)
        x2,y2,z2=np.matmul(Rod(np.array([0,0,1]),A2),np.array([x1,y1,z1]).T)
        x3,y3,z3=np.matmul(Rod(n,A3),np.array([x2,y2,z2]).T)
        atom_list_rt.append([x3,y3,z3,R])
    return np.array(atom_list_rt)

def get_c_vec_vdw(A1,A2,A3,a_,b_):#,name_csv
    a=np.array([a_,0,0]);b=np.array([0,b_,0]);t1=(a+b)/2;t2=(a-b)/2
    df_anth=pd.read_csv('./monomer.csv')###x,y,z,rad
    anth=df_anth[['X','Y','Z','R']].values
    anth_i0=convertor(anth,A1,A2,A3)#層間
    anth_p=convertor(anth,A1,A2,A3)#層内
    anth_t=convertor(anth,A1,-A2,-A3)#層内
    arr_list=[[np.zeros(3),'p'],[b,'p'],[-b,'p'],[a,'p'],[-a,'p'],[t1,'t'],[-t1,'t'],[t2,'t'],[-t2,'t']]
    Ra_list=[np.round(Ra,1) for Ra in np.linspace(-np.round(a_/2,1),np.round(a_/2,1),int(np.round(2*np.round(a_/2,1)/0.1))+1)]
    z_list=[];V_list=[]
    df_vdw=pd.DataFrame(columns=['Ra','R3','V'])
    for Ra in Ra_list:
        z_max=0
        for R,arr in arr_list:
            if arr=='t':
                anth=anth_t
            elif arr=='p':
                anth=anth_p
            for x1,y1,z1,R1 in anth:#層内
                x1,y1,z1=np.array([x1,y1,z1])+R
                for x2,y2,z2,R2 in anth_i0:#i0
                    x2+=Ra
                    z_sq=(R1+R2)**2-(x1-x2)**2-(y1-y2)**2
                    if z_sq<0:
                        z_clps=0.0
                    else:
                        z_clps=np.sqrt(z_sq)+z1-z2
                    z_max=max(z_max,z_clps)
        z_list.append(z_max)
        V_list.append(a_*b_*z_max)
    df_vdw['Ra']=Ra_list;df_vdw['R3']=z_list;df_vdw['V']=V_list
    return np.array([Ra_list[np.argmin(V_list)],0,z_list[np.argmin(V_list)]])

# theta=arctan(b/a)
def vdw_R(A1,A2,A3,theta,dimer_mode,glide_mode):
    df_monomer=pd.read_csv(os.path.join(vdw_path,'monomer.csv'))###x,y,z,rad
    monomer=df_monomer[['X','Y','Z','R']].values
    monomer_1=convertor(monomer,A1,A2,A3)
    glide=180.0 if glide_mode=='a' else 0.0
    if dimer_mode=='t':
        monomer_2=convertor(monomer,A1,-A2,-A3+glide)
    elif dimer_mode=='a' or dimer_mode=='b':
        monomer_2=convertor(monomer,A1,A2,A3)
    R_clps=0
    for x1,y1,z1,rad1 in monomer_1:
        for x2,y2,z2,rad2 in monomer_2:
            eR=np.array([np.cos(np.radians(theta)),np.sin(np.radians(theta)),0.0])
            R_1b=np.dot(eR,np.array([x1,y1,z1]))
            R_2b=np.dot(eR,np.array([x2,y2,z2]))
            R_12=np.array([x2-x1,y2-y1,z2-z1])
            R_12b=np.dot(eR,R_12)
            R_12a=np.linalg.norm(R_12-R_12b*eR)
            if (rad1+rad2)**2-R_12a**2<0:
                continue
            else:
                R_clps=max(R_clps,R_1b-R_2b+np.sqrt((rad1+rad2)**2-R_12a**2))
    return R_clps

def make_csv(name_csv,glide_mode):
    df_vdw=pd.DataFrame(columns=['A1','A2','A3','theta','R','S','a','b'])
    for A1 in tqdm(A1_list):
        for A2 in A2_list:
            for A3 in A3_list:
                a_clps=vdw_R(A1,A2,A3,0.0,'a','b')
                b_clps=vdw_R(A1,A2,A3,90.0,'b','b')
                for theta in theta_list:
                    R_clps=vdw_R(A1,A2,A3,theta,'t',glide_mode)
                    a=2*R_clps*np.cos(np.radians(theta))
                    b=2*R_clps*np.sin(np.radians(theta))
                    if (a_clps > a) or (b_clps > b):
                        continue
                    else:
                        S=a*b
                        data=pd.Series([A1,A2,A3,theta,R_clps,S,a,b],index=df_vdw.columns)
                        df_vdw=df_vdw.append(data,ignore_index=True)

    df_vdw.to_csv(os.path.join(vdw_path,name_csv))

def make_csv_vdwmin(in_csv,out_csv,edge_mode):
        df_vdw=pd.read_csv(vdw_path+in_csv)
        df_contact=pd.DataFrame(columns=df_vdw.columns)
#         idx_edge=0 if edge_mode=='a' else -1 
        for A1 in A1_list:
            for A2 in A2_list:
                for A3 in A3_list:
                    df_A=df_vdw[(df_vdw['A1']==A1)&(df_vdw['A2']==A2)&(df_vdw['A3']==A3)]
                    data=pd.Series(df_A.iloc[df_A['S'].idxmin()],index=df_contact.columns)
                    df_contact=df_contact.append(data,ignore_index=True)
        df_contact.to_csv(os.path.join(vdw_path,out_csv),index=False)

def cmap(name_csv):
    df_vdw=pd.read_csv(vdw_path+name_csv)
    plt.rcParams['font.size']=15
    plt.rcParams['figure.figsize']=8,60
    ind_fig=0
    plt.axes().set_aspect('equal','datalim')
    for ind,A3 in enumerate(A3_list):
        ind_fig+=1
        plt.subplot(len(A3_list),1,ind_fig)
        plt.xscale=10
        plt.yscale=10
        plt.xlim([0,8])
        plt.ylim([0,8])
        plt.xlabel('Ra Å')
        plt.ylabel('Rb Å')

        df_A3=df_vdw[df_vdw['A3']==A3]
        R_list=df_A3['R'].values
        theta_list=df_A3['theta'].values
        x_list=[R_list[i]*np.cos(np.radians(theta_list[i])) for i in range(len(theta_list))]
        y_list=[R_list[i]*np.sin(np.radians(theta_list[i])) for i in range(len(theta_list))]
        S_list=df_A3['S'].values
        R1_min=np.round(x_list[np.argmin(S_list)]*np.cos(np.radians(A3))+y_list[np.argmin(S_list)]*np.sin((np.radians(A3))),1)
        R2_min=np.round(y_list[np.argmin(S_list)]*np.cos(np.radians(A3))-x_list[np.argmin(S_list)]*np.sin((np.radians(A3))),1)
        plt.title('heri={} S_min:{} R1_min={} R2_min={}'.format(A3*2,min(S_list),R1_min,R2_min))
        plt.scatter(x_list,y_list,c=S_list)
        plt.scatter(x_list[np.argmin(S_list)],y_list[np.argmin(S_list)],marker='D',color='blue',label='vdwmin')
        plt.legend(bbox_to_anchor=(1,1),loc='upper left')
    plt.show()
        #print('min:V={} Ra={} Rb={} R3={}'.format(min(V_list),Ra_list[np.argmin(V_list)],Rb_list[np.argmin(V_list)],R3_list[np.argmin(V_list)]))

def plot_3D(name_csv,heri):
    #import data
    df=pd.read_csv(vdw_path+name_csv)
    df_A3=df[df.A3==round(heri/2)]
    Ra_list=df_A3['a'].values/2
    Rb_list=df_A3['b'].values/2
    S_list=df_A3['S'].values

    fig = plt.figure(figsize = (8, 8))

    ax = fig.add_subplot(111, projection='3d')

    ax.set_title("vdw-contact heri="+str(heri), size = 20)

    ax.set_xlabel("Ra Å", size = 14)
    ax.set_ylabel("Rb Å", size = 14)
    ax.set_zlabel("S Å", size = 14)

    ax.plot(Ra_list, Rb_list, S_list, color = "red")
    ax.scatter(Ra_list,Rb_list,c=S_list)

    plt.show()

if __name__ == '__main__':
    make_csv('vdw_step1_glide=a.csv',glide_mode='a')
    # make_csv_vdwmin('step1_glide=b.csv','step1_min_glide=b.csv','b')