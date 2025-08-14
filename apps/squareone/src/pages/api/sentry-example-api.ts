// A faulty API route to test Sentry's error monitoring
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  throw new Error('Sentry Example API Route Error');
  res.status(200).json({ name: 'John Doe' });
}
