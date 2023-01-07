import { NextSeo } from 'next-seo';
import Head from 'next/head';
import config from 'site-config';
import { awsImageObjectUrlToNotionUrl } from 'src/lib/notion';
import type { INotionSearchObject } from 'src/types/notion';

export interface NotionSeoProps {
  page: INotionSearchObject;
  title: string | null;
  description: string | null;
  slug: string;
}

const NotionSeo: React.FC<NotionSeoProps> = ({ page, title, description, slug }) => {
  const url = page?.cover
    ? page?.cover?.type === 'external'
      ? page.cover.external?.url ?? ''
      : page?.cover?.type === 'file'
      ? awsImageObjectUrlToNotionUrl({
          blockId: page.id,
          s3ObjectUrl: page.cover.file?.url || ''
        })
      : ''
    : '';

  return (
    <>
      <NextSeo
        title={title?.slice(0, 60) || '제목 없음'}
        description={description?.slice(0, 155) || undefined}
        openGraph={{
          url:
            config.origin + slug?.charAt(0) === '/'
              ? config.origin + slug
              : config.origin + '/' + slug,
          images: url
            ? [
                {
                  url: url
                }
              ]
            : undefined
        }}
      />
      <Head>
        {page.icon?.file && page.icon?.type === 'file' && (
          <link
            rel='shortcut icon'
            href={awsImageObjectUrlToNotionUrl({
              blockId: page.id,
              s3ObjectUrl: page.icon.file.url
            })}
          />
        )}
        {page.icon?.emoji && page.icon?.type === 'emoji' && (
          <link
            rel='shortcut icon'
            href={`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${page.icon?.emoji}</text></svg>`}
          />
        )}
      </Head>
    </>
  );
};

export default NotionSeo;