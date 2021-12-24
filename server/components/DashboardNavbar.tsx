import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

function DashboardNavbar() {
  const router = useRouter();
  const [isNotificationShown, setIsNotificationShown] = useState(false);


  /*
    * functions and a hook for dropdown
    openMenu : bopolean  menuの開閉判定
    handleClick : function dropdownを閉じるか判定・閉じる
    handleOpenMenu : function dropdownの開閉
    useEffect : hook clickのevemtListener発火
    */
  const [openMenu, setOpenMenu] = useState(false);

  function handleClick(e: Event) {
    if (!(e.target as Element).closest('#menuDropdown') && openMenu) {
      setOpenMenu(false);
    }
  }

  function handleOpenMenu() {
    setOpenMenu(!openMenu);
  }

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  });

  /*
    * functions for logout
    handleLogout : logout and redirect to login page
    */

  return (
    <nav className="bg-indigo-600 overflow-hidden">
      <div className="max-w-8xl mx-auto px-2 sm:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 pb-2">
              <div className="h-8 cursor-pointer">
                <Link href="/" as="/">
                  <a>
                    <Image
                      src="/ailead-symbol-logo-white.svg"
                      alt="Picture of the author"
                      width={40}
                      height={40}
                    />
                  </a>
                </Link>
              </div>
            </div>

            <div className="">
              <div className="ml-2 sm:ml-4 flex items-baseline sm:space-x-2 h-full">
                <Link href="/" as="/">
                  <a
                    className={`${
                      !router.pathname.includes('home') &&
                      !router.pathname.includes('library') &&
                      !router.pathname.includes('call') &&
                      !router.pathname.includes('calls') &&
                      !router.pathname.includes('forms') &&
                      !router.pathname.includes('team') &&
                      !router.pathname.includes('library') &&
                      !router.pathname.includes('setting') &&
                      !router.pathname.includes('company') &&
                      !router.pathname.includes('recording')
                        ? 'text-yellow-500 border-b-4 border-yellow-500 font-bold'
                        : 'text-white hover:text-yellow-500 font-md'
                    }  group flex h-16 items-center px-2 py-4 text-md space-x-1 cursor-pointer`}
                  >
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <p className="hidden lg:block">home</p>
                  </a>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div
              className="flex flex-row items-center ml-2 sm:ml-4 Class
                                Properties
                                cursor-auto	cursor: auto;
                                cursor-default	cursor: default;
                                cursor-pointer"
              onClick={handleOpenMenu}
              id="menuDropdown"
            >
              <div className="hidden sm:block text-white inline-flex flex-col truncate font-md">
                {/* <p>{currentUser.email}</p> */}
              </div>
              <div>
                {openMenu ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white pt-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white pt-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              <div className="ml-2 sm:ml-3 flex-shrink-0 ">
                <div>
                  <button
                    className="w-10 h-10 bg-white rounded-full flex-inline focus:outline-none"
                    aria-haspopup="true"
                  >
                  </button>
                </div>
                {openMenu && (
                  <div className="z-40 fixed">
                    <div
                      className="origin-top-right absolute right-0 mt-3 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <Link href="/settings/profile" as="/settings/profile">
                        <a
                          className="flex items-center space-x-3 block py-2 px-4 text-xs font-extralight text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p>profile</p>
                        </a>
                      </Link>

                      <Link href="/mysetting" as="/mysetting">
                        <a className="flex items-center space-x-3 block py-2 px-4 text-xs text-gray-700 hover:bg-gray-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                            />
                          </svg>
                          <p>settings</p>
                        </a>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default DashboardNavbar;

// タブ表示のダミーデータを取得
