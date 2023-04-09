import type React from 'react';
import { useEffect, useRef } from 'react';
import { AWS_SECURE_NOTION_STATIC, PROXY_SECURE_NOTION_STATIC } from 'src/lib/notion';
import type { FileObject, NotionBlocksRetrieve } from 'src/types/notion';
import { useRenewExpiredFile } from './utils';

interface FileProps {
  block: NotionBlocksRetrieve;
}

export const File: React.FC<FileProps> = ({ block }) => {
  const cachedFileObject = useRef<FileObject>(block.file);

  const { data: file } = useRenewExpiredFile({
    blockId: block.id,
    blockType: 'file',
    useType: 'file',
    initialFileObject: cachedFileObject.current,
    autoRefresh: true,
    refreshInterval: cachedFileObject.current.file?.expiry_time
      ? new Date(cachedFileObject.current.file?.expiry_time).getTime() -
          Date.now() -
          60 * 5 * 1000 || 60 * 5 * 1000
      : undefined
  });

  const fileType = file?.type;
  const fileUrl = file?.file?.url || file?.external?.url;
  const filename =
    fileType === 'file'
      ? file?.file?.url?.match(/(notion-static.com\/[-0-9a-z]+\/)(.+)(\?)/)?.[2] || null
      : null;

  const proxyFileUrl =
    fileUrl && fileUrl?.includes(AWS_SECURE_NOTION_STATIC)
      ? fileUrl.replace(AWS_SECURE_NOTION_STATIC, PROXY_SECURE_NOTION_STATIC)
      : null;

  useEffect(() => {
    if (file) cachedFileObject.current = file;
  }, [file]);

  return (
    <div>
      <a
        href={proxyFileUrl || fileUrl}
        rel='noreferrer'
        target='_blank'
        download={fileType === 'file' ? filename || undefined : undefined}
        className='inline-flex items-center gap-x-0.5 px-1.5 my-1.5 rounded-md bg-base-content/10 hover:bg-base-content/20'
      >
        {/* <BsLink45Deg className='text-[1.2em]' /> */}
        🔗&nbsp;
        {decodeURIComponent(filename || 'File')}
      </a>
    </div>
  );
};
