import * as Sentry from '@sentry/nextjs';
import Error from 'next/error';
import type { NextPageContext } from 'next';
import { useEffect } from 'react';

type ErrorProps = {
  statusCode: number;
  hasGetInitialPropsRun: boolean;
  err?: Error;
};

const CustomErrorComponent = ({
  statusCode,
  hasGetInitialPropsRun,
  err,
}: ErrorProps) => {
  useEffect(() => {
    // Only capture exception if it hasn't been done during getInitialProps
    if (!hasGetInitialPropsRun && err) {
      Sentry.captureException(err);
    }
  }, [hasGetInitialPropsRun, err]);

  return <Error statusCode={statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData: NextPageContext) => {
  // In case this is running in a serverless function, await this in order to give Sentry
  // time to send the error before the lambda exits
  await Sentry.captureUnderscoreErrorException(contextData);

  // This will contain the status code of the response
  const errorInitialProps = await Error.getInitialProps(contextData);

  // Return the props with additional info about whether getInitialProps ran
  return {
    ...errorInitialProps,
    hasGetInitialPropsRun: true,
  };
};

export default CustomErrorComponent;
