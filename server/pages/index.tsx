import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import HomePage from '../components/HomePage';

export const getServerSideProps = async () => ({
  props: {
    layout: 'InternalLayout', // 複数のレイアウトを切り替えたいときは 'MainLayout' などの文字列を用いる
  },
});

export default function Home() {
  //* Check the Auth and redirect to login or show main contents

  // const [loading, setLoading] = useState(true);
  return <HomePage />;
}
