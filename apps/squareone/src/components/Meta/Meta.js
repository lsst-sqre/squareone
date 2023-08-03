import Head from 'next/head';
import getConfig from 'next/config';

import SvgFavicon from '@lsst-sqre/rubin-style-dictionary/assets/favicon/rubin-favicon.svg';
import PngFavicon from '@lsst-sqre/rubin-style-dictionary/assets/favicon/rubin-favicon-transparent-32px.png';

const Meta = () => {
  const { publicRuntimeConfig } = getConfig();
  const { siteName, siteDescription } = publicRuntimeConfig;

  return (
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
        key="viewport"
      />
      <meta charSet="utf-8" key="charset" />
      <link rel="icon" type="image/svg+xml" href={SvgFavicon} key="favicon" />
      <link rel="alternate icon" href={PngFavicon} key="altfavicon" />
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
