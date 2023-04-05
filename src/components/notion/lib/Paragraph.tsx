import type React from 'react';
import classnames from 'classnames';
import type { ReactNode } from 'react';
import { notionBlockUrlToRelativePath } from 'src/lib/notion';
import type { Color, RichText } from 'src/types/notion';
import { NotionCopyHeadingLink } from '.';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';

export interface ParagraphTextProps {
  bold?: string;
  italic?: string;
  strikethrough?: string;
  underline?: string;
  code?: 'once' | 'first' | 'last' | 'middle';
  color?: Color;
  children?: ReactNode;
}

export const notionTagColorClasses = {
  gray: 'text-notion-tag-gray',
  default: 'text-notion-tag-default',
  brown: 'text-notion-tag-brown',
  orange: 'text-notion-tag-orange',
  yellow: 'text-notion-tag-yellow',
  green: 'text-notion-tag-green',
  blue: 'text-notion-tag-blue',
  purple: 'text-notion-tag-purple',
  pink: 'text-notion-tag-pink',
  red: 'text-notion-tag-red',
  gray_background: 'bg-notion-tag-gray',
  default_background: 'bg-notion-tag-default',
  brown_background: 'bg-notion-tag-brown',
  orange_background: 'bg-notion-tag-orange',
  yellow_background: 'bg-notion-tag-yellow',
  green_background: 'bg-notion-tag-green',
  blue_background: 'bg-notion-tag-blue',
  purple_background: 'bg-notion-tag-purple',
  pink_background: 'bg-notion-tag-pink',
  red_background: 'bg-notion-tag-red'
} as const;

export const notionColorClasses = {
  default: 'text-notion-default',
  gray: 'text-notion-gray',
  brown: 'text-notion-brown',
  orange: 'text-notion-orange',
  yellow: 'text-notion-yellow',
  green: 'text-notion-green',
  blue: 'text-notion-blue',
  purple: 'text-notion-purple',
  pink: 'text-notion-pink',
  red: 'text-notion-red',
  gray_background: 'bg-notion-gray',
  brown_background: 'bg-notion-brown',
  orange_background: 'bg-notion-orange',
  yellow_background: 'bg-notion-yellow',
  green_background: 'bg-notion-green',
  blue_background: 'bg-notion-blue',
  purple_background: 'bg-notion-purple',
  pink_background: 'bg-notion-pink',
  red_background: 'bg-notion-red',
  code: 'text-notion-code',
  code_background: 'bg-notion-code'
} as const;

const paragraphTextClasses = {
  code: {
    once: `py-[0.0625rem] px-1 font-mono rounded-l rounded-r`,
    first: `py-[0.0625rem] pl-1 font-mono rounded-l`,
    last: `py-[0.0625rem] pr-1 font-mono rounded-r`,
    middle: `py-[0.0625rem] font-mono`
  }
} as const;

export const ParagraphText: React.FC<ParagraphTextProps> = ({
  bold,
  code,
  color,
  italic,
  strikethrough,
  underline,
  children
}) => {
  const colorClass =
    color && color !== 'default' && !color.match(/_background$/) && notionColorClasses[color];
  const backgroundClass = color && color.match(/_background$/) && notionColorClasses[color];
  return (
    <span
      className={classnames(
        bold && 'font-bold',
        italic && 'italic',
        strikethrough && 'line-through',
        underline && 'underline',
        code && paragraphTextClasses.code[code],
        code && !colorClass && notionColorClasses['code'],
        code && !backgroundClass && notionColorClasses['code_background'],
        colorClass,
        backgroundClass
      )}
    >
      {children}
    </span>
  );
};

interface ParagraphProps {
  blockId: string;
  richText: Array<RichText>;
  color?: Color;
  annotations?: Partial<RichText['annotations']>;
  headingLink?: string;
}

export const Paragraph: React.FC<ParagraphProps> = ({
  blockId,
  richText,
  color,
  annotations: annotationsProps,
  headingLink
}) => {
  if (!Array.isArray(richText)) {
    return null;
  }

  return (
    <div
      className={classnames(
        'break-all',
        color && color !== 'default' && !color.match(/_background$/)
          ? notionColorClasses[color]
          : annotationsProps?.color
          ? notionColorClasses['gray']
          : '',
        color && color.match(/_background$/) ? notionColorClasses[color] : ''
      )}
    >
      {richText.map((text, i) => {
        const {
          type,
          plain_text,
          href,
          annotations: { bold, code, italic, strikethrough, underline, color }
        } = text;

        const prevTextIsCode = code && richText[i - 1]?.annotations.code;
        const nextTextIsCode = code && richText[i + 1]?.annotations.code;

        const annotations: Partial<ParagraphTextProps> = {
          bold: annotationsProps?.bold || bold ? 'bold' : undefined,
          italic: annotationsProps?.italic || italic ? 'italic' : undefined,
          strikethrough:
            annotationsProps?.strikethrough || strikethrough ? 'line-through' : undefined,
          underline: annotationsProps?.underline || underline ? 'underline' : undefined,
          color: color ? color : undefined,
          code: code
            ? !prevTextIsCode && !nextTextIsCode
              ? 'once'
              : !prevTextIsCode && nextTextIsCode
              ? 'first'
              : nextTextIsCode
              ? 'middle'
              : 'last'
            : undefined
        };
        if (text.type === 'mention') {
          return (
            <a
              key={`block-anchor-${blockId}-${i}`}
              className='inline-flex items-center bg-base-content/10 rounded-md px-1'
              href={href ? notionBlockUrlToRelativePath(href) : undefined}
              rel='noreferrer'
              target='_blank'
            >
              <FiArrowUpRight />
              <ParagraphText {...annotations} underline={'underline'}>
                {plain_text}
              </ParagraphText>
            </a>
          );
        }
        if (href) {
          return (
            <a
              key={`block-anchor-${blockId}-${i}`}
              href={notionBlockUrlToRelativePath(href)}
              rel='noreferrer'
              target='_blank'
            >
              <ParagraphText {...annotations} underline={'underline'}>
                {plain_text}
              </ParagraphText>
            </a>
          );
        }
        return (
          <ParagraphText key={`block-${blockId}-${i}`} {...annotations}>
            {plain_text}
          </ParagraphText>
        );
      })}
      {headingLink && (
        <NotionCopyHeadingLink href={headingLink}>
          <Link href={headingLink}>&nbsp;🔗</Link>
        </NotionCopyHeadingLink>
      )}
    </div>
  );
};
