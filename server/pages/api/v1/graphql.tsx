import { createServer } from '../../../apollo/server';
import { NextApiRequest, NextApiResponse } from 'next';

const server = createServer();
const startServer = server.start();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://studio.apollographql.com');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  await startServer;
  await server.createHandler({
    path: '/api/v1/graphql',
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
