// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Error } from 'lib/Error';
import { Client, LogLevel } from '@notionhq/client';
import { INotionSearchObject } from 'src/types/notion';

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: Error.handleError,
  onNoMatch: Error.handleNoMatch
}).get(async (req: NextApiRequest, res: NextApiResponse<INotionSearchObject>) => {
  const { databaseId } = req.query;
  if (typeof databaseId !== 'string') {
    throw 'type error "databaseId"';
  }
  const notion = new Client({
    auth: process.env.NOTION_API_SECRET_KEY,
    logLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : undefined
  });

  const result = (await notion.databases.retrieve({
    database_id: databaseId
  })) as INotionSearchObject;

  res.status(200).json(result);
});

export default handler;