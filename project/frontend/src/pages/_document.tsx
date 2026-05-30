import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#020617" />
        <meta name="description" content="AI-Powered Decentralized Cybersecurity & Fintech Intelligence Platform" />
      </Head>
      <body className="bg-surface-darker">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
