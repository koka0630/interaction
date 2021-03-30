import numpy as np
from sklearn.decomposition import PCA

#Ra,Rb,heri/2 --> R1,R2
def convertor_R(Ra,Rb,theta_):
    R1=Ra*np.cos(theta_)+Rb*np.sin(theta_)
    R2=-Ra*np.sin(theta_)+Rb*np.cos(theta_)
    return R1,R2

# nの周りにtheta_in回転する回転行列
def Rod(n,theta_in):
    nx,ny,nz=n
    theta_t=np.radians(theta_in)
    Rod=np.array([[np.cos(theta_t)+(nx**2)*(1-np.cos(theta_t)),nx*ny*(1-np.cos(theta_t))-nz*np.sin(theta_t),nx*nz*(1-np.cos(theta_t))+ny*np.sin(theta_t)],
                [nx*ny*(1-np.cos(theta_t))+nz*np.sin(theta_t),np.cos(theta_t)+(ny**2)*(1-np.cos(theta_t)),ny*nz*(1-np.cos(theta_t))-nx*np.sin(theta_t)],
                [nx*nz*(1-np.cos(theta_t))-ny*np.sin(theta_t),ny*nz*(1-np.cos(theta_t))+nx*np.sin(theta_t),np.cos(theta_t)+(nz**2)*(1-np.cos(theta_t))]])
    return Rod

def extract_axis(xyz_array):#shape=[n,3]
    pca = PCA()
    pca.fit(xyz_array)
    long_axis = pca.components_[0]
    short_axis = pca.components_[1]
    return long_axis, short_axis