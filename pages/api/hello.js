// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export default (req, res) => {
  res.statusCode = 200;
  res.json({
    name: publicRuntimeConfig.siteName,
  });
};
