import React from 'react';

import DashboardNavbar from './DashboardNavbar';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative w-screen h-screen flex flex-col  flex-1 bg-white  overflow-y-hidden">
      <div className="relative left-0　top-0 flex-shrink-0 ">
        <DashboardNavbar />
      </div>
      {children}
    </main>
  );
}

function PrivateLayout({ children }: { children: React.ReactNode }) {
    return (
    <>
        <div className="flex flex-col items-center justify-center h-screen min-h-screen overflow-y-hidden">
            <DashboardLayout>{children}</DashboardLayout>
        </div>
    </>
)
}
export default PrivateLayout;