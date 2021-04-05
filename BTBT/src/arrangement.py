def make_arr(dimer_path,R1,R2,heri,torp):
    heri1 = -90.0 + heri/2
    heri2 = heri/2
    with open(dimer_path,'r') as f:
        xyz=f.readlines()
    xyz[4]=torp+'\n'#配置
    xyz[]='XX '+str(30+R1)+'\n'
    xyz[]='YY '+str(30-R2)+'\n'
    xyz[]='ZZ '+str(10-R3)+'\n'
    # xyz[]='BB '+str(heri2)+'\n'
    xyz[]='AA1 '+str(A1)+'\n'
    xyz[]='AA2 '+str(-A2)+'\n'
    xyz[]='AA3 '+str(heri1)+'\n'
    xyz[]='AA4 '+str(heri2))+'\n'
    xyz_add=xyz+['--Link1--\n']
    return xyz_add
