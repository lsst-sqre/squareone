import Head from 'next/head';
import { useAppConfig } from '../../contexts/AppConfigContext';

const Meta = () => {
  const { siteName, siteDescription } = useAppConfig();

  return (
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
        key="viewport"
      />
      <meta charSet="utf-8" key="charset" />
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
      <title key="title">{siteName}</title>
      <meta name="description" key="description" content={siteDescription} />

      <meta property="og:title" key="ogtitle" content={siteName} />
      <meta
        property="og:description"
        key="ogdescription"
        content={siteDescription}
      />
    </Head>
  );
};

export default Meta;
