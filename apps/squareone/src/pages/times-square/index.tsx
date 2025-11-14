import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import type { ReactElement, ReactNode } from 'react';

import TimesSquareApp from '../../components/TimesSquareApp';
import TimesSquareUrlParametersProvider from '../../components/TimesSquareUrlParametersProvider';
import WideContentLayout from '../../components/WideContentLayout';
import type { AppConfigContextValue } from '../../contexts/AppConfigContext';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { loadAppConfig } from '../../lib/config/loader';

type TimesSquareHomeProps = {
  appConfig: AppConfigContextValue;
};

export default function TimesSquareHome({}: TimesSquareHomeProps) {
  const appConfig = useAppConfig();
  return (
    <TimesSquareUrlParametersProvider>
      <TimesSquareApp>
        <Head>
          <title>Times Square | {appConfig.siteName}</title>
        </Head>
        <h1>Easily share Jupyter Notebooks on the Rubin Science Platform</h1>
        <p>
          Times Square lets you view computed Jupyter Notebooks in your browser,
          without spinning up a JupyterLab server. To share a notebook, simply
          copy a URL.
        </p>
        <p>
          All Times Square pages are computed on the Rubin Science Platform. Any
          software (like the LSST Science Pipelines) or data source (such as the
          Butler and EFD) available in interactive JupyterLab sessions are
          available to Times Square notebooks.
        </p>
        <p>
          Times Square is great for sharing engineering and observatory reports,
          dashboards, and analyses.
        </p>

        <h2>Edit on GitHub...</h2>
        <p>
          You can collaboratively maintain collections of notebooks in GitHub
          repositories. When you push to the default branch of a repository
          where the Times Square’s GitHub App is installed, Times Square syncs
          and computes those notebooks on the Rubin Science Platform. Check out{' '}
          <a href="https://github.com/lsst-sqre/times-square-demo">
            lsst-sqre/times-square-demo
          </a>{' '}
          for an example.
        </p>
        <h2>... or upload a notebook directly (coming soon)</h2>
        <p>
          Are you working on a notebook and not ready to commit it to GitHub yet
          (or ever)? You can directly upload a notebook to your personal
          collection of <em>fliers</em>. These are still published and you can
          share links to your fliers. Just keep in mind that any notebook that
          the team relies on and will use in the long term should get moved over
          to GitHub for better collaboration and maintainability.
        </p>
        <h2>Tweak parameters on the fly</h2>
        <p>
          You can use Jinja2 syntax in Markdown and code cells to{' '}
          <em>parameterize</em> Jupyter Notebooks with user inputs.
          Parameterizations are great for changing the date in a nightly report,
          or changing the input dataset for a basic data analysis. You, and
          other users, can change those parameters and see the notebook
          recomputed on-the-fly. Notebook parameterizations are shareable: just
          copy the URL.
        </p>
        <h2>In beta</h2>
        <p>
          Times Square is currently in beta, meaning that we’re still
          implementing basic features and writing documentation. There’s also a
          chance that we might need to reset databases. You can try Times Square
          out, but don’t rely on it for critical applications just yet.
        </p>
        <p>
          Reach out to us on Slack at{' '}
          <a href="https://lsstc.slack.com/archives/C2JP8GGVC">#dm-square</a> if
          you have questions.
        </p>
        <h2>Behind the scenes</h2>
        <p>The Times Square app is built largely from three components:</p>
        <ul>
          <li>
            <a href="https://github.com/lsst-sqre/squareone">squareone</a>{' '}
            contains the user interface
          </li>
          <li>
            <a href="https://github.com/lsst-sqre/times-square">times-square</a>{' '}
            is the API service that manages notebooks
          </li>
          <li>
            <a href="https://github.com/lsst-sqre/noteburst">noteburst</a> is
            the API service that runs Jupyter Notebooks on the Rubin Science
            Platform.
          </li>
        </ul>
        <p>These documents cover Times Square’s architecture:</p>
        <ul>
          <li>
            <a href="https://sqr-062.lsst.io">
              SQR-062: The Times Square service for publishing parameterized
              Jupyter Notebooks in the Rubin Science platform
            </a>
          </li>
          <li>
            <a href="https://sqr-065.lsst.io">
              SQR-065: Design of Noteburst, a programatic JupyterLab notebook
              execution service for the Rubin Science Platform
            </a>
          </li>
        </ul>
      </TimesSquareApp>
    </TimesSquareUrlParametersProvider>
  );
}

TimesSquareHome.getLayout = function getLayout(page: ReactElement): ReactNode {
  return <WideContentLayout>{page}</WideContentLayout>;
};

export const getServerSideProps: GetServerSideProps<
  TimesSquareHomeProps
> = async () => {
  try {
    const appConfig = await loadAppConfig();

    // Make the page return a 404 if Times Square is not configured
    const notFound = !appConfig.timesSquareUrl;

    return {
      notFound,
      props: {
        appConfig,
      },
    };
  } catch (_error) {
    // Return 404 if configuration loading fails
    return {
      notFound: true,
    };
  }
};
