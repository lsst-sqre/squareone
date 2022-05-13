import styled from 'styled-components';
import getConfig from 'next/config';
import useSWR from 'swr';
import { useRouter } from 'next/router';

import TimesSquareApp from '../../../components/TimesSquareApp';
import TimesSquarePage from '../../../components/TimesSquarePage';
import WideContentLayout from '../../../components/WideContentLayout';

export default function NotebookViewPage({}) {
  const router = useRouter();
  const { nbSlug } = router.query;

  const userParameters = Object.fromEntries(
    Object.entries(router.query)
      .filter((item) => item[0] != 'nbSlug')
      .map((item) => item)
  );

  return (
    <TimesSquareApp>
      <TimesSquarePage name={nbSlug} userParameters={userParameters} />
    </TimesSquareApp>
  );
}

NotebookViewPage.getLayout = function getLayout(page) {
  return <WideContentLayout>{page}</WideContentLayout>;
};

export async function getServerSideProps() {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

  // Make the page return a 404 if Times Square is not configured
  const notFound = publicRuntimeConfig.timesSquareUrl ? false : true;

  return {
    notFound,
    props: {},
  };
}
