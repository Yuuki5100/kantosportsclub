// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head>
          {/* すべてのページを noindex にするメタタグ */}
          <meta name="robots" content="noindex, nofollow" />

          {/* Favicon */}
          <link rel="icon" href="/Logo.png" />
          <link rel="apple-touch-icon" href="/Logo.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
          {/* Snackbar のための Portal コンテナ */}
          <div id="snackbar-root"></div>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
