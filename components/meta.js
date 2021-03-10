import Head from 'next/head';

const Meta = () => (
  <Head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
      key="viewport"
    />
    <meta charSet="utf-8" key="viewport" />
    <link
      rel="icon"
      type="image/svg+xml"
      href="/rubin-favicon.svg"
      key="favicon"
    />
    <link
      rel="alternate icon"
      href="/rubin-favicon-transparent-32px.png"
      key="altfavicon"
    />
  </Head>
);

export default Meta;
