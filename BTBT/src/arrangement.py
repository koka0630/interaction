def make_arr(dimer_path,R1,R2,R3,theta_,torp):
    with open(dimer_path,'r') as f:
        xyz=f.readlines()
    xyz[4]=torp+'\n'#配置
    xyz[66]='XX '+str(30+R1)+'\n'
    xyz[67]='YY '+str(30-R2)+'\n'
    xyz[68]='ZZ '+str(10-R3)+'\n'
    xyz[69]='BB '+str(theta_)+'\n'
    xyz_add=xyz+['--Link1--\n']
    return xyz_add
