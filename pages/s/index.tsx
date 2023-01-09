import React from 'react';
import type { NextPage } from 'next';
import { SearchForm } from 'src/components/search/SearchForm';

const SearchIndex: NextPage = () => {
  return (
    <div className='w-full max-w-screen-lg px-5 mx-auto mt-10 text-center'>
      <h1 className='text-2xl'>검색어를 입력해주세요.</h1>
      <div className='mt-10'>
        <SearchForm />
      </div>
    </div>
  );
};

export default SearchIndex;
