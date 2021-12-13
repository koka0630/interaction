import React from 'react';
import 'tailwindcss/tailwind.css';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import client from '../lib/apolloClient';
import Head from 'next/head';


function App({ Component, pageProps }: AppProps) {

  return (
    <>
      <Head>
        <title>interaction</title>
      </Head>

      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </>
  );
}

export default App;
