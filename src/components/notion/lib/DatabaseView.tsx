import classNames from 'classnames';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import type React from 'react';
import { Fragment, useMemo, useState } from 'react';
import { SiNotion } from 'react-icons/si';
import {
  FileObject,
  INotionSearchDatabase,
  NotionDatabase,
  NotionDatabasesQuery
} from 'src/types/notion';
import { NotionSecureImage } from '.';
import config from 'site-config';
import Link from 'next/link';
import { AiOutlineSearch } from 'react-icons/ai';
import { notionTagColorClasses } from './Paragraph';
import { richTextToPlainText } from './utils';
import { sortBy } from 'lodash';
import { useRouter } from 'next/router';

type NotionDatabasePageViewProps = {
  baseBlock: NotionDatabasesQuery;
  pageInfo: INotionSearchDatabase;
};

export const NotionDatabasePageView: React.FC<NotionDatabasePageViewProps> = ({
  baseBlock,
  pageInfo
}) => {
  const router = useRouter();
  const isBaseDatabase = config.notion.baseBlock === pageInfo.id.replaceAll('-', '');

  const blocks: Array<NotionDatabase> = useMemo(() => {
    const filterdBlock = baseBlock.results.filter((block) => {
      const { category, tag } = router.query;

      if (!category && !tag) {
        return true;
      }

      let isFilter = false;
      if (category) {
        isFilter = block.properties.category?.select?.name === category;
      }
      if (tag) {
        const multiSelect = block.properties.tags?.multi_select?.map((s) => s.name) || [];
        if (Array.isArray(tag)) {
          for (const select of multiSelect) {
            isFilter = tag.includes(select);
            if (isFilter) {
              break;
            }
          }
        } else {
          isFilter = multiSelect.includes(tag);
        }
      }

      return isFilter;
    });

    return filterdBlock;
  }, [baseBlock.results, router.query]);

  const [searchValue, setSearchValue] = useState<string>('');
  const [categoryFilterKey, setCategoryFilterKey] = useState<string | null>(
    router?.query?.category
      ? Array.isArray(router.query.category)
        ? router.query.category[0]
        : router.query.category
      : null
  );
  const [tagFilterKey, setTagFilterKey] = useState<string | null>(
    router?.query?.tag
      ? Array.isArray(router.query.tag)
        ? router.query.tag[0]
        : router.query.tag
      : null
  );
  const [filterdBlocks, setFilterdBlocks] = useState<Array<NotionDatabase>>([...blocks]);
  const haveTitleProperty = Boolean(pageInfo.properties.title?.title);

  const handleClickCategoryItem =
    (key: string | null) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (isBaseDatabase) {
        return;
      } else {
        event.preventDefault();
      }
      if (pageInfo.properties.category?.type !== 'select') {
        return;
      }
      if (!key || key === categoryFilterKey) {
        setCategoryFilterKey(null);
        setFilterdBlocks(baseBlock.results);
        return;
      }
      setCategoryFilterKey(key);
      const newFilterdBlocks = baseBlock.results.filter(
        (block) => block.properties.category?.select?.name === key
      );
      setFilterdBlocks(newFilterdBlocks);
    };
  const handleClickTagItem =
    (key: string | null) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (isBaseDatabase) {
        return;
      } else {
        event.preventDefault();
      }
      if (pageInfo.properties.tags?.type !== 'multi_select') {
        return;
      }
      if (!key || key === tagFilterKey) {
        setTagFilterKey(null);
        setFilterdBlocks(baseBlock.results);
        return;
      }
      setTagFilterKey(key);
      const newFilterdBlocks = baseBlock.results.filter((block) =>
        block.properties.tags?.multi_select?.map((s) => s.name).includes(key)
      );
      setFilterdBlocks(newFilterdBlocks);
    };

  const handleChangeSearchValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!haveTitleProperty) {
      return;
    }
    const value = event.target.value;
    setSearchValue(value);
    if (!value) {
      setFilterdBlocks(baseBlock.results);
      return;
    }
    if (categoryFilterKey) setCategoryFilterKey(null);
    if (tagFilterKey) setTagFilterKey(null);

    const newFilterdBlocks = baseBlock.results.filter((block) => {
      const title = block.properties.title?.title
        ? block.properties.title.title.map((text) => text?.plain_text).join('') || null
        : null;
      if (title) return title.match(new RegExp(value, 'igm'));
      return false;
    });
    setFilterdBlocks(newFilterdBlocks);
  };

  const categorys = useMemo(() => {
    if (pageInfo.properties.category?.type !== 'select') {
      return {};
    }
    const categorys = baseBlock.results.reduce<Record<string, number>>((prev, current) => {
      const name = current.properties.category?.select?.name;
      if (!name) {
        return prev;
      }
      return {
        ...prev,
        [name]: prev[name] ? prev[name] + 1 : 1
      };
    }, {});
    return categorys;
  }, [baseBlock.results, pageInfo.properties.category?.type]);

  const categoryKeys = Object.keys(categorys).sort();

  const tags = useMemo(
    () => sortBy(pageInfo?.properties?.tags?.multi_select?.options || [], 'name'),
    [pageInfo?.properties?.tags?.multi_select?.options]
  );

  return (
    <div className='flex flex-col sm:gap-4 sm:flex-row'>
      {categorys && (
        <div className='sticky top-[var(--header-height)] left-0 z-10 grow-0 shrink-0 sm:top-[calc(var(--header-height)_+_1em)] sm:z-0 sm:max-h-[calc(100vh_-_var(--header-height)_-_2em)]'>
          <aside className='flex h-full grow-0 shrink-0 p-2 gap-x-2 bg-base-100 text-sm sm:p-0 sm:mb-0 sm:flex-col sm:max-w-[200px] sm:gap-y-4 md:max-w-[220px] '>
            <div className='flex grow flex-col gap-y-3 sm:grow-0 sm:order-2 overflow-auto'>
              <ul className='flex-0 flex shrink-0 gap-x-2 overflow-x-auto scrollbar-hidden whitespace-nowrap sm:flex-col sm:px-2 sm:overflow-hidden sm:gap-y-1'>
                {categoryKeys.map((category) => (
                  <Link
                    key={category}
                    href={category === categoryFilterKey ? '/' : `/category/${category}`}
                    scroll={false}
                    shallow={isBaseDatabase}
                    prefetch={false}
                    onClick={handleClickCategoryItem(category)}
                  >
                    <li
                      className={classNames(
                        'flex items-center cursor-pointer py-[0.2em] px-[0.7em] rounded-full bg-base-content/10 sm:p-0 sm:bg-[initial] sm:rounded-none sm:hover:bg-base-content/5 sm:border-l-[3px] sm:pl-2 sm:pr-1 sm:py-0.5 border-base-content/10',
                        categoryFilterKey === category
                          ? 'bg-success/50 sm:font-bold sm:border-success'
                          : null
                      )}
                    >
                      <span className='flex-auto grow-0 shrink overflow-hidden text-ellipsis'>
                        {category}
                      </span>
                      <span className='flex-auto grow-0 shrink-0'>({categorys[category]})</span>
                    </li>
                  </Link>
                ))}
              </ul>
              <div className='hidden sm:flex grow-0 shrink-0 gap-1.5 flex-wrap break-all px-2 order-3'>
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={tag.name === tagFilterKey ? '/' : `/tag/${tag.name}`}
                    scroll={false}
                    shallow={isBaseDatabase}
                    prefetch={false}
                    onClick={handleClickTagItem(tag.name)}
                  >
                    <span
                      key={tag.id}
                      className={classNames(
                        'cursor-pointer px-1.5 rounded-md opacity-70',
                        notionTagColorClasses[tag.color],
                        `${
                          notionTagColorClasses[
                            `${tag.color}_background` as keyof typeof notionTagColorClasses
                          ]
                        }`,
                        tagFilterKey === tag.name ? 'opacity-100 font-bold' : null
                      )}
                    >
                      <span>{tag.name}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className='self-center flex-[0] shrink-0 input-group min-w-[180px] bg-base-100 rounded-md shadow-md dark:bg-base-content/5 sm:order-1'>
              <input
                className={classNames(
                  'input input-sm w-full bg-transparent focus:outline-none placeholder:text-base-content/60'
                )}
                value={searchValue}
                type='text'
                name='search'
                placeholder='Article Title Search'
                onChange={handleChangeSearchValue}
              />
              <button className='btn btn-sm btn-ghost btn-circle sm:btn-square text-lg'>
                <AiOutlineSearch />
              </button>
            </div>
          </aside>
        </div>
      )}
      {haveTitleProperty && (
        <div className='flex-auto flex flex-col px-3 gap-y-4 sm:p-0 sm:gap-y-3'>
          {filterdBlocks.length ? (
            filterdBlocks.map((block) => <ArticleSummary key={block.id} article={block} />)
          ) : (
            <div>There are no posts.</div>
          )}
        </div>
      )}
    </div>
  );
};

type ArticleSummaryProps = {
  article: NotionDatabase;
};

const ArticleSummary: React.FC<ArticleSummaryProps> = ({ article }) => {
  const { id, properties, icon, cover } = article;
  const { category: categoryProperty, tags, publishedAt, rank, thumbnail, updatedAt } = properties;
  const haveTagProperty = tags?.type === 'multi_select';

  const category = categoryProperty?.select ? categoryProperty.select.name : null;
  const title = richTextToPlainText(properties?.title?.title);
  const slug = richTextToPlainText(properties?.slug?.rich_text);

  const parentDatabaseId = article?.parent?.database_id?.replaceAll('-', '');

  const href =
    parentDatabaseId === config.notion.baseBlock
      ? `/${encodeURIComponent(slug)}`
      : `/${encodeURIComponent(id.replaceAll('-', ''))}/${encodeURIComponent(slug || 'Untitled')}`;

  return (
    <Link
      prefetch={false}
      href={href}
      className='sm:transition-transform sm:hover:-translate-y-0.5 [&_.cover-image]:hover:brightness-110 [&_.cover-image>div]:transition-transform [&_.cover-image>div]:duration-[400ms] [&_.cover-image>div]:hover:scale-[1.1]'
    >
      <div className='w-full flex flex-col bg-base-content/5 shadow-md overflow-hidden rounded-md isolate sm:flex-row'>
        <div className='cover-image shrink-0 h-[200px] bg-base-content/5 overflow-hidden brightness-95 transition-[filter] ease-linear duration-300 [&>div]:h-full [&>div>img]:w-full [&>div>img]:h-full sm:w-[120px] md:w-[150px] lg:w-[200px] sm:h-[100px]'>
          {cover ? (
            <NotionSecureImage
              useNextImage
              blockId={id}
              blockType={article.object}
              useType={'cover'}
              initialFileObject={cover}
              alt={'page-cover'}
            />
          ) : icon ? (
            icon?.emoji ? (
              <div className='notion-database-item-empty-cover'>{icon?.emoji}</div>
            ) : icon?.file ? (
              <NotionSecureImage
                useNextImage
                blockId={id}
                blockType={article.object}
                useType={'icon'}
                initialFileObject={icon as FileObject}
                alt={'page-icon'}
              />
            ) : (
              <div className='notion-database-item-empty-cover text-base-content/10'>
                <SiNotion />
              </div>
            )
          ) : (
            <div className='notion-database-item-empty-cover text-base-content/10'>
              <SiNotion />
            </div>
          )}
        </div>
        <div className='flex-auto flex flex-col justify-between p-4 py-3 sm:py-2 break-all'>
          {category && <div className='text-xs text-zinc-500 line-clamp-1 text'>{category}</div>}
          <div className='line-clamp-2'>{title}</div>
          <div className='mt-2 sm:mt-auto flex items-end justify-between gap-x-2 text-sm'>
            <div className='flex-1 line-clamp-1'>
              {haveTagProperty &&
                tags.multi_select?.map((tag, idx) => (
                  <Fragment key={tag.name}>
                    <span
                      className={classNames(
                        'px-1.5 rounded-md text-opacity-80',
                        notionTagColorClasses[tag.color],
                        notionTagColorClasses[
                          (tag.color + '_background') as keyof typeof notionTagColorClasses
                        ]
                      )}
                    >
                      {tag.name}
                    </span>
                    {tags.multi_select?.length !== idx && ' '}
                  </Fragment>
                ))}
            </div>
            <div>
              {publishedAt?.date?.start && (
                <div className='flex-auto grow-0 shrink-0 text-zinc-500'>
                  {formatInTimeZone(new Date(publishedAt.date.start), config.TZ, 'yyyy-MM-dd')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// const handleClickTagItem = (selectTag: MultiSelect) => () => {
//   const tags = router.query['tag'];

//   if (Array.isArray(tags)) {
//     if (tags.includes(selectTag.name)) {
//       // Array + tag가 이미 있을 때 = tag 삭제
//       const newTags = tags.filter((tag) => tag !== selectTag.name);
//       if (newTags.length) {
//         // 다른 tag가 남음 = 나머지만 넘김
//         router.push({
//           query: {
//             ...router.query,
//             tag: newTags
//           }
//         });
//         return;
//       } else {
//         // 다른 tag가 남지 않음 = tag 삭제
//         const { tag: _, ...newQuery } = router.query;
//         router.push({
//           query: newQuery
//         });
//         return;
//       }
//     } else {
//       // Array + 없을 때 = tag 추가
//       router.push({
//         query: {
//           ...router.query,
//           tag: [...tags].push(selectTag.name)
//         }
//       });
//     }
//   } else if (typeof tags === 'string') {
//     const tag = tags;
//     if (tag === selectTag.name) {
//       // 이미 있는데 같음 = 삭제
//       const { tag: _, ...newQuery } = router.query;
//       router.push({
//         query: newQuery
//       });
//       return;
//     } else {
//       // 이미 있는데 다름 = Array로 추가
//       const newQuery = { ...router.query };
//       newQuery['tag'] = [tag, selectTag.name];
//       router.push({
//         query: newQuery
//       });
//     }
//   } else {
//     // 없음 = tag 추가
//     const newQuery = { ...router.query };
//     newQuery['tag'] = selectTag.name;

//     router.push({
//       query: newQuery
//     });
//     return;
//   }
// };
