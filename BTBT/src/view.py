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

def get_batch_scatter(df_cur, A1, A2, step):
    plt.subplot(121)
    Emap_scatter1 = plt.scatter(df_cur['A1'].values,df_cur['A2'].values,c=df_cur['E'].values,vmin=-43.54,vmax=-42,cmap='coolwarm')
    min_index1 = df_cur['E'].idxmin()
    min_scatter1 = plt.scatter(df_cur.iloc[min_index1]['A1'], df_cur.iloc[min_index1]['A2'], s=200, facecolor='None', edgecolors='red',c='red')
    title1 = plt.text(10,0,'step={:d}'.format(step),fontsize='large')
    batch_scatter1 = [Emap_scatter1,min_scatter1,title1]
    plt.grid(True)
    plt.xlim(5,25)
    plt.ylim(-40,-20)
    plt.xlabel('A1 deg')
    plt.ylabel('A2 deg')

    plt.subplot(122)
    df_cur_A = df_cur[(df_cur['A1']==A1) & (df_cur['A2']==A2)]
    Emap_scatter2 = plt.scatter(df_cur_A['a'].values,df_cur_A['b'].values,c=df_cur_A['E'].values,vmin=-43.54,vmax=-42,cmap='coolwarm')
    min_index2 = df_cur_A['E'].idxmin()
    min_scatter2 = plt.scatter(df_cur_A.iloc[min_index2]['a'], df_cur_A.iloc[min_index2]['b'], s=200, facecolor='None', edgecolors='red',c='red')
    title2 = plt.text(10,0,'step={:d}'.format(step),fontsize='large')
    batch_scatter2 = [Emap_scatter2,min_scatter2,title2]
    plt.grid(True)
    plt.xlim(7.0,9.0)
    plt.ylim(5.0,7.0)
    plt.xlabel('a Å')
    plt.ylabel('b Å')

    return batch_scatter1 + batch_scatter2

