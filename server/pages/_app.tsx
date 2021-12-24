import React from 'react';
import 'tailwindcss/tailwind.css';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import client from '../lib/apolloClient';
import Head from 'next/head';
import PrivateLayout from '../components/PrivateLayout';


function App({ Component, pageProps }: AppProps) {

  return (
    <>
      <Head>
        <title>interaction</title>
      </Head>
      
      <ApolloProvider client={client}>
        <PrivateLayout>
          <Component {...pageProps} />
        </PrivateLayout>
      </ApolloProvider>
    </>
  );
}

export default App;
