import type { NextApiRequest, NextApiResponse } from 'next';

type Status = {
  status: string;
};

const handler = (
  _request: NextApiRequest,
  response: NextApiResponse<Status>
) => {
  response.status(200).json({ status: 'healthy' });
};

export default handler;
