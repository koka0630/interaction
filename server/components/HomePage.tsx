import React, { useCallback, useEffect, useState } from 'react';

function HomePage() {
 
  // __________________________________________________________
  // popup外をクリックした時に閉じる処理

  // __________________________________________________________

  return (
    <div className="overflow-hidden h-full min-height:0">
      <div className="flex flex-row justify-between h-full min-width:0">
        {/* max-w-screen-2xl  2xl:mx-auto */}
        {/* 左のrecorfings list  */}
        <div className="flex flex-col overflow-y-hidden w-4/12 mx-5 lg:mx-10">
          {/* <CallListArea /> */}
        </div>

        {/* 右のschedule  */}
        <div className="relative flex flex-col overflow-hidden w-9/12 max-w-6xl h-full min-height:0 mr-5 lg:mr-10">
          {/* 単要素: トップマージン */}
          {/* <!-- Tabs --> */}
          {/* <Schedule /> */}
          {/* 予約popup */}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
