import type { NextApiRequest, NextApiResponse } from 'next';

type Status = {
  status: string;
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Status>
) {
  res.status(200).json({ status: 'healthy' });
}
