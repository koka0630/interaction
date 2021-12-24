import { Html, Head, Main, NextScript } from 'next/document';
export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff"></meta>
      </Head>
      <body style={{ fontFamily: "'Noto Sans JP', sans-serif" }} translate="no">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
