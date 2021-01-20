import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import styles from '../styles/Home.module.css';

export const apiStates = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

const useLogin = (url) => {
  const [data, setData] = useState({
    state: apiStates.LOADING,
    error: '',
    data: [],
  });

  // Short cut for updating just a single key in the state
  const setPartialData = (partialData) => setData({ ...data, ...partialData });

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    setPartialData({
      state: apiStates.LOADING,
    });
    fetch(url)
      .then((response) => {
        if (response.status >= 200 && response.status <= 299) {
          return response.json();
        }
        throw Error(response.statusText);
      })
      .then((jsonData) => {
        setPartialData({ state: apiStates.SUCCESS, data: jsonData });
      })
      .catch(() => {
        setPartialData({ state: apiStates.ERROR, error: 'fetch failed' });
      });
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  return data;
};

const Login = ({ loginData }) => (
  <p>
    {loginData.state === apiStates.SUCCESS
      ? `Hello ${loginData.data.username}`
      : 'Login'}
  </p>
);

Login.propTypes = {
  loginData: PropTypes.object,
};

export default function Home({ publicRuntimeConfig }) {
  const loginData = useLogin('http://localhost:3001/auth/api/v1/user-info');

  return (
    <div className={styles.container}>
      <Head>
        <title>{publicRuntimeConfig.siteName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{publicRuntimeConfig.siteName}</h1>

        <Login loginData={loginData} />

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h3>Deploy &rarr;</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  );
}

Home.propTypes = {
  publicRuntimeConfig: PropTypes.object,
};

export async function getServerSideProps() {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  return {
    props: { serverRuntimeConfig, publicRuntimeConfig },
  };
}
