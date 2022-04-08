/* useLogin custom hook */

import { useEffect, useState } from 'react';

export const apiStates = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

export const useLogin = (baseUrl) => {
  const [data, setData] = useState({
    state: apiStates.LOADING,
    error: '',
    data: [],
  });

  // Short cut for updating just a single key in the state
  const setPartialData = (partialData) => setData({ ...data, ...partialData });

  const url = new URL('/auth/api/v1/user-info', baseUrl);

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
