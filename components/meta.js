import Head from 'next/head';
import getConfig from 'next/config';

const Meta = () => {
  const { publicRuntimeConfig } = getConfig();
  const { siteTitle, siteDescription } = publicRuntimeConfig;

  return (
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
      <title key="title">{siteTitle}</title>
      <meta name="description" key="description" content={siteDescription} />

      <meta property="og:title" key="ogtitle" content={siteTitle} />
      <meta
        property="og:description"
        key="ogdescription"
        content={siteDescription}
      />
    </Head>
  );
};

export default Meta;
