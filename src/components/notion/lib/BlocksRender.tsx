'use client';

import type React from 'react';
import { Fragment, useRef } from 'react';
import type { IGetNotion } from 'src/types/notion';
import {
  NotionBlockRender,
  NotionBulletedListItemBlock,
  NotionCalloutBlock,
  NotionChildDatabaseBlock,
  NotionColumnListBlock,
  NotionHeadingBlock,
  NotionImageBlock,
  NotionLinkPreviewBlock,
  NotionNumberedListItemBlock,
  NotionParagraphBlock,
  NotionQuoteBlock,
  NotionTableBlock,
  NotionTodoBlock,
  NotionToggleBlock,
  NotionVideoBlock,
  NotionParagraphText,
  NotionCodeBlock
} from '.';

export type NotionBlocksProps = IGetNotion;

export const BlocksRender: React.FC<NotionBlocksProps> = ({
  blocks,
  childrenBlocks,
  databaseBlocks
}) => {
  const numberOfSameTag = useRef(0);
  const childrenDepth = useRef(0);

  return (
    <>
      {blocks?.results.map((block, i) => {
        numberOfSameTag.current =
          blocks.results?.[i - 1]?.type === block.type ? numberOfSameTag.current + 1 : 0;
        childrenDepth.current = block?.has_children ? childrenDepth.current + 1 : 0;

        switch (block.type) {
          case 'bulleted_list_item': {
            return (
              <NotionBlockRender
                key={`block-${block.id}-${i}`}
                block={block}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                chilrenBlockDepth={childrenDepth.current}
              >
                <NotionBulletedListItemBlock block={block} />
              </NotionBlockRender>
            );
          }
          case 'bookmark': {
            const url = block.bookmark.url;
            if (!url) {
              return <NotionParagraphText key={`block-${block.id}-${i}`}></NotionParagraphText>;
            }

            return (
              <NotionBlockRender
                key={`block-${block.id}-${i}`}
                block={block}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                chilrenBlockDepth={childrenDepth.current}
              >
                <NotionLinkPreviewBlock url={url} />
                {Array.isArray(block?.bookmark?.caption) &&
                  block?.bookmark?.caption?.length > 0 && (
                    <div className='w-full'>
                      <NotionParagraphBlock
                        blockId={block.id}
                        richText={block.bookmark.caption}
                        color={'gray'}
                      />
                    </div>
                  )}
              </NotionBlockRender>
            );
          }
          case 'callout': {
            return (
              <NotionCalloutBlock
                key={`block-${block.id}-${i}`}
                block={block}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                chilrenBlockDepth={childrenDepth.current}
              />
            );
          }
          case 'child_database': {
            return (
              <NotionChildDatabaseBlock
                key={`block-${block.id}-${i}`}
                block={block}
                databases={databaseBlocks}
              />
            );
          }
          case 'code': {
            return (
              <NotionBlockRender
                key={`block-${block.id}-${i}`}
                block={block}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                chilrenBlockDepth={childrenDepth.current}
              >
                <NotionCodeBlock block={block} />
              </NotionBlockRender>
            );
          }
          case 'column_list': {
            return (
              <NotionColumnListBlock
                key={`block-${block.id}-${i}`}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                block={block}
              />
            );
          }
          case 'column': {
            return (
              <NotionBlockRender
                key={`block-${block.id}-${i}`}
                block={block}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                chilrenBlockDepth={childrenDepth.current}
              />
            );
          }
          case 'divider': {
            return (
              <NotionBlockRender
                key={`block-${block.id}-${i}`}
                block={block}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                chilrenBlockDepth={childrenDepth.current}
              >
                <hr className='border-gray-500' />
              </NotionBlockRender>
            );
          }
          case 'heading_1':
          case 'heading_2':
          case 'heading_3': {
            return (
              <NotionBlockRender
                key={`block-${block.id}-${i}`}
                block={block}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                chilrenBlockDepth={childrenDepth.current}
              >
                <NotionHeadingBlock block={block} />
              </NotionBlockRender>
            );
          }
          case 'image': {
            return (
              <NotionBlockRender
                key={`block-${block.id}-${i}`}
                block={block}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                chilrenBlockDepth={childrenDepth.current}
              >
                <NotionImageBlock block={block} />
              </NotionBlockRender>
            );
          }
          case 'link_preview': {
            const url = block.link_preview.url;
            if (!url) {
              return <NotionParagraphText key={`block-${block.id}-${i}`}></NotionParagraphText>;
            }

            return (
              <NotionBlockRender
                key={`block-${block.id}-${i}`}
                block={block}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                chilrenBlockDepth={childrenDepth.current}
              >
                <NotionLinkPreviewBlock url={url} />
              </NotionBlockRender>
            );
          }
          case 'numbered_list_item': {
            return (
              <NotionBlockRender
                key={`block-${block.id}-${i}`}
                block={block}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                chilrenBlockDepth={childrenDepth.current}
              >
                <NotionNumberedListItemBlock
                  block={block}
                  numberOfSameTag={numberOfSameTag.current}
                />
              </NotionBlockRender>
            );
          }
          case 'paragraph': {
            return (
              <NotionBlockRender
                key={`block-${block.id}-${i}`}
                block={block}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                chilrenBlockDepth={childrenDepth.current}
              >
                <NotionParagraphBlock
                  blockId={block.id}
                  richText={block.paragraph.rich_text}
                  color={block.paragraph.color}
                />
              </NotionBlockRender>
            );
          }
          case 'quote': {
            return (
              <NotionQuoteBlock key={`block-${block.id}-${i}`} block={block}>
                <NotionBlockRender
                  block={block}
                  blocks={blocks}
                  databaseBlocks={databaseBlocks}
                  childrenBlocks={childrenBlocks}
                  chilrenBlockDepth={childrenDepth.current}
                ></NotionBlockRender>
              </NotionQuoteBlock>
            );
          }
          case 'table': {
            return (
              <NotionTableBlock
                key={`block-${block.id}-${i}`}
                block={block}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                chilrenBlockDepth={childrenDepth.current}
              />
            );
          }
          case 'to_do': {
            return (
              <NotionBlockRender
                key={`block-${block.id}-${i}`}
                block={block}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                chilrenBlockDepth={childrenDepth.current}
              >
                <NotionTodoBlock block={block} />
              </NotionBlockRender>
            );
          }
          case 'toggle': {
            // 토글은 안에서 BlockRender시킴.
            return (
              <NotionToggleBlock
                key={`block-${block.id}-${i}`}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                block={block}
                chilrenBlockDepth={childrenDepth.current}
              />
            );
          }
          case 'video': {
            return (
              <NotionBlockRender
                key={`block-${block.id}-${i}`}
                block={block}
                blocks={blocks}
                databaseBlocks={databaseBlocks}
                childrenBlocks={childrenBlocks}
                chilrenBlockDepth={childrenDepth.current}
              >
                <NotionVideoBlock block={block} />
              </NotionBlockRender>
            );
          }
          default: {
            return <Fragment key={`block-${block.id}-${i}`}></Fragment>;
          }
        }
      })}
    </>
  );
};
